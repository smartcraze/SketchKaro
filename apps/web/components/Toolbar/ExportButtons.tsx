import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface ExportButtonsProps {
  onExport: () => void;
}

export function ExportButtons({ onExport }: ExportButtonsProps) {
  const handleShare = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      toast.error("Share is only available in the browser");
      return;
    }

    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success("🎉 Copied to clipboard! Share this with your friend!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  return (
    <div className="flex gap-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg">
      <Button
        onClick={onExport}
        className="h-10 w-10 p-0 rounded-xl hover:bg-accent transition-colors"
        aria-label="Export as PNG (Ctrl+S)"
        variant="ghost"
        size="sm"
      >
        <Download className="h-5 w-5" />
      </Button>
      <Button
        onClick={handleShare}
        className="h-10 w-10 p-0 rounded-xl hover:bg-accent transition-colors"
        aria-label="Share"
        variant="ghost"
        size="sm"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
