import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  Download,
  Eye,
  Trash2,
  MessageSquare,
  Bell,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SubjectCard from "@/components/SubjectCard";
import SubjectService from "@/services/Admin_Service/Subject_service";
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";
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
import { supabase } from "@/helper/SupabaseClient";
import AddSubjectDialog from "@/components/Dialogs/Add__Subject";
import DeleteSubjectDialog from "@/components/Dialogs/Delete_Subject";
import EditSubjectDialog from "@/components/Dialogs/Edit_Subject";

// Enhanced Shimmer Loading Components with Request Badge
const SubjectCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
      <div className="absolute top-2 right-2 h-6 w-16 bg-gray-300 rounded-full"></div>
    </div>
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
    </CardHeader>
    <CardContent>
      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <div className="h-9 bg-gray-200 rounded animate-pulse w-20"></div>
      <div className="h-9 bg-gray-200 rounded animate-pulse w-20"></div>
    </CardFooter>
  </Card>
);

const TopicCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
    </CardHeader>
    <CardFooter className="flex justify-between gap-2 flex-wrap">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
    </CardFooter>
  </Card>
);

// Enhanced Subject Card Component with Topic Requests
const EnhancedSubjectCard = ({ subject, onClickView, onClickDelete, onUpdate }) => {
  const hasRequests = subject.topicRequests && subject.topicRequests > 0;
  
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img
          src={subject.imageUrl || "https://media.istockphoto.com/id/1500285927/photo/young-woman-a-university-student-studying-online.jpg?s=612x612&w=0&k=20&c=yvFDnYMNEJ6WEDYrAaOOLXv-Jhtv6ViBRXSzJhL9S_k="}
          alt={subject.subjectName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Topic Requests Badge */}
        {hasRequests && (
          <div className="absolute top-3 right-3 animate-pulse">
            <div className="relative">
              <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-semibold shadow-lg border-2 border-white flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 animate-bounce" />
                <span>{subject.topicRequests} Request{subject.topicRequests > 1 ? 's' : ''}</span>
              </Badge>
              <div className="absolute -inset-1 bg-red-400 rounded-full blur opacity-40 animate-ping"></div>
            </div>
          </div>
        )}
        
        {/* Level Badge */}
        <Badge className="absolute top-3 left-3 bg-blue-900/90 hover:bg-blue-900 backdrop-blur-sm">
          {subject.Level}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-blue-900 line-clamp-1">
          {subject.subjectName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span>{subject.numberOfLessons || subject.lessons || 0} Lessons</span>
          {subject.duration && (
            <>
              <span className="text-gray-400">•</span>
              <span>{subject.duration}</span>
            </>
          )}
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

const AdminSubjects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [viewingTopic, setViewingTopic] = useState(null);
  const [viewTopicDialogOpen, setViewTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState(null);
  const [deletingTopicTitle, setDeletingTopicTitle] = useState("");
  const [deleteTopicDialogOpen, setDeleteTopicDialogOpen] = useState(false);
  const [viewingContentTopic, setViewingContentTopic] = useState(null);
  const [viewContentDialogOpen, setViewContentDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);
  const [deletingSubjectTitle, setDeletingSubjectTitle] = useState("");
  const [deleteSubjectDialogOpen, setDeleteSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editSubjectDialogOpen, setEditSubjectDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Calculate total topic requests across all subjects
  const totalTopicRequests = subjects.reduce((sum, subject) => {
    return sum + (subject.topicRequests || 0);
  }, 0);

  const getUniqueLevels = (subjects) => {
    const levels = subjects
      .map((subject) => subject.Level)
      .filter((level) => !!level);
    return Array.from(new Set(levels));
  };

  const generateTabs = (subjects) => {
    const uniqueLevels = getUniqueLevels(subjects);
    const baseTabs = [{ id: "all", label: "All" }];
    const levelTabs = uniqueLevels.map((level) => ({
      id: level,
      label: level,
    }));
    return [...baseTabs, ...levelTabs];
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setEditSubjectDialogOpen(true);
  };

  const handleSubjectUpdated = async (updatedSubject) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) => {
        const isTargetSubject =
          (subject._id &&
            updatedSubject._id &&
            subject._id === updatedSubject._id) ||
          (subject.id &&
            updatedSubject.id &&
            subject.id === updatedSubject.id) ||
          subject._id === updatedSubject.id ||
          subject.id === updatedSubject._id;

        if (isTargetSubject) {
          return {
            ...subject,
            ...updatedSubject,
            topics: updatedSubject.topics || subject.topics,
            _id: subject._id || updatedSubject._id,
            id: subject.id || updatedSubject.id,
          };
        }
        return subject;
      })
    );

    if (selectedSubject) {
      const isSelectedSubject =
        (selectedSubject._id &&
          updatedSubject._id &&
          selectedSubject._id === updatedSubject._id) ||
        (selectedSubject.id &&
          updatedSubject.id &&
          selectedSubject.id === updatedSubject.id) ||
        selectedSubject._id === updatedSubject.id ||
        selectedSubject.id === updatedSubject._id;

      if (isSelectedSubject) {
        setSelectedSubject({
          ...selectedSubject,
          ...updatedSubject,
          topics: updatedSubject.topics || selectedSubject.topics,
          _id: selectedSubject._id || updatedSubject._id,
          id: selectedSubject.id || updatedSubject.id,
        });
      }
    }
  };

  const handleViewContent = (topic) => {
    setViewingContentTopic(topic);
    setViewContentDialogOpen(true);
  };

  const handleViewTopic = (topic) => {
    setViewingTopic(topic);
    setViewTopicDialogOpen(true);
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setEditTopicDialogOpen(true);
  };

  const handleDeleteTopic = (topicId) => {
    const topic = selectedSubject?.topics?.find(
      (t) => t._id === topicId || t.id === topicId
    );

    if (topic) {
      setDeletingTopicId(topicId);
      setDeletingTopicTitle(topic.title || topic.name || "this topic");
      setDeleteTopicDialogOpen(true);
    }
  };

  const handleDeleteSubject = (subjectId) => {
    const subject = subjects.find(
      (s) => s._id === subjectId || s.id === subjectId
    );

    if (subject) {
      setDeletingSubjectId(subjectId);
      setDeletingSubjectTitle(
        subject.name || subject.title || subject.subjectName || "this subject"
      );
      setDeleteSubjectDialogOpen(true);
    }
  };

  const handleSubjectDeleted = async () => {
    await fetchSubjects();
  };

  const handleTopicUpdated = async () => {
    if (selectedSubject) {
      const subjectId = selectedSubject._id || selectedSubject.id;
      if (!subjectId) return;

      const topics = await fetchTopicsForSubject(subjectId);

      setSubjects((prev) =>
        prev.map((s) =>
          s._id === subjectId || s.id === subjectId ? { ...s, topics } : s
        )
      );

      setSelectedSubject((prev) => (prev ? { ...prev, topics } : null));
    }
  };

  const handleTopicDeleted = async () => {
    await handleTopicUpdated();
  };

  const fetchTopicsForSubject = async (subjectId) => {
    try {
      setLoadingTopics(true);
      const result = await TopicInSubjectService.getTopicsBySubjectId(
        subjectId
      );
      console.log(`Topics for subject ${subjectId}:`, result);
      return result.data || [];
    } catch (err) {
      console.error(`Failed to fetch topics for subject ${subjectId}:`, err);
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn't Load Topics",
        description: "We couldn't load the topics for this subject right now. Please try again.",
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

      return [];
    } finally {
      setLoadingTopics(false);
    }
  };

  const viewSubjectTopics = async (subject) => {
    const subjectId = subject._id || subject.id;
    if (!subjectId) return;

    try {
      setSelectedSubject(subject);
      if (!subject.topics || subject.topics.length === 0) {
        const topics = await fetchTopicsForSubject(subjectId);
        setSubjects((prev) =>
          prev.map((s) =>
            s._id === subjectId || s.id === subjectId ? { ...s, topics } : s
          )
        );
        setSelectedSubject((prev) => (prev ? { ...prev, topics } : null));
      }
    } catch (err) {
      console.error("Error viewing subject topics:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const result = await SubjectService.getAllSubjects();
      const subjectsData = result.data || [];

      setSubjects(subjectsData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setError("Failed to load subjects. Please try again.");
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn't Load Subjects",
        description: "We couldn't load the subjects right now. Please try again.",
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubjectAdded = async (newSubject) => {
    setSubjects([...subjects, newSubject]);
  };

  const handleTopicAdded = async () => {
    if (selectedSubject) {
      const subjectId = selectedSubject._id || selectedSubject.id;
      if (!subjectId) return;

      const topics = await fetchTopicsForSubject(subjectId);

      setSubjects((prev) =>
        prev.map((s) =>
          s._id === subjectId || s.id === subjectId ? { ...s, topics } : s
        )
      );

      setSelectedSubject((prev) => (prev ? { ...prev, topics } : null));
    }
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const backToSubjects = () => {
    setSelectedSubject(null);
  };

  const filteredSubjects = subjects.filter((subject) => {
    let matchesTab = false;

    if (activeTab === "all") {
      matchesTab = true;
    } else {
      matchesTab = subject.Level === activeTab;
    }

    const matchesSearch =
      !searchQuery ||
      (subject.subjectName &&
        subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()));

    const isVisible = subject.showSubject === true;

    return matchesTab && matchesSearch && isVisible;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        onClick={toggleSidebar}
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

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

      {sidebarOpen && !isLargeScreen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 w-full">
        <div className="p-4 md:p-6">
          {selectedSubject ? (
            <>
              <div className="flex items-center mb-6 mt-10 md:mt-0">
                <Button
                  variant="ghost"
                  className="mr-2 p-2 hover:bg-blue-50 rounded-lg"
                  onClick={backToSubjects}
                >
                  <ChevronLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">
                    {selectedSubject.name ||
                      selectedSubject.title ||
                      selectedSubject.subjectName ||
                      "Topics"}
                  </h1>
                  {selectedSubject.topicRequests > 0 && (
                    <Badge className="mt-1 bg-red-100 text-red-700 hover:bg-red-200">
                      <Bell className="h-3 w-3 mr-1" />
                      {selectedSubject.topicRequests} Pending Request{selectedSubject.topicRequests > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <Dialog
                  open={topicDialogOpen}
                  onOpenChange={setTopicDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                      <Plus className="h-4 w-4 mr-2" /> Add Topic
                    </Button>
                  </DialogTrigger>
                  <AddTopicDialog
                    open={topicDialogOpen}
                    onOpenChange={setTopicDialogOpen}
                    subjectId={selectedSubject._id || selectedSubject.id || ""}
                    onTopicAdded={handleTopicAdded}
                  />
                </Dialog>
              </div>

              {loadingTopics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <TopicCardShimmer key={index} />
                  ))}
                </div>
              )}

              {!loadingTopics &&
                selectedSubject.topics &&
                selectedSubject.topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedSubject.topics.map((topic, index) => (
                    <TopicCard
                      key={topic._id || topic.id || index}
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
                  <p className="text-gray-500 mb-4">
                    No topics found for this subject. Add a new topic to get
                    started.
                  </p>
                </div>
              ) : null}

              <Dialog
                open={viewTopicDialogOpen}
                onOpenChange={setViewTopicDialogOpen}
              >
                <ViewTopicDialog
                  open={viewTopicDialogOpen}
                  onOpenChange={setViewTopicDialogOpen}
                  topic={viewingTopic}
                />
              </Dialog>

              <Dialog
                open={editTopicDialogOpen}
                onOpenChange={setEditTopicDialogOpen}
              >
                <EditTopicDialog
                  open={editTopicDialogOpen}
                  onOpenChange={setEditTopicDialogOpen}
                  topic={editingTopic}
                  onTopicUpdated={handleTopicUpdated}
                />
              </Dialog>

              <Dialog
                open={deleteTopicDialogOpen}
                onOpenChange={setDeleteTopicDialogOpen}
              >
                <DeleteTopicDialog
                  open={deleteTopicDialogOpen}
                  onOpenChange={setDeleteTopicDialogOpen}
                  topicId={deletingTopicId}
                  topicTitle={deletingTopicTitle}
                  onTopicDeleted={handleTopicDeleted}
                />
              </Dialog>

              <Dialog
                open={viewContentDialogOpen}
                onOpenChange={setViewContentDialogOpen}
              >
                <ViewTopicContentDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  topic={selectedTopic}
                />
              </Dialog>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-10 md:mt-0">
                <div>
                  <h1 className="text-3xl font-bold text-blue-900 mb-1">SUBJECTS</h1>
                  {totalTopicRequests > 0 && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 animate-pulse">
                      <Bell className="h-3.5 w-3.5 mr-1.5" />
                      {totalTopicRequests} Total Request{totalTopicRequests > 1 ? 's' : ''} Pending
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
                    <AddSubjectDialog
                      open={dialogOpen}
                      onOpenChange={setDialogOpen}
                      onSubjectAdded={handleSubjectAdded}
                    />
                  </Dialog>
                </div>
              </div>

              <div className="mb-8 overflow-x-auto pb-2">
                <ul className="flex space-x-6 border-b border-gray-200 whitespace-nowrap min-w-max md:min-w-0">
                  {generateTabs(subjects).map((tab) => (
                    <li key={tab.id}>
                      <button
                        className={`py-3 px-1 transition-all duration-200 ${activeTab === tab.id
                            ? "text-blue-900 font-semibold border-b-2 border-blue-900"
                            : "text-gray-600 hover:text-blue-700"
                          }`}
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
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={fetchSubjects}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!loading && !error && filteredSubjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No subjects found. Please try a different filter or add a
                    new subject.
                  </p>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Add New Subject
                      </Button>
                    </DialogTrigger>
                    <AddSubjectDialog
                      open={dialogOpen}
                      onOpenChange={setDialogOpen}
                      onSubjectAdded={handleSubjectAdded}
                    />
                  </Dialog>
                </div>
              )}

              {!loading && !error && filteredSubjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((subject) => (
                    <EnhancedSubjectCard
                      key={subject._id || subject.id}
                      subject={subject}
                      onClickView={() => viewSubjectTopics(subject)}
                      onClickDelete={() => handleDeleteSubject(subject._id || subject.id)}
                      onUpdate={() => handleEditSubject(subject)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog
        open={deleteSubjectDialogOpen}
        onOpenChange={setDeleteSubjectDialogOpen}
      >
        <DeleteSubjectDialog
          open={deleteSubjectDialogOpen}
          onOpenChange={setDeleteSubjectDialogOpen}
          subjectId={deletingSubjectId}
          subjectTitle={deletingSubjectTitle}
          onSubjectDeleted={handleSubjectDeleted}
        />
      </Dialog>

      <Dialog
        open={editSubjectDialogOpen}
        onOpenChange={setEditSubjectDialogOpen}
      >
        <EditSubjectDialog
          open={editSubjectDialogOpen}
          onOpenChange={setEditSubjectDialogOpen}
          subject={editingSubject}
          onSubjectUpdated={handleSubjectUpdated}
        />
      </Dialog>
    </div>
  );
};

export default AdminSubjects;