// You can also show/hide the bubble dynamically with JavaScript.
const men = document.querySelector('.men');
const men_desc = document.querySelector('.men_desc');
const shen = document.querySelector('.shen');
const shen_desc = document.querySelector('.shen_desc');
const xing = document.querySelector('.xing');
const xing_desc = document.querySelector('.xing_desc');
const gan = document.querySelector('.gan');
const gan_desc = document.querySelector('.gan_desc');
const gong = document.querySelector('.gong');
const gong_desc = document.querySelector('.gong_desc');

men.addEventListener('mouseover', () => {
  men_desc.style.display = 'block';
});

men.addEventListener('mouseout', () => {
  men_desc.style.display = 'none';
});

shen.addEventListener('mouseover', () => {
  shen_desc.style.display = 'block';
});

shen.addEventListener('mouseout', () => {
  shen_desc.style.display = 'none';
});

xing.addEventListener('mouseover', () => {
  xing_desc.style.display = 'block';
});

xing.addEventListener('mouseout', () => {
  xing_desc.style.display = 'none';
});

gan.addEventListener('mouseover', () => {
  gan_desc.style.display = 'block';
});

gan.addEventListener('mouseout', () => {
  gan_desc.style.display = 'none';
});

gong.addEventListener('mouseover', () => {
  gong_desc.style.display = 'block';
});

gong.addEventListener('mouseout', () => {
  gong_desc.style.display = 'none';
});
