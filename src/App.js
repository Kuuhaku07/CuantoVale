import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import MangoTemplate from './components/MangoTemplate';
import AddProductForm from './components/AddProductForm';
import ProductList from './components/ProductList';

const menuItems = [
  { icon: null, label: "Dashboard", path: "/" },
  { icon: null, label: "Productos", path: "/productos" },
  { icon: null, label: "Precios", path: "/precios" },
  { icon: null, label: "Comparar", path: "/comparar" },
  { icon: null, label: "Administración", path: "/admin" }
];

function App() {
  const [user, setUser] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuItemClick = (path) => {
    console.log("Navigate to:", path);
    // Here you can add navigation logic if using react-router
  };

  const handleUserChange = (currentUser) => {
    setUser(currentUser);
  };

  const openAddProductModal = () => {
    setShowAddProductModal(true);
  };

  const closeAddProductModal = () => {
    setShowAddProductModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <BrowserRouter>
      <MangoTemplate
        appName="Cuanto"
        appShortName="Vale"
        menuItems={menuItems}
        activePath="/"
        onMenuItemClick={handleMenuItemClick}
        showSearch={false} // We will add a custom search in main content
        onUserChange={handleUserChange}
      >
        <div style={{ padding: '20px' }}>
          <h1>Bienvenido a CuantoVale</h1>
          <p>Busca productos y compara precios en diferentes tiendas.</p>
          {user && (
            <button onClick={openAddProductModal} style={{ marginBottom: '20px', padding: '10px 20px' }}>
              Añadir Producto
            </button>
          )}
          {showAddProductModal && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(30, 30, 45, 0.85)', // darker translucent background
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'var(--sidebar-color)',
                padding: '20px',
                borderRadius: '8px',
                minWidth: '300px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxSizing: 'border-box'
              }}>
                <button onClick={closeAddProductModal} style={{ float: 'right', fontSize: '16px' }}>X</button>
                <AddProductForm />
              </div>
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Buscar productos..."
            className="input-field"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {/* Removed the Buscar button as search is live on input change */}
          </div>
          <div style={{ marginTop: '40px' }}>
            <ProductList searchQuery={searchQuery} onSelectProduct={(product) => console.log('Producto seleccionado:', product)} />
          </div>
        </div>
      </MangoTemplate>
    </BrowserRouter>
  );
}

export default App;
