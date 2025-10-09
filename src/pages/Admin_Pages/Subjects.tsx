import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  Eye,
  Trash2,
  Bell,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SubjectService from "@/services/Admin_Service/Subject_service";
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Topic from "@/components/Interfaces/Topic_Interface";
import Subject from "@/components/Interfaces/Subject_Interface";
import ViewTopicContentDialog from "@/components/Dialogs/View_Content";
import TopicCard from "@/components/TopicCard";
import ViewTopicDialog from "@/components/Dialogs/View_topic";
import EditTopicDialog from "@/components/Dialogs/Edit_topic";
import DeleteTopicDialog from "@/components/Dialogs/Delet_topic";
import AddTopicDialog from "@/components/Dialogs/Add_topic";
import AddSubjectDialog from "@/components/Dialogs/Add__Subject";
import DeleteSubjectDialog from "@/components/Dialogs/Delete_Subject";
import EditSubjectDialog from "@/components/Dialogs/Edit_Subject";

// -----------------------------
// Shimmer Loading Components
// -----------------------------
const SubjectCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
    </CardHeader>
    <CardContent>
      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
    </CardContent>
    <CardFooter className="flex justify-between">
      <div className="h-9 bg-gray-200 rounded animate-pulse w-20" />
      <div className="h-9 bg-gray-200 rounded animate-pulse w-20" />
    </CardFooter>
  </Card>
);

const TopicCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
    </CardHeader>
    <CardFooter className="flex justify-between gap-2 flex-wrap">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
    </CardFooter>
  </Card>
);

// -----------------------------
// Enhanced Subject Card (shows Topics count and requests)
// -----------------------------
const EnhancedSubjectCard = ({
  subject,
  onClickView,
  onClickDelete,
  onUpdate,
}: {
  subject: Subject & { topics?: Topic[]; topicCount?: number; topicRequests?: number };
  onClickView: () => void;
  onClickDelete: () => void;
  onUpdate: () => void;
}) => {
  const hasRequests = !!subject.topicRequests && subject.topicRequests > 0;
  const topicsCount =
    typeof subject.topicCount === "number"
      ? subject.topicCount
      : Array.isArray(subject.topics)
        ? subject.topics.length
        : 0;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
      <div className="relative h-48 overflow-hidden">
        {/* Cover image */}
        <img
          src={
            subject.imageUrl ||
            "https://media.istockphoto.com/id/1500285927/photo/young-woman-a-university-student-studying-online.jpg?s=612x612&w=0&k=20&c=yvFDnYMNEJ6WEDYrAaOOLXv-Jhtv6ViBRXSzJhL9S_k="
          }
          alt={subject.subjectName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Requests badge */}
        {hasRequests && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-semibold shadow-lg border-2 border-white flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              <span>
                {subject.topicRequests} Request{subject.topicRequests! > 1 ? "s" : ""}
              </span>
            </Badge>
          </div>
        )}

        {/* Level */}
        {subject.Level && (
          <Badge className="absolute top-3 left-3 bg-blue-900/90 hover:bg-blue-900 backdrop-blur-sm">
            {subject.Level}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-900 line-clamp-1">
          {subject.subjectName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span>{topicsCount} Topic{topicsCount === 1 ? "" : "s"}</span>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex justify-between gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onClickView}
          className="flex-1 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-900 transition-colors"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdate}
          className="flex-1 hover:bg-green-50 hover:text-green-700 hover:border-green-700 transition-colors"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClickDelete}
          className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// -----------------------------
