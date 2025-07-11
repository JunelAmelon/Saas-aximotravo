import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useCurrentUserId() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  return uid;
}
