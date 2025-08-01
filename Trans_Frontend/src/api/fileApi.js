const API_BASE_URL = 'http://localhost:3001/api';

class FileApi {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * 上传并处理文件
   * @param {File|File[]} files - 要上传的文件或文件数组
   * @returns {Promise<Object>} 处理结果
   */
  async uploadAndProcess(files) {
    const formData = new FormData();
    // 支持单个文件或文件数组
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '文件上传失败');
    }
    return await response.json();
  }

  /**
   * 获取处理结果
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object>} 处理结果
   */
  async getProcessingResult(sessionId) {
    const response = await fetch(`${this.baseURL}/files/result/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取处理结果失败');
    }

    return await response.json();
  }

  /**
   * 获取文件列表和翻译条目
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object>} 文件列表和翻译条目
   */
  async getFileList(sessionId) {
    const response = await fetch(`${this.baseURL}/files/list/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取文件列表失败');
    }

    return await response.json();
  }

  /**
   * 获取特定文件的翻译条目
   * @param {string} sessionId - 会话ID
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 翻译条目
   */
  async getFileTranslations(sessionId, filePath) {
    const encodedPath = encodeURIComponent(filePath);
    const response = await fetch(`${this.baseURL}/files/translations/${sessionId}/${encodedPath}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取文件翻译失败');
    }

    return await response.json();
  }

  /**
   * 导出翻译条目为CSV
   * @param {string} sessionId - 会话ID
   * @param {string} filePath - 文件路径（可选）
   * @returns {Promise<Blob>} CSV文件
   */
  async exportTranslations(sessionId, filePath = null) {
    let url = `${this.baseURL}/files/export/${sessionId}`;
    
    if (filePath) {
      const encodedPath = encodeURIComponent(filePath);
      url += `/${encodedPath}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '导出翻译失败');
    }

    return await response.blob();
  }

  /**
   * 清理会话
   * @param {string} sessionId - 会话ID
   * @returns {Promise<Object>} 清理结果
   */
  async cleanupSession(sessionId) {
    const response = await fetch(`${this.baseURL}/files/session/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '清理会话失败');
    }

    return await response.json();
  }

  /**
   * 下载CSV文件
   * @param {Blob} blob - CSV文件内容
   * @param {string} filename - 文件名
   */
  downloadCSV(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default new FileApi();