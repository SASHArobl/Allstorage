import { Buffer } from "buffer";
export declare const generateRSAKeys: () => {
    publicKey: string;
    privateKey: string;
};
export declare const encryptRSA: (publicKeyPem: string, data: Buffer | string) => string;
export declare const decryptRSA: (privateKeyPem: string, encryptedBase64: string) => Buffer<ArrayBuffer>;
export declare const encryptAES: (plaintext: Buffer | string) => {
    encrypted: string;
    key: string;
    iv: string;
};
export declare const decryptAES: (encryptedBase64: string, keyBase64: string, ivBase64: string) => Buffer<ArrayBuffer>;
//# sourceMappingURL=crypto.d.ts.map