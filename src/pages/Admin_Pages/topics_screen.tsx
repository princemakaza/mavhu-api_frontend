// src/pages/TopicsScreen.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Plus,
  Bell,
  BookOpen,
  Menu,
  X,
  Search,
  LayoutGrid,
  List as ListIcon,
  XCircle,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useToast } from "@/components/ui/use-toast";

// Dialogs
import AddTopicDialog from "@/components/Dialogs/Add_topic";
import ViewTopicDialog from "@/components/Dialogs/View_topic";
import EditTopicDialog from "@/components/Dialogs/Edit_topic";
import DeleteTopicDialog from "@/components/Dialogs/Delet_topic";
import ViewTopicContentDialog from "@/components/Dialogs/View_Content";

// Services
import TopicInSubjectService from "@/services/Admin_Service/Topic_InSubject_service";
import SubjectService from "@/services/Admin_Service/Subject_service";

// Types
import type Topic from "@/components/Interfaces/Topic_Interface";
import type Subject from "@/components/Interfaces/Subject_Interface";

const TopicCardShimmer = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
    </CardHeader>
    <CardFooter className="flex justify-between gap-2 flex-wrap">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
      <div className="h-8 bg-gray-200 rounded animate-pulse w-8" />
    </CardFooter>
  </Card>
);

// ---- Utilities ----
const getId = (t: any): string =>
  ((t && (t._id || t.id)) ?? "").toString();

const getTitle = (t: any): string =>
  (t?.title ?? t?.name ?? t?.topicName ?? t?.TopicName ?? "").toString();

const getCreatedAt = (t: any): number => {
  const raw = t?.createdAt ?? t?.created_at ?? t?.createdOn ?? t?.timestamp;
  const dt = raw ? new Date(raw).getTime() : 0;
  return Number.isFinite(dt) ? dt : 0;
};

