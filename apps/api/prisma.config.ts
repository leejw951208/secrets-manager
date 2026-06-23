// NODE_ENV 별 env 파일을 우선 로드한다(예시는 단일 .env.example).
import { config as loadEnv } from "dotenv"
import { defineConfig, env } from "prisma/config"

const NODE_ENV = process.env.NODE_ENV ?? "development"
loadEnv({ path: `.env.${NODE_ENV}.local` })
loadEnv({ path: `.env.${NODE_ENV}` })
loadEnv({ path: ".env.local" })
loadEnv()

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
})
