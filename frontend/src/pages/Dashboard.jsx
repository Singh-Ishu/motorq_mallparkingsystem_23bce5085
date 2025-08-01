import { useState } from "react";
import AddCar from "../components/AddCar";
import AddCarModal from "../components/AddCarModal";
import DashboardData from "../components/DashboardData";
import FilterParking from "../components/FilterParking";
import Grid from "../components/Grid";
import Search from "../components/Search";
import "./Dashboard.css"; // Ensure this CSS file exists for dashboard layout

function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="dashboard">
            {/* Conditionally render the modal */}
            {isModalOpen && <AddCarModal onClose={closeModal} />}

            <div className="dashboard-grid-container">
                <Grid />
            </div>
            <div className="dashboard-remaining">
                <div className="top-buttons-dashboard">
                    <AddCar onClick={openModal} />{" "}
                    {/* Pass the openModal function */}
                    <FilterParking />
                    <Search />
                </div>
                <DashboardData />
            </div>
        </div>
    );
}

export default Dashboard;
