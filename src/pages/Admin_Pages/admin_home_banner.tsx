// src/pages/AdminHomeBanner.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  EyeOff,
  Eye,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import HomeBannerService from "@/services/Admin_Service/home_banner_services";
import { supabase } from "@/helper/SupabaseClient";

// -----------------------------
// Supabase Upload Helper
// -----------------------------
const uploadFilesToSupabase = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    const { error } = await supabase.storage.from("topics").upload(filePath, file);
    if (error) throw new Error("Failed to upload file");
    const {
      data: { publicUrl },
    } = supabase.storage.from("topics").getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// -----------------------------
// Types
// -----------------------------
type Level = "O Level" | "A Level" | "Others";
type HomeBanner = {
  _id?: string;
  id?: string;
  url_image: string;
  level: Level;
  showBanner?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// -----------------------------
// Shimmer Loading Card
// -----------------------------
const BannerCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
    </CardHeader>
    <CardContent>
      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
    </CardContent>
    <CardFooter className="flex justify-between">
      <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
      <div className="h-9 bg-gray-200 rounded animate-pulse w-24" />
      <div className="h-9 bg-gray-200 rounded animate-pulse w-10" />
    </CardFooter>
  </Card>
);

// -----------------------------
// Dialogs (Updated)
// -----------------------------
const AddBannerDialog = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (b: HomeBanner) => void;
}) => {
  const { toast } = useToast();
  const [level, setLevel] = useState<Level>("O Level");
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please choose an image to upload.",
      });
      return;
    }
    setSaving(true);
    try {
      const publicUrl = await uploadFilesToSupabase(file);
      const payload = { url_image: publicUrl, level, showBanner };
      const result = await HomeBannerService.createHomeBanner(payload);
      const created = (result as any)?.data as HomeBanner;
      onCreated(created);
      toast({ title: "Banner created", description: "Your home banner has been added." });
      onOpenChange(false);
      setLevel("O Level");
      setShowBanner(true);
      setFile(null);
      setPreview(null);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to create banner",
        description: e?.message || "Please check your inputs and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden">
        {/* Hero Preview Background */}
        <div className="relative h-48 w-full">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url('${preview ||
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                }')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <h2 className="text-xl font-semibold">Add Home Banner</h2>
            <p className="text-sm opacity-90">Upload an image, choose the level, and set visibility.</p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 pt-4 pb-2 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File */}
            <div className="space-y-2">
              <Label htmlFor="banner_file">Banner Image</Label>
              <Input id="banner_file" type="file" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="mt-2 rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                >
                  <option>O Level</option>
                  <option>A Level</option>
                  <option>Others</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="showBanner"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={showBanner}
                  onChange={(e) => setShowBanner(e.target.checked)}
                />
                <Label htmlFor="showBanner">Show banner</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditBannerDialog = ({
  open,
  onOpenChange,
  banner,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  banner: HomeBanner | null;
  onUpdated: (b: HomeBanner) => void;
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState<{ url_image: string; level: Level; showBanner: boolean }>({
    url_image: "",
    level: "O Level",
    showBanner: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setForm({
        url_image: banner.url_image || "",
        level: (banner.level as Level) || "O Level",
        showBanner: banner.showBanner ?? true,
      });
      setPreview(banner.url_image || null);
      setFile(null);
    }
  }, [banner]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : form.url_image || null);
  };

  const handleSubmit = async () => {
    if (!banner) return;
    const id = (banner._id as string) || (banner.id as string);
    if (!id) return;

    setSaving(true);
    try {
      let url = form.url_image;
      if (file) url = await uploadFilesToSupabase(file);
      const payload = { url_image: url, level: form.level, showBanner: form.showBanner };
      const result = await HomeBannerService.updateHomeBanner(id, payload);
      const updated = (result as any)?.data as HomeBanner;
      onUpdated(updated);
      toast({ title: "Banner updated", description: "Changes have been saved." });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to update banner",
        description: e?.message || "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden">
        {/* Hero Preview Background */}
        <div className="relative h-48 w-full">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url('${preview ||
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                }')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <h2 className="text-xl font-semibold">Edit Home Banner</h2>
            <p className="text-sm opacity-90">Replace image (optional), update level and visibility.</p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 pt-4 pb-2 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Replace Image */}
            <div className="space-y-2">
              <Label htmlFor="banner_file_edit">Replace Image (optional)</Label>
              <Input id="banner_file_edit" type="file" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="mt-2 rounded-md overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level_edit">Level</Label>
                <select
                  id="level_edit"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Level }))}
                >
                  <option>O Level</option>
                  <option>A Level</option>
                  <option>Others</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="showBanner_edit"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.showBanner}
                  onChange={(e) => setForm((f) => ({ ...f, showBanner: e.target.checked }))}
                />
                <Label htmlFor="showBanner_edit">Show banner</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DeleteBannerDialog = ({
  open,
  onOpenChange,
  banner,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  banner: HomeBanner | null;
  onDeleted: (id: string) => void;
}) => {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!banner) return;
    const id = (banner._id as string) || (banner.id as string);
    if (!id) return;

    setDeleting(true);
    try {
      await HomeBannerService.deleteHomeBanner(id);
      onDeleted(id);
      toast({ title: "Banner deleted" });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete banner",
        description: e?.message || "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const preview = banner?.url_image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0 overflow-hidden">
        {/* Hero Preview Background */}
        <div className="relative h-48 w-full">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{
              backgroundImage: `url('${preview ||
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
                }')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-300" />
            <div>
              <h2 className="text-xl font-semibold">Delete Home Banner</h2>
              <p className="text-sm opacity-90">
                This action cannot be undone. Review the details before confirming.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 pt-5 pb-3 max-h-[80vh] overflow-y-auto">
          {/* Full Preview Card */}
          <div className="rounded-md border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                preview ||
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
              }
              alt="Banner preview"
              className="w-full h-56 object-cover"
            />
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">

              <div>
                <div className="text-muted-foreground">Level</div>
                <div>{banner?.level || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Visibility</div>
                <div className="flex items-center gap-2">
                  {banner?.showBanner ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <span>Hidden</span>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>


          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------
// Banner Card
// -----------------------------
const BannerCard = ({
  banner,
  onEdit,
  onDelete,
  onToggleShow,
}: {
  banner: HomeBanner;
  onEdit: () => void;
  onDelete: () => void;
  onToggleShow: (next: boolean) => void;
}) => {
  const visible = banner.showBanner !== false;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            banner.url_image ||
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
          }
          alt={banner.level}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Badge className="absolute top-3 left-3 bg-blue-900/90 hover:bg-blue-900 backdrop-blur-sm">
          {banner.level}
        </Badge>

        <Badge
          className={`absolute top-3 right-3 ${visible ? "bg-green-600" : "bg-gray-500"} text-white`}
          title={visible ? "Visible" : "Hidden"}
        >
          {visible ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Visible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" /> Hidden
            </span>
          )}
        </Badge>
      </div>

      <CardFooter className="flex justify-between gap-2 pt-2">
        <Button
          variant={visible ? "outline" : "secondary"}
          size="sm"
          onClick={() => onToggleShow(!visible)}
          className="flex-1"
          title={visible ? "Hide banner" : "Show banner"}
        >
          {visible ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          {visible ? "Hide" : "Show"}
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// -----------------------------
// Main Screen (unchanged except dialogs are used)
// -----------------------------
const AdminHomeBanner: React.FC = () => {
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);

  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [current, setCurrent] = useState<HomeBanner | null>(null);

  // Sidebar responsive handling
  useEffect(() => {
    const check = () => {
      const big = window.innerWidth >= 768;
      setIsLargeScreen(big);
      setSidebarOpen(big);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Data fetching
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const result = await HomeBannerService.getAllHomeBanners();
      const list = ((result as any)?.data || []) as HomeBanner[];
      setBanners(list);
      setError(null);
    } catch (e: any) {
      setError("Failed to load banners. Please try again.");
      toast({
        variant: "destructive",
        title: "Couldn't load banners",
        description: e?.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tabs
  const levels: string[] = useMemo(() => {
    const set = new Set<string>();
    banners.forEach((b) => b.level && set.add(b.level));
    ["O Level", "A Level", "Others"].forEach((lvl) => set.add(lvl));
    return ["all", ...Array.from(set)];
  }, [banners]);

  // Filtering
  const filtered = useMemo(() => {
    return banners.filter((b) => {
      const matchesTab = activeTab === "all" ? true : b.level === (activeTab as Level);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.url_image?.toLowerCase().includes(q) ||
        b.level?.toLowerCase().includes(q) ||
        ((b._id || b.id)?.toString().toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [banners, activeTab, search]);

  // CRUD helpers
  const handleCreated = (newBanner: HomeBanner) => setBanners((prev) => [...prev, newBanner]);
  const handleUpdated = (updated: HomeBanner) =>
    setBanners((prev) =>
      prev.map((b) => {
        const id = (b._id || b.id) as string;
        const uid = (updated._id || updated.id) as string;
        return id === uid ? { ...b, ...updated } : b;
      })
    );
  const handleDeleted = (id: string) =>
    setBanners((prev) => prev.filter((b) => ((b._id || b.id) as string) !== id));

  const handleToggleShow = async (banner: HomeBanner, next: boolean) => {
    const id = (banner._id || banner.id) as string;
    if (!id) return;

    setBanners((prev) =>
      prev.map((b) => (((b._id || b.id) as string) === id ? { ...b, showBanner: next } : b))
    );

    try {
      await HomeBannerService.setShowBanner(id, next);
      toast({
        title: `Banner ${next ? "shown" : "hidden"}`,
        description: "Visibility updated successfully.",
        duration: 1000, // show for 1 second
      });

    } catch (e: any) {
      setBanners((prev) =>
        prev.map((b) => (((b._id || b.id) as string) === id ? { ...b, showBanner: !next } : b))
      );
      toast({
        variant: "destructive",
        title: "Failed to update visibility",
        description: e?.message || "Please try again.",
        duration: 1000, // show for 
      });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
        onClick={toggleSidebar}
      >
        {sidebarOpen && !isLargeScreen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          } transition-all duration-300 ease-in-out fixed md:relative z-40 md:z-auto w-64`}
      >
        <Sidebar />
      </div>

      {sidebarOpen && !isLargeScreen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main */}
      <div className="flex-1 w-full">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-10 md:mt-0">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-1">HOME BANNERS</h1>
              <p className="text-sm text-muted-foreground">
                Manage homepage banners by level, visibility, and image URLs.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">


              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800 w-full sm:w-auto shadow-md">
                    <Plus className="h-4 w-4 mr-2" /> Add Banner
                  </Button>
                </DialogTrigger>
                <AddBannerDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 overflow-x-auto pb-2">
            <ul className="flex space-x-6 border-b border-gray-200 whitespace-nowrap min-w-max md:min-w-0">
              {levels.map((id) => (
                <li key={id}>
                  <button
                    className={`py-3 px-1 transition-all duration-200 ${activeTab === id
                      ? "text-blue-900 font-semibold border-b-2 border-blue-900"
                      : "text-gray-600 hover:text-blue-700"
                      }`}
                    onClick={() => setActiveTab(id)}
                  >
                    {id === "all" ? "All" : id}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BannerCardShimmer key={i} />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg my-4 shadow-sm">
              <p>{error}</p>
              <Button variant="outline" className="mt-2" onClick={fetchBanners}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No banners found. Try a different filter or add a new banner.
              </p>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                    <Plus className="h-4 w-4 mr-2" /> Add New Banner
                  </Button>
                </DialogTrigger>
                <AddBannerDialog open={addOpen} onOpenChange={setAddOpen} onCreated={handleCreated} />
              </Dialog>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((banner) => (
                <BannerCard
                  key={(banner._id || banner.id) as string}
                  banner={banner}
                  onEdit={() => {
                    setCurrent(banner);
                    setEditOpen(true);
                  }}
                  onDelete={() => {
                    setCurrent(banner);
                    setDeleteOpen(true);
                  }}
                  onToggleShow={(next) => handleToggleShow(banner, next)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditBannerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        banner={current}
        onUpdated={handleUpdated}
      />

      {/* Delete Dialog */}
      <DeleteBannerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        banner={current}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

export default AdminHomeBanner;
