import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  amount: number,
  currency: string,
  passedDecimalPlaces?: number
) => {
  if (currency === "NGN") {
    const decimalPlaces = passedDecimalPlaces ?? 2;

    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date) => {
  return format(date, "dd/MM/yyyy, hh:mm a");
};
