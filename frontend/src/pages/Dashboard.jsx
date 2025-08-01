import DashboardData from "../components/DashboardData";
import Grid from "../components/Grid";
import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-grid-container">
                <Grid />
            </div>
            <div className="dashboard-remaining">
                <DashboardData />
            </div>
        </div>
    );
}

export default Dashboard;
