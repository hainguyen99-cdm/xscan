# Donation History API Documentation

This document provides comprehensive documentation for the donation history endpoints implemented in the donation processing system.

## Overview

The donation history API provides advanced filtering, analytics, and reporting capabilities for donation data. It includes endpoints for retrieving donation history, analytics, trends, and comparisons.

## Base URL

All endpoints are prefixed with `/donations`

## Authentication

All endpoints require JWT authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Donation History

**Endpoint:** `GET /donations/history`

**Description:** Retrieve comprehensive donation history with advanced filtering options.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `streamerId` | string | No | Filter by streamer ID | `507f1f77bcf86cd799439011` |
| `donorId` | string | No | Filter by donor ID | `507f1f77bcf86cd799439012` |
| `status` | string | No | Filter by donation status | `completed`, `pending`, `failed`, `cancelled` |
| `paymentMethod` | string | No | Filter by payment method | `wallet`, `stripe`, `paypal` |
| `currency` | string | No | Filter by currency | `USD`, `EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `CHF`, `CNY` |
| `minAmount` | number | No | Minimum donation amount | `10.50` |
| `maxAmount` | number | No | Maximum donation amount | `100.00` |
| `startDate` | string | No | Start date (ISO string) | `2024-01-01T00:00:00.000Z` |
| `endDate` | string | No | End date (ISO string) | `2024-12-31T23:59:59.999Z` |
| `isAnonymous` | boolean | No | Filter anonymous donations | `true`, `false` |
| `sortBy` | string | No | Sort field | `createdAt`, `amount`, `status`, `paymentMethod` |
| `sortOrder` | string | No | Sort order | `asc`, `desc` |
| `limit` | number | No | Results per page (1-100) | `20` |
| `page` | number | No | Page number | `1` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "donorId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "donor123",
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "profile.jpg"
      },
      "streamerId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "streamer123",
        "firstName": "Jane",
        "lastName": "Smith",
        "profilePicture": "streamer.jpg"
      },
      "donationLinkId": {
        "_id": "507f1f77bcf86cd799439014",
        "title": "Support My Stream",
        "slug": "support-stream",
        "customUrl": "https://example.com/donate/support"
      },
      "amount": 50.00,
      "currency": "USD",
      "message": "Great stream! Keep it up!",
      "isAnonymous": false,
      "status": "completed",
      "paymentMethod": "stripe",
      "processingFee": 2.50,
      "netAmount": 47.50,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "summary": {
    "totalDonations": 150,
    "totalAmount": 7500.00,
    "totalNetAmount": 7125.00,
    "totalFees": 375.00,
    "averageAmount": 50.00,
    "averageNetAmount": 47.50,
    "minAmount": 1.00,
    "maxAmount": 500.00
  },
  "message": "Donation history retrieved successfully"
}
```

### 2. Get Top Donors

**Endpoint:** `GET /donations/top-donors/:streamerId`

**Description:** Retrieve top donors for a specific streamer.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `streamerId` | string | Yes | Streamer ID |

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `limit` | number | No | Number of top donors (1-100) | `10` |
| `timeRange` | string | No | Time range filter | `24h`, `7d`, `30d`, `90d` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "donorId": "507f1f77bcf86cd799439012",
      "donor": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "topdonor1",
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "profile1.jpg"
      },
      "totalDonations": 15,
      "totalAmount": 750.00,
      "totalNetAmount": 712.50,
      "averageAmount": 50.00,
      "lastDonation": "2024-01-15T10:30:00.000Z",
      "firstDonation": "2024-01-01T08:00:00.000Z"
    }
  ],
  "message": "Top donors retrieved successfully"
}
```

### 3. Get Donation Analytics

**Endpoint:** `GET /donations/analytics`

**Description:** Retrieve comprehensive donation analytics with detailed insights.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `streamerId` | string | No | Filter by streamer ID | `507f1f77bcf86cd799439011` |
| `timeRange` | string | No | Time range filter | `24h`, `7d`, `30d`, `90d` |

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": [{
      "totalDonations": 150,
      "totalAmount": 7500.00,
      "totalNetAmount": 7125.00,
      "totalFees": 375.00,
      "averageAmount": 50.00,
      "averageNetAmount": 47.50,
      "minAmount": 1.00,
      "maxAmount": 500.00,
      "anonymousDonations": 25,
      "namedDonations": 125
    }],
    "paymentMethods": [
      {
        "_id": "stripe",
        "count": 100,
        "totalAmount": 5000.00,
        "averageAmount": 50.00
      },
      {
        "_id": "wallet",
        "count": 50,
        "totalAmount": 2500.00,
        "averageAmount": 50.00
      }
    ],
    "currencies": [
      {
        "_id": "USD",
        "count": 150,
        "totalAmount": 7500.00,
        "averageAmount": 50.00
      }
    ],
    "dailyTrends": [
      {
        "_id": {
          "year": 2024,
          "month": 1,
          "day": 15
        },
        "count": 10,
        "totalAmount": 500.00,
        "averageAmount": 50.00
      }
    ],
    "hourlyDistribution": [
      {
        "_id": 14,
        "count": 25,
        "totalAmount": 1250.00
      }
    ],
    "topDonations": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "amount": 500.00,
        "currency": "USD",
        "message": "Amazing stream!",
        "isAnonymous": false,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "donor": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "bigdonor",
          "firstName": "John",
          "lastName": "Doe"
        },
        "streamer": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "streamer123",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ]
  },
  "message": "Donation analytics retrieved successfully"
}
```

