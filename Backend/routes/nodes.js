const express = require('express');
const router = express.Router();
const Node = require('../models/Node');

// Create a node
router.post('/', async (req, res) => {
    const node = new Node({
        projectId: req.body.projectId,
        type: req.body.type,
        content: req.body.content,
        position: req.body.position
    });

    try {
        const newNode = await node.save();
        res.status(201).json(newNode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a node
router.put('/:id', async (req, res) => {
    try {
        const node = await Node.findById(req.params.id);
        if (!node) return res.status(404).json({ message: 'Node not found' });

        if (req.body.content) node.content = req.body.content;
        if (req.body.position) node.position = req.body.position;
        if (req.body.type) node.type = req.body.type;

        const updatedNode = await node.save();
        res.json(updatedNode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
