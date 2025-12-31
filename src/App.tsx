/**
 * Main App Component
 * 
 * Integrates workflow state management with the canvas
 */

import React, { useReducer, useCallback } from "react";
import { WorkflowState, WorkflowAction, NodeType } from "./state/workflowTypes";
import { workflowReducer } from "./state/workflowReducer";
import { createInitialWorkflow } from "./utils/workflowHelpers";
import { WorkflowCanvas } from "./components/Canvas/WorkflowCanvas";
import "./styles.css";

function App() {
  const initialState: WorkflowState = {
    workflow: createInitialWorkflow(),
    history: [createInitialWorkflow()],
    historyIndex: 0,
  };

  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const handleAddNode = useCallback(
    (parentId: string, nodeType: NodeType, branchIndex?: number) => {
      dispatch({
        type: "ADD_NODE",
        parentId,
        nodeType,
        branchIndex,
      });
    },
    []
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    dispatch({
      type: "DELETE_NODE",
      nodeId,
    });
  }, []);

  const handleUpdateNodeLabel = useCallback((nodeId: string, label: string) => {
    dispatch({
      type: "UPDATE_NODE_LABEL",
      nodeId,
      label,
    });
  }, []);

  const handleSaveWorkflow = useCallback(() => {
    const workflowJson = JSON.stringify(state.workflow, null, 2);
    console.log("Workflow JSON:", workflowJson);
    alert("Workflow saved! Check the console for JSON output.");
  }, [state.workflow]);

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const handleRedo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Workflow Builder</h1>
        <div className="app-controls">
          <button
            className="control-btn undo-btn"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶ Undo
          </button>
          <button
            className="control-btn redo-btn"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷ Redo
          </button>
          <button
            className="control-btn save-btn"
            onClick={handleSaveWorkflow}
            title="Save Workflow"
          >
            💾 Save Workflow
          </button>
        </div>
      </header>

      <main className="app-main">
        <WorkflowCanvas
          workflow={state.workflow}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onUpdateNodeLabel={handleUpdateNodeLabel}
        />
      </main>
    </div>
  );
}

export default App;

