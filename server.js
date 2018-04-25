const express = require('express');
const {SizingData} = require('./src/container.js');
const app = express();


const DATA_FILENAME = './src/data/last_sizing_thread.json';
const PORT = 3030;

const sd = SizingData.from_file(DATA_FILENAME);


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

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}`);
});
