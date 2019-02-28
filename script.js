var boxes = []          //object dari box
var objects = []        //object dari character
var obstacles = [];     //object dari obstacle
var objIdx = 0
var gameScore = 0
const gameLife = 5
const canvasWidth = 800
const canvasHeight = 500
const color = ['#8F8', '#F88', '#88F'] // green, red, blue
const score = [100, -100, 200]

function start() {
    for(let i = 0; i < 20; i++) {
        boxes[i] = new boxComponent (40, 40, color[i % 3], i * 40, 460)
    }
    for(let i =1; i <= 5; i++) {
        let y = (i * 70) + 60
        if (i % 2 == 0){
            for(let j = 0; j < 13; j++){
                let len = obstacles.length
                let x = ((j + 1) * 60) - 40
                obstacles[len] = new obstacleComponent(x, y, 3, 0, 2 * Math.PI);
            }
        }
        else{
            for(let j = 0; j < 13; j++){
                let len = obstacles.length
                let x = ((j + 1) * 60) - 10
                obstacles[len] = new obstacleComponent(x, y, 3, 0, 2 * Math.PI);
            }
        }
    }    
    createObject()
    gameArea.draw()
}

// object canvas 
var gameArea = {
    canvas: document.createElement('canvas'),
    draw: function() {
        this.canvas.width = canvasWidth
        this.canvas.height = canvasHeight
        this.context = this.canvas.getContext('2d')
        document.body.insertBefore(this.canvas, document.body.childNodes[0])
        this.frameNo = 0
        this.interval = setInterval(updategameArea, 20)
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    stop: function() {
        clearInterval(this.interval)
    }
}
// kelas character
function component(width, height, color, x, y, type, idx) {
    this.type = type
    if (type =="image") {
        this.image = new Image()
        this.image.src = color
    }
    this.width = width
    this.height = height
    this.speedX = 0
    this.speedY = 0
    this.x = x
    this.y = y
    this.idx = idx
    this.gravity = 0.1
    this.gravitySpeed = 0
    this.bounce = 0.2
    this.dropped = false

    this.draw = function() {
        ctx = gameArea.context
        if (type == "image") {
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, 
                this.height)
        } else {
            ctx.fillStyle = color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }

    this.newPos = function() {
        if (this.dropped) {    
            this.gravitySpeed += this.gravity
            this.y += this.speedY + this.gravitySpeed
            this.x += this.speedX
            this.hitBottom()
            this.hitSide()
        } else {
            if (this.speedX > 0 ) {
                if (this.x < (gameArea.canvas.width - this.width)) this.x += this.speedX
            } else if (this.speedX < 0) {
                if (this.x > 0) this.x += this.speedX
            }
        }
    }

    this.hitBottom = function() {
        var rockbottom = gameArea.canvas.height - this.height
        if (this.y > rockbottom) {
            this.y = rockbottom
            this.gravitySpeed = -(this.gravitySpeed * this.bounce)
            this.speedX = 0
        }
        else if (this.y === rockbottom) {
            let cScore = 0
            let boxHit = Math.round(this.x / 40)
            cScore = score[boxHit%3]
            gameScore += cScore
            updateScore()

            if (this.idx === gameLife) gameArea.stop()
        }
        if (this.hitObstacle()) {
            if (Math.round(Math.random())) {
                this.speedX = 5
            } else {
                this.speedX = -5
            }
        }
    }

    this.hitObstacle = function() {
        let myleft = this.x;
        let myright = this.x + (this.width);
        let mytop = this.y;
        let mybottom = this.y + (this.height);
        for(let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i]
            if ((myleft < obs.x && myright > obs.x) && (mybottom > obs.y && mytop < obs.y)) {
                return true
            }
        }
        return false
    }

    this.hitSide = function() {
        if (this.x < 0) {
            this.speedX = 5
        }
        if (this.x + 40 > 800) {
            this.speedX = -5
        }
    }
}
// kelas box
function boxComponent (width, height, color, x, y){
    this.width = width
    this.height= height
    this.x = x
    this.y = y
    this.draw = function(){
        ctx = gameArea.context
        ctx.fillStyle = color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}
// kelas obstacle
function obstacleComponent (x, y, r, sa, ea){
    this.x = x;
    this.y = y;
    this.r = r;
    this.sa = sa;
    this.ea = ea;
    this.draw = function(){
        ctx = gameArea.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, this.sa, this.ea);
        ctx.stroke();
    }
}

function createObject() {
    objects[objIdx] = new component(40, 40, 'monster.png', 370, 10, 'image', objIdx)
    objIdx += 1
}

function updategameArea() {
    gameArea.clear()
    boxes.map(obj => obj.draw())
    for(let i = 0; i < obstacles.length; i++){
        obstacles[i].draw();
    }
    objects.map( obj  => {
        obj.newPos()
        obj.draw()
    })
}

function moveleft() {
    objects[objIdx - 1].speedX = -5
}

function moveright() {
    objects[objIdx - 1].speedX = 5
}

function clearmove() {
    objects[objIdx - 1].speedX = 0
}

function dropBall() {
    updateLife()
    if (objIdx <= gameLife) {
        objects[objIdx - 1].dropped = true
        if (objIdx < gameLife) createObject()
    }
}

function updateScore() {
    let el = document.getElementById("gameScore")
    el.innerHTML = gameScore
}

function updateLife(val) {
    let el = document.getElementById("gameLife")
    el.innerHTML = gameLife - objIdx
}

document.body.onkeydown = function(e) {
    if(e.code === 'Space' || e.code === 'ArrowDown') dropBall()
    if(e.code === 'KeyA' || e.code === 'ArrowLeft') moveleft()
    if(e.code === 'KeyD' || e.code === 'ArrowRight') moveright()
}

document.body.onkeyup = function(e) {
    if(e.code === 'KeyA' || e.code === 'ArrowLeft') clearmove()
    if(e.code === 'KeyD' || e.code === 'ArrowRight') clearmove()
}

function showRules() {
    var x = document.getElementById("snackbarRule");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 5000);
}

function boxRules() {
    var x = document.getElementById("snackbarBox");
    x.className = "show";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 5000);
}
// function logger(obj){
//      console.log('console >> ')
//      console.log(obj)
// }