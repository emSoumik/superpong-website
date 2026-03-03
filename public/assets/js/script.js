// Reveal on scroll with IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// Staggered children observer
const childObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Find all siblings with data-reveal-child in same parent
      const parent = entry.target.parentElement;
      const children = parent.querySelectorAll('[data-reveal-child]');
      children.forEach((child, i) => {
        setTimeout(() => child.classList.add('revealed'), i * 120);
        childObserver.unobserve(child);
      });
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
document.querySelectorAll('[data-reveal-child]').forEach(el => childObserver.observe(el));

// Generate ambient twinkling stars in all dark sections
(function () {
  // Hero stars (original)
  const heroLayer = document.getElementById('starsLayer');
  if (heroLayer) spawnStars(heroLayer, 35);

  // All other star layers (data-stars attribute)
  document.querySelectorAll('.stars-layer[data-stars]').forEach(layer => {
    const count = parseInt(layer.dataset.stars) || 20;
    spawnStars(layer, count);
  });

  function spawnStars(layer, count) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      const isLarge = Math.random() < 0.25;
      star.className = 'star' + (isLarge ? ' star-lg' : '');
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 90 + '%';
      star.style.setProperty('--dur', (4 + Math.random() * 6) + 's');
      star.style.setProperty('--delay', (Math.random() * 10) + 's');
      layer.appendChild(star);
    }
  }

  // Generate floating particles for light sections
  document.querySelectorAll('.particles-layer[data-particles]').forEach(layer => {
    const count = parseInt(layer.dataset.particles) || 15;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 2 + Math.random() * 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = 20 + Math.random() * 70 + '%';
      p.style.setProperty('--dur', (5 + Math.random() * 8) + 's');
      p.style.setProperty('--delay', (Math.random() * 10) + 's');
      layer.appendChild(p);
    }
  });
})();

// ====== Option A Live Preview & Voice Hints ======
(function () {
  const startBtn = document.getElementById('start-preview-flow-btn');
  const stepsContainer = document.getElementById('option-a-steps');
  const previewAction = document.getElementById('option-a-preview-action');
  const launchBtn = document.getElementById('launch-preview-btn');
  const iframeOverlay = document.getElementById('option-a-iframe-overlay');
  const closeBtn = document.getElementById('close-preview-btn');
  const iframeContainer = document.getElementById('iframe-container');
  const voiceHint = document.getElementById('voice-hint-container');

  let hintTimeout;
  let recognition;

  if (startBtn && stepsContainer && previewAction) {
    startBtn.addEventListener('click', () => {
      // Fade out steps and itself
      stepsContainer.style.opacity = '0';
      stepsContainer.style.transform = 'translateY(10px)';
      startBtn.style.opacity = '0';
      startBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        stepsContainer.classList.add('hidden');
        startBtn.classList.add('hidden');

        previewAction.classList.remove('hidden');
        previewAction.classList.add('flex');

        setTimeout(() => {
          previewAction.style.opacity = '1';
        }, 50);
      }, 400);
    });
  }

  function startVoiceDetection() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => { showHintAfterDelay(3000); };

    recognition.onresult = (event) => {
      // If user starts speaking, hide immediately
      if (voiceHint) {
        voiceHint.style.opacity = '0';
        voiceHint.style.transform = 'translateX(-50%) translateY(-10px)';
      }
      clearTimeout(hintTimeout);
      showHintAfterDelay(5000); // Re-show after 5s of silence
    };

    recognition.onerror = () => { recognition.stop(); };
    recognition.onend = () => { if (iframeOverlay && !iframeOverlay.classList.contains('hidden')) recognition.start(); };

    recognition.start();
  }

  function showHintAfterDelay(ms) {
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => {
      if (voiceHint && !iframeOverlay.classList.contains('hidden')) {
        voiceHint.style.opacity = '1';
        voiceHint.style.transform = 'translateX(-50%) translateY(0)';
      }
    }, ms);
  }

  if (launchBtn && iframeOverlay && closeBtn && iframeContainer) {
    const card = document.getElementById('option-a-card');

    launchBtn.addEventListener('click', () => {
      iframeOverlay.classList.remove('hidden');
      iframeOverlay.classList.remove('pointer-events-none');

      if (card) {
        // Expand card height to fit the larger iframe preview
        const targetHeight = window.innerWidth < 768 ? 600 : 850;
        card.style.height = `${targetHeight}px`;
        iframeOverlay.style.height = `${targetHeight}px`;
      }

      if (!iframeContainer.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = 'https://superpong-ai.vercel.app';
        iframe.className = 'w-full h-full absolute inset-0 z-10 border-0';
        iframe.setAttribute('allow', 'fullscreen; clipboard-write; display-capture; autoplay; microphone');
        iframeContainer.appendChild(iframe);
      }

      setTimeout(() => {
        iframeOverlay.style.opacity = '1';
        startVoiceDetection();
      }, 50);
    });

    closeBtn.addEventListener('click', () => {
      iframeOverlay.style.opacity = '0';
      if (voiceHint) voiceHint.style.opacity = '0';
      if (recognition) recognition.stop();
      clearTimeout(hintTimeout);

      if (card) {
        // Restore original card height
        card.style.height = '';
      }

      setTimeout(() => {
        iframeOverlay.classList.add('hidden');
        iframeOverlay.classList.add('pointer-events-none');
        const iframe = iframeContainer.querySelector('iframe');
        if (iframe) iframe.remove();
      }, 500);
    });
  }
})();
