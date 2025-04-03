import { ConflictError } from "@/lib/errors";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { UsersRepository } from "../users.repository";
import { CheckUserUniqueConstraints } from "./check-user-unique-constraints";

describe(CheckUserUniqueConstraints.name, () => {
	let checkUserUniqueConstraints: CheckUserUniqueConstraints;
	let usersRepository: {
		findByEmail: ReturnType<typeof vi.fn>;
	};

	beforeAll(() => {
		usersRepository = {
			findByEmail: vi.fn(),
		};

		checkUserUniqueConstraints = new CheckUserUniqueConstraints(
			usersRepository as unknown as UsersRepository,
		);
	});

	it("should throw ConflictError if email is already in use", async () => {
		usersRepository.findByEmail.mockResolvedValueOnce({
			id: "1",
			email: "test@example.com",
			name: "Test",
			plan: "BASIC",
		});

		await expect(
			checkUserUniqueConstraints.execute({ email: "test@example.com" }),
		).rejects.toThrow(ConflictError);
	});

	it("should not throw if email is unique", async () => {
		usersRepository.findByEmail.mockResolvedValueOnce(null);

		await expect(
			checkUserUniqueConstraints.execute({ email: "unique@example.com" }),
		).resolves.not.toThrow();
	});
});
