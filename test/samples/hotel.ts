import { CreateHotelInput } from "@/modules/hotels/fn/create-hotel";
import { HotelCategory } from "@/modules/hotels/types";

export const getSampleCreateHotelInput = (
	override: Partial<CreateHotelInput> = {},
): CreateHotelInput => ({
	name: "Avocado Inn",
	description: "A cozy hotel with a focus on sustainability and comfort.",
	amenities: ["Free WiFi", "Breakfast included", "Swimming pool"],
	location: {
		address: "123 Avocado Street",
		city: "Greenfield",
		state: "California",
		country: "USA",
		zipCode: "90210",
	},
	contact: {
		email: "contact@avocadoinn.com",
		phone: "+1-555-123-4567",
		website: "https://avocadoinn.com",
	},
	category: HotelCategory.INN,
	...override,
});
