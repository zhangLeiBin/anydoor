/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-console */
/* eslint-disable no-undef */
const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./config/defaultConfig');
const fs = require('fs');


const server = http.createServer((req, res) => {
    const filePath = path.join(conf.root, req.url); //获取文件路径
    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-type','text/plain');
            res.end(`${filePath} is not a directory or file`);
            return;
        }
        if (stats.isFile()) { //判断是否为文件
            res.statusCode = 200;
            res.setHeader('Content-type', 'text/html');

            //该方法会将文件读取完成后返回给客户端,响应速度较慢
            // fs.readFile(filePath, (err, data) => {
            // 	res.end(data);
            // })

            //将文件以流的形式,一点一点的返回给客户端
            fs.createReadStream(filePath).pipe(res); 
        } else if (stats.isDirectory()){ //是否为文件夹
            fs.readdir(filePath, (err, files) => {
                if (err) {
                    return;	
                }
			    res.statusCode = 200;
                res.setHeader('Content-type', 'text/html');	
                res.end(files.join(',<br/>'));
            });
        } 
    });

    // res.statusCode = 200;
    // res.setHeader('Content-type', 'text/html');
    // res.write('<html>');
    // res.write('<body>');
    // res.write('hello http server');
    // res.write('</body>');
    // res.end(filePath);
});

server.listen(conf.port,conf.hostname, () => {
    const addr = `http://${conf.hostname}:${conf.port}`;
    console.info(`Server started at ${chalk.green(addr)}`);
});


 
