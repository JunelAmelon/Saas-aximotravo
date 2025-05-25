"use client";

import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";

export default function ArtisanLayout({ children }: { children: ReactNode }) {
  return <MainLayout userRole="artisan">{children}</MainLayout>;
}