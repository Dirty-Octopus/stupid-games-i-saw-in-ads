const base = `${import.meta.env.BASE_URL}Art/gravity-snake/`;
export const art = {
  body: `${base}snake-body.png`,
  apple: `${base}apple.png`,
  block: `${base}earth-block.png`,
  portal: `${base}portal.png`,
  monster: `${base}monster.png`,
} as const;
