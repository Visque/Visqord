// crypto module
const crypto = require("crypto");
const algorithm = "aes-256-cbc";

// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);

// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

function encrypt(message) {
  // the cipher function
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

  // encrypt the message
  // input encoding
  // output encoding
  let encryptedData = cipher.update(message, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
}

function decrypt(message) {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

  let decryptedData = decipher.update(message, "hex", "utf-8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}

module.exports = { encrypt, decrypt };
