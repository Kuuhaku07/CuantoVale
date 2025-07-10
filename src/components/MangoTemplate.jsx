import React, { useState, useEffect } from 'react';
import './MangoTemplate.css';
import { auth, logOut, signInWithGoogle } from '../firebase';
import * as Icons from "../assets/icons";
import { useNavigate } from "react-router-dom";

const MangoTemplate = ({ 
  children,
  appName = "Mango",
  appShortName = "Template",
  menuItems = [
    { icon: <Icons.FiHome />, label: "Dashboard", path: "/" },
    { icon: <Icons.FiGrid />, label: "Elements", path: "/elements" },
    { icon: <Icons.FiLayers />, label: "Widgets", path: "/widgets" },
    { icon: <Icons.FiEdit />, label: "Forms", path: "/forms" },
    { icon: <Icons.FiDatabase />, label: "Tables", path: "/tables" },
    { icon: <Icons.FiPieChart />, label: "Charts", path: "/charts" },
    { icon: <Icons.FiFile />, label: "Pages", path: "/pages" }
  ],
  activePath = "/",
  onMenuItemClick = (path) => console.log("Navigating to:", path),
  showSearch = true,
  showMessages = true,
  showNotifications = true,
  onUserChange = () => {}
}) => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      onUserChange(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownVisible(!profileDropdownVisible);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      setProfileDropdownVisible(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const userEmail = user ? user.email : 'Guest';
  const userPhoto = user ? user.photoURL : null;


  return (
    <div className={`mango-template ${sidebarVisible ? 'sidebar-visible' : 'sidebar-hidden'}`}>
      <div className="body-container">
        <aside className={`sidebar ${sidebarVisible ? 'visible' : 'hidden'}`}>
          <header className="header">
            <h1>
              <span className="logo-primary">{appName}</span>
              <span className="logo-secondary">{appShortName}</span>
            </h1>
          </header>
          <nav className="menu">
            <ul>
              {menuItems.map((item, index) => (
                <li 
                  key={index}
                  className={`menu-item ${activePath === item.path ? 'active' : ''}`}
                  onClick={() => onMenuItemClick(item.path)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="main-container">
          <div className="top-bar">
            <nav className="top-nav">
              <div className="left-controls">
                <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                  <Icons.FiMenu />
                </button>
              </div>
              <div className="right-controls">
                {showSearch && (
                  <div className="search-container">
                    <Icons.FiSearch className="search-icon" />
                    <input type="text" className="search-input" placeholder="Search..." />
                  </div>
                )}
                <div className="nav-icons">
                  {showMessages && (
                    <button className="icon-button" aria-label="Messages">
                      <Icons.FiMessageSquare />
                    </button>
                  )}
                  {showNotifications && (
                    <button className="icon-button" aria-label="Notifications">
                      <Icons.FiBell />
                    </button>
                  )}
                </div>
                <div className="profile-menu">
                  <button className="profile-button" onClick={toggleProfileDropdown}>
                    {userPhoto ? (
                      <img src={userPhoto} alt="Profile" className="profile-photo" />
                    ) : (
                      <div className="profile-photo-placeholder">
                        <Icons.FiUser />
                      </div>
                    )}
                    <span className="profile-email">{userEmail}</span>
                    <Icons.FiChevronDown className={`profile-chevron ${profileDropdownVisible ? 'open' : ''}`} />
                  </button>
                  {profileDropdownVisible && (
                    <div className="profile-dropdown">
                      {user ? (
                        <>
                          <a href="#" className="dropdown-item">
                            <Icons.FiUser className="dropdown-icon" />
                            <span>Profile</span>
                          </a>
                          <button className="dropdown-item" onClick={handleLogout}>
                            <Icons.FiLogOut className="dropdown-icon" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <button className="dropdown-item" onClick={handleLogin}>
                          <Icons.FiLogIn className="dropdown-icon" />
                          <span>Login</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
          <main className="content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MangoTemplate
