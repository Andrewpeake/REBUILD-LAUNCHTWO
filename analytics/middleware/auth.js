const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('../database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'uam-analytics-secret-key-2024';
const JWT_EXPIRES_IN = '24h';

class AuthMiddleware {
    constructor() {
        this.db = new Database();
        this.db.init().catch(console.error);
    }

    // Generate JWT token
    generateToken(userId, username) {
        return jwt.sign(
            { userId, username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    // Verify JWT token
    verifyToken(req, res, next) {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.session?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid token.' 
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required'
                });
            }

            // Get user from database
            const user = await this.db.getUserByUsername(username);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate token
            const token = this.generateToken(user.id, user.username);

            // Store token in session
            req.session.token = token;
            req.session.userId = user.id;
            req.session.username = user.username;

            // Update last login
            await this.db.updateLastLogin(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.last_login
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Logout user
    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Could not log out'
                });
            }
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    }

    // Check if user is authenticated (for dashboard access)
    checkAuth(req, res, next) {
        if (req.session && req.session.token) {
            // Verify the session token
            try {
                const decoded = jwt.verify(req.session.token, JWT_SECRET);
                req.user = decoded;
                next();
            } catch (error) {
                // Token is invalid, redirect to login
                req.session.destroy();
                return res.redirect('/login');
            }
        } else {
            return res.redirect('/login');
        }
    }

    // Get current user info
    async getCurrentUser(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            const user = await this.db.getUserById(req.session.userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    lastLogin: user.last_login,
                    createdAt: user.created_at
                }
            });

        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new AuthMiddleware();

