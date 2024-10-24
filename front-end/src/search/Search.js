import React, { useState } from "react";
import { searchReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Search() {
  const [mobileNumber, setMobileNumber] = useState(""); // User input for phone number
  const [reservations, setReservations] = useState([]); // Search results
  const [searchError, setSearchError] = useState(null); // Error handling

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearchError(null);

    try {
      const data = await searchReservations(mobileNumber); // API call to search reservations
      setReservations(data); // Set reservations list with search results
    } catch (error) {
      setSearchError(error); // Handle search errors
    }
  };

  return (
    <main>
      <h1>Search Reservations</h1>
      <form onSubmit={handleSearch}>
        <label htmlFor="mobile_number">Mobile Number:</label>
        <input
          id="mobile_number"
          name="mobile_number"
          type="text"
          placeholder="Enter a phone number"
          value={mobileNumber}
          onChange={(event) => setMobileNumber(event.target.value)}
          required
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