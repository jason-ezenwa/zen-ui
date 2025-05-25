import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import AuthGuard from "@/guards/auth-guard";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Zen Finance - International Payments</title>
      </Head>
      <AuthProvider>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </AuthProvider>
      <Toaster />
    </div>
  );
}
