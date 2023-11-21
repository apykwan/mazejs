// https://brm.io/matter-js/docs/
import { Engine, Render, Runner, World, Bodies } from 'matter-js'; 

import { Grid } from './types';

const width = 600;
const height = 600;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine,
  options: {
    wireframes: true,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(),engine);

// Walls
// Bodieds.Rectangle(x, y, width, height, [options])
const walls = [
  Bodies.rectangle(width/2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width/2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height/2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, width/2, 40, height, { isStatic: true }),
];

World.add(world, walls);


// Maze Generation

const grid: Grid = Array(3)
  .fill(null)
  .map(() => Array(3).fill(false));

const verticals: Grid = Array(3)
  .fill(null)
  .map(() => Array(2).fill(false));

const horizontals: Grid = Array(2)
  .fill(null)
  .map(() => Array(3).fill(false));

console.log(grid)
console.log(horizontals)
console.log(verticals)
