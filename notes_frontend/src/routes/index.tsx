import { component$, useSignal, useStore, $, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

/**
 * Notes types
 */
type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number; // epoch ms
};

type NotesState = {
  notes: Note[];
  filter: string;
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  draft: { id?: string; title: string; content: string };
};

/**
 * Utility to format dates
 */
const formatDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString();
};

/**
 * Generate ID
 */
const uid = () => Math.random().toString(36).slice(2, 10);

// PUBLIC_INTERFACE
export default component$(() => {
  // Initial demo notes
  const initialNotes: Note[] = [
    {
      id: uid(),
      title: "Welcome to Notes",
      content: "Use the + New Note button to create notes.\nClick a note's Edit to modify, or Delete to remove.",
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: uid(),
      title: "Color palette",
      content: "Primary: #1976D2\nSecondary: #424242\nAccent: #FFC107",
      updatedAt: Date.now() - 1000 * 60 * 15,
    },
  ];

  const state = useStore<NotesState>({
    notes: initialNotes,
    filter: "",
    dialogOpen: false,
    dialogMode: "create",
    draft: { title: "", content: "" },
  });

  const sidebarOpen = useSignal(true);

  const filteredNotes = useComputed$(() =>
    state.notes
      .filter((n) => {
        if (!state.filter) return true;
        const q = state.filter.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt)
  );

  const openCreate = $(() => {
    state.dialogMode = "create";
    state.draft = { title: "", content: "" };
    state.dialogOpen = true;
  });

  const openEdit = $((note: Note) => {
    state.dialogMode = "edit";
    state.draft = { id: note.id, title: note.title, content: note.content };
    state.dialogOpen = true;
  });

  const saveDraft = $(() => {
    const t = state.draft.title.trim();
    const c = state.draft.content.trim();
    if (!t && !c) {
      state.dialogOpen = false;
      return;
    }
    if (state.dialogMode === "create") {
      state.notes = [
        {
          id: uid(),
          title: t || "Untitled",
          content: c,
          updatedAt: Date.now(),
        },
        ...state.notes,
      ];
    } else {
      state.notes = state.notes.map((n) =>
        n.id === state.draft.id
          ? { ...n, title: t || "Untitled", content: c, updatedAt: Date.now() }
          : n
      );
    }
    state.dialogOpen = false;
  });

  const deleteNote = $((id: string) => {
    state.notes = state.notes.filter((n) => n.id !== id);
  });

  return (
    <div class="container">
      {/* Header */}
      <header class="app-header">
        <div class="inner">
          <div class="brand-logo" aria-hidden="true">N</div>
          <div class="brand-title">Notes</div>
          <div class="header-actions">
            <button class="btn btn-secondary" onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}>
              {sidebarOpen.value ? "Hide Menu" : "Show Menu"}
            </button>
            <button class="btn btn-primary" onClick$={openCreate}>
              + New Note
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div class="app-main">
        {/* Sidebar */}
        {sidebarOpen.value && (
          <aside class="sidebar">
            <div class="nav-group">
              <div class="nav-group-title">Navigation</div>
              <ul class="nav-list">
                <li>
                  <a class="nav-item active" href="#">
                    Home
                  </a>
                </li>
                <li>
                  <a class="nav-item" href="#">
                    All Notes
                  </a>
                </li>
              </ul>
            </div>
            <div class="nav-group" style="margin-top: 12px;">
              <div class="nav-group-title">Filters</div>
              <input
                class="search-input"
                type="search"
                placeholder="Search notes..."
                value={state.filter}
                onInput$={(e, el) => (state.filter = el.value)}
              />
            </div>
          </aside>
        )}

        {/* Content */}
        <section class="content">
          {/* Toolbar (mobile primary actions) */}
          <div class="toolbar">
            <input
              class="search-input"
              type="search"
              placeholder="Search notes..."
              value={state.filter}
              onInput$={(e, el) => (state.filter = el.value)}
            />
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" onClick$={() => (sidebarOpen.value = !sidebarOpen.value)}>
                {sidebarOpen.value ? "Hide Menu" : "Show Menu"}
              </button>
              <button class="btn btn-primary" onClick$={openCreate}>+ New Note</button>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.value.length === 0 ? (
            <div class="empty">
              No notes found. Create your first note with the “+ New Note” button.
            </div>
          ) : (
            <div class="card-grid">
              {filteredNotes.value.map((note) => (
                <article key={note.id} class="note-card" aria-label={`Note ${note.title}`}>
                  <h3 class="note-title">{note.title || "Untitled"}</h3>
                  <div class="note-content">{note.content || "No content"}</div>
                  <div class="note-meta">
                    <span>Updated {formatDate(note.updatedAt)}</span>
                    <div class="card-actions">
                      <button class="icon-btn" onClick$={() => openEdit(note)}>Edit</button>
                      <button class="icon-btn" onClick$={() => deleteNote(note.id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Dialog */}
      {state.dialogOpen && (
        <div class="dialog-backdrop" role="dialog" aria-modal="true" aria-label="Edit note">
          <div class="dialog">
            <div class="dialog-header">
              <h4 class="dialog-title">
                {state.dialogMode === "create" ? "Create Note" : "Edit Note"}
              </h4>
              <button class="icon-btn" onClick$={() => (state.dialogOpen = false)}>Close</button>
            </div>
            <div class="dialog-body">
              <div>
                <label style="display:block; font-size:.85rem; color:var(--color-text-muted); margin-bottom:6px;">Title</label>
                <input
                  class="input"
                  type="text"
                  placeholder="Note title"
                  value={state.draft.title}
                  onInput$={(e, el) => (state.draft.title = el.value)}
                />
              </div>
              <div>
                <label style="display:block; font-size:.85rem; color:var(--color-text-muted); margin-bottom:6px;">Content</label>
                <textarea
                  class="textarea"
                  placeholder="Write your note..."
                  value={state.draft.content}
                  onInput$={(e, el) => (state.draft.content = el.value)}
                />
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" onClick$={() => (state.dialogOpen = false)}>Cancel</button>
              <button class="btn btn-accent" onClick$={saveDraft}>
                {state.dialogMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Notes",
  meta: [
    {
      name: "description",
      content: "A modern, light-themed Qwik notes app with full CRUD.",
    },
  ],
};
