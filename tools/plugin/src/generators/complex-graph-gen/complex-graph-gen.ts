import {
  Tree,
  formatFiles,
  installPackagesTask,
  readJson,
  writeJson,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { BatchLibGeneratorSchema } from './schema';

export async function batchLibGenerator(
  tree: Tree,
  options: BatchLibGeneratorSchema
) {
  const { name, count } = options;
  // Get the npm scope from nx.json to correctly name the packages
  const workspaceName = readJson(tree, 'nx.json').npmScope;

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
      linter: 'eslint',
      skipFormat: true, // We'll format once at the end
      simpleName: true,
    });
  }

  console.log('🔗 Adding dependencies between libraries...');

  // Rule 1 (Breadth): project 1 depends on 2-50
  const depender1Path = `libs/${name}1-lib/package.json`;
  if (tree.exists(depender1Path) && count >= 50) {
    const packageJson = readJson(tree, depender1Path);
    packageJson.dependencies = packageJson.dependencies || {};
    for (let i = 2; i <= 50; i++) {
      const dependencyName = `${name}${i}-lib`;
      const dependencyPackageName = `@${workspaceName}/${dependencyName}`;
      packageJson.dependencies[dependencyPackageName] = 'workspace:*';
    }
    writeJson(tree, depender1Path, packageJson);
    console.log(`  -> Added 49 dependencies to ${name}1-lib.`);
  }

  // Rule 2 (Breadth): every 10 bundle up (10 depends on 11-19, etc.)
  for (let i = 10; i < count; i += 10) {
    const dependerIndex = i;
    const dependerPath = `libs/${name}${dependerIndex}-lib/package.json`;

    if (tree.exists(dependerPath)) {
      const packageJson = readJson(tree, dependerPath);
      packageJson.dependencies = packageJson.dependencies || {};
      let depsAdded = 0;
      for (let j = 1; j < 10; j++) {
        const dependencyIndex = dependerIndex + j;
        if (dependencyIndex > count) break;

        const dependencyName = `${name}${dependencyIndex}-lib`;
        const dependencyPackageName = `@${workspaceName}/${dependencyName}`;
        packageJson.dependencies[dependencyPackageName] = 'workspace:*';
        depsAdded++;
      }
      writeJson(tree, dependerPath, packageJson);
      if (depsAdded > 0) {
        console.log(`  -> Added ${depsAdded} dependencies to ${name}${dependerIndex}-lib.`);
      }
    }
  }

  // Rule 3 (Depth): Create a long dependency chain (1 -> 2 -> 3 -> ...)
  console.log('🔗 Creating a deep dependency chain...');
  for (let i = 1; i < count; i++) {
    const dependerIndex = i;
    const dependencyIndex = i + 1;

    const dependerPath = `libs/${name}${dependerIndex}-lib/package.json`;
    const dependencyName = `${name}${dependencyIndex}-lib`;
    const dependencyPackageName = `@${workspaceName}/${dependencyName}`;

    if (tree.exists(dependerPath)) {
      const packageJson = readJson(tree, dependerPath);
      packageJson.dependencies = packageJson.dependencies || {};
      // Add the dependency to the next library in the sequence
      packageJson.dependencies[dependencyPackageName] = 'workspace:*';
      writeJson(tree, dependerPath, packageJson);
    }
  }
  if (count > 1) {
    console.log(`  -> Chained ${count - 1} libraries together.`);
  }


  // Format all the created/modified files at once
  await formatFiles(tree);

  // Install any new packages
  return () => {
    installPackagesTask(tree);
    console.log(`✅ Done! ${count} libraries generated and linked.`);
  };
}

export default batchLibGenerator;
