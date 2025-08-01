import "./AddCar.css";

function AddCar({ onClick }) {
    return (
        <div className="add-car-button-container" onClick={onClick}>
            ADD
        </div>
    );
}

export default AddCar;
