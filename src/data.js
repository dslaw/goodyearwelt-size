const _ = require('lodash');
const fs = require('fs');
const {Listing} = require('./posts.js');


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


module.exports = {
  read_subthreads: read_subthreads,
};
