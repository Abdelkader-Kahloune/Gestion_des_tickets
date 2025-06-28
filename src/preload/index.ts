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
    login: string;
    nom: string;
    email: string;
    adresse: string;
    mot_de_passe: string;
  }) => ipcRenderer.invoke("update-user", userData),

  deleteUser: (matricule: number) =>
    ipcRenderer.invoke("delete-user", matricule),
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
