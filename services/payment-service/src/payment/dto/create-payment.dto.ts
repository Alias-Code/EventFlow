import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodDto {
  CARD = 'CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  FREE = 'FREE',
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID du ticket à payer' })
  @IsString()
  ticketId!: string;

  @ApiProperty({ description: 'ID de l\'événement' })
  @IsString()
  eventId!: string;

  @ApiProperty({ description: 'Montant du paiement', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ description: 'Devise du paiement', default: 'EUR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Méthode de paiement', enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod!: PaymentMethodDto;

  @ApiPropertyOptional({ description: 'Métadonnées additionnelles' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
