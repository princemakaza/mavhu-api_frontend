import Sidebar from "@/components/Sidebar";
import { toast } from "@/hooks/use-toast";
import SubjectService from "@/services/Admin_Service/Subject_service";
import ChatService from "@/services/Admin_Service/chat_service";
import { Button } from "@/components/ui/button";

import {
  ChevronDown,
  ChevronUp,
  Info,
  Menu,
  Plus,
  Search,
  Send,
  UserCircle2,
  Users,
  X,
  Trash2,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CommunityMessageService from "@/services/Admin_Service/message_service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChatApp = (ChatServiceData: any) => {
  const { user } = useAuth();
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    files: true,
    photos: true,
    videos: false,
    audio: false,
    documents: false,
    links: false,
  });

  const [profilePic, setProfilePic] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groupsListOpen, setGroupsListOpen] = useState(false);
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [groupSubject, setGroupSubject] = useState("General");
  const [groupLevel, setGroupLevel] = useState("Beginner");
  const [groupDescription, setGroupDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedGroupName, setUpdatedGroupName] = useState("");
  const [updatedGroupSubject, setUpdatedGroupSubject] = useState("");
  const [updatedGroupLevel, setUpdatedGroupLevel] = useState("");

  const messageInputRef = useRef<HTMLInputElement>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef(null);
  const [subjects, setSubjects] = useState([]);

  const currentUserId = user?._id;
  const navigate = useNavigate();

  const storedAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("adminData"));
    } catch {
      return null;
    }
  })();

  const ADMIN_ID =
    storedAdmin?._id || localStorage.getItem("adminId") || null;

  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeGroup?._id) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await CommunityMessageService.getMessagesByCommunity(
          activeGroup._id
        );

        const transformedMessages =
          response.data?.map((msg) => ({
            id: msg._id,
            text: msg.message,
            time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            sender: msg.sender._id === ADMIN_ID ? "user" : "other",
            senderInfo: {
              id: msg.sender._id,
              name: `${msg.sender.firstName} ${msg.sender.lastName}`,
              firstName: msg.sender.firstName,
              lastName: msg.sender.lastName,
            },
            images: msg.imagePath || [],
            createdAt: new Date(msg.createdAt), // Add createdAt for sorting
          })) || [];

        // Sort messages by createdAt in ascending order (oldest first)
        transformedMessages.sort((a, b) => a.createdAt - b.createdAt);

        setMessages(transformedMessages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeGroup?._id]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const data = await SubjectService.getAllSubjects();
        console.log("API Response:", data);

        if (Array.isArray(data)) {
          setSubjects(data);
        } else if (data && Array.isArray(data.subjects)) {
          setSubjects(data.subjects);
        } else if (data && Array.isArray(data.data)) {
          setSubjects(data.data);
        } else {
          console.error("Unexpected data structure:", data);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("chatFavorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (groupId: string) => {
    setFavorites((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const isFavorite = (groupId: string) => {
    return favorites.includes(groupId);
  };

  const updateCommunities = (data: any) => {
    setCommunities(data);
  };

  const fetchChatGroups = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await ChatService.getAllChatGroups();
      const chatData = result.data || [];
      updateCommunities(chatData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch chat groups:", err);
      setError("Failed to load chat groups. Please try again.");
      const t = toast({
        variant: "destructive",
        title: "Oops! Something went wrong",
        description: "We couldn’t load your chat groups right now. Please try again.",
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
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Group name cannot be empty",
      });
      return;
    }

    if (!selectedLevel) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an education level",
      });
      return;
    }

    if (!selectedSubject) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a subject",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let profilePictureUrl = "";
      if (profilePic) {
        profilePictureUrl = "";
      }

      const apiGroupData = {
        name: newGroupName.trim(),
        profilePicture: profilePictureUrl || "default-group-avatar.png",
        Level: selectedLevel,
        subject: selectedSubject,
        students: [],
      };

      console.log("Sending group data to API:", apiGroupData);

      const result = await ChatService.createGroup(apiGroupData);
      console.log("API response:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Group created successfully",
        });

        setNewGroupName("");
        setSelectedSubject("");
        setSelectedLevel("");
        setProfilePic(null);
        setSelectedStudent("");

        setShowNewGroupModal(false);
        fetchChatGroups();
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create group. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!activeGroup?._id) {
      const t = toast({
        variant: "destructive",
        title: "Oops! No Group Selected",
        description: "Please select an active group to continue.",
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

      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        name: updatedGroupName.trim() || activeGroup.name,
        subject: updatedGroupSubject || activeGroup.subject,
        Level: updatedGroupLevel || activeGroup.Level,
      };

      const result = await ChatService.updateGroup(activeGroup._id, updateData);

      if (result?.message) {
        const t = toast({
          title: "✅ Group Updated Successfully",
          description: "Your group has been updated and is ready to use.",
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

        setUpdatedGroupName("");
        setUpdatedGroupSubject("");
        setUpdatedGroupLevel("");
        setShowUpdateModal(false);

        fetchChatGroups();
      } else {
        throw new Error(result?.message || "Failed to update group.");
      }
    } catch (err) {
      console.error("Failed to update group:", err);
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn’t Update Group",
        description:
          err?.message || "We couldn’t update the group right now. Please try again.",
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !activeGroup) {
      return;
    }

    try {
      setIsSending(true);

      const messageData = {
        community: activeGroup._id,
        sender: user?._id?.trim() ? user._id : ADMIN_ID,
        message: newMessage.trim(),
        imagePath: [],
      };

      const response = await CommunityMessageService.createMessage(
        activeGroup._id,
        messageData
      );

      // Create the new message object with proper alignment
      const newMessageObj = {
        id: response._id || Date.now(),
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        sender: (user?._id?.trim() ? user._id : ADMIN_ID) === ADMIN_ID ? "user" : "other",
        senderInfo: {
          id: user?._id || ADMIN_ID,
          name: user ? `${user.firstName} ${user.lastName}` : "Admin",
          firstName: user?.firstName || "Admin",
          lastName: user?.lastName || "",
        },
        images: [],
        createdAt: new Date(),
      };

      // Update messages state with the new message
      setMessages((prev) => [...prev, newMessageObj]);
      setNewMessage("");

      // Scroll to bottom after state update
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      const t = toast({
        variant: "destructive",
        title: "Oops! Message Not Sent",
        description: "We couldn’t send your message right now. Please try again.",
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
      setIsSending(false);
    }
  };

  const openUpdateModal = (group) => {
    setUpdatedGroupName(group.name);
    setUpdatedGroupSubject(group.subject?.subjectName || "");
    setUpdatedGroupLevel(group.Level || "");
    setShowUpdateModal(true);
  };

  const openDeleteConfirmModal = (group) => {
    setGroupToDelete(group);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete?._id) return;

    try {
      const result = await ChatService.deletegroup(groupToDelete._id);

      if (result?.message == "Community deleted successfully") {
        toast({
          title: "Success",
          description: "Group deleted successfully",
        });

        if (activeGroup?._id === groupToDelete._id) {
          setActiveGroup(null);
        }

        toggleFavorite(groupToDelete._id);

        setShowDeleteConfirmModal(false);
        setGroupToDelete(null);

        fetchChatGroups();
      } else {
        const t = toast({
          variant: "destructive",
          title: "Oops! Couldn’t Delete Group",
          description: "We couldn’t delete the group right now. Please try again.",
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
    } catch (err) {
      console.error("Failed to delete group:", err);

      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn’t Delete Group",
        description: "We couldn’t delete the group right now. Please try again.",
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

  const handleExitGroup = async () => {
    if (!activeGroup || !activeGroup._id) {
      const t = toast({
        variant: "destructive",
        title: "Oops! No Group Selected",
        description: "Please select an active group to continue.",
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

      return;
    }

    try {
      const result = await ChatService.exitGroup(activeGroup._id);

      if (result?.success) {
        const t = toast({
          title: "✅ Left Group Successfully",
          description: "You have left the group. You can join another group anytime.",
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

        toggleFavorite(activeGroup._id);
        setActiveGroup(null);
        setShowExitConfirmModal(false);
        fetchChatGroups();
      } else {
        throw new Error(result?.message || "Failed to leave group.");
      }
    } catch (err) {
      console.error("Failed to exit group:", err);

      const t = toast({
        variant: "destructive",
        title: "Oops! Something went wrong",
        description: err?.message || "We couldn’t leave the group right now. Please try again.",
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

  useEffect(() => {
    fetchChatGroups();
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 1024;
      const isMedium = window.innerWidth >= 768;
      setIsLargeScreen(isLarge);
      setIsMediumScreen(isMedium);
      setSidebarOpen(isMedium);

      if (isLarge) {
        setInfoSidebarOpen(true);
        setGroupsListOpen(true);
      } else if (isMedium) {
        setGroupsListOpen(true);
        setInfoSidebarOpen(false);
      } else {
        setGroupsListOpen(false);
        setInfoSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Main Navigation Sidebar */}
      <div
        className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          transition-transform duration-300 ease-in-out 
          fixed md:relative z-50 w-64 h-full
        `}
      >
        <Sidebar />
      </div>

      {/* Mobile Toggles for Navigation */}
      <div className="flex items-center bg-blue-900 text-white p-2 md:hidden fixed top-0 left-0 right-0 z-40 h-12">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 mr-2"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1 text-center font-semibold">
          {!groupsListOpen && activeGroup?.name}
        </div>
        <div className="flex">
          <button
            onClick={() => setGroupsListOpen(!groupsListOpen)}
            className={`p-1 mr-2 ${groupsListOpen ? "bg-blue-800 rounded" : ""
              }`}
          >
            <Users size={20} />
          </button>
          <button
            onClick={() => setInfoSidebarOpen(!infoSidebarOpen)}
            className={`p-1 ${infoSidebarOpen ? "bg-blue-800 rounded" : ""}`}
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && !isMediumScreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden mt-12 md:mt-0">
        {/* Groups List */}
        <div
          className={`
            ${groupsListOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
            } 
            transition-transform duration-300 ease-in-out
            fixed md:relative left-0 z-30 w-full md:w-80 md:min-w-64 bg-white h-[calc(100%-3rem)] md:h-full
            flex flex-col border-r
          `}
        >
          {/* Search Area */}
          <div className="p-3 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-8 pr-10 bg-purple-50 text-gray-700 rounded-md"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="absolute right-2 top-2.5 h-4 w-4 text-gray-500"
              >
                <Plus />
              </button>
            </div>
          </div>

          {/* Group List */}
          <div className="p-3 space-y-2 flex-grow overflow-y-auto">
            {loading ? (
             <div className="p-3 space-y-2 flex-grow overflow-y-auto">
    {/* Shimmer for groups list */}
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="w-full py-2 px-4 rounded-md">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : communities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No groups available
              </div>
            ) : (
              communities
                .filter((community) =>
                  community.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((community) => (
                  <div key={community._id} className="group relative">
                    <button
                      className={`w-full text-left py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeGroup?._id === community._id
                        ? "bg-blue-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => {
                        setActiveGroup(community);
                        if (!isMediumScreen) {
                          setGroupsListOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture */}
                          <div className="flex-shrink-0">
                            {community.profilePicture ? (
                              <img
                                src={community.profilePicture}
                                alt={`${community.name} profile`}
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const nextSibling =
                                    target.nextSibling as HTMLElement;
                                  if (nextSibling) {
                                    nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            {/* Fallback avatar with initials */}
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${community.profilePicture ? "hidden" : "flex"
                                } ${activeGroup?._id === community._id
                                  ? "bg-blue-700 text-white"
                                  : "bg-gray-300 text-gray-600"
                                }`}
                              style={{
                                display: community.profilePicture
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              {community.name
                                .split(" ")
                                .slice(0, 2)
                                .map((word) => word.charAt(0).toUpperCase())
                                .join("")}
                            </div>
                          </div>

                          {/* Group Name */}
                          <span className="truncate">{community.name}</span>
                        </div>

                        {/* Favorite Star */}
                        {isFavorite(community._id) && (
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
        {/* Backdrop for Mobile Group List */}
        {groupsListOpen && !isMediumScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setGroupsListOpen(false)}
          />
        )}

        {/* Chat Area */}
        <div
          className={`
            flex-1 flex flex-col bg-gray-50 h-full
            ${(groupsListOpen && !isMediumScreen) || (infoSidebarOpen && !isLargeScreen)
              ? "hidden md:flex"
              : "flex"
            }
          `}
        >
          <div className="hidden md:flex text-xl font-semibold p-4 border-b bg-white">
            <div className="flex-1">
              {activeGroup?.name || "Select a group"}
            </div>
            {activeGroup && isFavorite(activeGroup._id) && (
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {isLoadingMessages ? (
               <div className="space-y-3">
    {/* Shimmer for incoming messages */}
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex justify-start">
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col max-w-xs">
          <div className="h-4 bg-gray-300 rounded w-16 mb-1 animate-pulse"></div>
          <div className="bg-gray-300 rounded-lg px-4 py-2 w-48 h-12 animate-pulse"></div>
        </div>
      </div>
    ))}
    
    {/* Shimmer for outgoing messages */}
    {Array.from({ length: 2 }).map((_, index) => (
      <div key={index + 3} className="flex justify-end">
        <div className="flex flex-col max-w-xs">
          <div className="bg-blue-300 rounded-lg px-4 py-2 w-40 h-10 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >
                    {message.sender === "other" && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserCircle2 className="h-8 w-8 text-gray-400" />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col max-w-xs">
                      {/* Sender name - only show for other users */}
                      {message.sender === "other" && (
                        <div className="text-xs text-gray-600 mb-1 ml-2 font-medium">
                          {message.senderInfo?.name ||
                            `${message.senderInfo?.firstName} ${message.senderInfo?.lastName}` ||
                            "Unknown User"}
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 ${message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-blue-200 text-blue-900"
                          }`}
                      >
                        <div className="mb-1">{message.text}</div>
                        <div
                          className={`text-xs ${message.sender === "user"
                            ? "text-blue-100"
                            : "text-blue-700"
                            }`}
                        >
                          {message.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="p-3 bg-white border-t">
            <div className="relative flex items-center">
              <input
                type="text"
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={replyingTo ? "Type your reply..." : "Type Message"}
                className="flex-1 p-3 bg-blue-50 text-gray-700 rounded-lg pr-12 disabled:opacity-50"
                onKeyPress={(e) =>
                  e.key === "Enter" && !isSending && handleSendMessage()
                }
                disabled={isSending || !activeGroup}
              />
              <button
                className={`absolute right-2 p-2 transition-colors ${isSending || !activeGroup || !newMessage.trim()
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-500 hover:text-blue-600"
                  }`}
                onClick={handleSendMessage}
                disabled={isSending || !activeGroup || !newMessage.trim()}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            {!activeGroup && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                Select a group to start messaging
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar - Group Info */}
        <div
          className={`
            ${infoSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
            } 
            transition-transform duration-300 ease-in-out
            fixed lg:relative right-0 z-30 w-full sm:w-80 lg:w-64 bg-white h-[calc(100%-3rem)] md:h-full
            flex flex-col border-l
          `}
        >
          <div className="p-4 bg-gray-200 flex justify-between items-center">
            <div className="font-semibold">Group Info</div>
            <button
              onClick={() => setInfoSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4 cursor-pointer" />
            </button>
          </div>

          {/* Display Subject Information */}
          {activeGroup && (
            <div className="p-4 border-b">
              <h3 className="font-medium mb-1">Subject</h3>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-sm">
                  {activeGroup.subject?.subjectName || "No subject information"}
                </p>
                <p className="text-xs text-gray-500">
                  {activeGroup.subject?.Level || ""}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Level</p>
                <p className="text-sm">
                  {activeGroup.Level || "Not specified"}
                </p>
              </div>
            </div>
          )}

          {/* Group Info Sections */}
          <div className="p-2 flex-1 overflow-y-auto">
            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("files")}
              >
                <span>Files</span>
                {expandedSections.files ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.files && (
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-500">No files shared</p>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("photos")}
              >
                <span>Photos</span>
                {expandedSections.photos ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.photos && (
                <div className="p-2 bg-white">
                  <div className="grid grid-cols-3 gap-2">
                    <p className="text-sm text-gray-500 col-span-3">
                      No photos shared
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("videos")}
              >
                <span>Videos</span>
                {expandedSections.videos ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.videos && (
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-500">No videos shared</p>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("audio")}
              >
                <span>Audio</span>
                {expandedSections.audio ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.audio && (
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-500">No audio files shared</p>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("documents")}
              >
                <span>Documents</span>
                {expandedSections.documents ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.documents && (
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-500">No documents shared</p>
                </div>
              )}
            </div>

            <div className="border-b">
              <button
                className="w-full p-2 flex justify-between items-center"
                onClick={() => toggleSection("links")}
              >
                <span>Links</span>
                {expandedSections.links ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expandedSections.links && (
                <div className="p-2 bg-white">
                  <p className="text-sm text-gray-500">No links shared</p>
                </div>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="p-4">
            {loading ? (
                <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white p-2 rounded border">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">
                    {activeGroup
                      ? `${activeGroup.students?.length || 0} members`
                      : "0 members"}
                  </div>
                  <X className="h-4 w-4 cursor-pointer" />
                </div>

                <div className="space-y-2">
                  {activeGroup &&
                    activeGroup.students?.map((student) => (
                      <div
                        key={student._id}
                        className="bg-white p-2 rounded border"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                          <span className="text-sm">{`${student.firstName} ${student.lastName}`}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 mt-auto space-y-2">
            <button
              onClick={() => activeGroup && toggleFavorite(activeGroup._id)}
              className={`w-full py-2 px-4 border rounded font-medium flex items-center justify-center ${activeGroup && isFavorite(activeGroup._id)
                ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                : "border-blue-500 text-blue-500"
                } hover:bg-yellow-50 transition-colors`}
              disabled={!activeGroup}
            >
              {activeGroup && isFavorite(activeGroup._id) ? (
                <>
                  <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
                  Favorited
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Add to favorites
                </>
              )}
            </button>
            <button
              onClick={() => setShowExitConfirmModal(true)}
              className="w-full py-2 px-4 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
              disabled={!activeGroup}
            >
              Exit Group
            </button>
            {activeGroup && (
              <button
                onClick={() => openDeleteConfirmModal(activeGroup)}
                className="w-full py-2 px-4 bg-red-700 text-white rounded font-medium flex items-center justify-center hover:bg-red-800 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </button>
            )}
          </div>
        </div>

        {/* Backdrop for Mobile Info Sidebar */}
        {infoSidebarOpen && !isLargeScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setInfoSidebarOpen(false)}
          />
        )}
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                Create New Group
              </h3>
              <p className="text-blue-100 mt-2">Set up your new study group</p>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800"
                  placeholder="Enter a catchy group name"
                />
              </div>

              {/* Profile Picture */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Profile Picture
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0])}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Education Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 bg-white"
                  >
                    <option value="">Select Level</option>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                    <option value="A Level">A Level</option>
                  </select>
                </div>

                {/* Students Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Add Students
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 bg-white"
                  >
                    <option value="">Select student</option>
                    {[].map((student, index) => (
                      <option key={index} value={student.value}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 bg-white disabled:bg-gray-50"
                  disabled={loading}
                >
                  <option value="">
                    {loading ? "Loading subjects..." : "Select subject"}
                  </option>
                  {Array.isArray(subjects) &&
                    subjects.map((subject, index) => (
                      <option
                        key={subject.id || subject._id || index}
                        value={
                          subject.value ||
                          subject.code ||
                          subject.id ||
                          subject._id
                        }
                      >
                        {subject.name ||
                          subject.title ||
                          subject.subjectName ||
                          "Unknown Subject"}
                      </option>
                    ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => setShowNewGroupModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating...
                    </span>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Group Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">Update Group</h3>
              <p className="text-green-100 mt-2">Modify your group settings</p>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Group Name
                </label>
                <input
                  type="text"
                  value={updatedGroupName}
                  onChange={(e) => setUpdatedGroupName(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                  placeholder="Enter new group name"
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={updatedGroupSubject}
                    onChange={(e) => setUpdatedGroupSubject(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                    placeholder="Enter new subject"
                  />
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Education Level
                  </label>
                  <select
                    value={updatedGroupLevel}
                    onChange={(e) => setUpdatedGroupLevel(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white"
                  >
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-600 to-pink-600 p-8 rounded-t-2xl">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <Trash2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Delete Group
                  </h3>
                  <p className="text-red-100 mt-1">This action is permanent</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8">
              {/* Warning Message */}
              <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-red-800">
                      Are you sure you want to delete this group?
                    </h4>
                    <div className="mt-2 text-red-700">
                      <p className="text-base">
                        You're about to permanently delete the group{" "}
                        <span className="font-bold bg-red-100 px-2 py-1 rounded">
                          "{groupToDelete?.name}"
                        </span>
                      </p>
                      <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                        <li>All messages and files will be lost forever</li>
                        <li>All group members will be removed</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {activeGroup && (
                  <button
                    onClick={() => openUpdateModal(activeGroup)}
                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Update Instead
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-8 rounded-t-2xl">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Exit Group</h3>
                  <p className="text-orange-100 mt-1">Leave this study group</p>
                </div>
              </div>
              <button
                onClick={() => setShowExitConfirmModal(false)}
                className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8">
              {/* Info Message */}
              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6 rounded-r-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-orange-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-orange-800">
                      Ready to leave the group?
                    </h4>
                    <div className="mt-2 text-orange-700">
                      <p className="text-base">
                        You're about to exit the group{" "}
                        <span className="font-bold bg-orange-100 px-2 py-1 rounded">
                          "{activeGroup?.name}"
                        </span>
                      </p>
                      <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                        <li>You won't receive new messages from this group</li>
                        <li>You can rejoin if invited again</li>
                        <li>Your previous messages will remain in the group</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowExitConfirmModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Stay in Group
                </button>
                <button
                  onClick={handleExitGroup}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Yes, Exit Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;