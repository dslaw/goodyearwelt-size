const express = require('express');
const { flatMap } = require('lodash');
const mustacheExpress = require('mustache-express');
const path = require('path');

const { sortSizeRecords, withDisplayValues } = require('./src/display.js');
const { DataStore, loadData } = require('./src/store.js');


const app = express();
const constants = {
  port: 3030,
  dataDir: './src/data',
  filenames: [
    'last_sizing_thread_2017.json',
    'last_sizing_thread_2018.json',
  ],
};

const dataFilenames = constants.filenames
  .map(fname => path.join(constants.dataDir, fname));
const dataStore = new DataStore(flatMap(dataFilenames, loadData));


app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, '/templates'));
app.use(express.static('assets'));


app.get('/', (req, res) => {
  const sizes = dataStore.countSizes();
  const mlasts = dataStore.countMlasts();
  res.render('index', { sizes, mlasts });
});

app.get('/sizing', (req, res) => {
  const data = dataStore.get();
  res.json(data);
});

const tableHelper = function(data) {
  const records = data.map(withDisplayValues);
  return {
    filename: 'table',
    records: sortSizeRecords(records),
  };
};

app.get('/sizes/:size', (req, res) => {
  const data = dataStore.getSize(req.params.size);
  res.format({
    'default': () => {
      const { filename, records } = tableHelper(data);
      res.render(filename, { records });
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
      const { filename, records } = tableHelper(data);
      res.render(filename, { records });
    },
    'application/json': () => {
      res.send(data);
    },
  });
});

app.listen(constants.port, () => {
  console.log(`Started listening on port ${constants.port}`);
});
