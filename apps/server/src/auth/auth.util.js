import bcrypt from "bcrypt";

export async function encryptPassword(password) {
  return await bcrypt.hash(password, 12);
}
