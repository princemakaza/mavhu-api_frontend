import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, BookOpen, GraduationCap, Save, X, Sparkles, Image as ImageIcon } from "lucide-react";
import SubjectService from "@/services/Admin_Service/Subject_service";
import { supabase } from "@/helper/SupabaseClient";

export interface EditSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectUpdated: (subject: any) => void;
  subject: {
    id?: string;
    _id?: string;
    subjectName?: string;
    title?: string;
    Level?: string;
    category?: string;
    imageUrl?: string;
    showSubject?: boolean;
  } | null;
}

const EditSubjectDialog: React.FC<EditSubjectDialogProps> = ({
  open,
  onOpenChange,
  onSubjectUpdated,
  subject,
}) => {
  const [subjectData, setSubjectData] = useState({
    subjectName: "",
    Level: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  // Populate form when subject data is available
  useEffect(() => {
    if (subject && open) {
      setSubjectData({
        subjectName: subject.subjectName || subject.title || "",
        Level: subject.Level || subject.category || "",
      });
      setCurrentImageUrl(subject.imageUrl || null);
      setPreviewUrl(null);
      setFile(null);
      setImageChanged(false);
    }
  }, [subject, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSubjectData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLevelChange = (value: string) => {
    setSubjectData((prev) => ({ ...prev, Level: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setImageChanged(true);

    // Create a preview URL for the selected image
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      if (event.target) {
        setPreviewUrl(event.target.result as string);
      }
    };
    fileReader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith("image/")) {
      processFile(files[0]);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    try {
      if (!file) return null;

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        throw new Error("Invalid file type. Please upload an image.");
      }

      // Create a unique file name
      const fileName = `${Date.now()}_${file.name}`;

      // Upload image to the Supabase bucket
      const { data, error } = await supabase.storage
        .from("totoacademy")
        .upload(fileName, file);

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Get the public URL of the uploaded image
      const { data: publicData } = supabase.storage
        .from("totoacademy")
        .getPublicUrl(fileName);

      if (publicData) {
        return publicData.publicUrl;
      }

      return null;
    } catch (error) {
      console.error("Error in image upload:", error);
      throw error;
    }
  };

  const resetForm = () => {
    setSubjectData({
      subjectName: "",
      Level: "",
    });
    setFile(null);
    setPreviewUrl(null);
    setCurrentImageUrl(null);
    setImageChanged(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!subjectData.subjectName || !subjectData.Level) {
        throw new Error("Subject name and level are required");
      }

      if (!subject?.id && !subject?._id) {
        throw new Error("Subject ID is required for updating");
      }

      let finalImageUrl = currentImageUrl;

      // Upload new image if one was selected
      if (imageChanged && file) {
        const uploadedImageUrl = await uploadImageToSupabase(file);
        if (uploadedImageUrl) {
          finalImageUrl = uploadedImageUrl;
        } else {
          throw new Error("Failed to upload new image");
        }
      }

      // Format data for API
      const apiSubjectData = {
        subjectName: subjectData.subjectName.trim(),
        Level: subjectData.Level,
        showSubject: subject?.showSubject !== false,
        ...(finalImageUrl && { imageUrl: finalImageUrl }),
      };

      console.log("Sending updated subject data to API:", apiSubjectData);

      // Call API to update subject
      const subjectId = subject?.id || subject?._id;
      const result = await SubjectService.updateSubject(subjectId, apiSubjectData);
      console.log("API response:", result);

      // Notify parent component about the updated subject
      onSubjectUpdated(result.data);

      // Show success message
      toast({
        title: "Subject updated",
        description: "The subject has been updated successfully.",
      });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update subject:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update subject. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!subject) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] mx-4 max-w-full p-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-0 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Header with glassmorphism effect */}
        <DialogHeader className="relative p-8 pb-4 bg-white/30 backdrop-blur-lg border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Edit Subject
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-1">Update your subject information</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="relative p-8 space-y-6">
          {/* Subject Name Field */}
          <div className="space-y-3">
            <Label htmlFor="subjectName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Subject Name
            </Label>
            <div className="relative">
              <Input
                id="subjectName"
                value={subjectData.subjectName}
                onChange={handleChange}
                placeholder="Enter subject name"
                required
                className="pl-4 pr-4 py-3 bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 transition-all duration-300 text-slate-800 placeholder:text-slate-400 rounded-xl shadow-sm focus:shadow-md"
              />
            </div>
          </div>

          {/* Level Field */}
          <div className="space-y-3">
            <Label htmlFor="Level" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-500" />
              Level
            </Label>
            <Select
              onValueChange={handleLevelChange}
              value={subjectData.Level}
              required
            >
              <SelectTrigger className="pl-4 pr-4 py-3 bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 transition-all duration-300 text-slate-800 rounded-xl shadow-sm focus:shadow-md">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-lg border-white/30 rounded-xl shadow-xl">
                <SelectItem value="O Level" className="rounded-lg">O Level</SelectItem>
                <SelectItem value="A Level" className="rounded-lg">A Level</SelectItem>
                <SelectItem value="Others" className="rounded-lg">Others</SelectItem>
            
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-green-500" />
              Subject Image
            </Label>
            
            <div 
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
                isDragOver 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 border-dashed shadow-lg transform scale-[1.02]' 
                  : 'bg-white/40 backdrop-blur-sm border-2 border-white/30 border-dashed hover:bg-white/60 hover:border-blue-200'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-slate-700 font-medium mb-1">
                    Drop your image here or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Image Preview Section */}
            {(previewUrl || currentImageUrl) && (
              <div className="mt-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-slate-700">
                    {previewUrl ? 'New Image Preview' : 'Current Image'}
                  </p>
                </div>
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={previewUrl || currentImageUrl}
                    alt={previewUrl ? 'New subject image' : 'Current subject image'}
                    className="w-full max-h-48 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                  {previewUrl && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full shadow-md">
                      New
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1 py-3 bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 text-slate-700 rounded-xl transition-all duration-300 hover:shadow-md"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Subject
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectDialog;