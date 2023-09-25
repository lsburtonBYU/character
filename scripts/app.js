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
  static defaultImgSrc = "./assets/dog-sprites.png";
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
      speed: 15,
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
    this.setAction(action);
    this.x = position.x;
    this.y = position.y;
    this.baselineY = position.y;
    this.scale = scale;
    this.prevAction = Character.actions.idle;
  }

  setAction(action) {
    this.action = action;
    this.currentFrame = 0;
    this.currentRow = Character.spriteMap[action].start.row;
    this.currentColumn = Character.spriteMap[action].start.column;
    if (action === Character.actions.jump) {
      this.speed += Character.spriteMap.jump.speed;
    } else if (action === Character.actions.slide) {
      this.speed += Character.spriteMap[action].speed;
    } else if (action !== Character.actions.fall) {
      this.speed = Character.spriteMap[action].speed;
    }
  }

  setSpriteLocation() {
    if (this.currentFrame >= Character.spriteMap[this.action].count) {
      this.currentFrame = 0;
      this.currentColumn = Character.spriteMap[this.action].start.column;
      this.currentRow = Character.spriteMap[this.action].start.row;
    } else {
      if (this.currentColumn >= Character.spriteMap.numColumns) {
        this.currentColumn = 0;
        this.currentRow++;
      }
    }
  }

  static loadImg() {
    Character.img = new Image();
    Character.img.src = Character.defaultImgSrc;
  }

  draw() {
    // console.log(
    //   `draw() ${this.action} ${this.currentFrame} / x,y: ${this.x}, ${this.y} / column,row: ${this.currentColumn}, ${this.currentRow}`
    // );

    ctx.drawImage(
      Character.img,
      this.currentColumn * Character.width,
      this.currentRow * Character.height,
      Character.width,
      Character.height,
      this.x,
      this.y,
      Character.width * this.scale,
      Character.height * this.scale
    );
  }

  update() {
    this.currentFrame++;

    //process jump and fall animations
    if (
      this.action === Character.actions.jump ||
      this.action === Character.actions.fall
    ) {
      // all frames shown
      if (this.currentFrame >= Character.spriteMap[this.action].count) {
        if (this.action === Character.actions.jump) {
          // done jumping
          this.setAction(Character.actions.fall);
        } else {
          // done falling
          this.setAction(this.prevAction);
        }
        // adjust y position
      } else {
        if (this.action === Character.actions.jump) {
          this.y = this.y - (this.currentFrame * Character.height) / 100;
        } else {
          this.y = this.y + (this.currentFrame * Character.height) / 100;
        }
        this.currentColumn++;
      }
    } else {
      // not jump or fall
      this.currentColumn++;
    }
    this.setSpriteLocation();
    //move x
    this.x = this.x + this.speed;
    console.log(`speed: ${this.speed}`);
    if (this.x > canvas.width) {
      this.x = -Character.width * this.scale;
    }
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
let test = new Character();

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
animate();

function xanimate() {
  test.draw();
  test.update();
}

document.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    test.action !== Character.actions.jump &&
    test.action !== Character.actions.fall
  ) {
    test.prevAction = test.action;
    test.setAction(Character.actions.jump);
  } else if (e.code === "KeyD" && test.action !== Character.actions.walk) {
    test.setAction(Character.actions.walk);
  } else if (e.code === "KeyW" && test.action !== Character.actions.run) {
    test.setAction(Character.actions.run);
  } else if (e.code === "KeyA" && test.action !== Character.actions.idle) {
    test.setAction(Character.actions.idle);
  } else if (e.code === "KeyS" && test.action !== Character.actions.slide) {
    test.setAction(Character.actions.slide);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "KeyD" || e.code === "KeyW") {
    if (
      test.action !== Character.actions.jump &&
      test.action !== Character.actions.fall
    ) {
      test.setAction(Character.actions.idle);
    }
  }
});
