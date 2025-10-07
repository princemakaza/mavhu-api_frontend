import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, MessageSquare, RotateCcwIcon, ThumbsUp, TriangleAlert } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const Lesson = () => {
  const { id, topicID } = useParams();
  const [activeTab, setActiveTab] = useState("content");
  const [commentText, setCommentText] = useState("");
  const [lessonContents, setLessonContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Replace with your actual token logic
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjBmYmYxMTI5N2JhOWQzODA3YWJlZSIsImVtYWlsIjoibWlzdGFyb25hbGRvMDJAZ21haWwuY29tIiwiaWF0IjoxNzQ3ODIzMTg5LCJleHAiOjE3NDc4NTE5ODl9.KI4GFlQjRu6ymhqj8XsIz3-9uowA-Q6Fg7gvUJoaLWk";

  useEffect(() => {
    const fetchLessonData = async () => {
      setLoading(true);
      setLessonError(null);
      try {
        const response = await axios.get(
          `http://13.61.185.238:4071/api/v1/topic_content/by-topic/${topicID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            maxBodyLength: Infinity,
          }
        );
        setLessonContents(response.data.data || []);
      } catch (error: any) {
        setLessonError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load lesson data."
        );
      } finally {
        setLoading(false);
      }
    };
    if (topicID) fetchLessonData();
  }, [topicID]);

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    // ...existing code...
    setCommentText("");
  };

  const navigate = useNavigate();

  if (loading) {
    return <div className="justify-center items-center py-[10vh] text-center gap-11">
      <div className="flex justify-center items-center">
        <div className="loader">
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
          <div className="loader-square"></div>
        </div>
      </div>
      <div className="pt-10">

        Loading Lesson...
      </div>
    </div>;
  }

  if (lessonError) {
    return <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <TriangleAlert className="h-32 w-32 text-yellow-500 mx-auto" />
        <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-xl text-gray-600 mb-4">
          We couldn’t load this subject right now. Please try again.
        </p>

        <div className="flex gap-3 mt-7 justify-center">
          <Button onClick={() => navigate(-1)} variant="ghost" className="mb-2">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
          <Button onClick={() => window.location.reload()} variant="ghost" className="mb-2">
            <RotateCcwIcon className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>

  }

  // Pick the first content as the main lesson for display
  const mainContent = lessonContents[0];

  return (
    <div className="max-w-6xl mx-auto py-4 md:py-6">
      <div className="mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-2">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>
        <h1 className="text-2xl font-bold">{mainContent?.title || "Lesson"}</h1>
        <p className="text-muted-foreground">{mainContent?.Topic?.title}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content */}
        <div className="w-full md:w-2/3">
          {/* Video or document viewer */}
          <div className="bg-black aspect-video rounded-lg overflow-hidden mb-6 flex items-center justify-center">
            {mainContent?.file_type === "video" && mainContent.file_path?.length > 0 ? (
              <video
                className="w-full h-full object-contain"
                controls
                src={mainContent.file_path.find((f: string) => f.endsWith(".mp4")) || mainContent.file_path[0]}
                poster=""
              >
                Your browser does not support the video tag.
              </video>
            ) : mainContent?.file_type === "document" && mainContent.file_path?.length > 0 ? (
              <iframe
                src={mainContent.file_path.find((f: string) => f.endsWith(".pdf")) || mainContent.file_path[0]}
                className="w-full h-full"
                title="Lesson Document"
              />
            ) : (
              <div className="text-white text-center w-full">No media available</div>
            )}
          </div>

          {/* Lesson content tabs */}
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Lesson Overview</h3>
            <p className="mb-4">{mainContent?.description}</p>
            {/* You can add more lesson details here */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg p-6 space-y-6 sticky top-6">
            {/* Topic Info */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Topic</span>
                <span>{mainContent?.Topic?.title}</span>
              </div>
              <div className="text-xs text-muted-foreground">{mainContent?.Topic?.description}</div>
            </div>

            {/* All lesson contents for this topic */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3">Lesson Contents</h3>
              <ul className="space-y-2">
                {lessonContents.map((content) => (
                  <li key={content._id} className="flex flex-col">
                    <span className="font-medium">{content.title}</span>
                    <span className="text-xs text-muted-foreground">{content.file_type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
