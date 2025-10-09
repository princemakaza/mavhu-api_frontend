import { MessageSquare, Send, Paperclip, ChevronLeft, Users, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Community = () => {
    const { id } = useParams();
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [communityDetails, setCommunityDetails] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sending, setSending] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch all communities
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get(
                    "/api/v1/community_service/getall",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setCommunities(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch communities", err);
            }
        };
        fetchCommunities();
    }, []);

    // Fetch community messages and details
    useEffect(() => {
        if (!id) return;

        const fetchData = async (showload: boolean = true) => {
            if (showload) {
                setLoading(true);
            }
            setError(null);
            try {
                const [messagesRes, detailsRes] = await Promise.all([
                    axios.get(
                        `/api/v1/message_community_route/community/${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `/api/v1/community_service/get/${id}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                setMessages(messagesRes.data.data || []);
                setCommunityDetails(detailsRes.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(() => fetchData(false), 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [id, token]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedFile) return;

        setSending(true);
        try {
            let imagePath: string[] = [];
            // If file is attached, upload it first (implement your upload logic if needed)
            // For now, we skip file upload and send empty imagePath

            await axios.post(
                "/api/v1/message_community_route/create",
                {
                    community: id,
                    sender: user?._id,
                    message: newMessage,
                    imagePath,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNewMessage("");
            setSelectedFile(null);
            // Messages will refresh via the polling
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !communityDetails) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // if (error) {
    //     return (
    //         <div className="flex flex-col items-center justify-center h-screen text-center">
    //             <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
    //                 <MessageSquare className="h-6 w-6 text-red-500" />
    //             </div>
    //             <h2 className="text-xl font-bold mb-2">Error Loading Chat</h2>
    //             <p className="text-muted-foreground mb-4">{error}</p>
    //             <Button onClick={() => window.location.reload()}>Retry</Button>
    //         </div>
    //     );
    // }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Sidebar - Communities List */}
            <div className="w-80 border-r bg-white overflow-y-auto hidden md:block">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-4">Communities</h2>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search communities..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-1 p-2">
                    {filteredCommunities.map((community) => (
                        <div
                            key={community._id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${community._id === id ? "bg-gray-100" : ""}`}
                            onClick={() => navigate(`/chat/${community._id}`)}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={community.profilePicture} />
                                <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">{community.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {community.students?.length || 0} members
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="border-b bg-white p-4 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => navigate("/communities")}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={communityDetails?.profilePicture} />
                        <AvatarFallback>{communityDetails?.name?.charAt(0) || "C"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-bold">{communityDetails?.name || "Community"}</h1>
                        <p className="text-sm text-muted-foreground">
                            {communityDetails?.Level || ""}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => setShowDetails(true)}
                        aria-label="Show community details"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
                {/* Community Details Dialog */}
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Community Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={communityDetails?.profilePicture} />
                                    <AvatarFallback>
                                        {communityDetails?.name?.charAt(0) || "C"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold">{communityDetails?.name || "Community"}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {communityDetails?.Level || ""}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="text-sm text-muted-foreground">
                                    {communityDetails?.subject || "General discussion group"}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Members ({communityDetails?.students?.length || 0})</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {communityDetails?.students?.map((student: any) => (
                                        <div key={student._id} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {student.firstName.charAt(0)}
                                                    {student.lastName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>
                                                {student.firstName} {student.lastName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mb-2" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwnMessage = message.sender?._id === user?._id;
                            return (
                                <div
                                    key={message._id}
                                    className={`flex gap-3 mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                >
                                    {!isOwnMessage && (
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback>
                                                {message.sender?.firstName?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${isOwnMessage ? "bg-blue-600 text-white ml-auto" : "bg-white border"}`}
                                    >
                                        {!isOwnMessage && (
                                            <div className="font-semibold mb-1">
                                                {message.sender?.firstName || "Unknown"}
                                            </div>
                                        )}
                                        {message.message && <p className="mb-1">{message.message}</p>}
                                        {message.fileUrl && (
                                            <div className="mt-2">
                                                <a
                                                    href={message.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1 ${isOwnMessage ? "text-white" : "text-primary"}`}
                                                >
                                                    <Paperclip className="h-4 w-4" />
                                                    {message.fileUrl.split("/").pop()}
                                                </a>
                                            </div>
                                        )}
                                        <div className={`text-xs mt-1 ${isOwnMessage ? "text-white/70" : "text-muted-foreground"}`}>
                                            {new Date(message.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t bg-white p-4">
                    {selectedFile && (
                        <div className="flex items-center justify-between mb-2 bg-gray-100 rounded-lg p-2">
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-sm">{selectedFile.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                            >
                                ×
                            </Button>
                        </div>
                    )}
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <label className="flex items-center gap-2 cursor-pointer w-full">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <span>Upload File</span>
                                    </label>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>From Library</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") handleSendMessage();
                            }}
                        />
                        <Button onClick={handleSendMessage} disabled={(!newMessage && !selectedFile) || sending}>
                            {sending ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></span>
                                    Sending...
                                </span>
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;