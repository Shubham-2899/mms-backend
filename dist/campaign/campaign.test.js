"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseExamples = exports.expectedResponses = exports.apiExamples = exports.bulkCampaignData = exports.testCampaignData = void 0;
exports.testCampaignData = {
    from: "test@example.com",
    fromName: "Test Sender",
    subject: "Test Campaign Subject",
    to: ["user1@example.com", "user2@example.com"],
    templateType: "html",
    emailTemplate: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Campaign</title>
    </head>
    <body>
      <h1>Welcome to our Test Campaign!</h1>
      <p>This is a test email to verify the campaign system.</p>
      <p>Campaign ID: {{campaignId}}</p>
      <p>Offer ID: {{offerId}}</p>
    </body>
    </html>
  `,
    mode: "test",
    offerId: "offer-test-123",
    campaignId: "campaign-test-123",
    selectedIp: "example.com-192.168.0.1",
    batchSize: 5,
    delay: 2
};
exports.bulkCampaignData = {
    from: "campaign@example.com",
    fromName: "Campaign Sender",
    subject: "Bulk Campaign Subject",
    to: [],
    templateType: "html",
    emailTemplate: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bulk Campaign</title>
    </head>
    <body>
      <h1>Welcome to our Bulk Campaign!</h1>
      <p>This is a bulk email campaign.</p>
      <p>Campaign ID: {{campaignId}}</p>
      <p>Offer ID: {{offerId}}</p>
    </body>
    </html>
  `,
    mode: "bulk",
    offerId: "offer-bulk-456",
    campaignId: "campaign-bulk-456",
    selectedIp: "example.com-192.168.0.2",
    batchSize: 10,
    delay: 5
};
exports.apiExamples = {
    createTestCampaign: `
    POST /api/campaign/create
    Authorization: Bearer <firebase-token>
    Content-Type: application/json
    
    ${JSON.stringify(exports.testCampaignData, null, 2)}
  `,
    createBulkCampaign: `
    POST /api/campaign/create
    Authorization: Bearer <firebase-token>
    Content-Type: application/json
    
    ${JSON.stringify(exports.bulkCampaignData, null, 2)}
  `,
    pauseCampaign: `
    PUT /api/campaign/campaign-test-123/pause
  `,
    resumeCampaign: `
    PUT /api/campaign/campaign-test-123/resume
    Authorization: Bearer <firebase-token>
    Content-Type: application/json
    
    ${JSON.stringify(exports.testCampaignData, null, 2)}
  `,
    getCampaignStats: `
    GET /api/campaign/stats/campaign-test-123
  `,
    getAllCampaigns: `
    GET /api/campaign/all
  `,
    stopJob: `
    POST /api/campaign/stopjob
    Content-Type: application/json
    
    {
      "jobId": "job123"
    }
  `
};
exports.expectedResponses = {
    testModeResponse: {
        message: "All emails sent successfully",
        success: true,
        sent: ["user1@example.com", "user2@example.com"],
        failed: [],
        emailSent: 2,
        emailFailed: 0
    },
    bulkModeResponse: {
        message: "Campaign started successfully",
        success: true,
        jobId: "job123"
    },
    campaignStatsResponse: {
        campaignId: "campaign-test-123",
        status: "running",
        counts: {
            sent: 150,
            failed: 5,
            pending: 45,
            total: 200
        },
        campaign: {
            from: "test@example.com",
            fromName: "Test Sender",
            subject: "Test Campaign Subject",
            offerId: "offer-test-123",
            selectedIp: "example.com-192.168.0.1",
            batchSize: 5,
            delay: 2,
            startedAt: "2024-01-01T10:00:00.000Z",
            completedAt: null
        }
    }
};
exports.databaseExamples = {
    insertTestEmails: `
    // Insert emails into EmailList collection
    db.campaign_email_tracking.insertMany([
      {
        to_email: "user1@example.com",
        campaignId: "campaign-bulk-456",
        status: "pending",
        isProcessed: false
      },
      {
        to_email: "user2@example.com", 
        campaignId: "campaign-bulk-456",
        status: "pending",
        isProcessed: false
      }
      // ... more emails
    ]);
  `,
    queryCampaignStats: `
    // Get sent emails count
    db.campaign_email_tracking.countDocuments({
      campaignId: "campaign-test-123",
      status: "sent"
    });

    // Get failed emails count  
    db.campaign_email_tracking.countDocuments({
      campaignId: "campaign-test-123",
      status: "failed"
    });

    // Get pending emails count
    db.campaign_email_tracking.countDocuments({
      campaignId: "campaign-test-123", 
      status: "pending"
    });
  `
};
//# sourceMappingURL=campaign.test.js.map