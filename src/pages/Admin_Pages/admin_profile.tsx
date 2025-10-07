import AdminService from "@/services/Admin_Service/admin_service";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/helper/SupabaseClient";

// Simple helper to join class names
const cn = (...s: Array<string | false | null | undefined>) => s.filter(Boolean).join(" ");

// Enhanced spinner with gradient
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={cn("relative", className)}>
        <div className="animate-spin h-5 w-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
    </div>
);

// Enhanced shimmer effect component with better colors and animations
const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
    <div 
        className={cn(
            "relative overflow-hidden rounded bg-gradient-to-r from-blue-100/70 via-blue-50/50 to-blue-100/70",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
            "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
            className
        )} 
        style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer-bg 3s ease-in-out infinite'
        }}
    />
);

// Profile picture shimmer with enhanced colors
const ProfilePictureShimmer: React.FC = () => (
    <div className="flex flex-col items-center gap-6">
        <div className="relative">
            <Shimmer className="h-40 w-40 rounded-2xl bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100" />
            {/* Overlay shimmer for extra effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
        <div className="text-center space-y-2">
            <Shimmer className="h-4 w-24 mx-auto rounded-full bg-gradient-to-r from-blue-200 to-indigo-200" />
            <Shimmer className="h-3 w-32 mx-auto rounded-full bg-gradient-to-r from-indigo-100 to-purple-100" />
            <Shimmer className="h-3 w-28 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-blue-100" />
        </div>
    </div>
);

// Form field shimmer with enhanced styling
const FormFieldShimmer: React.FC = () => (
    <div className="space-y-3">
        <Shimmer className="h-4 w-20 rounded-md bg-gradient-to-r from-blue-200 to-indigo-200" />
        <div className="relative">
            <Shimmer className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-50 via-indigo-25 to-blue-50 border border-blue-100/50" />
            {/* Inner glow effect */}
            <div className="absolute inset-1 rounded-lg bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-50" />
        </div>
    </div>
);

// Loading skeleton for the entire form with enhanced colors
const ProfileFormSkeleton: React.FC = () => (
    <div className="space-y-8">
        {/* Header shimmer with gradient colors */}
        <div className="text-center space-y-4">
            <Shimmer className="h-10 w-64 mx-auto rounded-lg bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" />
            <Shimmer className="h-4 w-80 mx-auto rounded-md bg-gradient-to-r from-indigo-100 to-blue-100" />
        </div>

        {/* Content cards shimmer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Card Shimmer */}
            <Card className="lg:col-span-1" gradient>
                <div className="border-b border-blue-900/10 px-6 py-5">
                    <Shimmer className="h-6 w-32 rounded-md mb-2 bg-gradient-to-r from-blue-300 to-indigo-300" />
                    <Shimmer className="h-4 w-48 rounded bg-gradient-to-r from-indigo-200 to-purple-200" />
                </div>
                <div className="p-6">
                    <ProfilePictureShimmer />
                </div>
            </Card>

            {/* Details Form Card Shimmer */}
            <Card className="lg:col-span-2" gradient>
                <div className="border-b border-blue-900/10 px-6 py-5">
                    <Shimmer className="h-6 w-40 rounded-md mb-2 bg-gradient-to-r from-blue-300 to-indigo-300" />
                    <Shimmer className="h-4 w-56 rounded bg-gradient-to-r from-indigo-200 to-purple-200" />
                </div>
                <div className="p-6 space-y-6">
                    {/* Name Fields Shimmer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormFieldShimmer />
                        <FormFieldShimmer />
                    </div>

                    {/* Contact Fields Shimmer */}
                    <div className="space-y-6">
                        <FormFieldShimmer />
                        <FormFieldShimmer />
                    </div>

                    {/* Password Section Shimmer */}
                    <div className="border-t border-blue-900/10 pt-6">
                        <Shimmer className="h-6 w-32 rounded-md mb-4 bg-gradient-to-r from-blue-300 to-indigo-300" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <FormFieldShimmer />
                                <Shimmer className="h-3 w-40 rounded-full mt-2 bg-gradient-to-r from-blue-100 to-indigo-100" />
                            </div>
                            <FormFieldShimmer />
                        </div>
                    </div>

                    {/* Action Buttons Shimmer */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-blue-900/10">
                        <Shimmer className="h-12 w-20 rounded-xl bg-gradient-to-r from-blue-200 to-indigo-200" />
                        <Shimmer className="h-12 w-32 rounded-xl bg-gradient-to-r from-indigo-300 to-purple-300" />
                    </div>
                </div>
            </Card>
        </div>
    </div>
);

// Upload spinner with enhanced styling
const UploadSpinner: React.FC = () => (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 shadow-xl border border-blue-100/50">
            <div className="animate-spin h-5 w-5 border-2 border-blue-200 border-t-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">Uploading...</span>
        </div>
    </div>
);

const FieldLabel: React.FC<{ htmlFor: string; children: React.ReactNode; required?: boolean }> = ({
    htmlFor,
    children,
    required,
}) => (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-blue-900 mb-2">
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input
        className={cn(
            "w-full rounded-xl border border-blue-900/20 px-4 py-3 outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:shadow-lg",
            "hover:border-blue-900/40 bg-white/80 backdrop-blur-sm",
            "placeholder:text-blue-900/40",
            className
        )}
        {...props}
    />
);

const TextHelp: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="mt-2 text-xs text-blue-900/60">{children}</p>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }> = ({
    className,
    children,
    variant = "primary",
    ...props
}) => (
    <button
        className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95",
            variant === "primary"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                : "bg-white text-blue-900 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 shadow-md hover:shadow-lg",
            className
        )}
        {...props}
    >
        {children}
    </button>
);

