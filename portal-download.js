/* ==========================================================================
   LỤC HÀO PORTAL — UNIFIED HD CANVAS RENDER HELPERS & IMAGE DOWNLOAD/SHARE
   - iOS (iPhone / iPad / iPadOS): Opens Native Share Sheet immediately (synchronously
     with pre-cached File so Safari allows Save to Photos; AbortError exits quietly)
   - Android & Desktop (PC / Mac): Direct PNG file download
   ========================================================================== */
(function (global) {
  'use strict';

  function isIOS() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function dataURItoBlob(dataURI) {
    if (!dataURI || typeof dataURI !== 'string') return null;
    try {
      var parts = dataURI.split(',');
      if (parts.length < 2) return null;
      var byteString = atob(parts[1]);
      var mimeMatch = parts[0].match(/:(.*?);/);
      var mimeString = mimeMatch ? mimeMatch[1] : 'image/png';
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (e) {
      console.warn('dataURItoBlob error:', e);
      return null;
    }
  }

  function prepareFile(blob, filename) {
    if (!blob || typeof File === 'undefined') return null;
    try {
      return new File([blob], filename || 'image.png', {
        type: blob.type || 'image/png',
        lastModified: Date.now()
      });
    } catch (e) {
      return null;
    }
  }

  function directDownload(blob, filename, dataUrl) {
    var safeName = filename || 'luchao-image.png';
    var downloadUrl = '';
    var isObjectUrl = false;

    if (blob) {
      downloadUrl = URL.createObjectURL(blob);
      isObjectUrl = true;
    } else if (dataUrl) {
      downloadUrl = dataUrl;
    } else {
      return false;
    }

    var link = document.createElement('a');
    link.download = safeName;
    link.href = downloadUrl;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(function () {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      if (isObjectUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    }, 1000);

    return true;
  }

  async function saveOrShare(opts) {
    opts = opts || {};
    var filename = opts.filename || 'luchao-image.png';
    var title = opts.title || filename;
    var text = opts.text || '';
    var onSuccess = typeof opts.onSuccess === 'function' ? opts.onSuccess : function () {};
    var onError = typeof opts.onError === 'function' ? opts.onError : function () {};

    var dataUrl = opts.dataUrl || '';
    var blob = opts.blob || (dataUrl ? dataURItoBlob(dataUrl) : null);
    var shareFile = opts.file || (blob ? prepareFile(blob, filename) : null);

    if (!blob && !dataUrl) {
      onError('Chưa có ảnh để tải!');
      return false;
    }

    // 1. iOS (iPhone / iPad): Native Share Sheet so user can Save Image to Photos
    if (isIOS() && shareFile && typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        if (navigator.canShare({ files: [shareFile] })) {
          var sharePayload = { files: [shareFile], title: title };
          if (text) sharePayload.text = text;
          await navigator.share(sharePayload);
          onSuccess('Đã chia sẻ / lưu ảnh thành công!');
          return true;
        }
      } catch (err) {
        if (err && err.name === 'AbortError') {
          // User closed iOS Share Sheet intentionally — never trigger fallback download
          return false;
        }
        console.warn('iOS Native share failed, falling back to download:', err);
      }
    }

    // 2. Android, Desktop (PC / Mac) & fallback: Direct PNG download
    var ok = directDownload(blob, filename, dataUrl);
    if (ok) {
      onSuccess('Đã tải ảnh HD về máy thành công!');
      return true;
    }

    onError('Không thể tải ảnh. Vui lòng thử lại!');
    return false;
  }

  /**
   * "Mực in" technique adapted from luc-hao-api: slightly thickens glyph stems
   * via rounded stroke + fill for razor-sharp legible Canvas 2D exports.
   */
  function enableInkText(ctx, ratio) {
    if (!ctx || ctx.__inkEnabled) return;
    ctx.__inkEnabled = true;
    var r = typeof ratio === 'number' ? ratio : 0.22;
    var originalFillText = ctx.fillText.bind(ctx);
    ctx.fillText = function (text, x, y, maxWidth) {
      var font = this.font || '';
      var pxMatch = font.match(/([\d.]+)px/);
      var px = pxMatch ? parseFloat(pxMatch[1]) : 18;
      var isBold = /bold|700|800|900/i.test(font);
      var stem = isBold ? 0.12 : 0.08;
      var w = px * stem * r;
      if (w > 0 && typeof this.fillStyle === 'string') {
        this.save();
        this.lineJoin = 'round';
        this.miterLimit = 2;
        this.lineWidth = w;
        this.strokeStyle = this.fillStyle;
        if (maxWidth !== undefined) this.strokeText(text, x, y, maxWidth);
        else this.strokeText(text, x, y);
        this.restore();
      }
      if (maxWidth !== undefined) originalFillText(text, x, y, maxWidth);
      else originalFillText(text, x, y);
    };
  }

  function waitForFonts(fontSpecs, timeoutMs) {
    if (typeof document === 'undefined' || !document.fonts) {
      return Promise.resolve();
    }
    var ms = typeof timeoutMs === 'number' ? timeoutMs : 1800;
    var specs = Array.isArray(fontSpecs) ? fontSpecs : [];
    var loaders = specs.map(function (spec) {
      return document.fonts.load(spec).catch(function () { return []; });
    });
    return Promise.race([
      Promise.all(loaders).then(function () { return document.fonts.ready; }),
      new Promise(function (resolve) { setTimeout(resolve, ms); })
    ]).catch(function () {});
  }

  global.PortalImageDownload = {
    isIOS: isIOS,
    dataURItoBlob: dataURItoBlob,
    prepareFile: prepareFile,
    directDownload: directDownload,
    saveOrShare: saveOrShare,
    enableInkText: enableInkText,
    waitForFonts: waitForFonts
  };
})(typeof window !== 'undefined' ? window : this);
