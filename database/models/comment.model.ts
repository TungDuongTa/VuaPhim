import { Schema, model, models } from "mongoose";

const commentSchema = new Schema(
  {
    userId: { type: String, required: true },
    movieSlug: { type: String, required: true },
    movieName: { type: String, default: "" },
    targetType: {
      type: String,
      enum: ["movie", "episode"],
      required: true,
    },
    episodeName: { type: String, default: null },
    parentCommentId: { type: Schema.Types.ObjectId, default: null },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: -1 });
commentSchema.index({ movieSlug: 1, parentCommentId: 1, createdAt: -1 });
commentSchema.index({
  movieSlug: 1,
  targetType: 1,
  episodeName: 1,
  parentCommentId: 1,
  createdAt: -1,
});

export const CommentModel = models.Comment || model("Comment", commentSchema);
