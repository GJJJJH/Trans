const express = require('express');
const cors = require('cors');
const multer = require('multer');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const session = require('express-session');

// 导入路由
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 创建上传目录
const uploadDir = path.join(__dirname, '../uploads');
const tempDir = path.join(__dirname, '../temp');
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(tempDir);

// 中间件
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: 'http://localhost:5173', // Vue开发服务器
  credentials: true
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// 会话管理
app.use(session({
  secret: 'trans-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 开发环境设为false
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

// 静态文件服务
app.use('/uploads', express.static(uploadDir));

// 路由
app.use('/api/files', fileRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload directory: ${uploadDir}`);
  console.log(`Temp directory: ${tempDir}`);
});

module.exports = app;
