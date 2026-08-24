import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
    Landmark,
    Edit,
    Trash2,
    Eye,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    X,
    Save,
    Phone,
    Mail,
    Globe,
    MapPin,
    Loader2,
    Key,
    Hash,
    UserPlus,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import {
    createBank,
    getBanks,
    getBankById,
    updateBank,
    deleteBank,
    createBankUser,
    getBankUsers,
    updateBankUser,
    deleteBankUser,
    type Bank,
    type BankUser,
    type CreateBankPayload,
    type CreateBankUserPayload,
} from "../../services/Admin_Service/bank_service";

const primaryNavy = "#0A3B5C";
const secondaryGold = "#D4AF37";

const BankManagementScreen: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchTerm, setSearchTerm] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showUsersModal, setShowUsersModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

    const [bankFormData, setBankFormData] = useState<CreateBankPayload>({
        name: "", reference_id: "", email: "", phone: "", address: "", country: "", website: "", description: "",
    });

    // Bank users state
    const [bankUsers, setBankUsers] = useState<BankUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState<BankUser | null>(null);
    const [userFormData, setUserFormData] = useState<CreateBankUserPayload>({
        first_name: "", last_name: "", email: "", password: "", role: "user",
    });

    const [actionLoading, setActionLoading] = useState(false);

    const fetchBanks = useCallback(async (page = 1, search = "") => {
        setLoading(true);
        setError(null);
        try {
            const result = await getBanks(page, pagination.limit, search);
            setBanks(result.banks);
            setPagination(prev => ({ ...prev, page: result.page, total: result.total, totalPages: result.totalPages }));
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || "Failed to load banks");
        } finally {
            setLoading(false);
        }
    }, [pagination.limit]);

    useEffect(() => {
        const debounce = setTimeout(() => fetchBanks(1, searchTerm), 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, fetchBanks]);

    useEffect(() => { fetchBanks(pagination.page, searchTerm); }, []);

    // ── Bank CRUD ─────────────────────────────────────────────────────────────

    const handleCreateBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await createBank(bankFormData);
            setShowCreateModal(false);
            resetBankForm();
            fetchBanks(1, searchTerm);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to create bank");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditBank = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank) return;
        setActionLoading(true);
        try {
            await updateBank(selectedBank.id, bankFormData);
            setShowEditModal(false);
            fetchBanks(pagination.page, searchTerm);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to update bank");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteBank = async () => {
        if (!selectedBank) return;
        setActionLoading(true);
        try {
            await deleteBank(selectedBank.id);
            setShowDeleteModal(false);
            setSelectedBank(null);
            fetchBanks(pagination.page, searchTerm);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to delete bank");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (bank: Bank) => {
        const newStatus = bank.status === "active" ? "inactive" : "active";
        try {
            await updateBank(bank.id, { status: newStatus });
            fetchBanks(pagination.page, searchTerm);
        } catch (err: any) {
            alert("Failed to update status");
        }
    };

    const openEditModal = (bank: Bank) => {
        setSelectedBank(bank);
        setBankFormData({
            name: bank.name, reference_id: bank.reference_id, email: bank.email || "",
            phone: bank.phone || "", address: bank.address || "", country: bank.country || "",
            website: bank.website || "", description: bank.description || "",
        });
        setShowEditModal(true);
    };

    const openUsersModal = async (bank: Bank) => {
        setSelectedBank(bank);
        setShowUsersModal(true);
        setUsersLoading(true);
        try {
            const res = await getBankUsers(bank.id);
            setBankUsers(res.users);
        } catch (err: any) {
            alert("Failed to load bank users");
        } finally {
            setUsersLoading(false);
        }
    };

    const resetBankForm = () => {
        setBankFormData({ name: "", reference_id: "", email: "", phone: "", address: "", country: "", website: "", description: "" });
    };

    // ── Bank User CRUD ────────────────────────────────────────────────────────

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank) return;
        setActionLoading(true);
        try {
            await createBankUser(selectedBank.id, userFormData);
            const res = await getBankUsers(selectedBank.id);
            setBankUsers(res.users);
            setShowUserForm(false);
            resetUserForm();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to create user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBank || !editingUser) return;
        setActionLoading(true);
        try {
            const payload: any = { first_name: userFormData.first_name, last_name: userFormData.last_name, role: userFormData.role };
            if (userFormData.password) payload.password = userFormData.password;
            await updateBankUser(selectedBank.id, editingUser.id, payload);
            const res = await getBankUsers(selectedBank.id);
            setBankUsers(res.users);
            setShowUserForm(false);
            setEditingUser(null);
            resetUserForm();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Failed to update user");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (user: BankUser) => {
        if (!selectedBank || !confirm(`Delete user ${user.email}?`)) return;
        try {
            await deleteBankUser(selectedBank.id, user.id);
            const res = await getBankUsers(selectedBank.id);
            setBankUsers(res.users);
        } catch (err: any) {
            alert("Failed to delete user");
        }
    };

    const handleToggleUserStatus = async (user: BankUser) => {
        if (!selectedBank) return;
        const newStatus = user.status === "active" ? "inactive" : "active";
        try {
            await updateBankUser(selectedBank.id, user.id, { status: newStatus } as any);
            const res = await getBankUsers(selectedBank.id);
            setBankUsers(res.users);
        } catch {
            alert("Failed to update user status");
        }
    };

    const openEditUser = (user: BankUser) => {
        setEditingUser(user);
        setUserFormData({ first_name: user.first_name, last_name: user.last_name, email: user.email, password: "", role: user.role });
        setShowUserForm(true);
    };

    const resetUserForm = () => {
        setUserFormData({ first_name: "", last_name: "", email: "", password: "", role: "user" });
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = { active: "bg-green-100 text-green-700", inactive: "bg-gray-100 text-gray-600", suspended: "bg-red-100 text-red-700" };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 transition-all duration-300">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                                <div className="w-5 h-5 flex flex-col justify-center gap-1">
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                    <div className="h-0.5 bg-gray-600 w-full" />
                                </div>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: primaryNavy }}>Bank Management</h1>
                                <p className="text-sm text-gray-500">Register and manage banks and their users</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { resetBankForm(); setShowCreateModal(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-sm shadow-md hover:opacity-90 transition"
                            style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}
                        >
                            <Plus className="w-4 h-4" /> Register Bank
                        </button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { label: "Total Banks", value: pagination.total, icon: Landmark, color: primaryNavy },
                            { label: "Active", value: banks.filter(b => b.status === "active").length, icon: CheckCircle, color: "#16a34a" },
                            { label: "Inactive", value: banks.filter(b => b.status !== "active").length, icon: XCircle, color: "#dc2626" },
                            { label: "This Page", value: banks.length, icon: Users, color: secondaryGold },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                                    <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
                                </div>
                                <p className="text-sm text-gray-600">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search banks by name or reference ID..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm"
                                style={{ '--tw-ring-color': `${primaryNavy}40` } as any}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryNavy }} />
                                <span className="ml-3 text-gray-600">Loading banks...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                <p className="text-red-600 font-medium">{error}</p>
                                <button onClick={() => fetchBanks()} className="mt-3 text-sm underline text-gray-600">Retry</button>
                            </div>
                        ) : banks.length === 0 ? (
                            <div className="text-center py-16">
                                <Landmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500 font-medium">No banks registered yet</p>
                                <button onClick={() => { resetBankForm(); setShowCreateModal(true); }} className="mt-3 text-sm underline" style={{ color: primaryNavy }}>Register a bank</button>
                            </div>
                        ) : (
                            <>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            {["Bank Name", "Reference ID", "Email", "Country", "Status", "Actions"].map(h => (
                                                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {banks.map(bank => (
                                            <tr key={bank.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryNavy}15, ${secondaryGold}15)` }}>
                                                            <Landmark className="w-4 h-4" style={{ color: primaryNavy }} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{bank.name}</p>
                                                            <p className="text-xs text-gray-500">{bank.description?.slice(0, 40) || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-700">{bank.reference_id}</span>
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{bank.email || "—"}</td>
                                                <td className="px-5 py-4 text-gray-600">{bank.country || "—"}</td>
                                                <td className="px-5 py-4">{statusBadge(bank.status)}</td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <button onClick={() => openUsersModal(bank)} title="Manage Users" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition">
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => openEditModal(bank)} title="Edit" className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleToggleStatus(bank)} title="Toggle status" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                                                            {bank.status === "active" ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={() => { setSelectedBank(bank); setShowDeleteModal(true); }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                                        <span className="text-sm text-gray-500">Showing {banks.length} of {pagination.total} banks</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => fetchBanks(pagination.page - 1, searchTerm)}
                                                disabled={pagination.page <= 1}
                                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm font-medium px-3">{pagination.page} / {pagination.totalPages}</span>
                                            <button
                                                onClick={() => fetchBanks(pagination.page + 1, searchTerm)}
                                                disabled={pagination.page >= pagination.totalPages}
                                                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* ── Create Bank Modal ─────────────────────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold" style={{ color: primaryNavy }}>Register New Bank</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleCreateBank} className="p-6 space-y-4">
                            <BankFormFields data={bankFormData} onChange={setBankFormData} />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                                <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition" style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}>
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Register Bank
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Bank Modal ───────────────────────────────────────────────── */}
            {showEditModal && selectedBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold" style={{ color: primaryNavy }}>Edit {selectedBank.name}</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={handleEditBank} className="p-6 space-y-4">
                            <BankFormFields data={bankFormData} onChange={setBankFormData} disableReferenceId />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                                <button type="submit" disabled={actionLoading} className="flex-1 py-2.5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition" style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}>
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
            {showDeleteModal && selectedBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Bank</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete <strong>{selectedBank.name}</strong>? This will also delete all bank users.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                            <button onClick={handleDeleteBank} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Bank Users Modal ──────────────────────────────────────────────── */}
            {showUsersModal && selectedBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold" style={{ color: primaryNavy }}>Bank Users</h2>
                                <p className="text-sm text-gray-500">{selectedBank.name} • <span className="font-mono text-xs">{selectedBank.reference_id}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingUser(null); resetUserForm(); setShowUserForm(!showUserForm); }}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition"
                                    style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}
                                >
                                    <UserPlus className="w-4 h-4" /> Add User
                                </button>
                                <button onClick={() => { setShowUsersModal(false); setShowUserForm(false); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            {/* User form */}
                            {showUserForm && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-sm font-semibold mb-3" style={{ color: primaryNavy }}>{editingUser ? "Edit User" : "New Bank User"}</h3>
                                    <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={userFormData.first_name} onChange={e => setUserFormData(p => ({ ...p, first_name: e.target.value }))} placeholder="First Name" required className="col-span-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                                            <input value={userFormData.last_name} onChange={e => setUserFormData(p => ({ ...p, last_name: e.target.value }))} placeholder="Last Name" required className="col-span-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                                        </div>
                                        {!editingUser && (
                                            <input type="email" value={userFormData.email} onChange={e => setUserFormData(p => ({ ...p, email: e.target.value }))} placeholder="Email" required className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                                        )}
                                        <input type="password" value={userFormData.password} onChange={e => setUserFormData(p => ({ ...p, password: e.target.value }))} placeholder={editingUser ? "New password (leave blank to keep)" : "Password"} required={!editingUser} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                                        <select value={userFormData.role} onChange={e => setUserFormData(p => ({ ...p, role: e.target.value as "admin" | "user" }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setShowUserForm(false); setEditingUser(null); }} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-100 transition">Cancel</button>
                                            <button type="submit" disabled={actionLoading} className="flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition" style={{ background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})` }}>
                                                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                                {editingUser ? "Save" : "Create"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Users list */}
                            {usersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryNavy }} />
                                    <span className="ml-2 text-sm text-gray-600">Loading users...</span>
                                </div>
                            ) : bankUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                    <p className="text-gray-500 text-sm">No users yet. Add the first user above.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {bankUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{user.role}</span>
                                                {statusBadge(user.status)}
                                                <button onClick={() => handleToggleUserStatus(user)} className="p-1.5 rounded-lg hover:bg-gray-100 transition" title="Toggle status">
                                                    {user.status === "active" ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                                </button>
                                                <button onClick={() => openEditUser(user)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition"><Edit className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDeleteUser(user)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Bank Form Fields Component ─────────────────────────────────────────────

interface BankFormFieldsProps {
    data: CreateBankPayload;
    onChange: React.Dispatch<React.SetStateAction<CreateBankPayload>>;
    disableReferenceId?: boolean;
}

const BankFormFields: React.FC<BankFormFieldsProps> = ({ data, onChange, disableReferenceId }) => {
    const set = (key: keyof CreateBankPayload) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(prev => ({ ...prev, [key]: e.target.value }));

    return (
        <>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name *</label>
                <input value={data.name} onChange={set("name")} required placeholder="e.g. First National Bank" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Reference ID * <span className="text-gray-400 font-normal">(used for login)</span></label>
                <input
                    value={data.reference_id}
                    onChange={set("reference_id")}
                    required
                    disabled={disableReferenceId}
                    placeholder="e.g. FNB001"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent font-mono disabled:bg-gray-50 disabled:text-gray-400"
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input type="email" value={data.email} onChange={set("email")} placeholder="contact@bank.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input value={data.phone} onChange={set("phone")} placeholder="+263..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
                    <input value={data.country} onChange={set("country")} placeholder="Zimbabwe" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                    <input value={data.website} onChange={set("website")} placeholder="https://bank.com" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input value={data.address} onChange={set("address")} placeholder="123 Banking St, Harare" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={data.description} onChange={set("description")} rows={2} placeholder="Brief description of the bank..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none" />
            </div>
        </>
    );
};

export default BankManagementScreen;
