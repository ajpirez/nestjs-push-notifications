import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PostCreatedEvent } from 'src/events/post-created.event';
import { Repository } from 'typeorm';
import { SubscriptionDTO } from './dto/subscriber.dto';
import { Subscriber } from './subscriber.entity';

@Injectable()
export class SubscriberService {
  constructor(
    @InjectRepository(Subscriber) private subRepository: Repository<Subscriber>,
    @Inject('WEB_PUSH') private webPush,
  ) {}

  /**
   * CREATES SUBSCRIPTION
   * SAVES TO DATABASE
   *
   */
  createSubscription(sub: SubscriptionDTO): string {
    const newSub = this.subRepository.create({
      endpoint: sub.endpoint,
      authkey: sub.keys.auth,
      p256dhkey: sub.keys.p256dh,
    });

    let subResponse = 'Thanks for Subscribing!';

    this.subRepository.save(newSub).then(
      (res) => {
        subResponse = 'Thanks for Subscribing!';
      },
      (err) => {
        subResponse =
          err.errno == 1062
            ? 'You are already subscribed!'
            : 'Failed to make your subscription!';
      },
    );

    return subResponse;
  }

  /**
   * LISTENING TO post.created EVENT
   *
   */
  @OnEvent('post.created')
  async handlePostCreatedEvent(event: PostCreatedEvent) {
    /*
     *GETS ALL SUBSCRIBERS
     */
    const subscribers: Subscriber[] = await this.subRepository.find();

    subscribers.forEach((sub) => {
      /*
       *LOOPING THROUGH EACH SUBSCRIBER
       */
      const payload = JSON.stringify({
        title: event.title,
        message: event.message,
      });

      if (sub.authkey === '' || sub.endpoint === '' || sub.p256dhkey === '') {
        /*
         *IF ANY FIELD IS NULL
         */

        console.log(`Subcriber ${sub.id} Should be deleted!`);

        this.subRepository.remove(sub).then(
          (res) => console.log('Deleted'),
          (err) => console.log(err),
        );
      } else {
        console.log({
          endpoint: sub.endpoint,
          expirationTime: null,
          keys: { p256dh: sub.p256dhkey, auth: sub.authkey },
        });
        /*
         *SENDING PUSH NOTIFICATION
         */
        this.webPush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dhkey, auth: sub.authkey },
            },
            payload,
          )
          .then((res) => {
            console.log('done');
          })
          .catch((error) => {
            if (error.statusCode == 410) {
              console.log(error.body);
            }
          });
      }
    });
  }
}
