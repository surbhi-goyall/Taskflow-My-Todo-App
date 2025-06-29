document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("taskflowUser"));
  if (!currentUser || !currentUser.name) {
    return (window.location.href = "index.html");
  }

  const username = currentUser.name.trim();
  const usernameDisplay = document.getElementById("username");
  const avatar = document.getElementById("avatar");
  const signOutBtn = document.getElementById("signout");

  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");

  const tabButtons = document.querySelectorAll(".tab-btn");
  const columns = {
    todo: document.getElementById("todo"),
    completed: document.getElementById("completed"),
    archived: document.getElementById("archived"),
  };

  const clearArchivedBtn = document.getElementById("clearArchivedBtn");

  clearArchivedBtn.addEventListener("click", () => {
  const beforeCount = tasks.length;
  tasks = tasks.filter(task => task.stage !== "archived");
  saveTasks();
  renderTasks();
  showToast(`${beforeCount - tasks.length} archived tasks deleted.`);
  });


  // Set user profile info
  usernameDisplay.textContent = username;
  avatar.src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(username)}`;

  // Sign out
  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("taskflowUser");
    window.location.href = "index.html";
  });

  // Load or initialize user's tasks
  let allUsersTasks = JSON.parse(localStorage.getItem("taskflowUsers")) || {};
  let tasks = [];

  // First-time user: load DummyJSON todos
  if (!allUsersTasks[username]) {
    try {
      const res = await fetch("https://dummyjson.com/todos");
      const data = await res.json();
      const dummyTodos = data.todos.slice(0, 10).map((item, index) => ({
        id: Date.now() + index,
        text: item.todo,
        stage: "todo",
        updatedAt: new Date().toLocaleString()
      }));

      allUsersTasks[username] = dummyTodos;
      localStorage.setItem("taskflowUsers", JSON.stringify(allUsersTasks));
      tasks = dummyTodos;
    } catch (err) {
      console.error("Error fetching initial dummy todos:", err);
      allUsersTasks[username] = [];
      localStorage.setItem("taskflowUsers", JSON.stringify(allUsersTasks));
    }
  } else {
    tasks = allUsersTasks[username];
  }

  renderTasks();

  // Save tasks for the current user
  function saveTasks() {
    allUsersTasks[username] = tasks;
    localStorage.setItem("taskflowUsers", JSON.stringify(allUsersTasks));
  }

  // Add new task
  addTaskBtn.addEventListener("click", () => {
    const value = taskInput.value.trim();
    if (!value) return;

    tasks.push({
      id: Date.now(),
      text: value,
      stage: "todo",
      updatedAt: new Date().toLocaleString()
    });

    saveTasks();
    renderTasks();
    taskInput.value = "";
  });

  // Submit task on Enter key
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); 
    addTaskBtn.click(); 
  }
});


  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      Object.keys(columns).forEach(stage => {
        columns[stage].style.display = stage === btn.dataset.tab ? "block" : "none";
      });
    });
  });

  // Show Todo tab by default
  tabButtons[0].click();

  // Render all tasks
  function renderTasks() {
    Object.values(columns).forEach(col => col.querySelector(".task-list").innerHTML = "");

    const countMap = { todo: 0, completed: 0, archived: 0 };

    tasks.forEach(task => {
      const taskCard = createTaskCard(task);
      columns[task.stage].querySelector(".task-list").appendChild(taskCard);
      countMap[task.stage]++;
    });

    document.getElementById("todo-count").textContent = countMap.todo;
    document.getElementById("completed-count").textContent = countMap.completed;
    document.getElementById("archived-count").textContent = countMap.archived;
  }

  // Task card HTML
  function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";

    const time = new Date(task.updatedAt).toLocaleString();

    let actionBtns = "";
    if (task.stage === "todo") {
      actionBtns = `
        <button class="btn green" onclick="updateTask(${task.id}, 'completed')">Mark as Completed</button>
        <button class="btn archive" onclick="updateTask(${task.id}, 'archived')">🗑️ Archive</button>
      `;
    } else if (task.stage === "completed") {
      actionBtns = `
        <button class="btn archive" onclick="updateTask(${task.id}, 'archived')">🗑️ Archive</button>
      `;
    }

    card.innerHTML = `
      <div class="task-header">
        <p class="task-text">${task.text}</p>
        <div class="task-footer">
          Last modified at:<br><span>${time}</span>
        </div>
      </div>
      ${task.stage === "archived" ? `<p class="task-label">Archived</p>` : ""}
      <div class="actions">${actionBtns}</div>
    `;

    return card;
  }

  // Update stage of a task
  window.updateTask = (id, newStage) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index].stage = newStage;
      tasks[index].updatedAt = new Date().toLocaleString();
      saveTasks();
      renderTasks();
      showToast(`Task moved to ${capitalize(newStage)}.`);
    }
  };

  // Toast
  function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>Task Updated</strong><p>${message}</p>`;

  // Add toast to the top container
  document.body.appendChild(toast);

  // Automatically remove after 3s
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500); 
  }, 3000);
}


  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
