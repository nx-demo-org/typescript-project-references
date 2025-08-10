import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { complexGraphGenGenerator } from './complex-graph-gen';
import { ComplexGraphGenGeneratorSchema } from './schema';

describe('complex-graph-gen generator', () => {
  let tree: Tree;
  const options: ComplexGraphGenGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await complexGraphGenGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
