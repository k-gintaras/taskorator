import { Injectable } from '@angular/core';
import { AiApiFirebaseService } from '../core/ai-api-firebase.service';
import { AiApiPromptService, PromptRequest, PromptResponse } from './ai-api-prompt.service';
import { TreeService } from '../sync-api-cache/tree.service';
import { TreeNodeService } from '../tree/tree-node.service';
import { TaskTreeNodeToolsService } from '../tree/task-tree-node-tools.service';
import { TaskListDataFacadeService } from '../tasks/task-list/task-list-data-facade.service';
import { SelectedOverlordService } from '../tasks/selected/selected-overlord.service';
import { TaskoratorTask } from '../../models/taskModelManager';
import { TaskTree, TaskTreeNode, TaskNodeInfo } from '../../models/taskTree';
import { ModeService } from '../mode.service';
import { ROOT_TASK_ID } from '../../models/taskModelManager';

/**
 * AI Task Context - Human-readable format for AI to understand task hierarchy
 */
interface AiTaskNode {
  taskId: string;
  name: string;
  stage: string;
  childrenCount: number;
  completedChildrenCount: number;
  description?: string; // Can include task.todo or task.why
  depth?: number; // How many levels deep from root
  isCurrentTask?: boolean;
}

/**
 * Service for AI-powered task generation and management
 * Provides safe, permission-aware AI operations on the task tree
 * 
 * Features:
 * - Guards against prompting when not logged in or offline
 * - Builds intelligent context about tasks for the AI
 * - Generates child tasks using AI based on parent task context
 * - Creates task summaries and dependency maps
 * - Aware of current viewing context (overlord, list type, etc)
 */
@Injectable({
  providedIn: 'root',
})
export class AiTaskService {
  // Maximum depth to include above current task (for context)
  private readonly ANCESTOR_DEPTH_LIMIT = 3;
  
  // Include all children but only above max descendants
  private readonly MAX_DESCENDANTS_FOR_FULL_TREE = 50;

    private taskAssistantId = 'a9308da4-dd17-466e-ab98-752c9764cfab';


  constructor(
    private aiApiFirebase: AiApiFirebaseService,
    private aiApiPrompt: AiApiPromptService,
    private treeService: TreeService,
    private treeNodeService: TreeNodeService,
    private treeNodeTools: TaskTreeNodeToolsService,
    private taskListFacade: TaskListDataFacadeService,
    private selectedOverlordService: SelectedOverlordService,
    private modeService: ModeService
  ) {}

  /**
   * Check if AI operations are available
   * Returns false if offline mode or not logged in to AI API
   */
  isAiAvailable(): boolean {
    const isOnline = this.modeService.get() === 'online';
    const isLoggedIn = this.aiApiFirebase.isCurrentlyLoggedIn();
    return isOnline && isLoggedIn;
  }

  /**
   * Get the current AI availability Observable
   * Components can subscribe to know when AI becomes available/unavailable
   */
  getAiAvailable$() {
    return this.aiApiFirebase.isLoggedIn$;
  }

  /**
   * Get a brief summary of a task for AI context
   * Includes task name, stage, position in tree hierarchy
   * 
   * @param taskId - The ID of the task to summarize
   * @returns Task summary string or null if task not found
   */
  getTaskSummary(taskId: string): string | null {
    const taskInfo = this.treeService.getTaskTreeData(taskId);
    if (!taskInfo) {
      console.warn(`[AiTaskService] Task not found: ${taskId}`);
      return null;
    }

    return `Task: ${taskId} | Stage: ${taskInfo.stage} | Children: ${taskInfo.childrenCount}/${taskInfo.completedChildrenCount} completed`;
  }

  /**
   * Build a comprehensive context about a task with smart tree depth
   * 
   * Strategy:
   * - Always include full path to root (breadcrumb)
   * - For ancestors: limit to ANCESTOR_DEPTH_LIMIT to avoid context explosion
   * - For descendants: include all children + their children (smart depth)
   * - Format in human-readable way (AI trained on human text)
   * 
   * @param taskId - The ID of the task to build context for
   * @returns Formatted context string for AI
   * @throws Error if task not found or AI not available
   */
  async buildTaskContext(taskId: string): Promise<string> {
    if (!this.isAiAvailable()) {
      throw new Error(
        'AI is not available. Please ensure you are logged in and online.'
      );
    }

    const tree = this.treeService.getLatestTree();
    if (!tree) {
      throw new Error('Task tree is not loaded');
    }

    const taskNode = this.treeNodeTools.findNodeById(tree.primarch, taskId);
    if (!taskNode) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Build the full ancestor chain (for context about project/feature scope)
    const ancestorChain = this.buildAncestorChain(taskId, tree);

    // Build the task hierarchy: limited ancestors + full descendants
    const taskHierarchy = this.buildSmartTaskHierarchy(taskNode, tree, ancestorChain);

    // Get context about current viewing session
    const viewingContext = this.getViewingSessionContext();

    // Combine all contexts
    const fullContext = `
═══════════════════════════════════════════════════════════════
TASK CONTEXT FOR AI TASK GENERATION
═══════════════════════════════════════════════════════════════

CURRENT CONTEXT:
${viewingContext}

TASK HIERARCHY:
${taskHierarchy}

═══════════════════════════════════════════════════════════════
Instructions: Use the task hierarchy above to understand the current 
scope and context. Generate tasks that fit naturally within this structure.
═══════════════════════════════════════════════════════════════
    `.trim();

    return fullContext;
  }

