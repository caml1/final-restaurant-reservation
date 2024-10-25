import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";

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

  useEffect(()=> {
    return formData
  }, [formData]);

  const handleChange = (event) => {
    if (event.target.name === "people") {
      setFormData({
        ...formData,
        [event.target.name]: Number(event.target.value),
      });
    } else {
      setFormData({
        ...formData, 
        [event.target.name]: event.target.value,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setReservationError(null);

    const today = new Date();
    const selectedDate = new Date(`${formData.reservation_date}T${formData.reservation_time}`);

    if (selectedDate < today) {
      setReservationError({ message: "Reservation date must be in the future." });
      return;
    }

    try {
      await createReservation(formData); 
      history.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setReservationError(error);
    }
  };

  return (
    <main>
      <h1>Create New Reservation</h1>
      
      {reservationError && (
        <div className="alert alert-danger">
          <ErrorAlert error={reservationError} />
        </div>
      )}

      <ReservationForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={() => history.goBack()}
      />
    </main>
  );
}

export default NewReservation;