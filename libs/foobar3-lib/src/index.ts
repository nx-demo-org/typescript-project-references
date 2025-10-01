export * from './lib/foobar3-lib.js';

// --- Generated code to use dependencies ---

import { foobar4Lib } from '@reference-org/foobar4-lib';

export function useDependencies() {
  console.log(foobar4Lib());
}
// --- End generated code ---
