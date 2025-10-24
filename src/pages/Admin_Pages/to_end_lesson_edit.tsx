import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton"; // ⬅️ added
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
  _id?: string; // existing questions carry _id
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
}
interface QuizPayload {
  topic_content_id: string;
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
              <div className="h-4 w-px bg-gray-200" />
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

          {[0,1,2].map((i) => (
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
                  <Radio size={14} /><span>Is this a multiple‑choice question?</span>
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
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const AUTOSAVE_KEY = `QUIZ_EDIT_AUTOSAVE_${topicId || "unknown"}`;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  const [quizId, setQuizId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Restore autosave first
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { quizId: string | null; topicTitle: string; questions: QuizQuestion[] };
        setQuizId(parsed.quizId || null);
        setTopicTitle(parsed.topicTitle || "");
        setQuestions(Array.isArray(parsed.questions) ? parsed.questions : []);
        setLoading(false);
        return; // defer fetching to user if they want fresh
      } catch {}
    }
    // Otherwise fetch from API
    fetchFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const fetchFromServer = async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await EndLessonQuestionService.getQuizzesByContentId(topicId);
      // Expecting { success, data: [ ... ], count }
      const arr = Array.isArray(res?.data) ? res.data : [];
      if (!arr.length) {
        setQuestions([
          { questionText: "", type: "open-ended", options: [], correctAnswer: "" },
        ]);
        setQuizId(null);
        setTopicTitle("");
        toast({ title: "No quiz found", description: "Create one from scratch and save to persist." });
      } else {
        // take the first quiz (or you could add a selector if multiple)
        const q = arr[0];
        setQuizId(q._id);
        setTopicTitle(q.topic_content_id?.title || "");
        const qs: QuizQuestion[] = (q.questions || []).map((item: any) => ({
          _id: item._id,
          questionText: item.questionText || "",
          type: item.type || "open-ended",
          options: Array.isArray(item.options) ? item.options : [],
          correctAnswer: item.correctAnswer || "",
        }));
        setQuestions(qs.length ? qs : [{ questionText: "", type: "open-ended", options: [], correctAnswer: "" }]);
      }
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message || "Failed to retrieve quiz";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  // Autosave
  useEffect(() => {
    const t = setTimeout(() => {
      if (!dirty) return;
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({ quizId, topicTitle, questions })
      );
      setLastSaved(Date.now());
      setDirty(false);
    }, 1200);
    return () => clearTimeout(t);
  }, [dirty, questions, quizId, topicTitle, AUTOSAVE_KEY]);

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
    if (!quizId) errs.push("No quiz selected to update (fetch first).");
    questions.forEach((q, i) => {
      if (!q.questionText.trim()) errs.push(`Q${i + 1}: question text is required.`);
      if (q.type === "multiple-choice") {
        const opts = q.options.map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) errs.push(`Q${i + 1}: provide at least two options.`);
        if (!q.correctAnswer.trim()) errs.push(`Q${i + 1}: select the correct answer.`);
        if (q.correctAnswer && !opts.includes(q.correctAnswer)) errs.push(`Q${i + 1}: correct answer must match one of the options.`);
      }
    });
    return errs;
  };

  // Submit (Update)
  const handleUpdate = async () => {
    const errors = validate();
    if (errors.length) {
      toast({ variant: "destructive", title: "Please fix these first", description: errors.join(" • ") });
      return;
    }
    try {
      setIsSubmitting(true);
      const payload: QuizPayload = {
        topic_content_id: topicId!,
        questions: questions.map((q) => ({
          _id: q._id, // include if present
          questionText: q.questionText,
          type: q.type,
          options: q.type === "multiple-choice" ? q.options : [],
          correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : "",
        })),
      } as any;

      await EndLessonQuestionService.updateQuiz(quizId!, payload);

      localStorage.removeItem(AUTOSAVE_KEY);
      setDirty(false);
      toast({ title: "Quiz updated", description: "Changes have been saved." });
    } catch (e: any) {
      const msg = typeof e === "string" ? e : e?.message || "Failed to update quiz";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScaffold />; // ⬅️ shimmer while loading
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
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ quizId, topicTitle, questions }));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({ title: "Draft saved", description: "You can safely come back later." });
                }}
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Save size={16} className="mr-1" /> Save draft
              </Button>
              <Button onClick={fetchFromServer} variant="outline" className="hidden sm:inline-flex">
                <RefreshCw size={16} className="mr-1" /> Refresh
              </Button>
              <Button onClick={handleUpdate} disabled={isSubmitting || !quizId} className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
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
                <div className="font-medium">Edit end‑lesson quiz</div>
                <p className="mt-1 text-gray-600">Topic: <span className="font-medium">{topicTitle || "(untitled)"}</span></p>
                <p className="mt-1 text-gray-600">Questions support LaTeX through <code>MathInput</code>. Switch between open‑ended and multiple‑choice below.</p>
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
                      <div className="text-sm font-medium text-gray-800">{q.type === "multiple-choice" ? "Multiple choice" : "Open‑ended"}</div>
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
                  <div className="inline-flex items-center gap-2 text-xs text-gray-600 mb-1"><Radio size={14} /><span>Is this a multiple‑choice question?</span></div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={q.type === "open-ended" ? "default" : "outline"}
                      size="sm"
                      className={q.type === "open-ended" ? "bg-blue-600 text-white" : ""}
                      onClick={() => updateQuestion(qIdx, { type: "open-ended", options: [], correctAnswer: "" })}
                    >
                      No — Open‑ended
                    </Button>
                    <Button
                      variant={q.type === "multiple-choice" ? "default" : "outline"}
                      size="sm"
                      className={q.type === "multiple-choice" ? "bg-purple-600 text-white" : ""}
                      onClick={() => updateQuestion(qIdx, { type: "multiple-choice" })}
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
                  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ quizId, topicTitle, questions }));
                  setLastSaved(Date.now());
                  setDirty(false);
                  toast({ title: "Draft saved" });
                }}
                className="rounded-full"
              >
                <Save size={16} className="mr-1" /> Save
              </Button>
              <div className="text-xs text-gray-500">{completion}%</div>
              <Button onClick={handleUpdate} disabled={isSubmitting || !quizId} className="rounded-full">
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

/* -----------------------------------------
   ROUTING / NAVIGATION
   -----------------------------------------

1) Route (React Router v6)

<Route path="/topics/:topicId/quiz/edit" element={<ToEditEndLesson />} />

2) Navigate from anywhere (with topicId in scope)

<Button onClick={() => navigate(`/topics/${topicId}/quiz/edit`)} variant="outline">
  Edit end‑lesson quiz
</Button>

3) From CreateNewContent, add a link near your quiz creation link

<Link to={`/topics/${topicId}/quiz/edit`} className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
  <RefreshCw className="h-4 w-4" /> Edit existing quiz
</Link>

4) Data flow
- On mount, the component calls EndLessonQuestionService.getQuizzesByContentId(topicId).
- It selects the first quiz in the response, mapping questions to local state (preserving each question's _id).
- Edits are made in place; you can add/remove/toggle MCQ vs open‑ended.
- On Update, it PUTs to updateQuiz(quizId, { topic_content_id, questions:[ { _id, questionText, type, options, correctAnswer } ] }).
- Open‑ended questions send empty options/correctAnswer.
*/
