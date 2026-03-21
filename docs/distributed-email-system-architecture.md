# Distributed Email System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Current vs Proposed Architecture](#current-vs-proposed-architecture)
3. [System Components](#system-components)
4. [Implementation Guide](#implementation-guide)
5. [File Structure](#file-structure)
6. [Database Schemas](#database-schemas)
7. [Service Implementation](#service-implementation)
8. [Configuration](#configuration)
9. [Deployment](#deployment)
10. [Testing](#testing)
11. [Monitoring](#monitoring)

## Overview

This document outlines the transformation of a centralized email system into a distributed architecture where SMTP servers handle their own processing, queuing, and reporting while the main server acts as a proxy/router.

### Goals
- Better resource utilization of SMTP servers
- Distributed processing and queuing
- Real delivery tracking and monitoring
- Scalable architecture for adding new servers
- Individual server reporting dashboards

### Benefits
- ✅ Each SMTP server processes its own workload
- ✅ Main server acts as lightweight proxy
- ✅ Real-time delivery tracking beyond nodemailer responses
- ✅ Easy horizontal scaling by adding servers
- ✅ Individual server monitoring at `/report` endpoint
- ✅ Fault isolation (one server failure doesn't affect others)

## Current vs Proposed Architecture

### Current System
```
Frontend → Main Server (NestJS) → SMTP Servers (only sending)
                ↓
        MongoDB + BullMQ (centralized)
```

**Problems:**
- SMTP servers underutilized (only for sending emails)
- Main server handles all heavy processing
- Limited delivery tracking (only nodemailer success/fail)
- Difficult to scale horizontally
- Single point of failure

### Proposed System
```
Frontend → Main Server (Proxy) → SMTP Server 1 (Full processing + Local Redis)
                              → SMTP Server 2 (Full processing + Local Redis)  
                              → SMTP Server N (Full processing + Local Redis)
                ↓                        ↓
        Shared MongoDB ←→ Local Processing + Queuing
```

**Advantages:**
- Distributed processing across all servers
- Local queuing reduces network overhead
- Better fault tolerance and isolation
- Easy to add new servers
- Comprehensive monitoring per server## Sys
tem Components

### 1. Main Server (Proxy/Orchestrator)
**Responsibilities:**
- Receive requests from frontend
- Authenticate users via Firebase
- Route requests to appropriate SMTP servers
- Aggregate data from multiple SMTP servers
- Manage SMTP server registration and health

**What it NO LONGER does:**
- Process email queues
- Send emails directly
- Heavy computational work

### 2. SMTP Servers (Worker Nodes)
**Responsibilities:**
- Receive forwarded requests from main server
- Process email queues locally using BullMQ + Redis
- Send emails using local SMTP configuration
- Track delivery status and responses
- Provide reporting dashboard at `/report`
- Auto-register with main server

### 3. Shared MongoDB Database
**Stores:**
- Campaign configurations and metadata
- Email records and delivery tracking
- SMTP server registration information
- User authentication data

### 4. Local Redis (per SMTP server)
**Handles:**
- Local email and campaign queues
- Job processing and retry logic
- Queue monitoring and statistics

## File Structure

```
project/
├── docs/
│   └── distributed-email-system-architecture.md
├── main-server/                          # Modified existing codebase
│   ├── src/
│   │   ├── campaign/
│   │   │   ├── campaign-proxy.service.ts      # NEW: Routes to SMTP servers
│   │   │   ├── campaign.controller.ts         # MODIFIED: Uses proxy service
│   │   │   └── dto/
│   │   ├── smtp-server/
│   │   │   ├── smtp-server.service.ts         # NEW: Server management
│   │   │   ├── smtp-server.controller.ts      # NEW: Registration endpoints
│   │   │   └── dto/
│   │   ├── shared/
│   │   │   └── schemas/                       # NEW: Shared database schemas
│   │   └── auth/                              # Existing Firebase auth
│   ├── package.json
│   └── .env
│
├── smtp-server/                          # NEW: Template for SMTP servers
│   ├── src/
│   │   ├── campaign/                          # Copied from main-server
│   │   │   ├── campaign.service.ts
│   │   │   ├── campaign.processor.ts
│   │   │   └── campaign.controller.ts
│   │   ├── email/                             # Copied from main-server
│   │   │   ├── email.processor.ts
│   │   │   └── schemas/
│   │   ├── report/                            # NEW: Dashboard and API
│   │   │   ├── report.controller.ts
│   │   │   ├── report.service.ts
│   │   │   └── templates/
│   │   ├── health/                            # NEW: Health checks
│   │   │   └── health.controller.ts
│   │   ├── registration/                      # NEW: Auto-registration
│   │   │   └── registration.service.ts
│   │   └── shared/                            # Shared schemas and utils
│   ├── package.json
│   ├── .env
│   └── docker-compose.yml
│
└── shared/                               # NEW: Common code and schemas
    ├── schemas/
    │   ├── smtp-server.schema.ts
    │   ├── delivery-tracking.schema.ts
    │   └── index.ts
    ├── dtos/
    │   └── common.dto.ts
    └── utils/
        └── common.utils.ts
```## Datab
ase Schemas

### SMTP Server Registration Schema

```typescript
// shared/schemas/smtp-server.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SmtpServerDocument = SmtpServer & Document;

@Schema({ collection: 'smtp_servers', timestamps: true })
export class SmtpServer {
  @Prop({ required: true })
  domain: string;                    // e.g., "example.com"

  @Prop({ required: true })
  primaryIp: string;                 // e.g., "192.168.1.1"

  @Prop([String])
  secondaryIps: string[];            // e.g., ["192.168.1.2", "192.168.1.3"]

  @Prop({ required: true })
  endpoint: string;                  // e.g., "http://192.168.1.1:3001"

  @Prop({ enum: ['active', 'inactive', 'maintenance'], default: 'active' })
  status: string;

  @Prop()
  lastSeen: Date;                    // Last heartbeat timestamp

  @Prop({ default: 0 })
  currentCampaigns: number;          // Number of active campaigns

  @Prop({ default: 100 })
  maxCampaigns: number;              // Maximum campaigns this server can handle

  @Prop({ enum: ['healthy', 'unhealthy', 'unknown'], default: 'unknown' })
  healthStatus: string;
}

export const SmtpServerSchema = SchemaFactory.createForClass(SmtpServer);
```

### Enhanced Delivery Tracking Schema

```typescript
// shared/schemas/delivery-tracking.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryTrackingDocument = DeliveryTracking & Document;

@Schema({ collection: 'delivery_tracking', timestamps: true })
export class DeliveryTracking {
  @Prop({ required: true })
  trackingId: string;                // Unique tracking identifier

  @Prop({ required: true })
  emailId: string;                   // Reference to Email document

  @Prop({ required: true })
  campaignId: string;

  @Prop({ required: true })
  to: string;

  @Prop({ 
    enum: ['sent', 'delivered', 'bounced', 'complained', 'failed', 'deferred'],
    default: 'sent'
  })
  deliveryStatus: string;

  @Prop()
  smtpResponse: string;              // Initial SMTP response

  @Prop()
  bounceReason: string;              // Bounce/failure reason

  @Prop()
  complaintType: string;             // Spam complaint type

  @Prop({ required: true })
  sentAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop()
  bouncedAt: Date;

  @Prop()
  complainedAt: Date;

  @Prop({ required: true })
  processingServer: string;          // Which SMTP server processed this

  @Prop({ required: true })
  serverDomain: string;              // Domain used for sending

  @Prop({ required: true })
  serverIp: string;                  // IP used for sending
}

export const DeliveryTrackingSchema = SchemaFactory.createForClass(DeliveryTracking);
```

### Updated Campaign Schema

```typescript
// shared/schemas/campaign.schema.ts (Enhanced version)
@Schema({ collection: 'campaigns', timestamps: true })
export class Campaign {
  @Prop({ required: true, unique: true })
  campaignId: string;

  @Prop({ enum: ['draft', 'ready', 'running', 'paused', 'completed', 'ended'], default: 'draft' })
  status: string;

  // Campaign configuration
  @Prop()
  from: string;

  @Prop()
  fromName: string;

  @Prop()
  subject: string;

  @Prop()
  templateType: string;

  @Prop()
  emailTemplate: string;

  @Prop()
  offerId: string;

  @Prop()
  selectedIp: string;

  @Prop()
  batchSize: number;

  @Prop()
  delay: number;

  // Server assignment (NEW)
  @Prop()
  assignedServerId: string;          // Which SMTP server is handling this

  @Prop()
  assignedServerEndpoint: string;    // Server endpoint for direct communication

  // Execution tracking
  @Prop()
  jobId: string;

  @Prop()
  startedAt: Date;

  @Prop()
  completedAt: Date;

  // Statistics
  @Prop({ default: 0 })
  pendingEmails: number;

  @Prop()
  totalEmails: number;

  @Prop()
  sentEmails: number;

  @Prop()
  failedEmails: number;

  @Prop()
  deliveredEmails: number;           // NEW: Actual delivery count

  @Prop()
  bouncedEmails: number;             // NEW: Bounce count
}
```## Se
rvice Implementation

### Main Server: Campaign Proxy Service

```typescript
// main-server/src/campaign/campaign-proxy.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SmtpServer, SmtpServerDocument } from '../shared/schemas/smtp-server.schema';
import { Campaign, CampaignDocument } from '../shared/schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignProxyService {
  constructor(
    @InjectModel(SmtpServer.name) private smtpServerModel: Model<SmtpServerDocument>,
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private httpService: HttpService,
  ) {}

  /**
   * Find the appropriate SMTP server for a domain-IP combination
   */
  async findServerForRequest(selectedIp: string): Promise<SmtpServer> {
    const [domain, ip] = selectedIp.split('-');
    
    const server = await this.smtpServerModel.findOne({
      domain: domain,
      $or: [
        { primaryIp: ip },
        { secondaryIps: { $in: [ip] } }
      ],
      status: 'active',
      healthStatus: 'healthy'
    });

    if (!server) {
      throw new HttpException(
        `No active server found for domain: ${domain}, IP: ${ip}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    return server;
  }

  /**
   * Create campaign by forwarding to appropriate SMTP server
   */
  async createCampaign(createCampaignDto: CreateCampaignDto, firebaseToken: string) {
    const server = await this.findServerForRequest(createCampaignDto.selectedIp);

    try {
      // Forward request to SMTP server
      const response = await this.httpService.axiosRef.post(
        `${server.endpoint}/api/campaign/create`,
        createCampaignDto,
        {
          headers: {
            'Authorization': `Bearer ${firebaseToken}`,
            'X-Forwarded-From': 'main-server',
          },
          timeout: 30000
        }
      );

      // Update campaign with server assignment
      await this.campaignModel.findOneAndUpdate(
        { campaignId: createCampaignDto.campaignId },
        { 
          assignedServerId: server._id,
          assignedServerEndpoint: server.endpoint,
          updatedAt: new Date()
        },
        { upsert: true }
      );

      // Update server load
      await this.smtpServerModel.findByIdAndUpdate(
        server._id,
        { $inc: { currentCampaigns: 1 } }
      );

      return {
        ...response.data,
        processedBy: server.endpoint,
        serverDomain: server.domain,
        serverIp: server.primaryIp
      };

    } catch (error) {
      console.error(`SMTP Server Error (${server.endpoint}):`, error.message);
      throw new HttpException(
        `SMTP Server (${server.endpoint}) Error: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Pause campaign by forwarding to assigned server
   */
  async pauseCampaign(campaignId: string) {
    const campaign = await this.campaignModel.findOne({ campaignId });
    
    if (!campaign?.assignedServerEndpoint) {
      throw new HttpException(
        'Campaign server assignment not found',
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const response = await this.httpService.axiosRef.put(
        `${campaign.assignedServerEndpoint}/api/campaign/${campaignId}/pause`,
        {},
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to pause campaign: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Resume campaign by forwarding to assigned server
   */
  async resumeCampaign(createCampaignDto: CreateCampaignDto, firebaseToken: string) {
    const campaign = await this.campaignModel.findOne({ 
      campaignId: createCampaignDto.campaignId 
    });
    
    if (!campaign?.assignedServerEndpoint) {
      throw new HttpException(
        'Campaign server assignment not found',
        HttpStatus.NOT_FOUND
      );
    }

    try {
      const response = await this.httpService.axiosRef.put(
        `${campaign.assignedServerEndpoint}/api/campaign/${createCampaignDto.campaignId}/resume`,
        createCampaignDto,
        {
          headers: {
            'Authorization': `Bearer ${firebaseToken}`,
          },
          timeout: 10000
        }
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to resume campaign: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Get aggregated campaign data from all servers
   */
  async getAllCampaigns() {
    const servers = await this.smtpServerModel.find({ 
      status: 'active',
      healthStatus: 'healthy'
    });
    
    const allCampaigns = [];
    const serverErrors = [];
    
    // Fetch campaigns from each server in parallel
    const campaignPromises = servers.map(async (server) => {
      try {
        const response = await this.httpService.axiosRef.get(
          `${server.endpoint}/api/campaign/all`,
          { timeout: 10000 }
        );
        
        // Add server info to each campaign
        return response.data.map(campaign => ({
          ...campaign,
          serverInfo: {
            serverId: server._id,
            domain: server.domain,
            primaryIp: server.primaryIp,
            endpoint: server.endpoint
          }
        }));
      } catch (error) {
        console.error(`Failed to fetch campaigns from ${server.endpoint}:`, error.message);
        serverErrors.push({
          server: server.endpoint,
          error: error.message
        });
        return [];
      }
    });

    const results = await Promise.all(campaignPromises);
    allCampaigns.push(...results.flat());

    return {
      campaigns: allCampaigns,
      totalServers: servers.length,
      errors: serverErrors
    };
  }

  /**
   * Get campaign statistics from assigned server
   */
  async getCampaignStats(campaignId: string) {
    const campaign = await this.campaignModel.findOne({ campaignId });
    
    if (!campaign?.assignedServerEndpoint) {
      // Return basic stats from database if no server assigned
      return {
        campaignId,
        status: campaign?.status || 'unknown',
        message: 'No server assigned or server unavailable'
      };
    }

    try {
      const response = await this.httpService.axiosRef.get(
        `${campaign.assignedServerEndpoint}/api/campaign/stats/${campaignId}`,
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      console.error(`Failed to get stats from server:`, error.message);
      // Fallback to database stats
      return {
        campaignId,
        status: campaign.status,
        message: 'Server unavailable, showing cached data',
        counts: {
          sent: campaign.sentEmails || 0,
          failed: campaign.failedEmails || 0,
          pending: campaign.pendingEmails || 0,
          total: campaign.totalEmails || 0
        }
      };
    }
  }
}
```#
## Main Server: SMTP Server Management Service

```typescript
// main-server/src/smtp-server/smtp-server.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { SmtpServer, SmtpServerDocument } from '../shared/schemas/smtp-server.schema';

@Injectable()
export class SmtpServerService {
  constructor(
    @InjectModel(SmtpServer.name) private smtpServerModel: Model<SmtpServerDocument>,
    private httpService: HttpService,
  ) {}

  /**
   * Register or update SMTP server
   */
  async registerServer(serverData: {
    domain: string;
    primaryIp: string;
    secondaryIps?: string[];
    endpoint: string;
  }) {
    const server = await this.smtpServerModel.findOneAndUpdate(
      { 
        domain: serverData.domain,
        primaryIp: serverData.primaryIp
      },
      {
        ...serverData,
        status: 'active',
        lastSeen: new Date(),
        healthStatus: 'unknown'
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    console.log(`✅ Registered SMTP server: ${serverData.domain} (${serverData.primaryIp})`);
    return server;
  }

  /**
   * Update server heartbeat
   */
  async updateHeartbeat(serverIp: string, domain: string, additionalData?: any) {
    await this.smtpServerModel.findOneAndUpdate(
      { primaryIp: serverIp, domain },
      { 
        lastSeen: new Date(),
        ...additionalData
      }
    );
  }

  /**
   * Get all active servers
   */
  async getActiveServers() {
    return await this.smtpServerModel.find({ 
      status: 'active',
      healthStatus: { $ne: 'unhealthy' }
    });
  }

  /**
   * Get servers for specific domain-IP combination
   */
  async getServersForDomainIp(domain: string, ip: string) {
    return await this.smtpServerModel.find({
      domain,
      $or: [
        { primaryIp: ip },
        { secondaryIps: { $in: [ip] } }
      ],
      status: 'active',
      healthStatus: 'healthy'
    });
  }

  /**
   * Health check all registered servers (runs every 2 minutes)
   */
  @Cron('0 */2 * * * *')
  async performHealthChecks() {
    const servers = await this.smtpServerModel.find({ status: 'active' });
    
    console.log(`🔍 Performing health checks on ${servers.length} servers...`);

    const healthCheckPromises = servers.map(async (server) => {
      try {
        const response = await this.httpService.axiosRef.get(
          `${server.endpoint}/health`,
          { timeout: 5000 }
        );

        await this.smtpServerModel.findByIdAndUpdate(server._id, {
          healthStatus: 'healthy',
          lastHealthCheck: new Date()
        });

        return { server: server.endpoint, status: 'healthy' };
      } catch (error) {
        console.warn(`❌ Health check failed for ${server.endpoint}: ${error.message}`);
        
        await this.smtpServerModel.findByIdAndUpdate(server._id, {
          healthStatus: 'unhealthy',
          lastHealthCheck: new Date()
        });

        return { server: server.endpoint, status: 'unhealthy', error: error.message };
      }
    });

    const results = await Promise.all(healthCheckPromises);
    const healthyCount = results.filter(r => r.status === 'healthy').length;
    
    console.log(`✅ Health check complete: ${healthyCount}/${servers.length} servers healthy`);
    return results;
  }

  /**
   * Mark servers as inactive if not seen for too long (runs every 5 minutes)
   */
  @Cron('0 */5 * * * *')
  async markInactiveServers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const result = await this.smtpServerModel.updateMany(
      { 
        lastSeen: { $lt: fiveMinutesAgo },
        status: 'active'
      },
      { 
        status: 'inactive',
        healthStatus: 'unknown'
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`⚠️ Marked ${result.modifiedCount} servers as inactive due to missed heartbeats`);
    }
  }

  /**
   * Get server statistics
   */
  async getServerStatistics() {
    const stats = await this.smtpServerModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          domains: { $addToSet: '$domain' }
        }
      }
    ]);

    const totalServers = await this.smtpServerModel.countDocuments();
    
    return {
      totalServers,
      byStatus: stats,
      lastUpdated: new Date()
    };
  }
}
```

### Main Server: Updated Controller

```typescript
// main-server/src/campaign/campaign.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Headers,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { CampaignProxyService } from './campaign-proxy.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('/api/campaign')
export class CampaignController {
  constructor(private readonly campaignProxyService: CampaignProxyService) {}

  @Post('create')
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('Authorization') token: string,
  ) {
    const firebaseToken = token.split(' ')[1];
    return this.campaignProxyService.createCampaign(createCampaignDto, firebaseToken);
  }

  @Put(':campaignId/pause')
  async pauseCampaign(@Param('campaignId') campaignId: string) {
    return this.campaignProxyService.pauseCampaign(campaignId);
  }

  @Put(':campaignId/resume')
  async resumeCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Headers('Authorization') token: string,
  ) {
    const firebaseToken = token.split(' ')[1];
    return this.campaignProxyService.resumeCampaign(createCampaignDto, firebaseToken);
  }

  @Get('stats/:campaignId')
  async getCampaignStats(@Param('campaignId') campaignId: string) {
    return this.campaignProxyService.getCampaignStats(campaignId);
  }

  @Get('all')
  async getAllCampaigns() {
    return this.campaignProxyService.getAllCampaigns();
  }
}
```

### SMTP Server Registration Controller

```typescript
// main-server/src/smtp-server/smtp-server.controller.ts
import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { SmtpServerService } from './smtp-server.service';

@Controller('/api/smtp-servers')
export class SmtpServerController {
  constructor(private readonly smtpServerService: SmtpServerService) {}

  @Post('register')
  async registerServer(@Body() serverData: {
    domain: string;
    primaryIp: string;
    secondaryIps?: string[];
    endpoint: string;
  }) {
    return this.smtpServerService.registerServer(serverData);
  }

  @Post('heartbeat')
  async heartbeat(@Body() heartbeatData: {
    serverIp: string;
    domain: string;
    currentCampaigns?: number;
    queueStats?: any;
  }) {
    return this.smtpServerService.updateHeartbeat(
      heartbeatData.serverIp,
      heartbeatData.domain,
      {
        currentCampaigns: heartbeatData.currentCampaigns,
        queueStats: heartbeatData.queueStats
      }
    );
  }

  @Get('list')
  async listServers() {
    return this.smtpServerService.getActiveServers();
  }

  @Get('statistics')
  async getStatistics() {
    return this.smtpServerService.getServerStatistics();
  }

  @Put(':serverId/status')
  async updateServerStatus(
    @Param('serverId') serverId: string,
    @Body() statusData: { status: 'active' | 'inactive' | 'maintenance' }
  ) {
    // Implementation for manual server status updates
  }
}
```## SM
TP Server Implementation

### Auto-Registration Service

```typescript
// smtp-server/src/registration/registration.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RegistrationService {
  constructor(
    private httpService: HttpService,
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectQueue('campaign-queue') private campaignQueue: Queue,
  ) {}

  /**
   * Register this server with the main server on startup
   */
  async registerWithMainServer() {
    const serverInfo = {
      domain: process.env.SERVER_DOMAIN,
      primaryIp: process.env.SERVER_PRIMARY_IP,
      secondaryIps: process.env.SERVER_SECONDARY_IPS?.split(',').filter(Boolean) || [],
      endpoint: `http://${process.env.SERVER_PRIMARY_IP}:${process.env.PORT || 3001}`,
    };

    try {
      const response = await this.httpService.axiosRef.post(
        `${process.env.MAIN_SERVER_URL}/api/smtp-servers/register`,
        serverInfo,
        { timeout: 10000 }
      );
      
      console.log('✅ Successfully registered with main server');
      console.log(`📊 Report dashboard: ${serverInfo.endpoint}/report`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to register with main server:', error.message);
      // Don't throw error - server should still start even if registration fails
      // Will retry on next heartbeat
    }
  }

  /**
   * Send periodic heartbeat to main server (every 30 seconds)
   */
  @Cron('*/30 * * * * *')
  async sendHeartbeat() {
    try {
      const queueStats = await this.getQueueStatistics();
      
      await this.httpService.axiosRef.post(
        `${process.env.MAIN_SERVER_URL}/api/smtp-servers/heartbeat`,
        {
          serverIp: process.env.SERVER_PRIMARY_IP,
          domain: process.env.SERVER_DOMAIN,
          currentCampaigns: queueStats.activeCampaigns,
          queueStats: queueStats,
          timestamp: new Date(),
        },
        { timeout: 5000 }
      );
    } catch (error) {
      console.error('💔 Heartbeat failed:', error.message);
      // If heartbeat fails multiple times, could trigger re-registration
    }
  }

  /**
   * Get current queue statistics for heartbeat
   */
  private async getQueueStatistics() {
    try {
      const [emailWaiting, emailActive, campaignActive] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.campaignQueue.getActive(),
      ]);

      return {
        emailQueue: {
          waiting: emailWaiting.length,
          active: emailActive.length,
        },
        campaignQueue: {
          active: campaignActive.length,
        },
        activeCampaigns: campaignActive.length,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error.message);
      return {
        emailQueue: { waiting: 0, active: 0 },
        campaignQueue: { active: 0 },
        activeCampaigns: 0,
      };
    }
  }
}
```

### Enhanced Delivery Tracking Service

```typescript
// smtp-server/src/delivery/delivery-tracking.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { DeliveryTracking, DeliveryTrackingDocument } from '../shared/schemas/delivery-tracking.schema';
import { Email, EmailDocument } from '../email/schemas/email.schemas';

@Injectable()
export class DeliveryTrackingService {
  constructor(
    @InjectModel(DeliveryTracking.name) private deliveryTrackingModel: Model<DeliveryTrackingDocument>,
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

  /**
   * Enhanced email sending with comprehensive tracking
   */
  async sendEmailWithTracking(emailData: {
    from: string;
    fromName: string;
    to: string;
    subject: string;
    html: string;
    campaignId: string;
    offerId: string;
    domain: string;
    ip: string;
    headers?: any;
  }, transporter: any) {
    
    const trackingId = uuidv4();
    const messageId = `<${trackingId}@${emailData.domain}>`;

    try {
      // Send email with tracking headers
      const info = await transporter.sendMail({
        from: `${emailData.fromName} <${emailData.from}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        headers: {
          ...emailData.headers,
          'X-Tracking-ID': trackingId,
          'Message-ID': messageId,
          'Return-Path': `bounces@${emailData.domain}`,
        },
        envelope: {
          from: `bounces@${emailData.domain}`,
          to: emailData.to,
        },
      });

      // Save email record
      const emailRecord = await this.emailModel.create({
        from: emailData.from,
        to: emailData.to,
        offerId: emailData.offerId,
        campaignId: emailData.campaignId,
        sentAt: new Date(),
        response: info.response,
        mode: 'bulk',
        domainUsed: emailData.domain,
        ipUsed: emailData.ip,
        trackingId: trackingId,
        messageId: info.messageId || messageId,
      });

      // Create delivery tracking record
      await this.deliveryTrackingModel.create({
        trackingId,
        emailId: emailRecord._id,
        campaignId: emailData.campaignId,
        to: emailData.to,
        deliveryStatus: 'sent',
        smtpResponse: info.response,
        sentAt: new Date(),
        processingServer: process.env.SERVER_PRIMARY_IP,
        serverDomain: emailData.domain,
        serverIp: emailData.ip,
      });

      return { 
        success: true, 
        trackingId, 
        messageId: info.messageId || messageId,
        response: info.response 
      };

    } catch (error) {
      // Save failed email record
      const emailRecord = await this.emailModel.create({
        from: emailData.from,
        to: emailData.to,
        offerId: emailData.offerId,
        campaignId: emailData.campaignId,
        sentAt: new Date(),
        response: `Failed: ${error.message}`,
        mode: 'bulk',
        domainUsed: emailData.domain,
        ipUsed: emailData.ip,
        trackingId: trackingId,
      });

      // Create failed delivery tracking record
      await this.deliveryTrackingModel.create({
        trackingId,
        emailId: emailRecord._id,
        campaignId: emailData.campaignId,
        to: emailData.to,
        deliveryStatus: 'failed',
        smtpResponse: error.message,
        sentAt: new Date(),
        processingServer: process.env.SERVER_PRIMARY_IP,
        serverDomain: emailData.domain,
        serverIp: emailData.ip,
      });

      throw error;
    }
  }

  /**
   * Process bounce notifications (webhook endpoint)
   */
  async processBounce(bounceData: {
    messageId?: string;
    trackingId?: string;
    bounceType: string;
    bounceReason: string;
    recipient: string;
  }) {
    const query = bounceData.trackingId 
      ? { trackingId: bounceData.trackingId }
      : { messageId: bounceData.messageId };

    await this.deliveryTrackingModel.findOneAndUpdate(
      query,
      {
        deliveryStatus: 'bounced',
        bounceReason: bounceData.bounceReason,
        bouncedAt: new Date(),
      }
    );

    console.log(`📧 Processed bounce for ${bounceData.recipient}: ${bounceData.bounceReason}`);
  }

  /**
   * Process spam complaints (webhook endpoint)
   */
  async processComplaint(complaintData: {
    messageId?: string;
    trackingId?: string;
    complaintType: string;
    recipient: string;
  }) {
    const query = complaintData.trackingId 
      ? { trackingId: complaintData.trackingId }
      : { messageId: complaintData.messageId };

    await this.deliveryTrackingModel.findOneAndUpdate(
      query,
      {
        deliveryStatus: 'complained',
        complaintType: complaintData.complaintType,
        complainedAt: new Date(),
      }
    );

    console.log(`🚨 Processed complaint for ${complaintData.recipient}: ${complaintData.complaintType}`);
  }

  /**
   * Get delivery statistics for reporting
   */
  async getDeliveryStats(filters?: {
    campaignId?: string;
    timeRange?: { start: Date; end: Date };
    serverIp?: string;
  }) {
    const matchConditions: any = {
      processingServer: process.env.SERVER_PRIMARY_IP
    };
    
    if (filters?.campaignId) {
      matchConditions.campaignId = filters.campaignId;
    }
    
    if (filters?.timeRange) {
      matchConditions.sentAt = {
        $gte: filters.timeRange.start,
        $lte: filters.timeRange.end,
      };
    }

    const stats = await this.deliveryTrackingModel.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      sent: 0,
      delivered: 0,
      bounced: 0,
      complained: 0,
      failed: 0,
      deferred: 0,
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  /**
   * Get recent email activity for dashboard
   */
  async getRecentEmails(limit: number = 50) {
    return await this.deliveryTrackingModel
      .find({ processingServer: process.env.SERVER_PRIMARY_IP })
      .sort({ sentAt: -1 })
      .limit(limit)
      .populate('emailId', 'from subject response')
      .lean();
  }
}
```###
 Report Dashboard Implementation

```typescript
// smtp-server/src/report/report.controller.ts
import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  /**
   * Main dashboard - HTML interface
   */
  @Get('/')
  async getDashboard(@Res() res: Response) {
    const reportData = await this.reportService.generateFullReport();
    const html = this.generateHtmlDashboard(reportData);
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * API endpoint for dashboard data
   */
  @Get('/api')
  async getReportApi(@Query('campaignId') campaignId?: string) {
    return await this.reportService.generateFullReport(campaignId);
  }

  /**
   * Real-time queue status
   */
  @Get('/queue-status')
  async getQueueStatus() {
    return await this.reportService.getQueueStatistics();
  }

  /**
   * Delivery statistics
   */
  @Get('/delivery-stats')
  async getDeliveryStats(
    @Query('campaignId') campaignId?: string,
    @Query('hours') hours?: string
  ) {
    const timeRange = hours ? {
      start: new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000),
      end: new Date()
    } : undefined;

    return await this.reportService.getDeliveryStatistics(campaignId, timeRange);
  }

  /**
   * Generate HTML dashboard
   */
  private generateHtmlDashboard(data: any): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SMTP Server Report - ${data.serverInfo.domain}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f5f5;
                color: #333;
                line-height: 1.6;
            }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .header-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
            .header-info div { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; }
            
            .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                margin-bottom: 30px; 
            }
            .stat-card { 
                background: white;
                padding: 25px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-left: 4px solid #667eea;
            }
            .stat-card h3 { 
                color: #667eea;
                margin-bottom: 15px;
                font-size: 1.2em;
            }
            .stat-item { 
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            .stat-item:last-child { border-bottom: none; }
            .stat-value { font-weight: bold; }
            
            .status-indicator {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 8px;
            }
            .status-healthy { background: #4CAF50; }
            .status-warning { background: #FF9800; }
            .status-error { background: #F44336; }
            
            .table-container { 
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }
            .table-header { 
                background: #667eea;
                color: white;
                padding: 20px;
                font-size: 1.2em;
                font-weight: bold;
            }
            table { 
                width: 100%;
                border-collapse: collapse;
            }
            th, td { 
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            th { 
                background: #f8f9fa;
                font-weight: 600;
                color: #555;
            }
            tr:hover { background: #f8f9fa; }
            
            .status-sent { color: #4CAF50; font-weight: bold; }
            .status-failed { color: #F44336; font-weight: bold; }
            .status-bounced { color: #FF9800; font-weight: bold; }
            .status-pending { color: #2196F3; font-weight: bold; }
            
            .refresh-info {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 0.9em;
            }
            
            @media (max-width: 768px) {
                .container { padding: 10px; }
                .header-info { grid-template-columns: 1fr; }
                .stats-grid { grid-template-columns: 1fr; }
                table { font-size: 0.9em; }
                th, td { padding: 8px 10px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📧 SMTP Server Dashboard</h1>
                <div class="header-info">
                    <div>
                        <strong>Domain:</strong><br>
                        ${data.serverInfo.domain}
                    </div>
                    <div>
                        <strong>Primary IP:</strong><br>
                        ${data.serverInfo.primaryIp}
                    </div>
                    <div>
                        <strong>Uptime:</strong><br>
                        ${Math.floor(data.serverInfo.uptime / 3600)}h ${Math.floor((data.serverInfo.uptime % 3600) / 60)}m
                    </div>
                    <div>
                        <strong>Status:</strong><br>
                        <span class="status-indicator status-healthy"></span>Online
                    </div>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📬 Queue Status</h3>
                    <div class="stat-item">
                        <span>Waiting:</span>
                        <span class="stat-value">${data.queueStats.waiting}</span>
                    </div>
                    <div class="stat-item">
                        <span>Active:</span>
                        <span class="stat-value">${data.queueStats.active}</span>
                    </div>
                    <div class="stat-item">
                        <span>Completed:</span>
                        <span class="stat-value">${data.queueStats.completed}</span>
                    </div>
                    <div class="stat-item">
                        <span>Failed:</span>
                        <span class="stat-value">${data.queueStats.failed}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>📊 Email Delivery (24h)</h3>
                    <div class="stat-item">
                        <span>Sent:</span>
                        <span class="stat-value status-sent">${data.deliveryStats.sent || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Delivered:</span>
                        <span class="stat-value status-sent">${data.deliveryStats.delivered || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Bounced:</span>
                        <span class="stat-value status-bounced">${data.deliveryStats.bounced || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Failed:</span>
                        <span class="stat-value status-failed">${data.deliveryStats.failed || 0}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <h3>🎯 Active Campaigns</h3>
                    <div class="stat-item">
                        <span>Running:</span>
                        <span class="stat-value">${data.campaignStats.running || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Paused:</span>
                        <span class="stat-value">${data.campaignStats.paused || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Completed:</span>
                        <span class="stat-value">${data.campaignStats.completed || 0}</span>
                    </div>
                    <div class="stat-item">
                        <span>Total:</span>
                        <span class="stat-value">${(data.campaignStats.running || 0) + (data.campaignStats.paused || 0) + (data.campaignStats.completed || 0)}</span>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    📋 Recent Email Activity (Last 50)
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Recipient</th>
                            <th>Campaign</th>
                            <th>Status</th>
                            <th>Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recentEmails.map(email => `
                            <tr>
                                <td>${new Date(email.sentAt).toLocaleString()}</td>
                                <td>${email.to}</td>
                                <td>${email.campaignId}</td>
                                <td class="status-${email.deliveryStatus}">${email.deliveryStatus.toUpperCase()}</td>
                                <td title="${email.smtpResponse || email.bounceReason || 'N/A'}">
                                    ${(email.smtpResponse || email.bounceReason || 'N/A').substring(0, 50)}${(email.smtpResponse || email.bounceReason || '').length > 50 ? '...' : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="refresh-info">
                <p>🔄 Last updated: ${new Date(data.serverInfo.timestamp).toLocaleString()}</p>
                <p>Auto-refresh in <span id="countdown">30</span> seconds</p>
            </div>
        </div>

        <script>
            // Auto-refresh countdown and reload
            let countdown = 30;
            const countdownElement = document.getElementById('countdown');
            
            const timer = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;
                
                if (countdown <= 0) {
                    location.reload();
                }
            }, 1000);
        </script>
    </body>
    </html>
    `;
  }
}
```

```typescript
// smtp-server/src/report/report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Model } from 'mongoose';
import { Queue } from 'bullmq';
import { Campaign, CampaignDocument } from '../campaign/schemas/campaign.schemas';
import { DeliveryTrackingService } from '../delivery/delivery-tracking.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    @InjectQueue('email-queue') private emailQueue: Queue,
    @InjectQueue('campaign-queue') private campaignQueue: Queue,
    private deliveryTrackingService: DeliveryTrackingService,
  ) {}

  /**
   * Generate comprehensive report for dashboard
   */
  async generateFullReport(campaignId?: string) {
    const [
      queueStats,
      deliveryStats,
      campaignStats,
      recentEmails
    ] = await Promise.all([
      this.getQueueStatistics(),
      this.getDeliveryStatistics(campaignId),
      this.getCampaignStatistics(),
      this.deliveryTrackingService.getRecentEmails(50)
    ]);

    return {
      serverInfo: {
        domain: process.env.SERVER_DOMAIN,
        primaryIp: process.env.SERVER_PRIMARY_IP,
        secondaryIps: process.env.SERVER_SECONDARY_IPS?.split(',') || [],
        uptime: process.uptime(),
        timestamp: new Date(),
        endpoint: `http://${process.env.SERVER_PRIMARY_IP}:${process.env.PORT || 3001}`,
      },
      queueStats,
      deliveryStats,
      campaignStats,
      recentEmails,
    };
  }

  /**
   * Get current queue statistics
   */
  async getQueueStatistics() {
    try {
      const [
        emailWaiting,
        emailActive,
        emailCompleted,
        emailFailed,
        campaignActive
      ] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
        this.campaignQueue.getActive(),
      ]);

      return {
        waiting: emailWaiting.length,
        active: emailActive.length,
        completed: emailCompleted.length,
        failed: emailFailed.length,
        activeCampaigns: campaignActive.length,
      };
    } catch (error) {
      console.error('Failed to get queue statistics:', error.message);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        activeCampaigns: 0,
      };
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStatistics(campaignId?: string, timeRange?: { start: Date; end: Date }) {
    const defaultTimeRange = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    };

    return await this.deliveryTrackingService.getDeliveryStats({
      campaignId,
      timeRange: timeRange || defaultTimeRange,
    });
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStatistics() {
    try {
      const stats = await this.campaignModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        running: 0,
        paused: 0,
        completed: 0,
        draft: 0,
        ready: 0,
        ended: 0,
      };

      stats.forEach(stat => {
        if (result.hasOwnProperty(stat._id)) {
          result[stat._id] = stat.count;
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to get campaign statistics:', error.message);
      return {
        running: 0,
        paused: 0,
        completed: 0,
        draft: 0,
        ready: 0,
        ended: 0,
      };
    }
  }
}
```##
 Configuration

### Environment Variables

#### Main Server (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/email-system

# Redis Configuration (for main server operations)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=3000
NODE_ENV=production

# Firebase Authentication
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email Configuration
ROOT_MAIL_USER_PASSWORD=your-smtp-password

# Logging
LOG_LEVEL=info
```

#### SMTP Server (.env)
```env
# Database Configuration (same as main server)
MONGODB_URI=mongodb://main-server-ip:27017/email-system

# Local Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=3001
NODE_ENV=production

# Server Identity
SERVER_DOMAIN=example.com
SERVER_PRIMARY_IP=192.168.1.1
SERVER_SECONDARY_IPS=192.168.1.2,192.168.1.3

# Main Server Configuration
MAIN_SERVER_URL=http://main-server-ip:3000

# Email Configuration
ROOT_MAIL_USER_PASSWORD=your-smtp-password

# Logging
LOG_LEVEL=info

# Optional: Webhook Configuration for Delivery Tracking
WEBHOOK_SECRET=your-webhook-secret
BOUNCE_WEBHOOK_URL=http://192.168.1.1:3001/webhooks/bounce
COMPLAINT_WEBHOOK_URL=http://192.168.1.1:3001/webhooks/complaint
```

### Docker Configuration

#### SMTP Server Docker Compose
```yaml
# smtp-server/docker-compose.yml
version: '3.8'

services:
  smtp-server:
    build: .
    container_name: smtp-server-${SERVER_PRIMARY_IP}
    ports:
      - "${PORT:-3001}:${PORT:-3001}"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - SERVER_DOMAIN=${SERVER_DOMAIN}
      - SERVER_PRIMARY_IP=${SERVER_PRIMARY_IP}
      - SERVER_SECONDARY_IPS=${SERVER_SECONDARY_IPS}
      - MAIN_SERVER_URL=${MAIN_SERVER_URL}
      - ROOT_MAIL_USER_PASSWORD=${ROOT_MAIL_USER_PASSWORD}
      - PORT=${PORT:-3001}
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - smtp-network

  redis:
    image: redis:7-alpine
    container_name: redis-${SERVER_PRIMARY_IP}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - smtp-network

volumes:
  redis_data:
    driver: local

networks:
  smtp-network:
    driver: bridge
```

#### SMTP Server Dockerfile
```dockerfile
# smtp-server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Create directories and set permissions
RUN mkdir -p /app/logs /app/data
RUN chown -R nestjs:nodejs /app

USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/main"]
```

### Package.json Dependencies

#### Main Server Additional Dependencies
```json
{
  "dependencies": {
    "@nestjs/axios": "^3.0.0",
    "axios": "^1.6.0"
  }
}
```

#### SMTP Server Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/mongoose": "^10.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/axios": "^3.0.0",
    "mongoose": "^8.0.0",
    "bullmq": "^5.0.0",
    "redis": "^4.6.0",
    "nodemailer": "^6.9.0",
    "axios": "^1.6.0",
    "uuid": "^9.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/nodemailer": "^6.4.0",
    "@types/uuid": "^9.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Deployment Guide

### Step 1: Prepare Main Server

1. **Update existing codebase:**
```bash
cd main-server
npm install @nestjs/axios axios
```

2. **Add new services and controllers** (as shown in implementation section)

3. **Update module imports:**
```typescript
// main-server/src/app.module.ts
@Module({
  imports: [
    // ... existing imports
    HttpModule,
    MongooseModule.forFeature([
      { name: SmtpServer.name, schema: SmtpServerSchema },
      // ... other schemas
    ]),
  ],
  controllers: [
    // ... existing controllers
    SmtpServerController,
  ],
  providers: [
    // ... existing providers
    SmtpServerService,
    CampaignProxyService,
  ],
})
```

4. **Deploy main server:**
```bash
npm run build
npm run start:prod
```

### Step 2: Prepare SMTP Server Template

1. **Create SMTP server directory:**
```bash
mkdir smtp-server
cd smtp-server
npm init -y
```

2. **Install dependencies:**
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/mongoose @nestjs/bullmq @nestjs/schedule @nestjs/axios mongoose bullmq redis nodemailer axios uuid class-validator class-transformer

npm install -D @types/node @types/nodemailer @types/uuid typescript @nestjs/cli
```

3. **Copy and adapt code** from main server (campaign, email modules)

4. **Add new modules** (report, registration, delivery tracking)

### Step 3: Deploy First SMTP Server

1. **Configure environment:**
```bash
# On server 192.168.1.1
cd /opt/smtp-server
cp .env.example .env
# Edit .env with correct values
```

2. **Install Redis:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

3. **Start SMTP server:**
```bash
npm run build
npm run start:prod
```

4. **Verify registration:**
```bash
# Check if server registered with main server
curl http://main-server:3000/api/smtp-servers/list
```

5. **Test report dashboard:**
```bash
# Visit in browser
http://192.168.1.1:3001/report
```

### Step 4: Deploy Additional SMTP Servers

Repeat Step 3 for each additional server, updating the environment variables:
- `SERVER_PRIMARY_IP`
- `SERVER_SECONDARY_IPS`
- `PORT` (if running multiple servers on same machine)

### Step 5: Production Deployment with Docker

1. **Create deployment script:**
```bash
#!/bin/bash
# deploy-smtp-server.sh

SERVER_IP=$1
SERVER_DOMAIN=$2
MAIN_SERVER_URL=$3

if [ -z "$SERVER_IP" ] || [ -z "$SERVER_DOMAIN" ] || [ -z "$MAIN_SERVER_URL" ]; then
    echo "Usage: $0 <server_ip> <server_domain> <main_server_url>"
    exit 1
fi

# Create environment file
cat > .env << EOF
MONGODB_URI=mongodb://main-server:27017/email-system
SERVER_DOMAIN=$SERVER_DOMAIN
SERVER_PRIMARY_IP=$SERVER_IP
MAIN_SERVER_URL=$MAIN_SERVER_URL
ROOT_MAIL_USER_PASSWORD=your-password
PORT=3001
NODE_ENV=production
EOF

# Deploy with Docker Compose
docker-compose up -d

echo "SMTP server deployed at http://$SERVER_IP:3001"
echo "Report dashboard: http://$SERVER_IP:3001/report"
```

2. **Deploy to each server:**
```bash
chmod +x deploy-smtp-server.sh
./deploy-smtp-server.sh 192.168.1.1 example.com http://main-server:3000
./deploy-smtp-server.sh 192.168.1.2 example2.com http://main-server:3000
```

### Step 6: Monitoring and Health Checks

1. **Set up monitoring script:**
```bash
#!/bin/bash
# monitor-servers.sh

MAIN_SERVER="http://main-server:3000"

echo "Checking server health..."
curl -s "$MAIN_SERVER/api/smtp-servers/list" | jq '.[] | {domain: .domain, ip: .primaryIp, status: .status, healthStatus: .healthStatus, lastSeen: .lastSeen}'

echo -e "\nChecking server statistics..."
curl -s "$MAIN_SERVER/api/smtp-servers/statistics" | jq '.'
```

2. **Set up log aggregation** (optional):
```bash
# Install filebeat or similar to collect logs from all servers
# Configure to send to centralized logging system
```## Te
sting Guide

### Step 1: Test Server Registration

```bash
# 1. Check if SMTP servers are registered
curl -X GET http://main-server:3000/api/smtp-servers/list

# Expected response:
[
  {
    "_id": "...",
    "domain": "example.com",
    "primaryIp": "192.168.1.1",
    "endpoint": "http://192.168.1.1:3001",
    "status": "active",
    "healthStatus": "healthy",
    "lastSeen": "2024-01-01T12:00:00.000Z"
  }
]

# 2. Check server statistics
curl -X GET http://main-server:3000/api/smtp-servers/statistics
```

### Step 2: Test Email Routing

```bash
# 1. Test mode email (should route to appropriate SMTP server)
curl -X POST http://main-server:3000/api/campaign/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "mode": "test",
    "selectedIp": "example.com-192.168.1.1",
    "to": ["test@example.com"],
    "from": "sender@example.com",
    "fromName": "Test Sender",
    "subject": "Test Email",
    "emailTemplate": "Hello%20World",
    "templateType": "html",
    "offerId": "test-offer",
    "campaignId": "test-campaign-001"
  }'

# Expected response:
{
  "message": "All emails sent successfully",
  "success": true,
  "sent": ["test@example.com"],
  "failed": [],
  "emailSent": 1,
  "emailFailed": 0,
  "processedBy": "http://192.168.1.1:3001",
  "serverDomain": "example.com",
  "serverIp": "192.168.1.1"
}
```

### Step 3: Test Bulk Campaign

```bash
# 1. First, add recipients to campaign tracking (you'll need to create this endpoint)
curl -X POST http://main-server:3000/api/campaign/add-recipients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "campaignId": "bulk-campaign-001",
    "recipients": [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com"
    ]
  }'

# 2. Start bulk campaign
curl -X POST http://main-server:3000/api/campaign/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "mode": "bulk",
    "selectedIp": "example.com-192.168.1.1",
    "from": "sender@example.com",
    "fromName": "Bulk Sender",
    "subject": "Bulk Email Campaign",
    "emailTemplate": "Hello%20from%20bulk%20campaign",
    "templateType": "html",
    "offerId": "bulk-offer",
    "campaignId": "bulk-campaign-001",
    "batchSize": 2,
    "delay": 5
  }'

# 3. Check campaign status
curl -X GET http://main-server:3000/api/campaign/stats/bulk-campaign-001
```

### Step 4: Test Campaign Controls

```bash
# 1. Pause campaign
curl -X PUT http://main-server:3000/api/campaign/bulk-campaign-001/pause

# 2. Resume campaign
curl -X PUT http://main-server:3000/api/campaign/bulk-campaign-001/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "campaignId": "bulk-campaign-001",
    "selectedIp": "example.com-192.168.1.1",
    "batchSize": 2,
    "delay": 5
  }'
```

### Step 5: Test Report Dashboards

```bash
# 1. Check SMTP server report (API)
curl -X GET http://192.168.1.1:3001/report/api

# 2. Check queue status
curl -X GET http://192.168.1.1:3001/report/queue-status

# 3. Check delivery statistics
curl -X GET http://192.168.1.1:3001/report/delivery-stats?hours=24

# 4. Visit HTML dashboard in browser
# http://192.168.1.1:3001/report
```

### Step 6: Test Error Scenarios

```bash
# 1. Test with invalid server (should fail gracefully)
curl -X POST http://main-server:3000/api/campaign/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "mode": "test",
    "selectedIp": "nonexistent.com-192.168.1.99",
    "to": ["test@example.com"],
    "from": "sender@example.com",
    "subject": "Test Email"
  }'

# Expected: 503 Service Unavailable with appropriate error message

# 2. Test with server down (stop one SMTP server and test)
docker-compose -f smtp-server/docker-compose.yml down
# Then try to send email to that server
# Should get appropriate error response
```

### Step 7: Load Testing

```bash
# Use Apache Bench or similar tool for load testing
ab -n 100 -c 10 -T 'application/json' -p test-payload.json \
   http://main-server:3000/api/campaign/create

# Monitor server performance during load test
# Check queue statistics and delivery rates
```

## Monitoring and Maintenance

### Health Monitoring

#### Automated Health Checks
The system includes several automated monitoring features:

1. **Server Registration**: SMTP servers auto-register on startup
2. **Heartbeat System**: 30-second heartbeats to main server
3. **Health Checks**: Main server checks SMTP server health every 2 minutes
4. **Inactive Detection**: Servers marked inactive after 5 minutes without heartbeat

#### Monitoring Endpoints

```bash
# Main server monitoring
GET /api/smtp-servers/list              # List all registered servers
GET /api/smtp-servers/statistics        # Server statistics
GET /api/campaign/all                   # All campaigns across servers

# SMTP server monitoring
GET /health                             # Health check endpoint
GET /report                             # HTML dashboard
GET /report/api                         # JSON dashboard data
GET /report/queue-status                # Real-time queue status
GET /report/delivery-stats              # Delivery statistics
```

### Log Management

#### Centralized Logging Setup
```bash
# Install filebeat on each SMTP server
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.11.0-linux-x86_64.tar.gz
tar xzvf filebeat-8.11.0-linux-x86_64.tar.gz

# Configure filebeat.yml
cat > filebeat.yml << EOF
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /app/logs/*.log
  fields:
    server_ip: ${SERVER_PRIMARY_IP}
    server_domain: ${SERVER_DOMAIN}
    service: smtp-server

output.elasticsearch:
  hosts: ["elasticsearch:9200"]

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
EOF
```

#### Log Rotation
```bash
# Setup logrotate for application logs
cat > /etc/logrotate.d/smtp-server << EOF
/app/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 nodejs nodejs
    postrotate
        docker kill -s USR1 smtp-server-container || true
    endscript
}
EOF
```

### Performance Optimization

#### Database Indexing
```javascript
// MongoDB indexes for optimal performance
db.campaigns.createIndex({ "campaignId": 1 })
db.campaigns.createIndex({ "status": 1, "assignedServerId": 1 })
db.campaign_email_tracking.createIndex({ "campaignId": 1, "status": 1 })
db.campaign_email_tracking.createIndex({ "campaignId": 1, "isProcessed": 1 })
db.delivery_tracking.createIndex({ "processingServer": 1, "sentAt": -1 })
db.delivery_tracking.createIndex({ "campaignId": 1, "deliveryStatus": 1 })
db.smtp_servers.createIndex({ "domain": 1, "primaryIp": 1 })
db.smtp_servers.createIndex({ "status": 1, "healthStatus": 1 })
```

#### Redis Optimization
```bash
# Redis configuration for better performance
cat > redis.conf << EOF
# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Network
tcp-keepalive 300
timeout 0

# Performance
tcp-backlog 511
databases 16
EOF
```

### Backup and Recovery

#### Database Backup
```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mongodump --uri="mongodb://localhost:27017/email-system" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/email-system-$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/$DATE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: email-system-$DATE.tar.gz"
```

#### Configuration Backup
```bash
#!/bin/bash
# backup-configs.sh

BACKUP_DIR="/backups/configs"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup environment files and docker configs
tar -czf "$BACKUP_DIR/configs-$DATE.tar.gz" \
    /opt/main-server/.env \
    /opt/smtp-server/.env \
    /opt/smtp-server/docker-compose.yml

echo "Configuration backup completed: configs-$DATE.tar.gz"
```

### Troubleshooting Guide

#### Common Issues and Solutions

1. **SMTP Server Not Registering**
```bash
# Check network connectivity
curl -v http://main-server:3000/api/smtp-servers/register

# Check SMTP server logs
docker logs smtp-server-container

# Verify environment variables
docker exec smtp-server-container env | grep SERVER
```

2. **Emails Not Being Sent**
```bash
# Check queue status
curl http://192.168.1.1:3001/report/queue-status

# Check Redis connection
docker exec smtp-server-container redis-cli ping

# Check MongoDB connection
docker exec smtp-server-container mongo --eval "db.adminCommand('ping')"
```

3. **High Queue Backlog**
```bash
# Check server resources
docker stats

# Increase batch processing
# Update batchSize in campaign configuration

# Add more SMTP servers
# Deploy additional servers following deployment guide
```

4. **Server Health Check Failures**
```bash
# Check server status
curl http://192.168.1.1:3001/health

# Check server logs
docker logs smtp-server-container --tail 100

# Restart server if needed
docker-compose restart
```

## Migration Strategy

### Phase 1: Preparation (Week 1)
- [ ] Set up development environment
- [ ] Implement main server proxy functionality
- [ ] Create SMTP server template
- [ ] Test with one SMTP server

### Phase 2: Pilot Deployment (Week 2)
- [ ] Deploy updated main server
- [ ] Convert one production SMTP server
- [ ] Run parallel testing
- [ ] Monitor performance and stability

### Phase 3: Gradual Migration (Weeks 3-4)
- [ ] Convert remaining SMTP servers one by one
- [ ] Monitor system performance
- [ ] Adjust configuration as needed
- [ ] Train team on new monitoring tools

### Phase 4: Optimization (Week 5)
- [ ] Fine-tune performance settings
- [ ] Implement advanced monitoring
- [ ] Set up automated alerts
- [ ] Document operational procedures

## Conclusion

This distributed email system architecture provides:

✅ **Better Resource Utilization**: Each SMTP server handles its own processing
✅ **Improved Scalability**: Easy to add new servers horizontally  
✅ **Enhanced Monitoring**: Real-time dashboards and delivery tracking
✅ **Fault Isolation**: Server failures don't affect the entire system
✅ **Maintainable Design**: Modular architecture with clear separation of concerns

The system maintains all existing functionality while providing the distributed processing and comprehensive monitoring capabilities you requested. The `/report` endpoint on each server gives you the visibility into email delivery status that was missing in the current system.

For questions or issues during implementation, refer to the troubleshooting guide or check the server logs and monitoring dashboards.