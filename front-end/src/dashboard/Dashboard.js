import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import { today, previous, next } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const history = useHistory();

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  // Function to handle navigating to previous, next, and today's reservations
  function handleDateChange(newDate) {
    history.push(`/dashboard?date=${newDate}`);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>

      <ErrorAlert error={reservationsError} />

      {/* Navigation Buttons */}
      <div className="mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => handleDateChange(previous(date))}
        >
          Previous
        </button>
        <button
          className="btn btn-primary mx-2"
          onClick={() => handleDateChange(today())}
        >
          Today
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleDateChange(next(date))}
        >
          Next
        </button>
      </div>

      {/* Render Reservations */}
      <div>
        {reservations.length ? (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Mobile Number</th>
                <th scope="col">Reservation Date</th>
                <th scope="col">Reservation Time</th>
                <th scope="col">People</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.reservation_id}>
                  <td>{reservation.reservation_id}</td>
                  <td>{reservation.first_name} {reservation.last_name}</td>
                  <td>{reservation.mobile_number}</td>
                  <td>{reservation.reservation_date}</td>
                  <td>{reservation.reservation_time}</td>
                  <td>{reservation.people}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reservations found for this date.</p>
        )}
      </div>
    </main>
  );
}

export default Dashboard;