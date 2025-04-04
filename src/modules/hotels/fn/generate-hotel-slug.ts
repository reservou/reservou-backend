import { Injectable } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import { HotelsRepository } from "../hotels.repository";
import { HotelCategory } from "../types";

export type GenerateHotelSlugInput = {
	name: string;
	category: HotelCategory;
};

type SlugGenerationStrategy = (params: {
	name: string;
	category: HotelCategory;
}) => string;

@Injectable()
export class GenerateHotelSlug {
	constructor(private readonly hotelsRepo: HotelsRepository) {}

	private strategies: SlugGenerationStrategy[] = [
		({ name }) => name.toLowerCase().replace(/\s+/g, "-"),
		({ name, category }) =>
			`${name.toLowerCase().replace(/\s+/g, "-")}-${category.toLowerCase()}`,
	];

	async execute({ category, name }: GenerateHotelSlugInput): Promise<string> {
		for (const strategy of this.strategies) {
			const slug = strategy({ name, category });

			if (this.isValidSlug(slug) && !(await this.isUsedSlug(slug))) {
				return slug;
			}
		}

		/**
		 * @todo - Implement a better fallback strategy
		 */
		const fallbackSlug = `${name.toLowerCase().replace(/\s+/g, "-")}-${createId()}`;
		return fallbackSlug;
	}

	private isValidSlug(slug: string): boolean {
		const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
		return regex.test(slug);
	}

	private isUsedSlug(slug: string): Promise<boolean> {
		return this.hotelsRepo.findBySlug(slug).then((hotel) => !!hotel);
	}
}
