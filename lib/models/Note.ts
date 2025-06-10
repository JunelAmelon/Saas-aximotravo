import { Timestamp } from "firebase/firestore";
import { addDocument, deleteDocument, getDocument, queryDocuments, updateDocument } from "../firebase/firestore";

export interface Note {
  id?: string;
  title: string;
  content: string;
  projectId: string;
  authorId: string;
  tags?: string[];
  isPrivate?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

const COLLECTION_NAME = "notes";

export const noteService = {
  // Créer une nouvelle note
  async create(note: Omit<Note, "id">): Promise<Note> {
    const data = await addDocument(COLLECTION_NAME, note);
    return data as Note;
  },

  // Obtenir une note par ID
  async getById(id: string): Promise<Note | null> {
    const data = await getDocument(COLLECTION_NAME, id);
    return data as Note | null;
  },

  // Mettre à jour une note
  async update(id: string, data: Partial<Note>): Promise<Note> {
    const updatedData = await updateDocument(COLLECTION_NAME, id, data);
    return updatedData as Note;
  },

  // Supprimer une note
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTION_NAME, id);
  },

  // Obtenir toutes les notes d'un projet
  async getByProjectId(projectId: string): Promise<Note[]> {
    const notes = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "projectId", operator: "==", value: projectId }],
      [{ field: "created_at", direction: "desc" }]
    );
    return notes as Note[];
  },

  // Obtenir les notes d'un projet accessibles à un utilisateur
  async getAccessibleNotesByProjectId(projectId: string, userId: string): Promise<Note[]> {
    // Les notes sont accessibles si elles sont publiques ou si l'utilisateur en est l'auteur
    const publicNotes = await queryDocuments(
      COLLECTION_NAME,
      [
        { field: "projectId", operator: "==", value: projectId },
        { field: "isPrivate", operator: "==", value: false }
      ],
      [{ field: "created_at", direction: "desc" }]
    );

    const privateNotes = await queryDocuments(
      COLLECTION_NAME,
      [
        { field: "projectId", operator: "==", value: projectId },
        { field: "authorId", operator: "==", value: userId },
        { field: "isPrivate", operator: "==", value: true }
      ],
      [{ field: "created_at", direction: "desc" }]
    );

    return [...publicNotes, ...privateNotes] as Note[];
  },

  // Rechercher des notes par tag
  async getByTag(tag: string): Promise<Note[]> {
    const notes = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "tags", operator: "array-contains", value: tag }],
      [{ field: "created_at", direction: "desc" }]
    );
    return notes as Note[];
  },

  // Obtenir les notes par auteur
  async getByAuthor(authorId: string): Promise<Note[]> {
    const notes = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "authorId", operator: "==", value: authorId }],
      [{ field: "created_at", direction: "desc" }]
    );
    return notes as Note[];
  }
};
