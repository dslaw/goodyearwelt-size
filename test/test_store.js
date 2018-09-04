const { isNil } = require('lodash');
const assert = require('assert');
const rewire = require('rewire');
const store = rewire('../src/store.js');
const { BrannockSize } = require('../src/posts.js');


// Private functions.
const addThreadMetadata = store.__get__('addThreadMetadata');

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

describe('Load data from JSON file', () => {
  it.skip('Should load sizing records from a JSON file');
});

describe('In-memory data store', () => {
  const sizingData = [
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1', mlast: 'Red Wing' },
    { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2', mlast: 'Red Wing'},
    { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3', mlast: 'Alden' },
  ];

  it('Should store sorted, unique sizes', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [ '8D', '10D' ];
    assert.deepStrictEqual(dataStore.sizes, expected);
  });

  it('Should store sorted, unique model-lasts', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [ 'Alden', 'Red Wing' ];
    assert.deepStrictEqual(dataStore.mlasts, expected);
  });

  it('Should get size records by size', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1', mlast: 'Red Wing' },
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3', mlast: 'Alden' },
    ];

    const out = dataStore.getSize('8D');
    assert.deepStrictEqual(out, expected);
  });

  it('Should get size records by model-last', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1', mlast: 'Red Wing' },
      { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2', mlast: 'Red Wing'},
    ];

    const out = dataStore.getMlast('Red Wing');
    assert.deepStrictEqual(out, expected);
  });

  it('Should return empty array when size is not present', () => {
    const dataStore = new store.DataStore(sizingData);
    assert.deepStrictEqual(dataStore.getSize('foo'), []);
    assert.deepStrictEqual(dataStore.getSize(''), []);
  });

  it('Should return empty array when model-last is not present', () => {
    const dataStore = new store.DataStore(sizingData);
    assert.deepStrictEqual(dataStore.getMlast('foo'), []);
    assert.deepStrictEqual(dataStore.getMlast(''), []);
  });

  it('Should get flattened size records in order of size', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '1', mlast: 'Red Wing' },
      { brannockSize: new BrannockSize('8', 'D'), size: 8, width: 'D', text: '3', mlast: 'Alden' },
      { brannockSize: new BrannockSize('10', 'D'), size: 10, width: 'D', text: '2', mlast: 'Red Wing' },
    ];

    const out = dataStore.get();
    assert.deepStrictEqual(out, expected);
  });

  it('Should get counts of sizes, in order', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { size: '8D', count: 2 },
      { size: '10D', count: 1 },
    ];

    const out = dataStore.countSizes();
    assert.deepStrictEqual(out, expected);
  });

  it('Should get counts of sizes, in order', () => {
    const dataStore = new store.DataStore(sizingData);
    const expected = [
      { mlast: 'Alden', count: 1 },
      { mlast: 'Red Wing', count: 2 },
    ];

    const out = dataStore.countMlasts();
    assert.deepStrictEqual(out, expected);
  });
});
