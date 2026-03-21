# Mailer Proxy Service Setup

The main backend now includes a proxy service that can route campaign requests to the Express mailer service running on SMTP VPS servers.

## Configuration

### Environment Variables

Add these environment variables to your main backend `.env` file:

```env
# Mailer Service Configuration
MAILER_SERVICE_URL=http://your-mailer-vps-ip:4000
MAILER_AUTH_TOKEN=your-secret-token-here
```

**Important:** The `MAILER_AUTH_TOKEN` must match the `MAILER_AUTH_TOKEN` set in the mailer service `.env` file.

### How It Works

1. **Automatic Fallback**: If mailer service is not configured or unavailable, the system automatically falls back to BullMQ (original behavior).

2. **Start Campaign**: When a campaign is started:
   - If `MAILER_SERVICE_URL` and `MAILER_AUTH_TOKEN` are set, it tries to call the mailer service
   - If mailer service call fails, it automatically falls back to BullMQ
   - This ensures **zero downtime** during migration

3. **Resume Campaign**: Same behavior as start - tries mailer service first, falls back to BullMQ if needed.

## API Endpoints

### Check Mailer Health

```http
GET /api/campaign/mailer/health?selectedIp=example.com-192.168.0.1
```

**Response:**
```json
{
  "enabled": true,
  "health": {
    "status": "ok",
    "mailerId": "vps-1",
    "activeCampaigns": ["campaign-123"],
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}
```

### Check Mailer Queue Status

```http
GET /api/campaign/mailer/queue?selectedIp=example.com-192.168.0.1
```

**Response:**
```json
{
  "enabled": true,
  "queue": {
    "success": true,
    "runningCampaigns": 1,
    "campaignIds": ["campaign-123"]
  }
}
```

## Migration Strategy

### Phase 1: Setup (Current)
- ✅ Mailer service created and ready
- ✅ Proxy service added to main backend
- ✅ Automatic fallback to BullMQ enabled
- Main backend continues to work with BullMQ

### Phase 2: Testing
1. Deploy mailer service to one SMTP VPS
2. Set `MAILER_SERVICE_URL` and `MAILER_AUTH_TOKEN` in main backend `.env`
3. Test starting a campaign - it should use mailer service
4. If mailer service is down, it should automatically fallback to BullMQ

### Phase 3: Full Migration
1. Deploy mailer service to all SMTP VPS servers
2. Update main backend to use mailer service URLs
3. Monitor and verify all campaigns use mailer service
4. Once stable, BullMQ can be removed (optional)

## Reverse Compatibility

- **100% Backward Compatible**: If mailer service is not configured, everything works exactly as before with BullMQ
- **Zero Breaking Changes**: All existing API endpoints work the same way
- **Gradual Migration**: You can migrate one SMTP server at a time

## Security

- All communication between main backend and mailer service uses `X-Mailer-Token` header
- Token should be a strong, randomly generated secret
- Network-level restrictions: Only allow connections from main backend IPs to mailer service ports

## Troubleshooting

### Mailer service not being used

1. Check environment variables are set:
   ```bash
   echo $MAILER_SERVICE_URL
   echo $MAILER_AUTH_TOKEN
   ```

2. Check mailer service is accessible:
   ```bash
   curl http://your-mailer-vps-ip:4000/mail/health
   ```

3. Check logs in main backend for errors

### Fallback to BullMQ

If you see campaigns using BullMQ instead of mailer service:
- Check mailer service is running
- Verify `MAILER_SERVICE_URL` is correct
- Check `MAILER_AUTH_TOKEN` matches on both sides
- Review main backend logs for connection errors
