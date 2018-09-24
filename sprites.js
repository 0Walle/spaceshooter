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
    //this.frequency = 15
    this.shootdelay = 0

    this.rect.w = 14
    this.rect.h = 11

    this.update = function() {
        this.bar.value = this.health;
        if (this.type==0) this.y += 0.5;
        else if (this.type==1) this.y += 1.5;
        else if (this.type==2){
            this.y += 1.0;
            this.x += this.y/50;
            //this.x += Math.sin(this.y/192);
        }else if (this.type==3){
            this.y += 1.0;
            this.x -= this.y/50;
            //this.x += Math.sin(this.y/192);
        }else if (this.type==4){
            this.y += 0.3;
        }
        if(this.shootdelay>0) this.shootdelay -= 1;
        this.rect.x = this.x
        this.rect.y = this.y+1
    };
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
