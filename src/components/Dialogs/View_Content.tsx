import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Eye, Plus, X, FileText, Edit, Trash2 } from "lucide-react";
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
import CreateContentDialog from "./Add_Topic_Content";

interface ViewTopicContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
}

interface ContentViewerProps {
  content: any;
  onClose: () => void;
}

// Content viewer component to display different content types
const ContentViewer: React.FC<ContentViewerProps> = ({ content, onClose }) => {
  const { toast } = useToast();

  const handleDownload = (filePath: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.href = filePath;

      if (!fileName) {
        fileName = filePath.split("/").pop() || "download";
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `${fileName} is being downloaded.`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
      });
    }
  };

  if (!content) return null;

  const renderContentByType = () => {
    const fileType = content.file_type?.toLowerCase() || "unknown";
    const filePath = Array.isArray(content.file_path)
      ? content.file_path[0]
      : content.file_path;

    switch (fileType) {
      case "video":
        return (
          <div className="h-full flex flex-col">
            <div className="bg-black flex-1 flex items-center justify-center">
              <video
                className="w-full h-auto max-h-[70vh]"
                controls
                autoPlay
                src={filePath}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-4 bg-white">
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.description}</p>
            </div>
          </div>
        );

      case "pdf":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-100">
              <iframe
                src={`${filePath}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full min-h-[70vh]"
                title={content.title}
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
              <p className="text-gray-600">{content.description}</p>
            </div>
          </div>
        );

      case "document":
      case "doc":
      case "docx":
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center">
              <div className="bg-white shadow-lg p-8 max-w-3xl w-full min-h-[60vh] overflow-y-auto">
                <div className="text-center mb-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-2xl font-semibold">{content.title}</h3>
                </div>
                <div className="prose max-w-none">
                  <p>{content.description}</p>
                  <p className="text-gray-500 italic">
                    This is a document preview. For the full document, please
                    download the file.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{content.title}</h3>
              </div>
              <Button
                onClick={() => handleDownload(filePath, content.title)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download size={16} className="mr-2" /> Download Document
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                File Preview Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                This file type cannot be previewed directly. Please download to
                view.
              </p>
              <Button
                onClick={() => handleDownload(filePath, content.title)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download size={16} className="mr-2" /> Download File
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full h-screen max-w-full p-0 m-0 overflow-hidden rounded-none">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {content.title}
              </DialogTitle>
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-800"
                onClick={onClose}
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-gray-50">
            {renderContentByType()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Lesson Card Component
interface LessonCardProps {
  lesson: {
    _id: string;
    text: string;
  };
  onEdit: (lesson: { _id: string; text: string }) => void;
  onDelete: (lessonId: string) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-base font-medium leading-relaxed">
              {lesson.text}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onEdit(lesson)}
              title="Edit lesson"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete(lesson._id)}
              title="Delete lesson"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ViewTopicContentDialog: React.FC<ViewTopicContentDialogProps> = ({
  open,
  onOpenChange,
  topic,
}) => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingContent, setViewingContent] = useState<any | null>(null);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopicContents = async () => {
      if (!topic) return;

      const topicId = topic._id || topic.id;
      if (!topicId) return;

      try {
        setLoading(true);
        setError(null);

        const result = await TopicContentService.getTopicContentByTopicIdLean(
          topicId
        );
        console.log(result);
        setContents(result.data || []);
        // Set the first content as selected by default
        if (result.data && result.data.length > 0) {
          setSelectedContent(result.data[0]);
        }
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

  const handleViewContent = (content: any) => {
    setViewingContent(content);
  };

  const handleCloseContentViewer = () => {
    setViewingContent(null);
  };

  // Function to handle file downloads
  const handleDownload = (filePath: string, fileName: string) => {
    try {
      const link = document.createElement("a");
      link.href = filePath;

      if (!fileName) {
        fileName = filePath.split("/").pop() || "download";
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `${fileName} is being downloaded.`,
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download the file. Please try again.",
      });
    }
  };

  // Lesson management functions
  const handleEditLesson = (lesson: { _id: string; text: string }) => {
    toast({
      title: "Edit Lesson",
      description: `Editing lesson: ${lesson.text}`,
    });
    // Implement edit functionality here
  };

  const handleDeleteLesson = (lessonId: string) => {
    toast({
      title: "Delete Lesson",
      description: "Are you sure you want to delete this lesson?",
      variant: "destructive",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast({
              title: "Lesson Deleted",
              description: "The lesson has been deleted successfully.",
            });
          }}
        >
          Confirm
        </Button>
      ),
    });
    // Implement delete functionality here
  };

  const handleAddLesson = () => {
    toast({
      title: "Add New Lesson",
      description: "Opening lesson creation form...",
    });
    // Implement add lesson functionality here
  };

  if (!topic) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full h-screen max-w-full p-0 m-0 overflow-hidden rounded-none">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-700 to-green-900 p-8 text-white">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div>
                  <DialogTitle className="text-3xl font-bold tracking-tight">
                    {topic.title || topic.name}
                  </DialogTitle>
                  <div className="flex items-center mt-3 text-green-100">
                    <BookOpen size={18} className="mr-2" />
                    <span className="text-base">Topic Contents</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-900"
                  >
                    <Download size={16} className="mr-2" /> Export
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-900"
                  >
                    <Plus size={16} className="mr-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="max-w-7xl mx-auto py-8 px-6">
                {loading && (
                  <div className="flex justify-center items-center py-24">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-green-600 animate-spin"></div>
                      <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-t-4 border-green-200 animate-pulse"></div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md max-w-3xl mx-auto">
                    <div className="flex items-center">
                      <X className="h-6 w-6 text-red-500 mr-3" />
                      <p className="text-red-700 text-lg">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && contents.length === 0 && (
                  <div className="text-center py-24 px-4">
                    <div className="bg-white rounded-xl shadow-sm p-12 max-w-2xl mx-auto">
                      <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                        <BookOpen size={36} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-medium text-gray-800 mb-4">
                        No content yet
                      </h3>
                      <p className="text-gray-500 text-lg max-w-md mx-auto mb-6">
                        No content has been added to this topic yet. Add content
                        to enhance the learning experience.
                      </p>
                      <Button className="bg-green-700 hover:bg-green-800 text-white px-6">
                        <Plus size={18} className="mr-2" /> Add Your First
                        Content
                      </Button>
                    </div>
                  </div>
                )}

                {!loading && !error && contents.length > 0 && (
                  <div className="space-y-8">
                    {/* Content Cards */}
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Materials</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {contents.map((content, index) => {
                          const fileType = content.file_type || "Unknown";
                          return (
                            <Card
                              key={content._id || index}
                              className="overflow-hidden border border-gray-100 hover:shadow-lg transition duration-300"
                            >
                              <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white flex justify-between">
                                <div>
                                  <CardTitle className="text-xl font-semibold">
                                    {content.title}
                                  </CardTitle>
                                  {fileType && (
                                    <CardDescription className="text-gray-500 text-sm mt-1 flex items-center">
                                      <span
                                        className={`inline-block w-3 h-3 rounded-full mr-1 ${fileType === "pdf"
                                            ? "bg-red-400"
                                            : fileType === "video"
                                              ? "bg-blue-400"
                                              : fileType === "document"
                                                ? "bg-green-400"
                                                : "bg-gray-400"
                                          }`}
                                      />
                                      {fileType.charAt(0).toUpperCase() +
                                        fileType.slice(1)}
                                    </CardDescription>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`capitalize text-sm px-3 py-1 ${fileType === "pdf"
                                      ? "border-red-200 bg-red-50 text-red-700"
                                      : fileType === "video"
                                        ? "border-blue-200 bg-blue-50 text-blue-700"
                                        : fileType === "document"
                                          ? "border-green-200 bg-green-50 text-green-700"
                                          : "border-gray-200 bg-gray-50 text-gray-700"
                                    }`}
                                >
                                  {fileType}
                                </Badge>
                              </CardHeader>
                              <CardContent>
                                <p className="text-base text-gray-700 mb-4">
                                  {content.description}
                                </p>

                                {content.file_path && (
                                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-xs uppercase text-gray-500 font-medium mb-3">
                                      Attached Files
                                    </h4>
                                    <ul className="space-y-2">
                                      {Array.isArray(content.file_path) ? (
                                        content.file_path.map(
                                          (file: string, fileIndex: number) => {
                                            const fileName = file
                                              .split("/")
                                              .pop();
                                            const ext = fileName
                                              ?.split(".")
                                              .pop()
                                              ?.toLowerCase();
                                            const iconColor =
                                              {
                                                pdf: "text-red-500",
                                                doc: "text-blue-500",
                                                docx: "text-blue-500",
                                                xls: "text-green-500",
                                                xlsx: "text-green-500",
                                                jpg: "text-purple-500",
                                                png: "text-purple-500",
                                                gif: "text-purple-500",
                                              }[ext || ""] || "text-gray-400";

                                            return (
                                              <li
                                                key={fileIndex}
                                                className="text-sm text-blue-600 flex items-center py-2 px-3 hover:bg-gray-100 rounded-md"
                                              >
                                                <div
                                                  className={`mr-3 ${iconColor}`}
                                                >
                                                  <BookOpen size={16} />
                                                </div>
                                                <span className="truncate flex-1">
                                                  {fileName}
                                                </span>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 ml-2 text-gray-500 hover:text-gray-700"
                                                  onClick={() =>
                                                    handleDownload(
                                                      file,
                                                      fileName || ""
                                                    )
                                                  }
                                                >
                                                  <Download size={16} />
                                                </Button>
                                              </li>
                                            );
                                          }
                                        )
                                      ) : (
                                        <li className="text-sm text-blue-600 flex items-center py-2 px-3 hover:bg-gray-100 rounded-md">
                                          <div className="mr-3 text-gray-400">
                                            <BookOpen size={16} />
                                          </div>
                                          <span className="truncate flex-1">
                                            {content.file_path.split("/").pop()}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 ml-2 text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                              handleDownload(
                                                content.file_path,
                                                content.file_path
                                                  .split("/")
                                                  .pop() || ""
                                              )
                                            }
                                          >
                                            <Download size={16} />
                                          </Button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                <div className="mt-6 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-500 hover:bg-gray-100 hover:text-gray-700 mr-2"
                                    onClick={() => handleViewContent(content)}
                                  >
                                    <Eye size={14} className="mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                      const filePath = Array.isArray(
                                        content.file_path
                                      )
                                        ? content.file_path[0]
                                        : content.file_path;
                                      const fileName = filePath
                                        ? filePath.split("/").pop()
                                        : content.title;
                                      handleDownload(filePath, fileName || "");
                                    }}
                                  >
                                    <Download size={14} className="mr-1" />{" "}
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lessons Section */}
                    {selectedContent && selectedContent.lesson && selectedContent.lesson.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                              Lessons for {selectedContent.title}
                            </h2>
                            <p className="text-gray-600 mt-2">
                              Manage and organize your lesson content
                            </p>
                          </div>
                          <Button
                            onClick={handleAddLesson}
                            className="bg-green-700 hover:bg-green-800 text-white"
                          >
                            <Plus size={18} className="mr-2" /> Add Lesson
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {selectedContent.lesson.map((lesson: any, index: number) => (
                            <LessonCard
                              key={lesson._id || index}
                              lesson={lesson}
                              onEdit={handleEditLesson}
                              onDelete={handleDeleteLesson}
                            />
                          ))}
                        </div>

                        {selectedContent.lesson.length > 6 && (
                          <div className="mt-6 flex justify-center">
                            <Button
                              variant="outline"
                              className="text-green-700 border-green-200 hover:bg-green-50"
                            >
                              Load More Lessons
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {contents.length > 4 && (
                      <div className="mt-8 flex justify-center">
                        <Button
                          variant="outline"
                          className="text-green-700 border-green-200 hover:bg-green-50"
                        >
                          Load More Content
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-6 border-t border-gray-200 shadow-md">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-500">
                  <BookOpen size={16} />
                  <span>{contents.length} content items</span>
                  {selectedContent && selectedContent.lesson && (
                    <span className="ml-4 flex items-center">
                      <FileText size={16} className="mr-1" />
                      {selectedContent.lesson.length} lessons
                    </span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="bg-green-700 hover:bg-green-800 text-white"
                  >
                    <Plus size={16} className="mr-2" /> Add Content
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Viewer Dialog */}
      {viewingContent && (
        <ContentViewer
          content={viewingContent}
          onClose={handleCloseContentViewer}
        />
      )}
    </>
  );
};

export default ViewTopicContentDialog;