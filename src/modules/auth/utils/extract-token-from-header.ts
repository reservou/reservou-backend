import { FastifyRequest } from "fastify";
import { AUTHORIZATION_COOKIE_NAME } from "../auth.constants";

export function extractTokenFromHeader(request: FastifyRequest): string | null {
	const [type, token] =
		request.cookies[AUTHORIZATION_COOKIE_NAME]?.split(" ") ?? [];
	return type === "Bearer" ? token : null;
}
