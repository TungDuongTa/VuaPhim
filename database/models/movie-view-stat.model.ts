import { Schema, model, models } from "mongoose";

const movieViewStatSchema = new Schema(
  {
    movieSlug: { type: String, required: true, unique: true },
    movieName: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    movieUpdatedAt: { type: String, default: "" },
    totalViews: { type: Number, default: 0 },
    lastViewedAt: { type: Date, default: null },
    latestEpisodeName: { type: String, default: "" },
  },
  { timestamps: true },
);

movieViewStatSchema.index({ totalViews: -1, lastViewedAt: -1 });

export const MovieViewStatModel =
  models.MovieViewStat || model("MovieViewStat", movieViewStatSchema);
