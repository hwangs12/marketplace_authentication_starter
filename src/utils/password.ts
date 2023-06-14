import bcrypt from "bcrypt";

export const comparePassword = async function (password: any, hash: any) {
  if (!password) throw new Error("Password is missing");

  try {
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error: any) {
    console.log("Error while compaing password", error.message);
  }
};
