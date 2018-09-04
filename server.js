const express = require('express');
const path = require('path');
const { flatMap, memoize, sortBy } = require('lodash');

const helpers = require('./src/display/helpers.js');
const io = require('./src/io.js');
const { DataStore, loadData } = require('./src/store.js');


const app = express();
const constants = {
  port: 3030,
  dataDir: './src/data',
  templatesDir: './templates',
  filenames: [
    'last_sizing_thread_2017.json',
    'last_sizing_thread_2018.json',
  ],
};

const dataFilenames = constants.filenames
  .map(fname => path.join(constants.dataDir, fname));
const dataStore = new DataStore(flatMap(dataFilenames, loadData));

const getTemplate = memoize(io.getTemplate);
io.registerHelpers(Object.values(helpers));


app.use(express.static('assets'));


app.get('/', (req, res) => {
  const templateFilename = path.join(constants.templatesDir, 'index.html');
  const renderer = getTemplate(templateFilename);

  const sizes = dataStore.countSizes();
  const mlasts = dataStore.countMlasts();
  const html = renderer({ sizes, mlasts });
  res.send(html);
});

app.get('/sizing', (req, res) => {
  const data = dataStore.get();
  res.json(data);
});

const renderTable = function(data) {
  const templateFilename = path.join(
    constants.templatesDir,
    'table.html'
  );
  const renderer = getTemplate(templateFilename);
  const records = sortBy(data, sizeRecord => sizeRecord.mlast);
  const html = renderer({ records });
  return html;
};

app.get('/sizes/:size', (req, res) => {
  const data = dataStore.getSize(req.params.size);
  res.format({
    'default': () => {
      const html = renderTable(data);
      res.send(html);
    },
    'application/json': () => {
      res.send(data);
    },
  });
});

app.get('/model-lasts/:mlast', (req, res) => {
  const data = dataStore.getMlast(req.params.mlast);
  res.format({
    'default': () => {
      const html = renderTable(data);
      res.send(html);
    },
    'application/json': () => {
      res.send(data);
    },
  });
});

app.listen(constants.port, () => {
  console.log(`Started listening on port ${constants.port}`);
});
