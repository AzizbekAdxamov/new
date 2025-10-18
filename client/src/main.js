const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.apiBaseUrl) || 'http://localhost:4000/api';
const tasksEndpoint = `${API_BASE_URL}/tasks`;

const form = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const statusEl = document.getElementById('status');
const template = document.getElementById('task-template');
const editDialog = document.getElementById('edit-dialog');
const editForm = document.getElementById('edit-form');

const setStatus = (message, type = 'info') => {
  statusEl.textContent = message;
  if (message) {
    statusEl.dataset.type = type;
  } else {
    statusEl.removeAttribute('data-type');
  }
};

const formatDate = (isoString) => new Date(isoString).toLocaleString();

const createTaskElement = (task) => {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.id = task.id;

  const titleEl = node.querySelector('.task-title');
  const descriptionEl = node.querySelector('.task-description');
  const metaEl = node.querySelector('.task-meta');
  const toggleBtn = node.querySelector('[data-action="toggle"]');

  titleEl.textContent = task.title;
  descriptionEl.textContent = task.description || 'No description';
  metaEl.textContent = `Created: ${formatDate(task.createdAt)} | Updated: ${formatDate(task.updatedAt)}`;
  toggleBtn.textContent = task.completed ? 'Mark as pending' : 'Mark as done';
  node.classList.toggle('completed', task.completed);

  return node;
};

const fetchTasks = async () => {
  setStatus('Loading tasks...');
  try {
    const response = await fetch(tasksEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks (${response.status})`);
    }
    const tasks = await response.json();
    taskList.innerHTML = '';
    tasks.forEach((task) => taskList.appendChild(createTaskElement(task)));
    setStatus(tasks.length ? '' : 'No tasks yet. Create your first task!');
  } catch (error) {
    console.error(error);
    setStatus(error.message, 'error');
  }
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
};

const createTask = (task) => request(tasksEndpoint, {
  method: 'POST',
  body: JSON.stringify(task)
});

const replaceTask = (id, task) => request(`${tasksEndpoint}/${id}`, {
  method: 'PUT',
  body: JSON.stringify(task)
});

const updateTask = (id, partial) => request(`${tasksEndpoint}/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(partial)
});

const removeTask = (id) => request(`${tasksEndpoint}/${id}`, {
  method: 'DELETE'
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    await createTask(payload);
    form.reset();
    await fetchTasks();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

taskList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const li = button.closest('li');
  const id = li?.dataset.id;
  if (!id) return;

  if (button.dataset.action === 'delete') {
    try {
      await removeTask(id);
      li.remove();
      if (!taskList.children.length) {
        setStatus('No tasks yet. Create your first task!');
      }
    } catch (error) {
      setStatus(error.message, 'error');
    }
  } else if (button.dataset.action === 'toggle') {
    const shouldComplete = !li.classList.contains('completed');
    try {
      const updated = await updateTask(id, { completed: shouldComplete });
      li.replaceWith(createTaskElement(updated));
    } catch (error) {
      setStatus(error.message, 'error');
    }
  } else if (button.dataset.action === 'edit') {
    editDialog.dataset.id = id;
    editForm.title.value = li.querySelector('.task-title').textContent;
    const descriptionText = li.querySelector('.task-description').textContent;
    editForm.description.value = descriptionText === 'No description' ? '' : descriptionText;
    editForm.completed.checked = li.classList.contains('completed');
    editDialog.showModal();
  }
});

editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = editDialog.dataset.id;
  const formData = new FormData(editForm);
  const payload = Object.fromEntries(formData.entries());
  payload.completed = editForm.completed.checked;

  try {
    const updated = await replaceTask(id, payload);
    const li = taskList.querySelector(`li[data-id="${id}"]`);
    if (li) {
      li.replaceWith(createTaskElement(updated));
    }
    editDialog.close();
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

editDialog.addEventListener('close', () => {
  editForm.reset();
  delete editDialog.dataset.id;
});

fetchTasks();
