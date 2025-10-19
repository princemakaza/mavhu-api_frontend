import React from "react";
import { X, Plus, Trash2, Edit, ListChecks, Dot, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MathInput from "./MathInput";
import { SubHeadingItem, MCQQuestion } from "./types";

interface QuestionModalProps {
    showQuestionModal: boolean;
    setShowQuestionModal: (show: boolean) => void;
    currentSubHeadingItem: SubHeadingItem | null;
    currentQuestionData: { lessonIndex: number; subHeadingIndex: number };
    updateSubHeadingItem: (lessonIndex: number, subHeadingIndex: number, field: keyof SubHeadingItem, value: any) => void;
    editingStates: { [key: string]: boolean };
    toggleEditing: (fieldPath: string) => void;
    saveMathValue: (fieldPath: string) => void;
    cancelEditing: (fieldPath: string) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
    showQuestionModal,
    setShowQuestionModal,
    currentSubHeadingItem,
    currentQuestionData,
    updateSubHeadingItem,
    editingStates,
    toggleEditing,
    saveMathValue,
    cancelEditing,
}) => {
    if (!showQuestionModal || !currentSubHeadingItem) return null;

    return (
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
                    <Button onClick={() => setShowQuestionModal(false)} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuestionModal;