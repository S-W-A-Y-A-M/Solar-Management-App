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
import './App.css';
import mqtt from 'mqtt';

const mqttBrokerUrl = 'ws://raspberrypi.local:9001';
const topics = {
  voltage: 'solar/voltage',
  smoke: 'solar/smoke',
  energy: 'solar/energy',
  maintenance: 'solar/maintenance',
  impact: 'solar/impact',
  microgrid: 'solar/microgrid',
  emergency: 'solar/emergency'
};

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
                location.pathname === link.path
                  ? 'bg-white text-primary fw-bold'
                  : 'text-white'
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
    <div className="card-body">{children}</div>
  </motion.div>
);

const useMQTTData = () => {
  const [data, setData] = useState({
    voltage: 0,
    smoke: 0,
    energy: 0,
    maintenance: "Operational",
    impact: 0,
    microgrid: "Stable",
    emergency: "Safe",
    energyHistory: [],
    impactHistory: []
  });

  useEffect(() => {
    const client = mqtt.connect(mqttBrokerUrl);

    client.on('connect', () => {
      console.log('Connected to MQTT Broker');
      Object.values(topics).forEach(topic => client.subscribe(topic));
    });

    client.on('message', (topic, message) => {
      const payload = message.toString();

      setData(prevData => {
        const updatedField = topic.split('/')[1];
        const value = isNaN(parseFloat(payload)) ? payload : parseFloat(payload);

        const updated = {
          ...prevData,
          [updatedField]: value
        };

        updated.energyHistory = [...prevData.energyHistory.slice(-19), { time: new Date().toLocaleTimeString(), energy: updated.energy }];
        updated.impactHistory = [...prevData.impactHistory.slice(-19), { time: new Date().toLocaleTimeString(), impact: updated.impact }];

        if (updated.voltage > 250 || updated.smoke > 5) {
          updated.emergency = "Critical Alert: Voltage/Smoke Level Exceeded!";
          updated.microgrid = "Shutting Down to Prevent Damage";
        } else if (
          updated.microgrid === "Shutting Down to Prevent Damage" &&
          updated.voltage <= 250 &&
          updated.smoke <= 5
        ) {
          updated.microgrid = "Stable";
          updated.emergency = "Safe";
        }

        if (updated.energy > 80) updated.impact += 1;
        if (updated.impact > 10) updated.maintenance = "Immediate Maintenance Required";

        return updated;
      });
    });

    return () => client.end();
  }, []);

  return data;
};

const EnergyTracker = () => {
  const { energyHistory } = useMQTTData();
  return (
    <Card title="🔋 Real-Time Energy Consumption">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={energyHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" />
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
};

const ImpactVisualizer = () => {
  const { impactHistory } = useMQTTData();

  return (
    <Card title="🌍 Environmental Impact Visualization">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={impactHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" />
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

const Maintenance = () => {
  const { maintenance } = useMQTTData();

  return (
    <Card title="🛠 Predictive Maintenance">
      <p className="fs-5 fw-medium">{maintenance}</p>
    </Card>
  );
};

const MicrogridControl = () => {
  const { microgrid } = useMQTTData();
  return (
    <Card title="⚡ Microgrid Status">
      <p className="fs-5 fw-medium">{microgrid}</p>
    </Card>
  );
};

const EmergencyAlerts = () => {
  const { emergency } = useMQTTData();
  return (
    <Card title="🚨 Emergency Alerts">
      <p className="fs-5 fw-bold text-danger">{emergency}</p>
    </Card>
  );
};

const Dashboard = () => (
  <div className="row">
    <div className="col-lg-6">
      <EnergyTracker />
      <Maintenance />
    </div>
    <div className="col-lg-6">
      <ImpactVisualizer />
      <MicrogridControl />
    </div>
    <div className="col-12">
      <EmergencyAlerts />
    </div>
  </div>
);

const SolarApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/energy-tracker" element={<EnergyTracker />} />
              <Route path="/impact-visualizer" element={<ImpactVisualizer />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/microgrid-control" element={<MicrogridControl />} />
              <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default SolarApp;
