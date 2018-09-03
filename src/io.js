const fs = require('fs');
const handlebars = require('handlebars');


const readFile = function(filename) {
  return fs.readFileSync(filename, 'utf-8').toString();
};

const readJSON = function(filename) {
  return JSON.parse(readFile(filename));
};

/**
 * Get a compiled handlebars HTML template.
 * @param {string} filename - Name of HTML template.
 * @return {function} compiled - Compiled handlebars template.
 */
const getTemplate = function(filename) {
  const template = readFile(filename);
  return handlebars.compile(template);
};

/**
 * Register handlebars helper functions.
 * @param {Array[function]} helpers - Helper functions.
 * @return never
 */
const registerHelpers = function(helpers) {
  helpers.forEach((helper) => {
    handlebars.registerHelper(helper.name, helper);
  });
};


module.exports = {
  getTemplate,
  readFile,
  readJSON,
  registerHelpers,
};
