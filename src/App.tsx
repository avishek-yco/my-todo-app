import React from 'react';
import TodoApp from './components/TodoApp'; 

const App: React.FC = () => {
  return (
    <div className="App" style={styles.appContainer}>
      <h1 style={styles.header}></h1>
      <TodoApp />
    </div>
  );
};

const styles = {
  appContainer: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f6fa',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center' as const,
    color: '#2c3e50',
  },
};

export default App;
