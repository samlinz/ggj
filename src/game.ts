import {
  Action,
  ACTION_DOWN,
  ACTION_LEFT,
  ACTION_RIGHT,
  ACTION_UP,
} from "./input";

export type ObjectDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GameWorld = {
  player: ObjectDimensions & {
    direction: number;
    speed: number;
  };
  boxes: ObjectDimensions[];
};

const pixelsMoved = (speed: number, delta: number) => {
  // pixels per second and timedelta as milliseconds
  return (speed * delta) / 1000;
};

export const getGameLogic = () => {
  let world: GameWorld | undefined = undefined;

  const setWorld = (newWorld: GameWorld) => {
    world = newWorld;
  };

  let fps = 0;
  let lastUpdate: number = 0;

  const updatePlayer = (delta: number) => {
    const player = world!.player;

    const movement = pixelsMoved(player.speed, delta);
    if (player.direction === 1) {
      player.y -= movement;
    } else if (player.direction === 2) {
      player.x += movement;
    } else if (player.direction === 3) {
      player.y += movement;
    } else if (player.direction === 4) {
      player.x -= movement;
    }
  };

  const update = (time: number, actions: Action[]) => {
    if (!world) return;

    const delta = time - lastUpdate;
    lastUpdate = time;
    // const deltaTime = currentTime - lastTime;
    // lastTime = currentTime;

    // // Accumulate time for fixed game updates
    // accumulatedTime += deltaTime;

    // // Update game logic in fixed time steps
    // while (accumulatedTime >= timeStep) {
    //   gameUpdate(timeStep); // Use a fixed time step for consistent updates
    //   accumulatedTime -= timeStep;
    // }

    for (const action of actions) {
      if (action.type === ACTION_UP) {
        world.player.direction = 1;
      }

      if (action.type === ACTION_RIGHT) {
        world.player.direction = 2;
      }

      if (action.type === ACTION_DOWN) {
        world.player.direction = 3;
      }

      if (action.type === ACTION_LEFT) {
        world.player.direction = 4;
      }
    }

    updatePlayer(delta);
    // console.log(delta);

    fps = Math.round(1000 / delta);
  };

  return {
    setWorld,
    update,
    getWorld: () => world,
    getFps: () => fps,
  };
};
