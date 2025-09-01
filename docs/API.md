# API Documentation

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
