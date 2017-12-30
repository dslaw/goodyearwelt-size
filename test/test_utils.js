const assert = require('assert');
const {mfilter, mmap} = require('../src/utils.js');


describe('Filter with psuedo-Maybe', () => {
  const is_positive = (x) => x > 0;

  it('Should apply a predicate', () => {
    const xs = [-1, 0, 1];
    const expected = [1];
    const out = mfilter(xs, is_positive);
    assert.deepEqual(out, expected);
  });

  it('Should filter null', () => {
    const xs = [-1, null, 1];
    const expected = [1];
    const out = mfilter(xs, is_positive);
    assert.deepEqual(out, expected);
  });

  it('Should filter undefined', () => {
    const xs = [-1, undefined, 1];
    const expected = [1];
    const out = mfilter(xs, is_positive);
    assert.deepEqual(out, expected);
  });
});

describe('Map with psuedo-Maybe', () => {
  const add_1 = (x) => x + 1;

  it('Should apply a function', () => {
    const xs = [1, 2, 3];
    const expected = [2, 3, 4];
    const out = mmap(xs, add_1);
    assert.deepEqual(out, expected);
  });

  it('Should handle null', () => {
    const xs = [1, null, 3];
    const expected = [2, null, 4];
    const out = mmap(xs, add_1);
    assert.deepEqual(out, expected);
  });

  it('Should handle undefined', () => {
    const xs = [1, undefined, 3];
    const expected = [2, undefined, 4];
    const out = mmap(xs, add_1);
    assert.deepEqual(out, expected);
  });

  it('Should not skip falsey values', () => {
    const xs = [false, true];
    const expected = [false, true];
    const out = mmap(xs, x => x);
    assert.deepEqual(out, expected);
  });
});
