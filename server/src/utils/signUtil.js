const crypto = require("crypto");

const SECRET = "my-super-secret-key"; // later move to .env

const EXPIRY_TIME = 60 * 5; // 5 minutes

// 🔐 Generate signed URL
const signPath = (filePath) => {
  const expires = Math.floor(Date.now() / 1000) + EXPIRY_TIME;

  const data = `${filePath}:${expires}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  return `${filePath}?exp=${expires}&sig=${signature}`;
};

// 🔍 Verify URL
const verifySignature = (filePath, exp, sig) => {
  if (!exp || !sig) return false;

  const now = Math.floor(Date.now() / 1000);

  if (now > exp) return false;

  const data = `${filePath}:${exp}`;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  return expected === sig;
};

module.exports = { signPath, verifySignature };