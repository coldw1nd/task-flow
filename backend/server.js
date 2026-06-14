const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

const readTasksFromFile = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Ошибка чтения файла задач:', error);
        return [];
    }
};

const writeTasksToFile = (tasks) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error('Ошибка записи файла задач:', error);
    }
};

app.get('/api/tasks', (req, res) => {
    const tasks = readTasksFromFile();
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title, description, priority, status, dueDate } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Поле "Заголовок" обязательно для заполнения' });
    }

    const tasks = readTasksFromFile();
    const newTask = {
        id: Date.now().toString(),
        title,
        description: description || '',
        priority: priority || 'medium',
        status: status || 'todo',
        dueDate: dueDate || null,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    writeTasksToFile(tasks);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, dueDate } = req.body;
    
    let tasks = readTasksFromFile();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }

    const updatedTask = {
        ...tasks[taskIndex],
        title: title !== undefined ? title : tasks[taskIndex].title,
        description: description !== undefined ? description : tasks[taskIndex].description,
        priority: priority !== undefined ? priority : tasks[taskIndex].priority,
        status: status !== undefined ? status : tasks[taskIndex].status,
        dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
        updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;
    writeTasksToFile(tasks);
    res.json(updatedTask);
});


app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    let tasks = readTasksFromFile();
    const initialLength = tasks.length;
    
    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length === initialLength) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }

    writeTasksToFile(tasks);
    res.json({ message: 'Задача успешно удалена', id });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту http://localhost:${PORT}`);
});