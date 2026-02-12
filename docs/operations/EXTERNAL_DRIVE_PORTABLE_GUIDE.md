# 📦 Genmeta Metacosm - External Hard Drive Portable Setup

## Overview

This guide explains how to configure Genmeta Metacosm to run **entirely from an external hard drive** with no
dependencies on the host system.

---

## ✅ Feasibility: YES

**Everything can run from external drive:**

- ✅ Node.js runtime (portable version)
- ✅ Python runtime (portable version)
- ✅ All TypeScript/Python source code
- ✅ Dependencies (node_modules, Python packages)
- ✅ Data/state/cache files
- ✅ Compiled JavaScript output
- ✅ React frontend

**What you need from the host:**

- USB 3.0+ port for acceptable performance
- Basic Windows OS (for running the batch scripts)
- ~10GB free space on the external drive

---

## 📁 External Drive Structure

```
EXTERNAL_DRIVE:/genmeta-portable/
│
├── runtimes/
│   ├── node-v20.x.x-win-x64/          # Download from nodejs.org
│   │   ├── node.exe
│   │   └── npm.cmd
│   │
│   └── python-3.11.x/                 # Download from python.org
│       ├── python.exe
│       ├── pythonw.exe
│       └── Scripts/
│
├── project/
│   ├── genmeta-metacosm-v1.0.1/      # Your current project
│   │   ├── src/                       # TypeScript source
│   │   ├── dist/                      # Compiled JS (created by build)
│   │   ├── node_modules/              # npm dependencies
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── public/
│   │
│   └── omnilib-backend/               # Python backend
│       ├── oracle.py                  # Currently empty - needs implementation!
│       ├── dialogue.py                # Currently empty - needs implementation!
│       ├── analytics.py               # Currently empty - needs implementation!
│       └── main.py                    # 26 bytes - needs implementation!
│
├── data/
│   ├── state_db.json                  # Saved Metacosm states
│   ├── entity_cache/                  # Entity snapshots
│   ├── session_logs/                  # Activity logs
│   └── evolution_archive/             # Training data
│
├── logs/                              # Runtime logs
│   ├── npm_errors.log
│   ├── python_errors.log
│   └── application.log
│
└── scripts/
    ├── start-react.bat                # Launch React frontend
    ├── start-node-api.bat             # Launch TypeScript backend (if needed)
    ├── start-python-backend.bat       # Launch Python backend (if implemented)
    ├── build-project.bat              # Compile TypeScript to JS
    ├── install-dependencies.bat       # Install npm/pip packages
    ├── cleanup-cache.bat              # Clear caches
    └── startup.bat                    # Launch everything
```

---

## 📥 Step-by-Step Setup

### Step 1: Download Portable Runtimes

1. **Download Node.js Portable:**
    - Visit: https://nodejs.org/en/download/
    - Download: `node-v20.x.x-win-x64.zip` (or latest LTS)
    - Extract to: `EXTERNAL_DRIVE:/genmeta-portable/runtimes/node-v20.x.x-win-x64/`

2. **Download Python Portable:**
    - Visit: https://www.python.org/downloads/windows/
    - Download: `python-3.11.x-embed-amd64.zip`
    - Extract to: `EXTERNAL_DRIVE:/genmeta-portable/runtimes/python-3.11.x/`

3. **Verify Runtimes:**
   ```batch
   EXTERNAL_DRIVE:\genmeta-portable\runtimes\node-v20.x.x-win-x64\node.exe --version
   EXTERNAL_DRIVE:\genmeta-portable\runtimes\python-3.11.x\python.exe --version
   ```

---

### Step 2: Copy Your Project

1. **Copy entire project folder:**
   ```
   From: D:/1. Genmeta/genmeta-metacosm-v1.0.1
   To:   EXTERNAL_DRIVE:/genmeta-portable/project/genmeta-metacosm-v1.0.1
   ```

2. **Copy Python backend:**
   ```
   From: Current location (or wherever it is)
   To:   EXTERNAL_DRIVE:/genmeta-portable/project/omnilib-backend/
   ```

