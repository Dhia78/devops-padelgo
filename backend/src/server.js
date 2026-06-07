const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const courtSeed = [
  {
    name: "Padel 15 - Court Castagnary",
    category: "Padel 15",
    pricePerDay: 60,
    available: true,
    rating: 4.6,
    ratingCount: 82,
    imageUrl:
      "https://sto-pub-clu.padel-now.co/photos/57758005_photo_1.jpg",
    description:
      "Club de padel couvert dans le 15e arrondissement, pratique pour jouer dans Paris intramuros.",
    distanceKm: 4,
    address: "115 rue de Castagnary, 75015 Paris",
    surface: "Indoor couvert",
    slots: [
      { time: "12:00", duration: 60, price: 60 },
      { time: "15:00", duration: 60, price: 60 }
    ]
  },
  {
    name: "Casa Padel Saint-Denis - Court Central",
    category: "Casa Padel Saint-Denis",
    pricePerDay: 72,
    available: true,
    rating: 4.7,
    ratingCount: 214,
    imageUrl:
      "https://casapadel.fr/wp-content/uploads/2025/10/Vendenheim_Casa_Padel.jpg",
    description:
      "Grand club indoor proche de Paris, pensé pour réserver facilement un créneau en soirée.",
    distanceKm: 6,
    address: "103 rue Charles Michels, 93200 Saint-Denis",
    surface: "Indoor",
    slots: [
      { time: "09:00", duration: 90, price: 72 },
      { time: "18:00", duration: 90, price: 88 },
      { time: "20:00", duration: 90, price: 88 }
    ]
  },
  {
    name: "Casa Padel Asnières - Court Indoor",
    category: "Casa Padel Asnières",
    pricePerDay: 70,
    available: true,
    rating: 4.5,
    ratingCount: 76,
    imageUrl:
      "https://casapadel.fr/wp-content/uploads/2025/02/kingersheim-casa-padel.jpg",
    description:
      "Club indoor à Asnières-sur-Seine, adapté aux réservations après le travail côté nord-ouest parisien.",
    distanceKm: 7,
    address: "19 rue du Jardin Modèle, 92600 Asnières-sur-Seine",
    surface: "Semi-couvert",
    slots: [
      { time: "10:30", duration: 90, price: 70 },
      { time: "16:30", duration: 90, price: 82 },
      { time: "21:00", duration: 90, price: 82 }
    ]
  },
  {
    name: "4PADEL Montreuil - Court Indoor",
    category: "4PADEL Montreuil",
    pricePerDay: 62,
    available: true,
    rating: 4.6,
    ratingCount: 139,
    imageUrl:
      "https://res.cloudinary.com/anybuddy/image/upload/w_3840,h_1920,c_fill/f_auto,q_auto:good/v1671028495/4-padel-montreuil.jpg",
    description:
      "Centre indoor à Montreuil, avec plusieurs pistes et un accès direct depuis l'est parisien.",
    distanceKm: 6,
    address: "7 rue Édouard Vaillant, 93100 Montreuil",
    surface: "Indoor",
    slots: [
      { time: "07:30", duration: 90, price: 62 },
      { time: "13:30", duration: 90, price: 72 },
      { time: "19:30", duration: 90, price: 88 }
    ]
  },
  {
    name: "UCPA Sport Station Paris - Court Rosa Parks",
    category: "UCPA Sport Station Paris",
    pricePerDay: 38,
    available: true,
    rating: 4.6,
    ratingCount: 34,
    imageUrl:
      "https://media.ucpa.com/t_UCPA_Vertical/UCPA-SPORT-STATION/00103713-ucpa-sport-station-hostel-padel.jpg",
    description:
      "Deux terrains indoor dans le quartier Rosa Parks, avec un tarif heures creuses très accessible.",
    distanceKm: 5,
    address: "28 allée Rose Dieng-Kuntz, 75019 Paris",
    surface: "Indoor",
    slots: [
      { time: "08:00", duration: 60, price: 38 },
      { time: "15:00", duration: 60, price: 38 },
      { time: "18:30", duration: 60, price: 50 }
    ]
  },
  {
    name: "Padel Horizon Sucy - Court Bleu",
    category: "Padel Horizon",
    pricePerDay: 60,
    available: true,
    rating: 4.7,
    ratingCount: 188,
    imageUrl:
      "https://res.cloudinary.com/anybuddy/image/upload/w_3840,h_1920,c_fill/f_auto,q_auto:good/v1614767534/padel-horizon.jpg",
    description:
      "Club historique à Sucy-en-Brie, connu pour ses installations dédiées au padel.",
    distanceKm: 17,
    address: "3 route de la Queue en Brie, 94370 Sucy-en-Brie",
    surface: "Indoor",
    slots: [
      { time: "09:00", duration: 90, price: 60 },
      { time: "15:00", duration: 90, price: 60 },
      { time: "20:30", duration: 90, price: 78 }
    ]
  },
  {
    name: "Le Padel Club Bois d'Arcy - Court Indoor",
    category: "Le Padel Club Bois d'Arcy",
    pricePerDay: 54,
    available: true,
    rating: 4.4,
    ratingCount: 97,
    imageUrl:
      "https://i.ytimg.com/vi/QJEU5QaxTJA/maxresdefault.jpg",
    description:
      "Centre couvert à Bois-d'Arcy avec plusieurs terrains pour jouer à l'ouest de Paris.",
    distanceKm: 24,
    address: "6 rue Abel Gance, 78390 Bois-d'Arcy",
    surface: "Indoor",
    slots: [
      { time: "11:00", duration: 90, price: 54 },
      { time: "17:30", duration: 90, price: 64 },
      { time: "20:00", duration: 90, price: 64 }
    ]
  }
];

