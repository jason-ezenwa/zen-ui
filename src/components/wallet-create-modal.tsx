import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import { Wallet } from "@/lib/types";

interface WalletCreateModalProps {
  onComplete?: () => void;
  existingCurrencies: string[];
}

export function WalletCreateModal({
  onComplete,
  existingCurrencies,
}: WalletCreateModalProps) {
  const [currency, setCurrency] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { request: createRequest, loading: isLoading } = useAxios<Wallet>();

  // Define the allowed currencies
  const allowedCurrencies = ["USD", "NGN", "GHS", "KES"];

  // Filter out currencies that user already has wallets for
  const availableCurrencies = allowedCurrencies.filter(
    (curr) => !existingCurrencies.includes(curr)
  );

  const handleCreateWallet = async (currency: string) => {
    try {
      const { data } = await createRequest({
        url: "/wallets",
        method: "POST",
        data: { currency },
      });

      if (data) {
        toast.success(`${currency} wallet created successfully`);
        onComplete?.();
      }
    } catch {
      toast.error("Failed to create wallet. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currency) {
      setError("Please select a currency");
      return;
    }

    await handleCreateWallet(currency);

    setOpen(false);
  };

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setCurrency("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
          <DialogDescription>
            Select the currency for your new wallet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              {availableCurrencies.length > 0 ? (
                <Select
                  value={currency}
                  onValueChange={(value) => {
                    setCurrency(value);
                    setError("");
                  }}
                  disabled={isLoading}>
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">
                  You already have wallets for all available currencies.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || availableCurrencies.length === 0}>
              {isLoading ? "Creating..." : "Create Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
