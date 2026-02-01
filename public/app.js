const API = "http://localhost:3000/api/tasks";
const sidebar = document.getElementById("sidebar");

// Global application state
const appState = {
  tasks: [],
  categories: [],
  categoriesFromServer: false,
  categoriesMap: {}
};

// --- Local storage helpers ---
function saveTasksToStorage() {
  try {
    localStorage.setItem('tasks', JSON.stringify(appState.tasks));
  } catch (err) {
    console.warn('Failed to save tasks to localStorage', err);
  }
}

function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem('tasks');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      appState.tasks = parsed;
    }
  } catch (err) {
    console.warn('Failed to load tasks from localStorage', err);
  }
}

// Initialize app state from localStorage (if present)
loadTasksFromStorage();

// Auto-resize textarea по высоте контента
const textarea = document.getElementById("description");
textarea.addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
});

// Categories support (fetch from server or fall back to defaults)
const defaultCategories = [
  { id: 'work', name: 'Work' },
  { id: 'study', name: 'Study' },
  { id: 'personal', name: 'Personal' }
];


async function loadCategories() {
  const select = document.getElementById('category');
  select.innerHTML = '';
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const cats = await res.json();
      if (Array.isArray(cats) && cats.length > 0) {
        appState.categoriesFromServer = true;
        appState.categories = cats;
        cats.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c._id;
          opt.textContent = c.name;
          select.appendChild(opt);
          appState.categoriesMap[c._id] = c.name;
        });
        return;
      }
    }
  } catch (err) {
    // ignore, we'll fall back to defaults
  }

  // Fallback to default categories (frontend-only)
  appState.categoriesFromServer = false;
  appState.categories = defaultCategories.slice();
  defaultCategories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.name;
    select.appendChild(opt);
    appState.categoriesMap[c.name] = c.name;
  });
}


function toggleSidebar() {
  sidebar.classList.toggle("open");
}

