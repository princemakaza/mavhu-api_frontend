// src/pages/ViewStudentActivities.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Trophy,
    BookOpen,
    Clock,
    TrendingUp,
    Wallet,
    Users,
    CheckCircle,
    XCircle,
    Calendar,
    Menu,
    X,
    Award,
    Target,
    Activity,
    PieChart,
    BarChart3,
    AlertCircle,
    Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/Sidebar";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie } from 'recharts';
import AdminService from "@/services/Admin_Service/admin_service";
import StudentService from "@/services/Admin_Service/Student_service";

interface StudentInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone_number: string;
    level: string;
    address: string;
    school: string;
    subscription_status: string;
    profile_picture: string;
    profile_picture_status: string;
    next_of_kin_full_name: string;
    next_of_kin_phone_number: string;
    isPhoneVerified: boolean;
    profile_picture_rejection_reason?: string;
}

interface ExamRecord {
    _id: string;
    comment: string;
    percentange: string;
    results: string;
    studentId: string;
    ExamId: {
        _id: string;
        subject: string;
        title: string;
    };
    showComment: boolean;
    createdAt: string;
    updatedAt: string;
}

interface TopicProgress {
    _id: string;
    student: string;
    topic: {
        _id: string;
        title: string;
        subject: string;
    };
    status: string;
    startedAt: string;
    completedAt: string | null;
    lastAccessed: string;
    timeSpent: number;
    minimumTimeRequirementMet: boolean;
    currentLessonIndex: number;
    currentSubheadingIndex: number;
}

interface WalletInfo {
    _id: string;
    balance: number;
    currency: string;
    deposits: Array<{
        amount: number;
        type: string;
        method: string;
        reference: string;
        status: string;
        date: string;
        description: string;
    }>;
    withdrawals: Array<any>;
}

interface StudentActivitiesData {
    studentInfo: StudentInfo;
    activities: {
        examRecords: ExamRecord[];
        topicProgress: TopicProgress[];
        walletInfo: WalletInfo;
        communities: Array<any>;
        walletTransactions: Array<any>;
    };
    summary: {
        totalExamsTaken: number;
        totalTopicsStarted: number;
        totalTopicsCompleted: number;
        totalCommunitiesJoined: number;
        completionRate: number;
    };
    charts: {
        performanceChart: {
            title: string;
            labels: string[];
            data: number[];
        };
        progressChart: {
            title: string;
            labels: string[];
            datasets: Array<{
                label: string;
                data: number[];
            }>;
        };
        timeSpentChart: {
            title: string;
            labels: string[];
            data: number[];
        };
    };
}

interface ApiResponse {
    status: string;
    data: StudentActivitiesData;
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

const ShimmerProfile: React.FC = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 text-center md:text-left">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-64"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mx-auto md:mx-0 mt-4"></div>
            </div>
        </div>
    </div>
);

const ShimmerChart: React.FC = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
    </div>
);

