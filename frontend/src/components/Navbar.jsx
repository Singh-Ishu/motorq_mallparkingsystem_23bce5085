import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    // useLocation hook helps determine the current path to set the active class
    const location = useLocation();

    return (
        <nav className="navbar-main">
            <div className="navbar-title">Parking Management</div>
            <ul>
                {/* Use the Link component for navigation. It acts like an <a> tag. */}
                <li className={location.pathname === "/" ? "active" : ""}>
                    <Link to="/">Dashboard</Link>
                </li>
                <li className={location.pathname === "/slots" ? "active" : ""}>
                    <Link to="/slots">Manage Slots</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
