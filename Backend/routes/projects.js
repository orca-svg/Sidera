const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Node = require('../models/Node');
const Edge = require('../models/Edge');

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ updatedAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new project
router.post('/', async (req, res) => {
    const project = new Project({
        name: req.body.name || 'New Constellation'
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get single project with all nodes and edges
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const nodes = await Node.find({ projectId: req.params.id });
        const edges = await Edge.find({ projectId: req.params.id });

        res.json({
            project,
            nodes,
            edges
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
