import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(app.getPath("userData"), "user.db"));
db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
  matricule INTEGER PRIMARY KEY,
  login TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  adresse TEXT NOT NULL,
  mot_de_passe TEXT NOT NULL
);`
).run();

ipcMain.handle("get-users", () => db.prepare("SELECT * FROM users").all());
ipcMain.handle("get-user-by-email", (_e, email: string) =>
  db.prepare("SELECT * FROM users WHERE email = ?").get(email)
);
ipcMain.handle("get-user-by-id", (_e, matricule: number) =>
  db.prepare("SELECT * FROM users WHERE matricule = ?").get(matricule)
);

ipcMain.handle(
  "add-user",
  (_e, { matricule, login, nom, email, adresse, mot_de_passe }) => {
    const existingUser = db
      .prepare("SELECT 1 FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      return { success: false, message: "Email already exists." };
    }
    try {
      db.prepare(
        "INSERT INTO users (matricule,login,nom,email,adresse,mot_de_passe) VALUES (?,?,?,?,?,?)"
      ).run(matricule, login, nom, email, adresse, mot_de_passe);
      return { success: true, message: "User added successfully." };
    } catch (error) {
      return {
        success: false,
        message: "Failed to add user.",
        error: error.message,
      };
    }
  }
);

ipcMain.handle(
  "update-user",
  (_e, { matricule, login, nom, email, adresse, mot_de_passe }) =>
    db
      .prepare(
        "UPDATE users SET  login=? nom=? email=? adresse=? mot_de_passe=?  WHERE matricule = ?"
      )
      .run(login, nom, email, adresse, mot_de_passe, matricule)
);
ipcMain.handle("delete-user", (_e, matricule: number) =>
  db.prepare("DELETE FROM users WHERE matricule = ?").run(matricule)
);

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC test
  ipcMain.on("ping", () => console.log("pong"));

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
