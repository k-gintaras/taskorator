import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { TaskTreeNode, TaskTree } from '../../models/taskTree';
import { TreeService } from '../../services/core/tree.service';
import { ZoomBehavior, ZoomTransform, Selection, zoomIdentity } from 'd3';

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

  // private renderTree() {
  //   const margin = { top: 20, right: 90, bottom: 30, left: 90 };
  //   const width = 960 - margin.left - margin.right;
  //   const height = 500 - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(this.tree.root);

  //   this.renderLinks();
  //   this.renderNodes();
  // }

  private renderTree() {
    const margin = { top: 20, right: 220, bottom: 30, left: 220 };
    const width = 960 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom; // Increased height

    this.svg = this.createSvg(margin, width, height);
    this.treemap = this.createTreeMap(height, width);
    this.treeData = this.createTreeData(this.tree.root);

    this.renderLinks();
    this.renderNodes();
  }

  private handleNodeClick(nodeData: any) {
    // Handle the click event, e.g., expand/collapse, display details, etc.
    console.log('Node clicked:', nodeData);
    // Example action: toggle children on click
    if (nodeData.children) {
      nodeData._children = nodeData.children;
      nodeData.children = null;
    } else {
      nodeData.children = nodeData._children;
      nodeData._children = null;
    }
    this.update(nodeData); // Call update function to re-render the tree
  }

  private defineNodeDrag(svgGroup: any) {
    const dragHandler = d3
      .drag()
      .on('start', function (event, d) {
        if (!event.active) d3.select(this).raise().attr('stroke', 'black');
      })
      .on('drag', function (event, d: any) {
        d3.select(this)
          .attr('cx', (d.x = event.x))
          .attr('cy', (d.y = event.y));
        // Redraw path or reposition text, etc.
      })
      .on('end', function (event, d: any) {
        if (!event.active) d3.select(this).attr('stroke', null);
        // Update the position data
        d.fixed = true; // Optionally fix the position
      });

    svgGroup
      .selectAll('circle') // Assuming nodes are circles
      .call(dragHandler);
  }

  private update(source: any) {
    // Compute the new tree layout.
    const treeData = this.treemap(this.tree.root);

    // Update the nodes, applying positions, transitions, etc.
    const nodes = this.svg
      .selectAll('.node')
      .data(treeData.descendants(), (d: any) => d.id);

    // Enter new nodes, update existing ones, and remove any exiting ones.
    // Handle transitions and positional updates here.
  }

  // private createSvg(margin: any, width: number, height: number) {
  //   return d3
  //     .select('#tree-container')
  //     .append('svg')
  //     .attr('width', width + margin.right + margin.left)
  //     .attr('height', height + margin.top + margin.bottom)
  //     .append('g')
  //     .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // }

  // private createSvg(margin: any, width: number, height: number) {
  //   return d3
  //     .select('#tree-container')
  //     .append('svg')
  //     .attr('width', width + margin.right + margin.left)
  //     .attr('height', height + margin.top + margin.bottom)
  //     .append('g')
  //     .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // }

  // private createSvg(margin: any, width: number, height: number) {
  //   const svg = d3
  //     .select('#tree-container')
  //     .append('svg')
  //     .attr('width', width + margin.right + margin.left)
  //     .attr('height', height + margin.top + margin.bottom)
  //     .call(
  //       d3.zoom().on('zoom', function (event) {
  //         svg.attr('transform', event.transform);
  //       })
  //     )
  //     .append('g')
  //     .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //   return svg;
  // }

  // private createSvg(margin: any, width: number, height: number) {
  //   return d3
  //     .select('#tree-container')
  //     .append('svg')
  //     .attr(
  //       'viewBox',
  //       `0 0 ${width + margin.left + margin.right} ${
  //         height + margin.top + margin.bottom
  //       }`
  //     )
  //     .append('g')
  //     .attr('transform', `translate(${margin.left}, ${margin.top})`);
  // }

  // private createSvg(margin: any, width: number, height: number) {
  //   const svgContainer: Selection<SVGSVGElement, unknown, HTMLElement, any> = d3
  //     .select('#tree-container')
  //     .append('svg')
  //     .attr(
  //       'viewBox',
  //       `0 0 ${width + margin.left + margin.right} ${
  //         height + margin.top + margin.bottom
  //       }`
  //     )
  //     .attr('preserveAspectRatio', 'xMidYMid meet');

  //   // Define the zoom behavior with the correct element type
  //   const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3
  //     .zoom<SVGSVGElement, unknown>()
  //     .scaleExtent([0.5, 2]) // example scale limits
  //     .on('zoom', (event) => {
  //       svgGroup.attr('transform', event.transform.toString()); // Ensure transform is applied as a string
  //     });

  //   svgContainer.call(zoomBehavior);

  //   // Reset the zoom transform to default (identity)
  //   svgContainer.call(zoomBehavior.transform, zoomIdentity);

  //   const svgGroup = svgContainer
  //     .append('g')
  //     .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //   return svgGroup;
  // }

  private createSvg(margin: any, width: number, height: number) {
    // Create the SVG container with the necessary attributes
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

    // Create the group element before defining the zoom behavior
    const svgGroup = svgContainer
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define the zoom behavior with the correct element type
    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3]) // Example scale limits
      .on('zoom', (event) => {
        // Use svgGroup here within the zoom event handler
        svgGroup.attr('transform', event.transform.toString()); // Ensure transform is applied as a string
      });

    // Apply the zoom behavior to the SVG container
    svgContainer.call(zoomBehavior);

    // Optionally, reset the zoom transform to default (identity) if needed
    // svgContainer.call(zoomBehavior.transform, zoomIdentity);
    const initialTransform = d3.zoomIdentity.translate(width / 2, 0).scale(0.7);
    svgContainer.call(zoomBehavior.transform, initialTransform);

    return svgGroup; // Return the group element for further manipulation
  }

  // private createTreeMap(height: number, width: number) {
  //   return d3.tree<TreeNode>().size([height, width]);
  // }

  private createTreeMap(height: number, width: number) {
    return d3
      .tree()
      .size([height, width])
      .separation((a, b) => {
        return a.parent == b.parent ? 1 : 1.5;
      });
  }

  private createTreeData(root: TaskTreeNode) {
    const nodes = d3.hierarchy<TreeNode>(
      root as TreeNode,
      (d: any) => d.children as TreeNode[]
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
