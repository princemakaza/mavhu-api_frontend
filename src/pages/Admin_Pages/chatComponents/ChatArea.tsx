import { Send, Star, UserCircle2, Image as ImageIcon, X } from "lucide-react";
import React, { useState } from "react";
import { supabase } from "@/helper/SupabaseClient";

interface ChatAreaProps {
  groupsListOpen: boolean;
  infoSidebarOpen: boolean;
  isMediumScreen: boolean;
  isLargeScreen: boolean;
  activeGroup: any;
  isLoadingMessages: boolean;
  messages: any[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (imagePaths?: string[]) => Promise<void> | void;
  isSending: boolean;
  messageInputRef: React.RefObject<HTMLInputElement>;
  isFavorite: (groupId: string) => boolean;
}

const sanitizeFilename = (name: string) =>
  name
    .trim()
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();

const ChatArea: React.FC<ChatAreaProps> = ({
  groupsListOpen,
  infoSidebarOpen,
  isMediumScreen,
  isLargeScreen,
  activeGroup,
  isLoadingMessages,
  messages,
  messagesEndRef,
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
  messageInputRef,
  isFavorite,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // --- Supabase Upload Helper (now internal) ---
  const uploadFileToSupabase = async (
    file: File,
    bucket: string,
    setProgress: (progress: number) => void
  ): Promise<string> => {
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
        // If your supabase-js version supports progress:
        onProgress: (progressEvent: ProgressEvent) => {
          if (!progressEvent.total) return;
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

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get file URL after upload");
    }

    return publicUrlData.publicUrl;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 4 - selectedImages.length;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(
        `You can only attach up to 4 images. ${remainingSlots} slot(s) remaining.`
      );
    }

    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setUploadProgress((prev) => [...prev, ...filesToAdd.map(() => 0)]);

    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendWithImages = async () => {
    if (
      (!newMessage.trim() && selectedImages.length === 0) ||
      isSending ||
      !activeGroup
    ) {
      return;
    }

    try {
      setIsUploading(true);
      let uploadedImagePaths: string[] = [];

      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(async (file, index) => {
          const url = await uploadFileToSupabase(file, "topics", (progress) => {
            setUploadProgress((prev) => {
              const next = [...prev];
              next[index] = progress;
              return next;
            });
          });
          return url;
        });

        uploadedImagePaths = await Promise.all(uploadPromises);
      }

      await handleSendMessage(uploadedImagePaths);

      // Cleanup
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setSelectedImages([]);
      setImagePreviews([]);
      setUploadProgress([]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
        <div className="flex-1">{activeGroup?.name || "Select a group"}</div>
        {activeGroup && isFavorite(activeGroup._id) && (
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {isLoadingMessages ? (
            <div className="space-y-3">
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
    className={`flex items-end mb-4 ${
      message.sender === "user" ? "justify-end" : "justify-start"
    }`}
  >
    {/* Avatar (for other users only) */}
    {message.sender === "other" && (
      <div className="flex-shrink-0 mr-2">
        {message.senderInfo?.profilePicture ? (
          <img
            src={message.senderInfo.profilePicture}
            alt={message.senderInfo?.name || "User"}
            className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
            <UserCircle2 className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
    )}

    {/* Message Bubble */}
    <div
      className={`flex flex-col max-w-[75%] ${
        message.sender === "user" ? "items-end" : "items-start"
      }`}
    >
      {/* Sender Name */}
      {message.sender === "other" && (
        <div className="text-xs text-gray-600 mb-1 ml-1 font-semibold">
          {message.senderInfo?.name ||
            `${message.senderInfo?.firstName} ${message.senderInfo?.lastName}` ||
            "Unknown User"}
        </div>
      )}

      {/* Message Card */}
      <div
        className={`rounded-2xl px-4 py-2 shadow-sm border ${
          message.sender === "user"
            ? "bg-white text-gray-800 border-gray-200"
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        {/* Image Attachments */}
        {message.images && message.images.length > 0 && (
          <div
            className={`mb-2 grid gap-2 ${
              message.images.length === 1
                ? "grid-cols-1"
                : message.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
            }`}
          >
            {message.images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`Message attachment ${idx + 1}`}
                className="rounded-lg object-cover w-full h-32 sm:h-40 border hover:opacity-90 transition"
                onClick={() => window.open(img, "_blank")}
              />
            ))}
          </div>
        )}

        {/* Message Text */}
        {message.text && (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.text}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[11px] mt-1 ${
            message.sender === "user"
              ? "text-blue-100 text-right"
              : "text-gray-500"
          }`}
        >
          {message.time}
        </div>
      </div>
    </div>

    {/* User Avatar (for own messages) */}
    {message.sender === "user" && (
      <div className="flex-shrink-0 ml-2">
        {message.senderInfo?.profilePicture ? (
          <img
            src={message.senderInfo.profilePicture}
            alt="You"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
            <UserCircle2 className="h-6 w-6 text-blue-500" />
          </div>
        )}
      </div>
    )}
  </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-t">
        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </button>
                {isUploading && uploadProgress[index] < 100 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1 rounded-b-lg">
                    {uploadProgress[index]}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-2">
          {/* Image Upload Button */}
          <label
            className={`cursor-pointer p-2 rounded-lg transition-colors ${
              selectedImages.length >= 4 || !activeGroup || isUploading
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:bg-blue-50"
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={
                selectedImages.length >= 4 || !activeGroup || isUploading
              }
            />
          </label>

          <input
            type="text"
            ref={messageInputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type Message"
            className="flex-1 p-3 bg-blue-50 text-gray-700 rounded-lg pr-12 disabled:opacity-50"
            onKeyPress={(e) =>
              e.key === "Enter" &&
              !isSending &&
              !isUploading &&
              handleSendWithImages()
            }
            disabled={isSending || isUploading || !activeGroup}
          />
          <button
            className={`p-2 transition-colors ${
              isSending ||
              isUploading ||
              !activeGroup ||
              (!newMessage.trim() && selectedImages.length === 0)
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-500 hover:text-blue-600"
            }`}
            onClick={handleSendWithImages}
            disabled={
              isSending ||
              isUploading ||
              !activeGroup ||
              (!newMessage.trim() && selectedImages.length === 0)
            }
          >
            {isSending || isUploading ? (
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
        {selectedImages.length > 0 && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            {selectedImages.length} of 4 images selected
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
