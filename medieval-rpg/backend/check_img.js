const sharp = require('sharp');

sharp('../frontend/src/assets/player.png')
  .metadata()
  .then(function(metadata) {
    console.log(`Width: ${metadata.width}, Height: ${metadata.height}`);
  })
  .catch(function(err) {
    console.log(err);
  });
