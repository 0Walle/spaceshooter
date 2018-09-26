function Sprite(image,x,y) {
    this.x = x
    this.y = y
    this.image = image
    this.rect = new Rect(0,0,16,16)
    this.draw = function() {
        this.image.ctx.drawImage(this.image.src,
            this.image.sx*16, this.image.sy*16, this.image.size, this.image.size,
            this.x, this.y, 16, 16)
    };
}

function Explosion(image,x,y) {
    this.x = x
    this.y = y
    this.image = image
    this.frame = 0
    this.draw = function(ctx) {
        ctx.drawImage(this.image.src,
            Math.floor(this.frame)*16, 32, 15, 15,
            this.x, this.y, 16, 16)
        this.frame+=0.5;
    };
}

function Player(image,x,y) {
    Sprite.call(this,image,x,y)

    this.y = 176

    this.health = 20
    this.health_ = 20
    this.score = 0
    this.coincount = 0
    this.frequency = 15
    this.damage = 2
    this.damage_ = 2
    this.chasing = false

    this.shootdelay = 0

    this.chasetime = 0
    this.boosttime = 0
    this.stengtime = 0

    this.rect.w = 9
    this.rect.h = 11

    this.bar = new Lifebar(this.health,this.health_)
}

function Ray(owner,x,y,w,h,color,dirx=0,diry=0) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.dx = dirx
    this.dy = diry
    this.color = color
    this.owner = owner
    
    this.draw = function(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h);
    };

    this.outBounds = function(){
        if(this.y>192 || this.x<0 || this.x>255){
            return true    
        }
    }
}

function Lifebar(total,value) {
    this.total = total
    this.value = value
    this.display = value*5
    
    this.draw = function(ctx,x,y) {
        if (this.value*5<this.display) this.display -= 1;
        if (this.value*5>this.display) this.display += 1;

        if (this.value<this.total && this.value>0)
        {
            ctx.fillStyle = '#f00'
            ctx.fillRect(x,y,16,1);
            ctx.fillStyle = '#0f0'
            ctx.fillRect(x,y,Math.floor((16*this.display)/(this.total*5)),1);
        }
    };
}


function Enemy(image,x,y,type) {
    Sprite.call(this,image,x,y)
    this.type = type
    this.health = 10
    this.health_ = 10

    this.bar = new Lifebar(10,10)
    this.shootdelay = 0
    this._shootdelay = 0

    this.rect.w = 14
    this.rect.h = 11

    this._update = function() {
        this.bar.value = this.health;
        if(this.shootdelay>0) this.shootdelay -= 1;
        this.rect.x = this.x
        this.rect.y = this.y+1
    }

    this._fire = function() {
        if(this.shootdelay==0){
            this.shootdelay = this._shootdelay
            return true
        }
    }
}

function EnBasic(x,y) {
    Enemy.call(this,enemy1img,x,y,0)

    this._shootdelay = 50

    this.update = function(){
        this._update()
        this.y += 0.5;
    }

    this.fire = function() {
        if(this._fire()){
            return [
                new Ray("enemy1",this.x+4,this.y+9,1,1,'#f00'),
                new Ray("enemy1",this.x+10,this.y+9,1,1,'#f00')
            ]
        }
    }

    this.loot = function() {
        items = []
        if (Math.random()<0.1){
            for (var c_ = 0; c_ < 8; c_++) {
                if (Math.random()<0.75) items.push(new Item(coinimg,this.x+4,this.y+4,0));
                else items.push(new Item(repairimg,this.x+4,this.y+4,1));
            };
        }else{
            if (Math.random()<0.70) items.push(new Item(coinimg,this.x+4,this.y+4,0));
            else items.push(new Item(repairimg,this.x+4,this.y+4,1));
        }
        return {score:500,loot:items}
    }
}

function EnSpreader(x,y) {
    Enemy.call(this,enemy2img,x,y,1)

    this._shootdelay = 8

    this.update = function () {
        this._update()
        this.y += 1.5
    }

    this.fire = function() {
        if(this._fire()){
            return [
                new Ray("enemy2",this.x+3,this.y+8,1,1,'#f00',-1,1),
                new Ray("enemy2",this.x+11,this.y+8,1,1,'#f00',1,1)
            ]
        }
    }

    this.loot = function() {
        items = []
        if (Math.random()<0.50) items.push(new Item(boostimg,this.x+4,this.y+4,2));
        else{
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
        }
        return {score:800,loot:items}
    }
}

