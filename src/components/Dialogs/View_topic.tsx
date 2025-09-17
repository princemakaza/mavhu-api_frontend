import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  Eye,
  Plus,
  X,
  Edit,
  Trash2,
  AlertCircle,
  Upload,
  File,
  FileText,
  Music,
  Video,
  Calculator,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";
import Topic from "../Interfaces/Topic_Interface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/helper/SupabaseClient"; // Import supabase client
import "mathlive";
import { MathfieldElement } from "mathlive";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    MathLive: any;
  }
}



interface ContentFormData {
  title: string;
  description: string;
  lesson: Array<{
    text: string;
    audio: string;
    video: string;
  }>;
  file_path: string[];
  file_type: "video" | "audio" | "document";
  Topic: string;
}

interface ViewTopicContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
}

// Define file type extensions mapping
const fileTypeExtensions = {
  video: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"],
  document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"],
};

const ViewTopicContentDialog: React.FC<ViewTopicContentDialogProps> = ({
  open,
  onOpenChange,
  topic,
}) => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Viewer states
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [viewingContent, setViewingContent] = useState<any>(null);
  const [viewingFileIndex, setViewingFileIndex] = useState<number>(0);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newContent, setNewContent] = useState<ContentFormData>({
    title: "",
    description: "",
    lesson: [{ text: "", audio: "", video: "" }],
    file_path: [],
    file_type: "document",
    Topic: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Update dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState<boolean>(false);
  const [contentToUpdate, setContentToUpdate] = useState<any>(null);
  const [uploadedFilesForUpdate, setUploadedFilesForUpdate] = useState<File[]>(
    []
  );

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const exportLinkRef = useRef<HTMLAnchorElement>(null);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [tempText, setTempText] = useState("");

  //maths
  const [mathExpression, setMathExpression] = useState("");
  const mathFieldRef = useRef<MathfieldElement | null>(null);
  const mathContainerRef = useRef<HTMLDivElement>(null);
  const [showMathInput, setShowMathInput] = useState(false);
  const navigate = useNavigate();
  // Add this to your component's imports/dependencies section
  useEffect(() => {
    // Load MathLive dynamically
    const loadMathLive = async () => {
      if (!window.MathLive) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/mathlive@0.95.0/dist/mathlive.min.js";
        script.onload = () => {
          console.log("MathLive loaded successfully");
        };
        document.head.appendChild(script);
      }
    };
    loadMathLive();
  }, []);

  // Updated math field initialization useEffect
  useEffect(() => {
    if (!showMathInput || !mathContainerRef.current) return;

    // Initialize MathField
    const mf = new MathfieldElement({
      defaultMode: "math",
      smartMode: true,
      virtualKeyboardMode: "onfocus",
      virtualKeyboards: "all",
      onContentDidChange: (mf) => {
        setMathExpression(mf.value);
      },
    });

    // Style the math field
    mf.style.width = "100%";
    mf.style.minHeight = "60px";
    mf.style.padding = "8px";
    mf.style.border = "1px solid #d1d5db";
    mf.style.borderRadius = "6px";

    // Clear container and add math field
    mathContainerRef.current.innerHTML = "";
    mathContainerRef.current.appendChild(mf);
    mf.focus();

    // Save reference
    mathFieldRef.current = mf;

    // Cleanup
    return () => {
      if (mathFieldRef.current) {
        mathFieldRef.current.remove();
        mathFieldRef.current = null;
      }
    };
  }, [showMathInput]);
  // Updated insertMathExpression function
  const insertMathExpression = () => {
    if (mathExpression && mathFieldRef.current) {
      const latex = mathFieldRef.current.value;
      const textarea = document.querySelector(
        "[data-math-textarea]"
      ) as HTMLTextAreaElement;

      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const newText =
          tempText.substring(0, start) + `\\(${latex}\\)` + tempText.substring(end);

        setTempText(newText);

        // Focus back to textarea
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + latex.length + 4; // +4 for \( and \)
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);

        // Reset math field
        mathFieldRef.current.value = "";
        setMathExpression("");
      }
    }
  };

  // Updated quick symbol insertion function
  const insertQuickSymbol = (symbol: string) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.executeCommand(["insert", symbol]);
      mathFieldRef.current.focus();
    }
  };

  // Add this function to handle text button click
  const handleTextButtonClick = (index) => {
    setCurrentTextIndex(index);
    setTempText(newContent.lesson[index].text);
    setTextDialogOpen(true);
  };

  // Add this function to save text
  const handleSaveText = () => {
    updateLessonItem(currentTextIndex, "text", tempText);
    setTextDialogOpen(false);
    setTempText("");
  };

  // 3. Add helper functions for lesson management
  const addLessonItem = () => {
    setNewContent((prev) => ({
      ...prev,
      lesson: [...prev.lesson, { text: "", audio: "", video: "" }],
    }));
  };

  const removeLessonItem = (index: number) => {
    if (newContent.lesson.length > 1) {
      setNewContent((prev) => ({
        ...prev,
        lesson: prev.lesson.filter((_, i) => i !== index),
      }));
    }
  };

  const updateLessonItem = (
    index: number,
    field: "text" | "audio" | "video",
    value: string
  ) => {
    setNewContent((prev) => ({
      ...prev,
      lesson: prev.lesson.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const fetchTopicContents = async () => {
      if (!topic) return;
      const topicId = topic._id || topic.id;
      if (!topicId) return;

      try {
        setLoading(true);
        setError(null);
        const result = await TopicContentService.getTopicContentByTopicId(
          topicId
        );
        setContents(result.data || []);
      } catch (error) {
        console.error("Failed to fetch topic contents:", error);
        setError("Failed to load topic contents. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load topic contents. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open && topic) {
      fetchTopicContents();
    }
  }, [open, topic, toast]);

  // Initialize new content form with topic ID when dialog opens
  useEffect(() => {
    if (topic) {
      setNewContent((prev) => ({
        ...prev,
        Topic: topic._id || topic.id || "",
      }));
    }
  }, [topic]);

  // Reset file inputs when file type changes
  useEffect(() => {
    setUploadedFiles([]);
  }, [newContent.file_type]);

  useEffect(() => {
    if (contentToUpdate) {
      setUploadedFilesForUpdate([]);
    }
  }, [contentToUpdate?.file_type]);

  const handleClicks = () => {
    const myId = topic._id;
    console.log("Navigating to details with ID:", myId);
    navigate(`topics/${myId}/content/new`);
  };
  ///topics/:topicId/content/new

  // Upload files to Supabase
  const uploadFilesToSupabase = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        // Create a unique file name
        const fileName = `${Date.now()}_${file.name}`;

        // Upload file to the Supabase bucket
        const { data, error } = await supabase.storage
          .from("topics") // Using the topics bucket
          .upload(fileName, file);

        if (error) {
          console.error("Error uploading file:", error);
          throw new Error(`Error uploading file: ${error.message}`);
        }

        // Get the public URL of the uploaded file
        const { data: publicData } = supabase.storage
          .from("topics")
          .getPublicUrl(fileName);

        if (publicData) {
          return publicData.publicUrl;
        }

        return null;
      });

      const results = await Promise.all(uploadPromises);
      return results.filter((url) => url !== null) as string[];
    } catch (error) {
      console.error("Error in file upload:", error);
      throw error;
    }
  };

  // File upload handlers
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isUpdate = false
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);

    if (isUpdate) {
      setUploadedFilesForUpdate((prev) => [...prev, ...files]);

      // Store files temporarily (actual URLs will be updated after Supabase upload)
      const tempFilePaths = files.map((file) => URL.createObjectURL(file));
      setContentToUpdate((prev) => ({
        ...prev,
        file_path: [...prev.file_path, ...tempFilePaths],
      }));
    } else {
      setUploadedFiles((prev) => [...prev, ...files]);

      // Store files temporarily (actual URLs will be updated after Supabase upload)
      const tempFilePaths = files.map((file) => URL.createObjectURL(file));
      setNewContent((prev) => ({
        ...prev,
        file_path: [...prev.file_path, ...tempFilePaths],
      }));
    }
  };

  const removeFile = (index: number, isUpdate = false) => {
    if (isUpdate) {
      setUploadedFilesForUpdate((prev) => prev.filter((_, i) => i !== index));
      setContentToUpdate((prev) => ({
        ...prev,
        file_path: prev.file_path.filter((_, i) => i !== index),
      }));
    } else {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      setNewContent((prev) => ({
        ...prev,
        file_path: prev.file_path.filter((_, i) => i !== index),
      }));
    }
  };


  const getAcceptedFileTypes = (fileType: string) => {
    return fileTypeExtensions[fileType as keyof typeof fileTypeExtensions].join(
      ","
    );
  };

  const triggerFileInput = (isUpdate = false) => {
    if (isUpdate) {
      updateFileInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };
  const NavigateToEditContent = (contentId: string) => {
    console.log("Navigating to edit content with ID:", contentId);
    navigate(`/admin_dashboard/courses/topics/${topic._id}/content/edit/${contentId}`);
  };


  const handleCreateContent = async () => {
    try {
      setIsSubmitting(true);

      if (
        !newContent.title.trim() ||
        !newContent.description.trim() ||
        !uploadedFiles.length ||
        newContent.lesson.some((item) => !item.text.trim())
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Please fill all required fields, add lesson text, and upload at least one file",
        });
        return;
      }
      // Upload files to Supabase and get URLs
      const uploadedUrls = await uploadFilesToSupabase(uploadedFiles);

      if (!uploadedUrls.length) {
        throw new Error("Failed to upload files");
      }

      // Create content with Supabase URLs
      const contentToCreate = {
        ...newContent,
        file_path: uploadedUrls,
      };

      await TopicContentService.createTopicContent(contentToCreate);

      // Refresh content list
      if (topic) {
        const topicId = topic._id || topic.id;
        const result = await TopicContentService.getTopicContentByTopicId(
          topicId
        );
        setContents(result.data || []);
      }

      toast({
        title: "Success",
        description: "Content created successfully",
      });

      // 5. Update the form reset in handleCreateContent success and cancel actions
      setNewContent({
        title: "",
        description: "",
        lesson: [{ text: "", audio: "", video: "" }],
        file_path: [],
        file_type: "document",
        Topic: topic ? topic._id || topic.id : "",
      });

      setUploadedFiles([]);
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create content. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContent = async () => {
    if (!contentToUpdate || !contentToUpdate._id) return;

    try {
      setIsSubmitting(true);

      // Form validation
      if (
        !contentToUpdate.title.trim() ||
        !contentToUpdate.description.trim() ||
        !contentToUpdate.file_path.length
      ) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Please fill all required fields and upload at least one file",
        });
        return;
      }

      let updatedFilePaths = [...contentToUpdate.file_path];

      // If there are new files, upload them to Supabase
      if (uploadedFilesForUpdate.length > 0) {
        const newUploadedUrls = await uploadFilesToSupabase(
          uploadedFilesForUpdate
        );

        if (newUploadedUrls.length > 0) {
          // Replace the temporary URLs with actual Supabase URLs
          const tempUrlsCount = uploadedFilesForUpdate.length;
          updatedFilePaths = updatedFilePaths
            .slice(0, updatedFilePaths.length - tempUrlsCount)
            .concat(newUploadedUrls);
        }
      }

      const contentToSave = {
        ...contentToUpdate,
        file_path: updatedFilePaths,
      };

      await TopicContentService.updateTopicContent(
        contentToUpdate._id,
        contentToSave
      );

      // Refresh content list
      if (topic) {
        const topicId = topic._id || topic.id;
        const result = await TopicContentService.getTopicContentByTopicId(
          topicId
        );
        setContents(result.data || []);
      }

      toast({
        title: "Success",
        description: "Content updated successfully",
      });

      setUpdateDialogOpen(false);
      setUploadedFilesForUpdate([]);
    } catch (error) {
      console.error("Failed to update content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;

    try {
      setIsSubmitting(true);
      await TopicContentService.moveToTrash(contentToDelete);

      // Remove deleted content from state
      setContents(
        contents.filter((content) => content._id !== contentToDelete)
      );

      toast({
        title: "Success",
        description: "Content deleted successfully",
      });

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete content. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setContentToDelete(null);
    }
  };

  const openUpdateDialog = (content: any) => {
    setContentToUpdate({ ...content });
    setUpdateDialogOpen(true);
  };

  const openDeleteDialog = (contentId: string) => {
    setContentToDelete(contentId);
    setDeleteDialogOpen(true);
  };

  // Function to get filename from path
  const getFilenameFromPath = (path: string) => {
    // For URLs created with URL.createObjectURL or actual file paths
    return path.split("/").pop() || path;
  };

  // Function to handle file download
  const handleDownloadFile = async (fileUrl: string) => {
    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.download = getFilenameFromPath(fileUrl);

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your file download has started.",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download file. Please try again.",
      });
    }
  };

  // Function to handle content view
  const handleViewContent = (content: any, fileIndex: number = 0) => {
    setViewingContent(content);
    setViewingFileIndex(fileIndex);
    setViewerOpen(true);
  };

  // Function to export all topic content as JSON
  const handleExportTopic = async () => {
    if (!topic) return;

    try {
      setIsExporting(true);

      // Create export data structure
      const exportData = {
        topic: {
          id: topic._id || topic.id,
          title: topic.title || topic.name,
          description: topic.description,
          price: topic.price,
          regularPrice: topic.regularPrice,
        },
        contents: contents.map((content) => ({
          id: content._id,
          title: content.title,
          description: content.description,
          file_type: content.file_type,
          file_paths: content.file_path,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        })),
        exportDate: new Date().toISOString(),
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Use ref to create hidden link and trigger download
      if (exportLinkRef.current) {
        exportLinkRef.current.href = url;
        exportLinkRef.current.download = `${topic.title || topic.name}_export_${new Date().toISOString().split("T")[0]
          }.json`;
        exportLinkRef.current.click();

        // Clean up
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Export Complete",
        description: "Topic content exported successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Unable to export topic content. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!topic) return null;

  // Determine file type icon based on filename
  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (["pdf", "doc", "docx", "txt"].includes(ext || "")) {
      return <FileText size={12} className="mr-1" />;
    } else {
      return <File size={12} className="mr-1" />;
    }
  };

  // Determine if file is viewable in browser
  const isViewableInBrowser = (filePath: string) => {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return [
      "pdf",
      "txt",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "mp4",
      "mp3",
      "wav",
    ].includes(ext || "");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-7xl max-h-[900vh] overflow-y-auto p-0 m-0 rounded-lg">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-900 p-6 text-white shrink-0 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {topic.title || topic.name}
                  </DialogTitle>

                </div>
                <div className="flex space-x-3">

                  <Button
                    onClick={handleClicks}
                    variant="outline"
                    size="sm"
                    className="bg-blue-400 border-white text-white hover:bg-white hover:text-green-900"
                  >
                    <Plus size={14} className="mr-1" /> Add Content
                  </Button>
                  {/* Hidden export link */}
                  <a ref={exportLinkRef} className="hidden" />
                </div>
              </div>
            </div>

            {/* Topic Details */}
            <div className="bg-white border-b border-gray-100 py-4 px-6 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-xs text-blue-800 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {topic.description || "No description available"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-xs text-gray-600 mb-1">
                      Price
                    </h3>
                    <p className="text-base font-semibold text-green-700">
                      ${topic.price || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-xs text-gray-600 mb-1">
                      Regular Price
                    </h3>
                    <p className="text-base font-semibold text-gray-700">
                      ${topic.regularPrice || 0}
                    </p>
                    {topic.price < topic.regularPrice && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {Math.round(
                          ((topic.regularPrice - topic.price) /
                            topic.regularPrice) *
                          100
                        )}
                        % Off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Content Section - Scrollable */}
            <div
              className="overflow-y-auto flex-1 bg-gray-50"
              style={{
                maxHeight: "50vh",
                overflowY: "auto",
                msOverflowStyle: "auto",
                scrollbarWidth: "auto",
              }}
            >
              <div className="py-4 px-6">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mx-auto">
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                ) : contents.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg mx-auto">
                      <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <BookOpen size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">
                        No content yet
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Add content to enhance the learning experience.
                      </p>
                      <Button
                        className="bg-blue-500 hover:bg-blue-900 text-white"
                        onClick={() => setCreateDialogOpen(true)}
                        size="sm"
                      >
                        <Plus size={16} className="mr-1" /> Add Your First
                        Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {contents.map((content, index) => {
                      const fileType = content.file_type || "Unknown";
                      return (
                        <Card
                          key={content._id || index}
                          className="h-full flex flex-col"
                        >
                          <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-white flex justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {content.title}
                              </CardTitle>
                              <CardDescription className="text-xs mt-1 flex items-center">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-1 ${fileType === "document"
                                      ? "bg-green-400"
                                      : fileType === "video"
                                        ? "bg-blue-400"
                                        : fileType === "audio"
                                          ? "bg-purple-400"
                                          : "bg-gray-400"
                                    }`}
                                />
                                {fileType}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {fileType}
                            </Badge>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <p className="text-sm text-gray-700 mb-3">
                              {content.description}
                            </p>
                            {/* File list with scrolling if needed */}
                            {content.file_path?.length > 0 && (
                              <div className="flex-1 mb-3">
                                <ul className="bg-gray-50 p-3 rounded-md space-y-1 max-h-24 overflow-y-auto">
                                  {content.file_path.map(
                                    (file: string, i: number) => (
                                      <li
                                        key={i}
                                        className="flex justify-between items-center text-xs text-blue-600"
                                      >
                                        <span className="truncate flex items-center">
                                          {getFileIcon(file)}
                                          {getFilenameFromPath(file)}
                                        </span>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6"
                                          onClick={() =>
                                            handleDownloadFile(file)
                                          }
                                        >
                                          <Download size={12} />
                                        </Button>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                            <div className="mt-auto flex gap-2">
                              <Button
                                variant="outline"
                                className="text-amber-600 h-10 text-sm w-full flex justify-center items-center"
                                onClick={() => NavigateToEditContent(content._id)}
                              >
                                <Edit size={16} className="mr-2" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-600 h-10 text-sm w-full flex justify-center items-center"
                                onClick={() => openDeleteDialog(content._id)}
                              >
                                <Trash2 size={16} className="mr-2" /> Delete
                              </Button>
                            </div>

                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-200 shadow-sm shrink-0 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-gray-500 flex items-center space-x-2 text-sm">
                  <BookOpen size={14} />
                  <span>{contents.length} content items</span>
                </div>
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* File Viewer Dialog */}
      {/* File Viewer Dialog */}
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="bg-gradient-to-r from-blue-400 to-blue-900 p-4 text-white">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-medium">
                {viewingContent?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-blue-400/20"
                onClick={() => setViewerOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50">
            {/* File navigation if multiple files */}
            {viewingContent?.file_path?.length > 1 && (
              <div className="mb-4 bg-white p-2 rounded-md shadow-sm overflow-x-auto">
                <div className="flex space-x-2">
                  {viewingContent.file_path.map((file: string, i: number) => (
                    <Button
                      key={i}
                      variant={viewingFileIndex === i ? "default" : "outline"}
                      size="sm"
                      className={`text-xs whitespace-nowrap ${viewingFileIndex === i ? "bg-blue-600" : "text-blue-600"
                        }`}
                      onClick={() => setViewingFileIndex(i)}
                    >
                      {getFileIcon(file)}
                      {getFilenameFromPath(file).substring(0, 15)}
                      {getFilenameFromPath(file).length > 15 ? "..." : ""}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* File viewer */}
            {viewingContent?.file_path?.length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {/* Description */}
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">
                    Description
                  </h3>
                  <p className="text-sm text-gray-700">
                    {viewingContent.description}
                  </p>
                </div>

                {/* Content viewer based on file type */}
                <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                  {(() => {
                    if (!viewingContent.file_path[viewingFileIndex]) {
                      return (
                        <div className="text-gray-500 flex flex-col items-center">
                          <AlertCircle size={24} className="mb-2" />
                          <p>File not available</p>
                        </div>
                      );
                    }

                    const filePath = viewingContent.file_path[viewingFileIndex];
                    const fileExt = filePath.split(".").pop()?.toLowerCase();

                    if (
                      ["jpg", "jpeg", "png", "gif", "webp"].includes(
                        fileExt || ""
                      )
                    ) {
                      return (
                        <img
                          src={filePath}
                          alt={getFilenameFromPath(filePath)}
                          className="max-w-full max-h-[500px] object-contain"
                        />
                      );
                    } else if (["mp4", "webm"].includes(fileExt || "")) {
                      return (
                        <video
                          controls
                          className="max-w-full max-h-[500px]"
                          src={filePath}
                        >
                          Your browser does not support video playback
                        </video>
                      );
                    } else if (["mp3", "wav", "ogg"].includes(fileExt || "")) {
                      return (
                        <audio controls className="w-full" src={filePath}>
                          Your browser does not support audio playback
                        </audio>
                      );
                    } else if (fileExt === "pdf") {
                      return (
                        <iframe
                          src={filePath}
                          className="w-full h-[500px] border-0"
                          title={getFilenameFromPath(filePath)}
                        />
                      );
                    } else {
                      return (
                        <div className="text-center">
                          <div className="bg-gray-100 rounded-lg p-8 mb-4 flex flex-col items-center">
                            <File size={48} className="text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 mb-1">
                              {getFilenameFromPath(filePath)}
                            </p>
                            <p className="text-xs text-gray-500">
                              This file type cannot be previewed
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadFile(filePath)}
                          >
                            <Download size={14} className="mr-1" /> Download
                            File
                          </Button>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-white p-4 border-t">
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewingContent?.file_path?.length > 0) {
                    handleDownloadFile(
                      viewingContent.file_path[viewingFileIndex]
                    );
                  }
                }}
                disabled={
                  !viewingContent?.file_path?.length ||
                  !viewingContent.file_path[viewingFileIndex]
                }
              >
                <Download size={14} className="mr-1" /> Download
              </Button>
              <Button size="sm" onClick={() => setViewerOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Content Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-0 shadow-2xl">
          {/* Header with gradient background */}
          <div className="relative -m-6 mb-0 p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Plus size={24} className="text-white" />
                </div>
                Create New Content
              </DialogTitle>
              <p className="text-blue-100 mt-2 text-sm">
                Add engaging content to your topic
              </p>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                Content Type
                <span className="text-red-500">*</span>
              </label>
              <Select
                value={newContent.file_type}
                onValueChange={(value) =>
                  setNewContent({
                    ...newContent,
                    file_type: value as ContentFormData["file_type"],
                  })
                }
              >
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Choose your content type" />
                </SelectTrigger>
                <SelectContent className="border-0 shadow-xl">
                  <SelectItem
                    value="document"
                    className="hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <File size={16} className="text-blue-600" />
                      </div>
                      Document
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="video"
                    className="hover:bg-purple-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Video size={16} className="text-purple-600" />
                      </div>
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="audio"
                    className="hover:bg-green-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Music size={16} className="text-green-600" />
                      </div>
                      Audio
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  Title
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newContent.title}
                  onChange={(e) =>
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  placeholder="Enter a catchy title"
                  className="h-12 border-2 border-gray-200 hover:border-green-300 focus:border-green-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  Description
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={newContent.description}
                  onChange={(e) =>
                    setNewContent({
                      ...newContent,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your content..."
                  rows={3}
                  className="border-2 border-gray-200 hover:border-purple-300 focus:border-purple-400 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </div>
            </div>

            {/* Lesson Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  Lesson Content
                  <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLessonItem}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={14} className="mr-2" />
                  Add Lesson Item
                </Button>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {newContent.lesson.map((lessonItem, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white via-gray-50 to-blue-50/30 rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Lesson Item {index + 1}
                        </span>
                      </div>
                      {newContent.lesson.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          onClick={() => removeLessonItem(index)}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Text Button */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">
                          Text Content
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTextButtonClick(index)}
                          className="w-full bg-gradient-to-r from-slate-500 to-gray-500 text-white border-0 hover:from-slate-600 hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <FileText size={14} className="mr-2" />
                          {lessonItem.text ? "Edit Text" : "Add Text"}
                        </Button>
                      </div>

                      {/* Audio Content */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">
                          Audio Content
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={lessonItem.audio}
                            onChange={(e) =>
                              updateLessonItem(index, "audio", e.target.value)
                            }
                            placeholder="audio.mp3 or URL"
                            className="text-sm flex-1 border-2 border-gray-200 hover:border-green-300 focus:border-green-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "audio/*";
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  try {
                                    const fileName = `${Date.now()}_${file.name
                                      }`;
                                    const { data, error } =
                                      await supabase.storage
                                        .from("topics")
                                        .upload(fileName, file);

                                    if (error) throw error;

                                    const { data: publicData } =
                                      supabase.storage
                                        .from("topics")
                                        .getPublicUrl(fileName);

                                    if (publicData) {
                                      updateLessonItem(
                                        index,
                                        "audio",
                                        publicData.publicUrl
                                      );
                                      toast({
                                        title: "Success",
                                        description:
                                          "Audio uploaded successfully",
                                      });
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Audio upload failed:",
                                      error
                                    );
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description:
                                        "Failed to upload audio file",
                                    });
                                  }
                                }
                              };
                              input.click();
                            }}
                          >
                            <Upload size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Video Content */}
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-2 block">
                          Video Content
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={lessonItem.video}
                            onChange={(e) =>
                              updateLessonItem(index, "video", e.target.value)
                            }
                            placeholder="video.mp4 or URL"
                            className="text-sm flex-1 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="px-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "video/*";
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement)
                                  .files?.[0];
                                if (file) {
                                  try {
                                    const fileName = `${Date.now()}_${file.name
                                      }`;
                                    const { data, error } =
                                      await supabase.storage
                                        .from("topics")
                                        .upload(fileName, file);

                                    if (error) throw error;

                                    const { data: publicData } =
                                      supabase.storage
                                        .from("topics")
                                        .getPublicUrl(fileName);

                                    if (publicData) {
                                      updateLessonItem(
                                        index,
                                        "video",
                                        publicData.publicUrl
                                      );
                                      toast({
                                        title: "Success",
                                        description:
                                          "Video uploaded successfully",
                                      });
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Video upload failed:",
                                      error
                                    );
                                    toast({
                                      variant: "destructive",
                                      title: "Error",
                                      description:
                                        "Failed to upload video file",
                                    });
                                  }
                                }
                              };
                              input.click();
                            }}
                          >
                            <Upload size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  Files
                  <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerFileInput()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Upload size={14} className="mr-2" />
                  Upload Files
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={getAcceptedFileTypes(newContent.file_type)}
                multiple
              />

              {uploadedFiles.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 max-h-32 overflow-y-auto border-2 border-gray-100">
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                      >
                        <div className="flex items-center gap-3 text-sm truncate">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <File size={14} className="text-blue-600" />
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 shrink-0"
                          onClick={() => removeFile(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={20} className="text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    No files uploaded yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Click "Upload Files" to add your content
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200 mt-auto">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setNewContent({
                    title: "",
                    description: "",
                    lesson: [{ text: "", audio: "", video: "" }],
                    file_path: [],
                    file_type: "document",
                    Topic: topic ? topic._id || topic.id : "",
                  });
                  setUploadedFiles([]);
                  setCreateDialogOpen(false);
                }}
                className="flex-1 h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateContent}
                disabled={isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    Creating Content...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus size={16} />
                    Create Content
                  </div>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Text Input Popup Dialog */}
      {/* // Replace your existing Text Input Popup Dialog with this updated
      version: */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-0 shadow-2xl">
          {/* Header */}
          <div className="relative -m-6 mb-0 p-6 bg-gradient-to-r from-slate-600 via-gray-600 to-slate-600 text-white flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <FileText size={20} className="text-white" />
                </div>
                Add Lesson Text
              </DialogTitle>
              <p className="text-slate-100 mt-2 text-sm">
                Enter the text content for this lesson item with mathematical
                expressions
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-6 flex gap-6">
            {/* Text Input Section */}
            <div
              className={`${showMathInput ? "w-1/2" : "w-full"
                } flex flex-col transition-all duration-300`}
            >
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full"></div>
                    Lesson Text Content
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMathInput(!showMathInput)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                  >
                    {showMathInput ? (
                      <>
                        <X size={14} className="mr-1" />
                        Hide Math
                      </>
                    ) : (
                      <>
                        <Calculator size={14} className="mr-1" />
                        Add Math
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  data-math-textarea
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  placeholder="Enter your lesson content here... Use \\( \\) for inline math or \\[ \\] for display math"
                  className="border-2 border-gray-200 hover:border-slate-300 focus:border-slate-400 transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none flex-1 min-h-[400px]"
                />
              </div>
            </div>
            {/* Math Input Section */}

            {showMathInput && (
              <div className="w-1/2 border-l border-gray-200 pl-6 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      Mathematical Expression
                    </label>
                  </div>

                  {/* Math Input Field */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 min-h-[100px]">
                    <div ref={mathContainerRef} className="math-field-container" />
                  </div>

                  {/* Quick Math Symbols */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-600">Quick Insert:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { symbol: "\\frac{#@}{#?}", display: "𝑎/𝑏", label: "Fraction" },
                        { symbol: "#@^{#?}", display: "x²", label: "Power" },
                        { symbol: "\\sqrt{#@}", display: "√x", label: "Square Root" },
                        { symbol: "\\sum_{#@}^{#?}", display: "∑", label: "Sum" },
                        { symbol: "\\int_{#@}^{#?}", display: "∫", label: "Integral" },
                        { symbol: "\\alpha", display: "α", label: "Alpha" },
                        { symbol: "\\beta", display: "β", label: "Beta" },
                        { symbol: "\\pi", display: "π", label: "Pi" },
                        { symbol: "\\infty", display: "∞", label: "Infinity" },
                        { symbol: "\\leq", display: "≤", label: "Less Equal" },
                        { symbol: "\\geq", display: "≥", label: "Greater Equal" },
                        { symbol: "\\neq", display: "≠", label: "Not Equal" },
                      ].map((item, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 text-sm hover:bg-blue-50 border-gray-200"
                          onClick={() => insertQuickSymbol(item.symbol)}
                          title={item.label}
                        >
                          {item.display}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Math Preview */}
                  {mathExpression && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">Preview:</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[50px] flex items-center justify-center">
                        <math-field read-only math-mode="math" value={mathExpression} />
                      </div>
                    </div>
                  )}

                  {/* Insert Button */}
                  <Button
                    type="button"
                    onClick={insertMathExpression}
                    disabled={!mathExpression}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                  >
                    <Plus size={14} className="mr-1" />
                    Insert Math Expression
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200 mt-auto">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setTextDialogOpen(false);
                  setTempText("");
                  setShowMathInput(false);
                  setMathExpression("");
                }}
                className="flex-1 h-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveText}
                className="flex-1 h-10 bg-gradient-to-r from-slate-600 via-gray-600 to-slate-600 text-white border-0 hover:from-slate-700 hover:via-gray-700 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  Save Text
                </div>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Update Content Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Content</DialogTitle>
          {contentToUpdate && (
            <div className="space-y-4 my-2">
              <div className="grid gap-3">
                <label className="text-sm font-medium">Content Type</label>
                <Select
                  value={contentToUpdate.file_type}
                  onValueChange={(value) =>
                    setContentToUpdate({
                      ...contentToUpdate,
                      file_type: value,
                    })
                  }
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
                  value={contentToUpdate.title}
                  onChange={(e) =>
                    setContentToUpdate({
                      ...contentToUpdate,
                      title: e.target.value,
                    })
                  }
                  placeholder="Content title"
                />
              </div>

              <div className="grid gap-3">
                <label className="text-sm font-medium">
                  Description<span className="text-red-500 ml-0.5">*</span>
                </label>
                <Textarea
                  value={contentToUpdate.description}
                  onChange={(e) =>
                    setContentToUpdate({
                      ...contentToUpdate,
                      description: e.target.value,
                    })
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
                    onClick={() => triggerFileInput(true)}
                    className="text-xs"
                  >
                    <Upload size={12} className="mr-1" /> Upload More Files
                  </Button>
                </div>
                <input
                  ref={updateFileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, true)}
                  accept={getAcceptedFileTypes(contentToUpdate.file_type)}
                  multiple
                />
                {contentToUpdate.file_path?.length > 0 ? (
                  <div className="bg-gray-50 rounded-md p-2 max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {contentToUpdate.file_path.map(
                        (filePath: string, index: number) => (
                          <li
                            key={index}
                            className="flex justify-between items-center text-sm bg-white rounded px-2 py-1"
                          >
                            <div className="flex items-center text-xs truncate">
                              <File size={12} className="mr-1 shrink-0" />
                              <span className="truncate">
                                {getFilenameFromPath(filePath)}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-gray-500"
                              onClick={() => removeFile(index, true)}
                            >
                              <X size={12} />
                            </Button>
                          </li>
                        )
                      )}
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
            <Button
              variant="outline"
              onClick={() => {
                setContentToUpdate(null);
                setUploadedFilesForUpdate([]);
                setUpdateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateContent}
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-1" />
                  Updating...
                </div>
              ) : (
                "Update Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContent}
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin mr-1" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
<script src="https://unpkg.com/mathlive@0.95.0/dist/mathlive.min.js"></script>;

export default ViewTopicContentDialog;
