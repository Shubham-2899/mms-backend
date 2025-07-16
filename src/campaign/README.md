# Campaign Module - Scalable Email Automation System

## 🏗️ **Architecture Overview**

The Campaign Module follows a **three-collection design** for optimal scalability and separation of concerns:

### **📊 Database Collections:**

1. **`campaigns`** - Campaign management and metadata
2. **`campaign_email_tracking`** - Email queue and status tracking (minimal fields)
3. **`emails`** - Detailed email reports (reused from existing system)
4. **`email_list`** - Unsubscribed users/suppression list (existing)

### **🎯 Collection Responsibilities:**

#### **1. Campaigns Collection (`campaigns`)**
```typescript
{
  campaignId: string;           // Unique identifier
  status: 'running'|'paused'|'completed';
  from: string;                 // Sender email
  fromName: string;             // Sender name
  subject: string;              // Email subject
  templateType: string;         // Template type
  emailTemplate: string;        // Email template
  offerId: string;              // Offer reference
  selectedIp: string;           // SMTP server IP
  batchSize: number;            // Emails per batch
  delay: number;                // Delay between batches
  jobId?: string;               // BullMQ job ID
  startedAt?: Date;             // Start timestamp
  completedAt?: Date;           // Completion timestamp
  totalEmails?: number;         // Total emails in campaign
  sentEmails?: number;          // Successfully sent
  failedEmails?: number;        // Failed emails
}
```

#### **2. Campaign Email Tracking (`campaign_email_tracking`)**
```typescript
{
  to_email: string;             // Recipient email
  campaignId: string;           // Campaign reference
  status: 'pending'|'sent'|'failed'; // Email status
  isProcessed: boolean;         // Processing flag
  sentAt?: Date;                // Send timestamp
  errorMessage?: string;        // Error details
}
```

#### **3. Emails Collection (`emails`) - REUSED**
```typescript
{
  from: string;                 // Sender email
  to: string;                   // Recipient email
  offerId: string;              // Offer reference
  campaignId: string;           // Campaign reference
  sentAt: Date;                 // Send timestamp
  response: string;             // SMTP response
  mode: string;                 // 'test' or 'bulk'
}
```

#### **4. Email List Collection (`email_list`) - EXISTING**
```typescript
{
  email: string;                // Unsubscribed email
  unsubscribed_domains: string; // Domain info
  createdAt: Date;              // Unsubscribe date
}
```

## 🚀 **Key Features**

- ✅ **Separation of Concerns**: Each collection has a specific purpose
- ✅ **Minimal Tracking**: `campaign_email_tracking` only stores essential status data
- ✅ **Detailed Reports**: `emails` collection provides comprehensive reporting
- ✅ **Reuse Existing**: Leverages existing `emails` collection for reports
- ✅ **Scalable Design**: Optimized for high-volume email campaigns
- ✅ **Hybrid Pause Check**: Efficient campaign control
- ✅ **Test & Bulk Modes**: Flexible email sending options

## 📈 **Data Flow Architecture**

```
1. Campaign Creation
   ↓
2. Emails added to campaign_email_tracking (pending status)
   ↓
3. Campaign starts → BullMQ job created
   ↓
4. Processor reads pending emails from campaign_email_tracking
   ↓
5. Email sent → Update status in campaign_email_tracking
   ↓
6. Detailed record saved to emails collection (for reports)
   ↓
7. Campaign completed → Update campaign status
```

## 🔄 **API Endpoints**

### **Campaign Management**
```http
POST   /api/campaign/create          # Create campaign (test/bulk)
PUT    /api/campaign/{id}/pause      # Pause campaign
PUT    /api/campaign/{id}/resume     # Resume campaign
GET    /api/campaign/stats/{id}      # Get campaign statistics
GET    /api/campaign/all             # Get all campaigns
POST   /api/campaign/stopjob         # Stop specific job
```

### **Email List Management** (Existing)
```http
POST   /api/email_list/add-emails    # Add emails to campaign
POST   /api/email_list/upload-emails # Upload CSV with emails
GET    /api/email_list/suppression   # Get unsubscribed users
```

## 📊 **Usage Examples**

