import React, { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";
import { motion } from "framer-motion";

function App() {
  const [metrics, setMetrics] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [diskHistory, setDiskHistory] = useState([]);
  const [networkHistory, setNetworkHistory] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [cpuValue, setCpuValue] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const teamMembers = ["Rithika N", "Mani K", "Anatoliy"];

  const toggleTheme = () => setDarkMode(prev => !prev);

  useEffect(() => {
    const fetchMockMetrics = () => {
      const now = new Date().toLocaleTimeString();
      const member = teamMembers[Math.floor(Math.random() * teamMembers.length)];

      const cpu = parseFloat((Math.random() * 100).toFixed(2));
      const memory = parseFloat((Math.random() * 16).toFixed(2));
      const disk = parseFloat((Math.random() * 100).toFixed(2));
      const network = parseFloat((Math.random() * 100).toFixed(2));
      const temperature = parseFloat((30 + Math.random() * 50).toFixed(2));

      const newMetrics = [
        { name: "CPU Usage", value: `${cpu}%`, timestamp: now, contributor: member },
        { name: "Memory Usage", value: `${memory} GB`, timestamp: now, contributor: member },
        { name: "Disk Usage", value: `${disk}%`, timestamp: now, contributor: member },
        { name: "Network Usage", value: `${network}%`, timestamp: now, contributor: member },
        { name: "Temperature", value: `${temperature} °C`, timestamp: now, contributor: member },
      ];

      setMetrics(newMetrics);
      setCpuValue(cpu);

      const update = (prev, value) => [...prev, { time: now, value }].slice(-12);

      setCpuHistory(prev => update(prev, cpu));
      setMemoryHistory(prev => update(prev, memory));
      setDiskHistory(prev => update(prev, disk));
      setNetworkHistory(prev => update(prev, network));
      setTempHistory(prev => update(prev, temperature));
    };

    fetchMockMetrics();
    const interval = setInterval(fetchMockMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      <nav className="navbar">
        <h1>📊 Real-Time Dashboard</h1>
        <div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            className="export-btn"
            onClick={() => {
              const csvContent = `data:text/csv;charset=utf-8,${[
                ["Metric Name", "Value", "Timestamp"],
                ...metrics.map((m) => [m.name, m.value, m.timestamp]),
              ]
                .map((e) => e.join(","))
                .join("\n")}`;
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "system_metrics.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </nav>

      <div className="animated-background" />

      <p className="timestamp-note">Mock metrics updated every 5 seconds.</p>

      {cpuValue > 90 && (
        <div className="alert-box">
          ⚠️ High CPU Usage: {cpuValue.toFixed(2)}% <br />
          📧 Alert email has been sent to: <strong>lzhang@niu.edu</strong> <br />
          ⏰ {new Date().toLocaleTimeString()}
        </div>
      )}

      <div className="metrics-container">
        {metrics.map((metric, idx) => (
          <motion.div
            className="metric-card"
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <h2>{metric.name}</h2>
            <p className="value">{metric.value}</p>
            <p className="timestamp">{metric.timestamp}</p>
            <p className="contributor">👤 Submitted by: {metric.contributor}</p>
          </motion.div>
        ))}
      </div>

      {renderChartSection("CPU Usage Over Time", cpuHistory, "%", "#8884d8")}
      {renderChartSection("Memory Usage Over Time", memoryHistory, "GB", "#82ca9d", [0, 20])}
      {renderChartSection("Disk Usage Over Time", diskHistory, "%", "#ff7f50")}

      <motion.div className="chart-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
        <h2>Network Usage (Bar Chart)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={networkHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip />
            <Bar dataKey="value" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {renderChartSection("Temperature Over Time", tempHistory, "°C", "#facc15", [30, 90])}

      <footer className="footer">
        <p>© 2025 Rithika Nethi | <a href="https://github.com/rithikanethi/real-time-monitoring-dashboard" target="_blank" rel="noreferrer">GitHub</a></p>
      </footer>
    </div>
  );

  function renderChartSection(title, data, unit, color, domain = [0, 100]) {
    return (
      <motion.div className="chart-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h2>{title}</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={domain} unit={unit} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }
}

export default App;

