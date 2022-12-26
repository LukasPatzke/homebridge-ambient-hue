import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HueService } from './hue.service';

/**
 * Interceptor to run the hue update after execution
 */
@Injectable()
export class UpdateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UpdateInterceptor.name);

  constructor(private readonly hueService: HueService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    return next.handle().pipe(tap(async () => {
      this.logger.log(`Running update for intercepted route ${request.url}`);
      this.hueService.update();
    }));
  }
}
