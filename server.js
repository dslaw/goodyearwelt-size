const express = require('express');
const path = require('path');
const {SizingData} = require('./src/container.js');
const app = express();


const constants = {
  port: 3030,
  data_dir: './src/data',
  filenames: [
      'last_sizing_thread_2017.json',
      'last_sizing_thread_2018.json',
  ],
};

const data_filenames = constants.filenames.map(fname => {
  return path.join(constants.data_dir, fname);
});
const sd = SizingData.from_files(data_filenames);


app.get('/', (req, res) => {
  let html = sd.render_sizes('./templates/index.html');
  res.send(html);
});

app.get('/sizing', (req, res) => {
  res.json(sd.get());
});

app.get('/sizes/:size', (req, res) => {
  res.format({
    'default': () => {
      let html = sd.render_data('./templates/table_rows.html', req.params.size);
      res.send(html);
    },
    'application/json': () => {
      let response_data = sd.get_size(req.params.size);
      res.send(response_data);
    },
  });
});

app.listen(constants.port, () => {
  console.log(`Started listening on port ${constants.port}`);
});
