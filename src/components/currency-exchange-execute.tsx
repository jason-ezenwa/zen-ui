import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightIcon, RefreshCcwIcon } from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface CurrencyExchangeExecuteProps {
  quoteData: {
    quoteReference: string;
    sourceAmount: number;
    targetAmount: number;
    sourceCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
  } | null;
  onExchangeComplete: () => void;
  onReset: () => void;
}

export function CurrencyExchangeExecute({
  quoteData,
  onExchangeComplete,
  onReset,
}: CurrencyExchangeExecuteProps) {
  const { request, loading } = useAxios();

  const handleExchange = async () => {
    if (!quoteData) return;

    try {
      const { data } = await request({
        url: "/fx/exchange-currency",
        method: "POST",
        data: {
          quoteReference: quoteData.quoteReference,
        },
      });

      if (data) {
        toast.success("Currency exchanged successfully");
        onExchangeComplete();
      }
    } catch {
      toast.error("Failed to complete exchange. The quote may have expired.");
      onReset();
    }
  };

  if (!quoteData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Exchange</CardTitle>
        <CardDescription>
          Review and complete your currency exchange.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted rounded-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{`You'll exchange`}</p>
              <p className="text-lg font-semibold">
                {formatCurrency(
                  quoteData.sourceAmount,
                  quoteData.sourceCurrency
                )}
              </p>
            </div>
            <ArrowRightIcon className="mx-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{`You'll receive`}</p>
              <p className="text-lg font-semibold">
                {formatCurrency(
                  quoteData.targetAmount,
                  quoteData.targetCurrency
                )}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Exchange rate: 1 {quoteData.sourceCurrency} ={" "}
              {quoteData.exchangeRate.toFixed(4)} {quoteData.targetCurrency}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Quote expires in 3 minutes from generation time
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onReset}
          disabled={loading}>
          Get New Quote
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={handleExchange}
          disabled={loading}>
          {loading ? (
            <>
              <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Complete Exchange"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
