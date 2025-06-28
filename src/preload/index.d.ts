import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUsers: () => Promise<{ id: number; name: string }[]>;
      addUser: (name: string) => Promise<void>;
      updateUser: (id: number, name: string) => Promise<void>;
      deleteUser: (id: number) => Promise<void>;
    };
  }
}
