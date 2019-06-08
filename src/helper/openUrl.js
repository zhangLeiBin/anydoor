//调用系统的默认命令在项目启动的时候，默认打开url
const {exec} = require('child_process');

module.exports = url => {
  switch (process.platform) {
    case 'darwin':
      exec(`open ${url}`);
      break; 
    case 'win32':
      exec(`start ${url}`);
      break;
  }
}