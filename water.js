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

  /* Opt-in: a stream of bubbles rising and swaying up the page. */
  if (document.body.dataset.bubbles === 'rise') {
    var rising = '';
    for (var i = 0; i < 16; i++) {
      var size = Math.round(16 + Math.pow(Math.random(), 2) * 84);
      var duration = Math.round(15 + Math.random() * 20 + size / 6);
      rising += '<i class="drop rise" style="--s:' + size + 'px;left:' + (Math.random() * 96).toFixed(1) + '%;--d:' + duration +
        's;--delay:-' + (Math.random() * duration).toFixed(1) + 's;--sway:' + Math.round((Math.random() < .5 ? -1 : 1) * (20 + Math.random() * 50)) +
        'px;--o:' + (0.65 + Math.random() * 0.35).toFixed(2) + '"></i>';
    }
    back.insertAdjacentHTML('beforeend', rising);
  }

  document.body.prepend(back);
  document.body.append(front);
})();
