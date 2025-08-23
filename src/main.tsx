import { createRoot } from 'react-dom/client';

// Simple App component without any dependencies
function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>KOLAB</h1>
      <p>Application is loading...</p>
    </div>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);
root.render(<App />);