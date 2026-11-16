/* Injects the water backdrop (light ripples, shafts and bubbles) styled by water.css. */
(function () {
  if (document.querySelector('.water')) return;
  var drop = function (style) { return '<i class="drop" style="' + style + '"></i>'; };

  var back = document.createElement('div');
  back.className = 'water';
  back.setAttribute('aria-hidden', 'true');
  back.innerHTML =
    '<svg class="caustics" preserveAspectRatio="none"><filter id="w-caustics" x="0" y="0" width="100%" height="100%">' +
    '<feTurbulence type="fractalNoise" baseFrequency=".004 .009" numOctaves="2" seed="7"/>' +
    '<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.2 0 0 0 -1.35"/>' +
    '<feGaussianBlur stdDeviation="6"/></filter><rect width="100%" height="100%" filter="url(#w-caustics)"/></svg>' +
    '<i class="shaft a"></i><i class="shade"></i><i class="shaft b"></i><i class="shade b"></i><i class="shaft c"></i>' +
    drop('--s:150px;left:-40px;top:120px;--d:19s') +
    drop('--s:96px;right:6%;top:-22px;--d:15s;--x:-8px;--y:14px') +
    drop('--s:210px;right:-70px;top:230px;--d:22s;--y:-26px') +
    drop('--s:54px;left:22%;top:44px;--d:13s') +
    drop('--s:120px;left:9%;bottom:6%;--d:18s;--x:10px') +
    drop('--s:70px;right:24%;bottom:12%;--d:14s;--y:16px');

  /* A few bubbles sit over the page edges, as if resting on the glass. */
  var front = document.createElement('div');
  front.className = 'water-front';
  front.setAttribute('aria-hidden', 'true');
  front.innerHTML =
    drop('--s:92px;left:1.5%;top:46%;--d:17s;--x:8px;--y:-10px') +
    drop('--s:40px;left:5%;top:72%;--d:12s') +
    drop('--s:64px;right:2%;bottom:9%;--d:15s;--y:-12px');

  /* Lens warp: in Chromium a bubble can refract what is behind it, using an SVG
     displacement map as its backdrop-filter. The map is two crossed gradients
     (red = horizontal shift, green = vertical), steeper at the rim so text
     bends as a bubble passes over it. Other browsers get a plain glassy bubble. */
  var canWarp = /Chrome\//.test(navigator.userAgent);
  var lensDefs = '';
  var lensMade = {};
  var stops = function (c) {
    /* Smooth curve: gentle magnification in the middle, a stronger bend toward the rim. */
    var out = '';
    for (var k = 0; k <= 24; k++) {
      var u = k / 12 - 1;
      out += '<stop offset="' + (k / 24).toFixed(4) + '" stop-color="' + c + '" stop-opacity="' + (0.5 - 0.5 * (0.45 * u + 0.55 * u * u * u)).toFixed(4) + '"/>';
    }
    return out;
  };
  var lensMap = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">' +
    '<linearGradient id="r" x1="0" x2="1" y1="0" y2="0">' + stops('#f00') + '</linearGradient>' +
    '<linearGradient id="g" x1="0" x2="0" y1="0" y2="1">' + stops('#0f0') + '</linearGradient>' +
    '<rect width="256" height="256" fill="#000"/><rect width="256" height="256" fill="url(#r)"/>' +
    '<rect width="256" height="256" fill="url(#g)" style="mix-blend-mode:screen"/></svg>');
  var lens = function (size) {
    if (!canWarp) return '';
    if (!lensMade[size]) {
      lensMade[size] = true;
      lensDefs += '<filter id="w-lens-' + size + '" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">' +
        '<feImage href="' + lensMap + '" x="0" y="0" width="' + size + '" height="' + size + '" preserveAspectRatio="none" result="map"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + Math.round(size * 0.38) + '" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation=".55"/></filter>';
    }
    return ';backdrop-filter:url(#w-lens-' + size + ') saturate(1.25) brightness(1.04)';
  };

  /* Opt-in (<body data-bubbles="rise">): bubbles rise and sway up the page, in front of the content. */
  var rise = null;
  if (document.body.dataset.bubbles === 'rise') {
    var rising = '';
    for (var i = 0; i < 11; i++) {
      var size = 10 * Math.round(4 + Math.pow(Math.random(), 1.6) * 10);   /* 40–140px, in 10px steps */
      var duration = Math.round(16 + Math.random() * 18 + size / 8);
      rising += '<i class="drop rise" style="--s:' + size + 'px;left:' + (Math.random() * 94).toFixed(1) + '%;--d:' + duration +
        's;--delay:-' + (Math.random() * duration).toFixed(1) + 's;--sway:' + Math.round((Math.random() < .5 ? -1 : 1) * (20 + Math.random() * 50)) +
        'px;--o:' + (0.8 + Math.random() * 0.2).toFixed(2) + lens(size) + '"></i>';
    }
    rise = document.createElement('div');
    rise.className = 'water-rise';
    rise.setAttribute('aria-hidden', 'true');
    rise.innerHTML = rising;
  }

  /* The edge bubbles resting on the glass refract too. */
  if (canWarp) {
    front.querySelectorAll('.drop').forEach(function (el) {
      var size = parseInt(el.style.getPropertyValue('--s'), 10);
      el.style.cssText += lens(size);
    });
  }

  document.body.prepend(back);
  document.body.append(front);
  if (rise) document.body.append(rise);
  if (lensDefs) {
    var defs = document.createElement('div');
    defs.setAttribute('aria-hidden', 'true');
    defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    defs.innerHTML = '<svg width="0" height="0">' + lensDefs + '</svg>';
    document.body.append(defs);
  }
})();
