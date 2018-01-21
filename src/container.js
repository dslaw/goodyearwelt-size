const _ = require('lodash');
const fs = require('fs');
const handlebars = require('handlebars');
const {BrannockSize} = require('./posts.js');


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

/**
 * Get a compiled handlebars HTML template.
 * @param {string} filename - Name of HTML template.
 * @return {function} compiled - Compiled handlebars template.
 */
const get_template = _.memoize((filename) => {
  let template = fs.readFileSync(filename, 'utf-8').toString();
  return handlebars.compile(template);
});

class SizingData {
  constructor(sizing) {
    this.data = _.groupBy(sizing, 'brannock_size');
    this.sizes = get_sizes(this.data);
  }

  render_sizes(filename) {
    let renderer = get_template(filename);
    return renderer(this);
  }

  render_data(filename, size) {
    let renderer = get_template(filename);
    let subset = this.data[size] || [];
    return renderer({data: subset});
  }
}


module.exports = {
  SizingData: SizingData,
};