### **Test Mode**
```typescript
const testCampaign = {
  from: "test@example.com",
  fromName: "Test Sender",
  subject: "Test Campaign",
  to: ["user1@example.com", "user2@example.com"], // Direct recipients
  templateType: "html",
  emailTemplate: "<h1>Test Email</h1>",
  mode: "test",
  offerId: "offer123",
  campaignId: "test-campaign-123",
  selectedIp: "example.com-192.168.0.1",
  batchSize: 5,
  delay: 2
};
```

### **Bulk Mode**
```typescript
const bulkCampaign = {
  from: "campaign@example.com",
  fromName: "Campaign Sender",
  subject: "Bulk Campaign",
  to: [], // Empty - emails from campaign_email_tracking
  templateType: "html",
  emailTemplate: "<h1>Bulk Email</h1>",
  mode: "bulk",
  offerId: "offer456",
  campaignId: "bulk-campaign-456",
  selectedIp: "example.com-192.168.0.2",
  batchSize: 10,
  delay: 5
};
```

## 🔧 **Setup Process**

### **1. Add Emails to Campaign**
```typescript
// Using existing email_list service
await emailListService.addEmails(
  ['user1@example.com', 'user2@example.com'], 
  'campaign-123'
);
```

### **2. Create Campaign**
```typescript
// Campaign will read from campaign_email_tracking
await campaignService.createCampaign(campaignData, firebaseToken);
```

### **3. Monitor Progress**
```typescript
// Get real-time statistics
const stats = await campaignService.getCampaignStats('campaign-123');
```

## 📈 **Performance Benefits**

### **1. Minimal Tracking Collection**
- Only essential fields in `campaign_email_tracking`
- Fast queries for status updates
- Reduced memory usage

### **2. Detailed Reports Collection**
- Comprehensive email records in `emails`
- Rich reporting capabilities
- Historical data preservation

### **3. Separation of Concerns**
- Campaign management separate from email tracking
- Independent scaling of different components
- Clear data ownership

## 🔒 **Security & Compliance**

- ✅ **Firebase Authentication**: Secure user verification
- ✅ **SMTP Configuration**: User-specific server settings
- ✅ **Input Validation**: Email format and data validation
- ✅ **Error Handling**: Safe error message handling
- ✅ **Unsubscribe Support**: Integration with suppression list

## 📊 **Monitoring & Analytics**

### **Campaign Statistics**
```typescript
{
  campaignId: "campaign-123",
  status: "running",
  counts: {
    sent: 150,
    failed: 5,
    pending: 45,
    total: 200
  },
  campaign: {
    from: "sender@example.com",
    subject: "Campaign Subject",
    batchSize: 10,
    delay: 5,
    startedAt: "2024-01-01T10:00:00.000Z"
  }
}
```

### **Email Reports** (from `emails` collection)
```typescript
{
  from: "sender@example.com",
  to: "recipient@example.com",
  offerId: "offer123",
  campaignId: "campaign-123",
  sentAt: "2024-01-01T10:05:00.000Z",
  response: "250 OK",
  mode: "bulk"
}
```

## 🚀 **Scalability Features**

1. **Batch Processing**: Configurable batch sizes
2. **Rate Limiting**: Delays between emails and batches
3. **Connection Pooling**: SMTP connection reuse
4. **Memory Optimization**: Lean queries for large datasets
5. **Hybrid Pause Check**: Efficient status checking
6. **Queue Management**: BullMQ job processing

## 🔄 **Integration Points**

- **Existing Email Module**: Reuses `emails` collection
- **Email List Module**: Uses existing email management
- **Reports Module**: Leverages detailed email records
- **Auth Module**: Firebase authentication
- **User Module**: SMTP configuration

## 📋 **Best Practices**

1. **Test First**: Always use test mode before bulk campaigns
2. **Monitor Progress**: Check campaign statistics regularly
3. **Pause When Needed**: Use pause functionality for maintenance
4. **Batch Sizing**: Adjust batch size based on SMTP limits
5. **Delay Settings**: Set appropriate delays to avoid rate limiting
6. **Error Monitoring**: Monitor failed emails for troubleshooting
7. **Data Cleanup**: Regular cleanup of old campaign data
8. **Backup Strategy**: Regular backups of campaign data

