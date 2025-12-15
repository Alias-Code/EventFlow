import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID de la transaction du processeur de paiement' })
  @IsString()
  transactionId!: string;

  @ApiPropertyOptional({ description: 'Métadonnées additionnelles du processeur' })
  @IsOptional()
  processorMetadata?: Record<string, unknown>;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Raison du remboursement' })
  @IsString()
  reason!: string;
}
