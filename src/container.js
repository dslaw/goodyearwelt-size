const _ = require('lodash');
const io = require('./io.js');
const {process_replies, to_subthreads} = require('./data.js');
const {BrannockSize} = require('./posts.js');
const {unnest_subthreads} = require('./parse.js');


const get_template = _.memoize(io.get_template);

/**
 * Load data from disk.
 * @param {string} filename - The name of the file to read.
 * @return {Array[Object]} data
 */
const load_data = _.memoize((filename) => {
  let raw_thread = io.read_json(filename);
  let subthreads = to_subthreads(raw_thread)
  let replies = unnest_subthreads(subthreads);
  return process_replies(replies);
});

/**
 * Get available Brannock sizes.
 * @param {object} grouped - Sizing data keyed by Brannock size.
 * @return {Array[string]} - Unique, sorted Brannock sizes.
 */
const get_sizes = function(grouped) {
  let sizes = _(grouped)
    .keys()
    .map(size => BrannockSize.fromString(size))
    .sortBy(['size', 'width'])
    .map(size => size.toString())
    .value();
  // Keys are always unique so no need to explicitly call `_.uniq`.
  return sizes;
};

class SizingData {
  constructor(sizing) {
    this.data = _.groupBy(sizing, 'brannock_size');
    this.sizes = get_sizes(this.data);
  }

  static from_file(filename) {
    let data = load_data(filename);
    return new this(data);
  }

  get() {
    let ordered = _.map(this.sizes, (size) => this.data[size]);
    return _.flatten(ordered);
  }

  get_size(size) {
    return this.data[size] || [];
  }

  render_sizes(filename) {
    let renderer = get_template(filename);
    return renderer(this);
  }

  render_data(filename, size) {
    let renderer = get_template(filename);
    let subset = this.get_size(size);
    return renderer({data: subset});
  }
}


module.exports = {
  SizingData: SizingData,
};
