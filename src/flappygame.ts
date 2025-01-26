import { ScreenInfo } from "canvas";
import { Vec2, vec2Add, vec2Scale } from "vec2";
import { PIPE_H, PIPE_W, PLAYER_H, PLAYER_W } from "gfx";

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

type State = "running" | "gameover" | "starting";

export type FlappyBubbleGameWorld = {
  state: State;
  player: ObjectDimensions & {
    movement: Vec2;
  };
  boxes: ObjectDimensions[];
  gravity: Vec2;
  screen: {
    width: number;
    height: number;
  };
  gap: number;
  maxFallSpeed: number;
  lastObstacleGenerated: number;
  obstacleGenerationInterval: number;
  obstacleW: number;
  obstacleH: number;
  screenSpeed: number;
  lastDebug: number;
  debugInterval: number;
  nextGameStartAt?: number;
  jumpSpeed: number;
  lastCollisionCheck: number;
  collisionTolerance: number;
  collisionDetectionInterval: number;
  lastScoreIncrease: number;
  scoreIncreaseInterval: number;
  scoreIncrease: number;
  score: number;
};

const pixelsMoved = (speed: number, delta: number) => {
  // pixels per second and timedelta as milliseconds
  return speed * delta;
};

const boxesOverlap = (box1: ObjectDimensions, box2: ObjectDimensions) => {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

const boxesOverlapWithTolerance = (
  box1: ObjectDimensions,
  box2: ObjectDimensions,
  tolerance: number = 0
) => {
  return (
    box1.x < box2.x + box2.width - tolerance &&
    box1.x + box1.width > box2.x + tolerance &&
    box1.y < box2.y + box2.height - tolerance &&
    box1.y + box1.height > box2.y + tolerance
  );
};

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getFlappyBubbleGameLogic = () => {
  let world: FlappyBubbleGameWorld;

  let fps = 0;
  let lastUpdate: number = 0;

  const generateObstacleIfNeeded = (time: number) => {
    if (time - world.lastObstacleGenerated > world.obstacleGenerationInterval) {
      generateObstacle();
      world.lastObstacleGenerated = time;
    }
  };

  const generateObstacle = () => {
    const gap = world.gap;
    const halfGap = Math.floor(gap / 2);
    const toleranceFromEdge = 10;
    const gapPosition = randomInt(
      toleranceFromEdge,
      world.screen.height - toleranceFromEdge
    );
    const x = world.screen.width + 10;

    const y1 = gapPosition - halfGap - world.obstacleH;
    // const y2 = gapPosition + halfGap

    const upperPart: ObjectDimensions = {
      x: x,
      y: y1,
      width: world.obstacleW,
      height: world.obstacleH,
    };

    const lowerPart: ObjectDimensions = {
      x: x,
      y: gapPosition + halfGap,
      width: world.obstacleW,
      // height: world.screen.height - gapPosition - halfGap,
      height: world.obstacleH,
    };

    world.boxes.push(upperPart, lowerPart);
  };

  const updateObstacles = (screenMovement: number) => {
    // move obstacles
    for (const box of world.boxes) {
      box.x -= screenMovement;
    }

    // remove obstacles that are out of the screen
    world.boxes = world.boxes.filter((box) => box.x + box.width > 0);
  };

  const updatePlayer = (deltaSeconds: number) => {
    const player = world.player;
    const newPlayerVec = vec2Add(
      player.movement,
      vec2Scale(world.gravity, deltaSeconds)
    );

    // cap speed
    if (newPlayerVec[1] > world.maxFallSpeed) {
      newPlayerVec[1] = world.maxFallSpeed;
    }

    player.movement = newPlayerVec;

    player.x = player.x + player.movement[0];
    player.y = player.y + player.movement[1];
  };

  const gameOver = (time: number) => {
    world.state = "gameover";
    world.nextGameStartAt = time + 3000;
  };

  const checkCollisions = (time: number) => {
    if (time - world.lastCollisionCheck < world.collisionDetectionInterval) {
      return;
    }

    world.lastCollisionCheck = time;

    const player = world.player;
    for (const box of world.boxes) {
      if (boxesOverlapWithTolerance(player, box, world.collisionTolerance)) {
        // fatalError("Collision detected");
        gameOver(time);
        // world = null;
        // break;
      }
    }

    // check if player is out of the screenk
    if (player.y > world.screen.height + 200) {
      gameOver(time);
    }
  };

  const updatePlayerMovement = (actions: Action[]) => {
    for (const action of actions) {
      if (action.type === ACTION_UP) {
        world.player.movement[1] = world.jumpSpeed;
      } else if (action.type === ACTION_DOWN) {
        world.player.movement[1] -= world.jumpSpeed;
      }
    }
  };

  const debug = (time: number, delta: number) => {
    if (time - world.lastDebug > world.debugInterval) {
      fps = Math.round(1000 / delta);
      log.debug("Debug info", {
        player: world.player,
        boxes: world.boxes,
      });
      world.lastDebug = time;
    }
  };

  const update = (time: number, actions: Action[]) => {
    if (!world) return;

    if (world.state === "starting") {
      if (actions.length > 0) {
        world.state = "running";
        lastUpdate = time;
      }
      return;
    }

    if (world.state === "gameover") {
      if (time >= world.nextGameStartAt!) {
        init({
          width: world.screen.width,
          height: world.screen.height,
        });
      }
      return;
    }

    const delta = time - lastUpdate;
    const deltaSeconds = delta / 1000;
    lastUpdate = time;

    const screenMovement = pixelsMoved(world.screenSpeed, deltaSeconds);

    updatePlayerMovement(actions);
    updatePlayer(deltaSeconds);
    generateObstacleIfNeeded(time);
    updateObstacles(screenMovement);
    checkCollisions(time);

    if (time - world.lastScoreIncrease > world.scoreIncreaseInterval) {
      world.score += world.scoreIncrease;
      world.lastScoreIncrease = time;
    }

    debug(time, delta);
  };

  const init = (screenInfo: ScreenInfo) => {
    log.info("Initializing game");

    const screenW = screenInfo.width;
    const screenH = screenInfo.height;

    world = {
      state: "starting",
      screen: {
        width: screenW,
        height: screenH,
      },
      player: {
        x: 100,
        y: 10,
        width: PLAYER_W,
        height: PLAYER_H,
        movement: [0, 0],
      },
      boxes: [],
      // gravity: [0, 9.8],
      gravity: [0, 15],
      gap: 300,
      maxFallSpeed: 50,
      lastObstacleGenerated: 0,
      obstacleGenerationInterval: 2000,
      obstacleW: PIPE_W,
      obstacleH: PIPE_H,
      screenSpeed: 200,
      lastDebug: 0,
      debugInterval: 1000,
      nextGameStartAt: undefined,
      // jumpSpeed: -5,
      jumpSpeed: -20,
      lastCollisionCheck: 0,
      collisionTolerance: 30,
      collisionDetectionInterval: 100,
      lastScoreIncrease: 0,
      scoreIncreaseInterval: 1000,
      scoreIncrease: 100,
      score: 0,
    };
  };

  return {
    init,
    update,
    getWorld: () => world,
    getFps: () => fps,
  };
};
