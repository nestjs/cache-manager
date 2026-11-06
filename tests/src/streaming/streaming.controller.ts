import { Controller, Get } from '@nestjs/common';
import { Readable } from 'stream';

@Controller()
export class StreamingController {
  @Get('generator')
  async *generator() {
    yield 'chunk';
  }

  @Get('readable-stream')
  readableStream() {
    return new Blob(['chunk']).stream();
  }

  @Get('node-readable')
  nodeReadable() {
    return Readable.from(['chunk']);
  }

  @Get('response')
  response() {
    return new Response('chunk');
  }

  @Get('json')
  json() {
    return { value: 'chunk' };
  }
}
