import {Composition,registerRoot} from 'remotion';
import {z} from 'zod';
import {Reference} from './Reference';
import {DURATION,FPS,cues} from './scenarios';
const schema=z.object({cueId:z.string()});
function Root(){return <Composition id="SoundReference" component={Reference} width={1920} height={1080} fps={FPS} durationInFrames={DURATION} schema={schema} defaultProps={{cueId:cues[0].id}}/>;}
registerRoot(Root);
