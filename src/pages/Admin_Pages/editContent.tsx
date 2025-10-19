// EditContent.tsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus, X, Upload, ChevronLeft, Edit, ChevronDown,
  Music, Video, FileText, Image as ImageIcon, Eye, Trash2, GripVertical, Play, Pause, CornerDownLeft, Crosshair
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import {
  ContentFormData,
  LessonItem,
  SubHeadingItem,
  MCQQuestion,
  getAcceptedFileTypes,
  extractFilenameFromUrl,
  shortenFilename,
  uploadSingleToSupabase,
  mergeNewUploads,
  fetchContentById,
  updateContent as updateContentApi,
  getLessonComments,
  addLessonComment,
  replyToComment,
  deleteLessonComment,
  getLessonReactions,
  addLessonReaction,
  deleteLessonReaction,
} from "../Admin_Pages/functions_edit";

import { MathInput, getDisplayLines } from "./editContentComponents/MathInput";
import { QuestionModal } from "./editContentComponents/QuestionModal";
import { Sortable } from "./editContentComponents/Sortable";
import { LoadingShimmer } from "./editContentComponents/LoadingShimmer";

type UploadKind = "audio" | "video" | "document" | "image";

const EditContent: React.FC = () => {
  const { contentId, topicId } = useParams<{ contentId: string; topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [content, setContent] = useState<ContentFormData>({
    title: "",
    description: "",
    lesson: [{
      text: "",
      subHeading: [{
        text: "",
        question: "",
        subheadingAudioPath: "",
        expectedAnswer: "",
        comment: "",
        hint: "",
        mcqQuestions: [],
        timingArray: [],
      } as SubHeadingItem],
      audio: "", video: "", image: ""
    }],
    file_path: [],
    file_type: "document",
    Topic: topicId || "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [initialExistingFileCount, setInitialExistingFileCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState({ lessonIndex: -1, subHeadingIndex: -1 });
  const [selectedFileType, setSelectedFileType] = useState<UploadKind>("audio");
  const [uploading, setUploading] = useState(false);
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});

  const [audioStatuses, setAudioStatuses] = useState<("idle" | "uploading" | "success")[]>([]);
  const [videoStatuses, setVideoStatuses] = useState<("idle" | "uploading" | "success")[]>([]);
  const [imageStatuses, setImageStatuses] = useState<("idle" | "uploading" | "success")[]>([]);
  const [uploadedAudioNames, setUploadedAudioNames] = useState<(string | null)[]>([]);
  const [uploadedVideoNames, setUploadedVideoNames] = useState<(string | null)[]>([]);
  const [uploadedImageNames, setUploadedImageNames] = useState<(string | null)[]>([]);

  const [newCommentByLesson, setNewCommentByLesson] = useState<Record<number, string>>({});
  const [newReplyByLessonAndIndex, setNewReplyByLessonAndIndex] = useState<Record<string, string>>({});

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const getAudioKey = (l: number, s: number) => `${l}_${s}`;

  // ---------- timingArray helpers ----------
  const ensureTimingArrayLength = (arr: number[] | undefined, linesCount: number): number[] => {
    const existing = Array.isArray(arr) ? [...arr] : [];
    if (linesCount <= 0) return [];
    if (existing.length === 0) {
      const a = Array(linesCount).fill(0);
      a[0] = 0;
      return a;
    }
    if (existing.length < linesCount) {
      const last = existing.at(-1) ?? 0;
      return [...existing, ...Array(linesCount - existing.length).fill(last)];
    }
    if (existing.length > linesCount) {
      return existing.slice(0, linesCount);
    }
    return existing;
  };

  const syncTimingArray = (lessonIndex: number, subHeadingIndex: number, linesLen?: number) => {
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      const sh = next.lesson[lessonIndex].subHeading[subHeadingIndex];
      const count = linesLen ?? getDisplayLines(sh.text || "").length;
      sh.timingArray = ensureTimingArrayLength(sh.timingArray, count);
      return next;
    });
  };

  // ---------- drag handlers ----------
  const onLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).split("-")[1]);
    const newIndex = Number(String(over.id).split("-")[1]);

    setContent((prev) => ({ ...prev, lesson: arrayMove(prev.lesson, oldIndex, newIndex) }));

    setActiveLessonIndex((prevActive) => {
      if (prevActive === oldIndex) return newIndex;
      if (oldIndex < prevActive && newIndex >= prevActive) return prevActive - 1;
      if (oldIndex > prevActive && newIndex <= prevActive) return prevActive + 1;
      return prevActive;
    });

    toast({ title: "Lesson moved", description: `Moved to position ${newIndex + 1}`, duration: 2500 });
  };

  const onSectionDragEnd = (event: DragEndEvent, lessonIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = Number(String(active.id).split("-")[1]);
    const newIndex = Number(String(over.id).split("-")[1]);

    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      next.lesson[lessonIndex].subHeading = arrayMove(next.lesson[lessonIndex].subHeading, oldIndex, newIndex);
      return next;
    });

    toast({ title: "Section moved", description: `Moved to position ${newIndex + 1}`, duration: 2500 });
  };

  // ---------- inline editing toggles ----------
  const getFieldPath = (lessonIndex: number, subHeadingIndex: number | null, fieldName: string) =>
    subHeadingIndex === null ? `lesson_${lessonIndex}_${fieldName}` : `lesson_${lessonIndex}_subheading_${subHeadingIndex}_${fieldName}`;
  const toggleEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: !prev[fieldPath] }));
  const saveMathValue = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));
  const cancelEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));

  // ---------- upload ribbons ----------
  const updateAudioState = (i: number, status: "idle" | "uploading" | "success", name?: string | null) => {
    setAudioStatuses((p) => { const a = [...p]; a[i] = status; return a; });
    if (name !== undefined) setUploadedAudioNames((p) => { const a = [...p]; a[i] = name; return a; });
  };
  const updateVideoState = (i: number, status: "idle" | "uploading" | "success", name?: string | null) => {
    setVideoStatuses((p) => { const a = [...p]; a[i] = status; return a; });
    if (name !== undefined) setUploadedVideoNames((p) => { const a = [...p]; a[i] = name; return a; });
  };
  const updateImageState = (i: number, status: "idle" | "uploading" | "success", name?: string | null) => {
    setImageStatuses((p) => { const a = [...p]; a[i] = status; return a; });
    if (name !== undefined) setUploadedImageNames((p) => { const a = [...p]; a[i] = name; return a; });
  };

  // ---------- initial fetch ----------
  useEffect(() => {
    (async () => {
      try {
        if (!contentId) return;
        const { normalized } = await fetchContentById(contentId);

        // Make sure timingArray is present and sized to the detected lines
        const normalizedWithTimings: ContentFormData = {
          ...content,
          ...normalized,
          Topic: normalized.Topic || topicId || "",
          lesson: (normalized.lesson || []).map((L: LessonItem) => ({
            ...L,
            subHeading: (L.subHeading || []).map((SH: SubHeadingItem) => {
              const lines = getDisplayLines(SH.text || "");
              return { ...SH, timingArray: ensureTimingArrayLength(SH.timingArray, lines.length) };
            }),
          })),
        };

        setContent((prev) => ({ ...prev, ...normalizedWithTimings }));
        setInitialExistingFileCount(normalizedWithTimings.file_path?.length || 0);

        setAudioStatuses(normalizedWithTimings.lesson.map((l) => l.audio ? "success" : "idle"));
        setVideoStatuses(normalizedWithTimings.lesson.map((l) => l.video ? "success" : "idle"));
        setImageStatuses(normalizedWithTimings.lesson.map((l) => l.image ? "success" : "idle"));
        setUploadedAudioNames(normalizedWithTimings.lesson.map((l) => l.audio ? shortenFilename(extractFilenameFromUrl(l.audio)) : null));
        setUploadedVideoNames(normalizedWithTimings.lesson.map((l) => l.video ? shortenFilename(extractFilenameFromUrl(l.video)) : null));
        setUploadedImageNames(normalizedWithTimings.lesson.map((l) => l.image ? shortenFilename(extractFilenameFromUrl(l.image)) : null));

        // hydrate comments & reactions without clobbering timingArray
        for (let i = 0; i < normalizedWithTimings.lesson.length; i++) {
          try {
            const [commentsRes, reactionsRes] = await Promise.all([
              getLessonComments(contentId, i),
              getLessonReactions(contentId, i),
            ]);
            setContent((prev) => {
              const next = structuredClone(prev) as ContentFormData;
              (next.lesson[i] as any).comments = commentsRes?.data || [];
              (next.lesson[i] as any).reactions = reactionsRes?.data || [];
              return next;
            });
          } catch { /* ignore individual failures */ }
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
        const t = toast({
          variant: "destructive",
          title: "Oops! Couldn't Load Content",
          description: "We couldn't load the content data right now. Please try again.",
          duration: 8000,
          action: (
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-red-100" onClick={() => t.dismiss()}>
              Dismiss
            </Button>
          ),
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId, topicId]);

  // ---------- lesson/subheading CRUD ----------
  const addLessonItem = () => {
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      next.lesson.push({
        text: "",
        subHeading: [{
          text: "",
          question: "",
          subheadingAudioPath: "",
          expectedAnswer: "",
          comment: "",
          hint: "",
          mcqQuestions: [],
          timingArray: [],
        }],
        audio: "", video: "", image: ""
      });
      return next;
    });
    setAudioStatuses((p) => [...p, "idle"]);
    setVideoStatuses((p) => [...p, "idle"]);
    setImageStatuses((p) => [...p, "idle"]);
    setUploadedAudioNames((p) => [...p, null]);
    setUploadedVideoNames((p) => [...p, null]);
    setUploadedImageNames((p) => [...p, null]);
    setActiveLessonIndex(content.lesson.length);
  };

  const removeLessonItem = (index: number) => {
    if (content.lesson.length <= 1) return;
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      next.lesson.splice(index, 1);
      return next;
    });
    setAudioStatuses((p) => p.filter((_, i) => i !== index));
    setVideoStatuses((p) => p.filter((_, i) => i !== index));
    setImageStatuses((p) => p.filter((_, i) => i !== index));
    setUploadedAudioNames((p) => p.filter((_, i) => i !== index));
    setUploadedVideoNames((p) => p.filter((_, i) => i !== index));
    setUploadedImageNames((p) => p.filter((_, i) => i !== index));
    if (index === activeLessonIndex) setActiveLessonIndex(Math.max(0, index - 1));
  };

  const addSubHeading = (lessonIndex: number) => {
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      next.lesson[lessonIndex].subHeading.push({
        text: "",
        question: "",
        subheadingAudioPath: "",
        expectedAnswer: "",
        comment: "",
        hint: "",
        mcqQuestions: [],
        timingArray: [],
      });
      return next;
    });
  };

  const removeSubHeading = (lessonIndex: number, subHeadingIndex: number) => {
    if (content.lesson[lessonIndex].subHeading.length <= 1) return;
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      next.lesson[lessonIndex].subHeading.splice(subHeadingIndex, 1);
      return next;
    });
  };

  const updateLessonItem = (lessonIndex: number, field: keyof LessonItem, value: string) => {
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      (next.lesson[lessonIndex] as any)[field] = value;
      return next;
    });
  };

  const updateSubHeadingItem = <K extends keyof SubHeadingItem>(
    lessonIndex: number,
    subHeadingIndex: number,
    field: K,
    value: SubHeadingItem[K]
  ) => {
    setContent((prev) => {
      const next = structuredClone(prev) as ContentFormData;
      const sh = next.lesson[lessonIndex].subHeading[subHeadingIndex];
      (sh as any)[field] = value;
      if (field === "text") {
        const count = getDisplayLines(String(value) || "").length;
        sh.timingArray = ensureTimingArrayLength(sh.timingArray, count);
      }
      return next;
    });
  };

  // ---------- topic-level files ----------
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);

    const tempPaths = files.map((f) => URL.createObjectURL(f));
    setContent((prev) => ({ ...prev, file_path: [...prev.file_path, ...tempPaths] }));
  };

  const removeFile = (index: number) => {
    setContent((prev) => ({ ...prev, file_path: prev.file_path.filter((_, i) => i !== index) }));
    if (index >= initialExistingFileCount) {
      const newIndex = index - initialExistingFileCount;
      setUploadedFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  // ---------- submit (preserves timingArray) ----------
  const handleUpdateContent = async () => {
    try {
      setIsSubmitting(true);

      if (!content.title.trim()) {
        const t = toast({
          variant: "destructive",
          title: "Oops! Missing Title",
          description: "Please provide a title before continuing.",
          duration: 8000,
          action: (
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-red-100" onClick={() => t.dismiss()}>
              Dismiss
            </Button>
          ),
        });
        return;
      }

      if (!content.description.trim()) {
        const t = toast({
          variant: "destructive",
          title: "Oops! Missing Short Description",
          description: "Please provide a short description before continuing.",
          duration: 8000,
          action: (
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-red-100" onClick={() => t.dismiss()}>
              Dismiss
            </Button>
          ),
        });
        return;
      }

      const lessonErrors: number[] = [];
      content.lesson.forEach((l, i) => { if (!l.text.trim()) lessonErrors.push(i + 1); });
      if (lessonErrors.length) {
        const t = toast({
          variant: "destructive",
          title: "Oops! Missing Lesson Titles",
          description: `Provide titles for lessons: ${lessonErrors.join(", ")}`,
          duration: 8000,
          action: (
            <Button variant="secondary" className="bg-white text-red-600 hover:bg-red-100" onClick={() => t.dismiss()}>
              Dismiss
            </Button>
          ),
        });
        return;
      }

      const mergedPaths = await mergeNewUploads(
        content.file_path.slice(0, initialExistingFileCount),
        uploadedFiles,
        "topics"
      );

      const payload: ContentFormData = { ...content, file_path: mergedPaths };
      await updateContentApi((content as any)._id || contentId!, payload);

      toast({ title: "✅ Content Updated Successfully", description: "Your content has been updated and is ready to use.", duration: 6000 });

      setInitialExistingFileCount(mergedPaths.length);
      setUploadedFiles([]);
      setContent((prev) => ({ ...prev, file_path: mergedPaths }));
    } catch (err) {
      console.error("Failed to update content:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to update content. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- admin guard ----------
  const storedAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminData") as any);
    } catch {
      return null;
    }
  })();
  const adminId = storedAdmin?._id || localStorage.getItem("adminId") || null;

  useEffect(() => {
    if (!adminId) {
      console.warn("No adminId found in localStorage. Redirecting to login...");
      navigate("/login");
    }
  }, [adminId, navigate]);

  // ---------- comments & reactions ----------
  const refreshLessonComments = async (lessonIndex: number) => {
    if (!contentId) return;
    try {
      const res = await getLessonComments(contentId, lessonIndex);
      setContent((prev) => {
        const next = structuredClone(prev) as ContentFormData;
        (next.lesson[lessonIndex] as any).comments = res?.data || [];
        return next;
      });
    } catch { /* noop */ }
  };

  const handleAddComment = async (lessonIndex: number) => {
    if (!contentId) return;
    const text = (newCommentByLesson[lessonIndex] || "").trim();
    if (!text) return;
    try {
      await addLessonComment(contentId, lessonIndex, {
        userId: adminId,
        userType: "Admin",
        text,
      });
      setNewCommentByLesson((p) => ({ ...p, [lessonIndex]: "" }));
      await refreshLessonComments(lessonIndex);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to add comment." });
    }
  };

  const handleReply = async (lessonIndex: number, commentIndex: number) => {
    if (!contentId) return;
    const key = `${lessonIndex}_${commentIndex}`;
    const text = (newReplyByLessonAndIndex[key] || "").trim();
    if (!text) return;
    try {
      await replyToComment(contentId, lessonIndex, commentIndex, {
        userId: adminId,
        userType: "Admin",
        text,
      });
      setNewReplyByLessonAndIndex((p) => ({ ...p, [key]: "" }));
      await refreshLessonComments(lessonIndex);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to reply." });
    }
  };

  const handleDeleteComment = async (lessonIndex: number, commentIndex: number) => {
    if (!contentId) return;
    try {
      await deleteLessonComment(contentId, lessonIndex, commentIndex);
      await refreshLessonComments(lessonIndex);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete comment." });
    }
  };

  const refreshLessonReactions = async (lessonIndex: number) => {
    if (!contentId) return;
    try {
      const res = await getLessonReactions(contentId, lessonIndex);
      setContent((prev) => {
        const next = structuredClone(prev) as ContentFormData;
        (next.lesson[lessonIndex] as any).reactions = res?.data || [];
        return next;
      });
    } catch { /* noop */ }
  };

  const handleReact = async (lessonIndex: number, emoji: string) => {
    if (!contentId) return;
    try {
      await addLessonReaction(contentId, lessonIndex, {
        userId: adminId,
        userType: "Admin",
        emoji,
      });
      await refreshLessonReactions(lessonIndex);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to add reaction." });
    }
  };

  const handleDeleteReaction = async (lessonIndex: number, reactionIndex: number) => {
    if (!contentId) return;
    try {
      await deleteLessonReaction(contentId, lessonIndex, reactionIndex);
      await refreshLessonReactions(lessonIndex);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete reaction." });
    }
  };

  const currentSubHeadingItem =
    currentQuestionData.lessonIndex !== -1 && currentQuestionData.subHeadingIndex !== -1
      ? content.lesson[currentQuestionData.lessonIndex].subHeading[currentQuestionData.subHeadingIndex]
      : null;

  const ensureMcqArray = () => {
    if (!currentSubHeadingItem) return;
    if (!currentSubHeadingItem.mcqQuestions) {
      updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", []);
    }
  };

  const addMcq = () => {
    if (!currentSubHeadingItem) return;
    ensureMcqArray();
    const nextQ: MCQQuestion = { question: "", options: [""], correctAnswer: "", explanation: "" };
    const arr = [...(currentSubHeadingItem.mcqQuestions || []), nextQ];
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  const removeMcq = (mcqIndex: number) => {
    if (!currentSubHeadingItem) return;
    const arr = (currentSubHeadingItem.mcqQuestions || []).filter((_, i) => i !== mcqIndex);
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  const updateMcqField = (mcqIndex: number, key: keyof MCQQuestion, value: any) => {
    if (!currentSubHeadingItem) return;
    const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
    (arr as any)[mcqIndex] = { ...(arr as any)[mcqIndex], [key]: value };
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  const addMcqOption = (mcqIndex: number) => {
    if (!currentSubHeadingItem) return;
    const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
    const opts = [...(arr as any)[mcqIndex].options, ""];
    (arr as any)[mcqIndex] = { ...(arr as any)[mcqIndex], options: opts };
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  const updateMcqOption = (mcqIndex: number, optionIndex: number, value: string) => {
    if (!currentSubHeadingItem) return;
    const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
    const opts = [...(arr as any)[mcqIndex].options];
    const prevVal = opts[optionIndex];
    opts[optionIndex] = value;

    const updated = { ...(arr as any)[mcqIndex], options: opts };
    if (updated.correctAnswer === prevVal && !value) updated.correctAnswer = "";
    (arr as any)[mcqIndex] = updated;
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  const removeMcqOption = (mcqIndex: number, optionIndex: number) => {
    if (!currentSubHeadingItem) return;
    const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
    const target = { ...(arr as any)[mcqIndex] };
    const removed = target.options[optionIndex];
    target.options = target.options.filter((_: any, i: number) => i !== optionIndex);
    if (target.correctAnswer === removed) target.correctAnswer = "";
    (arr as any)[mcqIndex] = target;
    updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
  };

  if (isLoading) return <LoadingShimmer />;

  const openQuestionModal = (lessonIndex: number, subHeadingIndex: number) => {
    setCurrentQuestionData({ lessonIndex, subHeadingIndex });
    setShowQuestionModal(true);
  };
  const saveQuestion = () => setShowQuestionModal(false);

  return (
    <div className="min-h-screen w-full bg-gray-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ChevronLeft size={20} className="mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Content</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Title + Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6">
              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} placeholder="Title" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input value={content.description} onChange={(e) => setContent({ ...content, description: e.target.value })} placeholder="Short description..." />
              </div>
            </div>

            {/* Lesson Tabs (Draggable) */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
              <SortableContext items={content.lesson.map((_, i) => `lesson-${i}`)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.lesson.map((_, index) => (
                    <Sortable key={`lesson-${index}`} id={`lesson-${index}`}>
                      {({ attributes, listeners }) => (
                        <button
                          onClick={() => setActiveLessonIndex(index)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${activeLessonIndex === index ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                        >
                          <GripVertical
                            size={16}
                            className="text-gray-400 cursor-grab active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                            onClick={(e) => e.stopPropagation()}
                          />
                          Lesson {index + 1}
                        </button>
                      )}
                    </Sortable>
                  ))}

                  <button
                    onClick={addLessonItem}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-blue-700"
                  >
                    <Plus size={16} /> Add Lesson
                  </button>
                </div>
              </SortableContext>
            </DndContext>

            {/* Active Lesson */}
            <div className="space-y-6">
              {content.lesson.map((lessonItem: any, lessonIndex: number) =>
                lessonIndex === activeLessonIndex && (
                  <div key={lessonIndex} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {lessonIndex + 1}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Lesson {lessonIndex + 1}</span>
                      </div>
                      {content.lesson.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeLessonItem(lessonIndex)}>
                          <X size={14} />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Lesson Title</label>
                        <Input value={lessonItem.text} onChange={(e) => updateLessonItem(lessonIndex, "text", e.target.value)} placeholder="Enter lesson title" />
                      </div>

                      {/* Sections (DRAGGABLE) */}
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">Sections</label>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onSectionDragEnd(e, lessonIndex)}>
                          <SortableContext items={lessonItem.subHeading.map((_: any, i: number) => `section-${i}`)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                              {lessonItem.subHeading.map((subHeadingItem: SubHeadingItem, subHeadingIndex: number) => {
                                const field = (f: string) => getFieldPath(lessonIndex, subHeadingIndex, f);
                                const lines = getDisplayLines(subHeadingItem.text || "");
                                const audioKey = getAudioKey(lessonIndex, subHeadingIndex);
                                const player = audioRefs.current[audioKey];

                                return (
                                  <Sortable key={`section-${subHeadingIndex}`} id={`section-${subHeadingIndex}`}>
                                    {({ attributes, listeners }) => (
                                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                          <div className="flex items-center gap-2">
                                            <GripVertical
                                              size={16}
                                              className="text-gray-400 cursor-grab active:cursor-grabbing"
                                              {...attributes}
                                              {...listeners}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              onTouchStart={(e) => e.stopPropagation()}
                                              title="Drag to reorder section"
                                            />
                                            <div className="w-6 h-6 bg-blue-400 rounded-full text-white text-xs flex items-center justify-center">
                                              {subHeadingIndex + 1}
                                            </div>
                                            <span className="text-xs font-medium text-gray-700">Section {subHeadingIndex + 1}</span>
                                          </div>

                                          {lessonItem.subHeading.length > 1 && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                              onClick={() => removeSubHeading(lessonIndex, subHeadingIndex)}
                                              title="Remove section"
                                            >
                                              <X size={12} />
                                            </Button>
                                          )}
                                        </div>

                                        {/* Section Content + Comment */}
                                        <div className="space-y-3">
                                          {(["text", "comment"] as const).map((key) => (
                                            <div className="space-y-2" key={key}>
                                              <label className="text-xs font-medium text-gray-600">
                                                {key === "text" ? "Section Content" : "Comment"}
                                              </label>
                                              <div className="border border-gray-200 rounded-lg p-2 bg-white">
                                                {editingStates[field(key)] ? (
                                                  <MathInput
                                                    value={(subHeadingItem as any)[key] as string}
                                                    onChange={(v) => updateSubHeadingItem(lessonIndex, subHeadingIndex, key as any, v)}
                                                    editing={true}
                                                    onSave={() => saveMathValue(field(key))}
                                                    onCancel={() => cancelEditing(field(key))}
                                                  />
                                                ) : (
                                                  <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                      <MathInput
                                                        value={(subHeadingItem as any)[key] as string}
                                                        editing={false}
                                                        placeholder={`Click edit to add ${key}`}
                                                      />
                                                    </div>
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-6 w-6 text-gray-400 hover:text-blue-500"
                                                      onClick={() => toggleEditing(field(key))}
                                                    >
                                                      <Edit size={14} />
                                                    </Button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}

                                          {/* Q&A / MCQs + Upload */}
                                          <div className="flex flex-wrap items-center justify-between w-full gap-3">
                                            <div className="flex gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openQuestionModal(lessonIndex, subHeadingIndex)}
                                                className="bg-blue-600 text-white border-0 hover:bg-blue-700"
                                              >
                                                <Plus size={14} className="mr-1" />
                                                {subHeadingItem.question ? "Edit Q&A / MCQs" : "Add Q&A / MCQs"}
                                              </Button>

                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => syncTimingArray(lessonIndex, subHeadingIndex)}
                                                className="border-blue-600 text-blue-700 hover:bg-blue-50"
                                                title="Re-detect lines and align timing inputs"
                                              >
                                                <Crosshair size={14} className="mr-1" />
                                                Detect lines
                                              </Button>
                                            </div>

                                            <div className="flex flex-col items-end">
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${subHeadingItem.subheadingAudioPath ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
                                                  >
                                                    {selectedFileType === "audio" && <Music size={16} />}
                                                    {selectedFileType === "video" && <Video size={16} />}
                                                    {selectedFileType === "document" && <FileText size={16} />}
                                                    {selectedFileType === "image" && <ImageIcon size={16} />}

                                                    {subHeadingItem.subheadingAudioPath
                                                      ? shortenFilename(extractFilenameFromUrl(subHeadingItem.subheadingAudioPath))
                                                      : `Upload ${selectedFileType}`}
                                                    <ChevronDown size={14} className="ml-1" />
                                                  </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-48">
                                                  <DropdownMenuItem onClick={() => setSelectedFileType("audio")} className="flex items-center gap-2">
                                                    <Music size={14} /> Audio
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setSelectedFileType("video")} className="flex items-center gap-2">
                                                    <Video size={14} /> Video
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setSelectedFileType("document")} className="flex items-center gap-2">
                                                    <FileText size={14} /> Document
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => setSelectedFileType("image")} className="flex items-center gap-2">
                                                    <ImageIcon size={14} /> Image
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>

                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 bg-blue-500 text-white hover:bg-blue-600 w-full"
                                                disabled={uploading}
                                                onClick={async () => {
                                                  const input = document.createElement("input");
                                                  input.type = "file";
                                                  input.accept = getAcceptedFileTypes(selectedFileType);
                                                  input.onchange = async (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0];
                                                    if (!file) return;
                                                    try {
                                                      const url = await uploadSingleToSupabase(file, "topics");
                                                      updateSubHeadingItem(lessonIndex, subHeadingIndex, "subheadingAudioPath", url);
                                                      toast({ title: "Success", description: `${selectedFileType} uploaded`, duration: 4000 });
                                                    } catch (err) {
                                                      console.error(err);
                                                      toast({ variant: "destructive", title: "Error", description: `Failed to upload ${selectedFileType}` });
                                                    }
                                                  };
                                                  input.click();
                                                }}
                                              >
                                                <Upload size={14} className="mr-1" /> Select File
                                              </Button>

                                              {subHeadingItem.subheadingAudioPath && (
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  className="mt-2 bg-gray-500 text-white hover:bg-gray-600 w-full"
                                                  onClick={() => window.open(subHeadingItem.subheadingAudioPath, "_blank")}
                                                >
                                                  <Eye size={14} className="mr-1" /> View File
                                                </Button>
                                              )}
                                            </div>
                                          </div>

                                          {/* Audio Player + Timing Editor */}
                                          <div className="mt-4 border rounded-lg bg-white p-3">
                                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                              <div className="text-sm font-medium text-gray-700">
                                                Detected lines: <span className="font-semibold">{lines.length}</span>
                                              </div>

                                              <div className="flex items-center gap-2">
                                                <audio
                                                  ref={(el) => { audioRefs.current[audioKey] = el; }}
                                                  controls
                                                  src={subHeadingItem.subheadingAudioPath || undefined}
                                                  className="max-w-full"
                                                />
                                                <Button type="button" size="icon" variant="outline" className="h-9 w-9" onClick={() => audioRefs.current[audioKey]?.play()} disabled={!audioRefs.current[audioKey]} title="Play">
                                                  <Play size={16} />
                                                </Button>
                                                <Button type="button" size="icon" variant="outline" className="h-9 w-9" onClick={() => audioRefs.current[audioKey]?.pause()} disabled={!audioRefs.current[audioKey]} title="Pause">
                                                  <Pause size={16} />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Timing rows */}
                                            <div className="mt-3 space-y-2">
                                              {lines.map((ln, li) => {
                                                const seconds = Number.isFinite(subHeadingItem.timingArray?.[li] as number)
                                                  ? (subHeadingItem.timingArray?.[li] as number)
                                                  : 0;

                                                const setTiming = (val: number) => {
                                                  setContent((prev) => {
                                                    const next = structuredClone(prev) as ContentFormData;
                                                    const sh = next.lesson[lessonIndex].subHeading[subHeadingIndex];
                                                    const len = lines.length;
                                                    sh.timingArray = ensureTimingArrayLength(sh.timingArray, len);
                                                    sh.timingArray![li] = (Number.isFinite(val) && val >= 0) ? Number(val) : 0;
                                                    return next;
                                                  });
                                                };

                                                const player = audioRefs.current[audioKey];

                                                return (
                                                  <div key={li} className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 border rounded p-2">
                                                    <div className="md:col-span-6 text-xs md:text-sm text-gray-800">
                                                      <span className="inline-block px-2 py-0.5 text-[10px] md:text-xs rounded bg-blue-50 border border-blue-100 mr-2">Line {li + 1}</span>
                                                      <span className="break-all">{ln}</span>
                                                    </div>

                                                    <div className="md:col-span-3 flex items-center gap-2">
                                                      <label className="text-xs text-gray-500">Start (s)</label>
                                                      <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.1"
                                                        value={seconds}
                                                        onChange={(e) => setTiming(parseFloat(e.target.value))}
                                                      />
                                                    </div>

                                                    <div className="md:col-span-3 flex items-center gap-2 justify-end">
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => player && setTiming(Number(player.currentTime.toFixed(1)))}
                                                        disabled={!player}
                                                        title="Use current audio time"
                                                      >
                                                        <CornerDownLeft size={14} className="mr-1" />
                                                        Set from current
                                                      </Button>
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { if (player) { player.currentTime = seconds || 0; player.play(); } }}
                                                        disabled={!player}
                                                        title="Jump to this timing"
                                                      >
                                                        Jump
                                                      </Button>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                              {lines.length === 0 && (
                                                <div className="text-sm text-gray-500">
                                                  No lines detected. Add content with <code className="px-1 bg-gray-100 rounded">\displaylines&#123;...&#125;</code> or use <code className="px-1 bg-gray-100 rounded">\\\\</code> / newlines to separate lines, then click <em>Detect lines</em>.
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Quick Question preview */}
                                          {(subHeadingItem.question || (subHeadingItem.mcqQuestions && subHeadingItem.mcqQuestions.length > 0)) && (
                                            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                              <div className="flex justify-between items-start gap-3">
                                                <div className="space-y-2 w-full">
                                                  {subHeadingItem.question && (
                                                    <>
                                                      <h4 className="text-xs font-medium text-blue-800">Question:</h4>
                                                      <div className="border border-gray-200 rounded-lg p-2 bg-white">
                                                        <MathInput value={subHeadingItem.question} editing={false} placeholder="No question added" />
                                                      </div>
                                                    </>
                                                  )}
                                                  {subHeadingItem.mcqQuestions && subHeadingItem.mcqQuestions.length > 0 && (
                                                    <div className="text-xs text-blue-900">
                                                      {subHeadingItem.mcqQuestions.length} MCQ{subHeadingItem.mcqQuestions.length > 1 ? "s" : ""} attached
                                                    </div>
                                                  )}
                                                </div>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-gray-400 hover:text-blue-500"
                                                  onClick={() => openQuestionModal(lessonIndex, subHeadingIndex)}
                                                >
                                                  <Edit size={14} />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Sortable>
                                );
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>

                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSubHeading(lessonIndex)}
                            className="bg-blue-600 text-white border-0 hover:bg-blue-700"
                          >
                            <Plus size={14} className="mr-1" /> Add Section
                          </Button>
                        </div>
                      </div>

                      {/* Media upload per-lesson (audio/video/image) */}
                      <div className="flex flex-wrap justify-end gap-2 pt-4">
                        {/* AUDIO */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={audioStatuses[lessonIndex] === "uploading"}
                          className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${audioStatuses[lessonIndex] === "success" ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "audio/*";
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              updateAudioState(lessonIndex, "uploading", file.name);
                              try {
                                const url = await uploadSingleToSupabase(file, "topics");
                                updateLessonItem(lessonIndex, "audio", url);
                                updateAudioState(lessonIndex, "success", shortenFilename(file.name));
                                toast({ title: "Success", description: "Audio uploaded" });
                              } catch (err) {
                                updateAudioState(lessonIndex, "idle", null);
                                toast({ variant: "destructive", title: "Error", description: "Failed to upload audio" });
                              }
                            };
                            input.click();
                          }}
                        >
                          <Music size={16} />
                          {audioStatuses[lessonIndex] === "uploading" ? `Uploading ${uploadedAudioNames[lessonIndex]}...`
                            : audioStatuses[lessonIndex] === "success" ? <span className="max-w-[100px] truncate">{uploadedAudioNames[lessonIndex] || "Uploaded"}</span>
                              : "Upload Audio"}
                        </Button>
                        {lessonItem.audio && (
                          <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600" onClick={() => window.open(lessonItem.audio, "_blank")}>
                            <Eye size={16} className="mr-1" /> View Audio
                          </Button>
                        )}

                        {/* VIDEO */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={videoStatuses[lessonIndex] === "uploading"}
                          className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${videoStatuses[lessonIndex] === "success" ? "bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "video/*";
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              updateVideoState(lessonIndex, "uploading", file.name);
                              try {
                                const url = await uploadSingleToSupabase(file, "topics");
                                updateLessonItem(lessonIndex, "video", url);
                                updateVideoState(lessonIndex, "success", shortenFilename(file.name));
                                toast({ title: "Success", description: "Video uploaded" });
                              } catch (err) {
                                updateVideoState(lessonIndex, "idle", null);
                                toast({ variant: "destructive", title: "Error", description: "Failed to upload video" });
                              }
                            };
                            input.click();
                          }}
                        >
                          <Video size={16} />
                          {videoStatuses[lessonIndex] === "uploading" ? `Uploading ${uploadedVideoNames[lessonIndex]}...`
                            : videoStatuses[lessonIndex] === "success" ? <span className="max-w-[100px] truncate">{uploadedVideoNames[lessonIndex] || "Uploaded"}</span>
                              : "Upload Video"}
                        </Button>
                        {lessonItem.video && (
                          <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600" onClick={() => window.open(lessonItem.video, "_blank")}>
                            <Eye size={16} className="mr-1" /> View Video
                          </Button>
                        )}

                        {/* IMAGE */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={imageStatuses[lessonIndex] === "uploading"}
                          className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${imageStatuses[lessonIndex] === "success" ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = async (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              updateImageState(lessonIndex, "uploading", file.name);
                              try {
                                const url = await uploadSingleToSupabase(file, "topics");
                                updateLessonItem(lessonIndex, "image", url);
                                updateImageState(lessonIndex, "success", shortenFilename(file.name));
                                toast({ title: "Success", description: "Image uploaded" });
                              } catch (err) {
                                updateImageState(lessonIndex, "idle", null);
                                toast({ variant: "destructive", title: "Error", description: "Failed to upload image" });
                              }
                            };
                            input.click();
                          }}
                        >
                          <ImageIcon size={16} />
                          {imageStatuses[lessonIndex] === "uploading" ? `Uploading ${uploadedImageNames[lessonIndex]}...`
                            : imageStatuses[lessonIndex] === "success" ? <span className="max-w-[100px] truncate">{uploadedImageNames[lessonIndex] || "Uploaded"}</span>
                              : "Upload Image"}
                        </Button>
                        {lessonItem.image && (
                          <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600" onClick={() => window.open(lessonItem.image, "_blank")}>
                            <Eye size={16} className="mr-1" /> View Image
                          </Button>
                        )}
                      </div>

                      {/* Comments */}
                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Comments</h3>
                          <Button variant="ghost" size="sm" onClick={() => refreshLessonComments(lessonIndex)}>Refresh</Button>
                        </div>
                        <div className="mt-3 space-y-3">
                          {(lessonItem.comments || []).map((c: any, ci: number) => {
                            const getUserInfo = (user: any) => {
                              if (typeof user === "string") return { name: user, avatar: null };
                              const firstName = user?.firstName || "";
                              const lastName = user?.lastName || "";
                              const fullName = `${firstName} ${lastName}`.trim() || user?.email || "User";
                              const avatar = user?.profile_picture || user?.profilePicture || null;
                              return { name: fullName, avatar };
                            };

                            const commentUserInfo = getUserInfo(c.userId);

                            return (
                              <div key={c._id ?? ci} className="border rounded p-3 bg-white">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0">
                                      {commentUserInfo.avatar ? (
                                        <img
                                          src={commentUserInfo.avatar}
                                          alt={commentUserInfo.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <div className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 ${commentUserInfo.avatar ? 'hidden' : 'flex'}`}>
                                        {commentUserInfo.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium">{commentUserInfo.name}</div>
                                      <span className="text-xs text-gray-500">{c.userType}</span>
                                    </div>
                                  </div>

                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDeleteComment(lessonIndex, ci)}>
                                    <Trash2 size={14} />
                                  </Button>
                                </div>

                                <div className="text-sm mt-2 ml-10">{c.text}</div>

                                {/* Replies */}
                                <div className="mt-3 ml-10 space-y-2">
                                  {(c.replies || []).map((r: any, ri: number) => {
                                    const replyUserInfo = getUserInfo(r.userId);

                                    return (
                                      <div key={r._id ?? ri} className="text-xs p-2 rounded bg-gray-50 border">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="flex-shrink-0">
                                            {replyUserInfo.avatar ? (
                                              <img
                                                src={replyUserInfo.avatar}
                                                alt={replyUserInfo.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                  const fallback = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                                  if (fallback) fallback.style.display = 'flex';
                                                }}
                                              />
                                            ) : null}
                                            <div className={`w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 ${replyUserInfo.avatar ? 'hidden' : 'flex'}`}>
                                              {replyUserInfo.name.charAt(0).toUpperCase()}
                                            </div>
                                          </div>

                                          <span className="font-medium">{replyUserInfo.name}</span>
                                          <span className="text-gray-500">({r.userType})</span>
                                        </div>
                                        <div className="ml-8">{r.text}</div>
                                      </div>
                                    );
                                  })}

                                  <div className="flex gap-2 mt-2">
                                    <Input
                                      value={newReplyByLessonAndIndex[`${lessonIndex}_${ci}`] || ""}
                                      onChange={(e) => setNewReplyByLessonAndIndex((p) => ({ ...p, [`${lessonIndex}_${ci}`]: e.target.value }))}
                                      placeholder="Write a reply..."
                                      className="text-sm"
                                    />
                                    <Button onClick={() => handleReply(lessonIndex, ci)} size="sm">
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Input
                            value={newCommentByLesson[lessonIndex] || ""}
                            onChange={(e) => setNewCommentByLesson((p) => ({ ...p, [lessonIndex]: e.target.value }))}
                            placeholder="Add a comment..."
                          />
                          <Button onClick={() => handleAddComment(lessonIndex)} size="sm">Comment</Button>
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Reactions</h3>
                          <Button variant="ghost" size="sm" onClick={() => refreshLessonReactions(lessonIndex)}>Refresh</Button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {["👍", "🎉", "❤️", "😂", "🔥", "👏"].map((e) => (
                            <Button key={e} variant="outline" size="sm" onClick={() => handleReact(lessonIndex, e)}>{e}</Button>
                          ))}
                        </div>
                        <div className="mt-3 space-y-2">
                          {(lessonItem.reactions || []).map((r: any, ri: number) => (
                            <div key={r._id ?? ri} className="inline-flex items-center gap-2 border rounded px-2 py-1 bg-white">
                              <span>{r.emoji}</span>
                              <span className="text-xs text-gray-500">
                                {(typeof r.userId === "string") ? r.userId : (r.userId?.firstName || "User")}
                              </span>
                              <Button size="xs" variant="ghost" className="text-red-500 h-6" onClick={() => handleDeleteReaction(lessonIndex, ri)}>remove</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* File attachments (topic-level) */}
            <div className="mt-8 bg-white border rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Attachments</h3>
                <div>
                  <input id="filePicker" type="file" multiple hidden onChange={handleFileSelect} />
                  <Button onClick={() => (document.getElementById("filePicker") as HTMLInputElement)?.click()} variant="outline" size="sm">
                    <Upload size={14} className="mr-1" /> Add Files
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {content.file_path.map((url, i) => (
                  <div key={`${url}-${i}`} className="flex items-center justify-between border rounded p-2">
                    <div className="text-sm truncate max-w-[70%]">{shortenFilename(extractFilenameFromUrl(url))}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}><Eye size={14} className="mr-1" /> View</Button>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(i)}><Trash2 size={16} className="text-red-500" /></Button>
                    </div>
                  </div>
                ))}
                {content.file_path.length === 0 && <div className="text-sm text-gray-500">No files yet.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between w-full items-center">
            <Button variant="outline" onClick={() => navigate(-1)} className="h-12 px-6">Cancel</Button>
            <Button onClick={handleUpdateContent} disabled={isSubmitting} className="h-12 px-6 bg-blue-600 text-white hover:bg-blue-700">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  Updating...
                </div>
              ) : ("Update Content")}
            </Button>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && currentSubHeadingItem && (
        <QuestionModal
          showQuestionModal={showQuestionModal}
          setShowQuestionModal={setShowQuestionModal}
          currentSubHeadingItem={currentSubHeadingItem}
          currentQuestionData={currentQuestionData}
          editingStates={editingStates}
          setEditingStates={setEditingStates}
          updateSubHeadingItem={updateSubHeadingItem}
          addMcq={addMcq}
          removeMcq={removeMcq}
          updateMcqField={updateMcqField}
          addMcqOption={addMcqOption}
          updateMcqOption={updateMcqOption}
          removeMcqOption={removeMcqOption}
          saveQuestion={saveQuestion}
        />
      )}
    </div>
  );
};

export default EditContent;
