const a0_0x479c=['EMA\x20model','update\x20model\x20-\x20first\x20time','assert','object','update\x20incremental\x20model\x20-\x20first\x20time','updateStream','incremental\x20learning\x20component\x20-\x20StructuredEMA','equal','ilSEMA\x20instantiated','predict','ilEMA\x20instantiated','imEMA\x20instantiated','qminer','SEMA\x20model','EMA','update\x20model\x20-\x20with\x20value\x2040','test','incremental\x20learning\x20component\x20-\x20RecLinReg','constructor','initial\x20prediction','model','options','partialFit','deepEqual','imSEMA\x20instantiated','apply','RecLinReg','fakeFusion','ilRecLinReg\x20instantiated','incremental\x20model','StructuredEMA','update\x20model\x20-\x209\x20more\x20times'];(function(_0x208168,_0x479c70){const _0x3a82e4=function(_0x4177b3){while(--_0x4177b3){_0x208168['push'](_0x208168['shift']());}},_0xd83d2c=function(){const _0x44dbd1={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x3a978b,_0x316dcf,_0x1b531a,_0x475193){_0x475193=_0x475193||{};let _0x15e742=_0x316dcf+'='+_0x1b531a,_0xa898bd=0x0;for(let _0x527d1d=0x0,_0x575b43=_0x3a978b['length'];_0x527d1d<_0x575b43;_0x527d1d++){const _0x5b5e83=_0x3a978b[_0x527d1d];_0x15e742+=';\x20'+_0x5b5e83;const _0x31e68b=_0x3a978b[_0x5b5e83];_0x3a978b['push'](_0x31e68b),_0x575b43=_0x3a978b['length'],_0x31e68b!==!![]&&(_0x15e742+='='+_0x31e68b);}_0x475193['cookie']=_0x15e742;},'removeCookie':function(){return'dev';},'getCookie':function(_0x5316b5,_0x4d45a6){_0x5316b5=_0x5316b5||function(_0xb41c02){return _0xb41c02;};const _0x47c553=_0x5316b5(new RegExp('(?:^|;\x20)'+_0x4d45a6['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)')),_0x5dee70=function(_0x4343be,_0x1e15b0){_0x4343be(++_0x1e15b0);};return _0x5dee70(_0x3a82e4,_0x479c70),_0x47c553?decodeURIComponent(_0x47c553[0x1]):undefined;}},_0x4b4064=function(){const _0x23e3e1=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0x23e3e1['test'](_0x44dbd1['removeCookie']['toString']());};_0x44dbd1['updateCookie']=_0x4b4064;let _0x94a68b='';const _0x2848d5=_0x44dbd1['updateCookie']();if(!_0x2848d5)_0x44dbd1['setCookie'](['*'],'counter',0x1);else _0x2848d5?_0x94a68b=_0x44dbd1['getCookie'](null,'counter'):_0x44dbd1['removeCookie']();};_0xd83d2c();}(a0_0x479c,0xec));const a0_0x3a82=function(_0x208168,_0x479c70){_0x208168=_0x208168-0x0;let _0x3a82e4=a0_0x479c[_0x208168];return _0x3a82e4;};const a0_0x1b531a=function(){let _0x242e03=!![];return function(_0x4a23e8,_0x43a8f2){const _0x33354f=_0x242e03?function(){if(_0x43a8f2){const _0x434d15=_0x43a8f2[a0_0x3a82('0xd')](_0x4a23e8,arguments);return _0x43a8f2=null,_0x434d15;}}:function(){};return _0x242e03=![],_0x33354f;};}(),a0_0x316dcf=a0_0x1b531a(this,function(){const _0x3e0144=function(){const _0x2610e7=_0x3e0144[a0_0x3a82('0x6')]('return\x20/\x22\x20+\x20this\x20+\x20\x22/')()['constructor']('^([^\x20]+(\x20+[^\x20]+)+)+[^\x20]}');return!_0x2610e7[a0_0x3a82('0x4')](a0_0x316dcf);};return _0x3e0144();});a0_0x316dcf();const IncrementalLearning=require('../models/IncrementalLearning'),EMAIncrementalModel=require('../models/EMA'),StructuredEMAIncrementalModel=require('../models/StructuredEMA'),fileManager=require('../common/utils/fileManager.js'),qm=require(a0_0x3a82('0x0')),fs=require('fs');var assert=require(a0_0x3a82('0x16'));const modelConfigEMA={'fusionTick':0x36ee80,'model':{'horizon':0x3,'label':0x0,'options':{'method':a0_0x3a82('0x2')}}},modelConfigRecLinReg={'fusionTick':0x36ee80,'model':{'horizon':0x3,'label':0x0,'options':{'method':a0_0x3a82('0xe')}}},modelConfigSEMA={'fusionTick':0x36ee80,'model':{'horizon':0x3,'label':0x0,'options':{'structuralFactorPosition':0x1,'method':a0_0x3a82('0x12')}}},fakeFusion={'fusion_id':a0_0x3a82('0xf')};describe(a0_0x3a82('0x11'),function(){let _0x206ab3;before(function(){ilEMA=new IncrementalLearning(modelConfigEMA,fakeFusion),ilRecLinReg=new IncrementalLearning(modelConfigRecLinReg,fakeFusion),ilSEMA=new IncrementalLearning(modelConfigSEMA,fakeFusion),imEMA=new EMAIncrementalModel(modelConfigEMA[a0_0x3a82('0x8')]['options'],fakeFusion),imSEMA=new StructuredEMAIncrementalModel(modelConfigSEMA[a0_0x3a82('0x8')][a0_0x3a82('0x9')],fakeFusion);}),after(function(){}),describe(a0_0x3a82('0x14'),function(){it(a0_0x3a82('0x1f'),function(){assert[a0_0x3a82('0x1b')](typeof imEMA,a0_0x3a82('0x17'));}),it(a0_0x3a82('0x7'),function(){assert[a0_0x3a82('0x1b')](imEMA[a0_0x3a82('0x1d')](),null);}),it('update\x20model\x20-\x20first\x20time',function(){imEMA[a0_0x3a82('0xa')]([],0x2a),assert[a0_0x3a82('0x1b')](imEMA[a0_0x3a82('0x1d')](),0x2a);}),it('update\x20model\x20-\x209\x20more\x20times',function(){for(let _0x4c436d=0x0;_0x4c436d<0x9;_0x4c436d++){imEMA['partialFit']([],0x2a);};assert[a0_0x3a82('0x1b')](imEMA[a0_0x3a82('0x1d')](),0x2a);}),it(a0_0x3a82('0x3'),function(){imEMA[a0_0x3a82('0xa')]([],0x28),assert[a0_0x3a82('0x1b')](imEMA[a0_0x3a82('0x1d')](),41.333333333333336);});}),describe(a0_0x3a82('0x1'),function(){it(a0_0x3a82('0xc'),function(){assert[a0_0x3a82('0x1b')](typeof imSEMA,a0_0x3a82('0x17'));}),it(a0_0x3a82('0x7'),function(){assert['equal'](imSEMA[a0_0x3a82('0x1d')]([0x0,0x0]),null);}),it(a0_0x3a82('0x15'),function(){imSEMA[a0_0x3a82('0xa')]([0x0,0x0],0x2a),assert['equal'](imSEMA[a0_0x3a82('0x1d')]([0x0,0x0]),0x2a);}),it(a0_0x3a82('0x13'),function(){for(let _0x559e4e=0x0;_0x559e4e<0x9;_0x559e4e++){imSEMA[a0_0x3a82('0xa')]([0x0,0x0],0x2a);};assert['equal'](imSEMA[a0_0x3a82('0x1d')]([0x0,0x0]),0x2a);}),it('update\x20model\x20-\x20with\x20value\x2040',function(){imSEMA[a0_0x3a82('0xa')]([0x0,0x0],0x28),assert[a0_0x3a82('0x1b')](imSEMA[a0_0x3a82('0x1d')]([0x0,0x0]),41.333333333333336);}),it('update\x20many\x20different\x20models',function(){for(let _0x561fa2=0x0;_0x561fa2<0x3;_0x561fa2++){for(let _0x22a34f=0x0;_0x22a34f<0x18;_0x22a34f++){imSEMA[a0_0x3a82('0xa')]([0x0,_0x22a34f],_0x22a34f+_0x561fa2);}}for(let _0x4ea885=0x1;_0x4ea885<0x18;_0x4ea885++){assert[a0_0x3a82('0x1b')](imSEMA['predict']([0x0,_0x4ea885])['toFixed'](0x5),_0x4ea885+0.88889);}});}),describe('incremental\x20learning\x20component\x20-\x20EMA',function(){it(a0_0x3a82('0x1e'),function(){assert[a0_0x3a82('0x1b')](typeof ilEMA,a0_0x3a82('0x17'));}),it(a0_0x3a82('0x18'),function(){assert[a0_0x3a82('0xb')](ilEMA[a0_0x3a82('0x19')]([0x2a,0x0],0x0),{'ts':0xa4cb80,'value':null,'horizon':0x3}),ilEMA[a0_0x3a82('0x19')]([0x2a,0x1],0x1*0x36ee80),ilEMA[a0_0x3a82('0x19')]([0x2a,0x2],0x2*0x36ee80),ilEMA[a0_0x3a82('0x19')]([0x2a,0x3],0x3*0x36ee80),ilEMA[a0_0x3a82('0x19')]([0x2a,0x4],0x4*0x36ee80),assert[a0_0x3a82('0xb')](ilEMA['updateStream']([0x2a,0x5],0x5*0x36ee80),{'ts':0x1b77400,'value':0x2a,'horizon':0x3});}),it('update\x20incremental\x20mode\x20-\x20with\x20value\x2040',function(){assert[a0_0x3a82('0xb')](ilEMA['updateStream']([0x28,0x6],0x6*0x36ee80),{'ts':0x1ee6280,'value':41.333333333333336,'horizon':0x3});});}),describe(a0_0x3a82('0x5'),function(){it(a0_0x3a82('0x10'),function(){assert[a0_0x3a82('0x1b')](typeof ilRecLinReg,a0_0x3a82('0x17'));}),it(a0_0x3a82('0x18'),function(){assert[a0_0x3a82('0xb')](ilRecLinReg['updateStream']([0x2a,0x0],0x0),{'ts':0xa4cb80,'value':0x0,'horizon':0x3});for(let _0x5774ff=0x1;_0x5774ff<0x28;_0x5774ff++){ilRecLinReg[a0_0x3a82('0x19')]([0x2a+_0x5774ff,_0x5774ff],_0x5774ff*0x36ee80);}i=0x28,assert[a0_0x3a82('0xb')](ilRecLinReg[a0_0x3a82('0x19')]([0x2a+i,i],i*0x36ee80),{'ts':0x93a0f80,'value':85.0736902918679,'horizon':0x3});});}),describe(a0_0x3a82('0x1a'),function(){it(a0_0x3a82('0x1c'),function(){assert[a0_0x3a82('0x1b')](typeof ilSEMA,a0_0x3a82('0x17'));}),it(a0_0x3a82('0x18'),function(){assert['deepEqual'](ilSEMA[a0_0x3a82('0x19')]([0x2a,0x0],0x0),{'ts':0xa4cb80,'value':null,'horizon':0x3});for(let _0x23ba9a=0x1;_0x23ba9a<0x48;_0x23ba9a++){ilSEMA[a0_0x3a82('0x19')]([0x2a+_0x23ba9a,_0x23ba9a%0x18],_0x23ba9a*0x36ee80);}i=0x49,assert[a0_0x3a82('0xb')](ilSEMA[a0_0x3a82('0x19')]([0x2a+i,i%0x18],i*0x36ee80),{'ts':0x104ece00,'value':67.33333333333334,'horizon':0x3});});});});