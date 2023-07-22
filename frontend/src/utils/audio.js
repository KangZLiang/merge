class DeCarouselAudio {
  num = 0;
  srcs = []
  callback = null
  next = null

  constructor() {
    this.audio = new Audio()
    this.listener()
  }

  plays(srcs = [], callback) {
    this.num = 0
    this.srcs = srcs
    this.callback = callback
    this.playOne()
  }

  pause() {
    this.audio.pause()
  }

  clear() {
    this.srcs = []
    this.pause()
  }


  async playOne() {
    if (this.num >= this.srcs.length) {
      this.num = 0
    }

    let url = this.srcs[this.num]
    await this.delay(1000)
    if (url) {
      if (this.srcs[this.num + 1]) {
        this.next = this.srcs[this.num + 1]
      } else {
        this.next = this.srcs[0]
      }

      this.audio.pause()
      this.audio.src = url["voiceName"]
      this.audio.load()
      this.audio.play()
      this.num++

    }
  }


  listener() {
    this.audio.addEventListener("ended", () => {
      this.playOne()
      typeof this.callback === "function" && this.callback(this.next)
    })
  }

  delay(time = 500) {
    return new Promise((success, error) => {
      setTimeout(() => {
        success()
      }, time)
    })
  }
}


export default new DeCarouselAudio()
