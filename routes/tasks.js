const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// GET /api/tasks - public
router.get('/', taskController.getTasks);
// GET /api/tasks/:id - public
router.get('/:id', taskController.getTaskById);

// POST /api/tasks - admin only
router.post('/', authMiddleware, adminMiddleware, taskController.createTask);
// PUT /api/tasks/:id - admin only
router.put('/:id', authMiddleware, adminMiddleware, taskController.updateTask);
// DELETE /api/tasks/:id - admin only
router.delete('/:id', authMiddleware, adminMiddleware, taskController.deleteTask);

module.exports = router;
