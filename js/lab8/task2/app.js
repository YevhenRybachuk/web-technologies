class Slider {
  constructor(container, options = {}) {
    this.container = container;
    this.config = {
      duration: options.duration ?? 400,
      autoplay: options.autoplay ?? false,
      arrows: options.arrows ?? true,
      pagination: options.pagination ?? true,
      items: options.items ?? [],
    };

    this.currentIndex = 0;
    this.totalSlides = this.config.items.length;
    this.isTransitioning = false;
    this.autoplayInterval = null;
    this.track = null;
    this.viewport = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.dotsContainer = null;
    this.dots = [];

    if (this.totalSlides === 0) {
      this.container.innerHTML =
        '<div style="padding:3rem; text-align:center">Немає контенту для слайдера</div>';
      return;
    }

    this.init();
  }

  renderSlideContent(item) {
    if (typeof item === "string") {
      return `<div class="slide-content"><img src="${item}" alt="slide" loading="lazy"></div>`;
    }
    if (item.type === "image") {
      return `<div class="slide-content"><img src="${item.src}" alt="${item.alt || "slide image"}" loading="lazy"></div>`;
    }
    if (item.type === "video") {
      return `<div class="slide-content"><div class="video-wrapper"><video src="${item.src}" poster="${item.poster || ""}" controls preload="metadata" style="width:100%; height:100%;"></video></div></div>`;
    }
    if (item.type === "text") {
      return `<div class="slide-content slide-text"><h3>${item.title || "Текстовий блок"}</h3><p>${item.content || "Ваш текстовий слайд"}</p></div>`;
    }
    return `<div class="slide-content"><div class="slide-text">${item.toString()}</div></div>`;
  }

  buildSlidesMarkup() {
    let slidesHtml = "";
    for (let i = 0; i < this.config.items.length; i++) {
      const slideInner = this.renderSlideContent(this.config.items[i]);
      slidesHtml += `<div class="slider-slide" data-index="${i}">${slideInner}</div>`;
    }
    return slidesHtml;
  }

  init() {
    this.container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "slider-viewport";
    this.track = document.createElement("div");
    this.track.className = "slider-track";
    this.track.style.transition = `transform ${this.config.duration}ms cubic-bezier(0.2, 0.9, 0.4, 1.1)`;
    this.track.innerHTML = this.buildSlidesMarkup();
    wrapper.appendChild(this.track);
    this.container.appendChild(wrapper);
    this.viewport = wrapper;

    if (this.config.arrows) {
      this.prevBtn = this.createButton("‹", "slider-btn slider-btn-prev");
      this.nextBtn = this.createButton("›", "slider-btn slider-btn-next");
      this.container.appendChild(this.prevBtn);
      this.container.appendChild(this.nextBtn);
      this.prevBtn.addEventListener("click", () => this.prevSlide());
      this.nextBtn.addEventListener("click", () => this.nextSlide());
    }

    if (this.config.pagination && this.totalSlides > 1) {
      this.dotsContainer = document.createElement("div");
      this.dotsContainer.className = "slider-dots";
      this.container.appendChild(this.dotsContainer);
      this.updateDots();
      this.dotsContainer.addEventListener("click", (e) => {
        const dot = e.target.closest(".dot");
        if (dot && dot.dataset.index !== undefined) {
          const idx = parseInt(dot.dataset.index, 10);
          if (!isNaN(idx) && idx !== this.currentIndex) this.goToSlide(idx);
        }
      });
    }

    this.updateTrackPosition(false);
    if (this.config.autoplay && this.totalSlides > 1) {
      this.startAutoplay();
    }
    this.bindEvents();
  }

  createButton(text, className) {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    btn.className = className;
    btn.setAttribute("aria-label", text === "‹" ? "Попередній" : "Наступний");
    return btn;
  }

  updateTrackPosition(animated = true) {
    if (!this.track) return;
    if (!animated) {
      this.track.style.transition = "none";
    }
    const shiftPercent = -this.currentIndex * 100;
    this.track.style.transform = `translateX(${shiftPercent}%)`;
    if (!animated) {
      this.track.offsetHeight;
      this.track.style.transition = `transform ${this.config.duration}ms cubic-bezier(0.2, 0.9, 0.4, 1.1)`;
    }
    this.updateActiveDot();
  }

  updateActiveDot() {
    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll(".dot");
      dots.forEach((dot, idx) => {
        if (idx === this.currentIndex) dot.classList.add("active");
        else dot.classList.remove("active");
      });
    }
  }

  updateDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = "";
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement("button");
      dot.className = "dot";
      if (i === this.currentIndex) dot.classList.add("active");
      dot.dataset.index = i;
      this.dotsContainer.appendChild(dot);
    }
  }

  goToSlide(index, animated = true) {
    if (this.isTransitioning) return;
    let newIndex = index;
    if (newIndex >= this.totalSlides) newIndex = 0;
    if (newIndex < 0) newIndex = this.totalSlides - 1;
    if (newIndex === this.currentIndex && animated === true) return;

    this.isTransitioning = true;
    this.currentIndex = newIndex;

    const finishTransition = () => {
      this.isTransitioning = false;
      if (this.track) {
        this.track.removeEventListener("transitionend", finishTransition);
      }
    };
    if (animated) {
      this.track.addEventListener("transitionend", finishTransition, {
        once: true,
      });
      setTimeout(() => {
        if (this.isTransitioning) {
          this.isTransitioning = false;
        }
      }, this.config.duration + 50);
    } else {
      finishTransition();
    }
    this.updateTrackPosition(animated);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    this.goToSlide(this.currentIndex + 1);
    this.resetAutoplayTimer();
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.goToSlide(this.currentIndex - 1);
    this.resetAutoplayTimer();
  }

  startAutoplay() {
    if (this.autoplayInterval) clearInterval(this.autoplayInterval);
    if (!this.config.autoplay) return;
    if (this.totalSlides <= 1) return;
    this.autoplayInterval = setInterval(() => {
      if (!this.config.autoplay) return;
      const isHovered = this.container.matches(":hover");
      if (!isHovered) {
        this.nextSlide();
      }
    }, 2500);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resetAutoplayTimer() {
    if (this.config.autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  updateConfig(newOptions) {
    this.destroyEvents();
    this.stopAutoplay();
    Object.assign(this.config, newOptions);
    if (!this.config.items || this.config.items.length === 0) return;
    this.totalSlides = this.config.items.length;
    this.currentIndex = 0;
    this.isTransitioning = false;
    this.init();
  }

  bindEvents() {
    this.keydownHandler = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.nextSlide();
      }
    };
    window.addEventListener("keydown", this.keydownHandler);
    this.mouseEnterHandler = () => {
      if (this.config.autoplay && this.autoplayInterval) {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
      }
    };
    this.mouseLeaveHandler = () => {
      if (
        this.config.autoplay &&
        !this.autoplayInterval &&
        this.totalSlides > 1
      ) {
        this.startAutoplay();
      }
    };
    this.container.addEventListener("mouseenter", this.mouseEnterHandler);
    this.container.addEventListener("mouseleave", this.mouseLeaveHandler);
  }

  destroyEvents() {
    window.removeEventListener("keydown", this.keydownHandler);
    if (this.container) {
      this.container.removeEventListener("mouseenter", this.mouseEnterHandler);
      this.container.removeEventListener("mouseleave", this.mouseLeaveHandler);
    }
  }

  destroy() {
    this.stopAutoplay();
    this.destroyEvents();
    if (this.container) this.container.innerHTML = "";
  }
}

