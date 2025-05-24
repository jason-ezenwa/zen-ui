import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TransactionStatus, Deposit } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import { formatCurrency } from "@/lib/utils";

const getStatusBadge = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.COMPLETED:
    case TransactionStatus.APPROVED:
      return <Badge variant="default">Completed</Badge>;
    case TransactionStatus.PENDING:
      return <Badge variant="secondary">Pending</Badge>;
    case TransactionStatus.FAILED:
    case TransactionStatus.DECLINED:
      return <Badge variant="destructive">Declined</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};

export const columns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      formatDate(row.original.createdAt, "dd/MM/yyyy, hh:mm a"),
  },
  {
    accessorKey: "subTotal",
    header: "Amount",
    cell: ({ row }) =>
      formatCurrency(row.original.subTotal, row.original.currency),
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => formatCurrency(row.original.fee, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => row.original.reference,
  },
];
