import React, { useState, useEffect } from "react";
import { listTables, seatReservation } from "../utils/api";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

function SeatReservation() {
  const { reservation_id } = useParams(); // Get reservation ID from the URL
  const history = useHistory(); // For navigation
  const [tables, setTables] = useState([]); // List of tables
  const [selectedTable, setSelectedTable] = useState(""); // Selected table ID
  const [seatError, setSeatError] = useState(null); // Error handling

  // Fetch available tables when the component loads
  useEffect(() => {
    const abortController = new AbortController();
    listTables(abortController.signal)
      .then(setTables)
      .catch(setSeatError); // Catch any errors during fetching tables
    return () => abortController.abort();
  }, []);

  // Handle form submission to seat a reservation
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSeatError(null);

    try {
      // Call API to seat the reservation
      await seatReservation(selectedTable, reservation_id);
      history.push("/dashboard"); // Navigate to dashboard after seating
    } catch (error) {
      setSeatError(error); // Catch errors like table too small or already occupied
    }
  };

  return (
    <main>
      <h1>Seat Reservation</h1>
      {seatError && <ErrorAlert error={seatError} />}
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
      </form>
    </main>
  );
}

export default SeatReservation;