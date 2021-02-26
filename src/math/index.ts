export const add = (...args: number[]) =>
  args.reduce((acc, value) => acc + value, 0);

export const subtract = (a: number, b: number) => a - b;
