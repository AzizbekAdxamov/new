const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Task API is running' });
});

app.use('/api/tasks', tasksRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
