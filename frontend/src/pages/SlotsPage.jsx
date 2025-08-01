import React, { useState, useEffect, useCallback } from "react";
import SlotModal from "../components/slotsmodal"; // We will create this component next
import "./SlotsPage.css"; // We will also create the CSS file

const API_BASE_URL = "http://127.0.0.1:8000";

function SlotsPage() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for managing the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Function to fetch all slots from the API
    const fetchSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/slots`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            // Sort data for consistent ordering, e.g., by slot_number
            data.sort((a, b) => a.slot_number.localeCompare(b.slot_number));
            setSlots(data);
        } catch (e) {
            console.error("Failed to fetch slots:", e);
            setError("Failed to load slot data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data when the component mounts
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // --- Modal Handlers ---
    const handleOpenModal = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedSlot(null);
        setIsModalOpen(false);
    };

    // This function will be called from the modal on a successful update
    const handleUpdateSuccess = () => {
        handleCloseModal();
        fetchSlots(); // Re-fetch the data to show the changes
    };

    // --- Render Logic ---
    if (loading) {
        return <div className="slots-page-message">Loading slots...</div>;
    }

    if (error) {
        return <div className="slots-page-message error">{error}</div>;
    }

    return (
        <div className="slots-page-container">
            <h1>Manage Parking Slots</h1>
            <p>Click on any row to update the slot's status.</p>
            <div className="slots-table-wrapper">
                <table className="slots-table">
                    <thead>
                        <tr>
                            <th>Slot Number</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Has Charger</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slots.map((slot) => (
                            <tr
                                key={slot.id}
                                onClick={() => handleOpenModal(slot)}
                                title="Click to edit"
                            >
                                <td>{slot.slot_number}</td>
                                <td>{slot.slot_type}</td>
                                <td>
                                    <span
                                        className={`status-badge status-${slot.status.toLowerCase()}`}
                                    >
                                        {slot.status}
                                    </span>
                                </td>
                                <td>{slot.has_charger ? "Yes" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedSlot && (
                <SlotModal
                    slot={selectedSlot}
                    onClose={handleCloseModal}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}

export default SlotsPage;
