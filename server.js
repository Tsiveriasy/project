import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const JWT_SECRET = 'your-secret-key';

// Configuration CORS
server.use(cors({
  origin: /^http:\/\/localhost:\d+$/,  // Accepte tous les ports sur localhost
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
server.use(jsonServer.bodyParser);

// Auth middleware
const auth = (req, res, next) => {
  if (req.method === 'GET' && (req.path === '/universities' || req.path === '/programs')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

// Login endpoint
server.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email }).value();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ accessToken: token, user: { ...user, password: undefined } });
});

// Register endpoint
server.post('/register', async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const db = router.db;

  const existingUser = db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    username,
    firstName,
    lastName,
    role: 'user',
    savedPrograms: [],
    savedUniversities: []
  };

  db.get('users').push(newUser).write();

  const token = jwt.sign(
    { sub: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    accessToken: token,
    user: { ...newUser, password: undefined }
  });
});

// Protected routes
server.use(auth);

// Use default router
server.use(router);

const port = 3001;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
