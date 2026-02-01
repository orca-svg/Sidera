import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export const useStore = create((set, get) => ({
  // State
  projects: [], // [{ id, title, stars: [], edges: [], lastUpdated }]
  activeProjectId: null,

  // Derived View State (for UI to render current stars)
  nodes: [],
  edges: [],
  mode: 'formation',
  activeNode: null,

  // UI State
  isUniverseExpanded: false,
  toggleUniverse: () => set(state => ({ isUniverseExpanded: !state.isUniverseExpanded })),

  // --- Actions ---

  // 1. Create New Project (New Chat)
  createProject: async () => {
    const newId = uuidv4();
    const newProject = {
      id: newId,
      title: 'New Conversation',
      stars: [], // Nodes (stars) for this project
      edges: [],
      lastUpdated: new Date().toISOString()
    };

    set(state => ({
      projects: [newProject, ...state.projects],
      activeProjectId: newId,
      // Reset View
      nodes: [],
      edges: [],
      activeNode: null
    }));

    // Optional: Call backend to persist if needed
    // await get().initializeProjectBackend(newId); 
    return newId;
  },

  // 2. Switch Conversation
  setActiveProject: (id) => {
    const { projects } = get();
    const project = projects.find(p => p.id === id);
    if (project) {
      set({
        activeProjectId: id,
        nodes: project.stars || [],
        edges: project.edges || [],
        activeNode: null
      });
    }
  },

  // Backend Init Helper
  initializeProjectBackend: async (localId) => {
    try {
      console.log("[useStore] initializing backend project...");
      const res = await fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Constellation', localId })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const project = await res.json();
      console.log("[useStore] initialized backend project:", project._id);
      return project._id;
    } catch (err) {
      console.error("Failed to init project backend", err);
      return null;
    }
  },

  // Initialize App (Called on mount)
  initializeProject: async () => {
    // If no projects, create one
    if (get().projects.length === 0) {
      await get().createProject();
    }
  },

  addNode: async (content) => {
    const { activeProjectId, projects, nodes, activeNode } = get();

    // If no active project, create one first
    if (!activeProjectId) {
      await get().createProject();
    }

    console.log("[useStore] addNode:", content);

    // 1. Optimistic Update
    const tempId = 'temp-' + Date.now();
    const tempNode = {
      id: tempId,
      question: content,
      answer: 'Thinking...',
      keywords: ['...'],
      position: [0, 0, 0],
      isPending: true
    };

    const updatedNodes = [...nodes, tempNode];

    // Update VIEW and PROJECT state
    set(state => ({
      nodes: updatedNodes,
      activeNode: tempId,
      projects: state.projects.map(p =>
        p.id === state.activeProjectId
          ? { ...p, stars: updatedNodes, lastUpdated: new Date().toISOString() }
          : p
      )
    }));

    // 2. Call Chat API
    try {
      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          message: content,
          parentNodeId: activeNode && !activeNode.startsWith('temp-') ? activeNode : null
        })
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const formatNode = (n) => ({
        ...n,
        id: n._id || uuidv4(),
        position: n.position ? [n.position.x, n.position.y, n.position.z] : [0, 0, 0]
      });

      const newNode = formatNode(data.node);

      // Update Title if it's the first node
      let titleUpdate = {};
      if (nodes.length === 0) {
        titleUpdate = { title: content.substring(0, 30) + (content.length > 30 ? '...' : '') };
      }

      // 3. Replace Temp Node with Real Node
      const finalNodes = get().nodes.map(n => n.id === tempId ? newNode : n);

      set(state => ({
        nodes: finalNodes,
        activeNode: newNode.id,
        projects: state.projects.map(p =>
          p.id === state.activeProjectId
            ? { ...p, ...titleUpdate, stars: finalNodes, lastUpdated: new Date().toISOString() }
            : p
        )
      }));

    } catch (err) {
      console.error("Chat API Error", err);
      set(state => ({
        nodes: state.nodes.map(n =>
          n.id === tempId ? { ...n, answer: "Error connecting to the stars.", isPending: false } : n
        )
      }));
    }
  },

  setActiveNode: (id) => set({ activeNode: id }),
}))
