var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.textBaseline = "top";

keys = {}

fontload = false;
soundload = 0;
imageload = false;

WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: function() {
        fontload = true;
    }
});
fontload = true;
//function renderText() {
//ctx.fillText("Play",0,16);
//}
var pewsnd = document.createElement("audio");
pewsnd.src = "pew.wav";
pewsnd.volume = 0.2;
pewsnd.oncanplay = function() {
    soundload+=1;
};

var coinsnd = document.createElement("audio");
coinsnd.src = "coin.wav";
coinsnd.oncanplay = function() {
    soundload+=1;
};

var explsnd = document.createElement("audio");
explsnd.src = "expl3.wav";
explsnd.volume = 0.3;
explsnd.oncanplay = function() {
    soundload+=1;
};

var expl1snd = document.createElement("audio");
expl1snd.src = "expl1.wav";
expl1snd.volume = 0.3;
expl1snd.oncanplay = function() {
    soundload+=1;
};
//pewsnd.play();
//pewsnd.pause();

image = new SpriteSheet(ctx,"map.png")
image.image.onload = function() {
    imageload = true;
};
explosionimg = image.get(0,2)

coinimg = image.get(2,0)
repairimg = image.get(4,0)
boostimg = image.get(3,0)
strenghtimg = image.get(5,0)
chaserimg = image.get(6,0)

playerimg = image.get(0,0)
enemy1img = image.get(0,3)
enemy2img = image.get(1,3)
enemy3img = image.get(3,3)

player = new Player(playerimg,0,0)

spawntime = 0

enemys = []
rays = []
explosions = []
itens = []

time = 0;
function loading(){
    if(fontload==true && imageload==true && soundload==4){
        ctx.font = '8px "Press Start 2P"'
        //setInterval(update, 1000/60);
        update();
        //setTimeout(update, 1000/60);
        return;
    }
    setTimeout(loading, 1000/30);
}

