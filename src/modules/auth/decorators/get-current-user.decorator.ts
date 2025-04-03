import { InternalServerError } from "@/lib/errors";
import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const CURRENT_USER_KEY = "current_user";

export type CurrentUser = {
	id: string;
};

export const GetCurrentUser = createParamDecorator(
	(data: unknown, context: ExecutionContext): CurrentUser => {
		const request = context.switchToHttp().getRequest();

		const user = request[CURRENT_USER_KEY] as CurrentUser | undefined;

		if (!user) {
			throw new InternalServerError(
				`${GetCurrentUser.name} decorator being used in public routes`,
				{
					url: request.url,
				},
			);
		}

		return user;
	},
);
