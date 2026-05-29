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