<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# MMS Backend

A progressive [Node.js](http://nodejs.org) backend built with [NestJS](https://nestjs.com/) for efficient and scalable server-side applications.

---

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Running the app](#running-the-app)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Email Sending](#email-sending)
  - [URL Shortener](#url-shortener)
  - [Reports](#reports)
  - [Jobs](#jobs)
  - [Email List Management](#email-list-management)
  - [BullMQ Dashboard](#bullmq-dashboard)
- [Testing](#testing)
- [Support](#support)
- [License](#license)

---

## Description

This repository contains the backend for the MMS platform, providing APIs for user management, email sending (bulk and test), URL shortening and analytics, reporting, job queue management, and more. Built with NestJS, MongoDB, BullMQ, and Firebase authentication.

---

## Installation

```bash
npm install
```

---

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

---

## API Documentation

### Authentication

Most endpoints require authentication via Firebase JWT.  
**Add the following header to your requests:**

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

Some endpoints require admin privileges (see below).

---

### User Management

**Base URL:** `/api/users`

| Method | Endpoint              | Description                  | Auth      | Body/Params                                                                                 |
|--------|----------------------|------------------------------|-----------|--------------------------------------------------------------------------------------------|
| GET    | `/api/users`         | Get all users                | Admin     | -                                                                                          |
| POST   | `/api/users/create`  | Create a new user            | Admin     | `{ email, password, displayName, serverData, isAdmin }`                                    |
| PUT    | `/api/users/update/:uid` | Update user by Firebase UID | Admin     | `{ email?, password?, displayName?, serverData?, isAdmin }`                                |
| DELETE | `/api/users/delete/:uid` | Delete user by Firebase UID | Admin     | -                                                                                          |
| GET    | `/api/users/:uid`    | Get user by Firebase UID     | Admin     | -                                                                                          |

---

### Email Sending

**Base URL:** `/api`

| Method | Endpoint         | Description                       | Auth      | Body/Params                                                                                 |
|--------|-----------------|-----------------------------------|-----------|--------------------------------------------------------------------------------------------|
| POST   | `/api/sendemail` | Send emails (test or bulk)        | User      | [CreateEmailDto](#createemaildto) + `Authorization` header                                 |
| GET    | `/api/availableIps` | Get available domains/IPs       | User      | -                                                                                          |
| POST   | `/api/stopjob`   | Stop a running email job          | User      | `{ jobId: number }`                                                                        |

#### <a id="createemaildto"></a>CreateEmailDto

```json
{
  "from": "string",
  "fromName": "string",
  "subject": "string",
  "to": ["string"],
  "templateType": "string",
  "emailTemplate": "string",
  "mode": "string", // "test" or "bulk"
  "offerId": "string",
  "campaignId": "string",
  "selectedIp": "string",
  "batchSize": number,
  "delay": number
}
```

---

### URL Shortener

**Base URL:** `/api/url`

| Method | Endpoint         | Description                       | Auth      | Body/Params                                                                                 |
|--------|-----------------|-----------------------------------|-----------|--------------------------------------------------------------------------------------------|
| POST   | `/api/url`      | Create a new short URL            | User      | `{ url, domain, offerId, linkType, campaignId, linkPattern }`                              |
| GET    | `/api/url/reports` | Get all URL analytics/reports   | User      | Optional: `shortId` query param                                                            |

---

### Reports

**Base URL:** `/api/reports`

| Method | Endpoint         | Description                       | Auth      | Query Params                                                                               |
|--------|-----------------|-----------------------------------|-----------|--------------------------------------------------------------------------------------------|
| GET    | `/api/reports`  | Get paginated reports             | User      | `page`, `pageSize`, `offerId`, `campaignId`, `fromDate`, `toDate`                          |

---

### Jobs

**Base URL:** `/jobs`

| Method | Endpoint         | Description                       | Auth      | Query Params                                                                               |
|--------|-----------------|-----------------------------------|-----------|--------------------------------------------------------------------------------------------|
| DELETE | `/jobs/clean-old` | Clean old jobs from Bull queue   | Admin     | `value` (number), `unit` ("second", "minute", "hour")                                     |

---

### Email List Management

**Base URL:** `/api/email_list`

| Method | Endpoint         | Description                       | Auth      | Body/Params                                                                                 |
|--------|-----------------|-----------------------------------|-----------|--------------------------------------------------------------------------------------------|
| POST   | `/api/email_list/add-emails` | Add emails via array   | Admin     | `{ emails: string[], campaignId: string }`                                                 |
| POST   | `/api/email_list/upload-emails` | Upload emails via CSV | Admin     | `file` (CSV), `campaignId` (form-data)                                                     |
| GET    | `/api/email_list/suppressions` | Get suppression list  | Admin     | `page`, `limit`, `fromDate`, `toDate`                                                      |

---

### BullMQ Dashboard

**Base URL:** `/api/admin/dashboard`

- Provides a web dashboard for queue/job monitoring.
- Requires admin authentication.

---

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

---

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

---

## License

Nest is [MIT licensed](LICENSE).

---

## Notes

- All endpoints (except `/` and static files) require a valid Firebase JWT in the `Authorization` header.
- Admin endpoints require the user to have the `admin` claim.
- For API exploration and testing, consider integrating [Swagger](https://docs.nestjs.com/openapi/introduction) in the future.
