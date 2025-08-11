import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { batchLibGenerator } from './complex-graph-gen';
import { BatchLibGeneratorSchema } from './schema';

describe('complex-graph-gen generator', () => {
  let tree: Tree;
  const options: BatchLibGeneratorSchema = { name: 'test', count: 10 };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await batchLibGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
