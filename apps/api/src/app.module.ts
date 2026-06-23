// NestJS 루트 모듈. 도메인 모듈을 조립하고 전역 Guard를 적용한다.
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { PrismaModule } from "./prisma/prisma.module"
import { VaultModule } from "./vault/vault.module"
import { PinModule } from "./pin/pin.module"
import { StoreModule } from "./store/store.module"
import { AuthGuard } from "./auth/auth.guard"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            // NODE_ENV 별 파일을 우선 로드한다(개발=development, 운영=production).
            // 이미 설정된 환경 변수(컨테이너 주입 등)는 덮어쓰지 않는다.
            envFilePath: [
                `.env.${process.env.NODE_ENV ?? "development"}.local`,
                `.env.${process.env.NODE_ENV ?? "development"}`,
                ".env.local",
                ".env",
            ],
        }),
        PrismaModule,
        VaultModule,
        PinModule,
        StoreModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
