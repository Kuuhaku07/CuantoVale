import React, { useState } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDocs } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import Autocomplete from './componentlist/AutoComplete/Autocomplete';
import './AddPriceForm.css';

const AddPriceForm = ({ productId, onClose, onPriceAdded }) => {
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const db = getFirestore(getApp());

  // Fetch options for autocomplete from distinct stores registered for the product
  const fetchStoreOptions = async (input) => {
    try {
      const pricesCollection = collection(doc(collection(db, 'products'), productId), 'prices');
      const pricesSnapshot = await getDocs(pricesCollection);

      const storesSet = new Set();
      pricesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.store) {
          storesSet.add(data.store);
        }
      });

      const allStores = Array.from(storesSet).map((store, index) => ({ id: index.toString(), label: store }));

      return allStores.filter(store => store.label.toLowerCase().includes(input.toLowerCase()));
    } catch (error) {
      return [];
    }
  };

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
            <Autocomplete
              value={store}
              onChange={setStore}
              onSelect={(option) => setStore(option.label)}
              fetchOptions={fetchStoreOptions}
              placeholder="Ejemplo: Supermercado XYZ"
              disabled={loading}
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
