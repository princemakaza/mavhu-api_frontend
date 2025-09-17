import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Upload,
  File,
  FileText,
  Music,
  Video,
  ChevronLeft,
  Edit,
  Check,
  Image as ImageIcon,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  ListChecks,
  Circle,
  Dot,
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
import { MathfieldElement } from "mathlive";

/** ---------------------------
 *  Types & Constants
 *  --------------------------*/

const fileTypeExtensions = {
  video: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"],
  document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
};

const MAX_FILE_SIZE_MB = 300; // single file limit for uploads
const AUTOSAVE_KEY = "CreateNewContent:autosave:v4"; // bumped to v4 for safer hydration

/** --- Backend-aligned types --- */

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SubHeadingItem {
  text: string;
  subheadingAudioPath: string; // generic file URL for the subheading (audio/video/doc/image)
  question: string;            // open-ended (optional)
  expectedAnswer: string;      // open-ended (optional)
  comment: string;
  hint: string;
  mcqQuestions: MCQQuestion[]; // NEW
}

interface LessonItem {
  text: string;                // required by backend
  subHeading: SubHeadingItem[];
  audio: string;
  video: string;
  // comments & reactions exist server-side but are NOT posted from here
}

type FileType = "video" | "audio" | "document"; // backend enum

interface ContentFormData {
  title: string;
  description: string;
  lesson: LessonItem[];
  file_path: string[];         // “other files” attached to the content
  file_type: FileType;         // backend enum
  Topic: string;               // Topic ObjectId as string
}

/** ---------------------------
 *  Helpers
 *  --------------------------*/

// Extract LaTeX from wrapped value like \( ... \)
const extractLatexFromText = (text: string): string => {
  if (!text) return "";
  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    return text.slice(2, -2);
  }
  return text;
};

const prettyFileSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

const withinLimit = (file: File, limitMB = MAX_FILE_SIZE_MB) =>
  file.size <= limitMB * 1024 * 1024;

// Icon by file “kind”
const kindIcon = (kind: "audio" | "video" | "document" | "image" | "other", size = 16) => {
  switch (kind) {
    case "audio":
      return <Music size={size} />;
    case "video":
      return <Video size={size} />;
    case "document":
      return <FileText size={size} />;
    case "image":
      return <ImageIcon size={size} />;
    default:
      return <File size={size} />;
  }
};

const inferKind = (file: File): "audio" | "video" | "document" | "image" | "other" => {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (fileTypeExtensions.audio.includes(ext)) return "audio";
  if (fileTypeExtensions.video.includes(ext)) return "video";
  if (fileTypeExtensions.image.includes(ext)) return "image";
  if (fileTypeExtensions.document.includes(ext)) return "document";
  return "other";
};

/** ---------------------------
 *  Reusable Math Input (stabilized)
 *  --------------------------*/
interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editing: boolean;
  placeholder?: string;
  className?: string;
}

