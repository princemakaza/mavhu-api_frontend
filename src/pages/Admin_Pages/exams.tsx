// src/pages/Exams.tsx
import { useEffect, useState, useMemo } from "react";
import SectionTitle from "@/components/SectionTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, TriangleAlert, Plus, Menu, X, Trash2, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import ExamCard from "@/components/exam_card";
import ExamService from "@/services/Admin_Service/exams_services";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/components/ui/use-toast";

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  examTitle,
  isDeleting
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  examTitle: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-center pt-6 pb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-3">
            Delete Exam
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
            Are you sure you want to delete
          </p>
          <p className="font-medium text-center text-gray-900 dark:text-white mb-4">
            "{examTitle}"?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            This action cannot be undone. All associated data will be permanently removed.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Exam
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Exams = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    examId: null,
    examTitle: "",
    isDeleting: false
  });

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

  const fetchExams = async () => {
    try {
      const response = await ExamService.getAllExams();
      setExams(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [token]);

  // Open delete confirmation modal
  const openDeleteModal = (examId: string, examTitle: string) => {
    setDeleteModal({
      isOpen: true,
      examId,
      examTitle,
      isDeleting: false
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        examId: null,
        examTitle: "",
        isDeleting: false
      });
    }
  };

  // Handle exam deletion
  const handleDeleteExam = async () => {
    if (!deleteModal.examId) return;

    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      await ExamService.deleteExamById(deleteModal.examId);

      // Success toast with custom styling
      const t = toast({
        title: "✅ Exam Deleted Successfully",
        description: `"${deleteModal.examTitle}" has been removed successfully.`,
        variant: "default",
        duration: 5000,
        action: (
          <Button
            variant="secondary"
            size="sm"
            className="bg-green-600 text-white hover:bg-green-700 h-8"
            onClick={() => t.dismiss()}
          >
            <Check className="h-3 w-3 mr-1" />
            Got it
          </Button>
        ),
      });

      // Close modal and refresh exam list
      closeDeleteModal();
      fetchExams();

    } catch (error) {
      // Error toast
      const t = toast({
        variant: "destructive",
        title: "❌ Delete Failed",
        description: "We couldn't delete the exam. Please try again.",
        duration: 6000,
        action: (
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-red-600 hover:bg-red-50 h-8"
            onClick={() => t.dismiss()}
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        ),
      });

      console.error("Delete error:", error);
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Get unique exam levels for tabs
  const availableLevels = useMemo(() => {
    const levels = new Set<string>();
    exams.forEach(exam => {
      if (exam.level) {
        levels.add(exam.level.toLowerCase());
      }
    });
    return Array.from(levels);
  }, [exams]);

  // Filter exams based on active tab and search term
  const filteredExams = useMemo(() => {
    let result = exams;

    // Filter by active tab
    if (activeTab !== "all") {
      result = result.filter(exam => {
        const examLevel = exam.level?.toLowerCase() || '';
        return examLevel === activeTab;
      });
    }

    // Fixed search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(exam =>
        exam.title.toLowerCase().includes(term)
      );
    }

    return result;
  }, [exams, activeTab, searchTerm]);

  // Shimmer loading component
  const ExamCardShimmer = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-300"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        {/* Sidebar - Always visible even on error */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md"
          onClick={toggleSidebar}
        >
          {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar for mobile */}
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
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
              <TriangleAlert className="h-32 w-32 text-yellow-500 mx-auto" />
              <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
              <p className="text-xl text-gray-600 mb-4">
                We couldn't load your exams right now. Please try again.
              </p>
              <a
                href="/exams"
                className="text-blue-500 hover:text-blue-700 underline font-medium"
              >
                Reload
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Function to format level names for display
  const formatLevelName = (level: string) => {
    const levelMap: Record<string, string> = {
      'primary school': 'Primary School',
      'ordinary level': 'Ordinary Level',
      'advanced level': 'Advanced Level',
      'tertiary education': 'Tertiary Education'
    };
    return levelMap[level] || level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar - Always visible even during loading */}
      <div
        className={`
          ${sidebarOpen || isLargeScreen
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
        <div className="w-full min-h-screen p-4 md:p-6">
          <SectionTitle
            title="Exams Catalog"
            description="Browse and manage all available exams"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input
                  placeholder="Search exams by title..."
                  className="pl-10 w-full sm:w-[240px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" /> Clear
              </Button>
              <Button asChild className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
                <Link to="/createExam">
                  <Plus className="h-4 w-4" /> Add Exam
                </Link>
              </Button>
            </div>
          </SectionTitle>

          {loading ? (
            // Shimmer loading state
            <>
              <div className="h-10 bg-gray-200 rounded-md animate-pulse mb-6 w-1/2"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <ExamCardShimmer key={index} />
                ))}
              </div>
            </>
          ) : (
            // Actual content when not loading
            <>
              {availableLevels.length > 0 && (
                <Tabs defaultValue="all" className="sticky top-0 bg-white dark:bg-slate-950 z-20 py-4" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Levels</TabsTrigger>
                    {availableLevels.map(level => (
                      <TabsTrigger key={level} value={level}>
                        {formatLevelName(level)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {filteredExams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredExams.map(exam => (
                    <ExamCard
                      key={exam._id}
                      id={exam._id}
                      title={exam.title}
                      subjectName={exam.subject?.subjectName || "Unknown Subject"}
                      level={exam.level}
                      durationInMinutes={exam.durationInMinutes}
                      thumbnailUrl={exam.subject?.imageUrl || "/default-exam.png"}
                      onDelete={() => openDeleteModal(exam._id, exam.title)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <TriangleAlert className="h-24 w-24 text-yellow-500 mb-6" />
                  <h3 className="text-2xl font-semibold mb-2">No Exams Found</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {searchTerm
                      ? `No exams match your search for "${searchTerm}"`
                      : "No exams available for the selected filters"}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTab("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteExam}
        examTitle={deleteModal.examTitle}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
};

export default Exams;