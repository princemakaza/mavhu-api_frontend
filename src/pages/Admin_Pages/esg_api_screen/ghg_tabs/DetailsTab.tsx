import React, { useState } from "react";
import {
    Factory,
    Zap,
    Wind,
    Target as TargetIcon,
    Scale,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Database,
    Shield,
    FileText,
    ClipboardCheck,
    Download,
    Eye,
    Info,
    Lightbulb,
    Activity,
    Gauge,
    X,
    ArrowRight,
    Leaf,
    Zap as ZapIcon,
    Table,
    Layers,
    FileSpreadsheet,
    Calculator,
    Map,
    Globe,
    Building,
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
} from "recharts";

// Import service functions
import {
    getScopeBreakdown,
    getCarbonEmissionAccounting,
    getEmissionFactors,
    getSequestrationSummary,
    getEmissionsSummary,
    getCarbonIntensityMetrics,
    getYearlyDataSummary,
    getMonthlySequestrationData,
    getSequestrationMethodologies,
    getAllEnvironmentalMetrics,
    getCompanyInfo,
    getReportingYear,
} from "../../../../services/Admin_Service/esg_apis/ghg_emmision";
import type { DetailedSource } from "../../../../services/Admin_Service/esg_apis/ghg_emmision";

// Green, Black, and White Color Palette
const COLORS = {
    primary: '#22c55e',
    primaryDark: '#16a34a',
    primaryLight: '#86efac',
    secondary: '#10b981',
    accent: '#84cc16',
    // Different shades of green for scopes
    scope1: '#059669',  // Emerald green
    scope2: '#0d9488',  // Teal green
    scope3: '#0f766e',  // Darker teal green
    success: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#3b82f6',    // Keeping blue for info (standard)
};

interface ThemeClasses {
    bg: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    navBg: string;
    cardBg: string;
    cardBgAlt: string;
    border: string;
    borderHover: string;
    hoverBg: string;
    modalBg: string;
    chartGrid: string;
    chartText: string;
}

interface ChartColors {
    primary: string;
    secondary: string;
    background: string[];
    border: string[];
}

interface DetailsTabProps {
    ghgData: any;
    themeClasses: ThemeClasses;
    chartColors: ChartColors;
    logoGreen: string;
    isDarkMode: boolean;
}