const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  editing,
  placeholder = "",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const ignoreNextChange = useRef(false);

  // Create the mathfield exactly once, and destroy on unmount only
  useEffect(() => {
    if (!containerRef.current || mathfieldRef.current) return;
    const mf = new MathfieldElement();
    mathfieldRef.current = mf;

    // Base options
    mf.setOptions({
      defaultMode: "math",
      smartMode: true,
      virtualKeyboardMode: "onfocus",
      virtualKeyboards: "all",
      inlineShortcuts: {
        "++": "\\plus",
        "->": "\\rightarrow",
      },
      readOnly: !editing,
    });

    // Base styles
    mf.style.width = "100%";
    containerRef.current.appendChild(mf);

    // Input listener: wrap with \( ... \)
    const onInput = (evt: Event) => {
      if (!editing) return;
      ignoreNextChange.current = true;
      onChange(`\\(${(evt.target as MathfieldElement).value}\\)`);
    };
    mf.addEventListener("input", onInput);

    return () => {
      mf.removeEventListener("input", onInput);
      mf.remove();
      mathfieldRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep value in sync (without clobbering on the very keystroke that triggered setState)
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;
    if (ignoreNextChange.current) {
      ignoreNextChange.current = false;
      return;
    }
    const unwrappedValue = extractLatexFromText(value || "");
    if (mf.value !== unwrappedValue) mf.value = unwrappedValue;
  }, [value]);

  // Toggle readOnly and visuals when editing changes
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;
    mf.setOptions({ readOnly: !editing });
    mf.style.pointerEvents = editing ? "auto" : "none";
    mf.style.backgroundColor = editing ? "#fff" : "transparent";
    mf.style.minHeight = editing ? "60px" : "auto";
    mf.style.padding = editing ? "8px" : "0";
    mf.style.border = editing ? "1px solid #d1d5db" : "none";
    mf.style.borderRadius = editing ? "6px" : "0";
    mf.style.cursor = editing ? "text" : "default";
  }, [editing]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} />
      {editing && (onSave || onCancel) && (
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <Button type="button" size="sm" variant="outline" onClick={onCancel} className="h-8 px-3">
              Cancel
            </Button>
          )}
          {onSave && (
            <Button type="button" size="sm" onClick={onSave} className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white">
              <Check size={14} className="mr-1" />
              Save
            </Button>
          )}
        </div>
      )}
      {!value && !editing && <div className="text-gray-400 italic text-sm">{placeholder}</div>}
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
    // hydrate from autosave if available
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
  const [currentQuestionData, setCurrentQuestionData] = useState({ lessonIndex: -1, subHeadingIndex: -1 });

  // inline editing map
  const [editingStates, setEditingStates] = useState<{ [key: string]: boolean }>({});

  // per lesson upload states
  const [audioStatuses, setAudioStatuses] = useState<("idle" | "uploading" | "success")[]>(
    newContent.lesson.map(() => "idle")
  );
  const [videoStatuses, setVideoStatuses] = useState<("idle" | "uploading" | "success")[]>(
    newContent.lesson.map(() => "idle")
  );
  const [uploadedAudioNames, setUploadedAudioNames] = useState<(string | null)[]>(
    newContent.lesson.map(() => null)
  );
  const [uploadedVideoNames, setUploadedVideoNames] = useState<(string | null)[]>(
    newContent.lesson.map(() => null)
  );

  // subheading upload inline status (keyed by lesson-sub)
  const [subUploadStatus, setSubUploadStatus] = useState<Record<string, "idle" | "uploading" | "success">>({});
  const [subUploadName, setSubUploadName] = useState<Record<string, string | null>>({});

  // drag & drop for “other files”
  const [dragOver, setDragOver] = useState(false);

  // track autosave
  useEffect(() => {
    const id = setTimeout(() => {
      if (!dirty) return;
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newContent));
      setLastSaved(Date.now());
      setDirty(false);
    }, 1200);
    return () => clearTimeout(id);
  }, [dirty, newContent]);

  // unsaved guard on page close
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

  // helper: mark dirty when content changes
  const markDirty = () => setDirty(true);

  // compute completion
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

  const getFieldPath = (lessonIndex: number, subHeadingIndex: number | null, fieldName: string) =>
    subHeadingIndex == null
      ? `lesson_${lessonIndex}_${fieldName}`
      : `lesson_${lessonIndex}_sub_${subHeadingIndex}_${fieldName}`;

  const toggleEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: !prev[fieldPath] }));

  const saveMathValue = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));

  const cancelEditing = (fieldPath: string) =>
    setEditingStates((prev) => ({ ...prev, [fieldPath]: false }));

  // lessons
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
    setNewContent((prev) => ({ ...prev, lesson: prev.lesson.filter((_, i) => i !== index) }));
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

  const updateLessonItem = (lessonIndex: number, field: keyof LessonItem, value: any) => {
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

  // “Other files” drag & drop + manual select
  const onDropFiles = (files: File[]) => {
    const accepted: File[] = [];
    const errors: string[] = [];
    files.forEach((f) => {
      if (!withinLimit(f)) errors.push(`${f.name} (${prettyFileSize(f.size)}) exceeds ${MAX_FILE_SIZE_MB}MB`);
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
      // show temp object URLs for preview (replaced on submit)
      const paths = accepted.map((f) => URL.createObjectURL(f));
      setNewContent((prev) => ({ ...prev, file_path: [...prev.file_path, ...paths] }));
      markDirty();
    }
  };

  const removeOtherFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewContent((prev) => ({ ...prev, file_path: prev.file_path.filter((_, i) => i !== index) }));
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

  // per-lesson audio/video upload handlers
  const setAudioState = (idx: number, status: "idle" | "uploading" | "success", fileName?: string | null) => {
    setAudioStatuses((p) => {
      const n = [...p]; n[idx] = status; return n;
    });
    if (fileName !== undefined) {
      setUploadedAudioNames((p) => { const n = [...p]; n[idx] = fileName; return n; });
    }
  };
  const setVideoState = (idx: number, status: "idle" | "uploading" | "success", fileName?: string | null) => {
    setVideoStatuses((p) => {
      const n = [...p]; n[idx] = status; return n;
    });
    if (fileName !== undefined) {
      setUploadedVideoNames((p) => { const n = [...p]; n[idx] = fileName; return n; });
    }
  };

  // subheading uploads
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
    // friendly validation
    const missingLessons: number[] = [];
    newContent.lesson.forEach((l, i) => { if (!l.text.trim()) missingLessons.push(i + 1); });

    if (!newContent.title.trim()) {
      toast({ variant: "destructive", title: "Add a title", description: "A clear title helps everyone find this content." });
      return;
    }
    if (!newContent.description.trim()) {
      toast({ variant: "destructive", title: "Add a short description", description: "Summarize what this content covers." });
      return;
    }
    if (!newContent.Topic?.trim()) {
      toast({ variant: "destructive", title: "Missing Topic", description: "Topic ID is required." });
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

      // push “other files” to supabase and replace temp URLs
      let finalFilePaths = newContent.file_path;
      if (uploadedFiles.length > 0) {
        const urls = await uploadFilesToSupabase(uploadedFiles);
        finalFilePaths = urls;
      }

      // Build payload strictly matching backend shape
      const payload: ContentFormData = {
        ...newContent,
        file_path: finalFilePaths,
        file_type: newContent.file_type, // "video" | "audio" | "document"
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

  // question modal controls
  const openQuestionModal = (lessonIndex: number, subHeadingIndex: number) => {
    setCurrentQuestionData({ lessonIndex, subHeadingIndex });
    setShowQuestionModal(true);
  };
  const saveQuestion = () => setShowQuestionModal(false);

  useEffect(() => {
    setNewContent((p) => ({ ...p, Topic: topicId || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  // current subheading
  const currentSubHeadingItem =
    currentQuestionData.lessonIndex !== -1 && currentQuestionData.subHeadingIndex !== -1
      ? newContent.lesson[currentQuestionData.lessonIndex].subHeading[currentQuestionData.subHeadingIndex]
      : null;

  /** ---------------------------
   *  Render
   *  --------------------------*/

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-700 hover:bg-gray-100">
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
                {dirty && <span className="ml-2 text-amber-600">(unsaved changes)</span>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-44 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600" style={{ width: `${completion}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">{completion}%</span>
              </div>
              <Button
                onClick={() => {
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(newContent));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({ title: "Draft saved", description: "You can safely come back later." });
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

        {/* Main */}
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

            {/* Content Type picker (backend enum) */}
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

          {/* Lesson Tabs / Chips */}
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
                {l.text.trim() ? <span className="ml-2 text-xs opacity-80">✓</span> : null}
              </button>
            ))}
            <Button onClick={addLessonItem} variant="secondary" className="inline-flex items-center gap-1">
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
                          onChange={(e) => updateLessonItem(lessonIndex, "text", e.target.value)}
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
                            const { error } = await supabase.storage.from("topics").upload(fileName, file);
                            if (error) throw error;
                            const { data: publicData } = supabase.storage.from("topics").getPublicUrl(fileName);
                            if (publicData?.publicUrl) {
                              updateLessonItem(lessonIndex, "audio", publicData.publicUrl);
                              setAudioState(lessonIndex, "success");
                              toast({ title: "Audio uploaded", duration: 3000 });
                              markDirty();
                            }
                          } catch {
                            setAudioState(lessonIndex, "idle", null);
                            toast({ variant: "destructive", title: "Audio upload failed" });
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
                            const { error } = await supabase.storage.from("topics").upload(fileName, file);
                            if (error) throw error;
                            const { data: publicData } = supabase.storage.from("topics").getPublicUrl(fileName);
                            if (publicData?.publicUrl) {
                              updateLessonItem(lessonIndex, "video", publicData.publicUrl);
                              setVideoState(lessonIndex, "success");
                              toast({ title: "Video uploaded", duration: 3000 });
                              markDirty();
                            }
                          } catch {
                            setVideoState(lessonIndex, "idle", null);
                            toast({ variant: "destructive", title: "Video upload failed" });
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

                    {/* Quick links if present */}
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
                      const fieldComment = getFieldPath(lessonIndex, subIndex, "comment");
                      const key = `${lessonIndex}-${subIndex}`;
                      const uploadState = subUploadStatus[key] || "idle";
                      const uploadName = subUploadName[key] || "";

                      return (
                        <div key={subIndex} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs flex items-center justify-center">
                                {subIndex + 1}
                              </div>
                              <div className="text-sm font-medium text-gray-700">Section {subIndex + 1}</div>
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
                            {/* Content */}
                            <div className="space-y-1 w-full">
                              <label className="text-xs text-gray-600">Section content</label>
                              <div className="border border-gray-200 rounded-lg p-2 bg-white w-full">
                                {editingStates[fieldText] ? (
                                  <MathInput
                                    value={sub.text}
                                    onChange={(v) => updateSubHeadingItem(lessonIndex, subIndex, "text", v)}
                                    editing={true}
                                    onSave={() => saveMathValue(fieldText)}
                                    onCancel={() => cancelEditing(fieldText)}
                                  />
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <MathInput value={sub.text} editing={false} placeholder="Click edit to add content" />
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
                            </div>

                            {/* Comment */}
                            <div className="space-y-1 w-full">
                              <label className="text-xs text-gray-600">Comment</label>
                              <div className="border border-gray-200 rounded-lg p-2 bg-white w-full">
                                {editingStates[fieldComment] ? (
                                  <MathInput
                                    value={sub.comment}
                                    onChange={(v) => updateSubHeadingItem(lessonIndex, subIndex, "comment", v)}
                                    editing={true}
                                    onSave={() => saveMathValue(fieldComment)}
                                    onCancel={() => cancelEditing(fieldComment)}
                                  />
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <MathInput value={sub.comment} editing={false} placeholder="Click edit to add comment" />
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
                                  {sub.mcqQuestions.length} MCQ{sub.mcqQuestions.length > 1 ? "s" : ""}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Four explicit buttons */}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  openPicker(fileTypeExtensions.audio.join(","), (f) =>
                                    handleSubheadingFileUpload(lessonIndex, subIndex, "audio", f)
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
                                    handleSubheadingFileUpload(lessonIndex, subIndex, "video", f)
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
                                  openPicker(fileTypeExtensions.document.join(","), (f) =>
                                    handleSubheadingFileUpload(lessonIndex, subIndex, "document", f)
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
                                    handleSubheadingFileUpload(lessonIndex, subIndex, "image", f)
                                  )
                                }
                                className="inline-flex items-center gap-2"
                                disabled={uploadState === "uploading"}
                              >
                                <ImageIcon size={14} /> Image
                              </Button>

                              {/* Status + Link */}
                              <div className="text-xs text-gray-600 inline-flex items-center gap-2">
                                {uploadState === "uploading" && (
                                  <span className="inline-flex items-center gap-1">
                                    <Loader2 size={14} className="animate-spin" /> Uploading {uploadName}
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
                              <div className="text-xs font-semibold text-blue-900 mb-1">Open-ended</div>
                              <div className="grid gap-2">
                                {sub.question && (
                                  <div className="border rounded p-2 bg-white">
                                    <div className="text-xs text-gray-600 mb-1">Question</div>
                                    <MathInput value={sub.question} editing={false} placeholder="" />
                                  </div>
                                )}
                                {sub.expectedAnswer && (
                                  <div className="border rounded p-2 bg-white">
                                    <div className="text-xs text-gray-600 mb-1">Expected Answer</div>
                                    <MathInput value={sub.expectedAnswer} editing={false} placeholder="" />
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
                    <div key={`${f.name}-${i}`} className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{kindIcon(kind, 18)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate" title={f.name}>
                            {f.name}
                          </div>
                          <div className="text-xs text-gray-500">{prettyFileSize(f.size)}</div>
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
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="mr-1" />}
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Question Modal (Open-ended + Optional MCQs) */}
        {showQuestionModal && currentSubHeadingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Make the modal body scrollable with sticky header/footer */}
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl max-h-[85vh] flex flex-col">
              <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-base font-semibold">Questions for this section</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowQuestionModal(false)} aria-label="Close">
                  <X size={18} />
                </Button>
              </div>

              <div className="p-5 space-y-5 overflow-y-auto">
                {/* Open-ended block */}
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-gray-700">Open-ended (optional)</div>

                  {/* Question */}
                  {(() => {
                    const key = `q_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`;
                    return editingStates[key] ? (
                      <MathInput
                        value={currentSubHeadingItem.question}
                        onChange={(v) =>
                          updateSubHeadingItem(
                            currentQuestionData.lessonIndex,
                            currentQuestionData.subHeadingIndex,
                            "question",
                            v
                          )
                        }
                        editing={true}
                        onSave={() => saveMathValue(key)}
                        onCancel={() => cancelEditing(key)}
                      />
                    ) : (
                      <div className="border rounded-lg p-2 bg-gray-50 flex items-start justify-between">
                        <div className="flex-1">
                          <MathInput value={currentSubHeadingItem.question} editing={false} placeholder="Click edit to add question" />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-blue-600"
                          onClick={() => toggleEditing(key)}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    );
                  })()}

                  {/* Expected Answer */}
                  {(() => {
                    const key = `ans_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`;
                    return editingStates[key] ? (
                      <MathInput
                        value={currentSubHeadingItem.expectedAnswer}
                        onChange={(v) =>
                          updateSubHeadingItem(
                            currentQuestionData.lessonIndex,
                            currentQuestionData.subHeadingIndex,
                            "expectedAnswer",
                            v
                          )
                        }
                        editing={true}
                        onSave={() => saveMathValue(key)}
                        onCancel={() => cancelEditing(key)}
                      />
                    ) : (
                      <div className="border rounded-lg p-2 bg-gray-50 flex items-start justify-between">
                        <div className="flex-1">
                          <MathInput value={currentSubHeadingItem.expectedAnswer} editing={false} placeholder="Click edit to add expected answer" />
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" onClick={() => toggleEditing(key)}>
                          <Edit size={14} />
                        </Button>
                      </div>
                    );
                  })()}

                  {/* Hint */}
                  {(() => {
                    const key = `hint_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`;
                    return editingStates[key] ? (
                      <MathInput
                        value={currentSubHeadingItem.hint}
                        onChange={(v) =>
                          updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "hint", v)
                        }
                        editing={true}
                        onSave={() => saveMathValue(key)}
                        onCancel={() => cancelEditing(key)}
                      />
                    ) : (
                      <div className="border rounded-lg p-2 bg-gray-50 flex items-start justify-between">
                        <div className="flex-1">
                          <MathInput value={currentSubHeadingItem.hint} editing={false} placeholder="Click edit to add hint" />
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600" onClick={() => toggleEditing(key)}>
                          <Edit size={14} />
                        </Button>
                      </div>
                    );
                  })()}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200" />

                {/* MCQs block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700">Multiple-choice (optional)</div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const base: MCQQuestion = {
                          question: "",
                          options: ["", ""],
                          correctAnswer: "",
                          explanation: "",
                        };
                        const list = currentSubHeadingItem.mcqQuestions ? [...currentSubHeadingItem.mcqQuestions] : [];
                        list.push(base);
                        updateSubHeadingItem(
                          currentQuestionData.lessonIndex,
                          currentQuestionData.subHeadingIndex,
                          "mcqQuestions",
                          list
                        );
                      }}
                      className="inline-flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add MCQ
                    </Button>
                  </div>

                  {(currentSubHeadingItem.mcqQuestions || []).map((mcq, idx) => {
                    // Editing keys for MCQ question/explanation
                    const qKey = `mcq_q_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}_${idx}`;
                    const eKey = `mcq_exp_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}_${idx}`;

                    return (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 text-sm font-medium">
                            <ListChecks size={16} />
                            MCQ {idx + 1}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-600"
                            onClick={() => {
                              const list = [...currentSubHeadingItem.mcqQuestions];
                              list.splice(idx, 1);
                              updateSubHeadingItem(
                                currentQuestionData.lessonIndex,
                                currentQuestionData.subHeadingIndex,
                                "mcqQuestions",
                                list
                              );
                            }}
                            aria-label={`Remove MCQ ${idx + 1}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        {/* MCQ Question */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Question</div>
                          {editingStates[qKey] ? (
                            <MathInput
                              value={mcq.question}
                              editing={true}
                              onChange={(v) => {
                                const list = [...currentSubHeadingItem.mcqQuestions];
                                list[idx] = { ...list[idx], question: v };
                                updateSubHeadingItem(
                                  currentQuestionData.lessonIndex,
                                  currentQuestionData.subHeadingIndex,
                                  "mcqQuestions",
                                  list
                                );
                              }}
                              onSave={() => saveMathValue(qKey)}
                              onCancel={() => cancelEditing(qKey)}
                            />
                          ) : (
                            <div className="border rounded-lg p-2 bg-white flex items-start justify-between">
                              <div className="flex-1">
                                <MathInput value={mcq.question} editing={false} placeholder="Click edit to add MCQ question" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-blue-600"
                                onClick={() => toggleEditing(qKey)}
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Options */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Options (mark the correct one)</div>
                          <div className="space-y-2">
                            {mcq.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`rounded-full border w-5 h-5 inline-flex items-center justify-center ${mcq.correctAnswer === opt && opt.trim()
                                    ? "border-blue-600"
                                    : "border-gray-300"
                                    }`}
                                  onClick={() => {
                                    const list = [...currentSubHeadingItem.mcqQuestions];
                                    const currentOptions = list[idx].options;
                                    const chosen = currentOptions[oi] || "";
                                    list[idx] = { ...list[idx], correctAnswer: chosen };
                                    updateSubHeadingItem(
                                      currentQuestionData.lessonIndex,
                                      currentQuestionData.subHeadingIndex,
                                      "mcqQuestions",
                                      list
                                    );
                                  }}
                                  title="Mark correct"
                                >
                                  {mcq.correctAnswer === opt && opt.trim() ? <Dot size={16} /> : <Circle size={14} />}
                                </button>
                                <Input
                                  value={opt}
                                  onChange={(e) => {
                                    const list = [...currentSubHeadingItem.mcqQuestions];
                                    const opts = [...list[idx].options];
                                    const newVal = e.target.value;
                                    const wasCorrect = list[idx].correctAnswer === opts[oi];
                                    opts[oi] = newVal;
                                    list[idx].options = opts;
                                    if (wasCorrect) {
                                      list[idx].correctAnswer = newVal; // keep pointer to updated string
                                    }
                                    updateSubHeadingItem(
                                      currentQuestionData.lessonIndex,
                                      currentQuestionData.subHeadingIndex,
                                      "mcqQuestions",
                                      list
                                    );
                                  }}
                                  placeholder={`Option ${oi + 1}`}
                                  className="h-9"
                                />
                                {mcq.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-500 hover:text-red-600"
                                    onClick={() => {
                                      const list = [...currentSubHeadingItem.mcqQuestions];
                                      const opts = [...list[idx].options];
                                      const removed = opts.splice(oi, 1)[0];
                                      // clear correctAnswer if we deleted it
                                      if (list[idx].correctAnswer === removed) list[idx].correctAnswer = "";
                                      list[idx].options = opts;
                                      updateSubHeadingItem(
                                        currentQuestionData.lessonIndex,
                                        currentQuestionData.subHeadingIndex,
                                        "mcqQuestions",
                                        list
                                      );
                                    }}
                                    aria-label="Remove option"
                                  >
                                    <X size={16} />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const list = [...currentSubHeadingItem.mcqQuestions];
                                  list[idx].options = [...list[idx].options, ""];
                                  updateSubHeadingItem(
                                    currentQuestionData.lessonIndex,
                                    currentQuestionData.subHeadingIndex,
                                    "mcqQuestions",
                                    list
                                  );
                                }}
                                className="inline-flex items-center gap-1"
                              >
                                <Plus size={14} />
                                Add option
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Explanation (optional)</div>
                          {editingStates[eKey] ? (
                            <MathInput
                              value={mcq.explanation}
                              editing={true}
                              onChange={(v) => {
                                const list = [...currentSubHeadingItem.mcqQuestions];
                                list[idx] = { ...list[idx], explanation: v };
                                updateSubHeadingItem(
                                  currentQuestionData.lessonIndex,
                                  currentQuestionData.subHeadingIndex,
                                  "mcqQuestions",
                                  list
                                );
                              }}
                              onSave={() => saveMathValue(eKey)}
                              onCancel={() => cancelEditing(eKey)}
                              placeholder="Why is the correct answer correct?"
                            />
                          ) : (
                            <div className="border rounded-lg p-2 bg-white flex items-start justify-between">
                              <div className="flex-1">
                                <MathInput value={mcq.explanation} editing={false} placeholder="Click edit to add explanation" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-blue-600"
                                onClick={() => toggleEditing(eKey)}
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-4 border-t flex items-center justify-end gap-2 sticky bottom-0 bg-white">
                <Button variant="outline" onClick={() => setShowQuestionModal(false)}>
                  Cancel
                </Button>
                <Button onClick={saveQuestion} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewContent;
