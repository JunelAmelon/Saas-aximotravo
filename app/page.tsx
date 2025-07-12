"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase/config";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (loading) return;
      if (!currentUser) {
        router.replace("/auth/login");
        return;
      }
      // Aller chercher le rôle utilisateur
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const role = userDoc.data().role?.toLowerCase();
        switch (role) {
          case "courtier":
            router.replace("/courtier/dashboard");
            break;
          case "artisan":
            router.replace("/artisan/dashboard");
            break;
          case "admin":
            router.replace("/admin/dashboard");
            break;
          default:
            router.replace("/auth/login");
        }
      } else {
        router.replace("/auth/login");
      }
      setChecking(false);
    };
    checkAndRedirect();
  }, [currentUser, loading, router]);
  return null;
}