import { Router } from 'express';
import { readJSON } from '../storage.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/users/me/stats:
 *   get:
 *     summary: Stats for the current user
 *     tags: [Users]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Counts of plants/tips/waterings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plants: { type: integer }
 *                 tips: { type: integer }
 *                 waterings: { type: integer }
 */
router.get('/me/stats', requireAuth, async (req, res) => {
  const [plants, tips] = await Promise.all([
    readJSON('plants.json'),
    readJSON('tips.json'),
  ]);
  const myPlants = plants.filter((p) => p.user_id === req.session.userId);
  const myTips = tips.filter((t) => t.user_id === req.session.userId);
  res.json({
    plants: myPlants.length,
    tips: myTips.length,
    waterings: myPlants.length * 4,
  });
});

export default router;
