'use strict';

const canvas = document.querySelector('canvas')
const cC = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

cC.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

// Sprites BACKGROUND
const background = new Sprite({
   position: {
      x: 0,
      y: 0,
   },
   imageSrc: './img/background.png',
})

// Sprites background SHOP
const shop = new Sprite({
   position: {
      x: 625,
      y: 130,
   },
   imageSrc: './img/shop.png',
   scale: 2.75,
   framesMax: 6,
})

// PLAYER hit box and sprite 
const player = new Fighter({
   position: {
      x: 0,
      y: 0
   },
   velocity: {
      x: 0,
      y: 0,
   },
   offset: {
      x: 0,
      y: 0
   },
   imageSrc: './img/samuraiMack/Idle.png',
   framesMax: 8,
   scale: 2.5,
   offset: {
      x: 215,
      y: 157,
   },
   sprites: {
      idle: {
         imageSrc: './img/samuraiMack/Idle.png',
         framesMax: 8,
      },
      run: {
         imageSrc: './img/samuraiMack/Run.png',
         framesMax: 8,
      },
      jump: {
         imageSrc: './img/samuraiMack/Jump.png',
         framesMax: 2,
      },
      fall: {
         imageSrc: './img/samuraiMack/Fall.png',
         framesMax: 2,
      },
      attack1: {
         imageSrc: './img/samuraiMack/Attack1.png',
         framesMax: 6,
      },
      takeHit: {
         imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
         framesMax: 4,
      },
      death: {
         imageSrc: './img/samuraiMack/Death.png',
         framesMax: 6,
      },
   },
   attackBox: {
      offset: {
         x: 100,
         y: 50,
      },
      width: 155,
      height: 50,
   },
})

const enemy = new Fighter({
   position: {
      x: 400,
      y: 100
   },
   velocity: {
      x: 0,
      y: 0,
   },
   color: 'blue',
   offset: {
      x: -50,
      y: 0
   },
   imageSrc: './img/kenji/Idle.png',
   framesMax: 4,
   scale: 2.5,
   offset: {
      x: 215,
      y: 167,
   },
   sprites: {
      idle: {
         imageSrc: './img/kenji/Idle.png',
         framesMax: 4,
      },
      run: {
         imageSrc: './img/kenji/Run.png',
         framesMax: 8,
      },
      jump: {
         imageSrc: './img/kenji/Jump.png',
         framesMax: 2,
      },
      fall: {
         imageSrc: './img/kenji/Fall.png',
         framesMax: 2,
      },
      attack1: {
         imageSrc: './img/kenji/Attack1.png',
         framesMax: 4,
      },
      takeHit: {
         imageSrc: './img/kenji/Take hit.png',
         framesMax: 3,
      },
      death: {
         imageSrc: './img/kenji/Death.png',
         framesMax: 7,
      },
   },
   attackBox: {
      offset: {
         x: -170,
         y: 50,
      },
      width: 170,
      height: 50,
   },
})

//***************************ANIMATION LOOP**************************/
const keys = {
   a: {
      pressed: false
   },
   d: {
      pressed: false
   },
   w: {
      pressed: false
   },
   ArrowRight: {
      pressed: false
   },
   ArrowLeft: {
      pressed: false
   }
}

decreaseTimer()

function animate() {
   window.requestAnimationFrame(animate)
   cC.fillStyle = 'black';
   cC.fillRect(0, 0, canvas.width, canvas.height)
   background.update()
   shop.update()
   cC.fillStyle = 'rgba(255, 255, 255, 0.1)'
   cC.fillRect(0, 0, canvas.width, canvas.height)
   player.update();
   enemy.update();

   //player movement
   player.velocity.x = 0;
   if (keys.a.pressed && player.lastKey === 'a') {
      player.velocity.x = -5;
      player.switchSprite('run')
   } else if (keys.d.pressed && player.lastKey === 'd') {
      player.velocity.x = 5;
      player.switchSprite('run')
   } else {
      player.switchSprite('idle')
   }
   //jumping
   if (player.velocity.y < 0) {
      player.switchSprite('jump')
   } else if (player.velocity.y > 0) {
      player.switchSprite('fall')
   }

   //enemy movement
   enemy.velocity.x = 0;
   if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
      enemy.velocity.x = -5;
      enemy.switchSprite('run')
   } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
      enemy.velocity.x = 5;
      enemy.switchSprite('run')
   } else {
      enemy.switchSprite('idle')
   }
   //jumpiing
   if (enemy.velocity.y < 0) {
      enemy.switchSprite('jump')
   } else if (enemy.velocity.y > 0) {
      enemy.switchSprite('fall')
   }

   //***************************DETECT COLLISION**************************/


   //-----PLAYER
   if (rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
   }) &&
      player.isAttacking &&
      player.framesCurrent === 4 // on 4 frames activation attack
   ) {
      enemy.takeHit()
      player.isAttacking = false;
      // enemy.health -= 20 
      gsap.to('#enemyHealth', {         // cdnjs library gsap
         width: enemy.health + '%'
      })
   }
   //if player misses
   if (player.isAttacking && player.framesCurrent === 4) {
      player.isAttacking = false
   }

   //-----ENEMY
   if (rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
   }) &&
      enemy.isAttacking &&
      enemy.framesCurrent === 2  // on 2 frames activation attack
   ) {
      player.takeHit()
      enemy.isAttacking = false;
      // player.health -= 20
      gsap.to('#playerHealth', {         // cdnjs library gsap
         width: player.health + '%'
      })
   }
   //if enemy misses
   if (enemy.isAttacking && enemy.framesCurrent === 2) {
      enemy.isAttacking = false
   }


   //end game when lost all health
   if (enemy.health <= 0 || player.health <= 0) {
      determineWinner({ player, enemy, timerId })
   }
}
animate();

//**********************************MOVING*********************************/


window.addEventListener('keydown', (event) => {
   if (!player.dead) {

      switch (event.key) {
         case 'd':
            keys.d.pressed = true;
            player.lastKey = 'd';
            break;
         case 'a':
            keys.a.pressed = true;
            player.lastKey = 'a';
            break;
         case 'w':
            player.velocity.y = -20;
            break;
         case ' ':
            player.attack();
            break;
      }
   }

   if (!enemy.dead) {

      switch (event.key) {
         //enemy keys
         case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey = 'ArrowRight';
            break;
         case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = 'ArrowLeft';
            break;
         case 'ArrowUp':
            enemy.velocity.y = -20;
            break;
         case 'ArrowDown':
            enemy.attack()
            break;
      }
   }
});

window.addEventListener('keyup', (event) => {
   switch (event.key) {
      case 'd':
         keys.d.pressed = false;
         break;
      case 'a':
         keys.a.pressed = false;
         break;
   }
   //enemy keys
   switch (event.key) {
      case 'ArrowRight':
         keys.ArrowRight.pressed = false;
         break;
      case 'ArrowLeft':
         keys.ArrowLeft.pressed = false;
         break;
   }
});