const sampleItems = [
  {
    type: "image",
    src: "https://images.pexels.com/photos/35755755/pexels-photo-35755755.jpeg",
    alt: "Гори",
  },
  {
    type: "image",
    src: "https://images.pexels.com/photos/35960318/pexels-photo-35960318.jpeg",
    alt: "Качка",
  },
  {
    type: "image",
    src: "https://images.pexels.com/photos/8633588/pexels-photo-8633588.jpeg",
    alt: "Сонце",
  },
  {
    type: "image",
    src: "https://images.pexels.com/photos/37462946/pexels-photo-37462946.jpeg",
  },
];

let currentSlider = null;

function initSliderWithOptions() {
  if (currentSlider) {
    currentSlider.destroy();
  }
  const speed =
    parseInt(document.getElementById("speedInput").value, 10) || 400;
  const autoplay = document.getElementById("autoplaySelect").value === "true";
  const arrows = document.getElementById("arrowsSelect").value === "true";
  const dots = document.getElementById("dotsSelect").value === "true";

  const container = document.getElementById("mySlider");
  currentSlider = new Slider(container, {
    items: sampleItems,
    duration: speed,
    autoplay: autoplay,
    arrows: arrows,
    pagination: dots,
  });
}

document.getElementById("reinitBtn").addEventListener("click", () => {
  initSliderWithOptions();
});
initSliderWithOptions();
