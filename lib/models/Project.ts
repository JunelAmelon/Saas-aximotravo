import { Timestamp } from "firebase/firestore";
import { addDocument, deleteDocument, getDocument, queryDocuments, updateDocument } from "../firebase/firestore";

export interface Project {
  id?: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "archived";
  clientId: string;
  managerId?: string;
  team?: string[];
  startDate?: Date | Timestamp;
  endDate?: Date | Timestamp;
  budget?: number;
  paidAmount?: number; // Pour cohérence avec le front
  location?: string; // Pour cohérence avec le front
  addressDetails?: string; // Nouveau champ pour infos complémentaires sur l'adresse
  created_at?: Timestamp;
  updated_at?: Timestamp;
  amoIncluded?: boolean;
}

const COLLECTION_NAME = "projects";

export const projectService = {
  // Créer un nouveau projet
  async create(project: Omit<Project, "id">): Promise<Project> {
    const data = await addDocument(COLLECTION_NAME, project);
    return data as Project;
  },

  // Obtenir un projet par ID
  async getById(id: string): Promise<Project | null> {
    const data = await getDocument(COLLECTION_NAME, id);
    return data as Project | null;
  },

  // Mettre à jour un projet
  async update(id: string, data: Partial<Project>): Promise<Project> {
    const updatedData = await updateDocument(COLLECTION_NAME, id, data);
    return updatedData as Project;
  },

  // Supprimer un projet
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTION_NAME, id);
  },

  // Obtenir tous les projets d'un client
  async getByClientId(clientId: string): Promise<Project[]> {
    const projects = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "clientId", operator: "==", value: clientId }]
    );
    return projects as Project[];
  },

  // Obtenir tous les projets gérés par un utilisateur spécifique
  async getByManagerId(managerId: string): Promise<Project[]> {
    const projects = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "managerId", operator: "==", value: managerId }]
    );
    return projects as Project[];
  },

  // Obtenir tous les projets pour un membre d'équipe
  async getByTeamMember(userId: string): Promise<Project[]> {
    const projects = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "team", operator: "array-contains", value: userId }]
    );
    return projects as Project[];
  },

  // Obtenir les projets par statut
  async getByStatus(status: Project["status"]): Promise<Project[]> {
    const projects = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "status", operator: "==", value: status }]
    );
    return projects as Project[];
  }
};
