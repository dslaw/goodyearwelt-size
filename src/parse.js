const _ = require('lodash');
const removeMd = require('remove-markdown');
const {BrannockSize} = require('./posts.js');


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

/**
 * Get the sizing pairs from a comment.
 * @param {Array[string]} lines - Comment as normalized markdown.
 * @return {Array[[string, string]]} pairs - Sizing pairs.
 */
const parse_comment = function(lines) {
  let pairs = _(lines)
    .map(split_sizing_pair)
    .compact()
    .value();
  return pairs;
};

/**
 * Get sizing pairs from each comment.
 * @param {Array[Comment]} comments - Comments.
 * @return {Array[Array[[string, string]]]} pairs - Sizing pairs by comment.
 */
const parse_comments = function(comments) {
  return _(comments)
    .map(comment => comment.body)
    .compact()
    .map(normalize_md)
    .map(parse_comment)
    .value();
};

/**
 * Unnest a subthread.
 * @param {Listing} subthread_comment - A comment starting the subthread.
 * @return {Array[Object]} flattened_replies - The subthread responses
 * (second-level comments only), where each Object is a line giving
 * sizing information.
 */
const unnest_subthread = function(subthread_comment) {
  let replies = _.get(subthread_comment, 'replies.children');
  if (_.isNil(replies)) {
    return [];
  }

  const subthread_metadata = {
    brannock_size: BrannockSize.from_comment(subthread_comment).toString(),
    brannock_size_comment_id: subthread_comment.id,
  };
  const merge_with = (obj) => _.merge({}, subthread_metadata, obj);

  let parsed_comments = parse_comments(replies);
  let reply_ids = _.map(replies, reply => _.get(reply, 'id'));
  let zipped = _.zip(reply_ids, parsed_comments);

  // Associate each comment's id with constituent sizing pairs
  // and flatten.
  let flattened_replies = _(zipped)
    .flatMap(([id, pairs]) => {
      return _.map(pairs, ([mlast, text]) => ({
        comment_id: id,
        manufacturer_last: mlast,
        text: text,
      }));
    });

  // Add in subthread metadata to fully denormalize.
  return flattened_replies.map(merge_with).value();
};

/**
 * Unnest multiple subthreads.
 * @param {Array[Listing]} - Comments, each starting a subthread.
 * @return {Array[Object]} flattened_replies - The responses
 * (second-level comments only), where each Object is a line giving
 * sizing information.
 */
const unnest_subthreads = function(subthreads) {
  return _(subthreads)
    .map(unnest_subthread)
    .flatten()
    .compact()
    .value();
};


module.exports = {
  unnest_subthreads: unnest_subthreads,
};
