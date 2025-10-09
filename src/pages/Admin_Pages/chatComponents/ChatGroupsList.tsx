import { Plus, Search, Star } from "lucide-react";

interface ChatGroupsListProps {
  groupsListOpen: boolean;
  isMediumScreen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowNewGroupModal: (show: boolean) => void;
  loading: boolean;
  error: string | null;
  communities: any[];
  activeGroup: any;
  setActiveGroup: (group: any) => void;
  setGroupsListOpen: (open: boolean) => void;
  isFavorite: (groupId: string) => boolean;
}

const ChatGroupsList = ({
  groupsListOpen,
  isMediumScreen,
  searchQuery,
  setSearchQuery,
  setShowNewGroupModal,
  loading,
  error,
  communities,
  activeGroup,
  setActiveGroup,
  setGroupsListOpen,
  isFavorite,
}: ChatGroupsListProps) => {
  return (
    <div
      className={`
        ${groupsListOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0"
        } 
        transition-transform duration-300 ease-in-out
        fixed md:relative left-0 z-30 w-full md:w-80 md:min-w-64 bg-white h-[calc(100%-3rem)] md:h-full
        flex flex-col border-r
      `}
    >
      {/* Search Area */}
      <div className="p-3 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-8 pr-10 bg-purple-50 text-gray-700 rounded-md"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="absolute right-2 top-2.5 h-4 w-4 text-gray-500"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* Group List */}
      <div className="p-3 space-y-2 flex-grow overflow-y-auto">
        {loading ? (
          <div className="p-3 space-y-2 flex-grow overflow-y-auto">
            {/* Shimmer for groups list */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="w-full py-2 px-4 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : communities.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No groups available
          </div>
        ) : (
          communities
            .filter((community) =>
              community.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map((community) => (
              <div key={community._id} className="group relative">
                <button
                  className={`w-full text-left py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeGroup?._id === community._id
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => {
                    setActiveGroup(community);
                    if (!isMediumScreen) {
                      setGroupsListOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {community.profilePicture ? (
                          <img
                            src={community.profilePicture}
                            alt={`${community.name} profile`}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const nextSibling =
                                target.nextSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        {/* Fallback avatar with initials */}
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${community.profilePicture ? "hidden" : "flex"
                            } ${activeGroup?._id === community._id
                              ? "bg-blue-700 text-white"
                              : "bg-gray-300 text-gray-600"
                            }`}
                          style={{
                            display: community.profilePicture
                              ? "none"
                              : "flex",
                          }}
                        >
                          {community.name
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word.charAt(0).toUpperCase())
                            .join("")}
                        </div>
                      </div>

                      {/* Group Name */}
                      <span className="truncate">{community.name}</span>
                    </div>

                    {/* Favorite Star */}
                    {isFavorite(community._id) && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ChatGroupsList;