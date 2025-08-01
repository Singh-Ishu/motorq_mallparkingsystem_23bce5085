import React, { useState, useEffect, useCallback } from "react";
import "./Grid.css";

// It's good practice to define the API URL in one place
const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Grid component to display the parking layout.
 *
 * @param {object} props
 * @param {string} props.currentFilter - The currently selected vehicle type filter (e.g., "Car", "Bike").
 * @param {any} props.refreshKey - A value that can be changed by a parent component to trigger a data refresh.
 */
function Grid({ currentFilter, refreshKey }) {
    const [parkingSlots, setParkingSlots] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define the grid dimensions
    const rows = "ABCDEFGH".split(""); // A to H
    const cols = Array.from({ length: 12 }, (_, i) => i + 1); // 1 to 15

    // Map frontend filter names to the EXACT enum values your FastAPI backend expects.
    const filterMap = {
        Car: "REGULAR",
        Bike: "BIKE",
        EV: "EV",
        Accessibility: "HANDICAP",
        All: null, // No filter parameter for "All"
    };

    // This function fetches data from the API. It's wrapped in useCallback
    // so it only gets recreated when `currentFilter` changes.
    const fetchParkingSlots = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let apiUrl = `${API_BASE_URL}/dashboard/slots`;
            const apiFilterType = filterMap[currentFilter];

            // Append the query parameter if a filter is selected
            if (apiFilterType) {
                apiUrl += `?slot_type=${apiFilterType}`;
            }

            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Transform the array of slots into a map for quick lookup (e.g., { "A1": slotData, "B5": slotData })
            const slotsMap = {};
            data.forEach((slot) => {
                // CORRECTED: Use a more flexible regex that doesn't require the string to end right after the number.
                // This will correctly parse "A13" from "A13", "A13-EV", or "A13(Compact)".
                const match = slot.slot_number.match(/^([A-H])(\d+)/);
                if (match) {
                    const rowChar = match[1];
                    const colNum = parseInt(match[2], 10);
                    // Ensure the parsed slot is within our grid dimensions
                    if (rows.includes(rowChar) && cols.includes(colNum)) {
                        slotsMap[`${rowChar}${colNum}`] = slot;
                    }
                }
            });

            setParkingSlots(slotsMap);
        } catch (e) {
            console.error("Failed to fetch parking slots:", e);
            setError("Failed to load parking data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [currentFilter]); // This function will now update whenever the filter changes.

    // This effect triggers the data fetch whenever the component mounts,
    // the filter changes, or the parent requests a refresh.
    useEffect(() => {
        fetchParkingSlots();
    }, [fetchParkingSlots, refreshKey]); // Re-run when the fetch function changes or refreshKey is updated.

    // --- Render Logic ---

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

                        let statusClass = "status-unknown"; // Default class for empty/unregistered slots
                        let displayText = slotId;

                        if (slot && slot.status) {
                            // For debugging: Uncomment the line below to see the exact status from the API in the console.
                            // console.log(`Slot ${slot.slot_number} has status: '${slot.status}'`);

                            // Make the status check case-insensitive for robustness
                            switch (slot.status.toUpperCase()) {
                                case "AVAILABLE":
                                    statusClass = "status-available";
                                    break;
                                case "OCCUPIED":
                                    // Set to yellow for filled slots.
                                    statusClass = "status-maintenance";
                                    displayText = slotId;
                                    break;
                                case "MAINTENANCE":
                                    // Set to red for maintenance slots.
                                    statusClass = "status-occupied";
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
                                    // Display the slot type (e.g., EV, BIKE) for clarity
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
