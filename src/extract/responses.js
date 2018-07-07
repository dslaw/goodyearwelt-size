const _ = require('lodash');
const { BrannockSize } = require('../posts.js');
const { getSizePairs } = require('./normalize.js');

// Naming:
//   * SizeThread - top level comment by author with just brannock size as body
//   * SizeResponse - comment responding to a SizeThread. preferably with sizing
//     information of respondent.
//   * SizeRecord - Sizing information of respondent for a single shoe/boot.

// Get relevant size thread metadata and reponses.
const makeSizeThread = function(comment) {
  const bs = BrannockSize.fromComment(comment);
  const replies = _.get(comment, 'replies.children') || []; 
  return {
    id: comment.id,
    brannockSize: bs,
    replies,
  };
};

// Convert the split line of sizing information to a size record,
// with size response metadata.
const pairsToSizeRecords = function(sizeResponse, pairs) {
  const { id } = sizeResponse;
  return pairs.map(([mlast, text]) => ({ id, mlast, text }));
};

const notNil = _.negate(_.isNil);

// Get each size record, flattened, from the size responses.
const sizeResponsesToRecords = function(sizeResponses) {
  // NB: Implicitly, only the first level of replies to the
  //     size thread are looked at, as that is how respondents
  //     are meant to reply.
  const allPairs = sizeResponses
    .map(sizeResponse => sizeResponse.body)
    .filter(notNil)
    .map(getSizePairs);
  const allSizeRecords = _.zipWith(sizeResponses, allPairs, pairsToSizeRecords);
  return _.flatten(allSizeRecords);
};

// Get size records, with metadata, from a size thread.
const extractSizeRecords = function(comment) {
  // No responses => empty list.
  const sizeThread = makeSizeThread(comment);
  const sizeResponses = sizeThread.replies;
  const sizeRecords = sizeResponsesToRecords(sizeResponses);

  // Attach metadata from the size thread to each record.
  return sizeRecords.map(sizeRecord => ({
    ...sizeRecord,
    // NB: Always refers to the size thread id, not the actual
    //     parent comment. In this case, they happen to be the
    //     same as only the first level of replies are looked at.
    parentId: sizeThread.id,
    brannockSize: sizeThread.brannockSize,
  }));
};


module.exports = {
  extractSizeRecords,
  notNil,
};
