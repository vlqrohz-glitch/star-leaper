/**
 * AudioSystem.js - Centralized Audio Controller for Star-Leaper: Orion Odyssey
 * Manages sound effects, music states, volume controls, procedural Web Audio synthesis,
 * and graceful fallback without owning any gameplay state.
 */

import { AUDIO_CONFIG, AUDIO_KEYS, MUSIC_STATES } from '../config/audioConfig.js';

export class AudioSystem {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.masterVolume = AUDIO_CONFIG.MASTER_VOLUME;
    this.sfxVolume = AUDIO_CONFIG.SFX_VOLUME;
    this.musicVolume = AUDIO_CONFIG.MUSIC_VOLUME;
    this.muted = false;

    this.currentMusicKey = null;
    this.musicLoopTimer = null;
    this.activeNodes = new Set();

    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
  }

  /**
   * Initializes audio context and gain nodes
   * @param {Phaser.Scene} scene
   */
  initialize(scene) {
    this.scene = scene || this.scene;
    this.initWebAudio();
  }

  /**
   * Safely initializes the browser Web Audio context
   */
  initWebAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.updateGainLevels();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      // Graceful fallback for non-audio environments
      this.ctx = null;
    }
  }

  /**
   * Ensures AudioContext is resumed upon user gesture
   */
  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  updateGainLevels() {
    if (!this.masterGain || !this.sfxGain || !this.musicGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.masterVolume, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    this.musicGain.gain.setValueAtTime(this.musicVolume, now);
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateGainLevels();
  }

  /**
   * Plays a sound effect by logical key
   * @param {string} key
   */
  playSFX(key) {
    if (this.muted) return;
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      switch (key) {
        case AUDIO_KEYS.UI_START:
          this.synthesizeChime([440, 660, 880], 0.08, 0.25);
          break;

        case AUDIO_KEYS.UI_NAV:
          this.synthesizeChime([880], 0.03, 0.04, 'sine');
          break;

        case AUDIO_KEYS.UI_CONFIRM:
          this.synthesizeChime([520, 784], 0.06, 0.15, 'sine');
          break;

        case AUDIO_KEYS.UI_PAUSE:
          this.synthesizeFrequencySweep(550, 220, 0.12, 'sine');
          break;

        case AUDIO_KEYS.LAUNCH_PAD:
          this.synthesizeFrequencySweep(220, 680, 0.18, 'sine');
          break;

        case AUDIO_KEYS.HAZARD_HIT:
          this.synthesizeFrequencySweep(180, 80, 0.14, 'sawtooth');
          break;

        case AUDIO_KEYS.CRYSTAL_COLLECT:
          this.synthesizeChime([1200, 1800], 0.04, 0.18, 'sine');
          break;

        case AUDIO_KEYS.ENEMY_DEFEAT:
          this.synthesizeFrequencySweep(280, 60, 0.15, 'triangle');
          break;

        case AUDIO_KEYS.PLAYER_DAMAGE:
          this.synthesizeFrequencySweep(160, 70, 0.12, 'sawtooth');
          break;

        case AUDIO_KEYS.PLAYER_DEATH:
          this.synthesizeFrequencySweep(420, 50, 0.35, 'sawtooth');
          break;

        case AUDIO_KEYS.PLAYER_RESPAWN:
          this.synthesizeFrequencySweep(180, 540, 0.25, 'sine');
          break;

        case AUDIO_KEYS.POWERUP_COLLECT:
          this.synthesizeChime([587.33, 880], 0.06, 0.22, 'sine');
          break;

        case AUDIO_KEYS.POWERUP_ACTIVATE:
          this.synthesizeChime([440, 660, 880, 1100], 0.05, 0.35, 'triangle');
          break;

        case AUDIO_KEYS.POWERUP_EXPIRE:
          this.synthesizeFrequencySweep(520, 180, 0.25, 'sine');
          break;

        case AUDIO_KEYS.PLAYER_DOUBLE_JUMP:
          this.synthesizeChime([520, 780, 1040], 0.035, 0.14, 'sine');
          break;

        case AUDIO_KEYS.GOAL_REACHED:
          this.synthesizeChime([523.25, 659.25, 783.99], 0.08, 0.4, 'sine');
          break;

        case AUDIO_KEYS.LEVEL_COMPLETE:
          this.synthesizeChime([523.25, 659.25, 783.99, 1046.50], 0.09, 0.6, 'triangle');
          break;

        case AUDIO_KEYS.GAME_OVER:
          this.synthesizeChime([220, 164.81, 110], 0.15, 0.5, 'sawtooth');
          break;

        case AUDIO_KEYS.SHOP_BUY:
          this.synthesizeChime([880, 1108.73, 1318.51, 1760], 0.05, 0.35, 'triangle');
          break;

        case AUDIO_KEYS.SHOP_EQUIP:
          this.synthesizeChime([587.33, 880, 1174.66], 0.04, 0.22, 'sine');
          break;

        case AUDIO_KEYS.SHOP_ERROR:
          this.synthesizeFrequencySweep(140, 75, 0.18, 'sawtooth');
          break;

        default:
          break;
      }
    } catch (e) {
      // Gracefully prevent unhandled audio errors
    }
  }

  /**
   * Synthesizes a chord or multi-frequency tone
   */
  synthesizeChime(freqs, staggerSec = 0.05, durationSec = 0.3, type = 'sine') {
    if (!this.ctx || !this.sfxGain) return;
    const startTime = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const noteStart = startTime + idx * staggerSec;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.3, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + durationSec);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteStart);
      osc.stop(noteStart + durationSec);

      this.trackNode(osc);
    });
  }

  /**
   * Synthesizes a downward or upward frequency sweep
   */
  synthesizeFrequencySweep(startFreq, endFreq, durationSec = 0.2, type = 'sine') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + durationSec);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + durationSec);

    this.trackNode(osc);
  }

  /**
   * Plays music state, preventing duplicates and stopping prior track
   * @param {string} key
   */
  playMusic(key) {
    if (this.currentMusicKey === key) return; // Prevent duplicate instances

    this.stopMusic();
    this.currentMusicKey = key;
    this.resumeContext();

    if (!this.ctx || !this.musicGain || this.muted) return;

    try {
      this.startMusicPattern(key);
    } catch (e) {
      // Graceful error isolation
    }
  }

  /**
   * Procedural ambient/electronic music synthesizer for selected music state
   * @param {string} key
   */
  startMusicPattern(key) {
    if (this.musicLoopTimer) {
      clearInterval(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }

    if (key === MUSIC_STATES.GAMEPLAY_MUSIC) {
      this.startDaftPunkTechnoTrack();
    } else if (key === MUSIC_STATES.TITLE_MUSIC) {
      this.startTitleSynthTrack();
    } else if (key === MUSIC_STATES.GAME_OVER_MUSIC) {
      this.startGameOverSynthTrack();
    } else if (key === MUSIC_STATES.COMPLETION_MUSIC) {
      this.startCompletionSynthTrack();
    }
  }

  /**
   * Intense Daft Punk Techno-Pop Electronic Soundtrack
   * 124 BPM 16-step multi-voice synthesizer:
   * 4-on-the-floor punchy kick, crisp offbeat hi-hat, resonant French-touch electro bassline, and shimmering disco synth arpeggios.
   */
  startDaftPunkTechnoTrack() {
    const stepIntervalMs = 121; // ~124 BPM sixteenth-note grid
    let step = 0;

    // 2-Bar (32-step) Bassline pattern in D Minor with classic octave jumps
    const bassPattern = [
      // Bar 1: Driving D-minor bounce
      73.42, 0, 146.83, 73.42, 73.42, 0, 87.31, 98.00,
      110.00, 0, 146.83, 73.42, 98.00, 87.31, 73.42, 146.83,
      // Bar 2: Funk transition through C, Bb, A
      65.41, 0, 130.81, 65.41, 58.27, 0, 116.54, 58.27,
      55.00, 0, 110.00, 55.00, 65.41, 73.42, 87.31, 98.00
    ];

    // Shimmering Synth Arpeggio / Disco Stabs (16th-note melodic counterpoint)
    const arpPattern = [
      // Bar 1:
      293.66, 349.23, 440.00, 587.33, 349.23, 440.00, 523.25, 440.00,
      293.66, 349.23, 440.00, 659.25, 587.33, 523.25, 440.00, 349.23,
      // Bar 2:
      261.63, 329.63, 392.00, 523.25, 233.08, 293.66, 349.23, 466.16,
      220.00, 277.18, 329.63, 440.00, 261.63, 293.66, 349.23, 440.00
    ];

    const playStep = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.currentMusicKey !== MUSIC_STATES.GAMEPLAY_MUSIC) return;

      try {
        const now = this.ctx.currentTime;
        const currentStep = step % 32;
        const beatStep = step % 4; // 0, 1, 2, 3 within a beat

        // 1. PUNCHY 4-ON-THE-FLOOR TECHNO KICK (Every quarter note: beatStep === 0)
        if (beatStep === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();

          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(140, now);
          kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

          kickGain.gain.setValueAtTime(0.28, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

          kickOsc.connect(kickGain);
          kickGain.connect(this.musicGain);

          kickOsc.start(now);
          kickOsc.stop(now + 0.11);
          this.trackNode(kickOsc);
        }

        // 2. CRISP TECHNO HI-HAT (Off-beats: beatStep === 2, with syncopated ghost hits)
        if (beatStep === 2 || (step % 2 === 1 && currentStep % 8 === 7)) {
          const hatOsc = this.ctx.createOscillator();
          const hatGain = this.ctx.createGain();
          const hatFilter = this.ctx.createBiquadFilter();

          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(7200 + (Math.random() * 800), now);

          hatFilter.type = 'highpass';
          hatFilter.frequency.setValueAtTime(6000, now);

          const hatVol = beatStep === 2 ? 0.07 : 0.03;
          hatGain.gain.setValueAtTime(hatVol, now);
          hatGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.035);

          hatOsc.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(this.musicGain);

          hatOsc.start(now);
          hatOsc.stop(now + 0.04);
          this.trackNode(hatOsc);
        }

        // 3. DAFT PUNK FRENCH ELECTRO BASSLINE (Resonant lowpass swept sawtooth)
        const bassNote = bassPattern[currentStep];
        if (bassNote > 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFilter = this.ctx.createBiquadFilter();

          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassNote, now);

          bassFilter.type = 'lowpass';
          bassFilter.Q.setValueAtTime(6.5, now); // French touch resonance
          bassFilter.frequency.setValueAtTime(1200, now);
          bassFilter.frequency.exponentialRampToValueAtTime(220, now + 0.11);

          bassGain.gain.setValueAtTime(0.18, now);
          bassGain.gain.exponentialRampToValueAtTime(0.005, now + 0.115);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.musicGain);

          bassOsc.start(now);
          bassOsc.stop(now + 0.12);
          this.trackNode(bassOsc);
        }

        // 4. SHIMMERING TECHNO-POP ARPEGGIO LEAD
        const arpNote = arpPattern[currentStep];
        if (arpNote > 0 && (currentStep % 2 === 0 || currentStep % 4 === 1)) {
          const arpOsc = this.ctx.createOscillator();
          const arpGain = this.ctx.createGain();
          const arpFilter = this.ctx.createBiquadFilter();

          arpOsc.type = 'sawtooth';
          arpOsc.frequency.setValueAtTime(arpNote, now);

          arpFilter.type = 'bandpass';
          arpFilter.Q.setValueAtTime(3.0, now);
          // Modulate filter cutoff across steps for classic Daft Punk phaser/wah effect
          const filterSweep = 1200 + Math.sin(step * 0.4) * 600;
          arpFilter.frequency.setValueAtTime(filterSweep, now);

          arpGain.gain.setValueAtTime(0.065, now);
          arpGain.gain.exponentialRampToValueAtTime(0.002, now + 0.10);

          arpOsc.connect(arpFilter);
          arpFilter.connect(arpGain);
          arpGain.connect(this.musicGain);

          arpOsc.start(now);
          arpOsc.stop(now + 0.11);
          this.trackNode(arpOsc);
        }

        step++;
      } catch (e) {
        // Safe fallback
      }
    };

    playStep();
    this.musicLoopTimer = setInterval(playStep, stepIntervalMs);
  }

  /**
   * Futuristic atmospheric synth track for Title screen
   */
  startTitleSynthTrack() {
    const stepIntervalMs = 280;
    const chords = [
      [110, 164.81, 220],
      [110, 164.81, 261.63],
      [98, 146.83, 220],
      [87.31, 130.81, 196]
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.currentMusicKey !== MUSIC_STATES.TITLE_MUSIC) return;
      try {
        const now = this.ctx.currentTime;
        const chord = chords[chordIdx % chords.length];

        chord.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = i === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, now);

          gain.gain.setValueAtTime(0.08 / chord.length, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (stepIntervalMs / 1000) * 0.95);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain);

          osc.start(now);
          osc.stop(now + (stepIntervalMs / 1000));
          this.trackNode(osc);
        });

        chordIdx++;
      } catch (e) {}
    };

    playChord();
    this.musicLoopTimer = setInterval(playChord, stepIntervalMs);
  }

  /**
   * Game Over descending motif
   */
  startGameOverSynthTrack() {
    const stepIntervalMs = 450;
    const notes = [130.81, 110, 98, 73.42];
    let idx = 0;

    const playNext = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.currentMusicKey !== MUSIC_STATES.GAME_OVER_MUSIC) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(notes[idx % notes.length], now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.42);
        this.trackNode(osc);
        idx++;
      } catch (e) {}
    };

    playNext();
    this.musicLoopTimer = setInterval(playNext, stepIntervalMs);
  }

  /**
   * Level completion upbeat synth track
   */
  startCompletionSynthTrack() {
    const stepIntervalMs = 150;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63];
    let idx = 0;

    const playNext = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.currentMusicKey !== MUSIC_STATES.COMPLETION_MUSIC) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(notes[idx % notes.length], now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 0.15);
        this.trackNode(osc);
        idx++;
      } catch (e) {}
    };

    playNext();
    this.musicLoopTimer = setInterval(playNext, stepIntervalMs);
  }

  /**
   * Tracks an active Web Audio oscillator node
   */
  trackNode(node) {
    this.activeNodes.add(node);
    node.onended = () => {
      this.activeNodes.delete(node);
    };
  }

  /**
   * Stops currently playing music state
   */
  stopMusic() {
    if (this.musicLoopTimer) {
      clearInterval(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }
    this.currentMusicKey = null;
  }

  /**
   * Sets master volume level [0.0 - 1.0]
   * @param {number} value
   */
  setMasterVolume(value) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    this.updateGainLevels();
  }

  /**
   * Sets SFX volume level [0.0 - 1.0]
   * @param {number} value
   */
  setSFXVolume(value) {
    this.sfxVolume = Math.max(0, Math.min(1, value));
    this.updateGainLevels();
  }

  /**
   * Sets Music volume level [0.0 - 1.0]
   * @param {number} value
   */
  setMusicVolume(value) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    this.updateGainLevels();
  }

  /**
   * Toggles audio mute state
   * @returns {boolean}
   */
  toggleMute() {
    this.muted = !this.muted;
    this.updateGainLevels();
    return this.muted;
  }

  /**
   * Checks if audio is currently muted
   * @returns {boolean}
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Fully resets audio state (clears timers, stops music)
   */
  reset() {
    this.stopMusic();
    this.activeNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
    });
    this.activeNodes.clear();
  }
}
