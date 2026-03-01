const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Define the root directory for all Metacosm data
const METACOSM_ROOT = "D:/METACOSM_CORE/";

// Define paths based on the Metacosm structure
const SAVE_STATES_PATH = path.join(METACOSM_ROOT, 'save_states');
const OPERATIONS_PATH = path.join(METACOSM_ROOT, 'Operations');
const SYSTEM_LOCI_PATH = path.join(METACOSM_ROOT, 'SystemLoci');
const SPECTRE_PATH = path.join(SYSTEM_LOCI_PATH, 'Spectre');

const SAVE_SLOTS_FILE = path.join(OPERATIONS_PATH, 'save_slots.json');
const OPTIONS_FILE = path.join(METACOSM_ROOT, 'metacosm.cfg');
const USERS_FILE = path.join(OPERATIONS_PATH, 'users.json');
const SPECTRE_STATE_FILE = path.join(SPECTRE_PATH, 'spectre_state.json');


// --- Helper Functions ---
const ensureDir = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

const readJsonFile = async (filePath, defaultValue) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return defaultValue;
    }
    console.error(`Error reading JSON file at ${filePath}:`, err);
    throw err;
  }
};

const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

async function initializeFileSystem() {
  await ensureDir(METACOSM_ROOT);
  await ensureDir(SAVE_STATES_PATH);
  await ensureDir(OPERATIONS_PATH);
  await ensureDir(SPECTRE_PATH);
}


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: "Metacosm Architect (Desktop)",
    icon: path.join(__dirname, '../public/favicon.png') // Adjust path if your icon is elsewhere
  });

  mainWindow.loadURL('http://localhost:5173');
}

app.whenReady().then(async () => {
  await initializeFileSystem();

  // --- IPC Handlers ---
  
  // Options
  ipcMain.handle('get-options', async () => readJsonFile(OPTIONS_FILE, null));
  ipcMain.handle('save-options', async (event, options) => writeJsonFile(OPTIONS_FILE, options));
  
  // Users
  ipcMain.handle('get-users', async () => readJsonFile(USERS_FILE, null));
  ipcMain.handle('save-users', async (event, users) => writeJsonFile(USERS_FILE, users));
  
  // Spectre State
  ipcMain.handle('get-spectre-state', async () => readJsonFile(SPECTRE_STATE_FILE, null));
  ipcMain.handle('save-spectre-state', async (event, state) => writeJsonFile(SPECTRE_STATE_FILE, state));

  // Save Slots
  ipcMain.handle('get-save-slots', async () => readJsonFile(SAVE_SLOTS_FILE, []));

  ipcMain.handle('load-from-slot', async (event, id) => {
    return readJsonFile(path.join(SAVE_STATES_PATH, `${id}.json`), null)
  });

  ipcMain.handle('create-new-save', async (event, { state, name }) => {
    const slots = await readJsonFile(SAVE_SLOTS_FILE, []);
    const newSlot = {
      id: state.egregores.find(e => e.is_metacosm_core)?.id + '_' + Date.now(), // A more deterministic UUID for saves
      name,
      timestamp: Date.now(),
      turn: state.turn,
      egregoreCount: state.egregores.filter(e => !e.is_metacosm_core).length,
      factionCount: state.factions.length,
    };
    newSlot.id = newSlot.id.replace(/[^a-zA-Z0-9_-]/g, ''); // sanitize id

    await writeJsonFile(path.join(SAVE_STATES_PATH, `${newSlot.id}.json`), state);
    slots.push(newSlot);
    await writeJsonFile(SAVE_SLOTS_FILE, slots);
  });

  ipcMain.handle('overwrite-save', async (event, { id, state }) => {
    const slots = await readJsonFile(SAVE_SLOTS_FILE, []);
    const slotIndex = slots.findIndex(s => s.id === id);
    if (slotIndex > -1) {
      slots[slotIndex].timestamp = Date.now();
      slots[slotIndex].turn = state.turn;
      slots[slotIndex].egregoreCount = state.egregores.filter(e => !e.is_metacosm_core).length;
      slots[slotIndex].factionCount = state.factions.length;
      
      await writeJsonFile(path.join(SAVE_STATES_PATH, `${id}.json`), state);
      await writeJsonFile(SAVE_SLOTS_FILE, slots);
    }
  });

  ipcMain.handle('rename-save', async (event, { id, newName }) => {
      const slots = await readJsonFile(SAVE_SLOTS_FILE, []);
      const slot = slots.find(s => s.id === id);
      if (slot) {
        slot.name = newName;
        await writeJsonFile(SAVE_SLOTS_FILE, slots);
      }
  });

  ipcMain.handle('delete-save', async (event, id) => {
    const slots = await readJsonFile(SAVE_SLOTS_FILE, []);
    const updatedSlots = slots.filter(s => s.id !== id);
    await writeJsonFile(SAVE_SLOTS_FILE, updatedSlots);
    try {
      await fs.unlink(path.join(SAVE_STATES_PATH, `${id}.json`));
    } catch(err) {
      if (err.code !== 'ENOENT') console.error(`Failed to delete save file for slot ${id}:`, err);
    }
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});