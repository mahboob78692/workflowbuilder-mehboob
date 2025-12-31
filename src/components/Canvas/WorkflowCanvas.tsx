/**
 * Workflow Canvas Component
 * 
 * Main component that renders the workflow with nodes and connections
 */

import React, { useMemo, useState } from "react";
import { Workflow, NodeType } from "../../state/workflowTypes";
import { calculateLayout } from "../../utils/workflowHelpers";
import { Node } from "../Node/Node";
import { AddNodeMenu } from "../Controls/AddNodeMenu";
import "./WorkflowCanvas.css";

interface WorkflowCanvasProps {
  workflow: Workflow;
  onAddNode: (parentId: string, nodeType: NodeType, branchIndex?: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateNodeLabel: (nodeId: string, label: string) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow,
  onAddNode,
  onDeleteNode,
  onUpdateNodeLabel,
}) => {
  const [addMenuState, setAddMenuState] = useState<{
    parentId: string;
    position: { x: number; y: number };
    branchIndex?: number;
  } | null>(null);

  // Calculate layout whenever workflow changes
  const layout = useMemo(() => calculateLayout(workflow), [workflow]);

  const handleAddNodeClick = (parentId: string, event: React.MouseEvent) => {
    const node = workflow.nodes[parentId];
    if (!node || node.type === "end") return;

    const position = layout.positions[parentId];
    if (!position) return;

    // Position menu below the node
    setAddMenuState({
      parentId,
      position: {
        x: position.x,
        y: position.y + 80, // Below the node
      },
    });
  };

  const handleAddNodeForBranch = (
    parentId: string,
    branchIndex: number,
    event: React.MouseEvent
  ) => {
    const position = layout.positions[parentId];
    if (!position) return;

    setAddMenuState({
      parentId,
      position: {
        x: position.x,
        y: position.y + 80,
      },
      branchIndex,
    });
  };

  const handleSelectNodeType = (nodeType: NodeType) => {
    if (addMenuState) {
      onAddNode(
        addMenuState.parentId,
        nodeType,
        addMenuState.branchIndex
      );
      setAddMenuState(null);
    }
  };

  const handleCloseMenu = () => {
    setAddMenuState(null);
  };

  /**
   * Renders SVG connections between parent and child nodes
   */
  const renderConnections = () => {
    const connections: JSX.Element[] = [];

    for (const [nodeId, node] of Object.entries(workflow.nodes)) {
      const parentPos = layout.positions[nodeId];
      if (!parentPos) continue;

      for (let i = 0; i < node.children.length; i++) {
        const childId = node.children[i];
        const childPos = layout.positions[childId];
        if (!childPos) continue;

        // Calculate connection points
        const startX = parentPos.x;
        const startY = parentPos.y + 50; // Bottom of parent node
        const endX = childPos.x;
        const endY = childPos.y - 50; // Top of child node

        // For branch nodes, offset the connection horizontally
        const isBranch = node.type === "branch";
        const branchOffset = isBranch
          ? ((i - (node.children.length - 1) / 2) * 30)
          : 0;

        const adjustedStartX = startX + branchOffset;
        const adjustedEndX = endX;

        // Calculate control points for smooth curve
        const midY = (startY + endY) / 2;
        const controlY1 = startY + 40;
        const controlY2 = endY - 40;

        // Create path for smooth bezier curve
        const path = `M ${adjustedStartX} ${startY} C ${adjustedStartX} ${controlY1}, ${adjustedEndX} ${controlY2}, ${adjustedEndX} ${endY}`;

        connections.push(
          <g key={`${nodeId}-${childId}-${i}`}>
            <path
              d={path}
              fill="none"
              stroke="#999"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="workflow-connection"
            />
            {/* Branch label for branch nodes */}
            {isBranch && node.children.length > 1 && (
              <text
                x={(adjustedStartX + adjustedEndX) / 2}
                y={midY - 10}
                textAnchor="middle"
                fontSize="11"
                fill="#666"
                className="branch-label"
              >
                {i === 0 ? "Yes" : i === 1 ? "No" : `Path ${i + 1}`}
              </text>
            )}
          </g>
        );
      }
    }

    return connections;
  };

  return (
    <div className="workflow-canvas-container">
      <div className="workflow-canvas-wrapper" style={{ 
        width: layout.width, 
        height: layout.height, 
        position: 'relative',
        margin: '0 auto',
        paddingTop: '20px'
      }}>
        <svg
          className="workflow-canvas-svg"
          width={layout.width}
          height={layout.height}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3, 0 6"
                fill="#999"
              />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        <div className="workflow-canvas-nodes">
          {Object.values(workflow.nodes).map((node) => {
            const position = layout.positions[node.id];
            if (!position) {
              console.warn(`No position found for node ${node.id}`);
              return null;
            }

            return (
              <Node
                key={node.id}
                node={node}
                position={position}
                onLabelUpdate={onUpdateNodeLabel}
                onDelete={onDeleteNode}
                onAddNode={handleAddNodeClick}
                canDelete={true}
                isRoot={node.id === workflow.rootId}
              />
            );
          })}
        </div>
      </div>

      {addMenuState && (
        <AddNodeMenu
          parentId={addMenuState.parentId}
          position={addMenuState.position}
          onSelectNodeType={handleSelectNodeType}
          onClose={handleCloseMenu}
          branchIndex={addMenuState.branchIndex}
        />
      )}
    </div>
  );
};

