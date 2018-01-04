const assert = require('assert');
const io = require('../src/io.js');


describe('Read from filesystem', () => {
  it('Should get a compiled HTML template', () => {
    const fn = io.get_template('./test/data/snippet.html');
    assert.ok(fn instanceof Function)
  });
});
