const fs = require('fs');


const readFile = function(filename) {
  return fs.readFileSync(filename, 'utf-8').toString();
};

const readJSON = function(filename) {
  return JSON.parse(readFile(filename));
};


module.exports = { readFile, readJSON };
