const assert = require('assert');
const rewire = require('rewire');
const data = rewire('../src/data.js');


// Private functions.
const is_EU = data.__get__('is_EU');
const make_ready = data.__get__('make_ready');
const clean_manufacturer_last = data.__get__('clean_manufacturer_last');


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

describe('Clean manufacturer last', () => {
  it('Should remove ampersand entity', () => {
    const obj = {manufacturer_last: 'Crockett &amp; Jones 111'};
    const expected = {manufacturer_last: 'Crockett & Jones 111'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  // TODO: Seems like an issue in cleaning the markdown. 
  it('Should remove greater-than entity', () => {
    const obj = {manufacturer_last: '&gt; why'};
    const expected = {manufacturer_last: 'why'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should remove plus sign', () => {
    const obj = {manufacturer_last: ' + plus'};
    const expected = {manufacturer_last: 'plus'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should remove asterisk', () => {
    const obj = {manufacturer_last: ' * asterisk'};
    const expected = {manufacturer_last: 'asterisk'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should collapse spaces', () => {
    const obj = {manufacturer_last: 'Crockett &    Jones 111'};
    const expected = {manufacturer_last: 'Crockett & Jones 111'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should remove text inside parentheses', () => {
    const obj = {manufacturer_last: 'Redwing (Iron Rangers)'};
    const expected = {manufacturer_last: 'Redwing'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should handle when the string is empty', () => {
    const obj = {manufacturer_last: ''};
    const expected = null;
    const out = clean_manufacturer_last(obj);
    assert.strictEqual(out, expected);
  });

  it('Should flag phrase "unknown last"', () => {
    const obj = {manufacturer_last: 'unknown last'};
    const expected = null;
    const out = clean_manufacturer_last(obj);
    assert.strictEqual(out, expected);
  });

  it('Should remove trailing phrase "last"', () => {
    const obj = {manufacturer_last: 'Viberg 2030 last'};
    const expected = {manufacturer_last: 'Viberg 2030'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  })

  it('Should strip trailing whitespace', () => {
    const obj = {manufacturer_last: 'Viberg 2030 '};
    const expected = {manufacturer_last: 'Viberg 2030'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });

  it('Should clean', () => {
    const obj = {manufacturer_last: ' Crockett &amp; Jones 111 last '};
    const expected = {manufacturer_last: 'Crockett & Jones 111'};
    const out = clean_manufacturer_last(obj);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Process text from replies', () => {
  it('Should extract data and remove nulls', () => {
    const replies = [
      {text: null, manufacturer_last: 'Redwing'},
      {text: 'US 12D', manufacturer_last: 'Redwing'},
      {text: 'Not something useful', manufacturer_last: 'Redwing'},
      {text: 'UK 8.5', manufacturer_last: 'Redwing'},
      {text: 'UK 8.5', manufacturer_last: ''},
    ];
    const expected = [{
      text: 'US 12D',
      size: 12,
      intl: 'US',
      width: 'D',
      manufacturer_last: 'Redwing'
    }, {
      text: 'UK 8.5',
      size: 8.5,
      intl: 'UK',
      width: 'D',
      manufacturer_last: 'Redwing'
    }];

    const out = data.process_replies(replies);
    assert.deepStrictEqual(out, expected);
  });
});
