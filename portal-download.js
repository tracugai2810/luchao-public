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

  var VI_FONT_SAMPLE = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴáàảãạăắằẳẵặâấầẩẫậđéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ';

  function waitForFonts(fontSpecs, timeoutMs) {
    if (typeof document === 'undefined' || !document.fonts) {
      return Promise.resolve();
    }
    var ms = typeof timeoutMs === 'number' ? timeoutMs : 3000;
    var specs = Array.isArray(fontSpecs) ? fontSpecs : [];
    var loaders = specs.map(function (spec) {
      return document.fonts.load(spec, VI_FONT_SAMPLE).catch(function () { return []; });
    });
    return Promise.race([
      Promise.all(loaders).then(function () { return document.fonts.ready; }),
      new Promise(function (resolve) { setTimeout(resolve, ms); })
    ]).catch(function () {});
  }

  var TUVI_UNICODE_VI = 'U+102-103,U+110-111,U+128-129,U+168-169,U+1A0-1A1,U+1AF-1B0,U+300-301,U+303-304,U+308-309,U+323,U+329,U+1EA0-1EF9,U+20AB';
  var TUVI_UNICODE_LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  var TUVI_FONT_SOURCES = [
    { weight: 400, range: TUVI_UNICODE_VI, url: '/tu-vi/_next/static/media/53e45098eac42afb-s.p.0l2qk94b1u89y.woff2' },
    { weight: 400, range: TUVI_UNICODE_LATIN, url: '/tu-vi/_next/static/media/3c285486269019b7-s.p.0sn2213rkw2e_.woff2' },
    { weight: 700, range: TUVI_UNICODE_VI, url: '/tu-vi/_next/static/media/8ffc259da9d23054-s.p.0b_.2~bprftx..woff2' },
    { weight: 700, range: TUVI_UNICODE_LATIN, url: '/tu-vi/_next/static/media/6f42e0a3b0519c4d-s.p.0czffigx~77c..woff2' },
    { weight: 800, range: TUVI_UNICODE_VI, url: '/tu-vi/_next/static/media/fcf129058e6e31f2-s.p.0k.rt6-fab6y0.woff2' },
    { weight: 800, range: TUVI_UNICODE_LATIN, url: '/tu-vi/_next/static/media/3eca85881bcfa204-s.p.09gf3ff1ir7gl.woff2' }
  ];
  var tuviFontCssPromise = null;

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var chunks = [];
    var chunkSize = 0x8000;
    for (var i = 0; i < bytes.length; i += chunkSize) {
      chunks.push(String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize)));
    }
    return btoa(chunks.join(''));
  }

  function getTuViEmbeddedFontCss() {
    if (typeof fetch === 'undefined' || typeof btoa === 'undefined') {
      return Promise.resolve('');
    }
    if (tuviFontCssPromise) return tuviFontCssPromise;

    tuviFontCssPromise = Promise.all(
      TUVI_FONT_SOURCES.map(function (entry) {
        return fetch(entry.url, { credentials: 'same-origin' })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.arrayBuffer();
          })
          .then(function (buf) {
            var b64 = arrayBufferToBase64(buf);
            return "@font-face{font-family:'Be Vietnam Pro';font-style:normal;font-weight:" +
              entry.weight + ";src:url(data:font/woff2;base64," + b64 + ") format('woff2');unicode-range:" +
              entry.range + ';}';
          })
          .catch(function (err) {
            console.warn('Skip Tu Vi font embed:', entry.url, err);
            return '';
          });
      })
    ).then(function (rules) {
      return rules.join('');
    }).catch(function () {
      return '';
    });

    return tuviFontCssPromise;
  }

  function injectTuViFontsIntoSvg(svgStr) {
    if (!svgStr || typeof svgStr !== 'string') return Promise.resolve(svgStr);
    return getTuViEmbeddedFontCss().then(function (css) {
      if (!css) return svgStr;
      var styleIdx = svgStr.indexOf('<style>');
      if (styleIdx === -1) return svgStr;
      var insertPos = styleIdx + 7;
      return svgStr.slice(0, insertPos) + css + svgStr.slice(insertPos);
    });
  }

  global.PortalImageDownload = {
    isIOS: isIOS,
    dataURItoBlob: dataURItoBlob,
    prepareFile: prepareFile,
    directDownload: directDownload,
    saveOrShare: saveOrShare,
    enableInkText: enableInkText,
    waitForFonts: waitForFonts,
    getTuViEmbeddedFontCss: getTuViEmbeddedFontCss,
    injectTuViFontsIntoSvg: injectTuViFontsIntoSvg
  };
})(typeof window !== 'undefined' ? window : this);
