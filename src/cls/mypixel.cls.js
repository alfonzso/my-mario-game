
 class MyPixels {
  x = 0;
  y = 0;
  neightb = []
  id = ""

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = `${x}${y}`
  }

  neightbourCalculator() {
    this.neightb.push([new MyPixels(this.x - 1, this.y - 1), new MyPixels(this.x, this.y - 1), new MyPixels(this.x + 1, this.y - 1),])
    this.neightb.push([new MyPixels(this.x - 1, this.y), new MyPixels(this.x + 1, this.y),])
    this.neightb.push([new MyPixels(this.x - 1, this.y + 1), new MyPixels(this.x, this.y + 1), new MyPixels(this.x + 1, this.y + 1),])
  }
}

class OrderedMyPixel{
  pixel = null
  orderNumber = -1

  constructor(pxl, order){
    this.pixel = pxl
    this.orderNumber = order
  }
}

export {
  MyPixels,
  OrderedMyPixel
}