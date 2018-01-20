const assert = require('assert');
const rewire = require('rewire');
const data = rewire('../src/data.js');


// Private functions.
const make_ready = data.__get__('make_ready');


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
