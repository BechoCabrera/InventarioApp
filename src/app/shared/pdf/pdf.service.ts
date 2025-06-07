import { Injectable } from '@angular/core';
import html2pdf from 'html2pdf.js';
@Injectable({ providedIn: 'root' })
export class PdfService {
  export(element: HTMLElement, filename: string): void {
    html2pdf()
      .from(element)
      .set({
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  }
}
