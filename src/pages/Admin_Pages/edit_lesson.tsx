// src/pages/Admin/Topic/EditLesson.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Edit, GripVertical, Music, Video, FileText, Image as ImageIcon,
  Eye, Upload, Plus, X, Play, Pause, CornerDownLeft, Crosshair, ChevronDown, Loader2
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { MathInput, getDisplayLines } from "./editContentComponents/MathInput";
import { QuestionModal } from "./editContentComponents/QuestionModal";
import { LoadingShimmer } from "./editContentComponents/LoadingShimmer";

import {
  LessonItem, SubHeadingItem,
  getAcceptedFileTypes, extractFilenameFromUrl, shortenFilename, uploadSingleToSupabase,
} from "./functions_edit";

import TopicContentService from "@/services/Admin_Service/Topic_Content_service";

// ✅ NEW: dnd-kit + your Sortable wrapper
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Sortable } from "./editContentComponents/Sortable";

type UploadKind = "audio" | "video" | "document" | "image";

// --- helpers: keep timing array in sync with display lines ---
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
  if (existing.length > linesCount) return existing.slice(0, linesCount);
  return existing;
};

// We keep a local _id just for drag-and-drop. It never goes to the server.
type SubHeadingWithId = SubHeadingItem & { _id: string };

const withIds = (subs: SubHeadingItem[]): SubHeadingWithId[] =>
  (subs || []).map((sh, i) => ({ ...sh, _id: crypto.randomUUID?.() ?? `${Date.now()}_${i}` }));

const stripIds = (subs: SubHeadingWithId[]): SubHeadingItem[] =>
  subs.map(({ _id, ...rest }) => rest);

