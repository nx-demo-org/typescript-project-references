export * from './lib/foobar41-lib.js';

// --- Generated code to use dependencies ---

import { foobar42Lib } from '@reference-org/foobar42-lib';

export function useDependencies() {
  console.log(foobar42Lib());
}
// --- End generated code ---
