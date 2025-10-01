export * from './lib/foobar11-lib.js';

// --- Generated code to use dependencies ---

import { foobar12Lib } from '@reference-org/foobar12-lib';

export function useDependencies() {
  console.log(foobar12Lib());
}
// --- End generated code ---
