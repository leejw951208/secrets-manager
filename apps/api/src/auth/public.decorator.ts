// 전역 세션 가드를 우회하는 라우트를 표시하는 데코레이터. /auth/* 의 공개 엔드포인트에 부착한다.
import { SetMetadata } from "@nestjs/common"

export const PUBLIC_KEY = "auth:public"

export const Public = () => SetMetadata(PUBLIC_KEY, true)
