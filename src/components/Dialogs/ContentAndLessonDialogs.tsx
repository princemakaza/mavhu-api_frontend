import React, { useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, File } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";
import { supabase } from "@/helper/SupabaseClient";
import type { ContentItem } from "./ViewTopicContentDialog";

// ---------- ConfirmDialog ----------
type ConfirmProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
};

export const ConfirmDialog: React.FC<ConfirmProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  confirmVariant = "default",
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={confirmVariant === "destructive" ? "bg-red-500 text-white hover:bg-red-600" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ---------- EditContentDialog ----------
const fileTypeExtensions = {
  video: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"],
  document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"],
};

const getAcceptedFileTypes = (fileType?: string) =>
  fileType ? (fileTypeExtensions as any)[fileType]?.join(",") || undefined : undefined;

const getFilenameFromPath = (path: string) => path.split("/").pop() || path;

type EditContentDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: ContentItem | null;
  onUpdated: () => void | Promise<void>;
};

export const EditContentDialog: React.FC<EditContentDialogProps> = ({
  open,
  onOpenChange,
  content,
  onUpdated,
}) => {
  const [draft, setDraft] = useState<ContentItem | null>(content);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // keep draft synced when a new content is passed in
  React.useEffect(() => {
    setDraft(content);
    setUploadedFiles([]);
  }, [content, open]);

  const triggerFileInput = () => updateFileInputRef.current?.click();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);

    // Show temp object URLs until upload completes on save
    const tempFilePaths = files.map((file) => URL.createObjectURL(file));
    setDraft((prev: any) => ({
      ...prev,
      file_path: [...(prev?.file_path || []), ...tempFilePaths],
    }));
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setDraft((prev: any) => ({
      ...prev,
      file_path: prev.file_path.filter((_: any, i: number) => i !== index),
    }));
  };

  const canSubmit = useMemo(() => {
    return Boolean(
      draft?.title?.trim() &&
        draft?.description?.trim() &&
        (draft?.file_path?.length || 0) > 0
    );
  }, [draft]);

  const uploadFilesToSupabase = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("topics").upload(fileName, file);
      if (error) {
        console.error("Error uploading file:", error);
        throw new Error(`Error uploading file: ${error.message}`);
      }
      const { data: publicData } = supabase.storage.from("topics").getPublicUrl(fileName);
      return publicData?.publicUrl as string;
    });

    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean) as string[];
  };

  const handleUpdateContent = async () => {
    if (!draft || !draft._id) return;
    if (!canSubmit) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill all required fields and upload at least one file",
      });
      return;
    }

    try {
      let updatedFilePaths = [...(draft.file_path || [])];

      if (uploadedFiles.length > 0) {
        const newUploadedUrls = await uploadFilesToSupabase(uploadedFiles);
        if (newUploadedUrls.length > 0) {
          // remove last N temp URLs and replace with real public URLs
          const tempUrlsCount = uploadedFiles.length;
          updatedFilePaths = updatedFilePaths
            .slice(0, updatedFilePaths.length - tempUrlsCount)
            .concat(newUploadedUrls);
        }
      }

      const contentToSave = { ...draft, file_path: updatedFilePaths };

      await TopicContentService.updateTopicContent(draft._id, contentToSave);
      toast({ title: "Success", description: "Content updated successfully" });

      await onUpdated();
      onOpenChange(false);
      setUploadedFiles([]);
    } catch (err) {
      console.error("Failed to update content:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Edit Content</DialogTitle>
        {draft && (
          <div className="space-y-4 my-2">
            <div className="grid gap-3">
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={draft.file_type}
                onValueChange={(value) => setDraft({ ...draft, file_type: value } as ContentItem)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium">
                Title<span className="text-red-500 ml-0.5">*</span>
              </label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value } as ContentItem)}
                placeholder="Content title"
              />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium">
                Description<span className="text-red-500 ml-0.5">*</span>
              </label>
              <Textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value } as ContentItem)
                }
                placeholder="Content description"
                rows={3}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  Files<span className="text-red-500 ml-0.5">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="text-xs"
                >
                  <Upload size={12} className="mr-1" /> Upload More Files
                </Button>
              </div>

              <input
                ref={updateFileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={getAcceptedFileTypes(draft.file_type)}
                multiple
              />

              {draft.file_path?.length ? (
                <div className="bg-gray-50 rounded-md p-2 max-h-40 overflow-y-auto">
                  <ul className="space-y-1">
                    {draft.file_path.map((filePath: string, index: number) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm bg-white rounded px-2 py-1"
                      >
                        <div className="flex items-center text-xs truncate">
                          <File size={12} className="mr-1 shrink-0" />
                          <span className="truncate">{getFilenameFromPath(filePath)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500"
                          onClick={() => removeFile(index)}
                        >
                          <X size={12} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 text-gray-500 text-sm border border-dashed rounded-md p-4 text-center">
                  <Upload size={16} className="mx-auto mb-1" />
                  <p className="text-xs">No files uploaded</p>
                </div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateContent} className="bg-blue-600 text-white hover:bg-blue-700">
            Update Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Lesson dialogs ----------
type LessonEditDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void | Promise<void>;
};

export const LessonEditDialog: React.FC<LessonEditDialogProps> = ({
  open,
  onOpenChange,
  value,
  onChange,
  onSave,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogTitle>Edit Lesson</DialogTitle>
      <div className="space-y-3 my-2">
        <label className="text-sm font-medium">Lesson Text</label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Lesson text" />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={onSave} className="bg-blue-600 text-white">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

type LessonDeleteDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export const LessonDeleteDialog: React.FC<LessonDeleteDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this lesson? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-red-500 text-white hover:bg-red-600">
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
