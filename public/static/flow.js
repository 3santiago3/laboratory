/**
 * @license MIT
 */
 (function(window, document, undefined) {'use strict';
 if (!window || !document) {
   console.warn('Flowjs needs window and document objects to work');
   return;
 }
 // ie10+
 var ie10plus = window.navigator.msPointerEnabled;
 /**
  * Flow.js is a library providing multiple simultaneous, stable and
  * resumable uploads via the HTML5 File API.
  * @param [opts]
  * @param {number|Function} [opts.chunkSize]
  * @param {bool} [opts.forceChunkSize]
  * @param {number} [opts.simultaneousUploads]
  * @param {bool} [opts.singleFile]
  * @param {string} [opts.fileParameterName]
  * @param {number} [opts.progressCallbacksInterval]
  * @param {number} [opts.speedSmoothingFactor]
  * @param {Object|Function} [opts.query]
  * @param {Object|Function} [opts.headers]
  * @param {bool} [opts.withCredentials]
  * @param {Function} [opts.preprocess]
  * @param {string} [opts.method]
  * @param {string|Function} [opts.testMethod]
  * @param {string|Function} [opts.uploadMethod]
  * @param {bool} [opts.prioritizeFirstAndLastChunk]
  * @param {bool} [opts.allowDuplicateUploads]
  * @param {string|Function} [opts.target]
  * @param {number} [opts.maxChunkRetries]
  * @param {number} [opts.chunkRetryInterval]
  * @param {Array.<number>} [opts.permanentErrors]
  * @param {Array.<number>} [opts.successStatuses]
  * @param {Function} [opts.initFileFn]
  * @param {Function} [opts.readFileFn]
  * @param {Function} [opts.generateUniqueIdentifier]
  * @constructor
  */
 function Flow(opts) {
   /**
    * 当前浏览器是否支持 Flow，主要根据一些低版本浏览器不支持的 API，比如 File、Blob、FileList、Blob.prototype.slice
    * Supported by browser?
    * @type {boolean}
    */
   this.support = (
       typeof File !== 'undefined' &&
       typeof Blob !== 'undefined' &&
       typeof FileList !== 'undefined' &&
       (
         !!Blob.prototype.slice || !!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice ||
         false
       ) // slicing files support
   );

   if (!this.support) {
     return ;
   }

   /**
    * 检查是否支持目录上传
    * Check if directory upload is supported
    * @type {boolean}
    */
   this.supportDirectory = (
       /Chrome/.test(window.navigator.userAgent) ||
       /Firefox/.test(window.navigator.userAgent) ||
       /Edge/.test(window.navigator.userAgent)
   );

   /**
    * f.files 存放的是 ff 实例（FlowFile）
    * List of FlowFile objects
    * @type {Array.<FlowFile>}
    */
   this.files = [];

   /**
    * Default options for flow.js
    * @type {Object}
    */
   this.defaults = {
     chunkSize: 1024 * 1024, // 默认 1MB
     forceChunkSize: false, // 比如一个 2.3 MB 的文件。如果值为 false，则会分成 2 份，最后一份是 1.3 MB。如果值是 true，则会分成 3 份，最后一份是 0.3MB
     simultaneousUploads: 5, // 最多并发上传几个 chunk（和 resumable.js 不一样，resumable 是最多上传几个文件不是 chunk）
     singleFile: false,
     fileParameterName: 'file',
     progressCallbacksInterval: 500, // 进度条更新频率
     speedSmoothingFactor: 0.1, // 用于计算平均上传速度。需要配合 progressCallbacksInterval 一起调整
     query: {}, // 额外 query 参数
     headers: {}, // 额外请求头
     withCredentials: false, // 是否发送 cookie
     preprocess: null, // 在 chunk 发送之前，对 chunk 的预处理函数
     changeRawDataBeforeSend: null, // 在 chunk 发送之前，对 chunk 和 data 的处理函数。在使用 google cloud storage 时会有用
     method: 'multipart',
     testMethod: 'GET',
     uploadMethod: 'POST',
     prioritizeFirstAndLastChunk: false, // 只发送文件的前面和后面部分，主要用于让后端检测文件类型
     allowDuplicateUploads: false,
     target: '/',
     testChunks: true, // 在发送 POST 请求之前，会先发送一个 GET 请求检查 chunk 是否已经上传过
     generateUniqueIdentifier: null,
     maxChunkRetries: 0,
     chunkRetryInterval: null,
     permanentErrors: [404, 413, 415, 500, 501],
     successStatuses: [200, 201, 202],
     onDropStopPropagation: false,
     initFileFn: null,
     readFileFn: webAPIFileRead
   };

   /**
    * Current options
    * @type {Object}
    */
   this.opts = {};

   /**
    * List of events:
    *  key stands for event name
    *  value array list of callbacks
    * @type {}
    */
   this.events = {};

   var $ = this;

   /**
    * 调用 webkitReadDataTransfer() 方法或者 addFiles() 方法
    * On drop event
    * @function
    * @param {MouseEvent} event
    */
   this.onDrop = function (event) {
     if ($.opts.onDropStopPropagation) {
       event.stopPropagation();
     }
     event.preventDefault();
     var dataTransfer = event.dataTransfer;
     if (dataTransfer.items && dataTransfer.items[0] &&
       dataTransfer.items[0].webkitGetAsEntry) {
       $.webkitReadDataTransfer(event);
     } else {
       $.addFiles(dataTransfer.files, event);
     }
   };

   /**
    * Prevent default
    * @function
    * @param {MouseEvent} event
    */
   this.preventEvent = function (event) {
     event.preventDefault();
   };


   /**
    * Current options
    * @type {Object}
    */
   this.opts = Flow.extend({}, this.defaults, opts || {});

 }

 Flow.prototype = {
   /**
    * Set a callback for an event, possible events:
    * fileSuccess(file), fileProgress(file), fileAdded(file, event),
    * fileRemoved(file), fileRetry(file), fileError(file, message),
    * complete(), progress(), error(message, file), pause()
    * @function
    * @param {string} event
    * @param {Function} callback
    */
   on: function (event, callback) {
     event = event.toLowerCase();
     if (!this.events.hasOwnProperty(event)) {
       this.events[event] = [];
     }
     this.events[event].push(callback);
   },

   /**
    * Remove event callback
    * @function
    * @param {string} [event] removes all events if not specified
    * @param {Function} [fn] removes all callbacks of event if not specified
    */
   off: function (event, fn) {
     if (event !== undefined) {
       event = event.toLowerCase();
       if (fn !== undefined) {
         if (this.events.hasOwnProperty(event)) {
           arrayRemove(this.events[event], fn);
         }
       } else {
         delete this.events[event];
       }
     } else {
       this.events = {};
     }
   },

   /**
    * Fire an event
    * @function
    * @param {string} event event name
    * @param {...} args arguments of a callback
    * @return {bool} value is false if at least one of the event handlers which handled this event
    * returned false. Otherwise it returns true.
    */
   fire: function (event, args) {
     // `arguments` is an object, not array, in FF, so:
     args = Array.prototype.slice.call(arguments);
     event = event.toLowerCase();
     var preventDefault = false;
     if (this.events.hasOwnProperty(event)) {
       each(this.events[event], function (callback) {
         preventDefault = callback.apply(this, args.slice(1)) === false || preventDefault;
       }, this);
     }
     if (event != 'catchall') {
       args.unshift('catchAll');
       preventDefault = this.fire.apply(this, args) === false || preventDefault;
     }
     return !preventDefault;
   },

   /**
    * 读取 webkit dataTransfer 对象
    * Read webkit dataTransfer object
    * @param event
    */
   webkitReadDataTransfer: function (event) {
     var $ = this;
     var queue = event.dataTransfer.items.length;
     var files = [];
     each(event.dataTransfer.items, function (item) {
       var entry = item.webkitGetAsEntry();
       if (!entry) {
         decrement();
         return ;
       }
       if (entry.isFile) {
         // due to a bug in Chrome's File System API impl - #149735
         fileReadSuccess(item.getAsFile(), entry.fullPath);
       } else {
         // entry.createReader() 返回一个可以读取目录里的条目的对象
         readDirectory(entry.createReader());
       }
     });

     // 递归遍历目录，将里面的 file 推进 files
     function readDirectory(reader) {
       // readEntries() 读取目录中的条目
       reader.readEntries(function (entries) {
         if (entries.length) {
           // 读取了新的目录，要更新 file 文件数量
           queue += entries.length;
           each(entries, function(entry) {
             if (entry.isFile) {
               var fullPath = entry.fullPath;
               entry.file(function (file) {
                 fileReadSuccess(file, fullPath);
               }, readError);
             } else if (entry.isDirectory) {
               readDirectory(entry.createReader());
             }
           });
           readDirectory(reader);
         } else {
           decrement();
         }
       }, readError);
     }

     // 将原生 file 推进到 files
     function fileReadSuccess(file, fullPath) {
       // relative path should not start with "/"
       file.relativePath = fullPath.substring(1);
       files.push(file);
       decrement();
     }

     function readError(fileError) {
       decrement();
       throw fileError;
     }

     // 不管是读取了一个文件成功、读取一个目录完毕、还是读取一个文件失败，都要将 queue 减 1
     // 直到 queue 为 0 时，意味着都处理完毕了，则将读取成功的 file 文件作为参数调用 f.addFiles()
     function decrement() {
       if (--queue == 0) {
         $.addFiles(files, event);
       }
     }
   },

   /**
    * 为文件生成唯一标识
    * Generate unique identifier for a file
    * @function
    * @param {FlowFile} file
    * @returns {string}
    */
   generateUniqueIdentifier: function (file) {
     var custom = this.opts.generateUniqueIdentifier;
     if (typeof custom === 'function') {
       return custom(file);
     }
     // Some confusion in different versions of Firefox
     var relativePath = file.relativePath || file.webkitRelativePath || file.fileName || file.name;
     return file.size + '-' + relativePath.replace(/[^0-9a-zA-Z_-]/img, '');
   },

   /**
    * Upload next chunk from the queue
    * @function
    * @returns {boolean}
    * @private
    */
   uploadNextChunk: function (preventEvents) {
     // In some cases (such as videos) it's really handy to upload the first
     // and last chunk of a file quickly; this let's the server check the file's
     // metadata and determine if there's even a point in continuing.
     var found = false;
     if (this.opts.prioritizeFirstAndLastChunk) {
       each(this.files, function (file) {
         if (!file.paused && file.chunks.length &&
           file.chunks[0].status() === 'pending') {
           file.chunks[0].send();
           found = true;
           return false;
         }
         if (!file.paused && file.chunks.length > 1 &&
           file.chunks[file.chunks.length - 1].status() === 'pending') {
           file.chunks[file.chunks.length - 1].send();
           found = true;
           return false;
         }
       });
       if (found) {
         return found;
       }
     }

     // Now, simply look for the next, best thing to upload
     each(this.files, function (file) {
       // 被暂停上传的并且没有被 resume() 的文件就不要开始了
       if (!file.paused) {
         each(file.chunks, function (chunk) {
           if (chunk.status() === 'pending') {
             chunk.send();
             found = true;
             return false;
           }
         });
       }
       if (found) {
         return false;
       }
     });
     if (found) {
       return true;
     }

     // 能执行到这行，代表在队列中没有找到“可以上传的 chunk”，那就要检查一下是不是都“搞定”了
     // The are no more outstanding chunks to upload, check is everything is done
     var outstanding = false;
     each(this.files, function (file) {
       if (!file.isComplete()) {
         outstanding = true;
         return false;
       }
     });

     // preventEvents? TODO...
     if (!outstanding && !preventEvents) {
       // All chunks have been uploaded, complete
       async(function () {
         this.fire('complete');
       }, this);
     }
     return false;
   },


   /**
    * Assign a browse action to one or more DOM nodes.
    * @function
    * @param {Element|Array.<Element>} domNodes
    * @param {boolean} isDirectory Pass in true to allow directories to
    * @param {boolean} singleFile prevent multi file upload
    * @param {Object} attributes set custom attributes:
    *  http://www.w3.org/TR/html-markup/input.file.html#input.file-attributes
    *  eg: accept: 'image/*'
    * be selected (Chrome only).
    */
   assignBrowse: function (domNodes, isDirectory, singleFile, attributes) {
     if (domNodes instanceof Element) {
       domNodes = [domNodes];
     }

     each(domNodes, function (domNode) {
       var input;
       if (domNode.tagName === 'INPUT' && domNode.type === 'file') {
         input = domNode;
       } else {
         input = document.createElement('input');
         input.setAttribute('type', 'file');
         // display:none - not working in opera 12
         extend(input.style, {
           visibility: 'hidden',
           position: 'absolute',
           width: '1px',
           height: '1px'
         });
         // for opera 12 browser, input must be assigned to a document
         domNode.appendChild(input);
         // https://developer.mozilla.org/en/using_files_from_web_applications)
         // event listener is executed two times
         // first one - original mouse click event
         // second - input.click(), input is inside domNode
         domNode.addEventListener('click', function() {
           input.click();
         }, false);
       }

       if (!this.opts.singleFile && !singleFile) {
         input.setAttribute('multiple', 'multiple');
       }

       if (isDirectory) {
         input.setAttribute('webkitdirectory', 'webkitdirectory');
       }

       each(attributes, function (value, key) {
         input.setAttribute(key, value);
       });

       // When new files are added, simply append them to the overall list
       var $ = this;
       input.addEventListener('change', function (e) {
          if (e.target.value) {
           $.addFiles(e.target.files, e);
           e.target.value = '';
          }
       }, false);
     }, this);
   },

   /**
    * Assign one or more DOM nodes as a drop target.
    * @function
    * @param {Element|Array.<Element>} domNodes
    */
   assignDrop: function (domNodes) {
     if (typeof domNodes.length === 'undefined') {
       domNodes = [domNodes];
     }
     each(domNodes, function (domNode) {
       domNode.addEventListener('dragover', this.preventEvent, false);
       domNode.addEventListener('dragenter', this.preventEvent, false);
       domNode.addEventListener('drop', this.onDrop, false);
     }, this);
   },

   /**
    * Un-assign drop event from DOM nodes
    * @function
    * @param domNodes
    */
   unAssignDrop: function (domNodes) {
     if (typeof domNodes.length === 'undefined') {
       domNodes = [domNodes];
     }
     each(domNodes, function (domNode) {
       domNode.removeEventListener('dragover', this.preventEvent);
       domNode.removeEventListener('dragenter', this.preventEvent);
       domNode.removeEventListener('drop', this.onDrop);
     }, this);
   },

   /**
    * 返回当前 Flow 实例中有没有文件在上传中
    * Returns a boolean indicating whether or not the instance is currently
    * uploading anything.
    * @function
    * @returns {boolean}
    */
   isUploading: function () {
     var uploading = false;
     each(this.files, function (file) {
       if (file.isUploading()) {
         uploading = true;
         return false;
       }
     });
     return uploading;
   },

   /**
    * 判断是否应该上传下一个 chunk
    * 依据是当前正在上传的 chunk 有几个，是否超过了 simultaneousUploads
    * should upload next chunk
    * @function
    * @returns {boolean|number}
    */
   _shouldUploadNext: function () {
     var num = 0; // 正在上传的 chunk 数量
     var should = true;
     var simultaneousUploads = this.opts.simultaneousUploads;
     each(this.files, function (file) {
       each(file.chunks, function(chunk) {
         if (chunk.status() === 'uploading') {
           num++;
           if (num >= simultaneousUploads) {
             should = false;
             return false;
           }
         }
       });
     });
     // if should is true then return uploading chunks's length
     return should && num;
   },

   /**
    * 开始上传、恢复上传
    * Start or resume uploading.
    * @function
    */
   upload: function () {
     // Make sure we don't start too many uploads at once
     var ret = this._shouldUploadNext();
     if (ret === false) {
       return;
     }
     // Kick off the queue
     this.fire('uploadStart');
     var started = false;
     var num = 1; // 用来记录新上传的个数
     // 比如 ret 值是 3，意味着有 3 个 chunk 正在上传
     // 当 simultaneousUploads 为 5 时
     // 即还可以上传 5 - 3 = 2 个
     for (; num <= this.opts.simultaneousUploads - ret; num++) {
       started = this.uploadNextChunk(true) || started;
     }

     //
     if (!started) {
       async(function () {
         this.fire('complete');
       }, this);
     }
   },

   /**
    * 遍历每一个 ff 实例，都调用 ff.resume() 恢复上传
    * Resume uploading.
    * @function
    */
   resume: function () {
     each(this.files, function (file) {
       if (!file.isComplete()) {
         file.resume();
       }
     });
   },

   /**
    * 遍历每一个 ff 实例，都调用 ff.pause() 恢复上传
    * Pause uploading.
    * @function
    */
   pause: function () {
     each(this.files, function (file) {
       file.pause();
     });
   },

   /**
    * 清空 f.files 数组
    * Cancel upload of all FlowFile objects and remove them from the list.
    * @function
    */
   cancel: function () {
     for (var i = this.files.length - 1; i >= 0; i--) {
       this.files[i].cancel();
     }
   },

   /**
    * 返回一个 0 至 1 之间的数字，表示当前所有文件的总共上传进度
    * Returns a number between 0 and 1 indicating the current upload progress
    * of all files.
    * @function
    * @returns {number}
    */
   progress: function () {
     var totalDone = 0;
     var totalSize = 0;
     // Resume all chunks currently being uploaded
     each(this.files, function (file) {
       totalDone += file.progress() * file.size;
       totalSize += file.size;
     });
     return totalSize > 0 ? totalDone / totalSize : 0;
   },

   /**
    * Add a HTML5 File object to the list of files.
    * @function
    * @param {File} file
    * @param {Event} [event] event is optional
    */
   addFile: function (file, event) {
     this.addFiles([file], event);
   },

   /**
    * 不管是 input[type="file"] 还是 drop 拖拽
    * 不管是文件还是目录，最终都是还要调用这个方法
    * 这个方法做的事情就是往 f.files 数组推进去 FlowFile 实例
    * Add a HTML5 File object to the list of files.
    * @function
    * @param {FileList|Array} fileList
    * @param {Event} [event] event is optional
    */
   addFiles: function (fileList, event) {
     var files = [];
     each(fileList, function (file) {
       // https://github.com/flowjs/flow.js/issues/55
       // issue: Uploading empty file IE10/IE11 hangs indefinitely
       if ((!ie10plus || ie10plus && file.size > 0) && !(file.size % 4096 === 0 && (file.name === '.' || file.fileName === '.'))) {
         var uniqueIdentifier = this.generateUniqueIdentifier(file);
         if (this.opts.allowDuplicateUploads || !this.getFromUniqueIdentifier(uniqueIdentifier)) {
           var f = new FlowFile(this, file, uniqueIdentifier);
           if (this.fire('fileAdded', f, event)) {
             files.push(f);
           }
         }
       }
     }, this);

     if (this.fire('filesAdded', files, event)) {
       each(files, function (file) {
         if (this.opts.singleFile && this.files.length > 0) {
           this.removeFile(this.files[0]);
         }
         this.files.push(file);
       }, this);
       this.fire('filesSubmitted', files, event);
     }
   },


   /**
    * Cancel upload of a specific FlowFile object from the list.
    * @function
    * @param {FlowFile} file
    */
   removeFile: function (file) {
     for (var i = this.files.length - 1; i >= 0; i--) {
       if (this.files[i] === file) {
         this.files.splice(i, 1);
         file.abort();
         this.fire('fileRemoved', file);
       }
     }
   },

   /**
    * Look up a FlowFile object by its unique identifier.
    * @function
    * @param {string} uniqueIdentifier
    * @returns {boolean|FlowFile} false if file was not found
    */
   getFromUniqueIdentifier: function (uniqueIdentifier) {
     var ret = false;
     each(this.files, function (file) {
       if (file.uniqueIdentifier === uniqueIdentifier) {
         ret = file;
       }
     });
     return ret;
   },

   /**
    * 计算所有文件的总大小
    * Returns the total size of all files in bytes.
    * @function
    * @returns {number}
    */
   getSize: function () {
     var totalSize = 0;
     each(this.files, function (file) {
       totalSize += file.size;
     });
     return totalSize;
   },

   /**
    * 计算总共上传的总大小（多少字节）
    * Returns the total size uploaded of all files in bytes.
    * @function
    * @returns {number}
    */
   sizeUploaded: function () {
     var size = 0;
     each(this.files, function (file) {
       size += file.sizeUploaded();
     });
     return size;
   },

   /**
    * 计算上传完所有文件还剩多少时间
    * Returns remaining time to upload all files in seconds. Accuracy is based on average speed.
    * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
    * @function
    * @returns {number}
    */
   timeRemaining: function () {
     var sizeDelta = 0; // 所有文件加起来还有多少字节没有上传
     var averageSpeed = 0; // 所有文件的个体平均速度加起来
     each(this.files, function (file) {
       if (!file.paused && !file.error) {
         sizeDelta += file.size - file.sizeUploaded();
         averageSpeed += file.averageSpeed;
       }
     });

     // 还有未上传的值但没有平均上传速率，剩余无限大时间
     if (sizeDelta && !averageSpeed) {
       return Number.POSITIVE_INFINITY;
     }

     // 所有文件都上传完了并且没有平均上传速率，也就剩余 0 时间了
     if (!sizeDelta && !averageSpeed) {
       return 0;
     }

     // 除法求值
     return Math.floor(sizeDelta / averageSpeed);
   }
 };






 /**
  * FlowFile class
  * @name FlowFile
  * @param {Flow} flowObj
  * @param {File} file
  * @param {string} uniqueIdentifier
  * @constructor
  */
 function FlowFile(flowObj, file, uniqueIdentifier) {

   /**
    * Flow 实例
    * Reference to parent Flow instance
    * @type {Flow}
    */
   this.flowObj = flowObj;

   /**
    * 原生文件 File 对象
    * Reference to file
    * @type {File}
    */
   this.file = file;

   /**
    * File name. Some confusion in different versions of Firefox
    * @type {string}
    */
   this.name = file.fileName || file.name;

   /**
    * File size
    * @type {number}
    */
   this.size = file.size;

   /**
    * Relative file path
    * @type {string}
    */
   this.relativePath = file.relativePath || file.webkitRelativePath || this.name;

   /**
    * File unique identifier
    * @type {string}
    */
   this.uniqueIdentifier = (uniqueIdentifier === undefined ? flowObj.generateUniqueIdentifier(file) : uniqueIdentifier);

   /**
    * Size of Each Chunk
    * @type {number}
    */
   this.chunkSize = 0;

   /**
    * 这个数组存放 FlowChunk 实例
    * List of chunks
    * @type {Array.<FlowChunk>}
    */
   this.chunks = [];

   /**
    * Indicated if file is paused
    * @type {boolean}
    */
   this.paused = false;

   /**
    * Indicated if file has encountered an error
    * @type {boolean}
    */
   this.error = false;

   /**
    * Average upload speed
    * @type {number}
    */
   this.averageSpeed = 0;

   /**
    * Current upload speed
    * @type {number}
    */
   this.currentSpeed = 0;

   /**
    * 上次进入 progress 事件的时间戳
    * 可以用来计算上传速率
    * Date then progress was called last time
    * @type {number}
    * @private
    */
   this._lastProgressCallback = Date.now();

   /**
    * 可以用来计算上传速率
    * Previously uploaded file size
    * @type {number}
    * @private
    */
   this._prevUploadedSize = 0;

   /**
    * 在这个文件暂停上传之后，又恢复上传时，可以马上显示上传进度
    * Holds previous progress
    * @type {number}
    * @private
    */
   this._prevProgress = 0;

   this.bootstrap();
 }

 FlowFile.prototype = {
   /**
    * 在 xhr 的 progress 时间和 success 时间会调用
    * Update speed parameters
    * @link http://stackoverflow.com/questions/2779600/how-to-estimate-download-time-remaining-accurately
    * @function
    */
   measureSpeed: function () {
     // 两次进入 xhr 的 progress 事件的时间差
     var timeSpan = Date.now() - this._lastProgressCallback;
     if (!timeSpan) {
       return ;
     }
     var smoothingFactor = this.flowObj.opts.speedSmoothingFactor; // 默认 0.1
     var uploaded = this.sizeUploaded(); // 当前文件上传了多少（字节）
     // Prevent negative upload speed after file upload resume
     this.currentSpeed = Math.max((uploaded - this._prevUploadedSize) / timeSpan * 1000, 0);
     // currentSpeed 是当前速度
     // averageSpeed 是配合 smoothingFactor 来计算的
     this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed;
     this._prevUploadedSize = uploaded;
   },

   /**
    * For internal usage only.
    * Callback when something happens within the chunk.
    * @function
    * @param {FlowChunk} chunk
    * @param {string} event can be 'progress', 'success', 'error' or 'retry'
    * @param {string} [message]
    */
   chunkEvent: function (chunk, event, message) {
     switch (event) {
       case 'progress':
         if (Date.now() - this._lastProgressCallback <
           this.flowObj.opts.progressCallbacksInterval) {
           break;
         }
         this.measureSpeed();
         this.flowObj.fire('fileProgress', this, chunk);
         this.flowObj.fire('progress');
         this._lastProgressCallback = Date.now();
         break;
       case 'error':
         this.error = true;
         this.abort(true);
         this.flowObj.fire('fileError', this, message, chunk);
         this.flowObj.fire('error', message, this, chunk);
         break;
       case 'success':
         if (this.error) {
           return;
         }
         this.measureSpeed();
         this.flowObj.fire('fileProgress', this, chunk);
         this.flowObj.fire('progress');
         this._lastProgressCallback = Date.now();
         if (this.isComplete()) {
           this.currentSpeed = 0;
          //  this.averageSpeed = 0; // 上传成功后将速率变为 0，但是有时候用户还是想要看到最后的上传速率
           this.flowObj.fire('fileSuccess', this, message, chunk);
         }
         break;
       case 'retry':
         this.flowObj.fire('fileRetry', this, chunk);
         break;
     }
   },

   /**
    * Pause file upload
    * @function
    */
   pause: function() {
     this.paused = true;
     this.abort();
   },

   /**
    * Resume file upload
    * @function
    */
   resume: function() {
     this.paused = false;
     this.flowObj.upload();
   },

   /**
    * 暂停当前文件的 chunk 上传
    * 并调用 uploadNextChunk 看看有没有可以上传的文件
    * Abort current upload
    * @function
    */
   abort: function (reset) {
     this.currentSpeed = 0;
     this.averageSpeed = 0;
     var chunks = this.chunks;
     if (reset) {
       this.chunks = [];
     }
     each(chunks, function (c) {
       if (c.status() === 'uploading') {
         c.abort();
         this.flowObj.uploadNextChunk();
       }
     }, this);
   },

   /**
    * Cancel current upload and remove from a list
    * @function
    */
   cancel: function () {
     this.flowObj.removeFile(this);
   },

   /**
    * Retry aborted file upload
    * @function
    */
   retry: function () {
     this.bootstrap();
     this.flowObj.upload();
   },

   /**
    * 调用 _bootstrap()
    * Clear current chunks and slice file again
    * @function
    */
   bootstrap: function () {
     if (typeof this.flowObj.opts.initFileFn === "function") {
       var ret = this.flowObj.opts.initFileFn(this);
       if (ret && 'then' in ret) {
         ret.then(this._bootstrap.bind(this));
         return;
       }
     }
     this._bootstrap();
   },

   // 主要做的事情是清空 chunks
   // 然后对 file 重新切片，再实例化 FlowChunk，最后推进去 chunks
   _bootstrap: function () {
     // true 代表的是 reset，清空 this.chunks = []
     this.abort(true);
     this.error = false;
     // Rebuild stack of chunks from file
     this._prevProgress = 0;
     var round = this.flowObj.opts.forceChunkSize ? Math.ceil : Math.floor;
     this.chunkSize = evalOpts(this.flowObj.opts.chunkSize, this);

     // chunk 块的数量
     var chunks = Math.max(
       round(this.size / this.chunkSize), 1
     );
     for (var offset = 0; offset < chunks; offset++) {
       // 使用 offset 代表第几块 chunk 来实例化 FlowChunk
       this.chunks.push(
         new FlowChunk(this.flowObj, this, offset)
       );
     }
   },

   /**
    * 返回当前文件的 0 至 1 的上传进度
    * Get current upload progress status
    * @function
    * @returns {number} from 0 to 1
    */
   progress: function () {
    // 原本是：如果是 error 会直接返回 1
     if (this.error) {
          return this._prevProgress // 自己加的
          // return 1;
     }
     if (this.chunks.length === 1) {
       this._prevProgress = Math.max(this._prevProgress, this.chunks[0].progress());
       return this._prevProgress;
     }
     // Sum up progress across everything
     var bytesLoaded = 0;
     each(this.chunks, function (c) {
       // get chunk progress relative to entire file
       bytesLoaded += c.progress() * (c.endByte - c.startByte);
     });
     var percent = bytesLoaded / this.size;
     // We don't want to lose percentages when an upload is paused
     this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent);
     return this._prevProgress;
   },

   /**
    * 但凡有一个 chunk 的 status 为 uploading，这个文件都算是正在上传中
    * Indicates if file is being uploaded at the moment
    * @function
    * @returns {boolean}
    */
   isUploading: function () {
     var uploading = false;
     each(this.chunks, function (chunk) {
       if (chunk.status() === 'uploading') {
         uploading = true;
         return false;
       }
     });
     return uploading;
   },


   /**
    * 表示当前文件是否已经完全上传完毕（所有 chunk 都上传了）
    * Indicates if file is has finished uploading and received a response
    * @function
    * @returns {boolean}
    */
   isComplete: function () {
     var outstanding = false;
     each(this.chunks, function (chunk) {
       var status = chunk.status();
       if (status === 'pending' || status === 'uploading' || status === 'reading' || chunk.preprocessState === 1 || chunk.readState === 1) {
         outstanding = true;
         return false;
       }
     });
     return !outstanding;
   },

   /**
    * 当前文件总共上传了多少字节
    * Count total size uploaded
    * @function
    * @returns {number}
    */
   sizeUploaded: function () {
     var size = 0;
     each(this.chunks, function (chunk) {
       size += chunk.sizeUploaded();
     });
     return size;
   },

   /**
    * 当前文件还剩多少时间上传完（单位：秒）
    * Returns remaining time to finish upload file in seconds. Accuracy is based on average speed.
    * If speed is zero, time remaining will be equal to positive infinity `Number.POSITIVE_INFINITY`
    * @function
    * @returns {number}
    */
   timeRemaining: function () {
     if (this.paused || this.error) {
       return 0;
     }
     var delta = this.size - this.sizeUploaded(); // 当前文件还剩多少未上传
     if (delta && !this.averageSpeed) {
       return Number.POSITIVE_INFINITY;
     }
     if (!delta && !this.averageSpeed) {
       return 0;
     }

     // 除法计算值
     return Math.floor(delta / this.averageSpeed);
   },

   /**
    * 根据文件名称获取文件类型（不精确）
    * Get file type
    * @function
    * @returns {string}
    */
   getType: function () {
     return this.file.type && this.file.type.split('/')[1];
   },

   /**
    * 根据文件名称获取文件拓展名
    * Get file extension
    * @function
    * @returns {string}
    */
   getExtension: function () {
     return this.name.substr((~-this.name.lastIndexOf(".") >>> 0) + 2).toLowerCase();
   }
 };

 /**
  * 在 fc.send() 会调用
  * Default read function using the webAPI
  * @function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk)
  *
  */
 function webAPIFileRead(fileObj, startByte, endByte, fileType, chunk) {
   var function_name = 'slice';

   if (fileObj.file.slice)
     function_name =  'slice';
   else if (fileObj.file.mozSlice)
     function_name = 'mozSlice';
   else if (fileObj.file.webkitSlice)
     function_name = 'webkitSlice';

   const bytes = fileObj.file[function_name](startByte, endByte, fileType);
   // 传入是一个 Blob 对象（文件 File 片段），readFinished 意味着 chunk 读取完毕
   chunk.readFinished(bytes);
 }


 /**
  * Class for storing a single chunk
  * @name FlowChunk
  * @param {Flow} flowObj
  * @param {FlowFile} fileObj
  * @param {number} offset
  * @constructor
  */
 function FlowChunk(flowObj, fileObj, offset) {

   /**
    * Reference to parent flow object
    * @type {Flow}
    */
   this.flowObj = flowObj;

   /**
    * Reference to parent FlowFile object
    * @type {FlowFile}
    */
   this.fileObj = fileObj;

   /**
    * offset 代表的是这个 chunk 是文件的第几块 chunk，从 0 开始算
    * File offset
    * @type {number}
    */
   this.offset = offset;

   /**
    * Indicates if chunk existence was checked on the server
    * @type {boolean}
    */
   this.tested = false;

   /**
    * Number of retries performed
    * @type {number}
    */
   this.retries = 0;

   /**
    * Pending retry
    * @type {boolean}
    */
   this.pendingRetry = false;

   /**
    * Preprocess state
    * @type {number} 0 = unprocessed, 1 = processing, 2 = finished
    */
   this.preprocessState = 0;

   /**
    * Read state
    * @type {number} 0 = not read, 1 = reading, 2 = finished
    */
   this.readState = 0;

   /**
    * Blob 对象，使用 Blob.slice() 返回的值
    * Used to store the bytes read
    * @type {Blob|string}
    */
   this.bytes = undefined;

   /**
    * Bytes transferred from total request size
    * @type {number}
    */
   this.loaded = 0;

   /**
    * Total request size
    * @type {number}
    */
   this.total = 0;

   /**
    * Size of a chunk
    * @type {number}
    */
   this.chunkSize = this.fileObj.chunkSize;

   /**
    * Chunk start byte in a file
    * @type {number}
    */
   this.startByte = this.offset * this.chunkSize;

   /**
    * A specific filename for this chunk which otherwise default to the main name
    * @type {string}
    */
   this.filename = null;

   /**
     * Compute the endbyte in a file
     */
   this.computeEndByte = function() {
     var endByte = Math.min(this.fileObj.size, (this.offset + 1) * this.chunkSize);
     if (this.fileObj.size - endByte < this.chunkSize && !this.flowObj.opts.forceChunkSize) {
       // The last chunk will be bigger than the chunk size,
       // but less than 2 * this.chunkSize
       endByte = this.fileObj.size;
     }
     return endByte;
   }

   /**
    * Chunk end byte in a file
    * @type {number}
    */
   this.endByte = this.computeEndByte();

   /**
    * XMLHttpRequest
    * @type {XMLHttpRequest}
    */
   this.xhr = null;

   var $ = this;

   /**
    * Send chunk event
    * 本质上调用的是 ff.chunkEvent()
    * @param event
    * @param {...} args arguments of a callback
    */
   this.event = function (event, args) {
     args = Array.prototype.slice.call(arguments);
     args.unshift($); // 将 $ 添加到 args 数组开头
     $.fileObj.chunkEvent.apply($.fileObj, args);
   };
   /**
    * xhr 的 progress 事件的回调函数
    * 会调用 fc.event() => 也就是 ff.chunkEvent()
    * Catch progress event
    * @param {ProgressEvent} event
    */
   this.progressHandler = function(event) {
     if (event.lengthComputable) {
       $.loaded = event.loaded ;
       $.total = event.total;
     }
     $.event('progress', event);
   };

   /**
    * test() 用来检测 chunk 是否之前上传过
    * 这是 xhr 发送之后的回调函数
    * Catch test event
    * @param {Event} event
    */
   this.testHandler = function(event) {
     var status = $.status(true);
     if (status === 'error') {
       $.event(status, $.message());
       $.flowObj.uploadNextChunk();
     } else if (status === 'success') {
       $.tested = true;
       $.event(status, $.message());
       $.flowObj.uploadNextChunk();
     } else if (!$.fileObj.paused) {
       // Error might be caused by file pause method
       // Chunks does not exist on the server side 服务器没有这个 chunk
       $.tested = true; // 已经检查过了，但是服务器没有这个 chunk
       $.send();
     }
   };

   /**
    * Upload has stopped
    * xhr 发送之后的回调函数
    * @param {Event} event
    */
   this.doneHandler = function(event) {
     var status = $.status();
     if (status === 'success' || status === 'error') {
       // TODO...
       delete this.data;
       $.event(status, $.message());
       $.flowObj.uploadNextChunk();
     } else if (!$.fileObj.paused) {
       $.event('retry', $.message());
       $.pendingRetry = true;
       $.abort();
       $.retries++;
       var retryInterval = $.flowObj.opts.chunkRetryInterval;
       if (retryInterval !== null) {
         setTimeout(function () {
           $.send();
         }, retryInterval);
       } else {
         $.send();
       }
     }
   };
 }

 FlowChunk.prototype = {
   /**
    * 获取请求参数
    * Get params for a request
    * @function
    */
   getParams: function () {
     return {
       flowChunkNumber: this.offset + 1,
       flowChunkSize: this.chunkSize,
       flowCurrentChunkSize: this.endByte - this.startByte,
       flowTotalSize: this.fileObj.size,
       flowIdentifier: this.fileObj.uniqueIdentifier,
       flowFilename: this.fileObj.name,
       flowRelativePath: this.fileObj.relativePath,
       flowTotalChunks: this.fileObj.chunks.length
     };
   },

   /**
    * 拼接 target 和 params 的到请求接口
    * Get target option with query params
    * @function
    * @param params
    * @returns {string}
    */
   getTarget: function(target, params){
     if (params.length == 0) {
       return target;
     }

     if(target.indexOf('?') < 0) {
       target += '?';
     } else {
       target += '&';
     }
     return target + params.join('&');
   },

   /**
    * 检查 chunk 是否在之前上传过
    * Makes a GET request without any data to see if the chunk has already
    * been uploaded in a previous session
    * @function
    */
   test: function () {
     // Set up request and listen for event
     this.xhr = new XMLHttpRequest();
     this.xhr.addEventListener("load", this.testHandler, false);
     this.xhr.addEventListener("error", this.testHandler, false);
     var testMethod = evalOpts(this.flowObj.opts.testMethod, this.fileObj, this);
     var data = this.prepareXhrRequest(testMethod, true);
     this.xhr.send(data);
   },

   /**
    * 会在 preprocess 自定义函数里被手动调用
    * Finish preprocess state
    * @function
    */
   preprocessFinished: function () {
     // Re-compute the endByte after the preprocess function to allow an
     // implementer of preprocess to set the fileObj size
     this.endByte = this.computeEndByte();

     this.preprocessState = 2; // 把对 chunk 的处理状态变为 2，即 finished
     this.send();
   },

   /**
    * Finish read state
    * @function
    */
   readFinished: function (bytes) {
     this.readState = 2; // 把对 chunk 的读取状态变为 2，即 finished
     this.bytes = bytes;
     this.send();
   },


   /**
    * 使用 POST 请求上传数据
    * Uploads the actual data in a POST call
    * @function
    */
   send: function () {
     var preprocess = this.flowObj.opts.preprocess;
     var read = this.flowObj.opts.readFileFn;
     if (typeof preprocess === 'function') {
       switch (this.preprocessState) {
         case 0:
           // 当前 chunk 处于未处理状态，则处理 chunk，同时将 chunk 的处理状态改成处理中
           this.preprocessState = 1;
           preprocess(this);
           return;
         case 1:
           return;
       }
     }
     switch (this.readState) {
       case 0:
         // 当前 chunk 处于未读取状态，则读取 chunk，同时将 chunk 的读取状态改成处理中
         this.readState = 1;
         read(this.fileObj, this.startByte, this.endByte, this.fileObj.file.type, this);
         return;
       case 1:
         return;
     }

     if (this.flowObj.opts.testChunks && !this.tested) {
       // 检查 chunk 是否上传过
       this.test();
       return;
     }

     this.loaded = 0; // 该 chunk 已上传 bytes
     this.total = 0; // 该 chunk 总大小
     this.pendingRetry = false;

     // Set up request and listen for event
     this.xhr = new XMLHttpRequest();
     this.xhr.upload.addEventListener('progress', this.progressHandler, false);
     this.xhr.addEventListener("load", this.doneHandler, false);
     this.xhr.addEventListener("error", this.doneHandler, false);

     var uploadMethod = evalOpts(this.flowObj.opts.uploadMethod, this.fileObj, this);
     var data = this.prepareXhrRequest(uploadMethod, false, this.flowObj.opts.method, this.bytes);
     var changeRawDataBeforeSend = this.flowObj.opts.changeRawDataBeforeSend;
     if (typeof changeRawDataBeforeSend === 'function') {
       data = changeRawDataBeforeSend(this, data);
     }

     // 正式使用 xhr 发送请求
     this.xhr.send(data);
   },

   /**
    * 使用 xhr.abort() 方法中止当前 chunk 上传
    * Abort current xhr request
    * @function
    */
   abort: function () {
     // Abort and reset
     var xhr = this.xhr;
     this.xhr = null;
     if (xhr) {
       xhr.abort();
     }
   },

   /**
    * 检索当前 chunk 的上传状态
    * Retrieve current chunk upload status
    * @function
    * @returns {string} 'pending', 'uploading', 'success', 'error'（等待中，上传中，上传成功，上传失败）
    */
   status: function (isTest) {
     if (this.readState === 1) {
       return 'reading'; // 还在从 file 中分割 chunk 的过程中（chunk 读取中）
     } else if (this.pendingRetry || this.preprocessState === 1) {
       // if pending retry then that's effectively the same as actively uploading,
       // there might just be a slight delay before the retry starts
       return 'uploading';
     } else if (!this.xhr) {
       return 'pending'; // 连 this.xhr 都还没有，就是等待中
     } else if (this.xhr.readyState < 4) {
       // Status is really 'OPENED', 'HEADERS_RECEIVED'
       // or 'LOADING' - meaning that stuff is happening
       return 'uploading'; // 上传中
     } else {
       // 下面是请求已返回
       if (this.flowObj.opts.successStatuses.indexOf(this.xhr.status) > -1) {
         // HTTP 200, perfect
         // HTTP 202 Accepted - The request has been accepted for processing, but the processing has not been completed.
         return 'success';
       } else if (
           this.flowObj.opts.permanentErrors.indexOf(this.xhr.status) > -1 // xhr.status 的值是 [404, 413, 415, 500, 501, ...]
           || !isTest
           && this.retries >= this.flowObj.opts.maxChunkRetries // 超过最大 retry 尝试次数
         ) {
         // HTTP 413/415/500/501, permanent error
         return 'error';
       } else {
         // this should never happen, but we'll reset and queue a retry
         // a likely case for this would be 503 service unavailable
         this.abort();
         return 'pending';
       }
     }
   },

   /**
    * Get response from xhr request
    * @function
    * @returns {String}
    */
   message: function () {
     return this.xhr ? this.xhr.responseText : '';
   },

   /**
    * 通过 chunk 的 loaded 与 total 计算上传进度
    * Get upload progress
    * @function
    * @returns {number}
    */
   progress: function () {
     if (this.pendingRetry) {
       return 0;
     }
     var s = this.status();
     if (s === 'success' || s === 'error') {
       return 1;
     } else if (s === 'pending') {
       return 0;
     } else {
       return this.total > 0 ? this.loaded / this.total : 0;
     }
   },

   /**
    * 计算当前 chunk 已经上传了多少 bytes
    * Count total size uploaded
    * @function
    * @returns {number}
    */
   sizeUploaded: function () {
     var size = this.endByte - this.startByte;
     // can't return only chunk.loaded value, because it is bigger than chunk size
     if (this.status() !== 'success') {
       size = this.progress() * size;
     }
     return size;
   },

   /**
    * 设置 xhr 的 query、data 和 请求头，最后返回 data
    * Prepare Xhr request. Set query, headers and data
    * @param {string} method GET or POST
    * @param {bool} isTest is this a test request
    * @param {string} [paramsMethod] octet or form
    * @param {Blob} [blob] to send
    * @returns {FormData|Blob|Null} data to send
    */
   prepareXhrRequest: function(method, isTest, paramsMethod, blob) {
     // Add data from the query options
     var query = evalOpts(this.flowObj.opts.query, this.fileObj, this, isTest);
     query = extend(query || {}, this.getParams());

     var target = evalOpts(this.flowObj.opts.target, this.fileObj, this, isTest);
     var data = null;
     if (method === 'GET' || paramsMethod === 'octet') {
       // Add data from the query options
       var params = [];
       each(query, function (v, k) {
         params.push([encodeURIComponent(k), encodeURIComponent(v)].join('='));
       });
       target = this.getTarget(target, params);
       data = blob || null;
     } else {
       // Add data from the query options
       data = new FormData();
       each(query, function (v, k) {
         data.append(k, v);
       });
       if (typeof blob !== "undefined") {
         data.append(this.flowObj.opts.fileParameterName, blob, this.filename || this.fileObj.file.name);
       }
     }

     this.xhr.open(method, target, true);
     this.xhr.withCredentials = this.flowObj.opts.withCredentials;

     // Add data from header options
     each(evalOpts(this.flowObj.opts.headers, this.fileObj, this, isTest), function (v, k) {
       this.xhr.setRequestHeader(k, v);
     }, this);

     return data;
   }
 };

 /**
  * Remove value from array
  * @param array
  * @param value
  */
 function arrayRemove(array, value) {
   var index = array.indexOf(value);
   if (index > -1) {
     array.splice(index, 1);
   }
 }

 /**
  * If option is a function, evaluate it with given params
  * @param {*} data
  * @param {...} args arguments of a callback
  * @returns {*}
  */
 function evalOpts(data, args) {
   if (typeof data === "function") {
     // `arguments` is an object, not array, in FF, so:
     args = Array.prototype.slice.call(arguments);
     data = data.apply(null, args.slice(1));
   }
   return data;
 }
 Flow.evalOpts = evalOpts;

 /**
  * Execute function asynchronously
  * @param fn
  * @param context
  */
 function async(fn, context) {
   setTimeout(fn.bind(context), 0);
 }

 /**
  * Extends the destination object `dst` by copying all of the properties from
  * the `src` object(s) to `dst`. You can specify multiple `src` objects.
  * @function
  * @param {Object} dst Destination object.
  * @param {...Object} src Source object(s).
  * @returns {Object} Reference to `dst`.
  */
 function extend(dst, src) {
   each(arguments, function(obj) {
     if (obj !== dst) {
       each(obj, function(value, key){
         dst[key] = value;
       });
     }
   });
   return dst;
 }
 Flow.extend = extend;

 /**
  * Iterate each element of an object
  * @function
  * @param {Array|Object} obj object or an array to iterate
  * @param {Function} callback first argument is a value and second is a key.
  * @param {Object=} context Object to become context (`this`) for the iterator function.
  */
 function each(obj, callback, context) {
   if (!obj) {
     return ;
   }
   var key;
   // Is Array?
   // Array.isArray won't work, not only arrays can be iterated by index https://github.com/flowjs/ng-flow/issues/236#
   if (typeof(obj.length) !== 'undefined') {
     for (key = 0; key < obj.length; key++) {
       if (callback.call(context, obj[key], key) === false) {
         return ;
       }
     }
   } else {
     for (key in obj) {
       if (obj.hasOwnProperty(key) && callback.call(context, obj[key], key) === false) {
         return ;
       }
     }
   }
 }
 Flow.each = each;

 /**
  * FlowFile constructor
  * @type {FlowFile}
  */
 Flow.FlowFile = FlowFile;

 /**
  * FlowFile constructor
  * @type {FlowChunk}
  */
 Flow.FlowChunk = FlowChunk;

 /**
  * Library version
  * @type {string}
  */
 Flow.version = '<%= version %>';

 if ( typeof module === "object" && module && typeof module.exports === "object" ) {
   // Expose Flow as module.exports in loaders that implement the Node
   // module pattern (including browserify). Do not create the global, since
   // the user will be storing it themselves locally, and globals are frowned
   // upon in the Node module world.
   module.exports = Flow;
 } else {
   // Otherwise expose Flow to the global object as usual
   window.Flow = Flow;

   // Register as a named AMD module, since Flow can be concatenated with other
   // files that may use define, but not via a proper concatenation script that
   // understands anonymous AMD modules. A named AMD is safest and most robust
   // way to register. Lowercase flow is used because AMD module names are
   // derived from file names, and Flow is normally delivered in a lowercase
   // file name. Do this after creating the global so that if an AMD module wants
   // to call noConflict to hide this version of Flow, it will work.
   if ( typeof define === "function" && define.amd ) {
     define( "flow", [], function () { return Flow; } );
   }
 }
})(typeof window !== 'undefined' && window, typeof document !== 'undefined' && document);
