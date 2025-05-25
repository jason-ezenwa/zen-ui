import { useCallback, useEffect, useState } from "react";
import MainLayout from "@/layouts";
import { useAxios } from "@/hooks/use-axios";
import { CardTransaction, VirtualCard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VirtualCardCreateModal } from "@/components/virtual-card-create-modal";
import { VirtualCardItem } from "@/components/virtual-card-item";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CreditCardIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/column-definitions/card-transactions";

type CardTransactionsResponse = {
  cardTransactions: CardTransaction[];
  totalPages: number;
  totalRecords: number;
  page: number;
  numberOfRecordsPerPage: number;
};

export default function VirtualCardsPage() {
  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([]);
  const [page, setPage] = useState(1);
  const { loading, error, request } = useAxios<{
    virtualCards: VirtualCard[];
  }>();

  const {
    loading: transactionsLoading,
    error: transactionsError,
    request: fetchTransactionsRequest,
    response: transactionsResponse,
  } = useAxios<CardTransactionsResponse>();

  useEffect(() => {
    fetchVirtualCards();
  }, []);

  const fetchVirtualCards = async () => {
    try {
      const { data } = await request({
        url: "/virtual-cards",
        method: "GET",
      });

      if (data?.virtualCards) {
        setVirtualCards(data.virtualCards);
      }
    } catch {
      toast.error("Failed to fetch virtual cards. Please try again.");
    }
  };

  const fetchTransactions = useCallback(async () => {
    await fetchTransactionsRequest({
      url: `/virtual-cards/my-transactions?page=${page}`,
      method: "GET",
    });
  }, [page, fetchTransactionsRequest]);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const transactionsData = transactionsResponse?.data;
  const transactions = transactionsData?.cardTransactions || [];

  return (
    <MainLayout>
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl lg:text-2xl font-bold">My Virtual Cards</h1>
          <VirtualCardCreateModal onComplete={fetchVirtualCards} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:max-w-screen-md">
          {loading ? (
            Array(2)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="border rounded-lg p-6 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-32 mt-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
          ) : virtualCards.length > 0 ? (
            virtualCards.map((card) => (
              <VirtualCardItem
                key={card._id}
                card={card}
                onRefresh={fetchVirtualCards}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted mb-4">
                <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No virtual cards found.</p>
              <Button
                onClick={fetchVirtualCards}
                variant="outline"
                className="mt-4">
                Refresh
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {`Create your first virtual card by clicking the "Create Card"
                button above.`}
              </p>
            </div>
          )}
          {error && (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">
                Failed to fetch virtual cards. Please try again.
              </p>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-6">
          <h2 className="text-xl lg:text-2xl font-bold">Card Transactions</h2>
          <DataTable
            columns={columns}
            data={transactions}
            loading={transactionsLoading}
          />

          {transactionsData && (
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground mr-4">
                  {transactionsData.totalRecords === 0
                    ? "Showing 0 transactions"
                    : transactionsData.totalRecords === 1
                    ? "Showing 1 transaction"
                    : `Showing ${
                        (page - 1) * transactionsData.numberOfRecordsPerPage + 1
                      } to ${Math.min(
                        page * transactionsData.numberOfRecordsPerPage,
                        transactionsData.totalRecords
                      )} of ${transactionsData.totalRecords} transactions`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || transactionsLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={
                    transactionsData.totalRecords === 0 ||
                    page * transactionsData.numberOfRecordsPerPage >=
                      transactionsData.totalRecords ||
                    transactionsLoading
                  }>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {transactionsError && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Failed to fetch card transactions. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
