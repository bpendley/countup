async function loadMessages() {
  const container = document.getElementById('textBoxes');
  const response = await fetch('data/messages.json');

  if (!response.ok) {
    throw new Error(`Unable to load messages: ${response.status}`);
  }

  const messages = await response.json();
  container.innerHTML = messages.map(message => message.html).join('\n');
}

function createImageModal() {
  const imageLinks = document.getElementsByClassName('image-link');
  const modal = document.getElementById('myModal');
  const modalImage = document.getElementById('modalImage');
  const closeModal = document.getElementsByClassName('close')[0];
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  const images = Array.from(imageLinks).map(link => link.getAttribute('data-image'));

  let currentIndex = -1;

  for (let i = 0; i < imageLinks.length; i++) {
    imageLinks[i].onclick = function() {
      const imageSrc = this.getAttribute('data-image');
      modalImage.src = imageSrc;
      currentIndex = images.indexOf(imageSrc);
      modal.style.display = 'block';
    };
  }

  closeModal.onclick = function() {
    modal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  prevButton.onclick = function() {
    if (currentIndex > 0) {
      currentIndex--;
      modalImage.src = images[currentIndex];
    } else {
      currentIndex = images.length - 1;
      modalImage.src = images[currentIndex];
    }
  };

  nextButton.onclick = function() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      modalImage.src = images[currentIndex];
    } else {
      currentIndex = 0;
      modalImage.src = images[currentIndex];
    }
  };
}

const countDownDate = new Date('April 15, 2023 07:30:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = now - countDownDate;
  const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
  const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById('demo').innerHTML =
    years + 'y ' +
    days + 'd ' +
    hours + 'h ' +
    minutes + 'm ' +
    seconds + 's';
}

function parseCustomDate(dateStr) {
  const [datePart, timePart, ampm] = dateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  let [hours, minutes] = timePart.split(':').map(Number);

  if (ampm.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (ampm.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }

  return new Date(`20${year}`, month - 1, day, hours, minutes);
}

function sortDivs() {
  const container = document.getElementById('textBoxes');
  const boxes = Array.from(container.getElementsByClassName('text-box'));

  boxes.sort((a, b) => {
    const dateA = parseCustomDate(a.querySelector('b').textContent.trim());
    const dateB = parseCustomDate(b.querySelector('b').textContent.trim());
    return dateB - dateA;
  });

  boxes.forEach(box => container.appendChild(box));
}

function createHeartAnimation() {
  const canvas = document.getElementById('triangleCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const heartImage = new Image();
  heartImage.src = 'images/favicon.png';

  class Heart {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = 20 + Math.random() * 30;
      this.speedX = -0.5 + Math.random();
      this.speedY = -0.5 + Math.random();
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.01;
      this.opacity = 0.5 + Math.random() * 0.5;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
      if (this.y > canvas.height) this.y = 0;
      if (this.y < 0) this.y = canvas.height;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(heartImage, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
      ctx.globalAlpha = 1.0;
    }
  }

  const hearts = Array.from({ length: 30 }, () => new Heart());

  function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!heartImage.complete) {
      requestAnimationFrame(animateHearts);
      return;
    }

    for (const heart of hearts) {
      heart.update();
      heart.draw();
    }

    requestAnimationFrame(animateHearts);
  }

  animateHearts();
}

async function init() {
  document.getElementById('favicon').href = 'images/favicon.png';
  await loadMessages();
  sortDivs();
  createImageModal();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  createHeartAnimation();
}

init();
