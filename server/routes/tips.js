import { Router } from 'express';
import { readJSON, writeJSON, nextId } from '../storage.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/tips:
 *   get:
 *     summary: List community tips with pagination
 *     tags: [Tips]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Array of tips }
 */
router.get('/', async (req, res) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  const page = Math.max(1, Number(req.query.page) || 1);
  const tips = await readJSON('tips.json');
  const sorted = [...tips].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const start = (page - 1) * limit;
  res.json({
    tips: sorted.slice(start, start + limit),
    total: sorted.length,
    page,
    limit,
  });
});

/**
 * @openapi
 * /api/tips:
 *   post:
 *     summary: Publish a new tip
 *     tags: [Tips]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string, minLength: 3 }
 *               body: { type: string, minLength: 10 }
 *               email: { type: string, format: email }
 *     responses:
 *       201: { description: Tip created }
 *       400: { description: Validation error }
 */
router.post('/', requireAuth, async (req, res) => {
  const { title, body, email } = req.body || {};
  if (!title || title.length < 3) return res.status(400).json({ error: 'заголовок мінімум 3 символи' });
  if (!body || body.length < 10) return res.status(400).json({ error: 'текст мінімум 10 символів' });
  const users = await readJSON('users.json');
  const author = users.find((u) => u.id === req.session.userId);
  const tips = await readJSON('tips.json');
  const tip = {
    id: await nextId(tips),
    user_id: req.session.userId,
    author: author?.username || 'guest',
    title,
    body,
    email: email || null,
    avatar: '/images/avatar1.png',
    image: '/images/tip1.jpg',
    likes: 0,
    comments: 0,
    created_at: new Date().toISOString(),
  };
  tips.push(tip);
  await writeJSON('tips.json', tips);
  res.status(201).json({ tip });
});

/**
 * @openapi
 * /api/tips/{id}/like:
 *   post:
 *     summary: Like a tip
 *     tags: [Tips]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated tip }
 *       404: { description: Not found }
 */
router.post('/:id/like', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const tips = await readJSON('tips.json');
  const idx = tips.findIndex((t) => t.id === id);
  if (idx < 0) return res.status(404).json({ error: 'не знайдено' });
  tips[idx].likes = (tips[idx].likes || 0) + 1;
  await writeJSON('tips.json', tips);
  res.json({ tip: tips[idx] });
});

export default router;
