// 加密工具：读取 date/volc-ark-apis.json，用密码加密成 Base64 密文（CryptoJS 兼容 / OpenSSL 格式）
// 使用： set ARK_DEMO_PASS=你的密码 && node encrypt_tool.js
//       （Windows PowerShell： $env:ARK_DEMO_PASS="你的密码"; node encrypt_tool.js ）
//
// 注意：密码不要写进源码。本脚本不会保存或打印密码。
// 算法：AES-256-CBC + PKCS7，OpenSSL 兼容格式（Salted__ + 8B salt + ciphertext）
// 密钥派生：EVP_BytesToKey（MD5，与 CryptoJS.AES.encrypt 默认行为一致）

const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const PASS = process.env.ARK_DEMO_PASS || "";
const inFile = path.join(__dirname, "date", "volc-ark-apis.json");
const outFile = path.join(__dirname, "date", "volc-ark-apis.cipher.cryptojs.txt");

if (!PASS) {
    console.error("错误：未提供加密密码。请先设置环境变量 ARK_DEMO_PASS 后再运行：");
    console.error("    PowerShell: $env:ARK_DEMO_PASS='你的密码'; node encrypt_tool.js");
    console.error("    CMD:        set ARK_DEMO_PASS=你的密码 && node encrypt_tool.js");
    console.error("    macOS/Linux: export ARK_DEMO_PASS='你的密码' && node encrypt_tool.js");
    process.exit(1);
}
if (!fs.existsSync(inFile)) {
    console.error("错误：找不到 " + inFile + "。请确保 date/volc-ark-apis.json 存在。");
    process.exit(1);
}

function evpBytesToKey(password, salt, keyLen, ivLen) {
    const pwBuf = Buffer.from(password, "utf8");
    let derived = Buffer.alloc(0);
    let block = Buffer.alloc(0);
    while (derived.length < keyLen + ivLen) {
        const h = crypto.createHash("md5");
        h.update(Buffer.concat([block, pwBuf, salt]));
        block = h.digest();
        derived = Buffer.concat([derived, block]);
    }
    return { key: derived.slice(0, keyLen), iv: derived.slice(keyLen, keyLen + ivLen) };
}

const plaintext = fs.readFileSync(inFile, "utf8");
const salt = crypto.randomBytes(8);
const { key, iv } = evpBytesToKey(PASS, salt, 32, 16);
const cip = crypto.createCipheriv("aes-256-cbc", key, iv);
const ct = Buffer.concat([cip.update(plaintext, "utf8"), cip.final()]);
const b64 = Buffer.concat([Buffer.from("Salted__", "ascii"), salt, ct]).toString("base64");

fs.writeFileSync(outFile, b64, "utf8");
console.log("[OK] 已加密，密文长度 " + b64.length + " 字符。");
console.log("[OK] 输出文件：" + outFile);
console.log("[OK] 请将下列 Base64 密文粘贴到 js/ark-api-config.js 的 ENCRYPTED_CONFIG_STRING 常量中：\n");
console.log(b64);
console.log("\n[OK] 完成。");
