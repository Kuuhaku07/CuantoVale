import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import './AddPriceForm.css';

const AddPriceForm = ({ productId, onClose, onPriceAdded }) => {
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const db = getFirestore(getApp());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError('Por favor, ingrese un precio válido.');
      setLoading(false);
      return;
    }

    try {
      // Add price to a subcollection 'prices' under the product document
      await addDoc(collection(db, 'products', productId, 'prices'), {
        price: priceValue,
        store: store.trim() || null,
        createdAt: serverTimestamp()
      });
      setSuccess('Precio agregado exitosamente.');
      setPrice('');
      setStore('');
      if (onPriceAdded) onPriceAdded();
      if (onClose) onClose();
    } catch (err) {
      setError('Error al agregar el precio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px auto' }}>
          <h3>Agregar nuevo precio</h3>
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          {success && <p style={{ color: 'var(--color-success)' }}>{success}</p>}
          <div style={{ marginBottom: '10px' }}>
            <label>Precio:</label><br />
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={loading}
              className="input-field"
              placeholder="Ejemplo: 12.50"
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Tienda (opcional):</label><br />
            <input
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              disabled={loading}
              className="input-field"
              placeholder="Ejemplo: Supermercado XYZ"
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Guardando...' : 'Agregar Precio'}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} style={{ marginLeft: '10px', padding: '10px 20px' }}>
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddPriceForm;
