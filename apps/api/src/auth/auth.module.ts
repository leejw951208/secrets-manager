// auth 도메인 모듈. passkey 컨트롤러·서비스·챌린지·세션·백오프·CSRF 미들웨어·전역 세션 가드를 조립한다.
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { PrismaModule } from "../prisma/prisma.module"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { ChallengeService } from "./challenge.service"
import { SessionService } from "./session.service"
import { BackoffService } from "./backoff.service"
import { AuthGuard } from "./auth.guard"
import { AuthCsrfMiddleware } from "./auth-csrf.middleware"

@Module({
    imports: [PrismaModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        ChallengeService,
        SessionService,
        BackoffService,
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        // AuthController 단위로 적용해 모든 auth 라우트(다단계 포함)를 자동 매칭한다.
        consumer.apply(AuthCsrfMiddleware).forRoutes(AuthController)
    }
}
