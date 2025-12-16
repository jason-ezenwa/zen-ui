import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import AuthGuard from "@/guards/auth-guard";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Zen Finance - International Payments</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <AuthProvider>
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        </AuthProvider>
        <Toaster />
      </ThemeProvider>
    </div>
  );
}
