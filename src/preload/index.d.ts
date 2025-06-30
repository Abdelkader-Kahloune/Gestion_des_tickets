import type { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getUsers: () => Promise<any[]>;
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
      sendPasswordByEmail: (
        email: string
      ) => Promise<{ success: boolean; message?: string }>;
      getTickets: () => Promise<any[]>;
      addTicket: (ticket: {
        matricule: number;
        nomPrenom: string;
        nombre: number;
        typeTicket: string;
        offre: string;
      }) => Promise<{ success: boolean; message?: string }>;
      deleteTicket: (
        matricule: number
      ) => Promise<{ success: boolean; message?: string }>;
      getTicketsByMatricule: (matricule: number) => Promise<any[]>;
      updateTicket: (ticket: {
        id: number;
        nomPrenom: string;
        nombre: number;
        typeTicket: string;
        offre: string;
      }) => Promise<{ success: boolean; message?: string }>;
      deleteTicketById: (
        ticketId: number
      ) => Promise<{ success: boolean; message?: string }>;
    };
  }
}
