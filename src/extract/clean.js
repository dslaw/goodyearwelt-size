const _ = require('lodash');
const removeMd = require('remove-markdown');


const SIZE_PAIR_DELIM = ':';


/**
 * Normalize markdown from a sizing comment.
 * @param {string} md - The markdown snippet to normalize.
 * @return {Array[string]} normalized - Normalized lines.
 */
const normalize_md = function(md) {
  let text = _.unescape(md);
  let lines = removeMd(text).split('\n');
  return _(lines)
    .filter()
    // Strip lead symbol from unordered list items that
    // don't have a space between the symbol and the text.
    // These lines won't be caught by `removeMd` as they
    // are improperly formatted, but are not a rare sight
    // on Reddit.
    .map((s) => s.replace(/^[-+*>]/g, ''))
    .map((s) => s.trim())
    .value();
};


/**
 * Split line into shoe-last and sizing-text components.
 * @param {string} line - The line to split.
 * @return {[string, string]} pair - The shoe-last and sizing-text
 * pair. Null if the line does not contain a sizing pair.
 */
const split_sizing_pair = function(line) {
  let parts = _.map(line.split(SIZE_PAIR_DELIM),  _.trim);
  if (parts.length != 2) {
    return null;
  }

  // Check if line is for notes, rather than specific size information.
  let [lhs, ,] = parts;
  if (lhs.toLowerCase().includes('note')) {
    console.debug(`Encountered 'note' in manufacturer last '${line}'`);
    return null;
  }

  return parts;
};


module.exports = {
  normalize_md,
  split_sizing_pair,
};
