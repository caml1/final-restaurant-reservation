import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";
import { useHistory } from "react-router-dom";
import ReservationsCard from "./ReservationCard";

export default function CreateReservations() {
  const history = useHistory();

  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  const [formData, setFormData] = useState({ ...initialForm });
  const [reservationsError, setReservationsError] = useState(null);

  const changeHandler = ({ target }) => {
    let value = target.value;
    if (target.name === "mobile_number") {
      // Remove all non-numeric characters, format as "123-456-7890"
      value = value.replace(/\D/g, ""); 
      if (value.length > 3 && value.length <= 6) {
        value = `${value.slice(0, 3)}-${value.slice(3)}`;
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
      }
    }
    if (target.name === "people") {
      value = Number(value);
    }
    
    setFormData({
      ...formData,
      [target.name]: value,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    async function addReservation() {
      try {
        await createReservation({ data: formData }, abortController.signal);
        history.push(`/dashboard?date=${formData.reservation_date}`);
      } catch (error) {
        setReservationsError(error);
      }
    }
    addReservation();
    return () => abortController.abort();
  };

  return (
    <>
      <h1>Create Reservation</h1>
      <ErrorAlert error={reservationsError} />
      <ReservationsCard changeHandler={changeHandler} formData={formData}  />
      <button className="btn btn-secondary mr-2" onClick={history.goBack}>
        Cancel
      </button>
      <button
        form="reservationCard"
        type="submit"
        className="btn btn-primary"
        onClick={submitHandler}
      >
        Submit
      </button>
    </>
  );
}