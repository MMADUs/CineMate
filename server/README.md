# terminal 1
docker compose up mysql phpmyadmin rustfs

# terminal 2
npm run db:migrate
npm run build
npm run seed:admin
npm run start:dev

# access
API: http://localhost:3000/api
Swagger: http://localhost:3000/api/docs
phpMyAdmin: http://localhost:8080
RustFS dashboard: http://localhost:9001