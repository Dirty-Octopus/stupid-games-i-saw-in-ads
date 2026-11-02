export interface Localized { zh: string; en: string; }
export interface Credit { role: string; name: string; }
export interface CreditPair { left: Localized; right: Localized; }

const coding: Localized[] = [
  {
    "zh": "程序设计",
    "en": "Programming"
  },
  {
    "zh": "前端开发",
    "en": "Frontend development"
  },
  {
    "zh": "游戏规则实现",
    "en": "Game rules"
  },
  {
    "zh": "状态机实现",
    "en": "State machine"
  },
  {
    "zh": "碰撞检测",
    "en": "Collision detection"
  },
  {
    "zh": "重力计算",
    "en": "Gravity calculations"
  },
  {
    "zh": "苹果接触判定",
    "en": "Apple contact detection"
  },
  {
    "zh": "身体增长逻辑",
    "en": "Body growth"
  },
  {
    "zh": "计分逻辑",
    "en": "Score calculation"
  },
  {
    "zh": "关卡数据实现",
    "en": "Level data"
  },
  {
    "zh": "关卡求解工具",
    "en": "Level solver"
  },
  {
    "zh": "自动化规则测试",
    "en": "Automated rule tests"
  },
  {
    "zh": "键盘输入实现",
    "en": "Keyboard input"
  },
  {
    "zh": "触控输入实现",
    "en": "Touch input"
  },
  {
    "zh": "共享元素过渡实现",
    "en": "Shared element transitions"
  },
  {
    "zh": "弹簧动画实现",
    "en": "Spring animations"
  },
  {
    "zh": "音频播放器实现",
    "en": "Audio player"
  },
  {
    "zh": "数据适配接口实现",
    "en": "Data service adapters"
  },
  {
    "zh": "片尾程序实现",
    "en": "Credits implementation"
  },
  {
    "zh": "响应式样式实现",
    "en": "Responsive styles"
  },
  {
    "zh": "无障碍交互实现",
    "en": "Accessible interactions"
  },
  {
    "zh": "静态构建配置",
    "en": "Static build setup"
  },
  {
    "zh": "路径兼容处理",
    "en": "Subpath support"
  },
  {
    "zh": "调试",
    "en": "Debugging"
  }
];
const facts: Localized[] = [
  {
    "zh": "暨南大学的学习者",
    "en": "Student at Jinan University"
  },
  {
    "zh": "享受空调的人",
    "en": "Enjoys air conditioning"
  },
  {
    "zh": "呼吸氧气的人",
    "en": "Breathes oxygen"
  },
  {
    "zh": "睡觉不拉窗帘的人",
    "en": "Sleeps with the curtains open"
  },
  {
    "zh": "比起营多更喜欢喜达面的人",
    "en": "Prefers Mi Sedaap to Indomie"
  },
  {
    "zh": "总是赶在截止日期之前才写作业的人",
    "en": "Does homework just before the deadline"
  },
  {
    "zh": "喜欢喝人头马优质香槟干邑的人",
    "en": "Enjoys Rémy Martin VSOP"
  },
  {
    "zh": "喜欢写歌的人",
    "en": "Likes writing songs"
  },
  {
    "zh": "喜欢偷懒的人",
    "en": "Likes being lazy"
  },
  {
    "zh": "喜欢躺在床上刷人工智能短剧的人",
    "en": "Watches AI dramas in bed"
  },
  {
    "zh": "喜欢看抽象无厘头视频的人",
    "en": "Enjoys brain rot videos"
  },
  {
    "zh": "不喜欢给手机戴壳的人",
    "en": "Does not like phone cases"
  },
  {
    "zh": "有点爱干净但是懒得整理的人",
    "en": "Likes cleanliness but puts off tidying"
  },
  {
    "zh": "喜欢把瑜伽垫收起来时卷得很小一卷的人",
    "en": "Rolls the yoga mat into a very small roll"
  },
  {
    "zh": "喜欢收集扑克牌的人",
    "en": "Collects playing cards"
  },
  {
    "zh": "有收藏癖的人",
    "en": "Has a collecting habit"
  },
  {
    "zh": "喜欢小米的人",
    "en": "Likes Xiaomi"
  },
  {
    "zh": "喜欢用苹果的人",
    "en": "Likes using Apple products"
  },
  {
    "zh": "喜欢做音效的人",
    "en": "Likes making sound effects"
  },
  {
    "zh": "垃圾总是上课前出门再丢的人",
    "en": "Takes out the rubbish before leaving for class"
  },
  {
    "zh": "开空调的时候喜欢开窗的人",
    "en": "Opens the window with the air conditioning on"
  },
  {
    "zh": "家里放着监控、会看自己三天回放，怕丢东西找不到的人",
    "en": "Reviews three days of home camera footage to find misplaced things"
  },
  {
    "zh": "睡觉时会听白噪音和苹果自带睡眠歌单的人",
    "en": "Sleeps with white noise and the Apple sleep playlist"
  },
  {
    "zh": "没有抱枕睡不着，有抱枕的时候又不抱着的人",
    "en": "Needs a bolster to sleep, then does not hug it"
  },
  {
    "zh": "总是想打碟，但从来没想过认真学的人",
    "en": "Keeps wanting to DJ without ever planning to study it seriously"
  }
];
const departments: Localized[] = [
  {
    "zh": "苹果",
    "en": "Apples"
  },
  {
    "zh": "蛇头",
    "en": "Snake head"
  },
  {
    "zh": "蛇尾",
    "en": "Snake tail"
  },
  {
    "zh": "蛇身",
    "en": "Snake body"
  },
  {
    "zh": "重力",
    "en": "Gravity"
  },
  {
    "zh": "地块",
    "en": "Blocks"
  },
  {
    "zh": "悬崖",
    "en": "Cliffs"
  },
  {
    "zh": "出口",
    "en": "Exit"
  },
  {
    "zh": "按钮",
    "en": "Buttons"
  },
  {
    "zh": "圆角",
    "en": "Round corners"
  },
  {
    "zh": "阴影",
    "en": "Shadows"
  },
  {
    "zh": "开场",
    "en": "Opening"
  },
  {
    "zh": "关卡",
    "en": "Levels"
  },
  {
    "zh": "落地",
    "en": "Landing"
  },
  {
    "zh": "片尾",
    "en": "Credits"
  },
  {
    "zh": "计分",
    "en": "Scores"
  },
  {
    "zh": "方向键",
    "en": "Arrow keys"
  },
  {
    "zh": "空格",
    "en": "Spaces"
  },
  {
    "zh": "手机按钮",
    "en": "Touch buttons"
  },
  {
    "zh": "留白",
    "en": "Empty space"
  }
];
const leftDuties: Localized[] = [
  {
    "zh": "负责把它写进待办",
    "en": "Added it to the to-do list"
  },
  {
    "zh": "给它加了一对括号",
    "en": "Supplied a pair of brackets"
  },
  {
    "zh": "确认它没有少个逗号",
    "en": "Checked for a missing comma"
  },
  {
    "zh": "为它多看了一眼控制台",
    "en": "Looked at the console one more time"
  },
  {
    "zh": "把它从这里挪到那里",
    "en": "Moved it from here to there"
  },
  {
    "zh": "又把它从那里挪回来",
    "en": "Moved it straight back again"
  },
  {
    "zh": "替它数了数像素",
    "en": "Counted the pixels just in case"
  },
  {
    "zh": "给它补上最后一行",
    "en": "Added the final line"
  },
  {
    "zh": "认真考虑了一下命名",
    "en": "Thought about naming it properly"
  },
  {
    "zh": "认为这里还可以再改",
    "en": "Considered one more adjustment"
  },
  {
    "zh": "改完觉得还是刚才好",
    "en": "Preferred the previous version"
  },
  {
    "zh": "把多余的空格删掉",
    "en": "Removed an extra space"
  },
  {
    "zh": "留下一个以后再看的注释",
    "en": "Left a comment for later"
  },
  {
    "zh": "确认它确实还在页面里",
    "en": "Confirmed it was still on the page"
  }
];
const rightDuties: Localized[] = [
  {
    "zh": "负责看一眼再看一眼",
    "en": "Looked at it, then looked again"
  },
  {
    "zh": "觉得可以往左挪一点",
    "en": "Suggested moving it a little left"
  },
  {
    "zh": "觉得还是往右挪一点",
    "en": "Suggested moving it a little right"
  },
  {
    "zh": "表示刚才好像也不错",
    "en": "Thought the previous one looked fine too"
  },
  {
    "zh": "认真听完然后没有补充",
    "en": "Listened and had nothing to add"
  },
  {
    "zh": "决定再试最后一次",
    "en": "Decided on one final attempt"
  },
  {
    "zh": "试完发现还想试一次",
    "en": "Decided on another final attempt"
  },
  {
    "zh": "把这件事记在脑子里",
    "en": "Made a mental note"
  },
  {
    "zh": "想起来的时候再看一下",
    "en": "Remembered to look again later"
  },
  {
    "zh": "负责说这一版先这样",
    "en": "Said this version would do for now"
  },
  {
    "zh": "批准它继续占着这个位置",
    "en": "Allowed it to keep its current spot"
  },
  {
    "zh": "等它结束再做下一件事",
    "en": "Waited for it before doing the next thing"
  },
  {
    "zh": "确认刚才确实点击过了",
    "en": "Confirmed the button had been clicked"
  },
  {
    "zh": "负责看到这一行的人类部分",
    "en": "Handled the human part of reading this line"
  }
];
const opening: Localized[] = [
  {
    "zh": "提出要做这个游戏",
    "en": "Asked for this game"
  },
  {
    "zh": "提供看到的广告",
    "en": "Provided the ad reference"
  },
  {
    "zh": "决定先玩一下",
    "en": "Decided to give it a go"
  },
  {
    "zh": "决定再看一下",
    "en": "Decided to take another look"
  },
  {
    "zh": "确认苹果是苹果",
    "en": "Confirmed an apple was an apple"
  },
  {
    "zh": "确认蛇还是蛇",
    "en": "Confirmed the snake was still a snake"
  },
  {
    "zh": "确认地面在下面",
    "en": "Confirmed the ground was below"
  },
  {
    "zh": "确认出口在那边",
    "en": "Confirmed the exit was over there"
  },
  {
    "zh": "看了看这个按钮",
    "en": "Looked at this button"
  },
  {
    "zh": "又看了看那个按钮",
    "en": "Looked at that other button"
  },
  {
    "zh": "批准一处圆角",
    "en": "Approved one rounded corner"
  },
  {
    "zh": "重新考虑另一处圆角",
    "en": "Reconsidered another rounded corner"
  },
  {
    "zh": "提出一个具体问题",
    "en": "Asked one specific question"
  },
  {
    "zh": "接着提出另一个问题",
    "en": "Then asked another question"
  },
  {
    "zh": "负责决定什么时候算好了",
    "en": "Decided when it was finished"
  },
  {
    "zh": "负责觉得还可以再改改",
    "en": "Thought it could use another pass"
  },
  {
    "zh": "把这一版留在本地",
    "en": "Kept this version local"
  },
  {
    "zh": "保留再改一次的权利",
    "en": "Reserved the right to change it again"
  },
  {
    "zh": "让制作名单变长",
    "en": "Made the credits longer"
  },
  {
    "zh": "让两边一样长",
    "en": "Made both sides equally long"
  },
  {
    "zh": "坚持左边在左边",
    "en": "Kept the left side on the left"
  },
  {
    "zh": "坚持右边在右边",
    "en": "Kept the right side on the right"
  },
  {
    "zh": "提供回车加速这个主意",
    "en": "Suggested the Enter shortcut"
  },
  {
    "zh": "允许这行继续占地方",
    "en": "Allowed this line to take up space"
  }
];
const closing: Localized[] = [
  {
    "zh": "在这一行继续往下写",
    "en": "Continued writing on this line"
  },
  {
    "zh": "这一行也没有新消息",
    "en": "Had no further news on this line"
  },
  {
    "zh": "确认上一行已经过去",
    "en": "Confirmed the previous line had passed"
  },
  {
    "zh": "数了一下剩余行数",
    "en": "Counted the remaining lines"
  },
  {
    "zh": "又数了一下剩余行数",
    "en": "Counted the remaining lines again"
  },
  {
    "zh": "检查这里有没有句号",
    "en": "Checked for a full stop"
  },
  {
    "zh": "把句号留到后面",
    "en": "Saved the full stop for later"
  },
  {
    "zh": "给下一行留出位置",
    "en": "Made room for the next line"
  },
  {
    "zh": "没有把这一行删掉",
    "en": "Did not delete this line"
  },
  {
    "zh": "想了想还是留着",
    "en": "Decided to keep it after all"
  },
  {
    "zh": "为滚动提供更多内容",
    "en": "Supplied more material to scroll"
  },
  {
    "zh": "确认滚动还在继续",
    "en": "Confirmed the scrolling continued"
  },
  {
    "zh": "让这段话再长一点",
    "en": "Made this paragraph a little longer"
  },
  {
    "zh": "认为空白也是内容",
    "en": "Considered blank space to be content"
  },
  {
    "zh": "给空白留了一点空白",
    "en": "Left some space around the space"
  },
  {
    "zh": "没有在这里增加按钮",
    "en": "Did not add a button here"
  },
  {
    "zh": "确认这不是最后一行",
    "en": "Confirmed this was not the last line"
  },
  {
    "zh": "确认下一行也不是",
    "en": "Confirmed the next one was not either"
  },
  {
    "zh": "继续把文字向上搬",
    "en": "Kept moving the words upwards"
  },
  {
    "zh": "又搬上去了一点",
    "en": "Moved them a little further"
  },
  {
    "zh": "让两列一起走",
    "en": "Kept both columns together"
  },
  {
    "zh": "准备结束这一段",
    "en": "Prepared to end this section"
  },
  {
    "zh": "再检查一次左右数量",
    "en": "Checked the column counts again"
  },
  {
    "zh": "最后再数一遍",
    "en": "Counted one final time"
  },
  {
    "zh": "把最后一行写完了",
    "en": "Finished writing the final line"
  }
];

// Personal entries preserve the user's supplied facts; filler describes trivial production tasks.
export const personalFacts = facts.map((fact) => fact.zh);
export const creditPairs: CreditPair[] = [
  ...coding.map((left, i) => ({ left, right: opening[i] })),
  ...departments.flatMap((department) => leftDuties.map((duty, i) => ({
    left: { zh: `${department.zh}：${duty.zh}`, en: `${department.en}: ${duty.en}` },
    right: { zh: `${department.zh}：${rightDuties[i].zh}`, en: `${department.en}: ${rightDuties[i].en}` },
  }))),
  ...closing.map((left, i) => ({ left, right: facts[i] })),
];
// Flat representation for exports and independent content validation.
export const credits: Credit[] = [
  ...creditPairs.map(({ left }) => ({ role: left.zh, name: 'ChatGPT' })),
  ...creditPairs.map(({ right }) => ({ role: right.zh, name: 'Andy Yu' })),
];
