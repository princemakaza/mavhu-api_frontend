import { ChevronDown, ChevronUp, Star, Trash2, X } from "lucide-react";

interface GroupInfoSidebarProps {
  infoSidebarOpen: boolean;
  isLargeScreen: boolean;
  setInfoSidebarOpen: (open: boolean) => void;
  activeGroup: any;
  expandedSections: any;
  toggleSection: (section: string) => void;
  loading: boolean;
  isFavorite: (groupId: string) => boolean;
  toggleFavorite: (groupId: string) => void;
  setShowExitConfirmModal: (show: boolean) => void;
  openDeleteConfirmModal: (group: any) => void;
}

const GroupInfoSidebar = ({
  infoSidebarOpen,
  isLargeScreen,
  setInfoSidebarOpen,
  activeGroup,
  expandedSections,
  toggleSection,
  loading,
  isFavorite,
  toggleFavorite,
  setShowExitConfirmModal,
  openDeleteConfirmModal,
}: GroupInfoSidebarProps) => {
  return (
    <div
      className={`
        ${infoSidebarOpen
          ? "translate-x-0"
          : "translate-x-full lg:translate-x-0"
        } 
        transition-transform duration-300 ease-in-out
        fixed lg:relative right-0 z-30 w-full sm:w-80 lg:w-64 bg-white h-[calc(100%-3rem)] md:h-full
        flex flex-col border-l
      `}
    >
      <div className="p-4 bg-gray-200 flex justify-between items-center">
        <div className="font-semibold">Group Info</div>
        <button
          onClick={() => setInfoSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-4 w-4 cursor-pointer" />
        </button>
      </div>

      {/* Display Subject Information */}
      {activeGroup && (
        <div className="p-4 border-b">
          <h3 className="font-medium mb-1">Subject</h3>
          <div className="bg-blue-50 p-2 rounded">
            <p className="text-sm">
              {activeGroup.subject?.subjectName || "No subject information"}
            </p>
            <p className="text-xs text-gray-500">
              {activeGroup.subject?.Level || ""}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium">Level</p>
            <p className="text-sm">
              {activeGroup.Level || "Not specified"}
            </p>
          </div>
        </div>
      )}

      {/* Group Info Sections */}


      {/* Members List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-2 rounded border">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">
                {activeGroup
                  ? `${activeGroup.students?.length || 0} members`
                  : "0 members"}
              </div>
              <X className="h-4 w-4 cursor-pointer" />
            </div>

            <div className="space-y-2">
              {activeGroup &&
                activeGroup.students?.map((student) => (
                  <div
                    key={student._id}
                    className="bg-white p-2 rounded border"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <span className="text-sm">{`${student.firstName} ${student.lastName}`}</span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 mt-auto space-y-2">
        <button
          onClick={() => activeGroup && toggleFavorite(activeGroup._id)}
          className={`w-full py-2 px-4 border rounded font-medium flex items-center justify-center ${activeGroup && isFavorite(activeGroup._id)
            ? "bg-yellow-100 border-yellow-500 text-yellow-700"
            : "border-blue-500 text-blue-500"
            } hover:bg-yellow-50 transition-colors`}
          disabled={!activeGroup}
        >
          {activeGroup && isFavorite(activeGroup._id) ? (
            <>
              <Star className="h-4 w-4 mr-2 fill-yellow-500 text-yellow-500" />
              Favorited
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Add to favorites
            </>
          )}
        </button>
        {/* <button
          onClick={() => setShowExitConfirmModal(true)}
          className="w-full py-2 px-4 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
          disabled={!activeGroup}
        >
          Exit Group
        </button> */}
        {activeGroup && (
          <button
            onClick={() => openDeleteConfirmModal(activeGroup)}
            className="w-full py-2 px-4 bg-red-700 text-white rounded font-medium flex items-center justify-center hover:bg-red-800 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Group
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupInfoSidebar;