const assert = require('assert');
const rewire = require('rewire');
const {normalize_md, split_sizing_pair} = rewire('../../src/extract/clean.js');


describe('Normalize markdown', () => {
  it('Should remove bold markers', () => {
    const markdown = '**Bold**: First\n**Bold**: Second\nNormal';
    const expected = [
      'Bold: First',
      'Bold: Second',
      'Normal',
    ];

    const stripped = normalize_md(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove unordered list markers', () => {
    const markdown = '* First\n* Second\n*Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalize_md(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove dashes', () => {
    const markdown = '- First\n- Second\n-Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalize_md(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove plus signs', () => {
    const markdown = '+ First\n+ Second\n+Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalize_md(markdown);
    assert.deepStrictEqual(stripped, expected);
  });

  it('Should remove greater-than HTML entities', () => {
    const markdown = '&gt; First\n&gt; Second\n&gt;Third\nText';
    const expected = ['First', 'Second', 'Third', 'Text'];

    const stripped = normalize_md(markdown);
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

    const normalized = normalize_md(markdown);
    assert.deepStrictEqual(normalized, expected);
  });
});

describe('Split sizing pair', () => {
  it('Should return null if no colons found', () => {
    const line = 'Some regular text.';
    const pair = split_sizing_pair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null if more than two colons found', () => {
    const line = 'why:would:this:exist?';
    const pair = split_sizing_pair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null for notes', () => {
    const line = 'Notes: notes about things.';
    const pair = split_sizing_pair(line);
    assert.strictEqual(pair, null);
  });

  it('Should return null for unexpected notes', () => {
    const line = 'Brannock/Notes: notes about things.';
    const pair = split_sizing_pair(line);
    assert.strictEqual(pair, null);
  });

  it('Should split a colon delimited pair', () => {
    const expected = ['Manufacturer Last', '11D, additional notes.'];

    // No leading space.
    var line = 'Manufacturer Last: 11D, additional notes.';
    var pair = split_sizing_pair(line);
    assert.deepEqual(pair, expected);

    // Leading space.
    line = 'Manufacturer Last : 11D, additional notes.';
    pair = split_sizing_pair(line);
    assert.deepEqual(pair, expected);

    // Leading space, no trailing space.
    line = 'Manufacturer Last :11D, additional notes.';
    pair = split_sizing_pair(line);
    assert.deepEqual(pair, expected);

    // No spaces.
    line = 'Manufacturer Last:11D, additional notes.';
    pair = split_sizing_pair(line);
    assert.deepEqual(pair, expected);
  });
});
