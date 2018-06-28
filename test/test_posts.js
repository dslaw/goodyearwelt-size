const assert = require('assert');
const { cloneDeep } = require('lodash');
const { BrannockSize, Comment, Listing } = require('../src/posts.js');


const t1Comment = {
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

const t3Comment = {
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
    const invalid = { kind: 't2', data: {} };
    assert.throws(
      () => {
        new Comment(invalid);
      }
    );
  });

  it('Should handle a t1 comment', () => {
    const comment = new Comment(t1Comment);

    assert.strictEqual(comment.replies, null);
    assert.strictEqual(comment.author, 't1_author');
    assert.strictEqual(comment.body, 'Some **markdown**');
    assert.strictEqual(comment.createdUtc, 100);
    assert.strictEqual(comment.id, 'dd01f9');
    assert.strictEqual(comment.kind, 't1');
    assert.strictEqual(comment.parentId, 't3_5ibtzh');
  });

  it('Should handle a t3 comment', () => {
    const comment = new Comment(t3Comment);

    assert.strictEqual(comment.replies, null);
    assert.strictEqual(comment.author, 't3_author');
    assert.strictEqual(comment.body, 'Some **markdown**');
    assert.strictEqual(comment.createdUtc, 100);
    assert.strictEqual(comment.id, 'dd01f9');
    assert.strictEqual(comment.kind, 't3');
    assert.strictEqual(comment.parentId, 't3_5ibtzh');
  });

  it('Should create a listing of replies', () => {
    let commentObj = cloneDeep(t1Comment);
    commentObj.data.replies = listing;
    const comment = new Comment(commentObj);

    assert.strictEqual(comment.replies.kind, 'Listing');
  });
});

describe('Modeled Reddit listing', () => {
  const assertEmptyArray = (arr) => {
    assert.ok(arr instanceof Array && arr.length === 0);
  };

  it('Should throw an error for non Listing', () => {
    assert.throws(
      () => {
        new Listing(t1Comment);
      }
    );
  });

  it('Should create a listing', () => {
    const lst = new Listing(listing);

    assert.strictEqual(lst.kind, 'Listing');
    assertEmptyArray(lst.children);
    assert.strictEqual(lst.modhash, 'modhash');
  });

  it('Should create array of comments', () => {
    let listingObj = cloneDeep(listing);
    listingObj.data.children = [t1Comment];
    const lst = new Listing(listingObj);

    assert.ok(lst.children instanceof Array);
    assert.equal(lst.children.length, 1);
  });
});

describe('Modeled Brannock size', () => {
  it('Should instantiate from string values', () => {
    const bs = new BrannockSize('8.5', 'd');
    assert.strictEqual(bs.size, 8.5);
    assert.strictEqual(bs.width, 'D');
  });

  const string_expected = [
    { string: '8D', size: 8, width: 'D' },
    { string: '8.5D', size: 8.5, width: 'D' },
    { string: '10D', size: 10, width: 'D' },
    { string: '10.5D', size: 10.5, width: 'D' },
    { string: '10.5 Narrow', size: 10.5, width: 'NARROW' },
    { string: '10.5 Wide', size: 10.5, width: 'WIDE' },
  ];

  string_expected.forEach(obj => {
    it(`Should instantiate string '${obj.string}'`, () => {
      const bs = BrannockSize.fromString(obj.string);
      assert.strictEqual(bs.size, obj.size);
      assert.strictEqual(bs.width, obj.width);
    });
  });

  const comment_expected = [
   { body: '##**Brannock:** 8.5D', id: 'id123', size: 8.5, width: 'D' },
   { body: '#8.5D', id: 'id123', size: 8.5, width: 'D' },
   { body: '#8.5 Narrow', id: 'id123', size: 8.5, width: 'NARROW' },
   { body: '#8.5 Wide', id: 'id123', size: 8.5, width: 'WIDE' },
  ];

  comment_expected.forEach(obj => {
    it(`Should instantiate from comment '${obj.body}'`, () => {
      const bs = BrannockSize.fromComment(obj);
      assert.strictEqual(bs.size, obj.size);
      assert.strictEqual(bs.width, obj.width);
    });
  });

  const brannocksize_expected = [
    { string: '8D', brannock: new BrannockSize('8', 'D') },
    { string: '8.5D', brannock: new BrannockSize('8.5', 'D') },
    { string: '10D', brannock: new BrannockSize('10', 'D') },
    { string: '10.5D', brannock: new BrannockSize('10.5', 'D') },
    { string: '10.5 Narrow', brannock: new BrannockSize('10.5', 'NARROW') },
    { string: '10.5 Wide', brannock: new BrannockSize('10.5', 'WIDE') },
  ];

  brannocksize_expected.forEach(obj => {
    it('Should cast to string', () => {
      const bs = obj.brannock;
      assert.strictEqual(bs.toString(), obj.string);
    });
  });

  brannocksize_expected.forEach(obj => {
    it('Should instantiate from the result of a string cast', () => {
      const bs = obj.brannock;
      const out = BrannockSize.fromString(bs.toString());
      assert.strictEqual(bs.size, out.size);
      assert.strictEqual(bs.width, out.width);
    });
  });
});
