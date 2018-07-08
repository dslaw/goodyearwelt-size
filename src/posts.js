const _ = require('lodash');


const SIZE_PATTERN = /([0-9]{1,2}(\.5)?)/i;
const WIDTH_PATTERN = /Narrow|Wide|[A-Z]{1,3}/i;
const COMMENT_PATTERN = new RegExp(`(${SIZE_PATTERN.source}\\s*(${WIDTH_PATTERN.source}))`, 'i');

const WIDTH_ADJECTIVES = new Set([ 'NARROW', 'WIDE' ]);


class Listing {
  constructor(object) {
    if (object.kind !== 'Listing') {
      throw new Error(`Expected 'Listing', got ${object.kind} instead`);
    }

    // eslint-disable-next-line no-use-before-define
    this.children = object.data.children.map(child => new Comment(child));
    this.kind = object.kind;
    this.modhash = object.data.modhash;
  }
}

class Comment {
  constructor(object) {
    if (object.kind !== 't1' && object.kind !== 't3') {
      throw new Error(`Expected 't1' or 't3', got ${object.kind} instead`);
    }

    if (object.data.replies) {
      this.replies = new Listing(object.data.replies);
    } else {
      this.replies = null;
    }

    this.author = object.data.author;
    // t3 posts use `selftext`, while t3 uses `body` for
    // markdown and `body_html` for html..
    this.body = object.data.selftext || object.data.body || null;
    this.createdUtc = object.data.created_utc;
    this.id = object.data.id;
    this.kind = object.kind;
    this.parentId = object.data.parent_id || null;
    this.subreddit = object.data.subreddit;
    this.url = object.data.url;
  }
}

class BrannockSize {
  constructor(size, width) {
    this.size = parseFloat(size);
    this.width = width.toUpperCase();
  }

  toString() {
    if (WIDTH_ADJECTIVES.has(this.width)) {
      // Width is a word rather than a Brannock width,
      // so a space should be inserted between the numeric
      // size and the width, and be formatted nicely.
      return `${this.size} ${_.capitalize(this.width)}`;
    }

    return `${this.size}${this.width}`;
  }

  /**
   * Instantiate from a string giving a Brannock size.
   * @param {string} string - Brannock size as a string.
   * @return {BrannockSize} size - Modeled Brannock size.
   */
  static fromString(string) {
    const inputString = string.trim();
    const [ match, , ] = SIZE_PATTERN.exec(inputString);
    const width = inputString.replace(match, '').trim();
    return new this(match, width);
  }

  /**
   * Instantiate from a Reddit comment containing a size.
   * @param {Comment} comment - Comment specifying a Brannock size.
   * @param {BrannockSize} size - Modeled Brannock size.
   */
  static fromComment(comment) {
    const md = comment.body;
    if (_.isNil(md)) {
      throw new Error();
    }

    const match = COMMENT_PATTERN.exec(md);
    if (_.isNil(match)) {
      throw new Error();
    }

    const [ matchVal, , ] = match;
    return this.fromString(matchVal);
  }
}

const splitThread = function(rawThread) {
  const [ opListing, mainThread ] = rawThread.map(obj => new Listing(obj));
  const op = _.first(opListing.children);
  const comments = mainThread.children;
  return { op, comments };
};

// Extract each size thread from the raw thread data.
const getSizeThreads = function(op, comments) {
  const threadAuthor = op.author;

  // Top level comments (with replies) in the thread.
  // Each top level comment should start a subthread per
  // Brannock size.
  return comments
    .filter(comment => comment.author === threadAuthor)
    .filter(comment => !_.isNil(comment.replies));
};


module.exports = {
  BrannockSize,
  Comment,
  Listing,
  getSizeThreads,
  splitThread,
};
