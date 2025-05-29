let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let editIndex = -1; // ใช้เก็บ index ของโน้ตที่กำลังแก้ไข

function saveNote() {
  const date = document.getElementById("note-date").value;
  const color = document.getElementById("note-color").value;
  const title = document.getElementById("note-title").value;
  const content = document.getElementById("note-content").value;

  if (title === "" || content === "") {
    alert("กรุณากรอกชื่อและเนื้อหาโน้ต");
    return;
  }

  const noteData = { date, color, title, content };

  if (editIndex >= 0) {
    notes[editIndex] = noteData; // อัปเดตโน้ตเดิม
    editIndex = -1; // reset index
  } else {
    notes.push(noteData); // เพิ่มโน้ตใหม่
    
  }

  localStorage.setItem("notes", JSON.stringify(notes));
  clearForm();
  renderNotes();
}

function renderNotes() {
  const list = document.getElementById("note-list");
  list.innerHTML = "";

  notes.forEach((note, index) => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.style.backgroundColor = note.color;
    li.innerHTML = `
      <strong>${note.title}</strong><br>
      📅 ${note.date}<br>
      ${note.content}<br>
      <button onclick="editNote(${index})">✏️ แก้ไข</button>
      <button onclick="deleteNote(${index})">🗑 ลบ</button>
    `;
    list.appendChild(li);
  });
}

function deleteNote(index) {
  if (confirm("ต้องการลบโน้ตนี้หรือไม่?")) {
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
  }
}

function editNote(index) {
  const note = notes[index];
  document.getElementById("note-date").value = note.date;
  document.getElementById("note-color").value = note.color;
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-content").value = note.content;
  editIndex = index; // ตั้งค่า index เพื่อใช้ในการอัปเดต
}

function clearForm() {
  document.getElementById("note-date").value = "";
  document.getElementById("note-color").value = "#ffccf9";
  document.getElementById("note-title").value = "";
  document.getElementById("note-content").value = "";
}

function searchNotes() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const filtered = notes.filter(n => n.title.toLowerCase().includes(keyword));
  const list = document.getElementById("note-list");
  list.innerHTML = "";

  filtered.forEach((note, index) => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.style.backgroundColor = note.color;
    li.innerHTML = `
      <strong>${note.title}</strong><br>
      📅 ${note.date}<br>
      ${note.content}<br>
      <button onclick="editNote(${index})">✏️ แก้ไข</button>
      <button onclick="deleteNote(${index})">🗑 ลบ</button>
    `;
    list.appendChild(li);
  });
}

// โหลดโน้ตตอนเริ่มต้น
renderNotes();
