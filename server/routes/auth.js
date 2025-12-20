const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user and send verification email
 */
router.post('/register', async (req, res) => {
    console.log('\n========================================');
    console.log('[AUTH] 📝 POST /register - New registration request');
    console.log('========================================');
    console.log('[AUTH] Timestamp:', new Date().toISOString());
    console.log('[AUTH] Request body:', {
        ...req.body,
        password: req.body.password ? '[REDACTED]' : undefined
    });

    try {
        const { email, password, firstName, lastName, role = 'zoeker' } = req.body;

        // Validate input
        console.log('[AUTH] Step 1: Validating input...');
        if (!email || !password || !firstName || !lastName) {
            console.log('[AUTH] ❌ Validation FAILED: Missing required fields');
            console.log('[AUTH] Fields received:', { 
                email: !!email, 
                password: !!password, 
                firstName: !!firstName, 
                lastName: !!lastName 
            });
            return res.status(400).json({ error: 'Alle velden zijn verplicht' });
        }

        if (password.length < 8) {
            console.log('[AUTH] ❌ Validation FAILED: Password too short (' + password.length + ' chars)');
            return res.status(400).json({ error: 'Wachtwoord moet minimaal 8 karakters zijn' });
        }
        console.log('[AUTH] ✓ Input validation passed');

        // Check if user exists
        console.log('[AUTH] Step 2: Checking if user already exists...');
        console.log('[AUTH] Looking for email:', email.toLowerCase());
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existingUser) {
            console.log('[AUTH] ❌ User already exists with ID:', existingUser.id);
            return res.status(400).json({ error: 'Dit e-mailadres is al geregistreerd' });
        }
        console.log('[AUTH] ✓ Email is available');

        // Hash password
        console.log('[AUTH] Step 3: Hashing password...');
        const passwordHash = await bcrypt.hash(password, 12);
        console.log('[AUTH] ✓ Password hashed successfully');

        // Generate verification token
        console.log('[AUTH] Step 4: Generating verification token...');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        console.log('[AUTH] ✓ Token generated:', verificationToken.substring(0, 10) + '...');

        // Insert user
        console.log('[AUTH] Step 5: Inserting user into database...');
        console.log('[AUTH] User data:', { 
            email: email.toLowerCase(), 
            firstName, 
            lastName, 
            role 
        });
        const result = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, verification_token)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(email.toLowerCase(), passwordHash, firstName, lastName, role, verificationToken);
        console.log('[AUTH] ✓ User inserted with ID:', result.lastInsertRowid);

        // Send verification email
        console.log('[AUTH] Step 6: Sending verification email...');
        const emailSent = await sendVerificationEmail(email, firstName, verificationToken);
        console.log('[AUTH] Email send result:', emailSent ? '✓ SENT' : '❌ FAILED');

        console.log('[AUTH] ========================================');
        console.log('[AUTH] ✅ REGISTRATION COMPLETE');
        console.log('[AUTH] User ID:', result.lastInsertRowid);
        console.log('[AUTH] Email:', email);
        console.log('[AUTH] Role:', role);
        console.log('[AUTH] ========================================\n');

        res.status(201).json({
            message: 'Account aangemaakt! Check je email om je account te bevestigen.',
            emailSent,
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('[AUTH] ❌ REGISTRATION ERROR');
        console.error('[AUTH] Error name:', error.name);
        console.error('[AUTH] Error message:', error.message);
        console.error('[AUTH] Stack trace:', error.stack);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Ongeldige inloggegevens' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Ongeldige inloggegevens' });
        }

        // Check if verified
        if (!user.verified) {
            return res.status(403).json({
                error: 'Je email is nog niet geverifieerd. Check je inbox.',
                needsVerification: true
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Succesvol ingelogd!',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * GET /api/auth/verify/:token
 * Verify user's email address
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this token
        const user = db.prepare('SELECT * FROM users WHERE verification_token = ?').get(token);
        if (!user) {
            return res.status(400).json({ error: 'Ongeldige of verlopen verificatie link' });
        }

        // Mark as verified
        db.prepare('UPDATE users SET verified = 1, verification_token = NULL WHERE id = ?').run(user.id);

        res.json({
            message: 'Email succesvol geverifieerd! Je kunt nu inloggen.',
            user: {
                email: user.email,
                firstName: user.first_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is verplicht' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'Als dit e-mailadres bestaat, ontvang je een reset link.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour

        // Save reset token
        db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
            .run(resetToken, expires, user.id);

        // Send reset email
        await sendPasswordResetEmail(email, user.first_name, resetToken);

        res.json({ message: 'Als dit e-mailadres bestaat, ontvang je een reset link.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset user's password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token en nieuw wachtwoord zijn verplicht' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Wachtwoord moet minimaal 8 karakters zijn' });
        }

        // Find user with valid token
        const user = db.prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?')
            .get(token, Date.now());

        if (!user) {
            return res.status(400).json({ error: 'Ongeldige of verlopen reset link' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12);

        // Update password and clear reset token
        db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
            .run(passwordHash, user.id);

        res.json({ message: 'Wachtwoord succesvol gewijzigd! Je kunt nu inloggen.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is verplicht' });
        }

        // Find unverified user
        const user = db.prepare('SELECT * FROM users WHERE email = ? AND verified = 0').get(email.toLowerCase());

        if (!user) {
            return res.json({ message: 'Als dit e-mailadres bestaat en niet geverifieerd is, ontvang je een nieuwe link.' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Update token
        db.prepare('UPDATE users SET verification_token = ? WHERE id = ?')
            .run(verificationToken, user.id);

        // Send verification email
        await sendVerificationEmail(email, user.first_name, verificationToken);

        res.json({ message: 'Nieuwe verificatie email verzonden!' });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

module.exports = router;
