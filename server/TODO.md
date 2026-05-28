# todo list are written in this markdown file

mandatory:
- idempotency in post api requests
- app logging
- bruno api client
- connect the xendit payment gateway

later task (mostly improvements):
- review db schema and relation
- refactor: module hierarchy, mappers in each module to avoid accidental leaking of DB fields, shared constants from common module
- unit testing
- end2end testing
- backend docs (comprehensive readme files)
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