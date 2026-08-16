import { Schema, model, models } from "mongoose";

const movieViewSchema = new Schema(
  {
    movieSlug: { type: String, required: true, index: true },
    movieName: { type: String, default: "" },
    thumbUrl: { type: String, default: "" },
    movieUpdatedAt: { type: String, default: "" },
    dayBucket: { type: Date, required: true, index: true },
    views: { type: Number, default: 0 },
    lastViewedAt: { type: Date, default: null },
    latestEpisodeName: { type: String, default: "" },
  },
  { timestamps: true },
);

movieViewSchema.index(
  { movieSlug: 1, dayBucket: 1 },
  {
    unique: true,
    partialFilterExpression: { dayBucket: { $type: "date" } },
  },
);
movieViewSchema.index({ dayBucket: -1, movieSlug: 1 });

export const MovieViewModel =
  models.MovieView || model("MovieView", movieViewSchema);
