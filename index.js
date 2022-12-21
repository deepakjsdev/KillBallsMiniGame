console.log(gsap)

const canvas = document.querySelector('canvas')

const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.getElementById('score')
const startGameBtn = document.getElementById('startGame')
const modal = document.getElementById('modal')
const points = document.getElementById('points')


let score = 0;
let projectiles = []
let enemies = []
let particles = []

function init(){
    score = 0;
    projectiles = []
    enemies = []
    particles = []
    console.log(score)
    scoreEl.innerHTML = score
    points.innerHTML = score
}


class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
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
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
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
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        ctx.save()  // let's us call global canvas methods
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
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
        this.alpha-=0.01
    }
}


function spawnEnemies() {

    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() > .5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            y = Math.random() > .5 ? 0 - radius : canvas.height + radius;
            x = Math.random() * canvas.width
        }
        const color = `hsl(${Math.random() * 360},50%,50%)`
        const yDistance = canvas.height / 2 - y;
        const xDistance = canvas.width / 2 - x;
        const angle = Math.atan2(yDistance, xDistance);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'white')
player.draw()



let animationId;
function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw();



    particles.forEach((particle,particleIndex)=>{
        if(particle.alpha<=0){
            particles.splice(particleIndex,1)
        }else{
            particle.update()
        }
    })



    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()

        if (projectile.x + projectile.radius < 0 || projectile.y + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
        }
    })
    
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update()

        const dis = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        if (dis - player.radius - enemy.radius < 1) {
            points.innerText = score
            modal.style.display = 'flex'
            cancelAnimationFrame(animationId)
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dis = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // When projectile touches enemy 
            if (dis - enemy.radius - projectile.radius < 1) {
        
                // create explositions 
                for(let i=0;i<enemy.radius*2;i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,{
                        x: (Math.random() - 0.5)*(Math.random()*8),
                        y: (Math.random() - 0.5)*(Math.random()*8)
                    }))
                }

                if (enemy.radius - 10 > 10) {
                    score+=100
                    scoreEl.innerText = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    score+=250
                    scoreEl.innerText = score
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }

            }
        })
    })
}

window.addEventListener('click', (event) => {

    const y = event.clientY - canvas.height / 2;
    const x = event.clientX - canvas.width / 2;
    const angle = Math.atan2(y, x);

    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    projectiles.push(
        new Projectile(
            canvas.width / 2, canvas.height / 2,
            5,
            'white',
            velocity
        )
    )
})

startGameBtn.addEventListener('click',(event)=>{
    event.stopPropagation()
    init()
    animate()
    spawnEnemies()
    modal.style.display = 'none'
})


