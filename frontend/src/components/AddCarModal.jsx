import "./AddCarModal.css";

function AddCarModal() {
    return (
        <div className="add-car-modal-container">
            <input type="text" placeholder="Number Plate"></input>
            <select defaultValue={"Car"}>
                <option>Car</option>
                <option>Bike</option>
                <option>EV</option>
                <option>Accesibility</option>
            </select>
            <input type="text" placeholder="Slot"></input>
        </div>
    );
}

export default AddCarModal;
