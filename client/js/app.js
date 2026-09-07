// ==============================
// DOM ELEMENTS
// ==============================

const newNoteBtn = document.getElementById("newNoteBtn");
const notesContainer = document.getElementById("notesContainer");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");

const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

const deleteBtn = document.getElementById("deleteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");

const allNotesBtn = document.getElementById("allNotesBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const trashBtn = document.getElementById("trashBtn");

const saveStatus = document.getElementById("saveStatus");

const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const underlineBtn = document.getElementById("underlineBtn");

const bulletListBtn = document.getElementById("bulletListBtn");
const numberListBtn = document.getElementById("numberListBtn");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const menuBtn = document.getElementById("menuBtn");
const notesPanel = document.getElementById("notesPanel");

menuBtn.addEventListener("click", () => {
  notesPanel.classList.toggle("hidden");
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
// CREATE NOTE
// ==============================

newNoteBtn.addEventListener("click", function () {
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
});

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

  // Sort newest updated notes first

  filteredNotes.sort(function (a, b) {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Empty state

  if (filteredNotes.length === 0) {
    notesContainer.innerHTML = `
            <div class="empty-state">
                <p>No notes found</p>
            </div>
        `;

    return;
  }

  filteredNotes.forEach(function (note) {
    const noteCard = document.createElement("div");

    noteCard.classList.add("note-card");

    if (note.id === activeNoteId) {
      noteCard.classList.add("active-note");
    }

    const preview = note.content
      ? note.content.replace(/<[^>]*>/g, "").substring(0, 80)
      : "No content yet...";

    noteCard.innerHTML = `
            <div class="note-header">

                <h3>${escapeHTML(note.title)}</h3>

                ${note.favorite ? '<i class="fa-solid fa-star"></i>' : ""}

            </div>

            <p>${escapeHTML(preview)}</p>

            <span>
                ${formatDate(note.updatedAt)}
            </span>
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

  themeToggle.checked = true;
}

themeToggle.addEventListener("change", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// ==============================
// TEXT FORMATTING
// ==============================

function formatText(command) {
  if (activeNoteId === null) return;

  noteContent.focus();

  document.execCommand(command, false, null);

  noteContent.dispatchEvent(new Event("input"));
}

// Bold

boldBtn.addEventListener("click", function () {
  formatText("bold");
});

// Italic

italicBtn.addEventListener("click", function () {
  formatText("italic");
});

// Underline

underlineBtn.addEventListener("click", function () {
  formatText("underline");
});

// Bullet List

bulletListBtn.addEventListener("click", function () {
  formatText("insertUnorderedList");
});

// Number List

numberListBtn.addEventListener("click", function () {
  formatText("insertOrderedList");
});

// Undo

undoBtn.addEventListener("click", function () {
  formatText("undo");
});

// Redo

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

// ==============================
// INITIAL LOAD
// ==============================

renderNotes();
