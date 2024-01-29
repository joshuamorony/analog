import {
  Tree,
  getProjects,
  logger,
  readProjectConfiguration,
  visitNotIgnoredFiles,
} from '@nx/devkit';
import { exit } from 'node:process';
import { AnalogToAngularGeneratorSchema } from './schema';
import { readFileSync } from 'node:fs';
import { compileAnalogFile } from '../../lib/authoring/analog';

function convertToAngular(tree: Tree, fullPath: string) {
  if (fullPath.endsWith('.analog')) {
    const fileContent =
      tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');

    const convertedToAngular = compileAnalogFile(fullPath, fileContent, true);
    tree.write(fullPath.replace('.analog', '.ts'), convertedToAngular);
  }
}

function updateAnalogImports(
  tree: Tree,
  fullPath: string,
  shouldUpdate?: boolean
) {
  if (!shouldUpdate) return;

  if (fullPath.endsWith('.ts')) {
    const fileContent =
      tree.read(fullPath, 'utf8') || readFileSync(fullPath, 'utf8');
    const importRegex = /import (\w+) from '(.*)\.analog'/g;
    const updatedContent = fileContent.replace(
      importRegex,
      `import { $1 } from '$2'`
    );
    tree.write(fullPath, updatedContent);
  }
}

export async function analogToAngularGenerator(
  tree: Tree,
  options: AnalogToAngularGeneratorSchema
) {
  const { path, project, updateImports } = options;

  if (path && project) {
    logger.error(
      `[Analog] Cannot pass both "path" and "project" to analogToAngularGenerator`
    );
    return exit(1);
  }

  if (path && updateImports) {
    logger.error(
      `[Analog] Import updates not supported when converting individual files`
    );
    return exit(1);
  }

  if (path) {
    if (!tree.exists(path)) {
      logger.error(`[Analog] "${path}" does not exist`);
      return exit(1);
    }

    convertToAngular(tree, path);
  } else if (project) {
    const projectConfiguration = readProjectConfiguration(tree, project);

    if (!projectConfiguration) {
      throw `"${project}" project not found`;
    }

    visitNotIgnoredFiles(tree, projectConfiguration.root, (path) => {
      convertToAngular(tree, path);
      updateAnalogImports(tree, path, updateImports);
    });
  } else {
    const projects = getProjects(tree);
    for (const project of projects.values()) {
      visitNotIgnoredFiles(tree, project.root, (path) => {
        convertToAngular(tree, path);
        updateAnalogImports(tree, path, updateImports);
      });
    }
  }
}

export default analogToAngularGenerator;
