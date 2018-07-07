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
const loadData = _.memoize(filename => {
  const rawThread = io.readJSON(filename);
  const { op, comments } = splitThread(rawThread);
  const sizeThreads = getSizeThreads(op, comments);
  const sizeRecords = _.flatMap(sizeThreads, extractSizeRecords);
  const processed = sizeRecords.map(processSizeRecord).filter(notNil);
  return addThreadMetadata(op, processed);
});

/**
 * Sort Brannock sizes.
 * @param {Array[string]} sizes - Brannock sizes as strings.
 * @return {Array[string]} - Sorted Brannock sizes.
 */
const orderSizes = function(sizes) {
  const brannockSizes = sizes.map(size => BrannockSize.fromString(size));
  const sorted = _.sortBy(brannockSizes, ['size', 'width']);
  return sorted.map(brannockSize => brannockSize.toString());
};

class DataStore {
  constructor(sizingData) {
    this.data = _.groupBy(sizingData, 'brannockSize');
    this.sizes = orderSizes(_.keys(this.data));
  }

  get() {
    return _.flatMap(this.sizes, size => this.data[size]);
  }

  getSize(size) {
    return this.data[size] || [];
  }
}


module.exports = {
  DataStore,
  loadData,
};
