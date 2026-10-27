document.addEventListener('DOMContentLoaded', () => {
    const gallerySection = [...document.querySelectorAll('section')].find((section) =>
        section.querySelector('h2')?.textContent.trim() === 'Nossos Momentos'
    );

    if (!gallerySection) return;

    const slide = gallerySection.querySelector('[class~="aspect-[4/3]"]');
    const thumbnails = [...gallerySection.querySelectorAll('[class~="mt-4"] button')];
    const controls = slide?.querySelector('[class~="bottom-4"]');
    const dotContainer = controls?.querySelector('div > div');
    const dots = dotContainer ? [...dotContainer.querySelectorAll(':scope > button')] : [];
    const previousButton = slide?.querySelector('.lucide-chevron-left')?.closest('button');
    const nextButton = slide?.querySelector('.lucide-chevron-right')?.closest('button');
    const playButton = controls?.querySelector(':scope > button');
    const count = slide?.querySelector('[class~="top-4"][class~="right-4"]');
    const mainImage = slide?.querySelector('img.object-contain');
    const blurredImage = slide?.querySelector('img.object-cover');

    if (!slide || !mainImage || thumbnails.length === 0) return;

    playButton?.classList.add('gallery-toggle');
    dots.forEach((dot) => dot.classList.add('gallery-indicator'));

    const displayedImageIndex = thumbnails.findIndex((thumbnail) =>
        thumbnail.querySelector('img')?.src === mainImage.src
    );
    let index = displayedImageIndex >= 0 ? displayedImageIndex : 0;
    let timer;
    let paused = false;
    let touchStartX = 0;

    const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause w-4 h-4 text-white"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>';
    const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play w-4 h-4 text-white"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';

    function updateSlide(direction = 'next') {
        index = (index + thumbnails.length) % thumbnails.length;
        const source = thumbnails[index].querySelector('img')?.src;
        if (!source) return;

        [mainImage, blurredImage].filter(Boolean).forEach((image) => {
            image.src = source;
            image.classList.remove('gallery-enter-next', 'gallery-enter-prev');
            void image.offsetWidth;
            image.classList.add(direction === 'prev' ? 'gallery-enter-prev' : 'gallery-enter-next');
        });

        thumbnails.forEach((thumbnail, thumbnailIndex) => {
            const active = thumbnailIndex === index;
            thumbnail.classList.toggle('gallery-thumbnail-active', active);
            thumbnail.classList.toggle('gallery-thumbnail-inactive', !active);
            thumbnail.setAttribute('aria-current', active ? 'true' : 'false');
        });

        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === index;
            dot.classList.toggle('gallery-dot-active', active);
            dot.querySelectorAll('div').forEach((progress) => progress.remove());
            dot.style.setProperty('width', active ? '28px' : '8px', 'important');
            dot.style.setProperty('min-width', active ? '28px' : '8px', 'important');
            dot.style.setProperty('height', '8px', 'important');
            dot.style.setProperty('background', active ? 'linear-gradient(90deg, #f472b6, #fbb6ce)' : 'rgba(255, 255, 255, .42)', 'important');
            dot.setAttribute('aria-label', `Mostrar foto ${dotIndex + 1}`);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
        });

        if (count) count.textContent = `${index + 1} / ${thumbnails.length}`;
    }

    function stopAutoplay() {
        window.clearInterval(timer);
        timer = undefined;
    }

    function startAutoplay() {
        stopAutoplay();
        if (!paused && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            timer = window.setInterval(() => {
                index = (index + 1) % thumbnails.length;
                updateSlide('next');
            }, 4500);
        }
        if (playButton) {
            playButton.innerHTML = paused ? playIcon : pauseIcon;
            playButton.setAttribute('aria-label', paused ? 'Reproduzir apresentação' : 'Pausar apresentação');
            playButton.setAttribute('aria-pressed', String(paused));
        }
    }

    previousButton?.addEventListener('click', () => {
        index -= 1;
        updateSlide('prev');
        startAutoplay();
    });

    nextButton?.addEventListener('click', () => {
        index += 1;
        updateSlide('next');
        startAutoplay();
    });

    thumbnails.forEach((thumbnail, thumbnailIndex) => {
        thumbnail.addEventListener('click', () => {
            const direction = thumbnailIndex < index ? 'prev' : 'next';
            index = thumbnailIndex;
            updateSlide(direction);
            startAutoplay();
        });
    });

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
            const direction = dotIndex < index ? 'prev' : 'next';
            index = dotIndex;
            updateSlide(direction);
            startAutoplay();
        });
    });

    playButton?.addEventListener('click', () => {
        paused = !paused;
        startAutoplay();
    });

    slide.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    slide.addEventListener('touchend', (event) => {
        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) < 45) return;
        index += distance < 0 ? 1 : -1;
        updateSlide(distance < 0 ? 'next' : 'prev');
        startAutoplay();
    }, { passive: true });

    updateSlide('next');
    startAutoplay();
});