  /**
   * Generate child tasks for a given parent task using AI
   * 
   * @param parentTaskId - The ID of the parent task
   * @param prompt - User's instruction for what kind of tasks to generate
   * @param numberOfTasks - How many tasks to generate (default: 5)
   * @returns Array of generated task names/descriptions
   * @throws Error if not logged in or task not found
   */
  async generateChildTasks(
    parentTaskId: string,
    prompt: string,
    numberOfTasks: number = 5
  ): Promise<string[]> {
    if (!this.isAiAvailable()) {
      throw new Error(
        'AI is not available. Please ensure you are logged in and online.'
      );
    }

    // Build context about the parent task
    const taskContext = await this.buildTaskContext(parentTaskId);

    // TODO: Create a smart prompt that includes:
    // - The task context
    // - User's specific request
    // - Instructions to generate numberOfTasks items
    // - Format requirements for parsing results
    const aiPrompt = this.buildGenerationPrompt(
      taskContext,
      prompt,
      numberOfTasks
    );

    // Call AI API
    const response = await this.aiApiPrompt.callPrompt({
      prompt: aiPrompt,
      id: this.taskAssistantId,
      extraInstruction:
        'Generate tasks as a numbered list, one per line. Keep descriptions concise.',
    });

    // TODO: Parse response to extract generated task names
    // - Split by newlines
    // - Remove numbering
    // - Clean up whitespace
    // - Validate results
    const generatedTasks = this.parseGeneratedTasks(response.answer);

    return generatedTasks;
  }

  /**
   * Ask AI a question about a specific task
   * Provides task context automatically for informed responses
   * 
   * @param taskId - The task ID to ask about
   * @param question - The question to ask the AI
   * @returns AI's response
   * @throws Error if not logged in
   */
  async askAboutTask(taskId: string, question: string): Promise<string> {
    if (!this.isAiAvailable()) {
      throw new Error(
        'AI is not available. Please ensure you are logged in and online.'
      );
    }

    const taskContext = await this.buildTaskContext(taskId);

    const aiPrompt = `
${taskContext}

USER QUESTION: ${question}

Please answer based on the task context provided above.
    `.trim();

    const response = await this.aiApiPrompt.callPrompt({
      prompt: aiPrompt,
      id: this.taskAssistantId,
    });

    return response.answer;
  }

