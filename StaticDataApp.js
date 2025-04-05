import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation
} from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // You can create this file to add custom styles

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const Sidebar = () => {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Energy Tracker', path: '/energy-tracker' },
    { name: 'Impact Visualizer', path: '/impact-visualizer' },
    { name: 'Maintenance', path: '/maintenance' },
    { name: 'Microgrid Control', path: '/microgrid-control' },
    { name: 'Emergency Alerts', path: '/emergency-alerts' }
  ];

  return (
    <div className="sidebar bg-primary text-white p-4 vh-100">
      <h2 className="text-center mb-4">Menu</h2>
      <ul className="nav flex-column">
        {links.map(link => (
          <li className="nav-item mb-2" key={link.path}>
            <Link
              to={link.path}
              className={`nav-link ${
                location.pathname === link.path ? 'bg-white text-primary fw-bold' : 'text-white'
              }`}
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Card = ({ title, children }) => (
  <motion.div
    className="card mb-4 shadow-sm"
    variants={fadeIn}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.4 }}
  >
    <div className="card-header bg-light fw-bold text-primary">
      {title}
    </div>
    <div className="card-body">
      {children}
    </div>
  </motion.div>
);

const EnergyTracker = ({ energyData }) => (
  <Card title="🔋 Real-Time Energy Consumption">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={energyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="energy"
          stroke="#1e40af"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const ImpactVisualizer = ({ energyData }) => {
  const [impactData, setImpactData] = useState([]);

  useEffect(() => {
    setImpactData(
      energyData.map(({ timestamp, energy }) => ({
        timestamp,
        impact: energy * 0.1
      }))
    );
  }, [energyData]);

  return (
    <Card title="🌍 Environmental Impact Visualization">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={impactData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="impact"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

const Maintenance = ({ energyData }) => {
  const [status, setStatus] = useState('All systems operational');

  useEffect(() => {
    if (energyData.length) {
      const avg =
        energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length;
      setStatus(
        avg < 20
          ? '⚠️ Performance Degradation Detected!'
          : '✅ All systems operational'
      );
    }
  }, [energyData]);

  return (
    <Card title="🛠 Predictive Maintenance">
      <p className="fs-5 fw-medium">{status}</p>
    </Card>
  );
};

const MicrogridControl = ({ energyData }) => {
  const [gridStatus, setGridStatus] = useState('Stable');

  useEffect(() => {
    if (energyData.length) {
      const avg =
        energyData.reduce((sum, d) => sum + d.energy, 0) / energyData.length;
      setGridStatus(
        avg > 80 ? '⚠️ Overload' : avg < 20 ? '⚠️ Underutilized' : '✅ Stable'
      );
    }
  }, [energyData]);

  return (
    <Card title="⚡ Smart Microgrid Management">
      <p className="fs-5 fw-medium">Grid Status: {gridStatus}</p>
    </Card>
  );
};

const EmergencyAlerts = ({ energyData }) => {
  const [alert, setAlert] = useState('All systems operational');

  useEffect(() => {
    const interval = setInterval(() => {
      if (energyData.length) {
        const last = energyData.at(-1).energy;
        setAlert(
          last > 95 ? '🚨 High Energy Surge Detected!' : '✅ All systems operational'
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [energyData]);

  return (
    <Card title="🚨 Emergency Alerts">
      <p className="fs-5 fw-medium">{alert}</p>
    </Card>
  );
};

const Dashboard = ({ energyData }) => (
  <div className="row">
    <div className="col-lg-6">
      <EnergyTracker energyData={energyData} />
      <Maintenance energyData={energyData} />
    </div>
    <div className="col-lg-6">
      <ImpactVisualizer energyData={energyData} />
      <MicrogridControl energyData={energyData} />
    </div>
    <div className="col-12">
      <EmergencyAlerts energyData={energyData} />
    </div>
  </div>
);

const SolarApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rawEnergyData, setRawEnergyData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch('/data/energy_data.json')
      .then(res => res.json())
      .then(data => setRawEnergyData(data))
      .catch(err => console.error('Failed to load energy data:', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyData(prev => {
        if (index < rawEnergyData.length) {
          const newEntry = {
            energy: rawEnergyData[index].energy,
            timestamp: new Date().toLocaleTimeString()
          };
          setIndex(i => i + 1);
          return [...prev, newEntry];
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [index, rawEnergyData]);

  return (
    <Router>
      <div className="d-flex flex-column vh-100">
        <header className="bg-primary text-white p-3 d-flex justify-content-between align-items-center shadow">
          <h1 className="h4 m-0">🔆 Solar Energy Management</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-light text-primary"
          >
            ☰
          </button>
        </header>
        <div className="d-flex flex-grow-1">
          {sidebarOpen && <Sidebar />}
          <main className="flex-grow-1 p-4 bg-light overflow-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard energyData={energyData} />} />
              <Route path="/energy-tracker" element={<EnergyTracker energyData={energyData} />} />
              <Route path="/impact-visualizer" element={<ImpactVisualizer energyData={energyData} />} />
              <Route path="/maintenance" element={<Maintenance energyData={energyData} />} />
              <Route path="/microgrid-control" element={<MicrogridControl energyData={energyData} />} />
              <Route path="/emergency-alerts" element={<EmergencyAlerts energyData={energyData} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default SolarApp;
