// Global state: stores all task objects and tracks the next unique ID
let tasks  = [];  // all task objects live here
let nextId = 1;   // increments each time a new task is created

let editingTaskId = null; // null = adding new task; number = editing existing
let activeColumn  = null; // which column's Add Task button was clicked

// ── createTaskCard(taskObj) ───────────────────────────────────────────────
// Builds a complete <li> card using only DOM
// Returns the finished <li> element
function createTaskCard(taskObj) {

  // Outer card: eg. <li data-id="1" data-priority="high" class="task-card">
  const li = document.createElement('li');
  li.setAttribute('data-id', taskObj.id);           // used to find this card later
  li.setAttribute('data-priority', taskObj.priority); // used by priority filter
  li.classList.add('task-card');

  // Title: eg. <span class="task-title">Buy groceries</span>
  const titleSpan = document.createElement('span');
  titleSpan.classList.add('task-title');
  titleSpan.textContent = taskObj.title; 

  // Description: eg. <p class="task-desc">Get milk and eggs</p>
  const descP = document.createElement('p');
  descP.classList.add('task-desc');
  descP.textContent = taskObj.description;

  // Priority badge: class name drives colour
  // eg. class="priority-badge priority-high" → red background
  const badge = document.createElement('span');
  badge.classList.add('priority-badge', 'priority-' + taskObj.priority);
  badge.textContent = taskObj.priority.charAt(0).toUpperCase() + taskObj.priority.slice(1);

  // Due date: eg. <span class="task-due">Due: 2025-12-01</span>
  const dueSpan = document.createElement('span');
  dueSpan.classList.add('task-due');
  dueSpan.textContent = taskObj.due ? 'Due: ' + taskObj.due : '';

  // Action buttons wrapper: eg. <div class="card-actions">
  const actions = document.createElement('div');
  actions.classList.add('card-actions');

  // Edit button: data-action and data-id are read by event delegation
  const editBtn = document.createElement('button');
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', taskObj.id);
  editBtn.textContent = 'Edit';

  // Delete button: same data attributes, different action value
  const deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', taskObj.id);
  deleteBtn.textContent = 'Delete';

  // Assemble: buttons → actions div → li
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  li.appendChild(titleSpan);
  li.appendChild(descP);
  li.appendChild(badge);
  li.appendChild(dueSpan);
  li.appendChild(actions);


  // ── Inline edit: double-click title to swap span for <input> ─────────────
  titleSpan.addEventListener('dblclick', function () {

    // make a text input with the current title
    const input = document.createElement('input');
    input.value = titleSpan.textContent;
    input.classList.add('task-title'); // keep the same visual style

    // swap text with the input box
    li.replaceChild(input, titleSpan);
    input.focus(); // immediately ready for the user to type

    // commitEdit: saves the new title and swaps input back to span
    function commitEdit() {
      const newTitle = input.value.trim() || titleSpan.textContent; // fallback to old title if empty
      titleSpan.textContent = newTitle;

      // find correct task and sync the change into the tasks array
      const task = tasks.find(t => t.id === taskObj.id);
      if (task) task.title = newTitle;

      li.replaceChild(titleSpan, input); // put the span back/ replace input with normal text again
    }

    // Press Enter key: commit immediately
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') commitEdit();
    });

    // Blur (click somewhere else): also commits
    input.addEventListener('blur', commitEdit);
  });


  return li; // caller(addTask) insert this into DOM
}

// ── addTask(columnId, taskObj) ────────────────────────────────────────────
function addTask(columnId, taskObj) {

  // Find the <ul class="task-list"> inside the target column by its id
  // e.g. columnId = 'todo' → selects <ul> inside <section id="todo">
  const list = document.querySelector('#' + columnId + ' .task-list');

  // Create a task card using the task data
  const card = createTaskCard(taskObj);

  // Add the new task card to the end of the list
  list.appendChild(card);

  // Add this task to the tasks array (so data stays updated)
  tasks.push(taskObj);

  // Refresh the counter badge in the header
  updateCounter();
}

// ── updateCounter() ───────────────────────────────────────────────────────
// Reads tasks.length (Updates the number of tasks shown in the header)
function updateCounter() {
  const countEl = document.getElementById('task-count');
  // Show total tasks and add "s" if more than 1
  countEl.textContent = tasks.length + ' task' + (tasks.length !== 1 ? 's' : '');
}

// ── deleteTask(taskId) ────────────────────────────────────────────────────
function deleteTask(taskId) {

  // Find the task card <li> that has the same data-id as taskId
  const card = document.querySelector('[data-id="' + taskId + '"]');
  if (!card) return; // If the task is not found, stop the function

  // Add fade-out class → trigger fadeOut animation
  card.classList.add('fade-out');

  // Wait for the animation to finish bfore doing anything else
  card.addEventListener('animationend', function () {
    card.remove();                                    // removes the task <li> from the DOM
    tasks = tasks.filter(t => t.id !== taskId);      // removes from array
    updateCounter();                                  // refresh badge=update ctr
  });
}

