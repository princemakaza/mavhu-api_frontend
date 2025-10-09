import { X } from "lucide-react";

interface UpdateGroupModalProps {
  showUpdateModal: boolean;
  setShowUpdateModal: (show: boolean) => void;
  updatedGroupName: string;
  setUpdatedGroupName: (name: string) => void;
  updatedGroupSubject: string;
  setUpdatedGroupSubject: (subject: string) => void;
  updatedGroupLevel: string;
  setUpdatedGroupLevel: (level: string) => void;
  isSubmitting: boolean;
  handleUpdateGroup: () => void;
}

const UpdateGroupModal = ({
  showUpdateModal,
  setShowUpdateModal,
  updatedGroupName,
  setUpdatedGroupName,
  updatedGroupSubject,
  setUpdatedGroupSubject,
  updatedGroupLevel,
  setUpdatedGroupLevel,
  isSubmitting,
  handleUpdateGroup,
}: UpdateGroupModalProps) => {
  if (!showUpdateModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">Update Group</h3>
          <p className="text-green-100 mt-2">Modify your group settings</p>
          <button
            onClick={() => setShowUpdateModal(false)}
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
              value={updatedGroupName}
              onChange={(e) => setUpdatedGroupName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
              placeholder="Enter new group name"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={updatedGroupSubject}
                onChange={(e) => setUpdatedGroupSubject(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                placeholder="Enter new subject"
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Education Level
              </label>
              <select
                value={updatedGroupLevel}
                onChange={(e) => setUpdatedGroupLevel(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800 bg-white"
              >
                <option value="Form 1">Form 1</option>
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateGroup}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating...
                </span>
              ) : (
                "Update Group"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateGroupModal;