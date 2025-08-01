const express = require('express');
const multer = require('multer');
const fileController = require('../controllers/fileController');

const router = express.Router();

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    files: 1000,  // 支持多文件上传（文件夹）
    fieldSize: 10 * 1024 * 1024  // 10MB 字段大小限制
  },
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/json',
      'text/plain',
      'text/json',
      'application/octet-stream' // 添加这个类型，因为某些文件可能被识别为这个类型
    ];
    // 检查文件扩展名
    const allowedExtensions = ['.zip', '.json'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'), false);
    }
  }
});

/**
 * @route POST /api/files/upload
 * @desc 上传并处理文件（支持单文件和多文件）
 * @access Public
 */
router.post('/upload', upload.array('files', 1000), fileController.uploadAndProcess);

/**
 * @route GET /api/files/result/:sessionId
 * @desc 获取处理结果
 * @access Public
 */
router.get('/result/:sessionId', fileController.getProcessingResult);

/**
 * @route GET /api/files/list/:sessionId
 * @desc 获取文件列表和翻译条目
 * @access Public
 */
router.get('/list/:sessionId', fileController.getFileList);

/**
 * @route GET /api/files/translations/:sessionId/:filePath
 * @desc 获取特定文件的翻译条目
 * @access Public
 */
router.get('/translations/:sessionId/:filePath', fileController.getFileTranslations);

/**
 * @route GET /api/files/export/:sessionId
 * @desc 导出所有翻译条目为CSV
 * @access Public
 */
router.get('/export/:sessionId', fileController.exportTranslations);

/**
 * @route GET /api/files/export/:sessionId/:filePath
 * @desc 导出特定文件的翻译条目为CSV
 * @access Public
 */
router.get('/export/:sessionId/:filePath', fileController.exportTranslations);

/**
 * @route DELETE /api/files/session/:sessionId
 * @desc 清理会话
 * @access Public
 */
router.delete('/session/:sessionId', fileController.cleanupSession);

module.exports = router; 