import crypto from "crypto";

function authenticate(req: any, res: any, next: any) {
  // authorization token should be dynamic
  // token expiration date -> invalid once expired, user have to relogin to obtain the token
  const userToken = req.headers["authorization"];

  const iv = Buffer.from(userToken.slice(-32), "hex");
  const secret = userToken.slice(0, -32);
  console.log(iv);
  console.log(secret);

  let encryptedText = Buffer.from(secret, "hex");

  let decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    // find a way to save this somewhere to pull later
    Buffer.from("$2b$08$VJsZ9V0rtB2S1686946973165"),
    iv
  );

  // Updating encrypted text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // returns data after decryption
  console.log(decrypted.toString());

  // decrypted text -> convert to json -> use this payload to make sure user is signed in within expiration

  next();
}

export default authenticate;
