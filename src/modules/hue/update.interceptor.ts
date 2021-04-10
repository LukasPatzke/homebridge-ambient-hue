import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HueService } from './hue.service';

/**
 * Interceptor to run the hue update after execution
 */
@Injectable()
export class UpdateInterceptor implements NestInterceptor {
  constructor(private readonly hueService: HueService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(tap(() => this.hueService.update()));
  }
}