// Main Component
// -----------------------------
const AdminSubjects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<(Subject & { topics?: Topic[]; topicCount?: number; topicRequests?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  // Topic dialogs
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [viewTopicDialogOpen, setViewTopicDialogOpen] = useState<boolean>(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState<boolean>(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [deletingTopicTitle, setDeletingTopicTitle] = useState<string>("");
  const [deleteTopicDialogOpen, setDeleteTopicDialogOpen] = useState<boolean>(false);

  // View content dialog (fixed wiring)
  const [viewingContentTopic, setViewingContentTopic] = useState<Topic | null>(null);
  const [viewContentDialogOpen, setViewContentDialogOpen] = useState<boolean>(false);

  // Subject deletion / edit dialogs
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [deletingSubjectTitle, setDeletingSubjectTitle] = useState<string>("");
  const [deleteSubjectDialogOpen, setDeleteSubjectDialogOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectDialogOpen, setEditSubjectDialogOpen] = useState<boolean>(false);

  // Selected subject view
  const [selectedSubject, setSelectedSubject] = useState<(Subject & { topics?: Topic[]; topicCount?: number; topicRequests?: number }) | null>(null);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);

  // Calculate total topic requests across all subjects
  const totalTopicRequests = subjects.reduce((sum, s) => sum + (s.topicRequests || 0), 0);

  // Helpers
  const getUniqueLevels = (list: Subject[]) => Array.from(new Set(list.map((s) => s.Level).filter(Boolean))) as string[];
  const generateTabs = (list: Subject[]) => [{ id: "all", label: "All" }, ...getUniqueLevels(list).map((level) => ({ id: level, label: level }))];

  // -----------------------------
  // CRUD Handlers (Subjects)
  // -----------------------------
  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectDialogOpen(true);
  };

  const handleSubjectUpdated = async (updatedSubject: Subject) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        const isTarget =
          (subject._id && updatedSubject._id && subject._id === updatedSubject._id) ||
          (subject.id && updatedSubject.id && subject.id === updatedSubject.id) ||
          subject._id === (updatedSubject as any).id ||
          (subject as any).id === (updatedSubject as any)._id;

        if (!isTarget) return subject;

        return {
          ...subject,
          ...updatedSubject,
          topics: (updatedSubject as any).topics || subject.topics,
          _id: (subject as any)._id || (updatedSubject as any)._id,
          id: (subject as any).id || (updatedSubject as any).id,
        };
      })
    );

    if (selectedSubject) {
      const isSelected =
        (selectedSubject._id && updatedSubject._id && selectedSubject._id === updatedSubject._id) ||
        (selectedSubject.id && updatedSubject.id && selectedSubject.id === updatedSubject.id) ||
        selectedSubject._id === (updatedSubject as any).id ||
        (selectedSubject as any).id === (updatedSubject as any)._id;

      if (isSelected) {
        const next = {
          ...selectedSubject,
          ...updatedSubject,
          topics: (updatedSubject as any).topics || selectedSubject.topics,
          _id: (selectedSubject as any)._id || (updatedSubject as any)._id,
          id: (selectedSubject as any).id || (updatedSubject as any).id,
        } as typeof selectedSubject;
        setSelectedSubject(next);
      }
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subject = subjects.find((s) => (s as any)._id === subjectId || (s as any).id === subjectId);
    if (subject) {
      setDeletingSubjectId(subjectId);
      setDeletingSubjectTitle((subject as any).name || (subject as any).title || subject.subjectName || "this subject");
      setDeleteSubjectDialogOpen(true);
    }
  };

  const handleSubjectDeleted = async () => {
    await fetchSubjects();
  };

  // -----------------------------
  // CRUD Handlers (Topics)
  // -----------------------------
  const handleViewContent = (topic: Topic) => {
    setViewingContentTopic(topic);
    setViewContentDialogOpen(true);
  };

  const handleViewTopic = (topic: Topic) => {
    setViewingTopic(topic);
    setViewTopicDialogOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setEditTopicDialogOpen(true);
  };

  const handleDeleteTopic = (topicId: string) => {
    const topic = selectedSubject?.topics?.find((t: any) => t._id === topicId || t.id === topicId);
    if (topic) {
      setDeletingTopicId(topicId);
      setDeletingTopicTitle((topic as any).title || (topic as any).name || "this topic");
      setDeleteTopicDialogOpen(true);
    }
  };

  const handleTopicUpdated = async () => {
    if (!selectedSubject) return;
    const subjectId = (selectedSubject as any)._id || (selectedSubject as any).id;
    if (!subjectId) return;

    const topics = await fetchTopicsForSubject(subjectId);

    // Update selected subject
    setSelectedSubject((prev) => (prev ? { ...prev, topics, topicCount: topics.length } : prev));

    // Update list
    setSubjects((prev) =>
      prev.map((s) =>
        (s as any)._id === subjectId || (s as any).id === subjectId
          ? { ...s, topics, topicCount: topics.length }
          : s
      )
    );
  };

  const handleTopicDeleted = async () => {
    await handleTopicUpdated();
  };

  const handleTopicAdded = async () => {
    await handleTopicUpdated();
  };

  // -----------------------------
  // Data Fetching
  // -----------------------------
  const fetchTopicsForSubject = async (subjectId: string): Promise<Topic[]> => {
    try {
      setLoadingTopics(true);
      const result = await TopicInSubjectService.getTopicsBySubjectId(subjectId);
      return (result as any)?.data || [];
    } catch (err) {
      console.error(`Failed to fetch topics for subject ${subjectId}:`, err);
 
      return [];
    } finally {
      setLoadingTopics(false);
    }
  };

  const viewSubjectTopics = async (subject: Subject & { topics?: Topic[] }) => {
    const subjectId = (subject as any)._id || (subject as any).id;
    if (!subjectId) return;

    try {
      // Ensure we show the selected subject immediately
      setSelectedSubject(subject as any);

      // If topics are missing or empty, fetch them
      if (!subject.topics || subject.topics.length === 0) {
        const topics = await fetchTopicsForSubject(subjectId);

        // Update both the list and the selected subject with fresh topics and count
        setSubjects((prev) =>
          prev.map((s) =>
            (s as any)._id === subjectId || (s as any).id === subjectId
              ? { ...s, topics, topicCount: topics.length }
              : s
          )
        );
        setSelectedSubject((prev) => (prev ? { ...prev, topics, topicCount: topics.length } : prev));
      }
    } catch (err) {
      console.error("Error viewing subject topics:", err);
    }
  };

  const fetchSubjects = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await SubjectService.getAllSubjects();
      const subjectsData: (Subject & { topics?: Topic[]; topicRequests?: number })[] = (result as any)?.data || [];

      // Set raw subjects first (fast paint)
      setSubjects(subjectsData);
      setError(null);

      // --- Optional: prefetch topic counts in background so the cards show correct counts ---
      // This avoids showing 0 topics when the backend doesn't return embedded topics.
      Promise.all(
        subjectsData.map(async (s) => {
          const id = (s as any)._id || (s as any).id;
          if (!id) return { id: undefined, count: 0 };
          try {
            const list = await fetchTopicsForSubject(id);
            return { id, count: list.length };
          } catch {
            return { id, count: 0 };
          }
        })
      ).then((counts) => {
        setSubjects((prev) =>
          prev.map((s) => {
            const id = (s as any)._id || (s as any).id;
            const entry = counts.find((c) => c.id === id);
            return entry ? { ...s, topicCount: entry.count } : s;
          })
        );
      });
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setError("Failed to load subjects. Please try again.");
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn't Load Subjects",
        description: "We couldn't load the subjects right now. Please try again.",
        duration: 8000,
        action: (
          <Button variant="outline" className="bg-white text-red-600 hover:bg-red-100" onClick={() => (t as any).dismiss?.()}>
            Dismiss
          </Button>
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // -----------------------------
  // UI helpers
  // -----------------------------
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

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSubjectAdded = async (newSubject: Subject): Promise<void> => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const backToSubjects = () => setSelectedSubject(null);

  const filteredSubjects = subjects.filter((subject) => {
    const matchesTab = activeTab === "all" ? true : subject.Level === activeTab;
    const matchesSearch = !searchQuery ||
      (subject.subjectName && subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));
    const isVisible = (subject as any).showSubject === true || (subject as any).showSubject === undefined; // be lenient
    return matchesTab && matchesSearch && isVisible;
  });

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        onClick={toggleSidebar}
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
        ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
        transition-all duration-300 ease-in-out 
        fixed md:relative z-40 md:z-auto w-64
      `}
      >
        <Sidebar />
      </div>

      {sidebarOpen && !isLargeScreen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm" onClick={toggleSidebar} />
      )}

      {/* Main */}
      <div className="flex-1 w-full">
        <div className="p-4 md:p-6">
          {selectedSubject ? (
            <>
              <div className="flex items-center mb-6 mt-10 md:mt-0 gap-2">
                <Button variant="ghost" className="p-2 hover:bg-blue-50 rounded-lg" onClick={backToSubjects}>
                  <ChevronLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">
                    {(selectedSubject as any).name || (selectedSubject as any).title || selectedSubject.subjectName || "Topics"}
                  </h1>
                  {!!selectedSubject.topicRequests && selectedSubject.topicRequests > 0 && (
                    <Badge className="mt-1 bg-red-100 text-red-700 hover:bg-red-200">
                      <Bell className="h-3 w-3 mr-1" />
                      {selectedSubject.topicRequests} Pending Request{selectedSubject.topicRequests > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                      <Plus className="h-4 w-4 mr-2" /> Add Topic
                    </Button>
                  </DialogTrigger>
                  <AddTopicDialog
                    open={topicDialogOpen}
                    onOpenChange={setTopicDialogOpen}
                    subjectId={(selectedSubject as any)._id || (selectedSubject as any).id || ""}
                    onTopicAdded={handleTopicAdded}
                  />
                </Dialog>
              </div>

              {loadingTopics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <TopicCardShimmer key={i} />
                  ))}
                </div>
              )}

              {!loadingTopics && selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedSubject.topics.map((topic, index) => (
                    <TopicCard
                      key={(topic as any)._id || (topic as any).id || index}
                      topic={topic}
                      index={index}
                      onViewTopic={handleViewTopic}
                      onEditTopic={handleEditTopic}
                      onDeleteTopic={handleDeleteTopic}
                      onViewContent={handleViewContent}
                    />
                  ))}
                </div>
              ) : !loadingTopics ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No topics found for this subject. Add a new topic to get started.</p>
                </div>
              ) : null}

              {/* Topic dialogs */}
              <Dialog open={viewTopicDialogOpen} onOpenChange={setViewTopicDialogOpen}>
                <ViewTopicDialog open={viewTopicDialogOpen} onOpenChange={setViewTopicDialogOpen} topic={viewingTopic} />
              </Dialog>

              <Dialog open={editTopicDialogOpen} onOpenChange={setEditTopicDialogOpen}>
                <EditTopicDialog open={editTopicDialogOpen} onOpenChange={setEditTopicDialogOpen} topic={editingTopic} onTopicUpdated={handleTopicUpdated} />
              </Dialog>

              <Dialog open={deleteTopicDialogOpen} onOpenChange={setDeleteTopicDialogOpen}>
                <DeleteTopicDialog open={deleteTopicDialogOpen} onOpenChange={setDeleteTopicDialogOpen} topicId={deletingTopicId} topicTitle={deletingTopicTitle} onTopicDeleted={handleTopicDeleted} />
              </Dialog>

              {/* FIXED: wire the content dialog to the right state */}
              <Dialog open={viewContentDialogOpen} onOpenChange={setViewContentDialogOpen}>
                <ViewTopicContentDialog open={viewContentDialogOpen} onOpenChange={setViewContentDialogOpen} topic={viewingContentTopic} />
              </Dialog>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-10 md:mt-0">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900 mb-1">SUBJECTS</h1>
                  {totalTopicRequests > 0 && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      <Bell className="h-3.5 w-3.5 mr-1.5" />
                      {totalTopicRequests} Total Request{totalTopicRequests > 1 ? "s" : ""} Pending
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      placeholder="Search subjects..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>

                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-900 hover:bg-blue-800 w-full sm:w-auto shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Add Subject
                      </Button>
                    </DialogTrigger>
                    <AddSubjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubjectAdded={handleSubjectAdded} />
                  </Dialog>
                </div>
              </div>

              <div className="mb-8 overflow-x-auto pb-2">
                <ul className="flex space-x-6 border-b border-gray-200 whitespace-nowrap min-w-max md:min-w-0">
                  {generateTabs(subjects).map((tab) => (
                    <li key={tab.id}>
                      <button
                        className={`py-3 px-1 transition-all duration-200 ${activeTab === tab.id ? "text-blue-900 font-semibold border-b-2 border-blue-900" : "text-gray-600 hover:text-blue-700"}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <SubjectCardShimmer key={index} />
                  ))}
                </div>
              )}

              {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg my-4 shadow-sm">
                  <p>{error}</p>
                  <Button variant="outline" className="mt-2" onClick={fetchSubjects}>
                    Retry
                  </Button>
                </div>
              )}

              {!loading && !error && filteredSubjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No subjects found. Please try a different filter or add a new subject.</p>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Add New Subject
                      </Button>
                    </DialogTrigger>
                    <AddSubjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubjectAdded={handleSubjectAdded} />
                  </Dialog>
                </div>
              )}

              {!loading && !error && filteredSubjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((subject) => (
                    <EnhancedSubjectCard
                      key={(subject as any)._id || (subject as any).id}
                      subject={subject}
                      onClickView={() => viewSubjectTopics(subject)}
                      onClickDelete={() => handleDeleteSubject(((subject as any)._id || (subject as any).id) as string)}
                      onUpdate={() => handleEditSubject(subject)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Subject Dialog */}
      <Dialog open={deleteSubjectDialogOpen} onOpenChange={setDeleteSubjectDialogOpen}>
        <DeleteSubjectDialog
          open={deleteSubjectDialogOpen}
          onOpenChange={setDeleteSubjectDialogOpen}
          subjectId={deletingSubjectId}
          subjectTitle={deletingSubjectTitle}
          onSubjectDeleted={handleSubjectDeleted}
        />
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={editSubjectDialogOpen} onOpenChange={setEditSubjectDialogOpen}>
        <EditSubjectDialog
          open={editSubjectDialogOpen}
          onOpenChange={setEditSubjectDialogOpen}
          subject={editingSubject}
          onSubjectUpdated={handleSubjectUpdated}
        />
      </Dialog>

      {/* Topic Modals mounted at root to avoid nesting issues */}
      <Dialog open={viewTopicDialogOpen} onOpenChange={setViewTopicDialogOpen}>
        <ViewTopicDialog open={viewTopicDialogOpen} onOpenChange={setViewTopicDialogOpen} topic={viewingTopic} />
      </Dialog>
      <Dialog open={viewContentDialogOpen} onOpenChange={setViewContentDialogOpen}>
        <ViewTopicContentDialog open={viewContentDialogOpen} onOpenChange={setViewContentDialogOpen} topic={viewingContentTopic} />
      </Dialog>
      <Dialog open={editTopicDialogOpen} onOpenChange={setEditTopicDialogOpen}>
        <EditTopicDialog open={editTopicDialogOpen} onOpenChange={setEditTopicDialogOpen} topic={editingTopic} onTopicUpdated={handleTopicUpdated} />
      </Dialog>
      <Dialog open={deleteTopicDialogOpen} onOpenChange={setDeleteTopicDialogOpen}>
        <DeleteTopicDialog open={deleteTopicDialogOpen} onOpenChange={setDeleteTopicDialogOpen} topicId={deletingTopicId} topicTitle={deletingTopicTitle} onTopicDeleted={handleTopicDeleted} />
      </Dialog>
    </div>
  );
};

export default AdminSubjects;
