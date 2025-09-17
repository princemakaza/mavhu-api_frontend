// src/pages/ViewStudentMarks.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Users, Trophy, Calendar, MessageSquare, User, Mail, Award, Percent, Menu, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ExamService from "@/services/Admin_Service/exams_services";
import Sidebar from "@/components/Sidebar";

interface StudentInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface StudentMark {
    _id: string;
    comment: string;
    percentange: string;
    results: string;
    studentId: StudentInfo;
    ExamId: string;
    showComment: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface ApiResponse {
    message: string;
    data: StudentMark[];
}

// Shimmer Loading Components
const ShimmerCard: React.FC = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-gray-200 rounded-lg animate-pulse w-10 h-10 md:w-12 md:h-12"></div>
            <div className="flex-1">
                <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-5 md:h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
        </div>
    </div>
);

const ShimmerTable: React.FC = () => (
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Header Shimmer */}
        <div className="hidden md:block bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
            </div>
        </div>

        {/* Desktop Rows Shimmer */}
        <div className="hidden md:block divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-3 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="col-span-1 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>

        {/* Mobile Cards Shimmer */}
        <div className="md:hidden divide-y divide-gray-200">
            {[...Array(5)].map((_, cardIndex) => (
                <div key={cardIndex} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                        <div className="text-right">
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-12 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-10"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ViewStudentMarks: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
    const [loading, setLoading] = useState(true);
    const [examTitle, setExamTitle] = useState<string>("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    // Toggle sidebar function
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

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

    useEffect(() => {
        const fetchStudentMarks = async () => {
            if (!examId) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Exam ID",
                    description: "Please provide an exam ID before continuing.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()}
                        >
                            Dismiss
                        </Button>
                    ),
                });

                navigate(-1);
                return;
            }

            try {
                setLoading(true);

                // Fetch student marks
                const response: ApiResponse = await ExamService.getStudentsMarksByExamId(examId);
                setStudentMarks(response.data);

                // Optionally fetch exam details for title
                try {
                    const examResponse = await ExamService.getExamById(examId);
                    setExamTitle(examResponse.data.title);
                } catch (examError) {
                    console.warn("Could not fetch exam details:", examError);
                    setExamTitle("Exam Results");
                }

            } catch (error) {
                console.error("Failed to fetch student marks:", error);
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Couldn't Fetch Marks",
                    description: "We couldn't fetch the student marks right now. Please try again.",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()}
                        >
                            Dismiss
                        </Button>
                    ),
                });

                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentMarks();
    }, [examId, toast, navigate]);

    const getGradeColor = (grade: string): string => {
        switch (grade.toUpperCase()) {
            case 'A+':
            case 'A':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'B+':
            case 'B':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'C+':
            case 'C':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'D+':
            case 'D':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'F':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-blue-900 text-white border-blue-900'; // Default blue-900 theme
        }
    };

    const getPercentageColor = (percentage: string): string => {
        const numericPercentage = parseInt(percentage.replace('%', ''));
        if (numericPercentage >= 90) return 'text-green-600';
        if (numericPercentage >= 80) return 'text-blue-600';
        if (numericPercentage >= 70) return 'text-yellow-600';
        if (numericPercentage >= 60) return 'text-orange-600';
        return 'text-red-600';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateMobile = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTopPerformers = (): StudentMark[] => {
        if (studentMarks.length === 0) return [];

        const maxPercentage = Math.max(...studentMarks.map(mark =>
            parseInt(mark.percentange.replace('%', ''))
        ));

        return studentMarks.filter(mark =>
            parseInt(mark.percentange.replace('%', '')) === maxPercentage
        );
    };

    const getAverageScore = (): number => {
        if (studentMarks.length === 0) return 0;
        const total = studentMarks.reduce((sum, mark) => {
            return sum + parseInt(mark.percentange.replace('%', ''));
        }, 0);
        return Math.round(total / studentMarks.length);
    };

    // Sort students by percentage (highest first)
    const sortedStudentMarks = [...studentMarks].sort((a, b) => {
        const percentageA = parseInt(a.percentange.replace('%', ''));
        const percentageB = parseInt(b.percentange.replace('%', ''));
        return percentageB - percentageA;
    });

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg"
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

                {/* Main Content with Shimmer Loading */}
                <div className="flex-1 w-full">
                    <div className="w-full min-h-screen">
                        {/* Header Shimmer */}
                        <div className="relative p-4 md:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
                                <div className="text-center flex-1">
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm animate-pulse">
                                            <Users size={20} className="text-white opacity-50" />
                                        </div>
                                        <div className="h-6 bg-white/20 rounded animate-pulse w-32"></div>
                                    </div>
                                    <div className="h-4 bg-white/20 rounded animate-pulse w-48 mx-auto mt-2"></div>
                                </div>
                                <div className="w-8"></div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-6">
                            {/* Statistics Cards Shimmer */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <ShimmerCard />
                                <ShimmerCard />
                                <ShimmerCard />
                            </div>

                            {/* Top Performers Shimmer */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-200">
                                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 bg-blue-200 rounded-lg animate-pulse w-10 h-10 md:w-12 md:h-12"></div>
                                    <div className="flex-1">
                                        <div className="h-5 bg-blue-200 rounded animate-pulse mb-2 w-32"></div>
                                        <div className="h-4 bg-blue-200 rounded animate-pulse w-48"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-md md:rounded-lg p-3 md:p-4 border border-blue-200">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-200 rounded-full animate-pulse"></div>
                                                    <div className="p-1 md:p-2 bg-gray-200 rounded-full animate-pulse w-8 h-8"></div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-32"></div>
                                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                                                    </div>
                                                </div>
                                                <div className="md:text-right pl-8 md:pl-0">
                                                    <div className="h-6 bg-gray-200 rounded-full animate-pulse w-12 mb-1"></div>
                                                    <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Table Shimmer */}
                            <div className="mt-6 md:mt-8">
                                <div className="flex justify-between items-center mb-4 md:mb-6">
                                    <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                                </div>
                                <ShimmerTable />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const topPerformers = getTopPerformers();
    const averageScore = getAverageScore();

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg hover:bg-blue-800 transition-colors"
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
                <div className="w-full min-h-screen">
                    {/* Header with Blue-900 Theme */}
                    <div className="relative p-4 md:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => navigate(-1)}
                                className="text-white hover:bg-white/20 border-white/20 hover:border-white/40"
                            >
                                <ChevronLeft size={20} className="mr-2" />
                                <span className="sr-only md:not-sr-only">Back</span>
                            </Button>
                            <div className="text-center flex-1">
                                <h1 className="text-xl md:text-2xl font-bold tracking-tight flex flex-col md:flex-row items-center justify-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Users size={20} className="text-white" />
                                    </div>
                                    Student Results
                                </h1>
                                {examTitle && (
                                    <p className="text-white/90 mt-1 md:mt-2 text-sm md:text-lg truncate px-2 max-w-[90vw] mx-auto">
                                        {examTitle}
                                    </p>
                                )}
                            </div>
                            <div className="w-10"></div> {/* Spacer for alignment */}
                        </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-6">
                        {/* Statistics Cards with Blue-900 accents */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                                        <Users size={20} className="text-blue-900" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Total Students</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{studentMarks.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                                        <Percent size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Average Score</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{averageScore}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                                        <Trophy size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Top Score</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">
                                            {topPerformers.length > 0 ? topPerformers[0].percentange : '0%'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Performers Highlight with Blue theme */}
                        {topPerformers.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-200">
                                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div className="p-2 md:p-3 bg-blue-200 rounded-lg">
                                        <Trophy size={20} className="text-blue-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-blue-900">
                                            Top Performer{topPerformers.length > 1 ? 's' : ''}
                                        </h3>
                                        <p className="text-xs md:text-sm text-blue-700">
                                            {topPerformers.length > 1
                                                ? `${topPerformers.length} students tied for the highest score!`
                                                : 'Congratulations to our highest scorer!'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {topPerformers.map((performer, index) => (
                                        <div key={performer._id} className="bg-white rounded-md md:rounded-lg p-3 md:p-4 border border-blue-200 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="p-1 md:p-2 bg-gradient-to-r from-blue-800 to-blue-900 rounded-full text-white font-bold text-xs md:text-sm w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                                                        {index + 1}
                                                    </div>
                                                    <div className="p-1 md:p-2 bg-gray-100 rounded-full">
                                                        <User size={16} className="text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm md:text-base text-blue-900 line-clamp-1">
                                                            {performer.studentId.firstName} {performer.studentId.lastName}
                                                        </p>
                                                        <p className="text-xs md:text-sm text-gray-600 line-clamp-1">{performer.studentId.email}</p>
                                                    </div>
                                                </div>
                                                <div className="md:text-right pl-8 md:pl-0">
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium border ${getGradeColor(performer.results)}`}>
                                                        {performer.results}
                                                    </div>
                                                    <p className={`text-base md:text-lg font-bold ${getPercentageColor(performer.percentange)}`}>
                                                        {performer.percentange}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Student Results Section */}
                        <div className="mt-6 md:mt-8">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-blue-900">All Student Results</h2>
                                <p className="text-xs md:text-sm text-gray-600">{studentMarks.length} student{studentMarks.length !== 1 ? 's' : ''}</p>
                            </div>

                            {studentMarks.length === 0 ? (
                                <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-12 border border-gray-200 shadow-sm text-center">
                                    <div className="p-3 md:p-4 bg-blue-100 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                        <Users size={24} className="text-blue-900" />
                                    </div>
                                    <h3 className="text-base md:text-lg font-semibold text-blue-900 mb-1 md:mb-2">No Results Found</h3>
                                    <p className="text-sm md:text-base text-gray-600">No students have taken this exam yet.</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    {/* Table Header - Desktop Only */}
                                    <div className="hidden md:grid bg-blue-50 px-6 py-4 border-b border-blue-200 grid-cols-12 gap-4 items-center font-semibold text-blue-900 text-sm">
                                        <div className="col-span-1">#</div>
                                        <div className="col-span-2">Name</div>
                                        <div className="col-span-2">Surname</div>
                                        <div className="col-span-3">Email</div>
                                        <div className="col-span-2">Date Submitted</div>
                                        <div className="col-span-1">Score</div>
                                        <div className="col-span-1">Grade</div>
                                    </div>

                                    {/* Desktop Table Body */}
                                    <div className="hidden md:block divide-y divide-gray-200">
                                        {sortedStudentMarks.map((mark, index) => (
                                            <div key={mark._id} className="px-6 py-4 hover:bg-blue-50 transition-colors duration-150">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-900 font-medium">{index + 1}</span>
                                                            {topPerformers.some(tp => tp._id === mark._id) && (
                                                                <Trophy size={16} className="text-yellow-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="font-medium text-blue-900 line-clamp-1">{mark.studentId.firstName}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="font-medium text-blue-900 line-clamp-1">{mark.studentId.lastName}</span>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <span className="text-gray-600 text-sm line-clamp-1">{mark.studentId.email}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-600 text-sm">{formatDate(mark.createdAt)}</span>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <span className={`font-bold ${getPercentageColor(mark.percentange)}`}>
                                                            {mark.percentange}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(mark.results)}`}>
                                                            {mark.results}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Mobile List */}
                                    <div className="md:hidden divide-y divide-gray-200">
                                        {sortedStudentMarks.map((mark, index) => (
                                            <div key={mark._id} className="p-4 hover:bg-blue-50 transition-colors duration-150">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-blue-900">{index + 1}.</span>
                                                        {topPerformers.some(tp => tp._id === mark._id) && (
                                                            <Trophy size={16} className="text-yellow-500" />
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`font-bold text-base ${getPercentageColor(mark.percentange)}`}>
                                                            {mark.percentange}
                                                        </span>
                                                        <div className="mt-1">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(mark.results)}`}>
                                                                {mark.results}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User size={16} className="text-blue-900" />
                                                        <span className="font-medium text-blue-900">
                                                            {mark.studentId.firstName} {mark.studentId.lastName}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                                        <Mail size={16} className="text-gray-500" />
                                                        <span className="text-gray-600 truncate">{mark.studentId.email}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-2 text-sm">
                                                        <Calendar size={16} className="text-gray-500" />
                                                        <span className="text-gray-600">{formatDateMobile(mark.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStudentMarks;