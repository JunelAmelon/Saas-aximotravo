"use client";

import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <MainLayout userRole="admin">{children}</MainLayout>;
}