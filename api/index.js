const express = require('express');
const app = express();

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.json({
    testing: 'testing API',
  });
});

app.listen(PORT, () => {
  console.log(`listing on ${PORT}`)
})