function EnDiverL(x,y) {
    Enemy.call(this,enemy1img,x,y,2)

    this._shootdelay = 10

    this.update = function () {
        this._update()
        this.y += 1.0;
        this.x += this.y/50;
    }

    this.fire = function() {
        if(this._fire()){
            return [
                new Ray("enemy3",this.x+4,this.y+9,1,1,'#f00'),
                new Ray("enemy3",this.x+10,this.y+9,1,1,'#f00')
            ]
        }
    }

    this.loot = function() {
        items = []
        if (Math.random()<0.5){
            for (var c_ = 0; c_ < 10; c_++) {
                if (Math.random()<0.5) items.push(new Item(coinimg,this.x+4,this.y+4,0));
                else if (Math.random()<0.5) items.push(new Item(repairimg,this.x+4,this.y+4,1));
            };
            if (Math.random()<0.2) items.push(new Item(boostimg,this.x+4,this.y+4,2));
        }else{
            items.push(new Item(repairimg,this.x+4,this.y+4,1));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
        }
        return {score:900,loot:items}
    }
}

function EnDiverR(x,y) {
    Enemy.call(this,enemy1img,x,y,3)

    this._shootdelay = 10

    this.update = function () {
        this._update()
        this.y += 1.0;
        this.x -= this.y/50;
    }

    this.fire = function() {
        if(this._fire()){
            return [
                new Ray("enemy3",this.x+4,this.y+9,1,1,'#f00'),
                new Ray("enemy3",this.x+10,this.y+9,1,1,'#f00')
            ]
        }
    }

    this.loot = function() {
        items = []
        if (Math.random()<0.5){
            for (var c_ = 0; c_ < 10; c_++) {
                if (Math.random()<0.5) items.push(new Item(coinimg,this.x+4,this.y+4,0));
                else if (Math.random()<0.5) items.push(new Item(repairimg,this.x+4,this.y+4,1));
            };
            if (Math.random()<0.2) items.push(new Item(boostimg,this.x+4,this.y+4,2));
        }else{
            items.push(new Item(repairimg,this.x+4,this.y+4,1));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
        }
        return {score:900,loot:items}
    }
}

function EnCannon(x,y) {
    Enemy.call(this,enemy3img,x,y,4)

    this._shootdelay = 150

    this.update = function () {
        this._update()
        this.y += 0.3;
    }

    this.fire = function(angle) {
        if(this._fire()){
            return [
                new Ray("enemy4",this.x+6,this.y+8,2,2,'#f00',Math.cos(angle),Math.sin(angle))
            ]
        }
    }

    this.loot = function() {
        items = []
        if (Math.random()<0.20) items.push(new Item(strenghtimg,this.x+4,this.y+4,3));
        else{
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
            items.push(new Item(coinimg,this.x+4,this.y+4,0));
        }
        return {score:800,loot:items}
    }
}

function EnTest(x,y) {
    Enemy.call(this,enemy1img,x,y,5)

    this._shootdelay = 2

    this.update = function () {
        this._update()
        this.y += 1.2;
    }

    this.fire = function() {
        if(this._fire()){
            return [
                new Ray("enemy101",this.x+4,this.y+9,1,1,'#f00',(Math.sin(this.y/12))*Math.PI/3,1),
                new Ray("enemy101",this.x+10,this.y+9,1,1,'#f00',(-Math.sin(this.y/12))*Math.PI/3,1)
            ]
        }
    }

    this.loot = function() {
        items = []
        /*if (Math.random()<1.00){
        }else{}*/
        return {score:0,loot:items}
    }
}

function Item(image,x,y,type) {
    Sprite.call(this,image,x,y)
    this.type = type
    this.velx = Math.random()*0.6-0.3;
    this.vely = Math.random()*0.6-0.3;

    this.time = Math.floor(Math.random()*5);

    this.rect.w = 8
    this.rect.h = 8

    this.update = function() {
        this.y += this.vely
        this.x += this.velx
        if(this.x < 0) this.velx *= -1
        if(this.x > 242) this.velx *= -1
        if(this.y < 0) this.vely *= -1
        this.rect.x = this.x
        this.rect.y = this.y

        this.time++;
    };
}
