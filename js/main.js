async function loadMessages() {
  const container = document.getElementById('textBoxes');
  const response = await fetch('data/messages.json');

  if (!response.ok) {
    throw new Error(`Unable to load messages: ${response.status}`);
  }

  const messages = await response.json();
  container.replaceChildren(...messages.sort(compareMessages).map(createTextBox));
}

function compareMessages(a, b) {
  const dateA = parseCustomDate(a.date);
  const dateB = parseCustomDate(b.date);

  if (dateA && dateB) {
    return dateB - dateA || b.id - a.id;
  }

  if (dateA) return -1;
  if (dateB) return 1;

  return b.id - a.id;
}

function createTextBox(message) {
  const box = document.createElement('div');
  box.className = 'text-box';
  const paragraphs = Array.isArray(message.message) ? message.message : [message.message];
  const images = message.images || [];

  for (const paragraph of paragraphs) {
    const paragraphElement = document.createElement('p');
    paragraphElement.textContent = paragraph;
    box.appendChild(paragraphElement);
  }

  if (images.length > 0) {
    const imageList = document.createElement('p');

    for (const image of images) {
      const link = document.createElement('a');
      link.href = 'javascript:void(0);';
      link.className = 'image-link';
      link.dataset.image = image.src;
      if (image.password && image.passwordLabel) {
        link.dataset.password = image.password;
        link.dataset.passwordLabel = image.passwordLabel;
      }
      link.textContent = image.label;
      imageList.appendChild(link);
      imageList.appendChild(document.createTextNode(' '));
    }

    box.appendChild(imageList);
  }

  const date = document.createElement('b');
  date.textContent = message.date;
  box.appendChild(date);

  return box;
}

function createImageModal() {
  const imageLinks = document.getElementsByClassName('image-link');
  const modal = document.getElementById('myModal');
  const modalImage = document.getElementById('modalImage');
  const closeModal = document.getElementsByClassName('close')[0];
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  const passwordPrompt = createPasswordPrompt();
  const images = Array.from(imageLinks).map(link => ({
    src: link.dataset.image,
    password: link.dataset.password,
    passwordLabel: link.dataset.passwordLabel,
  }));
  const unlockedImages = new Set();

  let currentIndex = -1;

  modalImage.insertAdjacentElement('afterend', passwordPrompt.container);

  for (let i = 0; i < imageLinks.length; i++) {
    imageLinks[i].onclick = function() {
      const imageSrc = this.getAttribute('data-image');
      currentIndex = images.findIndex(image => image.src === imageSrc);
      modal.style.display = 'block';
      showCurrentImage();
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
    } else {
      currentIndex = images.length - 1;
    }
    showCurrentImage();
  };

  nextButton.onclick = function() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    showCurrentImage();
  };

  passwordPrompt.form.onsubmit = function(event) {
    event.preventDefault();

    const image = images[currentIndex];
    if (!image) return;

    if (passwordPrompt.input.value === image.password) {
      unlockedImages.add(image.src);
      showImage(image.src);
      return;
    }

    passwordPrompt.error.textContent = 'Try again.';
    passwordPrompt.input.value = '';
    passwordPrompt.input.focus();
  };

  function showCurrentImage() {
    const image = images[currentIndex];
    if (!image) return;

    preloadNeighborImages();

    if (image.password && !unlockedImages.has(image.src)) {
      showPasswordPrompt(image);
      return;
    }

    showImage(image.src);
  }

  function showImage(src) {
    passwordPrompt.container.style.display = 'none';
    modalImage.style.display = 'block';
    modalImage.src = src;
  }

  function showPasswordPrompt(image) {
    modalImage.removeAttribute('src');
    modalImage.style.display = 'none';
    passwordPrompt.label.textContent = image.passwordLabel;
    passwordPrompt.input.value = '';
    passwordPrompt.error.textContent = '';
    passwordPrompt.container.style.display = 'flex';
    passwordPrompt.input.focus();
  }

  function preloadNeighborImages() {
    const neighbors = [
      images[(currentIndex + images.length - 1) % images.length],
      images[(currentIndex + 1) % images.length],
    ];

    for (const image of neighbors) {
      if (!image || image.password) continue;
      const preload = new Image();
      preload.src = image.src;
    }
  }
}

function createPasswordPrompt() {
  const container = document.createElement('div');
  container.className = 'password-prompt';
  container.style.display = 'none';

  const form = document.createElement('form');

  const label = document.createElement('label');
  label.htmlFor = 'imagePassword';

  const input = document.createElement('input');
  input.id = 'imagePassword';
  input.type = 'password';
  input.autocomplete = 'off';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Submit';

  const error = document.createElement('p');
  error.className = 'password-error';

  form.append(label, input, submit, error);
  container.appendChild(form);

  return { container, error, form, input, label };
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
  const match = dateStr.match(/^(\d{2}\/\d{2}\/\d{2})\s+(\d{1,2}:\d{2})\s+(am|pm)/i);

  if (!match) {
    return null;
  }

  const [, datePart, timePart, ampm] = match;
  const [month, day, year] = datePart.split('/').map(Number);
  let [hours, minutes] = timePart.split(':').map(Number);

  if (ampm.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (ampm.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }

  return new Date(`20${year}`, month - 1, day, hours, minutes);
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
  updateCountdown();
  setInterval(updateCountdown, 1000);
  createHeartAnimation();

  try {
    await loadMessages();
    createImageModal();
  } catch (error) {
    console.error(error);
  }
}

init();
