import { create } from 'zustand'

export const useStore = create((set, get) => ({
  nodes: [],
  edges: [],
  mode: 'formation',
  activeNode: null,
  projectId: null,

  // UI State
  isUniverseExpanded: false,
  toggleUniverse: () => set(state => ({ isUniverseExpanded: !state.isUniverseExpanded })),

  // Actions
  initializeProject: async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Constellation' })
      });
      const project = await res.json();
      set({ projectId: project._id });
      return project._id;
    } catch (err) {
      console.error("Failed to init project", err);
      return null;
    }
  },

  addNode: async (content) => {
    const { nodes, activeNode, projectId, initializeProject } = get()

    let currentProjectId = projectId;
    if (!currentProjectId) {
      currentProjectId = await initializeProject();
    }
    if (!currentProjectId) return;

    // Call Chat API
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: currentProjectId,
          message: content,
          parentNodeId: activeNode // Optional parent
        })
      });

      const data = await res.json();
      // data: { node, edge } which contains question, answer, keywords...

      const formatNode = (n) => ({
        ...n,
        id: n._id,
        position: [n.position.x, n.position.y, n.position.z]
      });

      const newNode = formatNode(data.node);

      let newEdges = [...get().edges];
      if (data.edge) {
        newEdges.push({
          id: data.edge._id,
          source: data.edge.source,
          target: data.edge.target,
          type: data.edge.type
        });
      }

      set({
        nodes: [...nodes, newNode],
        edges: newEdges,
        activeNode: newNode.id,
      });

    } catch (err) {
      console.error("Chat API Error", err);
    }
  },

  setActiveNode: (id) => set({ activeNode: id }),
}))
