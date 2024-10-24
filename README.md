# Restaurant Reservation System


Endpoints:

	1.	Create a Reservation
	•	POST /reservations
	•	Description: Creates a new reservation in the system. Requires information such as the customer’s name, mobile number, reservation date, time, and the number of people in the party.
	•	Expected Response: Returns the created reservation with all provided details and assigns it the status of “booked.”
	2.	List Reservations by Date
	•	GET /reservations?date=YYYY-MM-DD
	•	Description: Retrieves a list of all reservations for a specified date. If no reservations are found, an empty list is returned.
	3.	Seat a Reservation
	•	PUT /tables/:table_id/seat
	•	Description: Assigns a reservation to a table. The request must include the reservation ID. The system will update the reservation’s status to “seated” and associate the reservation with the specified table.
	4.	Update Reservation Status
	•	PUT /reservations/:reservation_id/status
	•	Description: Updates the status of an existing reservation. Valid statuses include “booked”, “seated”, “finished”, or “cancelled.” This allows users to track the current status of each reservation.

> Restaurant Reservation System is a fine-dining reservation system designed to streamline the reservation process for restaurants. Users can create reservations, assign them to tables, update statuses, and manage table occupancy all in one platform. The application ensures that the reservations are properly handled and provides real-time updates to users for a seamless dining experience.

> Technology Used

	•	Front-end: React, CSS
	•	Back-end: Node.js, Express.js
	•	Database: PostgreSQL
	•	Testing: Jest, Supertest
	•	Deployment: Render, ElephantSQL for database hosting

> Installation instructions

	1.	Clone the Repository:
Obtain the source code by cloning the repository from the provided URL.
	2.	Install Dependencies:
Use a package manager to install all necessary project dependencies, which are listed in the project’s configuration file.
	3.	Set Up Environment Variables:
Create a file for environment variables. Add the necessary configuration settings, including the database connection URL.
	4.	Run Migrations:
Apply the database migrations to set up the required database schema.
	5.	Seed the Database (optional):
If applicable, populate the database with initial data using the provided seed files.
	6.	Start the Application:
Launch the application locally to verify that it’s running as expected.
	7.	Run Tests:
Execute the test suite to ensure all functionality is working correctly before deployment.