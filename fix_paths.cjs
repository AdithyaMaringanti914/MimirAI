const fs = require('fs');
const path = require('path');
function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let c = fs.readFileSync(fullPath, 'utf8');
      if (c.includes('/type Intent') || c.includes('/type SceneGraph')) {
         c = c.replace(/\/type Intent/g, '/Intent').replace(/\/type SceneGraph/g, '/SceneGraph');
         fs.writeFileSync(fullPath, c);
         console.log('Fixed', fullPath);
      }
    }
  });
}
walkDir(path.join(__dirname, 'src'));
walkDir(path.join(__dirname, 'packages'));
