import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
    private readonly logger = new Logger(ContactService.name);
    private readonly transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(Contact)
        private readonly contactRepository: Repository<Contact>,
        private readonly config: ConfigService,
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.config.get<string>('MAIL_USER'),
                pass: this.config.get<string>('MAIL_PASS'),
            },
        });
    }

    async create(dto: CreateContactDto): Promise<void> {
        if (dto.website)
            return;

        const { website, ...data } = dto;
        await this.contactRepository.save(this.contactRepository.create(data));

        try {
            await this.transporter.sendMail({
                from: `"Portfolio <${this.config.get<string>('MAIL_USER')}`,
                to: this.config.get<string>('MAIL_TO'),
                replyTo: data.email,
                subject: `[Portfolio] Neew message from ${data.firstName}`,
                text: 
                    `Message send via the portfolio contact form.\n\n` + `Fom : ${data.firstName} ${data.lastName} <${data.email}>\n\n` + `${data.message}`, 
            });
        }
        catch (err) {
            this.logger.error('Failed to send contact email', err as Error);
            throw new InternalServerErrorException("sending the message failed");
        }
    }
}