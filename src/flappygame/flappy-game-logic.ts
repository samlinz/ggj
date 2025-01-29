import {
  boxesOverlapWithTolerance,
  ObjectDimensions,
  pixelsMoved,
  randomInt,
} from "util/gamelogic.util";
import { Action, ACTION_UP } from "./flappy-game-actions";
import { ScreenInfo } from "ui/canvas";

type State = "running" | "gameover" | "starting";

export type FlappyBubbleGameWorld = {
  state: State;
  player: ObjectDimensions & {
    velocityY: number;
  };
  boxes: ObjectDimensions[];
  score: number;
  timestamps: {
    nextGameStartAt?: number;
    lastObstacleGenerated: number;
    lastDebug: number;
    lastCollisionCheck: number;
    lastScoreIncrease: number;
  };
  screen: {
    width: number;
    height: number;
  };
  config: {
    gap: number;
    gravity: number;
    jumpSpeed: number;
    obstacleGenerationInterval: number;
    maxFallSpeed: number;
    obstacles: {
      minW: number;
      maxW: number;
      h: number;
    };
    screenSpeed: number;
    debugInterval: number;
    scoreIncreaseInterval: number;
    scoreIncrease: number;
    collisionTolerance: number;
    collisionDetectionInterval: number;
  };
};

export const getFlappyBubbleGameLogic = () => {
  let world: FlappyBubbleGameWorld;

  const fps: number[] = [];
  let fpsAvg = 0;
  let lastUpdate: number = 0;

  const generateObstacleIfNeeded = (time: number) => {
    if (
      time - world.timestamps.lastObstacleGenerated >
      world.config.obstacleGenerationInterval
    ) {
      generateObstacle();
      world.timestamps.lastObstacleGenerated = time;
      world.config.obstacleGenerationInterval = randomInt(1800, 2200);
    }
  };

  const generateObstacle = () => {
    const gap = world.config.gap;
    const halfGap = Math.floor(gap / 2);
    const toleranceFromEdge = 10;
    const gapPosition = randomInt(
      toleranceFromEdge,
      world.screen.height - toleranceFromEdge
    );
    const x = world.screen.width + 10;

    const y1 = gapPosition - halfGap - world.config.obstacles.h;

    const w = randomInt(
      world.config.obstacles.minW,
      world.config.obstacles.maxW
    ); // randomize pipe width

    const upperPart: ObjectDimensions = {
      x: x,
      y: y1,
      width: w,
      height: world.config.obstacles.h,
    };

    const lowerPart: ObjectDimensions = {
      x: x,
      y: gapPosition + halfGap,
      width: w,
      height: world.config.obstacles.h,
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

  const updatePlayer = (delta: number, actions: Action[]) => {
    const player = world.player;

    player.velocityY += world.config.gravity * delta;

    for (const action of actions) {
      if (action.type === ACTION_UP) {
        player.velocityY = world.config.jumpSpeed;
      }
    }

    // cap speed
    if (player.velocityY > world.config.maxFallSpeed) {
      player.velocityY = world.config.maxFallSpeed;
    }

    // player.movement = newPlayerVec;

    // player.x = player.x + player.velocity[0] * delta;
    player.y += player.velocityY * delta;
  };

  const gameOver = (time: number) => {
    world.state = "gameover";
    world.timestamps.nextGameStartAt = time + 3000;
  };

  const checkCollisions = (time: number) => {
    if (
      time - world.timestamps.lastCollisionCheck <
      world.config.collisionDetectionInterval
    ) {
      return;
    }

    world.timestamps.lastCollisionCheck = time;

    const player = world.player;
    for (const box of world.boxes) {
      if (
        boxesOverlapWithTolerance(player, box, world.config.collisionTolerance)
      ) {
        // fatalError("Collision detected");
        gameOver(time);
        // world = null;
        // break;
      }
    }

    // check if player is out of the screen
    if (player.y > world.screen.height + 200) {
      gameOver(time);
    }
  };

  const updateScore = (time: number) => {
    if (
      time - world.timestamps.lastScoreIncrease >
      world.config.scoreIncreaseInterval
    ) {
      world.score += world.config.scoreIncrease;
      world.timestamps.lastScoreIncrease = time;
    }
  };

  const debug = (time: number, delta: number) => {
    const fpsInTime = Math.round(1 / delta);
    fps.push(fpsInTime);

    if (time - world.timestamps.lastDebug > world.config.debugInterval) {
      const sum = fps.reduce((acc, val) => acc + val, 0);
      fpsAvg = Math.round(sum / fps.length);
      fps.length = 0;

      log.debug("Debug info", {
        player: world.player,
        boxes: world.boxes,
        fps: fpsAvg,
      });

      world.timestamps.lastDebug = time;
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
      if (time >= world.timestamps.nextGameStartAt!) {
        init({
          width: world.screen.width,
          height: world.screen.height,
        });
      }
      return;
    }

    const delta = (time - lastUpdate) / 1000;
    lastUpdate = time;

    const screenMovement = pixelsMoved(world.config.screenSpeed, delta);

    updatePlayer(delta, actions);
    generateObstacleIfNeeded(time);
    updateObstacles(screenMovement);
    checkCollisions(time);
    updateScore(time);

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
        width: 50,
        height: 50,
        velocityY: 0,
      },
      boxes: [],
      score: 0,
      timestamps: {
        nextGameStartAt: undefined,
        lastObstacleGenerated: 0,
        lastDebug: 0,
        lastCollisionCheck: 0,
        lastScoreIncrease: 0,
      },
      config: {
        gap: 200,
        gravity: 500,
        jumpSpeed: -300,
        obstacleGenerationInterval: 2000,
        maxFallSpeed: 5000,
        // obstacleW: PIPE_W,
        // obstacleH: PIPE_H,
        obstacles: {
          minW: 50,
          maxW: 200,
          h: 827,
        },
        screenSpeed: 200,
        debugInterval: 1000,
        scoreIncreaseInterval: 1000,
        scoreIncrease: 100,
        collisionTolerance: 30,
        collisionDetectionInterval: 100,
      },
    };
  };

  return {
    init,
    update,
    getWorld: () => world,
    // getFps: () => fps,
  };
};
