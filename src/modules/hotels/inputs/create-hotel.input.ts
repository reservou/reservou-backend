import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	ValidateNested,
} from "class-validator";
import { HotelCategory } from "../types";

class LocationDto {
	@ApiProperty({
		description: "Endereço do hotel",
		example: "Rua das Flores, 123",
	})
	@IsNotEmpty({ message: "O endereço é obrigatório." })
	@IsString()
	@MinLength(5, { message: "O endereço deve ter pelo menos 5 caracteres." })
	@MaxLength(255, { message: "O endereço deve ter no máximo 255 caracteres." })
	address!: string;

	@ApiProperty({ description: "Cidade do hotel", example: "São Paulo" })
	@IsNotEmpty({ message: "A cidade é obrigatória." })
	@IsString()
	@MinLength(2, { message: "A cidade deve ter pelo menos 2 caracteres." })
	@MaxLength(100, { message: "A cidade deve ter no máximo 100 caracteres." })
	city!: string;

	@ApiProperty({ description: "Estado do hotel", example: "SP" })
	@IsNotEmpty({ message: "O estado é obrigatório." })
	@IsString()
	@MinLength(2, { message: "O estado deve ter pelo menos 2 caracteres." })
	@MaxLength(100, { message: "O estado deve ter no máximo 100 caracteres." })
	state!: string;

	@ApiProperty({ description: "País do hotel", example: "Brasil" })
	@IsNotEmpty({ message: "O país é obrigatório." })
	@IsString()
	@MinLength(2, { message: "O país deve ter pelo menos 2 caracteres." })
	@MaxLength(100, { message: "O país deve ter no máximo 100 caracteres." })
	country!: string;

	@ApiProperty({ description: "CEP do hotel", example: "12345-678" })
	@IsNotEmpty({ message: "O CEP é obrigatório." })
	@IsString()
	@MinLength(8, { message: "O CEP deve ter pelo menos 8 caracteres." })
	@MaxLength(20, { message: "O CEP deve ter no máximo 20 caracteres." })
	zipCode!: string;
}

class ContactDto {
	@ApiProperty({
		description: "E-mail de contato do hotel",
		example: "contato@hotel.com",
	})
	@IsNotEmpty({ message: "O e-mail é obrigatório." })
	@IsEmail({}, { message: "O e-mail deve ser válido." })
	email!: string;

	@ApiProperty({
		description: "Telefone de contato do hotel",
		example: "+55 11 98765-4321",
	})
	@IsNotEmpty({ message: "O telefone é obrigatório." })
	@IsString()
	phone!: string;

	@ApiProperty({
		description: "Website do hotel (opcional)",
		example: "https://www.hotel.com",
		required: false,
	})
	@IsOptional()
	@IsString()
	website?: string;
}

export class CreateHotelRequestDto {
	@ApiProperty({ description: "Nome do hotel", example: "Hotel das Flores" })
	@IsNotEmpty({ message: "O nome é obrigatório." })
	@IsString()
	@MinLength(3, {
		message: "O nome deve ter pelo menos 3 caracteres.",
	})
	@MaxLength(100, {
		message: "O nome deve ter no máximo 100 caracteres.",
	})
	name!: string;

	@ApiProperty({
		description: "Descrição do hotel",
		example: "Um hotel aconchegante no centro da cidade.",
	})
	@IsNotEmpty({ message: "A descrição é obrigatória." })
	@IsString()
	@MinLength(10, {
		message: "A descrição deve ter pelo menos 10 caracteres.",
	})
	@MaxLength(1000, {
		message: "A descrição deve ter no máximo 1000 caracteres.",
	})
	description!: string;

	@ApiProperty({
		description: "Lista de comodidades do hotel",
		example: ["Wi-Fi", "Piscina", "Estacionamento"],
	})
	@IsArray({ message: "As comodidades devem ser uma lista." })
	@IsString({ each: true, message: "Cada comodidade deve ser uma string." })
	amenities!: string[];

	@ApiProperty({ description: "Localização do hotel" })
	@ValidateNested()
	@Type(() => LocationDto)
	location!: LocationDto;

	@ApiProperty({ description: "Informações de contato do hotel" })
	@ValidateNested()
	@Type(() => ContactDto)
	contact!: ContactDto;

	@ApiProperty({ description: "Categoria do hotel", enum: HotelCategory })
	@IsNotEmpty({ message: "A categoria é obrigatória." })
	@IsEnum(HotelCategory, { message: "A categoria deve ser válida." })
	category!: HotelCategory;
}
