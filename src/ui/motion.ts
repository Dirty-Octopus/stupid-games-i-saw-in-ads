export const spring = { type: 'spring', stiffness: 370, damping: 27 } as const;
export const softSpring = { type: 'spring', stiffness: 220, damping: 25 } as const;
export const bubbleSpring = { type: 'spring', stiffness: 460, damping: 15 } as const;

// CSS layer tokens mirror these values: board=0, header=10, overlay=20, intro=30.
export const layers = { board: 0, header: 10, overlay: 20, intro: 30 } as const;
