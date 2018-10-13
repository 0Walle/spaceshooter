var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.textBaseline = "top";

canvas.width = screen.width
canvas.height = screen.height

ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

touch = {}

fontload = false;
imageload = false;

WebFont.load({
    google: {families: ['Press Start 2P']},
    active: function() {fontload = true;}
});
fontload = true;

var pewsnd = new Audio("pew.wav",0.2)
var coinsnd = new Audio("coin.wav",1);
var explsnd = new Audio("expl3.wav",0.3);
var expl1snd = new Audio("expl1.wav",0.3);

image = new SpriteSheet(ctx,"map.png")
image.image.onload = function() {imageload = true;};

explosionimg = image.get(0,2)
coinimg = image.get(2,0)
repairimg = image.get(4,0)
boostimg = image.get(3,0)
strenghtimg = image.get(5,0)
chaserimg = image.get(6,0)
droneimg = image.get(6,0)

playerimg = image.get(0,0)
enemy1img = image.get(0,3)
enemy2img = image.get(1,3)
enemy3img = image.get(3,3)
enemy4img = image.get(4,3)

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
    if(fontload==true && imageload==true &&
        pewsnd.ready() && coinsnd.ready() &&
        expl1snd.ready() && explsnd.ready()){
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
        ctx.setTransform(3,0,0,3,0,0)

        ctx.textAlign = 'center'

        ctx.fillStyle = '#fff'
        ctx.fillText('Space Shooter', canvas.width/6, 20)

        ctx.scale(2,2);

        player.x = canvas.width/12-6
        player.y = canvas.height/24*3
        player.draw()


        ctx.fillStyle = '#0b0'
        ctx.fillRect(canvas.width/12-18,canvas.height/12-10,35,11)
        ctx.fillStyle = '#fff'
        ctx.fillText('Play', canvas.width/12, canvas.height/12)

        ctx.scale(1/2,1/2);

        if (touch.sx > canvas.width/2-18*6 && touch.sx < canvas.width/2+17*6){
            if (touch.sy > canvas.height/2-10*6 && touch.sy < canvas.height/2+6){
                player.x = canvas.width/8
                player.y = 192-16
                touch.x = null
                touch.y = null
                Gamestate = gsGAME
            }
        }

        setTimeout(update, 1000/30)
    }else if(Gamestate==gsGAME){
        ctx.fillStyle = "#0a0a0a"
        ctx.fillRect(0,0,canvas.width,canvas.height)
        ctx.setTransform(4,0,0,4,0,0);
        //ctx.scale(4,4);

        ctx.textAlign = 'left'

        if (player.health>0){
            player.tx = touch.x/4-5
            player.ty = touch.y/4-6

            angle = Math.atan2(player.y-player.ty,player.x-player.tx)
            dist = Math.sqrt((player.y-player.ty)**2+(player.x-player.tx)**2)
            if(dist>1.5){
                player.x -= Math.cos(angle)*2.5
                player.y -= Math.sin(angle)*2.5
            }else{
                player.x = touch.x/4-5
                player.y = touch.y/4-6
            }

            if(player.x+11>canvas.width/4) player.x = canvas.width/4-11
            if(player.x<0) player.x = 0
            if(player.y+16>canvas.height/4) player.y = canvas.height/4-16
            if(player.y<4) player.y = 4

            if (player.shootdelay==0){
                rays.push(new Ray("player",player.x+5,player.y-5,1,5,'#0f0'))
                if(player.chasetime>0){
                    ind = Math.floor(Math.random()*enemys.length)
                    if(enemys[ind]){
                        angle = Math.atan2((player.y)-(enemys[ind].y+16),(player.x+5)-(enemys[ind].x+6))
                        rays.push(new Ray("playerChase",player.x+3,player.y,1,1,'#0f0',0,Math.cos(angle),Math.sin(angle)))
                        rays.push(new Ray("playerChase",player.x+7,player.y,1,1,'#0f0',0,Math.cos(angle),Math.sin(angle)))
                    }
                }
                player.shootdelay = player.frequency;
                pewsnd.play();
            }
        }

        if (spawntime==0) {
            if(Math.random()<0.08){ //0.08
                enemys.push(new EnBasic(Math.floor(Math.random()*(canvas.width/4-14)+2),0));
            }else if(Math.random()<0.08){ //0.04
                enemys.push(new EnSpreader(Math.floor(Math.random()*(canvas.width/4-14)+2),0));
            }else if(Math.random()<0.06){ //0.015
                enemys.push(new EnCannon(Math.floor(Math.random()*(canvas.width/4-14)+2),0));
            }else if(Math.random()<0.15){ //0.05
                enemys.push(new EnChaser(Math.floor(Math.random()*(canvas.width/4-14)+2),0));
            }

            if(enemys.length==0){
                enemys.push(new EnBasic(Math.floor(Math.random()*(canvas.width/4-14)+2),0));
            }
            // if(Math.random()<0.18){ //0.08
            //    enemys.push(new EnTest(Math.floor(Math.random()*224+10),0));
            // }
            //enemys.push(new EnTest(128,0));

            spawntime = Math.floor(Math.random()*15+15)
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
            GGtimer = 40
        }

        if(GGtimer==1){
            Gamestate = gsDEAD;
        }

        for (var i = rays.length - 1; i >= 0; i--) {
            rays[i].draw(ctx);
            if(rays[i].outBounds()){rays.splice(i,1);continue;}
            if (rays[i].owner=="player"){
                rays[i].y -= 4;
                for (var j = enemys.length - 1; j >= 0; j--) {
                    if (collideP(rays[i],enemys[j].rect)) {
                        enemys[j].health-=player.damage;
                        rays.splice(i,1);
                        break;
                    };
                };
            }else if (rays[i].owner=="playerChase"){
                rays[i].y -= rays[i].dy*3;
                rays[i].x -= rays[i].dx*3;
                for (var j = enemys.length - 1; j >= 0; j--) {
                    if (collideP(rays[i],enemys[j].rect)) {
                        enemys[j].health-= 0.3;
                        rays.splice(i,1);
                        break;
                    };
                };
            }else{
                if (rays[i].owner=="enemy1"){rays[i].y += 2;
                }else if (rays[i].owner=="enemy2"){rays[i].y += 0.5;rays[i].x += rays[i].dx;
                }else if (rays[i].owner=="enemy3"){rays[i].y += 2;
                }else if (rays[i].owner=="enemy4"){rays[i].y += rays[i].dy*3;rays[i].x += rays[i].dx*3
                }else if (rays[i].owner=="enemy5"){rays[i].y += rays[i].dy*3;rays[i].x += rays[i].dx*3
                }else if (rays[i].owner=="enemy101"){rays[i].y += Math.cos(rays[i].dx)*rays[i].dy+1.2;rays[i].x += Math.sin(rays[i].dx)*rays[i].dy}
                if (collideP(rays[i],player.rect)) {player.health -= rays[i].damage;rays.splice(i,1);};
            }
        };

        for (var i = enemys.length - 1; i >= 0; i--) {
            enemys[i].draw();
            enemys[i].bar.draw(ctx,enemys[i].x,enemys[i].y+14);
            enemys[i].update();
            if(enemys[i].y>canvas.height/4) enemys.splice(i,1);
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
                    player.chasetime = 30*60;
                }
                itens.splice(i,1);
                coinsnd.play();
            }
            else if (itens[i].y>canvas.height/4) itens.splice(i,1);
            else if (itens[i].time>664) itens.splice(i,1);
        };

        ctx.setTransform(3,0,0,3,0,0);

        ctx.fillStyle = "#fff"
        ctx.fillText(player.coincount,(canvas.width/24-(player.coincount+"").length)*8-10,1*8+2);
        ctx.fillText(player.score/10,2,1*8+2);
        drawSprite(ctx,coinimg,canvas.width/3-10,2);

        nPW = 0
        
        if (player.boosttime > 0){
            nPW += 1
            player.boosttime -= 1;
            drawPWlabel(ctx,nPW,player.boosttime,boostimg)
        }else player.frequency = 15;
        if (player.stengtime > 0){
            nPW += 1
            player.stengtime -= 1;
            drawPWlabel(ctx,nPW,player.stengtime,strenghtimg)
        }else player.damage = player.damage_;
        if (player.chasetime > 0){
            nPW += 1
            player.chasetime -= 1;
            drawPWlabel(ctx,nPW,player.chasetime,chaserimg)
        }else player.chasing = false;

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
        ctx.setTransform(3,0,0,3,0,0)

        ctx.textAlign = 'center'

        ctx.fillStyle = '#f00'
        ctx.fillText('You died', canvas.width/6, 20)

        ctx.scale(2,2);

        player.x = canvas.width/12-6
        player.y = canvas.height/24*3
        player.draw()


        ctx.fillStyle = '#0b0'
        ctx.fillRect(canvas.width/12-18,canvas.height/12-10,35,11)
        ctx.fillStyle = '#fff'
        ctx.fillText('Play', canvas.width/12, canvas.height/12)

        ctx.scale(1/2,1/2);

        if (touch.sx > canvas.width/2-18*6 && touch.sx < canvas.width/2+17*6){
            if (touch.sy > canvas.height/2-10*6 && touch.sy < canvas.height/2+6){
                player.x = canvas.width/8
                player.y = 192-16
                touch.x = null
                touch.y = null
                player.reset()
                enemys = []
                itens = []
                explosions = []
                rays = []
                ctx.textAlign = 'start'
                Gamestate = gsGAME
            }
        }

        setTimeout(update, 1000/30)

        // ctx.fillStyle = '#f00'
        // ctx.fillText('You died', 64, 20)

        // ctx.fillStyle = '#0b0'
        // ctx.fillRect(58+8,48+5,35,11)
        // ctx.fillStyle = '#fff'
        // ctx.fillText('Play', 76+8, 48+7)

        // ctx.scale(1/3,1/3);
        // ctx.fillText('Press Enter to play', 192, 240)

        // ctx.fillText('You made '+player.score+' points', 192, 110)

        // if (keys['Enter']){
        //     player.x = 120
        //     player.y = 192-16
        //     player.reset()
        //     enemys = []
        //     itens = []
        //     explosions = []
        //     rays = []
        //     ctx.textAlign = 'start'
        //     Gamestate = gsGAME
        // };
        // setTimeout(update, 1000/30)
    } 
}

function drawPWlabel(ctx,npw,timer,img) {
    ctx.fillText(Math.floor(timer/60)+1,10,(npw*8)+10)
    drawSprite(ctx,img,2,(npw*8)+2);
}

setTimeout(loading, 1000/30);

window.addEventListener("touchstart", function(e) {
    e.preventDefault();
    t = event.changedTouches[0];
    touch = {
        x:Math.floor(t.clientX),
        y:Math.floor(t.clientY),
        sx:Math.floor(t.clientX),
        sy:Math.floor(t.clientY),
    }
}, {passive: false});
window.addEventListener("touchend", function(e) {
    t = event.changedTouches[0];
    touch = {x:Math.floor(t.clientX),y:Math.floor(t.clientY)}
}, false);
window.addEventListener("touchmove", function(e) {
    t = event.changedTouches[0];
    touch = {x:Math.floor(t.clientX),y:Math.floor(t.clientY)}
}, false);
// window.addEventListener('keydown',function(e){keys[e.key] = true;},true);
// window.addEventListener('keyup',function(e){keys[e.key] = false;},true);