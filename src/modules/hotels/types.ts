export enum GeolocationType {
	POINT = "Point",
}

export enum HotelCategory {
	HOTEL = "Hotel",
	RESORT = "Resort",
	BOUTIQUE = "Boutique Hotel",
	INN = "Inn",
	GUESTHOUSE = "Guesthouse",
	LODGE = "Lodge",
	CHALET = "Chalet",
	HOSTEL = "Hostel",
	MOTEL = "Motel",
	BED_AND_BREAKFAST = "Bed & Breakfast",
	ECO_LODGE = "Eco Lodge",
	GLAMPING = "Glamping",
}

export class Hotel {
	id!: string;
	name!: string;
	slug!: string;
	description!: string;
	location!: {
		address: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};
	contact!: {
		email: string;
		phone: string;
		website?: string;
	};
	category!: HotelCategory;
	banner!: {
		url: string;
		fileKey: string;
		alt: string;
	} | null;
	photos!: {
		fileKey: string;
		alt: string;
		url: string;
	}[];
	amenities!: string[];
}
