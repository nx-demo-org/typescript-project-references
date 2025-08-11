export * from './lib/subfeature3-lib.js';

// --- Generated code to use dependencies ---

import { subfeature4Lib } from '@reference-org/subfeature4-lib';

export function useDependencies() {
  console.log(subfeature4Lib());
}
// --- End generated code ---
