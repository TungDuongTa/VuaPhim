"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeMovieBookmark } from "@/lib/actions/bookmark.actions";

type RemoveBookmarkButtonProps = {
  slug: string;
  movieName: string;
};

export function RemoveBookmarkButton({
  slug,
  movieName,
}: RemoveBookmarkButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await removeMovieBookmark(slug);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
        toast.error("Không thể xóa khỏi danh sách theo dõi. Vui lòng thử lại.");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Xóa ${movieName} khỏi danh sách theo dõi`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bỏ theo dõi phim?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn sắp xóa{" "}
            <span className="font-medium text-foreground">{movieName}</span>{" "}
            khỏi danh sách theo dõi. Bạn có thể theo dõi lại bất cứ lúc nào.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleRemove();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa khỏi theo dõi"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
