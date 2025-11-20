import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Book } from "@/types/types";
import { BookOpen } from "lucide-react";

interface BookReaderProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookReader({ book, open, onOpenChange }: BookReaderProps) {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{book.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">
                by {book.author}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b border-border">
              <span className="font-medium">Book ID:</span>
              <span className="font-mono">{book.book_id}</span>
            </div>
            
            {book.content ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {book.content}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No content available for this book yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
