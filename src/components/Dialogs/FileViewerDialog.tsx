import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, File, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { ContentItem } from "./ViewTopicContentDialog";

const getFilenameFromPath = (path: string) => path.split("/").pop() || path;

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["pdf", "doc", "docx", "txt"].includes(ext || "")) {
    return <FileText size={12} className="mr-1" />;
  }
  return <File size={12} className="mr-1" />;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: ContentItem | null;
  fileIndex: number;
  setFileIndex: (i: number) => void;
};

const FileViewerDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  content,
  fileIndex,
  setFileIndex,
}) => {
  const { toast } = useToast();

  const handleDownload = () => {
    if (!content?.file_path?.length || !content.file_path[fileIndex]) return;
    const filePath = content.file_path[fileIndex];
    const link = document.createElement("a");
    link.href = filePath;
    link.target = "_blank";
    link.download = getFilenameFromPath(filePath);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Download Started", description: "Your file download has started." });
  };

  const renderPreview = () => {
    const filePath = content?.file_path?.[fileIndex];
    if (!filePath) {
      return (
        <div className="text-gray-500 flex flex-col items-center">
          <AlertCircle size={24} className="mb-2" />
          <p>File not available</p>
        </div>
      );
    }

    const fileExt = filePath.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt || "")) {
      return (
        <img
          src={filePath}
          alt={getFilenameFromPath(filePath)}
          className="max-w-full max-h-[500px] object-contain"
        />
      );
    } else if (["mp4", "webm"].includes(fileExt || "")) {
      return <video controls className="max-w-full max-h-[500px]" src={filePath} />;
    } else if (["mp3", "wav", "ogg"].includes(fileExt || "")) {
      return <audio controls className="w-full" src={filePath} />;
    } else if (fileExt === "pdf") {
      return (
        <iframe
          src={filePath}
          className="w-full h-[500px] border-0"
          title={getFilenameFromPath(filePath)}
        />
      );
    }

    return (
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-8 mb-4 flex flex-col items-center">
          <File size={48} className="text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">{getFilenameFromPath(filePath)}</p>
          <p className="text-xs text-gray-500">This file type cannot be previewed</p>
        </div>
        <Button size="sm" onClick={handleDownload}>
          <Download size={14} className="mr-1" /> Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-400 to-blue-900 p-4 text-white">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium">
              {content?.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-400/20"
              onClick={() => onOpenChange(false)}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          {(content?.file_path?.length || 0) > 1 && (
            <div className="mb-4 bg-white p-2 rounded-md shadow-sm overflow-x-auto">
              <div className="flex space-x-2">
                {content?.file_path?.map((file, i) => (
                  <Button
                    key={i}
                    variant={fileIndex === i ? "default" : "outline"}
                    size="sm"
                    className={`text-xs whitespace-nowrap ${
                      fileIndex === i ? "bg-blue-600" : "text-blue-600"
                    }`}
                    onClick={() => setFileIndex(i)}
                  >
                    {getFileIcon(file)}
                    {getFilenameFromPath(file).substring(0, 15)}
                    {getFilenameFromPath(file).length > 15 ? "..." : ""}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {(content?.file_path?.length || 0) > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-xs font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-sm text-gray-700">{content?.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {renderPreview()}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-white p-4 border-t">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!content?.file_path?.length || !content.file_path[fileIndex]}
            >
              <Download size={14} className="mr-1" /> Download
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewerDialog;
