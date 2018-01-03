const express = require('express')
const {load_data} = require('./src/data.js');
const app = express();


const DATA_FILENAME = './src/data/last_sizing_thread.json';
const PORT = 3030;


app.get('/sizing', (req, res) => {
  let sizing_data = load_data(DATA_FILENAME);
  res.json(sizing_data);
});

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}`);
});
