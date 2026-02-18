import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  googleLogin,
  getUserInfo,
} from "../api/authApi.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { LoginReq, RegisterReq, UserInfo } from "@food-trek/schemas";
import { set } from "zod";

interface AuthContextValue {
  user: UserInfo | null;
  isGetUserLoading: boolean;
  login: (data: LoginReq) => Promise<void>;
  register: (data: RegisterReq) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isGetUserLoading, setIsGetUserLoading] = useState(true);

  useEffect(() => {
    setIsGetUserLoading(true);
    getUserInfo()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsGetUserLoading(false));
  }, []);

  const login = useCallback(async (data: LoginReq) => {
    const userData = await loginUser(data);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterReq) => {
    const userData = await registerUser(data);
    setUser(userData);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const userData = await googleLogin(credential);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // best-effort
    }
    setUser(null);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <AuthContext.Provider
        value={{
          user,
          isGetUserLoading,
          login,
          register,
          loginWithGoogle,
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
