document.querySelectorAll('.carousel').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const btnLeft = carousel.querySelector('.carousel-btn.left');
  const btnRight = carousel.querySelector('.carousel-btn.right');
  const scrollAmount = 270; // px
  
  btnLeft.onclick = () => { track.scrollBy({left: -scrollAmount, behavior: 'smooth'}); };
  btnRight.onclick = () => { track.scrollBy({left: scrollAmount, behavior: 'smooth'}); };
});