import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CurrencyExchange } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const columns: ColumnDef<CurrencyExchange>[] = [
  {
    accessorKey: "exchange",
    header: "Exchange",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">
          {formatCurrency(
            row.original.sourceAmount,
            row.original.sourceCurrency
          )}
        </span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="font-medium">
          {formatCurrency(
            row.original.targetAmount,
            row.original.targetCurrency
          )}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: "Rate",
    cell: ({ row }) => {
      const rate = row.original.targetAmount / row.original.sourceAmount;
      return (
        <span className="text-sm">
          1 {row.original.sourceCurrency} = {rate.toFixed(4)}{" "}
          {row.original.targetCurrency}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.reference}</span>
    ),
  },
];
