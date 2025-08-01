import React, { useState, useEffect, useCallback } from "react";
import "./Grid.css";

function Grid({ currentFilter }) {
    const [parkingSlots, setParkingSlots] = useState({});
    const [loading, setLoading] = useState(true); // Initial loading state set to true
    const [error, setError] = useState(null);

    // Define the grid dimensions
    const rows = "ABCDEFGH".split(""); // A to H
    const cols = Array.from({ length: 15 }, (_, i) => i + 1); // 1 to 15

    // Map filter names to API slot_type values
    const filterMap = {
        Car: "Regular",
        Bike: "Bike",
        EV: "EV",
        Accessibility: "Handicap Accessible",
        All: null, // No filter parameter for "All"
    };

    // Function to fetch parking slot data with exponential backoff
    // This function will now capture the 'currentFilter' value only on its initial creation.
    const fetchParkingSlots = useCallback(
        async (retryCount = 0) => {
            setError(null); // Clear any previous errors before fetching

            const maxRetries = 5;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential delay: 1s, 2s, 4s, etc.

            try {
                let apiUrl = "http://localhost:8000/dashboard/slots";
                // The 'currentFilter' used here will be the one from the initial render
                const apiFilterType = filterMap[currentFilter];

                if (apiFilterType) {
                    apiUrl += `?slot_type=${apiFilterType}`;
                }

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    if (response.status === 429 && retryCount < maxRetries) {
                        console.warn(
                            `Rate limit hit. Retrying in ${delay / 1000}s...`
                        );
                        await new Promise((res) => setTimeout(res, delay));
                        return fetchParkingSlots(retryCount + 1); // Retry the fetch
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const slotsMap = {};
                data.forEach((slot) => {
                    // Assuming slot_number is like "A1-01" or "B5-01"
                    const match = slot.slot_number.match(/^([A-H])(\d+)-/);
                    if (match) {
                        const rowChar = match[1];
                        const colNum = parseInt(match[2], 10);
                        if (rows.includes(rowChar) && cols.includes(colNum)) {
                            slotsMap[`${rowChar}${colNum}`] = slot;
                        }
                    }
                });
                setParkingSlots(slotsMap);
                setLoading(false);
            } catch (e) {
                console.error("Failed to fetch parking slots:", e);
                setError(
                    "Failed to load parking data. Please try again later."
                );
                setLoading(false);
            }
        },
        [rows, cols]
    ); // Removed currentFilter from dependencies. This means fetchParkingSlots will not recreate when currentFilter changes.

    useEffect(() => {
        // This effect runs only once on initial component mount because of the empty dependency array.
        setLoading(true);
        fetchParkingSlots(); // Perform the initial fetch

        // No setInterval, no re-fetching on prop changes.
    }, []); // Empty dependency array: runs only once on mount.

    if (loading) {
        return <div className="grid-message">Loading parking grid...</div>;
    }

    if (error) {
        return <div className="grid-message error-message">{error}</div>;
    }

    return (
        <div className="grid-dashboard">
            {rows.map((rowChar) => (
                <div key={rowChar} className="grid-row">
                    {cols.map((colNum) => {
                        const slotId = `${rowChar}${colNum}`;
                        const slot = parkingSlots[slotId];
                        let statusClass = "status-unknown";
                        let displayText = slotId;

                        if (slot) {
                            switch (slot.status) {
                                case "Available":
                                    statusClass = "status-available";
                                    break;
                                case "Occupied":
                                    statusClass = "status-occupied";
                                    displayText =
                                        slot.occupied_by_vehicle_number ||
                                        slotId;
                                    break;
                                case "Maintenance":
                                    statusClass = "status-maintenance";
                                    break;
                                default:
                                    statusClass = "status-unknown";
                            }
                        }

                        return (
                            <div
                                key={slotId}
                                className={`grid-slot ${statusClass}`}
                            >
                                <span className="slot-id">{displayText}</span>
                                {slot && slot.slot_type && (
                                    <span className="slot-type">
                                        ({slot.slot_type})
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default Grid;
