import { Router } from 'express';
import { readJSON, writeJSON, nextId } from '../storage.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function addDays(iso, days) {
  const d = iso ? new Date(iso) : new Date();
  d.setDate(d.getDate() + Number(days || 7));
  return d.toISOString().slice(0, 10);
}

/**
 * @openapi
 * /api/plants:
 *   get:
 *     summary: List all plants (public)
 *     tags: [Plants]
 *     responses:
 *       200: { description: Array of plants }
 */
router.get('/', async (req, res) => {
  const plants = await readJSON('plants.json');
  res.json({ plants });
});

/**
 * @openapi
 * /api/plants/mine:
 *   get:
 *     summary: List plants of the current user
 *     tags: [Plants]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Array of user's plants }
 *       401: { description: Not authorized }
 */
router.get('/mine', requireAuth, async (req, res) => {
  const plants = await readJSON('plants.json');
  res.json({ plants: plants.filter((p) => p.user_id === req.session.userId) });
});

/**
 * @openapi
 * /api/plants:
 *   post:
 *     summary: Add a plant for the current user
 *     tags: [Plants]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [species, nickname]
 *             properties:
 *               species: { type: string }
 *               nickname: { type: string, minLength: 2, maxLength: 30 }
 *               acquired_at: { type: string, format: date }
 *               location: { type: string }
 *               watering: { type: integer, minimum: 1, maximum: 30 }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Plant created }
 *       400: { description: Validation error }
 */
router.post('/', requireAuth, async (req, res) => {
  const { species, nickname, acquired_at, location, watering, notes } = req.body || {};
  if (!species) return res.status(400).json({ error: 'оберіть вид' });
  if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 30) {
    return res.status(400).json({ error: 'назва: 2-30 символів' });
  }
  const plants = await readJSON('plants.json');
  const plant = {
    id: await nextId(plants),
    user_id: req.session.userId,
    species,
    nickname: nickname.trim(),
    acquired_at: acquired_at || null,
    location: location || 'window',
    watering: Number(watering) || 7,
    notes: notes || '',
    image: `/images/plant${(plants.length % 4) + 1}.jpg`,
    next_water: addDays(null, watering),
    created_at: new Date().toISOString(),
  };
  plants.push(plant);
  await writeJSON('plants.json', plants);
  res.status(201).json({ plant });
});

/**
 * @openapi
 * /api/plants/{id}/water:
 *   post:
 *     summary: Mark plant as watered (resets next_water)
 *     tags: [Plants]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Updated plant }
 *       404: { description: Not found }
 */
router.post('/:id/water', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const plants = await readJSON('plants.json');
  const idx = plants.findIndex((p) => p.id === id && p.user_id === req.session.userId);
  if (idx < 0) return res.status(404).json({ error: 'не знайдено' });
  plants[idx].next_water = addDays(null, plants[idx].watering);
  await writeJSON('plants.json', plants);
  res.json({ plant: plants[idx] });
});

/**
 * @openapi
 * /api/plants/{id}:
 *   delete:
 *     summary: Delete a plant
 *     tags: [Plants]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const plants = await readJSON('plants.json');
  const idx = plants.findIndex((p) => p.id === id && p.user_id === req.session.userId);
  if (idx < 0) return res.status(404).json({ error: 'не знайдено' });
  plants.splice(idx, 1);
  await writeJSON('plants.json', plants);
  res.status(204).end();
});

export default router;
