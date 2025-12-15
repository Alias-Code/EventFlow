import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, ProcessPaymentDto, RefundPaymentDto } from './dto';

interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller()
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      status: 'ok',
      service: 'payment-service',
      at: new Date().toISOString(),
    };
  }
}

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement' })
  @ApiResponse({ status: 201, description: 'Paiement créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async createPayment(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createPayment(req.user.userId, dto);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Traiter un paiement (confirmation)' })
  @ApiResponse({ status: 200, description: 'Paiement traité' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 400, description: 'Paiement ne peut pas être traité' })
  async processPayment(
    @Param('id') id: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentService.processPayment(id, dto);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Rembourser un paiement' })
  @ApiResponse({ status: 200, description: 'Paiement remboursé' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 400, description: 'Paiement ne peut pas être remboursé' })
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentService.refundPayment(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les paiements (admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste des paiements' })
  async getAllPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentService.getAllPayments(
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Lister mes paiements' })
  @ApiResponse({ status: 200, description: 'Liste des paiements de l\'utilisateur' })
  async getMyPayments(@Request() req: AuthenticatedRequest) {
    return this.paymentService.getPaymentsByUser(req.user.userId);
  }

  @Get('ticket/:ticketId')
  @ApiOperation({ summary: 'Lister les paiements pour un ticket' })
  @ApiResponse({ status: 200, description: 'Liste des paiements pour le ticket' })
  async getPaymentsByTicket(@Param('ticketId') ticketId: string) {
    return this.paymentService.getPaymentsByTicket(ticketId);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Lister les paiements pour un événement' })
  @ApiResponse({ status: 200, description: 'Liste des paiements pour l\'événement' })
  async getPaymentsByEvent(@Param('eventId') eventId: string) {
    return this.paymentService.getPaymentsByEvent(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par ID' })
  @ApiResponse({ status: 200, description: 'Détails du paiement' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé' })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }
}
