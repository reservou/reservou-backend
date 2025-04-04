import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { getEnv } from "../../env";

export interface Geocode {
	lat: number;
	lng: number;
	formattedAddress: string;
}

export interface ZipCodeDetails {
	zipCode: string;
	city: string;
	state: string;
	country: string;
	street: string;
}

@Injectable()
export class MapsService {
	private readonly gmapsApiKey = process.env.GMAPS_API_KEY;

	async geocodeAddress(address: string): Promise<Geocode> {
		if (getEnv("NODE_ENV") === "test") {
			return {
				lat: -23.55052,
				lng: -46.633308,
				formattedAddress: "Mocked Address, São Paulo, SP, Brazil",
			};
		}

		const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.gmapsApiKey}`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new InternalServerErrorException(
				"Failed to fetch geocode from Google Maps API",
				{
					cause: new Error(response.statusText),
				},
			);
		}

		const data = await response.json();

		if (data.status !== "OK" || !data.results.length) {
			throw new NotFoundException(
				`Não conseguimos encontrar esse endereço: ${address}`,
			);
		}

		const { lat, lng } = data.results[0].geometry.location;
		const formattedAddress = data.results[0].formatted_address;

		return { lat, lng, formattedAddress };
	}

	async getZipCodeDetails(zipCode: string): Promise<ZipCodeDetails> {
		if (getEnv("NODE_ENV") === "test") {
			return {
				zipCode: "00000-000",
				city: "Mocked City",
				state: "Mocked State",
				country: "Brasil",
				street: "Mocked Street",
			};
		}

		const cleanZipCode = zipCode.replace(/\D/g, "");
		const url = `https://viacep.com.br/ws/${cleanZipCode}/json/`;

		const response = await fetch(url);
		if (!response.ok) {
			throw new NotFoundException("Erro ao buscar detalhes do CEP");
		}

		const data = await response.json();

		if ("erro" in data) {
			throw new NotFoundException("CEP inválido ou não encontrado");
		}

		return {
			zipCode: data.cep,
			city: data.localidade,
			state: data.uf,
			country: "Brasil",
			street: data.logradouro,
		};
	}
}
