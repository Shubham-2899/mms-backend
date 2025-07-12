// bullmq-dashboard.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import { ExpressAdapter } from '@bull-board/express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Response, Request } from 'express';

@Injectable()
export class BullmqDashboardService implements OnModuleInit {
  private serverAdapter: ExpressAdapter;

  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue,
    // private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * onModuleInit and getDashboardRouter are useless as admin/dashboard is not serverd using traditional
   * controller->service->module aproach instead uses bindMiddleware method
   */
  onModuleInit() {
    // Initialize the BullMQ dashboard adapter
    this.serverAdapter = new ExpressAdapter();
    this.serverAdapter.setBasePath('/api/admin/dashboard');

    createBullBoard({
      queues: [
        new BullMQAdapter(this.emailQueue, {
          readOnlyMode: true,
        }) as unknown as any,
      ],
      serverAdapter: this.serverAdapter,
      options: {
        uiConfig: {
          pollingInterval: {
            showSetting: true,
            forceInterval: 8000,
          },
        },
      },
    });
  }

  // Define getDashboardRouter method to return the Express adapter's router
  getDashboardRouter() {
    return this.serverAdapter.getRouter();
  }

  bindMiddleware(app: NestExpressApplication) {
    const authMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      let authHeader = req.headers['authorization'];
      // console.log("🚀 ~ BullmqDashboardService ~ bindMiddleware ~ authHeader:", authHeader)
      // authHeader =
      //   'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhkOWJlZmQzZWZmY2JiYzgyYzgzYWQwYzk3MmM4ZWE5NzhmNmYxMzciLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiU2h1YmhhbSIsImFkbWluIjp0cnVlLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vcmVhY3QtYXV0aGVudGljYXRpb24tcHJvLTFiZmZlIiwiYXVkIjoicmVhY3QtYXV0aGVudGljYXRpb24tcHJvLTFiZmZlIiwiYXV0aF90aW1lIjoxNzI5MDk0MTI4LCJ1c2VyX2lkIjoibkg3MXU3SVlRSmdOZlIyczlmRHpJY0M2RzVEMiIsInN1YiI6Im5INzF1N0lZUUpnTmZSMnM5ZkR6SWNDNkc1RDIiLCJpYXQiOjE3MjkwOTQxMjgsImV4cCI6MTcyOTA5NzcyOCwiZW1haWwiOiJzaHViaGFtbGF0YWtlMjg5OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsic2h1YmhhbWxhdGFrZTI4OTlAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.QTNelGTlIKqSdT5-uvQ1MQ9khQuWDNNSf1ROAjfa_mG1x-DKKQze7UeKX2KW5o7sviISggNesrX7O0Ca0bBWbc4QXQ_41v4H0fAq-i5ngXF54ZOCATZbblJgjtr88MoRDqhgxc9yqqaSP23_WtB9fc8kx5SToCnsvfdQere4fPvaHJGvXWLegeqrpOnkLjs1IGp5V2P1M8pF6FJtS03e825HvJk3V3TA7gvBT2lsxo1BII8bc5WyrDyEUi-Pt3fGkIbcGqxVldh7vuuUAKvH8OZKohswi5tRD2PD-lOiUYzbxNigvNC-_S4HoMcFN7C7nCV2LAuBReeGehuhAOyFfg';
      // console.log(
      //   '🚀 ~ BullmqDashboardService ~ bindMiddleware ~ authHeader:',
      //   authHeader,
      // );
      authHeader = 'true';
      if (!authHeader) {
        console.log('inside unauthorized');
        return res.status(401).send('Unauthorized');
      }

      const token = authHeader.split(' ')[1];

      // const decodedToken = await this.firebaseService.verifyToken(token);
      const decodedToken = { admin: true };

      // console.log(
      //   '🚀 ~ BullmqDashboardService ~ bindMiddleware ~ decodedToken:',
      //   decodedToken,
      // );

      // Implement your admin check logic based on decodedToken
      const isAdmin = decodedToken.admin === true; // Example check

      if (!isAdmin) {
        return res.status(403).send('Forbidden');
      }

      next();
    };
    // Ensure serverAdapter is initialized
    console.log('bindMiddleware called:');
    if (!this.serverAdapter) {
      this.serverAdapter = new ExpressAdapter();
      this.serverAdapter.setBasePath('/api/admin/dashboard');

      createBullBoard({
        queues: [
          new BullMQAdapter(this.emailQueue, {
            readOnlyMode: true,
          }) as unknown as any,
        ],
        serverAdapter: this.serverAdapter,
        options: {
          uiConfig: {
            boardTitle: 'MMS Board',
            pollingInterval: {
              showSetting: true,
              forceInterval: 8000,
            },
          },
        },
      });
    }

    app.use(
      '/api/admin/dashboard',
      authMiddleware,
      this.serverAdapter.getRouter(),
    );
  }
}
