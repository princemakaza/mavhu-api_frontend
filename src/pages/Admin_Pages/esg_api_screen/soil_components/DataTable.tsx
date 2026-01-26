import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";

interface Column {
    key: string;
    header: string;
    accessor?: (row: any) => any;
    className?: string;
    sortable?: boolean;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onRowClick?: (row: any) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    sortable?: boolean;
    className?: string;
}

const DataTable = ({
    columns,
    data,
    onRowClick,
    isLoading = false,
    emptyMessage = "No data available",
    sortable = true,
    className = ""
}: DataTableProps) => {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (columnKey: string) => {
        if (!sortable) return;

        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const sortedData = sortColumn && sortable
        ? [...data].sort((a, b) => {
            const column = columns.find(c => c.key === sortColumn);
            const aVal = column?.accessor ? column.accessor(a) : a[sortColumn];
            const bVal = column?.accessor ? column.accessor(b) : b[sortColumn];

            // Handle different data types
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        })
        : data;

    const LoadingSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                    {columns.map((_, colIndex) => (
                        <div
                            key={colIndex}
                            className={`h-10 rounded bg-gray-200 animate-pulse ${colIndex === 0 ? 'flex-1' : 'w-24'}`}
                        ></div>
                    ))}
                </div>
            ))}
        </div>
    );

    const EmptyState = () => (
        <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-500">{emptyMessage}</p>
        </div>
    );

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (data.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => sortable && handleSort(column.key)}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''} ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{column.header}</span>
                                        {sortable && sortColumn === column.key && (
                                            <ChevronsUpDown
                                                className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? 'text-green-600' : 'text-yellow-600'}`}
                                            />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                onClick={() => onRowClick?.(row)}
                                className={`transition-colors duration-150 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${rowIndex}-${column.key}`}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    >
                                        <div className="truncate max-w-xs">
                                            {column.accessor ? column.accessor(row) : row[column.key]}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer (optional) */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{sortedData.length}</span> of{" "}
                        <span className="font-medium">{data.length}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm bg-green-600 text-white rounded-md">1</span>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced DataTable with additional features
export const EnhancedDataTable = ({
    columns,
    data,
    onRowClick,
    isLoading,
    title,
    description,
    actions,
    searchable = false,
    filterable = false,
}: DataTableProps & {
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    searchable?: boolean;
    filterable?: boolean;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Record<string, any>>({});

    const filteredData = data.filter((row) => {
        if (searchTerm) {
            const matchesSearch = columns.some((column) => {
                const value = column.accessor ? column.accessor(row) : row[column.key];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
            if (!matchesSearch) return false;
        }

        if (Object.keys(filters).length > 0) {
            return Object.entries(filters).every(([key, value]) => {
                const rowValue = row[key];
                return value === "" || rowValue === value;
            });
        }

        return true;
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            {(title || description || actions || searchable || filterable) && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                        </div>
                        {actions && <div>{actions}</div>}
                    </div>

                    {/* Search and Filter Bar */}
                    {(searchable || filterable) && (
                        <div className="flex items-center space-x-4">
                            {searchable && (
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <div className="absolute left-3 top-2.5">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {filterable && (
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <DataTable
                columns={columns}
                data={filteredData}
                onRowClick={onRowClick}
                isLoading={isLoading}
            />
        </div>
    );
};

export default DataTable;