import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { useRouter } from "next/router";
import { User } from "@/lib/types";
import { useAxios } from "@/hooks/use-axios";
import Cookies from "js-cookie";

type AuthState = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
  user: User | null;
  authState: AuthState;
  loadingAuth: boolean;
  error: any;
  updateUser: () => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const { error, request } = useAxios<{ user: User }>();

  const updateUser = async () => {
    try {
      const { data } = await request({
        url: "/users/me",
        method: "GET",
      });

      if (data?.user) {
        setUser(data.user);
        setAuthState("authenticated");
      } else {
        setUser(null);
        setAuthState("unauthenticated");
      }
    } catch (err) {
      setUser(null);
      setAuthState("unauthenticated");
    }

    setLoadingAuth(false);
  };

  const logOut = async () => {
    Cookies.remove("token");

    window.location.href = "/login";
  };

  // This will call the updateUser on initial load and anytime the route changes
  // This allows us to revalidate each time the user page changes (example from login to dashboard)
  useEffect(() => {
    updateUser();

    // Fetch user data on route change
    const handleRouteChange = () => {
      updateUser();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthContext.Provider
      value={{ user, authState, error, updateUser, loadingAuth, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
