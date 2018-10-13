function Rect(x,y,w,h) {
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
}

function collide(rect1,rect2) {
    if (rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y) {
        return true;
    }
    return false;
}

function collideP(point1,rect2) {
    if (point1.x < rect2.x + rect2.w &&
        point1.x+1 > rect2.x &&
        point1.y < rect2.y + rect2.h &&
        point1.y+1 > rect2.y) {
        return true;
    }
    return false;
}
