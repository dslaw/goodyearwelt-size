const _ = require("lodash");


const mfilter = (collection, predicate) => {
  return _.filter(collection, item => {
    return _.isNil(item) ? false : predicate(item);
  });
};

const mmap = (collection, fn) => {
  return _.map(collection, item => {
    return _.isNil(item) ? item : fn(item);
  });
};


module.exports = {
  mfilter: mfilter,
  mmap: mmap,
}
