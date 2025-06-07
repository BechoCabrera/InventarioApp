import { Component, ElementRef, Input, ViewChild, AfterViewInit } from '@angular/core';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-invoice-pdf',
  standalone: true,
  templateUrl: './invoice-pdf.component.html',
  styleUrls: ['./invoice-pdf.component.scss'],
})
export class InvoicePdfComponent implements AfterViewInit {
  @Input() invoice: any;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @Input() autoDownload = false;

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
