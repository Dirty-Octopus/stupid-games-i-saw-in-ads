import test from 'node:test';
import assert from 'node:assert/strict';
import {canMove,createState,hasLegalMove,step} from '../src/games/gravity-snake/core/engine';
import type {Level} from '../src/games/gravity-snake/core/types';
const floor=Array.from({length:9},(_,x)=>({x,y:8}));
const corridor:Level={id:'dead-end',version:1,name:'',hint:'',width:9,height:10,
  snake:[{x:3,y:7},{x:2,y:7}],apples:[{x:4,y:7}],exit:{x:8,y:7},solution:[],
  terrain:[...floor,{x:4,y:6},{x:5,y:7}]};
test('entering a dead end fails immediately, preserving the meal and emitting one death',()=>{
  const before=createState(corridor);
  assert.equal(before.status,'playing');
  const result=step(corridor,before,'right');
  assert.equal(result.state.deathCause,'trapped');
  assert.equal(result.state.status,'dead');
  assert.equal(result.state.score,15);
  assert.equal(result.state.collected,1);
  assert.equal(result.frames.flatMap(f=>f.events).filter(e=>e==='die').length,1);
  assert.equal(step(corridor,result.state,'up').frames.length,0);
  assert.equal(before.status,'playing');
});
test('an initially enclosed snake is dead without waiting for input',()=>{
  const level={...corridor,snake:[{x:4,y:7},{x:3,y:7}],apples:[]};
  assert.equal(createState(level).deathCause,'trapped');
});
test('an exit wins even when there is no subsequent move',()=>{
  const level={...corridor,exit:{x:4,y:7}};
  const result=step(level,createState(level),'right');
  assert.equal(result.state.status,'won');
  assert.equal(result.frames.some(f=>f.events.includes('die')),false);
});
test('a vacating tail remains a legal escape; the neck never is',()=>{
  const level={...corridor,apples:[],terrain:[...floor,{x:5,y:7}]};
  const state={...createState(level),snake:[{x:4,y:7},{x:4,y:6},{x:3,y:6},{x:3,y:7}]};
  assert.equal(canMove(level,state,'up'),false);
  assert.equal(canMove(level,state,'left'),true);
  assert.equal(hasLegalMove(level,state),true);
  assert.equal(step(level,state,'left').state.status,'playing');
});
test('an enclosed intermediate falling frame is not judged before gravity settles',()=>{
  const level={...corridor,apples:[],snake:[{x:4,y:3},{x:4,y:4},{x:5,y:4},{x:6,y:4}],
    terrain:[...floor,{x:6,y:5},{x:4,y:1},{x:3,y:2},{x:5,y:2}]};
  const result=step(level,createState(level),'up');
  assert.equal(hasLegalMove(level,result.frames[0].state),false);
  assert.ok(result.frames.some(f=>f.events.includes('land')));
  assert.equal(result.state.status,'playing');
  assert.equal(result.frames.some(f=>f.events.includes('die')),false);
});
test('a direction that leads to a fall is still a movement option',()=>{
  const level={...corridor,apples:[],terrain:[{x:2,y:8},{x:3,y:6}]};
  const state=createState(level);
  assert.equal(state.status,'playing');
  assert.equal(canMove(level,state,'right'),true);
  assert.equal(step(level,state,'right').state.deathCause,'fall');
});