---

### Step 3: Create Startup Scripts

Create these `.bat` files in `EXTERNAL_DRIVE:/genmeta-portable/scripts/`

#### `build-project.bat`

```batch
@echo off
set NODE_HOME=%~dp0..\runtimes\node-v20.x.x-win-x64
set PROJECT_HOME=%~dp0..\project\genmeta-metacosm-v1.0.1

echo ================================
echo Building Genmeta Metacosm...
echo ================================
echo.

cd /d "%PROJECT_HOME%"

"%NODE_HOME%\npm.cmd" install
"%NODE_HOME%\npm.cmd" run build

echo.
echo Build complete!
pause
```

#### `install-dependencies.bat`

```batch
@echo off
set NODE_HOME=%~dp0..\runtimes\node-v20.x.x-win-x64
set PYTHON_HOME=%~dp0..\runtimes\python-3.11.x
set PROJECT_HOME=%~dp0..\project\genmeta-metacosm-v1.0.1

echo ================================
echo Installing Dependencies...
echo ================================
echo.

cd /d "%PROJECT_HOME%"

echo Installing npm dependencies...
"%NODE_HOME%\npm.cmd" install

echo.
echo Installation complete!
pause
```

#### `start-react.bat`

```batch
@echo off
set NODE_HOME=%~dp0..\runtimes\node-v20.x.x-win-x64
set PROJECT_HOME=%~dp0..\project\genmeta-metacosm-v1.0.1

echo ================================
echo Starting React Frontend...
echo ================================
echo.

cd /d "%PROJECT_HOME%"

"%NODE_HOME%\npm.cmd" start
```

#### `startup.bat`

```batch
@echo off
set NODE_HOME=%~dp0..\runtimes\node-v20.x.x-win-x64
set PYTHON_HOME=%~dp0..\runtimes\python-3.11.x
set PROJECT_HOME=%~dp0..\project\genmeta-metacosm-v1.0.1
set DATA_HOME=%~dp0..\data
set LOG_HOME=%~dp0..\logs

echo ================================
echo Genmeta Metacosm - Portable Launch
echo ================================
echo.
echo Node Home: %NODE_HOME%
echo Python Home: %PYTHON_HOME%
echo Project Home: %PROJECT_HOME%
echo Data Home: %DATA_HOME%
echo.
pause

cd /d "%PROJECT_HOME%"

echo.
echo [1/3] Starting React Frontend...
start "Genmeta React" "%NODE_HOME%\npm.cmd" start

echo [2/3] Checking for Python backend...
if exist "%~dp0..\project\omnilib-backend\main.py" (
    echo Python backend exists but is currently empty/stub.
    echo The TypeScript facade uses mock implementations instead.
) else (
    echo No Python backend found - running with mock facade only.
)

echo.
echo ================================
echo Startup Complete!
echo ================================
echo.
echo React should open in your default browser.
echo Press any key to close this window...
```

---

### Step 4: Build the Project

1. **Open command prompt** on the external drive
2. **Navigate to scripts:**
   ```batch
   cd EXTERNAL_DRIVE:\genmeta-portable\scripts
   ```
3. **Run install script:**
   ```batch
   install-dependencies.bat
   ```
4. **Run build script:**
   ```batch
   build-project.bat
   ```

---

### Step 5: Launch

**Simply run:**

```batch
EXTERNAL_DRIVE:\genmeta-portable\scripts\startup.bat
```

**That's it!** Everything runs from the external drive.

---

## 🔌 The Python/TypeScript Disconnect Issue

### Current State:

**Python Backend (`omnilib-backend/`):**

```
dialogue.py              - 0 bytes (EMPTY!)
oracle.py                - 0 bytes (EMPTY!)
main.py                  - 26 bytes (minimal stub)
analytics.py             - 0 bytes (EMPTY!)
```

**TypeScript Facade (`src/omnilib-facade/`):**

