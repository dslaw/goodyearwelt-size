const assert = require('assert');
const rewire = require('rewire');
const sizes = rewire('../src/sizes.js');

// Private functions.
const match_regex = sizes.__get__('match_regex');


describe('Match regular expression', () => {
  const line = 'abcde';

  it('Should match', () => {
    const pattern = /cd/;

    const {match, captures, index} = match_regex(line, pattern);
    assert.strictEqual(match, 'cd');
    assert.strictEqual(captures.length, 0);
    assert.strictEqual(index, 2);
  });

  it('Should destructure to undefined', () => {
    const {match, captures, index} = match_regex(line, /nomatch/);
    assert.ok(match === undefined);
    assert.ok(captures === undefined);
    assert.ok(index === undefined);
  });
});

describe('Match specific patterns', () => {
  const input_expectations = [
    // Whole sizes, no international specification.
    {line: '8', size: '8', width: null, intl: null},
    {line: '8D', size: '8', width: 'D', intl: null},

    // Double digit sizes, no international specification.
    {line: '11', size: '11', width: null, intl: null},
    {line: '11D', size: '11', width: 'D', intl: null},

    // Half sizes, no international specification.
    {line: '8.5', size: '8.5', width: null, intl: null},
    {line: '8.5D', size: '8.5', width: 'D', intl: null},

    // Double digit half sizes, no international specification.
    {line: '11.5', size: '11.5', width: null, intl: null},
    {line: '11.5D', size: '11.5', width: 'D', intl: null},

    // Whole sizes, US.
    {line: '8D US', size: '8', width: 'D', intl: 'US'},
    {line: '8DUS', size: '8', width: 'D', intl: 'US'},
    {line: '8 US', size: '8', width: null, intl: 'US'},
    {line: '8US', size: '8', width: null, intl: 'US'},
    {line: '8.0 US', size: '8.0', width: null, intl: 'US'},
    {line: '8.0US', size: '8.0', width: null, intl: 'US'},

    // Double digit whole sizes, US.
    {line: '11D US', size: '11', width: 'D', intl: 'US'},
    {line: '11DUS', size: '11', width: 'D', intl: 'US'},
    {line: '11 US', size: '11', width: null, intl: 'US'},
    {line: '11US', size: '11', width: null, intl: 'US'},
    {line: '11.0 US', size: '11.0', width: null, intl: 'US'},
    {line: '11.0US', size: '11.0', width: null, intl: 'US'},

    // Half sizes, US.
    {line: '8.5 US', size: '8.5', width: null, intl: 'US'},
    {line: '8.5US', size: '8.5', width: null, intl: 'US'},
    {line: '8.5D US', size: '8.5', width: 'D', intl: 'US'},
    {line: '8.5DUS', size: '8.5', width: 'D', intl: 'US'},

    // Double digit half sizes, US.
    {line: '11.5 US', size: '11.5', width: null, intl: 'US'},
    {line: '11.5US', size: '11.5', width: null, intl: 'US'},
    {line: '11.5D US', size: '11.5', width: 'D', intl: 'US'},
    {line: '11.5DUS', size: '11.5', width: 'D', intl: 'US'},

    // Alternate widthes.
    {line: '8A US', size: '8', 'width': 'A', intl: 'US'},
    {line: '8B US', size: '8', 'width': 'B', intl: 'US'},
    {line: '8C US', size: '8', 'width': 'C', intl: 'US'},
    {line: '8E US', size: '8', 'width': 'E', intl: 'US'},
    {line: '8EE US', size: '8', 'width': 'EE', intl: 'US'},
    {line: '8EEE US', size: '8', 'width': 'EEE', intl: 'US'},
    {line: '8F US', size: '8', 'width': 'F', intl: 'US'},
    {line: '8G US', size: '8', 'width': 'G', intl: 'US'},

    // UK.
    {line: '8D UK', size: '8', width: 'D', intl: 'UK'},
    {line: '8DUK', size: '8', width: 'D', intl: 'UK'},
    {line: '8 UK', size: '8', width: null, intl: 'UK'},
    {line: '8UK', size: '8', width: null, intl: 'UK'},
    {line: '8.0 UK', size: '8.0', width: null, intl: 'UK'},
    {line: '8.0UK', size: '8.0', width: null, intl: 'UK'},

    // EU.
    {line: '44D EU', size: '44', width: 'D', intl: 'EU'},
    {line: '44DEU', size: '44', width: 'D', intl: 'EU'},
    {line: '44 EU', size: '44', width: null, intl: 'EU'},
    {line: '44EU', size: '44', width: null, intl: 'EU'},
    {line: '44.0 EU', size: '44.0', width: null, intl: 'EU'},
    {line: '44.0EU', size: '44.0', width: null, intl: 'EU'},

    // EUR.
    {line: '44D EUR', size: '44', width: 'D', intl: 'EU'},
    {line: '44DEUR', size: '44', width: 'D', intl: 'EU'},
    {line: '44 EUR', size: '44', width: null, intl: 'EU'},
    {line: '44EUR', size: '44', width: null, intl: 'EU'},
    {line: '44.0 EUR', size: '44.0', width: null, intl: 'EU'},
    {line: '44.0EUR', size: '44.0', width: null, intl: 'EU'},

    // Misc edge cases.
    {line: '10.5E,', size: '10.5', width: 'E', intl: null},
  ];

  // Parametrize.
  input_expectations.forEach((obj) => {
    it(`Should extract ordered data from '${obj.line}'`, () => {
      const expected = {
        size: obj.size,
        width: obj.width,
        intl: obj.intl,
      };
      const out = sizes.sticky_match(obj.line);
      assert.deepStrictEqual(out, expected);
    });
  });

  const notes = ', words (and another 9UK size).';
  input_expectations.forEach((obj) => {
    it(`Should extract ordered data when addtl notes are present from '${obj.line}'`, () => {
      const expected = {
        size: obj.size,
        width: obj.width,
        intl: obj.intl,
      };
      const out = sizes.sticky_match(obj.line + notes);
      assert.deepStrictEqual(out, expected);
    });
  });

});

describe('Check if a shoe size is EU', () => {
  it('Should be false', () => {
    assert.ok(!sizes.is_EU(8));
    assert.ok(!sizes.is_EU(14));
  });

  it('Should be true', () => {
    assert.ok(sizes.is_EU(39));
    assert.ok(sizes.is_EU(49));
  });
});