const EditLesson: React.FC = () => {
  const { contentId, lessonId } = useParams<{ contentId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // we only edit ONE lesson here
  const [lesson, setLesson] = useState<LessonItem & { subHeading: SubHeadingWithId[] }>({
    text: "",
    subHeading: [{
      _id: crypto.randomUUID?.() ?? "init_0",
      text: "", question: "", subheadingAudioPath: "", expectedAnswer: "",
      comment: "", hint: "", mcqQuestions: [], timingArray: [],
    }],
    audio: "", video: "", image: "",
  });

  // ui state
  const [selectedFileType, setSelectedFileType] = useState<UploadKind>("audio");
  const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const getAudioKey = (s: number) => `0_${s}`; // single-lesson page

  // question modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState({ lessonIndex: 0, subHeadingIndex: -1 });
  const currentSubHeadingItem =
    currentQuestionData.subHeadingIndex !== -1 ? lesson.subHeading[currentQuestionData.subHeadingIndex] : null;

  // ✅ DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- fetch one lesson ---
  useEffect(() => {
    (async () => {
      try {
        if (!contentId || !lessonId) return;
        setLoading(true);

        const response = await TopicContentService.getLessonByTopicContentIdAndLessonId(
          contentId,
          lessonId
        );

        const data: LessonItem = response.data;
        const normalized: LessonItem & { subHeading: SubHeadingWithId[] } = {
          ...data,
          subHeading: withIds((data.subHeading || []).map((sh) => {
            const lines = getDisplayLines(sh.text || "");
            return { ...sh, timingArray: ensureTimingArrayLength(sh.timingArray, lines.length) };
          })),
        };

        setLesson(normalized);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        toast({
          variant: "destructive",
          title: "Couldn't load this lesson",
          description: "Please try again.",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [contentId, lessonId, navigate, toast]);

  // --- inline editing toggles ---
  const getFieldPath = (subIndex: number | null, field: string) =>
    subIndex === null ? `lesson_${field}` : `lesson_sub_${subIndex}_${field}`;
  const toggleEditing = (p: string) => setEditingStates((s) => ({ ...s, [p]: !s[p] }));
  const stopEditing = (p: string) => setEditingStates((s) => ({ ...s, [p]: false }));

  // --- lesson/subheading updates ---
  const updateLessonField = (key: keyof LessonItem, value: string) =>
    setLesson((prev) => ({ ...prev, [key]: value }));

  const updateSubHeadingItem = <K extends keyof SubHeadingItem>(
    subIndex: number,
    field: K,
    value: SubHeadingItem[K]
  ) => {
    setLesson((prev) => {
      const next = structuredClone(prev) as LessonItem & { subHeading: SubHeadingWithId[] };
      const sh = next.subHeading[subIndex];
      (sh as any)[field] = value;
      if (field === "text") {
        const count = getDisplayLines(String(value) || "").length;
        sh.timingArray = ensureTimingArrayLength(sh.timingArray, count);
      }
      return next;
    });
  };

  const addSubHeading = () =>
    setLesson((prev) => ({
      ...prev,
      subHeading: [
        ...prev.subHeading,
        {
          _id: crypto.randomUUID?.() ?? `${Date.now()}_${prev.subHeading.length}`,
          text: "",
          question: "",
          subheadingAudioPath: "",
          expectedAnswer: "",
          comment: "",
          hint: "",
          mcqQuestions: [],
          timingArray: [],
        },
      ],
    }));

  const removeSubHeading = (subIndex: number) =>
    setLesson((prev) => {
      if (prev.subHeading.length <= 1) return prev;
      const next = structuredClone(prev) as LessonItem & { subHeading: SubHeadingWithId[] };
      next.subHeading.splice(subIndex, 1);
      return next;
    });

  const syncTimingArray = (subIndex: number) => {
    setLesson((prev) => {
      const next = structuredClone(prev) as LessonItem & { subHeading: SubHeadingWithId[] };
      const sh = next.subHeading[subIndex];
      const count = getDisplayLines(sh.text || "").length;
      sh.timingArray = ensureTimingArrayLength(sh.timingArray, count);
      return next;
    });
  };

  // ✅ DnD: handle drag end to reorder sections
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLesson((prev) => {
      const items = prev.subHeading;
      const oldIndex = items.findIndex((s) => s._id === active.id);
      const newIndex = items.findIndex((s) => s._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = arrayMove(items, oldIndex, newIndex);
      return { ...prev, subHeading: reordered };
    });
  };

  // --- submit one lesson ---
  const handleSaveLesson = async () => {
    if (!contentId || !lessonId) return;
    try {
      setSubmitting(true);

      if (!lesson.text.trim()) {
        toast({
          variant: "destructive",
          title: "Missing lesson title",
          description: "Please provide a lesson title.",
        });
        return;
      }

      // ✅ Strip _id before send; keep server type pristine
      const payload: LessonItem = {
        text: lesson.text,
        audio: lesson.audio,
        video: lesson.video,
        image: lesson.image,
        subHeading: stripIds(lesson.subHeading),
      };

      await TopicContentService.editLessonByTopicContentIdAndLessonId(
        contentId,
        lessonId,
        payload
      );

      toast({ title: "✅ Lesson updated", description: "Your changes have been saved." });
      navigate(-1);
    } catch (err) {
      console.error("Update failed:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to update lesson." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingShimmer />;

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
            <h1 className="text-2xl font-bold text-gray-800">Edit Lesson</h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Lesson title */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Lesson Title</label>
              <Input
                value={lesson.text}
                onChange={(e) => updateLessonField("text", e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Sections</label>
                <Button type="button" size="sm" className="bg-blue-600 text-white" onClick={addSubHeading}>
                  <Plus size={14} className="mr-1" /> Add Section
                </Button>
              </div>

              {/* ✅ DnD Context wraps the list */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext
                  // important: pass the IDs in current visual order
                  items={lesson.subHeading.map((s) => s._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {lesson.subHeading.map((sh, subIndex) => {
                      const field = (f: string) => getFieldPath(subIndex, f);
                      const lines = getDisplayLines(sh.text || "");
                      const audioKey = getAudioKey(subIndex);

                      return (
                        <Sortable key={sh._id} id={sh._id} className="bg-white rounded-lg border p-4">
                          {({ attributes, listeners }: any) => (
                            <>
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
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

                                  <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {subIndex + 1}
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">Section {subIndex + 1}</span>
                                </div>

                                {lesson.subHeading.length > 1 && (
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => removeSubHeading(subIndex)}
                                  >
                                    <X size={12} />
                                  </Button>
                                )}
                              </div>

                              {/* content + comment */}
                              {(["text", "comment"] as const).map((key) => (
                                <div className="space-y-2 mb-3" key={key}>
                                  <label className="text-xs font-medium text-gray-600">
                                    {key === "text" ? "Section Content" : "Comment"}
                                  </label>
                                  <div className="border rounded-lg p-2 bg-white">
                                    {editingStates[field(key)] ? (
                                      <MathInput
                                        value={(sh as any)[key] as string}
                                        onChange={(v) => updateSubHeadingItem(subIndex, key as any, v)}
                                        editing={true}
                                        onSave={() => stopEditing(field(key))}
                                        onCancel={() => stopEditing(field(key))}
                                      />
                                    ) : (
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <MathInput value={(sh as any)[key] as string} editing={false} placeholder={`Click edit to add ${key}`} />
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500"
                                          onClick={() => toggleEditing(field(key))}>
                                          <Edit size={14} />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {/* Q&A / MCQs + per-section upload */}
                              <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setCurrentQuestionData({ lessonIndex: 0, subHeadingIndex: subIndex }); setShowQuestionModal(true); }}
                                    className="bg-blue-600 text-white border-0 hover:bg-blue-700"
                                  >
                                    <Plus size={14} className="mr-1" />
                                    {sh.question ? "Edit Q&A / MCQs" : "Add Q&A / MCQs"}
                                  </Button>

                                  <Button
                                    type="button" variant="outline" size="sm"
                                    onClick={() => syncTimingArray(subIndex)}
                                    className="border-blue-600 text-blue-700 hover:bg-blue-50"
                                    title="Re-detect lines and align timing inputs"
                                  >
                                    <Crosshair size={14} className="mr-1" /> Detect lines
                                  </Button>
                                </div>

                                <div className="flex flex-col items-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        type="button" variant="outline" size="sm"
                                        className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${sh.subheadingAudioPath ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
                                      >
                                        {selectedFileType === "audio" && <Music size={16} />}
                                        {selectedFileType === "video" && <Video size={16} />}
                                        {selectedFileType === "document" && <FileText size={16} />}
                                        {selectedFileType === "image" && <ImageIcon size={16} />}
                                        {sh.subheadingAudioPath ? shortenFilename(extractFilenameFromUrl(sh.subheadingAudioPath)) : `Upload ${selectedFileType}`}
                                        <ChevronDown size={14} className="ml-1" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                      <DropdownMenuItem onClick={() => setSelectedFileType("audio")} className="flex items-center gap-2"><Music size={14} /> Audio</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSelectedFileType("video")} className="flex items-center gap-2"><Video size={14} /> Video</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSelectedFileType("document")} className="flex items-center gap-2"><FileText size={14} /> Document</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setSelectedFileType("image")} className="flex items-center gap-2"><ImageIcon size={14} /> Image</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>

                                  <Button
                                    type="button" variant="outline" size="sm"
                                    className="mt-2 bg-blue-500 text-white hover:bg-blue-600 w-full"
                                    disabled={uploading}
                                    onClick={() => {
                                      const input = document.createElement("input");
                                      input.type = "file";
                                      input.accept = getAcceptedFileTypes(selectedFileType);
                                      input.onchange = async (e) => {
                                        const file = (e.target as HTMLInputElement).files?.[0];
                                        if (!file) return;
                                        try {
                                          setUploading(true);
                                          const url = await uploadSingleToSupabase(file, "topics");
                                          updateSubHeadingItem(subIndex, "subheadingAudioPath", url);
                                          toast({ title: "Success", description: `${selectedFileType} uploaded` });
                                        } catch (error) {
                                          toast({ variant: "destructive", title: "Upload failed", description: `Couldn't upload ${selectedFileType}.` });
                                        } finally {
                                          setUploading(false);
                                        }
                                      };
                                      input.click();
                                    }}
                                  >
                                    {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload size={14} className="mr-1" />}
                                    Select File
                                  </Button>

                                  {sh.subheadingAudioPath && (
                                    <Button
                                      type="button" variant="outline" size="sm"
                                      className="mt-2 bg-gray-500 text-white hover:bg-gray-600 w-full"
                                      onClick={() => window.open(sh.subheadingAudioPath, "_blank")}
                                    >
                                      <Eye size={14} className="mr-1" /> View File
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* audio player + line timings */}
                              <div className="mt-4 border rounded-lg bg-white p-3">
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div className="text-sm font-medium text-gray-700">
                                    Detected lines: <span className="font-semibold">{lines.length}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <audio
                                      ref={(el) => { audioRefs.current[audioKey] = el; }}
                                      controls
                                      src={sh.subheadingAudioPath || undefined}
                                      className="max-w-full"
                                    />
                                    <Button type="button" size="icon" variant="outline" className="h-9 w-9" onClick={() => audioRefs.current[audioKey]?.play()} title="Play">
                                      <Play size={16} />
                                    </Button>
                                    <Button type="button" size="icon" variant="outline" className="h-9 w-9" onClick={() => audioRefs.current[audioKey]?.pause()} title="Pause">
                                      <Pause size={16} />
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 space-y-2">
                                  {lines.map((ln, li) => {
                                    const seconds = Number.isFinite(sh.timingArray?.[li] as number) ? (sh.timingArray?.[li] as number) : 0;
                                    const player = audioRefs.current[audioKey];

                                    const setTiming = (val: number) => {
                                      setLesson((prev) => {
                                        const next = structuredClone(prev) as LessonItem & { subHeading: SubHeadingWithId[] };
                                        const shN = next.subHeading[subIndex];
                                        const len = lines.length;
                                        shN.timingArray = ensureTimingArrayLength(shN.timingArray, len);
                                        shN.timingArray![li] = Number.isFinite(val) && val >= 0 ? Number(val) : 0;
                                        return next;
                                      });
                                    };

                                    return (
                                      <div key={li} className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 border rounded p-2">
                                        <div className="md:col-span-6 text-xs md:text-sm text-gray-800">
                                          <span className="inline-block px-2 py-0.5 text-[10px] md:text-xs rounded bg-blue-50 border border-blue-100 mr-2">Line {li + 1}</span>
                                          <span className="break-all">{ln}</span>
                                        </div>

                                        <div className="md:col-span-3 flex items-center gap-2">
                                          <label className="text-xs text-gray-500">Start (s)</label>
                                          <Input
                                            type="number" min={0} step="0.1"
                                            value={seconds}
                                            onChange={(e) => setTiming(parseFloat(e.target.value))}
                                          />
                                        </div>

                                        <div className="md:col-span-3 flex items-center gap-2 justify-end">
                                          <Button
                                            type="button" size="sm" variant="outline"
                                            onClick={() => player && setTiming(Number(player.currentTime.toFixed(1)))}
                                            title="Use current audio time"
                                          >
                                            <CornerDownLeft size={14} className="mr-1" />
                                            Set from current
                                          </Button>
                                          <Button
                                            type="button" size="sm" variant="outline"
                                            onClick={() => { if (player) { player.currentTime = seconds || 0; player.play(); } }}
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
                                      No lines detected. Add content with <code className="px-1 bg-gray-100 rounded">\displaylines&#123;...&#125;</code> or use
                                      {" "} <code className="px-1 bg-gray-100 rounded">\\</code> / newlines, then click <em>Detect lines</em>.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Q&A preview */}
                              {(sh.question || (sh.mcqQuestions && sh.mcqQuestions.length > 0)) && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mt-3">
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="space-y-2 w-full">
                                      {sh.question && (
                                        <>
                                          <h4 className="text-xs font-medium text-blue-800">Question:</h4>
                                          <div className="border rounded-lg p-2 bg-white">
                                            <MathInput value={sh.question} editing={false} placeholder="No question added" />
                                          </div>
                                        </>
                                      )}
                                      {sh.mcqQuestions && sh.mcqQuestions.length > 0 && (
                                        <div className="text-xs text-blue-900">
                                          {sh.mcqQuestions.length} MCQ{subIndex > 1 ? "s" : ""} attached
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500"
                                      onClick={() => { setCurrentQuestionData({ lessonIndex: 0, subHeadingIndex: subIndex }); setShowQuestionModal(true); }}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </Sortable>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Lesson-level media */}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {/* AUDIO */}
              <Button
                type="button" variant="outline" size="sm"
                className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${lesson.audio ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "audio/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadSingleToSupabase(file, "topics");
                      updateLessonField("audio", url);
                      toast({ title: "Success", description: "Audio uploaded" });
                    } catch {
                      toast({ variant: "destructive", title: "Error", description: "Failed to upload audio" });
                    }
                  };
                  input.click();
                }}
              >
                <Music size={16} />
                {lesson.audio ? shortenFilename(extractFilenameFromUrl(lesson.audio)) : "Upload Audio"}
              </Button>
              {lesson.audio && (
                <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={() => window.open(lesson.audio, "_blank")}>
                  <Eye size={16} className="mr-1" /> View Audio
                </Button>
              )}

              {/* VIDEO */}
              <Button
                type="button" variant="outline" size="sm"
                className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${lesson.video ? "bg-indigo-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "video/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadSingleToSupabase(file, "topics");
                      updateLessonField("video", url);
                      toast({ title: "Success", description: "Video uploaded" });
                    } catch {
                      toast({ variant: "destructive", title: "Error", description: "Failed to upload video" });
                    }
                  };
                  input.click();
                }}
              >
                <Video size={16} />
                {lesson.video ? shortenFilename(extractFilenameFromUrl(lesson.video)) : "Upload Video"}
              </Button>
              {lesson.video && (
                <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={() => window.open(lesson.video, "_blank")}>
                  <Eye size={16} className="mr-1" /> View Video
                </Button>
              )}

              {/* IMAGE */}
              <Button
                type="button" variant="outline" size="sm"
                className={`flex items-center gap-2 px-3 text-white h-9 border-0 ${lesson.image ? "bg-yellow-600" : "bg-yellow-500 hover:bg-yellow-600"}`}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadSingleToSupabase(file, "topics");
                      updateLessonField("image", url);
                      toast({ title: "Success", description: "Image uploaded" });
                    } catch {
                      toast({ variant: "destructive", title: "Error", description: "Failed to upload image" });
                    }
                  };
                  input.click();
                }}
              >
                <ImageIcon size={16} />
                {lesson.image ? shortenFilename(extractFilenameFromUrl(lesson.image)) : "Upload Image"}
              </Button>
              {lesson.image && (
                <Button type="button" variant="outline" size="sm" className="bg-gray-500 text-white hover:bg-gray-600"
                  onClick={() => window.open(lesson.image, "_blank")}>
                  <Eye size={16} className="mr-1" /> View Image
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between w-full items-center">
            <Button variant="outline" onClick={() => navigate(-1)} className="h-12 px-6">Cancel</Button>
            <Button onClick={handleSaveLesson} disabled={submitting} className="h-12 px-6 bg-blue-600 text-white hover:bg-blue-700">
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                  Saving...
                </div>
              ) : ("Save Lesson")}
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
          updateSubHeadingItem={(li, si, k, v) => updateSubHeadingItem(si, k as any, v)}
          addMcq={() => {
            const nextQ = { question: "", options: [""], correctAnswer: "", explanation: "" };
            const arr = [...(currentSubHeadingItem.mcqQuestions || []), nextQ];
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          removeMcq={(mcqIndex) => {
            const arr = (currentSubHeadingItem.mcqQuestions || []).filter((_, i) => i !== mcqIndex);
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          updateMcqField={(mcqIndex, key, value) => {
            const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
            (arr as any)[mcqIndex] = { ...(arr as any)[mcqIndex], [key]: value };
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          addMcqOption={(mcqIndex) => {
            const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
            const opts = [...(arr as any)[mcqIndex].options, ""];
            (arr as any)[mcqIndex] = { ...(arr as any)[mcqIndex], options: opts };
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          updateMcqOption={(mcqIndex, optionIndex, value) => {
            const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
            const opts = [...(arr as any)[mcqIndex].options];
            const prevVal = opts[optionIndex];
            opts[optionIndex] = value;
            const updated = { ...(arr as any)[mcqIndex], options: opts };
            if (updated.correctAnswer === prevVal && !value) updated.correctAnswer = "";
            (arr as any)[mcqIndex] = updated;
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          removeMcqOption={(mcqIndex, optionIndex) => {
            const arr = [...(currentSubHeadingItem.mcqQuestions || [])];
            const target = { ...(arr as any)[mcqIndex] };
            const removed = target.options[optionIndex];
            target.options = target.options.filter((_: any, i: number) => i !== optionIndex);
            if (target.correctAnswer === removed) target.correctAnswer = "";
            (arr as any)[mcqIndex] = target;
            // fixed param order bug: (li, si, k, v) maps to updateSubHeadingItem(si, k, v)
            updateSubHeadingItem(currentQuestionData.subHeadingIndex, "mcqQuestions", arr);
          }}
          saveQuestion={() => setShowQuestionModal(false)}
        />
      )}
    </div>
  );
};

export default EditLesson;