let pool;
let databaseReady = false;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email
  };
}

function parseSlots(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "object") {
    return value;
  }

  return JSON.parse(value);
}

function toIsoDate(value = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function reservationKey(courtId, startDate, slotTime) {
  return `${courtId}:${startDate}:${slotTime}`;
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

async function slotsWithAvailability(courtId, slots, startDate) {
  if (!slots.length) {
    return [];
  }

  const [rows] = await pool.query(
    `SELECT slot_time
     FROM reservations
     WHERE court_id = ?
       AND start_date = ?
       AND status = 'CONFIRMED'`,
    [courtId, startDate]
  );
  const reservedTimes = new Set(rows.map((row) => row.slot_time));

  return slots.map((slot) => ({
    ...slot,
    reserved: reservedTimes.has(slot.time)
  }));
}

async function courtHasAvailability(courtId, slots, startDate, days = 1) {
  if (!slots.length) {
    return false;
  }

  for (let index = 0; index < days; index += 1) {
    const date = addDays(startDate, index);
    const datedSlots = await slotsWithAvailability(courtId, slots, date);
    if (datedSlots.some((slot) => !slot.reserved)) {
      return true;
    }
  }

  return false;
}

async function initDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "padelgo_user",
    password: process.env.DB_PASSWORD || "padelgo_password",
    database: process.env.DB_NAME || "padelgo",
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash VARCHAR(160) NOT NULL,
      password_salt VARCHAR(80) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(128) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      court_id INT NOT NULL,
      court_name VARCHAR(120) NOT NULL,
      customer_name VARCHAR(120) NOT NULL,
      start_date DATE NULL,
      days INT NOT NULL DEFAULT 1,
      status VARCHAR(40) NOT NULL DEFAULT 'CONFIRMED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL UNIQUE,
      slug VARCHAR(80) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS courts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      club_id INT NOT NULL,
      description TEXT NOT NULL,
      image_url VARCHAR(400) NOT NULL,
      price_per_day INT NOT NULL,
      available BOOLEAN NOT NULL DEFAULT true,
      rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
      rating_count INT NOT NULL DEFAULT 0,
      distance_km DECIMAL(4,1) NOT NULL DEFAULT 0,
      address VARCHAR(160) NOT NULL DEFAULT '',
      surface VARCHAR(80) NOT NULL DEFAULT '',
      slots_json JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE RESTRICT
    )
  `);

  await ensureColumn("courts", "description", "TEXT NOT NULL");
  await ensureColumn("courts", "image_url", "VARCHAR(400) NOT NULL");
  await ensureColumn("courts", "price_per_day", "INT NOT NULL");
  await ensureColumn("courts", "available", "BOOLEAN NOT NULL DEFAULT true");
  await ensureColumn("courts", "rating", "DECIMAL(2,1) NOT NULL DEFAULT 4.0");
  await ensureColumn("courts", "rating_count", "INT NOT NULL DEFAULT 0");
  await ensureColumn("courts", "distance_km", "DECIMAL(4,1) NOT NULL DEFAULT 0");
  await ensureColumn("courts", "address", "VARCHAR(160) NOT NULL DEFAULT ''");
  await ensureColumn("courts", "surface", "VARCHAR(80) NOT NULL DEFAULT ''");
  await ensureColumn("courts", "slots_json", "JSON NULL");

  await ensureColumn("reservations", "user_id", "INT NULL");
  await ensureColumn("reservations", "court_id", "INT NOT NULL");
  await ensureColumn("reservations", "court_name", "VARCHAR(120) NOT NULL");
  await ensureColumn("reservations", "start_date", "DATE NULL");
  await ensureColumn("reservations", "days", "INT NOT NULL DEFAULT 1");
  await ensureColumn("reservations", "status", "VARCHAR(40) NOT NULL DEFAULT 'CONFIRMED'");
  await ensureColumn("reservations", "club_name", "VARCHAR(120) NULL");
  await ensureColumn("reservations", "slot_time", "VARCHAR(10) NULL");
  await ensureColumn("reservations", "duration_minutes", "INT NULL");
  await ensureColumn("reservations", "total_price", "INT NULL");
  await ensureColumn("reservations", "cancelled_at", "TIMESTAMP NULL");
  await ensureColumn("reservations", "active_reservation_key", "VARCHAR(80) NULL");
  await normalizeActiveReservations();
  await ensureIndex("reservations", "uniq_active_reservation_key", "UNIQUE KEY uniq_active_reservation_key (active_reservation_key)");
  await seedDatabase();
  databaseReady = true;
}

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function ensureIndex(table, indexName, definition) {
  const [rows] = await pool.query(`SHOW INDEX FROM ${table} WHERE Key_name = ?`, [indexName]);
  if (rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD ${definition}`);
  }
}

