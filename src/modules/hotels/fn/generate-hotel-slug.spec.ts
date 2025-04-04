import { HotelsRepository } from "../hotels.repository";
import { HotelCategory } from "../types";
import { GenerateHotelSlug } from "./generate-hotel-slug";

describe("GenerateHotelSlug", () => {
	let generateHotelSlug: GenerateHotelSlug;
	let hotelsRepo: Partial<HotelsRepository>;

	beforeEach(() => {
		hotelsRepo = {
			findBySlug: vi.fn(),
		};
		generateHotelSlug = new GenerateHotelSlug(hotelsRepo as HotelsRepository);
	});

	it("should generate a valid slug using the first strategy", async () => {
		hotelsRepo.findBySlug = vi.fn().mockResolvedValue(null);
		const input = { name: "Test Hotel", category: HotelCategory.INN };

		const slug = await generateHotelSlug.execute(input);

		expect(slug).toBe("test-hotel");
		expect(hotelsRepo.findBySlug).toHaveBeenCalledWith("test-hotel");
	});

	it("should generate a valid slug using the second strategy if the first one is taken", async () => {
		hotelsRepo.findBySlug = vi
			.fn()
			.mockResolvedValueOnce({})
			.mockResolvedValueOnce(null);
		const input = { name: "Test Hotel", category: HotelCategory.INN };

		const slug = await generateHotelSlug.execute(input);

		expect(slug).toBe("test-hotel-inn");
		expect(hotelsRepo.findBySlug).toHaveBeenCalledWith("test-hotel");
		expect(hotelsRepo.findBySlug).toHaveBeenCalledWith("test-hotel-inn");
	});

	it("should generate a fallback slug if all strategies fail", async () => {
		hotelsRepo.findBySlug = vi.fn().mockResolvedValue({});
		const input = { name: "Test Hotel", category: HotelCategory.INN };

		const slug = await generateHotelSlug.execute(input);

		expect(slug).toMatch(/^test-hotel-[a-z0-9]+$/);
		expect(hotelsRepo.findBySlug).toHaveBeenCalledWith("test-hotel");
		expect(hotelsRepo.findBySlug).toHaveBeenCalledWith("test-hotel-inn");
	});
});