function update(e){
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.setTransform(1,0,0,1,0,0)
    ctx.scale(3,3);

    if (player.health>0){
        if ((keys['ArrowUp'] || keys['w']) && player.y > 8) player.y-=2;
        if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) player.x-=2;
        if ((keys['ArrowDown'] || keys['s']) && player.y < 176) player.y+=2;
        if ((keys['ArrowRight'] || keys['d']) && player.x < 244) player.x+=2;
        if (keys['x'] || keys[' ']){
            if (player.shootdelay==0){
                rays.push(new Ray("player",player.x+5,player.y-5,1,5,'#0f0'))
                player.shootdelay = player.frequency;
                pewsnd.play();
            }
        };
    }

    if (spawntime==0) {
        if(Math.random()<0.08){ //0.08
            enemys.push(new Enemy(enemy1img,Math.floor(Math.random()*224+10),0,0));
            //enemys.push(new Enemy(enemy1img,Math.sin(time/100)*112+112,0,0));
        }
        if(Math.random()<0.01){ //0.01
            enemys.push(new Enemy(enemy1img,0,0,2));
            enemys.push(new Enemy(enemy1img,240,0,3));
        }
        if(Math.random()<0.04){ //0.04
            enemys.push(new Enemy(enemy2img,Math.floor(Math.random()*224+10),0,1));
        }
        if(Math.random()<0.015){ //0.02
            enemys.push(new Enemy(enemy3img,Math.floor(Math.random()*224+10),0,4));
            //enemys.push(new Enemy(enemy1img,Math.sin(time/100)*112+112,0,0));
        }

        spawntime = Math.floor(Math.random()*15)
    };

    player.rect.x = player.x+1;
    player.rect.y = player.y;

    player.draw()
    player.bar.value = player.health;
    player.bar.total = player.health_;
    player.bar.draw(ctx,player.x-2,player.y+14);

    if (player.health<=0 && player.health>-50){
        explosions.push(new Explosion(explosionimg,player.x,player.y));
        player.x = -100;
        expl1snd.play();
        player.health = -100;
    }

    for (var i = rays.length - 1; i >= 0; i--) {
        rays[i].draw(ctx);
        if (rays[i].owner=="player"){
            rays[i].y -= 4;
            if(rays[i].y<0){
                rays.splice(i,1);
                continue;
            }
            for (var j = enemys.length - 1; j >= 0; j--) {
                if (collideP(rays[i],enemys[j].rect)) {
                    enemys[j].health-=player.damage;
                    rays.splice(i,1);
                    break;
                };
            };
        }
        else if (rays[i].owner=="enemy1"){
            rays[i].y += 2;
            //rays[i].x += rays[i].dx*2;
            //rays[i].y += rays[i].dy*2;
            if(rays[i].y>192){
                rays.splice(i,1);
                continue;
            }
            if (collideP(rays[i],player.rect)) {
                player.health -= 0.2;
                rays.splice(i,1);
            };
        }else if (rays[i].owner=="enemy2"){
            rays[i].y += 0.5;
            rays[i].x += rays[i].dx;
            //rays[i].x += rays[i].dx*2;
            //rays[i].y += rays[i].dy*2;
            if(rays[i].y>192){
                rays.splice(i,1);
                continue;
            }
            if (collideP(rays[i],player.rect)) {
                player.health -= 0.2;
                rays.splice(i,1);
            };
        }
        else if (rays[i].owner=="enemy3"){
            rays[i].y += 2;
            //rays[i].y += rays[i].dy*2;
            if(rays[i].y>192){
                rays.splice(i,1);
                continue;
            }
            if (collideP(rays[i],player.rect)) {
                player.health -= 0.6;
                rays.splice(i,1);
            };
        }else if (rays[i].owner=="enemy4"){

            rays[i].y += rays[i].dy*3
            rays[i].x += rays[i].dx*3

            if(rays[i].y>192){
                rays.splice(i,1);
                continue;
            }if(rays[i].x<0){
                rays.splice(i,1);
                continue;
            }if(rays[i].x>255){
                rays.splice(i,1);
                continue;
            }
            if (collideP(rays[i],player.rect)) {
                player.health -= 0.6;
                rays.splice(i,1);
            };
        }
    };

    for (var i = enemys.length - 1; i >= 0; i--) {
        enemys[i].draw();
        enemys[i].bar.draw(ctx,enemys[i].x,enemys[i].y+14);
        enemys[i].update();
        if(enemys[i].y>192) enemys.splice(i,1);
        else if(enemys[i].type==0 && enemys[i].shootdelay==0){
            //angle = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x+16)
            //angle2 = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x)
            //rays.push(new Ray("enemy1",enemys[i].x+4,enemys[i].y+12,1,1,'#f00',Math.cos(angle),Math.sin(angle)))
            //rays.push(new Ray("enemy1",enemys[i].x+10,enemys[i].y+12,1,1,'#f00',Math.cos(angle2),Math.sin(angle2)))
            rays.push(new Ray("enemy1",enemys[i].x+4,enemys[i].y+9,1,1,'#f00'))
            rays.push(new Ray("enemy1",enemys[i].x+10,enemys[i].y+9,1,1,'#f00'))
            enemys[i].shootdelay = 100; //100
        }else if(enemys[i].type==1 && enemys[i].shootdelay==0){
            //angle = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x+16)
            //angle2 = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x)
            //rays.push(new Ray("enemy1",enemys[i].x+4,enemys[i].y+12,1,1,'#f00',Math.cos(angle),Math.sin(angle)))
            //rays.push(new Ray("enemy1",enemys[i].x+10,enemys[i].y+12,1,1,'#f00',Math.cos(angle2),Math.sin(angle2)))
            rays.push(new Ray("enemy2",enemys[i].x+3,enemys[i].y+8,1,1,'#f00',-1,1))
            rays.push(new Ray("enemy2",enemys[i].x+11,enemys[i].y+8,1,1,'#f00',1,1))
            enemys[i].shootdelay = 8; //8
        }else if((enemys[i].type==2 || enemys[i].type==3) && enemys[i].shootdelay==0){
            //angle = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x+16)
            //angle2 = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x)
            //rays.push(new Ray("enemy1",enemys[i].x+4,enemys[i].y+12,1,1,'#f00',Math.cos(angle),Math.sin(angle)))
            //rays.push(new Ray("enemy1",enemys[i].x+10,enemys[i].y+12,1,1,'#f00',Math.cos(angle2),Math.sin(angle2)))
            rays.push(new Ray("enemy3",enemys[i].x+4,enemys[i].y+9,1,1,'#f00'))
            rays.push(new Ray("enemy3",enemys[i].x+10,enemys[i].y+9,1,1,'#f00'))
            enemys[i].shootdelay = 10; //10
        }else if(enemys[i].type==4 && enemys[i].shootdelay==0){
            angle = Math.atan2((player.y+8)-(enemys[i].y+8),(player.x+8)-(enemys[i].x+6))
            //angle2 = Math.atan2(player.y-enemys[i].y+9,player.x-enemys[i].x)
            //rays.push(new Ray("enemy1",enemys[i].x+4,enemys[i].y+12,1,1,'#f00',Math.cos(angle),Math.sin(angle)))
            //rays.push(new Ray("enemy1",enemys[i].x+10,enemys[i].y+12,1,1,'#f00',Math.cos(angle2),Math.sin(angle2)))
            rays.push(new Ray("enemy4",enemys[i].x+6,enemys[i].y+8,2,2,'#f00',Math.cos(angle),Math.sin(angle)))
            enemys[i].shootdelay = 150; //8
        }
        else if(enemys[i].health<=0){
            if(enemys[i].type==0){
                player.score += 10000; //500
                if (Math.random()<0.1){
                    for (var c_ = 0; c_ < 8; c_++) {
                        if (Math.random()<0.75) itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                        else itens.push(new Item(repairimg,enemys[i].x+4,enemys[i].y+4,1));
                    };
                }else{
                    if (Math.random()<0.70) itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                    else itens.push(new Item(repairimg,enemys[i].x+4,enemys[i].y+4,1));
                }
            }if(enemys[i].type==1){
                player.score += 10000; //800
                if (Math.random()<0.50) itens.push(new Item(boostimg,enemys[i].x+4,enemys[i].y+4,2));
                else if (Math.random()<0.10) itens.push(new Item(boostimg,enemys[i].x+4,enemys[i].y+4,2));
                else{
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                }
            }if(enemys[i].type==2 || enemys[i].type==3){
                player.score += 10000; //800
                if (Math.random()<0.5){
                    for (var c_ = 0; c_ < 10; c_++) {
                        if (Math.random()<0.5) itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                        else if (Math.random()<0.5) itens.push(new Item(repairimg,enemys[i].x+4,enemys[i].y+4,1));
                    };
                    if (Math.random()<0.2) itens.push(new Item(boostimg,enemys[i].x+4,enemys[i].y+4,2));
                }else{
                    itens.push(new Item(repairimg,enemys[i].x+4,enemys[i].y+4,1));
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                }
            }if(enemys[i].type==4){
                player.score += 10000; //800
                if (Math.random()<0.20) itens.push(new Item(strenghtimg,enemys[i].x+4,enemys[i].y+4,3));
                else{
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                    itens.push(new Item(coinimg,enemys[i].x+4,enemys[i].y+4,0));
                }
            }
            explosions.push(new Explosion(explosionimg,enemys[i].x,enemys[i].y))
            enemys.splice(i,1);
            explsnd.play();
        }else if(collide(enemys[i].rect,player.rect)){
            explosions.push(new Explosion(explosionimg,enemys[i].x,enemys[i].y))
            player.health -= 5;
            enemys.splice(i,1);
            expl1snd.play();
        }  
    };

    for (var i = explosions.length - 1; i >= 0; i--) {
        explosions[i].draw(ctx);
        if (explosions[i].frame>=8) explosions.splice(i,1);
    };

    for (var i = itens.length - 1; i >= 0; i--) {
        itens[i].update();
        if (itens[i].time<600) itens[i].draw(ctx);
        else if(itens[i].time%4==0) itens[i].draw(ctx);
        if (collide(itens[i].rect,player.rect)){
            if(itens[i].type==0){
                player.coincount += 1;
                player.score += 1;
            }else if(itens[i].type==1){
                player.health = Math.min(player.health+2,player.health_);
            }else if(itens[i].type==2){
                player.frequency -= 3;
                player.boosttime = 15*60;
                if(player.frequency<3) player.frequency = 3;
            }else if(itens[i].type==3){
                player.damage += 2;
                player.stengtime = 15*60;
            }else if(itens[i].type==4){
                player.chasing = true;
                player.chasetime = 15*60;
            }
            itens.splice(i,1);
            coinsnd.play();
        }
        else if (itens[i].y>192) itens.splice(i,1);
        else if (itens[i].time>664) itens.splice(i,1);
    };

    ctx.fillStyle = "#fff"
    ctx.fillText(player.coincount,(30-(player.coincount+"").length)*8,1*8);
    ctx.fillText(player.score,1*8,1*8);
    drawSprite(ctx,coinimg,30*8,1*8);

    if (player.boosttime > 0) player.boosttime -= 1;
    else player.frequency = 15;
    if (player.stengtime > 0) player.stengtime -= 1;
    else player.damage = player.damage_;
    if (player.chasetime > 0) player.chasetime -= 1;
    else player.chasing = false;

    if(player.shootdelay>0) player.shootdelay -= 1;
    if(spawntime>0) spawntime -= 1;
    time++;

    if (player.health>0){
        setTimeout(update, 1000/60);
    }else{
        setTimeout(update, 1000/20);
    }

    if(player.coincount>player.health_){
        player.coincount-=player.health_
        player.health_+= 10
        player.health = player.health_
        player.damage_+= 1
    }
    
}


setTimeout(loading, 1000/30);
//setInterval(update, 1000/60);

window.addEventListener('keydown',function(e){
    keys[e.key] = true;
},true);
window.addEventListener('keyup',function(e){
    keys[e.key] = false;
},true);
