
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

loadEnvConfig(process.cwd());

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  const rl = readline.createInterface({ input, output });

  try {
    const name = (await rl.question("Admin name: ")).trim();
    const email = (
      await rl.question("Admin email: ")
    ).trim().toLowerCase();
    const phone = (await rl.question("Admin phone: ")).trim();
    const password = await rl.question(
      "New admin password (input visible): "
    );

    if (!name || !email || !phone || password.length < 12) {
      throw new Error(
        "All fields are required. Use a password of at least 12 characters."
      );
    }

    const { default: User } = await import("../models/User");

    await mongoose.connect(uri);

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      throw new Error(
        "An admin already exists. No account was created."
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already belongs to a user. No account was created."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
      authProvider: "local",
      totpEnabled: false,
    });

    console.log("Admin created successfully.");
    console.log(`Email: ${email}`);
    console.log(
      "Log in and configure admin two-factor authentication before normal use."
    );
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error("Admin recovery failed:", error.message);
  process.exitCode = 1;
});
