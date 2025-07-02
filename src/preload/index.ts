import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  getUsers: () => ipcRenderer.invoke("get-users"),

  getUserById: (matricule: number) =>
    ipcRenderer.invoke("get-user-by-id", matricule),

  getUserByEmail: (email: string) =>
    ipcRenderer.invoke("get-user-by-email", email),

  addUser: (userData: {
    matricule: number;
    login: string;
    nom: string;
    email: string;
    adresse: string;
    mot_de_passe: string;
  }) => ipcRenderer.invoke("add-user", userData),

  updateUser: (userData: {
    matricule: number; // Added matricule to match main process
    login: string;
    nom: string;
    email: string;
    adresse: string;
    mot_de_passe: string;
  }) => ipcRenderer.invoke("update-user", userData),

  deleteUser: (matricule: number) =>
    ipcRenderer.invoke("delete-user", matricule),

  sendPasswordByEmail: (email: string) =>
    ipcRenderer.invoke("send-password-email", email),

  getTickets: () => ipcRenderer.invoke("get-tickets"),

  addTicket: (ticket: {
    matricule: number;
    nomPrenom: string;
    nombre: number;
    typeTicket: string;
    offre: string;
    restoration?: string;
  }) => ipcRenderer.invoke("add-ticket", ticket),

  deleteTicket: (matricule: number) =>
    ipcRenderer.invoke("delete-ticket", matricule),

  getTicketsByMatricule: (matricule: number) =>
    ipcRenderer.invoke("get-tickets-by-matricule", matricule),

  updateTicket: (ticket: {
    id: number;
    nomPrenom: string;
    nombre: number;
    typeTicket: string;
    offre: string;
    restoration?: string;
  }) => ipcRenderer.invoke("update-ticket", ticket),

  deleteTicketById: (ticketId: number) =>
    ipcRenderer.invoke("delete-ticket-by-id", ticketId),

  // Restoration CRUD operations
  getRestorations: () => ipcRenderer.invoke("get-restorations"),

  addRestoration: (resto: { nom: string }) =>
    ipcRenderer.invoke("add-restoration", resto),

  updateRestoration: (resto: { id: number; nom: string }) =>
    ipcRenderer.invoke("update-restoration", resto),

  deleteRestoration: (id: number) =>
    ipcRenderer.invoke("delete-restoration", id),

  // Image generation
  generatePixelAnimal: () => ipcRenderer.invoke("generate-pixel-animal"),
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("electron", electronAPI);
  contextBridge.exposeInMainWorld("api", api);
} else {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.electron = electronAPI;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api = api;
}
