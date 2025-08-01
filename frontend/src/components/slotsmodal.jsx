import React, { useState } from "react";
import "./SlotsModal.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function SlotModal({ slot, onClose, onUpdateSuccess }) {
    // State to manage the selected status in the dropdown
    const [newStatus, setNewStatus] = useState(slot.status);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cannot change status of an occupied slot from this modal
    const isOccupied = slot.status === "OCCUPIED";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/slots/${slot.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Failed to update status.`);
            }

            // On success, call the handler from the parent component
            onUpdateSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle clicks on the backdrop to close the modal
    const handleBackdropClick = (e) => {
        if (e.target.className === "slot-modal-backdrop") {
            onClose();
        }
    };

    return (
        <div className="slot-modal-backdrop" onClick={handleBackdropClick}>
            <div className="slot-modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Edit Slot: {slot.slot_number}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="slot-details">
                        <p>
                            <strong>Type:</strong> {slot.slot_type}
                        </p>
                        <p>
                            <strong>Current Status:</strong> {slot.status}
                        </p>
                    </div>

                    <div className="input-group">
                        <label htmlFor="status-select">Update Status:</label>
                        <select
                            id="status-select"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            disabled={isOccupied} // Disable if the slot is occupied
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            {/* We don't allow setting to OCCUPIED manually here */}
                        </select>
                    </div>

                    {isOccupied && (
                        <p className="info-message">
                            Status cannot be changed while a slot is occupied.
                        </p>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={
                            loading || isOccupied || newStatus === slot.status
                        }
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SlotModal;
