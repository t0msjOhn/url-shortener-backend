import { nanoid } from "nanoid";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

const ALPHABET ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const createLink = async (url) => {
  if (!url) throw { status: 400, message: "URL is required" };

  let slug =  nanoid(6, ALPHABET).toLowerCase();

  try{
    await pool.query(
    "INSERT INTO links (slug, url, clicks, created_at) VALUES ($1, $2, 0, NOW())",
        [slug, url]
    );
  }catch(err){
    console.error("Error creating link:", err);
    throw { status: 500, message: "Internal server error" };
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  return {"shortUrl":`${baseUrl}/${slug}`,"code":slug};
};

export const getLinkStats = async (slug) => {
  const result = await pool.query(
    "SELECT slug, url, clicks, created_at, last_clicked_at FROM links WHERE slug = $1",
    [slug]
  );
  if (result.rows.length === 0) throw { status: 404, message: "Link not found." };
  console.log("Link stats result:", result.rows[0]);
  return result.rows[0];
};

export const trackClick = async (slug) => {
  const results = await pool.query(
    "SELECT url FROM links WHERE slug = $1",
    [slug]
  );

  if (results.rows.length === 0) throw { status: 404, message: "Not found" };

  const link = results.rows[0];

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    throw { status: 410, message: "This link has expired." };
  }

  await pool.query("UPDATE links SET clicks = clicks + 1,last_clicked_at = NOW() WHERE slug = $1", [
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