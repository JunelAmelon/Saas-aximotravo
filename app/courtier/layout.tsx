"use client";

import { ReactNode } from "react";
import MainLayout from "@/components/layout/MainLayout";

export default function CourtierLayout({ children }: { children: ReactNode }) {
  return <MainLayout userRole="courtier">{children}</MainLayout>;
}