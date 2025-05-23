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
import { PlusIcon } from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp";

interface VirtualCardCreateModalProps {
  onComplete?: () => void;
}

export function VirtualCardCreateModal({
  onComplete,
}: VirtualCardCreateModalProps) {
  const [cardPin, setCardPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState(false);

  const { request: createRequest, loading: isLoading } = useAxios();

  const handleCreateCard = async () => {
    try {
      const response = await createRequest({
        url: "/virtual-cards",
        method: "POST",
        data: {
          currency: "USD",
          brand: "VISA",
          cardPin,
        },
      });

      if (response.status === 201) {
        toast.success("Virtual card created successfully");
        setCardPin("");
        onComplete && onComplete();
        return true;
      }
      toast.error(response.data.error || "Failed to create virtual card");
    } catch (err) {
      toast.error("Failed to create virtual card. Please try again.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardPin) {
      setError("Please enter a PIN");
      return;
    }

    if (cardPin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    const success = await handleCreateCard();
    if (success) {
      setOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setCardPin("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-col items-center justify-center">
          <DialogTitle>Create Virtual Card</DialogTitle>
          <DialogDescription>
            Enter a 4-digit PIN for your new virtual card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 justify-center">
            <div className="grid gap-2 justify-center">
              <Label htmlFor="cardPin" className="text-center justify-center">
                Card PIN
              </Label>
              <InputOTP maxLength={4} value={cardPin} onChange={setCardPin}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <div>
              <p className="text-sm text-center text-muted-foreground">
                Note: Only USD VISA cards are currently supported.
              </p>
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
              {isLoading ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
