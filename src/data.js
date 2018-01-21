const _ = require('lodash');
const fs = require('fs');
const {unnest_subthreads} = require('./parse.js');
const {Listing} = require('./posts.js');
const {post_match, precedes_match} = require('./extract.js');


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
 * Determine if a shoe size is European.
 * @param {number} size - Shoe size.
 * @return {boolean}
 */
const is_EU = function(size) {
  return size >= 39;
};

/**
 * Derive and coerce data, and set defaults.
 * @param  {Object} obj - A parsed sizing (line) comment.
 * @return {Object} data - A sizing (line) comment with derived values.
 */
const make_ready = function(obj) {
  // 'post' is the first option, as it checks for the correct format.
  // 'precedes' is used as a fallback iff it extracts _more_ data
  // than 'post'. Specifically, the intl convention, which is where
  // the functions differ in implementation.
  let post = post_match(obj.text);
  let pre = precedes_match(obj.text);

  if (post.size !== pre.size) {
    console.error(
      `Expected sizes to match, ` +
      `instead got '${post.text}' and '${pre.text}'`
    );
    return null;
  }

  let sizing = post;
  if (_.isNil(post.intl) && !_.isNil(pre.intl)) {
    console.debug(
      `Intl found using precedes_match but not post_match, ` +
      `falling back to precedes_match`
    );
    sizing = pre;
  }

  if (_.every(sizing, _.isNil)) {
    console.error(`Failed to extract any information from '${obj.text}'`);
    return null;
  }

  let size = parseFloat(sizing.size);
  if (_.isNaN(size)) {
    // Should not be possible given the regex used.
    console.error(`Extracted unparsable size '${sizing.size}'`);
    return null;
  }

  // Try to guess international convention from size.
  // Primarily to override the default value in the case
  // when `intl` is null, 
  if (is_EU(size)) {
    if (sizing.intl !== 'EU') {
      console.error(`Expected 'EU', got '${sizing.intl}' from '${obj.text}'`);
    }
    sizing.intl = 'EU';
  } else {
    if (sizing.intl === 'EU') {
      console.error(
        `Expected 'US' or 'UK', got '${sizing.intl}' ` +
        `from '${obj.text}'
      `);
      return null;
    }
  }

  if (_.some(sizing, _.isNil)) {
    console.debug(`Encountered one or more missing values from ${obj.text}`);
  }

  return _.merge({}, obj, {
    size: size,
    intl: sizing.intl || DEFAULT_INTL,
    width: sizing.width || DEFAULT_WIDTH,
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
