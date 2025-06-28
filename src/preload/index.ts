import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  getUsers: () => ipcRenderer.invoke("get-users"),
  addUser: (name: string) => ipcRenderer.invoke("add-user", name),
  updateUser: (id: number, name: string) =>
    ipcRenderer.invoke("update-user", id, name),
  deleteUser: (id: number) => ipcRenderer.invoke("delete-user", id),
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("electron", electronAPI);
  contextBridge.exposeInMainWorld("api", api);
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
}
type