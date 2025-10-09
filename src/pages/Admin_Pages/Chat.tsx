import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import ChatService from "@/services/Admin_Service/chat_service";
import SubjectService from "@/services/Admin_Service/Subject_service";
import CommunityMessageService from "@/services/Admin_Service/message_service";

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

import ChatGroupsList from "./chatComponents/ChatGroupsList";
import ChatArea from "./chatComponents/ChatArea";
import GroupInfoSidebar from "./chatComponents/GroupInfoSidebar";
import ExitGroupModal from "./chatComponents/ExitGroupModal";
import DeleteGroupModal from "./chatComponents/DeleteGroupModal";
import UpdateGroupModal from "./chatComponents/UpdateGroupModal";
import NewGroupModal from "./chatComponents/NewGroupModal";

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

  const ADMIN_ID = storedAdmin?._id || localStorage.getItem("adminId") || null;

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
              profilePicture: msg.sender.profilePicture || "",
              lastName: msg.sender.lastName,
            },
            images: msg.imagePath || [],
            createdAt: new Date(msg.createdAt),
          })) || [];

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
        description: "We couldn't load your chat groups right now. Please try again.",
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
            onClick={() => t.dismiss()}
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
              onClick={() => t.dismiss()}
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
        title: "Oops! Couldn't Update Group",
        description:
          err?.message || "We couldn't update the group right now. Please try again.",
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
      setIsSubmitting(false);
    }
  };

const handleSendMessage = async (imagePaths: string[] = []) => {
  if ((!newMessage.trim() && imagePaths.length === 0) || isSending || !activeGroup) {
    return;
  }

  try {
    setIsSending(true);

    const messageData = {
      community: activeGroup._id,
      sender: user?._id?.trim() ? user._id : ADMIN_ID,
      message: newMessage.trim(),
      imagePath: imagePaths, // Array of image URLs from Supabase
    };

    const response = await CommunityMessageService.createMessage(
      activeGroup._id,
      messageData
    );

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
      images: imagePaths, // Include images in the message object
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessageObj]);
    setNewMessage("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    toast({
      title: "Success",
      description: imagePaths.length > 0 
        ? `Message with ${imagePaths.length} image(s) sent successfully`
        : "Message sent successfully",
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    const t = toast({
      variant: "destructive",
      title: "Oops! Message Not Sent",
      description: "We couldn't send your message right now. Please try again.",
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
          title: "Oops! Couldn't Delete Group",
          description: "We couldn't delete the group right now. Please try again.",
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
      }
    } catch (err) {
      console.error("Failed to delete group:", err);
      const t = toast({
        variant: "destructive",
        title: "Oops! Couldn't Delete Group",
        description: "We couldn't delete the group right now. Please try again.",
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
            onClick={() => t.dismiss()}
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
              onClick={() => t.dismiss()}
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
        description: err?.message || "We couldn't leave the group right now. Please try again.",
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
    }
  };

  useEffect(() => {
    fetchChatGroups();
  }, []);

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
            className={`p-1 mr-2 ${groupsListOpen ? "bg-blue-800 rounded" : ""}`}
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
        <ChatGroupsList
          groupsListOpen={groupsListOpen}
          isMediumScreen={isMediumScreen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowNewGroupModal={setShowNewGroupModal}
          loading={loading}
          error={error}
          communities={communities}
          activeGroup={activeGroup}
          setActiveGroup={setActiveGroup}
          setGroupsListOpen={setGroupsListOpen}
          isFavorite={isFavorite}
        />

        {/* Backdrop for Mobile Group List */}
        {groupsListOpen && !isMediumScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setGroupsListOpen(false)}
          />
        )}

        {/* Chat Area */}
        <ChatArea
          groupsListOpen={groupsListOpen}
          infoSidebarOpen={infoSidebarOpen}
          isMediumScreen={isMediumScreen}
          isLargeScreen={isLargeScreen}
          activeGroup={activeGroup}
          isLoadingMessages={isLoadingMessages}
          messages={messages}
          messagesEndRef={messagesEndRef}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          messageInputRef={messageInputRef}
          isFavorite={isFavorite}
        />

        {/* Right Sidebar - Group Info */}
        <GroupInfoSidebar
          infoSidebarOpen={infoSidebarOpen}
          isLargeScreen={isLargeScreen}
          setInfoSidebarOpen={setInfoSidebarOpen}
          activeGroup={activeGroup}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          loading={loading}
          isFavorite={isFavorite}
          toggleFavorite={toggleFavorite}
          setShowExitConfirmModal={setShowExitConfirmModal}
          openDeleteConfirmModal={openDeleteConfirmModal}
        />

        {/* Backdrop for Mobile Info Sidebar */}
        {infoSidebarOpen && !isLargeScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setInfoSidebarOpen(false)}
          />
        )}
      </div>

      {/* Modals */}
      <NewGroupModal
        showNewGroupModal={showNewGroupModal}
        setShowNewGroupModal={setShowNewGroupModal}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        profilePic={profilePic}
        setProfilePic={setProfilePic}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        loading={loading}
        subjects={subjects}
        isSubmitting={isSubmitting}
        handleCreateGroup={handleCreateGroup}
      />

      <UpdateGroupModal
        showUpdateModal={showUpdateModal}
        setShowUpdateModal={setShowUpdateModal}
        updatedGroupName={updatedGroupName}
        setUpdatedGroupName={setUpdatedGroupName}
        updatedGroupSubject={updatedGroupSubject}
        setUpdatedGroupSubject={setUpdatedGroupSubject}
        updatedGroupLevel={updatedGroupLevel}
        setUpdatedGroupLevel={setUpdatedGroupLevel}
        isSubmitting={isSubmitting}
        handleUpdateGroup={handleUpdateGroup}
      />

      <DeleteGroupModal
        showDeleteConfirmModal={showDeleteConfirmModal}
        setShowDeleteConfirmModal={setShowDeleteConfirmModal}
        groupToDelete={groupToDelete}
        activeGroup={activeGroup}
        openUpdateModal={openUpdateModal}
        handleDeleteGroup={handleDeleteGroup}
      />

      <ExitGroupModal
        showExitConfirmModal={showExitConfirmModal}
        setShowExitConfirmModal={setShowExitConfirmModal}
        activeGroup={activeGroup}
        handleExitGroup={handleExitGroup}
      />
    </div>
  );
};

export default ChatApp;