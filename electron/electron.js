const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const express = require("express");
const mysql = require("mysql2");

let mainWindow;
let db;
let server;

app.commandLine.appendSwitch("disable-gpu");
app.disableHardwareAcceleration();

app.on("ready", () => {
    console.log("Starting Electron...");

    // MySQL connection setup
    db = mysql.createConnection({
        host: "localhost",
        user: "georged",
        password: "W3Se$Xdr%geor",
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

    // Create the Express server
    const app = express();
    app.use(express.json());

    // API Routes
    app.get("/api/users", (req, res) => {
        db.query("SELECT * FROM users", (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(results);
            }
        });
    });

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
    server = app.listen(0, () => {
        console.log(`Server is running internally`);
    });

    // Create the Electron main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the frontend files directly from the file system
    const frontendPath = path.join(__dirname, '../dist/frontend/index.html');
    console.log(`Loading frontend from ${frontendPath}`);
    mainWindow.loadFile(frontendPath)
        .then(() => {
            console.log("Frontend loaded successfully");
            mainWindow.webContents.openDevTools(); // Open developer tools
        })
        .catch((err) => console.error("Error loading frontend:", err));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });

    // IPC handlers
    ipcMain.on('fetch-users', (event) => {
        console.log("Received IPC message to fetch users");
        db.query("SELECT * FROM users", (err, results) => {
            if (err) {
                console.error("Error fetching users:", err);
                event.reply('users-data', { error: err.message });
            } else {
                console.log("Fetched users data:", results);
                event.reply('users-data', { data: results });
            }
        });
    });
});

// Kill backend server when Electron exits
app.on("before-quit", () => {
    stopServer();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        stopServer();
        app.quit();
    }
});

// Function to stop backend server
function stopServer() {
    if (server) {
        console.log("Stopping backend server...");
        server.close(() => {
            console.log("Backend server stopped.");
        });
    }
    if (db) {
        console.log("Closing database connection...");
        db.end((err) => {
            if (err) {
                console.error("Error closing database connection:", err);
            } else {
                console.log("Database connection closed.");
            }
        });
    }
}
