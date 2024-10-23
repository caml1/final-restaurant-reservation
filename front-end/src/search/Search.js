import React, { useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setSearchError(null);
    try {
      const data = await listReservations({ mobile_number: mobileNumber }, abortController.signal);
      setReservations(data);
    } catch (error) {
      setSearchError(error);
    }
    return () => abortController.abort();
  };

  return (
    <main>
      <h1>Search</h1>
      <form onSubmit={handleSearch}>
        <input
          name="mobile_number"
          type="text"
          placeholder="Enter a customer's phone number"
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.target.value)}
        />
        <button type="submit">Find</button>
      </form>
      <ErrorAlert error={searchError} />
      {reservations.length > 0 ? (
        reservations.map((reservation) => (
          <div key={reservation.reservation_id}>
            <h5>
              {reservation.first_name} {reservation.last_name}
            </h5>
            <p>Mobile: {reservation.mobile_number}</p>
            <p>Status: {reservation.status}</p>
          </div>
        ))
      ) : (
        <p>No reservations found</p>
      )}
    </main>
  );
}

export default Search;