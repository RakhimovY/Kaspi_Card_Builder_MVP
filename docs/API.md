# API Documentation

## Magic Fill API

### POST /api/magic-fill

Automatically fills product form fields using GTIN lookup, OCR, and LLM enrichment.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "gtin": "4895229101234",
  "imageIds": ["uuid1", "uuid2"],
  "manual": {
    "brand": "Samsung",
    "type": "Phone",
    "model": "Galaxy S24",
    "keySpec": "128GB, Black",
    "category": "electronics"
  }
}
```

**Request Schema:**
- `gtin` (optional): String 8-14 characters, GTIN/UPC/EAN barcode
- `imageIds` (optional): Array of UUIDs, max 5 image assets for OCR
- `manual` (optional): Manual field overrides

**Response:**
```json
{
  "draftId": "uuid",
  "fields": {
    "sku": "samsung-galaxy-s24",
    "brand": "Samsung",
    "type": "Phone",
    "model": "Galaxy S24",
    "keySpec": "128GB, Black",
    "titleRU": "Смартфон Samsung Galaxy S24 128GB",
    "titleKZ": "Смартфон Samsung Galaxy S24 128GB",
    "descRU": "• Высокое качество и надежность...",
    "descKZ": "• Жоғары сапа және сенімділік...",
    "category": "electronics",
    "gtin": "4895229101234",
    "attributes": {
      "brand": "Samsung",
      "model": "Galaxy S24",
      "power": "220В, 50-60Гц",
      "warranty": "12 месяцев"
    }
  },
  "images": ["uuid1", "uuid2"],
  "metadata": {
    "confidence": 0.92,
    "processingTime": 3500,
    "traceId": "uuid",
    "sources": {
      "gtin": true,
      "ocr": true,
      "llm": true
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `429` - Quota exceeded
- `500` - Server error

**Quotas:**
- Free plan: 10 requests/month
- Pro plan: 100 requests/month

## Health Check

### GET /api/health

Returns the health status of the application for uptime monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T17:42:18.315Z",
  "uptime": 2792.610206334,
  "environment": "development",
  "version": "0.1.0"
}
```

**Status Codes:**
- `200` - Application is healthy
- `500` - Application error

## Analytics Events

The application sends the following events to Plausible Analytics:

### Page Views
- **Event:** `pageview`
- **Properties:** `page` (string) - Current page path

### File Operations
- **Event:** `drop_files`
- **Properties:** `file_count` (number) - Number of files dropped

### Processing Events
- **Event:** `process_start`
- **Properties:** `file_count` (number) - Number of files being processed

- **Event:** `process_done`
- **Properties:** 
  - `file_count` (number) - Total number of files
  - `success_count` (number) - Number of successfully processed files

### Export Events
- **Event:** `export_zip`
- **Properties:** `file_count` (number) - Number of files in the export

## Environment Variables

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Plausible Analytics domain for tracking
- `NODE_ENV` - Environment (development/production)
