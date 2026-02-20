import { createContext, useContext, useCallback, type ReactNode } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  googleLogin,
  getUserInfo,
} from "../api/authApi.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { LoginReq, RegisterReq, UserInfo } from "@food-trek/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface AuthContextValue {
  user: UserInfo | null;
  isGetUserLoading: boolean;
  login: (data: LoginReq) => unknown;
  register: (data: RegisterReq) => unknown;
  loginWithGoogle: (credential: string) => unknown;
  logout: () => unknown;
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

  const loginMutation = useMutation({
    mutationKey: loginUser().key,
    mutationFn: loginUser().fn,
    meta: { disableLoadingDefault: true },
    onSuccess(userData) {
      queryClient.setQueryData(getUserInfo().key, userData);
    },
  });

  const registerMutation = useMutation({
    mutationKey: registerUser().key,
    mutationFn: registerUser().fn,
    meta: { disableLoadingDefault: true },
    onSuccess(userData) {
      queryClient.setQueryData(getUserInfo().key, userData);
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationKey: googleLogin().key,
    mutationFn: googleLogin().fn,
    meta: { disableLoadingDefault: true },
    onSuccess(userData) {
      queryClient.setQueryData(getUserInfo().key, userData);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutUser().fn();
    } catch {
      // best-effort
    }
    queryClient.setQueryData(getUserInfo().key, null);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <AuthContext.Provider
        value={{
          user: getUserQuery.data ?? null,
          isGetUserLoading: getUserQuery.isLoading,
          login: loginMutation.mutateAsync,
          register: registerMutation.mutateAsync,
          loginWithGoogle: loginWithGoogleMutation.mutateAsync,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
