import React, { useState } from "react";

/**
 * Reservation form component for both creating and editing a reservation.
 * @param {object} props
 *  formData: object with reservation details.
 *  handleSubmit: function to handle form submission.
 *  handleCancel: function to handle canceling the form.
 */
function ReservationForm({ formData, handleSubmit, handleCancel }) {
  const [reservation, setReservation] = useState({ ...formData });

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setReservation((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleSubmit(reservation);
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          value={reservation.first_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          value={reservation.last_name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="mobile_number">Mobile Number</label>
        <input
          id="mobile_number"
          name="mobile_number"
          type="text"
          value={reservation.mobile_number}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="reservation_date">Reservation Date</label>
        <input
          id="reservation_date"
          name="reservation_date"
          type="date"
          value={reservation.reservation_date}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="reservation_time">Reservation Time</label>
        <input
          id="reservation_time"
          name="reservation_time"
          type="time"
          value={reservation.reservation_time}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="people">People</label>
        <input
          id="people"
          name="people"
          type="number"
          value={reservation.people}
          onChange={handleChange}
          required
          min="1"
        />
      </div>
      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
}

export default ReservationForm;