import type { User } from "@/types/user";
import { AuthService } from "@/utils/services/authService";
import { useCallback, useState } from "react";

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.signInWithGoogle();
      return user;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, signIn };
}


