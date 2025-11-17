const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Additional JSON parser
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Data storage (in production, use a database)
const dataFile = path.join(__dirname, 'data', 'content.json');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({
    sections: [],
    images: [],
    videos: []
  }, null, 2));
}

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { sections: [], images: [], videos: [] };
  }
}

// Helper function to write data
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Simple authentication (in production, use proper auth)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// API Routes

// Get all content
app.get('/api/content', (req, res) => {
  const data = readData();
  res.json(data);
});

// Upload file (image or video)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
  const data = readData();
  
  const fileData = {
    id: Date.now().toString(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
    type: fileType,
    uploadedAt: new Date().toISOString()
  };

  if (fileType === 'image') {
    data.images.push(fileData);
  } else {
    data.videos.push(fileData);
  }

  writeData(data);
  res.json(fileData);
});

// Add or update text content
app.post('/api/content/section', (req, res) => {
  const { id, content, style, order } = req.body;
  const data = readData();

  if (id) {
    // Update existing section
    const index = data.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      data.sections[index] = { ...data.sections[index], content, style, order };
    }
  } else {
    // Create new section
    data.sections.push({
      id: Date.now().toString(),
      content: content || '',
      style: style || 'body-regular',
      order: order !== undefined ? order : data.sections.length,
      createdAt: new Date().toISOString()
    });
  }

  writeData(data);
  res.json(data.sections);
});

// Delete section
app.delete('/api/content/section/:id', (req, res) => {
  const data = readData();
  data.sections = data.sections.filter(s => s.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

// Delete file
app.delete('/api/content/file/:id', (req, res) => {
  const data = readData();
  let fileToDelete = null;

  // Find and remove from images
  const imageIndex = data.images.findIndex(img => img.id === req.params.id);
  if (imageIndex !== -1) {
    fileToDelete = data.images[imageIndex];
    data.images.splice(imageIndex, 1);
  }

  // Find and remove from videos
  const videoIndex = data.videos.findIndex(vid => vid.id === req.params.id);
  if (videoIndex !== -1) {
    fileToDelete = data.videos[videoIndex];
    data.videos.splice(videoIndex, 1);
  }

  // Delete physical file
  if (fileToDelete) {
    const filePath = path.join(__dirname, fileToDelete.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  writeData(data);
  res.json({ success: true });
});

// Simple auth check
app.post('/api/auth', (req, res) => {
  console.log('Auth request received');
  const { password } = req.body;
  console.log('Password received:', password ? '***' : 'empty');
  console.log('Expected password:', ADMIN_PASSWORD);
  
  if (password === ADMIN_PASSWORD) {
    console.log('Authentication successful');
    res.json({ authenticated: true });
  } else {
    console.log('Authentication failed - password mismatch');
    res.status(401).json({ authenticated: false, error: 'Invalid password' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

