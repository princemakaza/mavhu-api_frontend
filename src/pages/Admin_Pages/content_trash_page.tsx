import React, { useEffect, useMemo, useState } from "react";
import {
    Trash2,
    RotateCcw,
    RefreshCw,
    Menu,
    X,
    Info,
    FolderOpen,
    FileText,
    CalendarClock,
    AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import TopicContentService from "@/services/Admin_Service/Topic_Content_service";

// ===================== Types (aligned with API) =====================
interface McqQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    _id: string;
}

interface SubHeading {
    text: string;
    subheadingAudioPath?: string;
    question?: string;
    expectedAnswer?: string;
    comment?: string;
    hint?: string;
    mcqQuestions?: McqQuestion[];
    _id: string;
}

interface Lesson {
    text: string;
    subHeading?: SubHeading[];
    audio?: string;
    video?: string;
    _id: string;
}

interface TopicMeta {
    _id: string;
    title: string;
    description?: string;
}

export interface TrashedContentItem {
    _id: string;
    title: string;
    description?: string;
    lesson?: Lesson[];
    file_path?: string[];
    file_type?: string;
    Topic?: TopicMeta | null;
    deleted?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ===================== Utils =====================
const formatDateTime = (iso?: string) => {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
};

const truncate = (text?: string, n = 120) => {
    if (!text) return "";
    return text.length > n ? text.slice(0, n - 1) + "…" : text;
};

// ===================== Component =====================
const ContentTrashManagement: React.FC = () => {
    // Layout / sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    // Data
    const [items, setItems] = useState<TrashedContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // UI state
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchQ, setSearchQ] = useState(""); // debounced query
    const [busyId, setBusyId] = useState<string | null>(null); // per-card spinner for restore

