import { Component } from '@angular/core';
import { ErrorService } from '../../services/core/error.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-base',
  standalone: true,
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.css'],
})
export class BaseComponent {
  constructor(
    protected snackBar: MatSnackBar,
    protected dialog: MatDialog,
    private errorService: ErrorService
  ) {}

  error(message: string, error: unknown): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'error-snackbar',
    });
    this.errorService.error(error);
  }

  log(message: string): void {
    this.errorService.log(message);
  }

  popup(message: string): void {
    // maybe...
    // this.dialog.open(PopupComponent, {
    //   data: { message },
    // });

    // has internal popup...
    this.errorService.feedback(message);
  }

  feedback(message: string) {
    this.errorService.feedback(message);
  }

  // Add more common methods as needed
}
