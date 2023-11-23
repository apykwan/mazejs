// https://brm.io/matter-js/docs/
import { Engine, Render, Runner, World, Bodies, Body } from 'matter-js'; 

import { Grid, NeighborsCoord } from './types';

const cells: number = 10;
const width: number = 600;
const height: number = 600;

const unitLength: number = width / cells;

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
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
  Bodies.rectangle(width, width / 2, 5, height, { isStatic: true }),
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

const grid: Grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals: Grid = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals: Grid = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow: number = Math.floor(Math.random() * cells);
const startColumn: number = Math.floor(Math.random() * cells);

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
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) continue;

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

  // Visit that next cell
}; 

stepThroughCell(startRow, startColumn);
horizontals.forEach((row: boolean[], rowIndex: number) => {
  row.forEach((open: boolean, columnIndex: number) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      10,
      {
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row: boolean[], rowIndex: number) => {
  row.forEach((open: boolean, columnIndex: number) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      10,
      unitLength,
      {
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

const goal = Bodies.rectangle(
  width - unitLength /2,
  height - unitLength / 2,
  unitLength * .7,
  unitLength * .7,
  {
    isStatic: true
  }
);
World.add(world, goal);

// Ball
const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength / 4
);
World.add(world, ball);

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const { x, y } = ball.velocity;
  if (event.key === 'w' || event.key === 'ArrowUp')  {
    Body.setVelocity(ball, { x, y: y - 5 })
  }
  if (event.key === 'd' || event.key === 'ArrowRight') {
    Body.setVelocity(ball, { x: x + 5, y })
  }
  if (event.key === 's' || event.key === 'ArrowDown') {
    Body.setVelocity(ball, { x, y: y + 5 })
  }
  if (event.key === 'a' || event.key === 'ArrowLeft') {
    Body.setVelocity(ball, { x: x - 5, y })
  }
});