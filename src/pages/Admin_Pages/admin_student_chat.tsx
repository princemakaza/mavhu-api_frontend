import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Paperclip, X, Users, MessageCircle, Clock, Search, BookOpen } from 'lucide-react';
import { NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/logo2.png";
import HelpDeskService from '@/services/Admin_Service/help_desk_services';
import Sidebar from '@/components/Sidebar';
import { supabase } from "@/helper/SupabaseClient";

// Shimmer component for loading states
const Shimmer = ({ className }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
        style={{ animation: 'shimmer 1.5s infinite linear' }}>
        <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `}</style>
    </div>
);

// Image loading component with shimmer
const ImageWithShimmer = ({ src, alt, className }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <div className={`relative ${className}`}>
            {loading && (
                <Shimmer className="absolute inset-0 rounded-lg" />
            )}
            {!error ? (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
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

// Topic Content Modal Component
const TopicContentModal = ({ topicContent, lessonInfoId, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Topic Content Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic ID:</label>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border font-mono">{topicContent._id}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                            <p className="text-sm text-gray-900">{topicContent.title}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                            <p className="text-sm text-gray-900">{topicContent.description}</p>
                        </div>

                        {lessonInfoId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Info ID:</label>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border font-mono">{lessonInfoId}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Topic Content Reference Component (like WhatsApp reply)
const TopicContentReference = ({ topicContent, lessonInfoId, onClick }) => {
    return (
        <div
            className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded cursor-pointer hover:bg-blue-100 transition-colors mb-2"
            onClick={onClick}
        >
            <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">
                        {topicContent.title}
                    </p>
                    <p className="text-xs text-blue-700 truncate">
                        {topicContent.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Conversation shimmer loading component
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

// Message shimmer loading component
const MessageShimmer = ({ isAdmin }) => (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isAdmin ? 'order-2' : 'order-1'}`}>
            <Shimmer className={`px-4 py-2 rounded-lg h-16 ${isAdmin ? 'ml-auto' : 'mr-auto'}`} />
            <Shimmer className={`h-3 w-16 mt-1 rounded ${isAdmin ? 'ml-auto' : 'mr-auto'}`} />
        </div>
    </div>
);

// Helper function to check if a URL is an image
const isImageUrl = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
};

// Helper function to extract filename from URL
const getFilenameFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('?')[0]; // Remove query parameters
    } catch {
        return 'Attachment';
    }
};

const HelpDeskScreen = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [selectedTopicContent, setSelectedTopicContent] = useState(null);
    const [selectedLessonInfoId, setSelectedLessonInfoId] = useState(null);
    const [showTopicModal, setShowTopicModal] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get admin ID from localStorage or context
    // With this:
    const storedAdmin = (() => {
        try {
            return JSON.parse(localStorage.getItem("adminData"));
        } catch {
            return null;
        }
    })();

    const adminId =
        storedAdmin?._id ||
        localStorage.getItem("adminId") ||
        null; // no hard-coded fallback
    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!adminId) {
            console.warn("No adminId found in localStorage. Redirecting to login...");
            navigate("/login"); // 👈 redirect to login
        }
    }, [adminId, navigate]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

    const fetchMessages = async (studentId) => {
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

    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation.student._id);
    };

    const handleTopicContentClick = (topicContent, lessonInfoId) => {
        setSelectedTopicContent(topicContent);
        setSelectedLessonInfoId(lessonInfoId);
        setShowTopicModal(true);
    };

    const closeTopicModal = () => {
        setShowTopicModal(false);
        setSelectedTopicContent(null);
        setSelectedLessonInfoId(null);
    };

    // Function to upload files to Supabase
    const uploadFilesToSupabase = async (files) => {
        const uploadedUrls = [];

        for (const file of files) {
            try {
                // Generate a unique file name
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `help-desk/${fileName}`;

                // Upload file to Supabase storage
                const { data, error } = await supabase.storage
                    .from('topics') // Replace with your bucket name
                    .upload(filePath, file);

                if (error) {
                    console.error('Error uploading file:', error);
                    continue;
                }

                // Get public URL
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

            // Upload files if any are attached
            let fileUrls = [];
            if (attachedFiles.length > 0) {
                setUploadingFiles(true);
                const filesToUpload = attachedFiles.map(fileInfo => fileInfo.file);
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

            // Add the new message to the current messages
            setMessages(prev => [...prev, response.data]);

            // Clear input and attachments
            setNewMessage('');
            setAttachedFiles([]);

            // Refresh conversations to update last message
            fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
            setUploadingFiles(false);
        }
    };

    const handleFileAttach = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));
        setAttachedFiles(prev => [...prev, ...newFiles]);
    };

    const removeAttachment = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
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
            {showTopicModal && selectedTopicContent && (
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
                            // Shimmer loading for conversations
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
                                        <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold text-sm">
                                            {conversation.student.firstName[0]}{conversation.student.lastName[0]}
                                        </div>

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
                                    // Shimmer loading for messages
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

                                        // Check if message has topic content
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
                                                            {/* Topic Content Reference (like WhatsApp reply) */}
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

                                                            {/* Image and file attachments */}
                                                            {message.imageAttached && message.imageAttached.length > 0 && (
                                                                <div className={`${message.message ? 'mt-3' : ''} space-y-2`}>
                                                                    {message.imageAttached.map((attachment, imgIndex) => {
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