  /**
   * Get suggestions for breaking down a task further
   * Analyzes task complexity and suggests decomposition strategies
   * 
   * @param taskId - The task to analyze
   * @returns Array of suggestion strings
   * @throws Error if not logged in
   */
  async getSuggestions(taskId: string): Promise<string[]> {
    if (!this.isAiAvailable()) {
      throw new Error(
        'AI is not available. Please ensure you are logged in and online.'
      );
    }

    // TODO: Implement
    // - Analyze task name and structure
    // - Ask AI for decomposition suggestions
    // - Return actionable suggestions
    throw new Error('Not implemented: getSuggestions');
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Get the full ancestor chain from task to root
   * Returns array of node IDs in order: [root, ..., parent, taskId]
   */
  private buildAncestorChain(taskId: string, tree: TaskTree): string[] {
    const pathNodes = this.treeNodeTools.findPathToTask(taskId, tree.primarch);
    if (!pathNodes) return [taskId];
    return pathNodes.map(n => n.taskId);
  }

  /**
   * Build smart task hierarchy for AI context:
   * - Include limited ancestors (to avoid overwhelming context)
   * - Include all descendants with smart depth
   * - Format as human-readable tree
   */
  private buildSmartTaskHierarchy(
    currentNode: TaskTreeNode,
    tree: TaskTree,
    ancestorChain: string[]
  ): string {
    const lines: string[] = [];

    // 1. Build ancestor context (limited depth)
    lines.push('PROJECT/FEATURE CONTEXT (Ancestors):');
    const limitedAncestors = this.getAncestorsWithLimit(
      ancestorChain,
      this.ANCESTOR_DEPTH_LIMIT
    );

    for (let i = 0; i < limitedAncestors.length; i++) {
      const ancestorId = limitedAncestors[i];
      const ancestorNode = this.treeNodeTools.findNodeById(tree.primarch, ancestorId);
      
      if (ancestorNode) {
        const indent = '  '.repeat(i);
        const marker = ancestorId === currentNode.taskId ? '→ ' : '';
        lines.push(
          `${indent}${marker}[${ancestorNode.stage}] ${ancestorNode.name} (${ancestorNode.childrenCount} children)`
        );
      }
    }

    lines.push('');

    // 2. Build current task context
    lines.push('CURRENT TASK & CHILDREN:');
    this.formatNodeHierarchy(currentNode, tree, 0, lines, true);

    return lines.join('\n');
  }

  /**
   * Format a node and its children as human-readable tree
   * Recursively shows children and grandchildren with full names for AI context
   */
  private formatNodeHierarchy(
    node: TaskTreeNode,
    tree: TaskTree,
    depth: number,
    lines: string[],
    isCurrent: boolean = false,
    maxDepth: number = 3
  ): void {
    const indent = '  '.repeat(depth);
    const marker = isCurrent && depth === 0 ? '❯ ' : '';
    const completedInfo =
      node.completedChildrenCount > 0
        ? ` [${node.completedChildrenCount}/${node.childrenCount} done]`
        : '';

    lines.push(
      `${indent}${marker}[${node.stage}] ${node.name}${completedInfo}`
    );

    // Show all children with names, and recurse into grandchildren if depth allows
    if (node.children.length > 0 && depth < maxDepth) {
      for (const child of node.children) {
        this.formatNodeHierarchy(child, tree, depth + 1, lines, false, maxDepth);
      }
    } else if (node.children.length > 0) {
      // At max depth, show children names only (no grandchildren)
      for (const child of node.children) {
        const childIndent = '  '.repeat(depth + 1);
        const childCompleted = child.completedChildrenCount > 0 ? ` [${child.completedChildrenCount}/${child.childrenCount}]` : '';
        lines.push(`${childIndent}├─ [${child.stage}] ${child.name}${childCompleted}`);
      }
    }
  }

  /**
   * Get ancestors with a limit, preferring to show more recent ancestors
   * Strategy: always include root and current, limit middle ancestors
   */
  private getAncestorsWithLimit(chain: string[], limit: number): string[] {
    if (chain.length <= limit + 1) {
      return chain; // Include all
    }

    // Always include root and current
    const root = [chain[0]];
    const current = [chain[chain.length - 1]];
    const middle = chain.slice(1, -1);

    // Take last `limit - 1` middle items (most recent ancestors)
    const recentMiddle = middle.slice(-(limit - 1));

    return [...root, ...recentMiddle, ...current];
  }

  /**
   * Summarize child task stages for context
   * Returns string like "8 todo, 2 in_progress, 1 done"
   */
  private summarizeChildStages(children: TaskTreeNode[]): string {
    const stageCounts: Record<string, number> = {};
    
    for (const child of children) {
      stageCounts[child.stage] = (stageCounts[child.stage] || 0) + 1;
    }

    return Object.entries(stageCounts)
      .map(([stage, count]) => `${count} ${stage}`)
      .join(', ');
  }

  /**
   * Get context about current viewing session
   * Includes: current overlord, current list type, etc
   */
  private getViewingSessionContext(): string {
    const lines: string[] = [];

    // Get current overlord (parent task)
    const selectedOverlord = this.selectedOverlordService.getSelectedOverlord();
    if (selectedOverlord) {
      lines.push(`Parent Task: ${selectedOverlord.name} (${selectedOverlord.taskId})`);
    } else {
      lines.push(`Parent Task: ROOT (no specific parent)`);
    }

    // Get current list type
    // TODO: Implement when TaskListDataFacadeService.currentListKey$ Observable is available
    // This will show if we're viewing DAILY, FOCUS, OVERLORD, etc
    lines.push(`Viewing: Task hierarchy`);

    return lines.join('\n');
  }

  private buildGenerationPrompt(
    taskContext: string,
    userPrompt: string,
    numberOfTasks: number
  ): string {
    // TODO: Implement
    // - Combine task context with user prompt
    // - Add specific instructions for formatting
    // - Include guidance about task naming conventions
    // - Request specific number of tasks
    throw new Error('Not implemented: buildGenerationPrompt');
  }

  private parseGeneratedTasks(response: string): string[] {
    // TODO: Implement
    // - Split response by newlines
    // - Remove numbering (1., 2., etc)
    // - Clean up whitespace and special characters
    // - Filter out empty lines
    // - Validate task names (min/max length, no special chars)
    throw new Error('Not implemented: parseGeneratedTasks');
  }
}
