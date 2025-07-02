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

// Create restoration table first (no foreign key dependencies)
db.prepare(
  `CREATE TABLE IF NOT EXISTS restoration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE
  );`
).run();

// Create tickets table with foreign key constraint on matricule and restoration_id
db.prepare(
  `CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule INTEGER NOT NULL,
    nomPrenom TEXT NOT NULL,
    nombre INTEGER NOT NULL,
    typeTicket TEXT NOT NULL,
    offre TEXT NOT NULL,
    restoration TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricule) REFERENCES users(matricule) ON DELETE CASCADE
  );`
).run();

// Add some default restoration entries if none exist
const restoCount = db
  .prepare("SELECT COUNT(*) as count FROM restoration")
  .get().count;
if (restoCount === 0) {
  const defaultRestorations = [
    "Restaurant A",
    "Restaurant B",
    "Cafétéria",
    "Snack Bar",
  ];
  const insertResto = db.prepare("INSERT INTO restoration (nom) VALUES (?)");

  defaultRestorations.forEach((name) => {
    try {
      insertResto.run(name);
    } catch (error) {
      console.log(`Restaurant ${name} might already exist`);
    }
  });
}

// User handlers
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
    const transporter = nodemailer.createTransporter({
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

// Ticket handlers with proper restoration support
ipcMain.handle("get-tickets", () => {
  return db
    .prepare(
      `SELECT
         t.*,
         r.nom as restoration_name
       FROM tickets t
       LEFT JOIN restoration r ON t.restoration = r.nom
      `
    )
    .all();
});

ipcMain.handle("get-tickets-by-matricule", (_e, matricule: number) =>
  db
    .prepare(
      `SELECT
         t.*,
         r.nom as restoration_name
       FROM tickets t
       LEFT JOIN restoration r ON t.restoration = r.nom
       WHERE t.matricule = ?
      `
    )
    .all(matricule)
);

ipcMain.handle("add-ticket", (_e, ticket) => {
  try {
    db.prepare(
      `INSERT INTO tickets (matricule, nomPrenom, nombre, typeTicket, offre, restoration)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      ticket.matricule,
      ticket.nomPrenom,
      ticket.nombre,
      ticket.typeTicket,
      ticket.offre,
      ticket.restoration
    );
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("update-ticket", (_e, ticket) => {
  try {
    const result = db
      .prepare(
        `UPDATE tickets
         SET nomPrenom = ?, nombre = ?, typeTicket = ?, offre = ?, restoration = ?
         WHERE id = ?`
      )
      .run(
        ticket.nomPrenom,
        ticket.nombre,
        ticket.typeTicket,
        ticket.offre,
        ticket.restoration,
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

ipcMain.handle("delete-ticket", (_e, matricule: number) => {
  try {
    db.prepare("DELETE FROM tickets WHERE matricule = ?").run(matricule);
    return { success: true };
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

// Restoration CRUD handlers
ipcMain.handle("get-restorations", () => {
  try {
    return db.prepare("SELECT * FROM restoration ORDER BY nom").all();
  } catch (error) {
    console.error("Error fetching restorations:", error);
    return [];
  }
});

ipcMain.handle("add-restoration", (_e, resto: { nom: string }) => {
  try {
    db.prepare("INSERT INTO restoration (nom) VALUES (?)").run(resto.nom);
    return { success: true };
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { success: false, message: "Restaurant name already exists" };
    }
    return { success: false, message: error.message };
  }
});

ipcMain.handle(
  "update-restoration",
  (_e, resto: { id: number; nom: string }) => {
    try {
      const result = db
        .prepare("UPDATE restoration SET nom = ? WHERE id = ?")
        .run(resto.nom, resto.id);
      if (result.changes > 0) {
        return { success: true };
      } else {
        return { success: false, message: "Restoration not found" };
      }
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return { success: false, message: "Restaurant name already exists" };
      }
      return { success: false, message: error.message };
    }
  }
);

ipcMain.handle("delete-restoration", (_e, id: number) => {
  try {
    // Check if any tickets are using this restoration
    const ticketsUsingResto = db
      .prepare(
        "SELECT COUNT(*) as count FROM tickets WHERE restoration = (SELECT nom FROM restoration WHERE id = ?)"
      )
      .get(id);

    if (ticketsUsingResto.count > 0) {
      return {
        success: false,
        message: `Cannot delete restaurant. ${ticketsUsingResto.count} ticket(s) are using this restaurant.`,
      };
    }

    const result = db.prepare("DELETE FROM restoration WHERE id = ?").run(id);
    if (result.changes > 0) {
      return { success: true };
    } else {
      return { success: false, message: "Restoration not found" };
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

// Image generation import and handler
import { generatePixelAnimalImage } from "./modules/img_gen";

async function handleImageGeneration() {
  try {
    // Use proper paths - input image from resources, output to user data
    const inputImagePath = path.join(__dirname, "../../resources/img.png");
    const outputDir = path.join(app.getPath("userData"), "generated_images");

    const savedFiles = await generatePixelAnimalImage(
      inputImagePath,
      outputDir
    );
    console.log("Image generation completed!", savedFiles);
    return { success: true, files: savedFiles };
  } catch (error) {
    console.error("Failed to generate image:", error);
    return { success: false, error: error.message };
  }
}

ipcMain.handle("generate-pixel-animal", async (_e) => {
  return await handleImageGeneration();
});
