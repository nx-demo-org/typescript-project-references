export * from './lib/foobar12-lib.js';

// --- Generated code to use dependencies ---

import { foobar13Lib } from '@reference-org/foobar13-lib';

export function useDependencies() {
  console.log(foobar13Lib());
}
// --- End generated code ---
