# CineMate Bruno API Collection

Open the `bruno` directory as a collection in Bruno.

Use the `Local` environment, then run:

1. `Health/Healthcheck`
2. `Admin/Auth Login` to set admin cookies
3. admin create requests for movie, hall, showtime, and snack data
4. `Auth/Register`, `Auth/Login`, or `Auth/Google` to set user cookies
5. `Bookings/Checkout Booking` or `FNB Orders/Checkout FNB Order`

The backend uses HttpOnly cookies, so Bruno's cookie jar should keep auth cookies
after login requests.

If `IDEMPOTENCY_FLAG=true`, update `idempotencyKey` in the Local environment for
each new booking checkout or F&B checkout. Keep the same key only when
retrying the same request.

For `Storage/Upload Image`, put the test image inside `bruno/files`, then update
the `file: @file(...)` line in `Storage/Upload Image.bru` with a
collection-relative path, for example `@file(./files/poster.png)`. Bruno blocks
arbitrary absolute file paths outside the collection directory by default, and
file variables inside `@file(...)` can be interpreted as a plain text field in
some Bruno versions.

Use the upload response `key` as the movie/snack `imageKey`. The backend returns
derived `imageUrl` values in movie/snack responses. Use `Storage/Delete Image`
to remove an uploaded object from RustFS.

For `Auth/Google`, update `googleIdToken` with the ID token returned by Google
Identity Services on the frontend. The backend must also have
`GOOGLE_CLIENT_ID` configured.
