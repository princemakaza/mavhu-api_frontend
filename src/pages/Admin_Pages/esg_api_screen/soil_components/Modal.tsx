import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    footer?: ReactNode;
    preventCloseOnOutsideClick?: boolean;
    className?: string;
}

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'lg',
    showCloseButton = true,
    footer,
    preventCloseOnOutsideClick = false,
    className = "",
}: ModalProps) => {
    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle outside click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !preventCloseOnOutsideClick) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-7xl'
    };

    const animationClass = "animate-in fade-in-0 zoom-in-95 duration-200";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />
            
            {/* Modal Container */}
            <div className="flex min-h-screen items-center justify-center p-4">
                <div 
                    className={`relative ${sizeClasses[size]} w-full bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-hidden ${animationClass} ${className}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <h2 
                                    id="modal-title"
                                    className="text-2xl font-bold text-gray-900"
                                >
                                    {title}
                                </h2>
                            </div>
                        </div>
                        
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {children}
                    </div>

                    {/* Footer (optional) */}
                    {footer && (
                        <div className="sticky bottom-0 z-10 p-6 border-t border-gray-200 bg-white">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Confirmation Modal Component
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'success' | 'info';
    isLoading?: boolean;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger',
    isLoading = false,
}: ConfirmationModalProps) => {
    const variantClasses = {
        danger: {
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            icon: 'text-red-600',
        },
        warning: {
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            icon: 'text-yellow-600',
        },
        success: {
            button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
            icon: 'text-green-600',
        },
        info: {
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            icon: 'text-blue-600',
        },
    };

    const Icon = () => {
        switch (variant) {
            case 'danger':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'success':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full ${variantClasses[variant].icon} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon />
                </div>
                
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variantClasses[variant].button}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Data View Modal Component
interface DataViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: Record<string, any>;
    excludeFields?: string[];
    showJson?: boolean;
}

export const DataViewModal = ({
    isOpen,
    onClose,
    title,
    data,
    excludeFields = [],
    showJson = false,
}: DataViewModalProps) => {
    const filteredData = Object.entries(data).filter(
        ([key]) => !excludeFields.includes(key)
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="lg"
        >
            <div className="space-y-6">
                {/* Data Grid View */}
                <div className="grid grid-cols-2 gap-4">
                    {filteredData.map(([key, value]) => (
                        <div key={key} className="space-y-1">
                            <dt className="text-sm font-medium text-gray-500 capitalize">
                                {key.replace(/_/g, ' ')}
                            </dt>
                            <dd className="text-sm text-gray-900">
                                {typeof value === 'object' ? (
                                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                ) : (
                                    String(value)
                                )}
                            </dd>
                        </div>
                    ))}
                </div>

                {/* JSON View (optional) */}
                {showJson && (
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Raw JSON Data</h4>
                        <pre className="text-xs bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy JSON
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default Modal;