import { Component, OnInit } from '@angular/core';
import { TaskTree, TaskTreeNode } from 'src/app/models/taskTree';
import * as d3 from 'd3';
import { TreeService } from 'src/app/services/core/tree.service';

interface TreeNode extends TaskTreeNode {
  x?: number;
  y?: number;
}

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit {
  tree: TaskTree = {
    root: {
      name: '',
      isCompleted: false,
      taskId: '',
      overlord: null,
      children: [],
      childrenCount: 0,
      completedChildrenCount: 0,
    },
  };

  private svg: any;
  private treemap: any;
  private treeData: any;

  constructor(private treeService: TreeService) {}

  ngOnInit() {
    this.initTree();
  }

  private initTree() {
    this.treeService.getTree().subscribe((tree) => {
      console.log(tree);
      if (tree) {
        this.tree = tree;
        this.renderTree();
      }
    });
  }

  private renderTree() {
    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    this.svg = this.createSvg(margin, width, height);
    this.treemap = this.createTreeMap(height, width);
    this.treeData = this.createTreeData(this.tree.root);

    this.renderLinks();
    this.renderNodes();
  }

  private createSvg(margin: any, width: number, height: number) {
    return d3
      .select('#tree-container')
      .append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  }

  private createTreeMap(height: number, width: number) {
    return d3.tree<TreeNode>().size([height, width]);
  }

  private createTreeData(root: TaskTreeNode) {
    const nodes = d3.hierarchy<TreeNode>(
      root as TreeNode,
      (d) => d.children as TreeNode[]
    );
    return this.treemap(nodes);
  }

  private renderLinks() {
    this.svg
      .selectAll('.link')
      .data(this.treeData.descendants().slice(1))
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        return `M${d.parent.y},${d.parent.x}
              C${(d.parent.y + d.y) / 2},${d.parent.x}
               ${(d.parent.y + d.y) / 2},${d.x}
               ${d.y},${d.x}`;
      })
      .attr('fill', 'none') // Set fill to none
      .attr('stroke', 'grey'); // Define the stroke color to draw the line
  }

  private renderNodes() {
    const nodes = this.svg
      .selectAll('.node')
      .data(this.treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes
      .append('circle')
      .attr('r', 3)
      .attr('fill', (d: any) => (d.children ? '#3498db' : '#e74c3c'))
      .attr('stroke', (d: any) => {
        return !d.data.isCompleted ? '#2c3e50' : 'green';
      })
      .attr('stroke-width', 2);

    nodes.each(function (d: any, i: any, nodes: any) {
      const node = d3.select(nodes[i]);

      const textElement = node
        .append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => (d.children ? -20 : 20))
        .attr('text-anchor', (d: any) => (d.children ? 'end' : 'start'))
        .text((d: any) => d.data.name)
        .attr('font-family', 'Arial')
        .attr('font-size', '14px')
        .attr('fill', '#2c3e50')
        .node();

      if (textElement) {
        const bbox = textElement.getBBox();
        const padding = 4;
        node
          .insert('rect', 'text')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - padding)
          .attr('width', bbox.width + 2 * padding)
          .attr('height', bbox.height + 2 * padding)
          .attr('rx', 10) // For rounded corners
          .attr('ry', 10)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#b0b0b0')
          .attr('stroke-width', '1')
          // Ensure the rectangle is inserted before the text element
          .lower();
      }
    });

    nodes.append('title').text((d: any) => d.data.name);
  }

  getTreeAsText() {
    return JSON.stringify(this.tree, null, 2);
  }
}
