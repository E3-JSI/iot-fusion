const a0_0x4349=['^([^\x20]+(\x20+[^\x20]+)+)+[^\x20]}','return\x20/\x22\x20+\x20this\x20+\x20\x22/','value','apply','EMA','save','predict','qminer','options','load','exports','test','constructor'];(function(_0x4ecd93,_0x43491f){const _0x52bb68=function(_0x3187be){while(--_0x3187be){_0x4ecd93['push'](_0x4ecd93['shift']());}},_0x226913=function(){const _0x52a9cd={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0xb6710b,_0x4ef9fa,_0xb431df,_0x49ffd){_0x49ffd=_0x49ffd||{};let _0x46ff8e=_0x4ef9fa+'='+_0xb431df,_0x276505=0x0;for(let _0x19354d=0x0,_0x85bb05=_0xb6710b['length'];_0x19354d<_0x85bb05;_0x19354d++){const _0x3edce5=_0xb6710b[_0x19354d];_0x46ff8e+=';\x20'+_0x3edce5;const _0xd8cfa3=_0xb6710b[_0x3edce5];_0xb6710b['push'](_0xd8cfa3),_0x85bb05=_0xb6710b['length'],_0xd8cfa3!==!![]&&(_0x46ff8e+='='+_0xd8cfa3);}_0x49ffd['cookie']=_0x46ff8e;},'removeCookie':function(){return'dev';},'getCookie':function(_0x336d32,_0x7561c2){_0x336d32=_0x336d32||function(_0x434f32){return _0x434f32;};const _0x4ff066=_0x336d32(new RegExp('(?:^|;\x20)'+_0x7561c2['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)')),_0x40da10=function(_0x3d4a66,_0x5ec787){_0x3d4a66(++_0x5ec787);};return _0x40da10(_0x52bb68,_0x43491f),_0x4ff066?decodeURIComponent(_0x4ff066[0x1]):undefined;}},_0x2b352e=function(){const _0x1de12e=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x1de12e['test'](_0x52a9cd['removeCookie']['toString']());};_0x52a9cd['updateCookie']=_0x2b352e;let _0x11a699='';const _0x2ab62d=_0x52a9cd['updateCookie']();if(!_0x2ab62d)_0x52a9cd['setCookie'](['*'],'counter',0x1);else _0x2ab62d?_0x11a699=_0x52a9cd['getCookie'](null,'counter'):_0x52a9cd['removeCookie']();};_0x226913();}(a0_0x4349,0x1af));const a0_0x52bb=function(_0x4ecd93,_0x43491f){_0x4ecd93=_0x4ecd93-0x0;let _0x52bb68=a0_0x4349[_0x4ecd93];return _0x52bb68;};const a0_0xb431df=function(){let _0x1d6305=!![];return function(_0x2d89a1,_0x31d33f){const _0x48eb1e=_0x1d6305?function(){if(_0x31d33f){const _0x564c8a=_0x31d33f[a0_0x52bb('0x1')](_0x2d89a1,arguments);return _0x31d33f=null,_0x564c8a;}}:function(){};return _0x1d6305=![],_0x48eb1e;};}(),a0_0x4ef9fa=a0_0xb431df(this,function(){const _0x45bf6e=function(){const _0x443fee=_0x45bf6e[a0_0x52bb('0xa')](a0_0x52bb('0xc'))()[a0_0x52bb('0xa')](a0_0x52bb('0xb'));return!_0x443fee[a0_0x52bb('0x9')](a0_0x4ef9fa);};return _0x45bf6e();});a0_0x4ef9fa();const qm=require(a0_0x52bb('0x5')),la=require(a0_0x52bb('0x5'))['la'],fs=require('fs'),AbstractIncrementalModel=require('./abstractIncrementalModel');class EMAIncrementalModel extends AbstractIncrementalModel{constructor(_0x420f88,_0x6d89f2){super(_0x420f88,_0x6d89f2),this[a0_0x52bb('0x6')]=_0x420f88,this[a0_0x52bb('0x0')]=0x0;let _0x570758=_0x420f88['N']!==undefined?_0x420f88['N']:0x5;this['k']=0x2/(_0x570758+0x1),this[a0_0x52bb('0x2')]=null;}['partialFit'](_0x59b962,_0x576400){this[a0_0x52bb('0x2')]===null?this[a0_0x52bb('0x2')]=_0x576400:this['EMA']=_0x576400*this['k']+(0x1-this['k'])*this['EMA'];}[a0_0x52bb('0x4')](_0x30b1ea){return this[a0_0x52bb('0x2')];}[a0_0x52bb('0x3')](_0x4b47b4){}[a0_0x52bb('0x7')](_0x2d9b5c){}}module[a0_0x52bb('0x8')]=EMAIncrementalModel;