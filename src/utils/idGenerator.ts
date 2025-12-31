/**
 * Utility for generating unique IDs for workflow nodes
 */

let idCounter = 0;

/**
 * Generates a unique ID for a workflow node
 * Format: node_<timestamp>_<counter>
 */
export function generateNodeId(): string {
  idCounter += 1;
  return `node_${Date.now()}_${idCounter}`;
}

/**
 * Resets the ID counter (useful for testing)
 */
export function resetIdGenerator(): void {
  idCounter = 0;
}

