/* bg_music.js — carga un MP3 externo como música de fondo y lo enruta
   por el mismo masterGain que los SFX, así el slider de volumen y el mute
   funcionan igual. */
(function(){
  const MP3_PATH = '/senagol/static/description/bg_music.mp3';
  let audioCtx = null;
  let masterGain = null;
  let sourceNode = null;
  let audioEl = null;
  let musicPlaying = false;

  function ensureAudio(){
    if(audioEl) return;
    audioEl = new Audio(MP3_PATH);
    audioEl.loop = true;
    audioEl.preload = 'auto';
    audioEl.volume = 0;
    // Reproducir en cuando haya un gesto del usuario (para respetar autoplay policy).
    document.addEventListener('pointerdown', () => {
      if(audioEl && audioEl.paused) audioEl.play().catch(()=>{});
    }, {once:true});
  }

  function getActx(){
    if(!audioCtx){
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioCtx.destination);
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  window.setExternalMusicVolume = function(val/* 0-100 */){
    ensureAudio();
    const ctx = getActx();
    if(!sourceNode){
      try{
        sourceNode = ctx.createMediaElementSource(audioEl);
        sourceNode.connect(masterGain);
      }catch(e){ return; }
    }
    masterGain.gain.setTargetAtTime(val/100, ctx.currentTime, 0.05);
  };
  window.muteExternalMusic = function(muted){
    if(!masterGain || !audioCtx) return;
    const current = parseFloat(masterGain.gain.value);
    const target = muted ? 0 : (window.externalMusicLevel || 0.55);
    masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
  };
  window.startExternalMusic = function(){
    ensureAudio();
    const lvl = window.externalMusicLevel || 0.55;
    setExternalMusicVolume(lvl);
    if(audioEl && audioEl.paused) audioEl.play().catch(()=>{});
    musicPlaying = true;
  };
  window.stopExternalMusic = function(){
    if(audioEl){ audioEl.pause(); }
    musicPlaying = false;
  };
})();
