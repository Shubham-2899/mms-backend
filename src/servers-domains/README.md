# Servers & Domains API

Base URL: `/api/servers-domains`

All routes are protected by Firebase auth + Admin guard.

---

## Data Model

```json
{
  "_id": "ObjectId",
  "domain": "pingnotifier.org",
  "availableIps": [
    {
      "ip": "45.66.248.80",
      "isMainIp": true,
      "wentSpam": false,
      "provider": "bluevps"
    }
  ],
  "status": "active",
  "notes": "optional notes",
  "createdAt": "2026-03-18T00:00:00.000Z",
  "updatedAt": "2026-03-18T00:00:00.000Z"
}
```

**Rules:**
- 1 domain → 1 server only (domain is unique)
- 1 server → 1 domain (each document is one server/domain pair)
- A server can have multiple IPs (main IP + sub IPs)

---

## Endpoints

### 1. Create Server-Domain

`POST /api/servers-domains`

**Request Body:**
```json
{
  "domain": "pingnotifier.org",
  "availableIps": [
    {
      "ip": "45.66.248.80",
      "isMainIp": true,
      "wentSpam": false,
      "provider": "bluevps"
    },
    {
      "ip": "45.66.248.131",
      "isMainIp": false,
      "wentSpam": false,
      "provider": "bluevps"
    }
  ],
  "status": "active",
  "notes": "Primary sending server"
}
```

**Response `201`:**
```json
{
  "message": "Server-domain created",
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `409`** — domain already assigned to another server.

---

### 2. Get All Server-Domains

`GET /api/servers-domains`

**Response `200`:**
```json
{
  "success": true,
  "data": [ ...serverDomainObjects ]
}
```

---

### 3. Get Selectable IPs (for campaign dropdown)

`GET /api/servers-domains/selectable-ips`

Returns all active server-domains formatted as `"domain - ip"` pairs, ready to use as the `selectedIp` field in campaigns.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    { "label": "pingnotifier.org - 45.66.248.80", "value": "pingnotifier.org - 45.66.248.80" },
    { "label": "pingnotifier.org - 45.66.248.131", "value": "pingnotifier.org - 45.66.248.131" },
    { "label": "rapidnest.org - 38.45.89.183", "value": "rapidnest.org - 38.45.89.183" }
  ]
}
```

---

### 4. Get Single Server-Domain

`GET /api/servers-domains/:id`

**Response `200`:**
```json
{
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `404`** — not found.

---

### 5. Update Server-Domain

`PUT /api/servers-domains/:id`

All fields are optional. To change the domain, it must not be taken by another record.

**Request Body:**
```json
{
  "domain": "newdomain.org",
  "status": "inactive",
  "notes": "Updated notes"
}
```

**Response `200`:**
```json
{
  "message": "Updated",
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `404`** — not found.  
**Response `409`** — new domain already taken.

---

### 6. Delete Server-Domain

`DELETE /api/servers-domains/:id`

**Response `200`:**
```json
{
  "message": "Deleted",
  "success": true
}
```

**Response `404`** — not found.

---

## IP Management

### 7. Add IP to Server

`POST /api/servers-domains/:id/ips`

**Request Body:**
```json
{
  "ip": "45.66.248.200",
  "isMainIp": false,
  "provider": "bluevps"
}
```

> `wentSpam` defaults to `false` if not provided.

**Response `200`:**
```json
{
  "message": "IP added",
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `409`** — IP already exists on this server.

---

### 8. Update IP Entry

`PUT /api/servers-domains/:id/ips/:ip`

`:ip` is the IP address string, e.g. `45.66.248.80`.

**Request Body** (all fields optional):
```json
{
  "isMainIp": false,
  "provider": "newprovider",
  "wentSpam": true
}
```

**Response `200`:**
```json
{
  "message": "IP updated",
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `404`** — server or IP not found.

---

### 9. Remove IP from Server

`DELETE /api/servers-domains/:id/ips/:ip`

`:ip` is the IP address string, e.g. `45.66.248.80`.

**Response `200`:**
```json
{
  "message": "IP removed",
  "success": true,
  "data": { ...serverDomainObject }
}
```

**Response `404`** — server or IP not found.

---

### 10. Mark IP as Spam / Clear Spam Flag

`PATCH /api/servers-domains/:id/ips/:ip/spam`

**Request Body:**
```json
{
  "wentSpam": true
}
```

Set `wentSpam: false` to clear the spam flag.

**Response `200`:**
```json
{
  "message": "IP updated",
  "success": true,
  "data": { ...serverDomainObject }
}
```

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid Firebase token |
| `403` | User is not an admin |
| `404` | Resource not found |
| `409` | Conflict (duplicate domain or IP) |
| `500` | Internal server error |
