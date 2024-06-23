import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SubscriptionDTO } from './subscriber/dto/subscriber.dto';
import { SubscriberService } from './subscriber/subscriber.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly subService: SubscriberService,
  ) {}

  @Post('/subscription')
  subscribe(@Body() body: SubscriptionDTO): string {
    return this.subService.createSubscription(body);
  }

  @Post('/new-message')
  newMessage(@Body() body: { title: string; message: string }) {
    const { message } = body;
    const payload = {
      title: 'My Custom Notification',
      message,
    };

    return this.appService.getHello(payload);
  }
}
