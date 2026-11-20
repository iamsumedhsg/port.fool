

document.addEventListener('DOMContentLoaded', () => {
  
  const timerEl = document.getElementById('activity-timer');
  if (timerEl) {
    let totalSeconds = 2 * 3600 + 41 * 60 + 18; 

    function formatTime(secs) {
      const h = Math.floor(secs / 3600).toString().padStart(2, '0');
      const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s} elapsed`;
    }

    setInterval(() => {
      totalSeconds++;
      timerEl.textContent = formatTime(totalSeconds);
    }, 1000);
  }

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.shortcut-link');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);

  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg, duration = 2400) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn && toast) {
    copyBtn.addEventListener('click', () => {
      const textToCopy = copyBtn.dataset.copy || 'sumedhsinghg@gmail.com';
      const showSuccess = () => {
        showToast('Email copied to clipboard!');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2200);
      };

      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(() => {
          fallbackCopy(textToCopy, showSuccess);
        });
      } else {
        fallbackCopy(textToCopy, showSuccess);
      }
    });
  }

  function fallbackCopy(text, cb) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (cb) cb();
  }

  let audioCtx = null;
  function getAudioContext() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    } catch {
      return null;
    }
  }

  function playCoinSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); 
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); 
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  function playLaserSound() {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  const mosaicCanvas = document.getElementById('banner-mosaic-canvas');
  if (mosaicCanvas) {
    const mctx = mosaicCanvas.getContext('2d');
    const banner = mosaicCanvas.parentElement;
    let mWidth = 0, mHeight = 0;
    const TILE_SIZE = 11;
    const GAP = 2;
    let cols = 0, rows = 0;
    let grid = [];
    let rippleQueue = [];

    const DEV_LOGO_THEMES = [
      {
        name: 'Crimson Code',
        logo: '#da373c',
        logoAccent: '#ff4d4f',
        bgTiles: ['#221416', '#2a191b', '#1a0e10', '#301c1f']
      },
      {
        name: 'Terminal Matrix',
        logo: '#23a55a',
        logoAccent: '#57f287',
        bgTiles: ['#122017', '#17271d', '#0d1811', '#1c3124']
      },
      {
        name: 'Cyber Violet',
        logo: '#5865f2',
        logoAccent: '#7983f5',
        bgTiles: ['#181a2e', '#1f213a', '#121323', '#252744']
      },
      {
        name: 'Synthwave Pink',
        logo: '#eb459e',
        logoAccent: '#ff73be',
        bgTiles: ['#241520', '#2d1a28', '#1a0e17', '#362030']
      },
      {
        name: 'JavaScript Amber',
        logo: '#f0b232',
        logoAccent: '#fee75c',
        bgTiles: ['#241e10', '#2c2514', '#1a150b', '#352c17']
      },
      {
        name: 'Electric Cyan',
        logo: '#00b0f4',
        logoAccent: '#38d3ff',
        bgTiles: ['#112028', '#162832', '#0c171d', '#1b323e']
      },
      {
        name: 'Clean White',
        logo: '#ffffff',
        logoAccent: '#d1d5db',
        bgTiles: ['#1c1e22', '#24272c', '#151619', '#2a2d33']
      }
    ];
    let currentThemeIdx = 0;

    const DEV_LOGO_SPRITE = [
      
      [0, 1, 1,       0,   0, 0, 1,      0,   1, 1, 0], 
      [1, 1, 0,       0,   0, 1, 1,      0,   0, 1, 1], 
      [1, 1, 0,       0,   0, 1, 0,      0,   0, 1, 1], 
      [1, 1, 0,       0,   1, 1, 0,      0,   0, 1, 1], 
      [0, 1, 1,       0,   1, 0, 0,      0,   1, 1, 0], 
    ];

    function setupAndBuildMosaic() {
      if (!banner) return;
      const w = banner.clientWidth || banner.offsetWidth;
      const h = banner.clientHeight || banner.offsetHeight;

      if (!w || !h || w < 10) {
        requestAnimationFrame(setupAndBuildMosaic);
        return;
      }

      mWidth = mosaicCanvas.width = w;
      mHeight = mosaicCanvas.height = h;

      cols = Math.floor((mWidth + GAP) / (TILE_SIZE + GAP));
      rows = Math.floor((mHeight + GAP) / (TILE_SIZE + GAP));
      if (cols < 1) cols = 1;
      if (rows < 1) rows = 1;

      const gridW = cols * (TILE_SIZE + GAP) - GAP;
      const gridH = rows * (TILE_SIZE + GAP) - GAP;
      const offsetX = Math.floor((mWidth - gridW) / 2);
      const offsetY = Math.floor((mHeight - gridH) / 2);

      grid = [];
      const theme = DEV_LOGO_THEMES[currentThemeIdx];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rnd = Math.random();
          const bgCol = theme.bgTiles[Math.floor(rnd * theme.bgTiles.length)];
          grid.push({
            c, r,
            x: offsetX + c * (TILE_SIZE + GAP),
            y: offsetY + r * (TILE_SIZE + GAP),
            color: bgCol,
            baseColor: bgCol,
            isLogo: false,
            glow: 0
          });
        }
      }

      const logoWidth = DEV_LOGO_SPRITE[0].length;
      const logoHeight = DEV_LOGO_SPRITE.length;
      const startCol = Math.floor((cols - logoWidth) / 2);
      const startRow = Math.floor((rows - logoHeight) / 2);

      for (let r = 0; r < logoHeight; r++) {
        for (let c = 0; c < logoWidth; c++) {
          if (DEV_LOGO_SPRITE[r][c] === 1) {
            const gridCol = startCol + c;
            const gridRow = startRow + r;
            if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
              const idx = gridRow * cols + gridCol;
              if (grid[idx]) {
                const col = (r === 0 || r === 1) ? theme.logoAccent : theme.logo;
                grid[idx].color = col;
                grid[idx].baseColor = col;
                grid[idx].isLogo = true;
              }
            }
          }
        }
      }
    }

    setupAndBuildMosaic();
    setTimeout(setupAndBuildMosaic, 100);

    if (window.ResizeObserver && banner) {
      const ro = new ResizeObserver(() => {
        setupAndBuildMosaic();
      });
      ro.observe(banner);
    } else {
      window.addEventListener('resize', setupAndBuildMosaic);
    }

    function renderMosaic() {
      if (mWidth <= 0 || mHeight <= 0) {
        requestAnimationFrame(renderMosaic);
        return;
      }

      mctx.clearRect(0, 0, mWidth, mHeight);

      for (let i = rippleQueue.length - 1; i >= 0; i--) {
        const rip = rippleQueue[i];
        rip.radius += 8;
        rip.life -= 0.035;

        grid.forEach(tile => {
          const dx = (tile.x + TILE_SIZE / 2) - rip.x;
          const dy = (tile.y + TILE_SIZE / 2) - rip.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - rip.radius) < 18) {
            tile.glow = Math.max(tile.glow, rip.life);
          }
        });

        if (rip.life <= 0 || rip.radius > mWidth * 1.3) {
          rippleQueue.splice(i, 1);
        }
      }

      const theme = DEV_LOGO_THEMES[currentThemeIdx];
      grid.forEach(tile => {
        if (tile.glow > 0) {
          tile.glow -= 0.03;
          if (tile.glow < 0) tile.glow = 0;
        }

        if (tile.glow > 0.05) {
          mctx.fillStyle = tile.isLogo ? '#ffffff' : theme.logoAccent;
        } else {
          mctx.fillStyle = tile.color;
        }
        mctx.fillRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE);
      });

      requestAnimationFrame(renderMosaic);
    }
    requestAnimationFrame(renderMosaic);

    mosaicCanvas.addEventListener('mousemove', e => {
      const rect = mosaicCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = mosaicCanvas.width / rect.width;
      const scaleY = mosaicCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      grid.forEach(tile => {
        if (x >= tile.x && x <= tile.x + TILE_SIZE && y >= tile.y && y <= tile.y + TILE_SIZE) {
          tile.glow = 1.0;
        }
      });
    });

    mosaicCanvas.addEventListener('click', e => {
      const rect = mosaicCanvas.getBoundingClientRect();
      const scaleX = mosaicCanvas.width / rect.width;
      const scaleY = mosaicCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      rippleQueue.push({ x, y, radius: 0, life: 1.0 });
      playCoinSound();
    });

    const shuffleBtn = document.getElementById('mosaic-shuffle-btn');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', e => {
        e.stopPropagation();
        currentThemeIdx = (currentThemeIdx + 1) % DEV_LOGO_THEMES.length;
        setupAndBuildMosaic();
        playLaserSound();
        rippleQueue.push({ x: mWidth / 2, y: mHeight / 2, radius: 0, life: 1.0 });
        showToast(`\u{1F4BB} Dev Logo: ${DEV_LOGO_THEMES[currentThemeIdx].name}!`, 1900);
      });
    }
  }

  const profileAvatar = document.getElementById('profile-avatar');
  const avatarSvg = document.getElementById('avatar-svg');

  const AVATAR_STYLES = [
    {
      name: 'Cyber Dev',
      svg: `
        <rect width="100" height="100" fill="#1e1114"/>
        <circle cx="50" cy="50" r="46" stroke="#da373c" stroke-width="2" stroke-dasharray="8 5"/>
        <path d="M16 86 C16 70 32 64 50 64 C68 64 84 70 84 86 L84 100 L16 100 Z" fill="#2b2d31"/>
        <path d="M40 64 L50 80 L60 64 Z" fill="#da373c"/>
        <rect x="33" y="30" width="34" height="32" rx="8" fill="#f5d0b5"/>
        <path d="M28 32 C28 20 38 15 50 15 C62 15 72 20 72 32 C65 26 55 24 44 26 Z" fill="#18191c"/>
        <rect x="30" y="36" width="40" height="13" rx="4" fill="#111214" stroke="#da373c" stroke-width="1.5"/>
        <path d="M36 41 L40 43 L36 45" stroke="#23a55a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="43" y1="45" x2="47" y2="45" stroke="#23a55a" stroke-width="1.5"/>
        <path d="M64 41 L60 43 L64 45" stroke="#ff4d4f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24 38 C24 18 37 10 50 10 C63 10 76 18 76 38" stroke="#da373c" stroke-width="3" stroke-linecap="round"/>
        <rect x="20" y="34" width="8" height="18" rx="4" fill="#da373c"/>
        <rect x="72" y="34" width="8" height="18" rx="4" fill="#da373c"/>
        <path d="M24 46 C24 56 34 58 40 56" stroke="#f2f3f5" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="41" cy="56" r="2.2" fill="#23a55a"/>
      `
    },
    {
      name: 'Astro Droid R2',
      svg: `
        <rect width="100" height="100" fill="#151b24"/>
        <circle cx="50" cy="50" r="46" stroke="#5865f2" stroke-width="2" stroke-dasharray="6 4"/>
        <path d="M30 46 C30 25 70 25 70 46 L70 78 C70 82 66 86 62 86 L38 86 C34 86 30 82 30 78 Z" fill="#f2f3f5"/>
        <path d="M30 46 C30 25 70 25 70 46 Z" fill="#da373c"/>
        <rect x="36" y="52" width="28" height="26" rx="3" fill="#2b2d31"/>
        <rect x="42" y="56" width="16" height="6" fill="#23a55a"/>
        <rect x="42" y="66" width="16" height="4" fill="#5865f2"/>
        <circle cx="50" cy="38" r="8" fill="#111214"/>
        <circle cx="50" cy="38" r="5" fill="#00b0f4"/>
        <circle cx="51" cy="37" r="2" fill="#ffffff"/>
        <circle cx="62" cy="40" r="3" fill="#23a55a"/>
        <rect x="20" y="52" width="8" height="34" rx="4" fill="#35373c"/>
        <rect x="72" y="52" width="8" height="34" rx="4" fill="#35373c"/>
      `
    },
    {
      name: '8-Bit Cyber Hacker',
      svg: `
        <rect width="100" height="100" fill="#111214"/>
        <circle cx="50" cy="50" r="46" stroke="#23a55a" stroke-width="2" stroke-dasharray="8 4"/>
        <rect x="24" y="24" width="52" height="52" fill="#232428" stroke="#35373c" stroke-width="2"/>
        <rect x="32" y="36" width="14" height="10" fill="#111214"/>
        <rect x="54" y="36" width="14" height="10" fill="#111214"/>
        <rect x="34" y="38" width="10" height="6" fill="#da373c"/>
        <rect x="56" y="38" width="10" height="6" fill="#da373c"/>
        <rect x="46" y="40" width="8" height="3" fill="#111214"/>
        <rect x="38" y="56" width="24" height="4" fill="#23a55a"/>
        <rect x="38" y="52" width="4" height="4" fill="#23a55a"/>
        <rect x="58" y="52" width="4" height="4" fill="#23a55a"/>
        <rect x="20" y="76" width="60" height="24" fill="#da373c"/>
        <rect x="36" y="76" width="28" height="24" fill="#ffffff"/>
      `
    }
  ];
  let currentAvatarIdx = 0;

  if (profileAvatar && avatarSvg) {
    profileAvatar.addEventListener('click', () => {
      currentAvatarIdx = (currentAvatarIdx + 1) % AVATAR_STYLES.length;
      avatarSvg.innerHTML = AVATAR_STYLES[currentAvatarIdx].svg;
      playCoinSound();
      showToast(`\u{1F3AD} Avatar Style: ${AVATAR_STYLES[currentAvatarIdx].name}!`, 1800);
    });
  }

  const onlineBadge = document.getElementById('profile-online-badge');
  const statusPulseRing = document.getElementById('status-pulse-ring');
  const statusIconSvg = document.getElementById('status-icon-svg');
  const customStatusText = document.querySelector('.custom-status .status-text');
  const customStatusEmoji = document.querySelector('.custom-status .status-emoji');

  const STATUS_MODES = [
    {
      name: 'Online',
      color: '#23a55a',
      title: 'Status: Online • Ready to Build & Ship (Click to switch)',
      text: 'Building multi-agent AI systems & scalable web applications',
      emoji: '⚡',
      icon: '<path d="M8.5 1.5L2.5 9h5l-1 5.5L13.5 7h-5l1-5.5z"/>'
    },
    {
      name: 'Flow State',
      color: '#5865f2',
      title: 'Status: Flow State • Live in VS Code (Click to switch)',
      text: 'Deep in the zone • Engineering high-throughput pipelines',
      emoji: '🎮',
      icon: '<path d="M3 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm3 1a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1A.5.5 0 0 0 6 6zm4 2a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>'
    },
    {
      name: 'Deep Work',
      color: '#da373c',
      title: 'Status: Deep Work • Multi-agent compile mode (Click to switch)',
      text: 'Compiling neural networks & fine-tuning multi-agent protocols',
      emoji: '🔥',
      icon: '<path d="M2 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2zm2 3.5l2.5 2L4 10.5v-1l1.5-1L4 7.5v-1zm4 4h3v1H8v-1z"/>'
    },
    {
      name: 'Coffee Break',
      color: '#f0b232',
      title: 'Status: Coffee Break • Architecture thinking (Click to switch)',
      text: 'Refueling caffeine • Brainstorming next breakthrough',
      emoji: '☕',
      icon: '<path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h7A1.5 1.5 0 0 1 12 3.5V8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V3.5zM12 4.5h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H12v-4z"/>'
    }
  ];
  let currentStatusIdx = 0;

  if (onlineBadge) {
    onlineBadge.addEventListener('click', e => {
      e.stopPropagation();
      currentStatusIdx = (currentStatusIdx + 1) % STATUS_MODES.length;
      const mode = STATUS_MODES[currentStatusIdx];

      onlineBadge.style.backgroundColor = mode.color;
      onlineBadge.title = mode.title;
      if (statusPulseRing) statusPulseRing.style.borderColor = mode.color;
      if (statusIconSvg) statusIconSvg.innerHTML = mode.icon;

      if (customStatusText) customStatusText.textContent = mode.text;
      if (customStatusEmoji) customStatusEmoji.textContent = mode.emoji;

      playLaserSound();
      showToast(`${mode.emoji} Status Mode: ${mode.name}!`, 2000);
    });
  }

  const canvas = document.getElementById('starwars-space');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0, height = 0;
  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  let warpMultiplier = 1;

  const STAR_COUNT = 200;
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: Math.random() * 2.8 + 0.6, 
    size: Math.random() * 1.6 + 0.6,
    alpha: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinkleDir: Math.random() > 0.5 ? 1 : -1
  }));

  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  window.addEventListener('mousemove', e => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
  });

  const ships = [];
  const lasers = [];
  const explosions = [];

  class StarFighter {
    constructor(type, x, y, angle, target = null) {
      this.type = type; 
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.speed = type === 'tie' ? 2.4 : 2.1;
      this.target = target;
      this.size = type === 'tie' ? 18 : 20;
      this.cooldown = Math.floor(Math.random() * 40) + 20;
      this.life = 0;
      this.maxLife = 900; 
    }

    update() {
      this.life++;

      if (this.target && this.target.alive !== false) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        let diff = targetAngle - this.angle;

        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        this.angle += Math.max(-0.035, Math.min(0.035, diff));

        if (Math.abs(diff) < 0.35 && this.cooldown <= 0) {
          this.fire();
          this.cooldown = Math.floor(Math.random() * 35) + 30;
        }
      } else {
        
        this.angle += (Math.random() - 0.5) * 0.02;
        if (this.cooldown <= 0 && Math.random() < 0.025) {
          this.fire();
          this.cooldown = Math.floor(Math.random() * 45) + 40;
        }
      }

      this.cooldown--;

      this.x += Math.cos(this.angle) * this.speed * warpMultiplier;
      this.y += Math.sin(this.angle) * this.speed * warpMultiplier;

      const margin = 100;
      if (this.x < -margin) this.x = width + margin;
      if (this.x > width + margin) this.x = -margin;
      if (this.y < -margin) this.y = height + margin;
      if (this.y > height + margin) this.y = -margin;
    }

    fire() {
      const forwardX = Math.cos(this.angle);
      const forwardY = Math.sin(this.angle);
      const perpX = -forwardY;
      const perpY = forwardX;

      if (this.type === 'xwing') {
        
        const offset = 9;
        const speed = 9;
        lasers.push({
          x: this.x + perpX * offset + forwardX * 12,
          y: this.y + perpY * offset + forwardY * 12,
          vx: forwardX * speed,
          vy: forwardY * speed,
          color: '#da373c', 
          life: 45
        });
        lasers.push({
          x: this.x - perpX * offset + forwardX * 12,
          y: this.y - perpY * offset + forwardY * 12,
          vx: forwardX * speed,
          vy: forwardY * speed,
          color: '#da373c', 
          life: 45
        });
      } else {
        
        const offset = 4;
        const speed = 9.5;
        lasers.push({
          x: this.x + perpX * offset + forwardX * 10,
          y: this.y + perpY * offset + forwardY * 10,
          vx: forwardX * speed,
          vy: forwardY * speed,
          color: '#23a55a', 
          life: 45
        });
        lasers.push({
          x: this.x - perpX * offset + forwardX * 10,
          y: this.y - perpY * offset + forwardY * 10,
          vx: forwardX * speed,
          vy: forwardY * speed,
          color: '#23a55a', 
          life: 45
        });
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.type === 'xwing') {

        ctx.fillStyle = '#dbdee1'; 
        ctx.beginPath();
        ctx.moveTo(14, 0);     
        ctx.lineTo(-12, -4);   
        ctx.lineTo(-14, 0);    
        ctx.lineTo(-12, 4);    
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#111214';
        ctx.fillRect(-2, -2, 5, 4);

        ctx.strokeStyle = '#f2f3f5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        ctx.moveTo(-6, -3);
        ctx.lineTo(-14, -14);
        ctx.lineTo(8, -14); 
        
        ctx.moveTo(-6, 3);
        ctx.lineTo(-14, 14);
        ctx.lineTo(8, 14);  
        ctx.stroke();

        ctx.fillStyle = '#da373c';
        ctx.beginPath();
        ctx.arc(-14, 0, 2, 0, Math.PI * 2);
        ctx.fill();

      } else {

        ctx.strokeStyle = '#f2f3f5';
        ctx.fillStyle = '#18191c';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        ctx.moveTo(-7, -13);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-12, 8);
        ctx.lineTo(-7, 13);
        ctx.lineTo(-2, 8);
        ctx.lineTo(-2, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(7, -13);
        ctx.lineTo(12, -8);
        ctx.lineTo(12, 8);
        ctx.lineTo(7, 13);
        ctx.lineTo(2, 8);
        ctx.lineTo(2, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#949ba4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();

        ctx.fillStyle = '#dbdee1';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111214';
        ctx.beginPath();
        ctx.arc(1.5, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#da373c';
        ctx.beginPath();
        ctx.arc(-4, 0, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function initDogfight() {
    ships.length = 0;
    
    const tie1 = new StarFighter('tie', width * 0.75, height * 0.25, Math.PI * 0.85);
    const xwing1 = new StarFighter('xwing', width * 0.85, height * 0.2, Math.PI * 0.82, tie1);

    const xwing2 = new StarFighter('xwing', width * 0.2, height * 0.7, -Math.PI * 0.25);
    const tie2 = new StarFighter('tie', width * 0.1, height * 0.8, -Math.PI * 0.22, xwing2);

    const tie3 = new StarFighter('tie', width * 0.85, height * 0.65, -Math.PI * 0.6);
    const xwing3 = new StarFighter('xwing', width * 0.15, height * 0.35, Math.PI * 0.35, tie3);

    ships.push(tie1, xwing1, xwing2, tie2, tie3, xwing3);
  }
  initDogfight();

  setInterval(() => {
    if (ships.length < 6) {
      const type = Math.random() > 0.5 ? 'xwing' : 'tie';
      const startX = Math.random() > 0.5 ? -40 : width + 40;
      const startY = Math.random() * height;
      const angle = Math.atan2(height / 2 - startY, width / 2 - startX);
      const enemy = ships.find(s => s.type !== type);
      ships.push(new StarFighter(type, startX, startY, angle, enemy));
    }
  }, 4000);

  function loop() {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    stars.forEach(st => {
      
      st.y += 0.4 * st.z * warpMultiplier;
      st.x += (0.15 * st.z + mouseX * 0.3) * warpMultiplier;

      st.alpha += st.twinkleSpeed * st.twinkleDir;
      if (st.alpha > 0.95) {
        st.alpha = 0.95;
        st.twinkleDir = -1;
      } else if (st.alpha < 0.25) {
        st.alpha = 0.25;
        st.twinkleDir = 1;
      }

      if (st.y > height) {
        st.y = 0;
        st.x = Math.random() * width;
      }
      if (st.x > width) st.x = 0;
      if (st.x < 0) st.x = width;

      ctx.fillStyle = `rgba(242, 243, 245, ${st.alpha})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(218, 55, 60, 0.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 45; i++) {
      for (let j = i + 1; j < 45; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }

    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      l.x += l.vx;
      l.y += l.vy;
      l.life--;

      if (l.life <= 0 || l.x < -50 || l.x > width + 50 || l.y < -50 || l.y > height + 50) {
        lasers.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = l.color; 
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x - l.vx * 1.8, l.y - l.vy * 1.8);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(l.x, l.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ships.forEach(ship => {
      ship.update();
      ship.draw(ctx);
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
});
