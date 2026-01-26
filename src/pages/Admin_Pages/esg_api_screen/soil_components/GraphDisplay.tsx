import { Eye } from "lucide-react";

interface GraphDisplayProps {
    title: string;
    description: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
}

const GraphDisplay = ({ title, description, children, icon, onClick }: GraphDisplayProps) => (
    <div
        className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/5 cursor-pointer relative group"
        onClick={onClick}
    >
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-5 h-5 text-green-600" />
            </div>
        </div>
        <div className="h-80">
            {children}
        </div>
    </div>
);

export default GraphDisplay;