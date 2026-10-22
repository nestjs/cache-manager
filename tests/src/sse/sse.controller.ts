import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller()
export class SseController {
  counter = 0;

  @Sse('events')
  events(): Observable<MessageEvent> {
    const run = this.counter++;
    return of(1, 2, 3).pipe(map(event => ({ data: `${run}-${event}` })));
  }
}
