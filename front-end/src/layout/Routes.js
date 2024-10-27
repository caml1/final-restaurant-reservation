import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import CreateReservations from "../reservations/CreateReservation";
import SeatReservation from "../reservations/SeatReservations";
import CreateTable from "../tables/CreateTable";
import NotFound from "./NotFound";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";
import Search from "../search/Search";
import EditReservations from "./EditReservation";

/**
 * Defines all application routes and associated components.
 * Routes component utilizes React Router for client-side routing.
 */

function Routes() {
  const query = useQuery(); // Extract query parameters from the URL
  const date = query.get("date"); // Get the 'date' query parameter, if available

  return (
    <Switch>
      {/* Home route - redirects to the dashboard */}
      <Route exact path="/">
        <Redirect to="/dashboard" />
      </Route>

      {/* Search route - renders the Search component */}
      <Route path="/search">
        <Search />
      </Route>

      {/* Create new table route - renders the CreateTable component */}
      <Route path="/tables/new">
        <CreateTable />
      </Route>

      {/* Edit reservation route - renders the EditReservations component for editing reservations */}
      <Route path="/reservations/:reservation_id/edit">
        <EditReservations />
      </Route>

      {/* Seat reservation route - renders the SeatReservation component */}
      <Route path="/reservations/:reservation_id/seat">
        <SeatReservation />
      </Route>

      {/* Create new reservation route - renders the CreateReservations component */}
      <Route path="/reservations/new">
        <CreateReservations />
      </Route>

      {/* Reservations route - redirects to the dashboard */}
      <Route exact path="/reservations">
        <Redirect to="/dashboard" />
      </Route>

      {/* Dashboard route - renders the Dashboard component, passing in date from query or today's date */}
      <Route path="/dashboard">
        <Dashboard date={date || today()} />
      </Route>

      {/* Catch-all route - renders NotFound component for undefined paths */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
