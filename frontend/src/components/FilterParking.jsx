import "./FilterParking.css";

function FilterParking({ onClick }) {
    // Accept the onClick prop
    return (
        <div className="filter-button-container" onClick={onClick}>
            FILTER
        </div>
    );
}

export default FilterParking;
