import { useState, useRef, useEffect } from "react";
import { Upload, Home, Image, BookOpen, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LibraryService from "@/services/Library_service";
import SubjectService from "@/services/Admin_Service/Subject_service";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/helper/SupabaseClient";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

export default function BookUploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [isCoverDragging, setIsCoverDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [error, setError] = useState(null);
  const [bookTitle, setBookTitle] = useState("");
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [groupLevel, setGroupLevel] = useState("Form 4");
  const [groupSubject, setGroupSubject] = useState("");
  const [authorFullName, setAuthorFullName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // New state for subjects
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Accepted file types
  const acceptedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  // Accepted image types
  const acceptedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

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

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        const data = await SubjectService.getAllSubjects();

        // Handle different response structures
        let subjectsArray = [];
        if (Array.isArray(data)) {
          subjectsArray = data;
        } else if (data && Array.isArray(data.subjects)) {
          subjectsArray = data.subjects;
        } else if (data && Array.isArray(data.data)) {
          subjectsArray = data.data;
        } else {
          console.error("Unexpected data structure:", data);
          subjectsArray = [];
        }

        setSubjects(subjectsArray);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Sanitize filenames for Supabase compatibility
  const sanitizeFilename = (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9!\-_.*'()]/g, '_')
      .replace(/~+/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_');
  };

  const handleDragEnter = (e, isCover = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCover) {
      setIsCoverDragging(true);
    } else {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e, isCover = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCover) {
      setIsCoverDragging(false);
    } else {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e, isCover = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCover) {
      setIsCoverDragging(true);
    } else {
      setIsDragging(true);
    }
  };

  const handleDrop = (e, isCover = false) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCover) {
      setIsCoverDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleCoverFiles(e.dataTransfer.files);
      }
    } else {
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleCoverFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleCoverFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const selectedFile = files[0];

    // Check if file type is allowed
    if (!acceptedFileTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF, Word, or PowerPoint file");
      return;
    }

    setFile(selectedFile);
    setBookTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setError(null);
    setUploadProgress(0);
  };

  const handleCoverFiles = (files) => {
    const selectedFile = files[0];

    // Check if file type is allowed
    if (!acceptedImageTypes.includes(selectedFile.type)) {
      setError("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5MB");
      return;
    }

    setCoverFile(selectedFile);
    setError(null);
    setCoverUploadProgress(0);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleCoverBrowseClick = () => {
    coverInputRef.current.click();
  };

  // Helper function to validate and clean string inputs
  const validateAndCleanString = (value, fieldName) => {
    if (!value || typeof value !== "string") {
      throw new Error(`${fieldName} is required`);
    }
    const cleaned = value.trim();
    if (cleaned.length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }
    return cleaned;
  };

  // Helper function to validate ObjectId
  const validateObjectId = (value, fieldName) => {
    if (!value || typeof value !== "string") {
      throw new Error(`${fieldName} is required`);
    }
    const cleaned = value.trim();
    if (cleaned.length === 0) {
      throw new Error(`${fieldName} cannot be empty`);
    }
    // Basic ObjectId format validation (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(cleaned)) {
      throw new Error(`${fieldName} has invalid format`);
    }
    return cleaned;
  };

  const uploadFileToSupabase = async (file, bucket, setProgress) => {
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
        onProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(progress);
        },
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get file URL after upload");
    }

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploadProgress(0);
    setCoverUploadProgress(0);

    try {
      // Pre-validation before starting upload
      if (!file) {
        throw new Error("Please select a file to upload");
      }

      if (!coverFile) {
        throw new Error("Please select a cover image");
      }

      // Validate all form fields before proceeding
      const cleanedAuthor = validateAndCleanString(
        authorFullName,
        "Author name"
      );
      const cleanedLevel = validateAndCleanString(groupLevel, "Level");
      const cleanedSubject = validateObjectId(groupSubject, "Subject");
      const cleanedDescription = description.trim();

      console.log("Pre-validation passed:", {
        author: cleanedAuthor,
        level: cleanedLevel,
        subject: cleanedSubject,
      });
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setIsLoading(true);
    setIsLoadingCover(true);
    let filePath = "";
    let coverImagePath = "";

    try {
      // Upload cover image first
      coverImagePath = await uploadFileToSupabase(
        coverFile,
        "topics",
        setCoverUploadProgress
      );
      console.log("Cover image uploaded successfully. URL:", coverImagePath);

      // Upload main file
      filePath = await uploadFileToSupabase(
        file,
        "topics",
        setUploadProgress
      );
      console.log("File uploaded successfully. URL:", filePath);

      // Prepare book data for JSON submission
      const bookData = {
        title: bookTitle.trim(),
        level: groupLevel.trim(),
        subject: groupSubject.trim(),
        cover_image: coverImagePath,
        authorFullName: authorFullName.trim(),
        file_path: filePath,
        file_type: "document",
        description: description.trim(),
        showBook: true,
      };

      console.log("Submitting book data:", bookData);

      // Create book record
      const createResponse = await LibraryService.createBook(bookData);
      console.log("Book creation response:", createResponse);

      if (!createResponse || createResponse.error) {
        const errorMsg = createResponse?.message || "Book creation failed";
        console.error("Book creation failed:", createResponse);
        throw new Error(errorMsg);
      }

      // Reset form on success
      setFile(null);
      setCoverFile(null);
      setBookTitle("");
      setAuthorFullName("");
      setDescription("");
      setGroupSubject("");
      setGroupLevel("Form 4");
      setUploadProgress(0);
      setCoverUploadProgress(0);

      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }

      const t = toast({
        title: "✅ Book Uploaded Successfully",
        description: "Your book has been uploaded and is ready to use.",
        variant: "default",
        duration: 8000,
        action: (
          <Button
            variant="secondary"
            className="bg-green-600 text-white hover:bg-green-700"
            onClick={() => t.dismiss()}
          >
            Got it
          </Button>
        ),
      });

    } catch (err) {
      console.error("Upload error:", err);

      // Detailed error handling
      let errorMsg = "Upload failed. Please try again.";
      if (err.message) errorMsg = err.message;
      if (err.response?.data?.error) errorMsg = err.response.data.error;
      if (err.response?.data?.message) errorMsg = err.response.data.message;

      setError(errorMsg);
      const t = toast({
        variant: "destructive",
        title: "Oops! Upload Failed",
        description: errorMsg || "We couldn't upload your book. Please try again.",
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
      setIsLoading(false);
      setIsLoadingCover(false);
    }
  };

  // Get file type display name
  const getFileTypeDisplay = (file) => {
    if (!file) return "";
    if (file.type === "application/pdf") return "PDF";
    if (file.type.includes("word")) return "Word";
    if (file.type.includes("powerpoint")) return "PowerPoint";
    return file.type.split("/").pop().toUpperCase();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
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
      <div className="flex-1 w-full p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen size={28} />
                <h1 className="text-2xl font-bold">Upload New Book</h1>
              </div>
              <Link
                to="/library"
                className="text-blue-100 hover:text-white transition-colors text-sm flex items-center"
              >
                ← Return to Library
              </Link>
            </div>
            <p className="mt-2 text-blue-100">
              Add a new book to your library collection
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - File Uploads */}
              <div className="space-y-6">
                {/* Book File Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <Upload size={18} className="mr-2" />
                    Book File
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 h-48 ${isDragging
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
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                    />

                    <Upload
                      size={32}
                      className={`mb-3 ${isDragging
                        ? "text-blue-500"
                        : file
                          ? "text-green-500"
                          : "text-gray-400"
                        }`}
                    />

                    <div className="text-center">
                      {file ? (
                        <>
                          <p className="text-green-600 font-medium truncate max-w-xs">{file.name}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {getFileTypeDisplay(file)} •{" "}
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>

                          {/* Upload progress indicator */}
                          {isLoading && uploadProgress > 0 && (
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploading: {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </>
                      ) : isDragging ? (
                        <p className="text-blue-600 font-medium">Drop your file here</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium">
                            Drag and drop file
                          </p>
                          <p className="text-gray-500 text-sm mt-1">PDF, Word, or PowerPoint</p>
                          <p className="text-gray-500 text-sm mt-1">or</p>
                        </>
                      )}

                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBrowseClick();
                        }}
                      >
                        BROWSE FILES
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Image size={18} className="mr-2" />
                    Cover Image
                  </h3>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 h-48 ${isCoverDragging
                      ? "border-blue-500 bg-blue-50"
                      : coverFile
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-blue-400"
                      }`}
                    onDragEnter={(e) => handleDragEnter(e, true)}
                    onDragLeave={(e) => handleDragLeave(e, true)}
                    onDragOver={(e) => handleDragOver(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                    onClick={handleCoverBrowseClick}
                  >
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverFileChange}
                      className="hidden"
                      accept="image/*"
                    />

                    <Image
                      size={32}
                      className={`mb-3 ${isCoverDragging
                        ? "text-blue-500"
                        : coverFile
                          ? "text-green-500"
                          : "text-gray-400"
                        }`}
                    />

                    <div className="text-center">
                      {coverFile ? (
                        <>
                          <div className="flex justify-center mb-2">
                            <img
                              src={URL.createObjectURL(coverFile)}
                              alt="Cover preview"
                              className="h-16 object-contain rounded border"
                            />
                          </div>
                          <p className="text-green-600 font-medium text-sm truncate max-w-xs">{coverFile.name}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {(coverFile.size / (1024)).toFixed(2)} KB
                          </p>

                          {/* Upload progress indicator */}
                          {isLoadingCover && coverUploadProgress > 0 && (
                            <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${coverUploadProgress}%` }}
                              ></div>
                              <p className="text-xs text-gray-500 mt-1">
                                Uploading: {coverUploadProgress}%
                              </p>
                            </div>
                          )}
                        </>
                      ) : isCoverDragging ? (
                        <p className="text-blue-600 font-medium">Drop your image here</p>
                      ) : (
                        <>
                          <p className="text-gray-700 font-medium">
                            Drag and drop image
                          </p>
                          <p className="text-gray-500 text-sm mt-1">JPG, PNG, or WebP</p>
                          <p className="text-gray-500 text-sm mt-1">Max 5MB</p>
                          <p className="text-gray-500 text-sm mt-1">or</p>
                        </>
                      )}

                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCoverBrowseClick();
                        }}
                      >
                        BROWSE IMAGES
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Book Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Book Details</h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter book title"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="level"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Level*
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={groupLevel}
                      onChange={(e) => setGroupLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select level</option>
                      <option value="O Level">O Level</option>
                      <option value="A Level">A Level</option>
                      <option value="Others">Others</option>
     
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Subject*
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={groupSubject}
                      onChange={(e) => setGroupSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100"
                      disabled={isLoadingSubjects}
                      required
                    >
                      <option value="">
                        {isLoadingSubjects ? "Loading subjects..." : "Select subject"}
                      </option>
                      {Array.isArray(subjects) &&
                        subjects.map((subject, index) => {
                          const subjectId = subject._id || subject.id;
                          const subjectName =
                            subject.subjectName || subject.name || "Unknown Subject";
                          return (
                            <option key={subjectId || index} value={subjectId}>
                              {subjectName}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="author"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Author*
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={authorFullName}
                      onChange={(e) => setAuthorFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter author name"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter book description (optional)"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || isLoadingSubjects || isLoadingCover}
                    className={`w-full py-3 ${isLoading || isLoadingSubjects || isLoadingCover
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-900 hover:bg-blue-800"
                      } text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {uploadProgress > 0 || coverUploadProgress > 0
                          ? `UPLOADING (${Math.max(uploadProgress, coverUploadProgress)}%)`
                          : "PROCESSING..."
                        }
                      </span>
                    ) : isLoadingSubjects ? (
                      "LOADING SUBJECTS..."
                    ) : (
                      "UPLOAD BOOK"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}