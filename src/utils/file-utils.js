/**
 * 文件处理工具函数库
 * 提供文件上传、验证、压缩、预览等功能
 */

/**
 * 文件类型配置
 */
export const FILE_TYPES = {
  IMAGE: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  DOCUMENT: {
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  AUDIO: {
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4'],
    maxSize: 20 * 1024 * 1024 // 20MB
  },
  VIDEO: {
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'],
    maxSize: 100 * 1024 * 1024 // 100MB
  }
};

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名（小写）
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1).toLowerCase() : '';
};

/**
 * 获取文件类型
 * @param {File|string} file - 文件对象或文件名
 * @returns {string} 文件类型 ('image', 'document', 'audio', 'video', 'unknown')
 */
export const getFileType = (file) => {
  let extension, mimeType;
  
  if (file instanceof File) {
    extension = getFileExtension(file.name);
    mimeType = file.type;
  } else if (typeof file === 'string') {
    extension = getFileExtension(file);
    mimeType = '';
  } else {
    return 'unknown';
  }
  
  for (const [type, config] of Object.entries(FILE_TYPES)) {
    if (config.extensions.includes(extension) || 
        (mimeType && config.mimeTypes.includes(mimeType))) {
      return type.toLowerCase();
    }
  }
  
  return 'unknown';
};

/**
 * 验证文件
 * @param {File} file - 文件对象
 * @param {Object} options - 验证选项
 * @returns {Object} 验证结果
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ['image', 'document'],
    maxSize = 5 * 1024 * 1024, // 5MB
    minSize = 0,
    allowedExtensions = [],
    allowedMimeTypes = []
  } = options;
  
  const errors = [];
  
  if (!file || !(file instanceof File)) {
    errors.push('无效的文件对象');
    return { isValid: false, errors };
  }
  
  // 文件大小验证
  if (file.size > maxSize) {
    errors.push(`文件大小不能超过 ${formatFileSize(maxSize)}`);
  }
  
  if (file.size < minSize) {
    errors.push(`文件大小不能小于 ${formatFileSize(minSize)}`);
  }
  
  // 文件类型验证
  const fileType = getFileType(file);
  if (allowedTypes.length > 0 && !allowedTypes.includes(fileType)) {
    errors.push(`不支持的文件类型，仅支持: ${allowedTypes.join(', ')}`);
  }
  
  // 扩展名验证
  const extension = getFileExtension(file.name);
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    errors.push(`不支持的文件扩展名，仅支持: ${allowedExtensions.join(', ')}`);
  }
  
  // MIME类型验证
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
    errors.push(`不支持的文件格式`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: fileType,
      extension,
      mimeType: file.type,
      lastModified: file.lastModified
    }
  };
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * 读取文件内容
 * @param {File} file - 文件对象
 * @param {string} readAs - 读取方式 ('text', 'dataURL', 'arrayBuffer', 'binaryString')
 * @returns {Promise} 文件内容
 */
export const readFile = (file, readAs = 'text') => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error('无效的文件对象'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (event) => {
      reject(new Error('文件读取失败'));
    };
    
    switch (readAs) {
      case 'text':
        reader.readAsText(file);
        break;
      case 'dataURL':
        reader.readAsDataURL(file);
        break;
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file);
        break;
      case 'binaryString':
        reader.readAsBinaryString(file);
        break;
      default:
        reject(new Error('不支持的读取方式'));
    }
  });
};

/**
 * 图片压缩
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} 压缩后的文件
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      outputFormat = 'image/jpeg'
    } = options;
    
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('不是有效的图片文件'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: outputFormat,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          reject(new Error('图片压缩失败'));
        }
      }, outputFormat, quality);
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 生成图片预览
 * @param {File} file - 图片文件
 * @param {Object} options - 预览选项
 * @returns {Promise<string>} 预览URL
 */
export const generateImagePreview = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const { maxWidth = 200, maxHeight = 200 } = options;
    
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('不是有效的图片文件'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算缩略图尺寸
      let { width, height } = img;
      const aspectRatio = width / height;
      
      if (width > height) {
        width = Math.min(width, maxWidth);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxHeight);
        width = height * aspectRatio;
      }
      
      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制缩略图
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为DataURL
      const previewUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(previewUrl);
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 文件上传管理器
 */
export class FileUploader {
  constructor(options = {}) {
    this.options = {
      url: '/api/files/upload',
      method: 'POST',
      fieldName: 'file',
      headers: {},
      data: {},
      timeout: 30000,
      chunkSize: 1024 * 1024, // 1MB chunks for large files
      concurrent: 3, // 并发上传数
      ...options
    };
    
    this.uploadQueue = [];
    this.activeUploads = new Map();
    this.uploadResults = new Map();
  }
  
  /**
   * 添加文件到上传队列
   * @param {File|File[]} files - 文件或文件数组
   * @param {Object} options - 上传选项
   * @returns {string[]} 上传任务ID数组
   */
  addFiles(files, options = {}) {
    const fileArray = Array.isArray(files) ? files : [files];
    const taskIds = [];
    
    fileArray.forEach(file => {
      const taskId = this.generateTaskId();
      const uploadTask = {
        id: taskId,
        file,
        options: { ...this.options, ...options },
        status: 'pending',
        progress: 0,
        error: null,
        result: null
      };
      
      this.uploadQueue.push(uploadTask);
      taskIds.push(taskId);
    });
    
    this.processQueue();
    return taskIds;
  }
  
