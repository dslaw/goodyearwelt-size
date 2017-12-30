const _ = require('lodash');
const markdown = require('markdown').markdown;
const parse5 = require('parse5');


class Listing {
  constructor(object) {
    if (object.kind != 'Listing') {
      throw new Error(`Expected 'Listing', got ${object.kind} instead`);
    }

    this.children = _.map(object.data.children, child => {
      return new Comment(child);
    });
    this.kind = object.kind;
    this.modhash = object.data.modhash;
  }
}

class Comment {
  constructor(object) {
    if (object.kind != 't1' && object.kind != 't3') {
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
    this.created_utc = object.data.created_utc;
    this.id = object.data.id;
    this.kind = object.kind;
    this.parent_id = object.data.parent_id || null;
  }
}

const to_html_tree = (comment) => {
  // NB: The HTML representation of a comment (`body_html`) contains HTML
  //     entities rather than characters, which parse5 doesn't handle.
  //     So the markdown representation (`body`) is used, instead.
  let md = comment.body;
  if (md === undefined) {
    throw new Error;
  }

  let html = markdown.toHTML(md);
  return parse5.parseFragment(html);
}


module.exports = {
  Listing: Listing,
  Comment: Comment,
  to_html_tree: to_html_tree,
};