### 4. Get Donation Trends

**Endpoint:** `GET /donations/trends`

**Description:** Retrieve donation trends over time with different granularities.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `streamerId` | string | No | Filter by streamer ID | `507f1f77bcf86cd799439011` |
| `period` | string | No | Time period granularity | `hourly`, `daily`, `weekly`, `monthly` |
| `days` | number | No | Number of days to analyze (1-365) | `30` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": {
        "year": 2024,
        "month": 1,
        "day": 15
      },
      "count": 10,
      "totalAmount": 500.00,
      "totalNetAmount": 475.00,
      "averageAmount": 50.00,
      "anonymousCount": 2,
      "namedCount": 8
    }
  ],
  "message": "Donation trends retrieved successfully"
}
```

### 5. Get Donation Comparison

**Endpoint:** `GET /donations/comparison`

**Description:** Compare donation metrics between different time periods.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `streamerId` | string | No | Filter by streamer ID | `507f1f77bcf86cd799439011` |
| `currentPeriod` | string | No | Current period | `24h`, `7d`, `30d`, `90d` |
| `previousPeriod` | string | No | Previous period | `24h`, `7d`, `30d`, `90d` |

**Response:**

```json
{
  "success": true,
  "data": {
    "current": {
      "count": 50,
      "totalAmount": 2500.00,
      "totalNetAmount": 2375.00,
      "averageAmount": 50.00
    },
    "previous": {
      "count": 30,
      "totalAmount": 1500.00,
      "totalNetAmount": 1425.00,
      "averageAmount": 50.00
    },
    "changes": {
      "count": 66.67,
      "totalAmount": 66.67,
      "totalNetAmount": 66.67,
      "averageAmount": 0.00
    }
  },
  "message": "Donation comparison retrieved successfully"
}
```

### 6. Get Donations by Currency

**Endpoint:** `GET /donations/by-currency`

**Description:** Retrieve donations grouped by currency.

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `streamerId` | string | No | Filter by streamer ID | `507f1f77bcf86cd799439011` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "USD",
      "count": 150,
      "totalAmount": 7500.00,
      "totalNetAmount": 7125.00
    },
    {
      "_id": "EUR",
      "count": 25,
      "totalAmount": 1250.00,
      "totalNetAmount": 1187.50
    }
  ],
  "message": "Donations by currency retrieved successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

### Example 1: Get recent donations for a streamer

```bash
curl -X GET "http://localhost:3000/donations/history?streamerId=507f1f77bcf86cd799439011&status=completed&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Example 2: Get top donors for the last 30 days

```bash
curl -X GET "http://localhost:3000/donations/top-donors/507f1f77bcf86cd799439011?timeRange=30d&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Example 3: Get analytics for the last 7 days

```bash
curl -X GET "http://localhost:3000/donations/analytics?timeRange=7d" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Example 4: Get donation trends for the last 30 days

```bash
curl -X GET "http://localhost:3000/donations/trends?period=daily&days=30" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Example 5: Compare current month vs previous month

```bash
curl -X GET "http://localhost:3000/donations/comparison?currentPeriod=30d&previousPeriod=30d" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Performance Considerations

1. **Pagination**: Always use pagination for large datasets to avoid performance issues
2. **Filtering**: Use specific filters to reduce the data set size
3. **Time Ranges**: Limit time ranges for analytics queries to improve performance
4. **Indexing**: The database is indexed on key fields for optimal query performance

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- 100 requests per minute per user
- 1000 requests per hour per user

## Caching

Analytics endpoints are cached for 5 minutes to improve performance. Use the `Cache-Control` header to control caching behavior.

## Webhook Integration

The donation history system integrates with webhooks to provide real-time updates. Configure webhooks to receive notifications when new donations are processed.

## Support

For technical support or questions about the donation history API, please refer to the main API documentation or contact the development team. 