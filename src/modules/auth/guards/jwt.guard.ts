import { JwtService } from "@/modules/jwt/jwt.service";
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
	CURRENT_USER_KEY,
	CurrentUser,
} from "../decorators/get-current-user.decorator";
import { Public } from "../decorators/public.decorator";
import { AuthorizationTokenPayload } from "../types";
import { extractTokenFromHeader } from "../utils/extract-token-from-header";

@Injectable()
export class JwtGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublicRoute = this.reflector.getAllAndOverride(Public, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublicRoute) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = extractTokenFromHeader(request);

		if (token == null) {
			throw new UnauthorizedException();
		}

		try {
			const payload = this.jwtService.verify<AuthorizationTokenPayload>(token);
			request[CURRENT_USER_KEY] = {
				id: payload.uid,
			} as CurrentUser;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}
}
