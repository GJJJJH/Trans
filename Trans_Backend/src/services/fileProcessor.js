const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileProcessor {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(__dirname, '../../temp');
  }

  /**
   * 处理上传的文件
   * @param {Object} file - 上传的文件对象
   * @param {string} sessionId - 会话ID
   * @returns {Object} 处理结果
   */
  async processFile(file, sessionId) {
    try {
      
      const sessionDir = path.join(this.tempDir, sessionId);
      await fs.ensureDir(sessionDir);
      
      const filePath = path.join(sessionDir, file.originalname);
      await fs.writeFile(filePath, file.buffer);
      
      // 检测文件类型
      const fileType = this.detectFileType(file.originalname, filePath);
      
      let result;
      switch (fileType) {
        case 'zip':
          result = await this.processZipFile(filePath, sessionId);
          break;
        case 'json':
          result = await this.processJsonFile(filePath, sessionId);
          break;
        default:
          throw new Error('不支持的文件类型');
      }
      
      // 清理临时文件
      await fs.remove(sessionDir);
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 检测文件类型
   */
  detectFileType(filename, filePath) {
    const ext = path.extname(filename).toLowerCase();
    
    if (ext === '.zip') {
      return 'zip';
    }
    
    if (ext === '.json') {
      return 'json';
    }
    
    return 'unknown';
  }

    /**
   * 处理ZIP文件
   */
  async processZipFile(zipPath, sessionId) {
    const extractDir = path.join(this.tempDir, sessionId, 'extracted');
    await fs.ensureDir(extractDir);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    // 查找data目录下的JSON文件
    const jsonFiles = await this.findJsonFilesInData(extractDir);

    if (jsonFiles.length === 0) {
      throw new Error('ZIP文件中未找到任何data目录下的JSON文件。请确保ZIP文件包含data目录和JSON文件。');
    }

    // 提取文本
    const translationEntries = await this.extractTextFromFiles(jsonFiles);

    return {
      type: 'zip',
      validFiles: jsonFiles,
      extractedFiles: jsonFiles,
      translationEntries,
      message: `成功从ZIP文件中提取了${jsonFiles.length}个JSON文件，并提取了${translationEntries.length}条可翻译文本`
    };
  }

  /**
   * 处理单个JSON文件
   */
  async processJsonFile(filePath, sessionId) {
    const fileName = path.basename(filePath);
    const relativePath = `data/${fileName}`; // 假设是data目录下的文件
    
    const fileInfo = {
      path: filePath,
      relativePath: relativePath,
      name: fileName,
      size: (await fs.stat(filePath)).size
    };
    
    const translationEntries = await this.extractTextFromFiles([fileInfo]);
    
    return {
      type: 'json',
      validFiles: [fileInfo],
      extractedFiles: [fileInfo],
      translationEntries,
      message: `处理了1个JSON文件，并提取了${translationEntries.length}条可翻译文本`
    };
  }

  /**
   * 在data目录下查找JSON文件（支持嵌套路径）
   */
  async findJsonFilesInData(rootDir) {
    const jsonFiles = [];
    
    const findJsonFiles = async (dir, relativePath = '') => {
      try {
        const items = await fs.readdir(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stats = await fs.stat(fullPath);
          const itemRelativePath = path.join(relativePath, item);
          
          if (stats.isDirectory()) {
            // 递归查找所有目录
            await findJsonFiles(fullPath, itemRelativePath);
          } else if (stats.isFile() && item.toLowerCase().endsWith('.json')) {
            // 检查是否在任何data目录下（支持嵌套路径）
            if (this.isInDataDirectory(itemRelativePath)) {
              jsonFiles.push({
                path: fullPath,
                relativePath: itemRelativePath,
                name: item,
                size: stats.size
              });
            }
          }
        }
      } catch (error) {
        console.error(`❌ 读取目录失败: ${dir}`, error);
      }
    };
    
    await findJsonFiles(rootDir);
    
    return jsonFiles;
  }

  /**
   * 检查文件是否在data目录下（支持嵌套路径）
   */
  isInDataDirectory(filePath) {
    // 将路径分割成目录部分
    const pathParts = filePath.split(path.sep);
    
    // 查找data目录的位置
    const dataIndex = pathParts.findIndex(part => part === 'data');
    
    if (dataIndex === -1) {
      return false; // 没有找到data目录
    }
    
    // 检查文件是否在data目录下（data目录之后）
    return dataIndex < pathParts.length - 1;
  }

  /**
   * 列出目录内容（调试用）
   */
  async listDirectoryContents(dir, indent = '') {
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.listDirectoryContents(fullPath, indent + '  ');
        }
      }
    } catch (error) {
      console.error(`❌ 列出目录内容失败: ${dir}`, error);
    }
  }

  /**
   * 从文件中提取文本
   */
  async extractTextFromFiles(files) {
    const translationEntries = [];
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file.path, 'utf8');
        const jsonData = JSON.parse(content);
        
        const entries = this.extractTextFromJson(jsonData, file.relativePath);
        translationEntries.push(...entries);
        
      } catch (error) {
        console.error(`❌ 处理文件${file.name}失败:`, error);
      }
    }
    
    return translationEntries;
  }

  /**
   * 从JSON数据中提取可翻译文本
   */
  extractTextFromJson(data, filePath) {
    const entries = [];
    const processed = new Set();
    
    const extractText = (obj, context = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = context ? `${context}.${key}` : key;
        
        if (typeof value === 'string' && value.trim()) {
          const text = value.trim();
          
          // 检查是否是可翻译的文本
          if (this.isTranslatableText(text, key)) {
            const entryId = `${filePath}:${currentPath}:${text}`;
            
            if (!processed.has(entryId)) {
              processed.add(entryId);
              
              entries.push({
                id: entryId,
                file: filePath,
                original: text,
                translated: '',
                context: {
                  type: this.getContextType(key),
                  path: currentPath
                }
              });
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          extractText(value, currentPath);
        }
      }
    };
    
    extractText(data);
    return entries;
  }

  /**
   * 判断文本是否可翻译
   */
  isTranslatableText(text, key) {
    // 过滤条件
    if (text.length < 2) return false;
    if (text.length > 1000) return false;
    if (/^[0-9\s\-_.,;:!?()\[\]{}"'`~@#$%^&*+=|\\/<>]+$/.test(text)) return false;
    if (/^[a-zA-Z0-9\s\-_.,;:!?()\[\]{}"'`~@#$%^&*+=|\\/<>]+$/.test(text)) return false;
    
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
    return translationKeywords.some(keyword => keyLower.includes(keyword));
  }

  /**
   * 获取上下文类型
   */
  getContextType(key) {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('name')) return '名称';
    if (keyLower.includes('text')) return '文本';
    if (keyLower.includes('message')) return '消息';
    if (keyLower.includes('description')) return '描述';
    if (keyLower.includes('title')) return '标题';
    if (keyLower.includes('content')) return '内容';
    if (keyLower.includes('note')) return '注释';
    if (keyLower.includes('memo')) return '备注';
    if (keyLower.includes('comment')) return '评论';
    if (keyLower.includes('label')) return '标签';
    if (keyLower.includes('caption')) return '说明';
    if (keyLower.includes('hint')) return '提示';
    if (keyLower.includes('help')) return '帮助';
    if (keyLower.includes('info')) return '信息';
    if (keyLower.includes('detail')) return '详情';
    if (keyLower.includes('summary')) return '摘要';
    if (keyLower.includes('abstract')) return '摘要';
    
    return '文本';
  }

  /**
   * 清理会话文件
   */
  async cleanupSession(sessionId) {
    try {
      const sessionDir = path.join(this.tempDir, sessionId);
      await fs.remove(sessionDir);
    } catch (error) {
      console.error(`❌ 清理会话文件失败: ${sessionId}`, error);
    }
  }
}

module.exports = new FileProcessor(); 