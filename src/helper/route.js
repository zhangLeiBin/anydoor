/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const chalk = require('chalk');
/** 
 * 代码中使用大量的回调,此处使用promisify包装回调
 * 
 */
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const tplPath = path.join(__dirname, '../template/dir.tpl'); //此处使用拼接,获取模板的绝对路径
// console.log(chalk.red(tplPath));
const soure = fs.readFileSync(tplPath,'utf-8'); //获取到模板文件
// console.log(chalk.red(soure));
const template = Handlebars.compile(soure);
// console.log(template.toString());

// const config = require('../config/defaultConfig');

const mime = require('./mime');

const compress = require('./compress');
const range = require('./range');

const isFresh = require('./cache');





module.exports = async function (req, res, filePath,config) {
	try {
		const stats = await stat(filePath);
		if (stats.isFile()) {
			res.statusCode = 200;
			const contentType = mime(filePath);
			res.setHeader('Content-type', contentType);

			if(isFresh(stats, req, res)) {
				res.statusCode = 304;
				res.end();
				return
			}

			let rs;
			const {code, start, end} = range(stats.size, req, res); 
			if(code === 200){
				rs = fs.createReadStream(filePath);
			}else{
				rs = fs.createReadStream(filePath, {start, end});
			}

			if(filePath.match(config.compress)){
				rs = compress(rs, req, res); //文件压缩
			}
			rs.pipe(res);


		} else if (stats.isDirectory()) {
			const files = await readdir(filePath);
			res.statusCode = 200;
			res.setHeader('Content-type', 'text/html');
			const dir = path.relative(config.root, filePath);
			const data = {
				tilte: path.basename(filePath),
				dir: dir ? `/${dir}`: '',
				files:files.map(file => {
					return {
						file,
						icon: mime(file)
					}
				})
			}
			// res.end(files.join(',\n'));
			res.end(template(data));
		}
	} catch (ex) {
		// console.error(ex);

		res.statusCode = 404;
		res.setHeader('Content-type', 'text/plain');
		res.end(`${filePath} is not a directory or file\n ${ex.toString()}`);
	}
}