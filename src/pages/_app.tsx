import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      <Toaster />
    </div>
  );
}
