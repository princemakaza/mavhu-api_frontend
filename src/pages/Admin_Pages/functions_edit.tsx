// contentActions.ts
import axios from "axios";
import { supabase } from "@/helper/SupabaseClient";

/* ================================
 * Types
 * ================================ */

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  _id?: string;
}

export interface Reply {
  userId: string | { _id: string; firstName?: string; lastName?: string; email?: string; profilePicture?: string; profile_picture?: string };
  userType: "Admin" | "Student" | string;
  text: string;
  _id?: string;
  createdAt?: string;
}

export interface Comment {
  userId: string | { _id: string; firstName?: string; lastName?: string; email?: string; profile_picture?: string; profilePicture?: string; id?: string };
  userType: "Admin" | "Student" | string;
  text: string;
  _id?: string;
  createdAt?: string;
  replies?: Reply[];
}

export interface Reaction {
  userId: string | { _id: string; firstName?: string; lastName?: string; email?: string; profile_picture?: string; id?: string };
  userType: "Admin" | "Student" | string;
  emoji: string;
  _id?: string;
  createdAt?: string;
}

export interface SubHeadingItem {
  text: string;
  question: string;
  subheadingAudioPath: string;
  expectedAnswer: string;
  comment: string;
  hint: string;
  mcqQuestions?: MCQQuestion[];
  _id?: string;
}

export interface LessonItem {
  text: string;
  subHeading: SubHeadingItem[];
  audio: string;
  video: string;
  image?: string;
  _id?: string;
  comments?: Comment[];
  reactions?: Reaction[];
}

export interface ContentFormData {
  _id?: string;
  title: string;
  description: string;
  lesson: LessonItem[];
  file_path: string[];
  file_type: "video" | "audio" | "document" | "image";
  Topic: string; // Topic ID
}

export interface ApiGetContentResponse {
  message: string;
  data: any; // raw API data
}

/* ================================
 * Config
 * ================================ */

const BASE_URL = "/api/v1/topic_content";

const getAuthToken = () => localStorage.getItem("adminToken") || "";

/* ================================
 * File helpers (UI-agnostic)
 * ================================ */

export const fileTypeExtensions = {
  video: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"],
  document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
};

export const getAcceptedFileTypes = (fileType: keyof typeof fileTypeExtensions) =>
  fileTypeExtensions[fileType].join(",");

export const extractFilenameFromUrl = (url: string): string => {
  if (!url) return "";
  try {
    const decoded = decodeURIComponent(url);
    const filenameWithParams = decoded.split("/").pop() || "";
    const filename = filenameWithParams.split("?")[0];
    const timestampRegex = /^\d+_/; // strip "<timestamp>_" prefix if present
    return filename.replace(timestampRegex, "");
  } catch {
    return url;
  }
};

export const shortenFilename = (filename: string, maxLength = 20): string => {
  if (!filename) return "";
  if (filename.length <= maxLength) return filename;
  const dot = filename.lastIndexOf(".");
  const ext = dot !== -1 ? filename.slice(dot) : "";
  const name = dot !== -1 ? filename.slice(0, dot) : filename;
  return `${name.slice(0, maxLength - ext.length - 3)}...${ext}`;
};

/**
 * Upload a single file to Supabase storage (bucket: "topics" by default)
 * Returns the public URL.
 */
