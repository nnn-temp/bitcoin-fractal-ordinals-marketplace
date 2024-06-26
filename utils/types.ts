export const ACTIVE = "Active";
export const PENDING = "Pending";
export const SOLD = "Sold";

export interface IOrderData {
  ordinalId: string;
  price: number;
  sellerPaymentAddress: string;
  sellerOrdinalPublicKey: string;
  status: "Active" | "Pending" | "Sold";
  ordinalUtxoTxId: string;
  ordinalUtxoVout: string;
  serviceFee: number;
  signedListingPSBT: string;
}
