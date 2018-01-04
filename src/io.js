const fs = require('fs');
const handlebars = require('handlebars');


const read_file = function(filename) {
  return fs.readFileSync(filename, 'utf-8').toString();
};

const read_json = function(filename) {
  return JSON.parse(read_file(filename));
};

/**
 * Get a compiled handlebars HTML template.
 * @param {string} filename - Name of HTML template.
 * @return {function} compiled - Compiled handlebars template.
 */
const get_template = function(filename) {
  let template = read_file(filename);
  return handlebars.compile(template);
};


module.exports = {
  get_template: get_template,
  read_file: read_file,
  read_json: read_json,
};
