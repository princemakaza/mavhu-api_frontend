import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  Plus,
  X,
  File,
  FileText,
  Loader2,
  Edit,
  Trash2,
  GripVertical,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";
import Topic from "../Interfaces/Topic_Interface";
import { useNavigate } from "react-router-dom";

import FileViewerDialog from "./FileViewerDialog";
import {
  EditContentDialog,
  ConfirmDialog,
  LessonEditDialog,
  // kept import alias in case it’s referenced elsewhere
  LessonDeleteDialog as _UnusedLessonDeleteDialog,
} from "./ContentAndLessonDialogs";

// ---------- DnD: core + sortable + your wrapper ----------
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sortable } from "@/pages/Admin_Pages/editContentComponents/Sortable";
import EndLessonQuestionService from "@/services/Admin_Service/end_lesson_question_service";

// ---------- Local types ----------
interface ViewTopicContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
}

interface Lesson {
  _id: string;
  text: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  description: string;
  lesson?: Lesson[];
  file_path?: string[];
  file_type?: "document" | "video" | "audio" | string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// ---------- Helpers ----------
const getFilenameFromPath = (path: string) => path.split("/").pop() || path;

const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["pdf", "doc", "docx", "txt"].includes(ext || "")) {
    return <FileText size={12} className="mr-1" />;
  }
  return <File size={12} className="mr-1" />;
};

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
    "webm",
    "webp",
  ].includes(ext || "");
};

