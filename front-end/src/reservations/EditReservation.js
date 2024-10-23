import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationForm from "./ReservationForm";

function EditReservation() {
  const { reservation_id } = useParams();
  const history = useHistory();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    setError(null);

    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setError);

    return () => abortController.abort();
  }, [reservation_id]);

  const handleSubmit = (updatedReservation) => {
    const abortController = new AbortController();
    setError(null);

    updateReservation(updatedReservation, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch(setError);

    return () => abortController.abort();
  };

  if (!reservation) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Edit Reservation</h1>
      <ErrorAlert error={error} />
      <ReservationForm
        onSubmit={handleSubmit}
        initialData={reservation}
        cancel={() => history.goBack()}
      />
    </div>
  );
}

export default EditReservation;