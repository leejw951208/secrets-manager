// 전역 세션 가드. @Public() 표시 라우트는 통과시키고, 그 외 모든 라우트는 유효 세션 쿠키를 요구한다.
// store(/sites·/categories·/secrets·/search·/store/*) 보호와 /auth 의 일부 보호 라우트를 한 곳에서 관장한다.
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Request } from "express"
import { SessionService } from "./session.service"
import { SESSION_COOKIE, readCookie } from "./auth-cookies"
import { AUTH_ERRORS } from "./auth.types"
import { PUBLIC_KEY } from "./public.decorator"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly session: SessionService,
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (isPublic) return true

        const req = context.switchToHttp().getRequest<Request>()
        const token = readCookie(req, SESSION_COOKIE)
        if (!this.session.isValid(token)) {
            throw new UnauthorizedException({
                code: AUTH_ERRORS.SESSION_REQUIRED,
                message: "인증 세션이 필요합니다.",
            })
        }
        return true
    }
}
