export default function loggingMiddleware(req, res, next) {
  const now = new Date().toISOString();

 
  const loginId = req.headers["5da6ac42-c211-40ba-8cf0-a2c16a0c949e"] || "anonymous";  
  const message = req.body?.message || "no-message";         

  // Custom log format
  console.log(
    `[${now}] LOGIN_ID=${loginId} METHOD=${req.method} URL=${req.url} MESSAGE=${message}`
  );

  next();
}
