import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable } from "../utils/api";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    console.log("callled loadDashboard");
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  const handleFinish = async (table_id) => {
    const confirmed = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirmed) {
      try {
        await finishTable(table_id);
        loadDashboard(); // Refresh the list after finishing the table
      } catch (error) {
        setTablesError(error);
      }
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />

      {/* Reservations List */}
      <div>
        <h3>Reservations</h3>
        <ul>
          {console.log(reservations)}
          {reservations.map((reservation) => (
            <li key={reservation.reservation_id}>
              {reservation.first_name} {reservation.last_name} -{" "}
              {reservation.mobile_number} - {reservation.reservation_time}
              <span data-reservation-id-status={reservation.reservation_id}>
                {" "}
                - Status: {reservation.status}
              </span>
              {reservation.status === "booked" && (
                <button
                  onClick={() =>
                    history.push(
                      `/reservations/${reservation.reservation_id}/seat`
                    )
                  }
                >
                  Seat
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Tables List */}
      <div>
        <h3>Tables</h3>
        <ul>
          {tables.map((table) => (
            <li key={table.table_id}>
              {table.table_name} - Capacity: {table.capacity} -{" "}
              <span data-table-id-status={table.table_id}>
                {table.reservation_id ? "Occupied" : "Free"}
              </span>
              {table.reservation_id && (
                <button
                  data-table-id-finish={table.table_id}
                  onClick={() => handleFinish(table.table_id)}
                >
                  Finish
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default Dashboard;
