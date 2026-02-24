import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    X,
    Edit,
    Trash2,
    Save,
    Building,
    Globe as GlobeIcon,
    MapPin,
    Mail,
    Phone,
    FileText,
    Calendar,
    CheckCircle,
    XCircle,
    Link,
    Zap,
    Recycle,
    Heart,
    Map as MapIcon,
    BarChart3,
    Users,
    Shield,
    Eye,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Company, CreateCompanyPayload } from "../../../services/Admin_Service/companies_service";
import CompanyForm from "./CompanyForm";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CompanyModalsProps {
    showCreateModal: boolean;
    setShowCreateModal: (show: boolean) => void;
    showEditModal: boolean;
    setShowEditModal: (show: boolean) => void;
    showViewModal: boolean;
    setShowViewModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    selectedCompany: Company | null;
    formData: CreateCompanyPayload;
    setFormData: React.Dispatch<React.SetStateAction<CreateCompanyPayload>>;
    newCoordinate: { lat: string; lon: string };
    setNewCoordinate: React.Dispatch<React.SetStateAction<{ lat: string; lon: string }>>;
    handleAddCoordinate: () => void;
    handleRemoveCoordinate: (index: number) => void;
    handleAddDataSource: (source: string) => void;
    handleRemoveDataSource: (source: string) => void;
    handleAddFramework: (framework: string) => void;
    handleRemoveFramework: (framework: string) => void;
    handleCreateCompany: () => void;
    handleUpdateCompany: () => void;
    handleDeleteCompany: () => void;
    handleEditCompany: (company: Company) => void;
    handleDeleteClick: (company: Company) => void;
    handleApiNavigation: (path: string) => void;
    isDarkMode: boolean;
    themeClasses: any;
    logoGreen: string;
    getStatusIcon: (status: string) => JSX.Element;
}

