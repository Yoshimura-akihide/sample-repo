// server/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// すべてのタスク取得
app.get('/api/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE is_deleted = FALSE ORDER BY id');
  res.json(result.rows);
});

// タスク追加
app.post('/api/tasks', async (req, res) => {
  const { deadline, task } = req.body;
  const result = await pool.query(
    `INSERT INTO tasks (deadline, task) VALUES ($1, $2) RETURNING *`,
    [deadline, task]
  );
  res.json(result.rows[0]);
});

// タスクの状態更新（完了・削除）
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { is_done, is_deleted } = req.body;

  const result = await pool.query(
    `UPDATE tasks SET is_done = $1, is_deleted = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
    [is_done, is_deleted, id]
  );
  res.json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});