const ViewStudentActivities: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [studentData, setStudentData] = useState<StudentActivitiesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [approvingProfile, setApprovingProfile] = useState(false);
    const [rejectingProfile, setRejectingProfile] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

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
        const fetchStudentActivities = async () => {
            if (!studentId) {
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Missing Student ID",
                    description: "Please provide a student ID before continuing.",
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
                const response: ApiResponse = await AdminService.getStudentActivities(studentId);
                setStudentData(response.data);
            } catch (error) {
                console.error("Failed to fetch student activities:", error);
                const t = toast({
                    variant: "destructive",
                    title: "Oops! Couldn't Fetch Student Data",
                    description: "We couldn't fetch the student activities right now. Please try again.",
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

        fetchStudentActivities();
    }, [studentId, toast, navigate]);

    const handleApproveProfile = async () => {
        if (!studentData) return;

        try {
            setApprovingProfile(true);
            await StudentService.approveProfilePicture(studentId);

            // Update local state
            setStudentData(prev => prev ? {
                ...prev,
                studentInfo: {
                    ...prev.studentInfo,
                    profile_picture_status: 'approved'
                }
            } : null);

            toast({
                title: "Profile Picture Approved",
                description: "The student's profile picture has been approved successfully.",
                duration: 5000,
            });
        } catch (error) {
            console.error("Failed to approve profile picture:", error);
            toast({
                variant: "destructive",
                title: "Approval Failed",
                description: "Could not approve the profile picture. Please try again.",
                duration: 5000,
            });
        } finally {
            setApprovingProfile(false);
        }
    };

    const handleRejectProfile = async () => {
        if (!studentData || !rejectionReason.trim()) {
            toast({
                variant: "destructive",
                title: "Rejection Reason Required",
                description: "Please provide a reason for rejecting the profile picture.",
                duration: 5000,
            });
            return;
        }

        try {
            setRejectingProfile(true);
            await StudentService.rejectProfilePicture(studentId, rejectionReason);

            // Update local state
            setStudentData(prev => prev ? {
                ...prev,
                studentInfo: {
                    ...prev.studentInfo,
                    profile_picture_status: 'rejected',
                    rejection_reason: rejectionReason
                }
            } : null);

            toast({
                title: "Profile Picture Rejected",
                description: "The student's profile picture has been rejected.",
                duration: 5000,
            });

            // Close the modal and reset the reason
            setShowRejectionModal(false);
            setRejectionReason("");
        } catch (error) {
            console.error("Failed to reject profile picture:", error);
            toast({
                variant: "destructive",
                title: "Rejection Failed",
                description: "Could not reject the profile picture. Please try again.",
                duration: 5000,
            });
        } finally {
            setRejectingProfile(false);
        }
    };

    // Function to get initials
    // Function to get initials safely
    const getInitials = (firstName?: string, lastName?: string): string => {
        const safeFirst = (firstName || "").trim();
        const safeLast = (lastName || "").trim();

        const firstInitial = safeFirst.length > 0 ? safeFirst[0].toUpperCase() : "";
        const lastInitial = safeLast.length > 0 ? safeLast[0].toUpperCase() : "";

        // If both are empty, fallback to "?"
        return (firstInitial + lastInitial) || "?";
    };


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
                return 'bg-blue-900 text-white border-blue-900';
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pending':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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

    // Prepare chart data
    const preparePieChartData = () => {
        if (!studentData) return [];

        const { performanceChart } = studentData.charts;
        return performanceChart.labels.map((label, index) => ({
            name: label,
            value: performanceChart.data[index],
            color: index === 0 ? '#1e40af' : index === 1 ? '#059669' : '#dc2626'
        }));
    };

    const prepareBarChartData = () => {
        if (!studentData) return [];

        const { progressChart } = studentData.charts;
        return progressChart.labels.map((label, index) => ({
            subject: label,
            completed: progressChart.datasets[0]?.data[index] || 0,
            inProgress: progressChart.datasets[1]?.data[index] || 0
        }));
    };

    const COLORS = ['#1e40af', '#059669', '#dc2626', '#f59e0b', '#8b5cf6'];

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
                                            <Activity size={20} className="text-white opacity-50" />
                                        </div>
                                        <div className="h-6 bg-white/20 rounded animate-pulse w-40"></div>
                                    </div>
                                </div>
                                <div className="w-8"></div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 space-y-6">
                            {/* Profile Shimmer */}
                            <ShimmerProfile />

                            {/* Statistics Cards Shimmer */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                <ShimmerCard />
                                <ShimmerCard />
                                <ShimmerCard />
                                <ShimmerCard />
                            </div>

                            {/* Charts Shimmer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShimmerChart />
                                <ShimmerChart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Found</h2>
                    <p className="text-gray-600">Unable to load student activities.</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const { studentInfo, activities, summary, charts } = studentData;

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
                                        <Activity size={20} className="text-white" />
                                    </div>
                                    Student Activities
                                </h1>
                                <p className="text-white/90 mt-1 md:mt-2 text-sm md:text-lg">
                                    {studentInfo.firstName} {studentInfo.lastName}
                                </p>
                            </div>
                            <div className="w-10"></div>
                        </div>
                    </div>

                    <div className="p-4 md:p-6 space-y-6">
                        {/* Student Profile Section */}
                        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                                {/* Profile Picture */}
                                <div className="relative">
                                    {studentInfo.profile_picture ? (
                                        <div className="relative group">
                                            <img
                                                src={studentInfo.profile_picture}
                                                alt={`${studentInfo.firstName} ${studentInfo.lastName}`}
                                                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-200 cursor-pointer"
                                                onClick={() => setShowProfileModal(true)}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                                                onClick={() => setShowProfileModal(true)}>
                                                <Eye size={16} className="text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-900 text-white 
                flex items-center justify-center text-xl md:text-2xl font-bold 
                border-4 border-gray-200">
                                            {getInitials(studentInfo.firstName, studentInfo.lastName)}
                                        </div>


                                    )}
                                    {studentInfo.profile_picture_status === 'pending' && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                            <Clock size={12} className="text-white" />
                                        </div>
                                    )}
                                    {studentInfo.profile_picture_status === 'rejected' && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <XCircle size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Student Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-xl md:text-2xl font-bold text-blue-900">
                                        {studentInfo.firstName} {studentInfo.lastName}
                                    </h2>

                                    <div className="mt-3 space-y-2 text-sm md:text-base">
                                        <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-2">
                                            <Mail size={16} className="text-gray-500 mx-auto md:mx-0" />
                                            <span className="text-gray-600">{studentInfo.email}</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-2">
                                            <Phone size={16} className="text-gray-500 mx-auto md:mx-0" />
                                            <span className="text-gray-600">{studentInfo.phone_number}</span>
                                            {studentInfo.isPhoneVerified && (
                                                <CheckCircle size={16} className="text-green-500" />
                                            )}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-2">
                                            <GraduationCap size={16} className="text-gray-500 mx-auto md:mx-0" />
                                            <span className="text-gray-600">{studentInfo.level} - {studentInfo.school}</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-1 md:gap-2">
                                            <MapPin size={16} className="text-gray-500 mx-auto md:mx-0" />
                                            <span className="text-gray-600">{studentInfo.address}</span>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(studentInfo.subscription_status)}`}>
                                                Subscription: {studentInfo.subscription_status}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(studentInfo.profile_picture_status)}`}>
                                                Profile: {studentInfo.profile_picture_status}
                                            </span>
                                            {studentInfo.profile_picture_status === 'pending' && (
                                                <div className="flex gap-2 mt-2 md:mt-0">
                                                    <Button
                                                        size="sm"
                                                        onClick={handleApproveProfile}
                                                        disabled={approvingProfile}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {approvingProfile ? "Approving..." : "Approve"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setShowRejectionModal(true)}
                                                        disabled={rejectingProfile}
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                            {studentInfo.profile_picture_status === 'rejected' && studentInfo.rejection_reason && (
                                                <div className="mt-2 w-full md:w-auto">
                                                    <div className="bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-800">
                                                        <div className="font-medium flex items-center gap-1">
                                                            <AlertCircle size={14} />
                                                            Rejection Reason:
                                                        </div>
                                                        <p className="mt-1">{studentInfo.rejection_reason}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
                                        <Trophy size={20} className="text-blue-900" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Exams Taken</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{summary.totalExamsTaken}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-green-100 rounded-lg">
                                        <BookOpen size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Topics Started</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{summary.totalTopicsStarted}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
                                        <Target size={20} className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Completion Rate</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">{summary.completionRate}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
                                        <Wallet size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs md:text-sm text-gray-600">Wallet Balance</p>
                                        <p className="text-xl md:text-2xl font-bold text-blue-900">
                                            ${activities.walletInfo.balance}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Performance Pie Chart */}
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <PieChart size={20} className="text-blue-900" />
                                    <h3 className="text-lg font-semibold text-blue-900">Performance by Subject</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={preparePieChartData()}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}%`}
                                        >
                                            {preparePieChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Progress Bar Chart */}
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 size={20} className="text-blue-900" />
                                    <h3 className="text-lg font-semibold text-blue-900">Topic Progress</h3>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={prepareBarChartData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completed" fill="#059669" name="Completed" />
                                        <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Exam Results */}
                        {activities.examRecords.length > 0 && (
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <Award size={20} />
                                    Recent Exam Results
                                </h3>
                                <div className="space-y-4">
                                    {activities.examRecords.slice(0, 5).map((exam) => (
                                        <div key={exam._id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-blue-900">{exam.ExamId.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{exam.comment}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <Calendar size={12} className="inline mr-1" />
                                                    {formatDate(exam.createdAt)}
                                                </p>
                                            </div>
                                            <div className="mt-3 md:mt-0 md:ml-4 text-right">
                                                <div className="flex flex-row md:flex-col items-center md:items-end gap-2">
                                                    <span className="text-xl font-bold text-blue-900">{exam.percentange}</span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGradeColor(exam.results)}`}>
                                                        {exam.results}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {activities.examRecords.length > 5 && (
                                    <div className="text-center mt-4">
                                        <p className="text-sm text-gray-600">
                                            Showing 5 of {activities.examRecords.length} exam results
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Topic Progress */}
                        {activities.topicProgress.length > 0 && (
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <BookOpen size={20} />
                                    Topic Progress
                                </h3>
                                <div className="space-y-4">
                                    {activities.topicProgress.map((topic) => (
                                        <div key={topic._id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                                <h4 className="font-medium text-blue-900">{topic.topic.title}</h4>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(topic.status)} mt-2 md:mt-0`}>
                                                    {topic.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Started:</p>
                                                    <p className="font-medium">{formatDate(topic.startedAt)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Last Accessed:</p>
                                                    <p className="font-medium">{formatDate(topic.lastAccessed)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Time Spent:</p>
                                                    <p className="font-medium">{topic.timeSpent} minutes</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-900 h-2 rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${topic.status === 'completed' ? 100 : (topic.currentLessonIndex || 0) * 10}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {topic.status === 'completed' ? '100%' : `${(topic.currentLessonIndex || 0) * 10}%`}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wallet Information */}
                        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                <Wallet size={20} />
                                Wallet Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-2">Current Balance</h4>
                                        <p className="text-2xl font-bold text-blue-900">
                                            ${activities.walletInfo.balance} {activities.walletInfo.currency}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-3">Recent Transactions</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {activities.walletInfo.deposits.length > 0 ? (
                                            activities.walletInfo.deposits.slice(0, 3).map((deposit, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 border border-gray-200 rounded">
                                                    <div>
                                                        <p className="text-sm font-medium">{deposit.description}</p>
                                                        <p className="text-xs text-gray-600">{formatDate(deposit.date)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-green-600">+${deposit.amount}</p>
                                                        <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium border ${getStatusColor(deposit.status)}`}>
                                                            {deposit.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-600">No transactions yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next of Kin Information */}
                        {studentInfo.next_of_kin_full_name !== 'None' && (
                            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                    <Users size={20} />
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-medium text-blue-900">{studentInfo.next_of_kin_full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone Number</p>
                                        <p className="font-medium text-blue-900">{studentInfo.next_of_kin_phone_number}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Picture Modal */}
            {showProfileModal && studentInfo.profile_picture && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Profile Picture</h3>
                            <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <img
                                src={studentInfo.profile_picture}
                                alt={`${studentInfo.firstName} ${studentInfo.lastName}`}
                                className="max-h-96 rounded-md"
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setShowProfileModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Reject Profile Picture</h3>
                            <button
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason("");
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for rejection
                            </label>
                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Please provide a reason for rejecting this profile picture..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectionModal(false);
                                    setRejectionReason("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRejectProfile}
                                disabled={rejectingProfile || !rejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {rejectingProfile ? "Rejecting..." : "Confirm Rejection"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewStudentActivities;