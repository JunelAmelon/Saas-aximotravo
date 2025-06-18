import { Timestamp } from "firebase/firestore";
import { addDocument, deleteDocument, getDocument, queryDocuments, updateDocument } from "../firebase/firestore";

export interface Event {
  id?: string;
  name: string; // nom de l'événement
  address: string;
  projectId: string;
  start: string; // ISO string
  end: string; // ISO string
  timestamp: any; // Firestore timestamp
  type: string; // ex: "visite"
  typeColor: string; // ex: "bg-green-50 text-green-800 border-green-200"
  status: "planned" | "in_progress" | "completed" | "cancelled";
}


const COLLECTION_NAME = "events";

export const eventService = {
  // Créer un nouvel événement
  async create(event: Omit<Event, "id">): Promise<Event> {
    const data = await addDocument(COLLECTION_NAME, event);
    return data as Event;
  },

  // Obtenir un événement par ID
  async getById(id: string): Promise<Event | null> {
    const data = await getDocument(COLLECTION_NAME, id);
    return data as Event | null;
  },

  // Mettre à jour un événement
  async update(id: string, data: Partial<Event>): Promise<Event> {
    const updatedData = await updateDocument(COLLECTION_NAME, id, data);
    return updatedData as Event;
  },

  // Supprimer un événement
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTION_NAME, id);
  },

  // Obtenir tous les événements d'un projet
  async getByProjectId(projectId: string): Promise<Event[]> {
    const events = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "projectId", operator: "==", value: projectId }],
      [{ field: "date", direction: "asc" }]
    );
    return events as Event[];
  },

  // Obtenir les événements par date (pour un calendrier)
  async getByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const events = await queryDocuments(
      COLLECTION_NAME,
      [
        { field: "date", operator: ">=", value: startDate },
        { field: "date", operator: "<=", value: endDate }
      ],
      [{ field: "date", direction: "asc" }]
    );
    return events as Event[];
  },

  // Obtenir les événements par participant
  async getByParticipant(userId: string): Promise<Event[]> {
    const events = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "participants", operator: "array-contains", value: userId }],
      [{ field: "date", direction: "asc" }]
    );
    return events as Event[];
  },

  // Obtenir les événements par statut
  async getByStatus(status: Event["status"]): Promise<Event[]> {
    const events = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "status", operator: "==", value: status }],
      [{ field: "date", direction: "asc" }]
    );
    return events as Event[];
  }
};
