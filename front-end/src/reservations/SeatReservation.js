import React, { useState, useEffect } from "react";
import { listTables, seatReservation } from "../utils/api";
import { useParams, useHistory } from "react-router-dom";

function SeatReservation() {
  const { reservation_id } = useParams();  // Get the reservation ID from the URL
  const history = useHistory();  // Use history for redirecting after submission
  const [tables, setTables] = useState([]);  // List of available tables
  const [selectedTable, setSelectedTable] = useState("");  // The selected table ID
  const [seatError, setSeatError] = useState(null);  // For error handling

  // Fetch available tables when the component loads
  useEffect(() => {
    const abortController = new AbortController();
    listTables(abortController.signal)
      .then(setTables)
      .catch(setSeatError);  // Catch any errors in fetching tables
    return () => abortController.abort();
  }, []);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await seatReservation(selectedTable, reservation_id);  // Seat the reservation
      history.push("/dashboard");  // Redirect to the dashboard
    } catch (error) {
      setSeatError(error);  // Handle errors like table being occupied or too small
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="table_id">Seat at Table:</label>
      <select
        id="table_id"
        name="table_id"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
        required
      >
        <option value="">--Select a table--</option>
        {tables.map((table) => (
          <option key={table.table_id} value={table.table_id}>
            {table.table_name} - {table.capacity}
          </option>
        ))}
      </select>
      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
      {seatError && <div className="alert alert-danger">{seatError.message}</div>}
    </form>
  );
}

export default SeatReservation;