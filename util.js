var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
ctx.textBaseline = "top";

keys = {}

fontload = false;
soundload = 0;
imageload = false;

WebFont.load({
    google: {families: ['Press Start 2P']},
    active: function() {fontload = true;}
});
fontload = true;
//function renderText() {
//ctx.fillText("Play",0,16);
//}
var pewsnd = document.createElement("audio");
pewsnd.src = "pew.wav";
pewsnd.volume = 0.2;
pewsnd.oncanplay = function() {soundload+=1;};

var coinsnd = document.createElement("audio");
coinsnd.src = "coin.wav";
coinsnd.oncanplay = function() {soundload+=1;};

var explsnd = document.createElement("audio");
explsnd.src = "expl3.wav";
explsnd.volume = 0.3;
explsnd.oncanplay = function() {soundload+=1;};

var expl1snd = document.createElement("audio");
expl1snd.src = "expl1.wav";
expl1snd.volume = 0.3;
expl1snd.oncanplay = function() {soundload+=1;};
//pewsnd.play();
//pewsnd.pause();

image = new SpriteSheet(ctx,"map.png")
image.image.onload = function() {imageload = true;};
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

gsMENU = 0
gsGAME = 1
gsDEAD = 2

Gamestate = gsMENU

GGtimer = 0;
function loading(){
    if(fontload==true && imageload==true && soundload==4){
        ctx.font = '8px "Press Start 2P"'
        update();
        return;
    }
    setTimeout(loading, 1000/30);
}

function update(e){
    if(Gamestate==gsMENU){
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.setTransform(1,0,0,1,0,0)
        ctx.scale(6,6);

        player.x = 30
        player.y = 48-5+10
        player.draw()

        ctx.fillStyle = '#fff'
        ctx.fillText('Space Shooter', 15, 20)

        ctx.fillStyle = '#0b0'
        ctx.fillRect(58+8,48+5,35,11)
        ctx.fillStyle = '#fff'
        ctx.fillText('Play', 60+8, 48+7)

        ctx.scale(1/3,1/3);
        ctx.fillText('Press Enter to play', 120, 240)

        if (keys['Enter']){
            player.x = 120
            player.y = 192-16
            Gamestate = gsGAME
        };

        setTimeout(update, 1000/30)

    }else if(Gamestate==gsGAME){
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
                enemys.push(new EnBasic(Math.floor(Math.random()*224+10),0));
            }
            if(Math.random()<0.01){ //0.01
                enemys.push(new EnDiverL(0,0));
                enemys.push(new EnDiverR(240,0));
            }
            if(Math.random()<0.04){ //0.04
                enemys.push(new EnSpreader(Math.floor(Math.random()*224+10),0));
            }
            if(Math.random()<0.015){ //0.015
                enemys.push(new EnCannon(Math.floor(Math.random()*224+10),0));
            }

            if(enemys.length==0){
                enemys.push(new EnBasic(Math.floor(Math.random()*224+10),0));
            }
            //if(Math.random()<0.18){ //0.08
            //    enemys.push(new EnTest(Math.floor(Math.random()*224+10),0));
            //}
            //enemys.push(new EnTest(128,0));

            spawntime = Math.floor(Math.random()*15+5)
            //spawntime = 240
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
            player.y = -100;
            expl1snd.play();
            player.health = -100;
            GGtimer = 60
        }

        if(GGtimer==1){
            Gamestate = gsDEAD;
        }

        for (var i = rays.length - 1; i >= 0; i--) {
            rays[i].draw(ctx);
            if(rays[i].outBounds()){
                rays.splice(i,1);
                continue;
            }

            if (rays[i].owner=="player"){
                rays[i].y -= 4;
                for (var j = enemys.length - 1; j >= 0; j--) {
                    if (collideP(rays[i],enemys[j].rect)) {
                        enemys[j].health-=player.damage;
                        rays.splice(i,1);
                        break;
                    };
                };
            }else{
                if (rays[i].owner=="enemy1"){rays[i].y += 2;
                }else if (rays[i].owner=="enemy2"){rays[i].y += 0.5;rays[i].x += rays[i].dx;
                }else if (rays[i].owner=="enemy3"){rays[i].y += 2;
                }else if (rays[i].owner=="enemy4"){rays[i].y += rays[i].dy*3;rays[i].x += rays[i].dx*3
                }else if (rays[i].owner=="enemy101"){rays[i].y += Math.cos(rays[i].dx)*rays[i].dy+1.2;rays[i].x += Math.sin(rays[i].dx)*rays[i].dy
                }

                if (collideP(rays[i],player.rect)) {
                    player.health -= rays[i].damage;
                    rays.splice(i,1);
                };
            }
        };

        for (var i = enemys.length - 1; i >= 0; i--) {
            enemys[i].draw();
            enemys[i].bar.draw(ctx,enemys[i].x,enemys[i].y+14);
            enemys[i].update();
            if(enemys[i].y>192) enemys.splice(i,1);
            else{
            angle = Math.atan2((player.y+8)-(enemys[i].y+8),(player.x+8)-(enemys[i].x+6))
            nrays = enemys[i].fire(angle)
            if(nrays) rays = rays.concat(nrays)

            if(enemys[i].health<=0){
                nloot = enemys[i].loot()
                player.score += nloot.score
                itens = itens.concat(nloot.loot)
                explosions.push(new Explosion(explosionimg,enemys[i].x,enemys[i].y))
                enemys.splice(i,1);
                explsnd.play();
            }else if(collide(enemys[i].rect,player.rect)){
                explosions.push(new Explosion(explosionimg,enemys[i].x,enemys[i].y))
                player.health -= 5;
                enemys.splice(i,1);
                expl1snd.play();
            }
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
        
        if(GGtimer>0) GGtimer -= 1;
        //time++;

        if (player.health>0){setTimeout(update, 1000/60);
        }else{setTimeout(update, 1000/20);}

        /*if(player.coincount>player.health_){
            player.coincount-=player.health_
            player.health_+= 10
            player.health = player.health_
            player.damage_+= 1
        }*/
    }else if(Gamestate==gsDEAD){
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.setTransform(1,0,0,1,0,0)
        ctx.scale(6,6);

        ctx.textAlign = 'center'

        player.x = 30
        player.y = 48-5+10
        player.draw()

        ctx.fillStyle = '#f00'
        ctx.fillText('You died', 64, 20)

        ctx.fillStyle = '#0b0'
        ctx.fillRect(58+8,48+5,35,11)
        ctx.fillStyle = '#fff'
        ctx.fillText('Play', 76+8, 48+7)

        ctx.scale(1/3,1/3);
        ctx.fillText('Press Enter to play', 192, 240)

        ctx.fillText('You made '+player.score+' points', 192, 110)

        if (keys['Enter']){
            player.x = 120
            player.y = 192-16
            player.reset()
            enemys = []
            itens = []
            explosions = []
            rays = []
            ctx.textAlign = 'start'
            Gamestate = gsGAME
        };

        setTimeout(update, 1000/30)
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