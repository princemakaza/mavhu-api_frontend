import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, BookOpen, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import CourseService from "@/services/Admin_Service/Subject_service";
import TopicInCourseService from "@/services/Admin_Service/Topic_InSubject_service";

// Topic Dialog Component
const AddTopicDialog = ({ courseId, onTopicAdded, open, onOpenChange }) => {
  const [topicData, setTopicData] = useState({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setTopicData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call to create topic
      const result = await TopicInCourseService.createTopic(courseId, {
        name: topicData.title,
        description: topicData.description,
      });

      // Notify parent component
      onTopicAdded(result.data);

      // Show success message
const t = toast({
  title: "✅ Topic Created Successfully",
  description: "The topic has been added to your course and is ready to use.",
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

      // Reset form and close dialog
      setTopicData({
        title: "",
        description: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create topic:", error);
    const t = toast({
  variant: "destructive",
  title: "Oops! Couldn’t Create Topic",
 
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

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add New Topic</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Topic Title</Label>
          <Input
            id="title"
            value={topicData.title}
            onChange={handleChange}
            placeholder="Enter topic title"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={topicData.description}
            onChange={handleChange}
            placeholder="Topic description..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Topic"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Topic Card Component
const TopicCard = ({ topic, courseId, onTopicUpdated, onTopicDeleted }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    title: topic.name || topic.title,
    description: topic.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditData((prev) => ({ ...prev, [id]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await TopicInCourseService.updateTopic(
        courseId,
        topic._id,
        {
          name: editData.title,
          description: editData.description,
        }
      );

      onTopicUpdated(result.data);
      setEditDialogOpen(false);
      toast({
        title: "Topic updated",
        description: "The topic has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update topic:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to update topic. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await TopicInCourseService.deleteTopic(courseId, topic._id);
      onTopicDeleted(topic._id);
      setDeleteDialogOpen(false);
      toast({
        title: "Topic deleted",
        description: "The topic has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete topic:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to delete topic. Please try again.",
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="font-medium text-lg mb-2">{topic.name || topic.title}</h3>
      {topic.description && (
        <p className="text-gray-600 text-sm mb-4">{topic.description}</p>
      )}
      <div className="flex justify-end gap-2">
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Topic</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this topic? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [addTopicDialogOpen, setAddTopicDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Format category for display
  const formatCategory = (cat) => {
    if (!cat) return "";
    // Format category strings like "a-level" to "A' Level"
    const categoryMap = {
      "o-level": "O' Level",
      "a-level": "A' Level",
      tertiary: "Tertiary",
    };
    return categoryMap[cat.toLowerCase()] || cat;
  };

  // Fetch course and topics
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResult = await CourseService.getCourseById(id);
        setCourse(courseResult.data);

        // Fetch topics for this course
        const topicsResult = await TopicInCourseService.getAllTopics(id);
        setTopics(topicsResult.data || []);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch course data:", err);
        setError(
          "Failed to load course details. The course may not exist or you may not have permission to view it."
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, toast]);

  // Handler to add a new topic
  const handleTopicAdded = (newTopic) => {
    setTopics((prev) => [...prev, newTopic]);
  };

  // Handler to update a topic
  const handleTopicUpdated = (updatedTopic) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic._id === updatedTopic._id ? updatedTopic : topic
      )
    );
  };

  // Handler to delete a topic
  const handleTopicDeleted = (topicId) => {
    setTopics((prev) => prev.filter((topic) => topic._id !== topicId));
  };

  // Handler to delete the course
  const handleDeleteCourse = async () => {
    try {
      await CourseService.deleteCourse(id);
      const t = toast({
        title: "✅ Course Deleted Successfully",
        description: "The course has been deleted and removed from your list.",
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

      navigate("/admin/courses");
    } catch (error) {
      console.error("Failed to delete course:", error);
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn’t Delete Course",
        description:
          error.message || "We couldn’t delete the course right now. Please try again.",
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
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
       <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg my-4">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => navigate("/admin/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg my-4">
          <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
          <p className="mb-4">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/admin/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block w-64">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto p-4 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
            </Button>
          </div>

          {/* Course Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{formatCategory(course.category)}</Badge>
                </div>
                <h1 className="text-2xl font-bold mb-2">
                  {course.name || course.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <div className="flex items-center mr-4">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>
                      {course.numberOfLessons || course.lessons} Lessons
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                {course.description && (
                  <p className="text-gray-700">{course.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/admin/courses/${id}/edit`)}
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Course</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this course? All related
                        content, topics, and lessons will be permanently
                        removed. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCourse}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-700">
                      {course.description || "No description available."}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Details</h3>
                    <dl className="grid grid-cols-2 gap-y-2">
                      <dt className="text-gray-600">Category:</dt>
                      <dd>{formatCategory(course.category)}</dd>
                      <dt className="text-gray-600">Lessons:</dt>
                      <dd>{course.numberOfLessons || course.lessons}</dd>
                      <dt className="text-gray-600">Duration:</dt>
                      <dd>{course.duration}</dd>
                      <dt className="text-gray-600">Topics:</dt>
                      <dd>{topics.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Topics Tab */}
            <TabsContent value="topics">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Topics</h2>
                  <Dialog
                    open={addTopicDialogOpen}
                    onOpenChange={setAddTopicDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add Topic
                      </Button>
                    </DialogTrigger>
                    <AddTopicDialog
                      courseId={id}
                      onTopicAdded={handleTopicAdded}
                      open={addTopicDialogOpen}
                      onOpenChange={setAddTopicDialogOpen}
                    />
                  </Dialog>
                </div>

                {topics.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      No topics have been added to this course yet.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" /> Add Your First Topic
                        </Button>
                      </DialogTrigger>
                      <AddTopicDialog
                        courseId={id}
                        onTopicAdded={handleTopicAdded}
                        open={addTopicDialogOpen}
                        onOpenChange={setAddTopicDialogOpen}
                      />
                    </Dialog>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <TopicCard
                        key={topic._id}
                        topic={topic}
                        courseId={id}
                        onTopicUpdated={handleTopicUpdated}
                        onTopicDeleted={handleTopicDeleted}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Lessons Tab */}
            <TabsContent value="lessons">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Lessons</h2>
                <p className="text-gray-500">
                  Lesson management will be implemented in the future.
                </p>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Enrolled Students
                </h2>
                <p className="text-gray-500">
                  Student enrollment information will be implemented in the
                  future.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
