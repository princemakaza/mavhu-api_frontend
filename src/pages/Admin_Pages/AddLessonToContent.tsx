import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ChevronLeft,
    Plus,
    X,
    Edit,
    Trash2,
    Save,
    Loader2,
    Music,
    Video,
    Link as LinkIcon,
    ListChecks,
    Clock,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import MathInput from "./createContentComponent/MathInput";
import QuestionModal from "./createContentComponent/QuestionModal";

import { supabase } from "@/helper/SupabaseClient";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";

// ---- Types (kept minimal to match your payload) ----
type SubHeadingItem = {
    timingArray: number[];
    text: string;
    subheadingAudioPath: string;
    question: string;
    expectedAnswer: string;
    comment: string;
    hint: string;
    mcqQuestions: any[];
};

type LessonPayload = {
    text: string;
    subHeading: SubHeadingItem[];
    audio: string;
    video: string;
};

type TimingPoint = { seconds: number };

// ---- Small helpers (same concept as your screen) ----
const AUTOSAVE_KEY = "ADD_LESSON_AUTOSAVE_V1";
const MAX_FILE_SIZE_MB = 200;

const withinLimit = (f: File) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

const prettyFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const countContentLines = (text: string): number => {
    if (!text) return 0;
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
    const next: number[] = Array.from({ length: lineCount }, (_, i) => current[i] ?? 0);
    return next;
};

const toTimingPoints = (arr: number[] | undefined): TimingPoint[] =>
    (arr || []).map((s) => ({ seconds: Number.isFinite(s) ? s : 0 }));

const fromTimingPoints = (points: TimingPoint[] | undefined): number[] =>
    (points || []).map((p) => (Number.isFinite(p.seconds) ? p.seconds : 0));