export const uploadSingleToSupabase = async (
  file: File,
  bucket = "topics",
  prefix?: string
): Promise<string> => {
  const name = `${prefix ? `${prefix}_` : ""}${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(name, file);
  if (error) throw error;

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(name);
  const url = publicData?.publicUrl;
  if (!url) throw new Error("No public URL returned from Supabase.");
  return url;
};

/**
 * Upload multiple files to Supabase and return an array of public URLs.
 * If any upload fails, the function throws.
 */
export const uploadFilesToSupabase = async (
  files: File[],
  bucket = "topics",
  prefix?: string
): Promise<string[]> => {
  const urls = await Promise.all(files.map((f) => uploadSingleToSupabase(f, bucket, prefix)));
  return urls;
};

/* ================================
 * Normalizers & Builders
 * ================================ */

/**
 * Normalize API "data" object to ContentFormData used by the UI.
 */
export const mapApiToFormData = (apiData: any): ContentFormData => {
  return {
    _id: apiData._id,
    title: apiData.title || "",
    description: apiData.description || "",
    lesson: (apiData.lesson || []).map((l: any) => ({
      _id: l._id,
      text: l.text || "",
      audio: l.audio || "",
      video: l.video || "",
      image: l.image || "",
      subHeading: (l.subHeading || []).map((s: any) => ({
        _id: s._id,
        text: s.text || "",
        subheadingAudioPath: s.subheadingAudioPath || "",
        question: s.question || "",
        expectedAnswer: s.expectedAnswer || "",
        comment: s.comment || "",
        hint: s.hint || "",
        mcqQuestions: s.mcqQuestions || [],
      })),
      comments: l.comments || [],
      reactions: l.reactions || [],
    })),
    file_path: apiData.file_path || [],
    file_type: apiData.file_type || "document",
    Topic: typeof apiData.Topic === "object" ? apiData.Topic?._id : apiData.Topic,
  };
};

/**
 * Build the update payload the API expects from ContentFormData.
 * Keeps fields aligned with your sample body for updateTopicContent.
 */
export const buildUpdatePayload = (form: ContentFormData) => ({
  title: form.title,
  description: form.description,
  file_path: form.file_path,
  file_type: form.file_type,
  Topic: form.Topic,
  lesson: form.lesson.map((l) => ({
    text: l.text,
    audio: l.audio,
    video: l.video,
    image: l.image || "",
    subHeading: (l.subHeading || []).map((s) => ({
      text: s.text,
      subheadingAudioPath: s.subheadingAudioPath,
      question: s.question,
      expectedAnswer: s.expectedAnswer,
      comment: s.comment,
      hint: s.hint,
      mcqQuestions: s.mcqQuestions || [],
    })),
    comments: (l.comments || []).map((c) => ({
      userId: typeof c.userId === "string" ? c.userId : c.userId?._id,
      userType: c.userType,
      text: c.text,
      replies: (c.replies || []).map((r) => ({
        userId: typeof r.userId === "string" ? r.userId : r.userId?._id,
        userType: r.userType,
        text: r.text,
      })),
    })),
    reactions: (l.reactions || []).map((r) => ({
      userId: typeof r.userId === "string" ? r.userId : r.userId?._id,
      userType: r.userType,
      emoji: r.emoji,
    })),
  })),
});

/* ================================
 * Core API calls (functions only)
 * ================================ */

/** Fetch content by ID (returns both raw and normalized) */
export const fetchContentById = async (
  contentId: string
): Promise<{ raw: any; normalized: ContentFormData }> => {
  const resp = await axios.get<ApiGetContentResponse>(`${BASE_URL}/${contentId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  const raw = resp.data?.data ?? resp.data;
  console.log("raw", raw);
  return { raw, normalized: mapApiToFormData(raw?.data ?? raw) };
};

/** Update topic content by ID using ContentFormData */
export const updateContent = async (contentId: string, form: ContentFormData) => {
  const payload = buildUpdatePayload(form);
  const resp = await axios.put(
    `${BASE_URL}/update/${contentId}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resp.data;
};

/** Soft-delete (move to trash) */
export const moveContentToTrash = async (contentId: string) => {
  const resp = await axios.put(
    `${BASE_URL}/trash/${contentId}`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data;
};

/** Restore from trash */
export const restoreContentFromTrash = async (contentId: string) => {
  const resp = await axios.put(
    `${BASE_URL}/restore/${contentId}`,
    {},
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data;
};

/** Permanently delete content */
export const deleteContentPermanently = async (contentId: string) => {
  const resp = await axios.delete(`${BASE_URL}/permanent-delete/${contentId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  return resp.data;
};

/** Hard delete (non-trash endpoint in your service) */
export const deleteContent = async (contentId: string) => {
  const resp = await axios.delete(`${BASE_URL}/delete/${contentId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  return resp.data;
};

/* ================================
 * Comments
 * ================================ */

/** Get comments for a lesson (by index) */
export const getLessonComments = async (contentId: string, lessonIndex: number) => {
  const resp = await axios.get(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comments`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data; // { data: Comment[] , ... }
};

/** Add a comment to a lesson */
export const addLessonComment = async (
  contentId: string,
  lessonIndex: number,
  commentData: { userId: string; userType: string; text: string }
) => {
  const resp = await axios.post(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment`,
    commentData,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resp.data;
};

/** Reply to a comment */
export const replyToComment = async (
  contentId: string,
  lessonIndex: number,
  commentIndex: number,
  replyData: { userId: string; userType: string; text: string }
) => {
  const resp = await axios.post(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment/${commentIndex}/reply`,
    replyData,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resp.data;
};

/** Delete a comment */
export const deleteLessonComment = async (
  contentId: string,
  lessonIndex: number,
  commentIndex: number
) => {
  const resp = await axios.delete(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment/${commentIndex}`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data;
};

/* ================================
 * Reactions
 * ================================ */

/** Get reactions for a lesson */
export const getLessonReactions = async (contentId: string, lessonIndex: number) => {
  const resp = await axios.get(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reactions`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data; // { data: Reaction[] , ... }
};

/** Add or update a reaction for a lesson */
export const addLessonReaction = async (
  contentId: string,
  lessonIndex: number,
  reactionData: { userId: string; userType: string; emoji: string }
) => {
  const resp = await axios.post(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reaction`,
    reactionData,
    {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    }
  );
  return resp.data;
};

/** Delete a reaction by index */
export const deleteLessonReaction = async (
  contentId: string,
  lessonIndex: number,
  reactionIndex: number
) => {
  const resp = await axios.delete(
    `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reaction/${reactionIndex}`,
    { headers: { Authorization: `Bearer ${getAuthToken()}` } }
  );
  return resp.data;
};

/* ================================
 * Convenience: merge new uploads into existing file_path
 * ================================ */

/**
 * Given existing file_path (some existing URLs) and new Files,
 * upload the new Files to Supabase and return the merged list of URLs.
 * If you track "initial existing count" in UI, you can compose this differently,
 * but this helper keeps it simple for later use.
 */
export const mergeNewUploads = async (
  existingFilePaths: string[],
  newFiles: File[],
  bucket = "topics",
  prefix?: string
): Promise<string[]> => {
  if (!newFiles?.length) return existingFilePaths;
  const newUrls = await uploadFilesToSupabase(newFiles, bucket, prefix);
  return [...existingFilePaths, ...newUrls];
};
