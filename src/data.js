const _ = require('lodash');
const fs = require('fs');
const {unnest_subthreads} = require('./parse.js');
const {Listing} = require('./posts.js');
const {is_EU, sticky_match} = require('./sizes.js');


const DEFAULT_INTL = 'US';
const DEFAULT_WIDTH = 'D';


/**
 * Read the Reddit thread from disk.
 * @param {string} filename - The name of the file to read.
 * @return {Listing, Listing} {op, main_thread} - Thread data, `op`
 * giving the original post and `main_thread` giving the response.
 */
const read_thread_data = function(filename) {
  let data = JSON.parse(
    fs.readFileSync(filename)
    .toString()
  );

  let [op, main_thread] = _.map(data, listing => new Listing(listing));
  return {op, main_thread};
};

/**
 * Read the Reddit thread from disk, extracting each subthread,
 * where a subthread is a top-level comment with it's own replies.
 * @param {string} filename - The name of the file to read.
 * @return {Array[Listing]} subthreads
 */
const read_subthreads = function(filename) {
  let {op, main_thread} = read_thread_data(filename);
  let comments = main_thread.children;
  let thread_author = _.first(op.children).author; 

  // Top level comments (with replies) in the thread.
  // Each top level comment should start a subthread per
  // Brannock size.
  let subthreads = _(comments)
    .filter(comment => comment.author === thread_author)
    .filter(comment => !_.isNil(comment.replies))
    .value();
  return subthreads;
};

/**
 * Derive and coerce data, and set defaults.
 * @param  {Object} obj - A parsed sizing (line) comment.
 * @return {Object} data - A sizing (line) comment with derived values.
 */
const make_ready = function(obj) {
  let {size, intl, width} = sticky_match(obj.text);
  size = parseFloat(size);

  // Try to guess international convention from size.
  // Primarily to override the default value in the case
  // when `intl` is null, 
  if (is_EU(size)) {
    if (intl !== 'EU') {
      console.error(`Expected 'EU', got '${intl}' from '${obj.text}'`);
    }
    intl = 'EU';
  } else {
    if (intl === 'EU') {
      console.error(`Expected 'US' or 'UK', got '${intl}' from '${obj.text}'`);
      return null;
    }
  }

  if (_.some([size, intl, width], _.isNil)) {
    console.debug(`Encountered one or more missing values from ${obj.text}`);
  }

  return _.merge({}, obj, {
    size: size,
    intl: intl || DEFAULT_INTL,
    width: width || DEFAULT_WIDTH,
  });
};

/**
 * Load data from disk.
 * @param {string} filename - The name of the file to read.
 * @return {Array[Object]} data
 */
const load_data = _.memoize((filename) => {
  let subthreads = read_subthreads(filename);
  let flat = unnest_subthreads(subthreads);
  return _(flat)
    .filter(obj => !_.isNil(obj.text))
    .map(make_ready)
    .filter()
    .value();
});


module.exports = {
  load_data: load_data,
};
