import { FastifyReply } from "fastify";
import { AUTHORIZATION_COOKIE_NAME } from "../auth.constants";

export function setAuthorizationCookie(reply: FastifyReply, token: string) {
	reply.setCookie(AUTHORIZATION_COOKIE_NAME, `Bearer ${token}`, {
		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	});
}
