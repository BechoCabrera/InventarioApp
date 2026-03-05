import { Component, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import html2pdf from 'html2pdf.js';

import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoice-pdf',
  standalone: true,
  templateUrl: './invoice-pdf.component.html',
  styleUrls: ['./invoice-pdf.component.scss'],
  imports: [CurrencyPipe, DatePipe],
})
export class InvoicePdfComponent implements AfterViewInit {
  @Input() invoice: any;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @Input() autoDownload = false;

  // Helpers para mostrar montos en positivo y manejar descuentos
  getLineTotal(item: any): number {
    if (!item) return 0;
    const base = item.totalPrice ?? (item.unitPrice || 0) * (item.quantity || 0);
    return Math.abs(base);
  }

  get subtotalAmount(): number {
    const value = this.invoice?.subtotalAmount ?? 0;
    return Math.abs(value);
  }

  get taxAmount(): number {
    const value = this.invoice?.taxAmount ?? 0;
    return Math.abs(value);
  }

  get totalAmount(): number {
    const value = this.invoice?.totalAmount ?? 0;
    return Math.abs(value);
  }

  ngAfterViewInit(): void {
    if (this.autoDownload) {
      // Esperar un momento para que el DOM se renderice antes de generar el PDF
      setTimeout(() => this.download(), 100);
    }
  }

  download(): void {
    const element = this.pdfContent.nativeElement;
    const height = element.offsetHeight * 0.264583; // px to mm

    const options = {
      filename: `factura-${this.invoice?.invoiceNumber || 'N/A'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [58, height], orientation: 'portrait' },
    };

    html2pdf().from(element).set(options).save();
  }
}
