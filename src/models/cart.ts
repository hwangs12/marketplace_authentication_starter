import { Schema, model } from "mongoose";

interface ICart {
  itemname: string;
  description: string;
  price: number;
}

const cartSchema = new Schema<ICart>({
  itemname: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});
export const Cart = model<ICart>("Cart", cartSchema);
