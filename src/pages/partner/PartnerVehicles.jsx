import React, { useState } from 'react';
import {
  Car,
  Truck,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Search
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';

const INITIAL_VEHICLES = [
  {
    id: 'VEH-01',
    regNumber: 'KA-01-EQ-9421',
    model: 'Ather 450X EV',
    type: 'Electric Two-Wheeler',
    capacity: '40 kg (Parcel Box)',
    assignedTo: 'Ramesh Kumar (Courier Staff)',
    status: 'In Transit',
    fuel: 'Electric (100% Zero Emissions)',
  },
  {
    id: 'VEH-02',
    regNumber: 'KA-03-MB-4109',
    model: 'Tata Ace Gold EV',
    type: 'Mini Cargo Van',
    capacity: '600 kg (Bulk Apparel)',
    assignedTo: 'Suresh Patil (Route 4)',
    status: 'Ready / Available',
    fuel: 'Electric (100% Zero Emissions)',
  },
  {
    id: 'VEH-03',
    regNumber: 'KA-05-CX-8834',
    model: 'Hero Electric Nyx',
    type: 'Electric Two-Wheeler',
    capacity: '45 kg (Express Satchel)',
    assignedTo: 'Anand Verma',
    status: 'In Transit',
    fuel: 'Electric (100% Zero Emissions)',
  },
  {
    id: 'VEH-04',
    regNumber: 'KA-01-TR-1288',
    model: 'Mahindra Bolero Maxi Truck',
    type: 'Medium Freight Feeder',
    capacity: '1,200 kg (Inter-hub Transfer)',
    assignedTo: 'Hub Operations Shared',
    status: 'Service Due',
    fuel: 'Diesel (Euro VI)',
  },
];

export const PartnerVehicles = () => {
  const { success } = useToast();
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [search, setSearch] = useState('');

  // Add vehicle modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Electric Two-Wheeler');
  const [newCapacity, setNewCapacity] = useState('50 kg');
  const [newDriver, setNewDriver] = useState('');

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newReg.trim() || !newModel.trim()) return;

    const newEntry = {
      id: `VEH-0${vehicles.length + 1}`,
      regNumber: newReg.toUpperCase().trim(),
      model: newModel.trim(),
      type: newType,
      capacity: newCapacity,
      assignedTo: newDriver.trim() || 'Hub Pool',
      status: 'Ready / Available',
      fuel: newType.includes('Electric') ? 'Electric' : 'Diesel / Hybrid',
    };

    setVehicles([newEntry, ...vehicles]);
    success(`Vehicle ${newReg} registered into travel partner fleet!`);
    setShowAddModal(false);
    setNewReg('');
    setNewModel('');
    setNewDriver('');
  };

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return v.regNumber.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.type.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Fleet & Transport Units
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Hub transport assets, delivery vans, electric couriers and maintenance status.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} /> Add Transport Unit
        </button>
      </div>

      {/* Fleet KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Fleet Size
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#03a685' }}>
            {vehicles.length} Units
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            75% Electric Fleet
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Active on Transit
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#1a73e8' }}>
            {vehicles.filter((v) => v.status === 'In Transit').length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            On road fulfilling orders
          </div>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Available in Hub
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 6, color: '#ff905a' }}>
            {vehicles.filter((v) => v.status.includes('Ready')).length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 4 }}>
            Ready for instant dispatch
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((veh) => {
          const isTransit = veh.status === 'In Transit';
          const isReady = veh.status.includes('Ready');

          return (
            <div
              key={veh.id}
              className="card"
              style={{
                padding: 20,
                borderRadius: 10,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, fontFamily: 'monospace', color: '#1a73e8' }}>
                      {veh.regNumber}
                    </h3>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: 2 }}>
                      {veh.model}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 4,
                      backgroundColor: isTransit ? '#e8f0fe' : isReady ? '#e6f4ea' : '#fff4e5',
                      color: isTransit ? '#1a73e8' : isReady ? '#137333' : '#b78103'
                    }}
                  >
                    {veh.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem', margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Type:</span>
                    <strong>{veh.type}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Payload:</span>
                    <span>{veh.capacity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Driver:</span>
                    <strong>{veh.assignedTo}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>Fuel / Power:</span>
                    <span style={{ color: '#03a685', fontWeight: 600 }}>{veh.fuel}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)' }}>
                <span>Unit ID: {veh.id}</span>
                <span style={{ color: '#03a685', fontWeight: 700 }}>Telemetry GPS Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register Fleet Transport Unit">
          <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Registration Number *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. KA-04-AB-1234"
                value={newReg}
                onChange={(e) => setNewReg(e.target.value)}
                style={{ width: '100%', textTransform: 'uppercase' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Model & Make *
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. Tata Ace EV / Ather 450X"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Vehicle Type
              </label>
              <select
                className="input-field"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Electric Two-Wheeler">Electric Two-Wheeler (Last-Mile)</option>
                <option value="Mini Cargo Van">Mini Cargo Van (Medium Parcels)</option>
                <option value="Medium Freight Feeder">Medium Freight Feeder (Hub Transit)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Cargo Payload Capacity
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 50 kg or 500 kg"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6 }}>
                Assigned Courier Driver
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Driver Name or leave blank for Hub Pool"
                value={newDriver}
                onChange={(e) => setNewDriver(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#03a685', borderColor: '#03a685' }}>
                Save Vehicle
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
