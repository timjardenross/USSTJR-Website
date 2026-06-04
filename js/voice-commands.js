/**
 * USS TJR Voice Commands
 * Version: 1.0
 * Phase B — Voice Command Engine
 *
 * Wake word: "Computer"
 * Requires: voice-system.js, voice-indicator.js
 *
 * Usage:
 *   USSTJR.VoiceCommands.activate();    // Start listening
 *   USSTJR.VoiceCommands.deactivate();  // Stop listening
 */

USSTJR.VoiceCommands = (() => {

  // ─────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────

  const CONFIG = {
    wakeWord:         'computer',     // Trigger word
    commandWindowMs:  6000,           // How long to wait for command after wake word
    lang:             'en-US',        // Recognition language
    confidence:       0.5,            // Minimum confidence threshold (0–1)
  };

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  let _recognition    = null;
  let _active         = false;       // Is the system listening at all
  let _awake          = false;       // Has wake word been heard
  let _commandTimer   = null;        // Timeout after wake word
  let _starting       = false;       // Prevent overlapping start calls
  let _stopRequested  = false;       // Clean shutdown flag

  // ─────────────────────────────────────────
  // COMMAND REGISTRY
  // Add new commands here — no engine changes needed
  //
  // Key:   phrase the user says (lowercase, after wake word)
  // Value: function to execute
  // ─────────────────────────────────────────

  const COMMANDS = {

    // ── Navigation ──────────────────────────
    'open command deck':      () => _navigate('index.html'),
    'command deck':           () => _navigate('index.html'),
    'go to command deck':     () => _navigate('index.html'),

    "open captain's log":     () => _navigate('captains-log.html'),
    "captain's log":          () => _navigate('captains-log.html'),
    'open captains log':      () => _navigate('captains-log.html'),
    'captains log':           () => _navigate('captains-log.html'),

    'open medical bay':       () => _navigate('medical-bay.html'),
    'medical bay':            () => _navigate('medical-bay.html'),

    'open mission control':   () => _navigate('mission-control.html'),
    'mission control':        () => _navigate('mission-control.html'),

    // ── Captain's Log Actions ────────────────
    'start recording':        () => _triggerAction('voiceStart'),
    'begin recording':        () => _triggerAction('voiceStart'),
    'start voice capture':    () => _triggerAction('voiceStart'),

    'stop recording':         () => _triggerAction('voiceStop'),
    'end recording':          () => _triggerAction('voiceStop'),
    'stop voice capture':     () => _triggerAction('voiceStop'),

    'save log':               () => _triggerAction('saveLog'),
    'download log':           () => _triggerAction('saveLog'),
    'save captain\'s log':    () => _triggerAction('saveLog'),

    'clear draft':            () => _triggerAction('clearDraft'),
    'clear log':              () => _triggerAction('clearDraft'),

    // ── Status ───────────────────────────────
    'current stardate':       () => _reportStardate(),
    'what is the stardate':   () => _reportStardate(),
    'stardate':               () => _reportStardate(),

    'ship status':            () => _reportStatus(),
    'system status':          () => _reportStatus(),
    'system report':          () => _reportStatus(),
    'status report':          () => _reportStatus(),

    // ── Voice Control ────────────────────────
    'deactivate':             () => _selfDeactivate(),
    'stand down':             () => _selfDeactivate(),
    'voice off':              () => _selfDeactivate(),
    'go to sleep':            () => _selfDeactivate(),

    'help':                   () => _listCommands(),
    'what can you do':        () => _listCommands(),
    'available commands':     () => _listCommands(),

  };

  // ─────────────────────────────────────────
  // ACTIONS
  // Internal implementations of commands
  // ─────────────────────────────────────────

  function _navigate(page) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    if (current === page) {
      USSTJR.Voice.speak(`Already on ${_pageLabel(page)}, Captain.`);
      return;
    }
    USSTJR.Voice.speak(`Navigating to ${_pageLabel(page)}, Captain.`)
      .then(() => { window.location.href = page; });
  }

  function _pageLabel(page) {
    const labels = {
      'index.html':           'Command Deck',
      'captains-log.html':    "Captain's Log",
      'medical-bay.html':     'Medical Bay',
      'mission-control.html': 'Mission Control',
    };
    return labels[page] || page;
  }

  // Trigger actions on the current page
  // Pages register handlers via USSTJR.VoiceCommands.registerAction()
  function _triggerAction(actionName) {
    if (_registeredActions[actionName]) {
      _registeredActions[actionName]();
    } else {
      USSTJR.Voice.speak(`That function is not available on this page, Captain.`);
    }
  }

  function _reportStardate() {
    const stardate = localStorage.getItem('usstjr-stardate') || 'unknown';
    USSTJR.Voice.announceStardate(stardate);
  }

  function _reportStatus() {
    const stardate = localStorage.getItem('usstjr-stardate') || 'unknown';
    USSTJR.Voice.speak(
      `USS TJR online. Stardate ${stardate}. All systems nominal, Captain.`
    );
  }

  function _listCommands() {
    USSTJR.Voice.speak(
      `Available commands include: open Command Deck, open Captain's Log, ` +
      `open Medical Bay, start recording, stop recording, save log, ` +
      `current Stardate, ship status, and stand down. Captain.`
    );
  }

  function _selfDeactivate() {
    USSTJR.Voice.speak('Voice commands deactivated, Captain.')
      .then(() => deactivate());
  }

  // ─────────────────────────────────────────
  // ACTION REGISTRY
  // Pages register their own action handlers
  // ─────────────────────────────────────────

  const _registeredActions = {};

  /**
   * Register a page-level action handler
   * Call this from captains-log.html, medical-bay.html etc.
   *
   * @param {string}   name  - Action name e.g. 'voiceStart', 'saveLog'
   * @param {function} fn    - Handler function
   *
   * Example in captains-log.html:
   *   USSTJR.VoiceCommands.registerAction('voiceStart', () => startRecording());
   *   USSTJR.VoiceCommands.registerAction('saveLog',    () => downloadMarkdown());
   *   USSTJR.VoiceCommands.registerAction('clearDraft', () => clearDraft());
   */
  function registerAction(name, fn) {
    _registeredActions[name] = fn;
  }

  // ─────────────────────────────────────────
  // COMMAND MATCHING
  // Fuzzy-ish match — handles minor mishears
  // ─────────────────────────────────────────

  function _matchCommand(transcript) {
    const cleaned = transcript.toLowerCase().trim();

    // Exact match first
    if (COMMANDS[cleaned]) return COMMANDS[cleaned];

    // Partial match — command phrase appears within transcript
    for (const [phrase, fn] of Object.entries(COMMANDS)) {
      if (cleaned.includes(phrase)) return fn;
    }

    return null;
  }

  // ─────────────────────────────────────────
  // RECOGNITION ENGINE
  // ─────────────────────────────────────────

  function _buildRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[USS TJR VoiceCommands] Speech Recognition not supported.');
      return null;
    }

    const r          = new SpeechRecognition();
    r.continuous     = true;       // Keep listening
    r.interimResults = false;      // Final results only
    r.lang           = CONFIG.lang;
    r.maxAlternatives = 3;         // Consider top 3 interpretations

    r.onresult = (event) => {
      const results = event.results;
      const latest  = results[results.length - 1];

      if (!latest.isFinal) return;

      // Collect all alternatives
      const transcripts = [];
      for (let i = 0; i < latest.length; i++) {
        if (latest[i].confidence >= CONFIG.confidence) {
          transcripts.push(latest[i].transcript.toLowerCase().trim());
        }
      }

      console.log('[USS TJR VoiceCommands] Heard:', transcripts);

      if (!_awake) {
        // Check all alternatives for wake word
        const woken = transcripts.some(t => t.includes(CONFIG.wakeWord));
        if (woken) _handleWakeWord();
      } else {
        // Check all alternatives for command
        let matched = false;
        for (const t of transcripts) {
          // Strip wake word if repeated
          const cleaned = t.replace(CONFIG.wakeWord, '').trim();
          const fn = _matchCommand(cleaned) || _matchCommand(t);
          if (fn) {
            matched = true;
            _handleCommand(fn, t);
            break;
          }
        }
        if (!matched) {
          _handleNoMatch();
        }
      }
    };

    r.onerror = (event) => {
      // 'no-speech' is expected and not a real error
      if (event.error === 'no-speech') return;
      // 'aborted' happens on clean shutdown
      if (event.error === 'aborted') return;

      console.warn('[USS TJR VoiceCommands] Recognition error:', event.error);

      if (event.error === 'not-allowed') {
        USSTJR.Voice.speak('Microphone access denied, Captain. Please enable microphone permissions.');
        deactivate();
        return;
      }

      // Restart on other errors if still active
      if (_active && !_stopRequested) {
        _safeRestart();
      }
    };

    r.onend = () => {
      // Auto-restart unless we deliberately stopped
      if (_active && !_stopRequested && !_starting) {
        _safeRestart();
      }
    };

    return r;
  }

  function _safeRestart() {
    if (_starting || !_active || _stopRequested) return;
    _starting = true;
    setTimeout(() => {
      if (_active && !_stopRequested) {
        try {
          _recognition.start();
        } catch (e) {
          console.warn('[USS TJR VoiceCommands] Restart error:', e);
        }
      }
      _starting = false;
    }, 300);
  }

  // ─────────────────────────────────────────
  // WAKE WORD HANDLER
  // ─────────────────────────────────────────

  function _handleWakeWord() {
    _awake = true;
    _emit('awake');

    // Acknowledge the Captain
    USSTJR.Voice.speak('Captain.');
    USSTJR.VoiceIndicator.showListening();

    console.log('[USS TJR VoiceCommands] Wake word detected. Awaiting command.');

    // Command window — if no command heard, go back to standby
    clearTimeout(_commandTimer);
    _commandTimer = setTimeout(() => {
      if (_awake) {
        _awake = false;
        USSTJR.Voice.speak('Standing by, Captain.');
        USSTJR.VoiceIndicator.showIdle();
        _emit('standby');
        console.log('[USS TJR VoiceCommands] Command window expired. Returning to standby.');
      }
    }, CONFIG.commandWindowMs);
  }

  // ─────────────────────────────────────────
  // COMMAND HANDLER
  // ─────────────────────────────────────────

  function _handleCommand(fn, transcript) {
    clearTimeout(_commandTimer);
    _awake = false;

    console.log('[USS TJR VoiceCommands] Command matched:', transcript);
    _emit('command', { transcript });

    USSTJR.VoiceIndicator.showSpeaking();

    // Execute the command
    fn();
  }

  function _handleNoMatch() {
    clearTimeout(_commandTimer);
    _awake = false;

    console.log('[USS TJR VoiceCommands] No command matched.');
    _emit('nomatch');

    USSTJR.Voice.speak('Please repeat that, Captain.')
      .then(() => USSTJR.VoiceIndicator.showIdle());
  }

  // ─────────────────────────────────────────
  // EVENT EMITTER
  // ─────────────────────────────────────────

  const _listeners = {};

  function _emit(event, data = {}) {
    if (_listeners[event]) {
      _listeners[event].forEach(fn => fn(data));
    }
  }

  function on(event, fn) {
    if (!_listeners[event]) _listeners[event] = [];
    _listeners[event].push(fn);
  }

  function off(event, fn) {
    if (!_listeners[event]) return;
    _listeners[event] = _listeners[event].filter(f => f !== fn);
  }

  // ─────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────

  /**
   * Activate voice command listening
   * Call this when the user clicks "Activate Voice Control"
   */
  function activate() {
    if (_active) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      USSTJR.Voice.speak(USSTJR.Voice.phrases.notSupported);
      return;
    }

    _stopRequested = false;
    _active        = true;
    _awake         = false;
    _recognition   = _buildRecognition();

    try {
      _recognition.start();
      _starting = false;
      _emit('activated');

      USSTJR.Voice.speak('Voice commands active, Captain. Say Computer to begin.');
      console.log('[USS TJR VoiceCommands] Activated. Listening for wake word.');

    } catch (e) {
      console.error('[USS TJR VoiceCommands] Failed to start:', e);
      _active = false;
    }
  }

  /**
   * Deactivate voice command listening
   */
  function deactivate() {
    if (!_active) return;

    _stopRequested = true;
    _active        = false;
    _awake         = false;

    clearTimeout(_commandTimer);

    if (_recognition) {
      try { _recognition.stop(); } catch (e) { /* silent */ }
      _recognition = null;
    }

    USSTJR.VoiceIndicator.showIdle();
    _emit('deactivated');

    console.log('[USS TJR VoiceCommands] Deactivated.');
  }

  /**
   * Toggle voice commands on/off
   * Useful for a single button
   */
  function toggle() {
    if (_active) {
      USSTJR.Voice.speak('Voice commands deactivated, Captain.')
        .then(() => deactivate());
    } else {
      activate();
    }
  }

  /**
   * Check if voice commands are active
   * @returns {boolean}
   */
  function isActive() {
    return _active;
  }

  /**
   * Add a custom command at runtime
   * @param {string}   phrase - Command phrase (lowercase)
   * @param {function} fn     - Handler function
   *
   * Example:
   *   USSTJR.VoiceCommands.addCommand('run diagnostics', () => runDiagnostics());
   */
  function addCommand(phrase, fn) {
    COMMANDS[phrase.toLowerCase()] = fn;
  }

  /**
   * Get all registered command phrases
   * @returns {string[]}
   */
  function listCommands() {
    return Object.keys(COMMANDS);
  }

  // ─────────────────────────────────────────
  // EXPORTS
  // ─────────────────────────────────────────

  return {
    activate,
    deactivate,
    toggle,
    isActive,
    registerAction,
    addCommand,
    listCommands,
    on,
    off,
  };

})();
