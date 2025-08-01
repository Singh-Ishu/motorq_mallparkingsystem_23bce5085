import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

/**
 * A clean, modern navigation bar component.
 * Uses NavLink from react-router-dom for automatic active class handling.
 */
function Navbar() {
    return (
        <header className="app-header">
            <nav className="navbar-main">
                <div className="navbar-brand">
                    <NavLink to="/">Parking Management</NavLink>
                </div>
                <div className="navbar-links">
                    <NavLink to="/" className="nav-link">
                        Dashboard
                    </NavLink>
                    <NavLink to="/slots" className="nav-link">
                        Manage Slots
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
