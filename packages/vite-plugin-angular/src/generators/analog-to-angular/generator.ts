import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { AnalogToAngularGeneratorSchema } from './schema';

export async function analogToAngularGenerator(
  tree: Tree,
  options: AnalogToAngularGeneratorSchema
) {
  // const projectRoot = `libs/${options.name}`;
  // addProjectConfiguration(tree, options.name, {
  // root: projectRoot,
  // projectType: 'library',
  // sourceRoot: `${projectRoot}/src`,
  // targets: {},
  // });
  // generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  // await formatFiles(tree);
  console.log('here we go');
}

export default analogToAngularGenerator;
