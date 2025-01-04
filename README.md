<a href="https://open-dpp.de/" target="blank"><img src="https://open-dpp.de/wp-content/uploads/2024/11/Logo-with-text.png" width="200" alt="Nest Logo" /></a>

The open source plattform for digital product passports

# Description

This repository contains the REST API for the open-dpp plattform.

# Local development

## Installation
```bash
$ npm install
```

## Configure service
For the service configuration create an _.env_ file with the following content:
```dotenv
DB_HOST=localhost
DB_PORT=20003
DB_USERNAME=open-dpp
DB_PASSWORD=open-dpp
DB_DATABASE=open-dpp
KEYCLOAK_PUBLIC_URL=http://localhost:20000
KEYCLOAK_NETWORK_URL=http://localhost:20000
KEYCLOAK_REALM=open-dpp
KEYCLOAK_CLIENT=backend
KEYCLOAK_ADMIN_REALM=master
KEYCLOAK_ADMIN_CLIENT=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin
```
## Database and Authentication
Start the [PostgreSQL](https://www.postgresql.org/) database together with the authentication service [KEYCLOAK](https://www.keycloak.org/) with [Docker Compose](https://docs.docker.com/compose/).
```bash
$ docker compose up
```
## Run application
After the [configuration](#configure-service) and the [database setup](#database-and-authentication) you can start the application in different modes:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# debug mode
$ npm run start:debug
```

## Test
After the [configuration](#configure-service) and the [database setup](#database-and-authentication) you can run the tests by the following:
```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Support
If you want to join us contact us at [info@open-dpp.de](mailto:info@open-dpp.de?subject=Support%20for%20api%20repo).

## License

The license of the REST API of open-dpp is [GNU GENERAL PUBLIC LICENSE](LICENSE).

