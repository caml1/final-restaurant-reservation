import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <div>
        {reservations.map((reservation) => (
          <div key={reservation.reservation_id}>
            <h5>{reservation.first_name} {reservation.last_name}</h5>
            <p>Mobile: {reservation.mobile_number}</p>
            <p>Status: {reservation.status}</p>
            {reservation.status === "booked" && (
              <a href={`/reservations/${reservation.reservation_id}/seat`}>
                <button type="button">Seat</button>
              </a>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default Dashboard;