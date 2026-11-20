export const FREE_ITEM_CAP = 20;

export function atFreeCap(activeCount: number, isPlus: boolean): boolean {
  return !isPlus && activeCount >= FREE_ITEM_CAP;
}
