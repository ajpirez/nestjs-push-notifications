import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostCreatedEvent } from './events/post-created.event';

@Injectable()
export class AppService {
  constructor(private eventEmitter: EventEmitter2) {}
  getHello(payload: any): string {
    /**
     * EMIT POST CREATED EVENT
     */
    this.eventEmitter.emit(
      'post.created',
      new PostCreatedEvent('Site Refreshed', payload.message),
    );

    return 'Nestjs Backend!';
  }
}
