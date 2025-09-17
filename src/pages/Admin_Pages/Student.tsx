import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  User,
  Menu,
  X,
  Search,
  Phone,
  Mail,
  School,
  Book,
  Home,
  Users,
  AlertCircle,
  Trash,
  Smartphone,
  BookOpen,
  Building,
  UserCheck,
  Loader2,
  Image as ImageIcon,
  Check,
  XCircle,
  ZoomIn,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Sidebar from "@/components/Sidebar";
import StudentService from "../../services/Admin_Service/Student_service";

// Utility: safely truncate text
const truncateText = (text, length) => {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}…` : text;
};

// Dropdown (lightweight, accessible-ish)
const Dropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="text-sm text-gray-700">{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-auto"
        >
          {options.map((option, idx) => (
            <div
              key={idx}
              role="option"
              tabIndex={0}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer focus:bg-gray-100"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onChange(option);
                  setIsOpen(false);
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Student Detail Modal
const StudentDetailModal = ({ student, isOpen, onClose }) => {
  const navigate = useNavigate();
  if (!student) return null;

  const handleViewMore = () => {
    onClose();
    navigate(`/student_activities/${student._id}`);
  };

  const photoUrl =
    student.profile_picture ||
    student.profilePictureUrl ||
    student.profile_image_url ||
    student.profileImage?.url ||
    student.avatarUrl ||
    "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mr-4 flex items-center justify-center overflow-hidden">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-blue-900" />
              )}
            </div>
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          {/* Personal Info */}
          <div className="col-span-1 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-base text-gray-700 mb-3">Personal Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="font-semibold">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">ID: {student.studentId || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm break-all">{student.email || "N/A"}</p>
                  <p className="text-xs text-gray-500">Email</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.phone_number || "N/A"}</p>
                  <p className="text-xs text-gray-500">Phone</p>
                </div>
              </div>
              <div className="flex items-start">
                <Home className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.address || "N/A"}</p>
                  <p className="text-xs text-gray-500">Address</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="col-span-1 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-base text-gray-700 mb-3">Academic Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <School className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.school || "N/A"}</p>
                  <p className="text-xs text-gray-500">School</p>
                </div>
              </div>
              <div className="flex items-start">
                <Book className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.level || "N/A"}</p>
                  <p className="text-xs text-gray-500">Level</p>
                </div>
              </div>
              <div className="flex items-start">
                <Book className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <div className="text-sm">
                    {Array.isArray(student.subjects) && student.subjects.length > 0
                      ? student.subjects.map((sub) => truncateText(sub, 12)).join(", ")
                      : "No subjects listed"}
                  </div>
                  <p className="text-xs text-gray-500">Subjects</p>
                </div>
              </div>
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      (student.subscription_status || "").trim().toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {(student.subscription_status || "N/A").toUpperCase()}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Subscription Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional */}
          <div className="col-span-1 bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-base text-gray-700 mb-3">Additional Information</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Users className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.next_of_kin_full_name || "N/A"}</p>
                  <p className="text-xs text-gray-500">Next of Kin</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-900 mt-1 mr-3" />
                <div>
                  <p className="text-sm">{student.next_of_kin_phone_number || "N/A"}</p>
                  <p className="text-xs text-gray-500">Next of Kin Phone</p>
                </div>
              </div>

              {typeof student.overallMark === "number" && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-700">Overall Mark</span>
                    <span className="text-xs font-semibold">{student.overallMark}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-900 h-2 rounded-full"
                      style={{ width: `${student.overallMark}%` }}
                    />
                  </div>
                </div>
              )}

              {typeof student.attendance === "number" && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-700">Attendance</span>
                    <span className="text-xs font-semibold">{student.attendance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${student.attendance}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={handleViewMore}>
            View More
          </Button>
          <Button className="bg-blue-900 hover:bg-blue-800" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ isOpen, onClose, student, onConfirm, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-blue-700 flex items-center">
            <Trash className="h-5 w-5 mr-2" /> Delete Student
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-800">
            Are you sure you want to delete this student?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="font-medium text-gray-800">
            {student?.firstName} {student?.lastName}
          </div>
          <div className="text-sm text-gray-600 mt-1">ID: {student?.studentId || "N/A"}</div>
          <div className="text-sm text-gray-600">Level: {student?.level || "N/A"}</div>
        </div>

        <p className="text-red-500 text-xs mt-2">
          This action cannot be undone. All student data will be permanently removed.
        </p>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} className="border-gray-300 hover:bg-gray-50">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 ml-2"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Yes, Delete Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Image Preview Dialog
const ImagePreviewDialog = ({ isOpen, onClose, src, name }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Profile Picture
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600">
          {name ? `Viewing image for ${name}` : "Profile image preview"}
        </DialogDescription>
      </DialogHeader>
      <div className="w-full">
        {src ? (
          <img src={src} alt={name || "Profile"} className="w-full max-h-[60vh] object-contain rounded-lg" />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// Reject Reason Dialog
const RejectReasonDialog = ({
  isOpen,
  onClose,
  student,
  onConfirm,
  isSubmitting,
  rejectionReason,
  setRejectionReason,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-red-700 flex items-center gap-2">
          <XCircle className="h-5 w-5" /> Reject Profile Picture
        </DialogTitle>
        <DialogDescription className="pt-1 text-gray-700 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-gray-500" />
          Please provide a clear reason for rejection. The student will be notified.
        </DialogDescription>
      </DialogHeader>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
        <div className="font-medium text-gray-800">
          {student?.firstName} {student?.lastName}
        </div>
        <div className="text-gray-600 mt-1">ID: {student?.id || "N/A"}</div>
      </div>

      <div className="mt-4">
        <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
          Rejection reason
        </label>
        <textarea
          id="rejection-reason"
          className="w-full min-h-[110px] rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="e.g., Please upload a clear photo with a plain background, showing your full face."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-2">
          Tips: Ask for proper lighting, no filters, face centered, and plain background.
        </p>
      </div>

      <DialogFooter className="pt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={onConfirm}
          disabled={!rejectionReason?.trim() || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
          Submit Rejection
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// --- Chart Cards ---
const LevelDistributionChart = ({ data = [] }) => {
  const COLORS = ["#1e3a8a", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <BookOpen className="h-4 w-4 mr-2" /> Level Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

const SubscriptionStatusChart = ({ data = [] }) => {
  const formattedData = Array.isArray(data)
    ? data.reduce((acc, item) => {
        if (!item || !item._id) return acc;
        const status = String(item._id).trim().toLowerCase();
        if (status === "active") {
          const existing = acc.find((i) => i.name === "Active");
          if (existing) existing.count += item.count || 0;
          else acc.push({ name: "Active", count: item.count || 0 });
        } else {
          acc.push({ name: item._id, count: item.count || 0 });
        }
        return acc;
      }, [])
    : [];

  const COLORS = ["#1e3a8a", "#FF8042", "#0088FE"];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <UserCheck className="h-4 w-4 mr-2" /> Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
              >
                {formattedData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

const PhoneVerificationChart = ({ data = [] }) => {
  const formattedData = Array.isArray(data)
    ? data.map((item) => ({ name: item._id ? "Verified" : "Not Verified", count: item.count || 0 }))
    : [];

  const COLORS = ["#1e3a8a", "#FF8042"];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text sm">
          <Smartphone className="h-4 w-4 mr-2" /> Phone Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
              >
                {formattedData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

const TopSubjectsChart = ({ data = [] }) => {
  const chartData = Array.isArray(data)
    ? data.map((item) => ({ ...item, _id: truncateText(item._id, 12) }))
    : [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Book className="h-4 w-4 mr-2" /> Top Subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

const SchoolsChart = ({ data = [] }) => {
  const topSchools = Array.isArray(data)
    ? data.slice(0, 5).map((item) => ({ ...item, _id: truncateText(item._id, 18) }))
    : [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Building className="h-4 w-4 mr-2" /> Top Schools
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {topSchools.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSchools} layout="vertical" margin={{ top: 20, right: 24, left: 24, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="_id" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};

// --- Main Dashboard ---
const StudentDashboard = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Modal & delete
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Photo preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewName, setPreviewName] = useState("");

  // Approve / Reject profile picture
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [studentToReject, setStudentToReject] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Search, sorting, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("firstName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const yearOptions = ["All years", "2022", "2023", "2024", "2025"];
  const levelOptions = ["All Levels", "O Level", "A Level", "Others"];

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleOpenDeleteDialog = (student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await StudentService.deleteStudent(studentToDelete._id);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Failed to delete student:", err);
      alert(`Failed to delete student: ${err.message || "Please try again"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Approve profile picture (uses student.id if present, else _id)
  const handleApproveProfilePicture = async (student) => {
    const sid = student.id || student._id;
    try {
      setApprovingId(sid);
      await StudentService.approveProfilePicture(sid);
      setStudents((prev) =>
        prev.map((s) =>
          (s.id || s._id) === sid ? { ...s, profile_picture_status: "approved" } : s
        )
      );
    } catch (err) {
      console.error("Approve failed:", err);
      alert(`Failed to approve: ${err.message || "Please try again"}`);
    } finally {
      setApprovingId(null);
    }
  };

  // Reject profile picture (open dialog)
  const openRejectDialog = (student) => {
    setStudentToReject(student);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const confirmRejectProfilePicture = async () => {
    if (!studentToReject) return;
    const sid = studentToReject.id || studentToReject._id;
    try {
      setRejectingId(sid);
      await StudentService.rejectProfilePicture(sid, rejectionReason);
      setStudents((prev) =>
        prev.map((s) =>
          (s.id || s._id) === sid
            ? {
                ...s,
                profile_picture_status: "rejected",
                profile_picture_rejection_reason: rejectionReason,
              }
            : s
        )
      );
      setIsRejectDialogOpen(false);
      setStudentToReject(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Reject failed:", err);
      alert(`Failed to reject: ${err.message || "Please try again"}`);
    } finally {
      setRejectingId(null);
    }
  };

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentsResponse = await StudentService.getAllStudents();
        if (studentsResponse && Array.isArray(studentsResponse.data)) {
          setStudents(studentsResponse.data);
        } else {
          throw new Error("Invalid student data received");
        }

        const dashboardResponse = await StudentService.getAllDashboardData();
        if (dashboardResponse && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else {
          throw new Error("Invalid dashboard data received");
        }
      } catch (err) {
        setError(err.message || "Error fetching data");
        console.error("Error fetching data:", err);
        setStudents([]);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived: filtered + sorted
  const filteredStudents = useMemo(() => {
    let data = Array.isArray(students) ? [...students] : [];

    if (selectedYear && selectedYear !== "All years") {
      data = data.filter((s) => s.academicYear === selectedYear);
    }
    if (selectedLevel && selectedLevel !== "All Levels") {
      data = data.filter((s) => s.level === selectedLevel);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (s) =>
          String(s.firstName || "").toLowerCase().includes(q) ||
          String(s.lastName || "").toLowerCase().includes(q) ||
          String(s.studentId || "").toLowerCase().includes(q) ||
          String(s.email || "").toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const av = String(a?.[sortKey] ?? "").toLowerCase();
      const bv = String(b?.[sortKey] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [students, selectedYear, selectedLevel, searchQuery, sortKey, sortDir]);

  // Pagination
  const total = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, selectedLevel, searchQuery, pageSize]);

  const changeSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const calculateAverageAttendance = useCallback(() => {
    if (!Array.isArray(students) || students.length === 0) return 0;
    const withAttendance = students.filter((s) => typeof s.attendance === "number");
    if (withAttendance.length === 0) return 0;
    const t = withAttendance.reduce((sum, s) => sum + (s.attendance || 0), 0);
    return Math.round(t / withAttendance.length);
  }, [students]);

  // Responsive sidebar
  useEffect(() => {
    const onResize = () => {
      const large = window.innerWidth >= 1024;
      setIsLargeScreen(large);
      setSidebarOpen(large);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clearFilters = () => {
    setSelectedYear("");
    setSelectedLevel("");
    setSearchQuery("");
    setPage(1);
  };

  // UI helpers
  const renderPhotoStatusBadge = (student) => {
    const status = String(student?.profile_picture_status || "").toLowerCase();
    if (status === "approved") {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
    }
    if (status === "rejected") {
      return (
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>
          {student?.profile_picture_rejection_reason ? (
            <span
              className="text-[10px] text-gray-500 italic max-w-[180px] truncate"
              title={student.profile_picture_rejection_reason}
            >
              {student.profile_picture_rejection_reason}
            </span>
          ) : null}
        </div>
      );
    }
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Mobile Menu */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`$${""} ${
          sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        } transition-all duration-300 ease-in-out fixed lg:relative z-40 lg:z-auto w-72`}
      >
        <Sidebar />
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && !isLargeScreen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={toggleSidebar} />
      )}

      {/* Main */}
      <div className="flex-1 w-full">
        <div className="w-full min-h-screen p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 mt-10 lg:mt-0">
            <h1 className="text-2xl font-bold text-blue-900 tracking-tight">STUDENTS</h1>

            {/* Search */}
            <div className="relative w-full lg:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                aria-label="Search students"
                type="text"
                className="pl-10 pr-10 py-2 w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name, ID or email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>

          {/* QUICK INSIGHTS */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardHeader className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-20 text-red-600 font-medium">Error: {error}</div>
          ) : dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{dashboardData.totalStudents || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <UserCheck className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {dashboardData.subscriptionStatus?.reduce((sum, item) => {
                      if (String(item?._id).toLowerCase().trim() === "active") return sum + (item?.count || 0);
                      return sum;
                    }, 0) || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Phone Verified</CardTitle>
                  <Smartphone className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {dashboardData.phoneVerificationStats?.find((i) => i?._id === true)?.count || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Schools</CardTitle>
                  <Building className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-900">
                    {dashboardData.studentsPerSchool?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* FILTERS ROW */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
                  <div className="min-w-[220px]">
                    <Dropdown options={yearOptions} value={selectedYear} onChange={setSelectedYear} placeholder="Select Year" />
                  </div>
                  <div className="min-w-[220px]">
                    <Dropdown options={levelOptions} value={selectedLevel} onChange={setSelectedLevel} placeholder="Select Level" />
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <label className="text-sm text-gray-600">Rows per page</label>
                  <select
                    className="border border-gray-300 rounded-md px-2 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <Button variant="outline" className="ml-1" onClick={clearFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ANALYTICS */}
          {!loading && dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
              <LevelDistributionChart data={dashboardData.levels} />
              <SubscriptionStatusChart data={dashboardData.subscriptionStatus} />
              <PhoneVerificationChart data={dashboardData.phoneVerificationStats} />
              <TopSubjectsChart data={dashboardData.topSubjects} />
              <SchoolsChart data={dashboardData.studentsPerSchool} />
            </div>
          )}

          {/* STUDENT LIST */}
          <Card className="border-0 shadow-md mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 border-y">
                    <tr>
                      {[
                        { key: "photo", label: "Photo", noSort: true },
                        { key: "firstName", label: "Name" },
                        { key: "studentId", label: "ID" },
                        { key: "level", label: "Level" },
                        { key: "school", label: "School" },
                        { key: "photoReview", label: "Photo Review", noSort: true },
                        { key: "actions", label: "Actions", noSort: true },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="text-left uppercase tracking-wider text-gray-500 font-semibold py-3 px-3 select-none"
                        >
                          <button
                            className={`flex items-center gap-1 ${col.noSort ? "cursor-default" : "hover:text-blue-700"}`}
                            onClick={() => !col.noSort && changeSort(col.key)}
                            disabled={!!col.noSort}
                          >
                            <span className="text-xs">{col.label}</span>
                            {!col.noSort && sortKey === col.key && (
                              <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                            )}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      [...Array(8)].map((_, r) => (
                        <tr key={r} className="animate-pulse">
                          {[...Array(7)].map((__, c) => (
                            <td key={c} className="px-3 py-3">
                              <div className="h-4 w-28 bg-gray-200 rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginated.length > 0 ? (
                      paginated.map((student) => {
                        const photoUrl =
                          student.profile_picture ||
                          student.profilePictureUrl ||
                          student.profile_image_url ||
                          student.profileImage?.url ||
                          student.avatarUrl ||
                          "";
                        const sid = student.id || student._id;
                        return (
                          <tr key={student._id} className="hover:bg-gray-50">
                            {/* Photo */}
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border overflow-hidden flex items-center justify-center">
                                  {photoUrl ? (
                                    <img
                                      src={photoUrl}
                                      alt={`${student.firstName} ${student.lastName}`}
                                      className="w-12 h-12 object-cover"
                                    />
                                  ) : (
                                    <User className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setPreviewSrc(photoUrl || "");
                                    setPreviewName(`${student.firstName} ${student.lastName}`);
                                    setPreviewOpen(true);
                                  }}
                                  className="text-xs text-blue-700 hover:underline inline-flex items-center gap-1 disabled:text-gray-400"
                                  disabled={!photoUrl}
                                >
                                  <ZoomIn className="h-3.5 w-3.5" />
                                  View
                                </button>
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                                  {`${(student.firstName?.[0] || "").toUpperCase()}${(student.lastName?.[0] || "").toUpperCase()}`}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 break-all">{student.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* ID */}
                            <td className="px-3 py-3 whitespace-nowrap text-gray-700">
                              {student.studentId || "N/A"}
                            </td>

                            {/* Level */}
                            <td className="px-3 py-3 whitespace-nowrap text-gray-700">
                              {student.level || "N/A"}
                            </td>

                            {/* School */}
                            <td className="px-3 py-3 whitespace-nowrap text-gray-700">
                              {truncateText(student.school, 24) || "N/A"}
                            </td>

                            {/* Photo Review */}
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  {renderPhotoStatusBadge(student)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApproveProfilePicture(student)}
                                    disabled={approvingId === sid}
                                  >
                                    {approvingId === sid ? (
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-600 text-red-700 hover:bg-red-50"
                                    onClick={() => openRejectDialog(student)}
                                    disabled={rejectingId === sid}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-900 border-blue-900 hover:bg-blue-50"
                                  onClick={() => handleViewStudentDetails(student)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleOpenDeleteDialog(student)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting && studentToDelete?._id === student._id ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <Trash className="h-4 w-4 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                          No students found. Try adjusting filters or clearing the search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                  <div className="text-xs text-gray-600">
                    Showing <span className="font-medium">{paginated.length || 0}</span> of {total} students
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={currentPage === 1}>
                      « First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      ‹ Prev
                    </Button>
                    <span className="text-sm">
                      Page <span className="font-semibold">{currentPage}</span> of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next ›
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last »
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        student={studentToDelete}
        onConfirm={handleDeleteStudent}
        isDeleting={isDeleting}
      />

      <ImagePreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc}
        name={previewName}
      />

      <RejectReasonDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        student={studentToReject}
        isSubmitting={Boolean(studentToReject && (rejectingId === (studentToReject.id || studentToReject._id)))}
        onConfirm={confirmRejectProfilePicture}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
      />
    </div>
  );
};

export default StudentDashboard;
