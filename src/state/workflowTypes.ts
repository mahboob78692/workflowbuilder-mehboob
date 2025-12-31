/**
 * Workflow Data Model
 * 
 * Represents a scalable workflow structure with nodes and parent-child relationships.
 * Supports branching logic for conditional workflows.
 */

export type NodeType = "start" | "action" | "branch" | "end";

/**
 * Represents a single node in the workflow
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  children: string[]; // Array of child node IDs
  // For branch nodes, children represent multiple paths (e.g., ["true", "false"])
  // For action nodes, children should have exactly one element
  // For end nodes, children is empty
}

/**
 * Complete workflow structure
 * Uses a map for O(1) node lookup by ID
 */
export interface Workflow {
  nodes: Record<string, WorkflowNode>; // Map of nodeId -> WorkflowNode
  rootId: string; // ID of the start node
}

/**
 * Position information for rendering nodes
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Layout information for the entire workflow
 */
export interface WorkflowLayout {
  positions: Record<string, NodePosition>;
  width: number;
  height: number;
}

/**
 * Action types for workflow reducer
 */
export type WorkflowAction =
  | { type: "ADD_NODE"; parentId: string; nodeType: NodeType; label?: string; branchIndex?: number }
  | { type: "DELETE_NODE"; nodeId: string }
  | { type: "UPDATE_NODE_LABEL"; nodeId: string; label: string }
  | { type: "INIT_WORKFLOW"; workflow: Workflow }
  | { type: "UNDO" }
  | { type: "REDO" };

/**
 * State with history for undo/redo
 */
export interface WorkflowState {
  workflow: Workflow;
  history: Workflow[];
  historyIndex: number;
}

