import { nanoid } from "nanoid";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createLink = async (url, customSlug, password, expiresAt) => {
  if (!url) throw { status: 400, message: "URL is required" };

  let slug = customSlug?.trim() || nanoid(6, ALPHABET).toLowerCase();
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  try{
    var result = await pool.query(
    "SELECT slug FROM links WHERE slug = $1",
    [slug]
  );
  }catch(err){
    console.error("Error checking slug presence in DB", err);
    throw { status: 500, message: "Internal server error" };
  }

  if (result.rows.length > 0) throw { status: 400, message: "Slug already in use." };

  try{
    await pool.query(
    "INSERT INTO links (slug, url, clicks, created_at, expires_at, password_hash) VALUES ($1, $2, 0, NOW(), $3, $4)",
        [slug, url, expiresAt || null, passwordHash]
    );
  }catch(err){
    console.error("Error creating link:", err);
    throw { status: 500, message: "Internal server error" };
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return `${baseUrl}/${slug}`;
};

export const getLinkStats = async (slug) => {
  const result = await pool.query(
    "SELECT slug, url, clicks, created_at FROM links WHERE slug = $1",
    [slug]
  );
  if (result.rows.length === 0) throw { status: 404, message: "Link not found." };
  console.log("Link stats result:", result.rows[0]);
  return result.rows[0];
};

export const trackClick = async (slug) => {
  const results = await pool.query(
    "SELECT url, password_hash, expires_at FROM links WHERE slug = $1",
    [slug]
  );

  if (results.rows.length === 0) throw { status: 404, message: "Not found" };

  const link = results.rows[0];

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    throw { status: 410, message: "This link has expired." };
  }

  await pool.query("UPDATE links SET clicks = clicks + 1 WHERE slug = $1", [
    slug,
  ]);
};

export const getLinkUrl = async (slug) => {
  const results = await pool.query("SELECT url FROM links WHERE slug = $1", [
    slug,
  ]);
  console.log("getLinkUrl results:", results.rows);
  if (results.rows.length === 0) throw { status: 404, message: "Not found" };
  console.log("Retrieved URL:", results.rows);   
  return results.rows[0].url;
};

export const deleteLink = async (slug) => {
  const result = await pool.query("DELETE FROM links WHERE slug = $1", [slug]);
  if (result.rowCount === 0)
    throw { status: 404, message: "Link not found." };
};