import React, { useState } from "react";
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
import SubjectService from "@/services/Admin_Service/Subject_service";
import { supabase } from "@/helper/SupabaseClient"; // Adjust import path as needed

export interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubjectAdded: (subject: any) => void;
}

const AddSubjectDialog: React.FC<AddSubjectDialogProps> = ({
  open,
  onOpenChange,
  onSubjectAdded,
}) => {
  const [subjectData, setSubjectData] = useState({
    subjectName: "",
    Level: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

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
      setFile(selectedFile);

      // Create a preview URL for the selected image
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target) {
          setPreviewUrl(event.target.result as string);
        }
      };
      fileReader.readAsDataURL(selectedFile);
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
        .from("totoacademy") // Replace with your bucket name
        .upload(fileName, file);

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      // Get the public URL of the uploaded image
      const { data: publicData } = supabase.storage
        .from("totoacademy") // Replace with your bucket name
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
    setImageUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!subjectData.subjectName || !subjectData.Level) {
        throw new Error("Subject name and level are required");
      }

      if (!file) {
        throw new Error("Please select an image for the subject");
      }

      // Upload the image to Supabase and get the URL
      const uploadedImageUrl = await uploadImageToSupabase(file);

      if (!uploadedImageUrl) {
        throw new Error("Failed to upload image");
      }

      // Format data for API
      const apiSubjectData = {
        subjectName: subjectData.subjectName.trim(),
        Level: subjectData.Level,
        showSubject: true,
        imageUrl: uploadedImageUrl,
      };

      console.log("Sending subject data to API:", apiSubjectData);

      // Call API to create subject
      const result = await SubjectService.createSubject(apiSubjectData);
      console.log("API response:", result);

      // Notify parent component about the new subject
      onSubjectAdded(result.data);

      // Show success message
      toast({
        title: "Subject created",
        description: "The subject has been created successfully.",
      });

      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create subject:", error);
      // Improved error handling to extract more specific error messages
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create subject. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] mx-4 max-w-full">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subjectName">Subject Name</Label>
            <Input
              id="subjectName"
              value={subjectData.subjectName}
              onChange={handleChange}
              placeholder="Enter subject name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="Level">Level</Label>
            <Select
              onValueChange={handleLevelChange}
              value={subjectData.Level}
              required
            >
              <SelectTrigger id="Level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="O Level">O Level</SelectItem>
                <SelectItem value="A Level">A Level</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Subject Image</Label>
            <div className="border-2 border-dashed border-green-200 rounded-md p-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="mb-2"
              />
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Subject preview"
                    className="max-h-40 max-w-full object-contain rounded border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
            <Button
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectDialog;
