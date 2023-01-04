export class MyPixels {
  // hash = ""
  x = 0;
  y = 0;
  neightb = []

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // async genHash() {
  //   this.hash = await objHash(this)
  // }

  neightbourCalculator() {
    this.neightb.push([new MyPixels(this.x - 1, this.y - 1), new MyPixels(this.x, this.y - 1), new MyPixels(this.x + 1, this.y - 1),])
    this.neightb.push([new MyPixels(this.x - 1, this.y), new MyPixels(this.x + 1, this.y),])
    this.neightb.push([new MyPixels(this.x - 1, this.y + 1), new MyPixels(this.x, this.y + 1), new MyPixels(this.x + 1, this.y + 1),])
  }
}
