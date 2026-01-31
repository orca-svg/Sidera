const express = require('express');
const router = express.Router();
const Node = require('../models/Node');
const Edge = require('../models/Edge');
const { generateResponse } = require('../services/aiService');

// Helper for 3D positioning
// V2: Place nodes in a spiral or cluster based on importance/sequence?
// For now, keep random spread but maybe influenced by importance (higher importance = closer to center? or just bigger?)
const calculatePosition = (basePos) => {
    const spread = 5;
    return {
        x: basePos.x + (Math.random() - 0.5) * spread,
        y: basePos.y + (Math.random() - 0.5) * spread,
        z: basePos.z + (Math.random() - 0.5) * spread
    };
};

router.post('/', async (req, res) => {
    const { projectId, message, parentNodeId } = req.body;

    try {
        // 1. Find parent node position (or default)
        let parentPos = { x: 0, y: 0, z: 0 };
        if (parentNodeId) {
            const parent = await Node.findById(parentNodeId);
            if (parent) parentPos = parent.position;
        }

        // 2. Call AI Service to get Answer, Keywords, Importance
        const aiData = await generateResponse(message);
        // aiData = { answer, keywords, importance }

        // 3. Create Single Node (Question + Answer)
        const newNode = new Node({
            projectId,
            question: message,
            answer: aiData.answer,
            keywords: aiData.keywords || [],
            importance: aiData.importance || 2,
            position: calculatePosition(parentPos)
        });
        await newNode.save();

        // 4. Create Edge from Previous Node -> New Node
        let newEdge = null;
        if (parentNodeId) {
            // Logic: If parent importance is high, maybe make a solid connection?
            const edgeType = (aiData.importance >= 4) ? 'solid' : 'solid'; // Could distinguish later

            newEdge = new Edge({
                projectId,
                source: parentNodeId,
                target: newNode._id,
                type: edgeType
            });
            await newEdge.save();
        }

        res.json({
            node: newNode,
            edge: newEdge
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
