// Carrousel horizontal façon Netflix
document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const btnLeft = carousel.querySelector('.carousel-btn.left');
  const btnRight = carousel.querySelector('.carousel-btn.right');
  const scrollAmount = 270; // px

  btnLeft.onclick = () => { track.scrollBy({left: -scrollAmount, behavior: 'smooth'}); };
  btnRight.onclick = () => { track.scrollBy({left: scrollAmount, behavior: 'smooth'}); };
});

// Initialisation du lecteur vidéo HLS pour le film
window.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('my-video');
  var videoSrc = 'https://dl34.darkibox.com/hls2/41/01331/6yqwkr2ct1iq_x/index-v1-a1.m3u8?t=_tVx9QTooByOsoerE9UzqML5rr1PhR4MZ8AF1XHHHZc&s=1752036609&e=43200&f=6655045&i=0.0&sp=0&fr=6yqwkr2ct1iq';

  // Si le navigateur supporte HLS nativement (Safari)
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  } else if (window.Hls && Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else {
    video.outerHTML = "<div style='color:red;'>Votre navigateur ne supporte pas la lecture de ce flux vidéo.</div>";
  }
});