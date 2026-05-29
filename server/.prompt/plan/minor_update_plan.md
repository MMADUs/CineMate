i have a minor updats that you need to work on here are the sub task in a list:
1. add stocks field in the snack schema, whenever fnb-orders arrives, decrement snack stock with the quantity of each snack item from fnb-orders, stock should be update-able
2. make 2 new api for fnb-orders, this includes GET all fnb-orders and GET fnb-orders by id
3. add optional field in the fnb-orders schema for showtime id, so this means anybody can buy a snack but having the showtime id when the user willing to watch is prefered, but if they dont watch movie, showtime id can be leave empty
4. currently the user register is still traditional fullname, email, phonenum and password, now make 1 extra option using google auth, meaning user can signup and sign in using google, so we have 2 option = traditional auth and google auth, now since we have google auth as the second option to auth, you can modify the user schema, by adding what is necessary when we're using google auth, make sure make the schema works for both auth options
5. make the admin metrics, chart, and recent sales login in service to be serve in 1 api call, meaning 1 controller will call this 3 service logic
6. remove booking status field as it was not necessarily needed
7. remove fnb-orders cancel api as it was not necessarily needed
8. remove bookings cancel api as it was not necessarily needed
9. remove bookings verify api as it was not necessarily needed
10. update the bruno file that follows the new api changes
