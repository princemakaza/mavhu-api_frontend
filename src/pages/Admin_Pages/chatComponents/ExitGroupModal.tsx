import { X } from "lucide-react";

interface ExitGroupModalProps {
  showExitConfirmModal: boolean;
  setShowExitConfirmModal: (show: boolean) => void;
  activeGroup: any;
  handleExitGroup: () => void;
}

const ExitGroupModal = ({
  showExitConfirmModal,
  setShowExitConfirmModal,
  activeGroup,
  handleExitGroup,
}: ExitGroupModalProps) => {
  if (!showExitConfirmModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-8 rounded-t-2xl">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Exit Group</h3>
              <p className="text-orange-100 mt-1">Leave this study group</p>
            </div>
          </div>
          <button
            onClick={() => setShowExitConfirmModal(false)}
            className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          {/* Info Message */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-6 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-orange-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-lg font-semibold text-orange-800">
                  Ready to leave the group?
                </h4>
                <div className="mt-2 text-orange-700">
                  <p className="text-base">
                    You're about to exit the group{" "}
                    <span className="font-bold bg-orange-100 px-2 py-1 rounded">
                      "{activeGroup?.name}"
                    </span>
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                    <li>You won't receive new messages from this group</li>
                    <li>You can rejoin if invited again</li>
                    <li>Your previous messages will remain in the group</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowExitConfirmModal(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              Stay in Group
            </button>
            <button
              onClick={handleExitGroup}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Yes, Exit Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitGroupModal;