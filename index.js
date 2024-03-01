const {
   spawn
} = require('child_process')
const path = require('path')

const pluginsPath = path.join(__dirname, 'plugins');

fs.readdirSync(pluginsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const pluginPath = path.join(pluginsPath, file);
    const plugin = require(pluginPath);
    plugin(bot, openai, settings.botOwnerId);
  });

function start() {
   let args = [path.join(__dirname, 'case.js'), ...process.argv.slice(2)]
   console.log([process.argv[0], ...args].join('\n'))
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', data => {
         if (data == 'reset') {
            console.log('Restarting Bot...')
            p.kill()
            start()
            delete p
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code)
         if (code == '.' || code == 1 || code == 0) start()
      })
}
start()
