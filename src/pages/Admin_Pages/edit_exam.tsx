import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, X, ChevronLeft, Check, Edit, Save, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { MathfieldElement } from "mathlive";
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";
import ExamService from "@/services/Admin_Service/exams_services";
import Sidebar from "@/components/Sidebar";

interface Topic {
    _id: string;
    title: string;
    description: string;
    subjectName: string;
    subject: {
        _id: string;
        subjectName: string;
        imageUrl: string;
        Level: string;
        showSubject: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    showTopic: boolean;
    price: number;
    regularPrice: number;
    subscriptionPeriod: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface Question {
    questionText: string;
    options: string[];
    correctAnswer: string;
    correctAnswerExplanation: string;
    _id?: string;
}

interface ExamFormData {
    _id?: string;
    subject: string;
    Topic: string;
    level: string;
    title: string;
    durationInMinutes: number;
    questions: Question[];
    isPublished: boolean;
}

const extractLatexFromText = (text: string): string => {
    if (!text) return "";
    if (text.startsWith("\\(") && text.endsWith("\\)")) {
        return text.substring(2, text.length - 2);
    }
    return text;
};

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

    useEffect(() => {
        if (!containerRef.current) return;

        if (!mathfieldRef.current) {
            const mf = new MathfieldElement();
            mathfieldRef.current = mf;

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

            mf.style.width = "100%";
            mf.style.minHeight = !editing ? "auto" : "60px";
            mf.style.padding = !editing ? "0" : "8px";
            mf.style.border = !editing ? "none" : "1px solid #d1d5db";
            mf.style.borderRadius = "6px";
            mf.style.backgroundColor = !editing ? "transparent" : "#fff";

            if (!editing) {
                mf.style.pointerEvents = "none";
                mf.style.cursor = "default";
            }

            mf.addEventListener("input", (evt) => {
                if (!editing) return;
                ignoreNextChange.current = true;
                onChange(`\\(${(evt.target as MathfieldElement).value}\\)`);
            });

            containerRef.current.appendChild(mf);
        }

        const unwrappedValue = extractLatexFromText(value || "");
        if (mathfieldRef.current.value !== unwrappedValue) {
            mathfieldRef.current.value = unwrappedValue;
        }

        mathfieldRef.current.setOptions({ readOnly: !editing });
        mathfieldRef.current.style.pointerEvents = editing ? "auto" : "none";
        mathfieldRef.current.style.backgroundColor = editing ? "#fff" : "transparent";
        mathfieldRef.current.style.minHeight = editing ? "60px" : "auto";
        mathfieldRef.current.style.padding = editing ? "8px" : "0";
        mathfieldRef.current.style.border = editing ? "1px solid #d1d5db" : "none";

        return () => {
            if (mathfieldRef.current) {
                mathfieldRef.current.remove();
                mathfieldRef.current = null;
            }
        };
    }, [editing]);

    useEffect(() => {
        if (!mathfieldRef.current || ignoreNextChange.current) {
            ignoreNextChange.current = false;
            return;
        }

        const unwrappedValue = extractLatexFromText(value || "");
        if (mathfieldRef.current.value !== unwrappedValue) {
            mathfieldRef.current.value = unwrappedValue;
        }
    }, [value]);

    return (
        <div className={`relative ${className}`}>
            <div ref={containerRef} />
            {editing && (
                <div className="flex justify-end gap-2 mt-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onCancel}
                        className="h-8 px-3"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSave}
                        className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white"
                    >
                        <Check size={14} className="mr-1" />
                        Save
                    </Button>
                </div>
            )}
            {!value && !editing && (
                <div className="text-gray-400 italic text-sm">{placeholder}</div>
            )}
        </div>
    );
};

// Shimmer loading component
const ShimmerLoader: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-gray-100 flex">
            {/* Sidebar Shimmer */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:block animate-pulse">
                <div className="h-16 bg-gray-200"></div>
                <div className="p-4 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-8 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>

            {/* Main Content Shimmer */}
            <div className="flex-1 p-6">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-lg mb-6">
                    <div className="h-8 bg-blue-500 rounded w-1/4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="mb-6 p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                        <div className="h-10 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                ))}
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const EditExam: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingExam, setLoadingExam] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    const [examData, setExamData] = useState<ExamFormData>({
        subject: "",
        Topic: "",
        level: "",
        title: "",
        durationInMinutes: 60,
        questions: [
            {
                questionText: "",
                options: [""],
                correctAnswer: "",
                correctAnswerExplanation: "",
            },
        ],
        isPublished: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingStates, setEditingStates] = useState<{
        [key: string]: boolean;
    }>({});

    // Update screen size state and handle sidebar visibility
    useEffect(() => {
        const checkScreenSize = () => {
            const isLarge = window.innerWidth >= 768;
            setIsLargeScreen(isLarge);
            setSidebarOpen(isLarge);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Toggle sidebar function
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingTopics(true);
                setLoadingExam(true);

                const topicsResponse = await TopicInSubjectService.getAllTopics();
                setTopics(topicsResponse.data);

                if (examId) {
                    const examResponse = await ExamService.getExamById(examId);
                    const exam = examResponse.data;

                    const formattedExam = {
                        _id: exam._id,
                        subject: exam.subject._id,
                        Topic: exam.Topic._id,
                        level: exam.level,
                        title: exam.title,
                        durationInMinutes: exam.durationInMinutes,
                        questions: exam.questions.map(q => ({
                            questionText: q.questionText,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            correctAnswerExplanation: q.correctAnswerExplanation || "", // Add explanation
                            _id: q._id
                        })),
                        isPublished: exam.isPublished || false
                    };

                    setExamData(formattedExam);

                    const topic = topicsResponse.data.find(t => t._id === exam.Topic._id);
                    if (topic) {
                        setSelectedTopic(topic);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch exam data. Please try again.",
                });
                navigate(-1);
            } finally {
                setLoadingTopics(false);
                setLoadingExam(false);
            }
        };

        fetchData();
    }, [examId, toast, navigate]);

    const toggleEditing = (fieldPath: string) => {
        setEditingStates((prev) => ({
            ...prev,
            [fieldPath]: !prev[fieldPath],
        }));
    };

    const saveMathValue = (fieldPath: string) => {
        setEditingStates((prev) => ({
            ...prev,
            [fieldPath]: false,
        }));
    };

    const cancelEditing = (fieldPath: string) => {
        setEditingStates((prev) => ({
            ...prev,
            [fieldPath]: false,
        }));
    };

    const getFieldPath = (
        questionIndex: number,
        optionIndex: number | null,
        fieldName: string
    ) => {
        if (optionIndex === null) {
            return `question_${questionIndex}_${fieldName}`;
        }
        return `question_${questionIndex}_option_${optionIndex}_${fieldName}`;
    };

    const handleTopicChange = (topicId: string) => {
        const topic = topics.find(t => t._id === topicId);
        if (topic) {
            setSelectedTopic(topic);
            setExamData(prev => ({
                ...prev,
                Topic: topic._id,
                subject: topic.subject._id,
                level: topic.subject.Level
            }));
        }
    };

    const addQuestion = () => {
        setExamData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    questionText: "",
                    options: [""],
                    correctAnswer: "",
                    correctAnswerExplanation: "",
                },
            ],
        }));
    };

    const removeQuestion = (index: number) => {
        if (examData.questions.length > 1) {
            setExamData((prev) => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index),
            }));
        }
    };

    const addOption = (questionIndex: number) => {
        const updatedQuestions = [...examData.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options: [...updatedQuestions[questionIndex].options, ""],
        };
        setExamData({
            ...examData,
            questions: updatedQuestions,
        });
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        if (examData.questions[questionIndex].options.length > 1) {
            const updatedQuestions = [...examData.questions];
            const updatedOptions = [
                ...updatedQuestions[questionIndex].options,
            ].filter((_, i) => i !== optionIndex);

            updatedQuestions[questionIndex] = {
                ...updatedQuestions[questionIndex],
                options: updatedOptions,
            };

            setExamData({
                ...examData,
                questions: updatedQuestions,
            });
        }
    };

    const updateQuestionField = (
        questionIndex: number,
        field: keyof Question,
        value: string
    ) => {
        const updatedQuestions = [...examData.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            [field]: value,
        };
        setExamData({
            ...examData,
            questions: updatedQuestions,
        });
    };

    const updateOption = (
        questionIndex: number,
        optionIndex: number,
        value: string
    ) => {
        const updatedQuestions = [...examData.questions];
        const updatedOptions = [...updatedQuestions[questionIndex].options];
        updatedOptions[optionIndex] = value;
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options: updatedOptions,
        };
        setExamData({
            ...examData,
            questions: updatedQuestions,
        });
    };

    const handleUpdateExam = async () => {
        try {
            setIsSubmitting(true);

            if (!examData.subject.trim()) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Subject",
                    description: "Please provide a subject before continuing.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            if (!examData.Topic.trim()) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Topic",
                    description: "Please provide a topic before continuing.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            if (!examData.title.trim()) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Invalid Duration",
                    description: "Please enter a duration greater than 0.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            if (examData.durationInMinutes <= 0) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Invalid Duration",
                    description: "Please enter a duration greater than 0.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            const questionErrors: number[] = [];
            examData.questions.forEach((question, index) => {
                if (!question.questionText.trim()) {
                    questionErrors.push(index + 1);
                }

                if (!question.correctAnswer.trim()) {
                    const t = toast({
                        variant: "destructive",
                        title: "Oops! Missing Correct Answer",
                        description: `Please provide a correct answer for question ${index + 1}.`,
                        duration: 8000,
                        action: (
                            <Button
                                variant="secondary"
                                className="bg-white text-red-600 hover:bg-red-100"
                                onClick={() => t.dismiss()} // dismiss the toast safely
                            >
                                Dismiss
                            </Button>
                        ),
                    });

                    return;
                }

                if (!question.options.includes(question.correctAnswer)) {
                    const t = toast({
                        variant: "destructive",
                        title: "Oops! Invalid Correct Answer",
                        description: `Please ensure the correct answer for question ${index + 1} matches one of the provided options.`,
                        duration: 8000,
                        action: (
                            <Button
                                variant="secondary"
                                className="bg-white text-red-600 hover:bg-red-100"
                                onClick={() => t.dismiss()} // dismiss the toast safely
                            >
                                Dismiss
                            </Button>
                        ),
                    });

                    return;
                }
            });

            if (questionErrors.length > 0) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Question Text",
                    description: `Please provide text for the following questions: ${questionErrors.join(", ")}`,
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            const optionErrors: { question: number; option: number }[] = [];
            examData.questions.forEach((question, questionIndex) => {
                question.options.forEach((option, optionIndex) => {
                    if (!option.trim()) {
                        optionErrors.push({
                            question: questionIndex + 1,
                            option: optionIndex + 1,
                        });
                    }
                });
            });

            if (optionErrors.length > 0) {
                const errorList = optionErrors
                    .map(
                        (err) => `Question ${err.question} Option ${err.option}`
                    )
                    .join(", ");
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Option Text",
                    description: `Please provide option text for the following: ${errorList}`,
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

                return;
            }

            const response = await ExamService.updateExam(examData._id!, examData);
            console.log("Exam updated successfully:", response.message);
            if (response.message === "Exam updated successfully") {
                const t = toast({
                    title: "✅ Exam Updated Successfully",
                    description: "The exam has been updated and is ready to use.",
                    variant: "default",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Got it
                        </Button>
                    ),
                });

                navigate(-1);
            } else {
                throw new Error(`Unexpected status: ${response.status}`);
            }

        } catch (error) {
            console.error("Failed to update exam:", error);
            const t = toast({
                variant: "destructive",
                title: "Oops! Couldn't Update Exam",
                description: "We couldn't update the exam right now. Please try again.",
                duration: 8000,
                action: (
                    <Button
                        variant="secondary"
                        className="bg-white text-red-600 hover:bg-red-100"
                        onClick={() => t.dismiss()} // dismiss the toast safely
                    >
                        Dismiss
                    </Button>
                ),
            });

        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingExam) {
        return <ShimmerLoader />;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md"
                onClick={toggleSidebar}
            >
                {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div
                className={`
                    ${sidebarOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0"
                    } 
                    transition-all duration-300 ease-in-out 
                    fixed md:relative z-40 md:z-auto w-64
                `}
            >
                <Sidebar />
            </div>

            {/* Backdrop Overlay for Mobile */}
            {sidebarOpen && !isLargeScreen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 w-full">
                <div className="w-full">
                        <div className="relative p-4 md:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="text-white hover:bg-white/20"
                            >
                                <ChevronLeft size={20} className="mr-2" />
                                Back
                            </Button>
                            <div className="text-center flex-1">
                                <h1 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Edit size={24} className="text-white" />
                                    </div>
                                    Edit Exam
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Topic
                                    </label>
                                    {loadingTopics ? (
                                        <Input
                                            value="Loading topics..."
                                            readOnly
                                            className="w-full bg-gray-100"
                                        />
                                    ) : (
                                        <select
                                            value={examData.Topic}
                                            onChange={(e) => handleTopicChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select a topic</option>
                                            {topics.map((topic) => (
                                                <option key={topic._id} value={topic._id}>
                                                    {topic.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {selectedTopic && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject
                                            </label>
                                            <Input
                                                value={selectedTopic.subject.subjectName}
                                                readOnly
                                                className="w-full bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Level
                                            </label>
                                            <Input
                                                value={selectedTopic.subject.Level}
                                                readOnly
                                                className="w-full bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Exam Title
                                    </label>
                                    <Input
                                        value={examData.title}
                                        onChange={(e) =>
                                            setExamData({ ...examData, title: e.target.value })
                                        }
                                        placeholder="Enter exam title"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <Input
                                        type="number"
                                        value={examData.durationInMinutes}
                                        onChange={(e) =>
                                            setExamData({
                                                ...examData,
                                                durationInMinutes: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className="w-full"
                                        min="1"
                                    />
                                </div>

                                <div className="flex items-center mt-4">
                                    <input
                                        id="published-checkbox"
                                        type="checkbox"
                                        checked={examData.isPublished}
                                        onChange={(e) =>
                                            setExamData({
                                                ...examData,
                                                isPublished: e.target.checked,
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="published-checkbox"
                                        className="ml-2 block text-sm text-gray-700"
                                    >
                                        Publish immediately
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
                                <Button
                                    onClick={addQuestion}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                >
                                    <Plus size={16} className="mr-1" />
                                    Add Question
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {examData.questions.map((question, questionIndex) => (
                                    <div
                                        key={question._id || questionIndex}
                                        className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {questionIndex + 1}
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    Question {questionIndex + 1}
                                                </h3>
                                            </div>
                                            {examData.questions.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-500"
                                                    onClick={() => removeQuestion(questionIndex)}
                                                >
                                                    <X size={18} />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Question Text
                                            </label>
                                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                {editingStates[
                                                    getFieldPath(questionIndex, null, "questionText")
                                                ] ? (
                                                    <MathInput
                                                        value={question.questionText}
                                                        onChange={(value) =>
                                                            updateQuestionField(
                                                                questionIndex,
                                                                "questionText",
                                                                value
                                                            )
                                                        }
                                                        editing={true}
                                                        onSave={() =>
                                                            saveMathValue(
                                                                getFieldPath(questionIndex, null, "questionText")
                                                            )
                                                        }
                                                        onCancel={() =>
                                                            cancelEditing(
                                                                getFieldPath(questionIndex, null, "questionText")
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <MathInput
                                                                value={question.questionText}
                                                                editing={false}
                                                                placeholder="Click edit to add question"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-blue-500"
                                                            onClick={() =>
                                                                toggleEditing(
                                                                    getFieldPath(
                                                                        questionIndex,
                                                                        null,
                                                                        "questionText"
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Options
                                                </label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addOption(questionIndex)}
                                                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                >
                                                    <Plus size={14} className="mr-1" />
                                                    Add Option
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {question.options.map((option, optionIndex) => (
                                                    <div
                                                        key={optionIndex}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="flex items-center h-5 mt-1.5">
                                                            <input
                                                                type="radio"
                                                                name={`correct-answer-${questionIndex}`}
                                                                checked={
                                                                    question.correctAnswer === option
                                                                }
                                                                onChange={() =>
                                                                    updateQuestionField(
                                                                        questionIndex,
                                                                        "correctAnswer",
                                                                        option
                                                                    )
                                                                }
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                        <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                            {editingStates[
                                                                getFieldPath(
                                                                    questionIndex,
                                                                    optionIndex,
                                                                    "option"
                                                                )
                                                            ] ? (
                                                                <MathInput
                                                                    value={option}
                                                                    onChange={(value) =>
                                                                        updateOption(
                                                                            questionIndex,
                                                                            optionIndex,
                                                                            value
                                                                        )
                                                                    }
                                                                    editing={true}
                                                                    onSave={() =>
                                                                        saveMathValue(
                                                                            getFieldPath(
                                                                                questionIndex,
                                                                                optionIndex,
                                                                                "option"
                                                                            )
                                                                        )
                                                                    }
                                                                    onCancel={() =>
                                                                        cancelEditing(
                                                                            getFieldPath(
                                                                                questionIndex,
                                                                                optionIndex,
                                                                                "option"
                                                                            )
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <MathInput
                                                                            value={option}
                                                                            editing={false}
                                                                            placeholder="Click edit to add option"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-gray-400 hover:text-blue-500"
                                                                            onClick={() =>
                                                                                toggleEditing(
                                                                                    getFieldPath(
                                                                                        questionIndex,
                                                                                        optionIndex,
                                                                                        "option"
                                                                                    )
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit size={16} />
                                                                        </Button>
                                                                        {question.options.length > 1 && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-gray-400 hover:text-red-500"
                                                                                onClick={() =>
                                                                                    removeOption(
                                                                                        questionIndex,
                                                                                        optionIndex
                                                                                    )
                                                                                }
                                                                            >
                                                                                <X size={16} />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Correct Answer
                                            </label>
                                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                {editingStates[
                                                    getFieldPath(questionIndex, null, "correctAnswer")
                                                ] ? (
                                                    <MathInput
                                                        value={question.correctAnswer}
                                                        onChange={(value) =>
                                                            updateQuestionField(
                                                                questionIndex,
                                                                "correctAnswer",
                                                                value
                                                            )
                                                        }
                                                        editing={true}
                                                        onSave={() =>
                                                            saveMathValue(
                                                                getFieldPath(
                                                                    questionIndex,
                                                                    null,
                                                                    "correctAnswer"
                                                                )
                                                            )
                                                        }
                                                        onCancel={() =>
                                                            cancelEditing(
                                                                getFieldPath(
                                                                    questionIndex,
                                                                    null,
                                                                    "correctAnswer"
                                                                )
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <MathInput
                                                                value={question.correctAnswer}
                                                                editing={false}
                                                                placeholder="Click edit to set correct answer"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-blue-500"
                                                            onClick={() =>
                                                                toggleEditing(
                                                                    getFieldPath(
                                                                        questionIndex,
                                                                        null,
                                                                        "correctAnswer"
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* New Section: Correct Answer Explanation */}
                                        <div className="mt-5">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Explanation for Correct Answer
                                            </label>
                                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                {editingStates[
                                                    getFieldPath(questionIndex, null, "correctAnswerExplanation")
                                                ] ? (
                                                    <MathInput
                                                        value={question.correctAnswerExplanation}
                                                        onChange={(value) =>
                                                            updateQuestionField(
                                                                questionIndex,
                                                                "correctAnswerExplanation",
                                                                value
                                                            )
                                                        }
                                                        editing={true}
                                                        onSave={() =>
                                                            saveMathValue(
                                                                getFieldPath(
                                                                    questionIndex,
                                                                    null,
                                                                    "correctAnswerExplanation"
                                                                )
                                                            )
                                                        }
                                                        onCancel={() =>
                                                            cancelEditing(
                                                                getFieldPath(
                                                                    questionIndex,
                                                                    null,
                                                                    "correctAnswerExplanation"
                                                                )
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <MathInput
                                                                value={question.correctAnswerExplanation}
                                                                editing={false}
                                                                placeholder="Click edit to add explanation"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-gray-400 hover:text-blue-500"
                                                            onClick={() =>
                                                                toggleEditing(
                                                                    getFieldPath(
                                                                        questionIndex,
                                                                        null,
                                                                        "correctAnswerExplanation"
                                                                    )
                                                                )
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 px-6 py-4 bg-gray-50/80 border-t border-gray-200">
                        <div className="flex justify-between w-full items-center">
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleUpdateExam}
                                disabled={isSubmitting}
                                className="h-12 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white border-0 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:shadow-lg"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                                        Updating...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save size={16} />
                                        Update Exam
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditExam;