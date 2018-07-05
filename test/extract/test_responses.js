const assert = require('assert');
const rewire = require('rewire');
const responses = rewire('../../src/extract/responses.js');
const { BrannockSize } = require('../../src/posts.js');


const makeSizeThread = responses.__get__('makeSizeThread');
const pairsToSizeRecords = responses.__get__('pairsToSizeRecords');
const sizeResponsesToRecords = responses.__get__('sizeResponsesToRecords');
const extractSizeRecords = responses.__get__('extractSizeRecords');


describe('Make a Size Thread', () => {
  it('Should create a SizeThread object', () => {
    const comment = {
      body: '10D',
      id: 'id',
      replies: {
        'children': ['not', 'actual', 'comments'],
      },
    };

    const expectedNumReplies = 3;
    const expectedId = 'id';
    const expectedBrannockSize = '10D';

    const out = makeSizeThread(comment);
    assert.strictEqual(out.replies.length, expectedNumReplies);
    assert.strictEqual(out.id, expectedId);
    assert.strictEqual(out.brannockSize.toString(), expectedBrannockSize);
  });

  it('Should create a SizeThread with no replies', () => {
    const comment = {
      body: '10D',
      id: 'id',
    };

    const expectedNumReplies = 0;

    const out = makeSizeThread(comment);
    assert.ok(out.replies instanceof Array);
    assert.strictEqual(out.replies.length, expectedNumReplies);
  });
});

describe('Convert sizing information pairs to objects', () => {
  it('Should convert sizing information pairs to objects', () => {
    const sizeResponse = {
      id: 'id',
      body: 'body',
    };
    const pairs = [
      ['Red Wing', '10D'],
      ['Alden', '9.5D'],
      ['Another', '10D'],
    ];

    const expected = [
      { id: 'id', mlast: 'Red Wing', text: '10D' },
      { id: 'id', mlast: 'Alden', text: '9.5D' },
      { id: 'id', mlast: 'Another', text: '10D' },
    ];
    const out = pairsToSizeRecords(sizeResponse, pairs);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Get size records', () => {
  it('Should get response information', () => {
    const replies = [
      { id: 1, body: '* First: 10D\n* Second: 9D\n' },
      { id: 2, body: '* Third: 10D\n* Fourth: 9D\n' },
      { id: 3, body: '' },
    ];
    const expected = [
      { id: 1, mlast: 'First', text: '10D' },
      { id: 1, mlast: 'Second', text: '9D' },
      { id: 2, mlast: 'Third', text: '10D' },
      { id: 2, mlast: 'Fourth', text: '9D' },
    ];

    const out = sizeResponsesToRecords(replies);
    assert.deepStrictEqual(out, expected);
  });

  it('Should handle no response information', () => {
    const replies = [
      { id: 1, body: 'Just text' },
      { id: 2, body: '' },
    ];
    const expected = [];

    const out = sizeResponsesToRecords(replies);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Get all size records from first-level comment', () => {
  it('Should get response information with metadata', () => {
    const comment = {
      id: 'id',
      body: '10D',
      replies: {
        children: [
          { id: 1, body: '* First: 10D\n* Second: 9D\n' },
          { id: 2, body: '* Third: 10D\n* Fourth: 9D\n' },
        ],
      },
    };
    const bs = new BrannockSize('10', 'D');

    const expected = [
      { parentId: 'id', brannockSize: bs, id: 1, mlast: 'First', text: '10D' },
      { parentId: 'id', brannockSize: bs, id: 1, mlast: 'Second', text: '9D' },
      { parentId: 'id', brannockSize: bs, id: 2, mlast: 'Third', text: '10D' },
      { parentId: 'id', brannockSize: bs, id: 2, mlast: 'Fourth', text: '9D' },
    ];

    const out = extractSizeRecords(comment);
    assert.deepStrictEqual(out, expected);
  });
});
