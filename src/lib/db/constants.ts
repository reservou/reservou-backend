export const USERS_COLLECTION_KEY = "users";
export const HOTELS_COLLECTION_KEY = "hotels";
export const ROOMS_COLLECTION_KEY = "rooms";
export const AMENITIES_COLLECTION_KEY = "amenities";
export const RESERVATIONS_COLLECTION_KEY = "reservations";
export const CONFIRMATIONS_COLLECTION_KEY = "confirmations";

export const COLLECTIONS = [
	USERS_COLLECTION_KEY,
	HOTELS_COLLECTION_KEY,
	ROOMS_COLLECTION_KEY,
	AMENITIES_COLLECTION_KEY,
	RESERVATIONS_COLLECTION_KEY,
	CONFIRMATIONS_COLLECTION_KEY,
] as const;
export type CollectionKey = (typeof COLLECTIONS)[number];
