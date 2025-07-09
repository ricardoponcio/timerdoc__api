# TimerDoc API

TimerDoc is a Document Management System designed to help users register documents, track deadlines, and manage responsibilities. The platform allows users to associate each document with its required completion period, the client requesting the document, and the person responsible for its delivery. This ensures efficient document tracking, accountability, and timely completion for organizations and teams.

Backend service for the TimerDoc platform, built with [NestJS](https://nestjs.com/) and Sequelize ORM.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- RESTful API built with NestJS
- Sequelize ORM for database management
- Health and environment check endpoints
- Internationalization support (i18n)
- Docker support for containerized deployment

---

## Project Structure

```
timerdoc__api/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── checkers/
│   ├── common/
│   ├── config/
│   ├── core/
│   ├── i18n/
│   ├── resources/
│   └── utils/
├── models/
├── test/
├── .env
├── Dockerfile
├── package.json
└── ...
```

---

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and update variables as needed.

3. **Run database migrations:**
   ```sh
   npm run migrate
   ```

4. **Start the development server:**
   ```sh
   npm run start:dev
   ```

---

## Scripts

- `npm run start:dev` – Start in watch mode
- `npm run build` – Build the project
- `npm run migrate` – Run database migrations
- `npm run test` – Run tests
- `npm run lint` – Lint code

See all scripts in [package.json](c:/DEV/Pessoal/Timerdoc/timerdoc__api/package.json).

---

## Configuration

- Environment variables are managed via `.env`.
- Database and other configs are in [`src/config`](c:/DEV/Pessoal/Timerdoc/timerdoc__api/src/config).

---

## Testing

- Unit and e2e tests are in [`test/`](c:/DEV/Pessoal/Timerdoc/timerdoc__api/test).
- Run all tests:
  ```sh
  npm test
  ```

---

## Contributing

Pull requests are welcome! Please lint and test your code before submitting.

---

## License

This project is **UNLICENSED**. See [package.json](c:/DEV/Pessoal/Timerdoc/timerdoc__api/package.json) for details.
