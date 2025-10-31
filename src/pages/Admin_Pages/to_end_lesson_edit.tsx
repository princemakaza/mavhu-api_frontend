import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import MathInput from "./createContentComponent/MathInput";
import {
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  ListChecks,
  HelpCircle,
  Radio,
  Check,
  RefreshCw,
} from "lucide-react";
import EndLessonQuestionService from "@/services/Admin_Service/end_lesson_question_service";

// Types
export type QuestionType = "open-ended" | "multiple-choice";
export interface QuizQuestion {
  _id?: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string; // MCQ: required; Open-ended: optional (UI now supports entering this)
}

interface LessonScopedAutosave {
  topic_content_id: string;
  lesson_id: string;
  quizId: string | null;           // informational only
  topicTitle: string;
  questions: QuizQuestion[];
}

// ------------------------------
// Shimmer / Skeleton UI
// ------------------------------
const LoadingScaffold: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        {/* Sticky Header (skeleton) */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100">
                <ChevronLeft size={18} className="mr-1" />
                Back
              </Button>
              <div className="h-4 w-px bg-gray-2 00" />
              <div className="hidden md:block">
                <div className="inline-flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-44 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full animate-pulse bg-gray-300 w-1/2" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Main skeleton cards */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Intro card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-600"><HelpCircle size={18} /></div>
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>

              <div className="mt-3">
                <div className="inline-flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <Radio size={14} /><span>Is this a multiple-choice question?</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-36 rounded-md" />
                  <Skeleton className="h-8 w-40 rounded-md" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>

              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-52" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}

          {/* Mobile footer stub */}
          <div className="sm:hidden sticky bottom-3 z-20">
            <div className="mx-auto max-w-sm bg-white shadow-lg rounded-full p-2 flex items-center justify-between border">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToEditEndLesson: React.FC = () => {
  const { topicId, lessonId } = useParams<{ topicId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // autosave key now includes BOTH ids
  const AUTOSAVE_KEY = `QUIZ_EDIT_AUTOSAVE_${topicId || "unknown"}_${lessonId || "unknown"}`;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // quizId kept only for context; updates use lesson-scoped routes
  const [quizId, setQuizId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Restore autosave first
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as LessonScopedAutosave;
        if (
          parsed.topic_content_id === (topicId || "") &&
          parsed.lesson_id === (lessonId || "")
        ) {
          setQuizId(parsed.quizId || null);
          setTopicTitle(parsed.topicTitle || "");
          setQuestions(Array.isArray(parsed.questions) ? parsed.questions : []);
          setLoading(false);
          return; // defer fetching to user if they want fresh
        }
      } catch { }
    }
    // Otherwise fetch from API
    fetchFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, lessonId]);

  const fetchFromServer = async () => {
    if (!topicId || !lessonId) return;
    setLoading(true);
    try {
      // LESSON-SCOPED GET
      const res = await EndLessonQuestionService.getQuizByContentAndLesson(topicId, lessonId);
      // Expecting { success, data }
      const qdoc = res?.data;
      if (!qdoc) {
        setQuestions([{ questionText: "", type: "open-ended", options: [], correctAnswer: "" }]);
        setQuizId(null);
        setTopicTitle("");
        toast({
          title: "No quiz found for this lesson",
          description: "Create one from scratch and save to persist.",
          duration: 1000, // show for 1 second
        });
      } else {
        setQuizId(qdoc._id || null);
        setTopicTitle(qdoc.topic_content_id?.title || "");
        const qs: QuizQuestion[] = (qdoc.questions || []).map((item: any) => ({
          _id: item._id,
          questionText: item.questionText || "",
          type: item.type || "open-ended",
          options: Array.isArray(item.options) ? item.options : [],
          correctAnswer: item.correctAnswer || "", // will be blank for open-ended in DB, OK
        }));
        setQuestions(qs.length ? qs : [{ questionText: "", type: "open-ended", options: [], correctAnswer: "" }]);
      }
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message || "Failed to retrieve quiz";
      toast({
        variant: "destructive",
        title: "Error",
        description: msg,
        duration: 1000, // show for 1 second
      });
    } finally {
      setLoading(false);
    }
  };

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      if (!dirty) return;
      const payload: LessonScopedAutosave = {
        topic_content_id: topicId || "",
        lesson_id: lessonId || "",
        quizId,
        topicTitle,
        questions,
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
      setLastSaved(Date.now());
      setDirty(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [dirty, questions, quizId, topicTitle, AUTOSAVE_KEY, topicId, lessonId]);

  // Unsaved guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        (e as any).returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const completion = useMemo(() => {
    const total = Math.max(1, questions.length);
    const done = questions.filter((q) => q.questionText.trim()).length;
    const pct = Math.round((done / total) * 100);
    return isNaN(pct) ? 0 : pct;
  }, [questions]);

  // Helpers
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
    const removed = next[qIdx].options[optIdx];
    next[qIdx].options.splice(optIdx, 1);
    const correct = next[qIdx].correctAnswer;
    const stillExists = next[qIdx].options.includes(correct);
    updateQuestion(qIdx, { options: next[qIdx].options, correctAnswer: stillExists ? correct : "" });
  };
  const setCorrectTo = (qIdx: number, value: string) => updateQuestion(qIdx, { correctAnswer: value });

  // Validation
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
        if (q.correctAnswer && !opts.includes(q.correctAnswer)) errs.push(`Q${i + 1}: correct answer must match one of the options.`);
      }
      // open-ended correctAnswer remains optional
    });
    return errs;
  };

  // Submit (Lesson-scoped Update)
  const handleUpdate = async () => {
    const errors = validate();
    if (errors.length) {
      toast({
        variant: "destructive",
        title: "Please fix these first",
        description: errors.join(" • "),
        duration: 3000, // show for 3 seconds
      });
      return;
    }
    try {
      setIsSubmitting(true);

      // Map questions; keep open-ended correctAnswer (optional)
      const body = {
        questions: questions.map((q) => ({
          _id: q._id, // if your API ignores this, it’s fine; helpful for server-side mapping
          questionText: q.questionText,
          type: q.type,
          options: q.type === "multiple-choice" ? q.options : [],
          correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : (q.correctAnswer || ""),
        })),
      };

      // LESSON-SCOPED UPDATE: PUT /content/:topicContentId/lesson/:lessonId
      await EndLessonQuestionService.updateQuizByContentAndLesson(topicId!, lessonId!, body);

      // clean up
      localStorage.removeItem(AUTOSAVE_KEY);
      setDirty(false);
      toast({ title: "Quiz updated", description: "Changes have been saved for this lesson." });
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message || "Failed to update quiz";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScaffold />;
  }

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
                  const payload: LessonScopedAutosave = {
                    topic_content_id: topicId || "",
                    lesson_id: lessonId || "",
                    quizId,
                    topicTitle,
                    questions,
                  };
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({
                    title: "Draft saved",
                    description: "You can safely come back later.",
                    duration: 1000, // show for 1 second
                  });
                }}
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Save size={16} className="mr-1" /> Save draft
              </Button>
              <Button onClick={fetchFromServer} variant="outline" className="hidden sm:inline-flex">
                <RefreshCw size={16} className="mr-1" /> Refresh
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isSubmitting || !topicId || !lessonId}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Updating…</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><ListChecks size={16} /> Update Quiz</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Intro */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-600"><HelpCircle size={18} /></div>
              <div className="text-sm text-gray-700">
                <div className="font-medium">Edit end-lesson quiz</div>
         
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-200 transition shadow-sm p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm">{qIdx + 1}</div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">Question</div>
                      <div className="text-sm font-medium text-gray-800">{q.type === "multiple-choice" ? "Multiple choice" : "Open-ended"}</div>
                    </div>
                  </div>
                  {questions.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="text-gray-500 hover:text-red-600" onClick={() => removeQuestion(qIdx)} aria-label={`Remove question ${qIdx + 1}`}>
                      <Trash2 size={18} />
                    </Button>
                  )}
                </div>

                {/* Choose type */}
                <div className="mt-3">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-600 mb-1"><Radio size={14} /><span>Is this a multiple-choice question?</span></div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={q.type === "open-ended" ? "default" : "outline"}
                      size="sm"
                      className={q.type === "open-ended" ? "bg-blue-600 text-white" : ""}
                      onClick={() =>
                        updateQuestion(qIdx, {
                          type: "open-ended",
                          options: [],
                          // keep any previously typed open-ended correctAnswer
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
                          // retain existing options if toggling back
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

                {/* Open-ended: ideal/expected answer (optional) */}
                {q.type === "open-ended" && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-600 mb-1">Ideal / expected answer (optional)</div>
                    <div className="border border-gray-200 rounded-lg p-2 bg-white">
                      <MathInput
                        value={q.correctAnswer}
                        onChange={(v) => updateQuestion(qIdx, { correctAnswer: v })}
                        editing={true}
                        placeholder="Enter an ideal answer or solution steps (optional)"
                      />
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500">
                      This is optional for open-ended questions. It is stored and can help graders or future auto-evaluation.
                    </div>
                  </div>
                )}

                {/* MCQ Options */}
                {q.type === "multiple-choice" && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600"><ListChecks size={14} /><span>Options (pick the correct one)</span></div>
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
                                  if (q.correctAnswer === opt) next[qIdx].correctAnswer = v; // keep correct in sync
                                  setQuestions(next);
                                  setDirty(true);
                                }}
                                editing={true}
                                placeholder={`Option ${optIdx + 1}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button type="button" size="sm" variant={q.correctAnswer === opt ? "default" : "outline"} className={q.correctAnswer === opt ? "bg-emerald-600 text-white" : ""} onClick={() => setCorrectTo(qIdx, opt)}>
                                <Check className="mr-1 h-3.5 w-3.5" /> Correct
                              </Button>
                              <Button type="button" size="icon" variant="ghost" className="text-gray-500 hover:text-red-600" onClick={() => removeOption(qIdx, optIdx)} aria-label={`Remove option ${optIdx + 1}`}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIdx)}><Plus size={14} className="mr-1" /> Add option</Button>
                    </div>
                    {q.correctAnswer && <div className="mt-3 text-xs text-emerald-700"><span className="font-medium">Correct answer saved.</span></div>}
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="secondary" className="inline-flex items-center gap-1" onClick={addQuestion}><Plus size={14} /> Add another question</Button>
          </div>

          {/* Footer (mobile) */}
          <div className="sm:hidden sticky bottom-3 z-20">
            <div className="mx-auto max-w-sm bg-white shadow-lg rounded-full p-2 flex items-center justify-between border">
              <Button
                variant="outline"
                onClick={() => {
                  const payload: LessonScopedAutosave = {
                    topic_content_id: topicId || "",
                    lesson_id: lessonId || "",
                    quizId,
                    topicTitle,
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
              <Button onClick={handleUpdate} disabled={isSubmitting || !topicId || !lessonId} className="rounded-full">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ListChecks size={16} className="mr-1" />}
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToEditEndLesson;
