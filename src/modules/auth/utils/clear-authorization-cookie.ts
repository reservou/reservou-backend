import { FastifyReply } from "fastify";
import { AUTHORIZATION_COOKIE_NAME } from "../auth.constants";

export function clearAuthorizationCookie(reply: FastifyReply) {
	reply.clearCookie(AUTHORIZATION_COOKIE_NAME, { httpOnly: true });
}
