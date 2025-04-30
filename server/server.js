const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors()); 

const todosFilePath = path.join(__dirname, 'todos.json');

const loadTodos = () => {
  try {
    const data = fs.readFileSync(todosFilePath);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveTodos = (todos) => {
  fs.writeFileSync(todosFilePath, JSON.stringify(todos, null, 2));
};

app.get('/todos', (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const todos = loadTodos();
  const newTodo = req.body;
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  let todos = loadTodos();
  todos = todos.filter(todo => todo.id !== id);
  saveTodos(todos);
  res.status(200).json({ message: 'Todo removed' });
});

app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const updatedTodo = req.body;
  let todos = loadTodos();
  todos = todos.map(todo => (todo.id === id ? updatedTodo : todo));
  saveTodos(todos);
  res.status(200).json(updatedTodo);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
