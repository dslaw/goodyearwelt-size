const { sortBy } = require('lodash');
const { BrannockSize } = require('./posts.js');


const formatBrannockSize = function(brannockSize) {
  return brannockSize.toString();
};

const formatTagSize = function(size, width) {
  const widthText = width || '';
  return `${size}${widthText}`;
};

const makeCommentUrl = function(threadUrl, id) {
  const url = threadUrl.endsWith('/')
    ? threadUrl
    : threadUrl.slice(0, -1);
  return url + id;
};

const formatIntl = function(intl) {
  return intl || '&mdash;';
};

const withDisplayValues = function(sizeRecord) {
  const bs = formatBrannockSize(sizeRecord.brannockSize);
  const ts = formatTagSize(sizeRecord.size, sizeRecord.width);
  const commentUrl = makeCommentUrl(sizeRecord.threadUrl, sizeRecord.id);
  const intl = formatIntl(sizeRecord.intl);

  return {
    ...sizeRecord,
    brannockSize: bs,
    tagSize: ts,
    commentUrl,
    intl,
  };
};

const sortSizeRecords = function(sizeRecords) {
  return sortBy(sizeRecords, [
    r => BrannockSize.fromString(r.brannockSize).size,
    r => BrannockSize.fromString(r.brannockSize).width,
    r => r.mlast.toLowerCase(),
  ]);
};

module.exports = {
  formatBrannockSize,
  formatIntl,
  formatTagSize,
  makeCommentUrl,
  sortSizeRecords,
  withDisplayValues,
};
