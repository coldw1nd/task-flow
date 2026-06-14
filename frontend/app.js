const API_URL = 'http://localhost:5000/api/tasks';

let tasksState = [];

const colTodo = document.getElementById('colTodo');
const colInProgress = document.getElementById('colInProgress');
const colDone = document.getElementById('colDone');

const countTodo = document.getElementById('countTodo');
const countInProgress = document.getElementById('countInProgress');
const countDone = document.getElementById('countDone');
const taskCounter = document.getElementById('taskCounter');

const filterPriority = document.getElementById('filterPriority');
const searchBar = document.getElementById('searchBar');

const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const btnAddTask = document.getElementById('btnAddTask');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancel = document.getElementById('btnCancel');
const statusGroup = document.getElementById('statusGroup');

const taskIdInput = document.getElementById('taskId');
const inputTitle = document.getElementById('inputTitle');
const inputDesc = document.getElementById('inputDesc');
const selectPriority = document.getElementById('selectPriority');
const inputDate = document.getElementById('inputDate');
const selectStatus = document.getElementById('selectStatus');

document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    initEventListeners();
    initDragAndDrop();
});

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка связи с API');
        tasksState = await response.json();
        renderBoard();
    } catch (error) {
        console.error('Ошибка при получении списка задач:', error);
        alert('Не удалось подключиться к серверу API бэкенда.');
    }
}

function renderBoard() {
    const priorityFilter = filterPriority.value;
    const searchQuery = searchBar.value.toLowerCase().trim();

    colTodo.innerHTML = '';
    colInProgress.innerHTML = '';
    colDone.innerHTML = '';

    let visibleTasksCount = 0;
    const counters = { todo: 0, in_progress: 0, done: 0 };

    tasksState.forEach(task => {
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return;

        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                              task.description.toLowerCase().includes(searchQuery);
        if (!matchesSearch) return;

        visibleTasksCount++;
        counters[task.status]++;

        const taskElement = createTaskCardElement(task);

        if (task.status === 'todo') {
            colTodo.appendChild(taskElement);
        } else if (task.status === 'in_progress') {
            colInProgress.appendChild(taskElement);
        } else if (task.status === 'done') {
            colDone.appendChild(taskElement);
        }
    });

    countTodo.textContent = counters.todo;
    countInProgress.textContent = counters.in_progress;
    countDone.textContent = counters.done;
    taskCounter.textContent = `Всего задач найдено: ${visibleTasksCount}`;
}

function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.classList.add('bg-white', 'p-4', 'rounded-md', 'shadow-sm', 'border', 'border-gray-200', 'cursor-grab', 'active:cursor-grabbing', 'relative', 'hover:shadow-md', 'transition-shadow');
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', task.id);

    let priorityBadgeColor = 'bg-gray-100 text-gray-800';
    let priorityText = 'Низкий';
    if (task.priority === 'medium') {
        priorityBadgeColor = 'bg-blue-100 text-blue-800';
        priorityText = 'Средний';
    } else if (task.priority === 'high') {
        priorityBadgeColor = 'bg-red-100 text-red-800';
        priorityText = 'Высокий';
    }

    const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : 'Нет срока';

    card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${priorityBadgeColor}">
                ${priorityText}
            </span>
            <div class="flex gap-1.5">
                <button class="btn-edit text-gray-400 hover:text-indigo-600 transition-colors" title="Редактировать">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button class="btn-delete text-gray-400 hover:text-red-600 transition-colors" title="Удалить">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </div>
        <h3 class="font-bold text-gray-800 text-sm mb-1 line-clamp-1">${task.title}</h3>
        <p class="text-xs text-gray-500 mb-3 line-clamp-2">${task.description || 'Без описания'}</p>
        <div class="flex items-center gap-1 text-[11px] text-gray-400">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>До: ${formattedDate}</span>
        </div>
    `;

    card.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(task);
    });

    card.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        card.classList.add('opacity-50');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('opacity-50');
    });

    return card;
}

function initEventListeners() {
    btnAddTask.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
    taskForm.addEventListener('submit', handleFormSubmit);

    filterPriority.addEventListener('change', renderBoard);
    searchBar.addEventListener('input', renderBoard);
}

function initDragAndDrop() {
    const columns = [colTodo, colInProgress, colDone];

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', async (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetStatus = column.getAttribute('data-status');

            if (taskId && targetStatus) {
                const taskIndex = tasksState.findIndex(t => t.id === taskId);
                if (taskIndex !== -1 && tasksState[taskIndex].status !== targetStatus) {
                    const oldStatus = tasksState[taskIndex].status;
                    tasksState[taskIndex].status = targetStatus;
                    renderBoard();

                    try {
                        const response = await fetch(`${API_URL}/${taskId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: targetStatus })
                        });
                        if (!response.ok) throw new Error();
                    } catch (error) {
                        console.error('Ошибка при обновлении статуса на бэкенде:', error);
                        tasksState[taskIndex].status = oldStatus;
                        renderBoard();
                    }
                }
            }
        });
    });
}

function openModal(task = null) {
    taskModal.classList.remove('hidden');
    if (task) {
        modalTitle.textContent = 'Редактировать задачу';
        taskIdInput.value = task.id;
        inputTitle.value = task.title;
        inputDesc.value = task.description;
        selectPriority.value = task.priority;
        inputDate.value = task.dueDate ? task.dueDate.substring(0, 10) : '';
        selectStatus.value = task.status;
        statusGroup.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Создать задачу';
        taskForm.reset();
        taskIdInput.value = '';
        statusGroup.classList.add('hidden');
    }
}

function closeModal() {
    taskModal.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = taskIdInput.value;
    const taskData = {
        title: inputTitle.value.trim(),
        description: inputDesc.value.trim(),
        priority: selectPriority.value,
        dueDate: inputDate.value || null
    };

    if (id) {
        taskData.status = selectStatus.value;
    }

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        }

        if (!response.ok) throw new Error();

        closeModal();
        await fetchTasks();
    } catch (error) {
        console.error('Ошибка сохранения задачи:', error);
        alert('Не удалось сохранить изменения.');
    }
}

async function deleteTask(id) {
    if (!confirm('Вы действительно хотите удалить эту задачу?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error();

        await fetchTasks();
    } catch (error) {
        console.error('Ошибка при удалении задачи:', error);
        alert('Не удалось удалить задачу.');
    }
}