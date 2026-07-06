import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

const fallbackUsers = [
  { id: "admin", name: "Tuna", role: "admin", email: "Tuna", password: "Y01092024t." },
  { id: "partner", name: "Yağmur", role: "partner", email: "Yağmur", password: "Y01092024t." },
];

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? "dev-secret", {
    expiresIn: "7d",
  });
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
}

async function findDatabaseUser(email) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const result = await query(
    "select id, name, role, email, password_hash from users where email = $1 limit 1",
    [email],
  );

  return result.rows[0] ?? null;
}

export async function login({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    const error = new Error("Kullanıcı adı ve şifre gerekli.");
    error.statusCode = 400;
    throw error;
  }

  const databaseUser = await findDatabaseUser(normalizedEmail);

  if (databaseUser) {
    const isValidPassword = await bcrypt.compare(password, databaseUser.password_hash);

    if (!isValidPassword) {
      const error = new Error("Kullanıcı adı veya şifre hatalı.");
      error.statusCode = 401;
      throw error;
    }

    const user = toSafeUser(databaseUser);
    return { token: createToken(user), user };
  }

  const fallbackUser = fallbackUsers.find(
    (user) => user.email.toLocaleLowerCase("tr-TR") === normalizedEmail && user.password === password,
  );

  if (!fallbackUser) {
    const error = new Error("Kullanıcı adı veya şifre hatalı.");
    error.statusCode = 401;
    throw error;
  }

  const user = toSafeUser(fallbackUser);
  return { token: createToken(user), user };
}
