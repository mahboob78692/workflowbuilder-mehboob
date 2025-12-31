/**
 * Utility functions for workflow operations
 */

import { Workflow, WorkflowNode, NodeType, NodePosition, WorkflowLayout } from "../state/workflowTypes";

/**
 * Creates an initial workflow with a single Start node
 */
export function createInitialWorkflow(): Workflow {
  const startNode: WorkflowNode = {
    id: "start",
    type: "start",
    label: "Start",
    children: [],
  };

  return {
    nodes: {
      start: startNode,
    },
    rootId: "start",
  };
}

/**
 * Validates that a node type can have the specified number of children
 */
export function validateNodeChildren(nodeType: NodeType, childrenCount: number): boolean {
  switch (nodeType) {
    case "start":
      return childrenCount <= 1; // Start can have 0 or 1 child
    case "action":
      return childrenCount === 1; // Action must have exactly 1 child
    case "branch":
      return childrenCount >= 2; // Branch must have at least 2 children
    case "end":
      return childrenCount === 0; // End must have 0 children
    default:
      return false;
  }
}

/**
 * Finds all parent nodes of a given node
 */
export function findParentNodes(workflow: Workflow, nodeId: string): string[] {
  const parents: string[] = [];
  
  for (const [id, node] of Object.entries(workflow.nodes)) {
    if (node.children.includes(nodeId)) {
      parents.push(id);
    }
  }
  
  return parents;
}

/**
 * Recursively collects all descendant node IDs starting from a given node
 */
export function collectDescendants(workflow: Workflow, nodeId: string): string[] {
  const descendants: string[] = [];
  const node = workflow.nodes[nodeId];
  
  if (!node) return descendants;
  
  for (const childId of node.children) {
    descendants.push(childId);
    descendants.push(...collectDescendants(workflow, childId));
  }
  
  return descendants;
}

/**
 * Calculates a tree layout for the workflow
 * Uses a simple vertical tree layout algorithm
 */
export function calculateLayout(workflow: Workflow): WorkflowLayout {
  const positions: Record<string, NodePosition> = {};
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 100;
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 150;
  
  // Track nodes at each level
  const levels: string[][] = [];
  
  /**
   * Recursively assign nodes to levels
   */
  function assignLevels(nodeId: string, level: number): void {
    if (level >= levels.length) {
      levels.push([]);
    }
    levels[level].push(nodeId);
    
    const node = workflow.nodes[nodeId];
    if (node) {
      for (const childId of node.children) {
        assignLevels(childId, level + 1);
      }
    }
  }
  
  assignLevels(workflow.rootId, 0);
  
  // Calculate positions for each level
  // First, find the maximum width needed
  const maxNodesInLevel = Math.max(...levels.map(level => level.length), 1);
  const totalCanvasWidth = Math.max(maxNodesInLevel * HORIZONTAL_SPACING, 800);
  const centerX = totalCanvasWidth / 2;
  
  for (let level = 0; level < levels.length; level++) {
    const nodesInLevel = levels[level];
    const levelY = level * VERTICAL_SPACING + 50;
    
    // Center nodes horizontally within the level
    const levelWidth = nodesInLevel.length * HORIZONTAL_SPACING;
    const startX = centerX - levelWidth / 2 + HORIZONTAL_SPACING / 2;
    
    nodesInLevel.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + index * HORIZONTAL_SPACING,
        y: levelY,
      };
    });
  }
  
  // Calculate canvas dimensions
  const maxLevel = levels.length - 1;
  
  const width = totalCanvasWidth;
  const height = maxLevel * VERTICAL_SPACING + NODE_HEIGHT + 100;
  
  return {
    positions,
    width,
    height,
  };
}

/**
 * Validates the entire workflow structure
 */
export function validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check root exists
  if (!workflow.nodes[workflow.rootId]) {
    errors.push("Root node does not exist");
    return { valid: false, errors };
  }
  
  // Check root is start node
  if (workflow.nodes[workflow.rootId].type !== "start") {
    errors.push("Root node must be a start node");
  }
  
  // Validate each node
  for (const [id, node] of Object.entries(workflow.nodes)) {
    // Validate children count
    if (!validateNodeChildren(node.type, node.children.length)) {
      errors.push(`Node ${id} (${node.type}) has invalid number of children: ${node.children.length}`);
    }
    
    // Validate all children exist
    for (const childId of node.children) {
      if (!workflow.nodes[childId]) {
        errors.push(`Node ${id} references non-existent child: ${childId}`);
      }
    }
  }
  
  // Check for orphaned nodes (nodes not reachable from root)
  const visited = new Set<string>();
  function traverse(nodeId: string): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = workflow.nodes[nodeId];
    if (node) {
      for (const childId of node.children) {
        traverse(childId);
      }
    }
  }
  traverse(workflow.rootId);
  
  for (const nodeId of Object.keys(workflow.nodes)) {
    if (!visited.has(nodeId)) {
      errors.push(`Node ${nodeId} is orphaned (not reachable from root)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

