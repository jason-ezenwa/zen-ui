import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRightIcon, RefreshCcwIcon } from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import { Wallet } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CurrencyExchangeQuoteProps {
  wallets: Wallet[];
  onQuoteGenerated: (quoteData: {
    quoteReference: string;
    sourceAmount: number;
    targetAmount: number;
    sourceCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
  }) => void;
}

export function CurrencyExchangeQuote({
  wallets,
  onQuoteGenerated,
}: CurrencyExchangeQuoteProps) {
  const [sourceCurrency, setSourceCurrency] = useState<string>("");
  const [targetCurrency, setTargetCurrency] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [targetAmount, setTargetAmount] = useState<number | null>(null);

  const { request, loading } = useAxios();

  // Reset exchange rate and target amount when source/target currencies or amount changes
  useEffect(() => {
    setExchangeRate(null);
    setTargetAmount(null);
  }, [sourceCurrency, targetCurrency, amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const validateForm = () => {
    if (!sourceCurrency) {
      setError("Please select a source currency");
      return false;
    }

    if (!targetCurrency) {
      setError("Please select a target currency");
      return false;
    }

    if (sourceCurrency === targetCurrency) {
      setError("Source and target currencies must be different");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    const sourceWallet = wallets.find((w) => w.currency === sourceCurrency);
    if (sourceWallet && sourceWallet.balance < parseFloat(amount)) {
      setError(`Insufficient ${sourceCurrency} balance`);
      return false;
    }

    return true;
  };

  const handleGenerateQuote = async () => {
    if (!validateForm()) return;

    try {
      const { data } = await request({
        url: "/fx/generate-quote",
        method: "POST",
        data: {
          sourceCurrency,
          targetCurrency,
          amount: parseFloat(amount),
        },
      });

      if (data) {
        setExchangeRate(data.exchangeRate);
        setTargetAmount(data.targetAmount);
        onQuoteGenerated({
          quoteReference: data.quoteReference,
          sourceAmount: parseFloat(amount),
          targetAmount: data.targetAmount,
          sourceCurrency,
          targetCurrency,
          exchangeRate: data.exchangeRate,
        });
        toast.success("Exchange quote generated successfully");
      }
    } catch (err) {
      toast.error("Failed to generate exchange quote. Please try again.");
    }
  };

  const getSourceWalletBalance = () => {
    const wallet = wallets.find((w) => w.currency === sourceCurrency);
    return wallet ? wallet.balance : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Exchange Quote</CardTitle>
        <CardDescription>
          Select currencies and amount to get an exchange rate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceCurrency">From</Label>
              <Select value={sourceCurrency} onValueChange={setSourceCurrency}>
                <SelectTrigger id="sourceCurrency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.currency} value={wallet.currency}>
                      {wallet.currency} (
                      {formatCurrency(wallet.balance, wallet.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sourceCurrency && (
                <p className="text-xs text-muted-foreground">
                  Available:{" "}
                  {formatCurrency(getSourceWalletBalance(), sourceCurrency)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCurrency">To</Label>
              <Select value={targetCurrency} onValueChange={setTargetCurrency}>
                <SelectTrigger id="targetCurrency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.currency} value={wallet.currency}>
                      {wallet.currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="w-full"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {exchangeRate && targetAmount && (
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    You'll exchange
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(parseFloat(amount), sourceCurrency)}
                  </p>
                </div>
                <ArrowRightIcon className="mx-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    You'll receive
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(targetAmount, targetCurrency)}
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Exchange rate: 1 {sourceCurrency} = {exchangeRate.toFixed(4)}{" "}
                  {targetCurrency}
                </p>
                <p className="text-xs text-muted-foreground">
                  Quote expires in 3 minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleGenerateQuote}
          disabled={loading}>
          {loading ? (
            <>
              <RefreshCcwIcon className="mr-2 h-4 w-4 animate-spin" />
              Generating Quote...
            </>
          ) : (
            "Generate Quote"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
