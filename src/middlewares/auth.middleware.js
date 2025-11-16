import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  const SECRET = process.env.JWT_SECRET || 'yourSecretKey';
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
export function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}