// ---- Component ----
const AddLessonToContent: React.FC = () => {
    const { contentId } = useParams<{ contentId: string }>(); // topic_content id in URL
    const navigate = useNavigate();
    const { toast } = useToast();

    // One lesson only
    const [lesson, setLesson] = useState<LessonPayload>(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as LessonPayload;
                return parsed;
            } catch {
                /* ignore */
            }
        }
        return {
            text: "",
            audio: "",
            video: "",
            subHeading: [
                {
                    text: "",
                    timingArray: [],
                    subheadingAudioPath: "",
                    question: "",
                    expectedAnswer: "",
                    comment: "",
                    hint: "",
                    mcqQuestions: [],
                },
            ],
        };
    });

    const [dirty, setDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [currentQuestionData, setCurrentQuestionData] = useState({
        lessonIndex: 0,
        subHeadingIndex: -1,
    });
    const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});

    const markDirty = () => setDirty(true);

    // Autosave
    useEffect(() => {
        const id = setTimeout(() => {
            if (!dirty) return;
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(lesson));
            setLastSaved(Date.now());
            setDirty(false);
        }, 1200);
        return () => clearTimeout(id);
    }, [dirty, lesson]);

    // Guard unsaved changes
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

    // Keep timings in sync with text
    useEffect(() => {
        setLesson((prev) => {
            let changed = false;
            const subHeading = prev.subHeading.map((s) => {
                const lineCount = countContentLines(s.text);
                const normalized = normalizeTimingArrayToLineCount(s.timingArray, lineCount);
                if (normalized.length !== (s.timingArray?.length ?? 0)) {
                    changed = true;
                    return { ...s, timingArray: normalized };
                }
                return s;
            });
            return changed ? { ...prev, subHeading } : prev;
        });
    }, [lesson.subHeading]);

    const completion = useMemo(() => {
        let total = 1; // lesson.text
        let done = lesson.text.trim() ? 1 : 0;
        // each sub requires text
        total += lesson.subHeading.length;
        done += lesson.subHeading.reduce((acc, s) => acc + (s.text.trim() ? 1 : 0), 0);
        const pct = Math.round((done / total) * 100);
        return isNaN(pct) ? 0 : pct;
    }, [lesson]);

    // editing helpers
    const getFieldPath = (subIndex: number, field: string) =>
        `lesson_0_sub_${subIndex}_${field}`;
    const toggleEditing = (fieldPath: string) =>
        setEditingStates((p) => ({ ...p, [fieldPath]: !p[fieldPath] }));
    const saveMathValue = (fieldPath: string) =>
        setEditingStates((p) => ({ ...p, [fieldPath]: false }));
    const cancelEditing = (fieldPath: string) =>
        setEditingStates((p) => ({ ...p, [fieldPath]: false }));

    // subheading CRUD
    const addSubHeading = () => {
        setLesson((p) => ({
            ...p,
            subHeading: [
                ...p.subHeading,
                {
                    text: "",
                    timingArray: [],
                    subheadingAudioPath: "",
                    question: "",
                    expectedAnswer: "",
                    comment: "",
                    hint: "",
                    mcqQuestions: [],
                },
            ],
        }));
        markDirty();
    };

    const removeSubHeading = (index: number) => {
        if (lesson.subHeading.length <= 1) return;
        setLesson((p) => ({
            ...p,
            subHeading: p.subHeading.filter((_, i) => i !== index),
        }));
        markDirty();
    };

    const updateSubHeading = (
        index: number,
        field: keyof SubHeadingItem,
        value: any
    ) => {
        setLesson((p) => {
            const subs = [...p.subHeading];
            subs[index] = { ...(subs[index] as any), [field]: value };
            return { ...p, subHeading: subs };
        });
        markDirty();
    };

    // uploads
    const uploadToBucket = async (file: File) => {
        const fileName = `${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("topics").upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from("topics").getPublicUrl(fileName);
        return data?.publicUrl || "";
    };

    const openPicker = (accept: string, onPick: (f: File) => void) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) onPick(f);
        };
        input.click();
    };

    const handleUploadLessonAudio = () =>
        openPicker("audio/*", async (file) => {
            try {
                if (!withinLimit(file)) {
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: `${file.name} is ${prettyFileSize(
                            file.size
                        )} (max ${MAX_FILE_SIZE_MB}MB).`,
                    });
                    return;
                }
                const url = await uploadToBucket(file);
                setLesson((p) => ({ ...p, audio: url }));
                toast({ title: "Audio uploaded" });
                markDirty();
            } catch {
                toast({ variant: "destructive", title: "Audio upload failed" });
            }
        });

    const handleUploadLessonVideo = () =>
        openPicker("video/*", async (file) => {
            try {
                if (!withinLimit(file)) {
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: `${file.name} is ${prettyFileSize(
                            file.size
                        )} (max ${MAX_FILE_SIZE_MB}MB).`,
                    });
                    return;
                }
                const url = await uploadToBucket(file);
                setLesson((p) => ({ ...p, video: url }));
                toast({ title: "Video uploaded" });
                markDirty();
            } catch {
                toast({ variant: "destructive", title: "Video upload failed" });
            }
        });

    const handleUploadSubAudio = (subIndex: number) =>
        openPicker("audio/*", async (file) => {
            try {
                if (!withinLimit(file)) {
                    toast({
                        variant: "destructive",
                        title: "File too large",
                        description: `${file.name} is ${prettyFileSize(
                            file.size
                        )} (max ${MAX_FILE_SIZE_MB}MB).`,
                    });
                    return;
                }
                const url = await uploadToBucket(file);
                updateSubHeading(subIndex, "subheadingAudioPath", url);
                toast({ title: "Section audio uploaded" });
            } catch {
                toast({ variant: "destructive", title: "Upload failed" });
            }
        });

    // timings from MathInput
    const handleTimingsChange = (subIndex: number, timings: TimingPoint[]) => {
        const secs = fromTimingPoints(timings);
        updateSubHeading(subIndex, "timingArray", secs);
    };

    const handleLineSecondsChange = (
        subIndex: number,
        lineIndex: number,
        seconds: number
    ) => {
        const sub = lesson.subHeading[subIndex];
        const lineCount = countContentLines(sub.text);
        const normalized = normalizeTimingArrayToLineCount(sub.timingArray, lineCount);
        const updated = [...normalized];
        updated[lineIndex] = isNaN(seconds) ? 0 : Math.max(0, seconds);
        updateSubHeading(subIndex, "timingArray", updated);
    };

    // modal open
    const openQuestionModal = (subIndex: number) => {
        setCurrentQuestionData({ lessonIndex: 0, subHeadingIndex: subIndex });
        setShowQuestionModal(true);
    };

    // Save
    const saveDraftNow = () => {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(lesson));
        setLastSaved(Date.now());
        setDirty(false);
        toast({ title: "Draft saved", description: "You can safely come back later." });
    };

    // Submit (payload must match your shape)
    const handleSubmit = async () => {
        if (!contentId) {
            toast({
                variant: "destructive",
                title: "Missing topic_content id",
                description: "Cannot add a lesson without a valid content id.",
            });
            return;
        }
        if (!lesson.text.trim()) {
            toast({
                variant: "destructive",
                title: "Lesson title required",
                description: "Please add a lesson title.",
            });
            return;
        }
        const missing = lesson.subHeading
            .map((s, idx) => (!s.text.trim() ? idx + 1 : null))
            .filter(Boolean);
        if (missing.length) {
            toast({
                variant: "destructive",
                title: "Section content missing",
                description: `Please fill section(s): ${missing.join(", ")}.`,
            });
            return;
        }

        const payload: LessonPayload = {
            text: lesson.text,
            subHeading: lesson.subHeading.map((s) => ({
                timingArray: s.timingArray || [],
                text: s.text,
                subheadingAudioPath: s.subheadingAudioPath || "",
                question: s.question || "",
                expectedAnswer: s.expectedAnswer || "",
                comment: s.comment || "",
                hint: s.hint || "",
                mcqQuestions: s.mcqQuestions || [],
            })),
            audio: lesson.audio || "",
            video: lesson.video || "",
        };

        try {
            setIsSubmitting(true);
            // You’ll add this method in the service (see below)
            await TopicContentService.addLesson(contentId, payload);
            localStorage.removeItem(AUTOSAVE_KEY);
            setDirty(false);
            toast({ title: "Lesson added", description: "Your lesson was saved successfully." });
            navigate(-1);
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Failed to add lesson",
                description: "Please check your connection and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // current sub for modal
    const currentSub =
        currentQuestionData.subHeadingIndex !== -1
            ? lesson.subHeading[currentQuestionData.subHeadingIndex]
            : null;

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
                                <span className="inline-flex items-center gap-1 mr-3">
                                    <span className="text-gray-500">topic_content:</span>
                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        {contentId || "—"}
                                    </span>
                                </span>
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
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                        style={{ width: `${completion}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 w-10 text-right">{completion}%</span>
                            </div>
                            <Button onClick={saveDraftNow} variant="outline" className="hidden sm:inline-flex">
                                <Save size={16} className="mr-1" />
                                Save draft
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Adding…
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        <Plus size={16} />
                                        Add lesson
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                    {/* Lesson header */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="text-xs text-gray-500 mb-1">Lesson title</div>
                        <Input
                            value={lesson.text}
                            onChange={(e) => {
                                setLesson((p) => ({ ...p, text: e.target.value }));
                                markDirty();
                            }}
                            placeholder="e.g., Mathematical Induction — Quick Guide"
                            className="h-10 text-sm"
                        />
                        <div className="mt-3 flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleUploadLessonAudio}>
                                <Music size={14} className="mr-1" /> Upload audio
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleUploadLessonVideo}>
                                <Video size={14} className="mr-1" /> Upload video
                            </Button>
                            <div className="text-xs text-gray-600 inline-flex items-center gap-3">
                                {lesson.audio && (
                                    <a
                                        href={lesson.audio}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                                    >
                                        <LinkIcon size={14} /> Audio
                                    </a>
                                )}
                                {lesson.video && (
                                    <a
                                        href={lesson.video}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-700 hover:underline"
                                    >
                                        <LinkIcon size={14} /> Video
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
                        <div className="text-xs font-medium text-gray-600">Sections</div>

                        {lesson.subHeading.map((sub, idx) => {
                            const fieldText = getFieldPath(idx, "text");
                            const lineCount = countContentLines(sub.text);
                            const normalizedTimingArray = normalizeTimingArrayToLineCount(
                                sub.timingArray,
                                lineCount
                            );
                            const timingPoints = toTimingPoints(normalizedTimingArray);

                            return (
                                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 text-white text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">Section {idx + 1}</div>
                                        </div>
                                        {lesson.subHeading.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-600"
                                                onClick={() => removeSubHeading(idx)}
                                                aria-label={`Remove Section ${idx + 1}`}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-3">
                                        <div className="text-xs text-gray-600 mb-1">
                                            Section content (line breaks, <code>//</code> or <code>\\</code> create
                                            timing lines)
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-2 bg-white w-full">
                                            {editingStates[fieldText] ? (
                                                <MathInput
                                                    value={sub.text}
                                                    onChange={(v) => updateSubHeading(idx, "text", v)}
                                                    editing={true}
                                                    onSave={() => saveMathValue(fieldText)}
                                                    onCancel={() => cancelEditing(fieldText)}
                                                    enableTiming={true}
                                                    timings={timingPoints}
                                                    onTimingsChange={(t) => handleTimingsChange(idx, t as any)}
                                                />
                                            ) : (
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <MathInput value={sub.text} editing={false} placeholder="Click edit" />
                                                        {normalizedTimingArray.length > 0 && (
                                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                                <div className="text-xs font-medium text-blue-800 mb-1">
                                                                    Timing set for lines:
                                                                </div>
                                                                <div className="text-xs text-blue-600 space-y-1">
                                                                    {normalizedTimingArray.map((secs, i) => (
                                                                        <div key={i} className="flex justify-between">
                                                                            <span>Line {i + 1}:</span>
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

                                        {/* Per-line timing */}
                                        {lineCount > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                    <Clock size={14} />
                                                    <span>Per-line timing (seconds)</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {Array.from({ length: lineCount }).map((_, lineIdx) => (
                                                        <div
                                                            key={lineIdx}
                                                            className="flex items-center gap-2 border rounded-md bg-white px-2 py-2"
                                                        >
                                                            <span className="text-xs text-gray-500 w-14">Line {lineIdx + 1}</span>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step="1"
                                                                value={
                                                                    Number.isFinite(normalizedTimingArray[lineIdx])
                                                                        ? String(normalizedTimingArray[lineIdx])
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleLineSecondsChange(
                                                                        idx,
                                                                        lineIdx,
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

                                    {/* Actions */}
                                    <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openQuestionModal(idx)}
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

                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUploadSubAudio(idx)}
                                            >
                                                <Music size={14} className="mr-1" /> Section audio
                                            </Button>
                                            {sub.subheadingAudioPath && (
                                                <a
                                                    href={sub.subheadingAudioPath}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                                                >
                                                    <LinkIcon size={14} /> View audio
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Open-ended preview */}
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
                            onClick={addSubHeading}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                        >
                            <Plus size={14} className="mr-1" />
                            Add section
                        </Button>
                    </div>

                    {/* Footer (mobile) */}
                    <div className="sm:hidden sticky bottom-3 z-20">
                        <div className="mx-auto max-w-sm bg-white shadow-lg rounded-full p-2 flex items-center justify-between border">
                            <Button variant="outline" onClick={saveDraftNow} className="rounded-full">
                                <Save size={16} className="mr-1" />
                                Save
                            </Button>
                            <div className="text-xs text-gray-500">{completion}%</div>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full">
                                {isSubmitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Plus size={16} className="mr-1" />
                                )}
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Question Modal */}
                <QuestionModal
                    showQuestionModal={showQuestionModal}
                    setShowQuestionModal={setShowQuestionModal}
                    currentSubHeadingItem={currentSub}
                    currentQuestionData={currentQuestionData}
                    updateSubHeadingItem={(lessonIndex, subIndex, field, value) =>
                        updateSubHeading(subIndex, field as keyof SubHeadingItem, value)
                    }
                    editingStates={editingStates}
                    toggleEditing={toggleEditing}
                    saveMathValue={saveMathValue}
                    cancelEditing={cancelEditing}
                />
            </div>
        </div>
    );
};

export default AddLessonToContent;
