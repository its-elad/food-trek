import { createContext, useContext, useCallback, type ReactNode } from "react";
import { logoutUser, getUserInfo } from "../api/authApi.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { UserInfo } from "@food-trek/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface AuthContextValue {
  user: UserInfo | null;
  isGetUserLoading: boolean;
  setUser: (userData: UserInfo | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const getUserQuery = useQuery({
    queryKey: getUserInfo().key,
    queryFn: getUserInfo().fn,
    retry(_failureCount, error) {
      return error instanceof AxiosError && error.response?.status !== 401;
    },
  });

  const setUser = useCallback(
    (userData: UserInfo | null) => {
      queryClient.setQueryData(getUserInfo().key, userData);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser.fn();
    } catch {
      // best-effort
    }
    setUser(null);
  }, [setUser]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <AuthContext.Provider
        value={{
          user: getUserQuery.data ?? null,
          isGetUserLoading: getUserQuery.isLoading,
          setUser,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