    // Sidebar responsive behavior
    useEffect(() => {
        const checkScreen = () => {
            const large = window.innerWidth >= 768;
            setIsLargeScreen(large);
            setSidebarOpen(large);
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // Fetch trashed items
    const fetchTrash = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await TopicContentService.getTrashedContents();
            // API returns { message, data }
            const list: TrashedContentItem[] = res?.data || [];
            // sort by deletedAt desc for recency
            list.sort((a, b) => {
                const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
                const db = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
                return db - da;
            });
            setItems(list);
        } catch (e: any) {
            setError(e?.message || e || "Failed to load trashed contents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    // Debounce search input for smoother UX
    useEffect(() => {
        const t = setTimeout(() => setSearchQ(search.trim().toLowerCase()), 300);
        return () => clearTimeout(t);
    }, [search]);

    const filteredItems = useMemo(() => {
        if (!searchQ) return items;
        return items.filter((i) =>
            [i.title, i.description, i.file_type, i.Topic?.title, i._id]
                .filter(Boolean)
                .some((s) => String(s).toLowerCase().includes(searchQ))
        );
    }, [items, searchQ]);

    // Actions
    const restore = async (id: string) => {
        setBusyId(id);
        try {
            await TopicContentService.restoreFromTrash(id);
            setItems((prev) => prev.filter((i) => i._id !== id));
        } catch (e: any) {
            alert(e?.message || "Failed to restore content");
        } finally {
            setBusyId(null);
        }
    };

    const openConfirmDelete = (id: string) => setConfirmId(id);
    const closeConfirmDelete = () => setConfirmId(null);

    const permanentlyDelete = async () => {
        if (!confirmId) return;
        setConfirmLoading(true);
        try {
            await TopicContentService.deletePermanently(confirmId);
            setItems((prev) => prev.filter((i) => i._id !== confirmId));
            setConfirmId(null);
        } catch (e: any) {
            alert(e?.message || "Failed to permanently delete content");
        } finally {
            setConfirmLoading(false);
        }
    };

    // ===================== Subcomponents =====================
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Trash is empty</h3>
            <p className="text-gray-500 mt-1 max-w-md">
                No trashed content found. Deleted items will appear here until they are restored or permanently removed.
            </p>
            <Button onClick={fetchTrash} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin-slower" />Refresh
            </Button>
        </div>
    );

    const ShimmerCard = () => (
        <Card className="min-w-[280px] max-w-[320px] flex flex-col animate-pulse">
            <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="h-5 w-3/4 bg-gray-300 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-300" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-gray-300" />
                    <div className="h-3 w-40 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                    <div className="h-9 bg-gray-200 rounded flex-1" />
                    <div className="h-9 bg-gray-200 rounded flex-1" />
                </div>
            </CardContent>
        </Card>
    );

    // ===================== Render =====================
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
            >
                {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div
                className={`
          ${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
          transition-all duration-300 ease-in-out
          fixed md:relative z-40 md:z-auto w-64
        `}
            >
                <Sidebar />
            </div>

            {/* Mobile backdrop */}
            {sidebarOpen && !isLargeScreen && (
                <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={toggleSidebar} />
            )}

            {/* Main */}
            <div className="flex-1 w-full">
                <div className="w-full min-h-screen p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0 mt-10 md:mt-0">
                        <div className="flex items-center gap-3">
                            <Trash2 className="h-8 w-8 text-blue-900" />
                            <h1 className="text-2xl font-bold text-blue-900">CONTENT TRASH MANAGEMENT</h1>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Search trashed items…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="md:w-[280px] focus-visible:ring-blue-900"
                                aria-label="Search trashed items"
                            />
                            <Button variant="outline" onClick={fetchTrash} aria-label="Refresh list">
                                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                            </Button>
                            <div className="bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium text-blue-900">
                                Total: {filteredItems.length}
                            </div>
                        </div>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            <AlertTriangle className="h-4 w-4 mt-0.5" />
                            <div>
                                <div className="font-medium">Unable to load trash</div>
                                <div className="opacity-80">{String(error)}</div>
                            </div>
                        </div>
                    )}

                    {/* Grid (four per row on large screens) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <ShimmerCard key={i} />)
                            : filteredItems.map((item) => (
                                <Card
                                    key={item._id}
                                    className="group relative overflow-hidden rounded-xl border-0 bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                                >
                                    {/* Gradient Header */}
                                    <div className="relative p-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
                                        <div className="relative z-10">
                                            <h3
                                                className="font-bold text-xl text-white line-clamp-2 mb-2 leading-tight"
                                                title={item.title}
                                            >
                                                {item.title || "(Untitled)"}
                                            </h3>
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                                                <p className="text-sm text-white/90 font-medium">
                                                    {item.Topic?.title ? `${item.Topic.title}` : "No topic"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-6 space-y-4">
                                        {/* Info Grid */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                                                    <FileText className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-900 block">Type</span>
                                                    <span className="text-gray-600 text-xs">{item.file_type || "Unknown"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50">
                                                    <CalendarClock className="h-4 w-4 text-orange-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-900 block">Deleted</span>
                                                    <span className="text-gray-600 text-xs">{formatDateTime(item.deletedAt)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 text-sm">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 mt-0.5">
                                                    <Info className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-900 block mb-1">Description</span>
                                                    <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed" title={item.description}>
                                                        {truncate(item.description, 80) || "No description available"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                                                    <FolderOpen className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium text-gray-900 block">Files</span>
                                                    <span className="text-gray-600 text-xs">{item.file_path?.length || 0} file(s)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100"></div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 font-medium"
                                                onClick={() => restore(item._id)}
                                                disabled={busyId === item._id}
                                            >
                                                {busyId === item._id ? (
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                )}
                                                Restore
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 shadow-sm transition-all duration-200 font-medium"
                                                onClick={() => openConfirmDelete(item._id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>

                                    {/* Subtle hover effect overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </Card>
                            ))}
                    </div>


                    {/* Empty state */}
                    {!loading && !error && filteredItems.length === 0 && <EmptyState />}
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <Dialog open={!!confirmId} onOpenChange={(open) => (!open ? closeConfirmDelete() : null)}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Delete permanently?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The selected content will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={closeConfirmDelete} disabled={confirmLoading}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={permanentlyDelete}
                            disabled={confirmLoading}
                        >
                            {confirmLoading ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContentTrashManagement;
