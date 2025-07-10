import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { auth } from '../firebase';
import AddPriceForm from './AddPriceForm';
import PriceListModal from './PriceListModal';
import './ProductList.css';

const ProductList = ({ searchQuery, onSelectProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [user, setUser] = useState(null);
  const [addingPriceFor, setAddingPriceFor] = useState(null);
  const [selectedProductForPrices, setSelectedProductForPrices] = useState(null);

  const db = getFirestore(getApp());

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      setError('Error loading products: ' + err.message);
      setLoading(false);
    });
    return unsubscribe;
  }, [db]);

  useEffect(() => {
    const unsubscribe = fetchProducts();
    return () => unsubscribe();
  }, [fetchProducts, refreshToggle]);

  const handleRefresh = () => {
    setRefreshToggle(!refreshToggle);
  };

  const handleAddPriceClick = (product) => {
    setAddingPriceFor(product);
  };

  const handlePriceAdded = () => {
    setAddingPriceFor(null);
    handleRefresh();
  };

  const handleCloseForm = () => {
    setAddingPriceFor(null);
  };

  const handleProductClick = (product) => {
    setSelectedProductForPrices(product);
  };

  const handleClosePriceListModal = () => {
    setSelectedProductForPrices(null);
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  // Filter products by searchQuery (case-insensitive)
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-list-container">
      <h2 className="product-list-title">Productos</h2>
      <button type="button" onClick={handleRefresh} className="product-list-refresh-button">Refrescar</button>
      {filteredProducts.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <ul className="product-list-ul">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="product-list-item"
            >
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleProductClick(product)}>
                <span className="product-list-item-name">{product.name}</span>
                <span className="product-list-item-unit">{product.unit}</span>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={() => handleAddPriceClick(product)}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: '1px solid var(--primary-color)',
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--text-color)',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color-hover)';
                    e.currentTarget.style.borderColor = 'var(--primary-color-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                  }}
                  aria-label={`Agregar precio para ${product.name}`}
                >
                  +
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {addingPriceFor && (
        <AddPriceForm
          productId={addingPriceFor.id}
          onClose={handleCloseForm}
          onPriceAdded={handlePriceAdded}
        />
      )}
      {selectedProductForPrices && (
        <PriceListModal
          product={selectedProductForPrices}
          onClose={handleClosePriceListModal}
        />
      )}
    </div>
  );
};

export default ProductList;
