import React, { useState, useEffect } from "react";
import "./AddCarModal.css";

const API_BASE_URL = "http://127.0.0.1:8000"; // Ensure this matches your backend address

function AddCarModal({ onClose, onVehicleAdded }) {
    // --- STATE MANAGEMENT ---
    // Default state now matches the exact required string "Car"
    const [vehicleType, setVehicleType] = useState("Car");

    const [numberPlate, setNumberPlate] = useState("");
    const [billingType, setBillingType] = useState("Hourly");
    const [slotInput, setSlotInput] = useState("");
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [slotValidationError, setSlotValidationError] = useState(null);

    // --- API INTERACTIONS ---

    // Effect 1: Fetch ALL available slots on mount for manual validation
    useEffect(() => {
        const fetchAllAvailableSlots = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/dashboard/slots?status=AVAILABLE`
                );
                if (!response.ok)
                    throw new Error("Could not fetch available slots list.");
                const data = await response.json();
                setAvailableSlots(data || []);
            } catch (err) {
                setError(
                    "Could not load slot data. Manual override may not work."
                );
            }
        };
        fetchAllAvailableSlots();
    }, []);

    // Effect 2: Fetch a new SUGGESTION when vehicleType changes
    useEffect(() => {
        if (!vehicleType) return;

        const fetchSuggestedSlot = async () => {
            setIsLoading(true);
            setError(null);
            setSlotValidationError(null);

            try {
                const response = await fetch(
                    `${API_BASE_URL}/vehicles/suggest-slot?vehicle_type=${vehicleType}`
                );

                const data = await response.json();

                if (response.ok && data) {
                    setSlotInput(data.slot_number);
                    setSelectedSlotId(data.id);
                } else {
                    setSlotInput("No slot found");
                    setSelectedSlotId(null);
                }
            } catch (err) {
                setError(
                    "Error finding slot. Check API connection and CORS settings."
                );
                setSelectedSlotId(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestedSlot();
    }, [vehicleType]);

    // --- HANDLERS ---

    const handleSlotInputChange = (e) => {
        const manualValue = e.target.value;
        setSlotInput(manualValue);
        setSlotValidationError(null);

        const matchedSlot = availableSlots.find(
            (slot) =>
                slot.slot_number.toLowerCase() === manualValue.toLowerCase()
        );

        if (manualValue && matchedSlot) {
            setSelectedSlotId(matchedSlot.id);
        } else {
            setSelectedSlotId(null);
            if (manualValue) {
                setSlotValidationError("Slot not found or is not available.");
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!selectedSlotId) {
            setError("A valid, available parking slot must be assigned.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/entry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    number_plate: numberPlate,
                    vehicle_type: vehicleType,
                    billing_type: billingType,
                    slot_id: selectedSlotId,
                }),
            });

            // --- IMPROVED ERROR HANDLING ---
            if (!response.ok) {
                const errorData = await response.json();
                // Check if the detail is an array (for 422 validation errors)
                if (Array.isArray(errorData.detail)) {
                    const errorMessage = errorData.detail
                        .map((d) => d.msg)
                        .join("; ");
                    throw new Error(errorMessage);
                }
                // Handle cases where detail is just a string (like 409, 404, 400 errors)
                else if (errorData.detail) {
                    throw new Error(errorData.detail);
                }
                // Fallback for other generic errors
                else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }

            // This part only runs on a successful (2xx) response
            if (onVehicleAdded) {
                onVehicleAdded();
            }
            onClose();
        } catch (err) {
            // Set the properly formatted error message to be displayed
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === "add-car-modal-backdrop") onClose();
    };

    return (
        <div className="add-car-modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Add New Vehicle</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="numberPlate">Number Plate:</label>
                        <input
                            type="text"
                            id="numberPlate"
                            value={numberPlate}
                            onChange={(e) =>
                                setNumberPlate(e.target.value.toUpperCase())
                            }
                            placeholder="e.g., TN01AB1234"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="vehicleType">Vehicle Type:</label>
                        <select
                            id="vehicleType"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            required
                        >
                            {/* CORRECTED: The 'value' now exactly matches the backend's expected Enum values */}
                            <option value="Car">Car</option>
                            <option value="Bike">Bike</option>
                            <option value="EV">EV</option>
                            <option value="Handicap Accessible">
                                Handicap
                            </option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="slot">Parking Slot:</label>
                        <input
                            type="text"
                            id="slot"
                            value={isLoading ? "Finding..." : slotInput}
                            onChange={handleSlotInputChange}
                            placeholder="Auto-suggested or type to override"
                        />
                        {slotValidationError && (
                            <p className="error-message-small">
                                {slotValidationError}
                            </p>
                        )}
                    </div>
                    <div className="input-group">
                        <label>Billing Type:</label>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    value="Hourly"
                                    checked={billingType === "Hourly"}
                                    onChange={(e) =>
                                        setBillingType(e.target.value)
                                    }
                                />{" "}
                                Hourly
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="Day Pass"
                                    checked={billingType === "Day Pass"}
                                    onChange={(e) =>
                                        setBillingType(e.target.value)
                                    }
                                />{" "}
                                Day Pass
                            </label>
                        </div>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading || !selectedSlotId}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddCarModal;
