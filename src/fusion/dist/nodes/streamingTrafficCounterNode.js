var _0x2032=['broadcastAggregates','fusionNodeI','exports','./streamingNode.js','processRecordCb','parent','nodeId','position','base','Time','datetime','carno','float','store','lastTimestamp','aggrConfigId','postConstructor','processRecord','stampm','log','Traffic\x20Counter\x20-\x20double\x20timestamp.','Traffic\x20Counter\x20-\x20timestamp\x20is\x20NaN!','rawstore','triggerOnAddCallbacks','rawRecord','getAggregates','buffer','push'];(function(_0x21d928,_0x3e04de){var _0x315cac=function(_0x410d3e){while(--_0x410d3e){_0x21d928['push'](_0x21d928['shift']());}};var _0x68a545=function(){var _0x47a388={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x8f4fbe,_0x43d667,_0x2f3f6a,_0x5d2a11){_0x5d2a11=_0x5d2a11||{};var _0x1e0f21=_0x43d667+'='+_0x2f3f6a;var _0x4edf24=0x0;for(var _0x4edf24=0x0,_0x3689e3=_0x8f4fbe['length'];_0x4edf24<_0x3689e3;_0x4edf24++){var _0x2a875e=_0x8f4fbe[_0x4edf24];_0x1e0f21+=';\x20'+_0x2a875e;var _0x3347dc=_0x8f4fbe[_0x2a875e];_0x8f4fbe['push'](_0x3347dc);_0x3689e3=_0x8f4fbe['length'];if(_0x3347dc!==!![]){_0x1e0f21+='='+_0x3347dc;}}_0x5d2a11['cookie']=_0x1e0f21;},'removeCookie':function(){return'dev';},'getCookie':function(_0x481b1b,_0x17bb64){_0x481b1b=_0x481b1b||function(_0x25faa9){return _0x25faa9;};var _0x3ecc9a=_0x481b1b(new RegExp('(?:^|;\x20)'+_0x17bb64['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x48b617=function(_0x5bd7d7,_0x8da769){_0x5bd7d7(++_0x8da769);};_0x48b617(_0x315cac,_0x3e04de);return _0x3ecc9a?decodeURIComponent(_0x3ecc9a[0x1]):undefined;}};var _0x3c6505=function(){var _0x17ebfa=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x17ebfa['test'](_0x47a388['removeCookie']['toString']());};_0x47a388['updateCookie']=_0x3c6505;var _0x2b0618='';var _0x4cd075=_0x47a388['updateCookie']();if(!_0x4cd075){_0x47a388['setCookie'](['*'],'counter',0x1);}else if(_0x4cd075){_0x2b0618=_0x47a388['getCookie'](null,'counter');}else{_0x47a388['removeCookie']();}};_0x68a545();}(_0x2032,0xc7));var _0x1add=function(_0x4b315c,_0x2d152c){_0x4b315c=_0x4b315c-0x0;var _0x35a9d1=_0x2032[_0x4b315c];return _0x35a9d1;};var _0x204fab=function(){var _0x1bedd3=!![];return function(_0x119bb3,_0x23f794){var _0x4b44fb=_0x1bedd3?function(){if(_0x23f794){var _0x1eec77=_0x23f794['apply'](_0x119bb3,arguments);_0x23f794=null;return _0x1eec77;}}:function(){};_0x1bedd3=![];return _0x4b44fb;};}();var _0x9748f4=_0x204fab(this,function(){var _0x58789d=function(){return'\x64\x65\x76';},_0x442980=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x306119=function(){var _0x2911d8=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x2911d8['\x74\x65\x73\x74'](_0x58789d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2fb44b=function(){var _0x11a499=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x11a499['\x74\x65\x73\x74'](_0x442980['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2dd724=function(_0x1c4522){var _0x30050b=~-0x1>>0x1+0xff%0x0;if(_0x1c4522['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x30050b)){_0x5544aa(_0x1c4522);}};var _0x5544aa=function(_0x1a66bf){var _0x1d8199=~-0x4>>0x1+0xff%0x0;if(_0x1a66bf['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x1d8199){_0x2dd724(_0x1a66bf);}};if(!_0x306119()){if(!_0x2fb44b()){_0x2dd724('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x2dd724('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x2dd724('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x9748f4();const streamingNode=require(_0x1add('0x0'));class streamingTrafficCounterNode extends streamingNode{constructor(_0x54d9ea,_0xfd52d4,_0x31e3ae,_0x306cee,_0x6d4263,_0x5dc88e,_0x1a4cd3){super(_0x54d9ea,_0xfd52d4,_0x31e3ae,_0x306cee,_0x6d4263,_0x5dc88e,_0x1a4cd3);this['fusionNodeI']=_0x5dc88e;this[_0x1add('0x1')]=_0x6d4263;this[_0x1add('0x2')]=_0x1a4cd3;this[_0x1add('0x3')]=_0x31e3ae['nodeid'];this['buffer']=[];this[_0x1add('0x4')]=0x0;this[_0x1add('0x5')]['createStore']({'name':this[_0x1add('0x3')],'fields':[{'name':_0x1add('0x6'),'type':_0x1add('0x7')},{'name':_0x1add('0x8'),'type':_0x1add('0x9')},{'name':'v','type':_0x1add('0x9')}]});this['rawstore']=this[_0x1add('0x5')][_0x1add('0xa')](this[_0x1add('0x3')]);this[_0x1add('0xb')]=0x0;super['createAggregates'](_0x306cee[_0x31e3ae[_0x1add('0xc')]]);super[_0x1add('0xd')]();}[_0x1add('0xe')](_0x4d44ed){let _0x48a255={};let _0x54a3b1=_0x4d44ed[_0x1add('0xf')];let _0x16b36e=isNaN(_0x4d44ed[_0x1add('0x8')])||_0x4d44ed[_0x1add('0x8')]==null?0x0:_0x4d44ed[_0x1add('0x8')];let _0x1e00fb=isNaN(_0x4d44ed['v'])||_0x4d44ed['v']==null?0x0:_0x4d44ed['v'];if(_0x54a3b1<=this[_0x1add('0xb')]){console[_0x1add('0x10')](_0x1add('0x11'));return;}if(isNaN(_0x54a3b1)){console[_0x1add('0x10')](_0x1add('0x12'));return;}this['rawRecord']=this[_0x1add('0x13')]['newRecord']({'Time':_0x54a3b1,'carno':_0x16b36e,'v':_0x1e00fb});this[_0x1add('0x13')][_0x1add('0x14')](this[_0x1add('0x15')]);this[_0x1add('0xb')]=_0x54a3b1;let _0x4ec92a=super[_0x1add('0x16')]();let _0x13492c=_0x4ec92a;_0x13492c[_0x1add('0x8')]=_0x16b36e;_0x13492c['v']=_0x1e00fb;this[_0x1add('0x17')][_0x1add('0x18')](_0x13492c);super[_0x1add('0x19')](_0x4ec92a);this[_0x1add('0x1')](this[_0x1add('0x1a')],this['parent']);}}module[_0x1add('0x1b')]=streamingTrafficCounterNode;