import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MtxProgressModule } from '@ng-matero/extensions/progress';
import { ApexOptions } from 'apexcharts';

@Component({
  selector: 'app-product-summary',
  standalone: true,
  templateUrl: './product-summary.component.html',
  styleUrls: ['./product-summary.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    NgApexchartsModule,
    MtxProgressModule,
  ],
})
export class ProductSummaryComponent {
  chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
    },
    series: [],
    xaxis: {
      categories: [],
    },
    title: {
      text: '',
    },
  };

  constructor(
    public dialogRef: MatDialogRef<ProductSummaryComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      totalProductos: number;
      totalStock: number;
      totalValorInventario: number;
      products: { name: string; stock: number }[];
    }
  ) {
    this.initChart();
  }

  private initChart(): void {
    const top5 = this.data.products.sort((a, b) => b.stock - a.stock).slice(0, 5);

    this.chartOptions.series = [
      {
        name: 'Stock',
        data: top5.map(p => p.stock),
      },
    ];

    this.chartOptions.xaxis = {
      categories: top5.map(p => p.name),
    };

    this.chartOptions.title = {
      text: 'Top 5 Productos por Stock',
    };
  }
}
