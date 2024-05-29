import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { TaskTreeNode, TaskTree } from '../../models/taskTree';
import { TreeService } from '../../services/core/tree.service';
import { ZoomBehavior, Selection, zoomIdentity } from 'd3';

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
    this.originalNode = tree.root;
    this.currentNode = tree.root;

    let renderedTree: TaskTree;

    // if (this.showFilteredTree) {
    renderedTree = {
      ...tree,
      root: this.filterTree(tree.root),
    };
    // } else {
    //   //filterCompletedTasks
    //   const filtered = this.filterCompletedTasks(tree.root);
    //   if (filtered) {
    //     renderedTree = {
    //       ...tree,
    //       root: filtered,
    //     };
    //   } else {
    //     renderedTree = tree;
    //   }
    // }

    const nodeCount = this.countNodes(renderedTree.root);
    const margin = { top: 20, right: 220, bottom: 30, left: 220 };
    const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
    const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

    this.svg = this.createSvg(margin, width, height);
    this.treemap = this.createTreeMap(height, width);
    this.treeData = this.createTreeData(renderedTree.root);

    this.updateTree();
  }

  // ...

  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   this.originalNode = node.data;
  //   this.currentNode = node.data;

  //   if (this.showFilteredTree) {
  //     const filteredNode = this.filterTree(node.data);
  //     this.renderTreeFromCurrentNode(filteredNode);
  //   } else {
  //     this.renderTreeFromCurrentNode(node.data);
  //   }
  // }

  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   this.originalNode = node.data;
  //   this.currentNode = node.data;

  //   this.renderTreeFromCurrentNode(node.data);
  // }

  private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
    if (!this.originalTree) return;
    const originalNode = this.findNodeInTree(
      this.originalTree.root,
      node.data.taskId
    );
    if (originalNode) {
      this.originalNode = originalNode;
      this.currentNode = originalNode;

      // if (this.showFilteredTree) {
      const filteredNode = this.filterTree(originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
      // } else {
      //   this.renderTreeFromCurrentNode(originalNode);
      // }
    }
    // }
  }

  toggleFilteredTree() {
    this.showFilteredTree = !this.showFilteredTree;
    if (this.originalNode) {
      // if (this.showFilteredTree) {
      const filteredNode = this.filterTree(this.originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
      // } else {
      //   this.renderTreeFromCurrentNode(this.originalNode);
      // }
    }
  }

  toggleFilteredCompletedTree() {
    this.showCompletedTasks = !this.showCompletedTasks;
    if (this.originalNode) {
      // if (this.showFilteredTree) {
      const filteredNode = this.filterTree(this.originalNode);
      this.renderTreeFromCurrentNode(filteredNode);
      // } else {
      //   this.renderTreeFromCurrentNode(this.originalNode);
      // }
    }
  }

  // ...

  // toggleFilteredTree() {
  //   this.showFilteredTree = !this.showFilteredTree;
  //   this.renderTreeFromCurrentNode();
  // }
  // toggleFilteredTree() {
  //   this.showFilteredTree = !this.showFilteredTree;

  //   if (this.currentNode) {
  //     const originalNode = this.findNodeInTree(
  //       this.treeInput!.root,
  //       this.currentNode.taskId
  //     );
  //     if (originalNode) {
  //       this.renderTreeFromCurrentNode(originalNode);
  //     }
  //   }
  // }

  // toggleFilteredTree() {
  //   this.showFilteredTree = !this.showFilteredTree;

  //   if (this.currentNode) {
  //     if (this.treeInput) {
  //       const originalNode = this.findNodeInTree(
  //         this.treeInput.root,
  //         this.currentNode.taskId
  //       );
  //       if (originalNode) {
  //         this.renderTreeFromCurrentNode(originalNode);
  //       }
  //     } else {
  //       this.renderTreeFromCurrentNode(this.currentNode);
  //     }
  //   }
  // }
  // toggleFilteredTree() {
  //   this.showFilteredTree = !this.showFilteredTree;

  //   if (this.originalNode) {
  //     if (this.showFilteredTree) {
  //       const filteredNode = this.filterTree(this.originalNode);
  //       this.renderTreeFromCurrentNode(filteredNode);
  //     } else {
  //       this.renderTreeFromCurrentNode(this.originalNode);
  //     }
  //   }
  // }

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
    if (node.isCompleted) {
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
  // private renderTreeFromCurrentNode(node: TaskTreeNode) {
  //   let renderedNode: TaskTreeNode;

  //   if (this.showFilteredTree) {
  //     renderedNode = this.filterTree(node);
  //   } else {
  //     renderedNode = node;
  //   }

  //   const nodeCount = this.countNodes(renderedNode);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(renderedNode);

  //   this.updateTree();
  // }
  // private renderTreeFromCurrentNode(node: TaskTreeNode) {
  //   this.currentNode = node;

  //   const nodeCount = this.countNodes(node);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(node);

  //   this.updateTree();
  // }

  private renderTreeFromCurrentNode(node: TaskTreeNode) {
    let renderedNode: TaskTreeNode;

    // if (this.showFilteredTree) {
    renderedNode = this.filterTree(node);
    // } else {
    //   renderedNode = node;
    // }

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

  // private renderTreeFromCurrentNode() {
  //   if (this.currentNode) {
  //     let renderedNode: TaskTreeNode;

  //     if (this.showFilteredTree) {
  //       renderedNode = this.filterTree(this.currentNode);
  //     } else {
  //       renderedNode = this.currentNode;
  //     }

  //     const nodeCount = this.countNodes(renderedNode);
  //     const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //     const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //     const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //     this.svg = this.createSvg(margin, width, height);
  //     this.treemap = this.createTreeMap(height, width);
  //     this.treeData = this.createTreeData(renderedNode);

  //     this.updateTree();
  //   }
  // }

  // resetTree() {
  //   if (this.treeInput) {
  //     this.currentNode = this.treeInput.root;
  //     this.renderTree(this.treeInput);
  //   } else {
  //     this.initTree();
  //   }
  // }

  // resetTree() {
  //   if (this.treeInput) {
  //     this.currentNode = this.treeInput.root;
  //     this.renderTreeFromCurrentNode(this.treeInput.root);
  //   } else {
  //     this.initTree();
  //   }
  // }

  resetTree() {
    if (this.treeInput) {
      this.currentNode = this.treeInput.root;
      this.renderTreeFromCurrentNode(this.treeInput.root);
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
        (child) => this.showCompletedTasks || !child.isCompleted
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

  // private filterTree(node: TaskTreeNode): TaskTreeNode {
  //   // this.showCompletedTasks:boolean
  //   // this.showFilteredTree:boolean
  //   const filteredNode: TaskTreeNode = {
  //     ...node,
  //     children: [],
  //   };

  //   if (node.children) {
  //     const childrenWithChildren = node.children.filter(
  //       (child) =>
  //         child.children && child.children.length > 0 && !child.isCompleted
  //     );
  //     const childrenWithoutChildren = node.children.filter(
  //       (child) =>
  //         (!child.children || child.children.length === 0) && !child.isCompleted
  //     );

  //     filteredNode.children = childrenWithChildren.map((child) =>
  //       this.filterTree(child)
  //     );

  //     const limitedChildrenWithoutChildren = childrenWithoutChildren.slice(
  //       0,
  //       this.maxTasksToShow
  //     );
  //     filteredNode.children.push(...limitedChildrenWithoutChildren);
  //   }

  //   return filteredNode;
  // }

  // private filterTree(node: TaskTreeNode): TaskTreeNode {
  //   const filteredNode: TaskTreeNode = {
  //     ...node,
  //     children: [],
  //   };

  //   if (node.children) {
  //     const childrenWithChildren = node.children.filter(
  //       (child) => child.children && child.children.length > 0
  //     );
  //     const childrenWithoutChildren = node.children.filter(
  //       (child) => !child.children || child.children.length === 0
  //     );

  //     filteredNode.children = childrenWithChildren.map((child) =>
  //       this.filterTree(child)
  //     );

  //     const limitedChildrenWithoutChildren = childrenWithoutChildren.slice(
  //       0,
  //       this.maxTasksToShow
  //     );
  //     filteredNode.children.push(...limitedChildrenWithoutChildren);
  //   }

  //   return filteredNode;
  // }
  // private renderTree(tree: TaskTree) {
  //   let renderedTree: TaskTree;
  //   this.currentNode = tree.root;

  //   if (this.showFilteredTree) {
  //     renderedTree = {
  //       ...tree,
  //       root: this.filterTree(tree.root),
  //     };
  //   } else {
  //     renderedTree = tree;
  //   }

  //   const nodeCount = this.countNodes(renderedTree.root);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(renderedTree.root);

  //   this.updateTree();
  // }
  // private renderTree(tree: TaskTree) {
  //   const filteredTree: TaskTree = {
  //     ...tree,
  //     root: this.filterTree(tree.root),
  //   };

  //   const nodeCount = this.countNodes(filteredTree.root);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(filteredTree.root);

  //   this.updateTree();
  // }
  // private renderTree(tree: TaskTree) {
  //   const nodeCount = this.countNodes(tree.root);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(tree.root);

  //   // this.renderLinks();
  //   // this.renderNodes();
  //   this.updateTree();
  // }

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

  // private createTreeData(root: TaskTreeNode) {
  //   const nodes = d3.hierarchy<TreeNode>(
  //     root as TreeNode,
  //     (d) => d.children as TreeNode[]
  //   );
  //   return this.treemap!(nodes);
  // }

  private createTreeData(root: TaskTreeNode) {
    // const filteredRoot = this.filterCompletedTasks(root);
    // if (!filteredRoot) {
    //   return undefined; // Handle the case where the root itself is 'completed' or has no visible children
    // }
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

  // In tree-view.component.ts

  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   // this.treeData = this.createTreeData(node.data);

  //   const nodeCount = this.countNodes(node.data);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(node.data);
  //   this.updateTree();
  // }
  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   let zoomedNode: TaskTreeNode;
  //   this.currentNode = node.data;

  //   if (this.showFilteredTree) {
  //     zoomedNode = this.filterTree(node.data);
  //   } else {
  //     zoomedNode = node.data;
  //   }

  //   const nodeCount = this.countNodes(zoomedNode);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(zoomedNode);
  //   this.updateTree();
  // }
  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   this.currentNode = node.data;
  //   this.renderTreeFromCurrentNode(node.data);
  // }
  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   this.currentNode = node.data;
  //   this.originalNode = node.data;

  //   if (this.showFilteredTree) {
  //     const filteredNode = this.filterTree(node.data);
  //     this.renderTreeFromCurrentNode(filteredNode);
  //   } else {
  //     this.renderTreeFromCurrentNode(node.data);
  //   }
  // }

  // private zoomToNode(node: d3.HierarchyNode<TreeNode>) {
  //   const filteredNode = this.filterTree(node.data);

  //   const nodeCount = this.countNodes(filteredNode);
  //   const margin = { top: 20, right: 220, bottom: 30, left: 220 };
  //   const width = Math.max(960, nodeCount * 50) - margin.left - margin.right;
  //   const height = Math.max(600, nodeCount * 30) - margin.top - margin.bottom;

  //   this.svg = this.createSvg(margin, width, height);
  //   this.treemap = this.createTreeMap(height, width);
  //   this.treeData = this.createTreeData(filteredNode);
  //   this.updateTree();
  // }

  // The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.ts(2362)
  /**
Argument of type '(selection: Selection<SVGSVGElement, unknown, any, any> | TransitionLike<SVGSVGElement, unknown>, transform: ZoomTransform | ((this: SVGSVGElement, event: any, d: unknown) => ZoomTransform), point?: [...] | ... 1 more ... | undefined) => void' is not assignable to parameter of type '(transition: Transition<SVGGElement, unknown, HTMLElement, any>, ...args: any[]) => any'.
  Types of parameters 'selection' and 'transition' are incompatible.
    Type 'Transition<SVGGElement, unknown, HTMLElement, any>' is not assignable to type 'Selection<SVGSVGElement, unknown, any, any> | TransitionLike<SVGSVGElement, unknown>'.
      Type 'Transition<SVGGElement, unknown, HTMLElement, any>' is missing the following properties from type 'Selection<SVGSVGElement, unknown, any, any>': classed, property, html, append, and 14 more.ts(2345)
 */
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

  // resetTree() {
  //   if (this.treeInput) {
  //     this.renderTree(this.treeInput);
  //   } else {
  //     this.initTree();
  //   }
  // }

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
      .attr('r', 3)
      .attr('fill', (d: any) => (d.children ? '#3498db' : '#e74c3c'))
      .attr('stroke', (d: any) => {
        return !d.data.isCompleted ? '#2c3e50' : 'green';
      })
      .attr('stroke-width', 2);

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
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('fill', '#f0f0f0')
          .attr('stroke', '#b0b0b0')
          .attr('stroke-width', '1')
          .lower();
      }
    });

    nodes.append('title').text((d: any) => d.data.name);
  }
}
