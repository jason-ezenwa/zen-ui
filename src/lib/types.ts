export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  _id: string;
  userId: string;
  currency: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualCard {
  _id: string;
  cardId: string;
  cardReference: string;
  brand: string;
  currency: string;
  number: string;
  maskedPan: string;
  expiry: string;
  cvv: string;
  status: "ACTIVE" | "DISABLED";
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  APPROVED = "approved",
  DECLINED = "declined",
}

export interface Deposit {
  _id: string;
  /**
   * User ID reference
   */
  user: string;
  /**
   * Wallet ID reference
   */
  wallet: string;
  subTotal: number;
  fee: number;
  total: number;
  currency: string;
  reference: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyExchange {
  _id: string;
  /**
   * User ID reference
   */
  user: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  status: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardTransaction {
  _id: string;
  card: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: string;
}
