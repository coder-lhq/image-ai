import { Context, Hono } from "hono";
import { AuthConfig, initAuthConfig } from "@hono/auth-js"
import { handle } from "hono/vercel";

import images from './images'
import ai from './ai'
import users from './users'
import test from './test'
import projects from './projects'
import authConfig from "@/auth.config";

export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
    return {
        // TODO: Need fix env not read question.
        secret: c.env?.AUTH_SECRET || process.env.AUTH_SECRET,
        ...authConfig as any
    }
}

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig))
const routes = app
    .route("/ai", ai)
    .route("/projects", projects)
    .route("/test", test)
    .route("/users", users)
    .route("/images", images)

export const GET = handle(app);
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes;