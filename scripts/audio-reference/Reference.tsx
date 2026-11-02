import {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {SnakeEyes} from '../../src/games/gravity-snake/SnakeEyes';
import type {Cell} from '../../src/games/gravity-snake/core/types';
import {cues, DURATION, FPS, timecode, type Cue} from './scenarios';

const files = ['snake-body','apple','earth-block','portal','monster'];
const art = (name:string) => staticFile(`Art/gravity-snake/${name}.png`);
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const mix = (a:number,b:number,t:number)=>a+(b-a)*t;
function GameReplay({cue,frame}:{cue:Cue;frame:number}) {
  let index=-1;
  cue.frames.forEach((f,i)=>{if(f.at<=frame) index=i;});
  const active=cue.frames[index];
  const previous=index>0?cue.frames[index-1].state:cue.initial;
  const state=active?.state??cue.initial;
  const nextAt=cue.frames[index+1]?.at??((active?.at??0)+7);
  const t=active?interpolate(frame,[active.at,Math.max(active.at+1,nextAt)],[0,1],clamp):1;
  const eased=1-Math.pow(1-t,3);
  const body=state.snake.map((cell,i)=>{
    const from=previous.snake[i]??previous.snake.at(-1)??cell;
    return {x:mix(from.x,cell.x,eased),y:mix(from.y,cell.y,eased)};
  });
  const all=[...cue.initial.snake,...cue.frames.flatMap(f=>f.state.snake)];
  const chase=!!cue.level.chase;
  const minX=Math.min(...all.map(p=>p.x))-(chase?5.5:0),maxX=Math.max(...all.map(p=>p.x));
  const minY=Math.min(...all.map(p=>p.y)),maxY=Math.max(...all.map(p=>p.y));
  const height=Math.max(7,maxY-minY+4,(maxX-minX+4)*9/16),width=height*16/9;
  const x=Math.max(chase?-6:0,Math.min(cue.level.width-width,(minX+maxX+1-width)/2));
  const y=Math.min(cue.level.height-height+0.6,Math.max(0,(minY+maxY+1-height)/2));
  const head=body[0],neck=body[1];
  const angle=head&&neck?Math.atan2(head.y-neck.y,head.x-neck.x)*180/Math.PI:0;
  const since=frame-cue.start;
  const blocked=cue.id.endsWith('blocked')&&since>=0&&since<10?Math.sin(since*2.4)*.07:0;
  const biteAction=chase&&since>=0&&since<24;
  const lunge=biteAction?Math.sin(since/24*Math.PI)*.8:0;
  const tail=cue.initial.snake.at(-1)!;
  const failed=state.status==='dead',won=state.status==='won';
  return <svg viewBox={`${x} ${y} ${width} ${height}`} width="100%" height="100%" style={{background:'#182921'}}>
    <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="#d4e4c2" strokeOpacity=".055" strokeWidth=".015"/></pattern></defs>
    <rect x={x} y={y} width={width} height={height} fill="url(#grid)"/>
    {cue.level.terrain.map(p=><image key={`${p.x},${p.y}`} href={art('earth-block')} x={p.x-.065} y={p.y-.065} width="1.13" height="1.13"/>)}
    <image href={art('portal')} x={cue.level.exit.x-.14} y={cue.level.exit.y-.14} width="1.28" height="1.28"/>
    {state.apples.map(p=><image key={`${p.x},${p.y}`} href={art('apple')} x={p.x+.06} y={p.y+.06} width=".88" height=".88"/>)}
    {chase&&<image href={art('monster')} x={tail.x-5.7+lunge} y={tail.y-2.4} width="5.9" height="3.7"/>}
    <g transform={`translate(${blocked} 0)`}>
      {body.length>1&&<path d={body.map((p,i)=>`${i?'L':'M'}${p.x+.5} ${p.y+.5}`).join(' ')} stroke="#8db93d" fill="none" strokeWidth=".59" strokeLinecap="round" strokeLinejoin="round"/>}
      {[...body].reverse().map((p,r)=>{const i=body.length-1-r;return <g key={i} transform={`translate(${p.x} ${p.y})`}><image href={art('snake-body')} x="-.055" y="-.055" width="1.11" height="1.11"/>{i===0&&<SnakeEyes angle={angle}/>}</g>;})}
    </g>
    {cue.id.endsWith('eat')&&since>=0&&since<18&&head&&<circle cx={head.x+.5} cy={head.y+.5} r={.5+since*.06} fill="none" stroke="#ffdc74" strokeWidth=".05" opacity={1-since/18}/>}
    {(failed||won)&&<g opacity={interpolate(since,[4,20],[0,1],clamp)}><rect x={x} y={y} width={width} height={height} fill="#121c18" opacity=".8"/><text x={x+width/2} y={y+height*.44} fill={failed?'#ffaea2':'#d4ec88'} fontSize="1.2" textAnchor="middle" fontWeight="800">{failed?':(':'过关了'}</text><text x={x+width/2} y={y+height*.63} fill="#f8f6e8" fontSize=".5" textAnchor="middle">{failed?'尾巴没了':`这次吃了 ${state.collected} 颗，拿到 ${state.score} 分。`}</text></g>}
  </svg>;
}
function Scene({cue,frame}:{cue:Cue;frame:number}) {
  if(cue.kind==='game') return <GameReplay cue={cue} frame={frame}/>;
  if(cue.kind==='ending') {
    const since=frame-cue.start;
    return <AbsoluteFill style={{background:'#15251d',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:64,fontWeight:850,textAlign:'center',color:'#e7eead',opacity:interpolate(since,[30,66],[0,1],clamp),transform:`translateY(${interpolate(since,[30,66],[25,0],clamp)}px)`}}>:)<br/>感谢你游玩<br/>这个傻X游戏</div>
      <AbsoluteFill style={{background:'#fffde9',opacity:since<0?0:interpolate(since,[0,72],[.85,0],clamp)}}/>
      {since<0&&<div style={{fontSize:42,color:'#adbea5'}}>最后一关通关 · 即将进入片尾</div>}
    </AbsoluteFill>;
  }
  const back=cue.kind==='back';const since=frame-cue.start;
  const progress=interpolate(since,[0,15],[0,1],clamp);
  return <AbsoluteFill>
    <Img src={staticFile(`ui/${back?'game':'home'}.png`)} style={{width:'100%',height:'100%'}}/>
    <Img src={staticFile(`ui/${back?'home':'game'}.png`)} style={{position:'absolute',width:'100%',height:'100%',opacity:progress,transform:`translateY(${(1-progress)*16}px)`}}/>
    {since>=-35&&since<15&&<div style={{position:'absolute',left:back?'7%':'67.8%',top:back?'20%':'84.9%',width:46,height:46,border:'5px solid #ffe28a',borderRadius:'50%',transform:`translate(-50%,-50%) scale(${since<0?1:1+since/15})`,opacity:since<0?1:1-since/15,boxShadow:'0 0 0 7px #15251daa'}}/>}
  </AbsoluteFill>;
}
export function Reference({cueId}:{cueId:string}) {
  const frame=useCurrentFrame();const cue=cues.find(c=>c.id===cueId)!;
  const [handle]=useState(()=>delayRender('Loading reference artwork'));
  useEffect(()=>{const urls=[...files.map(art),...['home','game'].map(n=>staticFile(`ui/${n}.png`))];Promise.all(urls.map(url=>new Promise<void>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve();img.onerror=()=>reject(new Error(url));img.src=url;}))).then(()=>continueRender(handle));},[handle]);
  const active=frame>=cue.start&&frame<cue.end;
  const phase=frame<cue.start?'准备 · 等待触发':active?'音效区间':'已到建议结束点';
  const marker=(n:number)=>`${n/(DURATION-1)*100}%`;
  return <AbsoluteFill style={{background:'#0f1915',color:'#f0f2df',fontFamily:'PingFang SC, Arial, sans-serif',padding:64}}>
    <div style={{display:'flex',alignItems:'baseline',gap:30,height:110}}><span style={{fontSize:52,fontWeight:800}}>{cue.title}</span><span style={{fontSize:25,color:'#a6b59e',fontFamily:'monospace'}}>{cue.wav}</span><span style={{marginLeft:'auto',fontSize:23,color:'#a6b59e'}}>音效制作参考 · 60 帧/秒</span></div>
    <div style={{display:'flex',gap:40}}>
      <div style={{width:1200}}><div style={{position:'relative',width:1200,height:675,borderRadius:26,overflow:'hidden',border:'1px solid #425044'}}><Scene cue={cue} frame={frame}/></div><div style={{fontSize:24,color:'#b9c8aa',padding:'20px 0'}}>{cue.action}</div></div>
      <div style={{flex:1,paddingTop:10}}>
        <div style={{fontSize:26,color:active?'#c6ed83':'#bdc7b5',background:active?'#354b25':'#223127',borderRadius:16,padding:'16px 20px',marginBottom:26}}>{phase}</div>
        <div style={{fontSize:27,lineHeight:1.65,minHeight:150}}>{cue.purpose}</div>
        <div style={{borderTop:'1px solid #40513f',paddingTop:25,marginTop:10}}>
          {[['音效起点',cue.start,'#c6ed83'],['建议结束',cue.end,'#ffc995']].map(([label,n,color])=><div key={label} style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:22}}><span style={{fontSize:27,color:String(color)}}>{label}</span><span style={{fontSize:31,fontFamily:'monospace'}}>{timecode(Number(n))}</span></div>)}
          <div style={{fontSize:22,color:'#aebda4',marginTop:30,lineHeight:1.7}}>建议长度 {((cue.end-cue.start)/FPS).toFixed(3)} 秒<br/>{cue.note}</div>
        </div>
      </div>
    </div>
    <div style={{position:'absolute',left:64,right:64,bottom:48,height:112}}>
      <div style={{fontSize:24,display:'flex',justifyContent:'space-between',color:'#afbea7',marginBottom:16}}><span>片段时间轴</span><span style={{fontFamily:'monospace',color:'#eff4df'}}>{timecode(frame)}</span><span>00:00:06:00</span></div>
      <div style={{height:24,background:'#2c3c30',borderRadius:7,position:'relative'}}>
        <div style={{position:'absolute',height:'100%',left:marker(cue.start),width:`${(cue.end-cue.start)/(DURATION-1)*100}%`,background:'#a8ce70'}}/>
        {[cue.start,cue.end].map((n,i)=><div key={n} style={{position:'absolute',left:marker(n),top:-7,height:38,width:3,background:i?'#ffc995':'#d5ff9d'}}/>)}
        <div style={{position:'absolute',left:marker(frame),top:-9,height:42,width:4,background:'#fff',boxShadow:'0 0 8px #fff7'}}/>
      </div>
      <div style={{position:'relative',fontSize:21,marginTop:12}}><span style={{position:'absolute',right:`${100-cue.start/(DURATION-1)*100}%`,paddingRight:12,color:'#c6ed83'}}>起点 {timecode(cue.start)}</span><span style={{position:'absolute',left:marker(cue.end),paddingLeft:12,color:'#ffc995'}}>建议结束 {timecode(cue.end)}</span></div>
    </div>
  </AbsoluteFill>;
}
