// ==============================
// DOM ELEMENTS
// ==============================

const newNoteBtn = document.getElementById("newNoteBtn");
const newNoteFab = document.getElementById("newNoteFab");
const notesContainer = document.getElementById("notesContainer");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const settingsBtn = document.getElementById("settingsBtn");
const themeToggle = document.getElementById("themeToggle");

const deleteBtn = document.getElementById("deleteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const saveBtn = document.getElementById("saveBtn");
const attachmentBtn = document.getElementById("attachmentBtn");
const moreBtn = document.getElementById("moreBtn");
const notesMoreBtn = document.getElementById("notesMoreBtn");

const allNotesBtn = document.getElementById("allNotesBtn");
const notesListBtn = document.getElementById("notesListBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const trashBtn = document.getElementById("trashBtn");

const saveStatus = document.getElementById("saveStatus");

const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");

const bulletListBtn = document.getElementById("bulletListBtn");
const numberListBtn = document.getElementById("numberListBtn");
const taskListBtn = document.getElementById("taskListBtn");
const alignLeftBtn = document.getElementById("alignLeftBtn");
const alignCenterBtn = document.getElementById("alignCenterBtn");
const alignRightBtn = document.getElementById("alignRightBtn");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const notesPanel = document.getElementById("notesPanel");
const editorBackBtn = document.getElementById("editorBackBtn");
const notesListCloseBtn = document.getElementById("notesListCloseBtn");

const actionMenu = document.createElement("div");
actionMenu.className = "action-menu hidden";
actionMenu.setAttribute("role", "menu");
actionMenu.innerHTML = `
  <button type="button" data-menu-action="clear-search">Clear search</button>
  <button type="button" data-menu-action="reset-view">Reset view</button>
  <button type="button" data-menu-action="empty-trash">Empty trash</button>
  <button type="button" data-menu-action="duplicate-note">Duplicate note</button>
  <button type="button" data-menu-action="clear-note">Clear note</button>
`;
document.body.appendChild(actionMenu);

function toggleActionMenu(button, menuType) {
  const isOpen = !actionMenu.classList.contains("hidden");
  const currentType = actionMenu.dataset.menuType;

  if (isOpen && currentType === menuType) {
    actionMenu.classList.add("hidden");
    return;
  }

  const rect = button.getBoundingClientRect();
  const menuWidth = 220;
  const menuHeight = 220;
  const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
  const top = Math.min(rect.bottom + 10, window.innerHeight - menuHeight - 8);

  actionMenu.dataset.menuType = menuType;
  actionMenu.style.left = `${Math.max(8, left)}px`;
  actionMenu.style.top = `${Math.max(8, top)}px`;

  const actions = [...actionMenu.querySelectorAll("button[data-menu-action]")];

  actions.forEach((actionButton) => {
    const action = actionButton.dataset.menuAction;
    const shouldShow =
      (menuType === "notes" &&
        ((action === "clear-search" && searchInput.value.trim()) ||
          action === "reset-view" ||
          (action === "empty-trash" && notes.some((note) => note.deleted)))) ||
      (menuType === "editor" &&
        ((action === "duplicate-note" && !!getActiveNote()) ||
          (action === "clear-note" && !!getActiveNote())));

    actionButton.style.display = shouldShow ? "flex" : "none";
  });

  actionMenu.classList.remove("hidden");
}

function closeActionMenu() {
  actionMenu.classList.add("hidden");
  delete actionMenu.dataset.menuType;
}

document.addEventListener("click", function (event) {
  const menuAction = event.target.closest("[data-menu-action]");
  if (menuAction) {
    const action = menuAction.dataset.menuAction;

    if (action === "clear-search") {
      searchInput.value = "";
      renderNotes();
    }

    if (action === "reset-view") {
      currentView = "all";
      setActiveNavigation(allNotesBtn);
      searchInput.value = "";
      renderNotes();
    }

    if (action === "empty-trash") {
      notes = notes.filter((note) => !note.deleted);
      saveNotes();
      currentView = "all";
      setActiveNavigation(allNotesBtn);
      renderNotes();
      saveStatus.textContent = "Trash emptied";
    }

    if (action === "duplicate-note") {
      const note = getActiveNote();
      if (!note) return;
      const clonedNote = {
        ...note,
        id: Date.now(),
        title: `${note.title || "Untitled Note"} Copy`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
      };

      notes.unshift(clonedNote);
      activeNoteId = clonedNote.id;
      saveNotes();
      renderNotes();
      openNote(clonedNote.id);
    }

    if (action === "clear-note") {
      const note = getActiveNote();
      if (!note) return;
      note.content = "";
      note.title = "Untitled Note";
      note.updatedAt = new Date().toISOString();
      saveNotes();
      noteTitle.value = "";
      noteContent.innerHTML = "";
      renderNotes();
      saveStatus.textContent = "Note cleared";
    }

    closeActionMenu();
    return;
  }

  if (
    !event.target.closest(".action-menu") &&
    !event.target.closest("#notesMoreBtn") &&
    !event.target.closest("#moreBtn")
  ) {
    closeActionMenu();
  }
});

function createNewNote() {
  const newNote = {
    id: Date.now(),
    title: "Untitled Note",
    content: "",
    favorite: false,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  activeNoteId = newNote.id;
  currentView = "all";
  saveNotes();
  renderNotes();
  openNote(newNote.id);
}

newNoteBtn.addEventListener("click", createNewNote);
newNoteFab.addEventListener("click", createNewNote);

searchBtn.addEventListener("click", function () {
  searchInput.focus();
  searchInput.select();
});

settingsBtn.addEventListener("click", function () {
  document.body.classList.toggle("sidebar-collapsed");
  saveStatus.textContent = document.body.classList.contains("sidebar-collapsed")
    ? "Sidebar compact"
    : "Sidebar expanded";
});

notesListBtn.addEventListener("click", function () {
  const hidden = !notesPanel.classList.contains("hidden");
  notesPanel.classList.toggle("hidden", hidden);
  document.body.classList.toggle("notes-list-hidden", hidden);
});

editorBackBtn.addEventListener("click", function () {
  document.body.classList.remove("editor-open");
  document.body.classList.remove("sidebar-open");
});

notesListCloseBtn.addEventListener("click", function () {
  document.body.classList.remove("editor-open");
  document.body.classList.remove("sidebar-open");
});

saveBtn.addEventListener("click", function () {
  const note = getActiveNote();
  if (!note) return;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  saveStatus.textContent = "Saved";
  renderNotes();
});

notesMoreBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  toggleActionMenu(notesMoreBtn, "notes");
});

moreBtn.addEventListener("click", function (event) {
  event.stopPropagation();
  toggleActionMenu(moreBtn, "editor");
});

attachmentBtn.addEventListener("click", function () {
  const note = getActiveNote();
  if (!note) {
    saveStatus.textContent = "Select a note first";
    return;
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,.pdf,.txt,.doc,.docx";

  fileInput.addEventListener("change", function () {
    const selectedFile = fileInput.files && fileInput.files[0];
    if (!selectedFile) return;

    const attachmentMarkup = `
      <p><strong>Attachment:</strong> <span>${escapeHTML(selectedFile.name)}</span></p>
    `;

    note.content = `${note.content || ""}${attachmentMarkup}`;
    note.updatedAt = new Date().toISOString();
    saveNotes();
    noteContent.innerHTML = note.content;
    saveStatus.textContent = "Attachment added";
    renderNotes();
  });

  fileInput.click();
});

// ==============================
// APP STATE
// ==============================

let notes = JSON.parse(localStorage.getItem("notes")) || [];
let activeNoteId = null;
let currentView = "all";

// ==============================
// SAVE NOTES
// ==============================

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// ==============================
// GET ACTIVE NOTE
// ==============================

function getActiveNote() {
  return notes.find(function (note) {
    return note.id === activeNoteId;
  });
}

// ==============================
// FORMAT DATE
// ==============================

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toggleMobileEditor(open) {
  if (window.innerWidth <= 760) {
    document.body.classList.toggle("editor-open", open);
  }
}

// ==============================
// RENDER NOTES
// ==============================

function renderNotes() {
  notesContainer.innerHTML = "";

  let filteredNotes = notes.filter(function (note) {
    if (currentView === "favorites") {
      return note.favorite && !note.deleted;
    }

    if (currentView === "trash") {
      return note.deleted;
    }

    return !note.deleted;
  });

  const searchText = searchInput.value.toLowerCase().trim();

  if (searchText) {
    filteredNotes = filteredNotes.filter(function (note) {
      return (
        note.title.toLowerCase().includes(searchText) ||
        note.content.toLowerCase().includes(searchText)
      );
    });
  }

  filteredNotes.sort(function (a, b) {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (filteredNotes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-note-sticky" aria-hidden="true"></i>
        <p>No notes yet</p>
        <small>Create your first note</small>
      </div>
    `;
    return;
  }

  filteredNotes.forEach(function (note) {
    const noteCard = document.createElement("article");
    noteCard.classList.add("note-card");
    if (note.id === activeNoteId) {
      noteCard.classList.add("active-note");
    }

    const preview = note.content
      ? note.content.replace(/<[^>]*>/g, "").substring(0, 90)
      : "No content yet...";

    noteCard.innerHTML = `
      <div class="note-header">
        <h3>${escapeHTML(note.title)}</h3>
        ${note.favorite ? '<i class="fa-solid fa-star favorite-indicator"></i>' : ""}
      </div>
      <p>${escapeHTML(preview)}</p>
      <span>${formatDate(note.updatedAt)}</span>
    `;

    noteCard.addEventListener("click", function () {
      if (currentView === "trash") {
        return;
      }
      openNote(note.id);
    });

    notesContainer.appendChild(noteCard);
  });
}

// ==============================
// OPEN NOTE
// ==============================

function openNote(id) {
  const note = notes.find(function (note) {
    return note.id === id;
  });

  if (!note || note.deleted) return;

  activeNoteId = note.id;
  noteTitle.disabled = false;
  noteContent.contentEditable = "true";
  noteTitle.value = note.title;
  noteContent.innerHTML = note.content;
  saveStatus.textContent = "Saved";
  updateFavoriteButton();
  renderNotes();
  toggleMobileEditor(true);
}

// ==============================
// UPDATE TITLE
// ==============================

noteTitle.addEventListener("input", function () {
  const note = getActiveNote();
  if (!note) return;

  note.title = noteTitle.value.trim() || "Untitled Note";
  note.updatedAt = new Date().toISOString();
  saveNotes();
  saveStatus.textContent = "Saved";
  renderNotes();
});

// ==============================
// UPDATE CONTENT
// ==============================

noteContent.addEventListener("input", function () {
  const note = getActiveNote();
  if (!note) return;

  note.content = noteContent.innerHTML;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  saveStatus.textContent = "Saved";
  renderNotes();
});

// ==============================
// DELETE NOTE
// ==============================

deleteBtn.addEventListener("click", function () {
  const note = getActiveNote();
  if (!note) return;

  const confirmDelete = confirm("Move this note to trash?");
  if (!confirmDelete) return;

  note.deleted = true;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  activeNoteId = null;
  clearEditor();
  renderNotes();
});

// ==============================
// CLEAR EDITOR
// ==============================

function clearEditor() {
  noteTitle.value = "";
  noteContent.innerHTML = "";
  noteTitle.disabled = true;
  noteContent.contentEditable = "false";
  saveStatus.textContent = "No note selected";
  updateFavoriteButton();
  toggleMobileEditor(false);
}

// ==============================
// FAVORITE NOTE
// ==============================

favoriteBtn.addEventListener("click", function () {
  const note = getActiveNote();
  if (!note) return;

  note.favorite = !note.favorite;
  note.updatedAt = new Date().toISOString();
  saveNotes();
  updateFavoriteButton();
  renderNotes();
});

// ==============================
// FAVORITE BUTTON ICON
// ==============================

function updateFavoriteButton() {
  const note = getActiveNote();

  if (!note) {
    favoriteBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
    return;
  }

  if (note.favorite) {
    favoriteBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
  } else {
    favoriteBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
  }
}

// ==============================
// SEARCH
// ==============================

searchInput.addEventListener("input", function () {
  renderNotes();
});

// ==============================
// NAVIGATION
// ==============================

allNotesBtn.addEventListener("click", function () {
  currentView = "all";
  setActiveNavigation(allNotesBtn);
  renderNotes();
});

favoritesBtn.addEventListener("click", function () {
  currentView = "favorites";
  setActiveNavigation(favoritesBtn);
  renderNotes();
});

trashBtn.addEventListener("click", function () {
  currentView = "trash";
  setActiveNavigation(trashBtn);
  activeNoteId = null;
  clearEditor();
  renderNotes();
});

// ==============================
// ACTIVE NAVIGATION
// ==============================

function setActiveNavigation(activeButton) {
  const navigationButtons = document.querySelectorAll(".nav-item");
  navigationButtons.forEach(function (button) {
    button.classList.remove("active");
  });
  activeButton.classList.add("active");
}

// ==============================
// DARK MODE
// ==============================

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  if (themeToggle) themeToggle.checked = true;
}

if (themeToggle) {
  themeToggle.addEventListener("change", function () {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

// ==============================
// TEXT FORMATTING
// ==============================

function formatText(command) {
  if (activeNoteId === null) return;
  noteContent.focus();
  document.execCommand(command, false, null);
  noteContent.dispatchEvent(new Event("input"));
}

boldBtn.addEventListener("click", function () {
  formatText("bold");
});

italicBtn.addEventListener("click", function () {
  formatText("italic");
});

underlineBtn.addEventListener("click", function () {
  formatText("underline");
});

bulletListBtn.addEventListener("click", function () {
  formatText("insertUnorderedList");
});

numberListBtn.addEventListener("click", function () {
  formatText("insertOrderedList");
});

taskListBtn.addEventListener("click", function () {
  formatText("insertUnorderedList");
});

alignLeftBtn.addEventListener("click", function () {
  formatText("justifyLeft");
});

alignCenterBtn.addEventListener("click", function () {
  formatText("justifyCenter");
});

alignRightBtn.addEventListener("click", function () {
  formatText("justifyRight");
});

undoBtn.addEventListener("click", function () {
  formatText("undo");
});

redoBtn.addEventListener("click", function () {
  formatText("redo");
});

// ==============================
// ESCAPE HTML
// ==============================

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

window.addEventListener("resize", function () {
  if (window.innerWidth > 760) {
    document.body.classList.remove("sidebar-open");
    document.body.classList.remove("editor-open");
  }
});

// ==============================
// INITIAL LOAD
// ==============================

renderNotes();
