
// Expanded procedural ambience, slower footsteps, phone ring and synthetic horror cues.
export class NightAudio {
 constructor(){this.ctx=null;this.volume=.85;this.active=false;this.travel=0;this.elapsed=0;this.radio=null;this.radioBusy=false;this.nextOdd=22;this.nextRing=8;this.sfx=[];}
 init(){
  if(this.ctx){this.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext; if(!C) return;
  this.ctx=new C(); const c=this.ctx;
  this.master=c.createGain(); this.master.gain.value=this.volume;
  const limiter=c.createDynamicsCompressor(); limiter.threshold.value=-12; limiter.knee.value=12; limiter.ratio.value=5;
  this.master.connect(limiter); limiter.connect(c.destination);
  this.bus=c.createGain(); this.bus.gain.value=0; this.bus.connect(this.master);
  this.noise=c.createBuffer(1,c.sampleRate*4,c.sampleRate); let d=this.noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  this.rain=this.loopNoise('lowpass',1500,.024);
  this.room=this.loopNoise('bandpass',650,.018);
  this.hum=this.loopTone(60,'sine',.038);
  this.hum2=this.loopTone(120,'triangle',.009);
  this.drone=this.loopTone(42,'sine',.016);this.generator=this.loopTone(82,'triangle',0);this.basementAir=this.loopNoise('bandpass',190,0);
  this.ctx.resume();
 }
 loopNoise(type,hz,vol){let c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise;s.loop=true;f.type=type;f.frequency.value=hz;g.gain.value=vol;s.connect(f);f.connect(g);g.connect(this.bus);s.start();g.filter=f;return g;}
 loopTone(hz,type,vol){let c=this.ctx,s=c.createOscillator(),g=c.createGain();s.type=type;s.frequency.value=hz;g.gain.value=vol;s.connect(g);g.connect(this.bus);s.start();return g;}
 setVolume(v){this.volume=v; if(this.ctx) this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.08); if(this.radio) this.radio.volume=v; if(this.call)this.call.volume=v*.55;if(this.officeHum)this.officeHum.volume=v*.40; for(const s of this.sfx){try{s.volume=(s._baseVolume||1)*v}catch{}}}
 pause(active){this.active=active;if(this.officeHum){if(active)this.officeHum.play().catch(()=>{});else this.officeHum.pause();}if(this.call){if(active)this.call.play().catch(()=>{});else this.call.pause();}if(!active){this.steps?.pause();for(const s of this.sfx)s.pause();}else{for(const s of this.sfx)s.play().catch(()=>{});} if(this.ctx) this.bus.gain.setTargetAtTime(active?1:0,this.ctx.currentTime,.14); if(this.radio){if(!active)this.radio.pause(); else this.radio.play().catch(()=>{});}}
 duck(mult=.16){ if(!this.ctx) return; this.bus.gain.setTargetAtTime(this.active?mult:0, this.ctx.currentTime, .08); }
 unduck(){ if(!this.ctx) return; this.bus.gain.setTargetAtTime(this.active?1:0, this.ctx.currentTime, .18); }
 noiseHit(duration,hz,vol,type='bandpass',pan=0){ if(!this.ctx||!this.active)return; const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),p=c.createStereoPanner(); s.buffer=this.noise; f.type=type; f.frequency.value=hz; f.Q.value=.8; p.pan.value=pan; g.gain.setValueAtTime(.001,t); g.gain.exponentialRampToValueAtTime(Math.max(.002,vol),t+.018); g.gain.exponentialRampToValueAtTime(.001,t+duration); s.connect(f); f.connect(g); g.connect(p); p.connect(this.bus); s.start(t,Math.random()*2); s.stop(t+duration+.02); }
 tone(hz,end,duration,vol,type='sine'){ if(!this.ctx||!this.active)return; let c=this.ctx,t=c.currentTime,s=c.createOscillator(),g=c.createGain(); s.type=type; s.frequency.setValueAtTime(hz,t); s.frequency.exponentialRampToValueAtTime(Math.max(1,end),t+duration); g.gain.setValueAtTime(.001,t); g.gain.exponentialRampToValueAtTime(vol,t+.03); g.gain.exponentialRampToValueAtTime(.001,t+duration); s.connect(g); g.connect(this.bus); s.start(); s.stop(t+duration+.02); }
 playClip(n,done){const a=new Audio(import.meta.env.BASE_URL+'audio/monster'+n+(n===7?'-radio':'')+'.mp3');this.radio=a;this.radioBusy=true;this.duck(.15);a.volume=this.volume;let ended=false;const finish=()=>{if(ended)return;ended=true;this.radio=null;this.radioBusy=false;this.unduck();done?.();};a.onended=finish;a.onerror=finish;a.play().catch(finish);}
 setOfficeHum(on){if(!on){if(this.officeHum){this.officeHum.pause();this.officeHum=null;}return;}if(this.officeHum)return;const a=new Audio(import.meta.env.BASE_URL+'audio/office-hum.mp3');a.loop=true;a.volume=this.volume*.40;this.officeHum=a;if(this.active)a.play().catch(()=>{});}
 stopFile(a){if(!a)return;a.pause();this.sfx=this.sfx.filter(s=>s!==a);}
 footstep(){}
 playFile(src,baseVolume=1,playbackRate=1){const a=new Audio(import.meta.env.BASE_URL+'audio/'+src);a._baseVolume=baseVolume;a.volume=baseVolume*this.volume;a.playbackRate=playbackRate;this.sfx.push(a);const rm=()=>{this.sfx=this.sfx.filter(x=>x!==a)};a.onended=rm;a.onerror=rm;a.play().catch(rm);return a;}
 updateSteps(moving,inside){if(!this.steps){this.steps=new Audio(import.meta.env.BASE_URL+'audio/steps.mp3');this.steps.loop=true;this.steps.playbackRate=.72;}this.steps.volume=this.volume*(inside?.42:.54);if(moving&&!this.radioBusy&&this.active){if(this.steps.paused)this.steps.play().catch(()=>{});}else this.steps.pause();}
 ringPhone(){ if(!this.ctx||!this.active) return; this.tone(1150,1150,.12,.08,'sine'); this.tone(730,730,.12,.05,'sine'); }
 knock(){ this.noiseHit(.22,260,.18,'bandpass',0); this.noiseHit(.22,260,.16,'bandpass',-.1); }
 event(name){switch(name){
  case 'door': this.noiseHit(.62,650,.42,'bandpass'); this.tone(160,80,.52,.14,'triangle'); this.noiseHit(.08,2500,.09); break;
  case 'scan': this.playFile('scan.mp3',.90); break;
  case 'pin': this.playFile('pin.mp3',.85); break;
  case 'cash': this.tone(1120,980,.16,.12,'sine'); this.noiseHit(.1,2100,.09); break;
  case 'journal': this.noiseHit(.26,1700,.1,'bandpass'); break;
  case 'switch': this.playFile('light-switch.mp3',.9,1); break;
  case 'blackout': this.playFile('power-down.mp3',.95,1); this.tone(90,40,.6,.08,'triangle'); break;
  case 'power': this.playFile('breaker-turn.mp3',.95,1); this.tone(62,130,.5,.08,'triangle'); break;
  case 'arrival': this.noiseHit(.6,220,.12,'bandpass'); this.tone(74,38,1.9,.04); break;
  case 'radioPing': this.tone(780,760,.13,.05,'triangle'); this.noiseHit(.18,1800,.05); break;
  case 'flash': this.noiseHit(.06,3100,.05,'bandpass'); break;
  case 'phone': this.ringPhone(); break;
  case 'knock': this.playFile('knock.mp3',.95,1); break;
  case 'cooler': this.noiseHit(.32,700,.18,'bandpass'); this.tone(110,70,.38,.05,'triangle'); break;
  default: this.noiseHit(.12,1000,.07); }}
 setRadioCall(on){if(!on){if(this.call){this.call.pause();this.call=null;}return;}if(this.call)return;this.call=new Audio(import.meta.env.BASE_URL+'audio/radio-call.mp3');this.call.loop=true;this.call.volume=this.volume*.55;if(this.active)this.call.play().catch(()=>{});}
 playRadio(n,onDone,onError){this.setRadioCall(false); if(this.radio) return; this.radioBusy=true; const finish=(ok)=>{ this.radio=null; this.radioBusy=false; this.unduck(); if(ok){ onDone?.(); } else onError?.(); };
  const play=(src,next)=>{ const a=new Audio(import.meta.env.BASE_URL+'audio/'+src); this.radio=a; a.volume=this.volume; a.onended=()=>{ if(this.radio!==a) return; this.radio=null; next(); }; a.onerror=()=>{ if(this.radio===a) finish(false); }; this.duck(.14); if(this.active) a.play().catch(()=>{ if(this.radio===a&&this.active) finish(false); }); };
  play('radio-on.mp3',()=>play('dispatch'+n+'-radio.mp3',()=>play('radio-end.mp3',()=>finish(true))));
 }
 tick(dt,inside,power,distance,stage,inLower=false){
  if(!this.ctx||!this.active)return; let t=this.ctx.currentTime;
  this.generator.gain.setTargetAtTime(inLower&&stage>=25?.024:0,t,.4);this.basementAir.gain.setTargetAtTime(inLower?.026:0,t,.4);
  this.rain.gain.setTargetAtTime((inLower?.0005:inside?.0038:.018)*(this.radioBusy?.22:1),t,.35);
  this.rain.filter.frequency.setTargetAtTime(inside?330:1500,t,.25);
  this.room.gain.setTargetAtTime((inside&&power?.012:.001)*(this.radioBusy?.22:1),t,.3);
  this.hum.gain.setTargetAtTime((inside&&power?.02:.001)*(this.radioBusy?.22:1),t,.25);
  this.hum2.gain.setTargetAtTime((inside&&power?.005:.001)*(this.radioBusy?.22:1),t,.25);
  this.drone.gain.setTargetAtTime((stage>=3?.02:.008)*(this.radioBusy?.18:1),t,.45);
  this.updateSteps(distance>.001,inside);this.travel+=distance;
  const stepDist=inside?.55:.62;
  if(!this.radioBusy&&this.travel>stepDist){ this.travel%=stepDist; this.footstep(inside?'tile':'asphalt'); }
  this.elapsed+=dt;
  if(this.elapsed>this.nextOdd && stage>=2 && !this.radioBusy){ this.nextOdd=this.elapsed+18+Math.random()*20; this.noiseHit(.7,230,.05,'bandpass',Math.random()*1.4-.7); this.tone(70,42,1.8,.022); }
 }
}