async function normalizeActiveReservations() {
  const [rows] = await pool.query(
    `SELECT id, court_id, start_date, slot_time
     FROM reservations
     WHERE status = 'CONFIRMED'
       AND active_reservation_key IS NULL
       AND start_date IS NOT NULL
       AND slot_time IS NOT NULL
     ORDER BY created_at ASC, id ASC`
  );
  const seen = new Set();

  for (const row of rows) {
    const key = reservationKey(row.court_id, toIsoDate(row.start_date), row.slot_time);
    if (seen.has(key)) {
      await pool.query(
        "UPDATE reservations SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP, active_reservation_key = NULL WHERE id = ?",
        [row.id]
      );
      continue;
    }

    seen.add(key);
    await pool.query("UPDATE reservations SET active_reservation_key = ? WHERE id = ?", [key, row.id]);
  }
}

async function seedDatabase() {
  const clubCategories = [
    { name: "Padel 15", slug: "padel-15" },
    { name: "Casa Padel Saint-Denis", slug: "casa-padel-saint-denis" },
    { name: "Casa Padel Asnières", slug: "casa-padel-asnieres" },
    { name: "4PADEL Montreuil", slug: "4padel-montreuil" },
    { name: "UCPA Sport Station Paris", slug: "ucpa-sport-station-paris" },
    { name: "Padel Horizon", slug: "padel-horizon" },
    { name: "Le Padel Club Bois d'Arcy", slug: "le-padel-club-bois-darcy" }
  ];

  const [existingClubs] = await pool.query("SELECT COUNT(*) AS count FROM clubs");
  if (existingClubs[0].count > 0) {
    return;
  }

  await pool.query(
    "INSERT INTO clubs (name, slug) VALUES ?",
    [clubCategories.map((category) => [category.name, category.slug])]
  );

  const [clubs] = await pool.query("SELECT id, name FROM clubs");
  const categoryMap = new Map(clubs.map((category) => [category.name, category.id]));

  const values = courtSeed.map((court) => [
    court.name,
    categoryMap.get(court.category),
    court.description,
    court.imageUrl,
    court.pricePerDay,
    court.available,
    court.rating,
    court.ratingCount,
    court.distanceKm,
    court.address,
    court.surface,
    JSON.stringify(court.slots)
  ]);

  await pool.query(
    `INSERT INTO courts
      (name, club_id, description, image_url, price_per_day, available, rating, rating_count, distance_km, address, surface, slots_json)
     VALUES ?`,
    [values]
  );
}

