import React, { useState, useEffect } from "react";
import { Users, Loader2, Menu, X, Trash2, Mail, Phone, Eye, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import AdminService from "@/services/Admin_Service/admin_service";

const AdminManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Update screen size state and handle sidebar visibility
    useEffect(() => {
        const checkScreenSize = () => {
            const isLarge = window.innerWidth >= 768;
            setIsLargeScreen(isLarge);
            setSidebarOpen(isLarge);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Fetch admins from API
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await AdminService.getAllAdmins();
                console.log(response.data);
                setAdmins(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to load admins");
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    const openDeleteConfirmation = (adminId) => {
        setConfirmDelete(adminId);
    };

    const handleViewAdmin = (admin) => {
        setSelectedAdmin(admin);
        setShowAdminModal(true);
    };

    const closeAdminModal = () => {
        setShowAdminModal(false);
        setSelectedAdmin(null);
    };

    const cancelDelete = () => {
        setConfirmDelete(null);
    };

    const confirmDeleteAdmin = async () => {
        try {
            await AdminService.deleteAdminById(confirmDelete);
            setAdmins(admins.filter((admin) => admin._id !== confirmDelete));
            setConfirmDelete(null);
        } catch (err) {
            alert("Failed to delete admin");
            setConfirmDelete(null);
        }
    };

    // Shimmer component for loading state
    const AdminCardShimmer = () => (
        <Card className="w-full flex flex-col animate-pulse">
            {/* Profile picture placeholder */}
            <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full mx-auto mb-3 sm:mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>

            <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
                {/* Role tag */}
                <div className="flex items-center justify-center mb-3">
                    <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto">
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
            </CardContent>
        </Card>
    );

    // Clean profile picture URL (remove extra quotes if present)
    const cleanImageUrl = (url) => {
        if (!url) return null;
        return url.replace(/^"/, '').replace(/"$/, '');
    };

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-500 p-4">
                <div className="text-center">
                    <p className="text-lg font-semibold">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-lg"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
            >
                {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div
                className={`
          ${sidebarOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0"
                    } 
          transition-all duration-300 ease-in-out 
          fixed md:relative z-40 md:z-auto w-64
        `}
            >
                <Sidebar />
            </div>

            {/* Backdrop Overlay for Mobile */}
            {sidebarOpen && !isLargeScreen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold">Confirm Delete</h3>
                        </div>
                        <p className="mb-6 text-sm sm:text-base text-gray-600">
                            Are you sure you want to delete this admin? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm sm:text-base"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base"
                                onClick={confirmDeleteAdmin}
                            >
                                Delete Admin
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Details Modal */}
            {showAdminModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Details</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeAdminModal}
                                className="hover:bg-white/50"
                            >
                                <X size={24} />
                            </Button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-100px)]">
                            <div className="flex flex-col items-center text-center mb-6">
                                {/* Profile Picture */}
                                <div className="relative mb-4">
                                    <img
                                        src={cleanImageUrl(selectedAdmin.profilePicture) || `https://ui-avatars.com/api/?name=${selectedAdmin.firstName}+${selectedAdmin.lastName}&background=1e40af&color=fff&size=200`}
                                        alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full shadow-lg border-4 border-white"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${selectedAdmin.firstName}+${selectedAdmin.lastName}&background=1e40af&color=fff&size=200`;
                                        }}
                                    />
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900 text-white capitalize">
                                            {selectedAdmin.role}
                                        </span>
                                    </div>
                                </div>

                                {/* Name */}
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                    {selectedAdmin.firstName} {selectedAdmin.lastName}
                                </h1>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-start sm:items-center gap-3">
                                            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm font-medium text-gray-500">Email</p>
                                                <p className="text-sm sm:text-base text-gray-900 break-words">{selectedAdmin.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start sm:items-center gap-3">
                                            <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs sm:text-sm font-medium text-gray-500">Phone</p>
                                                <p className="text-sm sm:text-base text-gray-900">{selectedAdmin.contactNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Information */}
                                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Role & Permissions</h3>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <span className="capitalize font-medium text-blue-900 text-sm sm:text-base">
                                            {selectedAdmin.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1 w-full"
                                    onClick={closeAdminModal}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                                    onClick={() => {
                                        closeAdminModal();
                                        openDeleteConfirmation(selectedAdmin._id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Admin
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 w-full overflow-x-hidden">
                <div className="w-full min-h-screen p-3 sm:p-4 md:p-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0 mt-12 sm:mt-10 md:mt-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-900" />
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-900">ADMIN MANAGEMENT</h1>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="bg-blue-100 px-3 sm:px-4 py-2 rounded-lg flex-1 sm:flex-none">
                                <span className="text-xs sm:text-sm font-medium text-blue-900 whitespace-nowrap">
                                    Total Admins: {admins.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Admins Grid - Improved responsiveness */}
                    <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
                        {loading ? (
                            // Show shimmer loaders while loading
                            Array.from({ length: 6 }).map((_, index) => (
                                <AdminCardShimmer key={index} />
                            ))
                        ) : (
                            // Show actual admin cards when data is loaded
                            admins.map((admin) => (
                                <Card
                                    key={admin._id}
                                    className="w-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group relative"
                                    onClick={() => handleViewAdmin(admin)}
                                >
                                    {/* Profile Section */}
                                    <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                                        <div className="flex flex-col items-center text-center">
                                            <img
                                                src={cleanImageUrl(admin.profilePicture) || `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=1e40af&color=fff&size=200`}
                                                alt={`${admin.firstName} ${admin.lastName}`}
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full mb-3 shadow-lg border-2 border-white group-hover:scale-110 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=1e40af&color=fff&size=200`;
                                                }}
                                            />
                                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 line-clamp-1">
                                                {admin.firstName} {admin.lastName}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-white capitalize">
                                                {admin.role}
                                            </span>
                                        </div>
                                    </div>

                                    <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
                                        {/* Contact Information */}
                                        <div className="space-y-2 mb-4 flex-grow">
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                <span className="truncate">{admin.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span className="truncate">{admin.contactNumber}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 mt-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 text-xs sm:text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewAdmin(admin);
                                                }}
                                            >
                                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteConfirmation(admin._id);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Empty State */}
                    {!loading && admins.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No admins found</h3>
                            <p className="mt-1 text-sm sm:text-base text-gray-500">No administrators are currently in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;