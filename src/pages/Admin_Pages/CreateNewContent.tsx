import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Upload,
  FileText,
  Music,
  Video,
  ChevronLeft,
  Edit,
  Image as ImageIcon,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  ListChecks,
  Play,
  Pause,
  Volume2,
  Clock,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";
import { supabase } from "@/helper/SupabaseClient";

import {
  ContentFormData,
  LessonItem,
  SubHeadingItem,
  FileType,
  AUTOSAVE_KEY,
  MAX_FILE_SIZE_MB,
  fileTypeExtensions,
  prettyFileSize,
  withinLimit,
  kindIcon,
  inferKind,
  TimingPoint, // kept for MathInput adapter
} from "./createContentComponent/types";
import MathInput from "./createContentComponent/MathInput";
import QuestionModal from "./createContentComponent/QuestionModal";

// ---------- Helpers for line/timing handling ----------
const countContentLines = (text: string): number => {
  if (!text) return 0;
  // Normalize CRLF, then split on:
  // 1) explicit newlines, 2) '//' markers, 3) '\\' markers
  const parts = text
    .replace(/\r\n/g, "\n")
    .split(/\n|\/\/|\\\\/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length;
};

const normalizeTimingArrayToLineCount = (
  timingArray: number[] | undefined,
  lineCount: number
): number[] => {
  const current = timingArray || [];
  if (lineCount === 0) return [];
  if (current.length === lineCount) return current;
  // Preserve existing seconds where possible
  const next: number[] = Array.from({ length: lineCount }, (_, i) => current[i] ?? 0);
  return next;
};

// Adapters for MathInput (expects TimingPoint[])
const toTimingPoints = (arr: number[] | undefined): TimingPoint[] =>
  (arr || []).map((s) => ({ seconds: Number.isFinite(s) ? s : 0 }));

const fromTimingPoints = (points: TimingPoint[] | undefined): number[] =>
  (points || []).map((p) => (Number.isFinite(p.seconds) ? p.seconds : 0));

// Audio Player Component for Section
const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <Button
        type="button"
        size="sm"
        onClick={togglePlayPause}
        className="rounded-full w-10 h-10 p-0"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>

      <div className="flex-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Volume2 size={16} className="text-gray-400" />
    </div>
  );
};

/** ---------------------------
 *  Main Component
 *  --------------------------*/

const CreateNewContent: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newContent, setNewContent] = useState<ContentFormData>(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ContentFormData;
        return { ...parsed, Topic: topicId || parsed.Topic || "" };
      } catch {
        // ignore parse error, fall through
      }
    }
    return {
      title: "",
      description: "",
      lesson: [
        {
          text: "",
          subHeading: [
            {
              text: "",
              question: "",
              subheadingAudioPath: "",
              expectedAnswer: "",
              comment: "",
              hint: "",
              mcqQuestions: [],
              timingArray: [], // <-- updated
            },
          ],
          audio: "",
          video: "",
        },
      ],
      file_path: [],
      file_type: "document",
      Topic: topicId || "",
    };
  });

  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestionData, setCurrentQuestionData] = useState({
    lessonIndex: -1,
    subHeadingIndex: -1,
  });
  const [editingStates, setEditingStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [audioStatuses, setAudioStatuses] = useState<
    ("idle" | "uploading" | "success")[]
  >(newContent.lesson.map(() => "idle"));
  const [videoStatuses, setVideoStatuses] = useState<
    ("idle" | "uploading" | "success")[]
  >(newContent.lesson.map(() => "idle"));
  const [uploadedAudioNames, setUploadedAudioNames] = useState<
    (string | null)[]
  >(newContent.lesson.map(() => null));
  const [uploadedVideoNames, setUploadedVideoNames] = useState<
    (string | null)[]
  >(newContent.lesson.map(() => null));
  const [subUploadStatus, setSubUploadStatus] = useState<
    Record<string, "idle" | "uploading" | "success">
  >({});
  const [subUploadName, setSubUploadName] = useState<Record<string, string | null>>(
    {}
  );
  const [dragOver, setDragOver] = useState(false);

  const markDirty = () => setDirty(true);

  // ---------- Autosave ----------
  useEffect(() => {
    const id = setTimeout(() => {
      if (!dirty) return;
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newContent));
      setLastSaved(Date.now());
      setDirty(false);
    }, 1200);
    return () => clearTimeout(id);
  }, [dirty, newContent]);

  // ---------- Unsaved guard ----------
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ---------- Keep timingArray length in sync with content line count ----------
  // This normalizer runs whenever lessons change; it adjusts each subHeading.timingArray
  // to match the number of lines in subHeading.text (detected by \n, //, or \\).
  useEffect(() => {
    setNewContent((prev) => {
      let changed = false;
      const lessons = prev.lesson.map((l) => {
        let localChanged = false;
        const subHeading = l.subHeading.map((s) => {
          const lineCount = countContentLines(s.text);
          const normalized = normalizeTimingArrayToLineCount(s.timingArray, lineCount);
          if (normalized.length !== (s.timingArray?.length ?? 0)) {
            localChanged = true;
            return { ...s, timingArray: normalized };
          }
          return s;
        });
        if (localChanged) {
          changed = true;
          return { ...l, subHeading };
        }
        return l;
      });
      return changed ? { ...prev, lesson: lessons } : prev;
    });
    // It’s okay to depend on newContent.lesson; the guard prevents infinite loops.
  }, [newContent.lesson]);

  const completion = useMemo(() => {
    let total = 2; // title + description
    let done = 0;
    if (newContent.title.trim()) done++;
    if (newContent.description.trim()) done++;
    newContent.lesson.forEach((l) => {
      total += 1; // lesson title
      if (l.text.trim()) done++;
    });
    const pct = Math.round((done / total) * 100);
    return isNaN(pct) ? 0 : pct;
  }, [newContent]);

  const getFieldPath = (
    lessonIndex: number,
    subHeadingIndex: number | null,
    fieldName: string
  ) =>
    subHeadingIndex == null
      ? `lesson_${lessonIndex}_${fieldName}`
      : `lesson_${lessonIndex}_sub_${subHeadingIndex}_${fieldName}`;

  const toggleEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: !prev[fieldPath] }));

  const saveMathValue = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));

  const cancelEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));

  // Adapter handler coming from MathInput (still supported)
  // MathInput gives TimingPoint[]; we store as number[] in timingArray
  const handleTimingsChange = (
    lessonIndex: number,
    subHeadingIndex: number,
    timings: TimingPoint[]
  ) => {
    const secondsArray = fromTimingPoints(timings);
    updateSubHeadingItem(lessonIndex, subHeadingIndex, "timingArray", secondsArray);
  };

  // Lessons management
  const addLessonItem = () => {
    setNewContent((prev) => {
      const next = {
        ...prev,
        lesson: [
          ...prev.lesson,
          {
            text: "",
            subHeading: [
              {
                text: "",
                question: "",
                subheadingAudioPath: "",
                expectedAnswer: "",
                comment: "",
                hint: "",
                mcqQuestions: [],
                timingArray: [], // <-- updated
              },
            ],
            audio: "",
            video: "",
          },
        ],
      } as ContentFormData;
      return next;
    });
    setAudioStatuses((p) => [...p, "idle"]);
    setVideoStatuses((p) => [...p, "idle"]);
    setUploadedAudioNames((p) => [...p, null]);
    setUploadedVideoNames((p) => [...p, null]);
    setActiveLessonIndex(newContent.lesson.length);
    markDirty();
  };

  const removeLessonItem = (index: number) => {
    if (newContent.lesson.length <= 1) return;
    setNewContent((prev) => ({
      ...prev,
      lesson: prev.lesson.filter((_, i) => i !== index),
    }));
    setAudioStatuses((prev) => prev.filter((_, i) => i !== index));
    setVideoStatuses((prev) => prev.filter((_, i) => i !== index));
    setUploadedAudioNames((prev) => prev.filter((_, i) => i !== index));
    setUploadedVideoNames((prev) => prev.filter((_, i) => i !== index));
    if (index === activeLessonIndex) setActiveLessonIndex(Math.max(0, index - 1));
    markDirty();
  };

  const addSubHeading = (lessonIndex: number) => {
    const updated = [...newContent.lesson];
    updated[lessonIndex] = {
      ...updated[lessonIndex],
      subHeading: [
        ...updated[lessonIndex].subHeading,
        {
          text: "",
          question: "",
          subheadingAudioPath: "",
          expectedAnswer: "",
          comment: "",
          hint: "",
          mcqQuestions: [],
          timingArray: [], // <-- updated
        },
      ],
    };
    setNewContent((p) => ({ ...p, lesson: updated }));
    markDirty();
  };

  const removeSubHeading = (lessonIndex: number, subHeadingIndex: number) => {
    const l = newContent.lesson[lessonIndex];
    if (l.subHeading.length <= 1) return;
    const updated = [...newContent.lesson];
    updated[lessonIndex] = {
      ...l,
      subHeading: l.subHeading.filter((_, i) => i !== subHeadingIndex),
    };
    setNewContent((p) => ({ ...p, lesson: updated }));
    markDirty();
  };

  const updateLessonItem = (
    lessonIndex: number,
    field: keyof LessonItem,
    value: any
  ) => {
    const updated = [...newContent.lesson];
    updated[lessonIndex] = { ...updated[lessonIndex], [field]: value } as LessonItem;
    setNewContent((p) => ({ ...p, lesson: updated }));
    markDirty();
  };

  const updateSubHeadingItem = (
    lessonIndex: number,
    subHeadingIndex: number,
    field: keyof SubHeadingItem,
    value: any
  ) => {
    const updated = [...newContent.lesson];
    const subs = [...updated[lessonIndex].subHeading];
    subs[subHeadingIndex] = { ...subs[subHeadingIndex], [field]: value } as SubHeadingItem;
    updated[lessonIndex] = { ...updated[lessonIndex], subHeading: subs } as LessonItem;
    setNewContent((p) => ({ ...p, lesson: updated }));
    markDirty();
  };

  // File handling
  const onDropFiles = (files: File[]) => {
    const accepted: File[] = [];
    const errors: string[] = [];
    files.forEach((f) => {
      if (!withinLimit(f))
        errors.push(`${f.name} (${prettyFileSize(f.size)}) exceeds ${MAX_FILE_SIZE_MB}MB`);
      else accepted.push(f);
    });
    if (errors.length) {
      toast({
        variant: "destructive",
        title: "Some files were rejected",
        description: errors.join(" • "),
        duration: 5000,
      });
    }
    if (accepted.length) {
      setUploadedFiles((prev) => [...prev, ...accepted]);
      const paths = accepted.map((f) => URL.createObjectURL(f));
      setNewContent((prev) => ({ ...prev, file_path: [...prev.file_path, ...paths] }));
      markDirty();
    }
  };

  const removeOtherFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewContent((prev) => ({
      ...prev,
      file_path: prev.file_path.filter((_, i) => i !== index),
    }));
    markDirty();
  };

  const uploadFilesToSupabase = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("topics").upload(fileName, file);
      if (error) throw error;
      const { data: publicData } = supabase.storage.from("topics").getPublicUrl(fileName);
      if (publicData?.publicUrl) urls.push(publicData.publicUrl);
    }
    return urls;
  };

  const setAudioState = (
    idx: number,
    status: "idle" | "uploading" | "success",
    fileName?: string | null
  ) => {
    setAudioStatuses((p) => {
      const n = [...p];
      n[idx] = status;
      return n;
    });
    if (fileName !== undefined) {
      setUploadedAudioNames((p) => {
        const n = [...p];
        n[idx] = fileName;
        return n;
      });
    }
  };

  const setVideoState = (
    idx: number,
    status: "idle" | "uploading" | "success",
    fileName?: string | null
  ) => {
    setVideoStatuses((p) => {
      const n = [...p];
      n[idx] = status;
      return n;
    });
    if (fileName !== undefined) {
      setUploadedVideoNames((p) => {
        const n = [...p];
        n[idx] = fileName;
        return n;
      });
    }
  };

  const handleSubheadingFileUpload = async (
    lessonIndex: number,
    subIndex: number,
    type: "audio" | "video" | "document" | "image",
    file: File
  ) => {
    const key = `${lessonIndex}-${subIndex}`;
    if (!withinLimit(file)) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `${file.name} is ${prettyFileSize(file.size)} (max ${MAX_FILE_SIZE_MB}MB).`,
      });
      return;
    }
    try {
      setSubUploadStatus((s) => ({ ...s, [key]: "uploading" }));
      setSubUploadName((s) => ({ ...s, [key]: file.name }));
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("topics").upload(fileName, file);
      if (error) throw error;
      const { data: publicData } = supabase.storage.from("topics").getPublicUrl(fileName);
      if (publicData?.publicUrl) {
        updateSubHeadingItem(lessonIndex, subIndex, "subheadingAudioPath", publicData.publicUrl);
        setSubUploadStatus((s) => ({ ...s, [key]: "success" }));
        toast({
          title: "Uploaded",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully.`,
          duration: 3500,
        });
      }
    } catch (e) {
      setSubUploadStatus((s) => ({ ...s, [key]: "idle" }));
      setSubUploadName((s) => ({ ...s, [key]: null }));
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Could not upload ${type}. Please try again.`,
      });
    }
  };

  const openPicker = (accept: string, onPick: (f: File) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onPick(file);
    };
    input.click();
  };

  // Create content (submit)
  const handleCreateContent = async () => {
    const missingLessons: number[] = [];
    newContent.lesson.forEach((l, i) => {
      if (!l.text.trim()) missingLessons.push(i + 1);
    });

    if (!newContent.title.trim()) {
      toast({
        variant: "destructive",
        title: "Add a title",
        description: "A clear title helps everyone find this content.",
      });
      return;
    }
    if (!newContent.description.trim()) {
      toast({
        variant: "destructive",
        title: "Add a short description",
        description: "Summarize what this content covers.",
      });
      return;
    }
    if (!newContent.Topic?.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Topic",
        description: "Topic ID is required.",
      });
      return;
    }
    if (missingLessons.length) {
      toast({
        variant: "destructive",
        title: "Lesson title required",
        description: `Please add a title for lesson${missingLessons.length > 1 ? "s" : ""} ${missingLessons.join(", ")}.`,
      });
      return;
    }
    const sectionErrors: { lesson: number; section: number }[] = [];
    newContent.lesson.forEach((l, li) =>
      l.subHeading.forEach((s, si) => {
        if (!s.text.trim()) sectionErrors.push({ lesson: li + 1, section: si + 1 });
      })
    );
    if (sectionErrors.length) {
      const msg = sectionErrors.map((e) => `L${e.lesson}-S${e.section}`).join(", ");
      toast({
        variant: "destructive",
        title: "Section content missing",
        description: `Please fill content for: ${msg}.`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalFilePaths = newContent.file_path;
      if (uploadedFiles.length > 0) {
        const urls = await uploadFilesToSupabase(uploadedFiles);
        finalFilePaths = urls;
      }

      const payload: ContentFormData = {
        ...newContent,
        file_path: finalFilePaths,
        file_type: newContent.file_type,
        // NOTE: subHeading items already contain `timingArray: number[]`
      };

      await TopicContentService.createTopicContent(payload);
      localStorage.removeItem(AUTOSAVE_KEY);
      setDirty(false);
      toast({ title: "Success", description: "Content created successfully." });
      navigate(-1);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to create content",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openQuestionModal = (lessonIndex: number, subHeadingIndex: number) => {
    setCurrentQuestionData({ lessonIndex, subHeadingIndex });
    setShowQuestionModal(true);
  };

  useEffect(() => {
    setNewContent((p) => ({ ...p, Topic: topicId || "" }));
  }, [topicId]);

  const currentSubHeadingItem =
    currentQuestionData.lessonIndex !== -1 &&
      currentQuestionData.subHeadingIndex !== -1
      ? newContent.lesson[currentQuestionData.lessonIndex].subHeading[
      currentQuestionData.subHeadingIndex
      ]
      : null;

  // Update a single line's seconds for a given section (writes to timingArray)
  const handleLineSecondsChange = (
    lessonIndex: number,
    subIndex: number,
    lineIndex: number,
    seconds: number
  ) => {
    const sub = newContent.lesson[lessonIndex].subHeading[subIndex];
    const lineCount = countContentLines(sub.text);
    const normalized = normalizeTimingArrayToLineCount(sub.timingArray, lineCount);
    const updated = [...normalized];
    updated[lineIndex] = isNaN(seconds) ? 0 : Math.max(0, seconds);
    updateSubHeadingItem(lessonIndex, subIndex, "timingArray", updated);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-700 hover:bg-gray-100"
              >
                <ChevronLeft size={18} className="mr-1" />
                Back
              </Button>
              <div className="h-4 w-px bg-gray-200" />
              <div className="text-sm text-gray-600 hidden md:block">
                {lastSaved ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle size={14} className="text-amber-600" />
                    Draft not yet saved
                  </span>
                )}
                {dirty && (
                  <span className="ml-2 text-amber-600">(unsaved changes)</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-44 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">
                  {completion}%
                </span>
              </div>
              <Button
                onClick={() => {
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newContent));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({
                    title: "Draft saved",
                    description: "You can safely come back later.",
                  });
                }}
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Save size={16} className="mr-1" />
                Save draft
              </Button>
              <Button
                onClick={handleCreateContent}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Creating…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Plus size={16} />
                    Create
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Title & Description & Type */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                aria-label="Content Title"
                value={newContent.title}
                onChange={(e) => {
                  setNewContent((p) => ({ ...p, title: e.target.value }));
                  markDirty();
                }}
                placeholder="Give your content a clear title"
                className="h-11 text-sm"
              />
              <div className="md:col-span-2">
                <Textarea
                  aria-label="Short Description"
                  value={newContent.description}
                  onChange={(e) => {
                    setNewContent((p) => ({ ...p, description: e.target.value }));
                    markDirty();
                  }}
                  rows={3}
                  placeholder="Short description (what learners will achieve, prerequisites, etc.)"
                  className="text-sm resize-y min-h-[44px]"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs text-gray-600">Content type:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="capitalize">
                      {newContent.file_type}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(["document", "audio", "video"] as FileType[]).map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => {
                          setNewContent((p) => ({ ...p, file_type: t }));
                          markDirty();
                        }}
                        className="capitalize"
                      >
                        {t}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Lesson Tabs */}
          <div className="flex flex-wrap gap-2">
            {newContent.lesson.map((l, i) => (
              <button
                key={i}
                onClick={() => setActiveLessonIndex(i)}
                className={`px-3 py-2 rounded-full text-sm border transition ${activeLessonIndex === i
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                aria-current={activeLessonIndex === i ? "page" : undefined}
              >
                Lesson {i + 1}
                {l.text.trim() ? (
                  <span className="ml-2 text-xs opacity-80">✓</span>
                ) : null}
              </button>
            ))}
            <Button
              onClick={addLessonItem}
              variant="secondary"
              className="inline-flex items-center gap-1"
            >
              <Plus size={14} />
              Add lesson
            </Button>
          </div>

          {/* Active Lesson */}
          {newContent.lesson.map(
            (lessonItem, lessonIndex) =>
              lessonIndex === activeLessonIndex && (
                <div
                  key={lessonIndex}
                  className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition shadow-sm p-4 space-y-5"
                >
                  {/* Lesson Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm">
                        {lessonIndex + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">Lesson title</div>
                        <Input
                          value={lessonItem.text}
                          onChange={(e) =>
                            updateLessonItem(lessonIndex, "text", e.target.value)
                          }
                          placeholder="e.g., Quadratic Equations: Concepts & Practice"
                          className="h-10 text-sm mt-1"
                        />
                      </div>
                    </div>
                    {newContent.lesson.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => removeLessonItem(lessonIndex)}
                        aria-label={`Remove lesson ${lessonIndex + 1}`}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>

                  {/* Audio / Video Upload */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={audioStatuses[lessonIndex] === "uploading"}
                      className={`inline-flex items-center gap-2 ${audioStatuses[lessonIndex] === "success"
                          ? "border-emerald-600 text-emerald-700"
                          : ""
                        }`}
                      onClick={() =>
                        openPicker("audio/*", async (file) => {
                          setAudioState(lessonIndex, "uploading", file.name);
                          try {
                            const fileName = `${Date.now()}_${file.name}`;
                            const { error } = await supabase.storage
                              .from("topics")
                              .upload(fileName, file);
                            if (error) throw error;
                            const { data: publicData } = supabase.storage
                              .from("topics")
                              .getPublicUrl(fileName);
                            if (publicData?.publicUrl) {
                              updateLessonItem(lessonIndex, "audio", publicData.publicUrl);
                              setAudioState(lessonIndex, "success");
                              toast({ title: "Audio uploaded", duration: 3000 });
                              markDirty();
                            }
                          } catch {
                            setAudioState(lessonIndex, "idle", null);
                            toast({
                              variant: "destructive",
                              title: "Audio upload failed",
                            });
                          }
                        })
                      }
                    >
                      <Music size={16} />
                      {audioStatuses[lessonIndex] === "uploading"
                        ? `Uploading ${uploadedAudioNames[lessonIndex]}…`
                        : audioStatuses[lessonIndex] === "success"
                          ? uploadedAudioNames[lessonIndex] || "Uploaded"
                          : "Upload audio"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={videoStatuses[lessonIndex] === "uploading"}
                      className={`inline-flex items-center gap-2 ${videoStatuses[lessonIndex] === "success"
                          ? "border-indigo-600 text-indigo-700"
                          : ""
                        }`}
                      onClick={() =>
                        openPicker("video/*", async (file) => {
                          setVideoState(lessonIndex, "uploading", file.name);
                          try {
                            const fileName = `${Date.now()}_${file.name}`;
                            const { error } = await supabase.storage
                              .from("topics")
                              .upload(fileName, file);
                            if (error) throw error;
                            const { data: publicData } = supabase.storage
                              .from("topics")
                              .getPublicUrl(fileName);
                            if (publicData?.publicUrl) {
                              updateLessonItem(lessonIndex, "video", publicData.publicUrl);
                              setVideoState(lessonIndex, "success");
                              toast({ title: "Video uploaded", duration: 3000 });
                              markDirty();
                            }
                          } catch {
                            setVideoState(lessonIndex, "idle", null);
                            toast({
                              variant: "destructive",
                              title: "Video upload failed",
                            });
                          }
                        })
                      }
                    >
                      <Video size={16} />
                      {videoStatuses[lessonIndex] === "uploading"
                        ? `Uploading ${uploadedVideoNames[lessonIndex]}…`
                        : videoStatuses[lessonIndex] === "success"
                          ? uploadedVideoNames[lessonIndex] || "Uploaded"
                          : "Upload video"}
                    </Button>

                    <div className="flex items-center gap-3 text-sm">
                      {lessonItem.audio && (
                        <a
                          href={lessonItem.audio}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                        >
                          <LinkIcon size={14} />
                          Audio
                        </a>
                      )}
                      {lessonItem.video && (
                        <a
                          href={lessonItem.video}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-700 hover:underline"
                        >
                          <LinkIcon size={14} />
                          Video
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-gray-600">Sections</div>
                    {lessonItem.subHeading.map((sub, subIndex) => {
                      const fieldText = getFieldPath(lessonIndex, subIndex, "text");
                      const fieldComment = getFieldPath(
                        lessonIndex,
                        subIndex,
                        "comment"
                      );
                      const key = `${lessonIndex}-${subIndex}`;
                      const uploadState = subUploadStatus[key] || "idle";
                      const uploadName = subUploadName[key] || "";
                      const lineCount = countContentLines(sub.text);
                      const normalizedTimingArray = normalizeTimingArrayToLineCount(
                        sub.timingArray,
                        lineCount
                      );
                      const timingPointsForMathInput = toTimingPoints(normalizedTimingArray);

                      return (
                        <div
                          key={subIndex}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs flex items-center justify-center">
                                {subIndex + 1}
                              </div>
                              <div className="text-sm font-medium text-gray-700">
                                Section {subIndex + 1}
                              </div>
                            </div>
                            {lessonItem.subHeading.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-600"
                                onClick={() => removeSubHeading(lessonIndex, subIndex)}
                                aria-label={`Remove Section ${subIndex + 1}`}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3">
                            {/* Content with Timing Support */}
                            <div className="space-y-1 w-full">
                              <label className="text-xs text-gray-600">
                                Section content (use line breaks, <code>//</code> or{" "}
                                <code>\\</code> for new lines)
                              </label>
                              <div className="border border-gray-200 rounded-lg p-2 bg-white w-full">
                                {editingStates[fieldText] ? (
                                  <MathInput
                                    value={sub.text}
                                    onChange={(v) =>
                                      updateSubHeadingItem(
                                        lessonIndex,
                                        subIndex,
                                        "text",
                                        v
                                      )
                                    }
                                    editing={true}
                                    onSave={() => saveMathValue(fieldText)}
                                    onCancel={() => cancelEditing(fieldText)}
                                    enableTiming={true}
                                    // Provide TimingPoint[] to MathInput
                                    timings={timingPointsForMathInput}
                                    onTimingsChange={(t) =>
                                      handleTimingsChange(lessonIndex, subIndex, t)
                                    }
                                  />
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <MathInput
                                        value={sub.text}
                                        editing={false}
                                        placeholder="Click edit to add content"
                                      />
                                      {/* Show timing summary when not editing */}
                                      {normalizedTimingArray.length > 0 && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                          <div className="text-xs font-medium text-blue-800 mb-1">
                                            Timing set for lines:
                                          </div>
                                          <div className="text-xs text-blue-600 space-y-1">
                                            {normalizedTimingArray.map((secs, idx) => (
                                              <div
                                                key={idx}
                                                className="flex justify-between"
                                              >
                                                <span>Line {idx + 1}:</span>
                                                <span>{secs}s</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-400 hover:text-blue-600"
                                      onClick={() => toggleEditing(fieldText)}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Per-line timing inputs (always matches number of lines) */}
                              {lineCount > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                    <Clock size={14} />
                                    <span>Per-line timing (seconds)</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {Array.from({ length: lineCount }).map((_, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 border rounded-md bg-white px-2 py-2"
                                      >
                                        <span className="text-xs text-gray-500 w-14">
                                          Line {i + 1}
                                        </span>
                                        <Input
                                          type="number"
                                          min={0}
                                          step="1"
                                          value={
                                            Number.isFinite(normalizedTimingArray[i])
                                              ? String(normalizedTimingArray[i])
                                              : ""
                                          }
                                          onChange={(e) =>
                                            handleLineSecondsChange(
                                              lessonIndex,
                                              subIndex,
                                              i,
                                              parseFloat(e.target.value)
                                            )
                                          }
                                          className="h-8 text-sm"
                                          placeholder="0"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Comment */}
                            <div className="space-y-1 w-full">
                              <label className="text-xs text-gray-600">Comment</label>
                              <div className="border border-gray-200 rounded-lg p-2 bg-white w-full">
                                {editingStates[fieldComment] ? (
                                  <MathInput
                                    value={sub.comment}
                                    onChange={(v) =>
                                      updateSubHeadingItem(
                                        lessonIndex,
                                        subIndex,
                                        "comment",
                                        v
                                      )
                                    }
                                    editing={true}
                                    onSave={() => saveMathValue(fieldComment)}
                                    onCancel={() => cancelEditing(fieldComment)}
                                  />
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <MathInput
                                        value={sub.comment}
                                        editing={false}
                                        placeholder="Click edit to add comment"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-400 hover:text-blue-600"
                                      onClick={() => toggleEditing(fieldComment)}
                                    >
                                      <Edit size={14} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Audio Player for Section */}
                          {sub.subheadingAudioPath && (
                            <div className="mt-3">
                              <div className="text-xs font-medium text-gray-600 mb-2">
                                Audio File
                              </div>
                              <AudioPlayer src={sub.subheadingAudioPath} />
                            </div>
                          )}

                          {/* Actions: Question + Uploads */}
                          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openQuestionModal(lessonIndex, subIndex)}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                              >
                                <Plus size={14} className="mr-1" />
                                Add / edit question(s)
                              </Button>
                              {sub.mcqQuestions?.length ? (
                                <span className="inline-flex items-center text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-1">
                                  <ListChecks size={12} className="mr-1" />
                                  {sub.mcqQuestions.length} MCQ
                                  {sub.mcqQuestions.length > 1 ? "s" : ""}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPicker(fileTypeExtensions.audio.join(","), (f) =>
                                    handleSubheadingFileUpload(
                                      lessonIndex,
                                      subIndex,
                                      "audio",
                                      f
                                    )
                                  )
                                }
                                className="inline-flex items-center gap-2"
                                disabled={uploadState === "uploading"}
                              >
                                <Music size={14} /> Audio
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPicker(fileTypeExtensions.video.join(","), (f) =>
                                    handleSubheadingFileUpload(
                                      lessonIndex,
                                      subIndex,
                                      "video",
                                      f
                                    )
                                  )
                                }
                                className="inline-flex items-center gap-2"
                                disabled={uploadState === "uploading"}
                              >
                                <Video size={14} /> Video
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPicker(
                                    fileTypeExtensions.document.join(","),
                                    (f) =>
                                      handleSubheadingFileUpload(
                                        lessonIndex,
                                        subIndex,
                                        "document",
                                        f
                                      )
                                  )
                                }
                                className="inline-flex items-center gap-2"
                                disabled={uploadState === "uploading"}
                              >
                                <FileText size={14} /> Document
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPicker(fileTypeExtensions.image.join(","), (f) =>
                                    handleSubheadingFileUpload(
                                      lessonIndex,
                                      subIndex,
                                      "image",
                                      f
                                    )
                                  )
                                }
                                className="inline-flex items-center gap-2"
                                disabled={uploadState === "uploading"}
                              >
                                <ImageIcon size={14} /> Image
                              </Button>

                              <div className="text-xs text-gray-600 inline-flex items-center gap-2">
                                {uploadState === "uploading" && (
                                  <span className="inline-flex items-center gap-1">
                                    <Loader2 size={14} className="animate-spin" /> Uploading{" "}
                                    {uploadName}
                                  </span>
                                )}
                                {sub.subheadingAudioPath && uploadState !== "uploading" && (
                                  <a
                                    href={sub.subheadingAudioPath}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                  >
                                    <LinkIcon size={14} />
                                    View file
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Question Preview (open-ended) */}
                          {(sub.question || sub.expectedAnswer || sub.hint) && (
                            <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-lg p-3">
                              <div className="text-xs font-semibold text-blue-900 mb-1">
                                Open-ended
                              </div>
                              <div className="grid gap-2">
                                {sub.question && (
                                  <div className="border rounded p-2 bg-white">
                                    <div className="text-xs text-gray-600 mb-1">
                                      Question
                                    </div>
                                    <MathInput value={sub.question} editing={false} placeholder="" />
                                  </div>
                                )}
                                {sub.expectedAnswer && (
                                  <div className="border rounded p-2 bg-white">
                                    <div className="text-xs text-gray-600 mb-1">
                                      Expected Answer
                                    </div>
                                    <MathInput
                                      value={sub.expectedAnswer}
                                      editing={false}
                                      placeholder=""
                                    />
                                  </div>
                                )}
                                {sub.hint && (
                                  <div className="border rounded p-2 bg-white">
                                    <div className="text-xs text-gray-600 mb-1">Hint</div>
                                    <MathInput value={sub.hint} editing={false} placeholder="" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubHeading(lessonIndex)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                    >
                      <Plus size={14} className="mr-1" />
                      Add section
                    </Button>
                  </div>
                </div>
              )
          )}

          {/* Other Files (drag & drop area) */}
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-4">
            <div
              className={`rounded-lg border-2 border-dashed p-6 text-center transition ${dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-300 bg-gray-50"
                }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const files = Array.from(e.dataTransfer.files || []);
                if (files.length) onDropFiles(files);
              }}
              onClick={() =>
                openPicker(
                  [
                    ...fileTypeExtensions.audio,
                    ...fileTypeExtensions.video,
                    ...fileTypeExtensions.image,
                    ...fileTypeExtensions.document,
                  ].join(","),
                  (file) => onDropFiles([file])
                )
              }
              role="button"
              tabIndex={0}
            >
              <Upload className="mx-auto mb-2" />
              <div className="text-sm font-medium">Drag & drop additional files</div>
              <div className="text-xs text-gray-500">…or click to select</div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadedFiles.map((f, i) => {
                  const kind = inferKind(f);
                  return (
                    <div
                      key={`${f.name}-${i}`}
                      className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{kindIcon(kind, 18)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate" title={f.name}>
                            {f.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {prettyFileSize(f.size)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => removeOtherFile(i)}
                        aria-label={`Remove ${f.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions for small screens */}
          <div className="sm:hidden sticky bottom-3 z-20">
            <div className="mx-auto max-w-sm bg-white shadow-lg rounded-full p-2 flex items-center justify-between border">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newContent));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({ title: "Draft saved" });
                }}
                className="rounded-full"
              >
                <Save size={16} className="mr-1" />
                Save
              </Button>
              <div className="text-xs text-gray-500">{completion}%</div>
              <Button onClick={handleCreateContent} disabled={isSubmitting} className="rounded-full">
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} className="mr-1" />
                )}
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Question Modal */}
        <QuestionModal
          showQuestionModal={showQuestionModal}
          setShowQuestionModal={setShowQuestionModal}
          currentSubHeadingItem={currentSubHeadingItem}
          currentQuestionData={currentQuestionData}
          updateSubHeadingItem={updateSubHeadingItem}
          editingStates={editingStates}
          toggleEditing={toggleEditing}
          saveMathValue={saveMathValue}
          cancelEditing={cancelEditing}
        />
      </div>
    </div>
  );
};

export default CreateNewContent;
