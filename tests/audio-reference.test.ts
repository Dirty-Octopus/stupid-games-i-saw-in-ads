import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../public/Audio/manifest.json';
import {cues,DURATION,FPS,START} from '../scripts/audio-reference/scenarios';
test('each requested audio asset has one valid, aligned reference clip',()=>{
  assert.deepEqual(cues.map(c=>c.id),manifest.sounds.map(s=>s.id));
  assert.equal(new Set(cues.map(c=>c.wav)).size,13);
  for(const cue of cues){
    assert.equal(cue.start,START);
    assert.ok(cue.end>cue.start&&cue.end<DURATION, cue.id);
    assert.ok(cue.frames.every(f=>f.at>=0&&f.at<DURATION),cue.id);
    if(cue.kind==='game') {
      const event=cue.id.replace('gravity-snake.','');
      const target=cue.frames.find(f=>f.events.includes(event));
      assert.ok(target,`${cue.id} must contain its actual rule event`);
      assert.equal(target.at,START,`${cue.id} event must meet the start marker`);
    }
  }
  assert.equal(DURATION/FPS,6);
});
