const { isNil } = require('lodash');
const assert = require('assert');
const rewire = require('rewire');
const store = rewire('../src/store.js');
const { BrannockSize } = require('../src/posts.js');


// Private functions.
const addThreadMetadata = store.__get__('addThreadMetadata');
const orderSizes = store.__get__('orderSizes');

const assertAll = function(array) {
  const allTrue = array.reduce((acc, ele) => acc && ele, true);
  assert.ok(allTrue);
};

describe('Add thread metadata to size records', () => {
  const mockOp = { id: '123', url: 'http://domain.com/' };
  const sizingData = [
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1' },
    { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2' },
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3' },
  ];

  it('Should add thread id to each record', () => {
    const out = addThreadMetadata(mockOp, sizingData);
    const equalsOpId = out.map(sizeRecord => sizeRecord.threadId === mockOp.id);
    assertAll(equalsOpId);
  });

  it('Should add thread url to each record', () => {
    const out = addThreadMetadata(mockOp, sizingData);
    const equalsOpUrl = out.map(sizeRecord => sizeRecord.threadUrl === mockOp.url);
    assertAll(equalsOpUrl);
  });

  it('Should preserve fields', () => {
    const out = addThreadMetadata(mockOp, sizingData);

    const hasBrannockSize = out
      .map(sizeRecord => !isNil(sizeRecord.brannockSize));
    assertAll(hasBrannockSize);

    const hasSize = out
      .map(sizeRecord => !isNil(sizeRecord.size));
    assertAll(hasSize);

    const hasWidth = out
      .map(sizeRecord => !isNil(sizeRecord.width));
    assertAll(hasWidth);

    const hasText = out
      .map(sizeRecord => !isNil(sizeRecord.text));
    assertAll(hasText);
  });
});

describe('Order Brannock sizes', () => {
  it('Should sort brannock sizes by size and width', () => {
    const sizes = [ '8D', '10D', '10E', '10EE', '11D', '8A', '8F' ];
    const expected = [ '8A', '8D', '8F', '10D', '10E', '10EE', '11D' ];

    const out = orderSizes(sizes);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Load data from JSON file', () => {
  it.skip('Should load sizing records from a JSON file');
});

describe('In-memory data store', () => {
  const sizingData = [
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1' },
    { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2' },
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3' },
  ];

  it('Should group data', () => {
    const dataStore = new store.DataStore(sizingData);
    assert.notStrictEqual(dataStore.data, undefined);

    const dataKeys = Object.keys(dataStore.data);
    assert.strictEqual(dataKeys.length, 2);

    assert.strictEqual(dataStore.data['8D'].length, 2);
    assert.strictEqual(dataStore.data['10D'].length, 1);
  });

  it('Should store sizes', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = ['8D', '10D'];
    assert.deepStrictEqual(dataStore.sizes, expected);
  });

  it('Should get size records by size', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1' },
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3' },
    ];

    const out = dataStore.getSize('8D');
    assert.deepStrictEqual(out, expected);
  });

  it('Should return empty array when size is not present', () => {
    const dataStore = new store.DataStore(sizingData);
    assert.deepStrictEqual(dataStore.getSize('foo'), []);
    assert.deepStrictEqual(dataStore.getSize(''), []);
  });

  it('Should get flattened size records in order', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1' },
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3' },
      { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2' },
    ];

    const out = dataStore.get();
    assert.deepStrictEqual(out, expected);
  });
});
