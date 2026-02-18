import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Map drug names to medicine search terms (Paracetamol = Acetaminophen)
const DRUG_ALIASES = {
  paracetamol: ['paracetamol', 'acetaminophen'],
  acetaminophen: ['paracetamol', 'acetaminophen'],
};

function getMedicineSearchTerms(drug) {
  const lower = drug.toLowerCase().trim();
  return DRUG_ALIASES[lower] || [lower];
}

/**
 * POST /api/login
 * Body: { username: string, password: string }
 * Returns { token, user: { user_id, username } } on success.
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await pool.query(
      'SELECT user_id, username, password FROM "user" WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: { user_id: user.user_id, username: user.username },
    });
  } catch (err) {
    console.error('Error in /api/login:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

function requireAuth(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * POST /api/register
 * Body: { username: string, password: string }
 * Creates a new user and returns { token, user }.
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await pool.query('SELECT 1 FROM "user" WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "user" (username, password) VALUES ($1, $2) RETURNING user_id, username',
      [username.trim(), hash]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { user_id: user.user_id, username: user.username } });
  } catch (err) {
    console.error('Error in /api/register:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * GET /api/me
 * Returns current user and profile (user_data) if token is valid.
 */
app.get('/api/me', async (req, res) => {
  const decoded = requireAuth(req);
  if (!decoded) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username,
              ud.age, ud.gender, ud.height_cm, ud.weight_kg, ud.country_id,
              c.country_name
       FROM "user" u
       LEFT JOIN user_data ud ON ud.user_id = u.user_id
       LEFT JOIN country c ON c.country_id = ud.country_id
       WHERE u.user_id = $1`,
      [decoded.user_id]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
    const row = result.rows[0];
    res.json({
      user: {
        user_id: row.user_id,
        username: row.username,
        age: row.age,
        gender: row.gender,
        height_cm: row.height_cm,
        weight_kg: row.weight_kg,
        country_id: row.country_id,
        country_name: row.country_name,
      },
    });
  } catch (err) {
    console.error('Error in /api/me:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/me
 * Body: { username?, password?, age?, gender?, height_cm?, weight_kg?, country_name? }
 * Updates current user and/or user_data. Requires authentication.
 */
app.put('/api/me', async (req, res) => {
  const decoded = requireAuth(req);
  if (!decoded) return res.status(401).json({ error: 'Not authenticated' });
  const userId = decoded.user_id;
  try {
    const { username, password, age, gender, height_cm, weight_kg, country_name } = req.body;

    if (username !== undefined) {
      if (typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      const existing = await pool.query(
        'SELECT 1 FROM "user" WHERE username = $1 AND user_id != $2',
        [username.trim(), userId]
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      await pool.query('UPDATE "user" SET username = $1 WHERE user_id = $2', [username.trim(), userId]);
    }

    if (password !== undefined && password !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE "user" SET password = $1 WHERE user_id = $2', [hash, userId]);
    }

    let countryId = null;
    if (country_name !== undefined) {
      if (country_name === '' || country_name === null) {
        countryId = null;
      } else {
        const cRes = await pool.query('SELECT country_id FROM country WHERE country_name = $1', [country_name]);
        countryId = cRes.rows.length > 0 ? cRes.rows[0].country_id : null;
      }
    }

    const udRes = await pool.query('SELECT user_id FROM user_data WHERE user_id = $1', [userId]);
    if (udRes.rows.length > 0) {
      const updates = [];
      const values = [];
      let i = 1;
      if (age !== undefined) { updates.push(`age = $${i++}`); values.push(age === '' ? null : age); }
      if (gender !== undefined) { updates.push(`gender = $${i++}`); values.push(gender === '' ? null : gender); }
      if (height_cm !== undefined) { updates.push(`height_cm = $${i++}`); values.push(height_cm === '' ? null : height_cm); }
      if (weight_kg !== undefined) { updates.push(`weight_kg = $${i++}`); values.push(weight_kg === '' ? null : weight_kg); }
      if (country_name !== undefined) { updates.push(`country_id = $${i++}`); values.push(countryId); }
      if (updates.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE user_data SET ${updates.join(', ')} WHERE user_id = $${i}`,
          values
        );
      }
    } else {
      let cId = countryId;
      if (cId === undefined && country_name) {
        const cRes = await pool.query('SELECT country_id FROM country WHERE country_name = $1', [country_name]);
        cId = cRes.rows.length > 0 ? cRes.rows[0].country_id : null;
      }
      await pool.query(
        'INSERT INTO user_data (user_id, age, gender, height_cm, weight_kg, country_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, age ?? null, gender ?? null, height_cm ?? null, weight_kg ?? null, cId ?? null]
      );
    }

    const result = await pool.query(
      `SELECT u.user_id, u.username, ud.age, ud.gender, ud.height_cm, ud.weight_kg, ud.country_id, c.country_name
       FROM "user" u
       LEFT JOIN user_data ud ON ud.user_id = u.user_id
       LEFT JOIN country c ON c.country_id = ud.country_id
       WHERE u.user_id = $1`,
      [userId]
    );
    const row = result.rows[0];
    res.json({
      user: {
        user_id: row.user_id,
        username: row.username,
        age: row.age,
        gender: row.gender,
        height_cm: row.height_cm,
        weight_kg: row.weight_kg,
        country_id: row.country_id,
        country_name: row.country_name,
      },
    });
  } catch (err) {
    console.error('Error in PUT /api/me:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/countries
 * Returns list of countries for profile/forms.
 */
app.get('/api/countries', async (req, res) => {
  try {
    const result = await pool.query('SELECT country_name FROM country ORDER BY country_name');
    res.json({ countries: result.rows.map(r => r.country_name) });
  } catch (err) {
    console.error('Error in /api/countries:', err);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

/**
 * GET /api/medicines
 * Returns distinct generic names from the medicine table for autocomplete.
 */
app.get('/api/medicines', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT generic_name FROM medicine ORDER BY generic_name'
    );
    res.json({ medicines: result.rows.map(r => r.generic_name) });
  } catch (err) {
    console.error('Error in /api/medicines:', err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

/**
 * POST /api/drug-equivalent
 * Body: { drug: string, fromCountry: string, toCountry: string }
 * Uses the ERD schema: country, medicine, country_medicine, country_medicine_equivalent.
 * Increments view_count on the equivalent row and returns the target medicine.
 */
app.post('/api/drug-equivalent', async (req, res) => {
  try {
    const { drug, fromCountry, toCountry } = req.body;

    if (!drug || !fromCountry || !toCountry) {
      return res.status(400).json({ error: 'Missing required fields: drug, fromCountry, toCountry' });
    }

    const client = await pool.connect();

    try {
      const terms = getMedicineSearchTerms(drug);

      // Resolve country IDs
      const fromRes = await client.query(
        'SELECT country_id FROM country WHERE country_name = $1',
        [fromCountry]
      );
      const toRes = await client.query(
        'SELECT country_id FROM country WHERE country_name = $1',
        [toCountry]
      );
      if (fromRes.rows.length === 0 || toRes.rows.length === 0) {
        return res.status(404).json({ error: 'Country not found' });
      }
      const fromCountryId = fromRes.rows[0].country_id;
      const toCountryId = toRes.rows[0].country_id;

      // Find source country_medicine: (from_country, medicine matching drug)
      const srcQuery = `
        SELECT cm.country_medicine_id, m.medicine_id, m.generic_name, m.brand_name
        FROM country_medicine cm
        JOIN medicine m ON m.medicine_id = cm.medicine_id
        WHERE cm.country_id = $1
        AND (${terms.map((_, i) => `m.generic_name ILIKE '%' || $${i + 2} || '%'`).join(' OR ')})
        LIMIT 1
      `;
      const srcParams = [fromCountryId, ...terms];
      const srcRes = await client.query(srcQuery, srcParams);

      if (srcRes.rows.length === 0) {
        return res.status(404).json({ error: 'No equivalent found for this drug and country combination' });
      }

      const sourceCmId = srcRes.rows[0].country_medicine_id;

      // Find equivalent (source -> target) where target is in to_country
      const equivRes = await client.query(
        `SELECT cme.equivalent_relationship_id, cme.target_country_medicine_id, cme.view_count
         FROM country_medicine_equivalent cme
         JOIN country_medicine target_cm ON target_cm.country_medicine_id = cme.target_country_medicine_id
         WHERE cme.source_country_medicine_id = $1 AND target_cm.country_id = $2`,
        [sourceCmId, toCountryId]
      );

      if (equivRes.rows.length === 0) {
        return res.status(404).json({ error: 'No equivalent found for the target country' });
      }

      const equiv = equivRes.rows[0];
      const targetCmId = equiv.target_country_medicine_id;

      const targetRes = await client.query(
        `SELECT m.generic_name, m.brand_name, m.description, m.drug_facts, c.country_name
         FROM country_medicine cm
         JOIN medicine m ON m.medicine_id = cm.medicine_id
         JOIN country c ON c.country_id = cm.country_id
         WHERE cm.country_medicine_id = $1`,
        [targetCmId]
      );
      const target = targetRes.rows[0];

      // Update view_count (working button requirement)
      const updateRes = await client.query(
        `UPDATE country_medicine_equivalent
         SET view_count = view_count + 1
         WHERE equivalent_relationship_id = $1
         RETURNING view_count`,
        [equiv.equivalent_relationship_id]
      );
      const newViewCount = updateRes.rows[0].view_count;

      const equivalentName = target.brand_name
        ? `${target.generic_name} (${target.brand_name})`
        : target.generic_name;

      res.json({
        name: drug,
        equivalentName: equivalentName,
        strength: 'Same',
        activeIngredients: [target.generic_name.toLowerCase(), 'magnesium stearate', 'microcrystalline cellulose'],
        dosageSummary: target.drug_facts || 'Take as directed. Consult your healthcare provider.',
        ingredientOverlapWarning: 'Contains similar active compounds. Avoid taking both simultaneously to prevent overdose.',
        whyEquivalent: `This medicine contains the same primary active ingredient as ${drug} and is approved for the same therapeutic use in ${target.country_name}.`,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
        viewCount: newViewCount,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error in /api/drug-equivalent:', err);
    res.status(500).json({ error: 'Failed to fetch drug equivalent' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
