export * from './lib/foobar6-lib.js';

// --- Generated code to use dependencies ---

import { foobar7Lib } from '@reference-org/foobar7-lib';

export function useDependencies() {
  console.log(foobar7Lib());
}
// --- End generated code ---
