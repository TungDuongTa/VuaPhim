import { Schema, model, models } from "mongoose";

const equippedCosmeticsSchema = new Schema(
  {
    avatarFrame: { type: String, default: null },
    usernameEffect: { type: String, default: null },
    profileBanner: { type: String, default: null },
  },
  { _id: false },
);

const userCosmeticsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    creditsSpent: { type: Number, required: true, default: 0, min: 0 },
    ownedItemIds: { type: [String], default: [] },
    equipped: { type: equippedCosmeticsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export const UserCosmeticsModel =
  models.UserCosmetics || model("UserCosmetics", userCosmeticsSchema);
