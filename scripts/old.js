/*
   0     1     2     3     4     5     6     7     8     9     10   
 0 walk  walk  walk  walk  walk  walk  walk  walk  walk  walk  slide
 1 slide slide slide slide slide slide slide slide slide run   run
 2 run   run   run   run   run   run   jump   jump  jump jump  jump
 3 jump  jump  jump  idle  idle  idle  idle  idle  idle  idle  idle 
 4 idle  idle  fall  fall  fall  fall  fall  fall  fall  fall  

 walk: 10
 slide: 10
 run: 8
 jump: 8
 idle: 10
 fall: 8

*/

class Character {
  static img;
  static defaultImgSrc = "../assets/dog-sprites.png";
  static width = 200;
  static height = 176;
  static actions = createEnum(["fall", "idle", "jump", "run", "slide", "walk"]);

  static spriteMap = {
    numColumns: 11,
    numRows: 5,
    width: 2200,
    height: 880,
    fall: {
      count: 8,
      start: { row: 4, column: 2 },
      end: { row: 4, column: 9 },
      speed: 8,
    },
    idle: {
      count: 10,
      start: { row: 3, column: 3 },
      end: { row: 4, column: 1 },
      speed: 0,
    },
    jump: {
      count: 8,
      start: { row: 2, column: 6 },
      end: { row: 3, column: 2 },
      speed: 8,
    },
    run: {
      count: 8,
      start: { row: 1, column: 9 },
      end: { row: 2, column: 5 },
      speed: 10,
    },
    slide: {
      count: 10,
      start: { row: 0, column: 10 },
      end: { row: 1, column: 8 },
      speed: 8,
    },
    walk: {
      count: 10,
      start: { row: 0, column: 0 },
      end: { row: 0, column: 9 },
      speed: 4,
    },
  };

  constructor(
    action = Character.actions.idle,
    scale = 1,
    position = { x: 0, y: 40 }
  ) {
    if (Character.img === undefined) Character.loadImg();
    this.currentFrame = 0;
    this.currentRow = Character.spriteMap[action].start.row;
    this.currentColumn = Character.spriteMap[action].start.column;
    this.x = position.x;
    this.y = position.y;
    this.baselineY = position.y;
    this.action = action;
    this.scale = scale;
    this.doneJumping = false;
  }

  updateSpriteLocation() {
    this.currentFrame++;

    if (this.currentFrame >= Character.spriteMap[this.action].count) {
      this.currentFrame = 0;
      this.currentColumn = Character.spriteMap[this.action].start.column;
      this.currentRow = Character.spriteMap[this.action].start.row;
    } else {
      this.currentColumn++;
      if (this.currentColumn >= Character.spriteMap.numColumns) {
        // console.log("column overflow, move to next row");
        this.currentColumn = 0;
        this.currentRow++;
      }
    }
    // console.log(`update for action ${this.action}`);
  }

  static loadImg() {
    Character.img = new Image();
    Character.img.src = Character.defaultImgSrc;
  }

  draw() {
    if (
      this.action === Character.actions.jump ||
      this.action === Character.actions.fall
    )
      console.log(
        `draw() ${this.action} frame: ${this.currentFrame} x: ${this.x} y: ${this.y}`
      );

    ctx.drawImage(
      Character.img,
      this.currentColumn * Character.width,
      this.currentRow * Character.height,
      Character.width,
      Character.height,
      this.x,
      this.y + this.height,
      Character.width * this.scale,
      Character.height * this.scale
    );
  }

  changeAction(action) {
    this.action = action;
    this.currentFrame = 0;
    this.currentRow = Character.spriteMap[action].start.row;
    this.currentColumn = Character.spriteMap[action].start.column;
  }

  update() {
    // console.log(`x, y: ${x}, ${y}`);
    // if (x > Character.spriteMap.width) console.log("error width overflow");
    // check if jumping
    if (
      this.action === Character.actions.jump ||
      this.action === Character.actions.fall
    ) {
      if (this.doneJumping && this.currentFrame === 0) {
        this.doneJumping = false;
        if (this.action === Character.actions.jump) {
          this.y = -100;
          this.changeAction(Character.actions.fall);
          console.log("switch to fall");
        } else {
          this.changeAction(Character.actions.idle);
          this.y = this.baselineY;
          console.log("switch to idle");
        }
      }
      if (this.action === Character.actions.jump) {
        this.y = (this.currentFrame / Character.spriteMap.jump.count) * -100;
      } else if (this.action === Character.actions.fall) {
        this.y =
          -100 + (this.currentFrame / Character.spriteMap.jump.count) * 100;
      }

      if (this.currentFrame === 7) {
        console.log(`done jumping`);
        this.doneJumping = true;
      }
    }

    this.updateSpriteLocation();
    //TODO: adjust speed based on scale?
    this.x += Character.spriteMap[this.action].speed;
    // this.x += Character.width * 0.4;
    if (this.x > parseInt(canvas.width)) {
      this.x = 0 - Character.width * this.scale;
    }
    console.log(
      `update() ${this.action} - currentFrame: ${this.currentFrame} row, column: ${this.currentRow}, ${this.currentColumn}`
    );
    // console.log(`canvas: ${this.x}, ${this.y} width: ${canvas.width}`);
  }
}

function createEnum(values) {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}

// get context from canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("touchmove", (e) => {
  console.log(e);
});

canvas.width = window.innerWidth;
canvas.height = 300;
let test = new Character(Character.actions.idle);

let gameFrame = 0;
const staggerFrames = 5;

function animate() {
  ctx.fillStyle = "#202a44";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  test.draw();
  if (gameFrame % staggerFrames === 0) {
    test.update();
  }
  gameFrame++;
  requestAnimationFrame(animate);
}
// animate();

function xanimate() {
  // ctx.fillStyle = "#202a44";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  test.draw();
  test.update();
}

document.addEventListener("keypress", (e) => {
  if (e.code === "Space") {
    if (
      test.action !== Character.actions.jump &&
      test.action !== Character.actions.fall
    ) {
      test.changeAction(Character.actions.jump);
      console.log("change to jump");
    }
  } else xanimate();
  // console.log(e);
});

// for (let i = 0; i < 12; i++) {
//   xanimate();
// }

// let limit = 10;
// for (let i = 0; i < 20; i++) {
//   test.getNextFrame();
// }
