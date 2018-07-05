const assert = require('assert');
const rewire = require('rewire');
const { getSizePairs, normalizeMd, splitSizingPair } = require('../../src/extract/normalize.js');


describe('Normalize markdown', () => {
  it('Should remove bold markers', () => {
    const markdown = '**Bold**: First\n**Bold**: Second\nNormal';
    const expected = [
      'Bold: First',
      'Bold: Second',
      'Normal',
    ];

    const stripped = normalizeMd(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove unordered list markers', () => {
    const markdown = '* First\n* Second\n*Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalizeMd(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove dashes', () => {
    const markdown = '- First\n- Second\n-Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalizeMd(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove plus signs', () => {
    const markdown = '+ First\n+ Second\n+Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalizeMd(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove greater-than HTML entities', () => {
    const markdown = '&gt; First\n&gt; Second\n&gt;Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalizeMd(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should normalize markdown', () => {
    const markdown = [
      'First line.',
      '* Unordered list item.',
      '* **Bolded** item.',
      '&gt; Pseudo list item.',
      '- Pseudo list item, again.',
      '',
      'Last line.',
    ].join('\n');
    const expected = [
      'First line.',
      'Unordered list item.',
      'Bolded item.',
      'Pseudo list item.',
      'Pseudo list item, again.',
      'Last line.',
    ];

    const normalized = normalizeMd(markdown);
    assert.deepStrictEqual(normalized, expected);
  });
});

describe('Split sizing pair', () => {
  it('Should return null if no colons found', () => {
    const line = 'Some regular text.';
    const pair = splitSizingPair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null if more than two colons found', () => {
    const line = 'why:would:this:exist?';
    const pair = splitSizingPair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null for notes', () => {
    const line = 'Notes: notes about things.';
    const pair = splitSizingPair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null for unexpected notes', () => {
    const line = 'Brannock/Notes: notes about things.';
    const pair = splitSizingPair(line);
    assert.strictEqual(pair, null);
  });

  it('Should split a colon delimited pair', () => {
    const expected = ['Manufacturer Last', '11D, additional notes.'];

    // No leading space.
    var line = 'Manufacturer Last: 11D, additional notes.';
    var pair = splitSizingPair(line);
    assert.deepEqual(pair, expected);

    // Leading space.
    line = 'Manufacturer Last : 11D, additional notes.';
    pair = splitSizingPair(line);
    assert.deepEqual(pair, expected);

    // Leading space, no trailing space.
    line = 'Manufacturer Last :11D, additional notes.';
    pair = splitSizingPair(line);
    assert.deepEqual(pair, expected);

    // No spaces.
    line = 'Manufacturer Last:11D, additional notes.';
    pair = splitSizingPair(line);
    assert.deepEqual(pair, expected);
  });
});

describe('Get size pairs from comment body', () => {
  it('Should get sizing information pairs', () => {
    const markdown = [
      'Note: This is a note with additional information.',
      '',
      '* Red Wing: 10D',
      '* Alden: 9.5D',
      '* Another: 10D',
    ].join('\n');

    const expected = [
      ['Red Wing', '10D'],
      ['Alden', '9.5D'],
      ['Another', '10D'],
    ];

    const out = getSizePairs(markdown);
    assert.deepStrictEqual(out, expected);
  });

  it('Should remove bullets without sizing information', () => {
    const markdown = [
      '* Red Wing: 10D',
      '* Stray bullet',
      '* Alden: 9.5D',
    ].join('\n');

    const expectedNum = 2;

    const out = getSizePairs(markdown);
    assert.strictEqual(out.length, expectedNum);
  });
});