  /**
   * 生成任务ID
   * @returns {string} 任务ID
   */
  generateTaskId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 处理上传队列
   */
  async processQueue() {
    while (this.uploadQueue.length > 0 && this.activeUploads.size < this.options.concurrent) {
      const task = this.uploadQueue.shift();
      this.activeUploads.set(task.id, task);
      this.uploadFile(task);
    }
  }
  
  /**
   * 上传单个文件
   * @param {Object} task - 上传任务
   */
  async uploadFile(task) {
    try {
      task.status = 'uploading';
      
      const formData = new FormData();
      formData.append(task.options.fieldName, task.file);
      
      // 添加额外数据
      Object.keys(task.options.data).forEach(key => {
        formData.append(key, task.options.data[key]);
      });
      
      const xhr = new XMLHttpRequest();
      
      // 上传进度
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          task.progress = Math.round((event.loaded / event.total) * 100);
          this.onProgress?.(task.id, task.progress);
        }
      });
      
      // 上传完成
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            task.status = 'completed';
            task.result = result;
            this.uploadResults.set(task.id, result);
            this.onSuccess?.(task.id, result);
          } catch (error) {
            task.status = 'error';
            task.error = '响应解析失败';
            this.onError?.(task.id, task.error);
          }
        } else {
          task.status = 'error';
          task.error = `上传失败: ${xhr.status} ${xhr.statusText}`;
          this.onError?.(task.id, task.error);
        }
        
        this.activeUploads.delete(task.id);
        this.processQueue();
      });
      
      // 上传错误
      xhr.addEventListener('error', () => {
        task.status = 'error';
        task.error = '网络错误';
        this.onError?.(task.id, task.error);
        this.activeUploads.delete(task.id);
        this.processQueue();
      });
      
      // 上传超时
      xhr.addEventListener('timeout', () => {
        task.status = 'error';
        task.error = '上传超时';
        this.onError?.(task.id, task.error);
        this.activeUploads.delete(task.id);
        this.processQueue();
      });
      
      xhr.open(task.options.method, task.options.url);
      xhr.timeout = task.options.timeout;
      
      // 设置请求头
      Object.keys(task.options.headers).forEach(key => {
        xhr.setRequestHeader(key, task.options.headers[key]);
      });
      
      xhr.send(formData);
      
    } catch (error) {
      task.status = 'error';
      task.error = error.message;
      this.onError?.(task.id, task.error);
      this.activeUploads.delete(task.id);
      this.processQueue();
    }
  }
  
  /**
   * 取消上传
   * @param {string} taskId - 任务ID
   */
  cancelUpload(taskId) {
    // 从队列中移除
    const queueIndex = this.uploadQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.uploadQueue.splice(queueIndex, 1);
      return true;
    }
    
    // 取消正在进行的上传
    const activeTask = this.activeUploads.get(taskId);
    if (activeTask) {
      activeTask.status = 'cancelled';
      this.activeUploads.delete(taskId);
      return true;
    }
    
    return false;
  }
  
  /**
   * 获取上传状态
   * @param {string} taskId - 任务ID
   * @returns {Object} 上传状态
   */
  getUploadStatus(taskId) {
    // 检查活跃上传
    const activeTask = this.activeUploads.get(taskId);
    if (activeTask) {
      return {
        status: activeTask.status,
        progress: activeTask.progress,
        error: activeTask.error
      };
    }
    
    // 检查队列
    const queuedTask = this.uploadQueue.find(task => task.id === taskId);
    if (queuedTask) {
      return {
        status: 'pending',
        progress: 0,
        error: null
      };
    }
    
    // 检查结果
    const result = this.uploadResults.get(taskId);
    if (result) {
      return {
        status: 'completed',
        progress: 100,
        error: null,
        result
      };
    }
    
    return null;
  }
  
  /**
   * 清除上传结果
   * @param {string} taskId - 任务ID（可选）
   */
  clearResults(taskId) {
    if (taskId) {
      this.uploadResults.delete(taskId);
    } else {
      this.uploadResults.clear();
    }
  }
}

/**
 * 文件下载
 * @param {string} url - 下载URL
 * @param {string} filename - 文件名
 * @param {Object} options - 下载选项
 */
export const downloadFile = (url, filename, options = {}) => {
  const { method = 'GET', headers = {} } = options;
  
  if (method === 'GET' && !headers.Authorization) {
    // 简单的GET下载
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || '';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // 需要认证或POST的下载
    fetch(url, {
      method,
      headers
    })
    .then(response => response.blob())
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    })
    .catch(error => {
      console.error('下载失败:', error);
    });
  }
};

/**
 * 创建文件选择器
 * @param {Object} options - 选择器选项
 * @returns {Promise<File[]>} 选择的文件数组
 */
export const createFileSelector = (options = {}) => {
  return new Promise((resolve) => {
    const {
      accept = '*/*',
      multiple = false,
      directory = false
    } = options;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    
    if (directory) {
      input.webkitdirectory = true;
    }
    
    input.style.display = 'none';
    
    input.addEventListener('change', (event) => {
      const files = Array.from(event.target.files || []);
      document.body.removeChild(input);
      resolve(files);
    });
    
    document.body.appendChild(input);
    input.click();
  });
};

// 导出默认文件上传器实例
export const defaultUploader = new FileUploader();