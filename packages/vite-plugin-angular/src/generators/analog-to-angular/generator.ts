import { Tree, logger } from '@nx/devkit';
import { exit } from 'node:process';
import { AnalogToAngularGeneratorSchema } from './schema';
import { readFileSync } from 'node:fs';
import { compileAnalogFile } from '../../lib/authoring/analog';

export async function analogToAngularGenerator(
  tree: Tree,
  options: AnalogToAngularGeneratorSchema
) {
  const { path, project } = options;

  if (path && project) {
    logger.error(
      `[Analog] Cannot pass both "path" and "project" to analogToAngularGenerator`
    );
    return exit(1);
  }

  if (path) {
    if (!tree.exists(path)) {
      logger.error(`[Analog] "${path}" does not exit`);
      return exit(1);
    }

    // TODO: refactor
    if (path.endsWith('.analog')) {
      const fileContent = tree.read(path, 'utf8') || readFileSync(path, 'utf8');
      const convertedToAngular = compileAnalogFile(path, fileContent, true);
      tree.write(path, convertedToAngular);
    }
  } else if (project) {
    // TODO: handle project
    logger.error(`[Analog] project not implemented`);
    return exit(1);
  }
}

export default analogToAngularGenerator;
