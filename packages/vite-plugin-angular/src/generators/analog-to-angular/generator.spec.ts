import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

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
  const options: AnalogToAngularGeneratorSchema = {
    path: 'libs/my-file.analog',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    tree.write(`libs/my-file.analog`, analogFile);
  });

  it('should write result of compileAnalogFile back to file', async () => {
    await analogToAngularGenerator(tree, options);
    const expected = compileAnalogFile('libs/my-file.analog', analogFile, true);
    const actual = tree.read('libs/my-file.analog', 'utf8');
    expect(actual).toEqual(expected);
  });

  // it should exit if path and project supplied
  // it should exit if file does not end with .analog
});
