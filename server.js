const express = require('express');
const path = require('path');
const { flatMap, memoize } = require('lodash');
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


app.get('/', (req, res) => {
  const templateFilename = path.join(constants.templatesDir, 'index.html');
  const renderer = getTemplate(templateFilename);
  const html = renderer(dataStore);
  res.send(html);
});

app.get('/sizing', (req, res) => {
  const data = dataStore.get();
  res.json(data);
});

app.get('/sizes/:size', (req, res) => {
  const data = dataStore.getSize(req.params.size);
  res.format({
    'default': () => {
      const templateFilename = path.join(
        constants.templatesDir,
        'table_rows.html'
      );
      const renderer = getTemplate(templateFilename);
      const html = renderer({ data });
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
