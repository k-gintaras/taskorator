import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { ZoomBehavior, Selection, zoomIdentity } from 'd3';
import { TaskTreeNode, TaskTree } from '../../../../models/taskTree';
import { TreeService } from '../../../../services/sync-api-cache/tree.service';

interface TreeNode extends TaskTreeNode {
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-tree-view',
  standalone: true,
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, OnChanges {
  @Input() treeInput: TaskTree | null = null;
  currentNode: TaskTreeNode | null = null;
  originalNode: TaskTreeNode | null = null;

  private svg: Selection<SVGGElement, unknown, HTMLElement, any> | undefined;
  private treemap: d3.TreeLayout<TreeNode> | undefined;
  private treeData: d3.HierarchyNode<TreeNode> | undefined;

  maxTasksToShow = 5;
  showFilteredTree = true;
  showCompletedTasks = false;
  originalTree: TaskTree | undefined;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    if (this.treeInput) {
      console.log('tree from input');
      this.renderTree(this.treeInput);
    } else {
      this.initTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['treeInput']) {
      const newTree = changes['treeInput'].currentValue as TaskTree | null;
      if (newTree) {
        console.log('tree from input');
        this.renderTree(newTree);
      } else {
        this.initTree();
      }
    }
  }

  // ...

  private renderTree(tree: TaskTree) {
    this.originalNode = tree.primarch;
    this.currentNode = tree.primarch;

    let renderedTree: TaskTree;

    // if (this.showFilteredTree) {
    renderedTree = {
      ...tree,
      primarch: this.filterTree(tree.primarch),
    };

    const nodeCount = this.countNodes(renderedTree.primarch);
    const margin = { top: 20, right: 220, bottom: 30, left: 220 };
    const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
    const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

    this.svg = this.createSvg(margin, width, height);
    this.treemap = this.createTreeMap(height, width);
    this.treeData = this.createTreeData(renderedTree.primarch);

    this.updateTree();
  }

  private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
    if (!this.originalTree) return;
    const originalNode = this.findNodeInTree(
      this.originalTree.primarch,
      node.data.taskId
    );
    if (originalNode) {
      this.originalNode = originalNode;
      this.currentNode = originalNode;

      const filteredNode = this.filterTree(originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
    }
  }

  toggleFilteredTree() {
    this.showFilteredTree = !this.showFilteredTree;
    if (this.originalNode) {
      // if (this.showFilteredTree) {
      const filteredNode = this.filterTree(this.originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
    }
  }

  toggleFilteredCompletedTree() {
    this.showCompletedTasks = !this.showCompletedTasks;
    if (this.originalNode) {
      // if (this.showFilteredTree) {
      const filteredNode = this.filterTree(this.originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
    }
  }

  private findNodeInTree(node: TaskTreeNode, id: string): TaskTreeNode | null {
    if (node.taskId === id) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const foundNode = this.findNodeInTree(child, id);
        if (foundNode) {
          return foundNode;
        }
      }
    }

    return null;
  }

  private initTree() {
    this.treeService.getTree().subscribe((tree) => {
      console.log(tree);
      if (tree) {
        this.renderTree(tree);
        this.originalTree = tree;
      }
    });
  }

  filterCompletedTasks(node: TaskTreeNode): TreeNode | null {
    if (node.stage === 'completed') {
      return null; // Exclude this node
    }

    const treeNode: TreeNode = { ...node }; // Adjust this according to your actual conversion logic if necessary

    if (node.children) {
      // Recursively filter children, removing nulls
      treeNode.children = node.children
        .map(this.filterCompletedTasks)
        .filter((child) => child !== null) as TreeNode[];
    }

    return treeNode;
  }

  private renderTreeFromCurrentNode(node: TaskTreeNode) {
    let renderedNode: TaskTreeNode;
    renderedNode = this.filterTree(node);

    this.currentNode = renderedNode;

    const nodeCount = this.countNodes(renderedNode);
    const margin = { top: 20, right: 220, bottom: 30, left: 220 };
    const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
    const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

    this.svg = this.createSvg(margin, width, height);
    this.treemap = this.createTreeMap(height, width);
    this.treeData = this.createTreeData(renderedNode);

    this.updateTree();
  }

  resetTree() {
    if (this.treeInput) {
      this.currentNode = this.treeInput.primarch;
      this.renderTreeFromCurrentNode(this.treeInput.primarch);
    } else {
      this.treeInput = null;
      this.initTree();
    }
  }

  private filterTree(node: TaskTreeNode): TaskTreeNode {
    // Start with a copy of the current node, but clear its children to be populated later
    const filteredNode: TaskTreeNode = {
      ...node,
      children: [],
    };

    if (node.children) {
      // Filter children based on whether they are completed and showCompletedTasks flag
      const filteredChildren = node.children.filter(
        (child) => this.showCompletedTasks || child.stage !== 'completed'
      );

      // Recursively filter the remaining children
      filteredNode.children = filteredChildren.map((child) =>
        this.filterTree(child)
      );

      // If showing a filtered tree, limit the number of children
      if (this.showFilteredTree) {
        filteredNode.children = filteredNode.children.slice(
          0,
          this.maxTasksToShow
        );
      }
    }

    return filteredNode;
  }

