const _ = require('lodash');
const {normalizeMd, splitSizingPair} = require('./extract/normalize.js');
const {BrannockSize} = require('./posts.js');


/**
 * Get the sizing pairs from a comment.
 * @param {Array[string]} lines - Comment as normalized markdown.
 * @return {Array[[string, string]]} pairs - Sizing pairs.
 */
const parse_comment = function(lines) {
  let pairs = _(lines)
    .map(splitSizingPair)
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
    .map(normalizeMd)
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
    // TODO: replace all with just `flatMap`
    .map(unnest_subthread)
    .flatten()
    .compact()
    .value();
};


module.exports = {
  unnest_subthreads: unnest_subthreads,
};
