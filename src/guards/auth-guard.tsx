"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/loading";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { authState, loadingAuth } = useAuth();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const protectedRoutes = [
    "/dashboard",
    "/storage",
    "/api-docs",
    "/admin",
    "/settings",
  ];

  const authRoutes = ["/login", "/signup"];

  useEffect(() => {
    const isAuthenticated = authState === "authenticated";
    const isProtectedRoute = protectedRoutes.includes(router.pathname);
    const isAuthPage = authRoutes.includes(router.pathname);

    if (loadingAuth) {
      return;
    }

    // Handle redirects - set redirecting state and don't set isReady
    if (isProtectedRoute && !isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/login");
      return;
    }

    if (isAuthPage && isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/dashboard");
      return;
    }

    if (router.pathname === "/" && isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/dashboard");
      return;
    }

    setIsRedirecting(false);
  }, [router, loadingAuth, authState]);

  if (authState === "loading" || isRedirecting) {
    return <Loading />;
  }

  return <>{children}</>;
}
