import React, { useState } from 'react';
import { 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    Download,
    Eye,
    Calendar,
    Users,
    Shield,
    Globe,
    TrendingUp
} from 'lucide-react';
import { 
    BiodiversityLandUseResponse 
} from '../../../../services/Admin_Service/esg_apis/biodiversity_api_service';
// Color Palette
const LOGO_GREEN = '#008000';
const LOGO_YELLOW = '#B8860B';

interface ReportsTabProps {
    biodiversityData: BiodiversityLandUseResponse | null;
    formatNumber: (num: number) => string;
    formatPercent: (num: number) => string;
    selectedYear: number | null;
    onMetricClick: (metric: any, modalType: string) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({
    biodiversityData,
    formatNumber,
    formatPercent,
    selectedYear,
    onMetricClick
}) => {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    if (!biodiversityData) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Available</h3>
                <p className="text-gray-500">Select a company to view compliance reports</p>
            </div>
        );
    }

    const { 
        standards_compliance,
        hve_compliance,
        recommendations,
        summary
    } = biodiversityData.data;

    // Compliance status color
    const getComplianceColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'compliant':
            case 'high':
            case 'verified':
                return 'text-green-600';
            case 'partial':
            case 'medium':
                return 'text-yellow-600';
            case 'non-compliant':
            case 'low':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    // Priority color
    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Reports Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: LOGO_GREEN }}>
                        Compliance & Reports
                    </h2>
                    <p className="text-gray-600">Standards compliance, recommendations, and detailed reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Calendar className="w-4 h-4" />
                        Generate Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors font-medium"
                        style={{
                            background: `linear-gradient(to right, ${LOGO_GREEN}, #006400)`,
                        }}>
                        <Download className="w-4 h-4" />
                        Export All Reports
                    </button>
                </div>
            </div>

            {/* Standards Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* HVE Compliance */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(hve_compliance, 'HVE Compliance Details')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                            <CheckCircle className="w-6 h-6" style={{ color: LOGO_GREEN }} />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getComplianceColor(hve_compliance.compliance_status)} bg-opacity-10`}>
                            {hve_compliance.compliance_status}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">HVE Compliance</h3>
                    <p className="text-gray-600 mb-4">High Conservation Value Ecosystems</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Deforestation Status:</span>
                            <span className="font-semibold">{hve_compliance.deforestation_status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Assessment:</span>
                            <span className="font-semibold">{hve_compliance.last_assessment_date}</span>
                        </div>
                    </div>
                </div>

                {/* SASB Compliance */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(standards_compliance.sasb, 'SASB Compliance')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                            <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getComplianceColor(standards_compliance.sasb.compliance_level)} bg-opacity-10`}>
                            {standards_compliance.sasb.compliance_level}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">SASB Standards</h3>
                    <p className="text-gray-600 mb-4">Sustainability Accounting Standards</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Applicable:</span>
                            <span className="font-semibold">{standards_compliance.sasb.applicable ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Metrics Coverage:</span>
                            <span className="font-semibold">{standards_compliance.sasb.metrics_coverage.length} metrics</span>
                        </div>
                    </div>
                </div>

                {/* UN SDG Alignment */}
                <div 
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onMetricClick(standards_compliance.unsdg, 'UN SDG Alignment')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                            <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getComplianceColor(standards_compliance.unsdg.overall_alignment)} bg-opacity-10`}>
                            {standards_compliance.unsdg.overall_alignment}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">UN SDG Alignment</h3>
                    <p className="text-gray-600 mb-4">Sustainable Development Goals</p>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Goals Aligned:</span>
                            <span className="font-semibold">{standards_compliance.unsdg.goals.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Contribution Areas:</span>
                            <span className="font-semibold">{standards_compliance.unsdg.contribution_areas.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Recommendations & Action Items</h3>
                        <p className="text-gray-600">Prioritized improvement opportunities</p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-gray-500" />
                </div>
                <div className="space-y-4">
                    {recommendations.slice(0, 5).map((rec, index) => (
                        <div 
                            key={index}
                            className="p-4 border border-gray-200 rounded-xl hover:border-green-500 transition-colors cursor-pointer"
                            onClick={() => onMetricClick(rec, 'Recommendation Details')}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(rec.priority)} bg-opacity-10`}>
                                            {rec.priority} Priority
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                            {rec.category}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-1">{rec.recommendation}</h4>
                                    <p className="text-gray-600 text-sm mb-3">{rec.impact}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-sm text-gray-600">Timeframe</p>
                                    <p className="font-semibold">{rec.timeframe}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-600">Cost Estimate: <span className="font-semibold">{rec.cost_estimate}</span></span>
                                    <span className="text-gray-600">Compliance Benefit: <span className="font-semibold">{rec.compliance_benefit}</span></span>
                                </div>
                                <button className="flex items-center gap-1 text-green-600 hover:text-green-700">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Overall Assessment */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Overall Assessment</h3>
                        <TrendingUp className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Key Strengths</h4>
                            <ul className="space-y-2">
                                {summary.key_strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-700 mb-2">Critical Areas</h4>
                            <ul className="space-y-2">
                                {summary.critical_areas.map((area, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{area}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Next Steps & Outlook */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Next Steps & Outlook</h3>
                        <Calendar className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Immediate Actions</h4>
                            <ul className="space-y-2">
                                {summary.next_steps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                        <span className="text-gray-600">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-gray-700 mb-2">Outlook</h4>
                            <p className="text-gray-600">{summary.outlook}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Generation Options */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold mb-6 text-gray-800">Generate Custom Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-semibold">Executive Summary</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">High-level overview for management</p>
                        <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                            Generate PDF
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-green-50">
                                <CheckCircle className="w-5 h-5" style={{ color: LOGO_GREEN }} />
                            </div>
                            <h4 className="font-semibold">Compliance Report</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Detailed compliance status</p>
                        <button className="w-full py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                            Generate PDF
                        </button>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-purple-50">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <h4 className="font-semibold">Stakeholder Report</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Shareholder and community facing</p>
                        <button className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
                            Generate PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;