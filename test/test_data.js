const assert = require('assert');
const rewire = require('rewire');
const data = rewire('../src/data.js');


// Private functions.
const is_EU = data.__get__('is_EU');
const make_ready = data.__get__('make_ready');


describe('Check if a shoe size is EU', () => {
  it('Should be false', () => {
    assert.ok(!is_EU(8));
    assert.ok(!is_EU(14));
  });

  it('Should be true', () => {
    assert.ok(is_EU(39));
    assert.ok(is_EU(49));
  });
});

describe('Make sizing data ready for serving', () => {
  it('Should set values', () => {
    const obj = {text: '8D US'};
    const expected = {
      text: '8D US',
      size: 8,
      intl: 'US',
      width: 'D',
    };

    const out = make_ready(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should set defaults', () => {
    const obj = {text: '8'};
    const expected = {
      text: '8',
      size: 8,
      intl: 'US',
      width: 'D',
    };

    const out = make_ready(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should detect preceding intl', () => {
    const obj = {text: 'US 8D'};
    const expected = {
      text: 'US 8D',
      size: 8,
      intl: 'US',
      width: 'D',
    };

    const out = make_ready(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should set EU when missing', () => {
    const obj = {text: '40'};
    const expected = {
      text: '40',
      size: 40,
      intl: 'EU',
      width: 'D',
    };

    const out = make_ready(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should set EU when text disagrees', () => {
    const obj = {text: '40 US'};
    const expected = {
      text: '40 US',
      size: 40,
      intl: 'EU',
      width: 'D',
    };

    const out = make_ready(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should return null when no sizing data is found', () => {
    const obj = {text: 'just some notes'};
    const out = make_ready(obj);
    assert.strictEqual(out, null);
  });
});

describe('Process text from replies', () => {
  it('Should extract data and remove nulls', () => {
    const replies = [
      {text: null},
      {text: 'US 12D'},
      {text: 'Not something useful'},
      {text: 'UK 8.5'},
    ];
    const expected = [
      {text: 'US 12D', size: 12, intl: 'US', width: 'D'},
      {text: 'UK 8.5', size: 8.5, intl: 'UK', width: 'D'},
    ];

    const out = data.process_replies(replies);
    assert.deepStrictEqual(out, expected);
  });
});
