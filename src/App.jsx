import React, { useEffect, useState } from "react";
import "./App.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";
import { motion } from "framer-motion";
import logo from "./assets/niu-logo.png";

function App() {
  const [metrics, setMetrics] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [diskHistory, setDiskHistory] = useState([]);
  const [networkHistory, setNetworkHistory] = useState([]);
  const [tempHistory, setTempHistory] = useState([]);
  const [cpuValue, setCpuValue] = useState(50);
  const [memoryValue, setMemoryValue] = useState(8);
  const [diskValue, setDiskValue] = useState(40);
  const [networkValue, setNetworkValue] = useState(20);
  const [tempValue, setTempValue] = useState(50);
  const [darkMode, setDarkMode] = useState(false);
  const [contributor, setContributor] = useState("Rithika");
  const [cpuHighCount, setCpuHighCount] = useState(0);
  const [alertLogs, setAlertLogs] = useState([]);
  const [alertData, setAlertData] = useState([]);
  const [taskData, setTaskData] = useState([]);

  const contributors = ["Rithika", "Mani", "Anatoliy"];
  const toggleTheme = () => setDarkMode(prev => !prev);

  function smoothChange(prev, max, delta) {
    const change = (Math.random() - 0.5) * delta * 2;
    return parseFloat(Math.max(0, Math.min(max, prev + change)).toFixed(2));
  }

  const update = (prev, value) => {
    const now = new Date().toLocaleTimeString();
    return [...prev, { time: now, value }].slice(-12);
  };

  useEffect(() => {
    const fetchMetrics = () => {
      const now = new Date().toLocaleTimeString();
      const current = contributor;

      const newCpu = smoothChange(cpuValue, 100, 3);
      const newMemory = smoothChange(memoryValue, 16, 1);
      const newDisk = smoothChange(diskValue, 100, 2);
      const newNetwork = smoothChange(networkValue, 100, 4);
      const newTemp = smoothChange(tempValue, 90, 1.5);

      setCpuValue(newCpu);
      setMemoryValue(newMemory);
      setDiskValue(newDisk);
      setNetworkValue(newNetwork);
      setTempValue(newTemp);

      setCpuHistory(prev => update(prev, newCpu));
      setMemoryHistory(prev => update(prev, newMemory));
      setDiskHistory(prev => update(prev, newDisk));
      setNetworkHistory(prev => update(prev, newNetwork));
      setTempHistory(prev => update(prev, newTemp));

      setMetrics([
        { name: "CPU Usage", value: `${newCpu}%`, timestamp: now, contributor: current },
        { name: "Memory Usage", value: `${newMemory} GB`, timestamp: now, contributor: current },
        { name: "Disk Usage", value: `${newDisk}%`, timestamp: now, contributor: current },
        { name: "Network Usage", value: `${newNetwork}%`, timestamp: now, contributor: current },
        { name: "Temperature", value: `${newTemp} °C`, timestamp: now, contributor: current }
      ]);

      if (newCpu > 75) {
        setCpuHighCount(prev => {
          const newCount = prev + 1;
          const alertMessage =
            newCount >= 3
              ? `🚨 Escalation: CPU remains high for ${current} (Email sent to professor)`
              : `⚠️ Alert: CPU usage high for ${current} at ${newCpu.toFixed(2)}% (Email sent to ${current})`;

          setAlertLogs(logs => [
            ...logs,
            {
              time: now,
              contributor: current,
              level: newCount >= 3 ? "escalation" : "warning",
              message: alertMessage
            }
          ]);
          return newCount;
        });
      } else {
        setCpuHighCount(0);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [contributor]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts) setAlertData(data.alerts);
      })
      .catch((err) => console.error("Error fetching alerts:", err));

    fetch("http://127.0.0.1:8000/task-log")
      .then((res) => res.json())
      .then((data) => {
        if (data.log) setTaskData(data.log);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const exportToCSV = () => {
    const rows = ["Contributor,Metric,Value,Time,Severity"];
    alertData.forEach(alert => {
      rows.push(`${alert.contributor},${alert.metric},${alert.value},${alert.timestamp},${alert.severity}`);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alert_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderChart = (title, data, unit, color, domain) => (
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

  return (
    <div className={`dashboard ${darkMode ? "dark" : "light"}`}>
      <nav className="navbar">
        <div className="logo-title">
          <img src={logo} alt="NIU Logo" className="niu-logo" />
          <h1>📊 Real-Time Dashboard</h1>
        </div>
        <div className="nav-controls">
          <label>
            Select Contributor:
            <select value={contributor} onChange={(e) => setContributor(e.target.value)}>
              {contributors.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="export-btn" onClick={exportToCSV}>📥 Export Alerts CSV</button>
        </div>
      </nav>

      <p className="timestamp-note">Metrics update every 5 seconds for <strong>{contributor}</strong></p>

      {alertLogs.length > 0 && (
        <div className="alert-log-box">
          <h2>⚠️ Alert Log Timeline</h2>
          <ul>
            {alertLogs.slice(-5).map((log, i) => (
              <li key={i} className={log.level}>[{log.time}] {log.message}</li>
            ))}
          </ul>
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
            <p className="contributor">👤 {metric.contributor}</p>
          </motion.div>
        ))}
      </div>
      {renderChart("CPU Usage Over Time", cpuHistory, "%", "#3b82f6", [0, 100])}
      {renderChart("Memory Usage Over Time", memoryHistory, "GB", "#10b981", [0, 20])}
      {renderChart("Disk Usage Over Time", diskHistory, "%", "#f97316", [0, 100])}
      {renderChart("Temperature Over Time", tempHistory, "°C", "#facc15", [30, 90])}
      <motion.div className="chart-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
  <h2>Network Usage (Bar Chart)</h2>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={networkHistory}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="time" />
      <YAxis unit="%" domain={[0, 100]} />
      <Tooltip />
      <Bar dataKey="value" fill="#60a5fa" />
    </BarChart>
  </ResponsiveContainer>
</motion.div>
      <motion.div className="task-log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>📋 Task Timeline</h2>
        <div className="task-list">
          {taskData.length === 0 ? (
            <p>No task history found.</p>
          ) : (
            <ul>
              {taskData.map((task, index) => (
                <li key={index}>
                  <strong>{task.timestamp}</strong> — {task.task} by <b>{task.contributor}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      <motion.div className="chart-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2>⚠️ Historical Alerts</h2>
        {alertData.length === 0 ? (
          <p>No alerts found.</p>
        ) : (
          <ul className="alert-timeline">
            {alertData.map((alert, index) => (
              <li key={index} className="alert-item">
                <strong>{alert.timestamp}</strong> — <span className="alert-metric">{alert.metric}</span> was <span className="alert-value">{alert.value}</span> for <b>{alert.contributor}</b> ({alert.severity})
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <footer className="footer">
        <p>© 2025 Rithika Nethi | <a href="https://github.com/rithikanethi/real-time-monitoring-dashboard" target="_blank" rel="noreferrer">GitHub</a></p>
      </footer>
    </div>
  );
}

export default App;
