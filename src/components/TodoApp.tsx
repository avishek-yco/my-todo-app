import React, { useState, useEffect } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  scheduledAt?: string;
  priority: number;
  name: string;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState(5);
  const [name, setName] = useState('');
  const [editTodoId, setEditTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState(5);
  const [editName, setEditName] = useState('');
  const [editScheduledTime, setEditScheduledTime] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error('Error fetching todos:', err));
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim() || !name.trim()) return;

    const newTodoItem: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      scheduledAt: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      priority,
      name: name.trim(),
    };

    try {
      const res = await fetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodoItem),
      });

      if (res.ok) {
        setTodos((prev) => [...prev, newTodoItem]);
        setNewTodo('');
        setScheduledTime('');
        setPriority(5);
        setName('');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const removeTodo = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Error removing todo:', err);
    }
  };

  const toggleComplete = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);

    const updatedTodo = updatedTodos.find((todo) => todo.id === id);
    if (!updatedTodo) return;

    try {
      await fetch(`http://localhost:5000/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const startEditing = (todo: TodoItem) => {
    setEditTodoId(todo.id);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditName(todo.name);
    setEditScheduledTime(todo.scheduledAt ? new Date(todo.scheduledAt).toISOString().slice(0, 16) : '');
  };

  const cancelEditing = () => {
    setEditTodoId(null);
    setEditText('');
    setEditPriority(5);
    setEditName('');
    setEditScheduledTime('');
  };

  const updateTodo = async () => {
    if (!editText.trim() || !editName.trim()) return;

    const updatedTodo = {
      id: editTodoId!,
      text: editText.trim(),
      completed: false,
      priority: editPriority,
      name: editName.trim(),
      scheduledAt: editScheduledTime ? new Date(editScheduledTime).toISOString() : undefined,
    };

    try {
      const res = await fetch(`http://localhost:5000/todos/${editTodoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      });

      if (res.ok) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === editTodoId ? { ...todo, ...updatedTodo } : todo
          )
        );
        cancelEditing();
      }
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.priority - a.priority;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Todo App</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Name"
          style={{ padding: '8px', width: '150px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          style={{ padding: '8px', width: '250px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          style={{ padding: '6px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="number"
          min="1"
          max="10"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          style={{ padding: '6px', width: '60px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          onClick={addTodo}
          disabled={!newTodo.trim() || !name.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Add
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              borderBottom: '1px solid #ddd',
              padding: '10px 0',
              marginBottom: '10px',
              fontSize: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id)}
                style={{ marginRight: '15px' }}
              />
              <span
                style={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  marginRight: '20px',
                  color: todo.completed ? '#aaa' : '#333',
                  fontWeight: '500',
                  minWidth: '200px',
                }}
              >
                {todo.text}
              </span>
              <button
                onClick={() => startEditing(todo)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginLeft: '10px',
                }}
              >
                Edit
              </button>
              <button
                onClick={() => removeTodo(todo.id)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  marginLeft: '10px',
                }}
              >
                Remove
              </button>
            </div>

            <div style={{ marginTop: '5px' }}>
              <span style={{ fontSize: '14px', color: '#f39c12', fontWeight: 'bold' }}>
                Priority: {todo.priority}
              </span>
              {todo.scheduledAt && (
                <div style={{ fontSize: '14px', color: '#2980b9' }}>
                  Scheduled: {new Date(todo.scheduledAt).toLocaleString()}
                </div>
              )}
              <div style={{ fontSize: '14px', color: '#8e44ad' }}>
                Name: {todo.name}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editTodoId && (
        <div style={{ marginTop: '20px' }}>
          <h2>Edit Todo</h2>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter Name"
            style={{ padding: '8px', width: '150px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ padding: '8px', width: '250px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="number"
            min="1"
            max="10"
            value={editPriority}
            onChange={(e) => setEditPriority(Number(e.target.value))}
            style={{ padding: '6px', width: '60px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="datetime-local"
            value={editScheduledTime}
            onChange={(e) => setEditScheduledTime(e.target.value)}
            style={{ padding: '6px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            onClick={updateTodo}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Update
          </button>
          <button
            onClick={cancelEditing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
              fontWeight: 'bold',
              marginLeft: '10px',
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TodoApp;
