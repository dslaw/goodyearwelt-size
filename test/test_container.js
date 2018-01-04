const assert = require('assert');
const rewire = require('rewire');
const container = rewire('../src/container.js');


// Private functions.
const get_sizes = container.__get__('get_sizes');


describe('Get Brannock sizes', () => {
  it('Should return sorted sizes', () => { 
    // Values in the array don't matter here.
    const grouped_data = {
      '8D': [1, 2],
      '10D': [1, 2],
      '10E': [1, 2],
      '10EE': [1, 2],
      '11D': [1, 2],
      '8A': [1, 2],
      '8F': [1, 2],
    };
    const expected = ['8A', '8D', '8F', '10D', '10E', '10EE', '11D'];

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

  it('Should recover input data', () => {
    const sd = new container.SizingData(sizing);
    const out = sd.get();
    assert.deepStrictEqual(out, sizing);
  });

  it('Should get data by size', () => {
    const sd = new container.SizingData(sizing);
    assert.deepStrictEqual(sd.get_size('8D'), [
      {brannock_size: '8D', size: 8, width: 'D', text: 'foo'},
      {brannock_size: '8D', size: 8, width: 'D', text: 'bar'},
    ]);
    assert.deepStrictEqual(sd.get_size('10D'), [
      {brannock_size: '10D', size: 10, width: 'D', text: 'baz'},
    ]);
  });

  it('Should return empty array when specified size is not present', () => {
    const sd = new container.SizingData(sizing);
    assert.deepStrictEqual(sd.get_size('14E'), []);
    assert.deepStrictEqual(sd.get_size(''), []);
    assert.deepStrictEqual(sd.get_size(null), []);
    assert.deepStrictEqual(sd.get_size(undefined), []);
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
