import React, { useState, useEffect } from "react";
import { BookOpen, Loader2, Menu, X, Download, Trash2, Heart, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { Link } from "react-router-dom";
import LibraryService from "@/services/Library_service";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@radix-ui/react-hover-card";
import { Card, CardContent } from "@/components/ui/card";
import libraryimage from "@/assets/library.png";
import b1 from "@/assets/libBanners/libbanner1.png";
import b2 from "@/assets/libBanners/libbanner2.png";

const Library = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);

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

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await LibraryService.getAllBooks();
        console.log(response.data);
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load books");
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const openDeleteConfirmation = (bookId) => {
    setConfirmDelete(bookId);
  };

  const handleViewDocument = (book) => {
    setSelectedBook(book);
    setShowBookModal(true);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setSelectedBook(null);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleLike = (e, bookId) => {
    e.stopPropagation();
    // Add your like functionality here
  };

  const confirmDeleteBook = async () => {
    try {
      await LibraryService.deleteBook(confirmDelete);
      setBooks((prev) => prev.filter((book) => book._id !== confirmDelete));
      setConfirmDelete(null);
    } catch (err) {
      alert("Failed to delete book");
      setConfirmDelete(null);
    }
  };

  // Updated loading shimmer component to match current UI
  const BookCardShimmer = () => (
    <Card className="w-full flex flex-col animate-pulse">
      {/* Image placeholder */}
      <div className="relative h-48 sm:h-52 md:h-40 lg:h-44 xl:h-48 bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="absolute top-2 left-2 bg-gray-400 px-2 py-1 rounded text-xs w-8 h-4"></div>
      </div>

      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
        {/* Subject tag */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-gray-300"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>

        {/* Title */}
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-1.5"></div>

        {/* Author */}
        <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>

        {/* Description */}
        <div className="space-y-1 mb-3 flex-grow">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>

        {/* Bottom section */}
        <div className="flex justify-between items-center mt-auto pt-2">
          {/* Like button and count */}
          <div className="flex items-center gap-1">
            <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
            <div className="h-3 bg-gray-300 rounded w-4"></div>
          </div>

          {/* Download button */}
          <div className="h-7 w-7 bg-gray-300 rounded-full"></div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 p-4">
        <div className="text-center">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this book?</p>
            <div className="flex justify-end space-x-3">
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={cancelDelete}
              >
                No
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteBook}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {showBookModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeBookModal}
                className="hover:bg-white/50"
              >
                <X size={24} />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-120px)]">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Book Cover */}
                <div className="lg:w-1/3 flex-shrink-0">
                  <div className="relative">
                    <img
                      src={selectedBook.cover_image || libraryimage}
                      alt={selectedBook.title}
                      className="w-full h-64 sm:h-80 object-cover rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.src = libraryimage;
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-[#032155] text-white px-3 py-1 rounded-full text-sm font-medium">
                      PDF
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 sm:mt-6 space-y-3">
                    <Button
                      className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                      onClick={() => {
                        if (selectedBook.file_path) {
                          window.open(selectedBook.file_path, "_blank");
                        }
                      }}
                      disabled={!selectedBook.file_path}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Document
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (selectedBook.file_path) {
                          window.open(selectedBook.file_path, "_blank");
                        }
                      }}
                      disabled={!selectedBook.file_path}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Book Information */}
                <div className="lg:w-2/3">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Title and Subject */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="h-2 w-2 rounded-full bg-blue-900"></div>
                        <span className="text-xs sm:text-sm font-medium text-blue-900 uppercase">
                          {selectedBook.subject?.subjectName || selectedBook.subject || "N/A"}
                        </span>
                        {selectedBook.level && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              {selectedBook.level}
                            </span>
                          </>
                        )}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {selectedBook.title || "Untitled"}
                      </h1>
                      <p className="text-base sm:text-lg text-gray-600">
                        By {selectedBook.authorFullName || "Unknown Author"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4 border-y border-gray-200">
                      <div className="flex items-center gap-2">
                        <Heart
                          className="h-5 w-5 text-red-500"
                          fill={selectedBook.likes?.some(like => like.student) ? "currentColor" : "none"}
                        />
                        <span className="font-medium text-gray-900">
                          {selectedBook.likesCount || selectedBook.likes?.length || 0}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {(selectedBook.likesCount || selectedBook.likes?.length || 0) === 1 ? 'Like' : 'Likes'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        <span className="font-medium text-gray-900">PDF</span>
                        <span className="text-gray-500 text-sm">Document</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {selectedBook.description || "No description available for this book."}
                      </p>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">File Type</h4>
                        <p className="text-gray-600 capitalize text-sm sm:text-base">
                          {selectedBook.file_type || "Document"}
                        </p>
                      </div>

                      {selectedBook.level && (
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Level</h4>
                          <p className="text-gray-600 text-sm sm:text-base">{selectedBook.level}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 w-full overflow-x-hidden">
        <div className="w-full min-h-screen p-3 sm:p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-3 sm:space-y-0 mt-12 sm:mt-10 md:mt-0">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-900">LIBRARY</h1>

            {/* Upload Resources Button */}
            <Link to="/reserourceupload" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto border-2 border-blue-900 bg-white hover:bg-blue-50 text-blue-900 px-4 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base">
                UPLOAD RESOURCES
              </Button>
            </Link>
          </div>

          {/* Books Grid - Improved responsiveness */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {loading ? (
              // Show shimmer loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <BookCardShimmer key={index} />
              ))
            ) : (
              // Show actual book cards when data is loaded
              books.map((book) => (
                <Card
                  key={book._id}
                  className="w-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative"
                  onClick={() => handleViewDocument(book)}
                >
                  <div className="relative h-48 sm:h-52 md:h-40 lg:h-44 xl:h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                    <img
                      src={book.cover_image || libraryimage}
                      alt={book.authorFullName || "Book cover"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target;
                        target.src = libraryimage;
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-[#032155] text-white px-2 py-1 rounded text-xs font-medium">
                      PDF
                    </div>

                    {/* DELETE ICON — top-right on the card */}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 hover:bg-white shadow-sm"
                        title="Delete book"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirmation(book._id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span className="text-xs font-medium text-primary uppercase truncate">
                        {book.subject?.subjectName || book.subject || "N/A"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 min-h-[2.5rem]">
                      {book.title || "Untitled"}
                    </h3>

                    <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                      By {book.authorFullName || "Unknown Author"}
                    </p>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">
                      {book.description || "No description available"}
                    </p>

                    {/* Bottom section with like and download buttons */}
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
                      {/* Like button and count on the left */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 rounded-full ${book.likes?.some(like => like.student) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                          onClick={(e) => handleLike(e, book._id)}
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={book.likes?.some(like => like.student) ? "currentColor" : "none"}
                          />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {book.likesCount || book.likes?.length || 0}
                        </span>
                      </div>

                      {/* Download button on the right */}
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full bg-muted hover:bg-muted/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (book.file_path) {
                                window.open(book.file_path, "_blank");
                              }
                            }}
                            disabled={!book.file_path}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto p-2 text-sm">
                          Save for later
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Empty State */}
          {!loading && books.length === 0 && (
            <div className="text-center py-12 px-4">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm sm:text-base text-gray-500">Get started by uploading your first resource.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;