const formatDate = (ms: number) => {
  if (!ms) return "";
  try {
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
};

// ---- List view card (row) ----
function TopicRowCard({
  topic,
  index,
  onView,
  onEdit,
  onTrash,
  onViewContent,
  onToggleVisibility,
  toggling,
  trashing,
}: {
  topic: Topic & { showTopic?: boolean; isDeleted?: boolean };
  index: number;
  onView: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onTrash: (id: string, title?: string) => void;
  onViewContent: (t: Topic) => void;
  onToggleVisibility: (t: Topic & { showTopic?: boolean }) => void;
  toggling?: boolean;
  trashing?: boolean;
}) {
  const title = getTitle(topic);
  const created = getCreatedAt(topic);
  const description = (topic as any)?.description || "";
  const tags: string[] = Array.isArray((topic as any)?.tags)
    ? ((topic as any).tags as string[])
    : [];
  const id = getId(topic);
  const visible = (topic as any)?.showTopic !== false;

  return (
    <Card className="group w-full border border-gray-200/80 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        {/* Left: index + title + meta */}
        <div className="flex items-start gap-4 w-full">
          <div className="shrink-0 h-10 w-10 rounded-xl bg-blue-50 text-blue-700 grid place-items-center font-semibold">
            {(index + 1).toString().padStart(2, "0")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                {title}
              </h3>
              {created ? (
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                  {formatDate(created)}
                </Badge>
              ) : null}
              <Badge
                variant={visible ? "default" : "secondary"}
                className={`${visible
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {visible ? "Visible" : "Hidden"}
              </Badge>
            </div>
            {description ? (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {description}
              </p>
            ) : null}
            {tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 5).map((t, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    {t}
                  </Badge>
                ))}
                {tags.length > 5 && (
                  <Badge variant="outline" className="rounded-full">
                    +{tags.length - 5}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl" onClick={() => onView(topic)}>
            <Eye className="h-4 w-4 mr-2" /> View
          </Button>
          {/* <Button variant="ghost" className="rounded-xl" onClick={() => onViewContent(topic)}>
            <FileText className="h-4 w-4 mr-2" /> Content
          </Button> */}
          <Button variant="ghost" className="rounded-xl" onClick={() => onEdit(topic)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button
            variant={visible ? "secondary" : "default"}
            className="rounded-xl"
            onClick={() => onToggleVisibility(topic as any)}
            disabled={toggling}
            title={visible ? "Hide topic" : "Show topic"}
          >
            {visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {visible ? "Hide" : "Show"}
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={() => onTrash(id, title)}
            disabled={trashing}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Move to Trash
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ---- Grid view card ----
function GridTopicCard({
  topic,
  index,
  onView,
  onEdit,
  onTrash,
  onToggleVisibility,
  toggling,
  trashing,
}: {
  topic: Topic & { showTopic?: boolean; isDeleted?: boolean };
  index: number;
  onView: (t: Topic) => void;
  onEdit: (t: Topic) => void;
  onTrash: (id: string, title?: string) => void;
  onToggleVisibility: (t: Topic & { showTopic?: boolean }) => void;
  toggling?: boolean;
  trashing?: boolean;
}) {
  const title = getTitle(topic);
  const created = getCreatedAt(topic);
  const id = getId(topic);
  const visible = (topic as any)?.showTopic !== false;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {created ? formatDate(created) : ""}
          <span>•</span>
          <span className={`text-xs ${visible ? "text-emerald-600" : "text-slate-600"}`}>
            {visible ? "Visible" : "Hidden"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => onView(topic)}>
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
        <Button variant="ghost" className="rounded-xl" onClick={() => onEdit(topic)}>
          <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button
          variant={visible ? "secondary" : "default"}
          className="rounded-xl"
          onClick={() => onToggleVisibility(topic as any)}
          disabled={toggling}
          title={visible ? "Hide topic" : "Show topic"}
        >
          {visible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {visible ? "Hide" : "Show"}
        </Button>
        <Button
          variant="destructive"
          className="rounded-xl ml-auto"
          onClick={() => onTrash(id, title)}
          disabled={trashing}
        >
          <Trash2 className="h-4 w-4 mr-2" /> 
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TopicsScreen() {
  const { subjectId = "" } = useParams<{ subjectId: string }>();
  const { toast } = useToast();

  const [subject, setSubject] = useState<(Subject & { topicRequests?: number }) | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSubject, setLoadingSubject] = useState(true);

  // Sidebar UI
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const toggleSidebar = () => setSidebarOpen((v) => !v);

  // Dialogs & UI state
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [viewingTopic, setViewingTopic] = useState<Topic | null>(null);
  const [viewTopicDialogOpen, setViewTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicDialogOpen, setEditTopicDialogOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [deletingTopicTitle, setDeletingTopicTitle] = useState("");
  const [deleteTopicDialogOpen, setDeleteTopicDialogOpen] = useState(false);
  const [viewingContentTopic, setViewingContentTopic] = useState<Topic | null>(null);
  const [viewContentDialogOpen, setViewContentDialogOpen] = useState(false);

  // New: search, sort, and view state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"alpha-asc" | "alpha-desc" | "newest" | "oldest">("alpha-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Async action flags (per action batch—not per item)
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [movingToTrash, setMovingToTrash] = useState(false);

  const topicCount = useMemo(() => topics.length, [topics]);

  // Search input ref & keyboard shortcut
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !((e.target as HTMLElement)?.tagName === "INPUT")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const large = window.innerWidth >= 768;
      setIsLargeScreen(large);
      setSidebarOpen(large);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch subject
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSubject(true);
        const apiHasGetById = (SubjectService as any).getSubjectById;
        if (!apiHasGetById) return;
        const res = await (SubjectService as any).getSubjectById(subjectId);
        const data = (res as any)?.data ?? null;
        if (active) setSubject(data);
      } catch {
        // ignore
      } finally {
        if (active) setLoadingSubject(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [subjectId]);

  // Fetch topics (and filter out isDeleted)
  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const res = await TopicInSubjectService.getTopicsBySubjectId(subjectId);
      const list: any[] = (res as any)?.data || [];
      // Filter out trashed topics (isDeleted === true)
      const activeOnly = list.filter((t) => (t?.isDeleted ?? false) === false);
      setTopics(activeOnly);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
      toast({
        variant: "destructive",
        title: "Couldn't load topics",
        description: "Please retry in a moment.",
        duration: 2000,
      });
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    if (subjectId) loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  // Handlers
  const onAddTopic = async () => {
    await loadTopics();
  };
  const onTopicUpdated = async () => {
    await loadTopics();
  };

  const onViewTopic = (t: Topic) => {
    setViewingTopic(t);
    setViewTopicDialogOpen(true);
  };
  const onEditTopic = (t: Topic) => {
    setEditingTopic(t);
    setEditTopicDialogOpen(true);
  };
  const onDeleteTopic = (id: string, title?: string) => {
    // Keep the delete confirmation dialog flow you already have
    setDeletingTopicId(id);
    setDeletingTopicTitle(title || "this topic");
    setDeleteTopicDialogOpen(true);
  };
  const onViewContent = (t: Topic) => {
    setViewingContentTopic(t);
    setViewContentDialogOpen(true);
  };

  // New: Soft delete directly (Move to Trash)
  const moveTopicToTrash = async (id: string, title?: string) => {
    try {
      setMovingToTrash(true);
      await TopicInSubjectService.softDeleteTopic(id);
      toast({
        title: "Moved to trash",
        description: `${title || "Topic"} is now in trash.`,
        duration: 1000, // show for 1 second
      });

      await loadTopics();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to move to trash",
        description: e?.message || "Please try again.",
        duration: 1000, // show for 1 second
      });

    } finally {
      setMovingToTrash(false);
    }
  };

  // New: Toggle visibility
  const toggleVisibility = async (topic: any) => {
    const id = getId(topic);
    const current = (topic?.showTopic ?? true) as boolean;
    try {
      setTogglingVisibility(true);
      await TopicInSubjectService.setTopicVisibility(id, !current);
      toast({
        title: !current ? "Topic is now visible" : "Topic hidden",
        description: `"${getTitle(topic)}" has been ${!current ? "shown" : "hidden"}.`,
        duration: 1000, // show for 1 second
      });

      await loadTopics();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Failed to update visibility",
        description: e?.message || "Please try again.",
        duration: 1000, // show for 1 second
      });

    } finally {
      setTogglingVisibility(false);
    }
  };

  // Derived: filter & sort topics
  const [queryInternal, setQueryInternal] = useState("");
  useEffect(() => setQueryInternal(query), [query]);

  const filteredTopics = useMemo(() => {
    const q = queryInternal.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t: any) => {
      const title = getTitle(t).toLowerCase();
      const desc = t?.description?.toLowerCase?.() ?? "";
      const tags = Array.isArray(t?.tags) ? (t.tags as string[]).join(" ").toLowerCase() : "";
      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  }, [topics, queryInternal]);

  const sortedTopics = useMemo(() => {
    const list = [...filteredTopics];
    switch (sort) {
      case "alpha-desc":
        return list.sort((a, b) => getTitle(b).localeCompare(getTitle(a)));
      case "newest":
        return list.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
      case "oldest":
        return list.sort((a, b) => getCreatedAt(a) - getCreatedAt(b));
      case "alpha-asc":
      default:
        return list.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));
    }
  }, [filteredTopics, sort]);

  const hasSearch = query.trim().length > 0;
  const subjectTitle =
    (subject as any)?.subjectName ||
    (subject as any)?.title ||
    (subject as any)?.name ||
    (loadingSubject ? "Loading subject…" : "Subject");

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg hover:bg-blue-800 transition-colors"
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

      {sidebarOpen && !isLargeScreen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Main */}
      <div className="flex w-full">
        <div className="mx-auto max-w-9xl px-4 py-6 md:py-8 w-full">
          {/* Header */}
          <div className="flex items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Link to="/courses">
                <Button variant="ghost" className="p-2 hover:bg-blue-50 rounded-lg">
                  <ChevronLeft size={20} />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-blue-900">{subjectTitle}</h1>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {(subject as any)?.Level && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                      {(subject as any).Level}
                    </Badge>
                  )}

                  {(subject as any)?.topicRequests > 0 && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      <Bell className="h-3 w-3 mr-1" />
                      {(subject as any).topicRequests} Pending
                    </Badge>
                  )}

                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {topicCount} Topic{topicCount === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions: Add Topic */}
            <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                  <Plus className="h-4 w-4 mr-2" /> Add Topic
                </Button>
              </DialogTrigger>
              <AddTopicDialog
                open={topicDialogOpen}
                onOpenChange={setTopicDialogOpen}
                subjectId={subjectId}
                onTopicAdded={onAddTopic}
              />
            </Dialog>
          </div>

          {/* Search + Sort + View controls */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
            {/* Search input */}
            <div className="relative w-full md:max-w-2xl">
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics by title, description, or tag…  (press / to focus)"
                className="pl-9 h-11 rounded-2xl bg-white/80 border-gray-200 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-label="Search topics"
              />
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  aria-label="Clear search"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Right-side controls */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                <SelectTrigger className="w-[200px] rounded-2xl">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alpha-asc">A → Z (default)</SelectItem>
                  <SelectItem value="alpha-desc">Z → A</SelectItem>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="inline-flex rounded-2xl overflow-hidden border bg-white shadow-sm">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  className={`flex items-center gap-1 px-3 ${viewMode === "grid" ? "bg-blue-900 text-white" : ""
                    }`}
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  className={`flex items-center gap-1 px-3 ${viewMode === "list" ? "bg-blue-900 text-white" : ""
                    }`}
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view (top to bottom)"
                >
                  <ListIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Topic list */}
          {loadingTopics ? (
            <div className="mx-auto max-w-9xl px-4 py-6 md:py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <TopicCardShimmer key={i} />
                ))}
              </div>
            </div>
          ) : sortedTopics.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {sortedTopics.map((topic: any, index) => (
                  <GridTopicCard
                    key={getId(topic) || index}
                    topic={topic}
                    index={index}
                    onView={onViewTopic}
                    onEdit={onEditTopic}
                    onTrash={(id, title) => moveTopicToTrash(id, title)}
                    onToggleVisibility={toggleVisibility}
                    toggling={togglingVisibility}
                    trashing={movingToTrash}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedTopics.map((topic: any, index) => (
                  <TopicRowCard
                    key={getId(topic) || index}
                    topic={topic}
                    index={index}
                    onView={(t) => onViewTopic(t)}
                    onEdit={(t) => onEditTopic(t)}
                    onTrash={(id, title) => moveTopicToTrash(id, title)}
                    onViewContent={(t) => onViewContent(t)}
                    onToggleVisibility={toggleVisibility}
                    toggling={togglingVisibility}
                    trashing={movingToTrash}
                  />
                ))}
              </div>
            )
          ) : hasSearch ? (
            <Card className="bg-white border-dashed">
              <CardHeader>
                <CardTitle>No matches</CardTitle>
                <CardDescription>
                  We couldn't find any topics for "{query}". Try a different keyword or
                  clear the search.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="bg-white border-dashed">
              <CardHeader>
                <CardTitle>No topics yet</CardTitle>
                <CardDescription>
                  Use the "Add Topic" button to create the first topic for this subject.
                </CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-900 hover:bg-blue-800 shadow-md">
                      <Plus className="h-4 w-4 mr-2" /> Add Topic
                    </Button>
                  </DialogTrigger>
                  <AddTopicDialog
                    open={topicDialogOpen}
                    onOpenChange={setTopicDialogOpen}
                    subjectId={subjectId}
                    onTopicAdded={onAddTopic}
                  />
                </Dialog>
              </CardFooter>
            </Card>
          )}

          {/* Dialogs */}
          <Dialog open={viewTopicDialogOpen} onOpenChange={setViewTopicDialogOpen}>
            <ViewTopicDialog
              open={viewTopicDialogOpen}
              onOpenChange={setViewTopicDialogOpen}
              topic={viewingTopic}
            />
          </Dialog>

          <Dialog open={editTopicDialogOpen} onOpenChange={setEditTopicDialogOpen}>
            <EditTopicDialog
              open={editTopicDialogOpen}
              onOpenChange={setEditTopicDialogOpen}
              topic={editingTopic}
              onTopicUpdated={onTopicUpdated}
            />
          </Dialog>

          {/* NOTE:
              The existing DeleteTopicDialog likely calls a hard delete.
              Since the requirement is to "move to trash", we now perform soft delete
              directly from the buttons above. You can keep this dialog for other flows,
              but it’s no longer used by the "Move to Trash" buttons. */}
          <Dialog open={deleteTopicDialogOpen} onOpenChange={setDeleteTopicDialogOpen}>
            <DeleteTopicDialog
              open={deleteTopicDialogOpen}
              onOpenChange={setDeleteTopicDialogOpen}
              topicId={deletingTopicId}
              topicTitle={deletingTopicTitle}
              onTopicDeleted={async () => {
                await loadTopics();
              }}
            />
          </Dialog>

          <Dialog open={viewContentDialogOpen} onOpenChange={setViewContentDialogOpen}>
            <ViewTopicContentDialog
              open={viewContentDialogOpen}
              onOpenChange={setViewContentDialogOpen}
              topic={viewingContentTopic}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
}
