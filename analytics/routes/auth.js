const express = require('express');
const bcrypt = require('bcryptjs');
const Database = require('../database/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const db = new Database();

// Initialize database
db.init().catch(console.error);

// Login route
router.post('/login', async (req, res) => {
    try {
        await authMiddleware.login(req, res);
    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    try {
        authMiddleware.logout(req, res);
    } catch (error) {
        console.error('Logout route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get current user info
router.get('/me', authMiddleware.verifyToken, async (req, res) => {
    try {
        await authMiddleware.getCurrentUser(req, res);
    } catch (error) {
        console.error('Get current user route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Create admin user (for initial setup)
router.post('/create-admin', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Check if admin already exists
        const existingAdmin = await db.getUserByUsername(username);
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin user already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create admin user
        const result = await db.createUser(username, passwordHash, email, 'admin');

        res.json({
            success: true,
            message: 'Admin user created successfully',
            userId: result.id
        });

    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Change password
router.post('/change-password', authMiddleware.verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get user
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.run(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPasswordHash, userId]
        );

        res.json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all users (admin only)
router.get('/users', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const users = await db.all(
            'SELECT id, username, email, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Deactivate user (admin only)
router.post('/users/:id/deactivate', authMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const userId = req.params.id;
        if (userId == req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }

        await db.run(
            'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        // Deactivate all sessions for this user
        await db.deactivateAllUserSessions(userId);

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });

    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;

