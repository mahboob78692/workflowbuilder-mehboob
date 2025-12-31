/**
 * Add Node Menu Component
 * 
 * Provides a menu for adding new nodes to the workflow
 */

import React, { useState, useRef, useEffect } from "react";
import { NodeType } from "../../state/workflowTypes";
import { NODE_TYPES, NODE_TYPE_LABELS } from "../Node/NodeTypes";
import "./Controls.css";

interface AddNodeMenuProps {
  parentId: string;
  position: { x: number; y: number };
  onSelectNodeType: (nodeType: NodeType) => void;
  onClose: () => void;
  branchIndex?: number; // For branch nodes, which branch to add to
}

export const AddNodeMenu: React.FC<AddNodeMenuProps> = ({
  parentId,
  position,
  onSelectNodeType,
  onClose,
  branchIndex,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleNodeTypeClick = (nodeType: NodeType) => {
    onSelectNodeType(nodeType);
    onClose();
  };

  // Filter available node types based on context
  const availableTypes: NodeType[] = NODE_TYPES.filter((type) => {
    // Can't add start node (only one exists)
    if (type === "start") return false;
    return true;
  });

  return (
    <div
      ref={menuRef}
      className="add-node-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="add-node-menu-header">
        {branchIndex !== undefined
          ? `Add to branch ${branchIndex + 1}`
          : "Add Node"}
      </div>
      <div className="add-node-menu-items">
        {availableTypes.map((nodeType) => (
          <button
            key={nodeType}
            className="add-node-menu-item"
            onClick={() => handleNodeTypeClick(nodeType)}
            data-node-type={nodeType}
          >
            <span className="menu-item-label">
              {NODE_TYPE_LABELS[nodeType]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

