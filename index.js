//canvas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
//canvas width and height
canvas.width = window.innerWidth
canvas.height = window.innerHeight
//importing things 
const scoreEl = document.querySelector('#scoreEl')
const startGamebtn = document.querySelector('#startGamebtn')
const modelEl = document.querySelector('#modelEl')
const bigScoreEl = document.querySelector('#bigScoreel')
//declaring classes for making objects for games
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill()
    }
}
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

//canvas x and y coordinates
const x = canvas.width / 2
const y = canvas.height / 2

//making player 
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}
//spawning enimes
function spawnEnemies() {
    setInterval(() => {

        const radius = Math.random() * (30 - 4) + 4
        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius

            y = Math.random() * canvas.height
        } else {
            x = Math.round() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius

        }
        const color = `hsl(${Math.random() * 360} 50%  50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 1000)
}
//let animation and score
let animationId
let score = 0
//creating animation
function animate() {
    //player animation
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = "rgba(0,0,0 , 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    player.draw()
    //particle animation
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    //projectile animation
    projectiles.forEach((projectile, index) => {
        projectile.update()
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width
            || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0);
        }

    })
    //enimes animation
    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        //end game
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
            modelEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }
        projectiles.forEach((projectile, projectileindex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // when projectiles hit enemy
            if (dist - enemy.radius - projectile.radius < 1) {
                //particle explosion
                for (let i = 0; i < enemy.radius * 2; i++) { particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6) })) }
                if (enemy.radius - 10 > 5) {
                    //score
                    score += 100
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        //enemies.splice(index, 1)
                        projectiles.splice(projectileindex, 1)
                    }, 0);

                } else {
                    //remove from screen
                    score += 250
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileindex, 1)
                    }, 0);
                }

            }
        });
    })

}
//Looking and acting after player click
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))

})
startGamebtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modelEl.style.display = 'none'
})
// the code completed