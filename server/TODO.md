# todo list are written in this markdown file

question mark:
- current google sign in implementation only using client id while, some implementation uses oauth callback flow, figure this out, there is a straightforward practice by using nestjs/passport
- current payment implementation is using the hosted payment approach where client are redirected to xendit payment page, although there is more flexible but more complicated approach called embedded payment, this way client can have custom UI for the payment page, interesting but hard, so figure this out later

review list:
- unit testing
- review db schema and relation

mandatory:
- connect the xendit payment gateway
- backend docs (comprehensive readme files)

maybe very later:
- end2end testing
- refactor: module hierarchy, mappers in each module to avoid accidental leaking of DB fields, shared constants from common module
- git workflow for CI/CD (simulate real deployment)

notes:
- movie by id: show showtime, showtime will show cinema name, and studio name, everything is serve by sql join
- get all booking controller and get booking by id controller: show movie, showtime, cinema name, studio name, booked seat, payment, everything is serve by sql join
- get all fnb-orders controller and get fnb-orders by id controller: show all ordered items, payment, booking id (this is optional right in the context of fnb order, but i want it to be returned with together with its showtime including movie and booked seat, this way we can have a complete picture of what the customer ordered)

module hirerachy idea:
```
src/
  modules/
    admin/
      auth/
      dashboard/
      logs/
      transactions/
    users/
      auth/
      profile/
    catalog/
      movies/
      snacks/
    cinema/
      halls/
      seats/
      showtimes/
    orders/
      bookings/
      fnb-orders/
    payments/
      providers/
      webhooks/
  common/
  config/
  database/
```