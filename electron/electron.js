const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

app.commandLine.appendSwitch("disable-gpu");
app.disableHardwareAcceleration();

app.on("ready", () => {
    console.log("Starting Electron...");

    // Start the Express backend server
    serverProcess = spawn("node", ["dist/backend/server.js"], {
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

    // Create the Electron main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Load the frontend files directly from the file system
    mainWindow.loadFile(path.join(__dirname, '../dist/frontend/index.html'))
        .then(() => console.log("Frontend loaded successfully"))
        .catch((err) => console.error("Error loading frontend:", err));

    mainWindow.on("closed", () => {
        mainWindow = null;
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
