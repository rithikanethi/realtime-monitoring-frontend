import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    // Simulate fetching data every 5 seconds
    const fetchMockMetrics = () => {
      const now = new Date().toLocaleTimeString();
      const mock = [
        { name: "CPU Usage", value: `${Math.random().toFixed(2) * 100}%`, timestamp: now },
        { name: "Memory Usage", value: `${(Math.random() * 16).toFixed(2)} GB`, timestamp: now },
        { name: "Disk Usage", value: `${(Math.random() * 100).toFixed(2)}%`, timestamp: now },
      ];
      setMetrics(mock);
    };

    fetchMockMetrics();
    const interval = setInterval(fetchMockMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>📊 Real-Time Monitoring Dashboard</h1>
      <p>Mock metrics updated every 5 seconds.</p>

      <div className="metrics-container">
        {metrics.map((metric, idx) => (
          <div className="metric-card" key={idx}>
            <h2>{metric.name}</h2>
            <p className="value">{metric.value}</p>
            <p className="timestamp">{metric.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
     
