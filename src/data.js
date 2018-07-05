const _ = require('lodash');
const {post_match, precedes_match} = require('./match.js');


const DEFAULT_INTL = 'US';
const DEFAULT_WIDTH = 'D';

const PATTERNS = {
  ampersand: /&(amp;){1,2}/ig,
  parens: /\(.*\)/g,
  unknown_last: /unknown last\s*$/i,
  trailing_last: /last\s*$/i,
  spaces: /\s+/g,
};


/**
 * Determine if a shoe size is continental European.
 * @param {number} size - Shoe size.
 * @return {boolean}
 */
const is_EU = function(size) {
  // 33.5 is the smallest listed size in the Adults' shoe sizes
  // table given here: https://en.wikipedia.org/wiki/Shoe_size#Shoe_sizing
  return size >= 33.5;
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
 * Clean the manufacturer last text.
 * @param  {Object} obj - A parsed sizing (line) comment.
 * @return {Object} data - A sizing (line) comment.
 */
const clean_manufacturer_last = function(obj) {
  let mlast = obj.manufacturer_last;

  const replaced = mlast.replace(PATTERNS.ampersand, '&');
  const removed = _.reduce([
      PATTERNS.parens,
      PATTERNS.unknown_last,
      PATTERNS.trailing_last,
    ],
    (string, pattern) => string.replace(pattern, ''),
    replaced
  );

  const cleaned = removed
    .replace(PATTERNS.spaces, ' ')
    .trim();

  if (!cleaned) {
    console.debug(`Cleaning resulted in empty string for ${mlast}`);
    return null;
  }

  return _.merge({}, obj, {manufacturer_last: cleaned});
};

/**
 * Apply processing logic to each reply.
 * A reply is a line giving sizing information.
 * @param {Array[Object]} replies - Thread replies.
 * @return {Array[Object]} processed
 */
const process_replies = function(replies) {
  return _(replies)
    .filter(obj => !_.isNil(obj.text))
    .map(make_ready)
    .filter()
    .map(clean_manufacturer_last)
    .filter()
    .value();
};


module.exports = {
  process_replies: process_replies,
};
