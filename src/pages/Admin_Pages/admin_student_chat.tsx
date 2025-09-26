import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Paperclip, X, Users, MessageCircle, Clock, Search, BookOpen, PlayCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import HelpDeskService from '@/services/Admin_Service/help_desk_services';
import Sidebar from '@/components/Sidebar';
import { supabase } from "@/helper/SupabaseClient";
import { MathfieldElement } from "mathlive";
import TopicContentService from '@/services/Admin_Service/Topic_Content_service';

/* ----------------------------- Utilities ----------------------------- */

// Safe no-op
const noop = () => {};

// Detect \( ... \) or \[ ... \] wrappers
const isWrappedLatex = (val?: string) => {
  if (typeof val !== 'string') return false;
  const t = val.trim();
  return (t.startsWith('\\(') && t.endsWith('\\)')) || (t.startsWith('\\[') && t.endsWith('\\]'));
};

// Extract inner LaTeX from wrapped text
const extractLatexFromText = (val?: string) => {
  if (typeof val !== 'string') return '';
  const t = val.trim();
  if (t.startsWith('\\(') && t.endsWith('\\)')) return t.slice(2, -2);
  if (t.startsWith('\\[') && t.endsWith('\\]')) return t.slice(2, -2);
  return t;
};

/* ----------------------------- MathLive (read-only) ----------------------------- */

const MathLiveView: React.FC<{
  value?: string;
  placeholder?: string;
  className?: string;
}> = ({ value = "", placeholder = "", className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mfRef = useRef<MathfieldElement | null>(null);

  useEffect(() => {
    // Create once
    if (!containerRef.current || mfRef.current) return;
    const mf = new MathfieldElement();
    mfRef.current = mf;

    // Options for read-only view
    mf.setOptions({
      defaultMode: "math",
      smartMode: true,
      virtualKeyboardMode: "off",
      readOnly: true,
    });

    // Base styles
    mf.style.width = "100%";
    mf.style.pointerEvents = "none";
    mf.style.backgroundColor = "transparent";
    mf.style.minHeight = "auto";
    mf.style.padding = "0";
    mf.style.border = "none";

    containerRef.current.appendChild(mf);

    return () => {
      mf.remove();
      mfRef.current = null;
    };
  }, []);

  // Keep value in sync
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    const latex = extractLatexFromText(value || "");
    if (mf.value !== latex) mf.value = latex;
  }, [value]);

  if (!value) {
    return <div className={`text-gray-400 italic text-sm ${className}`}>{placeholder}</div>;
  }

  return <div className={className}><div ref={containerRef} /></div>;
};

// Lightweight wrapper to show MathLive when the string is wrapped LaTeX, else plain text.
const MathOrText: React.FC<{ value?: string; placeholder?: string; className?: string; }> = ({ value = '', placeholder = '', className = '' }) => {
  if (isWrappedLatex(value)) {
    return <MathLiveView value={value} placeholder={placeholder} className={className} />;
  }
  return <p className={`text-sm text-gray-900 whitespace-pre-wrap ${className}`}>{value || placeholder}</p>;
};

/* ----------------------------- Shimmers ----------------------------- */

const Shimmer = ({ className }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
    style={{ animation: 'shimmer 1.5s infinite linear' }}
  >
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
  </div>
);

const ConversationShimmer = () => (
  <div className="p-4 border-b border-gray-100">
    <div className="flex items-start gap-3">
      <Shimmer className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Shimmer className="h-4 w-32 rounded" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
        <Shimmer className="h-3 w-48 rounded" />
        <Shimmer className="h-2 w-2 rounded-full" />
      </div>
    </div>
  </div>
);

