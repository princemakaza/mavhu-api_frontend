import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/Sidebar";
import MathInput from "./createContentComponent/MathInput";
import {
    Plus,
    ChevronLeft,
    Trash2,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ListChecks,
    HelpCircle,
    Radio,
    Check,
} from "lucide-react";
import EndLessonQuestionService from "@/services/Admin_Service/end_lesson_question_service";

// ---------------- Types ----------------
export type QuestionType = "open-ended" | "multiple-choice";

export interface QuizQuestion {
    questionText: string;
    type: QuestionType;
    options: string[];        // only used for MCQ
    correctAnswer: string;    // MCQ: required; Open-ended: optional (now supported in UI)
}

interface QuizPayloadForAutosave {
    topic_content_id: string;
    lesson_id: string;
    questions: QuizQuestion[];
}

// keep this version separate in case you need to bump autosave format later
const AUTOSAVE_KEY = "QUIZ_AUTOSAVE_V2";

// ---------------- Component ----------------
const CreateEndLessonQuiz: React.FC = () => {
    const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
        // attempt restore
        try {
            const raw = localStorage.getItem(AUTOSAVE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as QuizPayloadForAutosave;
                if (
                    parsed?.topic_content_id === topicId &&
                    parsed?.lesson_id === lessonId &&
                    Array.isArray(parsed.questions)
                ) {
                    return parsed.questions;
                }
            }
        } catch { }
        return [
            {
                questionText: "",
                type: "open-ended",
                options: [],
                correctAnswer: "", // optional for open-ended
            },
        ];
    });

    const [dirty, setDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ------- Autosave -------
    useEffect(() => {
        const t = setTimeout(() => {
            if (!dirty) return;
            const payload: QuizPayloadForAutosave = {
                topic_content_id: topicId || "",
                lesson_id: lessonId || "",
                questions,
            };
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
            setLastSaved(Date.now());
            setDirty(false);
        }, 1200);
        return () => clearTimeout(t);
    }, [dirty, questions, topicId, lessonId]);

    // guard on unload
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

    // derived progress
    const completion = useMemo(() => {
        const total = Math.max(1, questions.length * 1); // 1 field min per question
        const done = questions.filter((q) => q.questionText.trim().length > 0).length;
        const pct = Math.round((done / total) * 100);
        return isNaN(pct) ? 0 : pct;
    }, [questions]);

    // ------- Helpers -------
    const updateQuestion = (idx: number, patch: Partial<QuizQuestion>) => {
        setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
        setDirty(true);
    };

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            { questionText: "", type: "open-ended", options: [], correctAnswer: "" },
        ]);
        setDirty(true);
    };

    const removeQuestion = (idx: number) => {
        if (questions.length <= 1) return;
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
        setDirty(true);
    };

    const addOption = (qIdx: number) => {
        const next = [...questions];
        next[qIdx].options.push("");
        updateQuestion(qIdx, { options: next[qIdx].options });
    };

    const removeOption = (qIdx: number, optIdx: number) => {
        const next = [...questions];
        const was = next[qIdx].options[optIdx];
        next[qIdx].options.splice(optIdx, 1);
        // clear correct if it pointed to removed
        const correct = next[qIdx].correctAnswer;
        const stillExists = next[qIdx].options.includes(correct);
        updateQuestion(qIdx, {
            options: next[qIdx].options,
            correctAnswer: stillExists ? correct : "",
        });
    };

    const setCorrectTo = (qIdx: number, value: string) => {
        updateQuestion(qIdx, { correctAnswer: value });
    };

    // ------- Validation -------
    const validate = (): string[] => {
        const errs: string[] = [];
        if (!topicId) errs.push("Missing topic id in route.");
        if (!lessonId) errs.push("Missing lesson id in route.");

        questions.forEach((q, i) => {
            if (!q.questionText.trim()) errs.push(`Q${i + 1}: question text is required.`);
            if (q.type === "multiple-choice") {
                const opts = q.options.map((o) => o.trim()).filter(Boolean);
                if (opts.length < 2) errs.push(`Q${i + 1}: provide at least two options.`);
                if (!q.correctAnswer.trim()) errs.push(`Q${i + 1}: select the correct answer.`);
                if (q.correctAnswer && !opts.includes(q.correctAnswer))
                    errs.push(`Q${i + 1}: correct answer must match one of the options.`);
            }
            // Open-ended: correctAnswer is optional. If provided, just allow any string.
        });
        return errs;
    };

    // ------- Submit (now calls LESSON-SCOPED UPSERT) -------
    const handleCreateOrUpsertQuiz = async () => {
        const errors = validate();
        if (errors.length) {
            toast({
                variant: "destructive",
                title: "Please fix these first",
                description: errors.join(" • "),
                duration: 1000, // duration in milliseconds (1 second)

            });
            return;
        }

        try {
            setIsSubmitting(true);

            // For MCQ, keep options+correct. For open-ended, keep correctAnswer (optional) as well.
            const mapped = questions.map((q) => ({
                questionText: q.questionText,
                type: q.type,
                options: q.type === "multiple-choice" ? q.options : [], // ensure empty for open-ended
                correctAnswer:
                    q.type === "multiple-choice" ? q.correctAnswer : (q.correctAnswer || ""), // optional on open-ended
            }));

            // New: hit the upsert-for-lesson endpoint
            await EndLessonQuestionService.upsertQuizForLesson(topicId!, lessonId!, {
                questions: mapped,
            });

            localStorage.removeItem(AUTOSAVE_KEY);
            setDirty(false);
            toast({
                title: "Quiz saved",
                description: "End-lesson quiz upserted successfully for this lesson.",
                duration: 1000, // duration in milliseconds (1 second)
            });

            navigate(-1);
        } catch (e: any) {
            const msg = typeof e === "string" ? e : e?.message || "Failed to save quiz";
            toast({
                variant: "destructive", title: "Error", description: msg,
                duration: 1000, // duration in milliseconds (1 second)
            });
        } finally {
            setIsSubmitting(false);
        }
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
                                    const payload: QuizPayloadForAutosave = {
                                        topic_content_id: topicId || "",
                                        lesson_id: lessonId || "",
                                        questions,
                                    };
                                    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
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
                                onClick={handleCreateOrUpsertQuiz}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving…
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2">
                                        <Plus size={16} />
                                        Save Quiz
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                    {/* Intro / helper */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-blue-600"><HelpCircle size={18} /></div>
                            <div className="text-sm text-gray-700">
                                <div className="font-medium">Build your end-lesson quiz</div>
                                <p className="mt-1 text-gray-600">
                                    Each question can be <span className="font-medium">open-ended</span> or
                                    <span className="font-medium"> multiple-choice</span>. For math, type directly in the field — it supports LaTeX via <code>MathInput</code>.
                                </p>
                                <p className="mt-1 text-gray-600">
                                    Topic content ID: <code>{topicId}</code>, Lesson ID: <code>{lessonId}</code>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        {questions.map((q, qIdx) => (
                            <div
                                key={qIdx}
                                className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition shadow-sm p-4"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm">
                                            {qIdx + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-xs text-gray-500">Question</div>
                                            <div className="text-sm font-medium text-gray-800">
                                                {q.type === "multiple-choice" ? "Multiple choice" : "Open-ended"}
                                            </div>
                                        </div>
                                    </div>
                                    {questions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-500 hover:text-red-600"
                                            onClick={() => removeQuestion(qIdx)}
                                            aria-label={`Remove question ${qIdx + 1}`}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}
                                </div>

                                {/* Choose type */}
                                <div className="mt-3">
                                    <div className="inline-flex items-center gap-2 text-xs text-gray-600 mb-1">
                                        <Radio size={14} />
                                        <span>Is this a multiple-choice question?</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={q.type === "open-ended" ? "default" : "outline"}
                                            size="sm"
                                            className={q.type === "open-ended" ? "bg-blue-600 text-white" : ""}
                                            onClick={() =>
                                                updateQuestion(qIdx, {
                                                    type: "open-ended",
                                                    options: [],
                                                    // keep any typed correctAnswer for open-ended; do not clear
                                                })
                                            }
                                        >
                                            No — Open-ended
                                        </Button>
                                        <Button
                                            variant={q.type === "multiple-choice" ? "default" : "outline"}
                                            size="sm"
                                            className={q.type === "multiple-choice" ? "bg-purple-600 text-white" : ""}
                                            onClick={() =>
                                                updateQuestion(qIdx, {
                                                    type: "multiple-choice",
                                                    // retain existing options if user toggles back-and-forth
                                                })
                                            }
                                        >
                                            Yes — Multiple choice
                                        </Button>
                                    </div>
                                </div>

                                {/* Question text */}
                                <div className="mt-4">
                                    <div className="text-xs text-gray-600 mb-1">Question text</div>
                                    <div className="border border-gray-200 rounded-lg p-2 bg-white">
                                        <MathInput
                                            value={q.questionText}
                                            onChange={(v) => updateQuestion(qIdx, { questionText: v })}
                                            editing={true}
                                            placeholder="Type your question. Use // to create line breaks."
                                            enableTiming={false}
                                        />
                                    </div>
                                </div>

                                {/* Open-ended "correct answer" (optional) */}
                                {q.type === "open-ended" && (
                                    <div className="mt-4">
                                        <div className="text-xs text-gray-600 mb-1">
                                            Ideal / expected answer (optional)
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-2 bg-white">
                                            <MathInput
                                                value={q.correctAnswer}
                                                onChange={(v) => updateQuestion(qIdx, { correctAnswer: v })}
                                                editing={true}
                                                placeholder="Enter an ideal answer or solution steps (optional)"
                                            />
                                        </div>
                                        <div className="mt-1 text-[11px] text-gray-500">
                                            This won’t be enforced by the API for open-ended questions, but it’s useful for graders or future auto-evaluation.
                                        </div>
                                    </div>
                                )}

                                {/* MCQ Options */}
                                {q.type === "multiple-choice" && (
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <ListChecks size={14} />
                                            <span>Options (pick the correct one)</span>
                                        </div>

                                        <div className="mt-2 space-y-2">
                                            {q.options.map((opt, optIdx) => (
                                                <div key={optIdx} className="border rounded-lg p-2 bg-gray-50">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <MathInput
                                                                value={opt}
                                                                onChange={(v) => {
                                                                    const next = [...questions];
                                                                    next[qIdx].options[optIdx] = v;
                                                                    // keep correct in sync if this option was correct
                                                                    if (q.correctAnswer === opt) {
                                                                        next[qIdx].correctAnswer = v;
                                                                    }
                                                                    setQuestions(next);
                                                                    setDirty(true);
                                                                }}
                                                                editing={true}
                                                                placeholder={`Option ${optIdx + 1}`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant={q.correctAnswer === opt ? "default" : "outline"}
                                                                className={q.correctAnswer === opt ? "bg-emerald-600 text-white" : ""}
                                                                onClick={() => setCorrectTo(qIdx, opt)}
                                                            >
                                                                <Check className="mr-1 h-3.5 w-3.5" /> Correct
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-gray-500 hover:text-red-600"
                                                                onClick={() => removeOption(qIdx, optIdx)}
                                                                aria-label={`Remove option ${optIdx + 1}`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIdx)}>
                                                <Plus size={14} className="mr-1" /> Add option
                                            </Button>
                                        </div>

                                        {/* Selected correct */}
                                        {q.correctAnswer && (
                                            <div className="mt-3 text-xs text-emerald-700">
                                                <span className="font-medium">Correct answer saved.</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            className="inline-flex items-center gap-1"
                            onClick={addQuestion}
                        >
                            <Plus size={14} /> Add another question
                        </Button>
                    </div>

                    {/* Footer (mobile) */}
                    <div className="sm:hidden sticky bottom-3 z-20">
                        <div className="mx-auto max-w-sm bg-white shadow-lg rounded-full p-2 flex items-center justify-between border">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const payload: QuizPayloadForAutosave = {
                                        topic_content_id: topicId || "",
                                        lesson_id: lessonId || "",
                                        questions,
                                    };
                                    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
                                    setLastSaved(Date.now());
                                    setDirty(false);
                                    toast({ title: "Draft saved" });
                                }}
                                className="rounded-full"
                            >
                                <Save size={16} className="mr-1" /> Save
                            </Button>
                            <div className="text-xs text-gray-500">{completion}%</div>
                            <Button onClick={handleCreateOrUpsertQuiz} disabled={isSubmitting} className="rounded-full">
                                {isSubmitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Plus size={16} className="mr-1" />
                                )}
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEndLessonQuiz;
