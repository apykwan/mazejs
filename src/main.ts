// https://brm.io/matter-js/docs/
import { Engine, Render, Runner, World, Bodies, Body, Events } from 'matter-js'; 

import { Grid, NeighborsCoord } from './types';
import './index.css';

const cellsHorizontal: number = 14;
const cellsVertical = 10;
const width: number = window.innerWidth;
const height: number = window.innerHeight;

const unitLengthX: number = width / cellsHorizontal;
const unitLengthY: number = height / cellsVertical;

const engine = Engine.create();
engine.gravity.y = 0;

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
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);


// Maze Generation
const shuffle = (arr: NeighborsCoord): NeighborsCoord => {
  let counter: number = arr.length;

  while (counter > 0) {
    const index: number = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid: Grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals: Grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals: Grid = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow: number = Math.floor(Math.random() * cellsVertical);
const startColumn: number = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row: number, column: number): void => {
  // If I have visited the cell at [row, column], then return
  if (grid[row][column]) return;

  // Mark this cell as being visisted
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors: NeighborsCoord = shuffle([
    [row -1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);

  // For each neighbor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if that neighbor is out of bounds
    if (
      nextRow < 0 || 
      nextRow >= cellsVertical || 
      nextColumn < 0 || 
      nextColumn >= cellsHorizontal
    ) continue;

    // If we have visted that neighbor, contiune to next neighbor
    if (grid[nextRow][nextColumn]) continue;

    // Remove a wall from either horizontal or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
}; 

stepThroughCell(startRow, startColumn);

horizontals.forEach((row: boolean[], rowIndex: number) => {
  row.forEach((open: boolean, columnIndex: number) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: { fillStyle: 'red'}
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row: boolean[], rowIndex: number) => {
  row.forEach((open: boolean, columnIndex: number) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: { fillStyle: 'red'}
      }
    );
    World.add(world, wall);
  });
});

// Goal

const goal = Bodies.rectangle(
  width - unitLengthX /2,
  height - unitLengthY / 2,
  unitLengthX * .7,
  unitLengthY * .7,
  {
    label: 'goal',
    isStatic: true, 
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  {
    label: 'ball',
    render: { fillStyle: 'blue'}
  }
);
World.add(world, ball);

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const { x, y } = ball.velocity;
  if ((event.key === 'w' || event.key === 'ArrowUp') && y > -10)  {
    Body.setVelocity(ball, { x, y: y - 5 })
  }
  if ((event.key === 'd' || event.key === 'ArrowRight') && x < 10) {
    Body.setVelocity(ball, { x: x + 5, y })
  }
  if ((event.key === 's' || event.key === 'ArrowDown') && y < 10) {
    Body.setVelocity(ball, { x, y: y + 5 })
  }
  if ((event.key === 'a' || event.key === 'ArrowLeft') && x > -10) {
    Body.setVelocity(ball, { x: x - 5, y })
  }
});

// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach(collision => {
    const labels: [string, string] = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
     ) {
      document.querySelector('.winner')?.classList.remove('hidden');
      engine.gravity.y =1
      world.bodies.forEach(body => {
        if (body.label === 'wall') Body.setStatic(body, false);
      });
     }
  });
});