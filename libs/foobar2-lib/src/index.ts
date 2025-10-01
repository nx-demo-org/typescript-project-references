export * from './lib/foobar2-lib.js';

// --- Generated code to use dependencies ---

import { foobar3Lib } from '@reference-org/foobar3-lib';

export function useDependencies() {
  console.log(foobar3Lib());
}
// --- End generated code ---
