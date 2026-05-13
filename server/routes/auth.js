import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { readJSON, writeJSON, nextId } from '../storage.js';

const router = Router();

function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    city: u.city,
    role: u.role,
    created_at: u.created_at,
  };
}

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 20 }
 *               password: { type: string, minLength: 6 }
 *               city: { type: string }
 *     responses:
 *       201: { description: User created, sets session cookie }
 *       400: { description: Validation error or username taken }
 */
router.post('/register', async (req, res) => {
  const { username, password, city = 'Kyiv' } = req.body || {};
  if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'логін: 3-20 символів (a-z, 0-9, _)' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'пароль: мінімум 6 символів' });
  }
  const users = await readJSON('users.json');
  if (users.find((u) => u.username === username)) {
    return res.status(400).json({ error: 'логін зайнятий' });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: await nextId(users),
    username,
    password_hash: hash,
    city,
    role: 'user',
    created_at: new Date().toISOString(),
  };
  users.push(user);
  await writeJSON('users.json', users);
  req.session.userId = user.id;
  req.session.role = user.role;
  res.status(201).json({ user: publicUser(user) });
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in by username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in, sets session cookie }
 *       401: { description: Wrong credentials }
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const users = await readJSON('users.json');
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: 'невірні логін або пароль' });
  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) return res.status(401).json({ error: 'невірні логін або пароль' });
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ user: publicUser(user) });
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out and destroy session
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('plant.sid');
    res.json({ ok: true });
  });
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get currently logged-in user from session
 *     tags: [Auth]
 *     responses:
 *       200: { description: Returns user object }
 *       401: { description: Not logged in }
 */
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'не авторизовано' });
  const users = await readJSON('users.json');
  const user = users.find((u) => u.id === req.session.userId);
  if (!user) return res.status(401).json({ error: 'не авторизовано' });
  res.json({ user: publicUser(user) });
});

export default router;
