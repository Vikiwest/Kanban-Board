// DOM Elements
const addCardButtons = document.querySelectorAll(".add-card-btn");
const modal = document.getElementById("add-task-modal");
const saveTaskBtn = document.getElementById("save-task-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const taskTitleInput = document.getElementById("task-title");
const taskDescriptionInput = document.getElementById("task-description");
const columns = document.querySelectorAll(".column");

// Load tasks from localStorage when the page loads
document.addEventListener("DOMContentLoaded", loadTasks);

// Open Add Task Modal
addCardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    modal.style.display = "flex";
  });
});

// Close Modal
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
  clearInputs();
});

// Save Task
saveTaskBtn.addEventListener("click", () => {
  const title = taskTitleInput.value.trim();
  const description = taskDescriptionInput.value.trim();

  if (title) {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.draggable = true;

    // Get current date and time
    const now = new Date();
    const timestamp = now.toLocaleString(); // Format: "MM/DD/YYYY, HH:MM:SS AM/PM"

    
    taskCard.innerHTML = `
      <h4>${title}</h4>
      <p>${description}</p>
      <small class="time-stamp"> ${timestamp}</small>
      <br>
      <br>
      <button class="edit-btn">Edit</button>
      <button class="delete-task-btn">Delete</button>
    `;

    // Add Start button to tasks in the To Do column
    const startBtn = document.createElement("button");
    startBtn.className = "start-btn";
    startBtn.textContent = "Start";
    taskCard.appendChild(startBtn);

    // Add task to the first column (To Do)
    document.querySelector("#todo .tasks").appendChild(taskCard);
    modal.style.display = "none";
    clearInputs();
    saveTasks(); // Save tasks to localStorage
    updateColumnCounts(); // Update column counts
  }
});

// Edit Task
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const taskCard = e.target.closest(".task-card");
    const title = taskCard.querySelector("h4").textContent;
    const description = taskCard.querySelector("p").textContent;

    // Open Edit Modal
    openEditModal(taskCard, title, description);
  }
});

// Open Edit Modal
function openEditModal(taskCard, title, description) {
  const editModal = document.createElement("div");
  editModal.className = "modal";
  editModal.innerHTML = `
    <div class="modal-content">
      <h3>Edit Task</h3>
      <input type="text" id="edit-task-title" value="${title}" placeholder="Task Title">
      <textarea id="edit-task-description" placeholder="Task Description">${description}</textarea>
      <button id="save-edit-btn">Save Changes</button>
      <button id="close-edit-btn">Close</button>
    </div>
  `;

  document.body.appendChild(editModal);
  editModal.style.display = "flex";

  // Save Edited Task
  const saveEditBtn = editModal.querySelector("#save-edit-btn");
  saveEditBtn.addEventListener("click", () => {
    const newTitle = editModal.querySelector("#edit-task-title").value.trim();
    const newDescription = editModal
      .querySelector("#edit-task-description")
      .value.trim();

    if (newTitle) {
      taskCard.querySelector("h4").textContent = newTitle;
      taskCard.querySelector("p").textContent = newDescription;
      saveTasks(); // Save tasks to localStorage
    }

    editModal.remove();
  });

  // Close Edit Modal
  const closeEditBtn = editModal.querySelector("#close-edit-btn");
  closeEditBtn.addEventListener("click", () => {
    editModal.remove();
  });
}

// Move Task to In Progress
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("start-btn")) {
    const taskCard = e.target.closest(".task-card");
    const inProgressColumn = document.querySelector("#in-progress .tasks");
    inProgressColumn.appendChild(taskCard);

    // Update timestamp
    const now = new Date();
    const timestamp = now.toLocaleString();
    const timestampElement = taskCard.querySelector("small");
    timestampElement.textContent = `${timestamp}`;

    // Replace Start button with Done button
    const doneBtn = document.createElement("button");
    doneBtn.className = "done-btn";
    doneBtn.textContent = "Done";
    taskCard.querySelector(".start-btn").replaceWith(doneBtn);
    saveTasks(); // Save tasks to localStorage
    updateColumnCounts(); // Update column counts
  }
});

