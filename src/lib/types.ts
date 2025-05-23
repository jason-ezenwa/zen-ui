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
