import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {
  HierarchyPointLink,
  HierarchyPointNode,
  SimulationNodeDatum,
} from 'd3';
import { LocalService } from 'src/app/services/local.service';
import { SyncService } from 'src/app/services/sync.service';
import { TaskLoaderService } from 'src/app/services/task-loader.service';
import { Task } from 'src/app/models/taskModelManager';
import { interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-d3-visualizer',
  templateUrl: './d3-vizualizer.component.html', // Add your template file here
  styleUrls: ['./d3-vizualizer.component.scss'], // Add your CSS file here
})
export class D3VizualizerComponent implements OnInit {
  tasks: Task[] = [];

  constructor(
    private elementRef: ElementRef,
    private sync: SyncService,
    private taskLoaderService: TaskLoaderService,
    private local: LocalService
  ) {}

  ngOnInit() {
    this.taskLoaderService.loadTasksSlow().subscribe({
      next: () => {
        console.log('Tasks loaded and updated in local storage');
        this.local.getAllTasks().subscribe((tasks) => {
          if (tasks) {
            this.tasks = tasks;
            console.log(this.tasks.length);
            this.renderVisualization2(); // Call the visualization function after tasks are loaded
            // this.intervalTest();
          } else {
            console.error('Error fetching tasks:');
          }
        });
      },
      error: (apiError) => {
        console.error('API fetchTasks failed:', apiError);
      },
    });
  }

  intervalTest() {
    const intervalTime = 1000; // 5 seconds
    const taskList = [...this.tasks]; // Create a copy of the original task list

    // Create an Observable that emits every 5 seconds
    const source$ = interval(intervalTime);

    source$
      .pipe(
        // Only take as many emissions as there are tasks
        take(taskList.length),
        // Map each emission to a sub-array of the tasks list
        map((i) => taskList.slice(0, i + 1))
      )
      .subscribe({
        next: (newTaskList) => {
          // Here, replace this.tasks with the new task list and refresh the visualization
          this.tasks = newTaskList;
          this.renderVisualization();
          console.log(newTaskList);
        },
        error: (error) => {
          console.error(`An error occurred: ${error}`),
            console.log('Task list generation completed.');
        },
      });
  }

  renderVisualization() {
    // this.validateOverlords(this.tasks);

    const svg = d3
      .select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', 1600)
      .attr('height', 900)
      .attr('id', 'task-visualization');

    const g = svg.append('g');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5]) // this defines the zoom limit [min,max]
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior as any);

    // All your d3 graphics should

    const treeLayout = d3.tree<Task>().size([1300, 600]);
    const startView1 = this.tasks[this.tasks.length - 1];
    const startView2 = this.tasks[5];
    const root: d3.HierarchyNode<Task> = d3.hierarchy<Task>(
      startView1,
      (d: Task) => {
        const children: Task[] = this.tasks.filter(
          (t: Task) => t.overlord === d.taskId && t.taskId !== startView1.taskId
        );
        return children.length ? children : null;
      }
    );

    const links = treeLayout(root).links();

    // console.log(links);
    links.forEach((e) => {
      console.log(e.target.x);
    });

    console.log('test links end');
    const nodes = root.descendants();

    const linkGenerator = d3
      .linkHorizontal<HierarchyPointLink<Task>, HierarchyPointLink<Task>>()
      .x((d: HierarchyPointLink<Task>) => d.source.y) // or d.target.y depending on your layout
      .y((d: HierarchyPointLink<Task>) => d.source.x); // or d.target.x depending on your layout

    svg
      .selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', linkGenerator);

    const node = svg
      .selectAll('.node')
      .data(nodes as d3.HierarchyPointNode<Task>[])
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr(
        'transform',
        (d: d3.HierarchyPointNode<Task>) => `translate(${d.y},${d.x})`
      );

    node.append('circle').attr('r', 4.5);
    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', (d: d3.HierarchyPointNode<Task>) => (d.children ? -6 : 6))
      .attr('text-anchor', (d: d3.HierarchyPointNode<Task>) =>
        d.children ? 'end' : 'start'
      )
      .text((d: d3.HierarchyPointNode<Task>) => d.data.name);
  }
  renderVisualization2() {
    const svg = d3
      .select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', 1600)
      .attr('height', 900)
      .attr('id', 'task-visualization');

    const g = svg.append('g');

    // const zoomBehavior = d3
    //   .zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([0.1, 5]) // this defines the zoom limit [min,max]
    //   .on('zoom', (event) => {
    //     g.attr('transform', event.transform);
    //   });

    // svg.call(zoomBehavior as any);

    const treeLayout = d3.tree<Task>().size([1600, 900]);
    const startView1 = this.tasks[this.tasks.length - 1];
    const startView2 = this.tasks[5];
    const root: d3.HierarchyNode<Task> = d3.hierarchy<Task>(
      startView1,
      (d: Task) => {
        const children: Task[] = this.tasks.filter(
          (t: Task) => t.overlord === d.taskId && t.taskId !== startView1.taskId
        );
        return children.length ? children : null;
      }
    );

    const links = treeLayout(root).links();

    // console.log(links);
    links.forEach((e) => {
      console.log(e.target.x);
    });

    console.log('test links end');
    const nodes = root.descendants();

    // assuming nodes and links are already defined
    const width = 5;
    const height = 5;

    interface MyNodeDatum extends d3.SimulationNodeDatum {
      id: number | string; // You can replace number | string with the type of your ids
    }

    const nodesData: MyNodeDatum[] = nodes.map((node) => {
      return {
        id: node.data.taskId,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
      };
    });

    const simulation = d3
      .forceSimulation(nodesData)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: SimulationNodeDatum) => (d as MyNodeDatum).id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line');

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .selectAll('circle')
      .data(nodes)
      .join('g'); // this is the group element for each node.

    node.append('circle').attr('r', 6).attr('fill', '#69b3a2');

    node
      .append('text')
      .attr('stroke', '#999')
      .text((d) => d.data.name) // replace d.id with your desired text.
      .attr('x', 6)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-30)');
    const radius = 5;
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as MyNodeDatum).x ?? 0)
        .attr('y1', (d) => (d.source as MyNodeDatum).y ?? 0)
        .attr('x2', (d) => (d.target as MyNodeDatum).x ?? 0)
        .attr('y2', (d) => (d.target as MyNodeDatum).y ?? 0);
      node
        .attr(
          'transform',
          (d) =>
            'translate(' +
            (d as MyNodeDatum).x +
            ',' +
            (d as MyNodeDatum).y +
            ')'
        )
        .attr('cx', (d) => {
          const x = (d as MyNodeDatum).x;
          return x !== undefined
            ? Math.max(radius, Math.min(width - radius, x))
            : 0; // default value in case x is undefined
        })
        .attr('cy', (d) => {
          const y = (d as MyNodeDatum).y;
          return y !== undefined
            ? Math.max(radius, Math.min(height - radius, y))
            : 0; // default value in case y is undefined
        });
    });
  }
}
