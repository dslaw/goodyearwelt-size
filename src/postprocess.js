const _ = require('lodash');
const { postMatch, precedesMatch } = require('./extract/match.js');


const PATTERNS = {
  ampersand: /&(amp;){1,2}/ig,
  parens: /\(.*\)/g,
  unknownLast: /unknown last\s*$/i,
  trailingLast: /last\s*$/i,
  spaces: /\s+/g,
};


// Run matching for sizing data on user-supplied text.
const getMatches = function(text) {
  const post = postMatch(text);
  const pre = precedesMatch(text);
  return [ post, pre ];
};

// Validate extracted sizing data from user text.
const validateExtracted = function(post, pre) {
  // 'post' is the first option, as it checks for the correct format.
  // 'precedes' is used as a fallback iff it extracts _more_ data
  // than 'post'. Specifically, the intl convention, which is where
  // the functions differ in implementation.

  // If the sizes don't match, something has gone wrong.
  if (post.size !== pre.size) {
    console.error(
      'Expected sizes to match, ',
      `instead got '${post.size}' and '${pre.size}'`,
    );
    return { size: null, width: null, intl: null };
  }

  // If `precedes` has more information, use it.
  let sizing = post;
  if (_.isNil(post.intl) && !_.isNil(pre.intl)) {
    console.debug(
      'Intl found using precedesMatch but not postMatch, ',
      'falling back to precedesMatch',
    );
    sizing = pre;
  }

  // Check that size is actually a number.
  // Replace NaN with null if it occurs so that the caller
  // only needs to check for null.
  // Given the regex used, `size` should always be numeric
  // or missing.
  const size = parseFloat(sizing.size) || null;

  // `sizing` points to `post` or `pre`, so it shouldn't be mutated.
  return { ...sizing, size };
};

// Determine if a shoe size is using the continental European convention.
const isEU = function(size) {
  // 33.5 is the smallest listed size in the Adults' shoe sizes
  // table given here: https://en.wikipedia.org/wiki/Shoe_size#Shoe_sizing
  return size >= 33.5;
};

// Use size to validate `intl`.
// This is primarily to determine a value in the event that
// `intl` is null.
//
// Size alone isn't enough to disambiguate US/UK, so this
// is limited to EU sizes.
const reconcileIntl = function(sizing) {
  const { intl, size } = sizing;

  if (isEU(size) && intl !== 'EU') {
    console.debug(`Expected 'EU', instead got ${intl} for ${size}`);
    return 'EU';
  }

  if (!isEU(size) && intl === 'EU') {
    console.debug(`Expected 'US' or 'UK', instead got '${intl}' for ${size}`);
    return null;
  }

  return intl;
};

// Clean up the manufacturer last text.
const cleanManufacturerLast = function(mlast) {
  const replace = function(string, [ pattern, replacement ]) {
    return string.replace(pattern, replacement);
  };

  const patternReplacementsOrdered = [
    [ PATTERNS.ampersand, '&' ],
    [ PATTERNS.parens, '' ],
    [ PATTERNS.unknownLast, '' ],
    [ PATTERNS.trailingLast, '' ],
    [ PATTERNS.spaces, ' ' ],
  ];

  const cleaned = patternReplacementsOrdered.reduce(replace, mlast);
  return cleaned.trim();
};

// Extract sizing data from a size record's text, and clean
// the manufacturer last text.
const processSizeRecord = function(sizeRecord) {
  if (_.isNil(sizeRecord.mlast) || _.isNil(sizeRecord.text)) {
    return null;
  }

  const [ post, pre ] = getMatches(sizeRecord.text);
  const sizing = validateExtracted(post, pre);
  sizing.intl = reconcileIntl(sizing);

  const mlast = cleanManufacturerLast(sizeRecord.mlast);

  if (_.isNil(sizing.size)) {
    console.error(`Failed to extract a size from ${sizeRecord.text}`);
    return null;
  }
  if (!mlast) {
    console.error(`Cleaning resulted in an empty string for ${sizeRecord.mlast}`);
    return null;
  }

  return { ...sizeRecord, ...sizing, mlast };
};


module.exports = {
  processSizeRecord,
};
