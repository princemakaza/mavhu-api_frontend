// editContentComponents/QuestionModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, GripVertical, Edit } from "lucide-react";
import { MathInput } from "./MathInput";

interface QuestionModalProps {
  showQuestionModal: boolean;
  setShowQuestionModal: (show: boolean) => void;
  currentSubHeadingItem: any;
  currentQuestionData: { lessonIndex: number; subHeadingIndex: number };
  editingStates: { [key: string]: boolean };
  setEditingStates: (states: any) => void;
  updateSubHeadingItem: (lessonIndex: number, subHeadingIndex: number, field: string, value: any) => void;
  addMcq: () => void;
  removeMcq: (mcqIndex: number) => void;
  updateMcqField: (mcqIndex: number, key: string, value: any) => void;
  addMcqOption: (mcqIndex: number) => void;
  updateMcqOption: (mcqIndex: number, optionIndex: number, value: string) => void;
  removeMcqOption: (mcqIndex: number, optionIndex: number) => void;
  saveQuestion: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  showQuestionModal,
  setShowQuestionModal,
  currentSubHeadingItem,
  currentQuestionData,
  editingStates,
  setEditingStates,
  updateSubHeadingItem,
  addMcq,
  removeMcq,
  updateMcqField,
  addMcqOption,
  updateMcqOption,
  removeMcqOption,
  saveQuestion,
}) => {
  if (!showQuestionModal || !currentSubHeadingItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl mx-4 shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {currentSubHeadingItem.question ? "Edit Q&A / MCQs" : "Add Q&A / MCQs"}
          </h3>
          <button onClick={() => setShowQuestionModal(false)} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "75vh" }}>
          {/* Question */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-gray-600">Main Question (optional)</label>
            <div className="border border-gray-200 rounded-lg p-2 bg-white">
              {editingStates[`question_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`] ? (
                <MathInput
                  value={currentSubHeadingItem.question}
                  onChange={(v) => updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "question", v)}
                  editing={true}
                  onSave={() => setEditingStates((p: any) => ({ ...p, [`question_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                  onCancel={() => setEditingStates((p: any) => ({ ...p, [`question_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <MathInput value={currentSubHeadingItem.question} editing={false} placeholder="Click edit to add question" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500"
                    onClick={() => setEditingStates((p: any) => ({ ...p, [`question_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: true }))}>
                    <Edit size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Expected Answer */}
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-gray-600">Expected Answer (optional)</label>
            <div className="border border-gray-200 rounded-lg p-2 bg-white">
              {editingStates[`expectedAnswer_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`] ? (
                <MathInput
                  value={currentSubHeadingItem.expectedAnswer}
                  onChange={(v) => updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "expectedAnswer", v)}
                  editing={true}
                  onSave={() => setEditingStates((p: any) => ({ ...p, [`expectedAnswer_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                  onCancel={() => setEditingStates((p: any) => ({ ...p, [`expectedAnswer_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <MathInput value={currentSubHeadingItem.expectedAnswer} editing={false} placeholder="Click edit to add expected answer" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500"
                    onClick={() => setEditingStates((p: any) => ({ ...p, [`expectedAnswer_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: true }))}>
                    <Edit size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Hint */}
          <div className="space-y-2 mb-6">
            <label className="text-xs font-medium text-gray-600">Hint (optional)</label>
            <div className="border border-gray-200 rounded-lg p-2 bg-white">
              {editingStates[`hint_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`] ? (
                <MathInput
                  value={currentSubHeadingItem.hint}
                  onChange={(v) => updateSubHeadingItem(currentQuestionData.lessonIndex, currentQuestionData.subHeadingIndex, "hint", v)}
                  editing={true}
                  onSave={() => setEditingStates((p: any) => ({ ...p, [`hint_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                  onCancel={() => setEditingStates((p: any) => ({ ...p, [`hint_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: false }))}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <MathInput value={currentSubHeadingItem.hint} editing={false} placeholder="Click edit to add hint" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500"
                    onClick={() => setEditingStates((p: any) => ({ ...p, [`hint_modal_${currentQuestionData.lessonIndex}_${currentQuestionData.subHeadingIndex}`]: true }))}>
                    <Edit size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* MCQ Builder */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800">Multiple Choice Questions</h4>
            <Button variant="outline" size="sm" onClick={addMcq} className="bg-blue-600 text-white border-0 hover:bg-blue-700">
              <Plus size={14} className="mr-1" /> Add MCQ
            </Button>
          </div>

          {(!currentSubHeadingItem.mcqQuestions || currentSubHeadingItem.mcqQuestions.length === 0) && (
            <div className="text-sm text-gray-500 mb-4">No MCQs yet. Click "Add MCQ" to create one.</div>
          )}

          <div className="space-y-4">
            {(currentSubHeadingItem.mcqQuestions || []).map((mcq: any, mcqIndex: number) => (
              <div key={mcq._id || mcqIndex} className="border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">MCQ {mcqIndex + 1}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMcq(mcqIndex)} className="text-red-500 h-7 w-7">
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="p-3 space-y-3">
                  {/* MCQ Question */}
                  <div>
                    <label className="text-xs font-medium text-gray-600">Question</label>
                    <div className="mt-1 border rounded bg-white p-2">
                      <MathInput
                        value={mcq.question}
                        editing={true}
                        onChange={(v) => updateMcqField(mcqIndex, "question", v)}
                        onSave={() => { }}
                        onCancel={() => { }}
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-600">Options</label>
                      <Button variant="outline" size="sm" onClick={() => addMcqOption(mcqIndex)} className="h-7 px-2">
                        <Plus size={14} className="mr-1" /> Add Option
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {mcq.options.map((opt: string, oi: number) => {
                        const isCorrect = mcq.correctAnswer === opt && opt !== "";
                        return (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`mcq-${mcqIndex}-correct`}
                              className="h-4 w-4 cursor-pointer"
                              checked={isCorrect}
                              onChange={() => updateMcqField(mcqIndex, "correctAnswer", opt)}
                              title="Mark as correct answer"
                            />
                            <Input
                              value={opt}
                              onChange={(e) => updateMcqOption(mcqIndex, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removeMcqOption(mcqIndex, oi)}
                              disabled={mcq.options.length <= 1}
                              title="Remove option"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      Select the radio next to the correct option. Changing an option text will keep the selection if it still matches.
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="text-xs font-medium text-gray-600">Explanation (optional)</label>
                    <Input
                      value={mcq.explanation || ""}
                      onChange={(e) => updateMcqField(mcqIndex, "explanation", e.target.value)}
                      placeholder="Brief explanation to show after answering"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-white sticky bottom-0 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowQuestionModal(false)} className="border-2 border-gray-300 hover:border-gray-400">
            Cancel
          </Button>
          <Button onClick={saveQuestion} className="bg-blue-600 text-white border-0 hover:bg-blue-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};