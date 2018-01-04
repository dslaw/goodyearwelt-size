const _ = require('lodash');
const fs = require('fs');
const handlebars = require('handlebars');


/**
 * Split a defined Brannock size into (numeric) size and width.
 * @param {string} size - The Brannock size to split.
 * @return {object} components - An object giving the numeric size
 * as {size} and width as {width}.
 */
const split_brannock = function(size) {
  let pattern = /[0-9\.]{1,4}/;
  let [match, ...rest] = pattern.exec(size);
  let width = size.replace(match, '').toUpperCase();
  return {size: parseFloat(match), width: width};
};

/**
 * Compare two split Brannock sizes.
 * @param {object} a - A split Brannock size.
 * @param {object} b - A split Brannock size.
 * @return {float} cmp
 */
const brannock_cmp = function(a, b) {
  let [obj1, obj2] = _.map([a, b], split_brannock);
  if (obj1.size < obj2.size) {
    return -1;
  } else if (obj1.size > obj2.size) {
    return 1;
  }

  // obj1.size === obj2.size
  if (obj1.width < obj2.width) {
    return -1;
  } else if (obj1.width === obj2.width) {
    return 0;
  } else {
    return 1;
  }
};

/**
 * Get available Brannock sizes.
 * @param {object} grouped - Sizing data keyed by Brannock size.
 * @return {Array[string]} - Unique, sorted Brannock sizes.
 */
const get_sizes = function(grouped) {
  let sizes = Object.keys(grouped);
  sizes.sort(brannock_cmp);
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
