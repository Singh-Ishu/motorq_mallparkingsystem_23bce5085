import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SlotsPage from "./pages/SlotsPage"; // Make sure this path is correct

function App() {
    return (
        // The Router component wraps your entire application to enable routing
        <Router>
            <div className="App">
                {/* The Navbar will now use Link components from React Router internally */}
                <Navbar />
                <main>
                    {/* The Routes component defines where your page content will be rendered */}
                    <Routes>
                        {/* Each Route maps a URL path to a specific component */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/slots" element={<SlotsPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
