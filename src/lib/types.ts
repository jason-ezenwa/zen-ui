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
