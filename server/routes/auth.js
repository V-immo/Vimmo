const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db'); // This is now the Supabase client
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'zoeker' } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'Alle velden zijn verplicht' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Wachtwoord moet minimaal 8 karakters zijn' });
        }

        // Check if user exists
        const { data: existingUser } = await db
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Dit e-mailadres is al geregistreerd' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert user
        const { data: newUser, error: insertError } = await db
            .from('users')
            .insert([
                {
                    email: email.toLowerCase(),
                    password_hash: passwordHash,
                    first_name: firstName,
                    last_name: lastName,
                    role,
                    verification_token: verificationToken,
                    verified: false
                }
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        // Send verification email
        const emailSent = await sendVerificationEmail(email, firstName, verificationToken);

        res.status(201).json({
            message: 'Account aangemaakt! Check je email om je account te bevestigen.',
            emailSent,
            userId: newUser.id
        });

    } catch (error) {
        console.error('[AUTH] Registration error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email en wachtwoord zijn verplicht' });
        }

        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Ongeldige inloggegevens' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Ongeldige inloggegevens' });
        }

        if (!user.verified) {
            return res.status(403).json({
                error: 'Je email is nog niet geverifieerd. Check je inbox.',
                needsVerification: true
            });
        }

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
 */
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('verification_token', token)
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Ongeldige of verlopen verificatie link' });
        }

        const { error: updateError } = await db
            .from('users')
            .update({ verified: true, verification_token: null })
            .eq('id', user.id);

        if (updateError) throw updateError;

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
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is verplicht' });

        const { data: user } = await db
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (!user) {
            return res.json({ message: 'Als dit e-mailadres bestaat, ontvang je een reset link.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000;

        await db
            .from('users')
            .update({ reset_token: resetToken, reset_token_expires: expires })
            .eq('id', user.id);

        await sendPasswordResetEmail(email, user.first_name, resetToken);
        res.json({ message: 'Als dit e-mailadres bestaat, ontvang je een reset link.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ error: 'Token en nieuw wachtwoord zijn verplicht' });

        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('reset_token', token)
            .gt('reset_token_expires', Date.now())
            .single();

        if (error || !user) {
            return res.status(400).json({ error: 'Ongeldige of verlopen reset link' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        await db
            .from('users')
            .update({ password_hash: passwordHash, reset_token: null, reset_token_expires: null })
            .eq('id', user.id);

        res.json({ message: 'Wachtwoord succesvol gewijzigd! Je kunt nu inloggen.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Er is iets misgegaan. Probeer het later opnieuw.' });
    }
});

module.exports = router;
