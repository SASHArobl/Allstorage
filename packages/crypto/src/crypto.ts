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
export const encryptRSA = (publicKeyPem: string, data: string) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  return publicKey.encrypt(data, "RSA-OAEP");
};

// RSA расшифровка
export const decryptRSA = (privateKeyPem: string, encrypted: string) => {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  return privateKey.decrypt(encrypted, "RSA-OAEP");
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
    Buffer.isBuffer(plaintext) ? forge.util.createBuffer(plaintext.toString("binary")) : forge.util.createBuffer(plaintext);

  cipher.update(plaintextBytes);
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  return { encrypted, key, iv };
};

// AES расшифровка
export const decryptAES = (encrypted: string, key: string, iv: string) => {
  const decipher = forge.cipher.createDecipher("AES-CBC", key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(encrypted));
  const success = decipher.finish();
  if (!success) throw new Error("AES decryption failed");
  return decipher.output.getBytes();
};