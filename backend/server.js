const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = 8080;

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

conn.connect(err => {
    if (err) throw err;
    console.log("Connected to DB");
});

app.use(express.json());

app.post('/like', (req, res) => {
    conn.query('UPDATE likes SET count = count + 1 WHERE id = 1', (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Liked!" });
    });
});

app.get('/likes', (req, res) => {
    conn.query('SELECT count FROM likes WHERE id = 1', (err, results) => {
        if (err) return res.status(500).send(err);
        res.send({ likes: results[0].count });
    });
});
app.get('/health', (req, res) => {
  // Simple database check
  conn.ping(err => {
    if (err) return res.status(500).send('DB connection failed');
    res.status(200).send('OK');
  });
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const createTableQuery = `
CREATE TABLE IF NOT EXISTS likes (
  id INT PRIMARY KEY,
  count INT DEFAULT 0
);
`;

conn.query(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating likes table:", err);
    process.exit(1); 
  }
  console.log("Likes table checked/created");

  const insertInitialRow = `
    INSERT INTO likes (id, count)
    VALUES (1, 0)
    ON DUPLICATE KEY UPDATE count = count;
  `;

  conn.query(insertInitialRow, (err) => {
    if (err) {
      console.error("Error inserting initial likes row:", err);
      process.exit(1);
    }
    console.log("Initial likes row inserted/exists");
  });
});
