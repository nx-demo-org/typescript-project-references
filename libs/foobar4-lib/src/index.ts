export * from './lib/foobar4-lib.js';

// --- Generated code to use dependencies ---

import { foobar5Lib } from '@reference-org/foobar5-lib';

export function useDependencies() {
  console.log(foobar5Lib());
}
// --- End generated code ---