// Закрыть сайдбар при клике вне его
document.addEventListener("click", function(event) {
  if (!sidebar.contains(event.target) && 
      !event.target.classList.contains("menu-btn") &&
      sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
});
// ------------------
// Delegated delete handler (single listener)
// ------------------
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (!id) return;
  // Call deleteTask which will call the backend and update appState on success
  deleteTask(id);
});
// ------------------
// View navigation (SPA-style)
// ------------------
const headerTitle = document.querySelector('.header h3');
function showView(viewId, title) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active'); v.hidden = true;
  });
  const view = document.getElementById(viewId);
  if (view) { view.classList.add('active'); view.hidden = false; }

  // Update active button
  document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.sidebar button[data-view="${viewId.replace('view-','')}"]`);
  if (btn) btn.classList.add('active');

  // Update header title
  if (headerTitle && title) headerTitle.textContent = title;

  // If showing dashboard, reload tasks so counts are fresh
  if (viewId === 'view-dashboard') renderAll();
}

// Setup sidebar listeners
document.querySelectorAll('.sidebar button[data-view]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const view = btn.getAttribute('data-view');
    const viewId = 'view-' + view;
    showView(viewId, btn.textContent.trim());
    // Close sidebar on mobile after navigation
    sidebar.classList.remove('open');
  });
});function createEmptyState(title, subtitle) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';
  const icon = document.createElement('div');
  icon.className = 'empty-icon';
  icon.textContent = '🗂️';
  const h4 = document.createElement('h4'); h4.textContent = title;
  const p = document.createElement('p'); p.textContent = subtitle;
  wrapper.appendChild(icon); wrapper.appendChild(h4); wrapper.appendChild(p);
  return wrapper;
}

function createTaskElement(t) {
  const div = document.createElement('div');
  div.className = 'task';

  const left = document.createElement('div');
  const titleEl = document.createElement('b'); titleEl.textContent = t.title;
  const p = document.createElement('p'); p.textContent = t.description;
  const badge = document.createElement('span'); badge.className = `badge ${t.priority}`; badge.textContent = t.priority;

  // Category label (resolve from populated object, client-side name, or id mapping)
  const categoryLabel = (t.category && t.category.name) || t.categoryName || appState.categoriesMap[t.category] || t.category;
  let categoryEl = null;
  if (categoryLabel) {
    categoryEl = document.createElement('span');
    categoryEl.className = 'category-tag';
    categoryEl.textContent = categoryLabel;
  }

  left.appendChild(titleEl);
  if (categoryEl) left.appendChild(categoryEl);
  left.appendChild(p);
  left.appendChild(badge);

  const btn = document.createElement('button');
  btn.className = 'delete-btn';
  btn.setAttribute('data-id', t._id);
  btn.setAttribute('aria-label', 'Delete task');
  btn.textContent = '✕';

  div.appendChild(left);
  div.appendChild(btn);
  return div;
}

function updateStats() {
  const tasks = appState.tasks;
  document.getElementById("total").innerText = tasks.length;
  document.getElementById("high").innerText = tasks.filter(t=>t.priority==="high").length;
  document.getElementById("progress").innerText = tasks.filter(t=>t.status==="in_progress").length;
}

function renderAll() {
  const tasks = appState.tasks;
  // Recent
  const recentContainer = document.getElementById('recent-tasks');
  recentContainer.innerHTML = '';
  const recent = tasks.slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);
  if (recent.length === 0) {
    recentContainer.appendChild(createEmptyState('No recent tasks', 'Create a task to see it here'));
  } else {
    recent.forEach(t => recentContainer.appendChild(createTaskElement(t)));
  }

  // All
  const list = document.getElementById('tasks');
  list.innerHTML = '';
  if (tasks.length === 0) {
    list.appendChild(createEmptyState('No tasks yet', 'Use the form to add your first task'));
  } else {
    tasks.forEach(t => list.appendChild(createTaskElement(t)));
  }

  updateStats();
}
async function loadTasks() {
  try {
    const res = await fetch(API);
    const tasks = await res.json();
    // On initial load, adopt server tasks but keep any local-only tasks (merge)
    const serverTasks = Array.isArray(tasks) ? tasks : [];
    // Keep local temporary tasks (ids starting with 'local-') and merge them after server list
    const localTemps = appState.tasks.filter(t => String(t._id).startsWith('local-'));
    appState.tasks = serverTasks.concat(localTemps);
    // Persist merged result so refresh keeps the merged state
    saveTasksToStorage();
  } catch (err) {
    console.warn('Failed to load tasks from server, using local cache');
    // leave appState.tasks as-is (preserve local changes)
  }
  renderAll();
}

async function createTask(){
  const titleEl = document.getElementById('title');
  const descriptionEl = document.getElementById('description');
  const assignedEl = document.getElementById('assignedTo');
  const createdEl = document.getElementById('createdBy');
  const priorityEl = document.getElementById('priority');

  const categoryEl = document.getElementById('category');
  const selectedCategoryValue = categoryEl ? categoryEl.value : null;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in as an admin to create tasks. Please log in.');
    return;
  }

  const payload = {
    title: titleEl.value,
    description: descriptionEl.value,
    assignedTo: assignedEl.value,
    createdBy: createdEl.value,
    priority: priorityEl.value
  };
  if (appState.categoriesFromServer && selectedCategoryValue) payload.category = selectedCategoryValue;

  try {
    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json", 'Authorization': 'Bearer ' + token },
      body:JSON.stringify(payload)
    });

    // Read body once as text, then attempt to parse JSON and reuse parsed object
    const text = await res.text();
    let created = null;
    try {
      created = text ? JSON.parse(text) : null;
    } catch (err) {
      created = null;
    }

    if (res.status === 401 || res.status === 403) {
      alert('Permission denied: admin access required to create tasks.');
      console.error('Create failed authorization', res.status, text);
      return;
    }

    if (res.ok) {
      if (!created) {
        alert('Server returned an invalid response.');
        console.error('Expected JSON body on successful create but got:', text);
        return;
      }
      // Add server-confirmed task
      appState.tasks.push(created);
      if (created.category && created.category._id && created.category.name) {
        appState.categoriesMap[created.category._id] = created.category.name;
      }
      saveTasksToStorage();
      renderAll();
      // Reset inputs after successful create
      titleEl.value = descriptionEl.value = assignedEl.value = createdEl.value = "";
    } else {
      alert('Failed to create task: ' + res.status + ' ' + text);
      console.error('Server responded with error when creating task:', res.status, text);
    }
  } catch (err) {
    alert('An error occurred while creating the task.');
    console.error('Failed to send new task to server:', err.message);
  }
}

async function deleteTask(id){
  // If this is a local temporary task (not yet on server), remove locally immediately
  if (String(id).startsWith('local-')) {
    const idx = appState.tasks.findIndex(t => t._id === id);
    if (idx !== -1) {
      appState.tasks.splice(idx,1);
      saveTasksToStorage();
      renderAll();
    }
    return;
  }

  // For server-backed tasks, call DELETE and only update local state on success
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in as an admin to delete tasks. Please log in.');
      return;
    }

    const url = `${API}/${id}`;
    const res = await fetch(url, { method: "DELETE", headers: { 'Authorization': 'Bearer ' + token } });

    const text = await res.text();

    if (res.status === 401 || res.status === 403) {
      alert('Permission denied: admin access required to delete tasks.');
      console.error('Delete failed with authorization error', res.status, text);
      return;
    }

    if (res.ok || res.status === 404) {
      const idx = appState.tasks.findIndex(t => t._id === id);
      if (idx !== -1) {
        appState.tasks.splice(idx,1);
        saveTasksToStorage();
        renderAll();
      }
    } else {
      alert('Failed to delete task: ' + res.status + ' ' + text);
      console.error('Server failed to delete task:', res.status, text);
    }
  } catch (err) {
    alert('An error occurred while deleting the task.');
    console.error('Failed to delete task on server:', err);
  }
}

// Initialize categories, then load tasks
loadCategories().then(() => loadTasks());