const MessageShimmer = ({ isAdmin }) => (
  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[70%] ${isAdmin ? 'order-2' : 'order-1'}`}>
      <Shimmer className={`px-4 py-2 rounded-lg h-16 ${isAdmin ? 'ml-auto' : 'mr-auto'}`} />
      <Shimmer className={`h-3 w-16 mt-1 rounded ${isAdmin ? 'ml-auto' : 'mr-auto'}`} />
    </div>
  </div>
);

/* ----------------------------- Media Helpers ----------------------------- */

const isImageUrl = (url: string) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

const getFilenameFromUrl = (url: string) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('?')[0];
  } catch {
    return 'Attachment';
  }
};

const ImageWithShimmer: React.FC<{ src: string; alt: string; className?: string; }> = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  return (
    <div className={`relative ${className || ''}`}>
      {loading && <Shimmer className="absolute inset-0 rounded-lg" />}
      {!error ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          className={`${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90`}
          onClick={() => window.open(src, '_blank')}
        />
      ) : (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg text-gray-500 text-sm">
          <Paperclip className="w-4 h-4 mr-2" />
          Failed to load image
        </div>
      )}
    </div>
  );
};

/* ----------------------------- Topic UI ----------------------------- */

const TopicContentReference: React.FC<{ topicContent: any; lessonInfoId: string; onClick: () => void; }> = ({ topicContent, lessonInfoId, onClick }) => {
  return (
    <div
      className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded cursor-pointer hover:bg-blue-100 transition-colors mb-2"
      onClick={onClick}
      title="View lesson details"
    >
      <div className="flex items-start gap-2">
        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900 truncate">
            {topicContent?.title ?? 'Topic'}
          </p>
          <p className="text-xs text-blue-700 truncate">
            {topicContent?.description ?? 'Open lesson details'}
          </p>
          {lessonInfoId && (
            <p className="text-[11px] text-blue-700/70 mt-1">Lesson ID: <span className="font-mono">{lessonInfoId}</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------- TopicContent Modal (Lesson Only) ---------------------- */

const TopicContentModal: React.FC<{
  topicContent: any;
  lessonInfoId: string;
  onClose: () => void;
}> = ({ topicContent, lessonInfoId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<any | null>(null);
  const [topicMeta, setTopicMeta] = useState<{ title?: string; description?: string; _id?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NEW: keep the ids we need for navigation
  const [contentId, setContentId] = useState<string | null>(null);
  const [topicIdState, setTopicIdState] = useState<string | null>(null);

  // useNavigate inside the modal
  const navigate = useNavigate();

  // Resolve id safely from either object or string
  const topicId = typeof topicContent === 'string' ? topicContent : topicContent?._id;

  // Navigate helper
  const NavigateToEditContent = (cid: string, tid: string) => {
    console.log("Navigating to edit content with ID:", cid);
    navigate(`/admin_dashboard/courses/topics/${tid}/content/edit/${cid}`);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!topicId) {
          throw new Error('Missing topic content id.');
        }

        const resp = await TopicContentService.getTopicContentById(topicId);
        // Expected shape: { message: "...", data: { ... full topic content ... } }
        const data = resp?.data?.data || resp?.data; // defensive
        if (!data) throw new Error('No topic content found.');

        // Save IDs for navigation
        const fetchedContentId = String(data?._id || '');
        const fetchedTopicId = String(data?.Topic?._id || '');
        if (mounted) {
          setContentId(fetchedContentId || null);
          setTopicIdState(fetchedTopicId || null);
        }

        const foundLesson = Array.isArray(data.lesson)
          ? data.lesson.find((l: any) => String(l?._id) === String(lessonInfoId))
          : null;

        if (!foundLesson) {
          throw new Error('Requested lesson not found in this topic.');
        }

        if (mounted) {
          setTopicMeta({
            _id: data._id,
            title: data.title,
            description: data.description,
          });
          setLesson(foundLesson);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load lesson.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [topicId, lessonInfoId]);

  const canEdit = Boolean(contentId && topicIdState);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Topic Content Details</h3>
            {topicMeta?._id && (
              <p className="text-xs text-gray-500 font-mono mt-1">Topic ID: {topicMeta._id}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* NEW: Edit Content button */}
            <button
              onClick={() => canEdit && NavigateToEditContent(contentId!, topicIdState!)}
              disabled={!canEdit}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${canEdit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
              `}
              title={canEdit ? 'Edit this content' : 'Missing IDs to edit'}
            >
              Edit Content
            </button>

            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded" title="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Loading / Error */}
          {loading && (
            <div className="space-y-4">
              <Shimmer className="h-5 w-64 rounded" />
              <Shimmer className="h-4 w-80 rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Shimmer className="h-40 rounded" />
                <Shimmer className="h-40 rounded" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {!loading && !error && lesson && (
            <div className="space-y-6">
              {/* Topic meta */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm font-semibold text-gray-800">Topic</p>
                <p className="text-base text-gray-900">{topicMeta?.title}</p>
                {topicMeta?.description && (
                  <p className="text-sm text-gray-700 mt-1">{topicMeta.description}</p>
                )}
              </div>

              {/* Lesson core */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900">Lesson</h4>
                  <span className="text-xs text-gray-500 font-mono">Lesson ID: {lessonInfoId}</span>
                </div>

                {/* Lesson Text */}
                {lesson.text ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                    <MathOrText value={lesson.text} placeholder="No text" />
                  </div>
                ) : null}

                {/* Lesson Media */}
                {(lesson.audio || lesson.video) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {lesson.audio && (
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                          <PlayCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Audio</span>
                        </div>
                        <audio controls className="w-full">
                          <source src={lesson.audio} />
                          Your browser does not support the audio element.
                        </audio>
                        <a href={lesson.audio} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline mt-2 inline-block">
                          Open audio in new tab
                        </a>
                      </div>
                    )}
                    {lesson.video && (
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                          <PlayCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Video</span>
                        </div>
                        <video controls className="w-full rounded">
                          <source src={lesson.video} />
                        </video>
                        <a href={lesson.video} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline mt-2 inline-block">
                          Open video in new tab
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Subheadings */}
                {Array.isArray(lesson.subHeading) && lesson.subHeading.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Subheadings</h5>
                    <div className="space-y-4">
                      {lesson.subHeading.map((sh: any, idx: number) => (
                        <div key={sh._id || idx} className="p-4 border rounded-lg">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Text</label>
                              <MathOrText value={sh.text} placeholder="No text" />
                            </div>

                            {sh.subheadingAudioPath && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Audio</label>
                                <audio controls className="w-full">
                                  <source src={sh.subheadingAudioPath} />
                                </audio>
                                <a href={sh.subheadingAudioPath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-700 underline mt-1 inline-block">
                                  Open audio in new tab
                                </a>
                              </div>
                            )}

                            {sh.question && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                                <MathOrText value={sh.question} placeholder="No question" />
                              </div>
                            )}

                            {sh.expectedAnswer && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Answer</label>
                                <MathOrText value={sh.expectedAnswer} placeholder="No expected answer" />
                              </div>
                            )}

                            {sh.comment && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Comment</label>
                                <MathOrText value={sh.comment} placeholder="No comment" />
                              </div>
                            )}

                            {sh.hint && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Hint</label>
                                <MathOrText value={sh.hint} placeholder="No hint" />
                              </div>
                            )}
                          </div>

                          {/* MCQs */}
                          {Array.isArray(sh.mcqQuestions) && sh.mcqQuestions.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-700 mb-2">MCQ</p>
                              {sh.mcqQuestions.map((q: any, qIdx: number) => (
                                <div key={q._id || qIdx} className="p-3 border rounded-lg mb-2">
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-600">Question</span>
                                    <MathOrText value={q.question} placeholder="-" />
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-600">Options</span>
                                    <ul className="list-disc pl-5 text-sm text-gray-900">
                                      {(q.options || []).map((opt: string, oi: number) => (
                                        <li key={oi} className="mt-1">{opt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {q.correctAnswer && (
                                    <div className="mb-1">
                                      <span className="text-xs text-gray-600">Answer</span>
                                      <p className="text-sm text-green-700 font-medium">{q.correctAnswer}</p>
                                    </div>
                                  )}
                                  {q.explanation && (
                                    <div>
                                      <span className="text-xs text-gray-600">Explanation</span>
                                      <MathOrText value={q.explanation} placeholder="-" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lesson comments (optional readonly overview) */}
                {Array.isArray(lesson.comments) && lesson.comments.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Recent Comments</h5>
                    <div className="space-y-3">
                      {lesson.comments.slice(0, 5).map((c: any) => (
                        <div key={c._id} className="p-3 bg-gray-50 rounded border">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-xs text-gray-600">
                              {c.userId?.firstName} {c.userId?.lastName} • <span className="capitalize">{c.userType?.toLowerCase()}</span>
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                            </div>
                          </div>
                          <p className="text-sm text-gray-900">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Main --------------------------------- */

const HelpDeskScreen: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedTopicContent, setSelectedTopicContent] = useState<any | null>(null);
  const [selectedLessonInfoId, setSelectedLessonInfoId] = useState<string | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Get admin ID from localStorage or context
  const storedAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminData") || 'null');
    } catch {
      return null;
    }
  })();

  const adminId =
    storedAdmin?._id ||
    localStorage.getItem("adminId") ||
    null;

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!adminId) {
      console.warn("No adminId found in localStorage. Redirecting to login...");
      navigate("/login");
    }
  }, [adminId, navigate]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await HelpDeskService.getAdminConversations(adminId);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (studentId: string) => {
    try {
      setLoadingMessages(true);
      const response = await HelpDeskService.getConversation(studentId, adminId);
      setMessages(response.data || []);
      // Mark messages as viewed
      await HelpDeskService.markMessagesAsViewed(studentId, adminId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.student._id);
  };

  const handleTopicContentClick = (topicContent: any, lessonInfoId: string) => {
    setSelectedTopicContent(topicContent);
    setSelectedLessonInfoId(lessonInfoId);
    setShowTopicModal(true);
  };

  const closeTopicModal = () => {
    setShowTopicModal(false);
    setSelectedTopicContent(null);
    setSelectedLessonInfoId(null);
  };

  // Upload to Supabase
  const uploadFilesToSupabase = async (files: File[]) => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `help-desk/${fileName}`;
        const { error } = await supabase.storage
          .from('topics')
          .upload(filePath, file);
        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage
          .from('topics')
          .getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    return uploadedUrls;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) return;
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);
      let fileUrls: string[] = [];
      if (attachedFiles.length > 0) {
        setUploadingFiles(true);
        const filesToUpload = attachedFiles.map((fileInfo: any) => fileInfo.file as File);
        fileUrls = await uploadFilesToSupabase(filesToUpload);
      }

      const messageData = {
        senderModel: 'Admin',
        sender: adminId,
        receiverModel: 'Student',
        receiver: selectedConversation.student._id,
        message: newMessage.trim(),
        imageAttached: fileUrls
      };

      const response = await HelpDeskService.sendMessage(messageData);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setAttachedFiles([]);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
      setUploadingFiles(false);
    }
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    `${conv.student.firstName} ${conv.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Topic Content Modal */}
      {showTopicModal && selectedTopicContent && selectedLessonInfoId && (
        <TopicContentModal
          topicContent={selectedTopicContent}
          lessonInfoId={selectedLessonInfoId}
          onClose={closeTopicModal}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 xl:w-1/4 bg-white border-r border-gray-200 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-blue-900 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6" />
              <h1 className="text-xl font-semibold">Help Desk</h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div>
                {[...Array(6)].map((_, index) => (
                  <ConversationShimmer key={index} />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.student._id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConversation?.student._id === conversation.student._id ? 'bg-blue-50 border-l-4 border-l-blue-900' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {conversation.student.profile_picture ? (
                      <img
                        src={conversation.student.profile_picture}
                        alt={`${conversation.student.firstName} ${conversation.student.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold text-sm">
                        {conversation.student.firstName[0]}
                        {conversation.student.lastName[0]}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Name and Time */}
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.student.firstName} {conversation.student.lastName}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>

                      {/* Last Message */}
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.message}
                      </p>

                      {/* Unread Indicator */}
                      {!conversation.lastMessage.viewed && conversation.lastMessage.sender !== adminId && (
                        <div className="mt-2">
                          <span className="inline-block w-2 h-2 bg-blue-900 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.student.firstName[0]}{selectedConversation.student.lastName[0]}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">
                    {selectedConversation.student.firstName} {selectedConversation.student.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedConversation.student.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <MessageShimmer key={index} isAdmin={index % 2 === 0} />
                    ))}
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isAdmin = message.senderModel === 'Admin';
                    const showDate = index === 0 ||
                      formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                    const hasTopicContent = message.topicContentId &&
                      message.topicContentId !== null &&
                      message.topicContentId !== '';

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-4">
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isAdmin ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${isAdmin
                                ? 'bg-blue-900 text-white'
                                : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                              {/* Topic Content Reference */}
                              {hasTopicContent && (
                                <TopicContentReference
                                  topicContent={message.topicContentId}
                                  lessonInfoId={message.lessonInfoId}
                                  onClick={() => handleTopicContentClick(
                                    message.topicContentId,
                                    message.lessonInfoId
                                  )}
                                />
                              )}

                              {/* Text message */}
                              {message.message && (
                                <p className="whitespace-pre-wrap">{message.message}</p>
                              )}

                              {/* Attachments */}
                              {message.imageAttached && message.imageAttached.length > 0 && (
                                <div className={`${message.message ? 'mt-3' : ''} space-y-2`}>
                                  {message.imageAttached.map((attachment: string, imgIndex: number) => {
                                    const isImage = isImageUrl(attachment);
                                    return (
                                      <div key={imgIndex}>
                                        {isImage ? (
                                          <ImageWithShimmer
                                            src={attachment}
                                            alt={`Attachment ${imgIndex + 1}`}
                                            className="max-w-xs"
                                          />
                                        ) : (
                                          <div className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded-lg">
                                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                                            <a
                                              href={attachment}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm underline hover:no-underline truncate"
                                            >
                                              {getFilenameFromUrl(attachment)}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <p className={`text-xs text-gray-500 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                {/* File Attachments Preview */}
                {attachedFiles.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm truncate max-w-32">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-900 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileAttach}
                  />

                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || uploadingFiles || (!newMessage.trim() && attachedFiles.length === 0)}
                    className={`p-2 rounded-lg transition-colors ${sendingMessage || uploadingFiles || (!newMessage.trim() && attachedFiles.length === 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-900 text-white hover:bg-blue-800'
                      }`}
                  >
                    {uploadingFiles ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpDeskScreen;