```typescript
// definitions.ts has comments like:
// "... many more from oracle.py"     // ← File is empty!
// "... many more from main.py"       // ← File is empty!

// clients.ts uses MOCK implementations:
export const askOracle = async (query: OracleQuery, egregores: Egregore[]) => {
    await new Promise(res => setTimeout(res, 700));  // Fake delay
    return {
        answer: `Simulated response to: "${query.question}"`,
        // ... mock data
    };
};
```

### What This Means:

1. **The Python backend is currently a phantom**
2. **TypeScript uses mock implementations** instead of calling real Python code
3. **The comments reference files that don't exist**

### Solutions:

#### Option A: Implement the Python Backend (Recommended)

Create real implementations in `omnilib-backend/`:

- `oracle.py` - Actual Oracle LLM integration
- `dialogue.py` - Dialogue management system
- `analytics.py` - Analytics engine
- `main.py` - FastAPI/Flask server

Then update `src/omnilib-facade/clients.ts` to call the real Python API instead of using mocks.

#### Option B: Remove Python Dependency

If you don't need Python, you can:

1. Delete `omnilib-backend/` folder
2. Remove TypeScript facade references
3. Keep everything in TypeScript/Node.js only

#### Option C: Keep Current Setup

Run with mock implementations only. This works for:

- Development and testing
- Demonstrations
- Frontend prototyping

But won't have actual Python functionality.

---

## ⚡ Performance Considerations

### USB 2.0 vs USB 3.0+

| Interface | Read Speed | Write Speed | Suitability |
|-----------|------------|-------------|-------------|
| USB 2.0   | 30-35 MB/s | 25-30 MB/s | Poor (slow startup) |
| USB 3.0   | 100-150 MB/s | 80-110 MB/s | Good |
| USB 3.1+  | 400-500 MB/s | 350-450 MB/s | Excellent |
| USB-C     | 400-500 MB/s | 350-450 MB/s | Excellent |
| Thunderbolt| 1.5-2 GB/s | 1.2-1.8 GB/s | Overkill |

**Recommendation:** Use USB 3.0+ for best experience.

---

## 🔄 Data Persistence

All data is stored on the external drive:

```
EXTERNAL_DRIVE:/genmeta-portable/data/
├── state_db.json          # Metacosm state
├── entity_cache/          # Entity snapshots
├── session_logs/          # Activity logs
└── evolution_archive/     # Training data
```

**Plug-and-play:** Your entire system state travels with the drive!

---

## 🚀 Benefits of Portable Setup

1. **No Installation Required** on host machines
2. **Complete Isolation** - No conflicts with system software
3. **Privacy** - No data left on host system
4. **Portability** - Your AI goes everywhere with you
5. **Version Control** - Run different versions of your system
6. **Safe Development** - Can't break the host system
7. **Testing** - Test on multiple machines easily
8. **Backup** - Entire system = just copy the folder

---

## 🐛 Troubleshooting

### Issue: "node.exe is not recognized"

**Solution:** Ensure paths in .bat files are correct and runtimes are extracted properly.

### Issue: npm install fails

**Solution:** Check internet connection, try using npm cache clean:

```batch
"%NODE_HOME%\npm.cmd" cache clean --force
```

### Issue: React won't start

**Solution:** Ensure port 3000 is not in use or change it:

```typescript
// In package.json
"start": "react-scripts start"
```

### Issue: Slow performance

**Solution:**

- Upgrade to USB 3.0+ connection
- Use SSD external drive instead of HDD
- Add more RAM to source machine

---

## 📝 Summary

**Yes, you can run everything from an external hard drive!** All that's needed is:

1. ✅ Portable Node.js runtime
2. ✅ Portable Python runtime (if needed)
3. ✅ Your project files
4. ✅ Dependencies (node_modules)
5. ✅ Batch scripts for startup

**Total Space Needed:** ~5-10 GB depending on dependencies

**Setup Time:** ~30 minutes for first-time setup

**Launch Time:** ~5-10 seconds (USB 3.0+)

---

*Last Updated: January 10, 2026*
*Status: Implementation Guide*