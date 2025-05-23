import { useEffect, useState } from "react";
import MainLayout from "@/layouts";
import { useAxios } from "@/hooks/use-axios";
import { Wallet } from "@/lib/types";
import { toast } from "sonner";
import { CurrencyExchangeQuote } from "@/components/currency-exchange-quote";
import { CurrencyExchangeExecute } from "@/components/currency-exchange-execute";
import { AlertCircleIcon, ArrowLeftRightIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuoteData {
  quoteReference: string;
  sourceAmount: number;
  targetAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
}

export default function FXPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const { loading, request } = useAxios<{ wallets: Wallet[] }>();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data } = await request({
        url: "/wallets",
        method: "GET",
      });

      if (data?.wallets) {
        setWallets(data.wallets);
      }
    } catch (err) {
      toast.error("Failed to fetch wallets. Please try again.");
    }
  };

  const handleQuoteGenerated = (data: QuoteData) => {
    setQuoteData(data);
  };

  const handleReset = () => {
    setQuoteData(null);
  };

  const handleExchangeComplete = () => {
    setQuoteData(null);
    fetchWallets();
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center">
            <ArrowLeftRightIcon className="mr-2 h-5 w-5" />
            Currency Exchange (FX)
          </h1>
          <p className="text-muted-foreground mt-1">
            Exchange currencies between your wallets
          </p>
        </div>

        {wallets.length < 2 ? (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>You need at least two wallet currencies</AlertTitle>
            <AlertDescription>
              To use the currency exchange feature, you need to have at least
              two wallets with different currencies. Please create additional
              wallets first.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {!quoteData ? (
              <CurrencyExchangeQuote
                wallets={wallets}
                onQuoteGenerated={handleQuoteGenerated}
              />
            ) : (
              <CurrencyExchangeExecute
                quoteData={quoteData}
                onExchangeComplete={handleExchangeComplete}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
