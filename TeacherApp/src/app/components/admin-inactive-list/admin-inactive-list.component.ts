import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { Student } from 'src/app/interfaces/student.interface';
import { StudentsService } from 'src/app/services/students.service';
import { CustomPaginator } from './CustomPaginatorConfiguration';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-admin-inactive-list',
  templateUrl: './admin-inactive-list.component.html',
  styleUrls: ['./admin-inactive-list.component.css'],
  providers: [{
    provide: MatPaginatorIntl, useValue: CustomPaginator()
  }]
})
export class AdminInactiveListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'city',
    'contact',
    'creation_date',
    'admin',
  ];
  dataSource: MatTableDataSource<Student>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private studentsService: StudentsService) {
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      let response = await this.studentsService.getInactiveStudent();
      this.dataSource.data = response;
    } catch (err: any) {
      console.log(err.error);
    }
  }

  deleteStudent(studentId: number) {
    const idStudent = studentId;
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary me-3 ',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: `¿Deseas activar el usuario?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            let response = await this.studentsService.activate(idStudent);
            if (response.affectedRows > 0) {
              swalWithBootstrapButtons.fire('Usuario activado');
              this.ngOnInit();
            } else {
              swalWithBootstrapButtons.fire(
                'Error',
                `${response.error}`,
                'error'
              );
            }
          } catch (error: any) {
            console.log(error.message);
          }
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelado',
            'El usuario no ha sido activado',
            'error'
          );
        }
      });
  }
}