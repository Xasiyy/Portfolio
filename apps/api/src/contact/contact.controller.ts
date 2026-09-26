import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@Post()
	@Throttle({ default: { limit: 3, ttl: 3_600_000 } })
	async create(@Body() dto: CreateContactDto) {
		await this.contactService.create(dto);
		return { ok: true };
	}
}
