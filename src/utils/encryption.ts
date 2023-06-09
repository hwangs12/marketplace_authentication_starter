import crypto, { Decipher } from "crypto";
import { AuthenticationError } from "../errors";

// derive string key
async function deriveKey(password: string) {
  try {
    const algo = {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode("a-unique-salt"),
      iterations: 1000,
    };
    return crypto.subtle.deriveKey(
      algo,
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        {
          name: algo.name,
        },
        false,
        ["deriveKey"]
      ),
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    throw new AuthenticationError("Unauthorized");
  }
}

// Encrypt function
async function encrypt(text: string, password: string) {
  try {
    const algo = {
      name: "AES-GCM",
      length: 256,
      iv: crypto.getRandomValues(new Uint8Array(12)),
    };
    return {
      cipherText: await crypto.subtle.encrypt(
        algo,
        await deriveKey(password),
        new TextEncoder().encode(text)
      ),
      iv: algo.iv,
    };
  } catch (error) {
    throw new AuthenticationError("Unauthorized");
  }
}

// Decrypt function
async function decrypt(encrypted: any, password: string) {
  try {
    const algo = {
      name: "AES-GCM",
      length: 256,
      iv: encrypted.iv,
    };
    return new TextDecoder().decode(
      await crypto.subtle.decrypt(
        algo,
        await deriveKey(password),
        encrypted.cipherText
      )
    );
  } catch (error) {
    throw new AuthenticationError("Unauthorized");
  }
}

function buf2hex(buffer: ArrayBuffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function hex2ArrayBuffer(hex: string) {
  return new Uint8Array(hex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)))
    .buffer;
}

function fromHexStringToUint8Array(hexString: string) {
  return Uint8Array.from(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
}

function finishDecipher(decipher: Decipher) {
  try {
    return decipher.final();
  } catch (error) {
    throw new AuthenticationError("Unauthorized");
  }
}

export {
  encrypt,
  decrypt,
  buf2hex,
  hex2ArrayBuffer,
  fromHexStringToUint8Array,
  finishDecipher,
};