// ── editTask(taskId) ──────────────────────────────────────────────────────
function editTask(taskId) {

  // Find the task object in array by its id
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Store the id: use to call updateTask
  editingTaskId = taskId;

  // Pre-fill every modal field with the task's current values
  document.getElementById('task-title').value    = task.title;
  document.getElementById('task-desc').value     = task.description;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due').value      = task.due;

  // Show the modal by removing the hidden class
  document.getElementById('modal').classList.remove('hidden');
}

// ── updateTask(taskId, updatedData) ───────────────────────────────────────
function updateTask(taskId, updatedData) {

  // 1. Update the task object in memory
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  task.title       = updatedData.title;
  task.description = updatedData.description;
  task.priority    = updatedData.priority;
  task.due         = updatedData.due;

  // 2. Find the existing card element in the DOM
  const card = document.querySelector('[data-id="' + taskId + '"]');
  if (!card) return;

  // 3. Update each child's textContent individually — no innerHTML
  card.querySelector('.task-title').textContent = task.title;
  card.querySelector('.task-desc').textContent  = task.description;
  card.querySelector('.task-due').textContent   = task.due ? 'Due: ' + task.due : '';

  // 4. Reset priority badge: remove old priority class, apply new one
  const badge = card.querySelector('.priority-badge');
  badge.className = 'priority-badge priority-' + task.priority; // replaces all classes
  badge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  // 5. Update data-priority so the filter still works after editing
  card.setAttribute('data-priority', task.priority);
}


// ── openModal(columnId) ───────────────────────────────────────────────────
// open the popup to add new task
function openModal(columnId) {
  editingTaskId = null;     // edit=null:create a new task
  activeColumn  = columnId; // Save will pass this to addTask

  // Clear all fields so old data doesn't show
  document.getElementById('task-title').value    = '';
  document.getElementById('task-desc').value     = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-due').value      = '';

  document.getElementById('modal').classList.remove('hidden'); // show modal
}

// ── closeModal() ──────────────────────────────────────────────────────────
// close the popup
function closeModal() {
  document.getElementById('modal').classList.add('hidden'); // hide modal
}

// ── Save button ───────────────────────────────────────────────────────────
document.getElementById('save-btn').addEventListener('click', function () {
  const title = document.getElementById('task-title').value.trim(); //get the title
  if (!title) return; // stop if title is empty

// collect all input data into an object
  const data = {
    title:       title,
    description: document.getElementById('task-desc').value.trim(),
    priority:    document.getElementById('task-priority').value,
    due:         document.getElementById('task-due').value,
  };

  if (editingTaskId !== null) {
    updateTask(editingTaskId, data); // editing existing task
  } else {
    data.id = nextId++;              // assign id for new task
    addTask(activeColumn, data);     // insert into correct column
  }
  closeModal(); //close popup after saving
});

// ── Cancel button ─────────────────────────────────────────────────────────
// close popup when user click cancel
document.getElementById('cancel-btn').addEventListener('click', closeModal);

// ── Add Task buttons (event delegation on #board) ─────────────────────────
//One listener handles all Add task buttons click
document.getElementById('board').addEventListener('click', function (e) {
  if (e.target.classList.contains('add-task-btn')) {
    // data-column attribute tells: which column to add the task to
    openModal(e.target.getAttribute('data-column'));
  }
});

// ── Event delegation: Edit & Delete inside each column's <ul> ─────────────
// ONE listener per list handles all button clicks inside it
document.querySelectorAll('.task-list').forEach(function (list) {
  list.addEventListener('click', function (e) {
    const action = e.target.getAttribute('data-action'); // edit / delete
    const idStr  = e.target.getAttribute('data-id');  //get task id
    if (!action || !idStr) return; // ignore if click was not on a button

    const taskId = parseInt(idStr, 10); // convert string to number

    if (action === 'delete') deleteTask(taskId);
    if (action === 'edit')   editTask(taskId);
  });
});


// ── Priority filter ───────────────────────────────────────────────────────
// Runs every time the dropdown value changes
document.getElementById('priority-filter').addEventListener('change', function () {
  const selected = this.value; //  all/high/medium/low

  // Loop through every task card across all three columns
  document.querySelectorAll('.task-card').forEach(function (card) {
    const matches = selected === 'all' || card.getAttribute('data-priority') === selected;

    // If “all” → show everything // otherwise → show only matching priority
    card.classList.toggle('is-hidden', !matches);
  });
});

// ── Clear All done tasks ─────────────────────────────
document.getElementById('clear-done-btn').addEventListener('click', function () {

  // Select all task cards currently in the Done column
  const doneCards = document.querySelectorAll('#done .task-card');

  // extract the task id
  doneCards.forEach(function (card, index) {
    const taskId = parseInt(card.getAttribute('data-id'), 10);

    // Each card waits 100ms longer than the previous one before fading
    // index 0 → 0ms, index 1 → 100ms, index 2 → 200ms, etc.
    setTimeout(function () {
      deleteTask(taskId); // deleteTask handles fade-out + remove + counter update
    }, index * 100);
  });
});