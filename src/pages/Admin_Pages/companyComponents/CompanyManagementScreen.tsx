import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building,
    Edit,
    Trash2,
    Eye,
    Plus,
    CheckCircle,
    AlertCircle,
    XCircle,
    Activity,
    Clock,
    Target,
    X,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import {
    getCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany,
    type Company,
    type CreateCompanyPayload,
} from "../../../services/Admin_Service/companies_service";
import CompanyTable from "./CompanyTable";
import CompanyModals from "./CompanyModals";

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
            const coord = {
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

    // Placeholder functions for member management (to be implemented later)
    const handleAddMember = () => {
        console.log("Add Member - coming soon");
        alert("Add Member functionality coming soon!");
    };

    const handleViewMembers = () => {
        console.log("View Members - coming soon");
        alert("View Members functionality coming soon!");
    };

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

                    {/* Company Table with integrated action bar */}
                    <CompanyTable
                        companies={filteredCompanies}
                        loading={loading}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        industryFilter={industryFilter}
                        setIndustryFilter={setIndustryFilter}
                        industries={industries}
                        pagination={pagination}
                        goToPage={goToPage}
                        handleViewCompany={handleViewCompany}
                        handleEditCompany={handleEditCompany}
                        handleDeleteClick={handleDeleteClick}
                        handleAddMember={handleAddMember}
                        handleViewMembers={handleViewMembers}
                        isDarkMode={isDarkMode}
                        themeClasses={themeClasses}
                        logoGreen={logoGreen}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />

                    {/* Floating Add Button (visible on mobile) */}
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="lg:hidden fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-40"
                        style={{
                            background: `linear-gradient(to right, ${logoGreen}, ${isDarkMode ? '#00CC00' : '#006400'})`,
                            color: '#FFFFFF',
                        }}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </main>

            {/* Modals */}
            <CompanyModals
                showCreateModal={showCreateModal}
                setShowCreateModal={setShowCreateModal}
                showEditModal={showEditModal}
                setShowEditModal={setShowEditModal}
                showViewModal={showViewModal}
                setShowViewModal={setShowViewModal}
                showDeleteModal={showDeleteModal}
                setShowDeleteModal={setShowDeleteModal}
                selectedCompany={selectedCompany}
                formData={formData}
                setFormData={setFormData}
                newCoordinate={newCoordinate}
                setNewCoordinate={setNewCoordinate}
                handleAddCoordinate={handleAddCoordinate}
                handleRemoveCoordinate={handleRemoveCoordinate}
                handleAddDataSource={handleAddDataSource}
                handleRemoveDataSource={handleRemoveDataSource}
                handleAddFramework={handleAddFramework}
                handleRemoveFramework={handleRemoveFramework}
                handleCreateCompany={handleCreateCompany}
                handleUpdateCompany={handleUpdateCompany}
                handleDeleteCompany={handleDeleteCompany}
                handleEditCompany={handleEditCompany}
                handleDeleteClick={handleDeleteClick}
                handleApiNavigation={handleApiNavigation}
                isDarkMode={isDarkMode}
                themeClasses={themeClasses}
                logoGreen={logoGreen}
                getStatusIcon={getStatusIcon}
            />
        </div>
    );
};

export default CompanyManagementScreen;