const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    gradient?: boolean;
}> = ({ children, className, title, subtitle, gradient = false }) => (
    <div
        className={cn(
            "rounded-2xl shadow-xl border border-blue-900/10 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl",
            gradient ? "bg-gradient-to-br from-white via-blue-50/30 to-white" : "bg-white/95",
            className
        )}
    >
        {(title || subtitle) && (
            <div className="border-b border-blue-900/10 px-6 py-5">
                {title && <h2 className="text-xl font-bold text-blue-900 mb-1">{title}</h2>}
                {subtitle && <p className="text-sm text-blue-900/60">{subtitle}</p>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

// Enhanced profile picture component
const ProfilePictureUpload: React.FC<{
    currentImage: string;
    onImageUpload: (file: File) => void;
    uploading: boolean;
}> = ({ currentImage, onImageUpload, uploading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            onImageUpload(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative group">
                <div
                    className={cn(
                        "h-40 w-40 rounded-2xl overflow-hidden border-4 transition-all duration-300 cursor-pointer",
                        "bg-gradient-to-br from-blue-100 to-blue-200 hover:shadow-2xl transform hover:scale-105",
                        dragOver ? "border-blue-500 shadow-2xl scale-105" : "border-blue-200 hover:border-blue-400",
                        currentImage ? "border-blue-300" : ""
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {currentImage ? (
                        <img src={currentImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-blue-600">
                            <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm font-medium">Add Photo</span>
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="text-white text-center">
                            <svg className="h-8 w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs font-medium">Change Photo</span>
                        </div>
                    </div>

                    {uploading && <UploadSpinner />}
                </div>

                {/* Status indicator */}
                {currentImage && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
            />

            <div className="text-center">
                <p className="text-sm font-medium text-blue-900 mb-1">Profile Picture</p>
                <p className="text-xs text-blue-600">Click or drag to upload</p>
                <p className="text-xs text-blue-900/50 mt-1">PNG, JPG up to 5MB</p>
            </div>
        </div>
    );
};

// Types matching your API shape
interface AdminData {
    _id: string;
    role?: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    email: string;
    contactNumber?: string;
}

interface GetByIdResponse {
    success: boolean;
    data: AdminData & { password?: string };
}

const AdminProfile: React.FC<{ adminId?: string }> = ({ adminId }) => {
    const params = useParams();
    const storedAdmin = (() => {
        try {
            return JSON.parse(localStorage.getItem("adminData") || "null");
        } catch {
            return null;
        }
    })();
    const id = adminId || (params as any)?.id || storedAdmin?._id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        profilePicture: "",
        newPassword: "",
        confirmPassword: "",
    });

    const isPasswordValid = useMemo(() => {
        if (!form.newPassword && !form.confirmPassword) return true;
        return form.newPassword.length >= 6 && form.newPassword === form.confirmPassword;
    }, [form.newPassword, form.confirmPassword]);

    // Function to upload files to Supabase
    const uploadFilesToSupabase = async (file: File): Promise<string> => {
        try {
            // Generate a unique file name
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            // Upload file to Supabase storage
            const { data, error } = await supabase.storage.from("topics").upload(filePath, file);

            if (error) {
                console.error("Error uploading file:", error);
                throw new Error("Failed to upload file");
            }

            // Get public URL
            const {
                data: { publicUrl },
            } = supabase.storage.from("topics").getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw error;
        }
    };

    const handleImageUpload = async (file: File) => {
        try {
            setUploading(true);
            setError(null);

            // Validate file
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                throw new Error("File size must be less than 5MB");
            }

            if (!file.type.startsWith("image/")) {
                throw new Error("Please select an image file");
            }

            const uploadedUrl = await uploadFilesToSupabase(file);
            setForm((prev) => ({ ...prev, profilePicture: uploadedUrl }));
        } catch (error: any) {
            setError(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!id) {
                    setError("No admin ID provided in route, props, or local session.");
                    return;
                }
                const res = (await AdminService.getAdminById(id)) as GetByIdResponse;
                if (!mounted) return;
                const a = res?.data;
                setForm((prev) => ({
                    ...prev,
                    firstName: a?.firstName || "",
                    lastName: a?.lastName || "",
                    email: a?.email || "",
                    contactNumber: a?.contactNumber || "",
                    profilePicture: a?.profilePicture || "",
                }));
            } catch (e: any) {
                setError(typeof e === "string" ? e : e?.message || "Failed to load admin profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
        return () => {
            mounted = false;
        };
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!isPasswordValid) {
            setError("Passwords must match and be at least 6 characters.");
            return;
        }

        try {
            setSaving(true);
            const payload: any = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                contactNumber: form.contactNumber.trim(),
                profilePicture: form.profilePicture.trim(),
            };

            if (form.newPassword) {
                payload.password = form.newPassword;
            }

            const updater: any =
                (AdminService as any).updateAdminById
                    ? (AdminService as any).updateAdminById
                    : async (uid: string, data: any) => {
                        const res = await fetch(`http://13.61.185.238:4071/api/v1/admin_route/updateadmin/${uid}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                            },
                            body: JSON.stringify(data),
                        });
                        if (!res.ok) {
                            const msg = await res.text();
                            throw new Error(msg || "Failed to update admin");
                        }
                        return res.json();
                    };

            await updater(id, payload);
            setSuccess("Profile updated successfully! 🎉");
            setForm((f) => ({ ...f, newPassword: "", confirmPassword: "" }));

            // Update local storage if this is the current user
            if (storedAdmin?._id === id) {
                const updatedAdmin = { ...storedAdmin, ...payload };
                localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
            }
        } catch (e: any) {
            setError(typeof e === "string" ? e : e?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* Add custom CSS for shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                
                @keyframes shimmer-bg {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
            `}</style>
            
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="flex min-h-screen">
                    <Sidebar />

                    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <div className="mx-auto max-w-6xl space-y-8">
                            {/* Header */}
                            <div className="text-center">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-2">
                                    Admin Profile
                                </h1>
                                <p className="text-blue-900/70">Manage your account settings and preferences</p>
                            </div>

                            {/* Alerts */}
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 shadow-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {error}
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700 shadow-lg backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {success}
                                    </div>
                                </div>
                            )}

                            {(!id || loading) && (
                                <>
                                    {!id ? (
                                        <Card gradient>
                                            <p className="text-blue-900 text-center">No admin ID found in route, props, or local storage.</p>
                                        </Card>
                                    ) : (
                                        <ProfileFormSkeleton />
                                    )}
                                </>
                            )}

                            {!!id && !loading && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Profile Picture Card */}
                                    <Card
                                        className="lg:col-span-1"
                                        title="Profile Picture"
                                        subtitle="Your photo across the dashboard"
                                        gradient
                                    >
                                        <ProfilePictureUpload currentImage={form.profilePicture} onImageUpload={handleImageUpload} uploading={uploading} />
                                    </Card>

                                    {/* Details Form Card */}
                                    <Card
                                        className="lg:col-span-2"
                                        title="Personal Information"
                                        subtitle="Keep your details up to date"
                                        gradient
                                    >
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Name Fields */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <FieldLabel htmlFor="firstName" required>
                                                        First Name
                                                    </FieldLabel>
                                                    <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
                                                </div>
                                                <div>
                                                    <FieldLabel htmlFor="lastName" required>
                                                        Last Name
                                                    </FieldLabel>
                                                    <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
                                                </div>
                                            </div>

                                            {/* Contact Fields */}
                                            <div className="space-y-6">
                                                <div>
                                                    <FieldLabel htmlFor="email" required>
                                                        Email Address
                                                    </FieldLabel>
                                                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="name@example.com" />
                                                </div>
                                                <div>
                                                    <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
                                                    <Input id="contactNumber" name="contactNumber" value={form.contactNumber} onChange={handleChange} placeholder="e.g., +1 (555) 123-4567" />
                                                </div>
                                            </div>

                                            {/* Password Fields */}
                                            <div className="border-t border-blue-900/10 pt-6">
                                                <h3 className="text-lg font-semibold text-blue-900 mb-4">Change Password</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                                        <Input
                                                            id="newPassword"
                                                            name="newPassword"
                                                            type="password"
                                                            value={form.newPassword}
                                                            onChange={handleChange}
                                                            placeholder="Leave blank to keep current"
                                                            minLength={6}
                                                        />
                                                        <TextHelp>Minimum 6 characters required</TextHelp>
                                                    </div>
                                                    <div>
                                                        <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                                                        <Input
                                                            id="confirmPassword"
                                                            name="confirmPassword"
                                                            type="password"
                                                            value={form.confirmPassword}
                                                            onChange={handleChange}
                                                            minLength={form.newPassword ? 6 : undefined}
                                                            placeholder="Confirm your new password"
                                                        />
                                                        {!isPasswordValid && form.newPassword && (
                                                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                                Passwords do not match
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-blue-900/10">
                                                <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={saving || !isPasswordValid || uploading}>
                                                    {saving ? (
                                                        <>
                                                            <Spinner className="h-4 w-4" />
                                                            Saving Changes...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Save Changes
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default AdminProfile;