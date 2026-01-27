import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Sidebar from "../../components/Sidebar";
import {
    Building,
    Edit,
    Trash2,
    Eye,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    Globe,
    Users,
    Shield,
    Leaf,
    Droplet,
    Zap,
    Recycle,
    Heart,
    Cloud,
    TrendingUp,
    BarChart,
    X,
    Save,
    MapPin,
    Phone,
    Mail,
    Globe as GlobeIcon,
    FileText,
    Calendar,
    Target,
    Clock,
    Activity,
    ArrowRight,
    Link,
    Map as MapIcon,
    BarChart3
} from "lucide-react";
import {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    type Company,
    type CreateCompanyPayload,
    type Coordinate,
} from "../../services/Admin_Service/companies_service";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CompanyManagementScreen = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const navigate = useNavigate();

    // State for companies
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [industryFilter, setIndustryFilter] = useState("all");

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Selected company
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateCompanyPayload>({
        name: "",
        registrationNumber: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        country: "",
        industry: "",
        description: "",
        purpose: "",
        scope: "",
        data_source: [],
        area_of_interest_metadata: {
            name: "",
            area_covered: "",
            coordinates: []
        },
        data_range: "",
        data_processing_workflow: "",
        analytical_layer_metadata: "",
        esg_reporting_framework: [],
        esg_contact_person: {
            name: "",
            email: "",
            phone: ""
        },
        latest_esg_report_year: new Date().getFullYear(),
        esg_data_status: "not_collected",
        has_esg_linked_pay: false,
    });

    // Temporary coordinate input
    const [newCoordinate, setNewCoordinate] = useState({ lat: "", lon: "" });

    // API items for navigation with full descriptions
    const apiItems = [
        { icon: Leaf, label: "Soil Health", path: "/portal/esg-dashboard/soil-health-carbon", description: "Soil quality and health metrics" },
        { icon: TrendingUp, label: "Crop Yield", path: "/portal/esg-dashboard/crop-yield", description: "Agricultural productivity data" },
        { icon: Cloud, label: "GHG Emissions", path: "/portal/esg-dashboard/ghg-emissions", description: "Greenhouse gas emissions tracking" },
        { icon: Globe, label: "Biodiversity", path: "/apis/biodiversity", description: "Ecosystem and species diversity" },
        { icon: Droplet, label: "Water Risk", path: "/apis/water-risk", description: "Water scarcity and quality assessment" },
        { icon: Shield, label: "Compliance", path: "/apis/compliance", description: "Regulatory compliance monitoring" },
        { icon: Zap, label: "Energy", path: "/apis/energy", description: "Energy consumption and efficiency" },
        { icon: Recycle, label: "Waste", path: "/apis/waste", description: "Waste management and recycling metrics" },
        { icon: Users, label: "Workforce", path: "/apis/workforce", description: "Employee and labor metrics" },
        { icon: Heart, label: "Health & Safety", path: "/apis/health-safety", description: "Workplace safety and health" },
        { icon: Building, label: "Governance", path: "/apis/governance", description: "Corporate governance metrics" },
        { icon: BarChart, label: "ESG Score", path: "/apis/esg-score", description: "Overall ESG performance scoring" },
    ];

    // Colors for both modes
    const logoGreen = isDarkMode ? "#00FF00" : "#008000";
    const logoYellow = isDarkMode ? "#FFD700" : "#B8860B";
    const darkBg = "#0A0A0A";
    const lightBg = "#F5F5F5";
    const lightCardBg = "#FFFFFF";

    // Theme classes
    const themeClasses = {
        bg: isDarkMode ? darkBg : lightBg,
        text: isDarkMode ? "text-white" : "text-gray-900",
        textSecondary: isDarkMode ? "text-gray-300" : "text-gray-700",
        textMuted: isDarkMode ? "text-gray-400" : "text-gray-600",
        cardBg: isDarkMode ? `${darkBg}/30` : `${lightCardBg}/95`,
        cardBgAlt: isDarkMode ? `${darkBg}/40` : `${lightCardBg}/90`,
        border: isDarkMode ? "border-white/10" : "border-gray-300/70",
        borderHover: isDarkMode ? "border-white/20" : "border-gray-400",
        hoverBg: isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100",
        modalBg: isDarkMode ? darkBg : lightCardBg,
    };

    // Fetch companies
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCompanies(pagination.page, pagination.limit);
            setCompanies(response.items);
            setPagination({
                page: response.page,
                limit: response.limit,
                total: response.total,
                totalPages: response.totalPages,
            });
        } catch (err: any) {
            setError(err.message || "Failed to fetch companies");
        } finally {
            setLoading(false);
        }
    };

    // Handle create company
    const handleCreateCompany = async () => {
        try {
            await createCompany(formData);
            setShowCreateModal(false);
            resetForm();
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || "Failed to create company");
        }
    };

    // Handle update company
    const handleUpdateCompany = async () => {
        if (!selectedCompany) return;

        try {
            await updateCompany(selectedCompany._id, formData);
            setShowEditModal(false);
            resetForm();
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || "Failed to update company");
        }
    };

    // Handle delete company
    const handleDeleteCompany = async () => {
        if (!selectedCompany) return;

        try {
            await deleteCompany(selectedCompany._id);
            setShowDeleteModal(false);
            setSelectedCompany(null);
            fetchCompanies();
        } catch (err: any) {
            setError(err.message || "Failed to delete company");
        }
    };

    // Handle view company
    const handleViewCompany = async (companyId: string) => {
        try {
            const response = await getCompanyById(companyId);
            setSelectedCompany(response.company);
            setShowViewModal(true);
        } catch (err: any) {
            setError(err.message || "Failed to fetch company details");
        }
    };

    // Handle edit company
    const handleEditCompany = (company: Company) => {
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            registrationNumber: company.registrationNumber,
            email: company.email,
            phone: company.phone,
            address: company.address,
            website: company.website || "",
            country: company.country,
            industry: company.industry,
            description: company.description || "",
            purpose: company.purpose || "",
            scope: company.scope || "",
            data_source: company.data_source || [],
            area_of_interest_metadata: company.area_of_interest_metadata || {
                name: "",
                area_covered: "",
                coordinates: []
            },
            data_range: company.data_range || "",
            data_processing_workflow: company.data_processing_workflow || "",
            analytical_layer_metadata: company.analytical_layer_metadata || "",
            esg_reporting_framework: company.esg_reporting_framework || [],
            esg_contact_person: company.esg_contact_person || {
                name: "",
                email: "",
                phone: ""
            },
            latest_esg_report_year: company.latest_esg_report_year || new Date().getFullYear(),
            esg_data_status: company.esg_data_status || "not_collected",
            has_esg_linked_pay: company.has_esg_linked_pay || false,
        });
        setShowEditModal(true);
    };

    // Handle delete click
    const handleDeleteClick = (company: Company) => {
        setSelectedCompany(company);
        setShowDeleteModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            registrationNumber: "",
            email: "",
            phone: "",
            address: "",
            website: "",
            country: "",
            industry: "",
            description: "",
            purpose: "",
            scope: "",
            data_source: [],
            area_of_interest_metadata: {
                name: "",
                area_covered: "",
                coordinates: []
            },
            data_range: "",
            data_processing_workflow: "",
            analytical_layer_metadata: "",
            esg_reporting_framework: [],
            esg_contact_person: {
                name: "",
                email: "",
                phone: ""
            },
            latest_esg_report_year: new Date().getFullYear(),
            esg_data_status: "not_collected",
            has_esg_linked_pay: false,
        });
        setNewCoordinate({ lat: "", lon: "" });
    };

    // Add coordinate to form data
    const handleAddCoordinate = () => {
        if (newCoordinate.lat && newCoordinate.lon) {
            const coord: Coordinate = {
                lat: parseFloat(newCoordinate.lat),
                lon: parseFloat(newCoordinate.lon)
            };
            setFormData({
                ...formData,
                area_of_interest_metadata: {
                    ...formData.area_of_interest_metadata!,
                    coordinates: [...(formData.area_of_interest_metadata?.coordinates || []), coord]
                }
            });
            setNewCoordinate({ lat: "", lon: "" });
        }
    };

    // Remove coordinate from form data
    const handleRemoveCoordinate = (index: number) => {
        const coords = formData.area_of_interest_metadata?.coordinates || [];
        setFormData({
            ...formData,
            area_of_interest_metadata: {
                ...formData.area_of_interest_metadata!,
                coordinates: coords.filter((_, i) => i !== index)
            }
        });
    };

    // Add data source
    const handleAddDataSource = (source: string) => {
        if (source && !formData.data_source?.includes(source)) {
            setFormData({
                ...formData,
                data_source: [...(formData.data_source || []), source]
            });
        }
    };

    // Remove data source
    const handleRemoveDataSource = (source: string) => {
        setFormData({
            ...formData,
            data_source: (formData.data_source || []).filter(s => s !== source)
        });
    };

    // Add ESG framework
    const handleAddFramework = (framework: string) => {
        if (framework && !formData.esg_reporting_framework?.includes(framework)) {
            setFormData({
                ...formData,
                esg_reporting_framework: [...(formData.esg_reporting_framework || []), framework]
            });
        }
    };

    // Remove ESG framework
    const handleRemoveFramework = (framework: string) => {
        setFormData({
            ...formData,
            esg_reporting_framework: (formData.esg_reporting_framework || []).filter(f => f !== framework)
        });
    };

    // Handle API navigation with company ID
    const handleApiNavigation = (apiPath: string) => {
        if (selectedCompany) {
            navigate(`${apiPath}/${selectedCompany._id}`);
        } else {
            navigate(apiPath);
        }
    };

    // Filter companies based on search and industry
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesIndustry = industryFilter === "all" || company.industry === industryFilter;

        return matchesSearch && matchesIndustry;
    });

    // Get unique industries for filter
    const industries = Array.from(new Set(companies.map(company => company.industry)));

    // Pagination handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page }));
        }
    };

    // Initialize
    useEffect(() => {
        fetchCompanies();
    }, [pagination.page, pagination.limit]);

    // Handle dark mode toggle
    const handleDarkModeToggle = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "complete": return { text: isDarkMode ? "text-green-400" : "text-green-600", bg: isDarkMode ? "bg-green-400/20" : "bg-green-100" };
            case "partial": return { text: isDarkMode ? "text-amber-400" : "text-amber-600", bg: isDarkMode ? "bg-amber-400/20" : "bg-amber-100" };
            default: return { text: isDarkMode ? "text-red-400" : "text-red-600", bg: isDarkMode ? "bg-red-400/20" : "bg-red-100" };
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "complete": return <CheckCircle className={`w-4 h-4 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />;
            case "partial": return <AlertCircle className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />;
            default: return <XCircle className={`w-4 h-4 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />;
        }
    };

    // Render form fields (reusable component)
    const renderFormFields = () => (
        <div className="space-y-6">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Company Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Registration Number *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.registrationNumber}
                            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Phone *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Country *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Industry *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Address *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Website
                        </label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Purpose
                        </label>
                        <textarea
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            rows={2}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Scope
                        </label>
                        <textarea
                            value={formData.scope}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                            rows={2}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                </div>
            </div>

            {/* Data Sources */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add data source"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddDataSource(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                const input = e.currentTarget.previousSibling as HTMLInputElement;
                                handleAddDataSource(input.value);
                                input.value = '';
                            }}
                            className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.data_source?.map((source, index) => (
                            <div key={index} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg}`}>
                                <span className="text-sm">{source}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveDataSource(source)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Area of Interest */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Area of Interest</h3>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                                Area Name
                            </label>
                            <input
                                type="text"
                                value={formData.area_of_interest_metadata?.name || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    area_of_interest_metadata: {
                                        ...formData.area_of_interest_metadata!,
                                        name: e.target.value
                                    }
                                })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                                Area Covered
                            </label>
                            <input
                                type="text"
                                value={formData.area_of_interest_metadata?.area_covered || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    area_of_interest_metadata: {
                                        ...formData.area_of_interest_metadata!,
                                        area_covered: e.target.value
                                    }
                                })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Coordinates
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                value={newCoordinate.lat}
                                onChange={(e) => setNewCoordinate({ ...newCoordinate, lat: e.target.value })}
                                className={`flex-1 px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                            <input
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                value={newCoordinate.lon}
                                onChange={(e) => setNewCoordinate({ ...newCoordinate, lon: e.target.value })}
                                className={`flex-1 px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                            <button
                                type="button"
                                onClick={handleAddCoordinate}
                                className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg}`}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.area_of_interest_metadata?.coordinates?.map((coord, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${themeClasses.border} ${themeClasses.bg}`}>
                                    <span className="text-sm">Lat: {coord.lat}, Lon: {coord.lon}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCoordinate(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Processing */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Data Processing</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Data Range
                        </label>
                        <input
                            type="text"
                            value={formData.data_range}
                            onChange={(e) => setFormData({ ...formData, data_range: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Data Processing Workflow
                        </label>
                        <textarea
                            value={formData.data_processing_workflow}
                            onChange={(e) => setFormData({ ...formData, data_processing_workflow: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            Analytical Layer Metadata
                        </label>
                        <textarea
                            value={formData.analytical_layer_metadata}
                            onChange={(e) => setFormData({ ...formData, analytical_layer_metadata: e.target.value })}
                            rows={3}
                            className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                        />
                    </div>
                </div>
            </div>

            {/* ESG Information */}
            <div>
                <h3 className="text-lg font-semibold mb-4">ESG Information</h3>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                                ESG Data Status
                            </label>
                            <select
                                value={formData.esg_data_status}
                                onChange={(e) => setFormData({ ...formData, esg_data_status: e.target.value as any })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            >
                                <option value="not_collected">Not Collected</option>
                                <option value="partial">Partial</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                                Latest ESG Report Year
                            </label>
                            <input
                                type="number"
                                value={formData.latest_esg_report_year}
                                onChange={(e) => setFormData({ ...formData, latest_esg_report_year: parseInt(e.target.value) || new Date().getFullYear() })}
                                className={`w-full px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="esgLinkedPay"
                                checked={formData.has_esg_linked_pay}
                                onChange={(e) => setFormData({ ...formData, has_esg_linked_pay: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="esgLinkedPay" className={`ml-2 text-sm ${themeClasses.textSecondary}`}>
                                Has ESG Linked Pay
                            </label>
                        </div>
                    </div>

                    {/* ESG Reporting Frameworks */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            ESG Reporting Frameworks
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Add framework (e.g., GRI, SASB)"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddFramework(e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                                className={`flex-1 px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    const input = e.currentTarget.previousSibling as HTMLInputElement;
                                    handleAddFramework(input.value);
                                    input.value = '';
                                }}
                                className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.hoverBg}`}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.esg_reporting_framework?.map((framework, index) => (
                                <div key={index} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg}`}>
                                    <span className="text-sm">{framework}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFramework(framework)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ESG Contact Person */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}>
                            ESG Contact Person
                        </label>
                        <div className="grid md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.esg_contact_person?.name || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    esg_contact_person: {
                                        ...formData.esg_contact_person!,
                                        name: e.target.value
                                    }
                                })}
                                className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.esg_contact_person?.email || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    esg_contact_person: {
                                        ...formData.esg_contact_person!,
                                        email: e.target.value
                                    }
                                })}
                                className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.esg_contact_person?.phone || ""}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    esg_contact_person: {
                                        ...formData.esg_contact_person!,
                                        phone: e.target.value
                                    }
                                })}
                                className={`px-4 py-2.5 rounded-lg border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={`flex min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}
            style={{
                '--logo-green': logoGreen,
                '--logo-yellow': logoYellow,
            } as React.CSSProperties}
        >
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isDarkMode={isDarkMode}
                onDarkModeToggle={handleDarkModeToggle}
            />

            {/* Main Content */}
            <main className={`flex-1 lg:ml-0 transition-all duration-300 ${themeClasses.bg}`}>
                {/* Header */}
                <header className={`sticky top-0 z-30 border-b ${themeClasses.border} px-6 py-4 backdrop-blur-sm`}
                    style={{
                        background: isDarkMode
                            ? `${darkBg}/95`
                            : `${lightBg}/95`
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: logoGreen }}>
                                Company Management
                            </h1>
                            <p className={`text-sm ${themeClasses.textSecondary}`}>
                                Manage registered companies and their ESG data
                            </p>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
                        >
                            <div className="w-6 h-6 flex flex-col items-center justify-center gap-1">
                                <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"}`}></div>
                                <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"}`}></div>
                                <div className={`w-4 h-0.5 ${isDarkMode ? "bg-gray-300" : "bg-gray-600"}`}></div>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className={`mb-6 p-4 rounded-xl border ${isDarkMode ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"}`}>
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-6 mb-6 shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col md:flex-row gap-4 flex-1">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                                    <input
                                        type="text"
                                        placeholder="Search companies..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"}`}
                                    />
                                </div>

                                {/* Industry Filter */}
                                <div className="relative">
                                    <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                                    <select
                                        value={industryFilter}
                                        onChange={(e) => setIndustryFilter(e.target.value)}
                                        className={`pl-10 pr-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.bg} focus:outline-none focus:ring-2 focus:ring-offset-1 ${isDarkMode ? "focus:ring-green-500" : "focus:ring-green-600"} appearance-none`}
                                    >
                                        <option value="all">All Industries</option>
                                        {industries.map((industry, index) => (
                                            <option key={index} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Export/Import Buttons */}
                                <button
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm font-medium">Export</span>
                                </button>
                                <button
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">Import</span>
                                </button>

                                {/* Create Company Button */}
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowCreateModal(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:opacity-90"
                                    style={{
                                        background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? '#00CC00' : '#006400'})`,
                                        color: '#FFFFFF',
                                    }}
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Add Company</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {[
                            {
                                title: "Total Companies",
                                value: pagination.total.toString(),
                                icon: Building,
                                color: logoGreen,
                            },
                            {
                                title: "Active Data Collection",
                                value: companies.filter(c => c.esg_data_status === "complete").length.toString(),
                                icon: Activity,
                                color: logoGreen,
                            },
                            {
                                title: "Pending Setup",
                                value: companies.filter(c => c.esg_data_status === "not_collected").length.toString(),
                                icon: Clock,
                                color: logoYellow,
                            },
                            {
                                title: "ESG Linked Pay",
                                value: companies.filter(c => c.has_esg_linked_pay).length.toString(),
                                icon: Target,
                                color: logoGreen,
                            },
                        ].map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} p-6 transition-all duration-300 hover:${themeClasses.borderHover} shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div
                                            className="p-3 rounded-xl"
                                            style={{
                                                background: `linear-gradient(to right, ${stat.color}${isDarkMode ? '30' : '10'}, ${stat.color}${isDarkMode ? '20' : '05'})`,
                                                border: `1px solid ${stat.color}${isDarkMode ? '40' : '20'}`
                                            }}
                                        >
                                            <IconComponent className="w-6 h-6" style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                                        {stat.value}
                                    </h3>
                                    <p className={`text-sm ${themeClasses.textSecondary}`}>
                                        {stat.title}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Companies Table */}
                    <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: logoGreen }}></div>
                                    <p className={themeClasses.textSecondary}>Loading companies...</p>
                                </div>
                            ) : filteredCompanies.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Building className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className={themeClasses.textSecondary}>No companies found</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className={`border-b ${themeClasses.border}`}>
                                            <th className="py-4 px-6 text-left font-semibold">Company</th>
                                            <th className="py-4 px-6 text-left font-semibold">Industry</th>
                                            <th className="py-4 px-6 text-left font-semibold">Country</th>
                                            <th className="py-4 px-6 text-left font-semibold">ESG Status</th>
                                            <th className="py-4 px-6 text-left font-semibold">Last Updated</th>
                                            <th className="py-4 px-6 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCompanies.map((company) => {
                                            const statusColor = getStatusColor(company.esg_data_status || "not_collected");
                                            return (
                                                <tr key={company._id} className={`border-b ${themeClasses.border} ${themeClasses.hoverBg} hover:${themeClasses.borderHover}`}>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center">
                                                            <div
                                                                className="p-2 rounded-lg mr-3"
                                                                style={{
                                                                    background: `linear-gradient(to right, ${logoGreen}${isDarkMode ? '30' : '10'}, ${logoGreen}${isDarkMode ? '20' : '05'})`,
                                                                    border: `1px solid ${logoGreen}${isDarkMode ? '40' : '20'}`
                                                                }}
                                                            >
                                                                <Building className="w-5 h-5" style={{ color: logoGreen }} />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{company.name}</div>
                                                                <div className={`text-sm ${themeClasses.textMuted}`}>
                                                                    {company.registrationNumber}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <GlobeIcon className="w-4 h-4" />
                                                            <span>{company.industry}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{company.country}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${statusColor.bg} ${statusColor.text}`}>
                                                                {getStatusIcon(company.esg_data_status || "not_collected")}
                                                                {company.esg_data_status?.replace("_", " ") || "Not Collected"}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className={`text-sm ${themeClasses.textMuted}`}>
                                                                {company.updated_at ? new Date(company.updated_at).toLocaleDateString() : "N/A"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewCompany(company._id)}
                                                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors`}
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditCompany(company)}
                                                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors`}
                                                                title="Edit Company"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(company)}
                                                                className={`p-2 rounded-lg ${themeClasses.hoverBg} transition-colors hover:text-red-600 dark:hover:text-red-400`}
                                                                title="Delete Company"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className={`border-t ${themeClasses.border} px-6 py-4`}>
                                <div className="flex items-center justify-between">
                                    <div className={`text-sm ${themeClasses.textMuted}`}>
                                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className={`p-2 rounded-lg ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.hoverBg}`}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg font-medium ${pagination.page === pageNum
                                                        ? ''
                                                        : themeClasses.hoverBg
                                                        }`}
                                                    style={{
                                                        background: pagination.page === pageNum
                                                            ? `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? '#00CC00' : '#006400'})`
                                                            : undefined,
                                                        color: pagination.page === pageNum ? '#FFFFFF' : undefined,
                                                    }}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className={`p-2 rounded-lg ${pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.hoverBg}`}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create Company Modal */}
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
                            <div className="p-6">
                                <form onSubmit={(e) => { e.preventDefault(); handleCreateCompany(); }}>
                                    {renderFormFields()}

                                    {/* Submit Buttons */}
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

            {/* Edit Company Modal */}
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
                            <div className="p-6 bg-white">
                                <form onSubmit={(e) => { e.preventDefault(); handleUpdateCompany(); }}>
                                    {renderFormFields()}

                                    {/* Submit Buttons */}
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

            {/* View Company Modal */}
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
                            <div className="p-6 bg-white">
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
        </div>
    );
};

export default CompanyManagementScreen;