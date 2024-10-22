import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert"; 

function NewReservation() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  });
  const [reservationError, setReservationError] = useState(null);
  const history = useHistory();

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setReservationError(null);
    try {
      await createReservation(formData); // API call to create reservation
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setReservationError(error);
    }
  };

  return (
    <main>
      <h1>Create New Reservation</h1>
      
      {/* Display error message if present */}
      {reservationError && (
        <div className="alert alert-danger">
          <ErrorAlert error={reservationError} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Reservation form fields */}
        <label htmlFor="first_name">First Name</label>
        <input
          name="first_name"
          id="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="last_name">Last Name</label>
        <input
          name="last_name"
          id="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="mobile_number">Mobile Number</label>
        <input
          name="mobile_number"
          id="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
          required
        />

        <label htmlFor="reservation_date">Reservation Date</label>
        <input
          type="date"
          name="reservation_date"
          id="reservation_date"
          value={formData.reservation_date}
          onChange={handleChange}
          required
        />

        <label htmlFor="reservation_time">Reservation Time</label>
        <input
          type="time"
          name="reservation_time"
          id="reservation_time"
          value={formData.reservation_time}
          onChange={handleChange}
          required
        />

        <label htmlFor="people">People</label>
        <input
          type="number"
          name="people"
          id="people"
          value={formData.people}
          onChange={handleChange}
          min="1"
          required
        />

        <button type="submit">Submit</button>
        <button type="button" onClick={() => history.goBack()}>Cancel</button>
      </form>
    </main>
  );
}

export default NewReservation;