const fileProcessor = require('../services/fileProcessor');
const { v4: uuidv4 } = require('uuid');

// 内存存储会话数据（生产环境应该使用Redis或数据库）
const sessionStore = new Map();

/**
 * 构建文件树结构
 */
function buildFileTree(files) {
  const tree = [];
  
  // 过滤出包含 data 目录的 JSON 文件
  const dataJsonFiles = files.filter(file => {
    const hasDataDir = file.relativePath.startsWith('data/') || file.relativePath.includes('/data/') || file.relativePath.endsWith('/data');
    const isJson = file.name.toLowerCase().endsWith('.json');
    return hasDataDir && isJson;
  });
  
  if (dataJsonFiles.length > 0) {
    // 构建完整的目录结构
    const folderStructure = {};
    
    dataJsonFiles.forEach(file => {
      const pathParts = file.relativePath.split('/');
      const dataIndex = pathParts.findIndex(part => part === 'data');
      
      if (dataIndex !== -1) {
        // 构建从根目录到 data 目录的完整路径
        const fullPath = pathParts.slice(0, dataIndex + 1).join('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // 修正文件夹命名逻辑
        let folderName;
        if (dataIndex > 0 && pathParts[dataIndex - 1]) {
          // 有上级目录，使用 "上级目录/data" 格式
          const projectName = pathParts[dataIndex - 1];
          folderName = `${projectName}/data`;
        } else {
          // 没有上级目录或 data 在根目录，直接使用 "data"
          folderName = 'data';
        }
        
        if (!folderStructure[fullPath]) {
          folderStructure[fullPath] = {
            id: fullPath,
            name: folderName,
            type: 'folder',
            children: []
          };
        }
        
        const fileNode = {
          id: file.relativePath,
          name: fileName,
          type: 'file',
          file: file
        };
        
        folderStructure[fullPath].children.push(fileNode);
      }
    });
    
    // 将文件夹结构转换为数组
    Object.values(folderStructure).forEach(folder => {
      tree.push(folder);
    });
  }
  
  return tree;
}

/**
 * 生成CSV内容
 */
function generateCSV(translations) {
  const headers = ['文件名', '序号', '类型', '路径', '原文', '翻译'];
  
  const rows = translations.map((entry, index) => [
    entry.file,
    index + 1,
    entry.context?.type || '',
    entry.context?.path || '',
    `"${entry.original.replace(/"/g, '""')}"`,
    `"${entry.translated.replace(/"/g, '""')}"`
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * 合并多个处理结果
 */
function combineResults(results) {
  if (!Array.isArray(results)) {
    return {
      validFiles: [],
      translationEntries: [],
      message: '没有有效的处理结果'
    };
  }
  
  const allValidFiles = [];
  const allTranslationEntries = [];
  let totalProcessed = 0;
  let totalValid = 0;
  
  results.forEach((result, index) => {
    if (result && result.validFiles) {
      allValidFiles.push(...result.validFiles);
      totalValid += result.validFiles.length;
    }
    if (result && result.translationEntries) {
      allTranslationEntries.push(...result.translationEntries);
    }
    totalProcessed++;
  });
  
  const combinedResult = {
    validFiles: allValidFiles,
    translationEntries: allTranslationEntries,
    message: `成功处理 ${totalProcessed} 个文件，找到 ${totalValid} 个有效文件，提取到 ${allTranslationEntries.length} 条翻译文本`
  };
  
  return combinedResult;
}

class FileController {
  /**
   * 上传并处理文件
   */
  async uploadAndProcess(req, res) {
    try {
      // 检查是否有文件上传（支持单文件和多文件）
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded',
          message: '请选择要上传的文件'
        });
      }

      const sessionId = uuidv4();
      let results = [];

      // 处理所有文件（upload.any() 会将所有文件放在 req.files 中）
      for (const file of req.files) {
        try {
          const result = await fileProcessor.processFile(file, sessionId);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`❌ 处理文件 ${file.originalname} 失败:`, error);
          // 继续处理其他文件
        }
      }
      
      // 合并所有结果
      let combinedResult;
      if (results.length === 1) {
        // 单个文件的情况，直接使用结果
        const result = results[0];
        combinedResult = {
          validFiles: result.validFiles || [],
          translationEntries: result.translationEntries || [],
          message: result.message || '文件处理完成'
        };
      } else {
        // 多个文件的情况，使用 combineResults
        combinedResult = combineResults(results);
      }

      // 保存结果到内存存储
      sessionStore.set(sessionId, {
        files: combinedResult.validFiles,
        translationEntries: combinedResult.translationEntries,
        timestamp: new Date().toISOString()
      });


      res.json({
        success: true,
        sessionId,
        result: {
          type: 'multiple',
          validFiles: combinedResult.validFiles.map(file => ({
            name: file.name,
            relativePath: file.relativePath,
            size: file.size
          })),
          translationEntries: combinedResult.translationEntries,
          message: combinedResult.message
        }
      });

    } catch (error) {
      console.error('❌ 文件上传处理失败:', error);
      res.status(500).json({
        error: 'File processing failed',
        message: error.message
      });
    }
  }

  /**
   * 获取处理结果
   */
  async getProcessingResult(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID required',
          message: '需要提供会话ID'
        });
      }

      // 从内存存储获取结果
      const sessionData = sessionStore.get(sessionId);

      if (!sessionData) {
        return res.status(404).json({
          error: 'Session not found',
          message: '会话不存在或已过期'
        });
      }

      res.json({
        success: true,
        data: sessionData
      });

    } catch (error) {
      console.error('❌ 获取处理结果失败:', error);
      res.status(500).json({
        error: 'Failed to get processing result',
        message: error.message
      });
    }
  }

  /**
   * 获取文件列表
   */
  async getFileList(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID required',
          message: '需要提供会话ID'
        });
      }

      const sessionData = sessionStore.get(sessionId);

      if (!sessionData) {
        return res.status(404).json({
          error: 'Session not found',
          message: '会话不存在或已过期'
        });
      }

      // 构建文件树结构
      const fileTree = buildFileTree(sessionData.files);

      res.json({
        success: true,
        data: {
          files: sessionData.files,
          fileTree,
          translationEntries: sessionData.translationEntries
        }
      });

    } catch (error) {
      console.error('❌ 获取文件列表失败:', error);
      res.status(500).json({
        error: 'Failed to get file list',
        message: error.message
      });
    }
  }

  /**
   * 获取特定文件的翻译条目
   */
  async getFileTranslations(req, res) {
    try {
      const { sessionId, filePath } = req.params;

      if (!sessionId || !filePath) {
        return res.status(400).json({
          error: 'Session ID and file path required',
          message: '需要提供会话ID和文件路径'
        });
      }

      const sessionData = sessionStore.get(sessionId);

      if (!sessionData) {
        return res.status(404).json({
          error: 'Session not found',
          message: '会话不存在或已过期'
        });
      }

      // 过滤出指定文件的翻译条目
      const fileTranslations = sessionData.translationEntries.filter(
        entry => entry.file === filePath
      );

      res.json({
        success: true,
        data: {
          filePath,
          translations: fileTranslations,
          count: fileTranslations.length
        }
      });

    } catch (error) {
      console.error('❌ 获取文件翻译失败:', error);
      res.status(500).json({
        error: 'Failed to get file translations',
        message: error.message
      });
    }
  }

  /**
   * 导出翻译条目为CSV
   */
  async exportTranslations(req, res) {
    try {
      const { sessionId, filePath } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID required',
          message: '需要提供会话ID'
        });
      }

      const sessionData = sessionStore.get(sessionId);

      if (!sessionData) {
        return res.status(404).json({
          error: 'Session not found',
          message: '会话不存在或已过期'
        });
      }

      let translations = sessionData.translationEntries;

      // 如果指定了文件路径，只导出该文件的翻译
      if (filePath) {
        translations = translations.filter(entry => entry.file === filePath);
      }

      // 生成CSV内容
      const csvContent = generateCSV(translations);

      const filename = filePath 
        ? `${filePath.replace(/[^a-zA-Z0-9]/g, '_')}_translations.csv`
        : 'all_translations.csv';

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);

    } catch (error) {
      console.error('❌ 导出翻译失败:', error);
      res.status(500).json({
        error: 'Failed to export translations',
        message: error.message
      });
    }
  }

  /**
   * 清理会话
   */
  async cleanupSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'Session ID required',
          message: '需要提供会话ID'
        });
      }

      // 清理会话数据
      sessionStore.delete(sessionId);

      // 清理临时文件
      await fileProcessor.cleanupSession(sessionId);

      res.json({
        success: true,
        message: '会话已清理'
      });

    } catch (error) {
      console.error('❌ 清理会话失败:', error);
      res.status(500).json({
        error: 'Failed to cleanup session',
        message: error.message
      });
    }
  }
}

module.exports = new FileController(); 