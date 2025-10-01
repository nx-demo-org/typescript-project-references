export * from './lib/foobar5-lib.js';

// --- Generated code to use dependencies ---

import { foobar6Lib } from '@reference-org/foobar6-lib';

export function useDependencies() {
  console.log(foobar6Lib());
}
// --- End generated code ---