// Move Task to Done
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("done-btn")) {
    const taskCard = e.target.closest(".task-card");
    const doneColumn = document.querySelector("#done .tasks");
    doneColumn.appendChild(taskCard);

    // Update timestamp
    const now = new Date();
    const timestamp = now.toLocaleString();
    const timestampElement = taskCard.querySelector("small");
    timestampElement.textContent = `${timestamp}`;

    // Remove Done button
    taskCard.querySelector(".done-btn").remove();
    saveTasks(); // Save tasks to localStorage
    updateColumnCounts(); // Update column counts
  }
});

// Delete Task
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-task-btn")) {
    e.target.parentElement.remove();
    saveTasks(); // Save tasks to localStorage after deletion
    updateColumnCounts(); // Update column counts
  }
});

// Drag and Drop
document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("task-card")) {
    e.dataTransfer.setData("text/plain", e.target.innerHTML);
    setTimeout(() => e.target.classList.add("hidden"), 0);
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("tasks")) {
    e.target.style.backgroundColor = "#f0f0f0";
  }
});

document.addEventListener("dragleave", (e) => {
  if (e.target.classList.contains("tasks")) {
    e.target.style.backgroundColor = "";
  }
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.target.classList.contains("tasks")) {
    const data = e.dataTransfer.getData("text/plain");
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.draggable = true;
    taskCard.innerHTML = data;
    e.target.appendChild(taskCard);
    e.target.style.backgroundColor = "";
    saveTasks(); // Save tasks to localStorage after moving
    updateColumnCounts(); // Update column counts
  }
});

document.addEventListener("dragend", (e) => {
  if (e.target.classList.contains("task-card")) {
    e.target.classList.remove("hidden");
  }
});

// Clear Inputs
function clearInputs() {
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
}

// Save Tasks to localStorage
function saveTasks() {
  const tasks = {};
  columns.forEach((column) => {
    const columnId = column.id;
    const columnTasks = Array.from(column.querySelectorAll(".task-card")).map(
      (task) => task.innerHTML
    );
    tasks[columnId] = columnTasks;
  });
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

// Load Tasks from localStorage
function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem("kanbanTasks"));
  if (savedTasks) {
    columns.forEach((column) => {
      const columnId = column.id;
      const columnTasks = savedTasks[columnId] || [];
      columnTasks.forEach((taskHTML) => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        taskCard.draggable = true;
        taskCard.innerHTML = taskHTML;

        // Remove existing buttons to avoid duplicates
        const existingButtons = taskCard.querySelectorAll("button");
        existingButtons.forEach((button) => button.remove());

        // Add Start or Done button based on the column
        if (columnId === "todo") {
          const startBtn = document.createElement("button");
          startBtn.className = "start-btn";
          startBtn.textContent = "Start";
          taskCard.appendChild(startBtn);
        } else if (columnId === "in-progress") {
          const doneBtn = document.createElement("button");
          doneBtn.className = "done-btn";
          doneBtn.textContent = "Done";
          taskCard.appendChild(doneBtn);
        }

        // Add Edit and Delete buttons
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        taskCard.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-task-btn";
        deleteBtn.textContent = "Delete";
        taskCard.appendChild(deleteBtn);

        column.querySelector(".tasks").appendChild(taskCard);
      });
    });
    updateColumnCounts(); // Update column counts after loading tasks
  }
}
// Update Column Counts
function updateColumnCounts() {
  columns.forEach((column) => {
    const columnId = column.id;
    const taskCount = column.querySelectorAll(".task-card").length;
    const header = column.querySelector(".column-header h3");
    header.textContent = `${columnId
      .replace("-", " ")
      .toUpperCase()} [${taskCount}]`;
  });
}
