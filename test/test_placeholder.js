const assert = require('assert');
const { exists } = require('../src/placeholder');


describe('Placeholder', () => {
  it('Should pass', () => {
    assert.ok(exists);
  });
});
