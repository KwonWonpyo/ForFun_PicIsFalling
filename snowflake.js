const body = document.querySelector("body");
const numSnow = document.getElementById("num_snow");
const apply = document.getElementById("apply");
const speed = document.getElementById("speed");
const speedVar = document.getElementById("speed_var");
const minSize = document.getElementById("min_size");
const maxSize = document.getElementById("max_size");

const MAX_DURATION = 50;

function makeSnowFlake(x, y, delay, opacity, duration) {
  const snowFlake = document.createElement("div");

  snowFlake.classList.add("snowflake");
  snowFlake.style.left = `${x}px`;
  snowFlake.style.top = `${y}px`;
  snowFlake.style.width = `${Math.random() * (maxSize.value - minSize.value) + minSize.value}px`
  snowFlake.style.height = snowFlake.style.width;
  snowFlake.style.animationDelay = `${delay}s`;
  snowFlake.style.opacity = opacity;
  snowFlake.style.animation = `fall ${duration}s linear ${delay}s forwards`;

  body.appendChild(snowFlake);

  setTimeout(() => {
    if (snowFlake.parentElement) {
      body.removeChild(snowFlake);
      runSnow();
    }
  }, (duration + delay) * 1000);
}

function initSnow() {
  for (let i = 0; i < numSnow.value; i++) {
    const init_x = Math.random() * window.screen.width;
    // const init_y = Math.random() * window.screen.height;
    const init_delay = Math.random() * MAX_DURATION;
    const init_opacity = Math.random() / 2 + 0.5;
    const duration = MAX_DURATION / speed.value + (Math.random() - 0.5) * speedVar.value;

    makeSnowFlake(init_x, -maxSize.value, init_delay, init_opacity, duration);
  }
}

function runSnow() {
  const x = Math.random() * window.screen.width;
  const opacity = Math.random() / 2 + 0.5;
  const duration = MAX_DURATION / speed.value + (Math.random() - 0.5) * speedVar.value;

  makeSnowFlake(x, -maxSize.value, 0, opacity, duration);
}

initSnow();


numSnow.addEventListener('input', handleMinMax);
minSize.addEventListener('input', (e) => {
  e.target.max = maxSize.value;
  handleMinMax(e);
})
maxSize.addEventListener('input', (e) => {
  e.target.min = minSize.value;
  handleMinMax(e);
})

function handleMinMax(e) {
  if (parseInt(e.target.value) > parseInt(e.target.max)) e.target.value = e.target.max;
  else if (parseInt(e.target.value) < parseInt(e.target.min)) e.target.value = e.target.min;
}

speedVar.addEventListener('input', handleMinMax);


apply.addEventListener('click', initSnow);
clear.addEventListener('click', clearAll);

function clearAll() {
  Array.from(body.children).forEach(element => {
    if (element.className === "snowflake") 
      body.removeChild(element);
  });
}

const previews = document.querySelectorAll('.image_preivew');
const backgroundImage = document.querySelector('#background_file');

backgroundImage.addEventListener('change', () => {
  const imageSrc = URL.createObjectURL(backgroundImage.files[0]);
  previews[0].src = imageSrc;
});

const openBtn = document.getElementById('openclose');
const leftPanel = document.getElementById('left_panel');

openBtn.addEventListener('click', toggleOpenClose);

function toggleOpenClose() {
  if (left_panel.style.left === '-15px') {
    left_panel.style.left = '-300px';
    openBtn.style.transform = 'rotate(0deg)';
  } else {
    left_panel.style.left = '-15px';
    openBtn.style.transform = 'rotate(180deg)';
  } 
}