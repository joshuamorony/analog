import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, addProjectConfiguration } from '@nx/devkit';

import { analogToAngularGenerator } from './generator';
import { AnalogToAngularGeneratorSchema } from './schema';
import { compileAnalogFile } from '../../lib/authoring/analog';

const analogFile = `
<script lang="ts">
  import {
    DestroyRef,
    inject,
    input,
    EventEmitter,
    effect,
    ViewChild,
    ElementRef,
    afterNextRender,
  } from '@angular/core';

  import { myFunc } from './export-stuff.analog';

  defineMetadata({
    queries: {
      divElement: new ViewChild('divElement'),
    },
    exposes: [myFunc],
  });

  let divElement: ElementRef<HTMLDivElement>;

  afterNextRender(() => {
    console.log('the Div', divElement);
  });

  const { foo: aliasFoo = 'tran', ...rest } = { foo: 'chau' };
  const [a, b, , c = 5, ...restArray] = [1, 2, 3];

  const text = input('');

  effect(() => {
    console.log('text changed', text());
  });

  const clicked = new EventEmitter<MouseEvent>();

  inject(DestroyRef).onDestroy(() => {
    console.log('hello destroyed');
  });
</script>

<template>
  <h1>Hello.ng again</h1>
  <p>{{ a }}</p>
  <p>{{ b }}</p>
  <p>{{ c }}</p>
  <p>{{ aliasFoo }}</p>
  <p>Text from input: {{ text() }}</p>
  <button (click)="clicked.emit($event)">Emit The Click</button>
  <div #divElement>my div</div>
  <p>From imported function: {{ myFunc() }}</p>
</template>

<style>
  :host {
    display: block;
    padding: 1rem;
    border: 1px dashed red;
    border-radius: 0.5rem;
  }
</style>
`;

describe('analog-to-angular generator', () => {
  let tree: Tree;

  const projectOneFiles = [
    'apps/project-one/my-component',
    'apps/project-one/my-feature/another',
  ];

  const projectTwoFiles = [
    'apps/project-two/my-component',
    'apps/project-two/my-feature/another',
  ];

  const libFiles = ['libs/my-file', 'libs/my-component'];

  const allFiles = [...projectOneFiles, ...projectTwoFiles, ...libFiles];

  const options: AnalogToAngularGeneratorSchema = {
    path: `${libFiles[0]}.analog`,
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    addProjectConfiguration(tree, 'project-one', {
      root: './apps/project-one',
    });

    addProjectConfiguration(tree, 'another-project', {
      root: './apps/another-project',
    });

    for (const path of allFiles) {
      tree.write(`${path}.analog`, analogFile);
    }
  });

  describe('given path', () => {
    it('should write result of compileAnalogFile to .ts file', async () => {
      const testFile = libFiles[0];
      const expected = compileAnalogFile(
        `${testFile}.analog`,
        analogFile,
        true
      );
      await analogToAngularGenerator(tree, options);
      const actual = tree.read(`${testFile}.ts`, 'utf8');
      expect(actual).toEqual(expected);
    });

    it('should not convert other analog files', async () => {
      await analogToAngularGenerator(tree, options);
      const actual = tree.read(`${libFiles[1]}.ts`, 'utf8');
      expect(actual).toBeNull();
    });
  });

  describe('given project', async () => {
    it('should throw if project does not exist', async () => {
      await expect(
        analogToAngularGenerator(tree, { project: 'does-not-exit' })
      ).rejects.toThrow();
    });

    it('should convert all analog files in specified project', async () => {
      const expectedOne = compileAnalogFile(
        `${projectOneFiles[0]}.analog`,
        analogFile,
        true
      );
      const expectedTwo = compileAnalogFile(
        `${projectOneFiles[1]}.analog`,
        analogFile,
        true
      );

      await analogToAngularGenerator(tree, { project: 'project-one' });

      const actualOne = tree.read(`${projectOneFiles[0]}.ts`, 'utf8');
      const actualTwo = tree.read(`${projectOneFiles[1]}.ts`, 'utf8');

      expect(actualOne).toEqual(expectedOne);
      expect(actualTwo).toEqual(expectedTwo);
    });

    it('should not convert files in other projects', async () => {
      await analogToAngularGenerator(tree, { project: 'project-one' });
      const actual = tree.read(`${projectTwoFiles[0]}.ts`, 'utf8');
      expect(actual).toEqual(null);
    });
  });

  // describe('given no path or project', async () => {
  // it('should convert all analog files in workspace', () => {});
  // });

  // it should exit if path and project supplied
  // it should exit if file does not end with .analog
  // it should update imports e.g. import MyComponent to import { MyComponent } if updateImports
  // it should rename .analog to .ts
  // it should handle external styles/templates
});
