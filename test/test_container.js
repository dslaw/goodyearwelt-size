const assert = require('assert');
const rewire = require('rewire');
const container = rewire('../src/container.js');


// Private functions.
const split_brannock = container.__get__('split_brannock');
const brannock_cmp = container.__get__('brannock_cmp');
const get_sizes = container.__get__('get_sizes');
const get_template = container.__get__('get_template');


describe('Split Brannock size', () => {
  const size_expected = [
    {size: '8D', expected: {size: 8, width: 'D'}},
    {size: '8.5D', expected: {size: 8.5, width: 'D'}},
    {size: '10D', expected: {size: 10, width: 'D'}},
    {size: '10.5D', expected: {size: 10.5, width: 'D'}},
  ];

  size_expected.forEach(obj => {
    it(`Should split into size and width for ${obj.size}`, () => {
      const out = split_brannock(obj.size);
      assert.deepStrictEqual(out, obj.expected);
    });
  });
});

describe('Compare two Brannock sizes', () => {
  it('Should return -1 based on size', () => {
    const cmp = brannock_cmp('8.5D', '10D');
    assert.strictEqual(cmp, -1);
  });

  it('Should return 0 based on size', () => {
    const cmp = brannock_cmp('10D', '10D');
    assert.strictEqual(cmp, 0);
  });

  it('Should return 1 based on size', () => {
    const cmp = brannock_cmp('10D', '8.5D');
    assert.strictEqual(cmp, 1);
  });

  it('Should return -1 based on width', () => {
    const cmp = brannock_cmp('10D', '10E');
    assert.strictEqual(cmp, -1);
  });

  it('Should return 0 based on width', () => {
    const cmp = brannock_cmp('10E', '10E');
    assert.strictEqual(cmp, 0);
  });

  it('Should return 1 based on width', () => {
    const cmp = brannock_cmp('10E', '10D');
    assert.strictEqual(cmp, 1);
  });
});

describe('Get Brannock sizes', () => {
  it('Should return sorted sizes', () => { 
    // Values in the array don't matter here.
    const grouped_data = {
      '8D': [1, 2, 3],
      '10D': [1, 2, 3],
      '11D': [1, 2, 3],
      '11E': [1, 2, 3],
    };
    const expected = ['8D', '10D', '11D', '11E'];

    const out = get_sizes(grouped_data);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Sizing data container', () => {
  const sizing = [
    {brannock_size: '8D', size: 8, width: 'D', text: 'foo'},
    {brannock_size: '8D', size: 8, width: 'D', text: 'bar'},
    {brannock_size: '10D', size: 10, width: 'D', text: 'baz'},
  ];

  it('Should group data', () => {
    const sd = new container.SizingData(sizing);
    assert.notStrictEqual(sd.data['8D'], undefined);
    assert.notStrictEqual(sd.data['10D'], undefined);
    assert.equal(sd.data['8D'].length, 2);
    assert.equal(sd.data['10D'].length, 1);
  });

  it('Should store sizes', () => {
    const expected = ['8D', '10D'];
    const sd = new container.SizingData(sizing);
    assert.deepStrictEqual(sd.sizes, expected);
  });

  it('Should render sizes', () => {
    const expected = '<ul>8D</ul>\n<ul>10D</ul>\n';
    const sd = new container.SizingData(sizing);
    const out = sd.render_sizes('./test/data/snippet.html');
    assert.strictEqual(out, expected);
  });

  it('Should render data', () => {
    const expected = '<ul>10D</ul>\n';
    const sd = new container.SizingData(sizing);
    const out = sd.render_data('./test/data/snippet.html', '10D');
    assert.strictEqual(out, expected);
  });
});

describe('Get template', () => {
  it('Should compile an HTML template', () => {
    const expected = '<ul>text</ul>\n';
    const fn = get_template('./test/data/snippet.html');
    const out = fn({sizes: ['text']});
    assert.strictEqual(out, expected);
  });
});
