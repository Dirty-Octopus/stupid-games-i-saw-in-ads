import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import manifest from '../public/Audio/manifest.json';

test('all enabled sound assets contain valid nonempty PCM data',async()=>{
  assert.equal(manifest.sounds.length,13);
  for(const sound of manifest.sounds){
    assert.equal(sound.ready,true,sound.id);
    const bytes=await readFile(new URL(`../public/Audio/${sound.file}`,import.meta.url));
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WAVE');
    let frames=0,alignment=0;
    for(let at=12;at+8<=bytes.length;){
      const tag=bytes.toString('ascii',at,at+4),size=bytes.readUInt32LE(at+4),start=at+8;
      assert.ok(start+size<=bytes.length,sound.file);
      if(tag==='fmt '){
        assert.ok([1,65534].includes(bytes.readUInt16LE(start)));
        alignment=bytes.readUInt16LE(start+12);
      }
      if(tag==='data')frames=size;
      at=start+size+(size%2);
    }
    assert.ok(alignment>0&&frames>0&&frames%alignment===0,sound.file);
  }
});

test('audio loads once, stops on mute and discards stale queued playback',async()=>{
  let loads=0,decodes=0,starts=0,stops=0;
  const previousFetch=globalThis.fetch;
  const previousContext=globalThis.AudioContext;
  class Context {
    state='running';destination={};
    async decodeAudioData(){decodes++;return {} as AudioBuffer;}
    createBufferSource(){return {connect(){},start(){starts++;},stop(){stops++;},onended:null};}
  }
  globalThis.AudioContext=Context as unknown as typeof AudioContext;
  globalThis.fetch=(async()=>{loads++;return new Response(new Uint8Array([1,2,3]));}) as typeof fetch;
  try{
    const audio=await import('../src/audio/audio');
    await audio.playSound('gravity-snake.move');
    await Promise.all([audio.playSound('gravity-snake.move'),audio.playSound('gravity-snake.move')]);
    assert.equal(loads,13);assert.equal(decodes,13);assert.equal(starts,3);
    audio.setAudioEnabled(false);
    assert.equal(stops,3);
    await audio.playSound('gravity-snake.eat');
    assert.equal(starts,3);
    audio.setAudioEnabled(true);
    const pending=audio.playSound('gravity-snake.eat');
    audio.stopSounds();
    await pending;
    assert.equal(starts,3);
    await audio.playSound('ui.back');
    assert.equal(starts,4);
    assert.equal(loads,13);
    audio.stopSounds();
  }finally{globalThis.fetch=previousFetch;globalThis.AudioContext=previousContext;}
});
