import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import html2pdf from 'html2pdf.js';
import { EntitiConfigData } from 'app/routes/entiti-config/entiti-config.model';
import { EntitiConfigService } from 'app/routes/entiti-config/entiti-config.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component';
import { Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-invoice-pos-pdf',
  standalone: true,
  templateUrl: './invoice-pos-pdf.component.html',
  styleUrls: ['./invoice-pos-pdf.component.scss'],
  imports: [CommonModule, MatProgressSpinnerModule, LoadingOverlayComponent],
})
export class InvoicePosPdfComponent {
  @Input() invoice: any;
  entitiConfig: EntitiConfigData | null = null;
  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @Output() afterDownload = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  isLoading = false;

  isEntitiLoading = true;
  constructor(private entitiService: EntitiConfigService,
  @Optional() private dialogRef?: MatDialogRef<any>
  ) {}
  ngOnInit(): void {
    this.getDataEntiti(); // 👈 esto debe estar aquí
  }

  download(): void {
  this.isLoading = true;

  setTimeout(() => {
    const element = this.pdfContent.nativeElement;

    // 👇 Calcula altura dinámica en mm (1px = 0.264583mm)
    const height = element.scrollHeight * 0.264583;

    const options = {
      margin: 0, // ⚠️ esto debe quedarse en 0 para evitar hoja 2
      filename: `factura-pos-${this.invoice?.invoiceNumber || 'N/A'}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: {
        unit: 'mm',
        format: [58, height],
        orientation: 'portrait',
      },
      pagebreak: { mode: ['avoid'] }
    };

    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        this.isLoading = false;
        this.afterDownload.emit();
      });
  }, 100);
}


  onClose(): void {
  if (this.dialogRef) {
    this.dialogRef.close(); // ✅ cierra el diálogo directamente
  } else {
    this.close.emit(); // opcional si alguna vez lo usas en otro contexto
  }
}

  getDataEntiti() {
    this.entitiService.getMyEntiti().subscribe({
      next: res => {
        this.entitiConfig = res.data;
        this.isEntitiLoading = false;
      },
      error: err => {
        this.isEntitiLoading = false;
      },
    });
  }
}
