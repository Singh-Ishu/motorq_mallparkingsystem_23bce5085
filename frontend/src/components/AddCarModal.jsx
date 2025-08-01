import React from "react";
import "./AddCarModal.css";

function AddCarModal({ onClose }) {
    // Function to handle clicks on the backdrop
    const handleBackdropClick = (event) => {
        // Only close if the click occurred directly on the backdrop (not on the modal content)
        if (event.target.className === "add-car-modal-backdrop") {
            onClose();
        }
    };

    // Function to handle form submission (you'll add actual logic here later)
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        console.log("Form submitted!");
        // Here you would typically gather input values and send them to a parent component or API
        onClose(); // Close the modal after submission (or based on success/failure)
    };

    return (
        // The backdrop for the modal, covers the whole screen
        <div className="add-car-modal-backdrop" onClick={handleBackdropClick}>
            {/* The actual modal content container */}
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;{" "}
                    {/* HTML entity for a multiplication sign, commonly used for close buttons */}
                </button>
                <h2>Add New Vehicle</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="numberPlate">Number Plate:</label>
                        <input
                            type="text"
                            id="numberPlate"
                            placeholder="e.g., TN01AB1234"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="vehicleType">Vehicle Type:</label>
                        <select id="vehicleType" defaultValue="Car">
                            <option value="Car">Car</option>
                            <option value="Bike">Bike</option>
                            <option value="EV">EV</option>
                            <option value="Accessibility">Accessibility</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="slot">Parking Slot:</label>
                        <input
                            type="text"
                            id="slot"
                            placeholder="e.g., A101"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddCarModal;
