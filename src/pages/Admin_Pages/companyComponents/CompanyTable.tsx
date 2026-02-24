import React from 'react';
import {
    Building,
    Edit,
    Trash2,
    Eye,
    Search,
    Filter,
    Download,
    Upload,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    Globe as GlobeIcon,
    MapPin,
    Calendar,
    Users,
    UserPlus,
} from "lucide-react";
import type { Company } from "../../../services/Admin_Service/companies_service";

interface CompanyTableProps {
    companies: Company[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    industryFilter: string;
    setIndustryFilter: (filter: string) => void;
    industries: string[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    goToPage: (page: number) => void;
    handleViewCompany: (id: string) => void;
    handleEditCompany: (company: Company) => void;
    handleDeleteClick: (company: Company) => void;
    handleAddMember: () => void;       // placeholder
    handleViewMembers: () => void;     // placeholder
    isDarkMode: boolean;
    themeClasses: any;
    logoGreen: string;
    getStatusColor: (status: string) => { text: string; bg: string };
    getStatusIcon: (status: string) => JSX.Element;
}

const CompanyTable: React.FC<CompanyTableProps> = ({
    companies,
    loading,
    searchTerm,
    setSearchTerm,
    industryFilter,
    setIndustryFilter,
    industries,
    pagination,
    goToPage,
    handleViewCompany,
    handleEditCompany,
    handleDeleteClick,
    handleAddMember,
    handleViewMembers,
    isDarkMode,
    themeClasses,
    logoGreen,
    getStatusColor,
    getStatusIcon,
}) => {
    return (
        <>
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

                        {/* Member Management Buttons (Placeholders) */}
                        <button
                            onClick={handleAddMember}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                            title="Add Member (coming soon)"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Member</span>
                        </button>
                        <button
                            onClick={handleViewMembers}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${themeClasses.border} ${themeClasses.hoverBg} transition-colors`}
                            title="View Members (coming soon)"
                        >
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">View Members</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={`${themeClasses.cardBg} backdrop-blur-xl rounded-2xl border ${themeClasses.border} shadow-lg ${isDarkMode ? "shadow-black/20" : "shadow-gray-200/50"}`}>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: logoGreen }}></div>
                            <p className={themeClasses.textSecondary}>Loading companies...</p>
                        </div>
                    ) : companies.length === 0 ? (
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
                                {companies.map((company) => {
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
        </>
    );
};

export default CompanyTable;