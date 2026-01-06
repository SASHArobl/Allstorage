import forge from "node-forge";
import { Buffer } from "buffer";

// ===== RSA =====

// Генерация RSA ключей (4096 бит)
export const generateRSAKeys = () => {
  const keypair = forge.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
  return { publicKey, privateKey };
};

// RSA шифрование (AES ключ)
export const encryptRSA = (publicKeyPem: string, data: Buffer | string) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const raw =
    Buffer.isBuffer(data) ? data.toString("binary") : Buffer.from(data, "utf8").toString("binary");
  const encrypted = publicKey.encrypt(raw, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
  });
  return Buffer.from(encrypted, "binary").toString("base64");
};

// RSA расшифровка
export const decryptRSA = (privateKeyPem: string, encryptedBase64: string) => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encrypted = Buffer.from(encryptedBase64, "base64").toString("binary");
  const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
  });
  return Buffer.from(decrypted, "binary");
};

// ===== AES =====

// AES шифрование (CBC, 256 бит)
export const encryptAES = (plaintext: Buffer | string) => {
  const key = forge.random.getBytesSync(32); // 256 бит
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher("AES-CBC", key);
  cipher.start({ iv });

  // Конвертируем Node.js Buffer в forge строку
  const plaintextBytes =
    Buffer.isBuffer(plaintext)
      ? forge.util.createBuffer(plaintext.toString("binary"))
      : forge.util.createBuffer(Buffer.from(plaintext, "utf8").toString("binary"));

  cipher.update(plaintextBytes);
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  return {
    encrypted: Buffer.from(encrypted, "binary").toString("base64"),
    key: Buffer.from(key, "binary").toString("base64"),
    iv: Buffer.from(iv, "binary").toString("base64"),
  };
};

// AES расшифровка
export const decryptAES = (encryptedBase64: string, keyBase64: string, ivBase64: string) => {
  const key = Buffer.from(keyBase64, "base64").toString("binary");
  const iv = Buffer.from(ivBase64, "base64").toString("binary");
  const encrypted = Buffer.from(encryptedBase64, "base64").toString("binary");

  const decipher = forge.cipher.createDecipher("AES-CBC", key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  const success = decipher.finish();
  if (!success) throw new Error("AES decryption failed");
  const out = decipher.output.getBytes();
  return Buffer.from(out, "binary");
};
