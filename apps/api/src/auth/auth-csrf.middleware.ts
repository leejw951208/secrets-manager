// 인증 쓰기 요청 CSRF 정책. Origin 화이트리스트 + 커스텀 헤더 X-Vault-Request: 1 을 요구한다.
// 세션 쿠키는 SameSite=Strict 라 cross-site 전송이 차단되므로 쿠키 보유는 별도로 강제하지 않는다.
import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common"
import type { NextFunction, Request, Response } from "express"
import { AUTH_ERRORS, EXPECTED_ORIGINS } from "./auth.types"

const ALLOWED_ORIGINS = new Set(EXPECTED_ORIGINS)
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

@Injectable()
export class AuthCsrfMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction): void {
        if (SAFE_METHODS.has(req.method.toUpperCase())) {
            next()
            return
        }

        const origin = (req.headers.origin as string | undefined) ?? ""
        if (!ALLOWED_ORIGINS.has(origin)) {
            throw new ForbiddenException({
                code: AUTH_ERRORS.CSRF_INVALID,
                message: "Origin 이 허용되지 않습니다.",
            })
        }

        if (req.headers["x-vault-request"] !== "1") {
            throw new ForbiddenException({
                code: AUTH_ERRORS.CSRF_INVALID,
                message: "X-Vault-Request 헤더가 필요합니다.",
            })
        }

        next()
    }
}
