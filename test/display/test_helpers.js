const assert = require('assert');
const helpers = require('../../src/display/helpers.js');
const { BrannockSize } = require('../../src/posts.js');


describe('Display formatting', () => {
  it('Should format a Brannock size', () => {
    const bs = new BrannockSize(8.5, 'WIDE');
    const expected = '8.5 Wide';

    const out = helpers.formatBrannockSize(bs);
    assert.strictEqual(out, expected);
  });

  it('Should format a manufacturer size with width', () => {
    const size = 10.5;
    const width = 'D';
    const expected = '10.5D';

    const out = helpers.formatManufacturerSize(size, width);
    assert.strictEqual(out, expected);
  });

  it('Should format a manufacturer size without width', () => {
    const size = 10.5;
    const width = null;
    const expected = '10.5';

    const out = helpers.formatManufacturerSize(size, width);
    assert.strictEqual(out, expected);
  });

  it('Should format a threads url', () => {
    const threadUrl = 'https://reddit.com/r/threadId/comments/';
    const commentId = 'foo';
    const expected = 'https://reddit.com/r/threadId/comments/foo';

    const out = helpers.formatThreadUrl(threadUrl, commentId);
    assert.strictEqual(out, expected);
  });
});