## 🎯 **Industry Standards**

This architecture follows industry best practices:

- **Single Responsibility**: Each collection has one purpose
- **Data Normalization**: Minimal duplication across collections
- **Scalability**: Designed for high-volume processing
- **Monitoring**: Comprehensive tracking and reporting
- **Security**: Proper authentication and validation
- **Compliance**: Unsubscribe and suppression list support

## 🚀 **Database Performance Optimizations**

### **📊 Query Optimization**

**Before (5 queries per email):**
```typescript
// ❌ Inefficient - 5 database calls per email
await this.emailModel.create({...});           // 1 query
await this.emailTrackingModel.updateOne({...}); // 2 queries
await this.campaignModel.findOne({...});       // 3 queries
await this.emailModel.create({...});           // 4 queries  
await this.emailTrackingModel.updateOne({...}); // 5 queries
```

**After (2 queries per batch):**
```typescript
// ✅ Optimized - 2 bulk operations per batch
await Promise.all([
  this.emailModel.insertMany(emailRecords),     // 1 bulk insert
  this.emailTrackingModel.bulkWrite(updates)   // 2 bulk update
]);
```

### **📈 Performance Benefits**

1. **Reduced Database Calls**: From 5 per email to 2 per batch
2. **Bulk Operations**: `insertMany()` and `bulkWrite()` for efficiency
3. **Parallel Processing**: `Promise.all()` for concurrent operations
4. **Memory Optimization**: Lean queries and bulk operations

### **🔧 Cleanup Strategy**

#### **Automatic Cleanup**
```typescript
// Campaign completion triggers automatic cleanup
private async cleanupCampaignData(campaignId: string) {
  await this.emailTrackingModel.deleteMany({ 
    campaignId, 
    status: { $in: ['sent', 'failed'] } 
  });
}
```

#### **Manual Cleanup Endpoints**
```http
POST   /api/campaign/{campaignId}/cleanup      # Manual cleanup
GET    /api/campaign/{campaignId}/cleanup-status # Check cleanup status
```

#### **Cleanup Options**

**Option 1: Delete (Recommended)**
```typescript
// Delete tracking data after completion
await this.emailTrackingModel.deleteMany({ 
  campaignId, 
  status: { $in: ['sent', 'failed'] } 
});
```

**Option 2: Archive (For Audit)**
```typescript
// Archive tracking data instead of deleting
await this.emailTrackingModel.updateMany(
  { campaignId },
  { $set: { archived: true, archivedAt: new Date() } }
);
```

### **📊 Database Query Analysis**

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Email Sent | 5 queries | 2 queries | 60% reduction |
| Batch of 10 | 50 queries | 2 queries | 96% reduction |
| Campaign of 1000 | 5000 queries | 200 queries | 96% reduction |

### **🎯 Best Practices for Performance**

1. **Batch Processing**: Use bulk operations for multiple records
2. **Lean Queries**: Use `.lean()` for read-only operations
3. **Indexing**: Ensure proper indexes on `campaignId` and `status`
4. **Cleanup**: Remove tracking data after completion
5. **Monitoring**: Track query performance and optimize as needed

### **🔍 Monitoring Database Performance**

```typescript
// Add to your monitoring
const startTime = Date.now();
await this.emailModel.insertMany(emailRecords);
const endTime = Date.now();
console.log(`Bulk insert took ${endTime - startTime}ms`);
```

### **📋 Cleanup Recommendations**

1. **Immediate Cleanup**: Delete tracking data after campaign completion
2. **Scheduled Cleanup**: Run cleanup job for old campaigns
3. **Archive Option**: Keep tracking data for audit if needed
4. **Monitoring**: Track cleanup status and performance

### **🔄 Data Lifecycle**

```
1. Campaign Created → Tracking data added
2. Campaign Running → Emails processed in batches
3. Campaign Completed → Automatic cleanup triggered
4. Manual Cleanup → Optional additional cleanup
5. Reports Available → Detailed data in emails collection
``` 