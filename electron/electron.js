const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const express = require("express");

let mainWindow;
let serverProcess;
let frontendServer;

app.commandLine.appendSwitch("disable-gpu");
app.disableHardwareAcceleration();

app.on("ready", () => {
    console.log("Starting Electron...");

    // Start the Express backend server
    serverProcess = spawn("node", ["backend/server.js"], {
        detached: true,
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
    });

    serverProcess.stdout.on("data", (data) => {
        console.log(`Server: ${data.toString().trim()}`);
    });

    serverProcess.stderr.on("data", (data) => {
        console.error(`Server Error: ${data.toString().trim()}`);
    });

    serverProcess.unref();

    serverProcess.on("error", (err) => {
        console.error("Failed to start server:", err);
    });

    // ✅ Serve the frontend using Express to avoid CORS issues
    frontendServer = express();
    frontendServer.use(express.static(path.join(__dirname, "frontend", "dist")));

    const FRONTEND_PORT = 5173; // Use a different port from backend
    frontendServerInstance = frontendServer.listen(FRONTEND_PORT, () => {
        console.log(`Frontend server running at http://localhost:${FRONTEND_PORT}`);

        // Create the Electron main window
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        // ✅ Load the frontend via HTTP instead of file://
        mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`)
            .then(() => console.log("Frontend loaded successfully"))
            .catch((err) => console.error("Error loading frontend:", err));

        mainWindow.on("closed", () => {
            mainWindow = null;
        });
    });
});

// Kill backend and frontend servers when Electron exits
app.on("before-quit", () => {
    stopServer();
    stopFrontendServer();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        stopServer();
        stopFrontendServer();
        app.quit();
    }
});

// Function to stop backend server
function stopServer() {
    if (serverProcess && !serverProcess.killed) {
        console.log("Stopping backend server...");
        try {
            serverProcess.kill("SIGTERM");
            console.log("Backend server stopped.");
        } catch (err) {
            console.error("Error killing backend server:", err);
        }
    }
}

// Function to stop frontend server
function stopFrontendServer() {
    if (frontendServerInstance) {
        console.log("Stopping frontend server...");
        frontendServerInstance.close(() => {
            console.log("Frontend server stopped.");
        });
    }
}
