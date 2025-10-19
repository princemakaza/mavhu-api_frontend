/** ---------------------------
 *  Types & Constants
 *  --------------------------*/

export const fileTypeExtensions = {
  video: [".mp4", ".avi", ".mov", ".wmv", ".mkv", ".webm"],
  audio: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac"],
  document: [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp"],
};

export const MAX_FILE_SIZE_MB = 300; // single file limit for uploads
export const AUTOSAVE_KEY = "CreateNewContent:autosave:v4"; // bumped to v4 for safer hydration

/** --- Backend-aligned types --- */
export interface TimingPoint {
  text: string;
  seconds: number;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SubHeadingItem {
  text?: string;
  subheadingAudioPath?: string;  // generic file URL
  question?: string;             // open-ended (optional)
  expectedAnswer?: string;       // open-ended (optional)
  comment?: string;
  hint?: string;
  mcqQuestions?: MCQQuestion[];  // matches [mcqQuestionSchema]
  timingArray?: number[];        // matches { type: [Number], default: [] }
}

export interface LessonItem {
  text: string;                // required by backend
  subHeading: SubHeadingItem[];
  audio: string;
  video: string;
  // comments & reactions exist server-side but are NOT posted from here
}

export type FileType = "video" | "audio" | "document"; // backend enum

export interface ContentFormData {
  title: string;
  description: string;
  lesson: LessonItem[];
  file_path: string[];         // "other files" attached to the content
  file_type: FileType;         // backend enum
  Topic: string;               // Topic ObjectId as string
}

/** ---------------------------
 *  Helpers
 *  --------------------------*/

// Extract LaTeX from wrapped value like \( ... \)
export const extractLatexFromText = (text: string): string => {
  if (!text) return "";
  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    return text.slice(2, -2);
  }
  return text;
};

export const prettyFileSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
};

export const withinLimit = (file: File, limitMB = MAX_FILE_SIZE_MB) =>
  file.size <= limitMB * 1024 * 1024;

// Icon by file "kind"
export const kindIcon = (kind: "audio" | "video" | "document" | "image" | "other", size = 16) => {
  switch (kind) {
    case "audio":
      return <Music size={size} />;
    case "video":
      return <Video size={size} />;
    case "document":
      return <FileText size={size} />;
    case "image":
      return <ImageIcon size={size} />;
    default:
      return <File size={size} />;
  }
};

export const inferKind = (file: File): "audio" | "video" | "document" | "image" | "other" => {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (fileTypeExtensions.audio.includes(ext)) return "audio";
  if (fileTypeExtensions.video.includes(ext)) return "video";
  if (fileTypeExtensions.image.includes(ext)) return "image";
  if (fileTypeExtensions.document.includes(ext)) return "document";
  return "other";
};