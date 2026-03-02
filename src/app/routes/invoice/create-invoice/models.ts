// Tipos para Facturación y Promociones

export interface InvoiceCreateDto {
  invoiceNumber: string;
  clientId?: string;
  issueDate: string;
  dueDate: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  entitiId?: string;
  nameClientDraft?: string;
  nitClientDraft?: string;
  details: InvoiceDetailCreateDto[];
  discountAmount: number;
  promotionApplied?: string;
}

export interface InvoiceDetailDto {
  invoiceDetailId: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
}

export interface InvoiceDetailCreateDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceDto {
  invoiceId: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  entitiName?: string;
  nameClientDraft?: string;
  nitClientDraft?: string;
  entitiId?: string;
  isCancelled: boolean;
  details: InvoiceDetailDto[];
  discountAmount: number;
  promotionApplied?: string;
}

export interface PromotionCalculationRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PromotionCalculationResponse {
  discountAmount: number;
  promotionApplied: string;
}

// Modelo para crear promociones desde el frontend
export interface PromotionCreateDto {
  name: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  productIds: string[];
}
