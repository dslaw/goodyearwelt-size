const _ = require('lodash');
const removeMd = require('remove-markdown');


const SIZE_PAIR_DELIM = ':';


/**
 * Normalize markdown from a sizing comment.
 * @param {string} md - The markdown snippet to normalize.
 * @return {Array[string]} normalized - Normalized lines.
 */
const normalizeMd = function(md) {
  const text = _.unescape(md);
  const stripped = removeMd(text);
  return text
    .split('\n')
    .filter(line => line.length)
    // Strip lead symbol from unordered list items that
    // don't have a space between the symbol and the text.
    // These lines won't be caught by `removeMd` as they
    // are improperly formatted, but are not a rare sight
    // on Reddit.
    .map(line => line.replace(/^[-+*>]/g, ''))
    .map(line => line.trim());
};


/**
 * Split line into shoe-last and sizing-text components.
 * @param {string} line - The line to split.
 * @return {[string, string]} pair - The shoe-last and sizing-text
 * pair. Null if the line does not contain a sizing pair.
 */
const splitSizingPair = function(line) {
  const parts = line.split(SIZE_PAIR_DELIM).map(_.trim);
  if (parts.length !== 2) {
    return null;
  }

  // Check if line is for notes, rather than specific size information.
  const [ lhs, , ] = parts;
  if (lhs.toLowerCase().includes('note')) {
    console.debug(`Encountered 'note' in manufacturer last '${line}'`);
    return null;
  }

  return parts;
};


module.exports = {
  normalizeMd,
  splitSizingPair,
};
