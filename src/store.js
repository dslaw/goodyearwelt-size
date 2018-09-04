const _ = require('lodash');
const io = require('./io.js');
const { BrannockSize, getSizeThreads, splitThread } = require('./posts.js');
const { extractSizeRecords, notNil } = require('./extract/responses.js');
const { processSizeRecord } = require('./postprocess.js');


/* Add metadata from the Reddit thread to size records.
 * @param {Comment} op - Comment giving the original post.
 * @param {Array[Object]} sizeRecords - Denormalized size records.
 * @return {Array[Object]}
 */
const addThreadMetadata = function(op, sizeRecords) {
  return sizeRecords.map(sizeRecord => ({
    threadId: op.id,
    threadUrl: op.url,
    ...sizeRecord,
  }));
};

/**
 * Load data from disk.
 * @param {string} filename - The name of the file to read.
 * @return {Array[Object]} sizeRecords
 */
const loadData = function(filename) {
  const rawThread = io.readJSON(filename);
  const { op, comments } = splitThread(rawThread);
  const sizeThreads = getSizeThreads(op, comments);
  const sizeRecords = _.flatMap(sizeThreads, extractSizeRecords);
  const processed = sizeRecords.map(processSizeRecord).filter(notNil);
  return addThreadMetadata(op, processed);
};


const makeOrderedIndex = function(values, iteratee) {
  // Create an index pointing to the array positions.
  const index = new Map();
  values.forEach((value, idx) => {
    if (index.has(value)) {
      index.get(value).push(idx);
    } else {
      index.set(value, [ idx ]);
    }
  });

  // Order the index keys and leave the index itself unordered.
  // While the index could also be created so that its keys are
  // ordered, this seems like relying too much on an implementation
  // detail, so we explicitly handle it.
  const keys = Array.from(index.keys());
  const sortedKeys = _.sortBy(keys, iteratee);
  return [ index, sortedKeys ];
};

const makeSizeIndex = function(sizeRecords) {
  // Use the display value of each brannock size as the key.
  const brannockSizes = sizeRecords.map(r => r.brannockSize.toString());
  return makeOrderedIndex(brannockSizes, [
    key => BrannockSize.fromString(key).size,
    key => BrannockSize.fromString(key).width,
  ]);
};

const makeMlastIndex = function(sizeRecords) {
  const mlasts = sizeRecords.map(r => r.mlast);
  return makeOrderedIndex(mlasts, [
    key => key.toLowerCase(),
  ]);
};

const countIndexed = function(index, keys, name) {
  // Passing in `keys` allows caller to define the order.
  return keys.map((key) => {
    const count = index.get(key).length;
    return { [name]: key, count };
  });
};

class DataStore {
  constructor(sizingData) {
    this.data = sizingData;
    [ this.sizeIndex, this.sizes ] = makeSizeIndex(this.data);
    [ this.mlastIndex, this.mlasts ] = makeMlastIndex(this.data);
  }

  get() {
    return _.flatMap(this.sizes, size => this.getSize(size));
  }

  getSize(size) {
    const indices = this.sizeIndex.get(size) || [];
    return indices.map(idx => this.data[idx]);
  }

  countSizes() {
    return countIndexed(this.sizeIndex, this.sizes, 'size');
  }

  getMlast(mlast) {
    const indices = this.mlastIndex.get(mlast) || [];
    return indices.map(idx => this.data[idx]);
  }

  countMlasts() {
    return countIndexed(this.mlastIndex, this.mlasts, 'mlast');
  }
}


module.exports = {
  DataStore,
  loadData,
};
