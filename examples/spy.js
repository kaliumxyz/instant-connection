#!/usr/bin/env node
'use strict';
const Connection = require('../');
const connection = new Connection(process.argv[2]);

// we do not want the bot to have a name as it is a spy

// log any posts
let log = [];

connection.once('ready', _ => {
	connection.flag = 0;
	connection.on('unicast', (json) => {
		if (json.from === connection.from && connection.flag === 1) {
			connection.flag = 2;
      log = json.data.data;
      print(map_comments(log))
		}
		if (connection.flag === 0 && json.data)
			if (json.data.length > 10) {
				connection.from = json.from;
				connection.flag = 1;
				connection.unicast({key: 'initial', type: 'log-request'}, json.from);
			}
	});
	connection.broadcast({type: 'log-query'});
	connection.on('post', data => {
    log.push(data.data);
    print(map_comments(log));
  });
});

function map_comments(list) {
  const map = [];
  const tree = [];

  function resolve(node){
    map[node.id] = node
    let parent = node.parent;
    if(parent) {
      if (map[parent]) {
        if (map[parent].children) {
           if (!map[node.parent].children.find(x => x.id === node.id))
              map[parent].children.push(node);
        } else {
          map[parent].children = [];
          map[parent].children.push(node);
        }
      } else { // node does not exist
        map[parent] = {
          children: [node]
        }
      }
    }
  }

  // mutates map
  list.forEach(x => resolve(x));

	Object.keys(map).forEach(key => {
    if(!map[key].parent && map[key].nick)
      tree.push(map[key]);
  });
  return tree;
}


function print(tree, depth = 0, is_last_child_of_root = false) {
  tree.forEach((x, i) => {
    if (depth === 1)
        is_last_child_of_root = i == tree.length-1;
    let padding = "";
    let extended_padding = "";
    for (let i=0; i < x.nick.length + 2; i++) {
      extended_padding += " ";
    }
    for (let i=0; i < depth; i++) {
      padding += "─";
      extended_padding += " ";
    }
    let last = i == tree.length-1;
    let text = x.text.replace(/(\r\n|\n|\r)/gm, `\n${extended_padding}`); //@Xyzzy you want this.
    if (x.children) {
      console.log(`${depth>0?"├":"┌"}${padding}${x.nick} ${text}`);
      print(x.children, depth + 1, is_last_child_of_root);
    } else {
      console.log(`${depth>0?last?is_last_child_of_root?"└":"├":"├":"╶"}${padding}${x.nick} ${text}`);
    }
  });
}
