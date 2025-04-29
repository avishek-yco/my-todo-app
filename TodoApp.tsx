import React, { useState, useEffect } from 'react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  scheduledAt?: string;
  priority: number;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState(5);

  useEffect(() => {
    fetch('http://localhost:5000/todos')
      .then((response) => response.json())
      .then((data) => setTodos(data))
      .catch((error) => console.error('Error fetching todos:', error));
  }, []);

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem: TodoItem = {
        id: crypto.randomUUID(),
        text: newTodo,
        completed: false,
        createdAt: new Date().toISOString(),
        scheduledAt: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
        priority: priority,
      };

      fetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodoItem),
      })
        .then((response) => {
          if (response.ok) {
            setTodos((prevTodos) => [...prevTodos, newTodoItem]);
            setNewTodo('');
            setScheduledTime('');
            setPriority(5);
          }
        })
        .catch((error) => console.error('Error adding todo:', error));
    }
  };

  const removeTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);

    fetch(`http://localhost:5000/todos/${id}`, { method: 'DELETE' })
      .catch((error) => console.error('Error removing todo:', error));
  };

  const toggleComplete = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);

    const updatedTodo = updatedTodos.find(todo => todo.id === id);
    if (updatedTodo) {
      fetch(`http://localhost:5000/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      })
        .catch((error) => console.error('Error updating todo:', error));
    }
  };

  const sortedTodos = [...todos]
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.priority - a.priority;
    });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Todo App</h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
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
          disabled={!newTodo.trim()}
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

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              borderBottom: '1px solid #ddd',
              padding: '10px 0',
              marginBottom: '10px',
              fontSize: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, width: '100%' }}>
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
                  fontSize: '16px',
                  color: todo.completed ? '#aaa' : '#333',
                  minWidth: '200px',
                  fontWeight: '500',
                }}
              >
                {todo.text}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
              <span style={{ fontSize: '14px', color: '#f39c12', fontWeight: 'bold' }}>
                Priority: {todo.priority}
              </span>
              {todo.scheduledAt && (
                <span style={{ fontSize: '14px', color: '#2980b9' }}>
                  Scheduled: {new Date(todo.scheduledAt).toLocaleString()}
                </span>
              )}
            </div>

            {/* Remove Button */}
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
                marginTop: '10px',
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
