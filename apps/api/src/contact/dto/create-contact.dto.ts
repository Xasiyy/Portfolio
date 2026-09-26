import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateContactDto {

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	firstName: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	lastName: string;

	@IsEmail()
	@MaxLength(254)
	email: string;
	
	@IsString()
	@IsNotEmpty()
	@MaxLength(50000)
	message:string;

	@IsOptional()
	@IsString()
	website?: string;

}