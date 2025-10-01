export * from './lib/foobar42-lib.js';

// --- Generated code to use dependencies ---

import { foobar43Lib } from '@reference-org/foobar43-lib';

export function useDependencies() {
  console.log(foobar43Lib());
}
// --- End generated code ---
