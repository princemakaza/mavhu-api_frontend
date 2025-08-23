import { useEffect, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, TriangleAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

const Courses = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const config = {
          method: 'get',
          url: '/api/v1/subject/getall',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const response = await axios.request(config);
        setCourses(response.data.data); // Assuming the response has a data property with the courses array
        setFilteredCourses(response.data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (courses.length > 0) {
      const filtered = activeTab === "all"
        ? courses
        : courses.filter(course => {
          // Map API levels to our tab values
          const levelMap = {
            "A Level": "advanced level",
            "O Level": "ordinary level",
            "Primary": "primary school",
            "Tertiary": "tertiary education"
          };
          const normalizedLevel = levelMap[course.Level] || course.Level.toLowerCase();
          return normalizedLevel === activeTab;
        });
      setFilteredCourses(filtered);
    }
  }, [activeTab, courses]);

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

 <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-900"></div>
                </div>      </div>
    </div>;
  }

  if (error) {
    return <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center">
        <TriangleAlert className="h-32 w-32 text-yellow-500 mx-auto" />
        <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
        <p className="text-xl text-gray-600 mb-4">
          We couldn’t load your subjects right now. Please try again.
        </p>
        <a
          href="/courses"
          className="text-blue-500 hover:text-blue-700 underline font-medium"
        >
          Retry
        </a>
      </div>
    </div>

  }

  return (
    <div className="md:py-6 py-4">
      <SectionTitle
        title="Subjects Catalog"
        description="Explore our extensive collection of courses"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search courses..." className="pl-10 w-full sm:w-[240px]" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </SectionTitle>

      {/* <Tabs defaultValue="all" className="sticky top-0 bg-white dark:bg-slate-950 z-20 py-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="primary school">Primary School</TabsTrigger>
          <TabsTrigger value="ordinary level">Ordinary Level</TabsTrigger>
          <TabsTrigger value="advanced level">Advanced Level</TabsTrigger>
          <TabsTrigger value="tertiary education">Tertiary Education</TabsTrigger>
        </TabsList>
      </Tabs> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCourses.map(course => (
          <CourseCard
            key={course._id}
            id={course._id}
            title={course.subjectName}
            thumbnailUrl={course.imageUrl || "/default-course.png"}
            category={course.Level || "Unknown Level"}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;