import { useState } from "react";
import { VirtualCard } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAxios } from "@/hooks/use-axios";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import {
  EyeIcon,
  EyeOffIcon,
  SnowflakeIcon,
  SunIcon,
  Loader2Icon,
  CreditCardIcon,
} from "lucide-react";

interface VirtualCardItemProps {
  card: VirtualCard;
  onRefresh: () => void;
}

export function VirtualCardItem({ card, onRefresh }: VirtualCardItemProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { request } = useAxios<{ virtualCard: VirtualCard }>();

  const handleToggleFreeze = async () => {
    setIsProcessing(true);
    try {
      const endpoint =
        card.status === "DISABLED"
          ? `/virtual-cards/${card.cardId}/unfreeze`
          : `/virtual-cards/${card.cardId}/freeze`;

      const response = await request({
        url: endpoint,
        method: "PATCH",
      });

      if (response.status === 200) {
        toast.success(
          card.status === "DISABLED"
            ? "Card unfrozen successfully"
            : "Card frozen successfully"
        );
        onRefresh();
      } else {
        throw Error("Unable to complete request");
      }
    } catch (err) {
      toast.error(
        card.status === "DISABLED"
          ? "Failed to unfreeze card. Please try again."
          : "Failed to freeze card. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = () => {
    return showDetails ? card.number : card.maskedPan;
  };

  const formatExpiryDate = () => {
    return showDetails ? `${card.expiry}` : "**/**";
  };

  const formatCvv = () => {
    return showDetails ? card.cvv : "***";
  };

  const isFrozen = card.status === "DISABLED";

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-md max-w-md gap-4 ${
        isFrozen
          ? "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          : "bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
      }`}>
      <CardHeader className="relative py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCardIcon
              className={cn(
                "h-4 w-4 text-primary",
                isFrozen && "text-slate-500"
              )}
            />
            <CardDescription className="text-xs font-medium">
              {card.brand} {card.currency} Card
              {isFrozen && (
                <span className="ml-2 text-blue-500 animate-pulse">
                  <SnowflakeIcon className="h-3 w-3 inline" /> Frozen
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            className="h-6 w-6 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {showDetails ? (
              <EyeOffIcon className="h-3 w-3" />
            ) : (
              <EyeIcon className="h-3 w-3" />
            )}
            <span className="sr-only">
              {showDetails ? "Hide card details" : "Show card details"}
            </span>
          </Button>
        </div>
        <CardTitle
          className={cn(
            "text-lg font-mono mt-2 tracking-wider",
            isFrozen && "text-slate-500"
          )}>
          {formatCardNumber()}
        </CardTitle>
        <div className="text-xs flex gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <span className="text-muted-foreground mr-1">Expires:</span>
            <span className="font-medium">{formatExpiryDate()}</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            <span className="text-muted-foreground mr-1">CVV:</span>
            <span className="font-medium">{formatCvv()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div
          className={cn(
            "text-3xl font-semibold tabular-nums tracking-tight font-[AeonikPro] text-primary",
            isFrozen && "text-slate-500"
          )}>
          {formatCurrency(card.balance, card.currency)}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 px-4">
        <Button
          className={`flex-1 h-8 text-sm transition-all duration-300 ${
            isFrozen
              ? "bg-blue-400 hover:bg-blue-600"
              : "border hover:border-blue-500"
          }`}
          variant={isFrozen ? "default" : "outline"}
          onClick={handleToggleFreeze}
          disabled={isProcessing}>
          {isProcessing ? (
            <Loader2Icon className="h-3 w-3 mr-2 animate-spin" />
          ) : isFrozen ? (
            <SunIcon className="h-3 w-3 mr-2" />
          ) : (
            <SnowflakeIcon className="h-3 w-3 mr-2" />
          )}
          {isProcessing
            ? "Processing..."
            : isFrozen
            ? "Unfreeze Card"
            : "Freeze Card"}
        </Button>
      </CardFooter>
    </Card>
  );
}
