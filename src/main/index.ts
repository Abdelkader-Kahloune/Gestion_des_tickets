import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import Database from "better-sqlite3";
import path from "path";
import nodemailer from "nodemailer";

const db = new Database(path.join(app.getPath("userData"), "user.db"));
db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
  matricule INTEGER PRIMARY KEY,
  login TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  adresse TEXT NOT NULL,
  mot_de_passe TEXT NOT NULL,
  role TEXT DEFAULT 'user'
);`
).run();

// Check if there are any users, and if not, insert a default admin user
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
if (userCount === 0) {
  db.prepare(
    "INSERT INTO users (matricule, login, nom, email, adresse, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    1,
    "admin",
    "Administrateur",
    "admin@admin.com",
    "Adresse Admin",
    "admin", // You may want to hash this in production
    "admin"
  );
}

// Create tickets table if not exists, with foreign key constraint on matricule (matricule is the id)
db.prepare(
  `CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule INTEGER NOT NULL,
    nomPrenom TEXT NOT NULL,
    nombre INTEGER NOT NULL,
    typeTicket TEXT NOT NULL,
    offre TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricule) REFERENCES users(matricule) ON DELETE CASCADE
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
        "UPDATE users SET login=?, nom=?, email=?, adresse=?, mot_de_passe=? WHERE matricule = ?"
      )
      .run(login, nom, email, adresse, mot_de_passe, matricule)
);
ipcMain.handle("delete-user", (_e, matricule: number) =>
  db.prepare("DELETE FROM users WHERE matricule = ?").run(matricule)
);

ipcMain.handle("send-password-email", async (_e, email: string) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Update the user's password in the database
    db.prepare("UPDATE users SET mot_de_passe = ? WHERE email = ?").run(
      tempPassword,
      email
    );

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-app-password",
      },
    });

    // Send the email
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Votre mot de passe temporaire",
      text: `Votre mot de passe temporaire est : ${tempPassword}`,
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-tickets", () => db.prepare("SELECT * FROM tickets").all());
ipcMain.handle("get-tickets-by-matricule", (_e, matricule: number) =>
  db
    .prepare(
      `SELECT tickets.*, users.nom, users.email
     FROM tickets
     JOIN users ON tickets.matricule = users.matricule
     WHERE tickets.matricule = ?`
    )
    .all(matricule)
);

ipcMain.handle("add-ticket", (_e, ticket) => {
  try {
    db.prepare(
      `INSERT INTO tickets (matricule, nomPrenom, nombre, typeTicket, offre) VALUES (?, ?, ?, ?, ?)`
    ).run(
      ticket.matricule,
      ticket.nomPrenom,
      ticket.nombre,
      ticket.typeTicket,
      ticket.offre
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("delete-ticket", (_e, matricule: number) => {
  try {
    db.prepare("DELETE FROM tickets WHERE matricule = ?").run(matricule);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Add these handlers after the existing ticket handlers

ipcMain.handle("update-ticket", (_e, ticket) => {
  try {
    const result = db
      .prepare(
        `UPDATE tickets
       SET nomPrenom = ?, nombre = ?, typeTicket = ?, offre = ?
       WHERE id = ?`
      )
      .run(
        ticket.nomPrenom,
        ticket.nombre,
        ticket.typeTicket,
        ticket.offre,
        ticket.id
      );

    if (result.changes > 0) {
      return { success: true };
    } else {
      return { success: false, message: "Ticket not found" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("delete-ticket-by-id", (_e, ticketId: number) => {
  try {
    const result = db.prepare("DELETE FROM tickets WHERE id = ?").run(ticketId);

    if (result.changes > 0) {
      return { success: true };
    } else {
      return { success: false, message: "Ticket not found" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
});
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
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
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
