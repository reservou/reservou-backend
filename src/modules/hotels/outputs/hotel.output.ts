import { ApiProperty } from "@nestjs/swagger";
import { HotelCategory } from "../types";

export class HotelInfo {
	@ApiProperty({ description: "ID do hotel", example: "12345" })
	id!: string;

	@ApiProperty({ description: "Nome do hotel", example: "Hotel das Flores" })
	name!: string;

	@ApiProperty({
		description: "Descrição do hotel",
		example: "Um hotel aconchegante no centro da cidade.",
	})
	description!: string;

	@ApiProperty({
		description: "Lista de comodidades do hotel",
		example: ["Wi-Fi", "Piscina", "Estacionamento"],
	})
	amenities!: string[];

	@ApiProperty({
		description: "Slug do hotel",
		example: "hotel-das-flores",
	})
	slug!: string;

	@ApiProperty({
		description: "Categoria do hotel",
		enum: HotelCategory,
		example: HotelCategory.LODGE,
	})
	category!: HotelCategory;

	@ApiProperty({
		description: "Fotos do hotel",
		example: [
			{
				fileKey: "dkh3pyj4eu39ndwplrda7mdp.png",
				alt: "Outside view of the hotel, palm trees at the entrance, pool and sun loungers",
				url: "https://example.com/photos/dkh3pyj4eu39ndwplrda7mdp.png",
			},
		],
	})
	photos!: {
		fileKey: string;
		alt: string;
		url: string;
	}[];

	@ApiProperty({
		description: "Banner do hotel",
		example: null,
	})
	banner!: {
		url: string;
		fileKey: string;
		alt: string;
	} | null;

	@ApiProperty({
		description: "Informações de contato do hotel",
		example: {
			email: "contato@hotel.com",
			phone: "+55 11 98765-4321",
			website: "https://www.hotel.com",
		},
	})
	contact!: {
		email: string;
		phone: string;
		website?: string;
	};

	@ApiProperty({
		description: "Localização do hotel",
		example: {
			address: "Rua das Flores, 123",
			city: "São Paulo",
			state: "SP",
			country: "Brasil",
			zipCode: "12345-678",
		},
	})
	location!: {
		address: string;
		city: string;
		state: string;
		country: string;
		zipCode: string;
	};
}
