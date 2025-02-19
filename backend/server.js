require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()); // Enable CORS for frontend communication

// MySQL connection setup
const db = mysql.createConnection({
    host: "localhost",
    user: "georged",  // Change this if you have a different username
    password: "W3Se$Xdr%geor",  // Change this to your MySQL password
    database: "my_app_db",
});

// Check database connection
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});

// API Routes

// Fetch all users
app.get("/api/data", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(results);
        }
    });
});

// Add a new user
app.post("/users", (req, res) => {
    const { name, email } = req.body;
    db.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: result.insertId, name, email });
            }
        }
    );
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
