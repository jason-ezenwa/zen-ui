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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VirtualCard } from "@/lib/types";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import { WalletIcon } from "lucide-react";

interface VirtualCardFundModalProps {
  card: VirtualCard;
  onRefresh: () => void;
}

export function FundVirtualCardModal({
  card,
  onRefresh,
}: VirtualCardFundModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { request } = useAxios();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setAmount("");
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount) {
      setError("Please enter an amount");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const response = await request({
        url: `/virtual-cards/${card.cardId}/fund`,
        method: "POST",
        data: { amount: numAmount },
      });

      if (response.status === 200) {
        toast.success("Card funded successfully");
        setOpen(false);
        onRefresh();
      } else {
        toast.error(
          response.data.message ||
            response.data.error ||
            "Failed to fund card. Please try again later."
        );
      }
    } catch {
      toast.error("Failed to fund card. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1 h-8 text-sm">
          <WalletIcon className="h-3 w-3 mr-2" />
          Fund Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund Virtual Card</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ({card.currency})</Label>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                autoFocus
                disabled={isLoading}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter className="flex flex-col lg:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Fund Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
