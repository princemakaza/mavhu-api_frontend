import React from 'react';
import {
    X,
    Plus,
    Building,
    MapPin,
    Globe as GlobeIcon,
    Calendar,
    CheckCircle,
    AlertCircle,
    XCircle,
    Target,
    Activity,
    Clock,
    Mail,
    Phone,
    FileText,
    Link,
    Map as MapIcon,
    BarChart3
} from "lucide-react";
import type { CreateCompanyPayload, Coordinate } from "../../../services/Admin_Service/companies_service";

interface CompanyFormProps {
    formData: CreateCompanyPayload;
    setFormData: React.Dispatch<React.SetStateAction<CreateCompanyPayload>>;
    isDarkMode: boolean;
    themeClasses: any;
    logoGreen: string;
    newCoordinate: { lat: string; lon: string };
    setNewCoordinate: React.Dispatch<React.SetStateAction<{ lat: string; lon: string }>>;
    handleAddCoordinate: () => void;
    handleRemoveCoordinate: (index: number) => void;
    handleAddDataSource: (source: string) => void;
    handleRemoveDataSource: (source: string) => void;
    handleAddFramework: (framework: string) => void;
    handleRemoveFramework: (framework: string) => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
    formData,
    setFormData,
    isDarkMode,
    themeClasses,
    logoGreen,
    newCoordinate,
    setNewCoordinate,
    handleAddCoordinate,
    handleRemoveCoordinate,
    handleAddDataSource,
    handleRemoveDataSource,
    handleAddFramework,
    handleRemoveFramework,
}) => {
    return (
        <div className="space-y-6 bg-white">            {/* Basic Information */}
            <div className="space-y-6 bg-white">                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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
};

export default CompanyForm;