function SpriteSheet (ctx,file) {
    this.ctx = ctx
    this.image = new Image()
    this.image.src = file

    this.get = function(x,y,size=15.9) {
        img = {
            src:this.image,
            ctx:this.ctx,
            sx:x,
            sy:y,
            size:15.9}
        img.size = size
        return img;
    }

    //this.draw = function(img,x,y) {
    //    this.ctx.drawImage(this.image,img.sx, img.sy, img.size, img.size, x, y, 16, 16)
    //};
}

function drawSprite(ctx,img,x,y) {
    ctx.drawImage(img.src,img.sx*16, img.sy*16, 16, 16, x, y, 16, 16)
}
