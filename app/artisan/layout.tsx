"use client";

import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";
import RequireAuth from "@/components/auth/RequireAuth";

export default function ArtisanLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <MainLayout userRole="artisan">{children}</MainLayout>
    </RequireAuth>
  );
}