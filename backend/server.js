require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: true,
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ message: 'Server and database are working' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const TEXT_FIELDS = ['title', 'description', 'research_area',
                     'faculty_name', 'department', 'required_skills'];

function validate(d) {
  const errors = [];
  for (const f of TEXT_FIELDS) {
    if (typeof d[f] !== 'string' || !d[f].trim()) errors.push(`${f} is required`);
  }
  const pos = Number(d.positions);
  if (!Number.isInteger(pos) || pos < 1) errors.push('positions must be a whole number >= 1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.deadline || '') || isNaN(Date.parse(d.deadline)))
    errors.push('deadline must be a valid date (YYYY-MM-DD)');
  if (!['Open', 'Closed'].includes(d.status)) errors.push('status must be Open or Closed');
  return errors;
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid ID' });
    return null;
  }
  return id;
}

// CREATE
app.post('/api/opportunities', async (req, res) => {
  try {
    const data = { status: 'Open', ...req.body };
    const errors = validate(data);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

    const [result] = await pool.query(
      `INSERT INTO opportunities
       (title, description, research_area, faculty_name, department,
        required_skills, positions, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title.trim(), data.description.trim(), data.research_area.trim(),
       data.faculty_name.trim(), data.department.trim(), data.required_skills.trim(),
       Number(data.positions), data.deadline, data.status]
    );
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ALL
app.get('/api/opportunities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM opportunities ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ONE
app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE (send only the fields you want to change)
app.put('/api/opportunities/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const [rows] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });

    const merged = { ...rows[0], ...req.body };
    const errors = validate(merged);
    if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

    await pool.query(
      `UPDATE opportunities SET title=?, description=?, research_area=?, faculty_name=?,
       department=?, required_skills=?, positions=?, deadline=?, status=? WHERE id=?`,
      [merged.title.trim(), merged.description.trim(), merged.research_area.trim(),
       merged.faculty_name.trim(), merged.department.trim(), merged.required_skills.trim(),
       Number(merged.positions), merged.deadline, merged.status, id]
    );
    const [updated] = await pool.query('SELECT * FROM opportunities WHERE id = ?', [id]);
    res.status(200).json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE
app.delete('/api/opportunities/:id', async (req, res) => {
  try {
    const id = parseId(req, res);
    if (id === null) return;
    const [result] = await pool.query('DELETE FROM opportunities WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));