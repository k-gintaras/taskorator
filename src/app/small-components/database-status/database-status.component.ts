import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-database-status',
  templateUrl: './database-status.component.html',
  styleUrls: ['./database-status.component.scss'],
})
export class DatabaseStatusComponent {
  isDbOnline: boolean = false;
  constructor(private taskService: ApiService) {}
  ngOnInit() {
    this.checkApiHealth();
  }

  checkApiHealth() {
    this.taskService.checkApiHealth().subscribe({
      next: (response) => {
        this.isDbOnline = true;
        console.log('API is running!', response);
        // You can do further actions if the API is running
      },
      error: (error) => {
        this.isDbOnline = false;
        console.error('API is not running or encountered an error:', error);
        // Handle the error or perform actions if the API is not running
      },
      complete: () => {
        // The 'complete' callback is optional and will be called when the observable is complete
        console.log('API check completed.');
      },
    });
  }
}
