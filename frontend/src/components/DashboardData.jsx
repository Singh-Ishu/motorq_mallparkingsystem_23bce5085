import React, { useState, useEffect } from "react";
import "./DashboardData.css"; // Import the dedicated CSS file

function DashboardData() {
    // State to hold the summary data fetched from the API
    const [summaryData, setSummaryData] = useState({
        total_slots: 0,
        available_slots: 0,
        occupied_slots: 0,
        maintenance_slots: 0,
    });
    // State to manage loading status
    const [loading, setLoading] = useState(true);
    // State to manage any errors during API calls
    const [error, setError] = useState(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const fetchSummaryData = async (retryCount = 0) => {
            setLoading(true); // Set loading to true before fetching
            setError(null); // Clear any previous errors

            const maxRetries = 5; // Maximum number of retries for API calls
            // Exponential backoff delay calculation
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s, 16s

            try {
                // Fetch data from the FastAPI dashboard summary endpoint
                const response = await fetch(
                    "http://localhost:8000/dashboard/summary"
                );

                // Handle HTTP errors, including rate limiting (status 429)
                if (!response.ok) {
                    if (response.status === 429 && retryCount < maxRetries) {
                        console.warn(
                            `Rate limit hit. Retrying in ${delay / 1000}s...`
                        );
                        // Wait for the calculated delay before retrying
                        await new Promise((res) => setTimeout(res, delay));
                        // Recursively call fetchSummaryData to retry
                        return fetchSummaryData(retryCount + 1);
                    }
                    // If not a rate limit issue or max retries exceeded, throw an error
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the JSON response
                const data = await response.json();
                // Update the summary data state
                setSummaryData(data);
            } catch (e) {
                // Catch any network or parsing errors
                console.error("Failed to fetch dashboard summary:", e);
                setError("Failed to load dashboard summary. Please try again.");
            } finally {
                // Set loading to false regardless of success or failure
                setLoading(false);
            }
        };

        fetchSummaryData(); // Call the fetch function once on component mount

        // Set up an interval to refresh data every 5 seconds for real-time updates
        const intervalId = setInterval(() => {
            fetchSummaryData();
        }, 5000); // Refresh every 5 seconds

        // Cleanup function: Clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on mount and cleans up on unmount

    // Render loading state
    if (loading) {
        return (
            <div className="dashboard-loading">
                <svg
                    className="loading-spinner"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="spinner-path-bg"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="spinner-path-fg"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                Loading dashboard summary...
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="dashboard-error">
                <span className="error-message">{error}</span>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Total Slots Card */}
            <div className="dashboard-card total-slots-card">
                <h3 className="card-title">Total Slots</h3>
                <p className="card-value">{summaryData.total_slots}</p>
            </div>
            {/* Available Slots Card */}
            <div className="dashboard-card available-slots-card">
                <h3 className="card-title">Available</h3>
                <p className="card-value">{summaryData.available_slots}</p>
            </div>
            {/* Occupied Slots Card */}
            <div className="dashboard-card occupied-slots-card">
                <h3 className="card-title">Occupied</h3>
                <p className="card-value">{summaryData.occupied_slots}</p>
            </div>
            {/* Maintenance Slots Card */}
            <div className="dashboard-card maintenance-slots-card">
                <h3 className="card-title">Maintenance</h3>
                <p className="card-value">{summaryData.maintenance_slots}</p>
            </div>
        </div>
    );
}

export default DashboardData;
