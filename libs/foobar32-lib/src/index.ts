export * from './lib/foobar32-lib.js';

// --- Generated code to use dependencies ---

import { foobar33Lib } from '@reference-org/foobar33-lib';

export function useDependencies() {
  console.log(foobar33Lib());
}
// --- End generated code ---
