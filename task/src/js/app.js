const deadlineInput = document.getElementById('deadline');
const taskInput = document.getElementById('task');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

const API_URL = 'http://localhost:3000/api/tasks';

// ページ読み込み時に既存のタスクを取得
window.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch(API_URL);
  const tasks = await response.json();
  tasks.forEach(task => addTaskToDOM(task));
});

// タスク追加ボタン
addTaskButton.addEventListener('click', async () => {
  const taskText = taskInput.value.trim();
  const deadline = deadlineInput.value;

  if (!taskText || !deadline) {
    alert('期限日とタスク内容を入力してください。');
    return;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deadline, task: taskText }),
  });

  const newTask = await response.json();
  addTaskToDOM(newTask);

  taskInput.value = '';
  deadlineInput.value = '';
  taskInput.focus();
});

// タスクを画面に表示
function addTaskToDOM(task) {
  const li = document.createElement('li');
  li.dataset.taskId = task.id;

  const deadlineCol = document.createElement('span');
  deadlineCol.className = 'col deadline';
  deadlineCol.textContent = task.deadline;

  const taskCol = document.createElement('span');
  taskCol.className = 'col task';
  taskCol.textContent = task.task;

  const radioName = `status_${task.id}`;
  const statuses = ['undone', 'done', 'delete'];
  const currentStatus = task.is_deleted
    ? 'delete'
    : task.is_done
    ? 'done'
    : 'undone';

  const statusCols = statuses.map(status => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = radioName;
    radio.value = status;
    radio.checked = currentStatus === status;

    const wrapper = document.createElement('span');
    wrapper.className = 'col status';
    wrapper.appendChild(radio);
    return wrapper;
  });

  const execButton = document.createElement('button');
  execButton.textContent = '実行';
  execButton.className = 'exec-button';

  execButton.addEventListener('click', async () => {
    const selected = li.querySelector(`input[name="${radioName}"]:checked`).value;
    const is_done = selected === 'done';
    const is_deleted = selected === 'delete';

    const response = await fetch(`${API_URL}/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done, is_deleted }),
    });

    const updated = await response.json();

    if (updated.is_deleted) {
      li.remove();
    } else {
      if (updated.is_done) {
        taskCol.classList.add('line-through');
        deadlineCol.classList.add('line-through');
      } else {
        taskCol.classList.remove('line-through');
        deadlineCol.classList.remove('line-through');
      }
    }
  });

  const execCol = document.createElement('span');
  execCol.className = 'col status';
  execCol.appendChild(execButton);

  li.appendChild(deadlineCol);
  li.appendChild(taskCol);
  statusCols.forEach(col => li.appendChild(col));
  li.appendChild(execCol);

  if (task.is_done) {
    taskCol.classList.add('line-through');
    deadlineCol.classList.add('line-through');
  }

  taskList.appendChild(li);
}