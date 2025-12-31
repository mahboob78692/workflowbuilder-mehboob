/**
 * Workflow Reducer
 * 
 * Handles all workflow state mutations with immutable updates.
 * Supports undo/redo functionality.
 */

import { Workflow, WorkflowNode, WorkflowAction, WorkflowState, NodeType } from "./workflowTypes";
import { generateNodeId } from "../utils/idGenerator";
import { findParentNodes, collectDescendants, validateNodeChildren } from "../utils/workflowHelpers";

/**
 * Creates a deep copy of the workflow for immutable updates
 */
function cloneWorkflow(workflow: Workflow): Workflow {
  const clonedNodes: Record<string, WorkflowNode> = {};
  
  for (const [id, node] of Object.entries(workflow.nodes)) {
    clonedNodes[id] = {
      ...node,
      children: [...node.children],
    };
  }
  
  return {
    nodes: clonedNodes,
    rootId: workflow.rootId,
  };
}

/**
 * Saves current state to history for undo/redo
 */
function saveToHistory(state: WorkflowState): WorkflowState {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(cloneWorkflow(state.workflow));
  
  // Limit history to 50 states
  const maxHistory = 50;
  if (newHistory.length > maxHistory) {
    newHistory.shift();
    return {
      ...state,
      workflow: cloneWorkflow(state.workflow),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  }
  
  return {
    ...state,
    workflow: cloneWorkflow(state.workflow),
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

/**
 * Main workflow reducer
 */
export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case "INIT_WORKFLOW": {
      return {
        workflow: action.workflow,
        history: [cloneWorkflow(action.workflow)],
        historyIndex: 0,
      };
    }

    case "ADD_NODE": {
      const { parentId, nodeType, label, branchIndex } = action;
      const workflow = cloneWorkflow(state.workflow);
      const parentNode = workflow.nodes[parentId];
      
      if (!parentNode) {
        console.error(`Parent node ${parentId} not found`);
        return state;
      }
      
      // Validate parent can have more children
      if (parentNode.type === "end") {
        console.error("Cannot add child to end node");
        return state;
      }
      
      // Create new node
      const newNodeId = generateNodeId();
      const newNode: WorkflowNode = {
        id: newNodeId,
        type: nodeType,
        label: label || getDefaultLabel(nodeType),
        children: [],
      };
      
      workflow.nodes[newNodeId] = newNode;
      
      // Add to parent's children
      if (branchIndex !== undefined) {
        // Insert at specific branch index
        if (branchIndex >= 0 && branchIndex <= parentNode.children.length) {
          parentNode.children.splice(branchIndex, 0, newNodeId);
        } else {
          parentNode.children.push(newNodeId);
        }
      } else {
        // Append to end
        parentNode.children.push(newNodeId);
      }
      
      // If parent was an action node and now has multiple children, it should be a branch
      // But we'll keep the type as-is since the user explicitly chose the parent type
      
      return saveToHistory({
        ...state,
        workflow,
      });
    }

    case "DELETE_NODE": {
      const { nodeId } = action;
      const workflow = cloneWorkflow(state.workflow);
      
      // Cannot delete root/start node
      if (nodeId === workflow.rootId) {
        console.error("Cannot delete start node");
        return state;
      }
      
      const nodeToDelete = workflow.nodes[nodeId];
      if (!nodeToDelete) {
        return state;
      }
      
      // Find parent(s)
      const parents = findParentNodes(workflow, nodeId);
      
      // Reconnect: parent -> node's children
      for (const parentId of parents) {
        const parentNode = workflow.nodes[parentId];
        if (parentNode) {
          const childIndex = parentNode.children.indexOf(nodeId);
          if (childIndex !== -1) {
            // Remove the deleted node
            parentNode.children.splice(childIndex, 1);
            // Add all children of deleted node at the same position
            parentNode.children.splice(childIndex, 0, ...nodeToDelete.children);
          }
        }
      }
      
      // Delete the node and all its descendants
      const descendants = collectDescendants(workflow, nodeId);
      delete workflow.nodes[nodeId];
      for (const descId of descendants) {
        delete workflow.nodes[descId];
      }
      
      // Clean up any references to deleted nodes
      for (const node of Object.values(workflow.nodes)) {
        node.children = node.children.filter(
          childId => workflow.nodes[childId] !== undefined
        );
      }
      
      return saveToHistory({
        ...state,
        workflow,
      });
    }

    case "UPDATE_NODE_LABEL": {
      const { nodeId, label } = action;
      const workflow = cloneWorkflow(state.workflow);
      const node = workflow.nodes[nodeId];
      
      if (!node) {
        return state;
      }
      
      workflow.nodes[nodeId] = {
        ...node,
        label: label.trim() || node.label,
      };
      
      return saveToHistory({
        ...state,
        workflow,
      });
    }

    case "UNDO": {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          ...state,
          workflow: cloneWorkflow(state.history[newIndex]),
          historyIndex: newIndex,
        };
      }
      return state;
    }

    case "REDO": {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          ...state,
          workflow: cloneWorkflow(state.history[newIndex]),
          historyIndex: newIndex,
        };
      }
      return state;
    }

    default:
      return state;
  }
}

/**
 * Gets default label for a node type
 */
function getDefaultLabel(nodeType: NodeType): string {
  switch (nodeType) {
    case "start":
      return "Start";
    case "action":
      return "Action";
    case "branch":
      return "Branch";
    case "end":
      return "End";
    default:
      return "Node";
  }
}

