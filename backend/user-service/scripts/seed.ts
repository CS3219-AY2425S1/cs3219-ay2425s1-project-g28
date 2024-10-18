import bcrypt from "bcrypt";
import { connectToDB, createUser, findUserByEmail } from "../model/repository";

export async function seedAdminAccount() {
  await connectToDB();

  const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
  const adminLastName = process.env.ADMIN_LAST_NAME || "User";
  const adminUsername = process.env.ADMIN_USERNAME || "administrator";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  if (
    !process.env.ADMIN_FIRST_NAME ||
    !process.env.ADMIN_LAST_NAME ||
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_PASSWORD
  ) {
    console.error(
      "Admin account not seeded in .env. Using default admin account credentials (first name: Admin, last name: User, username: administrator, email: admin@gmail.com, password: Admin@123)"
    );
  }

  try {
    const existingAdmin = await findUserByEmail(adminEmail);
    if (existingAdmin) {
      console.error("Admin account already exists in the database.");
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);

    await createUser(
      adminFirstName,
      adminLastName,
      adminUsername,
      adminEmail,
      hashedPassword,
      true,
      true
    );
    console.log("Admin account created successfully.");
  } catch {
    console.error("Error creating admin account.");
  }
}
