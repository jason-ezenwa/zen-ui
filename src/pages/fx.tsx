import { useCallback, useEffect, useState } from "react";
import MainLayout from "@/layouts";
import { useAxios } from "@/hooks/use-axios";
import { Wallet, CurrencyExchange } from "@/lib/types";
import { toast } from "sonner";
import { CurrencyExchangeQuote } from "@/components/currency-exchange-quote";
import { CurrencyExchangeExecute } from "@/components/currency-exchange-execute";
import { AlertCircleIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loading } from "@/components/loading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/column-definitions/fx-transactions";
import { Button } from "@/components/ui/button";

interface QuoteData {
  quoteReference: string;
  sourceAmount: number;
  targetAmount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
}

type FXTransactionsResponse = {
  fxTransactions: CurrencyExchange[];
  totalPages: number;
  totalRecords: number;
  page: number;
  numberOfRecordsPerPage: number;
};

export default function FXPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [page, setPage] = useState(1);
  const { loading, request } = useAxios<{ wallets: Wallet[] }>();

  const {
    loading: fxTransactionsLoading,
    error: fxTransactionsError,
    request: fetchFXTransactionsRequest,
    response: fxTransactionsResponse,
  } = useAxios<FXTransactionsResponse>();

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

  const fetchFXTransactions = useCallback(async () => {
    await fetchFXTransactionsRequest({
      url: `/fx/my-transactions?page=${page}`,
      method: "GET",
    });
  }, [page, fetchFXTransactionsRequest]);

  useEffect(() => {
    fetchFXTransactions();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
    fetchFXTransactions(); // Refresh FX transactions after successful exchange
  };

  const fxTransactionsData = fxTransactionsResponse?.data;
  const fxTransactions = fxTransactionsData?.fxTransactions || [];

  if (loading) {
    return <Loading />;
  }

  return (
    <MainLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center">
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

      <Separator className="my-6" />

      <div className="flex flex-col gap-6">
        <h2 className="text-xl lg:text-2xl font-bold">FX Transactions</h2>
        <DataTable
          columns={columns}
          data={fxTransactions}
          loading={fxTransactionsLoading}
        />

        {fxTransactionsData && (
          <div className="flex items-center justify-end mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground mr-4">
                {fxTransactionsData.totalRecords === 0
                  ? "Showing 0 transactions"
                  : fxTransactionsData.totalRecords === 1
                  ? "Showing 1 transaction"
                  : `Showing ${
                      (page - 1) * fxTransactionsData.numberOfRecordsPerPage + 1
                    } to ${Math.min(
                      page * fxTransactionsData.numberOfRecordsPerPage,
                      fxTransactionsData.totalRecords
                    )} of ${fxTransactionsData.totalRecords} transactions`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || fxTransactionsLoading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={
                  fxTransactionsData.totalRecords === 0 ||
                  page * fxTransactionsData.numberOfRecordsPerPage >=
                    fxTransactionsData.totalRecords ||
                  fxTransactionsLoading
                }>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
