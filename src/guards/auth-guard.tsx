"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookie from "js-cookie";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/loading";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { authState, loadingAuth } = useAuth();

  const [isReady, setIsReady] = useState(false);

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

    if (isProtectedRoute && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (isAuthPage && isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    if (router.pathname === "/" && isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    setIsReady(true);
  }, [router, loadingAuth]);

  if (authState === "loading" || !isReady) {
    return <Loading />;
  }

  return <>{children}</>;
}