const CompanyModals: React.FC<CompanyModalsProps> = ({
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showViewModal,
    setShowViewModal,
    showDeleteModal,
    setShowDeleteModal,
    selectedCompany,
    formData,
    setFormData,
    newCoordinate,
    setNewCoordinate,
    handleAddCoordinate,
    handleRemoveCoordinate,
    handleAddDataSource,
    handleRemoveDataSource,
    handleAddFramework,
    handleRemoveFramework,
    handleCreateCompany,
    handleUpdateCompany,
    handleDeleteCompany,
    handleEditCompany,
    handleDeleteClick,
    handleApiNavigation,
    isDarkMode,
    themeClasses,
    logoGreen,
    getStatusIcon,
}) => {
    const navigate = useNavigate();

    // API items for navigation with full descriptions
    const apiItems = [
        { icon: Building, label: "Soil Health", path: "/portal/esg-dashboard/soil-health-carbon", description: "Soil quality and health metrics" },
        { icon: BarChart3, label: "Crop Yield", path: "/portal/esg-dashboard/crop-yield", description: "Agricultural productivity data" },
        { icon: MapIcon, label: "GHG Emissions", path: "/portal/esg-dashboard/ghg-emissions", description: "Greenhouse gas emissions tracking" },
        { icon: GlobeIcon, label: "Biodiversity", path: "/apis/biodiversity", description: "Ecosystem and species diversity" },
        { icon: MapPin, label: "Water Risk", path: "/apis/water-risk", description: "Water scarcity and quality assessment" },
        { icon: Shield, label: "Compliance", path: "/apis/compliance", description: "Regulatory compliance monitoring" },
        { icon: Zap, label: "Energy", path: "/apis/energy", description: "Energy consumption and efficiency" },
        { icon: Recycle, label: "Waste", path: "/apis/waste", description: "Waste management and recycling metrics" },
        { icon: Users, label: "Workforce", path: "/apis/workforce", description: "Employee and labor metrics" },
        { icon: Heart, label: "Health & Safety", path: "/apis/health-safety", description: "Workplace safety and health" },
        { icon: Building, label: "Governance", path: "/apis/governance", description: "Corporate governance metrics" },
        { icon: BarChart3, label: "ESG Score", path: "/apis/esg-score", description: "Overall ESG performance scoring" },
    ];

    return (
        <>
            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full md:w-1/2">
                        <div className={`h-full ${themeClasses.modalBg} shadow-2xl overflow-y-auto`}>
                            <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" style={{
                                background: themeClasses.modalBg,
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}>
                                <h2 className="text-xl font-bold" style={{ color: logoGreen }}>
                                    Add New Company
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-6 bg-white">                                <form onSubmit={(e) => { e.preventDefault(); handleCreateCompany(); }}>
                                <CompanyForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    isDarkMode={isDarkMode}
                                    themeClasses={themeClasses}
                                    logoGreen={logoGreen}
                                    newCoordinate={newCoordinate}
                                    setNewCoordinate={setNewCoordinate}
                                    handleAddCoordinate={handleAddCoordinate}
                                    handleRemoveCoordinate={handleRemoveCoordinate}
                                    handleAddDataSource={handleAddDataSource}
                                    handleRemoveDataSource={handleRemoveDataSource}
                                    handleAddFramework={handleAddFramework}
                                    handleRemoveFramework={handleRemoveFramework}
                                />
                                <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className={`px-6 py-2.5 rounded-lg font-medium ${themeClasses.hoverBg} border ${themeClasses.border}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                                        style={{
                                            background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? '#00CC00' : '#006400'})`,
                                            color: '#FFFFFF',
                                        }}
                                    >
                                        Create Company
                                    </button>
                                </div>
                            </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCompany && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full md:w-1/2">
                        <div className={`h-full ${themeClasses.modalBg} shadow-2xl overflow-y-auto`}>
                            <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" style={{
                                background: themeClasses.modalBg,
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}>
                                <h2 className="text-xl font-bold" style={{ color: logoGreen }}>
                                    Edit Company: {selectedCompany.name}
                                </h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdateCompany(); }}>
                                    <CompanyForm
                                        formData={formData}
                                        setFormData={setFormData}
                                        isDarkMode={isDarkMode}
                                        themeClasses={themeClasses}
                                        logoGreen={logoGreen}
                                        newCoordinate={newCoordinate}
                                        setNewCoordinate={setNewCoordinate}
                                        handleAddCoordinate={handleAddCoordinate}
                                        handleRemoveCoordinate={handleRemoveCoordinate}
                                        handleAddDataSource={handleAddDataSource}
                                        handleRemoveDataSource={handleRemoveDataSource}
                                        handleAddFramework={handleAddFramework}
                                        handleRemoveFramework={handleRemoveFramework}
                                    />
                                    <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className={`px-6 py-2.5 rounded-lg font-medium ${themeClasses.hoverBg} border ${themeClasses.border}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-90"
                                            style={{
                                                background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? '#00CC00' : '#006400'})`,
                                                color: '#FFFFFF',
                                            }}
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedCompany && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowViewModal(false)}></div>
                    <div className="absolute inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2">
                        <div className={`h-full ${themeClasses.modalBg} shadow-2xl overflow-y-auto`}>
                            <div className="sticky top-0 z-10 p-6 border-b flex items-center justify-between" style={{
                                background: themeClasses.modalBg,
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            }}>
                                <h2 className="text-xl font-bold" style={{ color: logoGreen }}>
                                    {selectedCompany.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            handleEditCompany(selectedCompany);
                                            setShowViewModal(false);
                                        }}
                                        className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className={`p-2 rounded-lg ${themeClasses.hoverBg}`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {/* Company Details */}
                                <div className="grid md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Building className="w-5 h-5" style={{ color: logoGreen }} />
                                            Company Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${themeClasses.textMuted}`}>Registration Number</p>
                                                    <p className="font-medium">{selectedCompany.registrationNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                    <GlobeIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${themeClasses.textMuted}`}>Industry</p>
                                                    <p className="font-medium">{selectedCompany.industry}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${themeClasses.textMuted}`}>Country</p>
                                                    <p className="font-medium">{selectedCompany.country}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                            <Mail className="w-5 h-5" style={{ color: logoGreen }} />
                                            Contact Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${themeClasses.textMuted}`}>Email</p>
                                                    <p className="font-medium">{selectedCompany.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm ${themeClasses.textMuted}`}>Phone</p>
                                                    <p className="font-medium">{selectedCompany.phone}</p>
                                                </div>
                                            </div>
                                            {selectedCompany.website && (
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${themeClasses.hoverBg}`}>
                                                        <GlobeIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${themeClasses.textMuted}`}>Website</p>
                                                        <a
                                                            href={selectedCompany.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-medium hover:underline"
                                                            style={{ color: logoGreen }}
                                                        >
                                                            {selectedCompany.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ESG Status */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-4">ESG Status</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm ${themeClasses.textMuted}`}>Data Status</span>
                                                {getStatusIcon(selectedCompany.esg_data_status || "not_collected")}
                                            </div>
                                            <p className="text-lg font-semibold capitalize">
                                                {selectedCompany.esg_data_status?.replace("_", " ") || "Not Collected"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm ${themeClasses.textMuted}`}>Latest Report</span>
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {selectedCompany.latest_esg_report_year || "N/A"}
                                            </p>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm ${themeClasses.textMuted}`}>ESG Linked Pay</span>
                                                {selectedCompany.has_esg_linked_pay ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                            <p className="text-lg font-semibold">
                                                {selectedCompany.has_esg_linked_pay ? "Yes" : "No"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedCompany.description && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold mb-4">Description</h3>
                                        <p className={`${themeClasses.textSecondary} leading-relaxed`}>
                                            {selectedCompany.description}
                                        </p>
                                    </div>
                                )}

                                {/* Location Map */}
                                {selectedCompany.area_of_interest_metadata?.coordinates &&
                                    selectedCompany.area_of_interest_metadata.coordinates.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <MapIcon className="w-5 h-5" style={{ color: logoGreen }} />
                                                Area of Interest
                                            </h3>
                                            <div className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                                {selectedCompany.area_of_interest_metadata.name && (
                                                    <p className="mb-2"><strong>Name:</strong> {selectedCompany.area_of_interest_metadata.name}</p>
                                                )}
                                                {selectedCompany.area_of_interest_metadata.area_covered && (
                                                    <p className="mb-4"><strong>Area Covered:</strong> {selectedCompany.area_of_interest_metadata.area_covered}</p>
                                                )}
                                                <div className="h-96 rounded-lg overflow-hidden">
                                                    <MapContainer
                                                        center={[
                                                            selectedCompany.area_of_interest_metadata.coordinates[0].lat,
                                                            selectedCompany.area_of_interest_metadata.coordinates[0].lon
                                                        ]}
                                                        zoom={13}
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />
                                                        {selectedCompany.area_of_interest_metadata.coordinates.map((coord, idx) => (
                                                            <Marker key={idx} position={[coord.lat, coord.lon]}>
                                                                <Popup>
                                                                    Point {idx + 1}<br />
                                                                    Lat: {coord.lat}, Lon: {coord.lon}
                                                                </Popup>
                                                            </Marker>
                                                        ))}
                                                        {selectedCompany.area_of_interest_metadata.coordinates.length > 2 && (
                                                            <Polygon
                                                                positions={selectedCompany.area_of_interest_metadata.coordinates.map(c => [c.lat, c.lon])}
                                                                pathOptions={{ color: logoGreen, fillColor: logoGreen, fillOpacity: 0.2 }}
                                                            />
                                                        )}
                                                    </MapContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* API Navigation */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Available APIs for {selectedCompany.name}</h3>
                                        <div className="flex items-center gap-2 text-sm" style={{ color: logoGreen }}>
                                            <Link className="w-4 h-4" />
                                            <span>Click to navigate with company ID</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {apiItems.map((api, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleApiNavigation(api.path)}
                                                className={`flex flex-col items-start gap-2 p-3 rounded-lg border ${themeClasses.border} transition-all duration-300 ${themeClasses.hoverBg} hover:${themeClasses.borderHover} group`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="p-1.5 rounded-md"
                                                        style={{
                                                            background: `linear-gradient(to right, ${logoGreen}${isDarkMode ? '30' : '10'}, ${logoGreen}${isDarkMode ? '20' : '05'})`,
                                                            border: `1px solid ${logoGreen}${isDarkMode ? '40' : '20'}`
                                                        }}
                                                    >
                                                        <api.icon className="w-3.5 h-3.5" style={{ color: logoGreen }} />
                                                    </div>
                                                    <span className="text-sm font-medium">{api.label}</span>
                                                </div>
                                                <span className={`text-xs ${themeClasses.textMuted} text-left`}>{api.description}</span>
                                                <div className="w-full flex justify-end">
                                                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: logoGreen }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className={`p-4 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg}`}>
                                    <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                handleEditCompany(selectedCompany);
                                                setShowViewModal(false);
                                            }}
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                                        >
                                            <Edit className="w-4 h-4" />
                                            <span className="text-sm font-medium">Edit Company</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowViewModal(false);
                                                handleDeleteClick(selectedCompany);
                                            }}
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete Company</span>
                                        </button>

                                        {/* View ESG Metrics */}
                                        <button
                                            onClick={() => { navigate(`/admin_esg_metric/${selectedCompany._id}`); setShowViewModal(false); }}
                                            className={`flex items-center gap-2 p-3 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors col-span-2`}
                                        >
                                            <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-medium">View ESG Metrics</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)}></div>
                    <div className={`relative w-full max-w-md rounded-2xl border ${themeClasses.border} ${themeClasses.modalBg} shadow-2xl`}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-red-500/10">
                                    <Trash2 className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-xl font-bold">Delete Company</h2>
                            </div>
                            <p className={`${themeClasses.textSecondary} mb-6`}>
                                Are you sure you want to delete <span className="font-semibold">{selectedCompany.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={`px-6 py-2.5 rounded-lg font-medium ${themeClasses.hoverBg} border ${themeClasses.border}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCompany}
                                    className="px-6 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                    Delete Company
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CompanyModals;