const ViewTopicContentDialog: React.FC<ViewTopicContentDialogProps> = ({
  open,
  onOpenChange,
  topic,
}) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  // File viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [viewingFileIndex, setViewingFileIndex] = useState(0);

  // Edit content state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [contentToUpdate, setContentToUpdate] = useState<ContentItem | null>(null);

  // Delete content state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  // Lessons (edit/delete) state
  const [lessonEditOpen, setLessonEditOpen] = useState(false);
  const [lessonBeingEdited, setLessonBeingEdited] = useState<{ lesson: Lesson; contentId: string } | null>(null);

  const [lessonDeleteOpen, setLessonDeleteOpen] = useState(false);
  const [lessonBeingDeleted, setLessonBeingDeleted] = useState<{ lesson: Lesson; contentId: string } | null>(null);

  const exportLinkRef = useRef<HTMLAnchorElement>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Quiz presence per content
  // 'loading' | 'exists' | 'none' | 'error'
  const [quizStatus, setQuizStatus] = useState<Record<string, "loading" | "exists" | "none" | "error">>({});

  // Fetch contents (and then quiz presence)
  useEffect(() => {
    const fetchTopicContents = async () => {
      if (!topic) return;
      const topicId = (topic as any)._id || (topic as any).id;
      if (!topicId) return;

      try {
        setLoading(true);
        setError(null);
        const result = await TopicContentService.getTopicContentByTopicIdLean(topicId);

        let contentsData: ContentItem[] = [];
        if (Array.isArray(result)) contentsData = result;
        else if (result && Array.isArray(result.data)) contentsData = result.data;
        else if (result && typeof result === "object") contentsData = [result];

        setContents(contentsData);

        // After contents load, check quiz existence per content
        await checkQuizzesForContents(contentsData);
      } catch (err) {
        console.error("Failed to fetch topic contents:", err);
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

    if (open && topic) fetchTopicContents();
  }, [open, topic, toast]);

  const checkQuizzesForContents = async (items: ContentItem[]) => {
    // set initial loading
    const init: Record<string, "loading" | "exists" | "none" | "error"> = {};
    items.forEach((c) => (init[c._id] = "loading"));
    setQuizStatus(init);

    // run checks in parallel
    const results = await Promise.all(
      items.map(async (c) => {
        try {
          const res = await EndLessonQuestionService.getQuizzesByContentId(c._id);
          const count =
            typeof res?.count === "number" ? res.count :
            Array.isArray(res?.data) ? res.data.length : 0;
          return { id: c._id, status: count > 0 ? "exists" as const : "none" as const };
        } catch (e) {
          console.error("Quiz check failed for content:", c._id, e);
          return { id: c._id, status: "error" as const };
        }
      })
    );

    setQuizStatus((prev) => {
      const next = { ...prev };
      results.forEach(({ id, status }) => (next[id] = status));
      return next;
    });
  };

  const handleAddContentClick = () => {
    const myId = (topic as any)._id;
    navigate(`/courses/topics/${myId}/content/new`);
  };

  const goToAddLesson = (contentId: string) => {
    navigate(`/admin/topic-contents/${contentId}/add-lesson`);
  };

  const refreshContents = async () => {
    if (!topic) return;
    const topicId = (topic as any)._id || (topic as any).id;
    const result = await TopicContentService.getTopicContentByTopicIdLean(topicId);

    let contentsData: ContentItem[] = [];
    if (Array.isArray(result)) contentsData = result;
    else if (result && Array.isArray(result.data)) contentsData = result.data;
    else if (result && typeof result === "object") contentsData = [result];

    setContents(contentsData);
    await checkQuizzesForContents(contentsData);
  };

  const openUpdateDialog = (content: ContentItem) => {
    setContentToUpdate({ ...content });
    setUpdateDialogOpen(true);
  };

  const openDeleteDialog = (contentId: string) => {
    setContentToDelete(contentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteContent = async () => {
    if (!contentToDelete) return;
    try {
      await TopicContentService.moveToTrash(contentToDelete);
      setContents((prev) => prev.filter((c) => c._id !== contentToDelete));
      toast({ title: "Success", description: "Content deleted successfully" });
      // also remove quiz status for the deleted content
      setQuizStatus((prev) => {
        const next = { ...prev };
        delete next[contentToDelete];
        return next;
      });
    } catch (err) {
      console.error("Failed to delete content:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete content. Please try again.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const handleViewContent = (content: ContentItem, fileIndex = 0) => {
    setViewingContent(content);
    setViewingFileIndex(fileIndex);
    setViewerOpen(true);
  };

  const handleExportTopic = async () => {
    if (!topic) return;
    try {
      const exportData = {
        topic: {
          id: (topic as any)._id || (topic as any).id,
          title: (topic as any).title || (topic as any).name,
          description: (topic as any).description,
          price: (topic as any).price,
          regularPrice: (topic as any).regularPrice,
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

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      if (exportLinkRef.current) {
        exportLinkRef.current.href = url;
        exportLinkRef.current.download = `${(topic as any).title || (topic as any).name
          }_export_${new Date().toISOString().split("T")[0]}.json`;
        exportLinkRef.current.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: "Export Complete", description: "Topic content exported successfully." });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Unable to export topic content. Please try again.",
      });
    }
  };

  // Lesson helpers
  const openLessonEditDialog = (lesson: Lesson, contentId: string) => {
    setLessonBeingEdited({ lesson, contentId });
    setLessonEditOpen(true);
  };

  const openLessonDeleteDialog = (lesson: Lesson, contentId: string) => {
    setLessonBeingDeleted({ lesson, contentId });
    setLessonDeleteOpen(true);
  };

  const saveLessonEdit = async () => {
    if (!lessonBeingEdited) return;
    try {
      const content = contents.find((c) => c._id === lessonBeingEdited.contentId);
      if (!content) return;

      const updatedLessons = (content.lesson || []).map((l) =>
        l._id === lessonBeingEdited.lesson._id
          ? { ...l, text: lessonBeingEdited.lesson.text }
          : l
      );

      await TopicContentService.updateTopicContent(lessonBeingEdited.contentId, {
        ...content,
        lesson: updatedLessons,
      });

      await refreshContents();
      setLessonEditOpen(false);
      setLessonBeingEdited(null);
      toast({ title: "Updated", description: "Lesson updated successfully." });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update lesson. Please try again.",
      });
    }
  };

  const confirmLessonDelete = async () => {
    if (!lessonBeingDeleted) return;
    try {
      const { contentId, lesson } = lessonBeingDeleted;
      await TopicContentService.deleteLesson(contentId, lesson._id); // permanent delete API
      await refreshContents();
      setLessonDeleteOpen(false);
      setLessonBeingDeleted(null);
      toast({ title: "Deleted", description: "Lesson permanently deleted." });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete lesson. Please try again.",
      });
    }
  };

  // Compute totals
  const totalLessons = useMemo(
    () =>
      Array.isArray(contents)
        ? contents.reduce((acc, c) => acc + (c.lesson?.length || 0), 0)
        : 0,
    [contents]
  );

  const hasFiles = useMemo(
    () => Array.isArray(contents) && contents.some((c) => c.file_path && c.file_path.length > 0),
    [contents]
  );

  if (!topic) return null;

  // ---------- DnD Handlers (per-content) ----------
  const makeOnDragEnd = (contentId: string) => async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setContents((prev) => {
      const next = prev.map((content) => {
        if (content._id !== contentId) return content;
        const lessons = content.lesson || [];
        const oldIndex = lessons.findIndex((l) => l._id === active.id);
        const newIndex = lessons.findIndex((l) => l._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return content;
        const reordered = arrayMove(lessons, oldIndex, newIndex);
        return { ...content, lesson: reordered };
      });
      return next;
    });

    // Persist order to backend
    try {
      const content = contents.find((c) => c._id === contentId);
      const order = (content?.lesson || []).map((l) => l._id);
      await TopicContentService.reorderLessons(contentId, order);
      toast({ title: "Order saved", description: "Lesson order updated." });
    } catch (err) {
      console.error("Failed to reorder lessons:", err);
      toast({
        variant: "destructive",
        title: "Reorder failed",
        description: "Could not save the new lesson order. Please try again.",
      });
      await refreshContents();
    }
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
                    {(topic as any).title || (topic as any).name}
                  </DialogTitle>
                </div>
                <div className="flex space-x-3">
                  {contents.length === 0 ? (
                    <Button
                      onClick={handleAddContentClick}
                      variant="outline"
                      size="sm"
                      className="bg-blue-400 border-white text-white hover:bg-white hover:text-green-900"
                    >
                      <Plus size={14} className="mr-1" /> Add Content
                    </Button>
                  ) : (
                    <Button
                      onClick={() => goToAddLesson(contents[0]._id)}
                      variant="outline"
                      size="sm"
                      className="bg-green-500 border-white text-white hover:bg-white hover:text-green-900"
                    >
                      <Plus size={14} className="mr-1" /> Add Lesson
                    </Button>
                  )}

                  {/* Hidden export link */}
                  <a ref={exportLinkRef} className="hidden" />
                </div>
              </div>
            </div>

            {/* Topic Details */}
            <div className="bg-white border-b border-gray-100 py-4 px-6 shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-xs text-blue-800 mb-1">Description</h3>
                  <p className="text-gray-700 text-sm">
                    {(topic as any).description || "No description available"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-xs text-gray-600 mb-1">Price</h3>
                    <p className="text-base font-semibold text-green-700">
                      ${(topic as any).price || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium text-xs text-gray-600 mb-1">Regular Price</h3>
                    <p className="text-base font-semibold text-gray-700">
                      ${(topic as any).regularPrice || 0}
                    </p>
                    {(topic as any).price < (topic as any).regularPrice && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {Math.round(
                          (
                            ((topic as any).regularPrice - (topic as any).price) /
                            (topic as any).regularPrice
                          ) * 100
                        )}
                        % Off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN */}
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
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mx-auto">
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                ) : !Array.isArray(contents) || contents.length === 0 ? (
                  <div className="text-center py-16 px-4">
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
                      onClick={handleAddContentClick}
                      size="sm"
                    >
                      <Plus size={16} className="mr-1" /> Add Your First Content
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Lessons grouped by content with DnD per group */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        All Lessons ({totalLessons} total)
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {contents.map((content) => {
                        const lessons = content.lesson || [];
                        const qStatus = quizStatus[content._id] || "loading";

                        return (
                          <div key={content._id} className="bg-white rounded-xl border">
                            <div className="flex items-center justify-between p-4 border-b">
                              <div className="text-sm font-semibold text-gray-800">
                                {content.title}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => goToAddLesson(content._id)}
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-500 border-green-500 text-white hover:bg-green-600"
                                >
                                  <Plus size={14} className="mr-1" /> Add Lesson
                                </Button>

                                <Button
                                  onClick={() =>
                                    navigate(`/admin_dashboard/courses/topics/${content._id}/content/edit/${content._id}`)
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  Edit Content
                                </Button>

                                <Button
                                  onClick={() => openDeleteDialog(content._id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                                >
                                  Delete Content
                                </Button>

                                {/* ==== QUIZ BUTTON (conditional) ==== */}
                                {qStatus === "loading" ? (
                                  <Button variant="outline" size="sm" disabled>
                                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                    Checking quiz…
                                  </Button>
                                ) : qStatus === "exists" ? (
                                  <Button
                                    onClick={() => navigate(`/topics/${content._id}/quiz/edit`)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                                    Edit end-lesson quiz
                                  </Button>
                                ) : qStatus === "error" ? (
                                  <Button
                                    onClick={() => checkQuizzesForContents([content])}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                                    Retry quiz check
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => navigate(`/topics/${content._id}/quiz/new`)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Add End Lesson Questions
                                  </Button>
                                )}
                              </div>
                            </div>

                            {lessons.length === 0 ? (
                              <div className="p-4 text-sm text-gray-600">
                                No lessons in this content yet.
                              </div>
                            ) : (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={makeOnDragEnd(content._id)}
                              >
                                <SortableContext
                                  items={lessons.map((l) => l._id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <ul className="divide-y">
                                    {lessons.map((lesson) => (
                                      <Sortable key={lesson._id} id={lesson._id} className="bg-white">
                                        {({ attributes, listeners }) => (
                                          <li className="flex items-center justify-between p-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                              {/* Drag handle */}
                                              <button
                                                className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-grab active:cursor-grabbing"
                                                {...attributes}
                                                {...listeners}
                                                aria-label="Drag to reorder"
                                                title="Drag to reorder"
                                              >
                                                <GripVertical size={16} />
                                              </button>

                                              <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-medium text-gray-900 truncate">
                                                    {lesson.text}
                                                  </span>
                                                  <Badge variant="outline" className="shrink-0 text-xs">
                                                    Lesson
                                                  </Badge>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                              <Button
                                                variant="outline"
                                                className="h-8 text-xs font-medium border-amber-200 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                onClick={() =>
                                                  navigate(`/content/${content._id}/lessons/${lesson._id}/edit`)
                                                }
                                              >
                                                <Edit size={14} className="mr-1" />
                                                Edit
                                              </Button>
                                              <Button
                                                variant="outline"
                                                className="h-8 text-xs font-medium border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => openLessonDeleteDialog(lesson, content._id)}
                                              >
                                                <Trash2 size={14} className="mr-1" />
                                                Delete
                                              </Button>
                                            </div>
                                          </li>
                                        )}
                                      </Sortable>
                                    ))}
                                  </ul>
                                </SortableContext>
                              </DndContext>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Files across all content */}
                    {hasFiles && (
                      <div className="mt-6">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700">Files from All Content</h4>
                        <div className="space-y-3">
                          {contents.map(
                            (content) =>
                              content.file_path &&
                              content.file_path.length > 0 && (
                                <div key={content._id} className="bg-white rounded-lg p-4 shadow-sm">
                                  <h5 className="text-xs font-medium mb-2 text-gray-600">
                                    {content.title}
                                  </h5>
                                  <ul className="bg-gray-50 p-3 rounded-md space-y-1 max-h-40 overflow-y-auto">
                                    {content.file_path.map((file, i) => (
                                      <li
                                        key={i}
                                        className="flex justify-between items-center text-xs text-blue-600"
                                      >
                                        <span className="truncate flex items-center">
                                          {getFileIcon(file)}
                                          {getFilenameFromPath(file)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          {isViewableInBrowser(file) && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 text-xs"
                                              onClick={() => handleViewContent(content, i)}
                                            >
                                              View
                                            </Button>
                                          )}
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6"
                                            onClick={() => {
                                              const link = document.createElement("a");
                                              link.href = file;
                                              link.target = "_blank";
                                              link.download = getFilenameFromPath(file);
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                              toast({
                                                title: "Download Started",
                                                description: "Your file download has started.",
                                              });
                                            }}
                                          >
                                            <Download size={12} />
                                          </Button>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-200 shadow-sm shrink-0 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-gray-500 flex items-center space-x-2 text-sm">
                  <BookOpen size={14} />
                  <span>{totalLessons} lesson{totalLessons === 1 ? "" : "s"}</span>
                </div>
                <div className="flex space-x-3">
                  {/* <Button size="sm" variant="outline" onClick={handleExportTopic}>
                    Export
                  </Button> */}
                  <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <FileViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        content={viewingContent}
        fileIndex={viewingFileIndex}
        setFileIndex={setViewingFileIndex}
      />

      <EditContentDialog
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        content={contentToUpdate}
        onUpdated={async () => {
          await refreshContents();
          setContentToUpdate(null);
        }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Content"
        description="Are you sure you want to delete this content? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={handleDeleteContent}
      />

      <LessonEditDialog
        open={lessonEditOpen}
        onOpenChange={setLessonEditOpen}
        value={lessonBeingEdited?.lesson.text || ""}
        onChange={(text) =>
          setLessonBeingEdited((prev) =>
            prev ? { ...prev, lesson: { ...prev.lesson, text } } : prev
          )
        }
        onSave={saveLessonEdit}
      />

      <ConfirmDialog
        open={lessonDeleteOpen}
        onOpenChange={setLessonDeleteOpen}
        title="Delete Lesson Permanently"
        description="This will permanently delete the lesson and cannot be undone. Do you want to proceed?"
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={confirmLessonDelete}
      />
    </>
  );
};

export default ViewTopicContentDialog;
