import { Vec2, vec2Add, vec2Scale } from "vec2";

export const ACTION_UP = "up";
export const ACTION_LEFT = "left";
export const ACTION_RIGHT = "right";
export const ACTION_DOWN = "down";

export type ActionUp = {
  type: typeof ACTION_UP;
};

export type ActionLeft = {
  type: typeof ACTION_LEFT;
};

export type ActionRight = {
  type: typeof ACTION_RIGHT;
};

export type ActionDown = {
  type: typeof ACTION_DOWN;
};

export type Action = ActionUp | ActionLeft | ActionRight | ActionDown;

export type ObjectDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GameWorld = {
  player: ObjectDimensions & {
    // direction: number;
    movement: Vec2;
    // speed: number;
  };
  boxes: ObjectDimensions[];
  gravity: Vec2;
};

const pixelsMoved = (speed: number, delta: number) => {
  // pixels per second and timedelta as milliseconds
  return (speed * delta) / 1000;
};

const boxesOverlap = (box1: ObjectDimensions, box2: ObjectDimensions) => {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

export const getGameLogic = () => {
  let world: GameWorld;

  const setWorld = (newWorld: GameWorld) => {
    world = newWorld;
  };

  let fps = 0;
  let lastUpdate: number = 0;

  const updatePhysics = (deltaSeconds: number) => {
    const player = world.player;
    const newPlayerVec = vec2Add(
      player.movement,
      vec2Scale(world.gravity, deltaSeconds)
    );

    // cap speed
    const maxFallSpeed = 20;
    if (newPlayerVec[1] > maxFallSpeed) newPlayerVec[1] = maxFallSpeed;

    player.movement = newPlayerVec;

    player.x = player.x + player.movement[0];
    player.y = player.y + player.movement[1];
  };

  const updatePlayerMovement = (actions: Action[]) => {
    for (const action of actions) {
      if (action.type === ACTION_UP) {
        log.debug("Jump");
        world.player.movement[1] = -5;
      }

      if (action.type === ACTION_RIGHT) {
        world.player.movement[0] += 5;
      }

      //   if (action.type === ACTION_DOWN) {
      //     // world.player.direction = 3;
      //     world.player.movement[0] = 50;
      //   }

      if (action.type === ACTION_LEFT) {
        // world.player.direction = 4;
        world.player.movement[0] -= 5;
      }
    }
  };
  //   const updatePlayer = (delta: number) => {
  //     const player = world!.player;

  //     const movement = pixelsMoved(player.speed, delta);
  //     if (player.direction === 1) {
  //       player.y -= movement;
  //     } else if (player.direction === 2) {
  //       player.x += movement;
  //     } else if (player.direction === 3) {
  //       player.y += movement;
  //     } else if (player.direction === 4) {
  //       player.x -= movement;
  //     }
  //   };

  const update = (time: number, actions: Action[]) => {
    if (!world) return;

    const delta = time - lastUpdate;
    const deltaSeconds = delta / 1000;
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

    // updatePlayer(delta);
    updatePlayerMovement(actions);
    updatePhysics(deltaSeconds);
    // console.log(delta);

    fps = Math.round(1000 / delta);
  };

  return {
    setWorld,
    update,
    getWorld: () => world,
    getFps: () => fps,
    // getDebugInfo: () => ({
    //   player: world.player.movement,
    // }),
  };
};
