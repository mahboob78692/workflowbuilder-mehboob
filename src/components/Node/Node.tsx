/**
 * Node Component
 * 
 * Renders a single workflow node with edit and delete capabilities
 */

import React, { useState, useRef, useEffect } from "react";
import { WorkflowNode, NodePosition } from "../../state/workflowTypes";
import { NODE_TYPE_COLORS } from "./NodeTypes";
import "./Node.css";

interface NodeProps {
  node: WorkflowNode;
  position: NodePosition;
  onLabelUpdate: (nodeId: string, label: string) => void;
  onDelete: (nodeId: string) => void;
  onAddNode: (parentId: string) => void;
  canDelete: boolean;
  isRoot: boolean;
}

export const Node: React.FC<NodeProps> = ({
  node,
  position,
  onLabelUpdate,
  onDelete,
  onAddNode,
  canDelete,
  isRoot,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(node.label);
  }, [node.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleLabelClick = () => {
    setIsEditing(true);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    if (editValue.trim() !== node.label) {
      onLabelUpdate(node.id, editValue.trim());
    } else {
      setEditValue(node.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditValue(node.label);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canDelete && !isRoot) {
      onDelete(node.id);
    }
  };

  const handleAddNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type !== "end") {
      onAddNode(node.id);
    }
  };

  const nodeColor = NODE_TYPE_COLORS[node.type];
  const hasChildren = node.children.length > 0;
  const isBranch = node.type === "branch";

  return (
    <div
      className="workflow-node"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        borderColor: nodeColor,
      }}
      data-node-type={node.type}
    >
      <div className="node-content">
        <div className="node-type-badge" style={{ backgroundColor: nodeColor }}>
          {node.type}
        </div>
        
        <div className="node-label-container" onClick={handleLabelClick}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="node-label-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="node-label">{node.label || "Unnamed"}</div>
          )}
        </div>

        {isBranch && (
          <div className="node-branch-indicator">
            {node.children.length} branch{node.children.length !== 1 ? "es" : ""}
          </div>
        )}
      </div>

      <div className="node-controls">
        {node.type !== "end" && (
          <button
            className="node-control-btn node-add-btn"
            onClick={handleAddNode}
            title="Add node"
          >
            +
          </button>
        )}
        {canDelete && !isRoot && (
          <button
            className="node-control-btn node-delete-btn"
            onClick={handleDelete}
            title="Delete node"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

