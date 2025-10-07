import { useState, useRef, useEffect } from "react";
import { Upload, Home } from "lucide-react";

// SubjectService - moved inline since we can't import external files
const SubjectService = {
  getAllSubjects: async () => {
    const url = "http://13.61.185.238:4071/api/v1/subject/getall";
    const token = localStorage.getItem("adminToken");
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // eslint-disable-next-line no-useless-catch
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to retrieve subjects");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default function BookUploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [bookData, setBookData] = useState({
    subject: "",
    level: "",
    authorFullName: "",
    description: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await SubjectService.getAllSubjects();
        setSubjects(response.data || response.subjects || []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        alert("Failed to load subjects. Please refresh the page.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const selectedFile = files[0];

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/epub+zip",
      "application/x-mobipocket-ebook",
    ];
    const allowedExtensions = [".pdf", ".epub", ".mobi"];

    const fileExtension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      alert("Please upload a PDF, EPUB, or MOBI file.");
      return;
    }

    // Check file size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      alert("Please upload a file smaller than 50MB.");
      return;
    }

    setFile(selectedFile);
  };

  // Handle click on browse button
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simulate file upload (replace with actual Supabase upload)
  const uploadFileToSupabase = async (file) => {
    try {
      if (!file) return null;

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // For demo purposes, return a mock URL
      // Replace this with actual Supabase upload logic
      return `https://example.com/uploads/${Date.now()}_${file.name}`;
    } catch (error) {
      console.error("Error in file upload:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!file) {
      alert("Please select a book file to upload.");
      return;
    }

    if (
      !bookData.subject ||
      !bookData.level ||
      !bookData.authorFullName ||
      !bookData.description
    ) {
      alert(
        "Please fill in all book details (subject, level, author, and description)."
      );
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload the file and get the URL
      const uploadedFileUrl = await uploadFileToSupabase(file);

      if (!uploadedFileUrl) {
        throw new Error("Failed to upload file");
      }

      // Prepare the book data according to your backend requirements
      const completeBookData = {
        subject: bookData.subject, // Subject _id
        level: bookData.level.trim(),
        authorFullName: bookData.authorFullName.trim(),
        filePath: uploadedFileUrl,
        description: bookData.description.trim(),
      };

      console.log("Book data prepared for backend:", completeBookData);

      // Here you would send the book data to your backend API
      // Example:
      // const response = await fetch('/api/books', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem("adminToken")}`
      //   },
      //   body: JSON.stringify(completeBookData)
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to save book data');
      // }

      alert(`Book uploaded successfully!`);

      // Reset form after successful submission
      setFile(null);
      setBookData({
        subject: "",
        level: "",
        authorFullName: "",
        description: "",
      });
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload book:", error);
      const errorMessage =
        error.message || "Failed to upload book. Please try again.";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="flex w-full max-w-3xl mx-auto">
        {/* Left Panel - Upload Section */}
        <div className="w-1/2 border-r border-gray-200 p-8 bg-white">
          <div
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 h-64 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : file
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.epub,.mobi"
              disabled={isSubmitting}
            />

            <Upload
              size={32}
              className={`mb-3 ${
                isDragging
                  ? "text-blue-500"
                  : file
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />

            <div className="text-center">
              {file ? (
                <div>
                  <p className="text-green-600 font-medium">
                    File selected: {file.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : isDragging ? (
                <p className="text-blue-600 font-medium">Drop your file here</p>
              ) : (
                <>
                  <p className="text-gray-700 font-medium">
                    Drag and drop book file
                  </p>
                  <p className="text-gray-500 mt-1">or</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Supported formats: PDF, EPUB, MOBI
                  </p>
                </>
              )}

              <button
                type="button"
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-medium transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "UPLOADING..." : "BROWSE"}
              </button>
            </div>
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:underline cursor-pointer text-sm"
            >
              return to library
            </button>
          </div>
        </div>

        {/* Right Panel - Book Info & Illustration */}
        <div className="w-1/2 p-8 bg-gray-50 flex flex-col">
          {/* Illustration at top */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="bg-blue-100 rounded-lg p-4 w-48 mb-2">
                <div className="bg-blue-500 h-6 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>

              {/* Blue circle in top right */}
              <div className="absolute -top-2 -right-2 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                <div className="text-white text-xs">•••</div>
              </div>

              {/* Character illustration */}
              <div className="absolute bottom-0 right-0 transform translate-y-1/2">
                <div className="flex">
                  <div className="bg-pink-500 w-6 h-12 rounded-t-lg"></div>
                  <div className="bg-purple-600 w-6 h-14 rounded-t-lg"></div>
                </div>
              </div>

              {/* Home button */}
              <div className="absolute bottom-0 right-16 bg-blue-400 rounded-full w-10 h-10 flex items-center justify-center transform translate-y-1/2">
                <Home size={20} className="text-white" />
              </div>

              {/* Other colorful elements */}
              <div className="absolute bottom-0 left-0 bg-yellow-400 w-8 h-8 rounded-full transform translate-y-1/2"></div>
              <div className="absolute bottom-4 left-10 bg-green-400 w-6 h-6 rounded-full"></div>
            </div>
          </div>

          {/* Book Details Fields */}
          <div className="space-y-4 mt-8">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={bookData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isLoadingSubjects}
                required
              >
                <option value="">
                  {isLoadingSubjects
                    ? "Loading subjects..."
                    : "Select a subject"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name || subject.title || subject.subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Level *
              </label>
              <input
                type="text"
                id="level"
                name="level"
                value={bookData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter book level (e.g., Grade 5, High School)"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="authorFullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Author Full Name *
              </label>
              <input
                type="text"
                id="authorFullName"
                name="authorFullName"
                value={bookData.authorFullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter author full name"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={bookData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter book description"
                disabled={isSubmitting}
                required
              ></textarea>
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              className="w-full py-2 bg-blue-600 text-white rounded-md font-medium transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "UPLOADING..." : "UPLOAD BOOK"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
