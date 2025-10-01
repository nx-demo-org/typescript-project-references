import fs from 'fs/promises';
import path from 'path';

/**
 * The directory to start searching from.
 * Change this to the folder containing your projects, e.g., 'packages', 'libs'.
 */
const START_DIRECTORY = 'libs';

/**
 * Recursively finds all project directories that contain the necessary tsconfig files.
 * @param {string} dir - The directory to start searching from.
 * @returns {Promise<string[]>} A list of project directory paths.
 */
async function findProjectDirs(dir) {
    const projectDirs = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const files = await fs.readdir(fullPath);
                // Check if this directory looks like a library project
                if (files.includes('tsconfig.json') && files.includes('tsconfig.lib.json')) {
                    projectDirs.push(fullPath);
                } else {
                    // Recurse into subdirectories
                    projectDirs.push(...await findProjectDirs(fullPath));
                }
            }
        }
    } catch (error) {
        if (error.code !== 'ENOENT') { // Ignore 'directory not found' errors
          console.error(`Error reading directory ${dir}:`, error);
        }
    }
    return projectDirs;
}

/**
 * Processes a single project directory to update its tsconfig files.
 * @param {string} projectDir - The path to the project directory.
 */
async function processProject(projectDir) {
    const rootTsConfigPath = path.join(projectDir, 'tsconfig.json');
    const libTsConfigPath = path.join(projectDir, 'tsconfig.lib.json');

    try {
        // Read and parse both config files
        const rootConfig = JSON.parse(await fs.readFile(rootTsConfigPath, 'utf-8'));
        const libConfig = JSON.parse(await fs.readFile(libTsConfigPath, 'utf-8'));

        if (!rootConfig.references || !Array.isArray(rootConfig.references)) {
            console.log(`- Skipping ${path.basename(projectDir)}: No references found in root tsconfig.json.`);
            return;
        }

        // Separate external references (to other libs) from internal ones (to self)
        const externalRefs = [];
        const internalRefs = [];
        for (const ref of rootConfig.references) {
            if (ref.path.startsWith('..')) {
                externalRefs.push(ref);
            } else {
                internalRefs.push(ref);
            }
        }

        if (externalRefs.length === 0) {
            console.log(`- Skipping ${path.basename(projectDir)}: No external references to move.`);
            return;
        }

        // --- 1. Update tsconfig.lib.json ---
        libConfig.references = libConfig.references || [];
        const existingLibRefs = new Set(libConfig.references.map(r => r.path));

        let refsAdded = 0;
        for (const externalRef of externalRefs) {
            // Make the path specific by pointing to the tsconfig.lib.json
            const newRefPath = `${externalRef.path}/tsconfig.lib.json`;
            if (!existingLibRefs.has(newRefPath)) {
                libConfig.references.push({ path: newRefPath });
                refsAdded++;
            }
        }

        if (refsAdded > 0) {
            await fs.writeFile(libTsConfigPath, JSON.stringify(libConfig, null, 2) + '\n');
            console.log(`📝 Updated ${path.relative(process.cwd(), libTsConfigPath)} with ${refsAdded} reference(s).`);
        }

        // --- 2. Clean up tsconfig.json ---
        rootConfig.references = internalRefs;
        await fs.writeFile(rootTsConfigPath, JSON.stringify(rootConfig, null, 2) + '\n');
        console.log(`🧹 Cleaned ${path.relative(process.cwd(), rootTsConfigPath)}.`);
        console.log('---');


    } catch (error) {
        console.error(`\n❌ Failed to process project in ${projectDir}:`, error.message);
    }
}

/**
 * Main function to execute the script.
 */
async function main() {
    console.log(`🚀 Starting TypeScript config cleanup in '${START_DIRECTORY}' directory...`);
    console.log('---');
    const projectDirs = await findProjectDirs(START_DIRECTORY);

    if (projectDirs.length === 0) {
        console.log(`No project directories found in '${START_DIRECTORY}'. Please check the START_DIRECTORY variable.`);
        return;
    }

    for (const dir of projectDirs) {
        await processProject(dir);
    }

    console.log(`\n✅ All done! Processed ${projectDirs.length} potential project directories.`);
}

main();
