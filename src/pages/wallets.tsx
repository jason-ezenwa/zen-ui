import { useCallback, useEffect, useState } from "react";
import MainLayout from "@/layouts";
import { useAxios } from "@/hooks/use-axios";
import { Deposit, Wallet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletFundModal } from "@/components/wallet-fund-modal";
import { WalletCreateModal } from "@/components/wallet-create-modal";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/column-definitions/deposits";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DepositResponse = {
  deposits: Deposit[];
  totalPages: number;
  totalRecords: number;
  page: number;
  numberOfRecordsPerPage: number;
};

export default function WalletsPage() {
  const [isFunding, setIsFunding] = useState<string | null>(null);
  const { loading, error, request, response } = useAxios<{
    wallets: Wallet[];
  }>();
  const [page, setPage] = useState(1);

  const {
    loading: depositsLoading,
    error: depositsError,
    request: fetchDepositsRequest,
    response: depositsResponse,
  } = useAxios<DepositResponse>();

  const { request: fundRequest, loading: fundLoading } = useAxios<{
    paymentLink: string;
    depositId: string;
  }>();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      await request({
        url: "/wallets",
        method: "GET",
      });
    } catch {
      toast.error("Failed to fetch wallets. Please try again.");
    }
  };

  const fetchDeposits = useCallback(async () => {
    await fetchDepositsRequest({
      url: `/wallets/my-deposits?page=${page}`,
      method: "GET",
    });
  }, [page, fetchDepositsRequest]);

  useEffect(() => {
    fetchDeposits();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFundWallet = async (walletId: string, amount: number) => {
    setIsFunding(walletId);
    try {
      const { data } = await fundRequest({
        url: "/wallets/fund",
        method: "POST",
        data: {
          walletId,
          amount,
        },
      });

      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        toast.error("Failed to initiate funding. Please try again.");
      }
    } catch {
      toast.error("Failed to initiate funding. Please try again.");
    } finally {
      setIsFunding(null);
    }
  };

  const existingCurrencies =
    response?.data?.wallets.map((wallet) => wallet.currency) || [];

  const wallets = response?.data?.wallets || [];

  const depositsData = depositsResponse?.data;
  const deposits = depositsData?.deposits || [];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch wallets. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (depositsError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to fetch deposits. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <MainLayout>
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold">My Wallets</h1>
          <WalletCreateModal
            onComplete={fetchWallets}
            existingCurrencies={existingCurrencies}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-w-screen-md">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-10 w-36 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))
          ) : wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card key={wallet._id} className="overflow-hidden">
                <CardHeader>
                  <CardDescription>{wallet.currency} Wallet</CardDescription>
                  <CardTitle className="@[250px]/card:text-3xl text-4xl font-semibold tabular-nums font-[AeonikPro]">
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  {wallet.currency === "NGN" ? (
                    <WalletFundModal
                      wallet={wallet}
                      onFund={handleFundWallet}
                      isLoading={fundLoading}
                      isFunding={isFunding === wallet._id}
                    />
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      Funding not available
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No wallets found.</p>
              <Button onClick={fetchWallets} variant="outline" className="mt-4">
                Refresh
              </Button>
            </div>
          )}
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col gap-6">
          <h2 className="text-xl lg:text-2xl font-bold">Deposits</h2>
          <DataTable
            columns={columns}
            data={deposits}
            loading={depositsLoading}
          />

          {depositsData && (
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground mr-4">
                  {depositsData.totalRecords === 0
                    ? "Showing 0 transactions"
                    : depositsData.totalRecords === 1
                    ? "Showing 1 transaction"
                    : `Showing ${
                        (page - 1) * depositsData.numberOfRecordsPerPage + 1
                      } to ${Math.min(
                        page * depositsData.numberOfRecordsPerPage,
                        depositsData.totalRecords
                      )} of ${depositsData.totalRecords} transactions`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    depositsData.totalRecords === 0 ||
                    page * depositsData.numberOfRecordsPerPage >=
                      depositsData.totalRecords ||
                    loading
                  }>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
