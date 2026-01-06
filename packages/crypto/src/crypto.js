"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAES = exports.encryptAES = exports.decryptRSA = exports.encryptRSA = exports.generateRSAKeys = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const buffer_1 = require("buffer");
// ===== RSA =====
// Генерация RSA ключей (4096 бит)
const generateRSAKeys = () => {
    const keypair = node_forge_1.default.pki.rsa.generateKeyPair({ bits: 4096, e: 0x10001 });
    const publicKey = node_forge_1.default.pki.publicKeyToPem(keypair.publicKey);
    const privateKey = node_forge_1.default.pki.privateKeyToPem(keypair.privateKey);
    return { publicKey, privateKey };
};
exports.generateRSAKeys = generateRSAKeys;
// RSA шифрование (AES ключ)
const encryptRSA = (publicKeyPem, data) => {
    const publicKey = node_forge_1.default.pki.publicKeyFromPem(publicKeyPem);
    const raw = buffer_1.Buffer.isBuffer(data) ? data.toString("binary") : buffer_1.Buffer.from(data, "utf8").toString("binary");
    const encrypted = publicKey.encrypt(raw, "RSA-OAEP", {
        md: node_forge_1.default.md.sha256.create(),
        mgf1: node_forge_1.default.mgf.mgf1.create(node_forge_1.default.md.sha256.create()),
    });
    return buffer_1.Buffer.from(encrypted, "binary").toString("base64");
};
exports.encryptRSA = encryptRSA;
// RSA расшифровка
const decryptRSA = (privateKeyPem, encryptedBase64) => {
    const privateKey = node_forge_1.default.pki.privateKeyFromPem(privateKeyPem);
    const encrypted = buffer_1.Buffer.from(encryptedBase64, "base64").toString("binary");
    const decrypted = privateKey.decrypt(encrypted, "RSA-OAEP", {
        md: node_forge_1.default.md.sha256.create(),
        mgf1: node_forge_1.default.mgf.mgf1.create(node_forge_1.default.md.sha256.create()),
    });
    return buffer_1.Buffer.from(decrypted, "binary");
};
exports.decryptRSA = decryptRSA;
// ===== AES =====
// AES шифрование (CBC, 256 бит)
const encryptAES = (plaintext) => {
    const key = node_forge_1.default.random.getBytesSync(32); // 256 бит
    const iv = node_forge_1.default.random.getBytesSync(16);
    const cipher = node_forge_1.default.cipher.createCipher("AES-CBC", key);
    cipher.start({ iv });
    // Конвертируем Node.js Buffer в forge строку
    const plaintextBytes = buffer_1.Buffer.isBuffer(plaintext)
        ? node_forge_1.default.util.createBuffer(plaintext.toString("binary"))
        : node_forge_1.default.util.createBuffer(buffer_1.Buffer.from(plaintext, "utf8").toString("binary"));
    cipher.update(plaintextBytes);
    cipher.finish();
    const encrypted = cipher.output.getBytes();
    return {
        encrypted: buffer_1.Buffer.from(encrypted, "binary").toString("base64"),
        key: buffer_1.Buffer.from(key, "binary").toString("base64"),
        iv: buffer_1.Buffer.from(iv, "binary").toString("base64"),
    };
};
exports.encryptAES = encryptAES;
// AES расшифровка
const decryptAES = (encryptedBase64, keyBase64, ivBase64) => {
    const key = buffer_1.Buffer.from(keyBase64, "base64").toString("binary");
    const iv = buffer_1.Buffer.from(ivBase64, "base64").toString("binary");
    const encrypted = buffer_1.Buffer.from(encryptedBase64, "base64").toString("binary");
    const decipher = node_forge_1.default.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });
    decipher.update(node_forge_1.default.util.createBuffer(encrypted));
    const success = decipher.finish();
    if (!success)
        throw new Error("AES decryption failed");
    const out = decipher.output.getBytes();
    return buffer_1.Buffer.from(out, "binary");
};
exports.decryptAES = decryptAES;
//# sourceMappingURL=crypto.js.map