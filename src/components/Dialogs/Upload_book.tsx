import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import UploadService from "@/services/Upload_service";

interface Subject {
  _id: string;
  subjectName: string;
}

interface UploadResourceDialogProps {
  subjects: Subject[];
  onBookUploaded: () => void;
}

const UploadResourceDialog: React.FC<UploadResourceDialogProps> = ({
  subjects,
  onBookUploaded,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    level: "",
    authorFullName: "",
    description: "",
    file: null as File | null,
  });
  const { toast } = useToast();

  const levels = ["O Level", "A Level", "Others"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      level: "",
      authorFullName: "",
      description: "",
      file: null,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.subject ||
      !formData.level ||
      !formData.authorFullName ||
      !formData.file
    ) {
      const missingFields = [];
      if (!formData.subject) missingFields.push("subject");
      if (!formData.level) missingFields.push("level");
      if (!formData.authorFullName) missingFields.push("authorFullName");
      if (!formData.file) missingFields.push("file");

      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: `Please provide: ${missingFields.join(", ")}`,
      });
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all required fields exactly as backend expects them
      formDataToSend.append("subject", formData.subject); // Must be valid subject ID
      formDataToSend.append("level", formData.level); // Must match enum values
      formDataToSend.append("authorFullName", formData.authorFullName.trim());

      // Optional field
      if (formData.description) {
        formDataToSend.append("description", formData.description.trim());
      }

      // File field - critical part!
      if (formData.file) {
        formDataToSend.append("filePath", formData.file); // Using filePath as backend expects
        // Also append as 'file' in case backend processes it first
        formDataToSend.append("file", formData.file);
      }

      // Debug: Log exactly what we're sending
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const result = await UploadService.uploadBook(formDataToSend);
      console.log("Upload successful:", result);

      toast({
        title: "Success",
        description: "Book uploaded successfully",
      });

      resetForm();
      setOpen(false);
      onBookUploaded();
    } catch (error: any) {
      console.error("Upload error details:", error);

      let errorMessage = error.message;
      if (error.error) {
        errorMessage += `: ${error.error}`;
      }
      if (error.details?.errors) {
        errorMessage += ` (${JSON.stringify(error.details.errors)})`;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage || "Failed to upload book",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen && !loading) {
      resetForm();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="border-2 border-blue-900 bg-white hover:bg-blue-50 text-blue-900 px-10 py-2 rounded-md">
          UPLOAD RESOURCES
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Resource</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Subject Select */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subject: value }))
                }
                value={formData.subject}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Select */}
            <div>
              <Label htmlFor="level">Level *</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, level: value }))
                }
                value={formData.level}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Full Name */}
            <div>
              <Label htmlFor="authorFullName">Author Full Name *</Label>
              <Input
                id="authorFullName"
                name="authorFullName"
                value={formData.authorFullName}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter author's full name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter book description"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="file">Book File *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.epub"
                disabled={loading}
                required
              />
              {formData.file && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {formData.file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadResourceDialog;
