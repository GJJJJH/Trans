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
   * 分析文件（预览阶段）
   */
  static async analyzeFiles(req, res) {
    try {
      console.log('开始文件分析，文件数量:', req.files ? req.files.length : 0);
      
      // 检查是否有文件上传
      if (!req.files || req.files.length === 0) {
        console.log('没有检测到上传的文件');
        return res.status(400).json({
          error: 'No files uploaded',
          message: '请选择要上传的文件'
        });
      }

      // 分析文件，但不进行实际处理
      const analysisResults = [];
      let estimatedCount = 0;
      let hasErrors = false;
      let errorMessages = [];

      for (const file of req.files) {
        console.log(`分析文件: ${file.originalname}, 大小: ${file.size} bytes`);
        
        try {
          // 基础文件信息
          const fileInfo = {
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            estimatedEntries: 0
          };

          // 根据文件类型进行不同的分析
          const fileName = file.originalname.toLowerCase();
          
          if (fileName.endsWith('.json')) {
            // JSON文件分析
            try {
              if (!file.buffer || file.buffer.length === 0) {
                throw new Error('文件内容为空');
              }
              
              const content = file.buffer.toString('utf8');
              console.log(`JSON文件内容长度: ${content.length} 字符`);
              
              if (content.trim().length === 0) {
                throw new Error('文件内容为空');
              }
              
              const jsonData = JSON.parse(content);
              const estimatedEntries = FileController.estimateTranslationEntries(jsonData);
              
              fileInfo.estimatedEntries = estimatedEntries;
              estimatedCount += estimatedEntries;
              
              console.log(`JSON文件分析成功: ${file.originalname}, 预估条目: ${estimatedEntries}`);
              
            } catch (jsonError) {
              console.error(`JSON解析失败 ${file.originalname}:`, jsonError.message);
              
              // JSON解析失败，尝试基于文件大小估算
              const sizeBasedEstimate = Math.max(5, Math.floor(file.size / 100));
              fileInfo.estimatedEntries = sizeBasedEstimate;
              fileInfo.parseError = `JSON格式错误: ${jsonError.message}`;
              estimatedCount += sizeBasedEstimate;
              
              hasErrors = true;
              errorMessages.push(`文件 ${file.originalname}: JSON格式错误`);
            }
            
          } else if (fileName.endsWith('.zip')) {
            // ZIP文件分析
            fileInfo.estimatedEntries = 50; // 默认估算
            estimatedCount += 50;
            console.log(`ZIP文件分析: ${file.originalname}, 预估条目: 50`);
            
          } else {
            // 其他文件类型
            const sizeBasedEstimate = Math.max(3, Math.floor(file.size / 200));
            fileInfo.estimatedEntries = sizeBasedEstimate;
            estimatedCount += sizeBasedEstimate;
            console.log(`其他文件分析: ${file.originalname}, 预估条目: ${sizeBasedEstimate}`);
          }

          analysisResults.push(fileInfo);
          
        } catch (error) {
          console.error(`分析文件 ${file.originalname} 失败:`, error.message);
          
          // 即使分析失败，也要添加到结果中，给一个基础估算
          const fallbackEstimate = Math.max(3, Math.floor(file.size / 500));
          analysisResults.push({
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            estimatedEntries: fallbackEstimate,
            parseError: `分析失败: ${error.message}`
          });
          
          estimatedCount += fallbackEstimate;
          hasErrors = true;
          errorMessages.push(`文件 ${file.originalname}: ${error.message}`);
        }
      }

      // 确保至少有一个有效文件
      if (analysisResults.length === 0) {
        console.log('没有有效的分析结果');
        return res.status(400).json({
          error: 'No valid files',
          message: '没有找到有效的文件'
        });
      }

      // 确保预估数量合理，但保持与单个文件预估的一致性
      const finalEstimatedCount = Math.max(estimatedCount, 1);
      
      console.log(`分析完成: ${analysisResults.length} 个文件, 预估 ${finalEstimatedCount} 个翻译条目`);
      console.log('分析结果:', analysisResults.map(f => `${f.name}: ${f.estimatedEntries}条`));

      res.json({
        success: true,
        files: analysisResults,
        estimatedCount: finalEstimatedCount,
        message: hasErrors ? 
          `分析完成，检测到 ${analysisResults.length} 个文件，预估 ${finalEstimatedCount} 个翻译条目（部分文件分析失败）` :
          `分析完成，检测到 ${analysisResults.length} 个文件，预估 ${finalEstimatedCount} 个翻译条目`,
        hasErrors,
        errorMessage: errorMessages.join('; ')
      });

    } catch (error) {
      console.error('文件分析失败:', error);
      res.status(500).json({
        error: 'File analysis failed',
        message: error.message || '文件分析失败，请检查文件格式'
      });
    }
  }

  /**
   * 估算JSON数据中的翻译条目数量
   */
  static estimateTranslationEntries(data) {
    let count = 0;
    
    try {
      const countEntries = (obj, depth = 0) => {
        // 防止无限递归
        if (depth > 10) return;
        
        if (!obj || typeof obj !== 'object') return;
        
        // 处理数组
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            if (typeof item === 'string' && item.trim()) {
              const text = item.trim();
              if (FileController.isTranslatableText(text, `array[${index}]`)) {
                count++;
              }
            } else if (typeof item === 'object' && item !== null) {
              countEntries(item, depth + 1);
            }
          });
          return;
        }
        
        // 处理对象
        for (const [key, value] of Object.entries(obj)) {
          try {
            if (typeof value === 'string' && value.trim()) {
              const text = value.trim();
              // 使用与 fileProcessor 相同的判断逻辑
              if (FileController.isTranslatableText(text, key)) {
                count++;
              }
            } else if (typeof value === 'object' && value !== null) {
              countEntries(value, depth + 1);
            }
          } catch (entryError) {
            console.error(`处理条目 ${key} 时出错:`, entryError.message);
            // 继续处理其他条目
          }
        }
      };
      
      countEntries(data);
      
      // 确保返回合理的数量
      return Math.max(1, Math.min(count, 1000)); // 最少1个，最多1000个
      
    } catch (error) {
      console.error('估算翻译条目时出错:', error.message);
      // 返回基于数据大小的估算
      const dataSize = JSON.stringify(data).length;
      return Math.max(3, Math.floor(dataSize / 100));
    }
  }

  /**
   * 判断文本是否可翻译（与 fileProcessor 保持一致）
   */
  static isTranslatableText(text, key) {
    try {
      // 参数验证
      if (!text || typeof text !== 'string') return false;
      if (!key || typeof key !== 'string') return false;
      
      const trimmedText = text.trim();
      
      // 基础过滤条件
      if (trimmedText.length < 2) return false;
      if (trimmedText.length > 1000) return false;
      
      // 过滤纯数字、符号等
      if (/^[0-9\s\-_.,;:!?()\[\]{}"'`~@#$%^&*+=|\\/<>]+$/.test(trimmedText)) return false;
      if (/^[a-zA-Z0-9\s\-_.,;:!?()\[\]{}"'`~@#$%^&*+=|\\/<>]+$/.test(trimmedText)) return false;
      
      // 过滤明显的非文本内容
      if (/^[0-9]+$/.test(trimmedText)) return false; // 纯数字
      if (/^[a-zA-Z0-9_]+$/.test(trimmedText)) return false; // 纯英文标识符
      if (/^[0-9a-fA-F]+$/.test(trimmedText) && trimmedText.length > 8) return false; // 可能是哈希值
      
      // RPG Maker 特定字段
      const rpgMakerFields = [
        'text', 'parameters', 'name', 'description', 'message1', 'message2', 'message3', 'message4',
        'note', 'memo', 'help', 'hint', 'caption', 'label', 'title', 'content'
      ];
      
      // 通用翻译关键词
      const translationKeywords = [
        'name', 'text', 'message', 'description', 'title', 'content',
        'note', 'memo', 'comment', 'label', 'caption', 'hint',
        'help', 'info', 'detail', 'summary', 'abstract'
      ];
      
      const keyLower = key.toLowerCase();
      
      // 优先检查 RPG Maker 特定字段
      if (rpgMakerFields.some(field => keyLower.includes(field))) {
        return true;
      }
      
      // 然后检查通用关键词
      if (translationKeywords.some(keyword => keyLower.includes(keyword))) {
        return true;
      }
      
      // 如果字段名不匹配，但文本内容看起来像可翻译的文本
      // 检查是否包含日文字符或其他非ASCII字符
      if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmedText)) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('判断文本是否可翻译时出错:', error.message);
      return false;
    }
  }

  /**
   * 上传并处理文件
   */
  static async uploadAndProcess(req, res) {
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
          console.error(`处理文件 ${file.originalname} 失败:`, error);
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
      console.error('文件上传处理失败:', error);
      res.status(500).json({
        error: 'File processing failed',
        message: error.message
      });
    }
  }

  /**
   * 获取处理结果
   */
  static async getProcessingResult(req, res) {
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
      console.error('获取处理结果失败:', error);
      res.status(500).json({
        error: 'Failed to get processing result',
        message: error.message
      });
    }
  }

  /**
   * 获取文件列表
   */
  static async getFileList(req, res) {
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
      console.error('获取文件列表失败:', error);
      res.status(500).json({
        error: 'Failed to get file list',
        message: error.message
      });
    }
  }

  /**
   * 获取特定文件的翻译条目
   */
  static async getFileTranslations(req, res) {
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
      console.error('获取文件翻译失败:', error);
      res.status(500).json({
        error: 'Failed to get file translations',
        message: error.message
      });
    }
  }

  /**
   * 导出翻译条目为CSV
   */
  static async exportTranslations(req, res) {
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
      console.error('导出翻译失败:', error);
      res.status(500).json({
        error: 'Failed to export translations',
        message: error.message
      });
    }
  }

  /**
   * 清理会话
   */
  static async cleanupSession(req, res) {
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
      console.error('清理会话失败:', error);
      res.status(500).json({
        error: 'Failed to cleanup session',
        message: error.message
      });
    }
  }
}

module.exports = FileController; 