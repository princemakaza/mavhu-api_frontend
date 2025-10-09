import { X } from "lucide-react";

interface NewGroupModalProps {
  showNewGroupModal: boolean;
  setShowNewGroupModal: (show: boolean) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  profilePic: File | null;
  setProfilePic: (file: File | null) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  selectedStudent: string;
  setSelectedStudent: (student: string) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  loading: boolean;
  subjects: any[];
  isSubmitting: boolean;
  handleCreateGroup: () => void;
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
  selectedStudent,
  setSelectedStudent,
  selectedSubject,
  setSelectedSubject,
  loading,
  subjects,
  isSubmitting,
  handleCreateGroup,
}: NewGroupModalProps) => {
  if (!showNewGroupModal) return null;

  return (
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
                onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
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
  );
};

export default NewGroupModal;