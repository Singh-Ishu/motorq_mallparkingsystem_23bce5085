import React, { useState } from "react";
import "./FilterParkingModal.css";

function FilterParkingModal({ onClose, onApplyFilter, currentFilter }) {
    // State to manage the selected filter category within the modal
    const [selectedCategory, setSelectedCategory] = useState(
        currentFilter || "All"
    );

    // Handle change for radio buttons
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    // Handle applying the filter
    const handleApply = () => {
        onApplyFilter(selectedCategory);
        onClose(); // Close the modal after applying
    };

    // Handle clearing the filter
    const handleClear = () => {
        onApplyFilter("All"); // Reset filter to 'All'
        onClose(); // Close the modal after clearing
    };

    // Function to handle clicks on the backdrop
    const handleBackdropClick = (event) => {
        if (event.target.className === "filter-parking-modal-backdrop") {
            onClose();
        }
    };

    return (
        <div
            className="filter-parking-modal-backdrop"
            onClick={handleBackdropClick}
        >
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Filter Parking Spots</h2>
                <div className="filter-options">
                    <div className="filter-option">
                        <input
                            type="radio"
                            id="filter-all"
                            name="vehicle-type"
                            value="All"
                            checked={selectedCategory === "All"}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor="filter-all">All Vehicles</label>
                    </div>
                    <div className="filter-option">
                        <input
                            type="radio"
                            id="filter-car"
                            name="vehicle-type"
                            value="Car"
                            checked={selectedCategory === "Car"}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor="filter-car">Cars</label>
                    </div>
                    <div className="filter-option">
                        <input
                            type="radio"
                            id="filter-bike"
                            name="vehicle-type"
                            value="Bike"
                            checked={selectedCategory === "Bike"}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor="filter-bike">Bikes</label>
                    </div>
                    <div className="filter-option">
                        <input
                            type="radio"
                            id="filter-ev"
                            name="vehicle-type"
                            value="EV"
                            checked={selectedCategory === "EV"}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor="filter-ev">EVs</label>
                    </div>
                    <div className="filter-option">
                        <input
                            type="radio"
                            id="filter-accessibility"
                            name="vehicle-type"
                            value="Accessibility"
                            checked={selectedCategory === "Accessibility"}
                            onChange={handleCategoryChange}
                        />
                        <label htmlFor="filter-accessibility">
                            Accessibility
                        </label>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="apply-button" onClick={handleApply}>
                        Apply Filter
                    </button>
                    <button className="clear-button" onClick={handleClear}>
                        Clear Filter
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FilterParkingModal;
