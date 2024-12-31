import { TestBed } from '@angular/core/testing';
import { TextToTasksService } from './text-to-tasks.service';

describe('TextToTasksService', () => {
  let service: TextToTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TextToTasksService],
    });

    service = TestBed.inject(TextToTasksService);
  });

  it('should parse tasks from plain text', () => {
    const input = 'Task1\nTask2\nTask3';
    const tasks = service.getLinesToTaskLikeObjects(input, false);

    expect(tasks.length).toBe(3);
    expect(tasks[0].name).toBe('Task1');
  });
});
