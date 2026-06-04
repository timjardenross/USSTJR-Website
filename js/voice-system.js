/**
 * USS TJR Voice System
 * Version: 1.0
 * 
 * Hybrid voice profile — Star Trek precision with J.A.R.V.I.S awareness.
 * The ship computer that knows its Captain.
 * 
 * Usage:
 *   USSTJR.Voice.speak("Message here");
 *   USSTJR.Voice.speak(USSTJR.Voice.phrases.online);
 */

window.USSTJR = window.USSTJR || {};
const USSTJR = window.USSTJR;

USSTJR.Voice = (() => {

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  let _voice         = null;
  let _ready         = false;
  let _queue         = [];
  let _speaking      = false;
  let _listeners     = {};
  let _enabled       = false;

  // ─────────────────────────────────────────
  // VOICE PROFILE
  // USS TJR Hybrid — Trek precision, aware presence
  // ─────────────────────────────────────────

  const PROFILE = {
    pitch:  1.05,   // Slightly above neutral — present, not flat
    rate:   0.90,   // Measured — deliberate but not slow
    volume: 1.0,    // Full confidence
    // Preferred voices in order of preference
    preferred: [
      'Google US English',
      'Microsoft Zira Desktop',
      'Samantha',
      'Google UK English Female',
      'Microsoft Hazel Desktop',
      'Karen',
      'Moira',
      'Fiona',
    ]
  };

  // ─────────────────────────────────────────
  // PHRASE LIBRARY
  // USS TJR standard computer responses
  // ─────────────────────────────────────────

  const phrases = {

    // System
    online:           "USS TJR online. Welcome back, Captain.",
    offline:          "USS TJR going offline, Captain.",
    ready:            "All systems nominal, Captain.",
    standby:          "Standing by, Captain.",

    // Navigation
    commandDeck:      "Command Deck online, Captain.",
    captainsLog:      "Captain's Log ready, Captain.",
    medicalBay:       "Medical Bay online, Captain.",
    missionControl:   "Mission Control online, Captain.",
    computerCore:     "Computer Core online, Captain.",

    // Captain's Log
    logReady:         "Ready to record your log, Captain.",
    logSaved:         "Captain's Log saved to records, Captain.",
    logDownloaded:    "Log transferred to TJR-OS, Captain.",
    logCleared:       "Draft cleared, Captain.",
    logRestored:      "Previous draft restored, Captain.",

    // Voice Capture
    listening:        "Listening, Captain.",
    voiceComplete:    "Voice capture complete, Captain.",
    voiceSaved:       "Voice log saved, Captain.",
    voiceError:       "Voice capture unavailable, Captain.",
    voiceStopped:     "Recording stopped, Captain.",

    // Stardates
    stardatePrefix:   "Stardate",

    // Confirmations
    confirmed:        "Confirmed, Captain.",
    complete:         "Complete, Captain.",
    saved:            "Saved, Captain.",
    copied:           "Copied, Captain.",
    error:            "Unable to complete that action, Captain.",
    notSupported:     "That function is not available in this environment, Captain.",

    // Health awareness — gentle acknowledgement
    painLow:          "Pain levels low today, Captain. A good day.",
    painMedium:       "Pain levels noted, Captain. Pace yourself today.",
    painHigh:         "Pain levels noted, Captain. Rest when you can.",
    energyLow:        "Energy levels low, Captain. Take care of yourself today.",
    energyHigh:       "Energy levels high, Captain. Make the most of it.",
    moodLow:          "Mood noted, Captain. The crew is with you.",
    moodHigh:         "Spirits high, Captain. A strong day ahead.",

    // Time-aware greetings
    morning:          "Good morning, Captain.",
    afternoon:        "Good afternoon, Captain.",
    evening:          "Good evening, Captain.",

    // Motivational — minimal, not cheesy
    wellDone:         "Well done, Captain.",
    missionComplete:  "Mission complete, Captain.",
    logStreak:        "Consistent logging, Captain. The record is strong.",

  };

  // ─────────────────────────────────────────
  // INTERNAL — Voice Selection
  // ─────────────────────────────────────────

  function _selectVoice(voices) {
    if (!voices || voices.length === 0) return null;

    // Try preferred voices in order
    for (const name of PROFILE.preferred) {
      const match = voices.find(v =>
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (match) return match;
    }

    // Fallback: first English female voice
    const englishFemale = voices.find(v =>
      v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
    );
    if (englishFemale) return englishFemale;

    // Fallback: first English voice
    const english = voices.find(v => v.lang.startsWith('en'));
    if (english) return english;

    // Last resort: first available
    return voices[0];
  }

  // ─────────────────────────────────────────
  // INTERNAL — Initialise Voice
  // ─────────────────────────────────────────

  function _init() {
    loadPreference();

    if (!('speechSynthesis' in window)) {
      console.warn('[USS TJR Voice] Speech synthesis not supported in this environment.');
      _ready = false;
      return;
    }

    const synth = window.speechSynthesis;

    function loadVoices() {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        _voice = _selectVoice(voices);
        _ready = true;
        console.log(`[USS TJR Voice] Online. Voice selected: ${_voice ? _voice.name : 'Default'}`);
        _emit('ready', { voice: _voice });
        _processQueue();
      }
    }

    // Voices may load asynchronously
    loadVoices();
    synth.onvoiceschanged = loadVoices;
  }

  // ─────────────────────────────────────────
  // INTERNAL — Queue Processing
  // ─────────────────────────────────────────

  function _processQueue() {
    if (_speaking || _queue.length === 0 || !_ready) return;

    const { text, options, resolve } = _queue.shift();
    _speak(text, options, resolve);
  }

  function _speak(text, options = {}, resolve) {
    const synth  = window.speechSynthesis;
    const utter  = new SpeechSynthesisUtterance(text);

    utter.voice  = options.voice  || _voice;
    utter.pitch  = options.pitch  ?? PROFILE.pitch;
    utter.rate   = options.rate   ?? PROFILE.rate;
    utter.volume = options.volume ?? PROFILE.volume;

    _speaking = true;
    _emit('speaking', { text });

    utter.onend = () => {
      _speaking = false;
      _emit('done', { text });
      if (resolve) resolve();
      _processQueue();
    };

    utter.onerror = (e) => {
      _speaking = false;
      console.warn('[USS TJR Voice] Speech error:', e.error);
      _emit('error', { text, error: e.error });
      if (resolve) resolve();
      _processQueue();
    };

    // Chrome bug workaround — cancel before speaking
    synth.cancel();
    setTimeout(() => synth.speak(utter), 50);
  }

  // ─────────────────────────────────────────
  // INTERNAL — Event Emitter
  // ─────────────────────────────────────────

  function _emit(event, data) {
    if (_listeners[event]) {
      _listeners[event].forEach(fn => fn(data));
    }
  }

  // ─────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────

  /**
   * Speak a message
   * @param {string} text - The message to speak
   * @param {object} options - Optional overrides { pitch, rate, volume }
   * @returns {Promise} Resolves when speech is complete
   */
  function speak(text, options = {}) {
    if (!_enabled) return Promise.resolve();
    if (!text || typeof text !== 'string') return Promise.resolve();

    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('[USS TJR Voice] Not supported.');
        resolve();
        return;
      }

      if (_ready) {
        _queue.push({ text, options, resolve });
        _processQueue();
      } else {
        // Hold in queue until ready
        _queue.push({ text, options, resolve });
      }
    });
  }

  /**
   * Speak a time-aware greeting
   * Automatically selects morning / afternoon / evening
   */
  function greet() {
    const hour = new Date().getHours();
    if (hour < 12) return speak(phrases.morning);
    if (hour < 17) return speak(phrases.afternoon);
    return speak(phrases.evening);
  }

  /**
   * Speak the current Stardate
   * @param {string} stardate - Stardate string e.g. "260604.01"
   */
  function announceStardate(stardate) {
    if (!stardate) return Promise.resolve();
    return speak(`${phrases.stardatePrefix} ${stardate}.`);
  }

  /**
   * Speak health-aware response based on pain level
   * @param {number} level - 1 to 10
   */
  function acknowledgePain(level) {
    const n = parseInt(level, 10);
    if (isNaN(n)) return Promise.resolve();
    if (n <= 3) return speak(phrases.painLow);
    if (n <= 6) return speak(phrases.painMedium);
    return speak(phrases.painHigh);
  }

  /**
   * Speak health-aware response based on energy level
   * @param {number} level - 1 to 10
   */
  function acknowledgeEnergy(level) {
    const n = parseInt(level, 10);
    if (isNaN(n)) return Promise.resolve();
    if (n <= 3) return speak(phrases.energyLow);
    return speak(phrases.energyHigh);
  }

  /**
   * Speak health-aware response based on mood level
   * @param {number} level - 1 to 10
   */
  function acknowledgeMood(level) {
    const n = parseInt(level, 10);
    if (isNaN(n)) return Promise.resolve();
    if (n <= 3) return speak(phrases.moodLow);
    return speak(phrases.moodHigh);
  }

  /**
   * Stop all speech immediately
   */
  function stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    _queue    = [];
    _speaking = false;
  }

  /**
   * Check if voice system is ready
   * @returns {boolean}
   */
  function isReady() {
    return _ready;
  }

  /**
   * List available voices in the browser
   * Useful for debugging and voice selection
   * @returns {SpeechSynthesisVoice[]}
   */
  function listVoices() {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Register an event listener
   * Events: 'ready', 'speaking', 'done', 'error'
   * @param {string} event
   * @param {function} fn
   */
  function on(event, fn) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(fn);
  }

  /**
   * Remove an event listener
   * @param {string} event
   * @param {function} fn
   */
  function off(event, fn) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(f => f !== fn);
  }

  function isEnabled() {
    return _enabled;
  }

  function setEnabled(value) {
    _enabled = Boolean(value);
    localStorage.setItem('usstjr-voice-enabled', _enabled ? 'true' : 'false');
    _emit(_enabled ? 'enabled' : 'disabled', {});
  }

  function loadPreference() {
    _enabled = localStorage.getItem('usstjr-voice-enabled') === 'true';
  }

  // ─────────────────────────────────────────
  // BOOT
  // ─────────────────────────────────────────

  _init();

  // ─────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────

  return {
    speak,
    greet,
    announceStardate,
    acknowledgePain,
    acknowledgeEnergy,
    acknowledgeMood,
    stop,
    isReady,
    listVoices,
    on,
    off,
    isEnabled,
    setEnabled,
    loadPreference,
    phrases,
  };

})();

// Convenience global shorthand
// Allows: speak("Message") anywhere in your app
function speak(text, options) {
  return USSTJR.Voice.speak(text, options);
}
