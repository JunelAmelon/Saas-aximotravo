import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";
import { getAllClientProjects } from "@/hooks/project";
import { getAllClientPayments } from "@/hooks/payments";

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalPaid: number;
  totalLeft: number;
  averageProgress: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const projectsData = await getAllClientProjects(user.uid);
        setProjects(projectsData);
        const paymentsData = await getAllClientPayments(user.uid);
        setPayments(paymentsData);

        const totalProjects = projectsData.length;
        const activeProjects = projectsData.filter((p: any) => p.status === "En cours").length;
        const totalBudget = projectsData.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
        const totalPaid = projectsData.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
        const totalLeft = totalBudget - totalPaid;
        const averageProgress =
          projectsData.length > 0
            ? Math.round(
                projectsData.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projectsData.length
              )
            : 0;

        setStats({
          totalProjects,
          activeProjects,
          totalBudget,
          totalPaid,
          totalLeft,
          averageProgress,
        });
      } catch (e) {
        setStats(null);
        setProjects([]);
        setPayments([]);
      }
      setLoading(false);
    }
    if (user?.uid) fetchStats();
  }, [user?.uid]);

  return { stats, loading, projects, payments };
}
