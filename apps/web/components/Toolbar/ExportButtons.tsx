import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface ExportButtonsProps {
  onExport: () => void;
  roomId?: string;
}

export function ExportButtons({ onExport, roomId }: ExportButtonsProps) {
  const handleShare = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      toast.error("Share is only available in the browser");
      return;
    }

    // If roomId is provided, share just the room ID
    if (roomId) {
      navigator.clipboard
        .writeText(roomId)
        .then(() => {
          toast.success("🎉 Room ID copied! Share it with your friends to join!");
        })
        .catch(() => {
          toast.error("Failed to copy room ID");
        });
    } else {
      // Fallback to sharing the full URL
      const currentUrl = window.location.href;
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          toast.success("🎉 Link copied to clipboard!");
        })
        .catch(() => {
          toast.error("Failed to copy to clipboard");
        });
    }
  };

  return (
    <div className="flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg">
      <Button
        onClick={onExport}
        className="h-10 w-10 p-0 rounded-xl cursor-pointer 
                   hover:bg-accent transition-colors 
                   hover:scale-105 transition-transform duration-150"
        aria-label="Export as PNG (Ctrl+S)"
        variant="ghost"
        size="sm"
      >
        <Download className="h-5 w-5" />
      </Button>

      <Button
        onClick={handleShare}
        className="h-10 w-10 p-0 rounded-xl cursor-pointer 
                   hover:bg-accent transition-colors 
                   hover:scale-105 transition-transform duration-150"
        aria-label="Share"
        variant="ghost"
        size="sm"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