async function initDatabaseWithRetry() {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      await initDatabase();
      console.log("Connected to MySQL and ensured application tables exist");
      return;
    } catch (error) {
      databaseReady = false;
      console.log(`MySQL unavailable, retry ${attempt}/20: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function authMiddleware(req, res, next) {
  if (!databaseReady) {
    return res.status(503).json({ message: "Base de données non disponible" });
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Connexion requise" });
  }

  const [rows] = await pool.query(
    `SELECT users.id, users.full_name, users.email
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ?`,
    [token]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Session invalide" });
  }

  req.user = rows[0];
  req.token = token;
  next();
}

function requireDatabase(_req, res, next) {
  if (!databaseReady) {
    return res.status(503).json({ message: "Base de données en cours de démarrage" });
  }

  next();
}

app.get("/api/health", (_req, res) => {
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "starting",
    database: databaseReady ? "ready" : "starting"
  });
});

app.use("/api", requireDatabase);

app.get("/api/clubs", async (_req, res) => {
  const [rows] = await pool.query("SELECT id, name, slug FROM clubs ORDER BY name ASC");
  res.json(rows);
});

app.get("/api/courts", async (req, res) => {
  const filters = [];
  const values = [];
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const minPrice = Number(req.query.minPrice || 0);
  const maxPrice = Number(req.query.maxPrice || 0);
  const minRating = Number(req.query.minRating || 0);
  const available = typeof req.query.available === "string" ? req.query.available : "";

  if (category) {
    filters.push("clubs.slug = ?");
    values.push(category);
  }

  if (minPrice > 0) {
    filters.push("courts.price_per_day >= ?");
    values.push(minPrice);
  }

  if (maxPrice > 0) {
    filters.push("courts.price_per_day <= ?");
    values.push(maxPrice);
  }

  if (minRating > 0) {
    filters.push("courts.rating >= ?");
    values.push(minRating);
  }

  const sortKey = String(req.query.sort || "rating");
  const sortMap = {
    price: "courts.price_per_day",
    rating: "courts.rating",
    name: "courts.name"
  };
  const sortColumn = sortMap[sortKey] || sortMap.rating;
  const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(24, Math.max(1, Number(req.query.pageSize || 12)));
  const requestedDate = toIsoDate(req.query.date);

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `SELECT
       courts.id,
       courts.name,
       courts.description,
       courts.image_url,
       courts.price_per_day,
       courts.available,
       courts.rating,
       courts.rating_count,
       courts.distance_km,
       courts.address,
       courts.surface,
       courts.slots_json,
       clubs.name AS category_name,
       clubs.slug AS category_slug
     FROM courts
     JOIN clubs ON clubs.id = courts.club_id
     ${whereClause}
     ORDER BY ${sortColumn} ${order}`,
    values
  );

  const items = await Promise.all(
    rows.map(async (row) => {
      const baseSlots = parseSlots(row.slots_json);
      const slots = await slotsWithAvailability(row.id, baseSlots, requestedDate);
      const availableToday = Boolean(row.available) && slots.some((slot) => !slot.reserved);
      const availableUpcoming = Boolean(row.available) && await courtHasAvailability(row.id, baseSlots, requestedDate, 7);

      return {
        id: row.id,
        name: row.name,
        description: row.description,
        imageUrl: row.image_url,
        pricePerDay: row.price_per_day,
        available: availableToday,
        availableToday,
        availableUpcoming,
        rating: Number(row.rating),
        ratingCount: row.rating_count,
        distanceKm: Number(row.distance_km),
        address: row.address,
        surface: row.surface,
        slots,
        category: row.category_name,
        categorySlug: row.category_slug
      };
    })
  );

  const filteredItems = items.filter((item) => {
    if (!available) {
      return true;
    }

    if (available === "today" || available === "true" || available === "1") {
      return item.availableToday;
    }

    if (available === "upcoming") {
      return item.availableUpcoming;
    }

    if (available === "fullToday" || available === "false" || available === "0") {
      return !item.availableToday;
    }

    return true;
  });
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  res.json({
    items: pagedItems,
    total: filteredItems.length,
    page,
    pageSize
  });
});

app.get("/api/courts/:id", async (req, res) => {
  const courtId = Number(req.params.id);
  const requestedDate = toIsoDate(req.query.date);
  if (!courtId) {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  const [rows] = await pool.query(
    `SELECT
       courts.id,
       courts.name,
       courts.description,
       courts.image_url,
       courts.price_per_day,
       courts.available,
       courts.rating,
       courts.rating_count,
       courts.distance_km,
       courts.address,
       courts.surface,
       courts.slots_json,
       clubs.name AS category_name,
       clubs.slug AS category_slug
     FROM courts
     JOIN clubs ON clubs.id = courts.club_id
     WHERE courts.id = ?`,
    [courtId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Terrain introuvable" });
  }

  const row = rows[0];
  const slots = await slotsWithAvailability(row.id, parseSlots(row.slots_json), requestedDate);

  res.json({
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    pricePerDay: row.price_per_day,
    available: Boolean(row.available) && slots.some((slot) => !slot.reserved),
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    distanceKm: Number(row.distance_km),
    address: row.address,
    surface: row.surface,
    slots,
    category: row.category_name,
    categorySlug: row.category_slug
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (fullName.length < 2 || !email.includes("@") || password.length < 6) {
    return res.status(400).json({ message: "Nom, email valide et mot de passe de 6 caractères minimum requis" });
  }

  const { salt, hash } = hashPassword(password);

  try {
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, password_salt) VALUES (?, ?, ?, ?)",
      [fullName, email, hash, salt]
    );
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [result.insertId, token]);
    res.status(201).json({ token, user: { id: result.insertId, fullName, email } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Un compte existe déjà avec cet email" });
    }
    throw error;
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

  if (rows.length === 0) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const user = rows[0];
  const { hash } = hashPassword(password, user.password_salt);

  if (hash !== user.password_hash) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  await pool.query("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [user.id, token]);
  res.json({ token, user: publicUser(user) });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.post("/api/auth/signout", authMiddleware, async (req, res) => {
  await pool.query("DELETE FROM sessions WHERE token = ?", [req.token]);
  res.status(204).send();
});

app.post("/api/reservations", authMiddleware, async (req, res) => {
  const courtId = req.body.courtId;
  const startDate = toIsoDate(req.body.startDate);
  const slotTime = String(req.body.slotTime || "");

  const [equipmentRows] = await pool.query(
    `SELECT
       courts.id,
       courts.name,
       courts.price_per_day,
       courts.available,
       courts.image_url,
       courts.rating,
       courts.rating_count,
       courts.distance_km,
       courts.address,
       courts.surface,
       courts.slots_json,
       clubs.name AS category_name,
       clubs.slug AS category_slug
     FROM courts
     JOIN clubs ON clubs.id = courts.club_id
     WHERE courts.id = ?`,
    [Number(courtId)]
  );

  if (equipmentRows.length === 0) {
    return res.status(404).json({ message: "Terrain introuvable" });
  }

  const equipment = equipmentRows[0];
  if (!equipment.available) {
    return res.status(409).json({ message: "Terrain indisponible" });
  }

  const slots = parseSlots(equipment.slots_json);
  const selectedSlot = slots.find((slot) => slot.time === slotTime);

  if (!selectedSlot) {
    return res.status(409).json({ message: "Aucun créneau disponible pour ce terrain" });
  }

  const activeReservationKey = reservationKey(equipment.id, startDate, selectedSlot.time);
  const [existingReservations] = await pool.query(
    `SELECT id
     FROM reservations
     WHERE court_id = ?
       AND start_date = ?
       AND slot_time = ?
       AND status = 'CONFIRMED'
     LIMIT 1`,
    [equipment.id, startDate, selectedSlot.time]
  );

  if (existingReservations.length > 0) {
    return res.status(409).json({ message: "Ce créneau vient d'être réservé. Choisissez un autre horaire." });
  }

  let result;

  try {
    [result] = await pool.query(
      `INSERT INTO reservations
        (user_id, court_id, court_name, customer_name, start_date, days, status, club_name, slot_time, duration_minutes, total_price, active_reservation_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        equipment.id,
        equipment.name,
        req.user.full_name,
        startDate,
        1,
        "CONFIRMED",
        equipment.category_name,
        selectedSlot.time,
        selectedSlot.duration,
        selectedSlot.price,
        activeReservationKey
      ]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Ce créneau vient d'être réservé. Choisissez un autre horaire." });
    }

    throw error;
  }

  const updatedSlots = await slotsWithAvailability(equipment.id, slots, startDate);

  res.status(201).json({
    id: result.insertId,
    reservation: {
      id: result.insertId,
      user_id: req.user.id,
      court_id: equipment.id,
      court_name: equipment.name,
      customer_name: req.user.full_name,
      start_date: startDate,
      days: 1,
      status: "CONFIRMED",
      club_name: equipment.category_name,
      slot_time: selectedSlot.time,
      duration_minutes: selectedSlot.duration,
      total_price: selectedSlot.price,
      active_reservation_key: activeReservationKey
    },
    court: {
      id: equipment.id,
      name: equipment.name,
      pricePerDay: equipment.price_per_day,
      available: Boolean(equipment.available) && updatedSlots.some((slot) => !slot.reserved),
      imageUrl: equipment.image_url,
      rating: Number(equipment.rating),
      ratingCount: equipment.rating_count,
      distanceKm: Number(equipment.distance_km),
      address: equipment.address,
      surface: equipment.surface,
      slots: updatedSlots,
      category: equipment.category_name,
      categorySlug: equipment.category_slug
    },
    customerName: req.user.full_name,
    startDate,
    days: 1,
    slotTime: selectedSlot.time,
    durationMinutes: selectedSlot.duration,
    totalPrice: selectedSlot.price,
    status: "CONFIRMED"
  });
});

app.get("/api/reservations", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM reservations ORDER BY created_at DESC");
  res.json(rows);
});

app.get("/api/me/reservations", authMiddleware, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(rows);
});

app.patch("/api/me/reservations/:id/cancel", authMiddleware, async (req, res) => {
  const reservationId = Number(req.params.id);
  if (!reservationId) {
    return res.status(400).json({ message: "Réservation invalide" });
  }

  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE id = ? AND user_id = ?",
    [reservationId, req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Réservation introuvable" });
  }

  const reservation = rows[0];
  if (reservation.status !== "CONFIRMED") {
    return res.status(409).json({ message: "Cette réservation est déjà annulée" });
  }

  await pool.query(
    `UPDATE reservations
     SET status = 'CANCELLED',
         cancelled_at = CURRENT_TIMESTAMP,
         active_reservation_key = NULL
     WHERE id = ? AND user_id = ? AND status = 'CONFIRMED'`,
    [reservationId, req.user.id]
  );

  res.json({
    ...reservation,
    status: "CANCELLED",
    active_reservation_key: null,
    cancelled_at: new Date().toISOString()
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Erreur serveur" });
});

app.listen(port, () => {
  console.log(`PadelGo API listening on port ${port}`);
  initDatabaseWithRetry();
});
