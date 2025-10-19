import { X, Search, Check, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";

interface SubjectLike {
  id?: string;
  _id?: string;
  code?: string;
  value?: string;
  name?: string;
  title?: string;
  subjectName?: string;
}

interface StudentLike {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  level?: string;
}

interface NewGroupModalProps {
  showNewGroupModal: boolean;
  setShowNewGroupModal: (show: boolean) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  profilePic: File | null;
  setProfilePic: (file: File | null) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedStudents: string[];
  setSelectedStudents: (ids: string[]) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  loading: boolean;
  subjects: SubjectLike[];
  isSubmitting: boolean;
  handleCreateGroup: () => void;
  students: StudentLike[];
  loadingStudents: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const NewGroupModal = ({
  showNewGroupModal,
  setShowNewGroupModal,
  newGroupName,
  setNewGroupName,
  profilePic,
  setProfilePic,
  selectedLevel,
  setSelectedLevel,
  selectedStudents,
  setSelectedStudents,
  selectedSubject,
  setSelectedSubject,
  loading,
  subjects,
  isSubmitting,
  handleCreateGroup,
  students,
  loadingStudents,
  isUploading,
  uploadProgress,
}: NewGroupModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showNewGroupModal) return null;

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || student.level?.toLowerCase().includes(search);
  });

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const isSelected = (studentId: string) => selectedStudents.includes(studentId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setProfilePic(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePic(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setProfilePic(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please drop a valid image file (max 5MB)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">Create New Group</h3>
          <p className="text-blue-100 mt-2">Set up your new study group</p>
          <button
            onClick={() => setShowNewGroupModal(false)}
            className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
            disabled={isSubmitting || isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Group Name *
            </label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800"
              placeholder="Enter a catchy group name"
              disabled={isSubmitting || isUploading}
            />
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Profile Picture
            </label>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
                ${isUploading
                  ? 'border-blue-400 bg-blue-50'
                  : imagePreview
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting || isUploading}
              />

              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-800">Uploading image...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600">{uploadProgress}%</p>
                  </div>
                </div>
              ) : imagePreview ? (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-green-400"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-green-700 font-medium">Image selected ✓</p>
                  <p className="text-xs text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Drop your group avatar here or click to browse
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Education Level *
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 bg-white disabled:bg-gray-50"
                disabled={isSubmitting || isUploading}
              >
                <option value="">Select Level</option>
                <option value="Others">Others</option>
                <option value="O Level">O Level</option>
                <option value="A Level">A Level</option>
              </select>
            </div>

            {/* Students Multi-Select with Search */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Add Students ({selectedStudents.length} selected)
              </label>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 disabled:bg-gray-50"
                  disabled={isSubmitting || isUploading || loadingStudents}
                />
              </div>

              {/* Students List */}
              <div className="border-2 border-gray-200 rounded-xl max-h-[240px] overflow-y-auto bg-white">
                {loadingStudents ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Loading students...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {students.length === 0 ? "No students found" : "No matching students"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => !isSubmitting && !isUploading && toggleStudent(student._id)}
                        className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150 
                          ${isSelected(student._id) ? "bg-blue-50" : ""}
                          ${(isSubmitting || isUploading) ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                        disabled={isSubmitting || isUploading}
                      >
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-800">
                            {student.firstName} {student.lastName}
                          </p>
                          {student.level && (
                            <p className="text-xs text-gray-500">{student.level}</p>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 
                            ${isSelected(student._id)
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                            }`}
                        >
                          {isSelected(student._id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Subject *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-800 bg-white disabled:bg-gray-50"
              disabled={isSubmitting || isUploading || loading}
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
                      subject._id ||
                      ""
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

          {/* Selected Students Preview */}
          {selectedStudents.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-100 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Selected Students ({selectedStudents.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedStudents.map((id) => {
                  const stu = students.find((s) => s._id === id);
                  if (!stu) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-2 bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
                    >
                      <span className="text-sm">
                        {stu.firstName} {stu.lastName}
                        {stu.level ? ` — ${stu.level}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => !isSubmitting && !isUploading && toggleStudent(id)}
                        className="hover:bg-red-100 rounded-full p-0.5 transition-colors disabled:opacity-50"
                        disabled={isSubmitting || isUploading}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => setShowNewGroupModal(false)}
              disabled={isSubmitting || isUploading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={isSubmitting || isUploading || !newGroupName.trim() || !selectedLevel || !selectedSubject}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative"
            >
              {(isSubmitting || isUploading) ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </span>
              ) : (
                "Create Group"
              )}
            </button>
          </div>

          {/* Required Fields Note */}
          <p className="text-xs text-gray-500 text-center pt-4">
            * Required fields
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;