  private countNodes(node: TaskTreeNode): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }

  private createSvg(margin: any, width: number, height: number) {
    d3.select('#tree-container').selectAll('svg').remove();

    const svgContainer: Selection<SVGSVGElement, unknown, HTMLElement, any> = d3
      .select('#tree-container')
      .append('svg')
      .attr(
        'viewBox',
        `0 0 ${width + margin.left + margin.right} ${
          height - 2 * margin.top - margin.bottom
        }`
      )
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const svgGroup = svgContainer
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 100])
      .on('zoom', (event) => {
        svgGroup.attr('transform', event.transform.toString());
      });

    svgContainer.call(zoomBehavior);

    const initialTransform = d3.zoomIdentity.translate(width / 2, 0).scale(0.7);
    svgContainer.call(zoomBehavior.transform, initialTransform);

    return svgGroup;
  }

  private createTreeMap(height: number, width: number) {
    return d3
      .tree<TreeNode>()
      .size([height, width])
      .separation((a, b) => {
        return a.parent == b.parent ? 2 : 3; // Increase the separation values
      });
  }

  private createTreeData(root: TaskTreeNode) {
    const nodes = d3.hierarchy<TreeNode>(
      root as TreeNode,
      (d) => d.children as TreeNode[]
    );
    return this.treemap!(nodes);
  }

  private renderLinks() {
    this.svg!.selectAll('.link')
      .data(this.treeData!.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        return `M${d.parent.y},${d.parent.x}
              C${(d.parent.y + d.y) / 2},${d.parent.x}
               ${(d.parent.y + d.y) / 2},${d.x}
               ${d.y},${d.x}`;
      })
      .attr('fill', 'none')
      .attr('stroke', 'grey');
  }
  private updateTree() {
    if (!this.svg) return;

    const nodeCount = this.countNodes(this.treeData!.data);
    const margin = { top: 20, right: 220, bottom: 30, left: 220 };
    const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
    const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

    this.svg.attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${
        height - 2 * margin.top - margin.bottom
      }`
    );
    this.treemap!.size([height, width]);

    // Remove existing links and nodes
    this.svg.selectAll('.link').remove();
    this.svg.selectAll('.node').remove();

    // Render the updated tree
    this.renderLinks();
    this.renderNodes();

    // Reset the zoom level
    const initialTransform = d3.zoomIdentity.translate(width / 2, 0).scale(0.7);
    const svgContainer = d3.select<SVGSVGElement, unknown>(
      '#tree-container svg'
    );
    svgContainer.call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      initialTransform
    );
  }

  private renderNodes() {
    const nodes = this.svg!.selectAll('.node')
      .data(this.treeData!.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'pointer')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes
      .append('circle')
      .attr('r', 5) // Increased radius for better visibility
      .attr('fill', (d: any) => {
        switch (d.data.stage) {
          case 'todo':
            return '#27ae60'; // Green
          case 'completed':
            return '#3498db'; // Blue
          case 'deleted':
            return '#95a5a6'; // Gray
          default:
            return '#e74c3c'; // Default red for undefined
        }
      })
      .attr('stroke', (d: any) => {
        return d.data.stage === 'deleted' ? '#7f8c8d' : '#2c3e50';
      })
      .attr('stroke-width', 2)
      .style('stroke-dasharray', (d: any) =>
        d.data.stage === 'deleted' ? '4 2' : '0'
      ); // Dashed for deleted

    nodes.on('click', (event: any, d: any) => {
      this.zoomToNode(d);
    });

    nodes.each(function (d: any, i: any, nodes: any) {
      const node = d3.select(nodes[i]);

      const textElement = node
        .append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => (d.children ? -20 : 20))
        .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
        .text((d: any) => `${d.data.name} (${d.data.stage})`) // Added stage in text for clarity
        .attr('font-family', 'Arial')
        .attr('font-size', '14px')
        .attr('fill', '#2c3e50')
        .node();

      if (textElement) {
        const bbox = textElement.getBBox();
        const padding = 6;
        node
          .insert('rect', 'text')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - padding)
          .attr('width', bbox.width + 2 * padding)
          .attr('height', bbox.height + 2 * padding)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', '#f9f9f9') // Subtle background
          .attr('stroke', '#d0d0d0') // Lighter border
          .attr('stroke-width', 1)
          .lower();
      }
    });

    // Add tooltips for more information
    nodes
      .append('title')
      .text((d: any) => `Task: ${d.data.name}\nStage: ${d.data.stage}`);
  }
}
