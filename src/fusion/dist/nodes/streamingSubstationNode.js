const a0_0xcea8=['MIN_SAFE_INTEGER','timeSeriesTick','powerEMA','return\x20/\x22\x20+\x20this\x20+\x20\x22/','addStreamAggr','previous','fusionNodeI','power','nodeid','currentTick','createAggregates','currentEMA','aggrConfigId','timestamp','apply','triggerOnAddCallbacks','newRecord','parent','lastvoltage','toISOString','createStore','log','voltage','getFloat','lastTimestamp','float','Time','datetime','fusionTick','store','constructor','^([^\x20]+(\x20+[^\x20]+)+)+[^\x20]}','exports','nodeId','base','test','current','processRecordCb','voltageEMA','rawRecord','rawstore','position','ema','./streamingNode.js'];(function(_0x3d23cd,_0xcea8e4){const _0x28467d=function(_0x177e43){while(--_0x177e43){_0x3d23cd['push'](_0x3d23cd['shift']());}},_0x3bfc6e=function(){const _0x29853e={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x3205d4,_0x1b0026,_0x2cf1a5,_0x10d43f){_0x10d43f=_0x10d43f||{};let _0x5e71b5=_0x1b0026+'='+_0x2cf1a5,_0x114419=0x0;for(let _0x30626e=0x0,_0x4a382b=_0x3205d4['length'];_0x30626e<_0x4a382b;_0x30626e++){const _0x380ca5=_0x3205d4[_0x30626e];_0x5e71b5+=';\x20'+_0x380ca5;const _0x1cfe35=_0x3205d4[_0x380ca5];_0x3205d4['push'](_0x1cfe35),_0x4a382b=_0x3205d4['length'],_0x1cfe35!==!![]&&(_0x5e71b5+='='+_0x1cfe35);}_0x10d43f['cookie']=_0x5e71b5;},'removeCookie':function(){return'dev';},'getCookie':function(_0x344b7a,_0x159e4a){_0x344b7a=_0x344b7a||function(_0xbf7de5){return _0xbf7de5;};const _0x406e72=_0x344b7a(new RegExp('(?:^|;\x20)'+_0x159e4a['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)')),_0x2169d0=function(_0x125b0b,_0x5e6df6){_0x125b0b(++_0x5e6df6);};return _0x2169d0(_0x28467d,_0xcea8e4),_0x406e72?decodeURIComponent(_0x406e72[0x1]):undefined;}},_0x4743a6=function(){const _0x17a299=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x17a299['test'](_0x29853e['removeCookie']['toString']());};_0x29853e['updateCookie']=_0x4743a6;let _0x3b4c0d='';const _0x404b32=_0x29853e['updateCookie']();if(!_0x404b32)_0x29853e['setCookie'](['*'],'counter',0x1);else _0x404b32?_0x3b4c0d=_0x29853e['getCookie'](null,'counter'):_0x29853e['removeCookie']();};_0x3bfc6e();}(a0_0xcea8,0x165));const a0_0x2846=function(_0x3d23cd,_0xcea8e4){_0x3d23cd=_0x3d23cd-0x0;let _0x28467d=a0_0xcea8[_0x3d23cd];return _0x28467d;};const a0_0x2cf1a5=function(){let _0x1aae43=!![];return function(_0x5264b4,_0x2e2ecd){const _0x88b5fc=_0x1aae43?function(){if(_0x2e2ecd){const _0x14814c=_0x2e2ecd[a0_0x2846('0x9')](_0x5264b4,arguments);return _0x2e2ecd=null,_0x14814c;}}:function(){};return _0x1aae43=![],_0x88b5fc;};}(),a0_0x1b0026=a0_0x2cf1a5(this,function(){const _0x3c64eb=function(){const _0x2b2b95=_0x3c64eb[a0_0x2846('0x19')](a0_0x2846('0x2a'))()['constructor'](a0_0x2846('0x1a'));return!_0x2b2b95[a0_0x2846('0x1e')](a0_0x1b0026);};return _0x3c64eb();});a0_0x1b0026();const streamingNode=require(a0_0x2846('0x26'));class streamingSubstationNode extends streamingNode{constructor(_0x6d87be,_0x5f5d69,_0x37cc17,_0x570f4f,_0x223e54,_0x88bf,_0x2a082e){super(_0x6d87be,_0x5f5d69,_0x37cc17,_0x570f4f,_0x223e54,_0x88bf,_0x2a082e),this[a0_0x2846('0x1')]=_0x88bf,this[a0_0x2846('0x20')]=_0x223e54,this[a0_0x2846('0xc')]=_0x2a082e,this[a0_0x2846('0x1c')]=_0x37cc17[a0_0x2846('0x3')],this['buffer']=[],this[a0_0x2846('0x24')]=0x0,this[a0_0x2846('0x13')]=Number[a0_0x2846('0x27')],this['lastcurrent']=0x0,this[a0_0x2846('0xd')]=0x0,this['base'][a0_0x2846('0xf')]({'name':this[a0_0x2846('0x1c')],'fields':[{'name':a0_0x2846('0x15'),'type':a0_0x2846('0x16')},{'name':a0_0x2846('0x1f'),'type':a0_0x2846('0x14')},{'name':a0_0x2846('0x11'),'type':'float'},{'name':'power','type':a0_0x2846('0x14')}]}),this[a0_0x2846('0x23')]=this[a0_0x2846('0x1d')][a0_0x2846('0x18')](this[a0_0x2846('0x1c')]),this[a0_0x2846('0x4')]=this[a0_0x2846('0x23')]['addStreamAggr']({'type':a0_0x2846('0x28'),'timestamp':'Time','value':a0_0x2846('0x1f')}),this[a0_0x2846('0x6')]=this['rawstore'][a0_0x2846('0x2b')]({'type':a0_0x2846('0x25'),'inAggr':this[a0_0x2846('0x4')],'emaType':a0_0x2846('0x0'),'interval':0xf*0x3c*0x3e8,'initWindow':0x0}),this['voltageTick']=this['rawstore'][a0_0x2846('0x2b')]({'type':a0_0x2846('0x28'),'timestamp':a0_0x2846('0x15'),'value':a0_0x2846('0x11')}),this[a0_0x2846('0x21')]=this[a0_0x2846('0x23')]['addStreamAggr']({'type':'ema','inAggr':this['voltageTick'],'emaType':a0_0x2846('0x0'),'interval':0xf*0x3c*0x3e8,'initWindow':0x0}),this['powerTick']=this[a0_0x2846('0x23')]['addStreamAggr']({'type':a0_0x2846('0x28'),'timestamp':a0_0x2846('0x15'),'value':a0_0x2846('0x2')}),this[a0_0x2846('0x29')]=this[a0_0x2846('0x23')][a0_0x2846('0x2b')]({'type':a0_0x2846('0x25'),'inAggr':this['voltageTick'],'emaType':a0_0x2846('0x0'),'interval':0xf*0x3c*0x3e8,'initWindow':0x0}),super[a0_0x2846('0x5')](_0x570f4f[_0x37cc17[a0_0x2846('0x7')]]),super['postConstructor']();}['processRecord'](_0x10952a){let _0x3045d5=_0x10952a[a0_0x2846('0x8')];if(this[a0_0x2846('0x13')]<_0x3045d5){let _0x267606=new Date(_0x3045d5),_0x8c0216;isNaN(_0x267606)==!![]?_0x8c0216=0x0:_0x8c0216=_0x267606[a0_0x2846('0xe')]();let _0x266ef9=!('current'in _0x10952a)||isNaN(_0x10952a[a0_0x2846('0x1f')])||_0x10952a['current']==null,_0x3b8b00=!('voltage'in _0x10952a)||isNaN(_0x10952a[a0_0x2846('0x11')])||_0x10952a[a0_0x2846('0x11')]==null,_0x2c895c=_0x266ef9?this[a0_0x2846('0x6')]['getFloat']():_0x10952a['current'],_0x25e81c=_0x3b8b00?this[a0_0x2846('0x21')][a0_0x2846('0x12')]():_0x10952a[a0_0x2846('0x11')],_0x1244a1=_0x266ef9&&_0x3b8b00?this[a0_0x2846('0x29')][a0_0x2846('0x12')]():_0x2c895c*_0x25e81c;this[a0_0x2846('0x22')]=this[a0_0x2846('0x23')][a0_0x2846('0xb')]({'Time':_0x8c0216,'current':_0x2c895c,'voltage':_0x25e81c,'power':_0x1244a1}),this[a0_0x2846('0x23')][a0_0x2846('0xa')](this['rawRecord']);let _0x5346a0=super['getAggregates'](),_0x2fc9e3=_0x5346a0;_0x2fc9e3['stampm']=_0x3045d5,_0x2fc9e3['current']=this['lastcurrent'],_0x2fc9e3[a0_0x2846('0x11')]=this['lastvoltage'];_0x3045d5%this[a0_0x2846('0x17')]==0x0&&(this['buffer']['push'](_0x2fc9e3),super['broadcastAggregates'](_0x5346a0),this[a0_0x2846('0x20')](this[a0_0x2846('0x1')],this['parent']));;}else console[a0_0x2846('0x10')]('PROBLEM:\x20SubstationNode\x20timeline\x20problem.');}}module[a0_0x2846('0x1b')]=streamingSubstationNode;