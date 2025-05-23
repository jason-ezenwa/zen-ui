import { useEffect, useState } from "react";
import MainLayout from "@/layouts";
import { useAxios } from "@/hooks/use-axios";
import { Wallet } from "@/lib/types";
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

export default function WalletsPage() {
  const [isFunding, setIsFunding] = useState<string | null>(null);
  const { loading, error, request, response } = useAxios<{
    wallets: Wallet[];
  }>();
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
    } catch (err) {
      toast.error("Failed to fetch wallets. Please try again.");
    }
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
    } catch (err) {
      toast.error("Failed to initiate funding. Please try again.");
    } finally {
      setIsFunding(null);
    }
  };

  const existingCurrencies =
    response?.data?.wallets.map((wallet) => wallet.currency) || [];

  const wallets = response?.data?.wallets || [];

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
      </div>
    </MainLayout>
  );
}
