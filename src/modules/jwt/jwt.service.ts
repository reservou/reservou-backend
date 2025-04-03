import { Injectable } from "@nestjs/common";

import { getEnv } from "@/env";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtService {
	private readonly secret: string;

	constructor() {
		this.secret = getEnv("JWT_SECRET");
	}

	sign(payload: Payload): string {
		return jwt.sign(payload, this.secret);
	}

	verify<T>(token: string, props?: (keyof T)[]): T {
		const payload = jwt.verify(token, this.secret) as Record<string, unknown>;

		if (props) {
			for (const key in props) {
				if (!payload[key]) {
					throw new jwt.JsonWebTokenError("Invalid JWT");
				}
			}
		}

		return payload as T;
	}
}

type Payload = {
	[key: string]: unknown;
};
