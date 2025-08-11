export * from './lib/subfeature2-lib.js';

// --- Generated code to use dependencies ---

import { subfeature3Lib } from '@reference-org/subfeature3-lib';

export function useDependencies() {
  console.log(subfeature3Lib());
}
// --- End generated code ---
