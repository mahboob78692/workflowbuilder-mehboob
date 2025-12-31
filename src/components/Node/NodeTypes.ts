/**
 * Node Type Definitions and Constants
 */

import { NodeType } from "../../state/workflowTypes";

export const NODE_TYPES: NodeType[] = ["start", "action", "branch", "end"];

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  start: "Start",
  action: "Action",
  branch: "Branch",
  end: "End",
};

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  start: "#4CAF50",
  action: "#2196F3",
  branch: "#FF9800",
  end: "#F44336",
};

