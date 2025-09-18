import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  CacheInterceptor,
  CacheKey,
  CacheClean,
  CacheCleanInterceptor,
} from '../../../lib';

@Controller()
export class CacheCleanController {
  private timeline = ['Initial post'];
  private counter = 0;

  @Get('timeline')
  @CacheKey('timeline')
  @UseInterceptors(CacheInterceptor)
  getTimeline() {
    this.counter++;
    return {
      timeline: this.timeline,
      timestamp: Date.now(),
      counter: this.counter,
    };
  }

  @Post('posts')
  @CacheClean('timeline')
  @UseInterceptors(CacheCleanInterceptor)
  createPost(@Body() postData: { title?: string }) {
    if (!postData.title) {
      throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
    }

    this.timeline.push(postData.title);
    return {
      success: true,
      post: postData,
    };
  }
}
