const assert = require('assert');
const {every, map} = require('lodash');
const rewire = require('rewire');
const parse = rewire('../src/parse.js');


// Private functions.
const parse_comment = parse.__get__('parse_comment');
const parse_comments = parse.__get__('parse_comments');
const unnest_subthread = parse.__get__('unnest_subthread');
const unnest_subthreads = parse.__get__('unnest_subthreads');


// Helper(s).
const assert_all = function(collection, predicate) {
  let ok = every(map(collection, predicate));
  assert.ok(ok);
};


describe('Parse comment', () => {
  it('Should parse sizing pairs', () => {
    const lines = [
      'Notes: some notes.',
      'Manufacturer Last 1: 11D',
      'Manufacturer Last 2: 11D',
      'Irrelevant writing.',
    ];
    const expected = [
      ['Manufacturer Last 1', '11D'],
      ['Manufacturer Last 2', '11D'],
    ];

    const pairs = parse_comment(lines);
    assert.deepEqual(pairs, expected);
  });
});

describe('Parse comments', () => {
  it('Should parse sizing pairs', () => {
    const markdown = [
      'Notes: some notes.',
      '',
      '* **Manufacturer Last 1**: 11D',
      '* **Manufacturer Last 2**: 11D',
      '',
      'More words.',
    ].join('\n');
    const mock_comment = {body: markdown};
    const comments = [mock_comment, mock_comment];

    const expected_pairs = [
      ['Manufacturer Last 1', '11D'],
      ['Manufacturer Last 2', '11D'],
    ];
    const expected = [expected_pairs, expected_pairs];

    const out = parse_comments(comments);
    assert.deepStrictEqual(out, expected);
  });
});

describe('Unnest subthread', () => {
  const response_comment = {
    author: 'abc',
    body: [
      '**Notes**: some notes.',
      '',
      '**Manufacturer Last 1**: 11D',
      '**Manufacturer Last 2**: 11.5D',
    ].join('\n'),
    created_utc: 100,
    id: 'response',
    replies: null,
  };
  const subthread_comment = {
    author: 'whomever',
    body: '##**Brannock:** 11D',
    created_utc: 100,
    id: 'subthread',
    replies: {
      children: [response_comment],
    },
  };

  it('Should flatten sizing responses', () => {
    const expected = [
      {
        brannock_size: '11D',
        brannock_size_comment_id: 'subthread',
        comment_id: 'response',
        manufacturer_last: 'Manufacturer Last 1',
        text: '11D',
      },
      {
        brannock_size: '11D',
        brannock_size_comment_id: 'subthread',
        comment_id: 'response',
        manufacturer_last: 'Manufacturer Last 2',
        text: '11.5D',
      },
    ];

    const out = unnest_subthread(subthread_comment);
    assert.deepStrictEqual(out, expected);
  });

  it('Should be empty for no replies', () => {
    const out = unnest_subthread({});
    assert.deepEqual(out, []);
  });

  it('Should be empty for no children', () => {
    const comment = {replies: {}};
    let out = unnest_subthread(comment);
    assert.deepEqual(out, []);
  });

  it('Should flatten sizing responses from multiple subthreads', () => {
    const subthreads = [subthread_comment, subthread_comment];
    const out = unnest_subthreads(subthreads);

    assert.ok(out instanceof Array);
    assert.strictEqual(out.length, 2 * 2);
    assert_all(out, (obj) => obj.brannock_size_comment_id === 'subthread');
  });
});
