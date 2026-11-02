import manifest from '../../public/Audio/manifest.json';

const sounds = new Map(manifest.sounds.map((sound) => [sound.id, sound]));
const decoded = new Map<string, Promise<AudioBuffer>>();
const active = new Set<AudioBufferSourceNode>();
let context: AudioContext | undefined;
let enabled = true;
let generation = 0;

/** Cancel playing and pending sounds when muting, restarting or leaving a screen. */
export function stopSounds() {
  generation++;
  for (const source of active) source.stop();
  active.clear();
}
export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) stopSounds();
}

function loadSound(id: string): Promise<AudioBuffer> {
  let pending = decoded.get(id);
  if (!pending) {
    const sound = sounds.get(id)!;
    const audioContext = context!;
    pending = fetch(`${import.meta.env?.BASE_URL ?? './'}Audio/${sound.file}`)
      .then(response => {
        if (!response.ok) throw new Error(`Audio request failed: ${sound.file}`);
        return response.arrayBuffer();
      })
      .then(bytes => audioContext.decodeAudioData(bytes))
      .catch(error => { decoded.delete(id); throw error; });
    decoded.set(id, pending);
  }
  return pending;
}

export async function unlockAudio() {
  if (!enabled || !manifest.sounds.some(sound => sound.ready)) return;
  try {
    if (!context) {
      context = new AudioContext();
      // Fetch and decode once after a user gesture; subsequent actions start from memory.
      for (const sound of manifest.sounds) if (sound.ready) void loadSound(sound.id).catch(() => {});
    }
    if (context.state === 'suspended') await context.resume();
  } catch { /* Audio availability never blocks the game. */ }
}

export async function playSound(id: string) {
  const sound = sounds.get(id);
  if (!enabled || !sound?.ready) return;
  const token = generation;
  await unlockAudio();
  if (!context || context.state !== 'running') return;
  try {
    const buffer = await loadSound(id);
    if (!enabled || token !== generation) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = sound.loop;
    source.connect(context.destination);
    source.onended = () => active.delete(source);
    active.add(source);
    source.start();
  } catch { /* Failed requests or decoding never interrupt play. */ }
}
