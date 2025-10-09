import { X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteGroupModalProps {
  showDeleteConfirmModal: boolean;
  setShowDeleteConfirmModal: (show: boolean) => void;
  groupToDelete: any;
  activeGroup: any;
  openUpdateModal: (group: any) => void;
  handleDeleteGroup: () => void;
}

const DeleteGroupModal = ({
  showDeleteConfirmModal,
  setShowDeleteConfirmModal,
  groupToDelete,
  activeGroup,
  openUpdateModal,
  handleDeleteGroup,
}: DeleteGroupModalProps) => {
  if (!showDeleteConfirmModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-600 to-pink-600 p-8 rounded-t-2xl">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
              <Trash2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Delete Group
              </h3>
              <p className="text-red-100 mt-1">This action is permanent</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirmModal(false)}
            className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Warning Message */}
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-semibold text-red-800">
                  Are you sure you want to delete this group?
                </h4>
                <div className="mt-2 text-red-700">
                  <p className="text-base">
                    You're about to permanently delete the group{" "}
                    <span className="font-bold bg-red-100 px-2 py-1 rounded">
                      "{groupToDelete?.name}"
                    </span>
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                    <li>All messages and files will be lost forever</li>
                    <li>All group members will be removed</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {activeGroup && (
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  openUpdateModal(activeGroup);
                }}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Update Instead
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirmModal(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteGroup}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteGroupModal;