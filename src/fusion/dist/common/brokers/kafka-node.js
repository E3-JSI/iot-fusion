var _0x4f0c=['fetch','min','setOffset','send','Publish\x20to\x20Kafka:\x20(err)',',\x20(data)','kafka-node','addPublisher','log','topic','HighLevelProducer','KafkaClient','kafka','producer','addListener','Connecting\x20to\x20Kafka:\x20','Consumer','client','config','offset','consumer','message','Message\x20Error:\x20','error','Consumer\x20Error:\x20','offsetOutOfRange','outOfRange'];(function(_0x17bf54,_0x2a5041){var _0x441821=function(_0x122b16){while(--_0x122b16){_0x17bf54['push'](_0x17bf54['shift']());}};var _0x4f1e74=function(){var _0x3797b8={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x5bd162,_0xca2b92,_0x51796c,_0x20c8cb){_0x20c8cb=_0x20c8cb||{};var _0x2b9cea=_0xca2b92+'='+_0x51796c;var _0x360510=0x0;for(var _0x360510=0x0,_0x516ffd=_0x5bd162['length'];_0x360510<_0x516ffd;_0x360510++){var _0x134ecb=_0x5bd162[_0x360510];_0x2b9cea+=';\x20'+_0x134ecb;var _0x4a9727=_0x5bd162[_0x134ecb];_0x5bd162['push'](_0x4a9727);_0x516ffd=_0x5bd162['length'];if(_0x4a9727!==!![]){_0x2b9cea+='='+_0x4a9727;}}_0x20c8cb['cookie']=_0x2b9cea;},'removeCookie':function(){return'dev';},'getCookie':function(_0x53c5d0,_0x259654){_0x53c5d0=_0x53c5d0||function(_0x1aa570){return _0x1aa570;};var _0x1e58e6=_0x53c5d0(new RegExp('(?:^|;\x20)'+_0x259654['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));var _0x5d00d4=function(_0x15328f,_0x34ddfe){_0x15328f(++_0x34ddfe);};_0x5d00d4(_0x441821,_0x2a5041);return _0x1e58e6?decodeURIComponent(_0x1e58e6[0x1]):undefined;}};var _0x5273f9=function(){var _0x3a65ba=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x3a65ba['test'](_0x3797b8['removeCookie']['toString']());};_0x3797b8['updateCookie']=_0x5273f9;var _0x307b4d='';var _0x47ea2b=_0x3797b8['updateCookie']();if(!_0x47ea2b){_0x3797b8['setCookie'](['*'],'counter',0x1);}else if(_0x47ea2b){_0x307b4d=_0x3797b8['getCookie'](null,'counter');}else{_0x3797b8['removeCookie']();}};_0x4f1e74();}(_0x4f0c,0xf9));var _0x2b6e=function(_0x28b4dd,_0x638b9b){_0x28b4dd=_0x28b4dd-0x0;var _0x5a1df2=_0x4f0c[_0x28b4dd];return _0x5a1df2;};var _0x3b9d01=function(){var _0x570d4e=!![];return function(_0x1c4bb3,_0x5a460c){var _0x56b648=_0x570d4e?function(){if(_0x5a460c){var _0x95d2be=_0x5a460c['apply'](_0x1c4bb3,arguments);_0x5a460c=null;return _0x95d2be;}}:function(){};_0x570d4e=![];return _0x56b648;};}();var _0x18a430=_0x3b9d01(this,function(){var _0x2c6a3d=function(){return'\x64\x65\x76';},_0x2e6942=function(){return'\x77\x69\x6e\x64\x6f\x77';};var _0x275f7f=function(){var _0x536046=new RegExp('\x5c\x77\x2b\x20\x2a\x5c\x28\x5c\x29\x20\x2a\x7b\x5c\x77\x2b\x20\x2a\x5b\x27\x7c\x22\x5d\x2e\x2b\x5b\x27\x7c\x22\x5d\x3b\x3f\x20\x2a\x7d');return!_0x536046['\x74\x65\x73\x74'](_0x2c6a3d['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x2e68be=function(){var _0x4c7ac4=new RegExp('\x28\x5c\x5c\x5b\x78\x7c\x75\x5d\x28\x5c\x77\x29\x7b\x32\x2c\x34\x7d\x29\x2b');return _0x4c7ac4['\x74\x65\x73\x74'](_0x2e6942['\x74\x6f\x53\x74\x72\x69\x6e\x67']());};var _0x399f77=function(_0x5c1e37){var _0x2da6ca=~-0x1>>0x1+0xff%0x0;if(_0x5c1e37['\x69\x6e\x64\x65\x78\x4f\x66']('\x69'===_0x2da6ca)){_0x34a413(_0x5c1e37);}};var _0x34a413=function(_0x7fcb27){var _0x40139a=~-0x4>>0x1+0xff%0x0;if(_0x7fcb27['\x69\x6e\x64\x65\x78\x4f\x66']((!![]+'')[0x3])!==_0x40139a){_0x399f77(_0x7fcb27);}};if(!_0x275f7f()){if(!_0x2e68be()){_0x399f77('\x69\x6e\x64\u0435\x78\x4f\x66');}else{_0x399f77('\x69\x6e\x64\x65\x78\x4f\x66');}}else{_0x399f77('\x69\x6e\x64\u0435\x78\x4f\x66');}});_0x18a430();let Broker=require('./abstract.js');const kafka=require(_0x2b6e('0x0'));class KafkaNodeBroker extends Broker{constructor(_0x24a323,_0x1d5600,_0x27500c){super(_0x24a323,_0x1d5600,_0x27500c);}[_0x2b6e('0x1')](){console[_0x2b6e('0x2')]('StreamFusion\x20HLP\x20for\x20Kafka:\x20'+this[_0x2b6e('0x3')]);let _0x1b53b9=kafka[_0x2b6e('0x4')];let _0x5e5ca8=new kafka[(_0x2b6e('0x5'))]({'kafkaHost':this['config'][_0x2b6e('0x6')]});this[_0x2b6e('0x7')]=new _0x1b53b9(_0x5e5ca8);}[_0x2b6e('0x8')](_0x5281a3){console[_0x2b6e('0x2')](_0x2b6e('0x9')+this['topic']);this[_0x2b6e('0xa')]=kafka[_0x2b6e('0xa')];this[_0x2b6e('0xb')]=new kafka[(_0x2b6e('0x5'))]({'kafkaHost':this[_0x2b6e('0xc')][_0x2b6e('0x6')]});this[_0x2b6e('0xd')]=new kafka['Offset'](this[_0x2b6e('0xb')]);let _0x54fbe2=this;this[_0x2b6e('0xe')]=new this[(_0x2b6e('0xa'))](this[_0x2b6e('0xb')],[{'topic':this[_0x2b6e('0x3')],'partition':0x0}],{'groupId':this['id']});this[_0x2b6e('0xe')]['on'](_0x2b6e('0xf'),function(_0x39f081){try{let _0x539da8=JSON['parse'](_0x39f081['value']);_0x5281a3(_0x539da8);}catch(_0x1d3d2b){console[_0x2b6e('0x2')](_0x2b6e('0x10'),_0x1d3d2b[_0x2b6e('0xf')]);}});this[_0x2b6e('0xe')]['on'](_0x2b6e('0x11'),function(_0x9587e6){console[_0x2b6e('0x2')](_0x2b6e('0x12'),_0x9587e6[_0x2b6e('0xf')]);});this[_0x2b6e('0xe')]['on'](_0x2b6e('0x13'),function(_0x2054fe){console[_0x2b6e('0x2')](_0x54fbe2['id'],_0x2b6e('0x14'),_0x2054fe);_0x2054fe['maxNum']=0x2;_0x54fbe2[_0x2b6e('0xd')][_0x2b6e('0x15')]([_0x2054fe],function(_0x519b63,_0x255996){if(_0x519b63){return console['error'](_0x519b63);}var _0x313000=Math[_0x2b6e('0x16')](_0x255996[_0x2054fe[_0x2b6e('0x3')]][_0x2054fe['partition']]);console[_0x2b6e('0x2')](_0x54fbe2);_0x54fbe2[_0x2b6e('0xe')][_0x2b6e('0x17')](_0x2054fe[_0x2b6e('0x3')],_0x2054fe['partition'],_0x313000);});});}['publish'](_0x1ee63a){this[_0x2b6e('0x7')][_0x2b6e('0x18')]([{'topic':this['topic'],'messages':_0x1ee63a}],function(_0x43fcf9,_0x7248e8){console['log'](_0x2b6e('0x19'),_0x43fcf9,_0x2b6e('0x1a'),_0x7248e8);});}}module['exports']=KafkaNodeBroker;