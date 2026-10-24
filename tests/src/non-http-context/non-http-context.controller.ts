import { Controller } from '@nestjs/common';
import { CacheKey } from '../../../lib/index.js';

@Controller()
export class NonHttpContextController {
  counter = 0;

  @CacheKey('non-http-context')
  getNumber() {
    return this.counter++;
  }
}
