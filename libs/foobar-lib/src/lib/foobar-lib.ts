import { foobar1Lib } from '@reference-org/foobar1-lib';
import { foobar2Lib } from '@reference-org/foobar2-lib';
import { foobar3Lib } from '@reference-org/foobar3-lib';
import { foobar4Lib } from '@reference-org/foobar4-lib';

console.log(foobar1Lib());
console.log(foobar2Lib());
console.log(foobar3Lib());
console.log(foobar4Lib());

export function foobarLib(): string {
  return 'foobar-lib';
}
