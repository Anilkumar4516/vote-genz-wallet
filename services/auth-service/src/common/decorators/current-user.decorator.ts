import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CitizenJwtPayload } from '../../modules/session/session.service';

export const CurrentUser = createParamDecorator(
  (data: keyof CitizenJwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
