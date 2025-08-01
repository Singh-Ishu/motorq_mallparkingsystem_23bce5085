import { useState } from "react";
import AddCar from "../components/AddCar";
import AddCarModal from "../components/AddCarModal";
import FilterParking from "../components/FilterParking"; // Import FilterParking
import FilterParkingModal from "../components/FilterParkingModal"; // Import FilterParkingModal
import DashboardData from "../components/DashboardData";
import Grid from "../components/Grid";
import Search from "../components/Search";
import "./Dashboard.css";

function Dashboard() {
    const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [currentFilter, setCurrentFilter] = useState("All"); // State to hold the active filter

    const openAddCarModal = () => setIsAddCarModalOpen(true);
    const closeAddCarModal = () => setIsAddCarModalOpen(false);

    const openFilterModal = () => setIsFilterModalOpen(true);
    const closeFilterModal = () => setIsFilterModalOpen(false);

    const handleApplyFilter = (filter) => {
        setCurrentFilter(filter);
        // You would typically pass this filter down to the Grid component
        // For example: <Grid filter={filter} />
        console.log("Applied filter:", filter);
    };

    return (
        <div className="dashboard">
            {isAddCarModalOpen && <AddCarModal onClose={closeAddCarModal} />}
            {isFilterModalOpen && (
                <FilterParkingModal
                    onClose={closeFilterModal}
                    onApplyFilter={handleApplyFilter}
                    currentFilter={currentFilter} // Pass current filter to pre-select in modal
                />
            )}

            <div className="dashboard-grid-container">
                <Grid currentFilter={currentFilter} />{" "}
                {/* Pass filter to Grid */}
            </div>
            <div className="dashboard-remaining">
                <div className="top-buttons-dashboard">
                    <AddCar onClick={openAddCarModal} />
                    <FilterParking onClick={openFilterModal} />{" "}
                    {/* Pass openFilterModal */}
                    <Search />
                </div>
                <DashboardData />
            </div>
        </div>
    );
}

export default Dashboard;
