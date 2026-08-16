import { Schema, model, models } from "mongoose";

const watchProgressSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    movieSlug: { type: String, required: true, index: true },
    movieName: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    episodeSlug: { type: String, default: "" },
    episodeName: { type: String, default: "" },
    positionSeconds: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

watchProgressSchema.index({ userId: 1, movieSlug: 1 }, { unique: true });
watchProgressSchema.index({ userId: 1, lastWatchedAt: -1 });

export const WatchProgressModel =
  models.WatchProgress || model("WatchProgress", watchProgressSchema);
