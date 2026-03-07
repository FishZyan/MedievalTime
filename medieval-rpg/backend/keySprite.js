const fs = require('fs');
const { PNG } = require('pngjs');

// Fast background keying script
fs.createReadStream('../frontend/src/assets/player.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function () {
    // Pure White background removal
    const isBgColor = (r, g, b) => {
        // High tolerance for white (anything super bright)
        return r > 240 && g > 240 && b > 240; 
    };

    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;

        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        
        if (isBgColor(r, g, b)) {
            this.data[idx + 3] = 0; // Alpha to 0
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('../frontend/src/assets/player.png'));
    console.log("White background keyed successfully!");
  });
