import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import './AddProductForm.css';

const AddProductForm = () => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const db = getFirestore(getApp());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name.trim() || !unit.trim()) {
      setError('Por favor, complete todos los campos.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        unit: unit.trim(),
        createdAt: new Date()
      });
      setSuccess('Producto agregado exitosamente.');
      setName('');
      setUnit('');
    } catch (err) {
      setError('Error al agregar el producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px auto' }}>
      <h2>Registrar nuevo producto</h2>
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {success && <p style={{ color: 'var(--color-success)' }}>{success}</p>}
      <div style={{ marginBottom: '10px' }}>
        <label>Nombre del producto:</label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="input-field"
          placeholder="Ejemplo: Cebolla"
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Unidad:</label><br />
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          disabled={loading}
          className="input-field"
          placeholder="Ejemplo: 1 kg"
        />
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Guardando...' : 'Agregar Producto'}
      </button>
    </form>
  );
};

export default AddProductForm;
