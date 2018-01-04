const express = require('express')
const {load_data} = require('./src/data.js');
const {SizingData} = require('./src/container.js');
const app = express();


const DATA_FILENAME = './src/data/last_sizing_thread.json';
const PORT = 3030;


app.get('/', (req, res) => {
  let sizing_data = load_data(DATA_FILENAME);
  let sd = new SizingData(sizing_data);
  let html = sd.render_sizes('./templates/index.html');
  res.send(html);
});

app.get('/sizing', (req, res) => {
  let sizing_data = load_data(DATA_FILENAME);
  res.json(sizing_data);
});

app.get('/sizes/:size', (req, res) => {
  let sizing_data = load_data(DATA_FILENAME);
  let sd = new SizingData(sizing_data);

  res.format({
    'default': () => {
      let html = sd.render_data('./templates/table_rows.html', req.params.size);
      res.send(html);
    },
    'application/json': () => {
      let response_data = sd.data[req.params.size] || [];
      res.send(response_data);
    },
  });
});

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}`);
});
