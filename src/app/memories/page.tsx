"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Database } from "@/lib/types";

type Memory = {
  id: string;
  text: string;
  tool: string | null;
  name: string | null;
  model: string | null;
  created_at: string;
  variables?: string[] | null;
  variable_defaults?: Record<string, string> | null;
};

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "most-used" | "recently-used";
type ViewMode = "grid" | "list";

// Extended metadata stored in localStorage
type MemoryMetadata = {
  tags: string[];
  folder: string | null;
  copyCount: number;
  lastUsed: string | null;
  versions: Array<{ text: string; name: string | null; timestamp: string }>;
};

type CustomFolder = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export default function MemoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  
  // Edit modal state
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editName, setEditName] = useState("");
  const [editText, setEditText] = useState("");
  const [editTool, setEditTool] = useState("");
  const [saving, setSaving] = useState(false);
  
  // New features state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [newTool, setNewTool] = useState("");
  const [creating, setCreating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // High-impact features state
  const [metadata, setMetadata] = useState<Record<string, MemoryMetadata>>({});
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [variableMemory, setVariableMemory] = useState<Memory | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CustomFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionMemory, setVersionMemory] = useState<Memory | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("promptr-favorites");
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch {}
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("promptr-favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  // Load metadata, folders, and tags from localStorage
  useEffect(() => {
    const storedMetadata = localStorage.getItem("promptr-metadata");
    if (storedMetadata) {
      try {
        setMetadata(JSON.parse(storedMetadata));
      } catch {}
    }

    const storedFolders = localStorage.getItem("promptr-folders");
    if (storedFolders) {
      try {
        setCustomFolders(JSON.parse(storedFolders));
      } catch {}
    }

    // Extract all tags from metadata
    const stored = localStorage.getItem("promptr-metadata");
    if (stored) {
      try {
        const meta: Record<string, MemoryMetadata> = JSON.parse(stored);
        const tags = new Set<string>();
        Object.values(meta).forEach((m) => {
          m.tags?.forEach((tag) => tags.add(tag));
        });
        setAllTags(Array.from(tags).sort());
      } catch {}
    }
  }, []);

  // Save metadata to localStorage
  useEffect(() => {
    localStorage.setItem("promptr-metadata", JSON.stringify(metadata));
    // Update tags list
    const tags = new Set<string>();
    Object.values(metadata).forEach((m) => {
      m.tags?.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [metadata]);

  // Save folders to localStorage
  useEffect(() => {
    localStorage.setItem("promptr-folders", JSON.stringify(customFolders));
  }, [customFolders]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to close modals
      if (e.key === "Escape") {
        if (editingMemory) closeEditModal();
        if (showCreateModal) closeCreateModal();
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedIds(new Set());
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingMemory, showCreateModal, isSelectionMode]);

  // Close any open card menus on document click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // If click is inside any menu or menu button, ignore
      if (
        target.closest("[data-menu-button='true']") ||
        target.closest("[data-menu='true']")
      ) {
        return;
      }
      setOpenMenuId(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  useEffect(() => {
    const checkAndLoad = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      if (error || !sessionData.session) {
        router.replace("/login");
        return;
      }
      const userId = sessionData.session.user.id;
      setUserId(userId);
      await fetchMemories(userId);
      setLoading(false);
    };

    checkAndLoad();
  }, [router]);

  const fetchMemories = async (userId: string) => {
    setErrorMsg(null);
    try {
      // Try to select all fields including variables
      // Note: we intentionally widen types here because we have a runtime fallback
      // when columns are missing (different SELECT lists produce different TS types).
      let data: any[] | null = null;
      let error: any = null;

      ({ data, error } = await supabase
        .from("memories")
        .select("id,text,tool,name,model,variables,variable_defaults,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }));
      
      // If some columns don't exist, retry without them (but always include name!)
      if (error && (error.message?.includes("name") || error.message?.includes("model") || error.message?.includes("variables") || error.message?.includes("variable_defaults"))) {
        console.warn("Some columns missing, retrying with essential fields:", error.message);
        // Always include name, tool, and created_at even in fallback
        const retry = await supabase
          .from("memories")
          .select("id,text,tool,name,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        data = retry.data;
        error = retry.error;
        
        // If name column also doesn't exist, try without it
        if (retry.error && retry.error.message?.includes("name")) {
          console.warn("Name column also missing, using minimal fields");
          const minimalRetry = await supabase
            .from("memories")
            .select("id,text,tool,created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          data = minimalRetry.data;
          error = minimalRetry.error;
        }
      }
      
      if (error) {
        console.error("Error fetching memories:", error);
        setErrorMsg(error.message || "Failed to fetch memories");
        return;
      }
      
      const normalizedData = (data ?? []).map((item: any) => {
        // Handle name - preserve it if it exists and has content
        let nameValue = item.name;
        if (nameValue != null && typeof nameValue === 'string') {
          nameValue = nameValue.trim();
          nameValue = nameValue.length > 0 ? nameValue : null;
        } else {
          nameValue = null;
        }
        
        // Handle model
        let modelValue = item.model;
        if (modelValue != null && typeof modelValue === 'string') {
          modelValue = modelValue.trim();
          modelValue = modelValue.length > 0 ? modelValue : null;
        } else {
          modelValue = null;
        }
        
        const normalized = {
          ...item,
          name: nameValue,
          model: modelValue,
          variables: item.variables || null,
          variable_defaults: item.variable_defaults || null,
        };
        
        // Log if name exists for debugging
        if (normalized.name) {
          console.log(`[Fetch] Memory ${normalized.id} has name: "${normalized.name}"`);
        }
        
        return normalized;
      });
      
      console.log(`[Fetch] Fetched ${normalizedData.length} memories`);
      const withNames = normalizedData.filter(m => m.name).length;
      console.log(`[Fetch] ${withNames} memories have names`);
      setMemories(normalizedData);
    } catch (err) {
      console.error("Exception in fetchMemories:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to fetch memories");
    }
  };

  // Extract variables from text ({{variable}} syntax)
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(2, -2)))];
  };

  const handleCopy = async (memory: Memory, filledText?: string) => {
    const textToCopy = filledText || memory.text;
    const variables = extractVariables(memory.text);
    
    // If variables exist and not already filled, show modal
    if (variables.length > 0 && !filledText) {
      setVariableMemory(memory);
      setVariableValues({});
      setShowVariableModal(true);
      return;
    }

    setCopyingId(memory.id);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      
      // Update analytics
      setMetadata((prev) => {
        const current = prev[memory.id] || { tags: [], folder: null, copyCount: 0, lastUsed: null, versions: [] };
        return {
          ...prev,
          [memory.id]: {
            ...current,
            copyCount: (current.copyCount || 0) + 1,
            lastUsed: new Date().toISOString(),
          },
        };
      });
      
      showSuccess("Copied to clipboard!");
    } finally {
      setTimeout(() => setCopyingId(null), 1000);
    }
  };

  const handleVariableFill = () => {
    if (!variableMemory) return;
    
    let filledText = variableMemory.text;
    Object.entries(variableValues).forEach(([key, value]) => {
      filledText = filledText.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    });
    
    handleCopy(variableMemory, filledText);
    setShowVariableModal(false);
    setVariableMemory(null);
    setVariableValues({});
  };

  const handleDelete = async (memory: Memory) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    
    setDeletingId(memory.id);
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", memory.id)
      .eq("user_id", currentUserId ?? "");
    if (error) {
      setErrorMsg(error.message);
    } else if (currentUserId) {
      await fetchMemories(currentUserId);
      showSuccess("Prompt deleted");
    }
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected prompts?`)) return;

    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    const { error } = await supabase
      .from("memories")
      .delete()
      .in("id", [...selectedIds])
      .eq("user_id", currentUserId ?? "");

    if (error) {
      setErrorMsg(error.message);
    } else if (currentUserId) {
      await fetchMemories(currentUserId);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      showSuccess(`Deleted ${selectedIds.size} prompts`);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const openEditModal = (memory: Memory) => {
    console.log("[Edit] Opening edit modal for memory:", memory.id);
    console.log("[Edit] Memory object:", memory);
    console.log("[Edit] Memory name:", memory.name);
    setEditingMemory(memory);
    // Use the actual name from the memory object, not the generated title
    const nameToShow = memory.name != null && typeof memory.name === 'string' && memory.name.trim().length > 0 
      ? memory.name.trim() 
      : "";
    console.log("[Edit] Setting editName to:", nameToShow);
    setEditName(nameToShow);
    setEditText(memory.text);
    setEditTool(memory.tool || "");
  };


  const closeEditModal = () => {
    setEditingMemory(null);
    setEditName("");
    setEditText("");
    setEditTool("");
  };

  const handleSaveEdit = async () => {
    if (!editingMemory) return;
    setSaving(true);
    setErrorMsg(null);

    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    if (!currentUserId) {
      setErrorMsg("You must be logged in to save changes");
      setSaving(false);
      return;
    }

    // Prepare the name - only set if it has actual content
    const nameToSave = editName.trim();
    const finalName = nameToSave.length > 0 ? nameToSave : null;

    console.log("[Edit] Saving memory:", editingMemory.id);
    console.log("[Edit] New name:", finalName);
    console.log("[Edit] New text length:", editText.length);

    // Save current version to history before updating
    setMetadata((prev) => {
      const current = prev[editingMemory.id] || { tags: [], folder: null, copyCount: 0, lastUsed: null, versions: [] };
      const newVersions = [
        { text: editingMemory.text, name: editingMemory.name, timestamp: new Date().toISOString() },
        ...current.versions,
      ].slice(0, 10); // Keep last 10 versions
      
      return {
        ...prev,
        [editingMemory.id]: {
          ...current,
          versions: newVersions,
        },
      };
    });

    const updateData = { 
      name: finalName, 
      text: editText.trim(),
      tool: editTool.trim() || null
    };
    
    console.log("[Edit] Update data:", updateData);
    console.log("[Edit] Memory ID:", editingMemory.id);
    console.log("[Edit] User ID:", currentUserId);

    const { data, error } = await supabase
      .from("memories")
      .update(updateData as Database["public"]["Tables"]["memories"]["Update"])
      .eq("id", editingMemory.id)
      .eq("user_id", currentUserId)
      .select();

    if (error) {
      console.error("[Edit] Error saving:", error);
      console.error("[Edit] Error details:", JSON.stringify(error, null, 2));
      setErrorMsg(error.message || "Failed to save changes");
      setSaving(false);
      return;
    }

    if (!data || data.length === 0) {
      console.error("[Edit] No data returned from update");
      setErrorMsg("Update succeeded but no data returned");
      setSaving(false);
      return;
    }

    const updatedMemory = data[0];
    console.log("[Edit] Successfully saved. Returned data:", updatedMemory);
    console.log("[Edit] Updated name:", updatedMemory.name);
    
    // Immediately update the local state
    setMemories((prev) => {
      const updated = prev.map((m) => 
        m.id === editingMemory.id 
          ? {
              ...m,
              name: updatedMemory.name,
              text: updatedMemory.text,
              tool: updatedMemory.tool,
            }
          : m
      );
      console.log("[Edit] Updated memories state. Count:", updated.length);
      return updated;
    });
    
    // Also refresh from server to ensure consistency
    await fetchMemories(currentUserId);
    closeEditModal();
    showSuccess("Prompt saved");
    setSaving(false);
  };

  const handleDuplicate = async (memory: Memory) => {
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    if (!currentUserId) {
      setErrorMsg("You must be logged in to duplicate a prompt.");
      return;
    }

    const { error } = await supabase
      .from("memories")
      .insert({
        user_id: currentUserId,
        text: memory.text,
        name: memory.name ? `${memory.name} (copy)` : null,
        tool: memory.tool,
        model: memory.model,
      });

    if (error) {
      setErrorMsg(error.message);
    } else if (currentUserId) {
      await fetchMemories(currentUserId);
      showSuccess("Prompt duplicated");
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Folder management
  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: CustomFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      color: newFolderColor,
      createdAt: new Date().toISOString(),
    };
    setCustomFolders((prev) => [...prev, folder]);
    setNewFolderName("");
    setShowFolderModal(false);
    showSuccess("Folder created");
  };

  const deleteFolder = (folderId: string) => {
    setCustomFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Remove folder from all memories
    setMetadata((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        if (updated[id].folder === folderId) {
          updated[id] = { ...updated[id], folder: null };
        }
      });
      return updated;
    });
    showSuccess("Folder deleted");
  };

  const assignFolder = (memoryId: string, folderId: string | null) => {
    console.log("[Folder] Assigning memory", memoryId, "to folder", folderId);
    setMetadata((prev) => {
      const current = prev[memoryId] || { tags: [], folder: null, copyCount: 0, lastUsed: null, versions: [] };
      const updated = {
        ...prev,
        [memoryId]: { ...current, folder: folderId },
      };
      console.log("[Folder] Updated metadata for", memoryId, ":", updated[memoryId]);
      return updated;
    });
  };

  const moveToFolder = (memoryId: string, folderId: string | null) => {
    console.log("[Folder] Moving memory", memoryId, "to folder", folderId);
    assignFolder(memoryId, folderId);
    setOpenMenuId(null);
    const folderName = folderId ? customFolders.find(f => f.id === folderId)?.name : "No folder";
    showSuccess(folderId ? `Moved to "${folderName}"` : "Removed from folder");
  };

  const toggleMenu = (memoryId: string) => {
    setOpenMenuId((prev) => (prev === memoryId ? null : memoryId));
  };

  const renderContextMenu = (memory: Memory) => {
    if (openMenuId !== memory.id) return null;
    return (
      <div
        className="absolute right-2 top-8 z-50 w-56 rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()}
        data-menu="true"
      >
        <div className="space-y-1">
          <button
            onClick={() => { handleCopy(memory); setOpenMenuId(null); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200"
          >
            Copy
          </button>
          <button
            onClick={() => { openEditModal(memory); setOpenMenuId(null); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200"
          >
            Edit
          </button>
          <button
            onClick={() => { handleDuplicate(memory); setOpenMenuId(null); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200"
          >
            Duplicate
          </button>
          <button
            onClick={() => { handleDelete(memory); setOpenMenuId(null); }}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-500/10 text-red-300"
          >
            Delete
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-neutral-800 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Move to folder
        </div>
        <div className="space-y-1 mt-1">
          <button
            onClick={() => moveToFolder(memory.id, null)}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200"
          >
            No folder
          </button>
          {customFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => moveToFolder(memory.id, folder.id)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200 flex items-center gap-2"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: folder.color }}
              />
              {folder.name}
            </button>
          ))}
          <button
            onClick={() => {
              setEditingFolder(null);
              setNewFolderName("");
              setNewFolderColor("#6366f1");
              setShowFolderModal(true);
              setOpenMenuId(null);
            }}
            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-800 text-neutral-200"
          >
            + New folder
          </button>
        </div>
      </div>
    );
  };

  // Tag management
  const addTag = (memoryId: string, tag: string) => {
    if (!tag.trim()) return;
    const normalizedTag = tag.trim().toLowerCase();
    setMetadata((prev) => {
      const current = prev[memoryId] || { tags: [], folder: null, copyCount: 0, lastUsed: null, versions: [] };
      if (current.tags.includes(normalizedTag)) return prev;
      return {
        ...prev,
        [memoryId]: { ...current, tags: [...current.tags, normalizedTag] },
      };
    });
  };

  const removeTag = (memoryId: string, tag: string) => {
    setMetadata((prev) => {
      const current = prev[memoryId];
      if (!current) return prev;
      return {
        ...prev,
        [memoryId]: { ...current, tags: current.tags.filter((t) => t !== tag) },
      };
    });
  };

  // Version management
  const revertToVersion = async (memory: Memory, version: { text: string; name: string | null; timestamp: string }) => {
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    // Save current version to history
    setMetadata((prev) => {
      const current = prev[memory.id] || { tags: [], folder: null, copyCount: 0, lastUsed: null, versions: [] };
      const newVersions = [
        { text: memory.text, name: memory.name, timestamp: new Date().toISOString() },
        ...current.versions,
      ].slice(0, 10);
      
      return {
        ...prev,
        [memory.id]: {
          ...current,
          versions: newVersions,
        },
      };
    });

    const { error } = await supabase
      .from("memories")
      .update({ text: version.text, name: version.name })
      .eq("id", memory.id)
      .eq("user_id", currentUserId ?? "");

    if (error) {
      setErrorMsg(error.message);
    } else if (currentUserId) {
      await fetchMemories(currentUserId);
      setShowVersionHistory(false);
      showSuccess("Reverted to previous version");
    }
  };

  // Create new prompt
  const openCreateModal = () => {
    setShowCreateModal(true);
    setNewName("");
    setNewText("");
    setNewTool("");
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setNewName("");
    setNewText("");
    setNewTool("");
  };

  const handleCreate = async () => {
    if (!newText.trim()) {
      setErrorMsg("Prompt text is required");
      return;
    }

    setCreating(true);
    setErrorMsg(null);
    
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: sessionData } = await supabase.auth.getSession();
      currentUserId = sessionData.session?.user.id ?? null;
    }

    if (!currentUserId) {
      setErrorMsg("You must be logged in to create prompts");
      setCreating(false);
      return;
    }

    // Prepare the name - only set if it has actual content
    const nameToSave = newName.trim();
    const finalName = nameToSave.length > 0 ? nameToSave : null;

    console.log("[Create] Saving prompt with name:", finalName);
    
    const { data, error } = await supabase.from("memories").insert({
      user_id: currentUserId,
      text: newText.trim(),
      name: finalName,
      tool: newTool.trim() || null,
    }).select();

    if (error) {
      console.error("[Create] Error saving prompt:", error);
      setErrorMsg(error.message || "Failed to create prompt");
      setCreating(false);
      return;
    }

    console.log("[Create] Prompt saved successfully:", data);
    
    // Refresh memories to show the new one
    await fetchMemories(currentUserId);
    closeCreateModal();
    showSuccess("Prompt created");
    setCreating(false);
  };

  // Export prompts
  const handleExport = (exportAll: boolean) => {
    const toExport = exportAll 
      ? memories 
      : memories.filter((m) => selectedIds.has(m.id));
    
    if (toExport.length === 0) {
      setErrorMsg("No prompts to export");
      return;
    }

    const data = JSON.stringify(toExport, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptr-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showSuccess(`Exported ${toExport.length} prompts`);
  };

  // Import prompts
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (!Array.isArray(imported)) {
        setErrorMsg("Invalid import file format");
        return;
      }

      let currentUserId = userId;
      if (!currentUserId) {
        const { data: sessionData } = await supabase.auth.getSession();
        currentUserId = sessionData.session?.user.id ?? null;
      }

      if (!currentUserId) {
        setErrorMsg("You must be logged in to import prompts.");
        return;
      }

      const toInsert = imported.map((item: any) => ({
        user_id: currentUserId,
        text: item.text,
        name: item.name || null,
        tool: item.tool || null,
        model: item.model || null,
      }));

      const { error } = await supabase.from("memories").insert(toInsert);

      if (error) {
        setErrorMsg(error.message);
      } else if (currentUserId) {
        await fetchMemories(currentUserId);
        showSuccess(`Imported ${toInsert.length} prompts`);
      }
    } catch {
      setErrorMsg("Failed to parse import file");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filter and sort memories
  const filteredMemories = useMemo(() => {
    let result = memories;

    // Filter by folder
    if (selectedFolder === "favorites") {
      result = result.filter((m) => favorites.has(m.id));
    } else if (selectedFolder === "recent") {
      result = result.slice(0, 10);
    } else if (selectedFolder.startsWith("folder-")) {
      const folderId = selectedFolder.replace("folder-", "");
      result = result.filter((m) => metadata[m.id]?.folder === folderId);
    } else if (selectedFolder !== "all") {
      result = result.filter((m) => m.tool?.toLowerCase() === selectedFolder);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((m) => {
        const meta = metadata[m.id];
        if (!meta || !meta.tags) return false;
        return selectedTags.every((tag) => meta.tags.includes(tag));
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) => {
          const meta = metadata[m.id];
          const tagMatch = meta?.tags?.some((tag) => tag.includes(query));
          return (
            m.text.toLowerCase().includes(query) ||
            m.name?.toLowerCase().includes(query) ||
            m.tool?.toLowerCase().includes(query) ||
            m.model?.toLowerCase().includes(query) ||
            tagMatch
          );
        }
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortOption) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name-asc":
        sorted.sort((a, b) => (a.name || a.text).localeCompare(b.name || b.text));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || b.text).localeCompare(a.name || a.text));
        break;
      case "recently-used":
        sorted.sort((a, b) => {
          const aUsed = metadata[a.id]?.lastUsed;
          const bUsed = metadata[b.id]?.lastUsed;
          if (!aUsed && !bUsed) return 0;
          if (!aUsed) return 1;
          if (!bUsed) return -1;
          return new Date(bUsed).getTime() - new Date(aUsed).getTime();
        });
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return sorted;
  }, [memories, selectedFolder, searchQuery, sortOption, favorites, metadata, selectedTags]);

  const folders = useMemo(() => {
    const tools = new Set(memories.map((m) => m.tool).filter(Boolean));
    return Array.from(tools);
  }, [memories]);

  // Stats
  const stats = useMemo(() => {
    const toolCounts: Record<string, number> = {};
        memories.forEach((m) => {
          const tool = m.tool || "Unknown";
          toolCounts[tool] = (toolCounts[tool] || 0) + 1;
        });
        return {
          total: memories.length,
          favorites: [...favorites].filter((id) => memories.some((m) => m.id === id)).length,
          byTool: toolCounts,
        };
      }, [memories, favorites]);

  const getTitle = useCallback((memory: Memory) => {
    // Check if memory has a name and it's not empty
    if (memory.name != null && typeof memory.name === 'string') {
      const trimmedName = memory.name.trim();
      if (trimmedName.length > 0) {
        return trimmedName;
      }
    }
    
    // Fallback to generating title from text
    const words = memory.text.trim().split(/\s+/);
    const wordCount = Math.min(Math.max(5, Math.floor(words.length * 0.3)), 7);
    const fallback = words.slice(0, wordCount).join(" ");
    return fallback.length > 50 ? fallback.substring(0, 47) + "..." : fallback;
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
          <p className="text-sm text-neutral-400">Loading your prompts...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-white via-neutral-200 to-neutral-500 shadow-lg" />
            <span className="text-lg font-semibold text-white">Promptr</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => setSelectedFolder("all")}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
              selectedFolder === "all"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📚</span>
                <span>All Prompts</span>
              </span>
              <span className="text-xs text-neutral-500">{stats.total}</span>
            </span>
          </button>

          <button
            onClick={() => setSelectedFolder("favorites")}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
              selectedFolder === "favorites"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>⭐</span>
                <span>Favorites</span>
              </span>
              <span className="text-xs text-neutral-500">{stats.favorites}</span>
            </span>
          </button>

          <button
            onClick={() => setSelectedFolder("recent")}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
              selectedFolder === "recent"
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>⏱️</span>
              <span>Recent</span>
            </span>
          </button>

          {/* Custom Folders */}
          <div className="pt-4 pb-2 px-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Folders
            </span>
            <button
              onClick={() => {
                setEditingFolder(null);
                setNewFolderName("");
                setNewFolderColor("#6366f1");
                setShowFolderModal(true);
              }}
              className="text-xs text-neutral-400 hover:text-white"
              title="Create folder"
            >
              +
            </button>
          </div>
          {customFolders.length > 0 ? (
            <>
              {customFolders.map((folder) => {
                const count = Object.values(metadata).filter((m) => m.folder === folder.id).length;
                return (
                  <div key={folder.id} className="group flex items-center">
                    <button
                      onClick={() => setSelectedFolder(`folder-${folder.id}`)}
                      className={`flex-1 text-left px-3 py-2 text-sm rounded-lg transition ${
                        selectedFolder === `folder-${folder.id}`
                          ? "bg-neutral-800 text-white"
                          : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: folder.color }}
                          />
                          <span>{folder.name}</span>
                        </span>
                        <span className="text-xs text-neutral-500">{count}</span>
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete folder "${folder.name}"?`)) {
                          deleteFolder(folder.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 px-2 text-xs text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <button
              onClick={() => {
                setEditingFolder(null);
                setNewFolderName("");
                setNewFolderColor("#6366f1");
                setShowFolderModal(true);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition"
            >
              <span className="flex items-center gap-2">
                <span>+</span>
                <span>Create your first folder</span>
              </span>
            </button>
          )}

          {/* Folders by Tool */}
          {folders.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                By Tool
              </div>
              {folders.map((tool) => {
                const toolName = tool || "Unknown";
                const toolLower = toolName.toLowerCase();
                const count = stats.byTool[toolName] || 0;
                return (
                  <button
                    key={toolName}
                    onClick={() => setSelectedFolder(toolLower)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                      selectedFolder === toolLower
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>📁</span>
                        <span>{toolName}</span>
                      </span>
                      <span className="text-xs text-neutral-500">{count}</span>
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-800">
          <ProfileDropdown />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {selectedFolder === "all"
                    ? "All Prompts"
                    : selectedFolder === "favorites"
                    ? "Favorites"
                    : selectedFolder === "recent"
                    ? "Recent Prompts"
                    : selectedFolder === "most-used"
                    ? "Most Used Prompts"
                    : selectedFolder.startsWith("folder-")
                    ? customFolders.find((f) => f.id === selectedFolder.replace("folder-", ""))?.name || "Folder"
                    : `${selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)} Prompts`}
                </h1>
                <p className="text-neutral-400">
                  {filteredMemories.length} {filteredMemories.length === 1 ? "prompt" : "prompts"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
              
              {/* Create button */}
              {selectedFolder !== "favorites" && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Prompt
                </button>
              )}
            </div>

              {/* Simplified Toolbar */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[260px] max-w-3xl">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prompts... (Ctrl+K)"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                {/* Sort (Filter) */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className={`px-4 pr-12 py-2.5 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 focus:border-neutral-500 focus:outline-none min-w-[180px] appearance-none bg-[url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7l5 5 5-5' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center]`}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="recently-used">Recently used</option>
                </select>
              </div>
          </div>

          {/* Success/Error Messages */}
          {successMsg && (
            <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMsg}
              <button onClick={() => setErrorMsg(null)} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          {/* Cards Grid/List */}
          {filteredMemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">{searchQuery ? "🔍" : "📝"}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? "No matches found" : "No prompts yet"}
              </h3>
              <p className="text-neutral-400 max-w-md mb-6">
                {searchQuery
                  ? "Try adjusting your search or filter."
                  : "Start saving prompts from your AI tools or create one manually."}
              </p>
              {!searchQuery && selectedFolder !== "favorites" && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first prompt
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMemories.map((memory) => {
                const title = getTitle(memory);
                const preview = memory.text.length > 100 ? `${memory.text.slice(0, 97)}...` : memory.text;
                const isFavorite = favorites.has(memory.id);
                const isSelected = selectedIds.has(memory.id);
                const meta = metadata[memory.id];
                const folderLabel = meta?.folder ? customFolders.find((f) => f.id === meta.folder) : null;
                const hasVariables = extractVariables(memory.text).length > 0;
                const tags = meta?.tags || [];

                return (
                  <div
                    key={memory.id}
                    onClick={() => isSelectionMode ? toggleSelection(memory.id) : openEditModal(memory)}
                    className={`group relative flex flex-col rounded-lg border p-5 transition-all cursor-pointer h-[220px] ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:shadow-lg hover:shadow-neutral-900/50"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white line-clamp-1">
                          {title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {hasVariables && (
                            <span className="text-xs text-blue-400 inline-flex items-center gap-1">
                              <span>🔧</span> Has variables
                            </span>
                          )}
                          {folderLabel && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: folderLabel.color }}
                              />
                              {folderLabel.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(memory.id); }}
                          className={`shrink-0 p-1 rounded transition ${
                            isFavorite ? "text-yellow-400" : "text-neutral-600 hover:text-yellow-400"
                          }`}
                          title={isFavorite ? "Remove favorite" : "Add favorite"}
                        >
                          {isFavorite ? "★" : "☆"}
                        </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMenu(memory.id); }}
                      className="shrink-0 p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
                      title="More actions"
                      data-menu-button="true"
                    >
                      ⋯
                    </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed flex-1">
                      {preview}
                    </p>

                    {/* Tags and Metadata (placed just above divider) */}
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {memory.tool && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-800 text-xs font-medium text-neutral-300">
                          {memory.tool}
                        </span>
                      )}
                      {memory.model && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-800 text-xs text-neutral-400">
                          {memory.model}
                        </span>
                      )}
                      {tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-800 text-xs text-neutral-400">
                          +{tags.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 pt-3 mt-auto border-t border-neutral-800">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(memory); }}
                        disabled={copyingId === memory.id}
                        className="flex-1 px-2 py-1 text-xs font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
                      >
                        {copyingId === memory.id ? "Copied!" : "Copy"}
                      </button>
                      <span className="ml-auto text-xs text-neutral-600">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {renderContextMenu(memory)}
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredMemories.map((memory) => {
                const title = getTitle(memory);
                const preview = memory.text.length > 200 ? `${memory.text.slice(0, 197)}...` : memory.text;
                const isFavorite = favorites.has(memory.id);
                const isSelected = selectedIds.has(memory.id);
                const meta = metadata[memory.id];
                const folderLabel = meta?.folder ? customFolders.find((f) => f.id === meta.folder) : null;

                return (
                  <div
                    key={memory.id}
                    onClick={() => isSelectionMode ? toggleSelection(memory.id) : openEditModal(memory)}
                    className={`relative flex items-center gap-4 rounded-lg border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                    }`}
                  >
                    {/* Favorite */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(memory.id); }}
                      className={`shrink-0 p-1 rounded transition ${
                        isFavorite ? "text-yellow-400" : "text-neutral-600 hover:text-yellow-400"
                      }`}
                    >
                      {isFavorite ? "★" : "☆"}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                      <p className="text-xs text-neutral-400 truncate">{preview}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                        {folderLabel && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: folderLabel.color }}
                            />
                            {folderLabel.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="hidden sm:flex items-center gap-2">
                      {memory.tool && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-neutral-800 text-xs font-medium text-neutral-300">
                          {memory.tool}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <span className="hidden md:block text-xs text-neutral-600 shrink-0">
                      {new Date(memory.created_at).toLocaleDateString()}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(memory); }}
                        disabled={copyingId === memory.id}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
                      >
                        {copyingId === memory.id ? "✓" : "Copy"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMenu(memory.id); }}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition"
                        title="More actions"
                      >
                        ⋯
                      </button>
                    </div>

                    {renderContextMenu(memory)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-white mb-6">Edit Prompt</h2>

            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Give your prompt a name..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Tool field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tool</label>
                <input
                  type="text"
                  value={editTool}
                  onChange={(e) => setEditTool(e.target.value)}
                  placeholder="e.g., ChatGPT, Claude, Gemini..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Folder assignment */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Folder</label>
                <div className="flex gap-2">
                  <select
                    value={metadata[editingMemory.id]?.folder || ""}
                    onChange={(e) => assignFolder(editingMemory.id, e.target.value || null)}
                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
                  >
                    <option value="">No folder</option>
                    {customFolders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setEditingFolder(null);
                      setNewFolderName("");
                      setNewFolderColor("#6366f1");
                      setShowFolderModal(true);
                    }}
                    className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                    title="Create folder"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(metadata[editingMemory.id]?.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(editingMemory.id, tag)}
                        className="hover:text-purple-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                        addTag(editingMemory.id, e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                  {allTags.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addTag(editingMemory.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-white focus:border-neutral-500 focus:outline-none"
                    >
                      <option value="">Quick add...</option>
                      {allTags
                        .filter((tag) => !(metadata[editingMemory.id]?.tags || []).includes(tag))
                        .map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Text field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-300">Prompt Text</label>
                  <div className="flex items-center gap-3">
                    {extractVariables(editText).length > 0 && (
                      <span className="text-xs text-blue-400">
                        {extractVariables(editText).length} variable{extractVariables(editText).length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {editText.length} chars · {editText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Use {"{{variable}}"} syntax to create fillable variables
                </p>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 text-sm text-neutral-400">
                {editingMemory.model && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-neutral-500">Model:</span> {editingMemory.model}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <span className="text-neutral-500">Created:</span> {new Date(editingMemory.created_at).toLocaleString()}
                </span>
                {metadata[editingMemory.id]?.copyCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-neutral-500">Copied:</span> {metadata[editingMemory.id].copyCount} times
                  </span>
                )}
                {metadata[editingMemory.id]?.versions && metadata[editingMemory.id].versions.length > 0 && (
                  <button
                    onClick={() => {
                      setVersionMemory(editingMemory);
                      setShowVersionHistory(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    View {metadata[editingMemory.id].versions.length} version{metadata[editingMemory.id].versions.length !== 1 ? "s" : ""}
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(editingMemory)}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                >
                  {copyingId === editingMemory.id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => { handleDuplicate(editingMemory); closeEditModal(); }}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => { handleDelete(editingMemory); closeEditModal(); }}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={closeCreateModal}
        >
          <div
            className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeCreateModal}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-white mb-6">Create New Prompt</h2>

            <div className="space-y-4">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Name (optional)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Give your prompt a name..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Tool field */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Tool (optional)</label>
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  placeholder="e.g., ChatGPT, Claude, Gemini..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Text field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-neutral-300">Prompt Text *</label>
                  <span className="text-xs text-neutral-500">
                    {newText.length} chars · {newText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  rows={10}
                  placeholder="Enter your prompt text..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
              <button
                onClick={closeCreateModal}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newText.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Prompt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowExportMenu(false)} />
      )}

      {/* Variable Fill Modal */}
      {showVariableModal && variableMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowVariableModal(false);
            setVariableMemory(null);
            setVariableValues({});
          }}
        >
          <div
            className="relative w-full max-w-lg mx-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Fill Variables</h2>
            <p className="text-sm text-neutral-400 mb-4">
              This prompt contains variables. Please provide values:
            </p>
            <div className="space-y-3 mb-6">
              {extractVariables(variableMemory.text).map((varName) => (
                <div key={varName}>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">
                    {varName}
                  </label>
                  <input
                    type="text"
                    value={variableValues[varName] || ""}
                    onChange={(e) =>
                      setVariableValues((prev) => ({ ...prev, [varName]: e.target.value }))
                    }
                    placeholder={`Enter ${varName}...`}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && Object.keys(variableValues).length === extractVariables(variableMemory.text).length) {
                        handleVariableFill();
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVariableModal(false);
                  setVariableMemory(null);
                  setVariableValues({});
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVariableFill}
                disabled={extractVariables(variableMemory.text).some((v) => !variableValues[v]?.trim())}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-50"
              >
                Copy with Values
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowFolderModal(false)}
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingFolder ? "Edit Folder" : "Create Folder"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Client Work, Marketing..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Color</label>
                <div className="flex gap-2">
                  {["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewFolderColor(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition ${
                        newFolderColor === color ? "border-white scale-110" : "border-neutral-700"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setEditingFolder(null);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {editingFolder ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && versionMemory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setShowVersionHistory(false);
            setVersionMemory(null);
          }}
        >
          <div
            className="relative w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-4">Version History</h2>
            <p className="text-sm text-neutral-400 mb-4">
              {versionMemory.name || "Untitled Prompt"}
            </p>
            <div className="space-y-3">
              {metadata[versionMemory.id]?.versions?.length > 0 ? (
                metadata[versionMemory.id].versions.map((version, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-400">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                      <button
                        onClick={() => revertToVersion(versionMemory, version)}
                        className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                      >
                        Restore
                      </button>
                    </div>
                    {version.name && (
                      <p className="text-sm font-medium text-white mb-2">{version.name}</p>
                    )}
                    <p className="text-sm text-neutral-300 line-clamp-3">{version.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-400 text-center py-8">
                  No version history yet. Previous versions will appear here after edits.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setShowVersionHistory(false);
                setVersionMemory(null);
              }}
              className="mt-6 w-full px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
