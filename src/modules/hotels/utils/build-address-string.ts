export function buildAddressString({
	address,
	city,
	state,
	country,
	zipCode,
}: {
	address: string;
	city: string;
	state: string;
	country: string;
	zipCode?: string;
}): string {
	const parts = [address, city, state, country];
	if (zipCode) parts.push(zipCode);
	return parts.filter(Boolean).join(", ").trim();
}
