import { Timestamp } from "firebase/firestore";
import { addDocument, deleteDocument, getDocument, queryDocuments, updateDocument } from "../firebase/firestore";

export interface Plan {
  id?: string;
  title: string;
  description?: string;
  projectId: string;
  tasks: Task[];
  status: "draft" | "active" | "completed";
  createdBy: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  assignedTo?: string;
  dueDate?: Date | Timestamp;
  completedDate?: Date | Timestamp;
  priority: "low" | "medium" | "high";
  dependencies?: string[]; // IDs des tâches dont celle-ci dépend
}

const COLLECTION_NAME = "plans";

export const planService = {
  // Créer un nouveau plan
  async create(plan: Omit<Plan, "id">): Promise<Plan> {
    const data = await addDocument(COLLECTION_NAME, plan);
    return data as Plan;
  },

  // Obtenir un plan par ID
  async getById(id: string): Promise<Plan | null> {
    const data = await getDocument(COLLECTION_NAME, id);
    return data as Plan | null;
  },

  // Mettre à jour un plan
  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    const updatedData = await updateDocument(COLLECTION_NAME, id, data);
    return updatedData as Plan;
  },

  // Supprimer un plan
  async delete(id: string): Promise<void> {
    await deleteDocument(COLLECTION_NAME, id);
  },

  // Obtenir tous les plans d'un projet
  async getByProjectId(projectId: string): Promise<Plan[]> {
    const plans = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "projectId", operator: "==", value: projectId }],
      [{ field: "created_at", direction: "desc" }]
    );
    return plans as Plan[];
  },

  // Obtenir les plans par statut
  async getByStatus(status: Plan["status"]): Promise<Plan[]> {
    const plans = await queryDocuments(
      COLLECTION_NAME,
      [{ field: "status", operator: "==", value: status }],
      [{ field: "created_at", direction: "desc" }]
    );
    return plans as Plan[];
  },

  // Ajouter une tâche à un plan
  async addTask(planId: string, task: Task): Promise<Plan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const updatedTasks = [...(plan.tasks || []), task];
    return await this.update(planId, { tasks: updatedTasks });
  },

  // Mettre à jour une tâche dans un plan
  async updateTask(planId: string, taskId: string, taskData: Partial<Task>): Promise<Plan | null> {
    const plan = await this.getById(planId);
    if (!plan || !plan.tasks) return null;

    const taskIndex = plan.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return plan;

    const updatedTasks = [...plan.tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...taskData };

    return await this.update(planId, { tasks: updatedTasks });
  },

  // Supprimer une tâche d'un plan
  async removeTask(planId: string, taskId: string): Promise<Plan | null> {
    const plan = await this.getById(planId);
    if (!plan || !plan.tasks) return null;

    const updatedTasks = plan.tasks.filter(t => t.id !== taskId);
    return await this.update(planId, { tasks: updatedTasks });
  },

  // Obtenir les tâches assignées à un utilisateur
  async getTasksByUser(userId: string): Promise<{ planId: string, plan: Plan, task: Task }[]> {
    const plans = await queryDocuments(COLLECTION_NAME);

    const userTasks: { planId: string, plan: Plan, task: Task }[] = [];
    
    plans.forEach((planData) => {
      const plan = planData as Plan;
      if (plan.tasks) {
        plan.tasks.forEach(task => {
          if (task.assignedTo === userId) {
            userTasks.push({
              planId: plan.id!,
              plan,
              task
            });
          }
        });
      }
    });

    return userTasks;
  }
};
