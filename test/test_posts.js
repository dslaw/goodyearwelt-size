const assert = require('assert');
const {cloneDeep} = require('lodash');
const {Comment, Listing, to_html_tree} = require('../src/posts.js');


const t1_comment = {
  kind: 't1',
  data: {
    author: 't1_author',
    body: 'Some **markdown**',
    id: 'dd01f9',
    created_utc: 100,
    parent_id: 't3_5ibtzh',
    replies: '',
  },
};

const t3_comment = {
  kind: 't3',
  data: {
    author: 't3_author',
    selftext: 'Some **markdown**',
    id: 'dd01f9',
    created_utc: 100,
    parent_id: 't3_5ibtzh',
    replies: '',
  },
};

const listing = {
  kind: 'Listing',
  data: {
    modhash: 'modhash',
    whitelist_status: 'all_ads',
    after: null,
    before: null,
    children: [], // Not actually sure how this looks when empty.
  },
};


describe('Modeled Reddit comment', () => {
  it('Should throw error for unsupported comment kind', () => {
    const invalid = {kind: 't2', data: {}};
    assert.throws(
      () => {
        new Comment(invalid);
      }
    );
  });

  it('Should handle a t1 comment', () => {
    const comment = new Comment(t1_comment);

    assert.strictEqual(comment.replies, null);
    assert.strictEqual(comment.author, 't1_author');
    assert.strictEqual(comment.body, 'Some **markdown**');
    assert.strictEqual(comment.created_utc, 100);
    assert.strictEqual(comment.id, 'dd01f9');
    assert.strictEqual(comment.kind, 't1');
    assert.strictEqual(comment.parent_id, 't3_5ibtzh');
  });

  it('Should handle a t3 comment', () => {
    const comment = new Comment(t3_comment);

    assert.strictEqual(comment.replies, null);
    assert.strictEqual(comment.author, 't3_author');
    assert.strictEqual(comment.body, 'Some **markdown**');
    assert.strictEqual(comment.created_utc, 100);
    assert.strictEqual(comment.id, 'dd01f9');
    assert.strictEqual(comment.kind, 't3');
    assert.strictEqual(comment.parent_id, 't3_5ibtzh');
  });

  it('Should create a listing of replies', () => {
    let comment_obj = cloneDeep(t1_comment);
    comment_obj.data.replies = listing;
    const comment = new Comment(comment_obj);

    assert.strictEqual(comment.replies.kind, 'Listing');
  });
});

describe('Modeled Reddit listing', () => {
  const assert_empty_array = (arr) => {
    assert.ok(arr instanceof Array && arr.length == 0);
  };

  it('Should throw an error for non Listing', () => {
    assert.throws(
      () => {
        new Listing(t1_comment);
      }
    );
  });

  it('Should create a listing', () => {
    const lst = new Listing(listing);

    assert.strictEqual(lst.kind, 'Listing');
    assert_empty_array(lst.children);
    assert.strictEqual(lst.modhash, 'modhash');
  });

  it('Should create array of comments', () => {
    let listing_obj = cloneDeep(listing);
    listing_obj.data.children = [t1_comment];
    const lst = new Listing(listing_obj);

    assert.ok(lst.children instanceof Array);
    assert.equal(lst.children.length, 1);
  });
});

describe('Markdown to HTML', () => {
  const mock_post = {
    'body': '# First\nParagraph'
  };

  it('Should convert markdown snippet', () => {
    const ast = to_html_tree(mock_post);

    assert.equal(ast.childNodes.length, 3);
    const [h1, newline, p] = ast.childNodes;
    assert.equal(h1.nodeName, 'h1');
    assert.equal(newline.nodeName, '#text');
    assert.equal(p.nodeName, 'p');
  });
});
