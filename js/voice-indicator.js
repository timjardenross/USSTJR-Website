/**
 * USS TJR Voice Indicator
 * Version: 1.0
 *
 * LCARS-style visual feedback widget.
 * Shows when the computer is speaking or listening.
 *
 * Injects its own DOM and CSS.
 * No dependencies beyond voice-system.js
 *
 * Usage:
 *   Include after voice-system.js
 *   Automatically attaches to the page.
 */

USSTJR.VoiceIndicator = (() => {

  // ─────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────

  const CONFIG = {
    barCount:       8,
    animationMs:    120,
    colors: {
      speaking:     '#f5a623',   // LCARS amber — computer speaking
      listening:    '#5bc8f5',   // LCARS blue  — computer listening
      idle:         '#2a3a4a',   // Dark idle
    }
  };

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  let _state    = 'idle';   // idle | speaking | listening
  let _el       = null;
  let _bars     = [];
  let _label    = null;
  let _animFrame = null;

  // ─────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────

  function _injectStyles() {
    if (document.getElementById('usstjr-voice-indicator-styles')) return;

    const style = document.createElement('style');
    style.id    = 'usstjr-voice-indicator-styles';
    style.textContent = `
      #usstjr-voice-indicator {
        position:         fixed;
        bottom:           24px;
        right:            24px;
        z-index:          9999;
        display:          flex;
        align-items:      center;
        gap:              10px;
        padding:          10px 16px;
        background:       rgba(10, 18, 28, 0.92);
        border:           1px solid rgba(91, 200, 245, 0.25);
        border-left:      3px solid #5bc8f5;
        border-radius:    4px;
        backdrop-filter:  blur(8px);
        opacity:          0;
        transform:        translateY(8px);
        transition:       opacity 0.3s ease, transform 0.3s ease;
        pointer-events:   none;
        font-family:      'Courier New', 'Lucida Console', monospace;
      }

      #usstjr-voice-indicator.visible {
        opacity:          1;
        transform:        translateY(0);
        pointer-events:   auto;
      }

      #usstjr-voice-indicator.speaking {
        border-left-color: #f5a623;
      }

      #usstjr-voice-indicator.listening {
        border-left-color: #5bc8f5;
      }

      .usstjr-vi-bars {
        display:          flex;
        align-items:      center;
        gap:              3px;
        height:           20px;
      }

      .usstjr-vi-bar {
        width:            3px;
        border-radius:    2px;
        background:       #2a3a4a;
        height:           4px;
        transition:       height 0.1s ease, background 0.3s ease;
      }

      .usstjr-vi-label {
        font-size:        10px;
        letter-spacing:   0.15em;
        text-transform:   uppercase;
        color:            #5bc8f5;
        transition:       color 0.3s ease;
        white-space:      nowrap;
      }

      #usstjr-voice-indicator.speaking .usstjr-vi-label {
        color:            #f5a623;
      }

      .usstjr-vi-dot {
        width:            6px;
        height:           6px;
        border-radius:    50%;
        background:       #5bc8f5;
        transition:       background 0.3s ease;
        flex-shrink:      0;
      }

      #usstjr-voice-indicator.speaking .usstjr-vi-dot {
        background:       #f5a623;
        animation:        usstjr-pulse 1s ease-in-out infinite;
      }

      #usstjr-voice-indicator.listening .usstjr-vi-dot {
        animation:        usstjr-pulse 0.6s ease-in-out infinite;
      }

      @keyframes usstjr-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.7); }
      }
    `;

    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────
  // DOM CONSTRUCTION
  // ─────────────────────────────────────────

  function _build() {
    _el = document.createElement('div');
    _el.id = 'usstjr-voice-indicator';

    // Status dot
    const dot  = document.createElement('div');
    dot.className = 'usstjr-vi-dot';

    // Waveform bars
    const barsEl = document.createElement('div');
    barsEl.className = 'usstjr-vi-bars';

    for (let i = 0; i < CONFIG.barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'usstjr-vi-bar';
      barsEl.appendChild(bar);
      _bars.push(bar);
    }

    // Label
    _label = document.createElement('div');
    _label.className = 'usstjr-vi-label';
    _label.textContent = 'COMPUTER';

    _el.appendChild(dot);
    _el.appendChild(barsEl);
    _el.appendChild(_label);

    document.body.appendChild(_el);
  }

  // ─────────────────────────────────────────
  // ANIMATION
  // ─────────────────────────────────────────

  function _animateBars(color, intensity = 1.0) {
    if (_animFrame) cancelAnimationFrame(_animFrame);

    function frame() {
      _bars.forEach((bar) => {
        const minH  = 2;
        const maxH  = 18 * intensity;
        const h     = minH + Math.random() * (maxH - minH);
        bar.style.height     = `${h}px`;
        bar.style.background = color;
      });
      _animFrame = requestAnimationFrame(frame);
    }

    frame();
  }

  function _idleBars() {
    if (_animFrame) cancelAnimationFrame(_animFrame);
    _animFrame = null;
    _bars.forEach(bar => {
      bar.style.height     = '4px';
      bar.style.background = CONFIG.colors.idle;
    });
  }

  // ─────────────────────────────────────────
  // STATE TRANSITIONS
  // ─────────────────────────────────────────

  function _setState(newState) {
    _state = newState;

    _el.classList.remove('speaking', 'listening', 'visible');

    if (newState === 'speaking') {
      _el.classList.add('visible', 'speaking');
      _label.textContent = 'COMPUTER';
      _animateBars(CONFIG.colors.speaking, 0.85);

    } else if (newState === 'listening') {
      _el.classList.add('visible', 'listening');
      _label.textContent = 'LISTENING';
      _animateBars(CONFIG.colors.listening, 1.0);

    } else {
      // idle — hide after short delay
      _idleBars();
      setTimeout(() => {
        if (_state === 'idle') {
          _el.classList.remove('visible');
        }
      }, 800);
    }
  }

  // ─────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────

  /**
   * Show the speaking state
   */
  function showSpeaking() {
    _setState('speaking');
  }

  /**
   * Show the listening state
   */
  function showListening() {
    _setState('listening');
  }

  /**
   * Return to idle / hidden
   */
  function showIdle() {
    _setState('idle');
  }

  // ─────────────────────────────────────────
  // AUTO-WIRE TO VOICE SYSTEM
  // Listens for voice events and updates automatically
  // ─────────────────────────────────────────

  function _wireVoiceSystem() {
    if (!USSTJR.Voice) return;

    USSTJR.Voice.on('speaking', () => showSpeaking());
    USSTJR.Voice.on('done',     () => showIdle());
    USSTJR.Voice.on('error',    () => showIdle());
  }

  // ─────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────

  function _init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        _injectStyles();
        _build();
        _wireVoiceSystem();
      });
    } else {
      _injectStyles();
      _build();
      _wireVoiceSystem();
    }
  }

  _init();

  // ─────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────

  return {
    showSpeaking,
    showListening,
    showIdle,
  };

})();
