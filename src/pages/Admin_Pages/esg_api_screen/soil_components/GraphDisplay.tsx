import { Eye, Info, Maximize2, Calculator } from "lucide-react";
import { useState } from "react";

interface GraphDisplayProps {
    title: string;
    description: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    onInfoClick?: () => void;
    showInfoButton?: boolean;
    showExpandButton?: boolean;
    infoTooltip?: string;
}

const GraphDisplay = ({ 
    title, 
    description, 
    children, 
    icon, 
    onClick,
    onInfoClick,
    showInfoButton = true,
    showExpandButton = true,
    infoTooltip = "How is this calculated?"
}: GraphDisplayProps) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onInfoClick) {
            onInfoClick();
        }
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/5 relative group"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {icon && (
                            <div className="flex-shrink-0">
                                {icon}
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {title}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{description}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 pl-2">
                    {/* Info Button */}
                    {showInfoButton && onInfoClick && (
                        <div 
                            className="relative"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <button
                                onClick={handleInfoClick}
                                className="p-2 rounded-lg hover:bg-green-50 transition-colors group/info"
                                title={infoTooltip}
                            >
                                <Calculator className="w-4 h-4 text-gray-400 group-hover/info:text-green-600 transition-colors" />
                            </button>
                            
                            {/* Tooltip */}
                            {showTooltip && (
                                <div className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                                    <div className="flex items-start gap-2">
                                        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>{infoTooltip}</span>
                                    </div>
                                    <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Expand Button */}
                    {showExpandButton && onClick && (
                        <button
                            onClick={handleExpandClick}
                            className="p-2 rounded-lg hover:bg-gray-50 transition-colors group/expand"
                            title="Expand view"
                        >
                            <Maximize2 className="w-4 h-4 text-gray-400 group-hover/expand:text-green-600 transition-colors" />
                        </button>
                    )}
                </div>
            </div>
            
            {/* Chart Content */}
            <div className="h-80 relative">
                {children}
                
                {/* Overlay for click to expand (only if onClick is provided) */}
                {onClick && (
                    <div 
                        className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                        onClick={onClick}
                    >
                        <div className="absolute inset-0 bg-black/5 rounded-lg"></div>
                        <div className="relative z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-sm text-gray-700">
                            <Eye className="w-4 h-4" />
                            Click to expand
                        </div>
                    </div>
                )}
            </div>
            
            {/* Bottom Info */}
            {onInfoClick && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleInfoClick}
                        className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1 transition-colors group/info-bottom"
                    >
                        <Info className="w-3 h-3" />
                        <span className="group-hover/info-bottom:underline">View calculation methodology</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default GraphDisplay;