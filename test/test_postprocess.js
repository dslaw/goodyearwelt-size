const assert = require('assert');
const rewire = require('rewire');
const postprocess = rewire('../src/postprocess.js');


// Private functions.
const isEU = postprocess.__get__('isEU');
const getMatches = postprocess.__get__('getMatches');
const validateExtracted = postprocess.__get__('validateExtracted');
const reconcileIntl = postprocess.__get__('reconcileIntl');
const cleanManufacturerLast = postprocess.__get__('cleanManufacturerLast');
const { processSizeRecord } = postprocess;


describe('Check if a shoe size is EU', () => {
  it('Should be false', () => {
    assert.ok(!isEU(8));
    assert.ok(!isEU(14));
  });

  it('Should be true', () => {
    assert.ok(isEU(35));
    assert.ok(isEU(49));
  });
});

describe('Extract sizing data', () => {
  it('Should get two sizing data objects', () => {
    const text = 'Here is some 10D US text';
    const out = getMatches(text);
    assert.strictEqual(out.length, 2);
    assert.ok(out[0] instanceof Object);
    assert.ok(out[1] instanceof Object);
  });
});

describe('Validate extracted sizing data', () => {
  it('Should return validated sizing data from "post"', () => {
    const post = { size: '10', width: 'D', intl: 'US' };
    const pre = { size: '10', width: 'D', intl: null };
    const expected = { size: 10, width: 'D', intl: 'US' };

    const out = validateExtracted(post, pre);
    assert.deepStrictEqual(out, expected);
  });

  it('Should fallback to "preceding match"', () => {
    const post = { size: '10', width: 'D', intl: null };
    const pre = { size: '10', width: 'D', intl: 'US' };
    const expected = { size: 10, width: 'D', intl: 'US' };

    const out = validateExtracted(post, pre);
    assert.deepStrictEqual(out, expected);
  });

  it('Should have null fields if sizes from precedes/post match differ', () => {
    const post = { size: null, width: null, intl: null };
    const pre = { size: null, width: null, intl: null };
    const expected = { size: null, width: null, intl: null };

    const out = validateExtracted(post, pre);
    assert.deepStrictEqual(out, expected);
  });

  it('Should have null size if size is not a float', () => {
    const post = { size: 'foo', width: 'D', intl: 'US' };
    const pre = { size: 'foo', width: 'D', intl: null };
    const expected = { size: null, width: 'D', intl: 'US' };

    const out = validateExtracted(post, pre);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Reconcile intl with size', () => {
  it('Should return EU if size is EU', () => {
    const sizing = { intl: 'foo', size: 40 };
    const out = reconcileIntl(sizing);
    assert.strictEqual(out, 'EU');
  });

  it('Should return null if size isnt EU but intl is', () => {
    const sizing = { intl: 'EU', size: 10 };
    const out = reconcileIntl(sizing);
    assert.strictEqual(out, null);
  });

  it('Should do nothing if intl is null', () => {
    const sizing = { intl: null, size: 10 };
    const out = reconcileIntl(sizing);
    assert.strictEqual(out, null);
  });

  it('Should do nothing if size is null', () => {
    const sizing = { intl: 'EU', size: null };
    const out = reconcileIntl(sizing);
    assert.strictEqual(out, null);
  });
});

describe('Clean manufacturer last', () => {
  it('Should remove ampersand entity', () => {
    const mlast = 'Crockett &amp; Jones 111';
    const expected = 'Crockett & Jones 111';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it('Should collapse spaces', () => {
    const mlast = 'Crockett &    Jones 111';
    const expected = 'Crockett & Jones 111';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it('Should remove text inside parentheses', () => {
    const mlast = 'Redwing (Iron Rangers)';
    const expected = 'Redwing';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it('Should handle empty string', () => {
    const mlast = '';
    const expected = '';
    const out = cleanManufacturerLast(mlast);
    assert.strictEqual(out, expected);
  });

  it('Should remove phrase "unknown last"', () => {
    const mlast = 'unknown last';
    const expected = '';
    const out = cleanManufacturerLast(mlast);
    assert.strictEqual(out, expected);
  });

  it('Should remove trailing phrase "last"', () => {
    const mlast = 'Viberg 2030 last';
    const expected = 'Viberg 2030';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  })

  it('Should strip trailing whitespace', () => {
    const mlast = 'Viberg 2030 ';
    const expected = 'Viberg 2030';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });

  it('Should clean', () => {
    const mlast = ' Crockett &amp; Jones 111 last ';
    const expected = 'Crockett & Jones 111';
    const out = cleanManufacturerLast(mlast);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Process a size record', () => {
  it('Should extract validated sizing data', () => {
    const sizeRecord = {
      id: 1,
      mlast: 'Viberg 2030 ',
      text: '10D US, somewhat narrow in the toes',
    };
    const expected = {
      id: 1,
      text: '10D US, somewhat narrow in the toes',
      mlast: 'Viberg 2030',
      intl: 'US',
      size: 10,
      width: 'D',
    };

    const out = processSizeRecord(sizeRecord);
    assert.deepStrictEqual(out, expected);
  });

  it('Should return null if no size was extracted', () => {
    const sizeRecord = { id: 1, mlast: 'Viberg 2030 ' };
    const out = processSizeRecord(sizeRecord);
    assert.strictEqual(out, null);
  });

  it('Should return null if mlast was obliterated', () => {
    const sizeRecord = { id: 1, mlast: '  ', text: '10D' };
    const out = processSizeRecord(sizeRecord);
    assert.strictEqual(out, null);
  });

  it('Should propagate null if text is missing', () => {
    const sizeRecord = { id: 1, mlast: 'Viberg 2030' };
    const out = processSizeRecord(sizeRecord);
    assert.strictEqual(out, null);
  });

  it('Should propagate null if mlast is missing', () => {
    const sizeRecord = { id: 1, text: '10D' };
    const out = processSizeRecord(sizeRecord);
    assert.strictEqual(out, null);
  });
});
