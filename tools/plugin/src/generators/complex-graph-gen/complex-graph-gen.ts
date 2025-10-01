import {
  Tree,
  formatFiles,
  installPackagesTask,
  readJson,
  writeJson,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { BatchLibGeneratorSchema } from './schema';

// Helper to convert a library name like 'foobar-1-lib' to a function name 'foobar1Lib'
function toFunctionName(libName: string): string {
  const nameWithoutLib = libName.replace(/-lib$/, '');
  return `${nameWithoutLib.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())}Lib`;
}

export async function batchLibGenerator(
  tree: Tree,
  options: BatchLibGeneratorSchema
) {
  const { name, count } = options;
  const workspaceName = readJson(tree, 'nx.json').npmScope;

  // A map to track which libraries need to import which dependencies
  const dependenciesToUse = new Map<string, string[]>();

  console.log(`🚀 Generating ${count} libraries with prefix: ${name}...`);

  // First, generate all the libraries
  for (let i = 1; i <= count; i++) {
    const libName = `${name}${i}-lib`;
    const libDirectory = `libs/${libName}`;

    if (tree.exists(libDirectory)) {
      console.log(`⏩ Directory '${libDirectory}' already exists, skipping.`);
      continue;
    }

    console.log(`  -> Generating library #${i}: ${libName}`);

    await libraryGenerator(tree, {
      name: libName,
      directory: libDirectory,
      unitTestRunner: 'jest',
      linter: "eslint",
      skipFormat: true,
      simpleName: true,
    });
  }

  console.log('🔗 Adding dependencies between libraries...');

  // Helper to add a dependency and track it for code usage
  const addDependency = (dependerLibName: string, dependencyPkgName: string) => {
    const packageJsonPath = `libs/${dependerLibName}/package.json`;
    if (!tree.exists(packageJsonPath)) return;

    const packageJson = readJson(tree, packageJsonPath);
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies[dependencyPkgName] = 'workspace:*';
    writeJson(tree, packageJsonPath, packageJson);

    // Track that we need to use this dependency in the depender's code
    const existingDeps = dependenciesToUse.get(dependerLibName) || [];
    dependenciesToUse.set(dependerLibName, [...existingDeps, dependencyPkgName]);
  };

  // Rule 1 (Breadth): project 1 depends on 2-50
  if (count >= 50) {
    const dependerLibName = `${name}1-lib`;
    for (let i = 2; i <= 50; i++) {
      const dependencyLibName = `${name}${i}-lib`;
      addDependency(dependerLibName, `@${workspaceName}/${dependencyLibName}`);
    }
    console.log(`  -> Added 49 dependencies to ${dependerLibName}.`);
  }

  // Rule 2 (Breadth): every 10 bundle up (10 depends on 11-19, etc.)
  for (let i = 10; i < count; i += 10) {
    const dependerLibName = `${name}${i}-lib`;
    let depsAdded = 0;
    for (let j = 1; j < 10; j++) {
      const dependencyIndex = i + j;
      if (dependencyIndex > count) break;
      const dependencyLibName = `${name}${dependencyIndex}-lib`;
      addDependency(dependerLibName, `@${workspaceName}/${dependencyLibName}`);
      depsAdded++;
    }
    if (depsAdded > 0) {
      console.log(`  -> Added ${depsAdded} dependencies to ${dependerLibName}.`);
    }
  }

  // Rule 3 (Depth): Create segmented dependency chains to avoid circular dependencies.
  console.log('🔗 Creating segmented deep dependency chains...');
  for (let i = 1; i < count; i++) {
    // Stop the chain at every 10th library (e.g., don't let 9 depend on 10, 19 on 20, etc.)
    // This prevents massive circular dependencies when interacting with existing projects.
    if (i % 10 === 0) {
      continue;
    }

    const dependerLibName = `${name}${i}-lib`;
    const dependencyLibName = `${name}${i + 1}-lib`;
    addDependency(dependerLibName, `@${workspaceName}/${dependencyLibName}`);
  }
  console.log(`  -> Created segmented dependency chains.`);


  console.log('✍️  Adding code to use dependencies...');
  // Last step: iterate through the map and add usage code
  for (const [dependerLibName, deps] of dependenciesToUse.entries()) {
    const sourceFilePath = `libs/${dependerLibName}/src/index.ts`;
    if (!tree.exists(sourceFilePath)) continue;

    let sourceContent = tree.read(sourceFilePath)!.toString('utf-8');
    let importStatements = '\n';
    let consoleLogStatements = '';

    for (const depPkgName of deps) {
      const depLibName = depPkgName.split('/')[1];
      const functionName = toFunctionName(depLibName);
      importStatements += `import { ${functionName} } from '${depPkgName}';\n`;
      consoleLogStatements += `console.log(${functionName}());\n`;
    }

    // Append the new code to the existing file content
    sourceContent += `
// --- Generated code to use dependencies ---
${importStatements}
export function useDependencies() {
  ${consoleLogStatements}
}
// --- End generated code ---
`;
    tree.write(sourceFilePath, sourceContent);
    console.log(`  -> Updated ${sourceFilePath} to use ${deps.length} dependencies.`);
  }


  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    console.log(`✅ Done! ${count} libraries generated and linked.`);
  };
}

export default batchLibGenerator;
