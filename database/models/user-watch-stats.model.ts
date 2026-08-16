import { Schema, model, models } from "mongoose";

const userWatchStatsSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    episodesWatched: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

userWatchStatsSchema.index({ episodesWatched: -1, updatedAt: 1 });

export const UserWatchStatsModel =
  models.UserWatchStats || model("UserWatchStats", userWatchStatsSchema);