const DetailsTab: React.FC<DetailsTabProps> = ({
    ghgData,
    themeClasses,
    chartColors,
    logoGreen,
    isDarkMode,
}) => {
    const [activeSubTab, setActiveSubTab] = useState("emissions");
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [selectedScope, setSelectedScope] = useState<'scope1' | 'scope2' | 'scope3'>('scope1');

    // Get data using service functions
    const scopeBreakdown = ghgData ? getScopeBreakdown(ghgData) : null;
    const carbonAccounting = ghgData ? getCarbonEmissionAccounting(ghgData) : null;
    const sequestrationSummary = ghgData ? getSequestrationSummary(ghgData) : null;
    const emissionsSummary = ghgData ? getEmissionsSummary(ghgData) : null;
    const intensityMetrics = ghgData ? getCarbonIntensityMetrics(ghgData) : null;
    const yearlySummary = ghgData ? getYearlyDataSummary(ghgData) : null;
    const monthlySequestrationData = ghgData ? getMonthlySequestrationData(ghgData) : [];
    const sequestrationMethodologies = ghgData ? getSequestrationMethodologies(ghgData) : [];
    const environmentalMetrics = ghgData ? getAllEnvironmentalMetrics(ghgData) : {};
    const companyInfo = ghgData ? getCompanyInfo(ghgData) : null;
    const reportingYear = ghgData ? getReportingYear(ghgData) : null;
    const emissionFactors = ghgData ? getEmissionFactors(ghgData) : [];

    // Get scope sources from breakdown
    const scope1Sources = scopeBreakdown?.scope1?.sources || [];
    const scope2Sources = scopeBreakdown?.scope2?.sources || [];
    const scope3Categories = scopeBreakdown?.scope3?.categories || [];

    // Format number with commas
    const formatNumber = (num: number) => {
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    // Get display value or placeholder
    const getDisplayValue = (value: any): string => {
        if (value === undefined || value === null || value === '') return '_____________';
        if (typeof value === 'number') return formatNumber(value);
        return String(value);
    };

    // Prepare comprehensive emissions data with null safety
    const prepareEmissionsData = () => {
        if (!scopeBreakdown) return null;

        const scope1Total = scopeBreakdown.scope1?.total || 0;
        const scope2Total = scopeBreakdown.scope2?.total || 0;
        const scope3Total = scopeBreakdown.scope3?.total || 0;
        const totalEmissions = scope1Total + scope2Total + scope3Total;

        const scope1Percentage = totalEmissions > 0 ? (scope1Total / totalEmissions) * 100 : 0;
        const scope2Percentage = totalEmissions > 0 ? (scope2Total / totalEmissions) * 100 : 0;
        const scope3Percentage = totalEmissions > 0 ? (scope3Total / totalEmissions) * 100 : 0;

        const scopeData = [
            {
                name: 'Scope 1',
                value: scope1Total,
                color: COLORS.scope1,
                percentage: scope1Percentage
            },
            {
                name: 'Scope 2',
                value: scope2Total,
                color: COLORS.scope2,
                percentage: scope2Percentage
            },
            {
                name: 'Scope 3',
                value: scope3Total,
                color: COLORS.scope3,
                percentage: scope3Percentage
            },
        ];

        return {
            scopeData,
            totalEmissions,
            scope1Total,
            scope2Total,
            scope3Total,
            scope1Percentage,
            scope2Percentage,
            scope3Percentage,
        };
    };

    const emissionsData = prepareEmissionsData();

    // Sub-tabs configuration
    const subTabs = [
        { id: "emissions", label: "Emissions Overview", icon: <Activity className="w-4 h-4" />, color: COLORS.primary },
        { id: "sequestration", label: "Sequestration", icon: <Leaf className="w-4 h-4" />, color: COLORS.primary },
        { id: "environmental", label: "Environmental Metrics", icon: <Scale className="w-4 h-4" />, color: COLORS.primary },
        { id: "methodology", label: "Methodology", icon: <Database className="w-4 h-4" />, color: COLORS.primary },
        { id: "compliance", label: "Compliance", icon: <Shield className="w-4 h-4" />, color: COLORS.primary },
    ];

    if (!scopeBreakdown || !carbonAccounting) {
        return (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-12">
                <div className="text-center">
                    <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 text-lg">No detailed emissions data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">

            {/* Sub-tabs Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg">
                <div className="flex space-x-2 overflow-x-auto">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeSubTab === tab.id
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emissions Overview Tab */}
            {activeSubTab === "emissions" && emissionsData && (
                <div className="space-y-8">
                    {/* Scope Breakdown Section */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Emissions by Scope</h3>
                                <p className="text-gray-600">Understanding your carbon footprint across all three scopes</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedScope('scope1')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope1'
                                        ? 'bg-emerald-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 1
                                </button>
                                <button
                                    onClick={() => setSelectedScope('scope2')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope2'
                                        ? 'bg-teal-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 2
                                </button>
                                <button
                                    onClick={() => setSelectedScope('scope3')}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedScope === 'scope3'
                                        ? 'bg-green-700 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Scope 3
                                </button>
                            </div>
                        </div>

                        {/* Scope Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Scope Information */}
                            <div className={`p-6 rounded-2xl border-2 ${selectedScope === 'scope1' ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50' :
                                selectedScope === 'scope2' ? 'border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50' :
                                    'border-green-600 bg-gradient-to-br from-green-50 to-emerald-50'
                                }`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`p-4 rounded-xl ${selectedScope === 'scope1' ? 'bg-emerald-100' :
                                        selectedScope === 'scope2' ? 'bg-teal-100' :
                                            'bg-green-100'
                                        }`}>
                                        {selectedScope === 'scope1' ? <Factory className="w-8 h-8 text-emerald-600" /> :
                                            selectedScope === 'scope2' ? <Zap className="w-8 h-8 text-teal-600" /> :
                                                <Wind className="w-8 h-8 text-green-700" />}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">
                                            {selectedScope === 'scope1' ? 'Scope 1: Direct Emissions' :
                                                selectedScope === 'scope2' ? 'Scope 2: Energy Emissions' :
                                                    'Scope 3: Value Chain Emissions'}
                                        </h4>
                                        <p className="text-gray-600 mt-1">
                                            {selectedScope === 'scope1' ? 'Direct emissions from owned or controlled sources' :
                                                selectedScope === 'scope2' ? 'Indirect emissions from purchased energy' :
                                                    'Other indirect emissions from value chain activities'}
                                        </p>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className={`text-3xl font-bold mb-1 ${selectedScope === 'scope1' ? 'text-emerald-600' :
                                            selectedScope === 'scope2' ? 'text-teal-600' :
                                                'text-green-700'
                                            }`}>
                                            {selectedScope === 'scope1' ? formatNumber(emissionsData.scope1Total) :
                                                selectedScope === 'scope2' ? formatNumber(emissionsData.scope2Total) :
                                                    formatNumber(emissionsData.scope3Total)}
                                        </div>
                                        <p className="text-xs text-gray-600">Total tCO₂e</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className={`text-3xl font-bold mb-1 ${selectedScope === 'scope1' ? 'text-emerald-600' :
                                            selectedScope === 'scope2' ? 'text-teal-600' :
                                                'text-green-700'
                                            }`}>
                                            {selectedScope === 'scope1' ? emissionsData.scope1Percentage.toFixed(1) + '%' :
                                                selectedScope === 'scope2' ? emissionsData.scope2Percentage.toFixed(1) + '%' :
                                                    emissionsData.scope3Percentage.toFixed(1) + '%'}
                                        </div>
                                        <p className="text-xs text-gray-600">of Total</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Gauge className={`w-4 h-4 ${selectedScope === 'scope1' ? 'text-emerald-600' :
                                                selectedScope === 'scope2' ? 'text-teal-600' :
                                                    'text-green-700'
                                                }`} />
                                            <span className="text-lg font-bold text-gray-900">Intensity</span>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {selectedScope === 'scope1' ? (intensityMetrics?.scope1_intensity || 0).toFixed(2) + ' tCO₂e/ha' :
                                                selectedScope === 'scope2' ? (intensityMetrics?.scope2_intensity || 0).toFixed(2) + ' tCO₂e/ha' :
                                                    (intensityMetrics?.scope3_intensity || 0).toFixed(2) + ' tCO₂e/ha'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h4 className="font-bold text-gray-900 mb-4">Emissions Distribution</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={emissionsData.scopeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) => `${name}: ${(percentage || 0).toFixed(1)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {emissionsData.scopeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatNumber(value) + ' tCO₂e'}
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Scope Tables */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Table className="w-5 h-5" />
                                    {selectedScope === 'scope1' ? 'Scope 1: Direct Emission Sources' :
                                        selectedScope === 'scope2' ? 'Scope 2: Energy Sources' :
                                            'Scope 3: Value Chain Categories'}
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source/Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Parameter</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Activity per ha</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Emission Factor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total tCO₂e</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">tCO₂e per ha/year</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {(selectedScope === 'scope1' ? scope1Sources :
                                                selectedScope === 'scope2' ? scope2Sources :
                                                    scope3Categories).map((source: DetailedSource, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {getDisplayValue(source?.source)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {getDisplayValue(source?.parameter)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {source?.annual_per_ha || source?.annual_activity_per_ha ? `${(source.annual_per_ha || source.annual_activity_per_ha).toFixed(2)} ${source?.unit || 'units'}` : '_____________'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {getDisplayValue(source?.ef_number)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {formatNumber(source?.total_tco2e || 0)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {formatNumber(source?.tco2e_per_ha_per_year || 0)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            {((selectedScope === 'scope1' && scope1Sources.length === 0) ||
                                                (selectedScope === 'scope2' && scope2Sources.length === 0) ||
                                                (selectedScope === 'scope3' && scope3Categories.length === 0)) && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                            No data available for this scope
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Yearly Summary */}
                    {yearlySummary && (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Year {yearlySummary.year} Carbon Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                                    <div className="text-3xl font-bold text-emerald-600 mb-2">{formatNumber(yearlySummary.emissions?.total || 0)}</div>
                                    <p className="text-gray-700 font-medium">Total Emissions (tCO₂e)</p>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <div className="flex justify-between mb-1">
                                            <span>Scope 1</span>
                                            <span>{formatNumber(yearlySummary.emissions?.scope1 || 0)}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span>Scope 2</span>
                                            <span>{formatNumber(yearlySummary.emissions?.scope2 || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Scope 3</span>
                                            <span>{formatNumber(yearlySummary.emissions?.scope3 || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                                    <div className="text-3xl font-bold text-green-600 mb-2">{formatNumber(yearlySummary.emissions?.net || 0)}</div>
                                    <p className="text-gray-700 font-medium">Net Emissions (tCO₂e)</p>
                                    <div className="mt-4">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${(yearlySummary.emissions?.net || 0) >= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {(yearlySummary.emissions?.net || 0) >= 0 ? 'Net Emitter' : 'Carbon Negative'}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6">
                                    <div className="text-3xl font-bold text-teal-600 mb-2">{formatNumber(yearlySummary.sequestration?.total || 0)}</div>
                                    <p className="text-gray-700 font-medium">Total Sequestration (tCO₂)</p>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <div className="flex justify-between mb-1">
                                            <span>Biomass</span>
                                            <span>{formatNumber(yearlySummary.sequestration?.biomass || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Soil Organic Carbon</span>
                                            <span>{formatNumber(yearlySummary.sequestration?.soc || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl border-2 border-lime-200 p-6">
                                    <div className="text-3xl font-bold text-lime-600 mb-2">{formatNumber(yearlySummary.area || 0)}</div>
                                    <p className="text-gray-700 font-medium">Area (ha)</p>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <div className="flex justify-between mb-1">
                                            <span>Scope 1 Intensity</span>
                                            <span>{(intensityMetrics?.scope1_intensity || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span>Scope 2 Intensity</span>
                                            <span>{(intensityMetrics?.scope2_intensity || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total Intensity</span>
                                            <span>{(intensityMetrics?.total_intensity || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sequestration Tab */}
            {activeSubTab === "sequestration" && sequestrationSummary && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Carbon Sequestration</h3>
                                <p className="text-gray-600">Carbon removal through biomass and soil organic carbon</p>
                            </div>
                            <Leaf className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Sequestration Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                                <div className="text-4xl font-bold text-green-600 mb-2">{formatNumber(sequestrationSummary.total || 0)}</div>
                                <p className="text-gray-700 font-medium">Total Sequestration (tCO₂)</p>
                            </div>
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6">
                                <div className="text-4xl font-bold text-teal-600 mb-2">{formatNumber(sequestrationSummary.biomass || 0)}</div>
                                <p className="text-gray-700 font-medium">Biomass Sequestration (tCO₂)</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                                <div className="text-4xl font-bold text-emerald-600 mb-2">{formatNumber(sequestrationSummary.soc || 0)}</div>
                                <p className="text-gray-700 font-medium">Soil Organic Carbon (tCO₂)</p>
                            </div>
                        </div>

                        {/* Sequestration Methodologies */}
                        {sequestrationMethodologies.length > 0 && (
                            <div className="mb-8">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <Calculator className="w-5 h-5" />
                                    Sequestration Methodologies
                                </h4>
                                <div className="space-y-4">
                                    {sequestrationMethodologies.map((methodology: any, index: number) => (
                                        <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                                    <FileText className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-gray-900 mb-2">{methodology.component || `Methodology ${index + 1}`}</h5>
                                                    <p className="text-gray-700 mb-2">{methodology.method_applied || '_____________'}</p>
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Standard Source: </span>
                                                        {methodology.standard_source || '_____________'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly Sequestration Data Table */}
                        {monthlySequestrationData.length > 0 && (
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Monthly Sequestration Data
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Biomass CO₂ (t)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">SOC CO₂ (t)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Net CO₂ Stock (t)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Δ Biomass CO₂ (t)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Δ SOC CO₂ (t)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">NDVI Max</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {monthlySequestrationData.map((month: any, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {month.month || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatNumber(month.biomass_co2_total_t || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatNumber(month.soc_co2_total_t || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatNumber(month.net_co2_stock_t || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatNumber(month.delta_biomass_co2_t || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {formatNumber(month.delta_soc_co2_t || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {(month.ndvi_max || 0).toFixed(3)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Environmental Metrics Tab */}
            {activeSubTab === "environmental" && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Environmental Metrics</h3>
                            <p className="text-gray-600">Comprehensive environmental performance indicators</p>
                        </div>
                        <Scale className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Metric Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.entries(environmentalMetrics).map(([key, metric]: [string, any]) => {
                                    const latestValue = metric.values?.[metric.values.length - 1] || {};
                                    return (
                                        <tr key={key} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {metric.name || key}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {metric.category || '_____________'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {latestValue.numeric_value !== undefined ? formatNumber(latestValue.numeric_value) : getDisplayValue(latestValue.value)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {metric.unit || '_____________'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {latestValue.year || reportingYear || '_____________'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {metric.description || '_____________'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {latestValue.source_notes || '_____________'}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {Object.keys(environmentalMetrics).length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No environmental metrics data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Methodology Tab */}
            {activeSubTab === "methodology" && carbonAccounting && (
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">Calculation Methodology</h3>
                                <p className="text-gray-600">Understanding how emissions are measured and calculated</p>
                            </div>
                            <Database className="w-8 h-8 text-green-600" />
                        </div>

                        {/* Carbon Accounting Framework */}
                        <div className="mb-8">
                            <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                <Calculator className="w-6 h-6 text-green-600" />
                                Carbon Accounting Framework
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                                    <h5 className="font-bold text-lg text-gray-900 mb-3">Sequestration Methodology</h5>
                                    <p className="text-gray-700">
                                        {carbonAccounting?.framework?.sequestration_methodology || '_____________'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                                    <h5 className="font-bold text-lg text-gray-900 mb-3">Emission Methodology</h5>
                                    <p className="text-gray-700">
                                        {carbonAccounting?.framework?.emission_methodology || '_____________'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6">
                                    <h5 className="font-bold text-lg text-gray-900 mb-3">Calculation Approach</h5>
                                    <p className="text-gray-700">
                                        {carbonAccounting?.framework?.calculation_approach || '_____________'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-2xl border-2 border-lime-200 p-6">
                                    <h5 className="font-bold text-lg text-gray-900 mb-3">Overall Methodology</h5>
                                    <p className="text-gray-700">
                                        {carbonAccounting?.methodology || '_____________'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company Information */}
                        {companyInfo && (
                            <div className="mb-8">
                                <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                    <Building className="w-6 h-6 text-green-600" />
                                    Company Information
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 p-6">
                                        <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                            <Layers className="w-5 h-5" />
                                            Analytical Layer Metadata
                                        </h5>
                                        <p className="text-gray-700">
                                            {companyInfo.analytical_layer_metadata || '_____________'}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6">
                                        <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                            <Globe className="w-5 h-5" />
                                            Data Sources
                                        </h5>
                                        <div className="space-y-2">
                                            {companyInfo.data_source && companyInfo.data_source.length > 0 ? (
                                                companyInfo.data_source.map((source: string, index: number) => (
                                                    <div key={index} className="bg-white rounded-lg px-3 py-2 border border-teal-200">
                                                        <span className="text-sm text-gray-700">{source}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-700">_____________</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                                        <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            ESG Reporting Frameworks
                                        </h5>
                                        <div className="space-y-2">
                                            {companyInfo.esg_reporting_framework && companyInfo.esg_reporting_framework.length > 0 ? (
                                                companyInfo.esg_reporting_framework.map((framework: string, index: number) => (
                                                    <div key={index} className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                                                        <span className="text-sm text-gray-700">{framework}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-700">_____________</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Emission Factors */}
                        {emissionFactors.length > 0 && (
                            <div>
                                <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-green-600" />
                                    Emission Factors
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Source</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Activity Data</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Emission Factor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">GWP Value</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {emissionFactors.slice(0, 10).map((factor: any, index: number) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {factor.source || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {factor.activity_data || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {factor.emission_factor_value || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {factor.emission_factor_unit || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {factor.gwp_value || '_____________'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                        {factor.notes_source || '_____________'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Compliance Tab */}
            {activeSubTab === "compliance" && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">Compliance & Reporting</h3>
                            <p className="text-gray-600">Stay aligned with regulatory requirements</p>
                        </div>
                        <Shield className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="space-y-6">
                        {/* Compliance Status */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                <ClipboardCheck className="w-6 h-6 text-green-600" />
                                Compliance Status
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">Reporting Year</div>
                                    <div className="text-3xl font-bold text-green-600">{reportingYear || '_____________'}</div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">Data Quality Score</div>
                                    <div className="text-3xl font-bold text-green-600">
                                        {carbonAccounting?.yearly_data?.[0]?.data_quality?.completeness_score || 0}%
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-green-200">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">Verification Status</div>
                                    <div className={`text-lg font-bold ${carbonAccounting?.yearly_data?.[0]?.data_quality?.verification_status === 'verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        { '________________'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Recommendations */}
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6">
                            <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-teal-600" />
                                Compliance Recommendations
                            </h4>
                            <div className="space-y-4">
                                <div className="bg-white rounded-xl p-5 border border-teal-200">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-teal-100 flex-shrink-0">
                                            <CheckCircle className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-gray-900 mb-2">Annual GHG Reporting</h5>
                                            <p className="text-gray-700 leading-relaxed">
                                                Ensure timely submission of annual greenhouse gas emissions reports to regulatory bodies as per the reporting frameworks: {companyInfo?.esg_reporting_framework?.join(', ') || 'GHG Protocol'}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-5 border border-teal-200">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-teal-100 flex-shrink-0">
                                            <CheckCircle className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-gray-900 mb-2">Methodology Documentation</h5>
                                            <p className="text-gray-700 leading-relaxed">
                                                Maintain detailed documentation of the calculation methodology: {carbonAccounting?.framework?.calculation_approach || 'Standard approach'} as per {carbonAccounting?.framework?.emission_methodology || 'GHG Protocol'}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights Modal */}
            {showInsightsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowInsightsModal(false)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-3xl sticky top-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-white/20">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">Key Insights</h3>
                                        <p className="text-green-100">Important findings from your emissions data</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowInsightsModal(false)}
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Largest Emission Source */}
                            <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-emerald-100 flex-shrink-0">
                                        <TrendingDown className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-emerald-900 mb-2">Largest Emission Source</h4>
                                        <p className="text-emerald-700 leading-relaxed">
                                            Scope {
                                                emissionsData?.scope1Percentage > emissionsData?.scope2Percentage &&
                                                    emissionsData?.scope1Percentage > emissionsData?.scope3Percentage
                                                    ? '1'
                                                    : emissionsData?.scope2Percentage > emissionsData?.scope3Percentage
                                                        ? '2'
                                                        : '3'
                                            } represents the largest portion of your emissions, accounting for{' '}
                                            {Math.max(
                                                emissionsData?.scope1Percentage || 0,
                                                emissionsData?.scope2Percentage || 0,
                                                emissionsData?.scope3Percentage || 0
                                            ).toFixed(1)}% of total emissions.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Net Carbon Balance */}
                            <div className="p-6 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-green-100 flex-shrink-0">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-green-900 mb-2">Net Carbon Balance</h4>
                                        <p className="text-green-700 leading-relaxed">
                                            {emissionsSummary && (emissionsSummary.net || 0) < 0
                                                ? `You have achieved a net negative carbon balance of ${formatNumber(Math.abs(emissionsSummary.net || 0))} tCO₂e.`
                                                : `Your net carbon balance is ${formatNumber(emissionsSummary?.net || 0)} tCO₂e. Consider increasing sequestration efforts.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sequestration Capacity */}
                            <div className="p-6 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-teal-100 flex-shrink-0">
                                        <TargetIcon className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-teal-900 mb-2">Sequestration Analysis</h4>
                                        <p className="text-teal-700 leading-relaxed">
                                            {sequestrationSummary && sequestrationSummary.total > 0
                                                ? `Your operations sequester ${formatNumber(sequestrationSummary.total)} tCO₂, with ${formatNumber(sequestrationSummary.biomass || 0)} tCO₂ from biomass and ${formatNumber(sequestrationSummary.soc || 0)} tCO₂ from soil organic carbon.`
                                                : 'Consider implementing sequestration measures to offset emissions.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsTab;