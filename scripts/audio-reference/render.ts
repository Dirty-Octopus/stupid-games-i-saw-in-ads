import {bundle} from '@remotion/bundler';
import {openBrowser,renderStill,renderMedia,selectComposition} from '@remotion/renderer';
import {mkdir,cp,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
import {cues,FPS,DURATION,timecode} from './scenarios';
const root=path.resolve('production/audio-reference');
const mode=process.argv.includes('--stills')?'stills':'movies';
await mkdir(path.join(root,'assets'),{recursive:true});
await cp('public/Art',path.join(root,'assets/Art'),{recursive:true});
for(const name of ['home','game']) await access(path.join(root,`assets/ui/${name}.png`)).catch(()=>{throw new Error(`Missing local UI capture assets/ui/${name}.png. See scripts/audio-reference/README.md.`);});
const serveUrl=await bundle({entryPoint:path.resolve('scripts/audio-reference/index.tsx'),outDir:path.join(root,'bundle'),publicDir:path.join(root,'assets'),onProgress:()=>{}});
const browser=await openBrowser('chrome');
try {
  for(const cue of cues) {
    const inputProps={cueId:cue.id};
    const composition=await selectComposition({serveUrl,id:'SoundReference',inputProps,puppeteerInstance:browser});
    if(mode==='stills') {
      const folder=path.join(root,'stills');await mkdir(folder,{recursive:true});
      for(const frame of [0,cue.start,cue.end,DURATION-1]) await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,frame,output:path.join(folder,`${cue.id}-${frame}.png`)});
      console.log(`STILLS ${cue.id}`);
    } else {
      const outputLocation=path.join(root,'mp4',cue.wav.replace(/\.wav$/,'.mp4'));
      await mkdir(path.dirname(outputLocation),{recursive:true});
      let last=0;
      await renderMedia({serveUrl,composition,inputProps,puppeteerInstance:browser,codec:'h264',pixelFormat:'yuv420p',crf:18,x264Preset:'fast',concurrency:4,muted:true,outputLocation,onProgress:({progress})=>{const percent=Math.floor(progress*100);if(percent>=last+25){last=percent;console.log(`${cue.id} ${percent}%`);}}});
      console.log(`MP4 ${outputLocation}`);
    }
  }
} finally {await browser.close({silent:true});}
const sheet=cues.map(c=>({id:c.id,wav:c.wav,video:`mp4/${c.wav.replace(/\.wav$/,'.mp4')}`,title:c.title,purpose:c.purpose,startFrame:c.start,endFrame:c.end,startTimecode:timecode(c.start),endTimecode:timecode(c.end),startSeconds:c.start/FPS,endSeconds:c.end/FPS,durationSeconds:(c.end-c.start)/FPS,fps:FPS,note:c.note}));
await writeFile(path.join(root,'cue-sheet.json'),JSON.stringify(sheet,null,2)+'\n');
await writeFile(path.join(root,'cue-sheet.csv'),'\uFEFF'+['音效,对应WAV,起点时间码,建议结束时间码,建议长度秒,触发用途',...sheet.map(c=>[c.title,c.wav,c.startTimecode,c.endTimecode,c.durationSeconds.toFixed(3),c.purpose].join(','))].join('\n')+'\n');
await writeFile(path.join(root,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>音效制作参考</title><style>body{max-width:1200px;margin:50px auto;background:#14231b;color:#e8efd7;font:18px/1.6 system-ui;padding:0 24px}article{margin:42px 0}video{width:100%;border-radius:18px}code{color:#c4e48e}a{color:#e9c995}</style><h1>音效制作参考 · 13 个片段</h1><p>1920 × 1080 / 60 帧每秒 / 每片 6 秒 / 无音轨。所有音效起点统一位于 00:00:02:00。橙色结束点是建议尾音，可按听感调整。游戏片段使用真实关卡规则重放；界面片段以本地页面截图呈现。</p><p>只制作起点到建议结束点之间的声音，导出 WAV 时不要保留前面的 2 秒预留。使用下方对应文件名替换 public/Audio 内占位文件。</p><p><a href="cue-sheet.csv">时间码表 CSV</a> · <a href="cue-sheet.json">时间码表 JSON</a></p>${sheet.map(c=>`<article><h2>${c.title}</h2><p><code>${c.wav}</code> · ${c.startTimecode} → ${c.endTimecode} · ${c.durationSeconds.toFixed(3)} 秒</p><video controls preload="metadata" src="${c.video}"></video><p>${c.purpose}</p></article>`).join('')}</html>`);
console.log(`Reference index: ${path.join(root,'index.html')}`);
