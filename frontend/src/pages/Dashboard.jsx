import AddCar from "../components/AddCar";
import DashboardData from "../components/DashboardData";
import FilterParking from "../components/FilterParking";
import Grid from "../components/Grid";
import Search from "../components/Search";
import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-grid-container">
                <Grid />
            </div>
            <div className="dashboard-remaining">
                <div className="top-buttons-dashboard">
                    <AddCar />
                    <FilterParking />
                    <Search />
                </div>
                <DashboardData />
            </div>
        </div>
    );
}

export default Dashboard;
