import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUsers: () => Promise<any[]>; // You may want to define a User type for better typing
      getUserById: (matricule: number) => Promise<any | null>;
      getUserByEmail: (email: string) => Promise<any | null>;
      addUser: (userData: {
        matricule: number;
        login: string;
        nom: string;
        email: string;
        adresse: string;
        mot_de_passe: string;
      }) => Promise<void>;
      updateUser: (userData: {
        login: string;
        nom: string;
        email: string;
        adresse: string;
        mot_de_passe: string;
      }) => Promise<void>;
      deleteUser: (matricule: number) => Promise<void>;
    };
  }
}
