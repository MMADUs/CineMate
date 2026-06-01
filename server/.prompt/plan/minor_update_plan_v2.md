i have a minor updats that you need to work on here are the sub task in a list:
1. cinema halls currently holds the value 
  cinemaName: varchar('CinemaName', { length: 100 }).notNull(),
  studioName: varchar('StudioName', { length: 50 }).notNull(),
and lets split this so we will have 2 seperate schema, first schema is cinama schema, and second schema is studio schema, so studio schema is basically the current cinema halls schema without cinema name, and the cinema schema will just have the cinema name and location, and it will be related to the studio schema, so each cinema can have multiple studios
2. in the bookings controller to get all bookings, and the refered service is findUserBookings should also returned the bookedseat just like finduserbooking (this is the controller to get booking by id)
3. make new api called GET /admin/bookings = this should return all the bookings and the join that needs to be perform in this api call is to join payment, showtime, movie, booked seat, and user info, you can place this api wherever that feels suitable in the nestjs module hierarchy
4. make new api called GET /admin/fnb-orders = this should return all the fnb-orders and the join that needs to be perform in this api call is to join the corresponding items that is being ordered, payment, and user info