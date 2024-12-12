import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteTaskService } from '../services/favorite-task.service';
import { TaskTreeNode } from '../../../../../models/taskTree';

@Component({
  selector: 'app-favorite-task',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-task.component.html',
  styleUrl: './favorite-task.component.scss',
})
export class FavoriteTaskComponent implements OnInit {
  favoriteTasks: TaskTreeNode[] | undefined;

  constructor(private favoriteTaskService: FavoriteTaskService) {}

  ngOnInit(): void {
    this.loadFavoriteTasks();
  }

  loadFavoriteTasks(): void {
    this.favoriteTasks = this.favoriteTaskService.getFavoriteTasks();
  }

  removeFavoriteTask(taskId: string): void {
    this.favoriteTaskService.removeFavoriteTask(taskId);
    this.loadFavoriteTasks();
  }

  toggleFavoriteTask(taskId: string): void {
    this.favoriteTaskService.toggleFavoriteTask(taskId);
    this.loadFavoriteTasks();
  }
}
