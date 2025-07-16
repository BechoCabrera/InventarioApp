import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { LoadingOverlayComponent } from '@shared/loading-overlay/loading-overlay.component'; // Ajusta la ruta
import { CashClosingService } from '../cash-closing.service';
import { MatCardModule } from '@angular/material/card'; // Para las tarjetas
import { MatDividerModule } from '@angular/material/divider'; // Para dividir secciones
import { MatPaginatorModule } from '@angular/material/paginator'; // Para la paginación
import { MatDialogModule } from '@angular/material/dialog'; // Para abrir modales
import { MatButtonModule } from '@angular/material/button'; // Para botones
import { MatTableModule } from '@angular/material/table'; // Para la tabla de datos
import { MatIconModule } from '@angular/material/icon'; // Para íconos
import { MatInputModule } from '@angular/material/input'; // Para los campos de entrada
import { MatFormFieldModule } from '@angular/material/form-field'; // Para los formularios de entrada
import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule en tu módulo
import { MatSort } from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';
@Component({
  selector: 'app-cash-closing-history',
  templateUrl: './cash-closing-history.component.html',
  styleUrls: ['./cash-closing-history.component.scss'],
  imports: [
    MatCardModule,
    MatDividerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    MatSortModule,
    LoadingOverlayComponent, // Asegúrate de que este componente esté importado correctamente
  ],
  standalone: true, // Asegúrate de que este componente sea standalone si estás usando Angular 14+
})
export class CashClosingHistoryComponent implements OnInit {
  isLoading: boolean = false;
  cashClosings: any[] = [];
  displayedColumns: string[] = [
    'date',
    'totalCash',
    'totalCredit',
    'totalCard',
    'totalTransfer',
    'totalAmount',
    'userName',
    'createdAt',
    'entitiName',
  ];
  dataSource = new MatTableDataSource<any>(this.cashClosings);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; // Añadimos MatSort

  constructor(
    private cashClosingService: CashClosingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchCashClosings();
  }

  fetchCashClosings(): void {
    this.isLoading = true;
    this.cashClosingService.getAll().subscribe(
      data => {
        this.cashClosings = data.map(item => ({
          ...item,
          date: new Date(item.date),
          createdAt: new Date(item.createdAt),
        }));
        this.dataSource.data = this.cashClosings;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching cash closings', error);
        this.isLoading = false;
      }
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
        case 'createdAt':
          return new Date(item[property]);
        case 'totalAmount':
        case 'totalCash':
        case 'totalCredit':
        case 'totalCard':
        case 'totalTransfer':
          return Number(item[property]);
        default:
          return item[property];
      }
    };

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase(); // Filtra los datos
  }

  openCashClosingDetailDialog(cashClosing: any): void {
    // Lógica para abrir un modal o detalles de un cierre de caja
  }
}
