// import { Controller, Get, UseGuards } from '@nestjs/common';
// import { BullmqDashboardService } from './bullmq-dashboard.service';
// import { AdminAuthGuard } from '../auth/admin-auth.guard';

// @Controller('api/admin/dashboard')
// export class BullmqDashboardController {
//   constructor(private readonly bullmqDashboardService: BullmqDashboardService) {}

//   @UseGuards(AdminAuthGuard)
//   @Get()
//   getDashboard() {
//     console.log("inside contoller")
//     return this.bullmqDashboardService.getDashboardRouter();
//   }
// }
