import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-invoice-pos-pdf',
  standalone: true,
  templateUrl: './invoice-pos-pdf.component.html',
  styleUrls: ['./invoice-pos-pdf.component.scss'],
  imports: [CommonModule],
})
export class InvoicePosPdfComponent {
  @Input() invoice: any;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @Output() afterDownload = new EventEmitter<void>();

  download(): void {
    const element = this.pdfContent.nativeElement;
    const height = element.offsetHeight * 0.264583;

    const options = {
      filename: `factura-pos-${this.invoice?.invoiceNumber || 'N/A'}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [58, height], orientation: 'portrait' },
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        this.afterDownload.emit(); // 👈 Cierra el modal
      });
  }
}
