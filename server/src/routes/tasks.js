const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  completed: row.completed,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows.map(mapRow));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description ?? null]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           completed = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [title, description ?? null, completed ?? false, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(mapRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  Object.entries(req.body).forEach(([key, value]) => {
    if (['title', 'description', 'completed'].includes(key)) {
      fields.push(`${key} = $${fields.length + 1}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided' });
  }

  try {
    const query = `UPDATE tasks
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *`;
    const { rows } = await pool.query(query, [...values, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(mapRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `UPDATE tasks
       SET completed = true,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(mapRow(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
