const assert = require('assert');
const display = require('../src/display.js');
const { BrannockSize } = require('../src/posts.js');


describe('Display formatting', () => {
  it('Should format a Brannock size', () => {
    const bs = new BrannockSize(8.5, 'WIDE');
    const expected = '8.5 Wide';

    const out = display.formatBrannockSize(bs);
    assert.strictEqual(out, expected);
  });

  it('Should format a manufacturer size with width', () => {
    const size = 10.5;
    const width = 'D';
    const expected = '10.5D';

    const out = display.formatTagSize(size, width);
    assert.strictEqual(out, expected);
  });

  it('Should format a manufacturer size without width', () => {
    const size = 10.5;
    const width = null;
    const expected = '10.5';

    const out = display.formatTagSize(size, width);
    assert.strictEqual(out, expected);
  });

  it('Should format a threads url', () => {
    const threadUrl = 'https://reddit.com/r/threadId/comments/';
    const commentId = 'foo';
    const expected = 'https://reddit.com/r/threadId/comments/foo';

    const out = display.makeCommentUrl(threadUrl, commentId);
    assert.strictEqual(out, expected);
  });

  it('Should format intl when present', () => {
    const intl = 'EU';
    const expected = intl;

    const out = display.formatIntl(intl);
    assert.strictEqual(out, expected);
  });

  it('Should format intl when missing', () => {
    const intl = null;
    const expected = '&mdash;';

    const out = display.formatIntl(intl);
    assert.strictEqual(out, expected);
  });
});

describe('Display ordering', () => {
  it('Should sort size records', () => {
    const displaySizeRecords = [
      { 'brannockSize': '10D', 'mlast': 'Wolverine' },
      { 'brannockSize': '10E', 'mlast': 'Wolverine' },
      { 'brannockSize': '10D', 'mlast': 'wolverine' },
      { 'brannockSize': '10D', 'mlast': 'Alden' },
      { 'brannockSize': '9C', 'mlast': 'Wolverine' },
    ];
    const expected = [
      { 'brannockSize': '9C', 'mlast': 'Wolverine' },
      { 'brannockSize': '10D', 'mlast': 'Alden' },
      { 'brannockSize': '10D', 'mlast': 'Wolverine' },
      { 'brannockSize': '10D', 'mlast': 'wolverine' },
      { 'brannockSize': '10E', 'mlast': 'Wolverine' },
    ];

    const out = display.sortSizeRecords(displaySizeRecords);
    assert.deepStrictEqual(out, expected);
  });
});
