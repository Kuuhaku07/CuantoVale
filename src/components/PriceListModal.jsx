import React, { useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import PriceChartModal from './PriceChartModal';
import './AddPriceForm.css';

const PriceListModal = ({ product, onClose }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const db = getFirestore(getApp());

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'products', product.id, 'prices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pricesData = [];
      querySnapshot.forEach((doc) => {
        pricesData.push({ id: doc.id, ...doc.data() });
      });

      // Filter to top 10 distinct stores by most recent price
      const storeMap = new Map();
      for (const price of pricesData) {
        if (!storeMap.has(price.store)) {
          storeMap.set(price.store, price);
        }
      }
      let filteredPrices = Array.from(storeMap.values()).slice(0, 10);

      // Sort filtered prices by price ascending to highlight top 3 lowest
      filteredPrices.sort((a, b) => a.price - b.price);

      setPrices(filteredPrices);
      setLoading(false);
    }, (err) => {
      setError('Error loading prices: ' + err.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db, product.id]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>Precios para {product.name}</h3>
          {loading ? (
            <p>Cargando precios...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
          ) : prices.length === 0 ? (
            <p>No hay precios registrados.</p>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {prices.map((price, index) => (
                  <li
                    key={price.id}
                    style={{
                      padding: '6px 8px',
                      borderBottom: '1px solid var(--color-gray-light)',
                      backgroundColor: index < 3 ? 'rgba(60, 162, 162, 0.2)' : 'transparent',
                      fontWeight: index < 3 ? '600' : 'normal',
                    }}
                  >
                    {index < 3 && <span style={{ marginRight: '8px' }}>{index + 1}.-</span>}
                    <span>{price.price.toFixed(2)} </span>
                    {price.store && <span> - {price.store} </span>}
                    {price.createdAt && price.createdAt.toDate && (
                      <span style={{ fontStyle: 'italic', color: 'var(--color-gray-medium)' }}>
                        {' '}
                        ({price.createdAt.toDate().toLocaleDateString()})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowChart(true)}
                style={{ marginTop: '10px', padding: '10px 20px' }}
              >
                Ver gráfica de precio / tiempo
              </button>
            </>
          )}
          <button type="button" onClick={onClose} style={{ marginTop: '10px', padding: '10px 20px' }}>
            Cerrar
          </button>
        </div>
      </div>
      {showChart && (
        <PriceChartModal product={product} prices={prices} onClose={() => setShowChart(false)} />
      )}
    </>
  );
};

export default PriceListModal;
