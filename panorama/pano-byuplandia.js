/* Panorama · il mondo 3D della home: Byuplandia (three.js r169, compilato).
   Sorgenti nella cartella byuplandia/ del progetto (src/pano-entry.js, main.js, sim.js…):
   non si modifica a mano, si rigenera con «node build-pano.mjs». */
(()=>{var eu="169";var Cd=0,ku=1,Pd=2;var Jh=1,nu=2,ui=3,Ui=0,tn=1,Ue=2,Rn=0,Xs=1,en=2,Vu=3,Gu=4,iu=5,ss=100,Id=101,Fd=102,Dd=103,Ld=104,Ud=200,ua=201,Nd=202,Bd=203,Cl=204,Js=205,zd=206,Od=207,Hd=208,kd=209,Vd=210,Gd=211,Wd=212,Xd=213,qd=214,Pl=0,Il=1,Fl=2,Ks=3,Dl=4,Ll=5,Ul=6,Nl=7,Kh=0,Yd=1,Zd=2,Di=0,su=1,ru=2,ou=3,au=4,Jd=5,lu=6,kr=7;var Qh=300,Qs=301,js=302,Bl=303,zl=304,ha=306,os=1e3,hi=1001,Ol=1002,dn=1003,Kd=1004;var $r=1005;var En=1006,qa=1007;var fi=1008;var Vn=1009,jh=1010,$h=1011,Pr=1012,cu=1013,as=1014,Qn=1015,Ye=1016,uu=1017,hu=1018,$s=1020,tf=35902,ef=1021,nf=1022,kn=1023,sf=1024,rf=1025,qs=1026,tr=1027,fu=1028,du=1029,of=1030,pu=1031;var mu=1033,Io=33776,Fo=33777,Do=33778,Lo=33779,Hl=35840,kl=35841,Vl=35842,Gl=35843,Wl=36196,Xl=37492,ql=37496,Yl=37808,Zl=37809,Jl=37810,Kl=37811,Ql=37812,jl=37813,$l=37814,tc=37815,ec=37816,nc=37817,ic=37818,sc=37819,rc=37820,oc=37821,Uo=36492,ac=36494,lc=36495,af=36283,cc=36284,uc=36285,hc=36286;var Bo=2300,fc=2301,Ya=2302,Wu=2400,Xu=2401,qu=2402;var Qd=3200,jd=3201;var lf=0,$d=1,Hn="",Be="srgb",Vi="srgb-linear",gu="display-p3",fa="display-p3-linear",zo="linear",ye="srgb",Oo="rec709",Ho="p3";var Ss=7680;var Yu=519,tp=512,ep=513,np=514,cf=515,ip=516,sp=517,rp=518,op=519,dc=35044,qn=35048;var Zu="300 es",di=2e3,ko=2001,Ni=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},je=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Za=Math.PI/180,pc=180/Math.PI;function pi(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(je[i&255]+je[i>>8&255]+je[i>>16&255]+je[i>>24&255]+"-"+je[t&255]+je[t>>8&255]+"-"+je[t>>16&15|64]+je[t>>24&255]+"-"+je[e&63|128]+je[e>>8&255]+"-"+je[e>>16&255]+je[e>>24&255]+je[n&255]+je[n>>8&255]+je[n>>16&255]+je[n>>24&255]).toLowerCase()}function ke(i,t,e){return Math.max(t,Math.min(e,i))}function ap(i,t){return(i%t+t)%t}function Ja(i,t,e){return(1-e)*i+e*t}function Kn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function me(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var it=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ke(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ee=class i{constructor(t,e,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],f=n[2],d=n[5],g=n[8],x=s[0],p=s[3],m=s[6],_=s[1],v=s[4],M=s[7],C=s[2],w=s[5],S=s[8];return r[0]=o*x+a*_+l*C,r[3]=o*p+a*v+l*w,r[6]=o*m+a*M+l*S,r[1]=c*x+u*_+h*C,r[4]=c*p+u*v+h*w,r[7]=c*m+u*M+h*S,r[2]=f*x+d*_+g*C,r[5]=f*p+d*v+g*w,r[8]=f*m+d*M+g*S,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=u*o-a*c,f=a*l-u*r,d=c*r-o*l,g=e*h+n*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return t[0]=h*x,t[1]=(s*c-u*n)*x,t[2]=(a*n-s*o)*x,t[3]=f*x,t[4]=(u*e-s*l)*x,t[5]=(s*r-a*e)*x,t[6]=d*x,t[7]=(n*l-c*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Ka.makeScale(t,e)),this}rotate(t){return this.premultiply(Ka.makeRotation(-t)),this}translate(t,e){return this.premultiply(Ka.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ka=new ee;function uf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Vo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function lp(){let i=Vo("canvas");return i.style.display="block",i}var Ju={};function No(i){i in Ju||(Ju[i]=!0,console.warn(i))}function cp(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function up(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function hp(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var Ku=new ee().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Qu=new ee().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),mr={[Vi]:{transfer:zo,primaries:Oo,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[Be]:{transfer:ye,primaries:Oo,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[fa]:{transfer:zo,primaries:Ho,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Qu),fromReference:i=>i.applyMatrix3(Ku)},[gu]:{transfer:ye,primaries:Ho,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Qu),fromReference:i=>i.applyMatrix3(Ku).convertLinearToSRGB()}},fp=new Set([Vi,fa]),ce={enabled:!0,_workingColorSpace:Vi,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!fp.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;let n=mr[t].toReference,s=mr[e].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return mr[i].primaries},getTransfer:function(i){return i===Hn?zo:mr[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(mr[t].luminanceCoefficients)}};function Ys(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Qa(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var bs,mc=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{bs===void 0&&(bs=Vo("canvas")),bs.width=t.width,bs.height=t.height;let n=bs.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=bs}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Vo("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ys(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ys(e[n]/255)*255):e[n]=Ys(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},dp=0,Go=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=pi(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ja(s[o].image)):r.push(ja(s[o]))}else r=ja(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function ja(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?mc.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var pp=0,pn=class i extends Ni{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=hi,s=hi,r=En,o=fi,a=kn,l=Vn,c=i.DEFAULT_ANISOTROPY,u=Hn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pp++}),this.uuid=pi(),this.name="",this.source=new Go(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new it(0,0),this.repeat=new it(1,1),this.center=new it(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ee,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Qh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case os:t.x=t.x-Math.floor(t.x);break;case hi:t.x=t.x<0?0:1;break;case Ol:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case os:t.y=t.y-Math.floor(t.y);break;case hi:t.y=t.y<0?0:1;break;case Ol:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};pn.DEFAULT_IMAGE=null;pn.DEFAULT_MAPPING=Qh;pn.DEFAULT_ANISOTROPY=1;var ae=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],h=l[8],f=l[1],d=l[5],g=l[9],x=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-x)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+x)<.1&&Math.abs(g+p)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let v=(c+1)/2,M=(d+1)/2,C=(m+1)/2,w=(u+f)/4,S=(h+x)/4,I=(g+p)/4;return v>M&&v>C?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=w/n,r=S/n):M>C?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=w/s,r=I/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=S/r,s=I/r),this.set(n,s,r,e),this}let _=Math.sqrt((p-g)*(p-g)+(h-x)*(h-x)+(f-u)*(f-u));return Math.abs(_)<.001&&(_=1),this.x=(p-g)/_,this.y=(h-x)/_,this.z=(f-u)/_,this.w=Math.acos((c+d+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},gc=class extends Ni{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ae(0,0,t,e),this.scissorTest=!1,this.viewport=new ae(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:En,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new pn(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Go(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},be=class extends gc{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Wo=class extends pn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=dn,this.minFilter=dn,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var xc=class extends pn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=dn,this.minFilter=dn,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Xe=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],f=r[o+0],d=r[o+1],g=r[o+2],x=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(a===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=x;return}if(h!==x||l!==f||c!==d||u!==g){let p=1-a,m=l*f+c*d+u*g+h*x,_=m>=0?1:-1,v=1-m*m;if(v>Number.EPSILON){let C=Math.sqrt(v),w=Math.atan2(C,m*_);p=Math.sin(p*w)/C,a=Math.sin(a*w)/C}let M=a*_;if(l=l*p+f*M,c=c*p+d*M,u=u*p+g*M,h=h*p+x*M,p===1-a){let C=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=C,c*=C,u*=C,h*=C}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],f=r[o+1],d=r[o+2],g=r[o+3];return t[e]=a*g+u*h+l*d-c*f,t[e+1]=l*g+u*f+c*h-a*d,t[e+2]=c*g+u*d+a*f-l*h,t[e+3]=u*g-a*h-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),f=l(n/2),d=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"YXZ":this._x=f*u*h+c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"ZXY":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h-f*d*g;break;case"ZYX":this._x=f*u*h-c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h+f*d*g;break;case"YZX":this._x=f*u*h+c*d*g,this._y=c*d*h+f*u*g,this._z=c*u*g-f*d*h,this._w=c*u*h-f*d*g;break;case"XZY":this._x=f*u*h-c*d*g,this._y=c*d*h-f*u*g,this._z=c*u*g+f*d*h,this._w=c*u*h+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],h=e[10],f=n+a+h;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(n>a&&n>h){let d=2*Math.sqrt(1+n-a-h);this._w=(u-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>h){let d=2*Math.sqrt(1+a-n-h);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+h-n-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ke(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-e;return this._w=d*o+e*this._w,this._x=d*n+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-e)*u)/c,f=Math.sin(e*u)/c;return this._w=o*h+this._w*f,this._x=n*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(ju.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(ju.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),u=2*(a*e-r*s),h=2*(r*n-o*e);return this.x=e+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return $a.copy(this).projectOnVector(t),this.sub($a)}reflect(t){return this.sub($a.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ke(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},$a=new P,ju=new Xe,mi=class{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Nn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Nn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Nn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Nn):Nn.fromBufferAttribute(r,o),Nn.applyMatrix4(t.matrixWorld),this.expandByPoint(Nn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),to.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),to.copy(n.boundingBox)),to.applyMatrix4(t.matrixWorld),this.union(to)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Nn),Nn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(gr),eo.subVectors(this.max,gr),ws.subVectors(t.a,gr),Ts.subVectors(t.b,gr),Rs.subVectors(t.c,gr),wi.subVectors(Ts,ws),Ti.subVectors(Rs,Ts),Qi.subVectors(ws,Rs);let e=[0,-wi.z,wi.y,0,-Ti.z,Ti.y,0,-Qi.z,Qi.y,wi.z,0,-wi.x,Ti.z,0,-Ti.x,Qi.z,0,-Qi.x,-wi.y,wi.x,0,-Ti.y,Ti.x,0,-Qi.y,Qi.x,0];return!tl(e,ws,Ts,Rs,eo)||(e=[1,0,0,0,1,0,0,0,1],!tl(e,ws,Ts,Rs,eo))?!1:(no.crossVectors(wi,Ti),e=[no.x,no.y,no.z],tl(e,ws,Ts,Rs,eo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Nn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Nn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ri[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ri[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ri[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ri[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ri[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ri[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ri[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ri[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ri),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},ri=[new P,new P,new P,new P,new P,new P,new P,new P],Nn=new P,to=new mi,ws=new P,Ts=new P,Rs=new P,wi=new P,Ti=new P,Qi=new P,gr=new P,eo=new P,no=new P,ji=new P;function tl(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ji.fromArray(i,r);let a=s.x*Math.abs(ji.x)+s.y*Math.abs(ji.y)+s.z*Math.abs(ji.z),l=t.dot(ji),c=e.dot(ji),u=n.dot(ji);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var mp=new mi,xr=new P,el=new P,Bi=class{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):mp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;xr.subVectors(t,this.center);let e=xr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(xr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(el.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(xr.copy(t.center).add(el)),this.expandByPoint(xr.copy(t.center).sub(el))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},oi=new P,nl=new P,io=new P,Ri=new P,il=new P,so=new P,sl=new P,Xo=class{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,oi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=oi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(oi.copy(this.origin).addScaledVector(this.direction,e),oi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){nl.copy(t).add(e).multiplyScalar(.5),io.copy(e).sub(t).normalize(),Ri.copy(this.origin).sub(nl);let r=t.distanceTo(e)*.5,o=-this.direction.dot(io),a=Ri.dot(this.direction),l=-Ri.dot(io),c=Ri.lengthSq(),u=Math.abs(1-o*o),h,f,d,g;if(u>0)if(h=o*l-a,f=o*a-l,g=r*u,h>=0)if(f>=-g)if(f<=g){let x=1/u;h*=x,f*=x,d=h*(h+o*f+2*a)+f*(o*h+f+2*l)+c}else f=r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f=-r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c):f<=g?(h=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-l),r),d=-h*h+f*(f+2*l)+c);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),d=-h*h+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(nl).addScaledVector(io,f),d}intersectSphere(t,e){oi.subVectors(t.center,this.origin);let n=oi.dot(this.direction),s=oi.dot(oi)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),u>=0?(r=(t.min.y-f.y)*u,o=(t.max.y-f.y)*u):(r=(t.max.y-f.y)*u,o=(t.min.y-f.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(t.min.z-f.z)*h,l=(t.max.z-f.z)*h):(a=(t.max.z-f.z)*h,l=(t.min.z-f.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,oi)!==null}intersectTriangle(t,e,n,s,r){il.subVectors(e,t),so.subVectors(n,t),sl.crossVectors(il,so);let o=this.direction.dot(sl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ri.subVectors(this.origin,t);let l=a*this.direction.dot(so.crossVectors(Ri,so));if(l<0)return null;let c=a*this.direction.dot(il.cross(Ri));if(c<0||l+c>o)return null;let u=-a*Ri.dot(sl);return u<0?null:this.at(u/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Yt=class i{constructor(t,e,n,s,r,o,a,l,c,u,h,f,d,g,x,p){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,u,h,f,d,g,x,p)}set(t,e,n,s,r,o,a,l,c,u,h,f,d,g,x,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=u,m[10]=h,m[14]=f,m[3]=d,m[7]=g,m[11]=x,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Cs.setFromMatrixColumn(t,0).length(),r=1/Cs.setFromMatrixColumn(t,1).length(),o=1/Cs.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){let f=o*u,d=o*h,g=a*u,x=a*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=d+g*c,e[5]=f-x*c,e[9]=-a*l,e[2]=x-f*c,e[6]=g+d*c,e[10]=o*l}else if(t.order==="YXZ"){let f=l*u,d=l*h,g=c*u,x=c*h;e[0]=f+x*a,e[4]=g*a-d,e[8]=o*c,e[1]=o*h,e[5]=o*u,e[9]=-a,e[2]=d*a-g,e[6]=x+f*a,e[10]=o*l}else if(t.order==="ZXY"){let f=l*u,d=l*h,g=c*u,x=c*h;e[0]=f-x*a,e[4]=-o*h,e[8]=g+d*a,e[1]=d+g*a,e[5]=o*u,e[9]=x-f*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let f=o*u,d=o*h,g=a*u,x=a*h;e[0]=l*u,e[4]=g*c-d,e[8]=f*c+x,e[1]=l*h,e[5]=x*c+f,e[9]=d*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let f=o*l,d=o*c,g=a*l,x=a*c;e[0]=l*u,e[4]=x-f*h,e[8]=g*h+d,e[1]=h,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=d*h+g,e[10]=f-x*h}else if(t.order==="XZY"){let f=o*l,d=o*c,g=a*l,x=a*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=f*h+x,e[5]=o*u,e[9]=d*h-g,e[2]=g*h-d,e[6]=a*u,e[10]=x*h+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(gp,t,xp)}lookAt(t,e,n){let s=this.elements;return Mn.subVectors(t,e),Mn.lengthSq()===0&&(Mn.z=1),Mn.normalize(),Ci.crossVectors(n,Mn),Ci.lengthSq()===0&&(Math.abs(n.z)===1?Mn.x+=1e-4:Mn.z+=1e-4,Mn.normalize(),Ci.crossVectors(n,Mn)),Ci.normalize(),ro.crossVectors(Mn,Ci),s[0]=Ci.x,s[4]=ro.x,s[8]=Mn.x,s[1]=Ci.y,s[5]=ro.y,s[9]=Mn.y,s[2]=Ci.z,s[6]=ro.z,s[10]=Mn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],f=n[9],d=n[13],g=n[2],x=n[6],p=n[10],m=n[14],_=n[3],v=n[7],M=n[11],C=n[15],w=s[0],S=s[4],I=s[8],U=s[12],y=s[1],A=s[5],O=s[9],H=s[13],D=s[2],z=s[6],B=s[10],k=s[14],F=s[3],q=s[7],et=s[11],Y=s[15];return r[0]=o*w+a*y+l*D+c*F,r[4]=o*S+a*A+l*z+c*q,r[8]=o*I+a*O+l*B+c*et,r[12]=o*U+a*H+l*k+c*Y,r[1]=u*w+h*y+f*D+d*F,r[5]=u*S+h*A+f*z+d*q,r[9]=u*I+h*O+f*B+d*et,r[13]=u*U+h*H+f*k+d*Y,r[2]=g*w+x*y+p*D+m*F,r[6]=g*S+x*A+p*z+m*q,r[10]=g*I+x*O+p*B+m*et,r[14]=g*U+x*H+p*k+m*Y,r[3]=_*w+v*y+M*D+C*F,r[7]=_*S+v*A+M*z+C*q,r[11]=_*I+v*O+M*B+C*et,r[15]=_*U+v*H+M*k+C*Y,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],h=t[6],f=t[10],d=t[14],g=t[3],x=t[7],p=t[11],m=t[15];return g*(+r*l*h-s*c*h-r*a*f+n*c*f+s*a*d-n*l*d)+x*(+e*l*d-e*c*f+r*o*f-s*o*d+s*c*u-r*l*u)+p*(+e*c*h-e*a*d-r*o*h+n*o*d+r*a*u-n*c*u)+m*(-s*a*u-e*l*h+e*a*f+s*o*h-n*o*f+n*l*u)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=t[9],f=t[10],d=t[11],g=t[12],x=t[13],p=t[14],m=t[15],_=h*p*c-x*f*c+x*l*d-a*p*d-h*l*m+a*f*m,v=g*f*c-u*p*c-g*l*d+o*p*d+u*l*m-o*f*m,M=u*x*c-g*h*c+g*a*d-o*x*d-u*a*m+o*h*m,C=g*h*l-u*x*l-g*a*f+o*x*f+u*a*p-o*h*p,w=e*_+n*v+s*M+r*C;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let S=1/w;return t[0]=_*S,t[1]=(x*f*r-h*p*r-x*s*d+n*p*d+h*s*m-n*f*m)*S,t[2]=(a*p*r-x*l*r+x*s*c-n*p*c-a*s*m+n*l*m)*S,t[3]=(h*l*r-a*f*r-h*s*c+n*f*c+a*s*d-n*l*d)*S,t[4]=v*S,t[5]=(u*p*r-g*f*r+g*s*d-e*p*d-u*s*m+e*f*m)*S,t[6]=(g*l*r-o*p*r-g*s*c+e*p*c+o*s*m-e*l*m)*S,t[7]=(o*f*r-u*l*r+u*s*c-e*f*c-o*s*d+e*l*d)*S,t[8]=M*S,t[9]=(g*h*r-u*x*r-g*n*d+e*x*d+u*n*m-e*h*m)*S,t[10]=(o*x*r-g*a*r+g*n*c-e*x*c-o*n*m+e*a*m)*S,t[11]=(u*a*r-o*h*r-u*n*c+e*h*c+o*n*d-e*a*d)*S,t[12]=C*S,t[13]=(u*x*s-g*h*s+g*n*f-e*x*f-u*n*p+e*h*p)*S,t[14]=(g*a*s-o*x*s-g*n*l+e*x*l+o*n*p-e*a*p)*S,t[15]=(o*h*s-u*a*s+u*n*l-e*h*l-o*n*f+e*a*f)*S,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,h=a+a,f=r*c,d=r*u,g=r*h,x=o*u,p=o*h,m=a*h,_=l*c,v=l*u,M=l*h,C=n.x,w=n.y,S=n.z;return s[0]=(1-(x+m))*C,s[1]=(d+M)*C,s[2]=(g-v)*C,s[3]=0,s[4]=(d-M)*w,s[5]=(1-(f+m))*w,s[6]=(p+_)*w,s[7]=0,s[8]=(g+v)*S,s[9]=(p-_)*S,s[10]=(1-(f+x))*S,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Cs.set(s[0],s[1],s[2]).length(),o=Cs.set(s[4],s[5],s[6]).length(),a=Cs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Bn.copy(this);let c=1/r,u=1/o,h=1/a;return Bn.elements[0]*=c,Bn.elements[1]*=c,Bn.elements[2]*=c,Bn.elements[4]*=u,Bn.elements[5]*=u,Bn.elements[6]*=u,Bn.elements[8]*=h,Bn.elements[9]*=h,Bn.elements[10]*=h,e.setFromRotationMatrix(Bn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=di){let l=this.elements,c=2*r/(e-t),u=2*r/(n-s),h=(e+t)/(e-t),f=(n+s)/(n-s),d,g;if(a===di)d=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===ko)d=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=di){let l=this.elements,c=1/(e-t),u=1/(n-s),h=1/(o-r),f=(e+t)*c,d=(n+s)*u,g,x;if(a===di)g=(o+r)*h,x=-2*h;else if(a===ko)g=r*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Cs=new P,Bn=new Yt,gp=new P(0,0,0),xp=new P(1,1,1),Ci=new P,ro=new P,Mn=new P,$u=new Yt,th=new Xe,nn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(ke(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ke(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return $u.makeRotationFromQuaternion(t),this.setFromRotationMatrix($u,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return th.setFromEuler(this),this.setFromQuaternion(th,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};nn.DEFAULT_ORDER="XYZ";var qo=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},vp=0,eh=new P,Ps=new Xe,ai=new Yt,oo=new P,vr=new P,yp=new P,_p=new Xe,nh=new P(1,0,0),ih=new P(0,1,0),sh=new P(0,0,1),rh={type:"added"},Mp={type:"removed"},Is={type:"childadded",child:null},rl={type:"childremoved",child:null},qe=class i extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vp++}),this.uuid=pi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new P,e=new nn,n=new Xe,s=new P(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Yt},normalMatrix:{value:new ee}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ps.setFromAxisAngle(t,e),this.quaternion.multiply(Ps),this}rotateOnWorldAxis(t,e){return Ps.setFromAxisAngle(t,e),this.quaternion.premultiply(Ps),this}rotateX(t){return this.rotateOnAxis(nh,t)}rotateY(t){return this.rotateOnAxis(ih,t)}rotateZ(t){return this.rotateOnAxis(sh,t)}translateOnAxis(t,e){return eh.copy(t).applyQuaternion(this.quaternion),this.position.add(eh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(nh,t)}translateY(t){return this.translateOnAxis(ih,t)}translateZ(t){return this.translateOnAxis(sh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ai.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?oo.copy(t):oo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),vr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ai.lookAt(vr,oo,this.up):ai.lookAt(oo,vr,this.up),this.quaternion.setFromRotationMatrix(ai),s&&(ai.extractRotation(s.matrixWorld),Ps.setFromRotationMatrix(ai),this.quaternion.premultiply(Ps.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(rh),Is.child=t,this.dispatchEvent(Is),Is.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Mp),rl.child=t,this.dispatchEvent(rl),rl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ai.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ai.multiply(t.parent.matrixWorld)),t.applyMatrix4(ai),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(rh),Is.child=t,this.dispatchEvent(Is),Is.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,t,yp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vr,_p,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),h=o(t.shapes),f=o(t.skeletons),d=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};qe.DEFAULT_UP=new P(0,1,0);qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var zn=new P,li=new P,ol=new P,ci=new P,Fs=new P,Ds=new P,oh=new P,al=new P,ll=new P,cl=new P,ul=new ae,hl=new ae,fl=new ae,Fi=class i{constructor(t=new P,e=new P,n=new P){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),zn.subVectors(t,e),s.cross(zn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){zn.subVectors(s,e),li.subVectors(n,e),ol.subVectors(t,e);let o=zn.dot(zn),a=zn.dot(li),l=zn.dot(ol),c=li.dot(li),u=li.dot(ol),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let f=1/h,d=(c*l-a*u)*f,g=(o*u-a*l)*f;return r.set(1-d-g,g,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ci)===null?!1:ci.x>=0&&ci.y>=0&&ci.x+ci.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,ci)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ci.x),l.addScaledVector(o,ci.y),l.addScaledVector(a,ci.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return ul.setScalar(0),hl.setScalar(0),fl.setScalar(0),ul.fromBufferAttribute(t,e),hl.fromBufferAttribute(t,n),fl.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(ul,r.x),o.addScaledVector(hl,r.y),o.addScaledVector(fl,r.z),o}static isFrontFacing(t,e,n,s){return zn.subVectors(n,e),li.subVectors(t,e),zn.cross(li).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return zn.subVectors(this.c,this.b),li.subVectors(this.a,this.b),zn.cross(li).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Fs.subVectors(s,n),Ds.subVectors(r,n),al.subVectors(t,n);let l=Fs.dot(al),c=Ds.dot(al);if(l<=0&&c<=0)return e.copy(n);ll.subVectors(t,s);let u=Fs.dot(ll),h=Ds.dot(ll);if(u>=0&&h<=u)return e.copy(s);let f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return o=l/(l-u),e.copy(n).addScaledVector(Fs,o);cl.subVectors(t,r);let d=Fs.dot(cl),g=Ds.dot(cl);if(g>=0&&d<=g)return e.copy(r);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Ds,a);let p=u*g-d*h;if(p<=0&&h-u>=0&&d-g>=0)return oh.subVectors(r,s),a=(h-u)/(h-u+(d-g)),e.copy(s).addScaledVector(oh,a);let m=1/(p+x+f);return o=x*m,a=f*m,e.copy(n).addScaledVector(Fs,o).addScaledVector(Ds,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},hf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pi={h:0,s:0,l:0},ao={h:0,s:0,l:0};function dl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var nt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Be){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ce.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=ce.workingColorSpace){return this.r=t,this.g=e,this.b=n,ce.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=ce.workingColorSpace){if(t=ap(t,1),e=ke(e,0,1),n=ke(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=dl(o,r,t+1/3),this.g=dl(o,r,t),this.b=dl(o,r,t-1/3)}return ce.toWorkingColorSpace(this,s),this}setStyle(t,e=Be){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Be){let n=hf[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ys(t.r),this.g=Ys(t.g),this.b=Ys(t.b),this}copyLinearToSRGB(t){return this.r=Qa(t.r),this.g=Qa(t.g),this.b=Qa(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Be){return ce.fromWorkingColorSpace($e.copy(this),t),Math.round(ke($e.r*255,0,255))*65536+Math.round(ke($e.g*255,0,255))*256+Math.round(ke($e.b*255,0,255))}getHexString(t=Be){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ce.workingColorSpace){ce.fromWorkingColorSpace($e.copy(this),e);let n=$e.r,s=$e.g,r=$e.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=ce.workingColorSpace){return ce.fromWorkingColorSpace($e.copy(this),e),t.r=$e.r,t.g=$e.g,t.b=$e.b,t}getStyle(t=Be){ce.fromWorkingColorSpace($e.copy(this),t);let e=$e.r,n=$e.g,s=$e.b;return t!==Be?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Pi),this.setHSL(Pi.h+t,Pi.s+e,Pi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Pi),t.getHSL(ao);let n=Ja(Pi.h,ao.h,e),s=Ja(Pi.s,ao.s,e),r=Ja(Pi.l,ao.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},$e=new nt;nt.NAMES=hf;var Ap=0,gi=class extends Ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ap++}),this.uuid=pi(),this.name="",this.type="Material",this.blending=Xs,this.side=Ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Cl,this.blendDst=Js,this.blendEquation=ss,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new nt(0,0,0),this.blendAlpha=0,this.depthFunc=Ks,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Yu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ss,this.stencilZFail=Ss,this.stencilZPass=Ss,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Xs&&(n.blending=this.blending),this.side!==Ui&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Cl&&(n.blendSrc=this.blendSrc),this.blendDst!==Js&&(n.blendDst=this.blendDst),this.blendEquation!==ss&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ks&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Yu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ss&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ss&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ss&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Sn=class extends gi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=Kh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Le=new P,lo=new it,ue=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=dc,this.updateRanges=[],this.gpuType=Qn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)lo.fromBufferAttribute(this,e),lo.applyMatrix3(t),this.setXY(e,lo.x,lo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix3(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Kn(e,this.array)),e}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Kn(e,this.array)),e}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Kn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Kn(e,this.array)),e}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==dc&&(t.usage=this.usage),t}};var Yo=class extends ue{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Zo=class extends ue{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Bt=class extends ue{constructor(t,e,n){super(new Float32Array(t),e,n)}},Ep=0,Tn=new Yt,pl=new qe,Ls=new P,An=new mi,yr=new mi,He=new P,Jt=class i extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ep++}),this.uuid=pi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(uf(t)?Zo:Yo)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ee().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Tn.makeRotationFromQuaternion(t),this.applyMatrix4(Tn),this}rotateX(t){return Tn.makeRotationX(t),this.applyMatrix4(Tn),this}rotateY(t){return Tn.makeRotationY(t),this.applyMatrix4(Tn),this}rotateZ(t){return Tn.makeRotationZ(t),this.applyMatrix4(Tn),this}translate(t,e,n){return Tn.makeTranslation(t,e,n),this.applyMatrix4(Tn),this}scale(t,e,n){return Tn.makeScale(t,e,n),this.applyMatrix4(Tn),this}lookAt(t){return pl.lookAt(t),pl.updateMatrix(),this.applyMatrix4(pl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ls).negate(),this.translate(Ls.x,Ls.y,Ls.z),this}setFromPoints(t){let e=[];for(let n=0,s=t.length;n<s;n++){let r=t[n];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new Bt(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];An.setFromBufferAttribute(r),this.morphTargetsRelative?(He.addVectors(this.boundingBox.min,An.min),this.boundingBox.expandByPoint(He),He.addVectors(this.boundingBox.max,An.max),this.boundingBox.expandByPoint(He)):(this.boundingBox.expandByPoint(An.min),this.boundingBox.expandByPoint(An.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Bi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let n=this.boundingSphere.center;if(An.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];yr.setFromBufferAttribute(a),this.morphTargetsRelative?(He.addVectors(An.min,yr.min),An.expandByPoint(He),He.addVectors(An.max,yr.max),An.expandByPoint(He)):(An.expandByPoint(yr.min),An.expandByPoint(yr.max))}An.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)He.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(He));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)He.fromBufferAttribute(a,c),l&&(Ls.fromBufferAttribute(t,c),He.add(Ls)),s=Math.max(s,n.distanceToSquared(He))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ue(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<n.count;I++)a[I]=new P,l[I]=new P;let c=new P,u=new P,h=new P,f=new it,d=new it,g=new it,x=new P,p=new P;function m(I,U,y){c.fromBufferAttribute(n,I),u.fromBufferAttribute(n,U),h.fromBufferAttribute(n,y),f.fromBufferAttribute(r,I),d.fromBufferAttribute(r,U),g.fromBufferAttribute(r,y),u.sub(c),h.sub(c),d.sub(f),g.sub(f);let A=1/(d.x*g.y-g.x*d.y);isFinite(A)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-d.y).multiplyScalar(A),p.copy(h).multiplyScalar(d.x).addScaledVector(u,-g.x).multiplyScalar(A),a[I].add(x),a[U].add(x),a[y].add(x),l[I].add(p),l[U].add(p),l[y].add(p))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let I=0,U=_.length;I<U;++I){let y=_[I],A=y.start,O=y.count;for(let H=A,D=A+O;H<D;H+=3)m(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let v=new P,M=new P,C=new P,w=new P;function S(I){C.fromBufferAttribute(s,I),w.copy(C);let U=a[I];v.copy(U),v.sub(C.multiplyScalar(C.dot(U))).normalize(),M.crossVectors(w,U);let A=M.dot(l[I])<0?-1:1;o.setXYZW(I,v.x,v.y,v.z,A)}for(let I=0,U=_.length;I<U;++I){let y=_[I],A=y.start,O=y.count;for(let H=A,D=A+O;H<D;H+=3)S(t.getX(H+0)),S(t.getX(H+1)),S(t.getX(H+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ue(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);let s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,u=new P,h=new P;if(t)for(let f=0,d=t.count;f<d;f+=3){let g=t.getX(f+0),x=t.getX(f+1),p=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,p),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,p),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),o.fromBufferAttribute(e,f+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)He.fromBufferAttribute(t,e),He.normalize(),t.setXYZ(e,He.x,He.y,He.z)}toNonIndexed(){function t(a,l){let c=a.array,u=a.itemSize,h=a.normalized,f=new c.constructor(l.length*u),d=0,g=0;for(let x=0,p=l.length;x<p;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*u;for(let m=0;m<u;m++)f[g++]=c[d++]}return new ue(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){let f=c[u],d=t(f,n);l.push(d)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){let d=c[h];u.push(d.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],h=r[c];for(let f=0,d=h.length;f<d;f++)u.push(h[f].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},ah=new Yt,$i=new Xo,co=new Bi,lh=new P,uo=new P,ho=new P,fo=new P,ml=new P,po=new P,ch=new P,mo=new P,jt=class extends qe{constructor(t=new Jt,e=new Sn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){po.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],h=r[l];u!==0&&(ml.fromBufferAttribute(h,t),o?po.addScaledVector(ml,u):po.addScaledVector(ml.sub(e),u))}e.add(po)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),co.copy(n.boundingSphere),co.applyMatrix4(r),$i.copy(t.ray).recast(t.near),!(co.containsPoint($i.origin)===!1&&($i.intersectSphere(co,lh)===null||$i.origin.distanceToSquared(lh)>(t.far-t.near)**2))&&(ah.copy(r).invert(),$i.copy(t.ray).applyMatrix4(ah),!(n.boundingBox!==null&&$i.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,$i)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],_=Math.max(p.start,d.start),v=Math.min(a.count,Math.min(p.start+p.count,d.start+d.count));for(let M=_,C=v;M<C;M+=3){let w=a.getX(M),S=a.getX(M+1),I=a.getX(M+2);s=go(this,m,t,n,c,u,h,w,S,I),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let _=a.getX(p),v=a.getX(p+1),M=a.getX(p+2);s=go(this,o,t,n,c,u,h,_,v,M),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let p=f[g],m=o[p.materialIndex],_=Math.max(p.start,d.start),v=Math.min(l.count,Math.min(p.start+p.count,d.start+d.count));for(let M=_,C=v;M<C;M+=3){let w=M,S=M+1,I=M+2;s=go(this,m,t,n,c,u,h,w,S,I),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let p=g,m=x;p<m;p+=3){let _=p,v=p+1,M=p+2;s=go(this,o,t,n,c,u,h,_,v,M),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function Sp(i,t,e,n,s,r,o,a){let l;if(t.side===tn?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Ui,a),l===null)return null;mo.copy(a),mo.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(mo);return c<e.near||c>e.far?null:{distance:c,point:mo.clone(),object:i}}function go(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,uo),i.getVertexPosition(l,ho),i.getVertexPosition(c,fo);let u=Sp(i,t,e,n,uo,ho,fo,ch);if(u){let h=new P;Fi.getBarycoord(ch,uo,ho,fo,h),s&&(u.uv=Fi.getInterpolatedAttribute(s,a,l,c,h,new it)),r&&(u.uv1=Fi.getInterpolatedAttribute(r,a,l,c,h,new it)),o&&(u.normal=Fi.getInterpolatedAttribute(o,a,l,c,h,new P),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new P,materialIndex:0};Fi.getNormal(uo,ho,fo,f.normal),u.face=f,u.barycoord=h}return u}var re=class i extends Jt{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],h=[],f=0,d=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Bt(c,3)),this.setAttribute("normal",new Bt(u,3)),this.setAttribute("uv",new Bt(h,2));function g(x,p,m,_,v,M,C,w,S,I,U){let y=M/S,A=C/I,O=M/2,H=C/2,D=w/2,z=S+1,B=I+1,k=0,F=0,q=new P;for(let et=0;et<B;et++){let Y=et*A-H;for(let at=0;at<z;at++){let Dt=at*y-O;q[x]=Dt*_,q[p]=Y*v,q[m]=D,c.push(q.x,q.y,q.z),q[x]=0,q[p]=0,q[m]=w>0?1:-1,u.push(q.x,q.y,q.z),h.push(at/S),h.push(1-et/I),k+=1}}for(let et=0;et<I;et++)for(let Y=0;Y<S;Y++){let at=f+Y+z*et,Dt=f+Y+z*(et+1),j=f+(Y+1)+z*(et+1),rt=f+(Y+1)+z*et;l.push(at,Dt,rt),l.push(Dt,j,rt),F+=6}a.addGroup(d,F,U),d+=F,f+=k}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function er(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function an(i){let t={};for(let e=0;e<i.length;e++){let n=er(i[e]);for(let s in n)t[s]=n[s]}return t}function bp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function ff(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ce.workingColorSpace}var jn={clone:er,merge:an},wp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Tp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,oe=class extends gi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wp,this.fragmentShader=Tp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=er(t.uniforms),this.uniformsGroups=bp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Jo=class extends qe{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=di}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ii=new P,uh=new it,hh=new it,Ve=class extends Jo{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=pc*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Za*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return pc*2*Math.atan(Math.tan(Za*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ii.x,Ii.y).multiplyScalar(-t/Ii.z),Ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ii.x,Ii.y).multiplyScalar(-t/Ii.z)}getViewSize(t,e){return this.getViewBounds(t,uh,hh),e.subVectors(hh,uh)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Za*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Us=-90,Ns=1,vc=class extends qe{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ve(Us,Ns,t,e);s.layers=this.layers,this.add(s);let r=new Ve(Us,Ns,t,e);r.layers=this.layers,this.add(r);let o=new Ve(Us,Ns,t,e);o.layers=this.layers,this.add(o);let a=new Ve(Us,Ns,t,e);a.layers=this.layers,this.add(a);let l=new Ve(Us,Ns,t,e);l.layers=this.layers,this.add(l);let c=new Ve(Us,Ns,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===di)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ko)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,h=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ko=class extends pn{constructor(t,e,n,s,r,o,a,l,c,u){t=t!==void 0?t:[],e=e!==void 0?e:Qs,super(t,e,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},yc=class extends be{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ko(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:En}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new re(5,5,5),r=new oe({name:"CubemapFromEquirect",uniforms:er(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:tn,blending:Rn});r.uniforms.tEquirect.value=e;let o=new jt(s,r),a=e.minFilter;return e.minFilter===fi&&(e.minFilter=En),new vc(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},gl=new P,Rp=new P,Cp=new ee,On=class{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=gl.subVectors(n,e).cross(Rp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(gl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Cp.getNormalMatrix(t),s=this.coplanarPoint(gl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},ts=new Bi,xo=new P,Ir=class{constructor(t=new On,e=new On,n=new On,s=new On,r=new On,o=new On){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=di){let n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],f=s[7],d=s[8],g=s[9],x=s[10],p=s[11],m=s[12],_=s[13],v=s[14],M=s[15];if(n[0].setComponents(l-r,f-c,p-d,M-m).normalize(),n[1].setComponents(l+r,f+c,p+d,M+m).normalize(),n[2].setComponents(l+o,f+u,p+g,M+_).normalize(),n[3].setComponents(l-o,f-u,p-g,M-_).normalize(),n[4].setComponents(l-a,f-h,p-x,M-v).normalize(),e===di)n[5].setComponents(l+a,f+h,p+x,M+v).normalize();else if(e===ko)n[5].setComponents(a,h,x,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ts.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ts.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ts)}intersectsSprite(t){return ts.center.set(0,0,0),ts.radius=.7071067811865476,ts.applyMatrix4(t.matrixWorld),this.intersectsSphere(ts)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(xo.x=s.normal.x>0?t.max.x:t.min.x,xo.y=s.normal.y>0?t.max.y:t.min.y,xo.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(xo)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function df(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Pp(i){let t=new WeakMap;function e(a,l){let c=a.array,u=a.usage,h=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){let u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<h.length;d++){let g=h[f],x=h[d];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,h[f]=x)}h.length=f+1;for(let d=0,g=h.length;d<g;d++){let x=h[d];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var _e=class i extends Jt{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=t/a,f=e/l,d=[],g=[],x=[],p=[];for(let m=0;m<u;m++){let _=m*f-o;for(let v=0;v<c;v++){let M=v*h-r;g.push(M,-_,0),x.push(0,0,1),p.push(v/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let _=0;_<a;_++){let v=_+c*m,M=_+c*(m+1),C=_+1+c*(m+1),w=_+1+c*m;d.push(v,M,w),d.push(M,C,w)}this.setIndex(d),this.setAttribute("position",new Bt(g,3)),this.setAttribute("normal",new Bt(x,3)),this.setAttribute("uv",new Bt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Ip=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Fp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Dp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Lp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Up=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Np=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Bp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,zp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Op=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Hp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,kp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Vp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Gp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Wp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Xp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Yp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Jp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Kp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Qp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,jp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,$p=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,tm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,em=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,nm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,im=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,sm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,rm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,om=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,am="gl_FragColor = linearToOutputTexel( gl_FragColor );",lm=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,hm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,pm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,mm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,gm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,xm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,vm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ym=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,_m=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Am=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Em=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Sm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,bm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,wm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Tm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Cm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Pm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Im=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Fm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Dm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Lm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Um=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nm=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Om=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Hm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,km=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Vm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Wm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Xm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ym=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Jm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,$m=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,t0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,e0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,n0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,i0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,s0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,r0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,o0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,a0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,l0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,c0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,u0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,h0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,f0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,d0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,p0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,m0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,g0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,x0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,v0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,y0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,_0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,M0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,E0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,S0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,b0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,w0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,T0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,C0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,P0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,I0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,D0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,L0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,U0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,B0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,z0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,O0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,H0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,k0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,G0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,W0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,q0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Z0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,J0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,K0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Q0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,j0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,eg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ng=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ig=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,rg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,og=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ag=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,lg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,cg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,te={alphahash_fragment:Ip,alphahash_pars_fragment:Fp,alphamap_fragment:Dp,alphamap_pars_fragment:Lp,alphatest_fragment:Up,alphatest_pars_fragment:Np,aomap_fragment:Bp,aomap_pars_fragment:zp,batching_pars_vertex:Op,batching_vertex:Hp,begin_vertex:kp,beginnormal_vertex:Vp,bsdfs:Gp,iridescence_fragment:Wp,bumpmap_pars_fragment:Xp,clipping_planes_fragment:qp,clipping_planes_pars_fragment:Yp,clipping_planes_pars_vertex:Zp,clipping_planes_vertex:Jp,color_fragment:Kp,color_pars_fragment:Qp,color_pars_vertex:jp,color_vertex:$p,common:tm,cube_uv_reflection_fragment:em,defaultnormal_vertex:nm,displacementmap_pars_vertex:im,displacementmap_vertex:sm,emissivemap_fragment:rm,emissivemap_pars_fragment:om,colorspace_fragment:am,colorspace_pars_fragment:lm,envmap_fragment:cm,envmap_common_pars_fragment:um,envmap_pars_fragment:hm,envmap_pars_vertex:fm,envmap_physical_pars_fragment:Em,envmap_vertex:dm,fog_vertex:pm,fog_pars_vertex:mm,fog_fragment:gm,fog_pars_fragment:xm,gradientmap_pars_fragment:vm,lightmap_pars_fragment:ym,lights_lambert_fragment:_m,lights_lambert_pars_fragment:Mm,lights_pars_begin:Am,lights_toon_fragment:Sm,lights_toon_pars_fragment:bm,lights_phong_fragment:wm,lights_phong_pars_fragment:Tm,lights_physical_fragment:Rm,lights_physical_pars_fragment:Cm,lights_fragment_begin:Pm,lights_fragment_maps:Im,lights_fragment_end:Fm,logdepthbuf_fragment:Dm,logdepthbuf_pars_fragment:Lm,logdepthbuf_pars_vertex:Um,logdepthbuf_vertex:Nm,map_fragment:Bm,map_pars_fragment:zm,map_particle_fragment:Om,map_particle_pars_fragment:Hm,metalnessmap_fragment:km,metalnessmap_pars_fragment:Vm,morphinstance_vertex:Gm,morphcolor_vertex:Wm,morphnormal_vertex:Xm,morphtarget_pars_vertex:qm,morphtarget_vertex:Ym,normal_fragment_begin:Zm,normal_fragment_maps:Jm,normal_pars_fragment:Km,normal_pars_vertex:Qm,normal_vertex:jm,normalmap_pars_fragment:$m,clearcoat_normal_fragment_begin:t0,clearcoat_normal_fragment_maps:e0,clearcoat_pars_fragment:n0,iridescence_pars_fragment:i0,opaque_fragment:s0,packing:r0,premultiplied_alpha_fragment:o0,project_vertex:a0,dithering_fragment:l0,dithering_pars_fragment:c0,roughnessmap_fragment:u0,roughnessmap_pars_fragment:h0,shadowmap_pars_fragment:f0,shadowmap_pars_vertex:d0,shadowmap_vertex:p0,shadowmask_pars_fragment:m0,skinbase_vertex:g0,skinning_pars_vertex:x0,skinning_vertex:v0,skinnormal_vertex:y0,specularmap_fragment:_0,specularmap_pars_fragment:M0,tonemapping_fragment:A0,tonemapping_pars_fragment:E0,transmission_fragment:S0,transmission_pars_fragment:b0,uv_pars_fragment:w0,uv_pars_vertex:T0,uv_vertex:R0,worldpos_vertex:C0,background_vert:P0,background_frag:I0,backgroundCube_vert:F0,backgroundCube_frag:D0,cube_vert:L0,cube_frag:U0,depth_vert:N0,depth_frag:B0,distanceRGBA_vert:z0,distanceRGBA_frag:O0,equirect_vert:H0,equirect_frag:k0,linedashed_vert:V0,linedashed_frag:G0,meshbasic_vert:W0,meshbasic_frag:X0,meshlambert_vert:q0,meshlambert_frag:Y0,meshmatcap_vert:Z0,meshmatcap_frag:J0,meshnormal_vert:K0,meshnormal_frag:Q0,meshphong_vert:j0,meshphong_frag:$0,meshphysical_vert:tg,meshphysical_frag:eg,meshtoon_vert:ng,meshtoon_frag:ig,points_vert:sg,points_frag:rg,shadow_vert:og,shadow_frag:ag,sprite_vert:lg,sprite_frag:cg},At={common:{diffuse:{value:new nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ee}},envmap:{envMap:{value:null},envMapRotation:{value:new ee},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ee}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ee}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ee},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ee},normalScale:{value:new it(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ee},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ee}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ee}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ee}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0},uvTransform:{value:new ee}},sprite:{diffuse:{value:new nt(16777215)},opacity:{value:1},center:{value:new it(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}}},Jn={basic:{uniforms:an([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.fog]),vertexShader:te.meshbasic_vert,fragmentShader:te.meshbasic_frag},lambert:{uniforms:an([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new nt(0)}}]),vertexShader:te.meshlambert_vert,fragmentShader:te.meshlambert_frag},phong:{uniforms:an([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new nt(0)},specular:{value:new nt(1118481)},shininess:{value:30}}]),vertexShader:te.meshphong_vert,fragmentShader:te.meshphong_frag},standard:{uniforms:an([At.common,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.roughnessmap,At.metalnessmap,At.fog,At.lights,{emissive:{value:new nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag},toon:{uniforms:an([At.common,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.gradientmap,At.fog,At.lights,{emissive:{value:new nt(0)}}]),vertexShader:te.meshtoon_vert,fragmentShader:te.meshtoon_frag},matcap:{uniforms:an([At.common,At.bumpmap,At.normalmap,At.displacementmap,At.fog,{matcap:{value:null}}]),vertexShader:te.meshmatcap_vert,fragmentShader:te.meshmatcap_frag},points:{uniforms:an([At.points,At.fog]),vertexShader:te.points_vert,fragmentShader:te.points_frag},dashed:{uniforms:an([At.common,At.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:te.linedashed_vert,fragmentShader:te.linedashed_frag},depth:{uniforms:an([At.common,At.displacementmap]),vertexShader:te.depth_vert,fragmentShader:te.depth_frag},normal:{uniforms:an([At.common,At.bumpmap,At.normalmap,At.displacementmap,{opacity:{value:1}}]),vertexShader:te.meshnormal_vert,fragmentShader:te.meshnormal_frag},sprite:{uniforms:an([At.sprite,At.fog]),vertexShader:te.sprite_vert,fragmentShader:te.sprite_frag},background:{uniforms:{uvTransform:{value:new ee},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:te.background_vert,fragmentShader:te.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ee}},vertexShader:te.backgroundCube_vert,fragmentShader:te.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:te.cube_vert,fragmentShader:te.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:te.equirect_vert,fragmentShader:te.equirect_frag},distanceRGBA:{uniforms:an([At.common,At.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:te.distanceRGBA_vert,fragmentShader:te.distanceRGBA_frag},shadow:{uniforms:an([At.lights,At.fog,{color:{value:new nt(0)},opacity:{value:1}}]),vertexShader:te.shadow_vert,fragmentShader:te.shadow_frag}};Jn.physical={uniforms:an([Jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ee},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ee},clearcoatNormalScale:{value:new it(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ee},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ee},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ee},sheen:{value:0},sheenColor:{value:new nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ee},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ee},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ee},transmissionSamplerSize:{value:new it},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ee},attenuationDistance:{value:0},attenuationColor:{value:new nt(0)},specularColor:{value:new nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ee},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ee},anisotropyVector:{value:new it},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ee}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag};var vo={r:0,b:0,g:0},es=new nn,ug=new Yt;function hg(i,t,e,n,s,r,o){let a=new nt(0),l=r===!0?0:1,c,u,h=null,f=0,d=null;function g(_){let v=_.isScene===!0?_.background:null;return v&&v.isTexture&&(v=(_.backgroundBlurriness>0?e:t).get(v)),v}function x(_){let v=!1,M=g(_);M===null?m(a,l):M&&M.isColor&&(m(M,1),v=!0);let C=i.xr.getEnvironmentBlendMode();C==="additive"?n.buffers.color.setClear(0,0,0,1,o):C==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(_,v){let M=g(v);M&&(M.isCubeTexture||M.mapping===ha)?(u===void 0&&(u=new jt(new re(1,1,1),new oe({name:"BackgroundCubeMaterial",uniforms:er(Jn.backgroundCube.uniforms),vertexShader:Jn.backgroundCube.vertexShader,fragmentShader:Jn.backgroundCube.fragmentShader,side:tn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(C,w,S){this.matrixWorld.copyPosition(S.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),es.copy(v.backgroundRotation),es.x*=-1,es.y*=-1,es.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(es.y*=-1,es.z*=-1),u.material.uniforms.envMap.value=M,u.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(ug.makeRotationFromEuler(es)),u.material.toneMapped=ce.getTransfer(M.colorSpace)!==ye,(h!==M||f!==M.version||d!==i.toneMapping)&&(u.material.needsUpdate=!0,h=M,f=M.version,d=i.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new jt(new _e(2,2),new oe({name:"BackgroundMaterial",uniforms:er(Jn.background.uniforms),vertexShader:Jn.background.vertexShader,fragmentShader:Jn.background.fragmentShader,side:Ui,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=ce.getTransfer(M.colorSpace)!==ye,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||f!==M.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=M,f=M.version,d=i.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function m(_,v){_.getRGB(vo,ff(i)),n.buffers.color.setClear(vo.r,vo.g,vo.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(_,v=1){a.set(_),l=v,m(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,m(a,l)},render:x,addToRenderList:p}}function fg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(y,A,O,H,D){let z=!1,B=h(H,O,A);r!==B&&(r=B,c(r.object)),z=d(y,H,O,D),z&&g(y,H,O,D),D!==null&&t.update(D,i.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,M(y,A,O,H),D!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(D).buffer))}function l(){return i.createVertexArray()}function c(y){return i.bindVertexArray(y)}function u(y){return i.deleteVertexArray(y)}function h(y,A,O){let H=O.wireframe===!0,D=n[y.id];D===void 0&&(D={},n[y.id]=D);let z=D[A.id];z===void 0&&(z={},D[A.id]=z);let B=z[H];return B===void 0&&(B=f(l()),z[H]=B),B}function f(y){let A=[],O=[],H=[];for(let D=0;D<e;D++)A[D]=0,O[D]=0,H[D]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:O,attributeDivisors:H,object:y,attributes:{},index:null}}function d(y,A,O,H){let D=r.attributes,z=A.attributes,B=0,k=O.getAttributes();for(let F in k)if(k[F].location>=0){let et=D[F],Y=z[F];if(Y===void 0&&(F==="instanceMatrix"&&y.instanceMatrix&&(Y=y.instanceMatrix),F==="instanceColor"&&y.instanceColor&&(Y=y.instanceColor)),et===void 0||et.attribute!==Y||Y&&et.data!==Y.data)return!0;B++}return r.attributesNum!==B||r.index!==H}function g(y,A,O,H){let D={},z=A.attributes,B=0,k=O.getAttributes();for(let F in k)if(k[F].location>=0){let et=z[F];et===void 0&&(F==="instanceMatrix"&&y.instanceMatrix&&(et=y.instanceMatrix),F==="instanceColor"&&y.instanceColor&&(et=y.instanceColor));let Y={};Y.attribute=et,et&&et.data&&(Y.data=et.data),D[F]=Y,B++}r.attributes=D,r.attributesNum=B,r.index=H}function x(){let y=r.newAttributes;for(let A=0,O=y.length;A<O;A++)y[A]=0}function p(y){m(y,0)}function m(y,A){let O=r.newAttributes,H=r.enabledAttributes,D=r.attributeDivisors;O[y]=1,H[y]===0&&(i.enableVertexAttribArray(y),H[y]=1),D[y]!==A&&(i.vertexAttribDivisor(y,A),D[y]=A)}function _(){let y=r.newAttributes,A=r.enabledAttributes;for(let O=0,H=A.length;O<H;O++)A[O]!==y[O]&&(i.disableVertexAttribArray(O),A[O]=0)}function v(y,A,O,H,D,z,B){B===!0?i.vertexAttribIPointer(y,A,O,D,z):i.vertexAttribPointer(y,A,O,H,D,z)}function M(y,A,O,H){x();let D=H.attributes,z=O.getAttributes(),B=A.defaultAttributeValues;for(let k in z){let F=z[k];if(F.location>=0){let q=D[k];if(q===void 0&&(k==="instanceMatrix"&&y.instanceMatrix&&(q=y.instanceMatrix),k==="instanceColor"&&y.instanceColor&&(q=y.instanceColor)),q!==void 0){let et=q.normalized,Y=q.itemSize,at=t.get(q);if(at===void 0)continue;let Dt=at.buffer,j=at.type,rt=at.bytesPerElement,dt=j===i.INT||j===i.UNSIGNED_INT||q.gpuType===cu;if(q.isInterleavedBufferAttribute){let gt=q.data,Ft=gt.stride,Et=q.offset;if(gt.isInstancedInterleavedBuffer){for(let Vt=0;Vt<F.locationSize;Vt++)m(F.location+Vt,gt.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Vt=0;Vt<F.locationSize;Vt++)p(F.location+Vt);i.bindBuffer(i.ARRAY_BUFFER,Dt);for(let Vt=0;Vt<F.locationSize;Vt++)v(F.location+Vt,Y/F.locationSize,j,et,Ft*rt,(Et+Y/F.locationSize*Vt)*rt,dt)}else{if(q.isInstancedBufferAttribute){for(let gt=0;gt<F.locationSize;gt++)m(F.location+gt,q.meshPerAttribute);y.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let gt=0;gt<F.locationSize;gt++)p(F.location+gt);i.bindBuffer(i.ARRAY_BUFFER,Dt);for(let gt=0;gt<F.locationSize;gt++)v(F.location+gt,Y/F.locationSize,j,et,Y*rt,Y/F.locationSize*gt*rt,dt)}}else if(B!==void 0){let et=B[k];if(et!==void 0)switch(et.length){case 2:i.vertexAttrib2fv(F.location,et);break;case 3:i.vertexAttrib3fv(F.location,et);break;case 4:i.vertexAttrib4fv(F.location,et);break;default:i.vertexAttrib1fv(F.location,et)}}}}_()}function C(){I();for(let y in n){let A=n[y];for(let O in A){let H=A[O];for(let D in H)u(H[D].object),delete H[D];delete A[O]}delete n[y]}}function w(y){if(n[y.id]===void 0)return;let A=n[y.id];for(let O in A){let H=A[O];for(let D in H)u(H[D].object),delete H[D];delete A[O]}delete n[y.id]}function S(y){for(let A in n){let O=n[A];if(O[y.id]===void 0)continue;let H=O[y.id];for(let D in H)u(H[D].object),delete H[D];delete O[y.id]}}function I(){U(),o=!0,r!==s&&(r=s,c(r.object))}function U(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:U,dispose:C,releaseStatesOfGeometry:w,releaseStatesOfProgram:S,initAttributes:x,enableAttribute:p,disableUnusedAttributes:_}}function dg(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function a(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let d=0;for(let g=0;g<h;g++)d+=u[g];e.update(d,n,1)}function l(c,u,h,f){if(h===0)return;let d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],u[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,u,0,f,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x];for(let x=0;x<f.length;x++)e.update(g,n,f[x])}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function pg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let S=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(S.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(S){return!(S!==kn&&n.convert(S)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(S){let I=S===Ye&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(S!==Vn&&n.convert(S)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&S!==Qn&&!I)}function l(S){if(S==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";S="mediump"}return S==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let h=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(f===!0){let S=t.get("EXT_clip_control");S.clipControlEXT(S.LOWER_LEFT_EXT,S.ZERO_TO_ONE_EXT)}let d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),_=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=g>0,w=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:_,maxVaryings:v,maxFragmentUniforms:M,vertexTextures:C,maxSamples:w}}function mg(i){let t=this,e=null,n=0,s=!1,r=!1,o=new On,a=new ee,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){let d=h.length!==0||f||n!==0||s;return s=f,n=h.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){e=u(h,f,0)},this.setState=function(h,f,d){let g=h.clippingPlanes,x=h.clipIntersection,p=h.clipShadows,m=i.get(h);if(!s||g===null||g.length===0||r&&!p)r?u(null):c();else{let _=r?0:n,v=_*4,M=m.clippingState||null;l.value=M,M=u(g,f,v,d);for(let C=0;C!==v;++C)M[C]=e[C];m.clippingState=M,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,f,d,g){let x=h!==null?h.length:0,p=null;if(x!==0){if(p=l.value,g!==!0||p===null){let m=d+x*4,_=f.matrixWorldInverse;a.getNormalMatrix(_),(p===null||p.length<m)&&(p=new Float32Array(m));for(let v=0,M=d;v!==x;++v,M+=4)o.copy(h[v]).applyMatrix4(_,a),o.normal.toArray(p,M),p[M+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,p}}function gg(i){let t=new WeakMap;function e(o,a){return a===Bl?o.mapping=Qs:a===zl&&(o.mapping=js),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Bl||a===zl)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new yc(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var nr=class extends Jo{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Gs=4,fh=[.125,.215,.35,.446,.526,.582],rs=20,xl=new nr,dh=new nt,vl=null,yl=0,_l=0,Ml=!1,is=(1+Math.sqrt(5))/2,Bs=1/is,ph=[new P(-is,Bs,0),new P(is,Bs,0),new P(-Bs,0,is),new P(Bs,0,is),new P(0,is,-Bs),new P(0,is,Bs),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],ir=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){vl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),_l=this._renderer.getActiveMipmapLevel(),Ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(vl,yl,_l),this._renderer.xr.enabled=Ml,t.scissorTest=!1,yo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Qs||t.mapping===js?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),vl=this._renderer.getRenderTarget(),yl=this._renderer.getActiveCubeFace(),_l=this._renderer.getActiveMipmapLevel(),Ml=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:En,minFilter:En,generateMipmaps:!1,type:Ye,format:kn,colorSpace:Vi,depthBuffer:!1},s=mh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=mh(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=xg(r)),this._blurMaterial=vg(r,t,e)}return s}_compileMaterial(t){let e=new jt(this._lodPlanes[0],t);this._renderer.compile(e,xl)}_sceneToCubeUV(t,e,n,s){let a=new Ve(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(dh),u.toneMapping=Di,u.autoClear=!1;let d=new Sn({name:"PMREM.Background",side:tn,depthWrite:!1,depthTest:!1}),g=new jt(new re,d),x=!1,p=t.background;p?p.isColor&&(d.color.copy(p),t.background=null,x=!0):(d.color.copy(dh),x=!0);for(let m=0;m<6;m++){let _=m%3;_===0?(a.up.set(0,l[m],0),a.lookAt(c[m],0,0)):_===1?(a.up.set(0,0,l[m]),a.lookAt(0,c[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,c[m]));let v=this._cubeSize;yo(s,_*v,m>2?v:0,v,v),u.setRenderTarget(s),x&&u.render(g,a),u.render(t,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=f,u.autoClear=h,t.background=p}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Qs||t.mapping===js;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=xh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gh());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new jt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;yo(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,xl)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=ph[(s-r-1)%ph.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new jt(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*rs-1),x=r/g,p=isFinite(r)?1+Math.floor(u*x):rs;p>rs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${rs}`);let m=[],_=0;for(let S=0;S<rs;++S){let I=S/x,U=Math.exp(-I*I/2);m.push(U),S===0?_+=U:S<p&&(_+=2*U)}for(let S=0;S<m.length;S++)m[S]=m[S]/_;f.envMap.value=t.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:v}=this;f.dTheta.value=g,f.mipInt.value=v-n;let M=this._sizeLods[s],C=3*M*(s>v-Gs?s-v+Gs:0),w=4*(this._cubeSize-M);yo(e,C,w,3*M,2*M),l.setRenderTarget(e),l.render(h,xl)}};function xg(i){let t=[],e=[],n=[],s=i,r=i-Gs+1+fh.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let l=1/a;o>i-Gs?l=fh[o-i+Gs-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],d=6,g=6,x=3,p=2,m=1,_=new Float32Array(x*g*d),v=new Float32Array(p*g*d),M=new Float32Array(m*g*d);for(let w=0;w<d;w++){let S=w%3*2/3-1,I=w>2?0:-1,U=[S,I,0,S+2/3,I,0,S+2/3,I+1,0,S,I,0,S+2/3,I+1,0,S,I+1,0];_.set(U,x*g*w),v.set(f,p*g*w);let y=[w,w,w,w,w,w];M.set(y,m*g*w)}let C=new Jt;C.setAttribute("position",new ue(_,x)),C.setAttribute("uv",new ue(v,p)),C.setAttribute("faceIndex",new ue(M,m)),t.push(C),s>Gs&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function mh(i,t,e){let n=new be(i,t,e);return n.texture.mapping=ha,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function yo(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function vg(i,t,e){let n=new Float32Array(rs),s=new P(0,1,0);return new oe({name:"SphericalGaussianBlur",defines:{n:rs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function gh(){return new oe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function xh(){return new oe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Rn,depthTest:!1,depthWrite:!1})}function xu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function yg(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Bl||l===zl,u=l===Qs||l===js;if(c||u){let h=t.get(a),f=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return e===null&&(e=new ir(i)),h=c?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{let d=a.image;return c&&d&&d.height>0||u&&d&&s(d)?(e===null&&(e=new ir(i)),h=c?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function _g(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&No("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Mg(i,t,e,n){let s={},r=new WeakMap;function o(h){let f=h.target;f.index!==null&&t.remove(f.index);for(let g in f.attributes)t.remove(f.attributes[g]);for(let g in f.morphAttributes){let x=f.morphAttributes[g];for(let p=0,m=x.length;p<m;p++)t.remove(x[p])}f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,e.memory.geometries++),f}function l(h){let f=h.attributes;for(let g in f)t.update(f[g],i.ARRAY_BUFFER);let d=h.morphAttributes;for(let g in d){let x=d[g];for(let p=0,m=x.length;p<m;p++)t.update(x[p],i.ARRAY_BUFFER)}}function c(h){let f=[],d=h.index,g=h.attributes.position,x=0;if(d!==null){let _=d.array;x=d.version;for(let v=0,M=_.length;v<M;v+=3){let C=_[v+0],w=_[v+1],S=_[v+2];f.push(C,w,w,S,S,C)}}else if(g!==void 0){let _=g.array;x=g.version;for(let v=0,M=_.length/3-1;v<M;v+=3){let C=v+0,w=v+1,S=v+2;f.push(C,w,w,S,S,C)}}else return;let p=new(uf(f)?Zo:Yo)(f,1);p.version=x;let m=r.get(h);m&&t.remove(m),r.set(h,p)}function u(h){let f=r.get(h);if(f){let d=h.index;d!==null&&f.version<d.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Ag(i,t,e){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*o),e.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,r,f*o,g),e.update(d,n,g))}function u(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,g);let p=0;for(let m=0;m<g;m++)p+=d[m];e.update(p,n,1)}function h(f,d,g,x){if(g===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<f.length;m++)c(f[m]/o,d[m],x[m]);else{p.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,x,0,g);let m=0;for(let _=0;_<g;_++)m+=d[_];for(let _=0;_<x.length;_++)e.update(m,n,x[_])}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Eg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Sg(i,t,e){let n=new WeakMap,s=new ae;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0,f=n.get(a);if(f===void 0||f.count!==h){let U=function(){S.dispose(),n.delete(a),a.removeEventListener("dispose",U)};f!==void 0&&f.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],_=a.morphAttributes.color||[],v=0;d===!0&&(v=1),g===!0&&(v=2),x===!0&&(v=3);let M=a.attributes.position.count*v,C=1;M>t.maxTextureSize&&(C=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let w=new Float32Array(M*C*4*h),S=new Wo(w,M,C,h);S.type=Qn,S.needsUpdate=!0;let I=v*4;for(let y=0;y<h;y++){let A=p[y],O=m[y],H=_[y],D=M*C*4*y;for(let z=0;z<A.count;z++){let B=z*I;d===!0&&(s.fromBufferAttribute(A,z),w[D+B+0]=s.x,w[D+B+1]=s.y,w[D+B+2]=s.z,w[D+B+3]=0),g===!0&&(s.fromBufferAttribute(O,z),w[D+B+4]=s.x,w[D+B+5]=s.y,w[D+B+6]=s.z,w[D+B+7]=0),x===!0&&(s.fromBufferAttribute(H,z),w[D+B+8]=s.x,w[D+B+9]=s.y,w[D+B+10]=s.z,w[D+B+11]=H.itemSize===4?s.w:1)}}f={count:h,texture:S,size:new it(M,C)},n.set(a,f),a.addEventListener("dispose",U)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function bg(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}var sr=class extends pn{constructor(t,e,n,s,r,o,a,l,c,u=qs){if(u!==qs&&u!==tr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===qs&&(n=as),n===void 0&&u===tr&&(n=$s),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:dn,this.minFilter=l!==void 0?l:dn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},pf=new pn,vh=new sr(1,1),mf=new Wo,gf=new xc,xf=new Ko,yh=[],_h=[],Mh=new Float32Array(16),Ah=new Float32Array(9),Eh=new Float32Array(4);function ar(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=yh[s];if(r===void 0&&(r=new Float32Array(s),yh[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function ze(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Oe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function da(i,t){let e=_h[t];e===void 0&&(e=new Int32Array(t),_h[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function wg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Tg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ze(e,t))return;i.uniform2fv(this.addr,t),Oe(e,t)}}function Rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ze(e,t))return;i.uniform3fv(this.addr,t),Oe(e,t)}}function Cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ze(e,t))return;i.uniform4fv(this.addr,t),Oe(e,t)}}function Pg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ze(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Oe(e,t)}else{if(ze(e,n))return;Eh.set(n),i.uniformMatrix2fv(this.addr,!1,Eh),Oe(e,n)}}function Ig(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ze(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Oe(e,t)}else{if(ze(e,n))return;Ah.set(n),i.uniformMatrix3fv(this.addr,!1,Ah),Oe(e,n)}}function Fg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(ze(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Oe(e,t)}else{if(ze(e,n))return;Mh.set(n),i.uniformMatrix4fv(this.addr,!1,Mh),Oe(e,n)}}function Dg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ze(e,t))return;i.uniform2iv(this.addr,t),Oe(e,t)}}function Ug(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ze(e,t))return;i.uniform3iv(this.addr,t),Oe(e,t)}}function Ng(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ze(e,t))return;i.uniform4iv(this.addr,t),Oe(e,t)}}function Bg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ze(e,t))return;i.uniform2uiv(this.addr,t),Oe(e,t)}}function Og(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ze(e,t))return;i.uniform3uiv(this.addr,t),Oe(e,t)}}function Hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ze(e,t))return;i.uniform4uiv(this.addr,t),Oe(e,t)}}function kg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(vh.compareFunction=cf,r=vh):r=pf,e.setTexture2D(t||r,s)}function Vg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||gf,s)}function Gg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||xf,s)}function Wg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||mf,s)}function Xg(i){switch(i){case 5126:return wg;case 35664:return Tg;case 35665:return Rg;case 35666:return Cg;case 35674:return Pg;case 35675:return Ig;case 35676:return Fg;case 5124:case 35670:return Dg;case 35667:case 35671:return Lg;case 35668:case 35672:return Ug;case 35669:case 35673:return Ng;case 5125:return Bg;case 36294:return zg;case 36295:return Og;case 36296:return Hg;case 35678:case 36198:case 36298:case 36306:case 35682:return kg;case 35679:case 36299:case 36307:return Vg;case 35680:case 36300:case 36308:case 36293:return Gg;case 36289:case 36303:case 36311:case 36292:return Wg}}function qg(i,t){i.uniform1fv(this.addr,t)}function Yg(i,t){let e=ar(t,this.size,2);i.uniform2fv(this.addr,e)}function Zg(i,t){let e=ar(t,this.size,3);i.uniform3fv(this.addr,e)}function Jg(i,t){let e=ar(t,this.size,4);i.uniform4fv(this.addr,e)}function Kg(i,t){let e=ar(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Qg(i,t){let e=ar(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function jg(i,t){let e=ar(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function $g(i,t){i.uniform1iv(this.addr,t)}function tx(i,t){i.uniform2iv(this.addr,t)}function ex(i,t){i.uniform3iv(this.addr,t)}function nx(i,t){i.uniform4iv(this.addr,t)}function ix(i,t){i.uniform1uiv(this.addr,t)}function sx(i,t){i.uniform2uiv(this.addr,t)}function rx(i,t){i.uniform3uiv(this.addr,t)}function ox(i,t){i.uniform4uiv(this.addr,t)}function ax(i,t,e){let n=this.cache,s=t.length,r=da(e,s);ze(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||pf,r[o])}function lx(i,t,e){let n=this.cache,s=t.length,r=da(e,s);ze(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||gf,r[o])}function cx(i,t,e){let n=this.cache,s=t.length,r=da(e,s);ze(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||xf,r[o])}function ux(i,t,e){let n=this.cache,s=t.length,r=da(e,s);ze(n,r)||(i.uniform1iv(this.addr,r),Oe(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||mf,r[o])}function hx(i){switch(i){case 5126:return qg;case 35664:return Yg;case 35665:return Zg;case 35666:return Jg;case 35674:return Kg;case 35675:return Qg;case 35676:return jg;case 5124:case 35670:return $g;case 35667:case 35671:return tx;case 35668:case 35672:return ex;case 35669:case 35673:return nx;case 5125:return ix;case 36294:return sx;case 36295:return rx;case 36296:return ox;case 35678:case 36198:case 36298:case 36306:case 35682:return ax;case 35679:case 36299:case 36307:return lx;case 35680:case 36300:case 36308:case 36293:return cx;case 36289:case 36303:case 36311:case 36292:return ux}}var _c=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Xg(e.type)}},Mc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=hx(e.type)}},Ac=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Al=/(\w+)(\])?(\[|\.)?/g;function Sh(i,t){i.seq.push(t),i.map[t.id]=t}function fx(i,t,e){let n=i.name,s=n.length;for(Al.lastIndex=0;;){let r=Al.exec(n),o=Al.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Sh(e,c===void 0?new _c(a,i,t):new Mc(a,i,t));break}else{let h=e.map[a];h===void 0&&(h=new Ac(a),Sh(e,h)),e=h}}}var Zs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);fx(r,o,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function bh(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var dx=37297,px=0;function mx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function gx(i){let t=ce.getPrimaries(ce.workingColorSpace),e=ce.getPrimaries(i),n;switch(t===e?n="":t===Ho&&e===Oo?n="LinearDisplayP3ToLinearSRGB":t===Oo&&e===Ho&&(n="LinearSRGBToLinearDisplayP3"),i){case Vi:case fa:return[n,"LinearTransferOETF"];case Be:case gu:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function wh(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+mx(i.getShaderSource(t),o)}else return s}function xx(i,t){let e=gx(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function vx(i,t){let e;switch(t){case su:e="Linear";break;case ru:e="Reinhard";break;case ou:e="Cineon";break;case au:e="ACESFilmic";break;case lu:e="AgX";break;case kr:e="Neutral";break;case Jd:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var _o=new P;function yx(){ce.getLuminanceCoefficients(_o);let i=_o.x.toFixed(4),t=_o.y.toFixed(4),e=_o.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function _x(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(wr).join(`
`)}function Mx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Ax(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function wr(i){return i!==""}function Th(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Rh(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ex=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ec(i){return i.replace(Ex,bx)}var Sx=new Map;function bx(i,t){let e=te[t];if(e===void 0){let n=Sx.get(t);if(n!==void 0)e=te[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Ec(e)}var wx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ch(i){return i.replace(wx,Tx)}function Tx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ph(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Rx(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Jh?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===nu?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===ui&&(t="SHADOWMAP_TYPE_VSM"),t}function Cx(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Qs:case js:t="ENVMAP_TYPE_CUBE";break;case ha:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Px(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case js:t="ENVMAP_MODE_REFRACTION";break}return t}function Ix(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Kh:t="ENVMAP_BLENDING_MULTIPLY";break;case Yd:t="ENVMAP_BLENDING_MIX";break;case Zd:t="ENVMAP_BLENDING_ADD";break}return t}function Fx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Dx(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=Rx(e),c=Cx(e),u=Px(e),h=Ix(e),f=Fx(e),d=_x(e),g=Mx(r),x=s.createProgram(),p,m,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(wr).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(wr).join(`
`),m.length>0&&(m+=`
`)):(p=[Ph(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(wr).join(`
`),m=[Ph(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Di?"#define TONE_MAPPING":"",e.toneMapping!==Di?te.tonemapping_pars_fragment:"",e.toneMapping!==Di?vx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",te.colorspace_pars_fragment,xx("linearToOutputTexel",e.outputColorSpace),yx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(wr).join(`
`)),o=Ec(o),o=Th(o,e),o=Rh(o,e),a=Ec(a),a=Th(a,e),a=Rh(a,e),o=Ch(o),a=Ch(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,p=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Zu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Zu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let v=_+p+o,M=_+m+a,C=bh(s,s.VERTEX_SHADER,v),w=bh(s,s.FRAGMENT_SHADER,M);s.attachShader(x,C),s.attachShader(x,w),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function S(A){if(i.debug.checkShaderErrors){let O=s.getProgramInfoLog(x).trim(),H=s.getShaderInfoLog(C).trim(),D=s.getShaderInfoLog(w).trim(),z=!0,B=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,C,w);else{let k=wh(s,C,"vertex"),F=wh(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+O+`
`+k+`
`+F)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(H===""||D==="")&&(B=!1);B&&(A.diagnostics={runnable:z,programLog:O,vertexShader:{log:H,prefix:p},fragmentShader:{log:D,prefix:m}})}s.deleteShader(C),s.deleteShader(w),I=new Zs(s,x),U=Ax(s,x)}let I;this.getUniforms=function(){return I===void 0&&S(this),I};let U;this.getAttributes=function(){return U===void 0&&S(this),U};let y=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(x,dx)),y},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=px++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=C,this.fragmentShader=w,this}var Lx=0,Sc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new bc(t),e.set(t,n)),n}},bc=class{constructor(t){this.id=Lx++,this.code=t,this.usedTimes=0}};function Ux(i,t,e,n,s,r,o){let a=new qo,l=new Sc,c=new Set,u=[],h=s.logarithmicDepthBuffer,f=s.reverseDepthBuffer,d=s.vertexTextures,g=s.precision,x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,A,O,H,D){let z=H.fog,B=D.geometry,k=y.isMeshStandardMaterial?H.environment:null,F=(y.isMeshStandardMaterial?e:t).get(y.envMap||k),q=F&&F.mapping===ha?F.image.height:null,et=x[y.type];y.precision!==null&&(g=s.getMaxPrecision(y.precision),g!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",g,"instead."));let Y=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,at=Y!==void 0?Y.length:0,Dt=0;B.morphAttributes.position!==void 0&&(Dt=1),B.morphAttributes.normal!==void 0&&(Dt=2),B.morphAttributes.color!==void 0&&(Dt=3);let j,rt,dt,gt;if(et){let se=Jn[et];j=se.vertexShader,rt=se.fragmentShader}else j=y.vertexShader,rt=y.fragmentShader,l.update(y),dt=l.getVertexShaderID(y),gt=l.getFragmentShaderID(y);let Ft=i.getRenderTarget(),Et=D.isInstancedMesh===!0,Vt=D.isBatchedMesh===!0,Tt=!!y.map,ot=!!y.matcap,L=!!F,pt=!!y.aoMap,ft=!!y.lightMap,ut=!!y.bumpMap,yt=!!y.normalMap,Ut=!!y.displacementMap,bt=!!y.emissiveMap,b=!!y.metalnessMap,E=!!y.roughnessMap,G=y.anisotropy>0,$=y.clearcoat>0,tt=y.dispersion>0,Z=y.iridescence>0,Pt=y.sheen>0,xt=y.transmission>0,lt=G&&!!y.anisotropyMap,_t=$&&!!y.clearcoatMap,K=$&&!!y.clearcoatNormalMap,Mt=$&&!!y.clearcoatRoughnessMap,Wt=Z&&!!y.iridescenceMap,Ot=Z&&!!y.iridescenceThicknessMap,Rt=Pt&&!!y.sheenColorMap,$t=Pt&&!!y.sheenRoughnessMap,kt=!!y.specularMap,le=!!y.specularColorMap,V=!!y.specularIntensityMap,wt=xt&&!!y.transmissionMap,st=xt&&!!y.thicknessMap,ct=!!y.gradientMap,St=!!y.alphaMap,Ct=y.alphaTest>0,N=!!y.alphaHash,ht=!!y.extensions,Kt=Di;y.toneMapped&&(Ft===null||Ft.isXRRenderTarget===!0)&&(Kt=i.toneMapping);let Zt={shaderID:et,shaderType:y.type,shaderName:y.name,vertexShader:j,fragmentShader:rt,defines:y.defines,customVertexShaderID:dt,customFragmentShaderID:gt,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:g,batching:Vt,batchingColor:Vt&&D._colorsTexture!==null,instancing:Et,instancingColor:Et&&D.instanceColor!==null,instancingMorph:Et&&D.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Ft===null?i.outputColorSpace:Ft.isXRRenderTarget===!0?Ft.texture.colorSpace:Vi,alphaToCoverage:!!y.alphaToCoverage,map:Tt,matcap:ot,envMap:L,envMapMode:L&&F.mapping,envMapCubeUVHeight:q,aoMap:pt,lightMap:ft,bumpMap:ut,normalMap:yt,displacementMap:d&&Ut,emissiveMap:bt,normalMapObjectSpace:yt&&y.normalMapType===$d,normalMapTangentSpace:yt&&y.normalMapType===lf,metalnessMap:b,roughnessMap:E,anisotropy:G,anisotropyMap:lt,clearcoat:$,clearcoatMap:_t,clearcoatNormalMap:K,clearcoatRoughnessMap:Mt,dispersion:tt,iridescence:Z,iridescenceMap:Wt,iridescenceThicknessMap:Ot,sheen:Pt,sheenColorMap:Rt,sheenRoughnessMap:$t,specularMap:kt,specularColorMap:le,specularIntensityMap:V,transmission:xt,transmissionMap:wt,thicknessMap:st,gradientMap:ct,opaque:y.transparent===!1&&y.blending===Xs&&y.alphaToCoverage===!1,alphaMap:St,alphaTest:Ct,alphaHash:N,combine:y.combine,mapUv:Tt&&p(y.map.channel),aoMapUv:pt&&p(y.aoMap.channel),lightMapUv:ft&&p(y.lightMap.channel),bumpMapUv:ut&&p(y.bumpMap.channel),normalMapUv:yt&&p(y.normalMap.channel),displacementMapUv:Ut&&p(y.displacementMap.channel),emissiveMapUv:bt&&p(y.emissiveMap.channel),metalnessMapUv:b&&p(y.metalnessMap.channel),roughnessMapUv:E&&p(y.roughnessMap.channel),anisotropyMapUv:lt&&p(y.anisotropyMap.channel),clearcoatMapUv:_t&&p(y.clearcoatMap.channel),clearcoatNormalMapUv:K&&p(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Mt&&p(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Wt&&p(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ot&&p(y.iridescenceThicknessMap.channel),sheenColorMapUv:Rt&&p(y.sheenColorMap.channel),sheenRoughnessMapUv:$t&&p(y.sheenRoughnessMap.channel),specularMapUv:kt&&p(y.specularMap.channel),specularColorMapUv:le&&p(y.specularColorMap.channel),specularIntensityMapUv:V&&p(y.specularIntensityMap.channel),transmissionMapUv:wt&&p(y.transmissionMap.channel),thicknessMapUv:st&&p(y.thicknessMap.channel),alphaMapUv:St&&p(y.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(yt||G),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!B.attributes.uv&&(Tt||St),fog:!!z,useFog:y.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:f,skinning:D.isSkinnedMesh===!0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:at,morphTextureStride:Dt,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:Kt,decodeVideoTexture:Tt&&y.map.isVideoTexture===!0&&ce.getTransfer(y.map.colorSpace)===ye,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Ue,flipSided:y.side===tn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ht&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ht&&y.extensions.multiDraw===!0||Vt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Zt.vertexUv1s=c.has(1),Zt.vertexUv2s=c.has(2),Zt.vertexUv3s=c.has(3),c.clear(),Zt}function _(y){let A=[];if(y.shaderID?A.push(y.shaderID):(A.push(y.customVertexShaderID),A.push(y.customFragmentShaderID)),y.defines!==void 0)for(let O in y.defines)A.push(O),A.push(y.defines[O]);return y.isRawShaderMaterial===!1&&(v(A,y),M(A,y),A.push(i.outputColorSpace)),A.push(y.customProgramCacheKey),A.join()}function v(y,A){y.push(A.precision),y.push(A.outputColorSpace),y.push(A.envMapMode),y.push(A.envMapCubeUVHeight),y.push(A.mapUv),y.push(A.alphaMapUv),y.push(A.lightMapUv),y.push(A.aoMapUv),y.push(A.bumpMapUv),y.push(A.normalMapUv),y.push(A.displacementMapUv),y.push(A.emissiveMapUv),y.push(A.metalnessMapUv),y.push(A.roughnessMapUv),y.push(A.anisotropyMapUv),y.push(A.clearcoatMapUv),y.push(A.clearcoatNormalMapUv),y.push(A.clearcoatRoughnessMapUv),y.push(A.iridescenceMapUv),y.push(A.iridescenceThicknessMapUv),y.push(A.sheenColorMapUv),y.push(A.sheenRoughnessMapUv),y.push(A.specularMapUv),y.push(A.specularColorMapUv),y.push(A.specularIntensityMapUv),y.push(A.transmissionMapUv),y.push(A.thicknessMapUv),y.push(A.combine),y.push(A.fogExp2),y.push(A.sizeAttenuation),y.push(A.morphTargetsCount),y.push(A.morphAttributeCount),y.push(A.numDirLights),y.push(A.numPointLights),y.push(A.numSpotLights),y.push(A.numSpotLightMaps),y.push(A.numHemiLights),y.push(A.numRectAreaLights),y.push(A.numDirLightShadows),y.push(A.numPointLightShadows),y.push(A.numSpotLightShadows),y.push(A.numSpotLightShadowsWithMaps),y.push(A.numLightProbes),y.push(A.shadowMapType),y.push(A.toneMapping),y.push(A.numClippingPlanes),y.push(A.numClipIntersection),y.push(A.depthPacking)}function M(y,A){a.disableAll(),A.supportsVertexTextures&&a.enable(0),A.instancing&&a.enable(1),A.instancingColor&&a.enable(2),A.instancingMorph&&a.enable(3),A.matcap&&a.enable(4),A.envMap&&a.enable(5),A.normalMapObjectSpace&&a.enable(6),A.normalMapTangentSpace&&a.enable(7),A.clearcoat&&a.enable(8),A.iridescence&&a.enable(9),A.alphaTest&&a.enable(10),A.vertexColors&&a.enable(11),A.vertexAlphas&&a.enable(12),A.vertexUv1s&&a.enable(13),A.vertexUv2s&&a.enable(14),A.vertexUv3s&&a.enable(15),A.vertexTangents&&a.enable(16),A.anisotropy&&a.enable(17),A.alphaHash&&a.enable(18),A.batching&&a.enable(19),A.dispersion&&a.enable(20),A.batchingColor&&a.enable(21),y.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reverseDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.alphaToCoverage&&a.enable(20),y.push(a.mask)}function C(y){let A=x[y.type],O;if(A){let H=Jn[A];O=jn.clone(H.uniforms)}else O=y.uniforms;return O}function w(y,A){let O;for(let H=0,D=u.length;H<D;H++){let z=u[H];if(z.cacheKey===A){O=z,++O.usedTimes;break}}return O===void 0&&(O=new Dx(i,A,y,r),u.push(O)),O}function S(y){if(--y.usedTimes===0){let A=u.indexOf(y);u[A]=u[u.length-1],u.pop(),y.destroy()}}function I(y){l.remove(y)}function U(){l.dispose()}return{getParameters:m,getProgramCacheKey:_,getUniforms:C,acquireProgram:w,releaseProgram:S,releaseShaderCache:I,programs:u,dispose:U}}function Nx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Bx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Ih(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Fh(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h,f,d,g,x,p){let m=i[t];return m===void 0?(m={id:h.id,object:h,geometry:f,material:d,groupOrder:g,renderOrder:h.renderOrder,z:x,group:p},i[t]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=d,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=x,m.group=p),t++,m}function a(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?n.push(m):d.transparent===!0?s.push(m):e.push(m)}function l(h,f,d,g,x,p){let m=o(h,f,d,g,x,p);d.transmission>0?n.unshift(m):d.transparent===!0?s.unshift(m):e.unshift(m)}function c(h,f){e.length>1&&e.sort(h||Bx),n.length>1&&n.sort(f||Ih),s.length>1&&s.sort(f||Ih)}function u(){for(let h=t,f=i.length;h<f;h++){let d=i[h];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function zx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Fh,i.set(n,[o])):s>=r.length?(o=new Fh,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Ox(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new P,color:new nt};break;case"SpotLight":e={position:new P,direction:new P,color:new nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new nt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new nt,groundColor:new nt};break;case"RectAreaLight":e={color:new nt,position:new P,halfWidth:new P,halfHeight:new P};break}return i[t.id]=e,e}}}function Hx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new it,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var kx=0;function Vx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Gx(i){let t=new Ox,e=Hx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);let s=new P,r=new Yt,o=new Yt;function a(c){let u=0,h=0,f=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let d=0,g=0,x=0,p=0,m=0,_=0,v=0,M=0,C=0,w=0,S=0;c.sort(Vx);for(let U=0,y=c.length;U<y;U++){let A=c[U],O=A.color,H=A.intensity,D=A.distance,z=A.shadow&&A.shadow.map?A.shadow.map.texture:null;if(A.isAmbientLight)u+=O.r*H,h+=O.g*H,f+=O.b*H;else if(A.isLightProbe){for(let B=0;B<9;B++)n.probe[B].addScaledVector(A.sh.coefficients[B],H);S++}else if(A.isDirectionalLight){let B=t.get(A);if(B.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){let k=A.shadow,F=e.get(A);F.shadowIntensity=k.intensity,F.shadowBias=k.bias,F.shadowNormalBias=k.normalBias,F.shadowRadius=k.radius,F.shadowMapSize=k.mapSize,n.directionalShadow[d]=F,n.directionalShadowMap[d]=z,n.directionalShadowMatrix[d]=A.shadow.matrix,_++}n.directional[d]=B,d++}else if(A.isSpotLight){let B=t.get(A);B.position.setFromMatrixPosition(A.matrixWorld),B.color.copy(O).multiplyScalar(H),B.distance=D,B.coneCos=Math.cos(A.angle),B.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),B.decay=A.decay,n.spot[x]=B;let k=A.shadow;if(A.map&&(n.spotLightMap[C]=A.map,C++,k.updateMatrices(A),A.castShadow&&w++),n.spotLightMatrix[x]=k.matrix,A.castShadow){let F=e.get(A);F.shadowIntensity=k.intensity,F.shadowBias=k.bias,F.shadowNormalBias=k.normalBias,F.shadowRadius=k.radius,F.shadowMapSize=k.mapSize,n.spotShadow[x]=F,n.spotShadowMap[x]=z,M++}x++}else if(A.isRectAreaLight){let B=t.get(A);B.color.copy(O).multiplyScalar(H),B.halfWidth.set(A.width*.5,0,0),B.halfHeight.set(0,A.height*.5,0),n.rectArea[p]=B,p++}else if(A.isPointLight){let B=t.get(A);if(B.color.copy(A.color).multiplyScalar(A.intensity),B.distance=A.distance,B.decay=A.decay,A.castShadow){let k=A.shadow,F=e.get(A);F.shadowIntensity=k.intensity,F.shadowBias=k.bias,F.shadowNormalBias=k.normalBias,F.shadowRadius=k.radius,F.shadowMapSize=k.mapSize,F.shadowCameraNear=k.camera.near,F.shadowCameraFar=k.camera.far,n.pointShadow[g]=F,n.pointShadowMap[g]=z,n.pointShadowMatrix[g]=A.shadow.matrix,v++}n.point[g]=B,g++}else if(A.isHemisphereLight){let B=t.get(A);B.skyColor.copy(A.color).multiplyScalar(H),B.groundColor.copy(A.groundColor).multiplyScalar(H),n.hemi[m]=B,m++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=At.LTC_FLOAT_1,n.rectAreaLTC2=At.LTC_FLOAT_2):(n.rectAreaLTC1=At.LTC_HALF_1,n.rectAreaLTC2=At.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=f;let I=n.hash;(I.directionalLength!==d||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==p||I.hemiLength!==m||I.numDirectionalShadows!==_||I.numPointShadows!==v||I.numSpotShadows!==M||I.numSpotMaps!==C||I.numLightProbes!==S)&&(n.directional.length=d,n.spot.length=x,n.rectArea.length=p,n.point.length=g,n.hemi.length=m,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=M+C-w,n.spotLightMap.length=C,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=S,I.directionalLength=d,I.pointLength=g,I.spotLength=x,I.rectAreaLength=p,I.hemiLength=m,I.numDirectionalShadows=_,I.numPointShadows=v,I.numSpotShadows=M,I.numSpotMaps=C,I.numLightProbes=S,n.version=kx++)}function l(c,u){let h=0,f=0,d=0,g=0,x=0,p=u.matrixWorldInverse;for(let m=0,_=c.length;m<_;m++){let v=c[m];if(v.isDirectionalLight){let M=n.directional[h];M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),h++}else if(v.isSpotLight){let M=n.spot[d];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),d++}else if(v.isRectAreaLight){let M=n.rectArea[g];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),o.identity(),r.copy(v.matrixWorld),r.premultiply(p),o.extractRotation(r),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){let M=n.point[f];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),f++}else if(v.isHemisphereLight){let M=n.hemi[x];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(p),x++}}}return{setup:a,setupView:l,state:n}}function Dh(i){let t=new Gx(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function o(u){n.push(u)}function a(){t.setup(e)}function l(u){t.setupView(e,u)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Wx(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Dh(i),t.set(s,[a])):r>=o.length?(a=new Dh(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var wc=class extends gi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Qd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Tc=class extends gi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},Xx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,qx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Yx(i,t,e){let n=new Ir,s=new it,r=new it,o=new ae,a=new wc({depthPacking:jd}),l=new Tc,c={},u=e.maxTextureSize,h={[Ui]:tn,[tn]:Ui,[Ue]:Ue},f=new oe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new it},radius:{value:4}},vertexShader:Xx,fragmentShader:qx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new Jt;g.setAttribute("position",new ue(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new jt(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jh;let m=this.type;this.render=function(w,S,I){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;let U=i.getRenderTarget(),y=i.getActiveCubeFace(),A=i.getActiveMipmapLevel(),O=i.state;O.setBlending(Rn),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);let H=m!==ui&&this.type===ui,D=m===ui&&this.type!==ui;for(let z=0,B=w.length;z<B;z++){let k=w[z],F=k.shadow;if(F===void 0){console.warn("THREE.WebGLShadowMap:",k,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;s.copy(F.mapSize);let q=F.getFrameExtents();if(s.multiply(q),r.copy(F.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/q.x),s.x=r.x*q.x,F.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/q.y),s.y=r.y*q.y,F.mapSize.y=r.y)),F.map===null||H===!0||D===!0){let Y=this.type!==ui?{minFilter:dn,magFilter:dn}:{};F.map!==null&&F.map.dispose(),F.map=new be(s.x,s.y,Y),F.map.texture.name=k.name+".shadowMap",F.camera.updateProjectionMatrix()}i.setRenderTarget(F.map),i.clear();let et=F.getViewportCount();for(let Y=0;Y<et;Y++){let at=F.getViewport(Y);o.set(r.x*at.x,r.y*at.y,r.x*at.z,r.y*at.w),O.viewport(o),F.updateMatrices(k,Y),n=F.getFrustum(),M(S,I,F.camera,k,this.type)}F.isPointLightShadow!==!0&&this.type===ui&&_(F,I),F.needsUpdate=!1}m=this.type,p.needsUpdate=!1,i.setRenderTarget(U,y,A)};function _(w,S){let I=t.update(x);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new be(s.x,s.y)),f.uniforms.shadow_pass.value=w.map.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(S,null,I,f,x,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(S,null,I,d,x,null)}function v(w,S,I,U){let y=null,A=I.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(A!==void 0)y=A;else if(y=I.isPointLight===!0?l:a,i.localClippingEnabled&&S.clipShadows===!0&&Array.isArray(S.clippingPlanes)&&S.clippingPlanes.length!==0||S.displacementMap&&S.displacementScale!==0||S.alphaMap&&S.alphaTest>0||S.map&&S.alphaTest>0){let O=y.uuid,H=S.uuid,D=c[O];D===void 0&&(D={},c[O]=D);let z=D[H];z===void 0&&(z=y.clone(),D[H]=z,S.addEventListener("dispose",C)),y=z}if(y.visible=S.visible,y.wireframe=S.wireframe,U===ui?y.side=S.shadowSide!==null?S.shadowSide:S.side:y.side=S.shadowSide!==null?S.shadowSide:h[S.side],y.alphaMap=S.alphaMap,y.alphaTest=S.alphaTest,y.map=S.map,y.clipShadows=S.clipShadows,y.clippingPlanes=S.clippingPlanes,y.clipIntersection=S.clipIntersection,y.displacementMap=S.displacementMap,y.displacementScale=S.displacementScale,y.displacementBias=S.displacementBias,y.wireframeLinewidth=S.wireframeLinewidth,y.linewidth=S.linewidth,I.isPointLight===!0&&y.isMeshDistanceMaterial===!0){let O=i.properties.get(y);O.light=I}return y}function M(w,S,I,U,y){if(w.visible===!1)return;if(w.layers.test(S.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&y===ui)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,w.matrixWorld);let H=t.update(w),D=w.material;if(Array.isArray(D)){let z=H.groups;for(let B=0,k=z.length;B<k;B++){let F=z[B],q=D[F.materialIndex];if(q&&q.visible){let et=v(w,q,U,y);w.onBeforeShadow(i,w,S,I,H,et,F),i.renderBufferDirect(I,null,H,et,w,F),w.onAfterShadow(i,w,S,I,H,et,F)}}}else if(D.visible){let z=v(w,D,U,y);w.onBeforeShadow(i,w,S,I,H,z,null),i.renderBufferDirect(I,null,H,z,w,null),w.onAfterShadow(i,w,S,I,H,z,null)}}let O=w.children;for(let H=0,D=O.length;H<D;H++)M(O[H],S,I,U,y)}function C(w){w.target.removeEventListener("dispose",C);for(let I in c){let U=c[I],y=w.target.uuid;y in U&&(U[y].dispose(),delete U[y])}}}var Zx={[Pl]:Il,[Fl]:Ul,[Dl]:Nl,[Ks]:Ll,[Il]:Pl,[Ul]:Fl,[Nl]:Dl,[Ll]:Ks};function Jx(i){function t(){let V=!1,wt=new ae,st=null,ct=new ae(0,0,0,0);return{setMask:function(St){st!==St&&!V&&(i.colorMask(St,St,St,St),st=St)},setLocked:function(St){V=St},setClear:function(St,Ct,N,ht,Kt){Kt===!0&&(St*=ht,Ct*=ht,N*=ht),wt.set(St,Ct,N,ht),ct.equals(wt)===!1&&(i.clearColor(St,Ct,N,ht),ct.copy(wt))},reset:function(){V=!1,st=null,ct.set(-1,0,0,0)}}}function e(){let V=!1,wt=!1,st=null,ct=null,St=null;return{setReversed:function(Ct){wt=Ct},setTest:function(Ct){Ct?dt(i.DEPTH_TEST):gt(i.DEPTH_TEST)},setMask:function(Ct){st!==Ct&&!V&&(i.depthMask(Ct),st=Ct)},setFunc:function(Ct){if(wt&&(Ct=Zx[Ct]),ct!==Ct){switch(Ct){case Pl:i.depthFunc(i.NEVER);break;case Il:i.depthFunc(i.ALWAYS);break;case Fl:i.depthFunc(i.LESS);break;case Ks:i.depthFunc(i.LEQUAL);break;case Dl:i.depthFunc(i.EQUAL);break;case Ll:i.depthFunc(i.GEQUAL);break;case Ul:i.depthFunc(i.GREATER);break;case Nl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ct=Ct}},setLocked:function(Ct){V=Ct},setClear:function(Ct){St!==Ct&&(i.clearDepth(Ct),St=Ct)},reset:function(){V=!1,st=null,ct=null,St=null}}}function n(){let V=!1,wt=null,st=null,ct=null,St=null,Ct=null,N=null,ht=null,Kt=null;return{setTest:function(Zt){V||(Zt?dt(i.STENCIL_TEST):gt(i.STENCIL_TEST))},setMask:function(Zt){wt!==Zt&&!V&&(i.stencilMask(Zt),wt=Zt)},setFunc:function(Zt,se,Te){(st!==Zt||ct!==se||St!==Te)&&(i.stencilFunc(Zt,se,Te),st=Zt,ct=se,St=Te)},setOp:function(Zt,se,Te){(Ct!==Zt||N!==se||ht!==Te)&&(i.stencilOp(Zt,se,Te),Ct=Zt,N=se,ht=Te)},setLocked:function(Zt){V=Zt},setClear:function(Zt){Kt!==Zt&&(i.clearStencil(Zt),Kt=Zt)},reset:function(){V=!1,wt=null,st=null,ct=null,St=null,Ct=null,N=null,ht=null,Kt=null}}}let s=new t,r=new e,o=new n,a=new WeakMap,l=new WeakMap,c={},u={},h=new WeakMap,f=[],d=null,g=!1,x=null,p=null,m=null,_=null,v=null,M=null,C=null,w=new nt(0,0,0),S=0,I=!1,U=null,y=null,A=null,O=null,H=null,D=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,B=0,k=i.getParameter(i.VERSION);k.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(k)[1]),z=B>=1):k.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),z=B>=2);let F=null,q={},et=i.getParameter(i.SCISSOR_BOX),Y=i.getParameter(i.VIEWPORT),at=new ae().fromArray(et),Dt=new ae().fromArray(Y);function j(V,wt,st,ct){let St=new Uint8Array(4),Ct=i.createTexture();i.bindTexture(V,Ct),i.texParameteri(V,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(V,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let N=0;N<st;N++)V===i.TEXTURE_3D||V===i.TEXTURE_2D_ARRAY?i.texImage3D(wt,0,i.RGBA,1,1,ct,0,i.RGBA,i.UNSIGNED_BYTE,St):i.texImage2D(wt+N,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,St);return Ct}let rt={};rt[i.TEXTURE_2D]=j(i.TEXTURE_2D,i.TEXTURE_2D,1),rt[i.TEXTURE_CUBE_MAP]=j(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),rt[i.TEXTURE_2D_ARRAY]=j(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),rt[i.TEXTURE_3D]=j(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),o.setClear(0),dt(i.DEPTH_TEST),r.setFunc(Ks),ft(!1),ut(ku),dt(i.CULL_FACE),L(Rn);function dt(V){c[V]!==!0&&(i.enable(V),c[V]=!0)}function gt(V){c[V]!==!1&&(i.disable(V),c[V]=!1)}function Ft(V,wt){return u[V]!==wt?(i.bindFramebuffer(V,wt),u[V]=wt,V===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=wt),V===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=wt),!0):!1}function Et(V,wt){let st=f,ct=!1;if(V){st=h.get(wt),st===void 0&&(st=[],h.set(wt,st));let St=V.textures;if(st.length!==St.length||st[0]!==i.COLOR_ATTACHMENT0){for(let Ct=0,N=St.length;Ct<N;Ct++)st[Ct]=i.COLOR_ATTACHMENT0+Ct;st.length=St.length,ct=!0}}else st[0]!==i.BACK&&(st[0]=i.BACK,ct=!0);ct&&i.drawBuffers(st)}function Vt(V){return d!==V?(i.useProgram(V),d=V,!0):!1}let Tt={[ss]:i.FUNC_ADD,[Id]:i.FUNC_SUBTRACT,[Fd]:i.FUNC_REVERSE_SUBTRACT};Tt[Dd]=i.MIN,Tt[Ld]=i.MAX;let ot={[Ud]:i.ZERO,[ua]:i.ONE,[Nd]:i.SRC_COLOR,[Cl]:i.SRC_ALPHA,[Vd]:i.SRC_ALPHA_SATURATE,[Hd]:i.DST_COLOR,[zd]:i.DST_ALPHA,[Bd]:i.ONE_MINUS_SRC_COLOR,[Js]:i.ONE_MINUS_SRC_ALPHA,[kd]:i.ONE_MINUS_DST_COLOR,[Od]:i.ONE_MINUS_DST_ALPHA,[Gd]:i.CONSTANT_COLOR,[Wd]:i.ONE_MINUS_CONSTANT_COLOR,[Xd]:i.CONSTANT_ALPHA,[qd]:i.ONE_MINUS_CONSTANT_ALPHA};function L(V,wt,st,ct,St,Ct,N,ht,Kt,Zt){if(V===Rn){g===!0&&(gt(i.BLEND),g=!1);return}if(g===!1&&(dt(i.BLEND),g=!0),V!==iu){if(V!==x||Zt!==I){if((p!==ss||v!==ss)&&(i.blendEquation(i.FUNC_ADD),p=ss,v=ss),Zt)switch(V){case Xs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFunc(i.ONE,i.ONE);break;case Vu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Gu:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}else switch(V){case Xs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Vu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Gu:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",V);break}m=null,_=null,M=null,C=null,w.set(0,0,0),S=0,x=V,I=Zt}return}St=St||wt,Ct=Ct||st,N=N||ct,(wt!==p||St!==v)&&(i.blendEquationSeparate(Tt[wt],Tt[St]),p=wt,v=St),(st!==m||ct!==_||Ct!==M||N!==C)&&(i.blendFuncSeparate(ot[st],ot[ct],ot[Ct],ot[N]),m=st,_=ct,M=Ct,C=N),(ht.equals(w)===!1||Kt!==S)&&(i.blendColor(ht.r,ht.g,ht.b,Kt),w.copy(ht),S=Kt),x=V,I=!1}function pt(V,wt){V.side===Ue?gt(i.CULL_FACE):dt(i.CULL_FACE);let st=V.side===tn;wt&&(st=!st),ft(st),V.blending===Xs&&V.transparent===!1?L(Rn):L(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),r.setFunc(V.depthFunc),r.setTest(V.depthTest),r.setMask(V.depthWrite),s.setMask(V.colorWrite);let ct=V.stencilWrite;o.setTest(ct),ct&&(o.setMask(V.stencilWriteMask),o.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),o.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),Ut(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?dt(i.SAMPLE_ALPHA_TO_COVERAGE):gt(i.SAMPLE_ALPHA_TO_COVERAGE)}function ft(V){U!==V&&(V?i.frontFace(i.CW):i.frontFace(i.CCW),U=V)}function ut(V){V!==Cd?(dt(i.CULL_FACE),V!==y&&(V===ku?i.cullFace(i.BACK):V===Pd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):gt(i.CULL_FACE),y=V}function yt(V){V!==A&&(z&&i.lineWidth(V),A=V)}function Ut(V,wt,st){V?(dt(i.POLYGON_OFFSET_FILL),(O!==wt||H!==st)&&(i.polygonOffset(wt,st),O=wt,H=st)):gt(i.POLYGON_OFFSET_FILL)}function bt(V){V?dt(i.SCISSOR_TEST):gt(i.SCISSOR_TEST)}function b(V){V===void 0&&(V=i.TEXTURE0+D-1),F!==V&&(i.activeTexture(V),F=V)}function E(V,wt,st){st===void 0&&(F===null?st=i.TEXTURE0+D-1:st=F);let ct=q[st];ct===void 0&&(ct={type:void 0,texture:void 0},q[st]=ct),(ct.type!==V||ct.texture!==wt)&&(F!==st&&(i.activeTexture(st),F=st),i.bindTexture(V,wt||rt[V]),ct.type=V,ct.texture=wt)}function G(){let V=q[F];V!==void 0&&V.type!==void 0&&(i.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function $(){try{i.compressedTexImage2D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function tt(){try{i.compressedTexImage3D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Z(){try{i.texSubImage2D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Pt(){try{i.texSubImage3D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function xt(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function lt(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function _t(){try{i.texStorage2D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function K(){try{i.texStorage3D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Mt(){try{i.texImage2D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Wt(){try{i.texImage3D.apply(i,arguments)}catch(V){console.error("THREE.WebGLState:",V)}}function Ot(V){at.equals(V)===!1&&(i.scissor(V.x,V.y,V.z,V.w),at.copy(V))}function Rt(V){Dt.equals(V)===!1&&(i.viewport(V.x,V.y,V.z,V.w),Dt.copy(V))}function $t(V,wt){let st=l.get(wt);st===void 0&&(st=new WeakMap,l.set(wt,st));let ct=st.get(V);ct===void 0&&(ct=i.getUniformBlockIndex(wt,V.name),st.set(V,ct))}function kt(V,wt){let ct=l.get(wt).get(V);a.get(wt)!==ct&&(i.uniformBlockBinding(wt,ct,V.__bindingPointIndex),a.set(wt,ct))}function le(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},F=null,q={},u={},h=new WeakMap,f=[],d=null,g=!1,x=null,p=null,m=null,_=null,v=null,M=null,C=null,w=new nt(0,0,0),S=0,I=!1,U=null,y=null,A=null,O=null,H=null,at.set(0,0,i.canvas.width,i.canvas.height),Dt.set(0,0,i.canvas.width,i.canvas.height),s.reset(),r.reset(),o.reset()}return{buffers:{color:s,depth:r,stencil:o},enable:dt,disable:gt,bindFramebuffer:Ft,drawBuffers:Et,useProgram:Vt,setBlending:L,setMaterial:pt,setFlipSided:ft,setCullFace:ut,setLineWidth:yt,setPolygonOffset:Ut,setScissorTest:bt,activeTexture:b,bindTexture:E,unbindTexture:G,compressedTexImage2D:$,compressedTexImage3D:tt,texImage2D:Mt,texImage3D:Wt,updateUBOMapping:$t,uniformBlockBinding:kt,texStorage2D:_t,texStorage3D:K,texSubImage2D:Z,texSubImage3D:Pt,compressedTexSubImage2D:xt,compressedTexSubImage3D:lt,scissor:Ot,viewport:Rt,reset:le}}function Lh(i,t,e,n){let s=Kx(n);switch(e){case ef:return i*t;case sf:return i*t;case rf:return i*t*2;case fu:return i*t/s.components*s.byteLength;case du:return i*t/s.components*s.byteLength;case of:return i*t*2/s.components*s.byteLength;case pu:return i*t*2/s.components*s.byteLength;case nf:return i*t*3/s.components*s.byteLength;case kn:return i*t*4/s.components*s.byteLength;case mu:return i*t*4/s.components*s.byteLength;case Io:case Fo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Do:case Lo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case kl:case Gl:return Math.max(i,16)*Math.max(t,8)/4;case Hl:case Vl:return Math.max(i,8)*Math.max(t,8)/2;case Wl:case Xl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ql:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Yl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Zl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Jl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Kl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ql:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case jl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case $l:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case tc:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case ec:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case nc:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case ic:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case sc:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case rc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case oc:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Uo:case ac:case lc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case af:case cc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case uc:case hc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Kx(i){switch(i){case Vn:case jh:return{byteLength:1,components:1};case Pr:case $h:case Ye:return{byteLength:2,components:1};case uu:case hu:return{byteLength:2,components:4};case as:case cu:case Qn:return{byteLength:4,components:1};case tf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Qx(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new it,u=new WeakMap,h,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,E){return d?new OffscreenCanvas(b,E):Vo("canvas")}function x(b,E,G){let $=1,tt=bt(b);if((tt.width>G||tt.height>G)&&($=G/Math.max(tt.width,tt.height)),$<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){let Z=Math.floor($*tt.width),Pt=Math.floor($*tt.height);h===void 0&&(h=g(Z,Pt));let xt=E?g(Z,Pt):h;return xt.width=Z,xt.height=Pt,xt.getContext("2d").drawImage(b,0,0,Z,Pt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+Z+"x"+Pt+")."),xt}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),b;return b}function p(b){return b.generateMipmaps&&b.minFilter!==dn&&b.minFilter!==En}function m(b){i.generateMipmap(b)}function _(b,E,G,$,tt=!1){if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let Z=E;if(E===i.RED&&(G===i.FLOAT&&(Z=i.R32F),G===i.HALF_FLOAT&&(Z=i.R16F),G===i.UNSIGNED_BYTE&&(Z=i.R8)),E===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.R8UI),G===i.UNSIGNED_SHORT&&(Z=i.R16UI),G===i.UNSIGNED_INT&&(Z=i.R32UI),G===i.BYTE&&(Z=i.R8I),G===i.SHORT&&(Z=i.R16I),G===i.INT&&(Z=i.R32I)),E===i.RG&&(G===i.FLOAT&&(Z=i.RG32F),G===i.HALF_FLOAT&&(Z=i.RG16F),G===i.UNSIGNED_BYTE&&(Z=i.RG8)),E===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RG8UI),G===i.UNSIGNED_SHORT&&(Z=i.RG16UI),G===i.UNSIGNED_INT&&(Z=i.RG32UI),G===i.BYTE&&(Z=i.RG8I),G===i.SHORT&&(Z=i.RG16I),G===i.INT&&(Z=i.RG32I)),E===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),G===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),G===i.UNSIGNED_INT&&(Z=i.RGB32UI),G===i.BYTE&&(Z=i.RGB8I),G===i.SHORT&&(Z=i.RGB16I),G===i.INT&&(Z=i.RGB32I)),E===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),G===i.UNSIGNED_INT&&(Z=i.RGBA32UI),G===i.BYTE&&(Z=i.RGBA8I),G===i.SHORT&&(Z=i.RGBA16I),G===i.INT&&(Z=i.RGBA32I)),E===i.RGB&&G===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),E===i.RGBA){let Pt=tt?zo:ce.getTransfer($);G===i.FLOAT&&(Z=i.RGBA32F),G===i.HALF_FLOAT&&(Z=i.RGBA16F),G===i.UNSIGNED_BYTE&&(Z=Pt===ye?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function v(b,E){let G;return b?E===null||E===as||E===$s?G=i.DEPTH24_STENCIL8:E===Qn?G=i.DEPTH32F_STENCIL8:E===Pr&&(G=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===as||E===$s?G=i.DEPTH_COMPONENT24:E===Qn?G=i.DEPTH_COMPONENT32F:E===Pr&&(G=i.DEPTH_COMPONENT16),G}function M(b,E){return p(b)===!0||b.isFramebufferTexture&&b.minFilter!==dn&&b.minFilter!==En?Math.log2(Math.max(E.width,E.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?E.mipmaps.length:1}function C(b){let E=b.target;E.removeEventListener("dispose",C),S(E),E.isVideoTexture&&u.delete(E)}function w(b){let E=b.target;E.removeEventListener("dispose",w),U(E)}function S(b){let E=n.get(b);if(E.__webglInit===void 0)return;let G=b.source,$=f.get(G);if($){let tt=$[E.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&I(b),Object.keys($).length===0&&f.delete(G)}n.remove(b)}function I(b){let E=n.get(b);i.deleteTexture(E.__webglTexture);let G=b.source,$=f.get(G);delete $[E.__cacheKey],o.memory.textures--}function U(b){let E=n.get(b);if(b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(E.__webglFramebuffer[$]))for(let tt=0;tt<E.__webglFramebuffer[$].length;tt++)i.deleteFramebuffer(E.__webglFramebuffer[$][tt]);else i.deleteFramebuffer(E.__webglFramebuffer[$]);E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer[$])}else{if(Array.isArray(E.__webglFramebuffer))for(let $=0;$<E.__webglFramebuffer.length;$++)i.deleteFramebuffer(E.__webglFramebuffer[$]);else i.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&i.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&i.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let $=0;$<E.__webglColorRenderbuffer.length;$++)E.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(E.__webglColorRenderbuffer[$]);E.__webglDepthRenderbuffer&&i.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let G=b.textures;for(let $=0,tt=G.length;$<tt;$++){let Z=n.get(G[$]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),o.memory.textures--),n.remove(G[$])}n.remove(b)}let y=0;function A(){y=0}function O(){let b=y;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),y+=1,b}function H(b){let E=[];return E.push(b.wrapS),E.push(b.wrapT),E.push(b.wrapR||0),E.push(b.magFilter),E.push(b.minFilter),E.push(b.anisotropy),E.push(b.internalFormat),E.push(b.format),E.push(b.type),E.push(b.generateMipmaps),E.push(b.premultiplyAlpha),E.push(b.flipY),E.push(b.unpackAlignment),E.push(b.colorSpace),E.join()}function D(b,E){let G=n.get(b);if(b.isVideoTexture&&yt(b),b.isRenderTargetTexture===!1&&b.version>0&&G.__version!==b.version){let $=b.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Dt(G,b,E);return}}e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+E)}function z(b,E){let G=n.get(b);if(b.version>0&&G.__version!==b.version){Dt(G,b,E);return}e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+E)}function B(b,E){let G=n.get(b);if(b.version>0&&G.__version!==b.version){Dt(G,b,E);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+E)}function k(b,E){let G=n.get(b);if(b.version>0&&G.__version!==b.version){j(G,b,E);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+E)}let F={[os]:i.REPEAT,[hi]:i.CLAMP_TO_EDGE,[Ol]:i.MIRRORED_REPEAT},q={[dn]:i.NEAREST,[Kd]:i.NEAREST_MIPMAP_NEAREST,[$r]:i.NEAREST_MIPMAP_LINEAR,[En]:i.LINEAR,[qa]:i.LINEAR_MIPMAP_NEAREST,[fi]:i.LINEAR_MIPMAP_LINEAR},et={[tp]:i.NEVER,[op]:i.ALWAYS,[ep]:i.LESS,[cf]:i.LEQUAL,[np]:i.EQUAL,[rp]:i.GEQUAL,[ip]:i.GREATER,[sp]:i.NOTEQUAL};function Y(b,E){if(E.type===Qn&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===En||E.magFilter===qa||E.magFilter===$r||E.magFilter===fi||E.minFilter===En||E.minFilter===qa||E.minFilter===$r||E.minFilter===fi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(b,i.TEXTURE_WRAP_S,F[E.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,F[E.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,F[E.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,q[E.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,q[E.minFilter]),E.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,et[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===dn||E.minFilter!==$r&&E.minFilter!==fi||E.type===Qn&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(b,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,s.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function at(b,E){let G=!1;b.__webglInit===void 0&&(b.__webglInit=!0,E.addEventListener("dispose",C));let $=E.source,tt=f.get($);tt===void 0&&(tt={},f.set($,tt));let Z=H(E);if(Z!==b.__cacheKey){tt[Z]===void 0&&(tt[Z]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),tt[Z].usedTimes++;let Pt=tt[b.__cacheKey];Pt!==void 0&&(tt[b.__cacheKey].usedTimes--,Pt.usedTimes===0&&I(E)),b.__cacheKey=Z,b.__webglTexture=tt[Z].texture}return G}function Dt(b,E,G){let $=i.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),E.isData3DTexture&&($=i.TEXTURE_3D);let tt=at(b,E),Z=E.source;e.bindTexture($,b.__webglTexture,i.TEXTURE0+G);let Pt=n.get(Z);if(Z.version!==Pt.__version||tt===!0){e.activeTexture(i.TEXTURE0+G);let xt=ce.getPrimaries(ce.workingColorSpace),lt=E.colorSpace===Hn?null:ce.getPrimaries(E.colorSpace),_t=E.colorSpace===Hn||xt===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);let K=x(E.image,!1,s.maxTextureSize);K=Ut(E,K);let Mt=r.convert(E.format,E.colorSpace),Wt=r.convert(E.type),Ot=_(E.internalFormat,Mt,Wt,E.colorSpace,E.isVideoTexture);Y($,E);let Rt,$t=E.mipmaps,kt=E.isVideoTexture!==!0,le=Pt.__version===void 0||tt===!0,V=Z.dataReady,wt=M(E,K);if(E.isDepthTexture)Ot=v(E.format===tr,E.type),le&&(kt?e.texStorage2D(i.TEXTURE_2D,1,Ot,K.width,K.height):e.texImage2D(i.TEXTURE_2D,0,Ot,K.width,K.height,0,Mt,Wt,null));else if(E.isDataTexture)if($t.length>0){kt&&le&&e.texStorage2D(i.TEXTURE_2D,wt,Ot,$t[0].width,$t[0].height);for(let st=0,ct=$t.length;st<ct;st++)Rt=$t[st],kt?V&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,Mt,Wt,Rt.data):e.texImage2D(i.TEXTURE_2D,st,Ot,Rt.width,Rt.height,0,Mt,Wt,Rt.data);E.generateMipmaps=!1}else kt?(le&&e.texStorage2D(i.TEXTURE_2D,wt,Ot,K.width,K.height),V&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,K.width,K.height,Mt,Wt,K.data)):e.texImage2D(i.TEXTURE_2D,0,Ot,K.width,K.height,0,Mt,Wt,K.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){kt&&le&&e.texStorage3D(i.TEXTURE_2D_ARRAY,wt,Ot,$t[0].width,$t[0].height,K.depth);for(let st=0,ct=$t.length;st<ct;st++)if(Rt=$t[st],E.format!==kn)if(Mt!==null)if(kt){if(V)if(E.layerUpdates.size>0){let St=Lh(Rt.width,Rt.height,E.format,E.type);for(let Ct of E.layerUpdates){let N=Rt.data.subarray(Ct*St/Rt.data.BYTES_PER_ELEMENT,(Ct+1)*St/Rt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,Ct,Rt.width,Rt.height,1,Mt,N,0,0)}E.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Rt.width,Rt.height,K.depth,Mt,Rt.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,st,Ot,Rt.width,Rt.height,K.depth,0,Rt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else kt?V&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Rt.width,Rt.height,K.depth,Mt,Wt,Rt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,st,Ot,Rt.width,Rt.height,K.depth,0,Mt,Wt,Rt.data)}else{kt&&le&&e.texStorage2D(i.TEXTURE_2D,wt,Ot,$t[0].width,$t[0].height);for(let st=0,ct=$t.length;st<ct;st++)Rt=$t[st],E.format!==kn?Mt!==null?kt?V&&e.compressedTexSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,Mt,Rt.data):e.compressedTexImage2D(i.TEXTURE_2D,st,Ot,Rt.width,Rt.height,0,Rt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):kt?V&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,Mt,Wt,Rt.data):e.texImage2D(i.TEXTURE_2D,st,Ot,Rt.width,Rt.height,0,Mt,Wt,Rt.data)}else if(E.isDataArrayTexture)if(kt){if(le&&e.texStorage3D(i.TEXTURE_2D_ARRAY,wt,Ot,K.width,K.height,K.depth),V)if(E.layerUpdates.size>0){let st=Lh(K.width,K.height,E.format,E.type);for(let ct of E.layerUpdates){let St=K.data.subarray(ct*st/K.data.BYTES_PER_ELEMENT,(ct+1)*st/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ct,K.width,K.height,1,Mt,Wt,St)}E.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,Mt,Wt,K.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ot,K.width,K.height,K.depth,0,Mt,Wt,K.data);else if(E.isData3DTexture)kt?(le&&e.texStorage3D(i.TEXTURE_3D,wt,Ot,K.width,K.height,K.depth),V&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,Mt,Wt,K.data)):e.texImage3D(i.TEXTURE_3D,0,Ot,K.width,K.height,K.depth,0,Mt,Wt,K.data);else if(E.isFramebufferTexture){if(le)if(kt)e.texStorage2D(i.TEXTURE_2D,wt,Ot,K.width,K.height);else{let st=K.width,ct=K.height;for(let St=0;St<wt;St++)e.texImage2D(i.TEXTURE_2D,St,Ot,st,ct,0,Mt,Wt,null),st>>=1,ct>>=1}}else if($t.length>0){if(kt&&le){let st=bt($t[0]);e.texStorage2D(i.TEXTURE_2D,wt,Ot,st.width,st.height)}for(let st=0,ct=$t.length;st<ct;st++)Rt=$t[st],kt?V&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Mt,Wt,Rt):e.texImage2D(i.TEXTURE_2D,st,Ot,Mt,Wt,Rt);E.generateMipmaps=!1}else if(kt){if(le){let st=bt(K);e.texStorage2D(i.TEXTURE_2D,wt,Ot,st.width,st.height)}V&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Mt,Wt,K)}else e.texImage2D(i.TEXTURE_2D,0,Ot,Mt,Wt,K);p(E)&&m($),Pt.__version=Z.version,E.onUpdate&&E.onUpdate(E)}b.__version=E.version}function j(b,E,G){if(E.image.length!==6)return;let $=at(b,E),tt=E.source;e.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+G);let Z=n.get(tt);if(tt.version!==Z.__version||$===!0){e.activeTexture(i.TEXTURE0+G);let Pt=ce.getPrimaries(ce.workingColorSpace),xt=E.colorSpace===Hn?null:ce.getPrimaries(E.colorSpace),lt=E.colorSpace===Hn||Pt===xt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,lt);let _t=E.isCompressedTexture||E.image[0].isCompressedTexture,K=E.image[0]&&E.image[0].isDataTexture,Mt=[];for(let ct=0;ct<6;ct++)!_t&&!K?Mt[ct]=x(E.image[ct],!0,s.maxCubemapSize):Mt[ct]=K?E.image[ct].image:E.image[ct],Mt[ct]=Ut(E,Mt[ct]);let Wt=Mt[0],Ot=r.convert(E.format,E.colorSpace),Rt=r.convert(E.type),$t=_(E.internalFormat,Ot,Rt,E.colorSpace),kt=E.isVideoTexture!==!0,le=Z.__version===void 0||$===!0,V=tt.dataReady,wt=M(E,Wt);Y(i.TEXTURE_CUBE_MAP,E);let st;if(_t){kt&&le&&e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,$t,Wt.width,Wt.height);for(let ct=0;ct<6;ct++){st=Mt[ct].mipmaps;for(let St=0;St<st.length;St++){let Ct=st[St];E.format!==kn?Ot!==null?kt?V&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St,0,0,Ct.width,Ct.height,Ot,Ct.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St,$t,Ct.width,Ct.height,0,Ct.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):kt?V&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St,0,0,Ct.width,Ct.height,Ot,Rt,Ct.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St,$t,Ct.width,Ct.height,0,Ot,Rt,Ct.data)}}}else{if(st=E.mipmaps,kt&&le){st.length>0&&wt++;let ct=bt(Mt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,$t,ct.width,ct.height)}for(let ct=0;ct<6;ct++)if(K){kt?V&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Mt[ct].width,Mt[ct].height,Ot,Rt,Mt[ct].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,$t,Mt[ct].width,Mt[ct].height,0,Ot,Rt,Mt[ct].data);for(let St=0;St<st.length;St++){let N=st[St].image[ct].image;kt?V&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St+1,0,0,N.width,N.height,Ot,Rt,N.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St+1,$t,N.width,N.height,0,Ot,Rt,N.data)}}else{kt?V&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Ot,Rt,Mt[ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,$t,Ot,Rt,Mt[ct]);for(let St=0;St<st.length;St++){let Ct=st[St];kt?V&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St+1,0,0,Ot,Rt,Ct.image[ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,St+1,$t,Ot,Rt,Ct.image[ct])}}}p(E)&&m(i.TEXTURE_CUBE_MAP),Z.__version=tt.version,E.onUpdate&&E.onUpdate(E)}b.__version=E.version}function rt(b,E,G,$,tt,Z){let Pt=r.convert(G.format,G.colorSpace),xt=r.convert(G.type),lt=_(G.internalFormat,Pt,xt,G.colorSpace);if(!n.get(E).__hasExternalTextures){let K=Math.max(1,E.width>>Z),Mt=Math.max(1,E.height>>Z);tt===i.TEXTURE_3D||tt===i.TEXTURE_2D_ARRAY?e.texImage3D(tt,Z,lt,K,Mt,E.depth,0,Pt,xt,null):e.texImage2D(tt,Z,lt,K,Mt,0,Pt,xt,null)}e.bindFramebuffer(i.FRAMEBUFFER,b),ut(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,tt,n.get(G).__webglTexture,0,ft(E)):(tt===i.TEXTURE_2D||tt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,tt,n.get(G).__webglTexture,Z),e.bindFramebuffer(i.FRAMEBUFFER,null)}function dt(b,E,G){if(i.bindRenderbuffer(i.RENDERBUFFER,b),E.depthBuffer){let $=E.depthTexture,tt=$&&$.isDepthTexture?$.type:null,Z=v(E.stencilBuffer,tt),Pt=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xt=ft(E);ut(E)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,xt,Z,E.width,E.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,xt,Z,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,Z,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Pt,i.RENDERBUFFER,b)}else{let $=E.textures;for(let tt=0;tt<$.length;tt++){let Z=$[tt],Pt=r.convert(Z.format,Z.colorSpace),xt=r.convert(Z.type),lt=_(Z.internalFormat,Pt,xt,Z.colorSpace),_t=ft(E);G&&ut(E)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,_t,lt,E.width,E.height):ut(E)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,_t,lt,E.width,E.height):i.renderbufferStorage(i.RENDERBUFFER,lt,E.width,E.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function gt(b,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,b),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),D(E.depthTexture,0);let $=n.get(E.depthTexture).__webglTexture,tt=ft(E);if(E.depthTexture.format===qs)ut(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,$,0);else if(E.depthTexture.format===tr)ut(E)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0,tt):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function Ft(b){let E=n.get(b),G=b.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==b.depthTexture){let $=b.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),$){let tt=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,$.removeEventListener("dispose",tt)};$.addEventListener("dispose",tt),E.__depthDisposeCallback=tt}E.__boundDepthTexture=$}if(b.depthTexture&&!E.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");gt(E.__webglFramebuffer,b)}else if(G){E.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(e.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer[$]),E.__webglDepthbuffer[$]===void 0)E.__webglDepthbuffer[$]=i.createRenderbuffer(),dt(E.__webglDepthbuffer[$],b,!1);else{let tt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=E.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,tt,i.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=i.createRenderbuffer(),dt(E.__webglDepthbuffer,b,!1);else{let $=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,tt=E.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,tt),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,tt)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Et(b,E,G){let $=n.get(b);E!==void 0&&rt($.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&Ft(b)}function Vt(b){let E=b.texture,G=n.get(b),$=n.get(E);b.addEventListener("dispose",w);let tt=b.textures,Z=b.isWebGLCubeRenderTarget===!0,Pt=tt.length>1;if(Pt||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=E.version,o.memory.textures++),Z){G.__webglFramebuffer=[];for(let xt=0;xt<6;xt++)if(E.mipmaps&&E.mipmaps.length>0){G.__webglFramebuffer[xt]=[];for(let lt=0;lt<E.mipmaps.length;lt++)G.__webglFramebuffer[xt][lt]=i.createFramebuffer()}else G.__webglFramebuffer[xt]=i.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){G.__webglFramebuffer=[];for(let xt=0;xt<E.mipmaps.length;xt++)G.__webglFramebuffer[xt]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(Pt)for(let xt=0,lt=tt.length;xt<lt;xt++){let _t=n.get(tt[xt]);_t.__webglTexture===void 0&&(_t.__webglTexture=i.createTexture(),o.memory.textures++)}if(b.samples>0&&ut(b)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let xt=0;xt<tt.length;xt++){let lt=tt[xt];G.__webglColorRenderbuffer[xt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[xt]);let _t=r.convert(lt.format,lt.colorSpace),K=r.convert(lt.type),Mt=_(lt.internalFormat,_t,K,lt.colorSpace,b.isXRRenderTarget===!0),Wt=ft(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,Wt,Mt,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+xt,i.RENDERBUFFER,G.__webglColorRenderbuffer[xt])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),dt(G.__webglDepthRenderbuffer,b,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){e.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),Y(i.TEXTURE_CUBE_MAP,E);for(let xt=0;xt<6;xt++)if(E.mipmaps&&E.mipmaps.length>0)for(let lt=0;lt<E.mipmaps.length;lt++)rt(G.__webglFramebuffer[xt][lt],b,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xt,lt);else rt(G.__webglFramebuffer[xt],b,E,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+xt,0);p(E)&&m(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Pt){for(let xt=0,lt=tt.length;xt<lt;xt++){let _t=tt[xt],K=n.get(_t);e.bindTexture(i.TEXTURE_2D,K.__webglTexture),Y(i.TEXTURE_2D,_t),rt(G.__webglFramebuffer,b,_t,i.COLOR_ATTACHMENT0+xt,i.TEXTURE_2D,0),p(_t)&&m(i.TEXTURE_2D)}e.unbindTexture()}else{let xt=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(xt=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(xt,$.__webglTexture),Y(xt,E),E.mipmaps&&E.mipmaps.length>0)for(let lt=0;lt<E.mipmaps.length;lt++)rt(G.__webglFramebuffer[lt],b,E,i.COLOR_ATTACHMENT0,xt,lt);else rt(G.__webglFramebuffer,b,E,i.COLOR_ATTACHMENT0,xt,0);p(E)&&m(xt),e.unbindTexture()}b.depthBuffer&&Ft(b)}function Tt(b){let E=b.textures;for(let G=0,$=E.length;G<$;G++){let tt=E[G];if(p(tt)){let Z=b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,Pt=n.get(tt).__webglTexture;e.bindTexture(Z,Pt),m(Z),e.unbindTexture()}}}let ot=[],L=[];function pt(b){if(b.samples>0){if(ut(b)===!1){let E=b.textures,G=b.width,$=b.height,tt=i.COLOR_BUFFER_BIT,Z=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Pt=n.get(b),xt=E.length>1;if(xt)for(let lt=0;lt<E.length;lt++)e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Pt.__webglFramebuffer);for(let lt=0;lt<E.length;lt++){if(b.resolveDepthBuffer&&(b.depthBuffer&&(tt|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&(tt|=i.STENCIL_BUFFER_BIT)),xt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Pt.__webglColorRenderbuffer[lt]);let _t=n.get(E[lt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,_t,0)}i.blitFramebuffer(0,0,G,$,0,0,G,$,tt,i.NEAREST),l===!0&&(ot.length=0,L.length=0,ot.push(i.COLOR_ATTACHMENT0+lt),b.depthBuffer&&b.resolveDepthBuffer===!1&&(ot.push(Z),L.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,L)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ot))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),xt)for(let lt=0;lt<E.length;lt++){e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,Pt.__webglColorRenderbuffer[lt]);let _t=n.get(E[lt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,_t,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Pt.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&l){let E=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[E])}}}function ft(b){return Math.min(s.maxSamples,b.samples)}function ut(b){let E=n.get(b);return b.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function yt(b){let E=o.render.frame;u.get(b)!==E&&(u.set(b,E),b.update())}function Ut(b,E){let G=b.colorSpace,$=b.format,tt=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||G!==Vi&&G!==Hn&&(ce.getTransfer(G)===ye?($!==kn||tt!==Vn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),E}function bt(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(c.width=b.naturalWidth||b.width,c.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(c.width=b.displayWidth,c.height=b.displayHeight):(c.width=b.width,c.height=b.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=A,this.setTexture2D=D,this.setTexture2DArray=z,this.setTexture3D=B,this.setTextureCube=k,this.rebindTextures=Et,this.setupRenderTarget=Vt,this.updateRenderTargetMipmap=Tt,this.updateMultisampleRenderTarget=pt,this.setupDepthRenderbuffer=Ft,this.setupFrameBufferTexture=rt,this.useMultisampledRTT=ut}function jx(i,t){function e(n,s=Hn){let r,o=ce.getTransfer(s);if(n===Vn)return i.UNSIGNED_BYTE;if(n===uu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===hu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===tf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===jh)return i.BYTE;if(n===$h)return i.SHORT;if(n===Pr)return i.UNSIGNED_SHORT;if(n===cu)return i.INT;if(n===as)return i.UNSIGNED_INT;if(n===Qn)return i.FLOAT;if(n===Ye)return i.HALF_FLOAT;if(n===ef)return i.ALPHA;if(n===nf)return i.RGB;if(n===kn)return i.RGBA;if(n===sf)return i.LUMINANCE;if(n===rf)return i.LUMINANCE_ALPHA;if(n===qs)return i.DEPTH_COMPONENT;if(n===tr)return i.DEPTH_STENCIL;if(n===fu)return i.RED;if(n===du)return i.RED_INTEGER;if(n===of)return i.RG;if(n===pu)return i.RG_INTEGER;if(n===mu)return i.RGBA_INTEGER;if(n===Io||n===Fo||n===Do||n===Lo)if(o===ye)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Io)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Fo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Do)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Lo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Io)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Fo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Do)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Lo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Hl||n===kl||n===Vl||n===Gl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Hl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===kl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Vl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Gl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Wl||n===Xl||n===ql)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Wl||n===Xl)return o===ye?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ql)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Yl||n===Zl||n===Jl||n===Kl||n===Ql||n===jl||n===$l||n===tc||n===ec||n===nc||n===ic||n===sc||n===rc||n===oc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Yl)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Zl)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Jl)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Kl)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ql)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===jl)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===$l)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===tc)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ec)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===nc)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ic)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===sc)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===rc)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===oc)return o===ye?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Uo||n===ac||n===lc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Uo)return o===ye?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ac)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===lc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===af||n===cc||n===uc||n===hc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Uo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===cc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===uc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===hc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===$s?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Rc=class extends Ve{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Ce=class extends qe{constructor(){super(),this.isGroup=!0,this.type="Group"}},$x={type:"move"},Tr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let x of t.hand.values()){let p=e.getJointPose(x,n),m=this._getHandJoint(c,x);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent($x)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ce;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},tv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ev=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Cc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new pn,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new oe({vertexShader:tv,fragmentShader:ev,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new jt(new _e(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Pc=class extends Ni{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,f=null,d=null,g=null,x=new Cc,p=e.getContextAttributes(),m=null,_=null,v=[],M=[],C=new it,w=null,S=new Ve;S.layers.enable(1),S.viewport=new ae;let I=new Ve;I.layers.enable(2),I.viewport=new ae;let U=[S,I],y=new Rc;y.layers.enable(1),y.layers.enable(2);let A=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let rt=v[j];return rt===void 0&&(rt=new Tr,v[j]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(j){let rt=v[j];return rt===void 0&&(rt=new Tr,v[j]=rt),rt.getGripSpace()},this.getHand=function(j){let rt=v[j];return rt===void 0&&(rt=new Tr,v[j]=rt),rt.getHandSpace()};function H(j){let rt=M.indexOf(j.inputSource);if(rt===-1)return;let dt=v[rt];dt!==void 0&&(dt.update(j.inputSource,j.frame,c||o),dt.dispatchEvent({type:j.type,data:j.inputSource}))}function D(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",D),s.removeEventListener("inputsourceschange",z);for(let j=0;j<v.length;j++){let rt=M[j];rt!==null&&(M[j]=null,v[j].disconnect(rt))}A=null,O=null,x.reset(),t.setRenderTarget(m),d=null,f=null,h=null,s=null,_=null,Dt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){a=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(j){if(s=j,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",D),s.addEventListener("inputsourceschange",z),p.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(C),s.renderState.layers===void 0){let rt={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,rt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new be(d.framebufferWidth,d.framebufferHeight,{format:kn,type:Vn,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil})}else{let rt=null,dt=null,gt=null;p.depth&&(gt=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,rt=p.stencil?tr:qs,dt=p.stencil?$s:as);let Ft={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};h=new XRWebGLBinding(s,e),f=h.createProjectionLayer(Ft),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),_=new be(f.textureWidth,f.textureHeight,{format:kn,type:Vn,depthTexture:new sr(f.textureWidth,f.textureHeight,dt,void 0,void 0,void 0,void 0,void 0,void 0,rt),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Dt.setContext(s),Dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function z(j){for(let rt=0;rt<j.removed.length;rt++){let dt=j.removed[rt],gt=M.indexOf(dt);gt>=0&&(M[gt]=null,v[gt].disconnect(dt))}for(let rt=0;rt<j.added.length;rt++){let dt=j.added[rt],gt=M.indexOf(dt);if(gt===-1){for(let Et=0;Et<v.length;Et++)if(Et>=M.length){M.push(dt),gt=Et;break}else if(M[Et]===null){M[Et]=dt,gt=Et;break}if(gt===-1)break}let Ft=v[gt];Ft&&Ft.connect(dt)}}let B=new P,k=new P;function F(j,rt,dt){B.setFromMatrixPosition(rt.matrixWorld),k.setFromMatrixPosition(dt.matrixWorld);let gt=B.distanceTo(k),Ft=rt.projectionMatrix.elements,Et=dt.projectionMatrix.elements,Vt=Ft[14]/(Ft[10]-1),Tt=Ft[14]/(Ft[10]+1),ot=(Ft[9]+1)/Ft[5],L=(Ft[9]-1)/Ft[5],pt=(Ft[8]-1)/Ft[0],ft=(Et[8]+1)/Et[0],ut=Vt*pt,yt=Vt*ft,Ut=gt/(-pt+ft),bt=Ut*-pt;if(rt.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(bt),j.translateZ(Ut),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),Ft[10]===-1)j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{let b=Vt+Ut,E=Tt+Ut,G=ut-bt,$=yt+(gt-bt),tt=ot*Tt/E*b,Z=L*Tt/E*b;j.projectionMatrix.makePerspective(G,$,tt,Z,b,E),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function q(j,rt){rt===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(rt.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(s===null)return;let rt=j.near,dt=j.far;x.texture!==null&&(x.depthNear>0&&(rt=x.depthNear),x.depthFar>0&&(dt=x.depthFar)),y.near=I.near=S.near=rt,y.far=I.far=S.far=dt,(A!==y.near||O!==y.far)&&(s.updateRenderState({depthNear:y.near,depthFar:y.far}),A=y.near,O=y.far);let gt=j.parent,Ft=y.cameras;q(y,gt);for(let Et=0;Et<Ft.length;Et++)q(Ft[Et],gt);Ft.length===2?F(y,S,I):y.projectionMatrix.copy(S.projectionMatrix),et(j,y,gt)};function et(j,rt,dt){dt===null?j.matrix.copy(rt.matrixWorld):(j.matrix.copy(dt.matrixWorld),j.matrix.invert(),j.matrix.multiply(rt.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(rt.projectionMatrix),j.projectionMatrixInverse.copy(rt.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=pc*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return y},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=j)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(y)};let Y=null;function at(j,rt){if(u=rt.getViewerPose(c||o),g=rt,u!==null){let dt=u.views;d!==null&&(t.setRenderTargetFramebuffer(_,d.framebuffer),t.setRenderTarget(_));let gt=!1;dt.length!==y.cameras.length&&(y.cameras.length=0,gt=!0);for(let Et=0;Et<dt.length;Et++){let Vt=dt[Et],Tt=null;if(d!==null)Tt=d.getViewport(Vt);else{let L=h.getViewSubImage(f,Vt);Tt=L.viewport,Et===0&&(t.setRenderTargetTextures(_,L.colorTexture,f.ignoreDepthValues?void 0:L.depthStencilTexture),t.setRenderTarget(_))}let ot=U[Et];ot===void 0&&(ot=new Ve,ot.layers.enable(Et),ot.viewport=new ae,U[Et]=ot),ot.matrix.fromArray(Vt.transform.matrix),ot.matrix.decompose(ot.position,ot.quaternion,ot.scale),ot.projectionMatrix.fromArray(Vt.projectionMatrix),ot.projectionMatrixInverse.copy(ot.projectionMatrix).invert(),ot.viewport.set(Tt.x,Tt.y,Tt.width,Tt.height),Et===0&&(y.matrix.copy(ot.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale)),gt===!0&&y.cameras.push(ot)}let Ft=s.enabledFeatures;if(Ft&&Ft.includes("depth-sensing")){let Et=h.getDepthInformation(dt[0]);Et&&Et.isValid&&Et.texture&&x.init(t,Et,s.renderState)}}for(let dt=0;dt<v.length;dt++){let gt=M[dt],Ft=v[dt];gt!==null&&Ft!==void 0&&Ft.update(gt,rt,c||o)}Y&&Y(j,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),g=null}let Dt=new df;Dt.setAnimationLoop(at),this.setAnimationLoop=function(j){Y=j},this.dispose=function(){}}},ns=new nn,nv=new Yt;function iv(i,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,ff(i)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function s(p,m,_,v,M){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(p,m):m.isMeshToonMaterial?(r(p,m),h(p,m)):m.isMeshPhongMaterial?(r(p,m),u(p,m)):m.isMeshStandardMaterial?(r(p,m),f(p,m),m.isMeshPhysicalMaterial&&d(p,m,M)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),x(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,_,v):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===tn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===tn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let _=t.get(m),v=_.envMap,M=_.envMapRotation;v&&(p.envMap.value=v,ns.copy(M),ns.x*=-1,ns.y*=-1,ns.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(ns.y*=-1,ns.z*=-1),p.envMapRotation.value.setFromMatrix4(nv.makeRotationFromEuler(ns)),p.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,_,v){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*_,p.scale.value=v*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function h(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function d(p,m,_){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===tn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=_.texture,p.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function x(p,m){let _=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(_.matrixWorld),p.nearDistance.value=_.shadow.camera.near,p.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function sv(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,v){let M=v.program;n.uniformBlockBinding(_,M)}function c(_,v){let M=s[_.id];M===void 0&&(g(_),M=u(_),s[_.id]=M,_.addEventListener("dispose",p));let C=v.program;n.updateUBOMapping(_,C);let w=t.render.frame;r[_.id]!==w&&(f(_),r[_.id]=w)}function u(_){let v=h();_.__bindingPointIndex=v;let M=i.createBuffer(),C=_.__size,w=_.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,C,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,M),M}function h(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let v=s[_.id],M=_.uniforms,C=_.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let w=0,S=M.length;w<S;w++){let I=Array.isArray(M[w])?M[w]:[M[w]];for(let U=0,y=I.length;U<y;U++){let A=I[U];if(d(A,w,U,C)===!0){let O=A.__offset,H=Array.isArray(A.value)?A.value:[A.value],D=0;for(let z=0;z<H.length;z++){let B=H[z],k=x(B);typeof B=="number"||typeof B=="boolean"?(A.__data[0]=B,i.bufferSubData(i.UNIFORM_BUFFER,O+D,A.__data)):B.isMatrix3?(A.__data[0]=B.elements[0],A.__data[1]=B.elements[1],A.__data[2]=B.elements[2],A.__data[3]=0,A.__data[4]=B.elements[3],A.__data[5]=B.elements[4],A.__data[6]=B.elements[5],A.__data[7]=0,A.__data[8]=B.elements[6],A.__data[9]=B.elements[7],A.__data[10]=B.elements[8],A.__data[11]=0):(B.toArray(A.__data,D),D+=k.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,O,A.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(_,v,M,C){let w=_.value,S=v+"_"+M;if(C[S]===void 0)return typeof w=="number"||typeof w=="boolean"?C[S]=w:C[S]=w.clone(),!0;{let I=C[S];if(typeof w=="number"||typeof w=="boolean"){if(I!==w)return C[S]=w,!0}else if(I.equals(w)===!1)return I.copy(w),!0}return!1}function g(_){let v=_.uniforms,M=0,C=16;for(let S=0,I=v.length;S<I;S++){let U=Array.isArray(v[S])?v[S]:[v[S]];for(let y=0,A=U.length;y<A;y++){let O=U[y],H=Array.isArray(O.value)?O.value:[O.value];for(let D=0,z=H.length;D<z;D++){let B=H[D],k=x(B),F=M%C,q=F%k.boundary,et=F+q;M+=q,et!==0&&C-et<k.storage&&(M+=C-et),O.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=M,M+=k.storage}}}let w=M%C;return w>0&&(M+=C-w),_.__size=M,_.__cache={},this}function x(_){let v={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(v.boundary=4,v.storage=4):_.isVector2?(v.boundary=8,v.storage=8):_.isVector3||_.isColor?(v.boundary=16,v.storage=12):_.isVector4?(v.boundary=16,v.storage=16):_.isMatrix3?(v.boundary=48,v.storage=48):_.isMatrix4?(v.boundary=64,v.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),v}function p(_){let v=_.target;v.removeEventListener("dispose",p);let M=o.indexOf(v.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function m(){for(let _ in s)i.deleteBuffer(s[_]);o=[],s={},r={}}return{bind:l,update:c,dispose:m}}var Qo=class{constructor(t={}){let{canvas:e=lp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let d=new Uint32Array(4),g=new Int32Array(4),x=null,p=null,m=[],_=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Be,this.toneMapping=Di,this.toneMappingExposure=1;let v=this,M=!1,C=0,w=0,S=null,I=-1,U=null,y=new ae,A=new ae,O=null,H=new nt(0),D=0,z=e.width,B=e.height,k=1,F=null,q=null,et=new ae(0,0,z,B),Y=new ae(0,0,z,B),at=!1,Dt=new Ir,j=!1,rt=!1,dt=new Yt,gt=new Yt,Ft=new P,Et=new ae,Vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Tt=!1;function ot(){return S===null?k:1}let L=n;function pt(R,W){return e.getContext(R,W)}try{let R={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${eu}`),e.addEventListener("webglcontextlost",ct,!1),e.addEventListener("webglcontextrestored",St,!1),e.addEventListener("webglcontextcreationerror",Ct,!1),L===null){let W="webgl2";if(L=pt(W,R),L===null)throw pt(W)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let ft,ut,yt,Ut,bt,b,E,G,$,tt,Z,Pt,xt,lt,_t,K,Mt,Wt,Ot,Rt,$t,kt,le,V;function wt(){ft=new _g(L),ft.init(),kt=new jx(L,ft),ut=new pg(L,ft,t,kt),yt=new Jx(L),ut.reverseDepthBuffer&&yt.buffers.depth.setReversed(!0),Ut=new Eg(L),bt=new Nx,b=new Qx(L,ft,yt,bt,ut,kt,Ut),E=new gg(v),G=new yg(v),$=new Pp(L),le=new fg(L,$),tt=new Mg(L,$,Ut,le),Z=new bg(L,tt,$,Ut),Ot=new Sg(L,ut,b),K=new mg(bt),Pt=new Ux(v,E,G,ft,ut,le,K),xt=new iv(v,bt),lt=new zx,_t=new Wx(ft),Wt=new hg(v,E,G,yt,Z,f,l),Mt=new Yx(v,Z,ut),V=new sv(L,Ut,ut,yt),Rt=new dg(L,ft,Ut),$t=new Ag(L,ft,Ut),Ut.programs=Pt.programs,v.capabilities=ut,v.extensions=ft,v.properties=bt,v.renderLists=lt,v.shadowMap=Mt,v.state=yt,v.info=Ut}wt();let st=new Pc(v,L);this.xr=st,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let R=ft.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){let R=ft.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(R){R!==void 0&&(k=R,this.setSize(z,B,!1))},this.getSize=function(R){return R.set(z,B)},this.setSize=function(R,W,J=!0){if(st.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=R,B=W,e.width=Math.floor(R*k),e.height=Math.floor(W*k),J===!0&&(e.style.width=R+"px",e.style.height=W+"px"),this.setViewport(0,0,R,W)},this.getDrawingBufferSize=function(R){return R.set(z*k,B*k).floor()},this.setDrawingBufferSize=function(R,W,J){z=R,B=W,k=J,e.width=Math.floor(R*J),e.height=Math.floor(W*J),this.setViewport(0,0,R,W)},this.getCurrentViewport=function(R){return R.copy(y)},this.getViewport=function(R){return R.copy(et)},this.setViewport=function(R,W,J,Q){R.isVector4?et.set(R.x,R.y,R.z,R.w):et.set(R,W,J,Q),yt.viewport(y.copy(et).multiplyScalar(k).round())},this.getScissor=function(R){return R.copy(Y)},this.setScissor=function(R,W,J,Q){R.isVector4?Y.set(R.x,R.y,R.z,R.w):Y.set(R,W,J,Q),yt.scissor(A.copy(Y).multiplyScalar(k).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(R){yt.setScissorTest(at=R)},this.setOpaqueSort=function(R){F=R},this.setTransparentSort=function(R){q=R},this.getClearColor=function(R){return R.copy(Wt.getClearColor())},this.setClearColor=function(){Wt.setClearColor.apply(Wt,arguments)},this.getClearAlpha=function(){return Wt.getClearAlpha()},this.setClearAlpha=function(){Wt.setClearAlpha.apply(Wt,arguments)},this.clear=function(R=!0,W=!0,J=!0){let Q=0;if(R){let X=!1;if(S!==null){let vt=S.texture.format;X=vt===mu||vt===pu||vt===du}if(X){let vt=S.texture.type,It=vt===Vn||vt===as||vt===Pr||vt===$s||vt===uu||vt===hu,Lt=Wt.getClearColor(),Nt=Wt.getClearAlpha(),Xt=Lt.r,qt=Lt.g,zt=Lt.b;It?(d[0]=Xt,d[1]=qt,d[2]=zt,d[3]=Nt,L.clearBufferuiv(L.COLOR,0,d)):(g[0]=Xt,g[1]=qt,g[2]=zt,g[3]=Nt,L.clearBufferiv(L.COLOR,0,g))}else Q|=L.COLOR_BUFFER_BIT}W&&(Q|=L.DEPTH_BUFFER_BIT,L.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),J&&(Q|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(Q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ct,!1),e.removeEventListener("webglcontextrestored",St,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),lt.dispose(),_t.dispose(),bt.dispose(),E.dispose(),G.dispose(),Z.dispose(),le.dispose(),V.dispose(),Pt.dispose(),st.dispose(),st.removeEventListener("sessionstart",As),st.removeEventListener("sessionend",Si),De.stop()};function ct(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function St(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;let R=Ut.autoReset,W=Mt.enabled,J=Mt.autoUpdate,Q=Mt.needsUpdate,X=Mt.type;wt(),Ut.autoReset=R,Mt.enabled=W,Mt.autoUpdate=J,Mt.needsUpdate=Q,Mt.type=X}function Ct(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function N(R){let W=R.target;W.removeEventListener("dispose",N),ht(W)}function ht(R){Kt(R),bt.remove(R)}function Kt(R){let W=bt.get(R).programs;W!==void 0&&(W.forEach(function(J){Pt.releaseProgram(J)}),R.isShaderMaterial&&Pt.releaseShaderCache(R))}this.renderBufferDirect=function(R,W,J,Q,X,vt){W===null&&(W=Vt);let It=X.isMesh&&X.matrixWorld.determinant()<0,Lt=bd(R,W,J,Q,X);yt.setMaterial(Q,It);let Nt=J.index,Xt=1;if(Q.wireframe===!0){if(Nt=tt.getWireframeAttribute(J),Nt===void 0)return;Xt=2}let qt=J.drawRange,zt=J.attributes.position,pe=qt.start*Xt,Se=(qt.start+qt.count)*Xt;vt!==null&&(pe=Math.max(pe,vt.start*Xt),Se=Math.min(Se,(vt.start+vt.count)*Xt)),Nt!==null?(pe=Math.max(pe,0),Se=Math.min(Se,Nt.count)):zt!=null&&(pe=Math.max(pe,0),Se=Math.min(Se,zt.count));let Pe=Se-pe;if(Pe<0||Pe===1/0)return;le.setup(X,Q,Lt,J,Nt);let yn,fe=Rt;if(Nt!==null&&(yn=$.get(Nt),fe=$t,fe.setIndex(yn)),X.isMesh)Q.wireframe===!0?(yt.setLineWidth(Q.wireframeLinewidth*ot()),fe.setMode(L.LINES)):fe.setMode(L.TRIANGLES);else if(X.isLine){let Ht=Q.linewidth;Ht===void 0&&(Ht=1),yt.setLineWidth(Ht*ot()),X.isLineSegments?fe.setMode(L.LINES):X.isLineLoop?fe.setMode(L.LINE_LOOP):fe.setMode(L.LINE_STRIP)}else X.isPoints?fe.setMode(L.POINTS):X.isSprite&&fe.setMode(L.TRIANGLES);if(X.isBatchedMesh)if(X._multiDrawInstances!==null)fe.renderMultiDrawInstances(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount,X._multiDrawInstances);else if(ft.get("WEBGL_multi_draw"))fe.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Ht=X._multiDrawStarts,We=X._multiDrawCounts,de=X._multiDrawCount,Un=Nt?$.get(Nt).bytesPerElement:1,Es=bt.get(Q).currentProgram.getUniforms();for(let _n=0;_n<de;_n++)Es.setValue(L,"_gl_DrawID",_n),fe.render(Ht[_n]/Un,We[_n])}else if(X.isInstancedMesh)fe.renderInstances(pe,Pe,X.count);else if(J.isInstancedBufferGeometry){let Ht=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,We=Math.min(J.instanceCount,Ht);fe.renderInstances(pe,Pe,We)}else fe.render(pe,Pe)};function Zt(R,W,J){R.transparent===!0&&R.side===Ue&&R.forceSinglePass===!1?(R.side=tn,R.needsUpdate=!0,jr(R,W,J),R.side=Ui,R.needsUpdate=!0,jr(R,W,J),R.side=Ue):jr(R,W,J)}this.compile=function(R,W,J=null){J===null&&(J=R),p=_t.get(J),p.init(W),_.push(p),J.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),R!==J&&R.traverseVisible(function(X){X.isLight&&X.layers.test(W.layers)&&(p.pushLight(X),X.castShadow&&p.pushShadow(X))}),p.setupLights();let Q=new Set;return R.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let vt=X.material;if(vt)if(Array.isArray(vt))for(let It=0;It<vt.length;It++){let Lt=vt[It];Zt(Lt,J,X),Q.add(Lt)}else Zt(vt,J,X),Q.add(vt)}),_.pop(),p=null,Q},this.compileAsync=function(R,W,J=null){let Q=this.compile(R,W,J);return new Promise(X=>{function vt(){if(Q.forEach(function(It){bt.get(It).currentProgram.isReady()&&Q.delete(It)}),Q.size===0){X(R);return}setTimeout(vt,10)}ft.get("KHR_parallel_shader_compile")!==null?vt():setTimeout(vt,10)})};let se=null;function Te(R){se&&se(R)}function As(){De.stop()}function Si(){De.start()}let De=new df;De.setAnimationLoop(Te),typeof self<"u"&&De.setContext(self),this.setAnimationLoop=function(R){se=R,st.setAnimationLoop(R),R===null?De.stop():De.start()},st.addEventListener("sessionstart",As),st.addEventListener("sessionend",Si),this.render=function(R,W){if(W!==void 0&&W.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),st.enabled===!0&&st.isPresenting===!0&&(st.cameraAutoUpdate===!0&&st.updateCamera(W),W=st.getCamera()),R.isScene===!0&&R.onBeforeRender(v,R,W,S),p=_t.get(R,_.length),p.init(W),_.push(p),gt.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),Dt.setFromProjectionMatrix(gt),rt=this.localClippingEnabled,j=K.init(this.clippingPlanes,rt),x=lt.get(R,m.length),x.init(),m.push(x),st.enabled===!0&&st.isPresenting===!0){let vt=v.xr.getDepthSensingMesh();vt!==null&&Va(vt,W,-1/0,v.sortObjects)}Va(R,W,0,v.sortObjects),x.finish(),v.sortObjects===!0&&x.sort(F,q),Tt=st.enabled===!1||st.isPresenting===!1||st.hasDepthSensing()===!1,Tt&&Wt.addToRenderList(x,R),this.info.render.frame++,j===!0&&K.beginShadows();let J=p.state.shadowsArray;Mt.render(J,R,W),j===!0&&K.endShadows(),this.info.autoReset===!0&&this.info.reset();let Q=x.opaque,X=x.transmissive;if(p.setupLights(),W.isArrayCamera){let vt=W.cameras;if(X.length>0)for(let It=0,Lt=vt.length;It<Lt;It++){let Nt=vt[It];Nu(Q,X,R,Nt)}Tt&&Wt.render(R);for(let It=0,Lt=vt.length;It<Lt;It++){let Nt=vt[It];Uu(x,R,Nt,Nt.viewport)}}else X.length>0&&Nu(Q,X,R,W),Tt&&Wt.render(R),Uu(x,R,W);S!==null&&(b.updateMultisampleRenderTarget(S),b.updateRenderTargetMipmap(S)),R.isScene===!0&&R.onAfterRender(v,R,W),le.resetDefaultState(),I=-1,U=null,_.pop(),_.length>0?(p=_[_.length-1],j===!0&&K.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,m.pop(),m.length>0?x=m[m.length-1]:x=null};function Va(R,W,J,Q){if(R.visible===!1)return;if(R.layers.test(W.layers)){if(R.isGroup)J=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(W);else if(R.isLight)p.pushLight(R),R.castShadow&&p.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||Dt.intersectsSprite(R)){Q&&Et.setFromMatrixPosition(R.matrixWorld).applyMatrix4(gt);let It=Z.update(R),Lt=R.material;Lt.visible&&x.push(R,It,Lt,J,Et.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||Dt.intersectsObject(R))){let It=Z.update(R),Lt=R.material;if(Q&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Et.copy(R.boundingSphere.center)):(It.boundingSphere===null&&It.computeBoundingSphere(),Et.copy(It.boundingSphere.center)),Et.applyMatrix4(R.matrixWorld).applyMatrix4(gt)),Array.isArray(Lt)){let Nt=It.groups;for(let Xt=0,qt=Nt.length;Xt<qt;Xt++){let zt=Nt[Xt],pe=Lt[zt.materialIndex];pe&&pe.visible&&x.push(R,It,pe,J,Et.z,zt)}}else Lt.visible&&x.push(R,It,Lt,J,Et.z,null)}}let vt=R.children;for(let It=0,Lt=vt.length;It<Lt;It++)Va(vt[It],W,J,Q)}function Uu(R,W,J,Q){let X=R.opaque,vt=R.transmissive,It=R.transparent;p.setupLightsView(J),j===!0&&K.setGlobalState(v.clippingPlanes,J),Q&&yt.viewport(y.copy(Q)),X.length>0&&Qr(X,W,J),vt.length>0&&Qr(vt,W,J),It.length>0&&Qr(It,W,J),yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function Nu(R,W,J,Q){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[Q.id]===void 0&&(p.state.transmissionRenderTarget[Q.id]=new be(1,1,{generateMipmaps:!0,type:ft.has("EXT_color_buffer_half_float")||ft.has("EXT_color_buffer_float")?Ye:Vn,minFilter:fi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ce.workingColorSpace}));let vt=p.state.transmissionRenderTarget[Q.id],It=Q.viewport||y;vt.setSize(It.z,It.w);let Lt=v.getRenderTarget();v.setRenderTarget(vt),v.getClearColor(H),D=v.getClearAlpha(),D<1&&v.setClearColor(16777215,.5),v.clear(),Tt&&Wt.render(J);let Nt=v.toneMapping;v.toneMapping=Di;let Xt=Q.viewport;if(Q.viewport!==void 0&&(Q.viewport=void 0),p.setupLightsView(Q),j===!0&&K.setGlobalState(v.clippingPlanes,Q),Qr(R,J,Q),b.updateMultisampleRenderTarget(vt),b.updateRenderTargetMipmap(vt),ft.has("WEBGL_multisampled_render_to_texture")===!1){let qt=!1;for(let zt=0,pe=W.length;zt<pe;zt++){let Se=W[zt],Pe=Se.object,yn=Se.geometry,fe=Se.material,Ht=Se.group;if(fe.side===Ue&&Pe.layers.test(Q.layers)){let We=fe.side;fe.side=tn,fe.needsUpdate=!0,Bu(Pe,J,Q,yn,fe,Ht),fe.side=We,fe.needsUpdate=!0,qt=!0}}qt===!0&&(b.updateMultisampleRenderTarget(vt),b.updateRenderTargetMipmap(vt))}v.setRenderTarget(Lt),v.setClearColor(H,D),Xt!==void 0&&(Q.viewport=Xt),v.toneMapping=Nt}function Qr(R,W,J){let Q=W.isScene===!0?W.overrideMaterial:null;for(let X=0,vt=R.length;X<vt;X++){let It=R[X],Lt=It.object,Nt=It.geometry,Xt=Q===null?It.material:Q,qt=It.group;Lt.layers.test(J.layers)&&Bu(Lt,W,J,Nt,Xt,qt)}}function Bu(R,W,J,Q,X,vt){R.onBeforeRender(v,W,J,Q,X,vt),R.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),X.onBeforeRender(v,W,J,Q,R,vt),X.transparent===!0&&X.side===Ue&&X.forceSinglePass===!1?(X.side=tn,X.needsUpdate=!0,v.renderBufferDirect(J,W,Q,X,R,vt),X.side=Ui,X.needsUpdate=!0,v.renderBufferDirect(J,W,Q,X,R,vt),X.side=Ue):v.renderBufferDirect(J,W,Q,X,R,vt),R.onAfterRender(v,W,J,Q,X,vt)}function jr(R,W,J){W.isScene!==!0&&(W=Vt);let Q=bt.get(R),X=p.state.lights,vt=p.state.shadowsArray,It=X.state.version,Lt=Pt.getParameters(R,X.state,vt,W,J),Nt=Pt.getProgramCacheKey(Lt),Xt=Q.programs;Q.environment=R.isMeshStandardMaterial?W.environment:null,Q.fog=W.fog,Q.envMap=(R.isMeshStandardMaterial?G:E).get(R.envMap||Q.environment),Q.envMapRotation=Q.environment!==null&&R.envMap===null?W.environmentRotation:R.envMapRotation,Xt===void 0&&(R.addEventListener("dispose",N),Xt=new Map,Q.programs=Xt);let qt=Xt.get(Nt);if(qt!==void 0){if(Q.currentProgram===qt&&Q.lightsStateVersion===It)return Ou(R,Lt),qt}else Lt.uniforms=Pt.getUniforms(R),R.onBeforeCompile(Lt,v),qt=Pt.acquireProgram(Lt,Nt),Xt.set(Nt,qt),Q.uniforms=Lt.uniforms;let zt=Q.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(zt.clippingPlanes=K.uniform),Ou(R,Lt),Q.needsLights=Td(R),Q.lightsStateVersion=It,Q.needsLights&&(zt.ambientLightColor.value=X.state.ambient,zt.lightProbe.value=X.state.probe,zt.directionalLights.value=X.state.directional,zt.directionalLightShadows.value=X.state.directionalShadow,zt.spotLights.value=X.state.spot,zt.spotLightShadows.value=X.state.spotShadow,zt.rectAreaLights.value=X.state.rectArea,zt.ltc_1.value=X.state.rectAreaLTC1,zt.ltc_2.value=X.state.rectAreaLTC2,zt.pointLights.value=X.state.point,zt.pointLightShadows.value=X.state.pointShadow,zt.hemisphereLights.value=X.state.hemi,zt.directionalShadowMap.value=X.state.directionalShadowMap,zt.directionalShadowMatrix.value=X.state.directionalShadowMatrix,zt.spotShadowMap.value=X.state.spotShadowMap,zt.spotLightMatrix.value=X.state.spotLightMatrix,zt.spotLightMap.value=X.state.spotLightMap,zt.pointShadowMap.value=X.state.pointShadowMap,zt.pointShadowMatrix.value=X.state.pointShadowMatrix),Q.currentProgram=qt,Q.uniformsList=null,qt}function zu(R){if(R.uniformsList===null){let W=R.currentProgram.getUniforms();R.uniformsList=Zs.seqWithValue(W.seq,R.uniforms)}return R.uniformsList}function Ou(R,W){let J=bt.get(R);J.outputColorSpace=W.outputColorSpace,J.batching=W.batching,J.batchingColor=W.batchingColor,J.instancing=W.instancing,J.instancingColor=W.instancingColor,J.instancingMorph=W.instancingMorph,J.skinning=W.skinning,J.morphTargets=W.morphTargets,J.morphNormals=W.morphNormals,J.morphColors=W.morphColors,J.morphTargetsCount=W.morphTargetsCount,J.numClippingPlanes=W.numClippingPlanes,J.numIntersection=W.numClipIntersection,J.vertexAlphas=W.vertexAlphas,J.vertexTangents=W.vertexTangents,J.toneMapping=W.toneMapping}function bd(R,W,J,Q,X){W.isScene!==!0&&(W=Vt),b.resetTextureUnits();let vt=W.fog,It=Q.isMeshStandardMaterial?W.environment:null,Lt=S===null?v.outputColorSpace:S.isXRRenderTarget===!0?S.texture.colorSpace:Vi,Nt=(Q.isMeshStandardMaterial?G:E).get(Q.envMap||It),Xt=Q.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,qt=!!J.attributes.tangent&&(!!Q.normalMap||Q.anisotropy>0),zt=!!J.morphAttributes.position,pe=!!J.morphAttributes.normal,Se=!!J.morphAttributes.color,Pe=Di;Q.toneMapped&&(S===null||S.isXRRenderTarget===!0)&&(Pe=v.toneMapping);let yn=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,fe=yn!==void 0?yn.length:0,Ht=bt.get(Q),We=p.state.lights;if(j===!0&&(rt===!0||R!==U)){let wn=R===U&&Q.id===I;K.setState(Q,R,wn)}let de=!1;Q.version===Ht.__version?(Ht.needsLights&&Ht.lightsStateVersion!==We.state.version||Ht.outputColorSpace!==Lt||X.isBatchedMesh&&Ht.batching===!1||!X.isBatchedMesh&&Ht.batching===!0||X.isBatchedMesh&&Ht.batchingColor===!0&&X.colorTexture===null||X.isBatchedMesh&&Ht.batchingColor===!1&&X.colorTexture!==null||X.isInstancedMesh&&Ht.instancing===!1||!X.isInstancedMesh&&Ht.instancing===!0||X.isSkinnedMesh&&Ht.skinning===!1||!X.isSkinnedMesh&&Ht.skinning===!0||X.isInstancedMesh&&Ht.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ht.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ht.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ht.instancingMorph===!1&&X.morphTexture!==null||Ht.envMap!==Nt||Q.fog===!0&&Ht.fog!==vt||Ht.numClippingPlanes!==void 0&&(Ht.numClippingPlanes!==K.numPlanes||Ht.numIntersection!==K.numIntersection)||Ht.vertexAlphas!==Xt||Ht.vertexTangents!==qt||Ht.morphTargets!==zt||Ht.morphNormals!==pe||Ht.morphColors!==Se||Ht.toneMapping!==Pe||Ht.morphTargetsCount!==fe)&&(de=!0):(de=!0,Ht.__version=Q.version);let Un=Ht.currentProgram;de===!0&&(Un=jr(Q,W,X));let Es=!1,_n=!1,Ga=!1,Ie=Un.getUniforms(),bi=Ht.uniforms;if(yt.useProgram(Un.program)&&(Es=!0,_n=!0,Ga=!0),Q.id!==I&&(I=Q.id,_n=!0),Es||U!==R){ut.reverseDepthBuffer?(dt.copy(R.projectionMatrix),up(dt),hp(dt),Ie.setValue(L,"projectionMatrix",dt)):Ie.setValue(L,"projectionMatrix",R.projectionMatrix),Ie.setValue(L,"viewMatrix",R.matrixWorldInverse);let wn=Ie.map.cameraPosition;wn!==void 0&&wn.setValue(L,Ft.setFromMatrixPosition(R.matrixWorld)),ut.logarithmicDepthBuffer&&Ie.setValue(L,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(Q.isMeshPhongMaterial||Q.isMeshToonMaterial||Q.isMeshLambertMaterial||Q.isMeshBasicMaterial||Q.isMeshStandardMaterial||Q.isShaderMaterial)&&Ie.setValue(L,"isOrthographic",R.isOrthographicCamera===!0),U!==R&&(U=R,_n=!0,Ga=!0)}if(X.isSkinnedMesh){Ie.setOptional(L,X,"bindMatrix"),Ie.setOptional(L,X,"bindMatrixInverse");let wn=X.skeleton;wn&&(wn.boneTexture===null&&wn.computeBoneTexture(),Ie.setValue(L,"boneTexture",wn.boneTexture,b))}X.isBatchedMesh&&(Ie.setOptional(L,X,"batchingTexture"),Ie.setValue(L,"batchingTexture",X._matricesTexture,b),Ie.setOptional(L,X,"batchingIdTexture"),Ie.setValue(L,"batchingIdTexture",X._indirectTexture,b),Ie.setOptional(L,X,"batchingColorTexture"),X._colorsTexture!==null&&Ie.setValue(L,"batchingColorTexture",X._colorsTexture,b));let Wa=J.morphAttributes;if((Wa.position!==void 0||Wa.normal!==void 0||Wa.color!==void 0)&&Ot.update(X,J,Un),(_n||Ht.receiveShadow!==X.receiveShadow)&&(Ht.receiveShadow=X.receiveShadow,Ie.setValue(L,"receiveShadow",X.receiveShadow)),Q.isMeshGouraudMaterial&&Q.envMap!==null&&(bi.envMap.value=Nt,bi.flipEnvMap.value=Nt.isCubeTexture&&Nt.isRenderTargetTexture===!1?-1:1),Q.isMeshStandardMaterial&&Q.envMap===null&&W.environment!==null&&(bi.envMapIntensity.value=W.environmentIntensity),_n&&(Ie.setValue(L,"toneMappingExposure",v.toneMappingExposure),Ht.needsLights&&wd(bi,Ga),vt&&Q.fog===!0&&xt.refreshFogUniforms(bi,vt),xt.refreshMaterialUniforms(bi,Q,k,B,p.state.transmissionRenderTarget[R.id]),Zs.upload(L,zu(Ht),bi,b)),Q.isShaderMaterial&&Q.uniformsNeedUpdate===!0&&(Zs.upload(L,zu(Ht),bi,b),Q.uniformsNeedUpdate=!1),Q.isSpriteMaterial&&Ie.setValue(L,"center",X.center),Ie.setValue(L,"modelViewMatrix",X.modelViewMatrix),Ie.setValue(L,"normalMatrix",X.normalMatrix),Ie.setValue(L,"modelMatrix",X.matrixWorld),Q.isShaderMaterial||Q.isRawShaderMaterial){let wn=Q.uniformsGroups;for(let Xa=0,Rd=wn.length;Xa<Rd;Xa++){let Hu=wn[Xa];V.update(Hu,Un),V.bind(Hu,Un)}}return Un}function wd(R,W){R.ambientLightColor.needsUpdate=W,R.lightProbe.needsUpdate=W,R.directionalLights.needsUpdate=W,R.directionalLightShadows.needsUpdate=W,R.pointLights.needsUpdate=W,R.pointLightShadows.needsUpdate=W,R.spotLights.needsUpdate=W,R.spotLightShadows.needsUpdate=W,R.rectAreaLights.needsUpdate=W,R.hemisphereLights.needsUpdate=W}function Td(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return S},this.setRenderTargetTextures=function(R,W,J){bt.get(R.texture).__webglTexture=W,bt.get(R.depthTexture).__webglTexture=J;let Q=bt.get(R);Q.__hasExternalTextures=!0,Q.__autoAllocateDepthBuffer=J===void 0,Q.__autoAllocateDepthBuffer||ft.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(R,W){let J=bt.get(R);J.__webglFramebuffer=W,J.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(R,W=0,J=0){S=R,C=W,w=J;let Q=!0,X=null,vt=!1,It=!1;if(R){let Nt=bt.get(R);if(Nt.__useDefaultFramebuffer!==void 0)yt.bindFramebuffer(L.FRAMEBUFFER,null),Q=!1;else if(Nt.__webglFramebuffer===void 0)b.setupRenderTarget(R);else if(Nt.__hasExternalTextures)b.rebindTextures(R,bt.get(R.texture).__webglTexture,bt.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){let zt=R.depthTexture;if(Nt.__boundDepthTexture!==zt){if(zt!==null&&bt.has(zt)&&(R.width!==zt.image.width||R.height!==zt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");b.setupDepthRenderbuffer(R)}}let Xt=R.texture;(Xt.isData3DTexture||Xt.isDataArrayTexture||Xt.isCompressedArrayTexture)&&(It=!0);let qt=bt.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(qt[W])?X=qt[W][J]:X=qt[W],vt=!0):R.samples>0&&b.useMultisampledRTT(R)===!1?X=bt.get(R).__webglMultisampledFramebuffer:Array.isArray(qt)?X=qt[J]:X=qt,y.copy(R.viewport),A.copy(R.scissor),O=R.scissorTest}else y.copy(et).multiplyScalar(k).floor(),A.copy(Y).multiplyScalar(k).floor(),O=at;if(yt.bindFramebuffer(L.FRAMEBUFFER,X)&&Q&&yt.drawBuffers(R,X),yt.viewport(y),yt.scissor(A),yt.setScissorTest(O),vt){let Nt=bt.get(R.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+W,Nt.__webglTexture,J)}else if(It){let Nt=bt.get(R.texture),Xt=W||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Nt.__webglTexture,J||0,Xt)}I=-1},this.readRenderTargetPixels=function(R,W,J,Q,X,vt,It){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Lt=bt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&It!==void 0&&(Lt=Lt[It]),Lt){yt.bindFramebuffer(L.FRAMEBUFFER,Lt);try{let Nt=R.texture,Xt=Nt.format,qt=Nt.type;if(!ut.textureFormatReadable(Xt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ut.textureTypeReadable(qt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=R.width-Q&&J>=0&&J<=R.height-X&&L.readPixels(W,J,Q,X,kt.convert(Xt),kt.convert(qt),vt)}finally{let Nt=S!==null?bt.get(S).__webglFramebuffer:null;yt.bindFramebuffer(L.FRAMEBUFFER,Nt)}}},this.readRenderTargetPixelsAsync=async function(R,W,J,Q,X,vt,It){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Lt=bt.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&It!==void 0&&(Lt=Lt[It]),Lt){let Nt=R.texture,Xt=Nt.format,qt=Nt.type;if(!ut.textureFormatReadable(Xt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ut.textureTypeReadable(qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(W>=0&&W<=R.width-Q&&J>=0&&J<=R.height-X){yt.bindFramebuffer(L.FRAMEBUFFER,Lt);let zt=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,zt),L.bufferData(L.PIXEL_PACK_BUFFER,vt.byteLength,L.STREAM_READ),L.readPixels(W,J,Q,X,kt.convert(Xt),kt.convert(qt),0);let pe=S!==null?bt.get(S).__webglFramebuffer:null;yt.bindFramebuffer(L.FRAMEBUFFER,pe);let Se=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await cp(L,Se,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,zt),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,vt),L.deleteBuffer(zt),L.deleteSync(Se),vt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(R,W=null,J=0){R.isTexture!==!0&&(No("WebGLRenderer: copyFramebufferToTexture function signature has changed."),W=arguments[0]||null,R=arguments[1]);let Q=Math.pow(2,-J),X=Math.floor(R.image.width*Q),vt=Math.floor(R.image.height*Q),It=W!==null?W.x:0,Lt=W!==null?W.y:0;b.setTexture2D(R,0),L.copyTexSubImage2D(L.TEXTURE_2D,J,0,0,It,Lt,X,vt),yt.unbindTexture()},this.copyTextureToTexture=function(R,W,J=null,Q=null,X=0){R.isTexture!==!0&&(No("WebGLRenderer: copyTextureToTexture function signature has changed."),Q=arguments[0]||null,R=arguments[1],W=arguments[2],X=arguments[3]||0,J=null);let vt,It,Lt,Nt,Xt,qt;J!==null?(vt=J.max.x-J.min.x,It=J.max.y-J.min.y,Lt=J.min.x,Nt=J.min.y):(vt=R.image.width,It=R.image.height,Lt=0,Nt=0),Q!==null?(Xt=Q.x,qt=Q.y):(Xt=0,qt=0);let zt=kt.convert(W.format),pe=kt.convert(W.type);b.setTexture2D(W,0),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,W.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,W.unpackAlignment);let Se=L.getParameter(L.UNPACK_ROW_LENGTH),Pe=L.getParameter(L.UNPACK_IMAGE_HEIGHT),yn=L.getParameter(L.UNPACK_SKIP_PIXELS),fe=L.getParameter(L.UNPACK_SKIP_ROWS),Ht=L.getParameter(L.UNPACK_SKIP_IMAGES),We=R.isCompressedTexture?R.mipmaps[X]:R.image;L.pixelStorei(L.UNPACK_ROW_LENGTH,We.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,We.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Lt),L.pixelStorei(L.UNPACK_SKIP_ROWS,Nt),R.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,X,Xt,qt,vt,It,zt,pe,We.data):R.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,X,Xt,qt,We.width,We.height,zt,We.data):L.texSubImage2D(L.TEXTURE_2D,X,Xt,qt,vt,It,zt,pe,We),L.pixelStorei(L.UNPACK_ROW_LENGTH,Se),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Pe),L.pixelStorei(L.UNPACK_SKIP_PIXELS,yn),L.pixelStorei(L.UNPACK_SKIP_ROWS,fe),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Ht),X===0&&W.generateMipmaps&&L.generateMipmap(L.TEXTURE_2D),yt.unbindTexture()},this.copyTextureToTexture3D=function(R,W,J=null,Q=null,X=0){R.isTexture!==!0&&(No("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,Q=arguments[1]||null,R=arguments[2],W=arguments[3],X=arguments[4]||0);let vt,It,Lt,Nt,Xt,qt,zt,pe,Se,Pe=R.isCompressedTexture?R.mipmaps[X]:R.image;J!==null?(vt=J.max.x-J.min.x,It=J.max.y-J.min.y,Lt=J.max.z-J.min.z,Nt=J.min.x,Xt=J.min.y,qt=J.min.z):(vt=Pe.width,It=Pe.height,Lt=Pe.depth,Nt=0,Xt=0,qt=0),Q!==null?(zt=Q.x,pe=Q.y,Se=Q.z):(zt=0,pe=0,Se=0);let yn=kt.convert(W.format),fe=kt.convert(W.type),Ht;if(W.isData3DTexture)b.setTexture3D(W,0),Ht=L.TEXTURE_3D;else if(W.isDataArrayTexture||W.isCompressedArrayTexture)b.setTexture2DArray(W,0),Ht=L.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,W.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,W.unpackAlignment);let We=L.getParameter(L.UNPACK_ROW_LENGTH),de=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Un=L.getParameter(L.UNPACK_SKIP_PIXELS),Es=L.getParameter(L.UNPACK_SKIP_ROWS),_n=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,Pe.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Pe.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Nt),L.pixelStorei(L.UNPACK_SKIP_ROWS,Xt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,qt),R.isDataTexture||R.isData3DTexture?L.texSubImage3D(Ht,X,zt,pe,Se,vt,It,Lt,yn,fe,Pe.data):W.isCompressedArrayTexture?L.compressedTexSubImage3D(Ht,X,zt,pe,Se,vt,It,Lt,yn,Pe.data):L.texSubImage3D(Ht,X,zt,pe,Se,vt,It,Lt,yn,fe,Pe),L.pixelStorei(L.UNPACK_ROW_LENGTH,We),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,de),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Un),L.pixelStorei(L.UNPACK_SKIP_ROWS,Es),L.pixelStorei(L.UNPACK_SKIP_IMAGES,_n),X===0&&W.generateMipmaps&&L.generateMipmap(Ht),yt.unbindTexture()},this.initRenderTarget=function(R){bt.get(R).__webglFramebuffer===void 0&&b.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?b.setTextureCube(R,0):R.isData3DTexture?b.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?b.setTexture2DArray(R,0):b.setTexture2D(R,0),yt.unbindTexture()},this.resetState=function(){C=0,w=0,S=null,yt.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return di}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===gu?"display-p3":"srgb",e.unpackColorSpace=ce.workingColorSpace===fa?"display-p3":"srgb"}};var jo=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new nt(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},zi=class extends qe{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},$o=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=dc,this.updateRanges=[],this.version=0,this.uuid=pi()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=pi()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},on=new P,Fr=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)on.fromBufferAttribute(this,e),on.applyMatrix4(t),this.setXYZ(e,on.x,on.y,on.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)on.fromBufferAttribute(this,e),on.applyNormalMatrix(t),this.setXYZ(e,on.x,on.y,on.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)on.fromBufferAttribute(this,e),on.transformDirection(t),this.setXYZ(e,on.x,on.y,on.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Kn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=me(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=me(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Kn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Kn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Kn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Kn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=me(e,this.array),n=me(n,this.array),s=me(s,this.array),r=me(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ue(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},xi=class extends gi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new nt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},zs,_r=new P,Os=new P,Hs=new P,ks=new it,Mr=new it,vf=new Yt,Mo=new P,Ar=new P,Ao=new P,Uh=new it,El=new it,Nh=new it,Oi=class extends qe{constructor(t=new xi){if(super(),this.isSprite=!0,this.type="Sprite",zs===void 0){zs=new Jt;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new $o(e,5);zs.setIndex([0,1,2,0,2,3]),zs.setAttribute("position",new Fr(n,3,0,!1)),zs.setAttribute("uv",new Fr(n,2,3,!1))}this.geometry=zs,this.material=t,this.center=new it(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Os.setFromMatrixScale(this.matrixWorld),vf.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Hs.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Os.multiplyScalar(-Hs.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;Eo(Mo.set(-.5,-.5,0),Hs,o,Os,s,r),Eo(Ar.set(.5,-.5,0),Hs,o,Os,s,r),Eo(Ao.set(.5,.5,0),Hs,o,Os,s,r),Uh.set(0,0),El.set(1,0),Nh.set(1,1);let a=t.ray.intersectTriangle(Mo,Ar,Ao,!1,_r);if(a===null&&(Eo(Ar.set(-.5,.5,0),Hs,o,Os,s,r),El.set(0,1),a=t.ray.intersectTriangle(Mo,Ao,Ar,!1,_r),a===null))return;let l=t.ray.origin.distanceTo(_r);l<t.near||l>t.far||e.push({distance:l,point:_r.clone(),uv:Fi.getInterpolation(_r,Mo,Ar,Ao,Uh,El,Nh,new it),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Eo(i,t,e,n,s,r){ks.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Mr.x=r*ks.x-s*ks.y,Mr.y=s*ks.x+r*ks.y):Mr.copy(ks),i.copy(t),i.x+=Mr.x,i.y+=Mr.y,i.applyMatrix4(vf)}var Ic=class extends pn{constructor(t=null,e=1,n=1,s,r,o,a,l,c=dn,u=dn,h,f){super(null,o,a,l,c,u,s,r,h,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Dr=class extends ue{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Vs=new Yt,Bh=new Yt,So=[],zh=new mi,rv=new Yt,Er=new jt,Sr=new Bi,sn=class extends jt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Dr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,rv)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new mi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Vs),zh.copy(t.boundingBox).applyMatrix4(Vs),this.boundingBox.union(zh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Bi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Vs),Sr.copy(t.boundingSphere).applyMatrix4(Vs),this.boundingSphere.union(Sr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Er.geometry=this.geometry,Er.material=this.material,Er.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Sr.copy(this.boundingSphere),Sr.applyMatrix4(n),t.ray.intersectsSphere(Sr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Vs),Bh.multiplyMatrices(n,Vs),Er.matrixWorld=Bh,Er.raycast(t,So);for(let o=0,a=So.length;o<a;o++){let l=So[o];l.instanceId=r,l.object=this,e.push(l)}So.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Dr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ic(new Float32Array(s*this.count),s,this.count,fu,Qn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Hi=class extends gi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new nt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Oh=new Yt,Fc=new Xo,bo=new Bi,wo=new P,ki=class extends qe{constructor(t=new Jt,e=new Hi){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),bo.copy(n.boundingSphere),bo.applyMatrix4(s),bo.radius+=r,t.ray.intersectsSphere(bo)===!1)return;Oh.copy(s).invert(),Fc.copy(t.ray).applyMatrix4(Oh);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){let f=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let g=f,x=d;g<x;g++){let p=c.getX(g);wo.fromBufferAttribute(h,p),Hh(wo,p,l,s,t,e,this)}}else{let f=Math.max(0,o.start),d=Math.min(h.count,o.start+o.count);for(let g=f,x=d;g<x;g++)wo.fromBufferAttribute(h,g),Hh(wo,g,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Hh(i,t,e,n,s,r,o){let a=Fc.distanceSqToPoint(i);if(a<e){let l=new P;Fc.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Gn=class extends pn{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Cn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let u=n[s],f=n[s+1]-u,d=(o-u)/f;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new it:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new P,s=[],r=[],o=[],a=new P,l=new Yt;for(let d=0;d<=t;d++){let g=d/t;s[d]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(ke(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(ke(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Lr=class extends Cn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new it){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*u-d*h+this.aX,c=f*h+d*u+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Dc=class extends Lr{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function vu(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let f=(o-r)/c-(a-r)/(c+u)+(a-o)/u,d=(a-o)/u-(l-o)/(u+h)+(l-a)/h;f*=u,d*=u,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var To=new P,Sl=new vu,bl=new vu,wl=new vu,Lc=class extends Cn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new P){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(To.subVectors(s[0],s[1]).add(s[0]),c=To);let h=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(To.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=To),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),d),x=Math.pow(h.distanceToSquared(f),d),p=Math.pow(f.distanceToSquared(u),d);x<1e-4&&(x=1),g<1e-4&&(g=x),p<1e-4&&(p=x),Sl.initNonuniformCatmullRom(c.x,h.x,f.x,u.x,g,x,p),bl.initNonuniformCatmullRom(c.y,h.y,f.y,u.y,g,x,p),wl.initNonuniformCatmullRom(c.z,h.z,f.z,u.z,g,x,p)}else this.curveType==="catmullrom"&&(Sl.initCatmullRom(c.x,h.x,f.x,u.x,this.tension),bl.initCatmullRom(c.y,h.y,f.y,u.y,this.tension),wl.initCatmullRom(c.z,h.z,f.z,u.z,this.tension));return n.set(Sl.calc(l),bl.calc(l),wl.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new P().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function kh(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function ov(i,t){let e=1-i;return e*e*t}function av(i,t){return 2*(1-i)*i*t}function lv(i,t){return i*i*t}function Rr(i,t,e,n){return ov(i,t)+av(i,e)+lv(i,n)}function cv(i,t){let e=1-i;return e*e*e*t}function uv(i,t){let e=1-i;return 3*e*e*i*t}function hv(i,t){return 3*(1-i)*i*i*t}function fv(i,t){return i*i*i*t}function Cr(i,t,e,n,s){return cv(i,t)+uv(i,e)+hv(i,n)+fv(i,s)}var ta=class extends Cn{constructor(t=new it,e=new it,n=new it,s=new it){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new it){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cr(t,s.x,r.x,o.x,a.x),Cr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Uc=class extends Cn{constructor(t=new P,e=new P,n=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cr(t,s.x,r.x,o.x,a.x),Cr(t,s.y,r.y,o.y,a.y),Cr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ea=class extends Cn{constructor(t=new it,e=new it){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new it){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new it){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Nc=class extends Cn{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},na=class extends Cn{constructor(t=new it,e=new it,n=new it){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new it){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Rr(t,s.x,r.x,o.x),Rr(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Bc=class extends Cn{constructor(t=new P,e=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new P){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Rr(t,s.x,r.x,o.x),Rr(t,s.y,r.y,o.y),Rr(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},rr=class extends Cn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new it){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(kh(a,l.x,c.x,u.x,h.x),kh(a,l.y,c.y,u.y,h.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new it().fromArray(s))}return this}},zc=Object.freeze({__proto__:null,ArcCurve:Dc,CatmullRomCurve3:Lc,CubicBezierCurve:ta,CubicBezierCurve3:Uc,EllipseCurve:Lr,LineCurve:ea,LineCurve3:Nc,QuadraticBezierCurve:na,QuadraticBezierCurve3:Bc,SplineCurve:rr}),Oc=class extends Cn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new zc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(e.push(u),n=u)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new zc[s.type]().fromJSON(s))}return this}},ls=class extends Oc{constructor(t){super(),this.type="Path",this.currentPoint=new it,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new ea(this.currentPoint.clone(),new it(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new na(this.currentPoint.clone(),new it(t,e),new it(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new ta(this.currentPoint.clone(),new it(t,e),new it(n,s),new it(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new rr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(t+c,e+u,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){let c=new Lr(t,e,n,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},cs=class i extends Jt{constructor(t=[new it(0,-.5),new it(.5,0),new it(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=ke(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],u=1/e,h=new P,f=new it,d=new P,g=new P,x=new P,p=0,m=0;for(let _=0;_<=t.length-1;_++)switch(_){case 0:p=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,d.x=m*1,d.y=-p,d.z=m*0,x.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(x.x,x.y,x.z);break;default:p=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,d.x=m*1,d.y=-p,d.z=m*0,g.copy(d),d.x+=x.x,d.y+=x.y,d.z+=x.z,d.normalize(),l.push(d.x,d.y,d.z),x.copy(g)}for(let _=0;_<=e;_++){let v=n+_*u*s,M=Math.sin(v),C=Math.cos(v);for(let w=0;w<=t.length-1;w++){h.x=t[w].x*M,h.y=t[w].y,h.z=t[w].x*C,o.push(h.x,h.y,h.z),f.x=_/e,f.y=w/(t.length-1),a.push(f.x,f.y);let S=l[3*w+0]*M,I=l[3*w+1],U=l[3*w+0]*C;c.push(S,I,U)}}for(let _=0;_<e;_++)for(let v=0;v<t.length-1;v++){let M=v+_*t.length,C=M,w=M+t.length,S=M+t.length+1,I=M+1;r.push(C,w,I),r.push(S,I,w)}this.setIndex(r),this.setAttribute("position",new Bt(o,3)),this.setAttribute("uv",new Bt(a,2)),this.setAttribute("normal",new Bt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}},us=class i extends cs{constructor(t=1,e=1,n=4,s=8){let r=new ls;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(n),s),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:n,radialSegments:s}}static fromJSON(t){return new i(t.radius,t.length,t.capSegments,t.radialSegments)}},Pn=class i extends Jt{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new P,u=new it;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=e;h++,f+=3){let d=n+h/e*s;c.x=t*Math.cos(d),c.y=t*Math.sin(d),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[f]/t+1)/2,u.y=(o[f+1]/t+1)/2,l.push(u.x,u.y)}for(let h=1;h<=e;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new Bt(o,3)),this.setAttribute("normal",new Bt(a,3)),this.setAttribute("uv",new Bt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ne=class i extends Jt{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],f=[],d=[],g=0,x=[],p=n/2,m=0;_(),o===!1&&(t>0&&v(!0),e>0&&v(!1)),this.setIndex(u),this.setAttribute("position",new Bt(h,3)),this.setAttribute("normal",new Bt(f,3)),this.setAttribute("uv",new Bt(d,2));function _(){let M=new P,C=new P,w=0,S=(e-t)/n;for(let I=0;I<=r;I++){let U=[],y=I/r,A=y*(e-t)+t;for(let O=0;O<=s;O++){let H=O/s,D=H*l+a,z=Math.sin(D),B=Math.cos(D);C.x=A*z,C.y=-y*n+p,C.z=A*B,h.push(C.x,C.y,C.z),M.set(z,S,B).normalize(),f.push(M.x,M.y,M.z),d.push(H,1-y),U.push(g++)}x.push(U)}for(let I=0;I<s;I++)for(let U=0;U<r;U++){let y=x[U][I],A=x[U+1][I],O=x[U+1][I+1],H=x[U][I+1];t>0&&(u.push(y,A,H),w+=3),e>0&&(u.push(A,O,H),w+=3)}c.addGroup(m,w,0),m+=w}function v(M){let C=g,w=new it,S=new P,I=0,U=M===!0?t:e,y=M===!0?1:-1;for(let O=1;O<=s;O++)h.push(0,p*y,0),f.push(0,y,0),d.push(.5,.5),g++;let A=g;for(let O=0;O<=s;O++){let D=O/s*l+a,z=Math.cos(D),B=Math.sin(D);S.x=U*B,S.y=p*y,S.z=U*z,h.push(S.x,S.y,S.z),f.push(0,y,0),w.x=z*.5+.5,w.y=B*.5*y+.5,d.push(w.x,w.y),g++}for(let O=0;O<s;O++){let H=C+O,D=A+O;M===!0?u.push(D,D+1,H):u.push(D+1,D,H),I+=3}c.addGroup(m,I,M===!0?1:2),m+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},mn=class i extends ne{constructor(t=1,e=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Hc=class i extends Jt{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),c(n),u(),this.setAttribute("position",new Bt(r,3)),this.setAttribute("normal",new Bt(r.slice(),3)),this.setAttribute("uv",new Bt(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(_){let v=new P,M=new P,C=new P;for(let w=0;w<e.length;w+=3)d(e[w+0],v),d(e[w+1],M),d(e[w+2],C),l(v,M,C,_)}function l(_,v,M,C){let w=C+1,S=[];for(let I=0;I<=w;I++){S[I]=[];let U=_.clone().lerp(M,I/w),y=v.clone().lerp(M,I/w),A=w-I;for(let O=0;O<=A;O++)O===0&&I===w?S[I][O]=U:S[I][O]=U.clone().lerp(y,O/A)}for(let I=0;I<w;I++)for(let U=0;U<2*(w-I)-1;U++){let y=Math.floor(U/2);U%2===0?(f(S[I][y+1]),f(S[I+1][y]),f(S[I][y])):(f(S[I][y+1]),f(S[I+1][y+1]),f(S[I+1][y]))}}function c(_){let v=new P;for(let M=0;M<r.length;M+=3)v.x=r[M+0],v.y=r[M+1],v.z=r[M+2],v.normalize().multiplyScalar(_),r[M+0]=v.x,r[M+1]=v.y,r[M+2]=v.z}function u(){let _=new P;for(let v=0;v<r.length;v+=3){_.x=r[v+0],_.y=r[v+1],_.z=r[v+2];let M=p(_)/2/Math.PI+.5,C=m(_)/Math.PI+.5;o.push(M,1-C)}g(),h()}function h(){for(let _=0;_<o.length;_+=6){let v=o[_+0],M=o[_+2],C=o[_+4],w=Math.max(v,M,C),S=Math.min(v,M,C);w>.9&&S<.1&&(v<.2&&(o[_+0]+=1),M<.2&&(o[_+2]+=1),C<.2&&(o[_+4]+=1))}}function f(_){r.push(_.x,_.y,_.z)}function d(_,v){let M=_*3;v.x=t[M+0],v.y=t[M+1],v.z=t[M+2]}function g(){let _=new P,v=new P,M=new P,C=new P,w=new it,S=new it,I=new it;for(let U=0,y=0;U<r.length;U+=9,y+=6){_.set(r[U+0],r[U+1],r[U+2]),v.set(r[U+3],r[U+4],r[U+5]),M.set(r[U+6],r[U+7],r[U+8]),w.set(o[y+0],o[y+1]),S.set(o[y+2],o[y+3]),I.set(o[y+4],o[y+5]),C.copy(_).add(v).add(M).divideScalar(3);let A=p(C);x(w,y+0,_,A),x(S,y+2,v,A),x(I,y+4,M,A)}}function x(_,v,M,C){C<0&&_.x===1&&(o[v]=_.x-1),M.x===0&&M.z===0&&(o[v]=C/2/Math.PI+.5)}function p(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}};var gn=class extends ls{constructor(t){super(t),this.uuid=pi(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new ls().fromJSON(s))}return this}},dv={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=yf(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,u,h,f,d;if(n&&(r=vv(i,t,r,e)),i.length>80*e){a=c=i[0],l=u=i[1];for(let g=e;g<s;g+=e)h=i[g],f=i[g+1],h<a&&(a=h),f<l&&(l=f),h>c&&(c=h),f>u&&(u=f);d=Math.max(c-a,u-l),d=d!==0?32767/d:0}return Ur(r,o,e,a,l,d,0),o}};function yf(i,t,e,n,s){let r,o;if(s===Cv(i,t,e,n)>0)for(r=t;r<e;r+=n)o=Vh(r,i[r],i[r+1],o);else for(r=e-n;r>=t;r-=n)o=Vh(r,i[r],i[r+1],o);return o&&pa(o,o.next)&&(Br(o),o=o.next),o}function hs(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(pa(e,e.next)||Re(e.prev,e,e.next)===0)){if(Br(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ur(i,t,e,n,s,r,o){if(!i)return;!o&&r&&Ev(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?mv(i,n,s,r):pv(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),Br(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=gv(hs(i),t,e),Ur(i,t,e,n,s,r,2)):o===2&&xv(i,t,e,n,s,r):Ur(hs(i),t,e,n,s,r,1);break}}}function pv(i){let t=i.prev,e=i,n=i.next;if(Re(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,u=s<r?s<o?s:o:r<o?r:o,h=a<l?a<c?a:c:l<c?l:c,f=s>r?s>o?s:o:r>o?r:o,d=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==t;){if(g.x>=u&&g.x<=f&&g.y>=h&&g.y<=d&&Ws(s,a,r,l,o,c,g.x,g.y)&&Re(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function mv(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Re(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,u=s.y,h=r.y,f=o.y,d=a<l?a<c?a:c:l<c?l:c,g=u<h?u<f?u:f:h<f?h:f,x=a>l?a>c?a:c:l>c?l:c,p=u>h?u>f?u:f:h>f?h:f,m=kc(d,g,t,e,n),_=kc(x,p,t,e,n),v=i.prevZ,M=i.nextZ;for(;v&&v.z>=m&&M&&M.z<=_;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=p&&v!==s&&v!==o&&Ws(a,u,l,h,c,f,v.x,v.y)&&Re(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=d&&M.x<=x&&M.y>=g&&M.y<=p&&M!==s&&M!==o&&Ws(a,u,l,h,c,f,M.x,M.y)&&Re(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=m;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=p&&v!==s&&v!==o&&Ws(a,u,l,h,c,f,v.x,v.y)&&Re(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=_;){if(M.x>=d&&M.x<=x&&M.y>=g&&M.y<=p&&M!==s&&M!==o&&Ws(a,u,l,h,c,f,M.x,M.y)&&Re(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function gv(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!pa(s,r)&&_f(s,n,n.next,r)&&Nr(s,r)&&Nr(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Br(n),Br(n.next),n=i=r),n=n.next}while(n!==i);return hs(n)}function xv(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&wv(o,a)){let l=Mf(o,a);o=hs(o,o.next),l=hs(l,l.next),Ur(o,t,e,n,s,r,0),Ur(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function vv(i,t,e,n){let s=[],r,o,a,l,c;for(r=0,o=t.length;r<o;r++)a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=yf(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(bv(c));for(s.sort(yv),r=0;r<s.length;r++)e=_v(s[r],e);return e}function yv(i,t){return i.x-t.x}function _v(i,t){let e=Mv(i,t);if(!e)return t;let n=Mf(e,i);return hs(n,n.next),hs(e,e.next)}function Mv(i,t){let e=t,n=-1/0,s,r=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){let f=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=r&&f>n&&(n=f,s=e.x<e.next.x?e:e.next,f===r))return s}e=e.next}while(e!==t);if(!s)return null;let a=s,l=s.x,c=s.y,u=1/0,h;e=s;do r>=e.x&&e.x>=l&&r!==e.x&&Ws(o<c?r:n,o,l,c,o<c?n:r,o,e.x,e.y)&&(h=Math.abs(o-e.y)/(r-e.x),Nr(e,i)&&(h<u||h===u&&(e.x>s.x||e.x===s.x&&Av(s,e)))&&(s=e,u=h)),e=e.next;while(e!==a);return s}function Av(i,t){return Re(i.prev,i,t.prev)<0&&Re(t.next,i,i.next)<0}function Ev(i,t,e,n){let s=i;do s.z===0&&(s.z=kc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Sv(s)}function Sv(i){let t,e,n,s,r,o,a,l,c=1;do{for(e=i,i=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,c*=2}while(o>1);return i}function kc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function bv(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Ws(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function wv(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Tv(i,t)&&(Nr(i,t)&&Nr(t,i)&&Rv(i,t)&&(Re(i.prev,i,t.prev)||Re(i,t.prev,t))||pa(i,t)&&Re(i.prev,i,i.next)>0&&Re(t.prev,t,t.next)>0)}function Re(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function pa(i,t){return i.x===t.x&&i.y===t.y}function _f(i,t,e,n){let s=Co(Re(i,t,e)),r=Co(Re(i,t,n)),o=Co(Re(e,n,i)),a=Co(Re(e,n,t));return!!(s!==r&&o!==a||s===0&&Ro(i,e,t)||r===0&&Ro(i,n,t)||o===0&&Ro(e,i,n)||a===0&&Ro(e,t,n))}function Ro(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Co(i){return i>0?1:i<0?-1:0}function Tv(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&_f(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Nr(i,t){return Re(i.prev,i,i.next)<0?Re(i,t,i.next)>=0&&Re(i,i.prev,t)>=0:Re(i,t,i.prev)<0||Re(i,i.next,t)<0}function Rv(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Mf(i,t){let e=new Vc(i.i,i.x,i.y),n=new Vc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Vh(i,t,e,n){let s=new Vc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Br(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Vc(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Cv(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Li=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Gh(t),Wh(n,t);let o=t.length;e.forEach(Gh);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,Wh(n,e[l]);let a=dv.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Gh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Wh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var vi=class i extends Jt{constructor(t=new gn([new it(.5,.5),new it(-.5,.5),new it(-.5,-.5),new it(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new Bt(s,3)),this.setAttribute("uv",new Bt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,u=e.steps!==void 0?e.steps:1,h=e.depth!==void 0?e.depth:1,f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:d-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,_=e.UVGenerator!==void 0?e.UVGenerator:Pv,v,M=!1,C,w,S,I;m&&(v=m.getSpacedPoints(u),M=!0,f=!1,C=m.computeFrenetFrames(u,!1),w=new P,S=new P,I=new P),f||(p=0,d=0,g=0,x=0);let U=a.extractPoints(c),y=U.shape,A=U.holes;if(!Li.isClockWise(y)){y=y.reverse();for(let ot=0,L=A.length;ot<L;ot++){let pt=A[ot];Li.isClockWise(pt)&&(A[ot]=pt.reverse())}}let H=Li.triangulateShape(y,A),D=y;for(let ot=0,L=A.length;ot<L;ot++){let pt=A[ot];y=y.concat(pt)}function z(ot,L,pt){return L||console.error("THREE.ExtrudeGeometry: vec does not exist"),ot.clone().addScaledVector(L,pt)}let B=y.length,k=H.length;function F(ot,L,pt){let ft,ut,yt,Ut=ot.x-L.x,bt=ot.y-L.y,b=pt.x-ot.x,E=pt.y-ot.y,G=Ut*Ut+bt*bt,$=Ut*E-bt*b;if(Math.abs($)>Number.EPSILON){let tt=Math.sqrt(G),Z=Math.sqrt(b*b+E*E),Pt=L.x-bt/tt,xt=L.y+Ut/tt,lt=pt.x-E/Z,_t=pt.y+b/Z,K=((lt-Pt)*E-(_t-xt)*b)/(Ut*E-bt*b);ft=Pt+Ut*K-ot.x,ut=xt+bt*K-ot.y;let Mt=ft*ft+ut*ut;if(Mt<=2)return new it(ft,ut);yt=Math.sqrt(Mt/2)}else{let tt=!1;Ut>Number.EPSILON?b>Number.EPSILON&&(tt=!0):Ut<-Number.EPSILON?b<-Number.EPSILON&&(tt=!0):Math.sign(bt)===Math.sign(E)&&(tt=!0),tt?(ft=-bt,ut=Ut,yt=Math.sqrt(G)):(ft=Ut,ut=bt,yt=Math.sqrt(G/2))}return new it(ft/yt,ut/yt)}let q=[];for(let ot=0,L=D.length,pt=L-1,ft=ot+1;ot<L;ot++,pt++,ft++)pt===L&&(pt=0),ft===L&&(ft=0),q[ot]=F(D[ot],D[pt],D[ft]);let et=[],Y,at=q.concat();for(let ot=0,L=A.length;ot<L;ot++){let pt=A[ot];Y=[];for(let ft=0,ut=pt.length,yt=ut-1,Ut=ft+1;ft<ut;ft++,yt++,Ut++)yt===ut&&(yt=0),Ut===ut&&(Ut=0),Y[ft]=F(pt[ft],pt[yt],pt[Ut]);et.push(Y),at=at.concat(Y)}for(let ot=0;ot<p;ot++){let L=ot/p,pt=d*Math.cos(L*Math.PI/2),ft=g*Math.sin(L*Math.PI/2)+x;for(let ut=0,yt=D.length;ut<yt;ut++){let Ut=z(D[ut],q[ut],ft);gt(Ut.x,Ut.y,-pt)}for(let ut=0,yt=A.length;ut<yt;ut++){let Ut=A[ut];Y=et[ut];for(let bt=0,b=Ut.length;bt<b;bt++){let E=z(Ut[bt],Y[bt],ft);gt(E.x,E.y,-pt)}}}let Dt=g+x;for(let ot=0;ot<B;ot++){let L=f?z(y[ot],at[ot],Dt):y[ot];M?(S.copy(C.normals[0]).multiplyScalar(L.x),w.copy(C.binormals[0]).multiplyScalar(L.y),I.copy(v[0]).add(S).add(w),gt(I.x,I.y,I.z)):gt(L.x,L.y,0)}for(let ot=1;ot<=u;ot++)for(let L=0;L<B;L++){let pt=f?z(y[L],at[L],Dt):y[L];M?(S.copy(C.normals[ot]).multiplyScalar(pt.x),w.copy(C.binormals[ot]).multiplyScalar(pt.y),I.copy(v[ot]).add(S).add(w),gt(I.x,I.y,I.z)):gt(pt.x,pt.y,h/u*ot)}for(let ot=p-1;ot>=0;ot--){let L=ot/p,pt=d*Math.cos(L*Math.PI/2),ft=g*Math.sin(L*Math.PI/2)+x;for(let ut=0,yt=D.length;ut<yt;ut++){let Ut=z(D[ut],q[ut],ft);gt(Ut.x,Ut.y,h+pt)}for(let ut=0,yt=A.length;ut<yt;ut++){let Ut=A[ut];Y=et[ut];for(let bt=0,b=Ut.length;bt<b;bt++){let E=z(Ut[bt],Y[bt],ft);M?gt(E.x,E.y+v[u-1].y,v[u-1].x+pt):gt(E.x,E.y,h+pt)}}}j(),rt();function j(){let ot=s.length/3;if(f){let L=0,pt=B*L;for(let ft=0;ft<k;ft++){let ut=H[ft];Ft(ut[2]+pt,ut[1]+pt,ut[0]+pt)}L=u+p*2,pt=B*L;for(let ft=0;ft<k;ft++){let ut=H[ft];Ft(ut[0]+pt,ut[1]+pt,ut[2]+pt)}}else{for(let L=0;L<k;L++){let pt=H[L];Ft(pt[2],pt[1],pt[0])}for(let L=0;L<k;L++){let pt=H[L];Ft(pt[0]+B*u,pt[1]+B*u,pt[2]+B*u)}}n.addGroup(ot,s.length/3-ot,0)}function rt(){let ot=s.length/3,L=0;dt(D,L),L+=D.length;for(let pt=0,ft=A.length;pt<ft;pt++){let ut=A[pt];dt(ut,L),L+=ut.length}n.addGroup(ot,s.length/3-ot,1)}function dt(ot,L){let pt=ot.length;for(;--pt>=0;){let ft=pt,ut=pt-1;ut<0&&(ut=ot.length-1);for(let yt=0,Ut=u+p*2;yt<Ut;yt++){let bt=B*yt,b=B*(yt+1),E=L+ft+bt,G=L+ut+bt,$=L+ut+b,tt=L+ft+b;Et(E,G,$,tt)}}}function gt(ot,L,pt){l.push(ot),l.push(L),l.push(pt)}function Ft(ot,L,pt){Vt(ot),Vt(L),Vt(pt);let ft=s.length/3,ut=_.generateTopUV(n,s,ft-3,ft-2,ft-1);Tt(ut[0]),Tt(ut[1]),Tt(ut[2])}function Et(ot,L,pt,ft){Vt(ot),Vt(L),Vt(ft),Vt(L),Vt(pt),Vt(ft);let ut=s.length/3,yt=_.generateSideWallUV(n,s,ut-6,ut-3,ut-2,ut-1);Tt(yt[0]),Tt(yt[1]),Tt(yt[3]),Tt(yt[1]),Tt(yt[2]),Tt(yt[3])}function Vt(ot){s.push(l[ot*3+0]),s.push(l[ot*3+1]),s.push(l[ot*3+2])}function Tt(ot){r.push(ot.x),r.push(ot.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Iv(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new zc[s.type]().fromJSON(s)),new i(n,t.options)}},Pv={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],u=t[s*3+1];return[new it(r,o),new it(a,l),new it(c,u)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],u=t[n*3+1],h=t[n*3+2],f=t[s*3],d=t[s*3+1],g=t[s*3+2],x=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new it(o,1-l),new it(c,1-h),new it(f,1-g),new it(x,1-m)]:[new it(a,1-l),new it(u,1-h),new it(d,1-g),new it(p,1-m)]}};function Iv(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var fs=class i extends Hc{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var ds=class i extends Jt{constructor(t=new gn([new it(0,.5),new it(-.5,-.5),new it(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let n=[],s=[],r=[],o=[],a=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let u=0;u<t.length;u++)c(t[u]),this.addGroup(a,l,u),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Bt(s,3)),this.setAttribute("normal",new Bt(r,3)),this.setAttribute("uv",new Bt(o,2));function c(u){let h=s.length/3,f=u.extractPoints(e),d=f.shape,g=f.holes;Li.isClockWise(d)===!1&&(d=d.reverse());for(let p=0,m=g.length;p<m;p++){let _=g[p];Li.isClockWise(_)===!0&&(g[p]=_.reverse())}let x=Li.triangulateShape(d,g);for(let p=0,m=g.length;p<m;p++){let _=g[p];d=d.concat(_)}for(let p=0,m=d.length;p<m;p++){let _=d[p];s.push(_.x,_.y,0),r.push(0,0,1),o.push(_.x,_.y)}for(let p=0,m=x.length;p<m;p++){let _=x[p],v=_[0]+h,M=_[1]+h,C=_[2]+h;n.push(v,M,C),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return Fv(e,t)}static fromJSON(t,e){let n=[];for(let s=0,r=t.shapes.length;s<r;s++){let o=e[t.shapes[s]];n.push(o)}return new i(n,t.curveSegments)}};function Fv(i,t){if(t.shapes=[],Array.isArray(i))for(let e=0,n=i.length;e<n;e++){let s=i[e];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t}var Fe=class i extends Jt{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],h=new P,f=new P,d=[],g=[],x=[],p=[];for(let m=0;m<=n;m++){let _=[],v=m/n,M=0;m===0&&o===0?M=.5/e:m===n&&l===Math.PI&&(M=-.5/e);for(let C=0;C<=e;C++){let w=C/e;h.x=-t*Math.cos(s+w*r)*Math.sin(o+v*a),h.y=t*Math.cos(o+v*a),h.z=t*Math.sin(s+w*r)*Math.sin(o+v*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),x.push(f.x,f.y,f.z),p.push(w+M,1-v),_.push(c++)}u.push(_)}for(let m=0;m<n;m++)for(let _=0;_<e;_++){let v=u[m][_+1],M=u[m][_],C=u[m+1][_],w=u[m+1][_+1];(m!==0||o>0)&&d.push(v,M,w),(m!==n-1||l<Math.PI)&&d.push(M,C,w)}this.setIndex(d),this.setAttribute("position",new Bt(g,3)),this.setAttribute("normal",new Bt(x,3)),this.setAttribute("uv",new Bt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Wn=class i extends Jt{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],c=[],u=new P,h=new P,f=new P;for(let d=0;d<=n;d++)for(let g=0;g<=s;g++){let x=g/s*r,p=d/n*Math.PI*2;h.x=(t+e*Math.cos(p))*Math.cos(x),h.y=(t+e*Math.cos(p))*Math.sin(x),h.z=e*Math.sin(p),a.push(h.x,h.y,h.z),u.x=t*Math.cos(x),u.y=t*Math.sin(x),f.subVectors(h,u).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(d/n)}for(let d=1;d<=n;d++)for(let g=1;g<=s;g++){let x=(s+1)*d+g-1,p=(s+1)*(d-1)+g-1,m=(s+1)*(d-1)+g,_=(s+1)*d+g;o.push(x,p,_),o.push(p,m,_)}this.setIndex(o),this.setAttribute("position",new Bt(a,3)),this.setAttribute("normal",new Bt(l,3)),this.setAttribute("uv",new Bt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var ia=class extends oe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},zr=class extends gi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new nt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new nt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=lf,this.normalScale=new it(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Or=class extends zr{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new it(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ke(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new nt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new nt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new nt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};function Po(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Dv(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var or=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Gc=class extends or{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Wu,endingEnd:Wu}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Xu:r=t,a=2*e-n;break;case qu:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Xu:o=t,l=2*n-e;break;case qu:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(n-e)/(s-e),x=g*g,p=x*g,m=-f*p+2*f*x-f*g,_=(1+f)*p+(-1.5-2*f)*x+(-.5+f)*g+1,v=(-1-d)*p+(1.5+d)*x+.5*g,M=d*p-d*x;for(let C=0;C!==a;++C)r[C]=m*o[u+C]+_*o[c+C]+v*o[l+C]+M*o[h+C];return r}},Wc=class extends or{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=(n-e)/(s-e),h=1-u;for(let f=0;f!==a;++f)r[f]=o[c+f]*h+o[l+f]*u;return r}},Xc=class extends or{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Xn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Po(e,this.TimeBufferType),this.values=Po(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Po(t.times,Array),values:Po(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Xc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Wc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Gc(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Bo:e=this.InterpolantFactoryMethodDiscrete;break;case fc:e=this.InterpolantFactoryMethodLinear;break;case Ya:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Bo;case this.InterpolantFactoryMethodLinear:return fc;case this.InterpolantFactoryMethodSmooth:return Ya}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&Dv(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ya,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],u=t[a+1];if(c!==u&&(a!==1||c!==t[0]))if(s)l=!0;else{let h=a*n,f=h-n,d=h+n;for(let g=0;g!==n;++g){let x=e[h+g];if(x!==e[f+g]||x!==e[d+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let h=a*n,f=o*n;for(let d=0;d!==n;++d)e[f+d]=e[h+d]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Xn.prototype.TimeBufferType=Float32Array;Xn.prototype.ValueBufferType=Float32Array;Xn.prototype.DefaultInterpolation=fc;var ps=class extends Xn{constructor(t,e,n){super(t,e,n)}};ps.prototype.ValueTypeName="bool";ps.prototype.ValueBufferType=Array;ps.prototype.DefaultInterpolation=Bo;ps.prototype.InterpolantFactoryMethodLinear=void 0;ps.prototype.InterpolantFactoryMethodSmooth=void 0;var qc=class extends Xn{};qc.prototype.ValueTypeName="color";var Yc=class extends Xn{};Yc.prototype.ValueTypeName="number";var Zc=class extends or{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let u=c+a;c!==u;c+=4)Xe.slerpFlat(r,0,o,c-a,o,c,l);return r}},sa=class extends Xn{InterpolantFactoryMethodLinear(t){return new Zc(this.times,this.values,this.getValueSize(),t)}};sa.prototype.ValueTypeName="quaternion";sa.prototype.InterpolantFactoryMethodSmooth=void 0;var ms=class extends Xn{constructor(t,e,n){super(t,e,n)}};ms.prototype.ValueTypeName="string";ms.prototype.ValueBufferType=Array;ms.prototype.DefaultInterpolation=Bo;ms.prototype.InterpolantFactoryMethodLinear=void 0;ms.prototype.InterpolantFactoryMethodSmooth=void 0;var Jc=class extends Xn{};Jc.prototype.ValueTypeName="vector";var Kc=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,f=c.length;h<f;h+=2){let d=c[h],g=c[h+1];if(d.global&&(d.lastIndex=0),d.test(u))return g}return null}}},Lv=new Kc,Qc=class{constructor(t){this.manager=t!==void 0?t:Lv,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};Qc.DEFAULT_MATERIAL_NAME="__DEFAULT";var Hr=class extends qe{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new nt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},ra=class extends Hr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(qe.DEFAULT_UP),this.updateMatrix(),this.groundColor=new nt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},Tl=new Yt,Xh=new P,qh=new P,oa=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new it(512,512),this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ir,this._frameExtents=new it(1,1),this._viewportCount=1,this._viewports=[new ae(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;Xh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Xh),qh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(qh),e.updateMatrixWorld(),Tl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Tl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Tl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var Yh=new Yt,br=new P,Rl=new P,jc=class extends oa{constructor(){super(new Ve(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new it(4,2),this._viewportCount=6,this._viewports=[new ae(2,1,1,1),new ae(0,1,1,1),new ae(3,1,1,1),new ae(1,1,1,1),new ae(3,0,1,1),new ae(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(t,e=0){let n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),br.setFromMatrixPosition(t.matrixWorld),n.position.copy(br),Rl.copy(n.position),Rl.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Rl),n.updateMatrixWorld(),s.makeTranslation(-br.x,-br.y,-br.z),Yh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yh)}},aa=class extends Hr{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new jc}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},$c=class extends oa{constructor(){super(new nr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},la=class extends Hr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qe.DEFAULT_UP),this.updateMatrix(),this.target=new qe,this.shadow=new $c}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var ca=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Zh(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=Zh();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function Zh(){return performance.now()}var yu="\\[\\]\\.:\\/",Uv=new RegExp("["+yu+"]","g"),_u="[^"+yu+"]",Nv="[^"+yu.replace("\\.","")+"]",Bv=/((?:WC+[\/:])*)/.source.replace("WC",_u),zv=/(WCOD+)?/.source.replace("WCOD",Nv),Ov=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",_u),Hv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",_u),kv=new RegExp("^"+Bv+zv+Ov+Hv+"$"),Vv=["material","materials","bones","map"],tu=class{constructor(t,e,n){let s=n||we.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},we=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Uv,"")}static parseTrackName(t){let e=kv.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Vv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};we.Composite=tu;we.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};we.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};we.prototype.GetterByBindingType=[we.prototype._getValue_direct,we.prototype._getValue_array,we.prototype._getValue_arrayElement,we.prototype._getValue_toArray];we.prototype.SetterByBindingTypeAndVersioning=[[we.prototype._setValue_direct,we.prototype._setValue_direct_setNeedsUpdate,we.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[we.prototype._setValue_array,we.prototype._setValue_array_setNeedsUpdate,we.prototype._setValue_array_setMatrixWorldNeedsUpdate],[we.prototype._setValue_arrayElement,we.prototype._setValue_arrayElement_setNeedsUpdate,we.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[we.prototype._setValue_fromArray,we.prototype._setValue_fromArray_setNeedsUpdate,we.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wy=new Float32Array(1);typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:eu}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=eu);function In(i,t=!1){let e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Jt,c=0;for(let u=0;u<i.length;++u){let h=i[u],f=0;if(e!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in h.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(h.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in h.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(h.morphAttributes[d])}if(t){let d;if(e)d=h.index.count;else if(h.attributes.position!==void 0)d=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,u),c+=d}}if(e){let u=0,h=[];for(let f=0;f<i.length;++f){let d=i[f].index;for(let g=0;g<d.count;++g)h.push(d.getX(g)+u);u+=i[f].attributes.position.count}l.setIndex(h)}for(let u in r){let h=Af(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let f=0;f<h;++f){let d=[];for(let x=0;x<o[u].length;++x)d.push(o[u][x][f]);let g=Af(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function Af(i){let t,e,n,s=-1,r=0;for(let c=0;c<i.length;++c){let u=i[c];if(t===void 0&&(t=u.array.constructor),t!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=u.itemSize),e!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.count*e}let o=new t(r),a=new ue(o,e,n),l=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute){let h=l/e;for(let f=0,d=u.count;f<d;f++)for(let g=0;g<e;g++){let x=u.getComponent(f,g);a.setComponent(f+h,g,x)}}else o.set(u.array,l);l+=u.count*e}return s!==void 0&&(a.gpuType=s),a}function ie(i){let t=i>>>0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var Ef=new Xe,Sf=new nn,bf=new P,wf=new P;function T(i=0,t=0,e=0,n=0,s=1,r=s,o=s,a=0,l=0){return Sf.set(a,n,l,"YXZ"),Ef.setFromEuler(Sf),bf.set(i,t,e),wf.set(s,r,o),new Yt().compose(bf,Ef,wf)}var $n=new P,ln=new P;function Gv(i,t,e=1,n=[0,0]){let s=i.attributes.position,r=i.attributes.normal,o=i.attributes.uv;for(let a=0;a<s.count;a++){ln.fromBufferAttribute(s,a),$n.fromBufferAttribute(r,a);let l,c;if(t==="slope"){let u=$n.x,h=$n.z,f=Math.hypot(u,h);if(f<.08||$n.y<.05)l=ln.x+ln.z,c=ln.y;else{let d=u/f,g=h/f,x=-f/Math.max(.1,$n.y),p=Math.hypot(1,x);l=-g*ln.x+d*ln.z,c=(d*ln.x+x*ln.y+g*ln.z)/p}}else{let u=Math.abs($n.x),h=Math.abs($n.y),f=Math.abs($n.z);h>=u&&h>=f?(l=ln.x,c=ln.z):u>=f?(l=ln.z*Math.sign($n.x||1),c=ln.y):(l=-ln.x*Math.sign($n.z||1),c=ln.y)}o.setXY(a,l*e+n[0],c*e+n[1])}o.needsUpdate=!0}function Vr(i){return i instanceof nt?i:new nt(i===void 0?16777215:i)}var xn=class{constructor(t,e={}){this.mats=t,this.groups=new Map,this.opts=e}add(t,e,n,s,r){let o=new Jt;o.setAttribute("position",t.attributes.position.clone()),t.attributes.normal&&o.setAttribute("normal",t.attributes.normal.clone()),t.attributes.uv&&o.setAttribute("uv",t.attributes.uv.clone()),t.index&&o.setIndex(t.index.clone());let a=o.attributes.position.count;if(!o.index){let u=new(a>65535?Uint32Array:Uint16Array)(a);for(let h=0;h<a;h++)u[h]=h;o.setIndex(new ue(u,1))}if(o.attributes.normal||o.computeVertexNormals(),o.attributes.uv||o.setAttribute("uv",new ue(new Float32Array(a*2),2)),n&&o.applyMatrix4(n),r&&Gv(o,r.mode||"box",r.s||1,r.off),this.mats.spec(e).vc){let u=new Float32Array(a*3);if(typeof s=="function"){let h=o.attributes.position,f=o.attributes.normal,d=new P,g=new P;for(let x=0;x<a;x++){let p=Vr(s(d.fromBufferAttribute(h,x),g.fromBufferAttribute(f,x),x));u[x*3]=p.r,u[x*3+1]=p.g,u[x*3+2]=p.b}}else{let h=Vr(s);for(let f=0;f<a;f++)u[f*3]=h.r,u[f*3+1]=h.g,u[f*3+2]=h.b}o.setAttribute("color",new ue(u,3))}let c=this.groups.get(e);return c||(c=[],this.groups.set(e,c)),c.push(o),o}build(t){let e=[];for(let[n,s]of this.groups){if(!s.length)continue;let r=s.length===1?s[0]:In(s,!1);if(!r){console.warn("merge fallito",n);continue}s.length>1&&s.forEach(l=>l.dispose()),r.computeBoundingSphere(),r.computeBoundingBox();let o=new jt(r,this.mats.get(n)),a=this.mats.spec(n);o.castShadow=!this.opts.noCast&&a.cast!==!1,o.receiveShadow=!this.opts.noReceive&&a.receive!==!1,o.name=(this.opts.name||"batch")+":"+n,this.opts.layer!==void 0&&o.layers.set(this.opts.layer),t.add(o),e.push(o)}return this.groups.clear(),e}},ma=class{constructor(t,e={}){this.mats=t,this.kinds=new Map,this.opts=e}define(t,e){for(let n of e)if(this.mats.spec(n.key).vc&&!n.geo.attributes.color){let r=n.geo,o=r.attributes.position.count,a=new Float32Array(o*3),l=new P,c=new P;for(let u=0;u<o;u++){let h=typeof n.color=="function"?Vr(n.color(l.fromBufferAttribute(r.attributes.position,u),c.fromBufferAttribute(r.attributes.normal,u),u)):Vr(n.color);a[u*3]=h.r,a[u*3+1]=h.g,a[u*3+2]=h.b}r.setAttribute("color",new ue(a,3))}this.kinds.set(t,{parts:e,items:[]})}add(t,e,n){let s=this.kinds.get(t);if(!s)throw new Error("tipo sconosciuto: "+t);s.items.push({m:e,color:n===void 0?null:Vr(n)})}build(t){let e={};for(let[n,s]of this.kinds)if(s.items.length){e[n]=[];for(let r of s.parts){let o=this.mats.get(r.key),a=new sn(r.geo,o,s.items.length),l=this.mats.spec(r.key),c=r.tint!==!1&&s.items.some(h=>h.color),u=new nt(1,1,1);s.items.forEach((h,f)=>{a.setMatrixAt(f,r.m?h.m.clone().multiply(r.m):h.m),c&&a.setColorAt(f,h.color||u)}),a.instanceMatrix.needsUpdate=!0,a.instanceColor&&(a.instanceColor.needsUpdate=!0),a.castShadow=r.cast!==void 0?r.cast:l.cast!==!1&&!this.opts.noCast,a.receiveShadow=l.receive!==!1,a.computeBoundingSphere(),a.name="inst:"+n,this.opts.layer!==void 0&&a.layers.set(this.opts.layer),t.add(a),e[n].push(a)}}return e}};function cn(i=1){let t=ie(i),e=new Uint8Array(512),n=Array.from({length:256},(o,a)=>a);for(let o=255;o>0;o--){let a=Math.floor(t()*(o+1));[n[o],n[a]]=[n[a],n[o]]}for(let o=0;o<512;o++)e[o]=n[o&255];let s=Array.from({length:256},()=>t()*2-1),r=o=>o*o*(3-2*o);return(o,a)=>{let l=Math.floor(o),c=Math.floor(a),u=o-l,h=a-c,f=(x,p)=>s[e[e[l+x&255]+c+p&255]],d=r(u),g=r(h);return(f(0,0)*(1-d)+f(1,0)*d)*(1-g)+(f(0,1)*(1-d)+f(1,1)*d)*g}}function ti(i,t,e,n=4){let s=0,r=1,o=.5;for(let a=0;a<n;a++)s+=i(t*r,e*r)*o,r*=2.03,o*=.5;return s}var Gi=(i,t,e)=>i+(t-i)*e,Ze=(i,t,e)=>Math.max(t,Math.min(e,i)),ga=i=>i*i*(3-2*i);var yi=()=>new Promise(i=>requestAnimationFrame(()=>i()));var Tf="iVBORw0KGgoAAAANSUhEUgAAA5cAAAHFCAYAAABmTA0wAAAztklEQVR4nO3dT3IbV5o+6rc6engjhF6BUBH3jo1ageAVmLUCo1ZQrBUUvIKiV1DQCppeQUMrKGj+i2hwdodgxJ37Do5QpGWJIgkkvvzzPBEMySIFvKZ4kOfNczLxh19//TUAAABwiv+oDgAAAMDwKZcAAACcTLkEAADgZMolAAAAJ1MuAQAAONl/XvC5ZkkWL/j6XZJDBzkAAAA4sy7L5TzJVZLlp483r3iM+yTbTx+3SfYnpwIAAODs/tDB+1yuPn28O/cDJ/mQZPPpAwAAgJ44Z7lcJVkneXuuB3zC3afn2lzguQAAAPiGc5TLRZKbdLNS+S0fklynXZ8JAABAkVPvFrtKux6yoljm0/NuP+UAAACgyCkrl5skP54vysneR8kEAAAo8dqVy036VSyTlmdTHQIAAGCKXlMuN+lfsTxSMAEAAAq8tFzepL/F8ujHtJwAAABcyEuuubxK8t/dRTm7Pye5rQ4BAAAwBc8tl7Mk+yRvugxzZvdJ5kkOtTEAAADG77nbYm8yrGKZtLyb6hAAAABT8JyVy2WS/+k+Sme+T3svTAAAADrynJXLddchOrauDgAAADB231q5nCf538tE6dQf064ZBQAAoAPfWrm8vkSIC7iuDgAAADBm31q53Cd5e5konbpLW4UFAACgA0+tXC4yjmKZtP+PRXUIAACAsXqqXC4vFeJCltUBAAAAxupbK5djsqwOAAAAMFZPlcv5pUJcyKw6AAAAwFg9dUOfJ+/0M1B/qA4AAAAwRt96KxIAAAD4JuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAkymXAAAAnEy5BAAA4GTKJQAAACdTLgEAADiZcgkAAMDJlEsAAABOplwCAABwMuUSAACAk02tXC6qAwAAAIzR1MrlsjoAAADAGP3h119//drnvvqJAbtLW7081MYAAAAYl6mtXL5NclMdAgAAYGymVi6T5Mckt0lmtTEAAADGY2rbYh+7TyuZ2yT7yiAFttUBGLz5p4/n2MVWdJ5vkeed/Duk/WxNxTzGHN1YxJj7knmeP+a4rH2mN3cfjCmXSx58zMNEZPfp94dHv99dOhC9s0xylTYJefeKv3+f9nO0TTupsztDJoZvlvZztfz08fYVj3GX9nO1TfvZOpycqh+WMeY4v1mMua9Z5rQxR53jPPaQ385dj79yQcolz3WcqOw/fWzjzNHYzZNcpx1sXzMBecpdkk3aNdCHMz82/XeVZJXkhw4e+5e0n63bDh67a/MYc3TjKt2OuZsMc1fUPG3MrZK8qQxCpz6mzVd3jz72VWHGTrnkHD7ktwN2VxeFM5gnWaddn9y1+7RJyU1MeKfgKu3f+tzF6Uvu0iaNtxd4rlPNY8zRjatcdsytMoySOc/lxhz9dJ/2s7rLw0o8Z6Bc0gUDdriu0w64lz6De//puTcXfl4uY572b1ux1exD2oR3X/Dcz7FO+9mvGHOrDKN883LzGHNfs07NmKP/PuThfiy7yiBDplxyKb/koWjuKoPwRbO0F9Tq60x+SZuUHGpjcEartJWTyolcH09ezGLM0Y1V+jHmVunXyYt5Wp7vamMwEMdri2/Tr5/j3lMuqXCXhzNDt5VBSNJuXrBNf87ifkyblOxqY3AGN0n+Wh3ikZ/TSma1RYw5urFJv7Z6GnOMwfEdJo4fPEG5pJoBW2uRfh5w79Pu3LerjcEJNunXJPfofVqRqrKIMUc3NjHmvmSRfo45huk+DzdH21cG6Svlkj45Fs2bmOBcwiL9PuCa7A7XJv2c5B5VTXYXMeboxibG3Jcs0u8xx7B9SBt7m9oY/aJc0ld3aSVzE9cCdWGeNoHs+wH3Lm1ycKiNwQusk/y9OsQz/JSW9VIWGcYk92NawTzUxuAFbtKv7edfY8wxVt7q6RHlkiF4H6uZ57bLcG5q8CFtskv/XSX57+oQL/DnXGY7/ixtkmvMcW5XGdaY+z6XuYP8LMMac4zDcQfeOhPeMvsf1QHgGX5M8q+0A8WqNMk43GRYB9x36ccNIXjaLMPbGrRJy921dYw5zm+W4Y252xhzjNebtDnr/6aNzXllmCpWLhmiu7QDx6Y2xiAt0or60NynZd/XxuAJm/T7mq+v6fpasEWMObqxyTDHXNd3kF0m+Z8OHx9e4ue0OeuhNsblKJcMmZL5ctvUv6/ea1XfcZCvW2bYk7k/pbtt99sYc5zfMsMec39MdycuthnumGOc7tN2ja1rY1yGcskYKJnPs8ywJyNJtxMSXu82yQ/VIU7wS9q1a+e2jDFHN7YZdoHq6sTFMsMfc4zXXdqq/W1tjG655pIxeJvkn2krD8vSJP12XR3gDNbVAfideYZdLJOWf97B41538JiXtq4OwO/MM+ximbTtvPMOHnfdwWPCubxNuwHXbUZ8PaZyyZh8l3bGcpsRD9pXmmf4BSDpZnWJ01xXBziT6zM/3jzGHN24rg5wJtdnfrx5hl+6mYYf0hZErmtjdEO5ZIzepd2pa53L3JVuCK6qA5zJm4zn/2UsrqoDnMlVzx+vijHXP1fVAc7kquePB116k+QfGeGCiHLJmP09tsoeXVUHOKOr6gD82yJtm88YvE37/zmXqzM+VrWr6gD82yLG3NdcnfGx4FLepc1VV7Uxzke5ZOzepm2Vvcm0VzHHtFVoWR2Af1tWBziz5Rkfy5ijC8vqAGe2PONjjWnMMS1v0u4dcpsRzFWVS6bir5nuKuayOsCZvc0IXnxHYlEd4MwWZ3qc5Zkepy+Muf5YVgc4s8WZHmd5pseBSsdrMRe1MU6jXDIlj1cxp2ReHaADi+oAJBnfz9a8Z4/TJ4vqACQZX8mf9+xxoNrbJP/KgLfJKpdM0XEVc1Eb42Lm1QE6MK8OQJLxbUM71//P/EyP0yez6gAkGd+YW5zpceZnehzoi39moO/frlwyVd+l3aFrVRuDV5pXB4CJWVQHYJTeVAeAHvsxba46q43xMsolU3a8gPqmOAcAAHzuXVrBXNTGeD7lEto22W0GdmYIAIDRO+62W9TGeB7lEprBnRkCAGAS3mQg81TlEh4M6swQAACTcSyYq9oYT1Mu4bcGMXABAJic4/1CVsU5vkq5hN/r/cAFAGCyejtPVS7h63o7cAEAmLR/JrmqDvE55RKepmACANBHm/TsXiHKJXybggkAQN/07i6yyiU8j4IJAEDfHAvmrDZGo1zC8ymYAAD0TW8KpnIJL9PLi6cBAJi079KuwSylXMLLbdKjve0AAJDkhyQ3lQGUS3i549aDeW0MAAD4jb+m8DIu5RJe502S2/RgbzsAADxyk6JddsolvN53Kd56AAAAn3mTdhnX7NJPrFzCaX5Mcl0dAgAAHilZBFEu4XT/SLKsDgEAAI/8mAu/y4FyCedxG9dfAgDQL5tc8CaUyiWcx/EGPwAA0BfH6y8vQrmE83kX118CANAvF5ujKpdwXv9I0a2fAQDgK9a5wPZY5RLOb1MdAAAAHnmTC9w9VrmE8/su7ewQAAD0xQ/p+O6xyiV04++54J25AADgGW7S4Tsc/GdXDzwB90l2nz4On/7s8e/7ap7fl57jn83SVt04j028/yUAUOs4Z90++rPtl76wZ+b57Zx1lnZfi1nMV0/xNu3mPusuHly5fJmPaYVhmzZIx2r+6WOZNoiXafu0eZl3aVsPbmtjAAATM4U56yIP89VlFM6X+Hvaz8f+3A+sXD7P+7R2v6+NcTH7Tx/bR382Txu4V2n7tXmem7Tv46E0BQAwBVOas+4+fdx++u9ZHuaqV7Ew8i3rJKtzP6hrLp/2S5I/pn3j96VJ6u3TznBcJflDkj+nvYDxtOPWAwCArryPOeshrWiu0ormX9Lm8nzZj+ng8i3l8svuk3yfVqT2pUn66zZt8P5Xkr8luasM03PXcXMfAOD87tLmrKuYs35ukzaX/2Na+b6vDNNT63M/oHL5ex/SisC2NsZgHNK2fs7TVjM/FGbpqzfx1iQAwHn9knbd4bY2Ru/t08r3PMlPlUF66F3OvHqpXP7W+7Rv8KE2xmDdpn3/vk+7kJwHP8bqJQBwHu/TVuUOtTEG5ZB2sv+PsV32sfU5H0y5fPA+HVzUOlHbtDNpf4ktCI+tqwMAAINnznqafVox/z4u60rOvHqpXDYGaTc2aat1P9fG6A2rlwDAKcxZz2ebthhinnrGBRDlsl0juKoOMWKHtBvafB+rmInVSwDgdcxZz++QNk/9c6Y9Tz3b6uXUy+V92rI43dumrdpNfY+71UsA4KXMWbt1m1aupnzPkPU5HmTq5XIVF0Jf0iHthXHqd+paVwcAAAblKuasXdulFcypvvPBu5xhAWTK5fJD2lkKLm+dad/sx+olAPBcv8TbjVzKIa1gvq+NUWZ96gNMuVyuqgNM3CZt8E61YK6qAwAAg3BdHWCCVplmwbxKMjvlAaZaLt+n3YaYWrtMt2BeVwcAAHrPnLXOKtMrmG9y4gLIVMvlpjoA/7bLNAvmyYMXABi9m+oAE7fK9Arm9Sl/eYrl8i72rffNLtMsmKvqAABAb92lzZGotcq07iL7Nie8LckUy+VtdQC+aJfp3WL7LHflAgBG6bY6AP+2TCv7U7F67V9ULumTbdpdZKfkujoAANBLt9UB+LdD2iLIVHbZXeWVN/aZYrncVgfgSZtMa2/7VXUAAKCXttUB+I1dprMo8CavnKNOrVxOab/0kK0ynX+rk/a1AwCj9KE6AF+0yXQWQa5e85emVi4P1QF4tqtMZ+vBqjoAANArh+oAfNV1pnH95Q95xdbYqZXLbXUAnm2fZF2c4VKuqgMAAL2yqw7AVx0ynYWBq5f+hamVS4blJtPYFvLqfe0AAFzcNtPYHnv10r+gXNJ3q0xje+yyOgAAAM92nfHPUV+8NVa5pO/2aSuYY3dVHQAAgGc7ZBqXcF295IuVS4ZgnfFfOP02yaI6BAAAz3aT8c9Rly/5YuWSoVhXB7iAZXUAAABeZF0doGNXL/li5ZKh2MSZIQAA+mWTcc9R3+QFu+uUS4ZkXR2gYz9UBwAA4MXW1QE6dvXcL1QuGZJNxn1mKLF6CQAwNJuMe466fO4XKpcMzbo6QMeW1QEAAHixm+oAHXr33C9ULhma24z7PYWW1QEAAHixTcxRlUsG55A2eMdqUR0AAIAXO6QtgozV8jlfpFwyRDfVATr0Jsm8OgQAAC92Ux2gQ4vnfJFyyRDtk3ysDtGhZXUAAABebJfx3thn+ZwvUi4Zqk11gA7NqwMAAPAqN9UBOvKs3XXKJUN1Wx2gQ8vqAAAAvMptdYAOLb71BcolQ7XPeLfGLqoDAADwKvtMeI6qXDJkt9UBOvImyaw6BAAAr3JbHaAjy299gXLJkN1WB+jQojoAAACvclsdoCPzb32BcsmQ7TLeN6udVwcAAOBVdhnnHPXtt75AuWTottUBOjKvDgAAwKttqwN0ZPnUJ5VLhm5bHaAji+oAAAC82rY6QEdmT31SuWTodtUBOjKrDgAAwKttqwN0ZPHUJ5VLhm5bHaAji+oAAAC82q46QEfmT31SuWQMxvheQm+qAwAAcJIP1QE6MH/qk8olY7CvDtCRWXUAAABebVcdoAPzpz6pXDIGu+oAHVlUBwAA4NX21QE68OTbkSiXjMG+OgAAAHxmVx3g0pRLxmBfHaAjs+oAAAC82q46QEcWX/uEcskY7KsDdGRRHQAAgFc7VAe4NOWSMdhXBwAAgC8Y4x1j/6+vfUK5BAAA4Ln+7699QrlkLMZ4VggAgGHbVQe4JOUSAACgG4fqAJekXAIAAHAy5RL6a1kdAACAk+yrA3Tg//naJ5RLAACAbuyrA3TA3WIBAADojnIJ/XWoDgAAAM+lXEJ/7aoDAADAcymXAAAAnEy5BAAA4GTKJQAAACdTLhmLeXUAAACYMuWSsXhbHQAAAKZMuYT+2lYHAADgJMvqAJekXDIGi+oAAAAwEf/62ieUS8ZgVh0AAACmTrlkDBbVATqyqw4AAMBJFtUBLkm5ZAxm1QE6cqgOAADASWbVAS5JuWQMltUBOnBfHQAAgJPNqwN04P/92ieUS8ZgXh2gA7vqAPANs+oAADAAY3y7POWS0ZplnIP2UB0AvmFRHQAAem5RHeDSniqXHy+W4nLm1QE4u0V1gI7sqgMAAHCSeXWAjvyfr33iqXJ5OH+OcvPqAJzdsjpARw7VAQAAOMmiOkBH/r+vfcK2WIZuWR2gI7vqAPAN8+oAwOC5eR1jt6gO0IEnx+3UyuW76gCc3Vj/TXfVAeAb5tUBgMHbVQeAji2qA3Rg99QnnyqXT/7FAZtVB+BsltUBOnIf22JhyPbVAQAoN8sEbzo5tWsuk3GeQZiqZXWAjuyqA8AzLKsD9Ni+OgCjNKsOwEXNqgNwsmV1gI7snvrkFMvlsjoAZ3NVHaAju+oAAPTOojoAF7WoDsDJltUBOrJ/6pNT3Ba7qA7AWcyTfFcdoiO76gADsKgOwGivd+bL5tUBGKVddQDo0LI6QEf2T31yajf0SUxKx2JZHaBDu+oAAzCrDjBx8+oAPberDtCBeXUARulQHaDH5tUBOMksE10Eeapcbs8aoz/eRsEcg6vqAB3aVQeAb5hXB+i5Q3UARmlRHYCLGuONYKbkqjpAR75508kprlwm4171moJZkh+qQ3TkQwePue3gMavZkllrWR2AizPm6s2qA3RgVx2g5xbVAXi1q+oAHdl96wu+VS67mOj2wVV1AE6yqg7QoV11gAGZVQeYsEV1gAH4WB2gA7PqABO3qA7QgUN1gJ6bVwfg1ZbVATqy/dYXfKtcHs4So3/exUFyyFbVATq0rQ4wIIvqABO2qA4wAIfqAB1YVAeYuHl1gA4cqgP03KI6AK9yleRNdYiO7L/1Bd8ql7uzxOinq+oAvMoi471AOummXB46eMw+WFQHmKh5XAv0HPvqAB1YVAeYuDEe+3bVAXpuWR2AV7mqDtCh3be+YMrl8ro6AK9yXR2gQx/TTRHcdfCYfbCoDjBRy+oAA7GvDtCBeXWACVtUB6CEa52HZ5bkx+oQHdp96wumXC6/ixfroZll3AN2Wx1gYBbVASZqWR1gIPbVATqwrA4wYcvqAB0Y6309zm1RHYAXuaoO0KFnjdlvlcv96Tl67bo6AC9yXR2gY9sOH/uuw8eu8l1cO11hWR1gIPbVATpgzNVZVAfowKE6wEBcVQfgRa6rA3Ro+5wves5bkYz5zNKPcaAcilnGPWCTbsvlvsPHrrSsDjAxi7je8rn21QE6sqwOMFHL6gAd2FUHGIir6gA82zLjvDb6aPucL3pOudydFKP/rqsD8CzXGe+dt5J2EudQHWKArqoDTMyqOsCA7KsDdGRZHWCCFhnnSZ19dYCB+C6udx6KVXWAju2e80XPKZfbk2L033WsXvbdLOM/CXDb8eNvO378KsvqABNzVR1gYMa48+eqOsAELasDdGRfHWBArqoD8E3zjPu+IM++6aSVy7Yadl0dgiddZ9yrlsl4y1/X3mac1yL10SLjXD3p0qE6QAeMuctbVQfoyLY6wIBcVwfgm9bVATq2fe4XPqdc7jPOm4E89vfYctBX84z/RfUu3Z/E2Xb8+JVW1QEmYlUdYIB21QE6sqoOMCHzjPMarrHPK8/tbca7gj0G84x71TJ5wQ6755TLZNwT06Ob6gB80TrjX7W8vcBzHC7wHFVW1QEmYlUdYIC21QE6sqoOMCHX1QE6sq8OMEDr6gB81bo6wAVsn/uFyuWDH2JPe98sM/4zQUmyucBz7C7wHFXexGS3a6uM/yRPF/bVATpizF3OqjpAR7bVAQboXeyy66N5xj9X/eUlX6xc/tZN3NynT26qA1zAJbbEHn280PNUWFUHGLl1dYCB2ie5rw7RkVV1gAlYZbwndXbVAQZqXR2A39lUB7iA25d88XPL5T7jnpgevY2B2xfrjPM6k8/dXvC5Dhd8rkt7F9ejdGUZN/I5xa46QEeMue6tqwN0aFcdYKB+jHHXJ1dpr4Vjt33JFz+3XL74gQfsr7E9ttoi7SZLU3BzwefaXvC5KqyrA4zUujrAwG2rA3RoXR1gxJYZ70mdu4x3y/glrKsDkKTtdLwpznAJH/PC8fqScrl5yQMP3Cb2tVeZZTo/ay8esCfaXfC5KlhJOb9lpnFWtkvb6gAdMua6c1MdoEO76gAD9y62pffBOuM9AfTY5qV/4SXlcpfxXjvyuTe57HZFHtxkGtthk8tPHnYXfr4K6+oAI7OpDjAC2+oAHVtXBxihVcZ9HNxWBxiBm7hHSKVl2k7HKbh96V94Sbl81RMM2Hcxsbq0VcZ/x63Hbi/8fPuM/wSRM7rnc51pnJW9hDHfs8CYO69Zxr1qmSiX52ARpM4s0+kHr9php1w+7ceM9z2m+maR8R9QH3ufmhvs7Aqe89Ju4ozuqWaxInVO2+oAHbuJMXcu64z3DrFJO8G5qw4xEu9ijlphk+mceN285i+9plyOfeXjc/+Is7Jdm6VNvsZ8QP3cpuh5t0XPe0lvMp2zil3ZZFrjsWvb6gAdM+bOY5nxb7XbVgcYmX/Edc+XdJ3kh+oQF7R5zV96abl89RMN3D+jYHZllukVy4+pO8Duip730n6IMftaq0zr4HkJt9UBLuCHuNP6KWaZxvxqWx1ghG7Tdn/Rrau0Mj8Vv+SVO+yUy+dTMM9vlnagGfONC77kpvC5t4XPfWk3ccB9qXmmtT39kj5UB7iATdxp/bU2mcZWu9vqACN03Dkwq40xaotMr/9sXvsXX1Mudxn3zQmeomCe102mVyzvU/sCdch0xq8D7svM0iZ+U9pFcEm31QEu4HiTkVltjMG5zjR2C3h/y+58l3byeFYbY5Rmmd4Ou/uccMx6TblMpn1mW8E8j02mdWfYo5vqAJnW6qW7Pj/fTaZ3sueSbqsDXIgx9zJXmc5Wu9vqACOnYJ7fLNMrlsmJc9XXlsvbTO/GPo/9M+7Q9VqztNXvKRbL+yiXFX6Iye633GSaY/KS9mkrN1NgzD3PItP6Pt1WB5gABfN8ZpnmpVvJia9Lry2Xh3iR+EemdVA4h1mmO1CTNoE/FGdIplcuk1acNtUhemqV8d+hsi9uqwNckDH3tEWmtSJyn2keeyp8l3Yya1EbY9Dmme589X1O3L7+2nKZeA+0pB08d3EDg+dYpH2vpjhQk/6sWiat4E7h5iKfM9n9vVXaTgwuY1Md4MKMuS9bZFrFMpnWiZU+eJP2M7aqjTFIi0x7vro59QFOKZf7THOC+rnv0n4Ir2pj9NpV2ovcFO6E9zWb9GPV8ui2OkARk90HqyiWl7bLdLbGHhlzv7XM9IplMt1jTqU3aa/xN8U5huQq0xyfRx9yhh0Gp5TLxOrl0Zsk/502gGelSfrnJu17M9WBmrRVy3V1iM/cVgco9GNck3ITxbLKpjpAAWOuWSX5n0zveHiXaR9zqv017cTWojZG761jvro5x4OcWi63sXr52HEAL2tj9MIi7XvhWq7+XGv52D7TeUuSL3mXaR5sZ2mTPOOyzqY6QJGpjrmjTaZ7Que2OgD5Lsm/0r8T3X0wS+szf6+NUe4uPSmXiR/Uz71NOzN5k+mepV2nvYhNdb/6Y3261vJzm+oAxd6m/ZxeF+e4lEXaAXQK76fXZ/tM96Ts27SfwevaGBe1yHTvkH50Ux2Af/t72mvQVW2M3rhK+368q43RC+tzPdA5yuU20z1QPuWvaT+w17UxLmqZ9v889bM/j92kf6uWR7fVAXriH2mvY/PaGJ26jhM+fbKpDlDoTaYx5hInWpM2P9xXh+A33qZt/9xmujvt5mlzoKlvgz0626plcp5ymVi9/JrjQXSfcd+xa542SP8n075pz+fu0u+xsc+0t8Y+dtyyt66NcXaLtAnEVN6kfSg2mfZ7RSfjHXNJm7Dv4kRrMu0TKX33Lm3ets10SuYs7TVnF7t4Hluf88HOVS63sXr5lLdp11rsM66SOU87cPxvDNIvua4O8Ayb6gA98iYPW4ZWpUlON0v7t/1XbPfpq011gB4Y05hLfnuidcqrlUf38XM+BI9L5lVpkm6t8nDSx2rlg7OuWibnK5fJOM8+ntvjknmd4V6TucxDqZzydSRP+ZBhbDvdVAfooSGfDJqlvRbvY2z23U11gB4Z8phLnGj9mpvqALzIu7Rtovu048i8MMu5zNLm2/u01xi7635vde4H/MOvv/56zsfbxITmpd6nfd+2tTG+aZZ2Rus6zsg+x5/SzpANwSbG7VOOZ/U26e+1Q/O0ycBVnJE91R8u+FybGHtfMoQxlzwcE+0O+LI/5nL/fuvYhtyFj2nj8Db9HoufW6SNzas4Jj7lQzrYEn3ucjlPm1D7h3y54/tAbdKfUjJLG5hXcTb2JX7KsFbyl2lbYvi2X9LG6W3qb9Q0ixM+XbhkuVzG2PuWPo25pE1aV58+zHW+7n0uuwq9jnLZtY95GIu7yiBfMU87Jq7imPhcnSyEnLtcJgb4OdynDd7tp4/9BZ97+ejD2diXu0ubfBxqY7zYPraLvNRx6/M2lzvQLtLG5lWMz65cslwm7efHv+XzVIy5Wdp4W3768Dr5PJdctUzMPS/tPg/j8Pjr4cIZZnkYl1cxNl+qsxNAXZTLxET13O7z+wG8PfEx558+Fo8+nOk53ffp/xbnL1llum/wfS4f8nAyaJ/Tfw4WeRijy0+/Winp3qXL5TJWL1/j8XFxn/ONuVkextsi5jKvcelVy0S57IO7PIzD/Wcfp1rkYWzOY856qvu07+Ohiwfvqlwu42B5KY/v0rvL739QZmmD8GgRE9Su/Jxh3CH2S2ZpBwA/G+f3eIzu8+UD7fLR7xfx71Dp0uUysXp5bsZcrUuvWibKZd8dTwYdHfLl3QezmLNewt/S4Q23uiqXSQv9164eHHpmqNthH1vHwRkqyuUyTsgyDhWrlonjFzxXJzfxeeycb0XyuXXahBumYJVhF8uknRCa+hu7Q4VtvFc047CuDgA86brrJ+iyXB4yzPergpf6OcO8zvJzh3hfMqhyXR0ATvQ+w3q7Cpian3KBm6F1WS6TNuH+uePngEofM65J4U2sXkKFXdrkHIboPuM6FsLYfMyFdhZ0XS6T9mLz8QLPA5d2n/Gtzh9i9RKqXMfJHYbpJsO/NATGbHWpJ7pEuUza/5ADJmNznX6+kfCpbmK8QoVDnNxheO7iWkvos7/lgvPVS5XLXWyXYFzeJ9lUh+jIISYKUGUdu30YllV1AOCrPuTCJy0vVS6TNhF3/SVj8DHjP5jexN2eocp1dQB4pvcZxw3tYIzuk1xd+kkvWS6TdsB0u3WG7D4dvz9Qj6yqA8BEbeNkLP3nJj7Qb1cpuBb60uUyaf+jtvwwRMdieaiNcTHbJL9Uh4CJWsfuAfptlekcD2Fo/paiXQUV5fIQN/hhmK4zzhv4PGUVYxUqHFKwnQme6eckt9UhgC96n8Kbw1WUy6RN0JdFzw2v8beM9wY+TznEzX2gyi7tTa+hTy72fnnAi5W//3pVuUzaQfMvhc8Pz1V6BqgHbmJ7LFRZx70K6I/j+zsfamMAX9CLy7cqy2XSVoIUTPrsfdzYJrE9FipdxfijH64zvctDYAh6USyT+nKZKJj014colkeH+F5AlUNcSkK9Mb+/MwzdVXpy4qcP5TJRMOmfj3Ezjc/dxtsjQJVdHCepM4X3d4ah+kt69H6zfSmXiYJJf3xMT7YW9NB1vJUQVNnECR4u7y5WzqGv/pKe7SjoU7lMFEzqKZbftozrv6DKddr2RLiE+xS9ETvwTb0rlkn/ymWiYFJHsXyeQxRMqHQdOwjo3vEGIbvaGMAX9LJYJv0sl4mCyeW9T7KIYvlcuxS/jxJM2CFt0q9g0qXrKJbQR70tlkl/y2XSvml/itURuuftRl5nEyeBoMohCibd6fXkFSas92Ozz+UyaWfMlnHwpDs/RbE8xSZuMAJVDnGM5Px6P3mFiRrE2Ox7uUweCuaH2hiM0F+SrKtDjMB13GAEqhyiYHI+g5i8wsTcJ/k+AxmbQyiXycPB0woJ53CftuV6U5xjTFZRMKHKIQomp7mPYgl9dHwroG1tjOcbSrk8uk578XMdJq/1Me3GPbvaGKO0ioIJVQ5pE5BfamMwQMe7wm5qYwCfGeScdWjlMmkvfss4Q8vLvU/72dnXxhi1VewwgCqHtPckdJKH5zquiuxqYwCfGey7GAyxXCYP12GaxPIcx+0+qwxwkA7QddxFFiqtkvytOgS9N8hVEZiA45x1kIZaLpNWEq6T/Dm2yfJ1H2O7T4VNbGGHSjdpN4AwBvmSwa6KwIjdZQT3BBlyuTy6TTKP60z4vZ9ju0+lTdr3/642BkzWNq1AuIyEo8c7eYD++CUj2UkwhnKZPFxnYhWTpJWZ79NWtg+lSdilvVh6KyGosU8bgy4jwU4e6J/jCZ+rjGTOOpZyeXSbtorpIDpdP6dNpLa1MXjkkDah+ak2Bmd0H7tFhuY6tslOmZ080D8f0uasm9oY5zW2cpk8XIv5p1gtmRKrlf23jsntGHxIO4m3q43BK2zjMpKpcWyE/jmuVi4zwncwGGO5PNql/aP9Ja75GrP7tBWxeaxWDsE2JrdD9lPa6+qhNgYnOOThMhLHxnGzkwf6533aPGhTG6M7Yy6XR5u0F9efYsVkbI53u1vXxuCFDnGN9NB8TNsNsi7OwfncxrWYY3Ucr9dxIgj64mPaLoJVRj4up1Auk/aPuI7rMcfiQx4G6L40Cae4jTHZd/dp75e4iG2wY3SIy0jG5LjVbhHjFfri8bjclia5kKmUy6ND2oH0j2mrXgzL8dqRZSYyQCfgEJPbvjreFv2mNgYXsEt7Xf0+tsoO0ePLQzalSYCjyY7LqZXLo33aqtd/xXbZIbhLO+szj1I5Vru4Rrovjlt3rmJnwNRs015njcPheHx5yKEyCJ36kDYu/5jkD2mv0T/H/LWPHpfKdSY4LqdaLo8Oedgu+1McTPvmQ9p1efNM7KzPhG1iclvleBJnESdxpm4T47Dv3qcVjVWcBBq7v+Xh/Un3n/5sm7brZx7z176YfKk8mnq5PDrkoWT+JbbnVfslD9tfb0uTUGUTk9tLebwzYFOahL7ZxHGxT46T1/+KUjkVf8nTlyYc8tv5q+Pl5d2lnQCYZ+Kl8ki5/L1NWqn5Y2w5uKT7tO/3H9O2420rw9Abm5jcdkWp5Lk2ebgm0/0KLu9jHsbqOiavU/EhL3tt3qT9jHwfb/d1CY93193EuPw35fLr9mlbDmZpPzwGajd+STtoztK+3/vCLPTXJm1y+6eY3J7KdnNea5uH+xX8LVZJunSf9lr3p7St6puYvE7NzSv/3jbtJP0fY5ye210eFkKWsbvui/7w66+/VmcYklnagL1K8kNlkIH7mHagvI0yyevM0sbhdZLvKoMMxH3amLvJ+cbcOsnfz/RYffKH6gADs0grnFdJ3lYGGYlf0o6Nt1EmX2Kd8b0e/VfO9zOwSBunqyRvzvSYU3GfhzF5WxlkKJTL15vloWguY7B+i0JJV+Zp43AVRfNzx4nqpoPHXmd8k7lEuTzFIormayiUp1tnfK9HXb0WXaXNW69inH6NQnkC5fJ8lnkYsCa4bWBu0wblNgollzHPw0mfd5VBCl1qorrO+CZziXJ5Los8HBenOha/5i6/PT4e6qKMxjrjez26xGvRIg/HzKnPXT/mt+OSV1IuuzFLO6geP6YyYD+kDcjjB1SaZRrj8C4PB8PbCz7vOuObzCXKZRdmeRiHi0yvbB7L5PFjXxdltNYZ3+vRpV+LZpnGMfPIuOyIcnk5y7SD6vFj6IP2Y9ob3x8/tnVR4FlmeVhNWX76/RC3sx/H3ja1B8R1xjeZS5TLS1lmXMfEo/s8jM/dp499VZgJWWd8r0fVr0WzjOOYmfx+XG5jx0BnlMtay7RtfPO0QTtP/w6wd2kHxu2nX4+/hzGYf/pY5rdjsS8H0A9pY26X/p3EWWd8k7mkfkI3Zcv8dhzO0t9VzuOxcZc2Sd0++j2Xt874Xo/6+Fo0y0PhnKd/x8xjidzn93NXLuQ/qwNM3PYrfz5LG6xJG8DJwyA+OvWAezwwfp5l/9kHjNk+Xz9hsvz06yJtTM7yMC6Pf37KAfXx+3Yen3+XNjk9/splfawOMHHbr/z5LL8/Jj7+s6QdH89xc5LH43Kfh+PgLm1MPv4zmJpDvn7p0/KzX+d5mLfOctriybE0Hh2f//Doz7+UiQLKZT8d8jBItl/9KqBL289+ZfwO1QH4okOMR+i77We/MlH/UR0AAACA4VMuAXiNRXUAAKBflEsAXmNWHaAD++oAADBkyiUANPvqAAAwZMolAK8xrw4AAPSLcgnAa5zjbR/6Zl8dAACGTLkE4KXm1QE6sq8OAABDplwC8FLz6gAAQP8olwC81KI6QEe21QEAYMiUSwBeal4dAADoH+USgJdaVAfowMfqAAAwdMolAC/1rjpABw7VAQBg6JRLAF5iUR2gI7vqAAAwdMolAC+xqA7QkUN1AAAYOuUSgJdYVgfoyLY6AAAMnXIJwEssqwN0ZF8dAACGTrkE4LkWSd5Wh+jIvjoAAAydcgnAcy2rA3TkQ3UAABgD5RKA51pVB+jIvjoAAIyBcgnAc8yTfFcdoiO76gAAMAbKJQDPcVUdoEO76gAAMAbKJQDPsaoO0KFtdQAAGAPlEoBvmWe8W2I/VgcAgLFQLgH4luvqAB3aVgcAgLFQLgF4yizj3hK7qw4AAGOhXALwlKskb6pDdGhbHQAAxkK5BOAp6+oAHbqL97gEgLNRLgH4mlWSt9UhOrStDgAAY6JcAvA16+oAHdtWBwCAMVEuAfiSVca9apkolwBwVsolAJ+bJbkpztC1j3G9JQCclXIJwOeuM+47xCZWLQHg7JRLAB5bJPl7dYgL2FQHAICxUS4BeGxTHeAC7pPsqkMAwNgolwAcrZN8Vx3iAm6rAwDAGCmXACTT2Q6bKJcA0AnlEoBZprEdNmlbYm+rQwDAGCmXAGwyje2wiWIJAJ1RLgGmbZ3kh+oQF3RTHQAAxkq5BJiuVaZznWWS3MVdYgGgM8olwDQtkvyzOsSFbaoDAMCYKZcA07NIsi3OUGFTHQAAxky5BJiWRVqxfFMb4+J+SbKvDgEAY6ZcAkzHMtMslolVSwDonHIJMA2rJP+TaRbLu3gLEgDonHIJMH43md7Nex5bVwcAgCn4z+oAAHRmlrZi9642Rqn7WLUEgIuwcgkwTsu0G9hMuVgmbdX2UJwBACZBuQQYl1laoZrq9ZWP3ad9LwCAC7AtFmA8rtLK1NvaGL1xE6uWAHAxyiXA8C3SitTUt8A+ZtUSAC7MtliA4ZqnvX/jv6JYfu4mVi0B4KKsXAIMzzLt7TUUyi+zagkABZRLgGGYJVkluY5rKr/lJlYtAeDilEuA/pqnrVJeJfmhMsiA3MWqJQCUUC4B+mOWViaPH9/VRRmsdaxaAkAJ5RKgxjKtTC4+fcyjTJ7qQ9oNjgCAAsolMDazPJS1eWGOo+Wj38+iQHbpujoAAEyZcgmMwSLtZjfLKG9T9VOSXXUIAJgy5RIYslXaNXbunjptbuIDAD2gXAJDtIpSyYNV3MQHAMopl8CQzNNu2PKuNgY98nOSbXUIACD5j+oAAM90lXZNnWLJ0V3aCjYA0APKJTAE6yT/neRNcQ765Sq2wwJAb9gWC/TdJsmP1SHonb/F3WEBoFesXAJ9to5iye/9EneHBYDeUS6Bvlol+Xt1CHrnLu1nAwDoGeUS6KN5rEzxe/dxnSUA9JZyCfTRJm7ew+9dx3WWANBbyiXQN6t4uxF+76e0kw4AQE8pl0CfzGI7LL/3Pt7PEgB6T7kE+mQV22H5rY9xAx8AGATlEuiT6+oA9MrHJMvqEADA8yiXQF8sk7ytDkFvHIvloTYGAPBcyiXQF6vqAPSGYgkAA6RcAn2xrA5ALyiWADBQyiXQB/PYEotiCQCDplwCfTCvDkA5xRIABk65BPpgWR2AUoolAIyAcglApfdJFlEsAWDwlEugDxbVASjxc9wlGABG4z+rAwAkmVUH4KLuk1wn2dTGAADOSbkE4JLuklwl2dXGAADOzbZYoA921QG4iA9pW6B3tTEAgC4ol0AfHKoD0Lmf4o6wAM9xVx0AXsu2WKAP9tUB6IxtsEDXdtUBzmxfHQBey8ol0Af76gB04ufYBgt0b18d4Mx21QHgtaxcAn2wrQ7AWd2lvcXItjYGMBG7tLtQvynOcS676gDwWlYugb74UB2As/gpbbVyWxsDmJhtdYAz2lYHgNdSLoG+uK0OwEk+JPlTknXctAe4vNvqAGfyMePb5suEKJdAX9xWB+BV7pL8Je1OsLvSJMCU3VYHOJNNdQA4hXIJ9MU+yfvqEDzbfR62wG5KkwC0HRNDP4bcx+spA6dcAn2yqQ7ANx1L5Ty2wAL9sq4OcKLbeE1l4P7w66+/VmcAeGyb5F11CH7nPsnNp49DZRCAJ2yS/Fgd4hXu03aC7GtjwGmUS6Bv5kn+tzoE/6ZUAkMyT7v+e2hvS/JThr/yCrbFAr2zTzvIUut4o555bH8FhmOf4ZW0jxleZvgiK5dAX21je2yFX9JWKbe1MQBOcpvkh+oQz3Afd9tmRJRLoK9maQfbt7UxJuEurVDexvU+wDjM0k6SfVcb45v+nPG8jQool0CvLdImB0O7dmYI7tImNJs4Yw6M0zz9vv7yL3GXdEZGuQT6bhEF81yOhfI2tr0C07BIe83r2y4YxZJRUi6BIZhlGNub+uhjHgrlrjIIQJFZ+nMMuU9yHcWSkVIugaGYpd1N76+1MXrvLm0Sdfvp10NdFIBeuUntMeRjklWc6GPElEtgaJZpZ3z7tsWpyoe0icr206/7uigAvbdMzTHE+1gyCcolMFSrtAP1VErmfVp5/PwDgJdb5TLHkPefnmff8fNALyiXwNCtklxlGO9n9hwfPv26TdvSuvv0cagIAzByq5z/GHKXtjq6iVLJxCiXwFjM0rY7LdPuDrhIP+4we5ffTi72j/778e+3l4kDwBfM8vpjyIe01/JdHi5RgElSLgEAADjZf1QHAAAAYPiUSwAAAE6mXAIAAHAy5RIAAICTKZcAAACc7P8HS2kaNPCg8woAAAAASUVORK5CYII=",Rf=["M1775 6409 c-317 -37 -619 -179 -849 -399 -222 -213 -348 -435 -427 -750 l-24 -95 0 -1305 0 -1305 24 -74 c77 -235 301 -408 551 -428 86 -6 194 9 495 69 962 192 1822 538 2232 897 338 296 553 698 618 1152 19 133 19 404 0 537 -116 818 -668 1453 -1431 1646 -207 52 -270 58 -704 61 -223 2 -441 -1 -485 -6z m1744 -1248 c72 -37 135 -128 172 -251 19 -61 24 -98 24 -200 0 -74 -6 -147 -14 -180 -53 -211 -186 -337 -317 -300 -94 26 -185 149 -220 296 -21 84 -23 256 -5 339 28 127 94 238 170 287 56 35 132 38 190 9z","M4358 2740 c-95 -16 -151 -44 -301 -144 -448 -302 -858 -498 -1501 -715 -646 -219 -1009 -295 -1601 -335 -231 -16 -312 -34 -382 -85 -48 -35 -86 -83 -102 -130 -19 -57 -14 -260 8 -330 50 -160 175 -273 376 -340 205 -67 156 -65 1455 -69 1223 -3 1309 -1 1480 39 304 70 521 189 731 398 230 228 367 506 410 828 15 115 6 415 -15 501 -20 78 -63 164 -110 219 -101 117 -299 189 -448 163z"];var If=8;function Ff(i){If=i}function ge(i,t){let e=document.createElement("canvas");return e.width=i,e.height=t,e}function Me(i,{srgb:t=!0,repeat:e=!1,aniso:n=8,mips:s=!0}={}){let r=new Gn(i);return t&&(r.colorSpace=Be),e&&(r.wrapS=r.wrapT=os),r.anisotropy=Math.min(n,If),r.generateMipmaps=s,s||(r.minFilter=En),r.needsUpdate=!0,r}function Gr(i,t,e){let n=new nt(i),s={};return n.getHSL(s),n.setHSL(s.h+(e()-.5)*t*.03,Math.min(1,Math.max(0,s.s+(e()-.5)*t*.2)),Math.min(1,Math.max(0,s.l+(e()-.5)*t*.12))),"#"+n.getHexString(Be)}function _i(i,t,e,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function Wi(i,t,e,n=70){let s=cn(t),r=ge(i,i),o=r.getContext("2d"),a=o.createImageData(i,i),l=a.data;for(let c=0;c<i*i;c++){let u=c%i,h=c/i|0,f=u/i*Math.PI*2,d=h/i*Math.PI*2,g=ti(s,Math.cos(f)*e+7,Math.sin(f)*e+Math.cos(d)*e,4)+ti(s,Math.sin(d)*e+31,Math.cos(d)*e+3,3)*.7,x=Math.max(0,Math.min(255,128+g*n*2));l[c*4]=l[c*4+1]=l[c*4+2]=x,l[c*4+3]=255}return o.putImageData(a,0,0),r}function gs(i,t,e,n,s,r=1){i.save(),i.globalCompositeOperation="soft-light",i.globalAlpha=s;let o=t/r,a=e/r;for(let l=0;l<r;l++)for(let c=0;c<r;c++)i.drawImage(n,l*o,c*a,o,a);i.restore()}function Xi(i,t=2.5){let e=i.width,n=i.height,s=i.getContext("2d").getImageData(0,0,e,n).data,r=ge(e,n),o=r.getContext("2d"),a=o.createImageData(e,n),l=a.data;for(let c=0;c<n;c++){let u=(c-1+n)%n*e,h=(c+1)%n*e,f=c*e;for(let d=0;d<e;d++){let g=(d-1+e)%e,x=(d+1)%e,p=(s[(f+x)*4]-s[(f+g)*4])/255*t,m=(s[(h+d)*4]-s[(u+d)*4])/255*t,_=Math.sqrt(p*p+m*m+1),v=(f+d)*4;l[v]=(-p/_*.5+.5)*255,l[v+1]=(m/_*.5+.5)*255,l[v+2]=(1/_*.5+.5)*255,l[v+3]=255}}return o.putImageData(a,0,0),r}function Wv(){let t=ie(11),e=ge(512,512),n=e.getContext("2d"),s=ge(512,512),r=s.getContext("2d");n.fillStyle="#B9A88F",n.fillRect(0,0,512,512),r.fillStyle="#1a1a1a",r.fillRect(0,0,512,512);let o=32;for(let a=0;a<512/o;a++){let l=-t()*40,c=a*o;for(;l<512;){let u=30+t()*52,h=Gr(["#EFE4D2","#E8DAC3","#F3EADB","#E2D2B8","#EADCC8","#DDCBB0"][Math.floor(t()*6)],1,t);for(let f of[0,-512,512]){n.fillStyle=h,_i(n,l+1.8+f,c+1.8,u-3.6,o-3.6,5),n.fill();let d=r.createLinearGradient(0,c,0,c+o);d.addColorStop(0,"#d0d0d0"),d.addColorStop(.45,"#f4f4f4"),d.addColorStop(1,"#bcbcbc"),r.fillStyle=d,_i(r,l+1.8+f,c+1.8,u-3.6,o-3.6,7),r.fill()}l+=u}}return gs(n,512,512,Wi(128,5,3),.55,2),{map:Me(e,{repeat:!0}),normalMap:Me(Xi(s,3.2),{srgb:!1,repeat:!0})}}function Xv(){let t=ie(21),e=ge(512,512),n=e.getContext("2d"),s=ge(512,512),r=s.getContext("2d"),o=32,a=40;n.fillStyle="#6A2A16",n.fillRect(0,0,512,512),r.fillStyle="#000",r.fillRect(0,0,512,512);let l=Math.ceil(512/a)+1;for(let c=l-1;c>=-1;c--){let u=c*a-4,h=c%2?o/2:0;for(let f=-1;f<512/o+1;f++){let d=f*o+h,g=Gr(["#C25A33","#B84F2C","#CF6B3F","#AE4A2B","#D47C4D","#BD5D38"][Math.floor(t()*6)],1,t),x=n.createLinearGradient(d,0,d+o,0);x.addColorStop(0,"#5E2412"),x.addColorStop(.16,g),x.addColorStop(.5,"#EC9D72"),x.addColorStop(.84,g),x.addColorStop(1,"#5E2412"),n.fillStyle=x,_i(n,d+1,u,o-2,a+8,11),n.fill();let p=n.createLinearGradient(0,u+a-2,0,u+a+8);p.addColorStop(0,"rgba(50,15,5,0)"),p.addColorStop(1,"rgba(50,15,5,0.45)"),n.fillStyle=p,n.fillRect(d+1,u+a-2,o-2,10);let m=r.createLinearGradient(d,0,d+o,0);m.addColorStop(0,"#202020"),m.addColorStop(.5,"#ffffff"),m.addColorStop(1,"#202020"),r.fillStyle=m,_i(r,d+1,u,o-2,a+8,11),r.fill()}}return gs(n,512,512,Wi(128,6,3),.4,2),{map:Me(e,{repeat:!0}),normalMap:Me(Xi(s,3.6),{srgb:!1,repeat:!0})}}function qv(){let t=ie(31),e=ge(512,512),n=e.getContext("2d"),s=ge(512,512),r=s.getContext("2d");n.fillStyle="#BFA79A",n.fillRect(0,0,512,512),r.fillStyle="#000",r.fillRect(0,0,512,512);let o=32;for(let a=0;a<512/o;a++){let l=a%2?o/2:0;for(let c=-1;c<512/o+1;c++){let u=o-3-t()*4,h=o-3-t()*4,f=c*o+l+(o-u)/2,d=a*o+(o-h)/2,g=Gr(["#EADBD0","#E4D2C6","#EFE2D8","#DFCBBE","#F2E7DE","#E8D6CB"][Math.floor(t()*6)],1,t);for(let x of[0,-512,512])n.fillStyle=g,_i(n,f+x,d,u,h,8),n.fill(),r.fillStyle="#e4e4e4",_i(r,f+x,d,u,h,9),r.fill()}}return gs(n,512,512,Wi(128,7,3),.45,2),{map:Me(e,{repeat:!0}),normalMap:Me(Xi(s,2.2),{srgb:!1,repeat:!0})}}function Yv(i){let n=ie(41),s=ge(2048,2048),r=s.getContext("2d"),o=ge(2048,2048),a=o.getContext("2d");r.fillStyle="#C4AA9C",r.fillRect(0,0,2048,2048),a.fillStyle="#000",a.fillRect(0,0,2048,2048);let l=20,c=i/1024,u=[8.6,12.2,18.6,25,28.4].map(h=>h/c);for(let h=200;h<1054;h+=l){let f=u.some(m=>Math.abs(m-h)<l*.55),d=2*Math.PI*h,g=f?30:24+n()*5,x=Math.max(8,Math.round(d/g)),p=n()*Math.PI*2;for(let m=0;m<x;m++){let _=p+m/x*Math.PI*2,v=d/x-3,M=Gr(f?["#D6A79E","#CF9C94","#DBB0A6","#D3A39A"][Math.floor(n()*4)]:["#F1E3D8","#EBD9CC","#F5EAE1","#E7D3C6","#EFDFD3","#F3E6DC"][Math.floor(n()*6)],1,n);for(let[C,w]of[[r,M],[a,"#e6e6e6"]])C.save(),C.translate(1024+Math.cos(_)*h,1024+Math.sin(_)*h),C.rotate(_+Math.PI/2),C.fillStyle=w,_i(C,-v/2,-(l-3.2)/2,v,l-3.2,6),C.fill(),C.restore()}}return gs(r,2048,2048,Wi(256,9,4),.5,1),gs(r,2048,2048,Wi(128,10,3,40),.35,8),{map:Me(s,{aniso:16}),normalMap:Me(Xi(o,2.2),{srgb:!1,aniso:16})}}function Zv(){let t=ge(256,256),e=t.getContext("2d");return e.fillStyle="#F2F2F2",e.fillRect(0,0,256,256),gs(e,256,256,Wi(128,3,4,50),.6,2),gs(e,256,256,Wi(64,4,2,70),.3,1),Me(t,{repeat:!0})}function Mu(i,t,e,n=256){return Me(Xi(Wi(n,i,t,90),e),{srgb:!1,repeat:!0})}function Jv(){let t=ie(51),e=ge(256,256),n=e.getContext("2d");n.fillStyle="#555",n.fillRect(0,0,256,256);for(let s=0;s<260;s++){let r=t()*256,o=t()*256,a=6+t()*12;for(let l of[0,-256,256])for(let c of[0,-256,256]){let u=n.createRadialGradient(r+l,o+c,0,r+l,o+c,a);u.addColorStop(0,"rgba(255,255,255,0.9)"),u.addColorStop(.7,"rgba(200,200,200,0.5)"),u.addColorStop(1,"rgba(80,80,80,0)"),n.fillStyle=u,n.beginPath(),n.arc(r+l,o+c,a,0,Math.PI*2),n.fill()}}return Me(Xi(e,4.5),{srgb:!1,repeat:!0})}function Cf(i){let n=ge(512,256),s=n.getContext("2d"),r=10,o=512/r,a=256*.72;for(let c=0;c<r;c++)s.fillStyle=c%2?"#FFF7F3":i,s.fillRect(c*o,0,o+.5,a),s.beginPath(),s.moveTo(c*o,a-1),s.lineTo(c*o+o,a-1),s.arc(c*o+o/2,a-1,o/2,0,Math.PI,!1),s.closePath(),s.fill();let l=s.createLinearGradient(0,0,0,a);return l.addColorStop(0,"rgba(0,0,0,0.12)"),l.addColorStop(.35,"rgba(0,0,0,0)"),s.globalCompositeOperation="source-atop",s.fillStyle=l,s.fillRect(0,0,512,256),Me(n)}var e_=450/583;function cr(i,t,e,n,s){let r=n/583;i.save(),i.translate(t-450*r/2,e-n/2),i.scale(r,r),i.translate(-45,-58),i.translate(0,700),i.scale(.1,-.1),i.fillStyle=s;for(let o of Rf)i.fill(new Path2D(o));i.restore()}function Kv(i){return new Promise((t,e)=>{let n=new Image;n.onload=()=>t(n),n.onerror=e,n.src=i})}function Qv(i){let n=ge(1024,576),s=n.getContext("2d"),r=s.createLinearGradient(0,0,1024,576);r.addColorStop(0,"#FF4A78"),r.addColorStop(.55,"#FF2160"),r.addColorStop(1,"#F0124F"),s.fillStyle=r,s.fillRect(0,0,1024,576);let o=1024*.6,a=o*(i.height/i.width);return s.drawImage(i,(1024-o)/2,(576-a)/2+576*.035,o,a),Me(n)}function jv(){let t=ge(512,512),e=t.getContext("2d"),n=e.createLinearGradient(0,0,512,512);return n.addColorStop(0,"#FF4A78"),n.addColorStop(1,"#F0124F"),e.fillStyle=n,e.fillRect(0,0,512,512),cr(e,512/2,512/2,512*.6,"#FFFFFF"),Me(t)}function $v(i="#FF2160"){let e=ge(512,512),n=e.getContext("2d");return cr(n,512/2,512/2,512*.94,i),Me(e)}function ty(){let e=ge(1024,512),n=e.getContext("2d");for(let s=0;s<16;s++)n.fillStyle=s%2?"#FF2D62":"#EE1F55",n.fillRect(s*1024/16,0,1024/16+1,512);return cr(n,1024*.25,512*.45,512*.36,"#FFFFFF"),cr(n,1024*.75,512*.45,512*.36,"#FFFFFF"),Me(e)}function ey(i){let n=ge(1024,192),s=n.getContext("2d");s.fillStyle="#FBF8F2",s.fillRect(0,0,1024,192),s.strokeStyle="#2A2523",s.lineWidth=7,s.strokeRect(13,13,998,166),s.fillStyle="#1B1715";let r=112,o=h=>`800 ${h}px "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif`;s.font=o(r);let a=String(i||"RISTORANTE").toUpperCase(),l=.05,c=()=>s.measureText(a).width+l*r*(a.length-1);for(;c()>914&&r>36;)r-=4,s.font=o(r);let u=(1024-c())/2;s.textBaseline="middle";for(let h of a)s.fillText(h,u,192/2+5),u+=s.measureText(h).width+l*r;return Me(n)}function lr(i,t,e){let r=ge(512,128),o=r.getContext("2d");o.fillStyle=t,_i(o,0,0,512,128,26),o.fill(),o.fillStyle=e;let a=64;for(o.font=`800 ${a}px "Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif`,o.textAlign="center",o.textBaseline="middle";o.measureText(i).width>452&&a>28;)a-=4,o.font=`800 ${a}px "Plus Jakarta Sans", Arial, sans-serif`;return o.fillText(i,512/2,128/2+3),Me(r)}function ny(){let e=ge(128,176),n=e.getContext("2d");n.fillStyle="#7A5233",n.fillRect(0,0,128,176),n.fillStyle="#26312C",n.fillRect(10,10,108,156),n.strokeStyle="rgba(255,255,255,0.85)",n.fillStyle="rgba(255,255,255,0.9)",n.font="700 24px Arial",n.textAlign="center",n.fillText("MENU",128/2,44),n.lineWidth=3;for(let s=0;s<5;s++)n.beginPath(),n.moveTo(26,66+s*18),n.lineTo(102-s%2*18,66+s*18),n.stroke();return Me(e)}function iy(){let t=ge(256,256),e=t.getContext("2d");e.fillStyle="#DDA35A",e.fillRect(0,0,256,256),e.strokeStyle="#A9692D",e.lineWidth=9;for(let n=-256;n<256*2;n+=42)e.beginPath(),e.moveTo(n,0),e.lineTo(n+256,256),e.stroke(),e.beginPath(),e.moveTo(n,256),e.lineTo(n+256,0),e.stroke();return Me(t,{repeat:!0})}function sy(){let t=ie(77),e=ge(256,256),n=e.getContext("2d"),s=256*.4,r=n.createRadialGradient(256/2-16,256/2-16,8,256/2,256/2,s);r.addColorStop(0,"#FFFFFA"),r.addColorStop(.75,"#F6F2E4"),r.addColorStop(1,"#E6E0CC"),n.fillStyle=r,n.beginPath(),n.arc(256/2,256/2,s,0,Math.PI*2),n.fill(),n.save(),n.beginPath(),n.arc(256/2,256/2,s,0,Math.PI*2),n.clip();for(let o=0;o<16;o++){let a=5+t()*18;n.fillStyle=`rgba(200,192,170,${.22+t()*.22})`,n.beginPath(),n.arc(256/2+(t()-.5)*s*1.5,256/2+(t()-.5)*s*1.5,a,0,Math.PI*2),n.fill()}return n.restore(),Me(e,{mips:!1})}function Au(i){let e=ge(128,128),n=e.getContext("2d"),s=n.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);for(let[r,o]of i)s.addColorStop(r,o);return n.fillStyle=s,n.fillRect(0,0,128,128),Me(e,{mips:!1})}function ry(){let e=ge(64,256),n=e.getContext("2d"),s=n.createLinearGradient(0,0,0,256);s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(.7,"rgba(255,255,255,0.3)"),s.addColorStop(1,"rgba(255,255,255,0.95)"),n.fillStyle=s,n.fillRect(0,0,64,256);let r=n.createLinearGradient(0,0,64,0);return r.addColorStop(0,"rgba(0,0,0,1)"),r.addColorStop(.5,"rgba(0,0,0,0)"),r.addColorStop(1,"rgba(0,0,0,1)"),n.globalCompositeOperation="destination-out",n.fillStyle=r,n.fillRect(0,0,64,256),Me(e,{mips:!1})}function oy(){let e=ie(91),n=ge(256,256),s=n.getContext("2d"),r=s.createLinearGradient(0,0,0,256);r.addColorStop(0,"#FFE2B0"),r.addColorStop(1,"#F2A65E"),s.fillStyle=r,s.fillRect(0,0,256,256);for(let o=0;o<9;o++)s.fillStyle=`rgba(150,70,30,${.18+e()*.2})`,_i(s,e()*256,256*.45+e()*256*.45,20+e()*50,30+e()*60,10),s.fill();return s.strokeStyle="rgba(80,40,20,0.55)",s.lineWidth=10,s.strokeRect(0,0,256,256),s.beginPath(),s.moveTo(256/2,0),s.lineTo(256/2,256),s.stroke(),Me(n)}function Pf(i=!1){let n=ge(1024,768),s=n.getContext("2d"),r=1024/2;s.fillStyle="#FFF3EF",s.beginPath(),s.moveTo(r,212),s.bezierCurveTo(r-36,128,r-176,100,r-262,166),s.bezierCurveTo(r-352,236,r-356,386,r-296,492),s.bezierCurveTo(r-232,606,r-118,650,r,652),s.bezierCurveTo(r+118,650,r+232,606,r+296,492),s.bezierCurveTo(r+356,386,r+352,236,r+262,166),s.bezierCurveTo(r+176,100,r+36,128,r,212),s.closePath(),s.fill();for(let o of[-1,1]){let a=r+o*226,l=486,c=s.createRadialGradient(a,l,4,a,l,64);c.addColorStop(0,"rgba(248,132,156,0.95)"),c.addColorStop(.65,"rgba(248,132,156,0.75)"),c.addColorStop(1,"rgba(248,132,156,0)"),s.fillStyle=c,s.beginPath(),s.ellipse(a,l,66,50,0,0,Math.PI*2),s.fill()}for(let o of[-1,1]){let a=r+o*122,l=380;s.fillStyle="#1C1416",i?(s.lineWidth=18,s.lineCap="round",s.strokeStyle="#1C1416",s.beginPath(),s.moveTo(a-54,l+10),s.quadraticCurveTo(a,l+30,a+54,l+10),s.stroke()):(s.beginPath(),s.moveTo(a-60,l-26+o*16),s.lineTo(a+60,l-26-o*16),s.quadraticCurveTo(a+66,l+48,a,l+56),s.quadraticCurveTo(a-66,l+48,a-60,l-26+o*16),s.closePath(),s.fill(),s.fillStyle="#FFFFFF",s.beginPath(),s.ellipse(a-o*18+4,l+6,15,13,0,0,Math.PI*2),s.fill())}return s.strokeStyle="#1C1416",s.lineWidth=16,s.lineCap="round",s.beginPath(),s.moveTo(r-60,506),s.quadraticCurveTo(r+6,552,r+76,494),s.stroke(),n}async function Df(i={}){try{await Promise.race([Promise.all([document.fonts.load('800 100px "Plus Jakarta Sans"'),document.fonts.load('700 40px "Plus Jakarta Sans"')]),new Promise(n=>setTimeout(n,1800))])}catch{}let t=await Kv("data:image/png;base64,"+Tf);return{stone:Wv(),roof:Xv(),paving:qv(),piazza:Yv(i.piazzaR||30),stucco:Zv(),leafN:Jv(),rockN:Mu(8,2.2,3.4),fuzzN:Mu(12,10,1.8,256),grassN:Mu(14,6,2.2,128),awning:Cf("#EE3A64"),awningR:Cf("#D93A3A"),signWord:Qv(t),glyphFace:jv(),glyphDecal:$v(),balloon:ty(),ristorante:ey(i.nome),shops:[lr("Dolce","#FFFFFF","#E8355E"),lr("Pizza","#FFFFFF","#D93A3A"),lr("Caff\xE8","#FFF7EF","#7A4A2A"),lr("Gelato","#FFFFFF","#E8355E"),lr("Pasta","#FFFFFF","#C2452D"),lr("Burger","#FFFFFF","#E8355E")],chalk:ny(),waffle:iy(),moon:sy(),pool:Au([[0,"rgba(255,255,255,1)"],[.3,"rgba(255,255,255,0.55)"],[.7,"rgba(255,255,255,0.12)"],[1,"rgba(255,255,255,0)"]]),glow:Au([[0,"rgba(255,255,255,1)"],[.15,"rgba(255,255,255,0.7)"],[.4,"rgba(255,255,255,0.15)"],[1,"rgba(255,255,255,0)"]]),sunGlow:Au([[0,"rgba(255,255,255,1)"],[.12,"rgba(255,255,255,0.95)"],[.2,"rgba(255,255,255,0.35)"],[.5,"rgba(255,255,255,0.08)"],[1,"rgba(255,255,255,0)"]]),beam:ry(),shopWin:oy(),faceOpen:Me(Pf(!1)),faceBlink:Me(Pf(!0)),wordmark:t}}var Gt=i=>new zr(i);function ay(i){return{stucco:{vc:!0,make:()=>Gt({vertexColors:!0,map:i.stucco,roughness:.92})},trim:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.82})},roofFlat:{vc:!0,make:()=>Gt({vertexColors:!0,map:i.stucco,roughness:.95})},stone:{vc:!0,make:()=>Gt({vertexColors:!0,map:i.stone.map,normalMap:i.stone.normalMap,normalScale:new it(.8,.8),roughness:.9})},roof:{vc:!0,make:()=>Gt({vertexColors:!0,map:i.roof.map,normalMap:i.roof.normalMap,normalScale:new it(1,1),roughness:.78})},paving:{vc:!0,cast:!1,make:()=>Gt({vertexColors:!0,map:i.paving.map,normalMap:i.paving.normalMap,normalScale:new it(.7,.7),roughness:.9})},piazza:{vc:!1,cast:!1,make:()=>Gt({map:i.piazza.map,normalMap:i.piazza.normalMap,normalScale:new it(.65,.65),roughness:.88})},curb:{vc:!0,make:()=>Gt({vertexColors:!0,map:i.stucco,roughness:.85})},winLit:{vc:!1,glow:["win",1],make:()=>Gt({color:3291730,roughness:.18,metalness:.05,envMapIntensity:1.4,emissive:16755285,emissiveIntensity:0})},winDark:{vc:!1,make:()=>Gt({color:3291730,roughness:.2,metalness:.05,envMapIntensity:1.3})},shopWin:{vc:!1,glow:["shop",1],make:()=>Gt({color:10123874,map:i.shopWin,roughness:.3,emissive:16777215,emissiveMap:i.shopWin,emissiveIntensity:.3})},frame:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.6})},leaf:{vc:!0,make:()=>Gt({vertexColors:!0,normalMap:i.leafN,normalScale:new it(1.1,1.1),roughness:.86})},trunk:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.9})},rock:{vc:!0,make:()=>Gt({vertexColors:!0,normalMap:i.rockN,normalScale:new it(1.2,1.2),roughness:.95})},grass:{vc:!0,cast:!1,make:()=>Gt({vertexColors:!0,normalMap:i.grassN,normalScale:new it(.8,.8),roughness:.95})},metal:{vc:!1,make:()=>Gt({color:2302759,roughness:.42,metalness:.55})},lampGlass:{vc:!1,cast:!1,glow:["lamp",1],make:()=>Gt({color:16773584,roughness:.3,emissive:16760938,emissiveIntensity:.2})},wood:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.75})},cloth:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.88,side:Ue})},awning:{vc:!1,make:()=>Gt({map:i.awning,roughness:.85,alphaTest:.5,side:Ue})},awningR:{vc:!1,make:()=>Gt({map:i.awningR,roughness:.85,alphaTest:.5,side:Ue})},sign:{vc:!1,glow:["sign",1],make:()=>Gt({map:i.signWord,roughness:.4,emissive:16777215,emissiveMap:i.signWord,emissiveIntensity:.1})},signBody:{vc:!1,glow:["sign",.35],make:()=>Gt({color:16722528,roughness:.42,emissive:16722528,emissiveIntensity:0})},glyphCube:{vc:!1,glow:["sign",1],make:()=>Gt({map:i.glyphFace,roughness:.4,emissive:16777215,emissiveMap:i.glyphFace,emissiveIntensity:.1})},glyphDecal:{vc:!1,cast:!1,make:()=>Gt({map:i.glyphDecal,roughness:.6,transparent:!0,alphaTest:.35,polygonOffset:!0,polygonOffsetFactor:-2})},pink:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.48})},ristorante:{vc:!1,glow:["sign",.17],make:()=>Gt({map:i.ristorante,roughness:.6,emissive:16777215,emissiveMap:i.ristorante,emissiveIntensity:0})},shop0:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[0],roughness:.5,emissive:16777215,emissiveMap:i.shops[0]})},shop1:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[1],roughness:.5,emissive:16777215,emissiveMap:i.shops[1]})},shop2:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[2],roughness:.5,emissive:16777215,emissiveMap:i.shops[2]})},shop3:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[3],roughness:.5,emissive:16777215,emissiveMap:i.shops[3]})},shop4:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[4],roughness:.5,emissive:16777215,emissiveMap:i.shops[4]})},shop5:{vc:!1,glow:["sign",.5],make:()=>Gt({map:i.shops[5],roughness:.5,emissive:16777215,emissiveMap:i.shops[5]})},chalk:{vc:!1,make:()=>Gt({map:i.chalk,roughness:.8})},flower:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.7})},soil:{vc:!0,cast:!1,make:()=>Gt({vertexColors:!0,roughness:1})},gloss:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.3})},matte:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.78})},waffle:{vc:!1,make:()=>Gt({map:i.waffle,roughness:.75})},ceramic:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.22,envMapIntensity:1.2})},liquid:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.08,envMapIntensity:1.3})},plush:{vc:!1,make:()=>new Or({color:15743580,roughness:.95,sheen:1,sheenColor:new nt(16758982),sheenRoughness:.55,normalMap:i.fuzzN,normalScale:new it(.22,.22)})},plushFace:{vc:!1,cast:!1,make:()=>new Or({map:i.faceOpen,roughness:.9,sheen:.4,sheenColor:new nt(16777215),sheenRoughness:.7,transparent:!0,alphaTest:.4,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4})},hull:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.35})},sail:{vc:!0,make:()=>Gt({vertexColors:!0,roughness:.85,side:Ue})},balloon:{vc:!1,make:()=>Gt({map:i.balloon,roughness:.55})},bulb:{vc:!0,cast:!1,glow:["fair",1],make:()=>Gt({vertexColors:!0,roughness:.4,emissive:16765578,emissiveIntensity:0})},beacon:{vc:!1,cast:!1,glow:["beacon",1],make:()=>Gt({color:16774876,roughness:.2,emissive:16770984,emissiveIntensity:0})},stringLight:{vc:!1,cast:!1,glow:["string",1],make:()=>Gt({color:16773320,roughness:.4,emissive:16763255,emissiveIntensity:0})},cloud:{vc:!1,cast:!1,receive:!1,make:()=>Gt({color:16777215,roughness:1,emissive:16777215,emissiveIntensity:.15})},mountain:{vc:!0,cast:!1,make:()=>Gt({vertexColors:!0,roughness:1,normalMap:i.rockN,normalScale:new it(.6,.6)})},people:{vc:!1,make:()=>Gt({color:16777215,roughness:.72})}}}var xa=class{constructor(t){this.T=t,this.specs=ay(t),this.cache=new Map}spec(t){let e=this.specs[t];if(!e)throw new Error("materiale sconosciuto: "+t);return e}get(t){let e=this.cache.get(t);if(!e){let n=this.spec(t);e=n.make(),e.name=t,n.glow&&(e.userData.glow=n.glow),this.cache.set(t,e)}return e}applyGlow(t){for(let e of this.cache.values()){let n=e.userData.glow;n&&(e.emissiveIntensity=(t[n[0]]||0)*n[1])}}};var Wr=new P;function Fn(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Wr.copy(t),Wr[n]=0,Wr.normalize();let c=.5*o/(o+a),u=1-Wr.angleTo(i)/l;return Math.sign(Wr[e])===1?u*c:a/(o+a)+c+c*(1-u)}var va=class extends re{constructor(t=1,e=1,n=1,s=2,r=.1){if(s=s*2+1,r=Math.min(t/2,e/2,n/2,r),super(1,1,1,s,s,s),s===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new P,l=new P,c=new P(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,h=this.attributes.normal.array,f=this.attributes.uv.array,d=u.length/6,g=new P,x=.5/s;for(let p=0,m=0;p<u.length;p+=3,m+=2)switch(a.fromArray(u,p),l.copy(a),l.x-=Math.sign(l.x)*x,l.y-=Math.sign(l.y)*x,l.z-=Math.sign(l.z)*x,l.normalize(),u[p+0]=c.x*Math.sign(a.x)+l.x*r,u[p+1]=c.y*Math.sign(a.y)+l.y*r,u[p+2]=c.z*Math.sign(a.z)+l.z*r,h[p+0]=l.x,h[p+1]=l.y,h[p+2]=l.z,Math.floor(p/d)){case 0:g.set(1,0,0),f[m+0]=Fn(g,l,"z","y",r,n),f[m+1]=1-Fn(g,l,"y","z",r,e);break;case 1:g.set(-1,0,0),f[m+0]=1-Fn(g,l,"z","y",r,n),f[m+1]=1-Fn(g,l,"y","z",r,e);break;case 2:g.set(0,1,0),f[m+0]=1-Fn(g,l,"x","z",r,t),f[m+1]=Fn(g,l,"z","x",r,n);break;case 3:g.set(0,-1,0),f[m+0]=1-Fn(g,l,"x","z",r,t),f[m+1]=1-Fn(g,l,"z","x",r,n);break;case 4:g.set(0,0,1),f[m+0]=1-Fn(g,l,"x","y",r,t),f[m+1]=1-Fn(g,l,"y","x",r,e);break;case 5:g.set(0,0,-1),f[m+0]=Fn(g,l,"x","y",r,t),f[m+1]=1-Fn(g,l,"y","x",r,e);break}}};var Lf=new Map;function Dn(i,t){let e=Lf.get(i);return e||(e=t(),Lf.set(i,e)),e}var mt=()=>Dn("box",()=>new re(1,1,1).translate(0,.5,0));function xe(i,t,e,n=.25,s=2){let r=`rb:${i.toFixed(2)}:${t.toFixed(2)}:${e.toFixed(2)}:${n}:${s}`;return Dn(r,()=>new va(i,t,e,s,Math.min(n,i/2-.01,t/2-.01,e/2-.01)).translate(0,t/2,0))}var rn=(i=12)=>Dn("cyl"+i,()=>new ne(.5,.5,1,i).translate(0,.5,0)),Xr=(i=12)=>Dn("cone"+i,()=>new mn(.5,1,i).translate(0,.5,0)),Yn=(i=16,t=12)=>Dn(`sph${i}:${t}`,()=>new Fe(.5,i,t)),qi=(i=16)=>Dn("hemi"+i,()=>new Fe(.5,i,Math.max(4,i/2),0,Math.PI*2,0,Math.PI/2));function Uf(i,t,e=0,n=0,s=10){let r=new gn,o=i/2,a=Math.max(.01,t-o);return r.moveTo(e-o,n),r.lineTo(e+o,n),r.lineTo(e+o,n+a),r.absarc(e,n+a,o,0,Math.PI,!1),r.lineTo(e-o,n),r}function Eu(i,t,e,n){let s=new ls,r=i/2,o=Math.max(.01,t-r);return s.moveTo(e-r,n),s.lineTo(e-r,n+o),s.absarc(e,n+o,r,Math.PI,0,!0),s.lineTo(e+r,n),s.lineTo(e-r,n),s}function Zn(i,t){return Dn(`ap:${i.toFixed(2)}:${t.toFixed(2)}`,()=>new ds(Uf(i,t),8))}function Mi(i,t){return Dn(`rp:${i.toFixed(2)}:${t.toFixed(2)}`,()=>new _e(i,t).translate(0,t/2,0))}function ei(i,t,e){return Dn(`af:${i.toFixed(2)}:${t.toFixed(2)}:${e}`,()=>{let n=Uf(i+e*2,t+e);return n.holes.push(Eu(i,t,0,0)),new ds(n,8)})}function ya(i,t,e,n,s,r,o=0){let a=`aw:${i.toFixed(2)}:${t}:${e}:${n}:${s}:${r}:${o}`;return Dn(a,()=>{let l=new gn;l.moveTo(-i/2,0),l.lineTo(i/2,0),l.lineTo(i/2,t),l.lineTo(-i/2,t),l.lineTo(-i/2,0);let c=i/n;for(let h=0;h<n;h++){let f=-i/2+c*(h+.5);o<=.001?l.holes.push(Eu(s,r,f,.001)):l.holes.push(Eu(s,r,f,o))}return new vi(l,{depth:e,bevelEnabled:!1,curveSegments:10})})}function Yi(i,t=2,e=.12,n=2.2){return Dn(`blob:${i}:${t}:${e}:${n}`,()=>{let s=new fs(.5,t),r=cn(i),o=s.attributes.position,a=new P;for(let c=0;c<o.count;c++){a.fromBufferAttribute(o,c);let u=a.clone().normalize(),h=1+ti(r,u.x*n+u.z*.7+3,u.y*n+u.z*n*.6+5,3)*e*2;a.multiplyScalar(h),o.setXYZ(c,a.x,a.y,a.z)}let l=ly(s);return l.computeVertexNormals(),l})}function ly(i){let t=i.attributes.position,e=new Map,n=[],s=[],r=[],o=i.attributes.uv;for(let l=0;l<t.count;l++){let c=`${t.getX(l).toFixed(4)},${t.getY(l).toFixed(4)},${t.getZ(l).toFixed(4)}`,u=e.get(c);u===void 0&&(u=n.length/3,e.set(c,u),n.push(t.getX(l),t.getY(l),t.getZ(l)),o?s.push(o.getX(l),o.getY(l)):s.push(0,0)),r.push(u)}let a=new Jt;return a.setAttribute("position",new Bt(n,3)),a.setAttribute("uv",new Bt(s,2)),a.setIndex(r),a}function ur(i,t,e,n,s,r=.85,o=2){return Dn(`cl:${i}:${t}:${e}:${n}:${s}:${r}:${o}`,()=>{let a=ie(i),l=[];for(let u=0;u<t;u++){let h=a()*Math.PI*2,f=(a()-.25)*1.2,d=u===0?0:e*(.45+a()*.55),g=n+a()*(s-n)*(u===0?1.15:1),x=Yi(i*13+u,o,.1,2.4).clone();x.scale(g*2,g*2*r,g*2),x.translate(Math.cos(h)*d,Math.sin(f)*d*.55,Math.sin(h)*d),l.push(x)}let c=In(l,!1);return l.forEach(u=>u.dispose()),c})}function Ae(i,t=24){let e=[];for(let n=0;n<i.length;n++){let[s,r]=i[n];if(n>0){let[o,a]=i[n-1],l=Math.hypot(s-o,r-a);if(l>.25){let c=Math.min(.05,l*.08)/l;e.push([o+(s-o)*c,a+(r-a)*c],[s-(s-o)*c,r-(r-a)*c])}}e.push([s,r])}return new cs(e.map(([n,s])=>new it(Math.max(1e-4,n),s)),t)}var Nf=i=>new nt(i);function _a(i,t,e,n,s,r=0,o=0){let a=Nf(n),l=Nf(s),c=ie(r||1);return u=>{let h=Math.max(0,Math.min(1,(u.y-t)/(e-t))),f=a.clone().lerp(l,h*h*.6+h*.4);if(o){let d=1+(c()-.5)*o;f.multiplyScalar(d)}return f}}function bn(i){return In(i.map(e=>(e.index,e)),!1)}function xs(i){let t=new Jt;if(t.setAttribute("position",i.attributes.position.clone()),t.setAttribute("normal",i.attributes.normal.clone()),t.setAttribute("uv",i.attributes.uv?i.attributes.uv.clone():new ue(new Float32Array(i.attributes.position.count*2),2)),i.index)t.setIndex(i.index.clone());else{let e=i.attributes.position.count,n=[];for(let s=0;s<e;s++)n.push(s);t.setIndex(n)}return t}var Qt=(i,t)=>xs(i).applyMatrix4(t);function Bf(i){let t=bn([Qt(new ne(.2,.32,3.4,7),T(0,1.7,0)),Qt(new ne(.1,.16,1.6,6),T(.42,3.2,0,0,1,1,1,0,-.65)),Qt(new ne(.09,.14,1.4,6),T(-.36,3.3,.1,0,1,1,1,.2,.7))]);[101,102,103].map(c=>xs(ur(c,8,1.85,.98,1.4,.86,1)).applyMatrix4(T(0,4.9,0))).forEach((c,u)=>{c.computeBoundingBox(),i.define("tree"+u,[{geo:t.clone(),key:"trunk",color:_a(t,0,3,"#5B3A26","#7E5638"),tint:!1},{geo:c,key:"leaf",color:_a(c,c.boundingBox.min.y,c.boundingBox.max.y,"#3E6B2A","#B4D35A")}])});let n=c=>{let u=[];for(let x=0;x<=10;x++){let p=x/10,m=.5*Math.pow(Math.sin(Math.PI*Math.min(1,p*1.05+.02)),.75)*(1-p*.35)+.002;u.push([m,p])}let h=Ae(u,10),f=cn(c),d=h.attributes.position,g=new P;for(let x=0;x<d.count;x++){g.fromBufferAttribute(d,x);let p=Math.atan2(g.z,g.x),m=1+f(Math.cos(p)*1.6+g.y*9,Math.sin(p)*1.6+g.y*5)*.3;d.setXYZ(x,g.x*m,g.y,g.z*m)}return h.computeVertexNormals(),xs(h)};[201,202].forEach((c,u)=>{let h=n(c);i.define("cypress"+u,[{geo:h,key:"leaf",color:_a(h,0,1,"#244A2B","#6E9A44")},{geo:Qt(new ne(.04,.05,.08,6),T(0,0,0)),key:"trunk",color:"#5B3A26",tint:!1}])});let s=xs(ur(301,5,.55,.42,.62,.8,1)).applyMatrix4(T(0,.45,0));s.computeBoundingBox(),i.define("bush",[{geo:s,key:"leaf",color:_a(s,0,1.1,"#3F6E2C","#A9CC58")}]);let r=[],o=ie(77);for(let c=0;c<9;c++){let u=o()*Math.PI*2,h=Math.sqrt(o())*.5;r.push(Qt(new fs(.11+o()*.05,0),T(Math.cos(u)*h,.12+o()*.16,Math.sin(u)*h)))}let a=bn(r);i.define("flowers",[{geo:xs(ur(311,3,.4,.32,.44,.6,0)).applyMatrix4(T(0,.12,0)),key:"leaf",color:"#4F7F33",tint:!1},{geo:a,key:"flower",color:"#ffffff"}]),i.define("lamp",[{geo:bn([Qt(new ne(.09,.13,4,8),T(0,2,0)),Qt(new ne(.22,.3,.35,8),T(0,.17,0)),Qt(new ne(.16,.1,.18,8),T(0,3.85,0)),Qt(new mn(.34,.32,8),T(0,4.72,0)),Qt(new Fe(.06,6,4),T(0,4.92,0))]),key:"metal"},{geo:Qt(new ne(.26,.18,.6,8),T(0,4.27,0)),key:"lampGlass",cast:!1}]),i.define("sconce",[{geo:bn([Qt(new re(.1,.1,.4),T(0,0,-.2)),Qt(new mn(.2,.18,6),T(0,.32,0))]),key:"metal"},{geo:Qt(new ne(.15,.11,.38,6),T(0,.05,0)),key:"lampGlass",cast:!1}]),i.define("bench",[{geo:bn([Qt(new re(2.2,.08,.16),T(0,.5,.18)),Qt(new re(2.2,.08,.16),T(0,.5,0)),Qt(new re(2.2,.08,.16),T(0,.5,-.18)),Qt(new re(2.2,.14,.06),T(0,.78,-.3,0,1,1,1,-.2)),Qt(new re(2.2,.14,.06),T(0,1,-.34,0,1,1,1,-.2))]),key:"wood",color:"#A0623A",tint:!1},{geo:bn([Qt(new re(.08,.5,.5),T(-.9,.25,0)),Qt(new re(.08,.5,.5),T(.9,.25,0)),Qt(new re(.06,.6,.06),T(-.9,.75,-.3,0,1,1,1,-.2)),Qt(new re(.06,.6,.06),T(.9,.75,-.3,0,1,1,1,-.2))]),key:"metal"}]),i.define("table",[{geo:bn([Qt(new ne(.62,.62,.06,14),T(0,.78,0)),Qt(new ne(.66,.6,.22,14,1,!0),T(0,.66,0))]),key:"cloth",color:"#FFFFFF",tint:!1},{geo:bn([Qt(new ne(.05,.05,.75,6),T(0,.38,0)),Qt(new ne(.3,.3,.04,10),T(0,.02,0))]),key:"metal"},{geo:bn([Qt(new ne(.06,.05,.12,6),T(.18,.87,.1)),Qt(new ne(.06,.05,.12,6),T(-.2,.87,-.12))]),key:"ceramic",color:"#F4F0EA",tint:!1}]),i.define("chair",[{geo:bn([Qt(new re(.46,.06,.46),T(0,.46,0)),Qt(new re(.46,.5,.06),T(0,.74,-.22,0,1,1,1,-.08)),Qt(new re(.05,.46,.05),T(-.2,.23,-.2)),Qt(new re(.05,.46,.05),T(.2,.23,-.2)),Qt(new re(.05,.46,.05),T(-.2,.23,.2)),Qt(new re(.05,.46,.05),T(.2,.23,.2))]),key:"wood",color:"#9A5A34"}]);let l=Ae([[.02,.62],[.6,.48],[1.2,.26],[1.62,.02],[1.6,-.04]],12);return i.define("umbrella",[{geo:Qt(l,T(0,2.2,0)),key:"cloth",color:"#FFFFFF"},{geo:bn([Qt(new ne(.035,.035,2.9,6),T(0,1.45,0)),Qt(new Fe(.06,6,4),T(0,2.86,0))]),key:"metal"}]),i.define("pot",[{geo:Qt(Ae([[0,0],[.26,0],[.34,.5],[.38,.52],[.38,.6],[0,.6]],10),T()),key:"matte",color:"#C0673E",tint:!1},{geo:xs(ur(321,3,.3,.28,.38,.95,1)).applyMatrix4(T(0,.95,0)),key:"leaf",color:"#4E8434"}]),i.define("planter",[{geo:Qt(new re(1.6,.5,.55),T(0,.25,0)),key:"wood",color:"#8E5534",tint:!1},{geo:xs(ur(331,5,.65,.24,.36,.7,0)).applyMatrix4(T(0,.62,0,0,1.6,1,.55)),key:"leaf",color:"#4F8436",tint:!1},{geo:(()=>{let c=ie(55),u=[];for(let h=0;h<8;h++)u.push(Qt(new fs(.12+c()*.04,0),T((c()-.5)*1.4,.72+c()*.15,(c()-.5)*.4)));return bn(u)})(),key:"flower",color:"#ffffff"}]),i.define("chalk",[{geo:Qt(new re(.62,.86,.05),T(0,.62,0,0,1,1,1,-.12)),key:"chalk"},{geo:bn([Qt(new re(.05,1.1,.05),T(-.28,.52,-.22,0,1,1,1,.3)),Qt(new re(.05,1.1,.05),T(.28,.52,-.22,0,1,1,1,.3))]),key:"wood",color:"#6B4428",tint:!1}]),{canopy:l}}var Je=-7,Ln=30,hn={x:0,z:-35,w:26,d:15,s:1.22};function qr(i,t,e=0){return Math.abs(i)<27+e&&t>-51-e&&t<-6+e}var zf=Math.PI/180,Ma=[[0,62],[22,58],[40,55],[60,60],[90,74],[125,92],[160,100],[200,102],[235,98],[270,92],[300,88],[322,82],[342,70],[360,62]],cy=cn(404);function uy(i,t){return Math.atan2(i,-t)}function un(i){let t=(i/zf%360+360)%360,e=0;for(;e<Ma.length-2&&Ma[e+1][0]<t;)e++;let[n,s]=Ma[e],[r,o]=Ma[e+1],a=(t-n)/(r-n),l=a*a*(3-2*a);return s+(o-s)*l+cy(Math.cos(i)*3+10,Math.sin(i)*3+10)*5}function Ee(i,t){return[i*Math.sin(t),-i*Math.cos(t)]}function Aa(i,t,e=0){return Math.hypot(i,t)<un(uy(i,t))-e}var Ea=[{id:"castello",x:-92,z:-178,r:34,h:12,kind:"town",seed:11,hill:5},{id:"collina",x:125,z:-168,r:40,h:11,kind:"hill",seed:12,hill:13},{id:"faro",x:98,z:-88,r:15,h:9,kind:"lighthouse",seed:13,hill:2},{id:"ruota",x:30,z:-100,r:17,h:8,kind:"ferris",seed:14,hill:1},{id:"scoglio",x:-14,z:-232,r:17,h:9,kind:"small",seed:15,hill:3},{id:"baia",x:-168,z:-92,r:22,h:9,kind:"small",seed:16,hill:4},{id:"lontana1",x:-215,z:-330,r:62,h:10,kind:"wild",seed:17,hill:24},{id:"lontana2",x:175,z:-350,r:56,h:10,kind:"wildtown",seed:18,hill:18},{id:"lontana3",x:18,z:-420,r:42,h:9,kind:"wild",seed:19,hill:16},{id:"ovest",x:-190,z:40,r:30,h:10,kind:"town",seed:20,hill:5},{id:"sud",x:60,z:205,r:28,h:9,kind:"small",seed:21,hill:4},{id:"est",x:205,z:70,r:30,h:10,kind:"town",seed:22,hill:6},{id:"sudovest",x:-150,z:170,r:24,h:9,kind:"wild",seed:23,hill:8}];function vs(i,t){let e=cn(i.seed*7);return i.r*(1+e(Math.cos(t)*2.2+5,Math.sin(t)*2.2+5)*.32)}var Sa=[{a:[19,-53],b:[27,-87],y0:0,y1:1,w:5},{a:[42,-108],b:[95,-143],y0:1,y1:4,w:5},{a:[53,-26],b:[91,-78],y0:0,y1:2,w:5.5},{a:[-47,-62],b:[-81,-150],y0:0,y1:5,w:5},{a:[-115,-156],b:[-152,-106],y0:5,y1:2,w:4.5}];function Of(){let i=ie(7),t=[{r0:37,r1:49,gapStreet:[-120,-62,0,62,120,180]},{r0:54,r1:65,gapStreet:[-150,-95,-30,30,95,150]},{r0:70,r1:81,gapStreet:[-120,-60,0,60,120,180]},{r0:86,r1:96,gapStreet:[-150,-90,-30,30,90,150]}],e=[];return t.forEach((n,s)=>{let r=(n.r0+n.r1)/2,o=3.8/r,a=n.gapStreet.map(u=>u*zf),l=-Math.PI+i()*.05,c=Math.PI;for(;l<c-.06;){let h=(10+i()*6)/r,f=2+i()*1.4,d=a.find(y=>y+o>l&&y-o<l+h);if(d!==void 0){l=d+o;continue}let g=Math.min(h,c-l);if(g*r<7)break;let x=l+g/2,p=g*r-f,m=n.r1-n.r0-i()*2.5,_=n.r0+m/2,[v,M]=Ee(_,x),C=Math.min(un(x-g/2),un(x),un(x+g/2)),w=n.r0+m+5<C,S=[[-p/2,-m/2],[p/2,-m/2],[p/2,m/2],[-p/2,m/2]].map(([y,A])=>{let O=Math.cos(x),H=Math.sin(x),D=Math.sin(x),z=-Math.cos(x);return[v+O*y+D*A,M+H*y+z*A]}),I=S.some(([y,A])=>qr(y,A)),U=S.some(([y,A])=>Math.hypot(y,A)<Ln+5);w&&!I&&!U&&e.push({x:v,z:M,theta:x,ring:s,w:p,d:m,id:e.length}),l+=g}}),e}var Hf=[{what:"mascot",at:[-34,49]},{what:"coffee",at:[-45,-14]},{what:"icecream",at:[-26,-44]},{what:"pizza",at:[44,-20]},{what:"burger",at:[50,2]},{what:"pasta",at:[50,30]},{what:"icecream2",at:[-60,34]},{what:"sign",at:[-44,10]},{what:"sign",at:[-38,-30]},{what:"sign",at:[44,-22]},{what:"sign",at:[40,14]},{what:"sign",at:[8,44]},{what:"sign",at:[-58,-38]},{what:"sign",at:[64,-14]},{what:"sign",at:[-8,-58]},{what:"sign",at:[-70,20]},{what:"sign",at:[70,40]},{what:"sign",at:[20,66]},{what:"sign",at:[-34,62]},{what:"cube",at:[-20,-46]},{what:"cube",at:[24,-46]},{what:"cube",at:[-62,-10]},{what:"cube",at:[58,8]},{what:"cube",at:[-52,50]},{what:"cube",at:[36,56]},{what:"cube",at:[-76,-50]},{what:"cube",at:[78,-6]}];var ba=3.4,Su=["#EC5F82","#F07795","#F48DA5","#F6A3B6","#F8B6C3","#F3C2C6","#F6D9CC","#F4E4D8","#FAEDE4","#E8839B","#F27D97","#F7A7B4"],Yr="#FFF6F1",Vf=["#6B3B2E","#3F5E4B","#D9476E","#7A4A33"];function Gf(i){let{batch:t}=i,e=200,n=new gn,s=[];for(let d=0;d<e;d++){let g=d/e*Math.PI*2,[x,p]=Ee(un(g),g);s.push([x,p,g]),d===0?n.moveTo(x,-p):n.lineTo(x,-p)}let r=new ds(n,1);r.rotateX(-Math.PI/2),t.add(r,"paving",null,d=>"#FFFFFF",{mode:"box",s:1/7});let o=110,a=ie(5),l=-Je+.6;for(let d=0;d<o;d++){let g=d/o*Math.PI*2,x=(d+1)/o*Math.PI*2,[p,m]=Ee(un(g),g),[_,v]=Ee(un(x),x),M=Math.hypot(_-p,v-m),C=(_-p)/M,w=(v-m)/M,S=Math.atan2(-w,C),I=Math.max(1,Math.round(M/5.4)),U=ya(+(M+.25).toFixed(2),+l.toFixed(2),1.3,I,2.9,4.4,1),y=T((p+_)/2,Je-.6,(m+v)/2,S);t.add(U,"stucco",y,"#E9849A",{mode:"box",s:.25});let A=Sa.some(O=>O.y0===0&&Math.hypot(O.a[0]-(p+_)/2,O.a[1]-(m+v)/2)<6);if(t.add(mt(),"trim",T((p+_)/2,-.55,(m+v)/2,S,M+.3,.42,1.55).multiply(T(0,0,.3)),"#F8C7CF"),A||(t.add(mt(),"stucco",T((p+_)/2,0,(m+v)/2,S,M+.2,.85,.5).multiply(T(0,0,.25)),"#EF8EA3",{mode:"box",s:.3}),t.add(mt(),"trim",T((p+_)/2,.85,(m+v)/2,S,M+.3,.16,.7).multiply(T(0,0,.25)),Yr)),d%2===0&&!A&&(t.add(xe(.75,1.35,.75,.08,1),"stucco",T(p,0,m,S).multiply(T(0,0,.3)),"#EC7F96"),t.add(mt(),"trim",T(p,1.35,m,S,.95,.16,.95).multiply(T(0,0,.3/.95)),Yr)),a()<.22){let O=2.5+a()*3.5,H=1.2+a()*2,D=-w,z=C,B=(p+_)/2,k=(m+v)/2,F=Math.hypot(B+D,k+z)>Math.hypot(B,k)?1:-1;t.add(Yi(40+d,2,.18,1.6),"rock",T(B+D*F*H,Je+O*.1,k+z*F*H,a()*6,O,O*.7,O*1.2),hy)}}let c=[],u=200;for(let d=0;d<=u;d++){let g=d/u*Math.PI*2,[x,p]=Ee(un(g)-1.45,g);c.push(x,Je-1,p,x,-.2,p)}let h=new Jt;h.setAttribute("position",new Bt(c,3));let f=[];for(let d=0;d<u;d++){let g=d*2;f.push(g,g+1,g+2,g+1,g+3,g+2)}h.setIndex(f),h.computeVertexNormals(),t.add(h,"stucco",null,"#8C3A55")}var hy=(i,t)=>{let e=Math.max(0,t.y);return new nt("#C9A28D").lerp(new nt("#E9D2BF"),e*.8)};function bu(i,t,e){let{batch:n,inst:s}=i,r=e.r,{x0:o,w:a,d:l,floors:c,body:u,trim:h}=e,f=c*ba+.4,d=(w,S,I,U=0,y=1,A=y,O=y)=>t.clone().multiply(T(o+w,S,I,U,y,A,O)),g=new nt(u),x=g.clone().multiplyScalar(.86);if(n.add(mt(),"stucco",d(0,0,0,0,a+.3,.55,l+.3),x,{mode:"box",s:.25}),n.add(xe(a,f,l,.22,2),"stucco",d(0,0,0),g,{mode:"box",s:.22}),n.add(mt(),"trim",d(0,f-.12,0,0,a+.5,.36,l+.5),h),e.bands)for(let w=1;w<c;w++)n.add(mt(),"trim",d(0,w*ba+.15,0,0,a+.14,.16,l+.14),h);let p=g.clone().lerp(new nt("#FFF0EA"),.45);n.add(mt(),"roofFlat",d(0,f+.2,0,0,a+.2,.06,l+.2),p,{mode:"box",s:.3});let m=.42,_=.85,v=g.clone().lerp(new nt("#FFFFFF"),.12);n.add(mt(),"stucco",d(0,f+.24,l/2+.04,0,a+.4,_,m),v),n.add(mt(),"stucco",d(0,f+.24,-l/2-.04,0,a+.4,_,m),v),n.add(mt(),"stucco",d(a/2+.04,f+.24,0,0,m,_,l+.4),v),n.add(mt(),"stucco",d(-a/2-.04,f+.24,0,0,m,_,l+.4),v);let M=f+.24+_;n.add(mt(),"trim",d(0,M,l/2+.04,0,a+.55,.13,m+.16),h),n.add(mt(),"trim",d(0,M,-l/2-.04,0,a+.55,.13,m+.16),h),n.add(mt(),"trim",d(a/2+.04,M,0,0,m+.16,.13,l+.55),h),n.add(mt(),"trim",d(-a/2-.04,M,0,0,m+.16,.13,l+.55),h);for(let w of[-1,1])for(let S of[-1,1])n.add(xe(.72,1.45,.72,.08,1),"stucco",d(w*(a/2+.04),f+.2,S*(l/2+.04)),g.clone().multiplyScalar(.95)),n.add(mt(),"trim",d(w*(a/2+.04),f+1.62,S*(l/2+.04),0,.92,.15,.92),h);let C=[{len:a,off:l/2,ry:0,front:!0},{len:a,off:l/2,ry:Math.PI,front:!1},{len:l,off:a/2,ry:Math.PI/2,front:!1},{len:l,off:a/2,ry:-Math.PI/2,front:!1}];for(let w of C){let S=Math.max(1,Math.floor((w.len-1.4)/3.1)),I=w.len/S;for(let U=0;U<c;U++){let y=U===0;if(!(y&&w.front&&e.shop))for(let A=0;A<S;A++){let O=-w.len/2+I*(A+.5);if(e.shop&&w.front&&U===1&&Math.abs(O)<2.9)continue;let H=t.clone().multiply(T(o,0,0,w.ry)).multiply(T(O,U*ba+.95,w.off)),D=e.arched||U===c-1&&e.archTop;if(y&&w.front&&A===Math.floor(S/2)&&!e.noDoor){n.add(Zn(1.5,2.7),"frame",H.clone().multiply(T(0,-.95,.04)),Vf[e.doorC]),n.add(ei(1.5,2.7,.22),"frame",H.clone().multiply(T(0,-.95,.07)),h),n.add(mt(),"trim",H.clone().multiply(T(0,2,.3,0,2.2,.14,.7)),h);continue}let B=1.22,k=D?2.05:1.85,F=r()<.78;n.add(D?Zn(B,k):Mi(B,k),F?"winLit":"winDark",H.clone().multiply(T(0,0,.035))),n.add(ei(B,k,.17),"frame",H.clone().multiply(T(0,0,.06)),e.frameC),n.add(mt(),"trim",H.clone().multiply(T(0,-.1,.12,0,B+.36,.13,.32)),h),e.shutters&&!D&&(n.add(mt(),"frame",H.clone().multiply(T(-B/2-.33,0,.08,0,.5,k,.08)),e.shutterC),n.add(mt(),"frame",H.clone().multiply(T(B/2+.33,0,.08,0,.5,k,.08)),e.shutterC)),r()<.16&&s.add("planter",H.clone().multiply(T(0,-.05,.36,0,.62,.62,.62)),Ke[Math.floor(r()*Ke.length)])}}}if(e.shop){let w=Math.min(a-1.2,8.5),S=t.clone().multiply(T(o,0,l/2));n.add(Mi(w,2.75),"shopWin",S.clone().multiply(T(0,.5,.04))),n.add(mt(),"trim",S.clone().multiply(T(0,.42,.1,0,w+.5,.14,.24)),h);for(let O=0;O<=4;O++)n.add(mt(),"frame",S.clone().multiply(T(-w/2+w*O/4,.5,.08,0,.14,2.75,.1)),e.frameC);let I=e.awningRed?"awningR":"awning",U=1.9;n.add(new _e(w+.8,U),I,S.clone().multiply(T(0,3.62,U/2*.8+.1,0,1,1,1,-Math.PI/2+.62))),n.add(mt(),"trim",S.clone().multiply(T(0,3.98,.1,0,w+1,.16,.22)),h);let y=e.shopSign%6;c>=2&&(n.add(xe(4.3,1.25,.18,.08,1),"trim",S.clone().multiply(T(0,4.3,.06)),h),n.add(new _e(4,1),"shop"+y,S.clone().multiply(T(0,4.92,.16))));let A=w>6?2:1;for(let O=0;O<A;O++){let H=A===1?0:(O-.5)*w*.55,D=S.clone().multiply(T(H,0,2.6));s.add("table",D.clone().multiply(T(0,0,0,r()*3))),s.add("chair",D.clone().multiply(T(-.95,0,0,Math.PI/2+.2))),s.add("chair",D.clone().multiply(T(.95,0,0,-Math.PI/2-.1))),r()<.6&&s.add("umbrella",D.clone().multiply(T(0,0,0,r()*3)),e.awningRed||r()<.5?"#FFFFFF":"#FFE3EA")}s.add("pot",S.clone().multiply(T(-w/2-.5,0,.5,0,1.1)),null),s.add("pot",S.clone().multiply(T(w/2+.5,0,.5,0,1.1)),null),i.lightsShop.push(S.clone().multiply(T(0,.01,2.2)))}if(e.balcony&&c>=2){let w=Math.min(a-2,4.6),S=t.clone().multiply(T(o,ba+.6,l/2));n.add(mt(),"trim",S.clone().multiply(T(0,0,.6,0,w,.22,1.2)),h),Ai(i,S.clone().multiply(T(0,.22,1.15)),w,.95),Ai(i,S.clone().multiply(T(-w/2,.22,.6,Math.PI/2)),1.1,.95),Ai(i,S.clone().multiply(T(w/2,.22,.6,Math.PI/2)),1.1,.95),r()<.7&&s.add("planter",S.clone().multiply(T(0,.2,.9,0,.8,.8,.8)),Ke[Math.floor(r()*Ke.length)])}return{H:f+.24,top:M}}var Ke=["#FF4F7B","#FF2D55","#FFD447","#FFFFFF","#FF8FB1","#F25C3B"];function Ai(i,t,e,n=1){let s=i.batch;s.add(mt(),"metal",t.clone().multiply(T(0,n-.06,0,0,e,.07,.07))),s.add(mt(),"metal",t.clone().multiply(T(0,.1,0,0,e,.05,.05)));let r=Math.max(2,Math.round(e/.32));for(let o=0;o<=r;o++)s.add(mt(),"metal",t.clone().multiply(T(-e/2+e*o/r,.1,0,0,.035,n-.15,.035)))}function kf(i,t,e,n,s,r,o,a){let l=i.batch,c=new nt(r);l.add(xe(e,n,e,.15,2),"stucco",t,c,{mode:"box",s:.25}),l.add(mt(),"trim",t.clone().multiply(T(0,n-.05,0,0,e+.4,.25,e+.4)),o);for(let u=0;u<4;u++){let h=t.clone().multiply(T(0,0,0,u*Math.PI/2)).multiply(T(0,n*.35,e/2));l.add(Zn(.9,1.7),a()<.7?"winLit":"winDark",h.clone().multiply(T(0,0,.03))),l.add(ei(.9,1.7,.14),"frame",h.clone().multiply(T(0,0,.05)),o)}if(s===0)l.add(qi(18),"pink",t.clone().multiply(T(0,n+.15,0,0,e*.95,e*.8,e*.95)),c.clone().lerp(new nt("#E8456E"),.5)),l.add(Yn(8,6),"trim",t.clone().multiply(T(0,n+.2+e*.4,0,0,.35)),o);else if(s===1)l.add(new mn(e*.78,e*.9,4).translate(0,e*.45,0),"pink",t.clone().multiply(T(0,n+.18,0,Math.PI/4)),"#E14E73");else for(let h=0;h<3;h++)for(let[f,d]of[[1,0],[-1,0],[0,1],[0,-1]]){let g=-e/2+.3+h*(e-.6)/2,x=f?f*(e/2):g,p=d?d*(e/2):g;l.add(mt(),"stucco",t.clone().multiply(T(x,n+.15,p,0,.42,.6,.42)),c)}}function Tu(i,t,e=6.2){let n=i.batch,s=e*.5625;n.add(xe(e,s,1,.35,3),"signBody",t.clone().multiply(T(0,.6,0))),n.add(new _e(e-.5,s-.5),"sign",t.clone().multiply(T(0,.6+s/2,.505))),n.add(new _e(e-.5,s-.5),"sign",t.clone().multiply(T(0,.6+s/2,-.505,Math.PI))),n.add(mt(),"metal",t.clone().multiply(T(-e*.3,0,0,0,.18,.7,.18))),n.add(mt(),"metal",t.clone().multiply(T(e*.3,0,0,0,.18,.7,.18))),i.glowSpots.push({m:t.clone().multiply(T(0,.6+s/2,1.2)),r:e*.9,c:"#FF5C86"})}function Ru(i,t,e=3.2){let n=i.batch;n.add(xe(e,e,e,.32,3),"signBody",t.clone().multiply(T(0,.25,0)));for(let s=0;s<4;s++)n.add(new _e(e-.5,e-.5),"glyphCube",t.clone().multiply(T(0,.25+e/2,0,s*Math.PI/2)).multiply(T(0,0,e/2+.006)));n.add(mt(),"trim",t.clone().multiply(T(0,0,0,0,e*.8,.25,e*.8)),"#FFF0F2")}function Wf(i){let t=Of();i.lots=t;let e=ie(99),n=new Map;for(let s of Hf){let r=null,o=1e9;for(let a of t){if(n.has(a.id))continue;let l=Math.hypot(a.x-s.at[0],a.z-s.at[1]);l<o&&(o=l,r=a)}r&&o<22&&n.set(r.id,s.what)}i.roofs=[];for(let s of t){let r=n.get(s.id),o=T(s.x,0,s.z,-s.theta),a=[[2,3],[2,3],[2,4],[1,3]][s.ring],l=a[0]+Math.floor(e()*(a[1]-a[0]+1));r&&r!=="sign"&&r!=="cube"&&(l=2),r==="mascot"&&(l=2);let c=_=>_[Math.floor(e()*_.length)],u=c(Su);r==="mascot"&&(u="#F7EAE1"),r==="coffee"&&(u="#F4E3D6");let h=new nt(u).getHSL({}).l>.83,f=h&&e()<.5?"#F48AA2":Yr,d={r:e,d:s.d,body:u,trim:f,bands:e()<.55,archTop:e()<.6,arched:e()<.18,shutters:e()<.3,shutterC:c(["#3F6B4E","#FFFFFF","#E9557A"]),frameC:h?"#FFFFFF":c(["#FFFFFF","#FFF0F3","#FCE4EA"]),doorC:Math.floor(e()*Vf.length),shop:s.ring<=1&&e()<.42||r==="coffee"||r==="burger"||r==="pizza",shopSign:Math.floor(e()*6),awningRed:e()<.3,balcony:e()<.3};r==="coffee"&&(d.shopSign=2),r==="pizza"&&(d.shopSign=1,d.awningRed=!0),r==="burger"&&(d.shopSign=5);let g=!r&&s.w>12.5&&e()<.45,x=[];if(g){let _=s.w*(.52+e()*.12),v=s.w-_,M=Ze(l+(e()<.5?-1:1),1,4),C=bu(i,o,{...d,x0:-s.w/2+_/2,w:_-.1,floors:l}),w=bu(i,o,{...d,x0:s.w/2-v/2,w:v-.1,d:s.d-1.2,floors:M,body:c(Su),shop:!1,noDoor:e()<.5});x.push({x0:-s.w/2+_/2,w:_,d:s.d,top:C.top,H:C.H},{x0:s.w/2-v/2,w:v,d:s.d-1.2,top:w.top,H:w.H})}else{let _=bu(i,o,{...d,x0:0,w:s.w,floors:l});x.push({x0:0,w:s.w,d:s.d,top:_.top,H:_.H})}let p=x[0],m=(_,v,M=0)=>o.clone().multiply(T(p.x0+_,p.H,v,M));if(r==="sign")Tu(i,m(0,-.5),Math.min(6.6,p.w*.62));else if(r==="cube")Ru(i,m(e()<.5?-p.w*.18:p.w*.18,0),3.1+e()*.6),wu(i,m,p,e,.5);else if(r&&r!=="mascot")i.roofs.push({what:r,m:m(0,0),w:p.w,d:p.d,lot:s});else if(r==="mascot"){i.roofs.push({what:r,m:o.clone().multiply(T(p.x0,p.H,0)),w:p.w,d:p.d,lot:s,top:p.top});let _=o.clone().multiply(T(0,p.H*.5+.2,-p.d/2-.02,Math.PI));i.batch.add(new _e(p.H*.62*.77,p.H*.62),"glyphDecal",_),i.batch.add(new _e(p.H*.5*.77,p.H*.5),"glyphDecal",o.clone().multiply(T(-p.w/2-.02,p.H*.5+.2,0,-Math.PI/2)))}else{let _=e();_<.3&&kf(i,m((e()-.5)*(p.w-4),(e()-.5)*(p.d-4)),2.8+e()*.8,3.2+e()*2.2,Math.floor(e()*3),u,f,e),_>.2&&wu(i,m,p,e,1),e()<.5&&fy(i,m,p,e)}for(let _=1;_<x.length;_++){let v=x[_],M=(C,w,S=0)=>o.clone().multiply(T(v.x0+C,v.H,w,S));e()<.6?wu(i,M,v,e,.7):e()<.5&&kf(i,M(0,0),2.6,3+e()*2,Math.floor(e()*3),c(Su),f,e)}s.blocks=x}}function wu(i,t,e,n,s){let r=Math.round((2+n()*4)*s);for(let o=0;o<r;o++){let a=(n()-.5)*(e.w-2.2),l=(n()-.5)*(e.d-2.2),c=.8+n()*.9;i.inst.add("bush",t(a,l,n()*6).multiply(T(0,0,0,0,c,c*(.8+n()*.4),c)),new nt().setHSL(.27+n()*.06,.5,.45+n()*.15).lerp(new nt(1,1,1),.5))}n()<.5&&i.inst.add("cypress"+Math.floor(n()*2),t((n()-.5)*(e.w-3),(n()-.5)*(e.d-3)).multiply(T(0,0,0,0,1.3,3.2+n()*1.5,1.3))),n()<.6&&i.inst.add("planter",t(0,e.d/2-1),Ke[Math.floor(n()*Ke.length)])}function fy(i,t,e,n){let s=i.batch,r=1+Math.floor(n()*2);for(let o=0;o<r;o++){let a=(n()-.5)*(e.w-3),l=(n()-.5)*(e.d-3);n()<.5?(s.add(xe(1.2,1.1,1.2,.12,1),"stucco",t(a,l),"#F7DCE2"),s.add(mt(),"trim",t(a,l).multiply(T(0,1.1,0,0,1.4,.14,1.4)),Yr)):(s.add(rn(14),"stucco",t(a,l).multiply(T(0,0,0,0,1.1,1.3,1.1)),"#F3C9D2"),s.add(qi(12),"trim",t(a,l).multiply(T(0,1.3,0,0,1.15,.5,1.15)),Yr))}}function Xf(i){let{inst:t}=i,e=ie(321),n=i.lots,s=(c,u,h)=>n.some(f=>{let d=c-f.x,g=u-f.z,x=Math.cos(f.theta),p=Math.sin(f.theta),m=Math.sin(f.theta),_=-Math.cos(f.theta),v=d*x+g*p,M=d*m+g*_;return Math.abs(v)<f.w/2+h&&Math.abs(M)<f.d/2+h}),r=(c,u,h=0)=>qr(c,u,h),o=(c,u,h=.6)=>Aa(c,u,3)&&!s(c,u,h)&&!r(c,u,.5)&&Math.hypot(c,u)>Ln+1.2;i.free=o;for(let c=0;c<30;c++){let u=c/30*Math.PI*2+.03,[h,f]=Ee(Ln+3.2,u);o(h,f,.3)&&(c%5===0?ys(i,h,f,e,1):c%5===2?Zi(i,h,f,e,7):c%5===4&&ni(i,h,f))}let a=0;for(let c=0;c<4e3&&a<340;c++){let u=e()*Math.PI*2,h=Ln+4+e()*70,[f,d]=Ee(h,u);o(f,d,.9)&&(i.trees.some(([g,x])=>Math.hypot(g-f,x-d)<3.4)||(e()<.55?Zi(i,f,d,e):ys(i,f,d,e,.75+e()*.35),a++))}for(let c of[51.5,67.5,83.5]){let u=Math.round(2*Math.PI*c/15);for(let h=0;h<u;h++){let f=h/u*Math.PI*2,[d,g]=Ee(c,f);o(d,g,.2)&&!i.trees.some(([x,p])=>Math.hypot(x-d,p-g)<1.8)&&ni(i,d,g)}}let l=70;for(let c=0;c<l;c++){let u=c/l*Math.PI*2+.02,[h,f]=Ee(un(u)-2.2,u);!s(h,f,.3)&&!r(h,f)&&ni(i,h,f)}for(let c=0,u=0;c<600&&u<40;c++){let h=e()*Math.PI*2,[f,d]=Ee(Ln+4+e()*60,h);o(f,d,1.2)&&(i.trees.some(([g,x])=>Math.hypot(g-f,x-d)<2.2)||(t.add("bench",T(f,0,d,-h+(e()<.5?0:Math.PI))),u++))}}function ys(i,t,e,n,s=1,r=0){let o=Math.floor(n()*3);i.inst.add("tree"+o,T(t,r,e,n()*Math.PI*2,s*(.9+n()*.2),s*(.9+n()*.25),s*(.9+n()*.2)),new nt().setHSL(.25+n()*.06,.4,.75+n()*.2).lerp(new nt(1,1,1),.55)),i.trees.push([t,e])}function Zi(i,t,e,n,s,r=0){let o=s||7+n()*5;i.inst.add("cypress"+Math.floor(n()*2),T(t,r,e,n()*6,1.5+n()*.5,o,1.5+n()*.5),new nt().setHSL(.3,.3,.8+n()*.2).lerp(new nt(1,1,1),.6)),i.trees.push([t,e])}function ni(i,t,e,n=0){i.inst.add("lamp",T(t,n,e,0)),i.lamps.push(new P(t,n+4.27,e))}var Ji="#F6EEE3",dy="#EFE4D6";function wa(i,t,e,n,s,r=24){let o=new gn;o.absarc(0,0,t,e,n,!1),o.absarc(0,0,i,n,e,!0),o.closePath();let a=new vi(o,{depth:s,bevelEnabled:!1,curveSegments:r});return a.rotateX(-Math.PI/2),a}function py(){return new oe({uniforms:{uTime:{value:0},uDay:{value:1},uSky:{value:new nt("#bfe3ff")},uDeep:{value:new nt("#2aa6d6")},uShallow:{value:new nt("#7fe0f0")},uGlow:{value:0}},vertexShader:`
      varying vec2 vP; varying vec3 vW;
      void main(){ vP = position.xy; vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,fragmentShader:`
      uniform float uTime; uniform float uDay; uniform vec3 uSky; uniform vec3 uDeep; uniform vec3 uShallow; uniform float uGlow;
      varying vec2 vP; varying vec3 vW;
      void main(){
        float r = length(vP);
        float w = sin(r * 7.0 - uTime * 3.2) * 0.5 + 0.5;
        float w2 = sin((vP.x + vP.y) * 5.0 + uTime * 1.7) * 0.5 + 0.5;
        vec3 c = mix(uDeep, uShallow, smoothstep(0.0, 1.0, r * 0.25) * 0.6 + w * 0.25);
        c = mix(c, uSky, pow(w * w2, 6.0) * 0.8);
        c += vec3(1.0) * pow(w, 18.0) * 0.35 * uDay;
        c += vec3(1.0, 0.75, 0.45) * uGlow * (0.25 + w * 0.2);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function my(){return new oe({transparent:!0,depthWrite:!1,side:Ue,uniforms:{uTime:{value:0},uC:{value:new nt("#dff6ff")},uO:{value:.75}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`
      uniform float uTime; uniform vec3 uC; uniform float uO; varying vec2 vUv;
      float h(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        float col = floor(vUv.x * 90.0);
        float sp = 1.6 + h(col) * 1.4;
        float s = fract(vUv.y * 3.0 + uTime * sp + h(col + 3.0));
        float a = smoothstep(0.0, 0.3, s) * (0.35 + 0.65 * h(col + 7.0));
        a *= smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        gl_FragColor = vec4(uC, a * uO);
      }`})}function qf(i){let{batch:t,inst:e,group:n}=i,s=ie(808),r=new Pn(Ln,160);r.rotateX(-Math.PI/2);let o=new jt(r,i.mats.get("piazza"));o.position.y=.035,o.receiveShadow=!0,o.name="piazza",n.add(o),t.add(Ae([[Ln+.62,0],[Ln+.55,.13],[Ln-.3,.13],[Ln-.35,.03]],160),"curb",null,"#E9D9CB"),t.add(Ae([[10.25,.03],[10.2,.17],[9.45,.17],[9.4,.3],[0,.3]],96),"curb",null,dy);for(let x=0;x<4;x++){let p=x*Math.PI/2+.2,m=(x+1)*Math.PI/2-.2;t.add(wa(5.9,7.7,p,m,.7),"curb",T(0,.3,0),"#F1E6DA"),t.add(wa(5.78,6.12,p-.01,m+.01,.13),"stucco",T(0,1,0),"#E5557A"),t.add(wa(7.48,7.82,p-.01,m+.01,.13),"stucco",T(0,1,0),"#E5557A"),t.add(wa(6.1,7.5,p,m,.06),"soil",T(0,1,0),"#5C3B28");let _=9;for(let v=0;v<_;v++){let M=p+(v+.5)/_*(m-p),C=6.8+(s()-.5)*.6,w=Math.cos(M)*C,S=-Math.sin(M)*C;v%3===1?e.add("bush",T(w,1.04,S,s()*6,.9,.8,.9),new nt(.9+s()*.1,1,.9)):e.add("flowers",T(w,1.04,S,s()*6,1.6,1.4,1.6),Ke[Math.floor(s()*Ke.length)])}}t.add(Ae([[0,.3],[4.45,.3],[4.6,.45],[4.6,1.15],[4.45,1.32],[4.1,1.32],[3.95,1.15],[3.95,.5],[0,.5]],72),"curb",null,"#F7F1EA");let a=py();i.fountainMats.push(a);let l=new jt(new Pn(3.96,64),a);l.rotation.x=-Math.PI/2,l.position.y=1,n.add(l),t.add(Ae([[.95,.5],[.8,.8],[.55,1.4],[.48,2.1],[.62,2.35],[0,2.4]],32),"curb",null,"#F7F1EA"),t.add(Ae([[.2,2.3],[1,2.35],[1.85,2.55],[2.05,2.75],[2,2.92],[1.75,2.9],[1,2.7],[0,2.7]],48),"curb",null,"#F9F4EE"),t.add(Ae([[.42,2.7],[.3,3.2],[.36,3.55],[0,3.6]],24),"curb",null,"#F7F1EA"),t.add(Ae([[.1,3.5],[.6,3.56],[.95,3.72],[1.02,3.86],[.85,3.9],[0,3.82]],32),"curb",null,"#F9F4EE"),t.add(Ae([[.22,3.85],[.16,4.3],[.24,4.5],[.12,4.85],[0,5.05]],16),"curb",null,"#F7F1EA");let c=new jt(new Pn(1.78,40),a);c.rotation.x=-Math.PI/2,c.position.y=2.86,n.add(c);let u=new jt(new Pn(.86,24),a);u.rotation.x=-Math.PI/2,u.position.y=3.83,n.add(u);let h=my();i.fountainMats.push(h);let f=new jt(new ne(2.02,2.5,1.85,48,1,!0),h);f.position.y=1.95,n.add(f);let d=new jt(new ne(1,1.35,.95,32,1,!0),h);d.position.y=3.4,n.add(d);let g=new jt(new ne(.06,.55,.9,16,1,!0),h);g.position.y=4.4,g.rotation.x=Math.PI,n.add(g),i.fountainParts=[f,d,g];for(let x=0;x<4;x++){let p=Math.PI/4+x*Math.PI/2,m=Math.cos(p)*17.5,_=Math.sin(p)*17.5;t.add(Ae([[3.05,0],[3.05,.85],[2.75,.85],[2.75,.55],[0,.55]],40),"curb",T(m,0,_),"#F2E8DE"),t.add(Ae([[2.78,.85],[3.12,.85],[3.12,.98],[2.78,.98],[2.78,.85]],40),"stucco",T(m,0,_),"#E35478"),t.add(new Pn(2.72,32).rotateX(-Math.PI/2),"grass",T(m,.62,_),"#6E9E3E");for(let v=0;v<10;v++){let M=v/10*Math.PI*2;e.add(v%2?"flowers":"bush",T(m+Math.cos(M)*2.1,.6,_+Math.sin(M)*2.1,s()*6,v%2?1.5:.7),v%2?Ke[Math.floor(s()*Ke.length)]:void 0)}ys(i,m,_,s,1.3,.6)}for(let x=0;x<8;x++){let p=Math.PI/8+x*Math.PI/4,m=12.4,_=Math.cos(p)*m,v=Math.sin(p)*m;v<-6&&Math.abs(_)<16||e.add("bench",T(_,.035,v,Math.atan2(-_,-v)))}for(let x=0;x<8;x++){let p=x*Math.PI/4+.32,m=Math.cos(p)*14.6,_=Math.sin(p)*14.6;_<-6&&Math.abs(m)<16||ni(i,m,_,.035)}for(let x=0;x<12;x++){let p=x*Math.PI/6+Math.PI/12,m=Math.cos(p)*10.9,_=Math.sin(p)*10.9;_<-6&&Math.abs(m)<16||e.add("planter",T(m,.17,_,Math.atan2(-m,-_),1,1,1),Ke[x%Ke.length])}for(let x=0;x<10;x++){let p=x*Math.PI*2/10+.1,m=Math.cos(p)*26.5,_=Math.sin(p)*26.5;Math.abs(m)<20&&_<-10||ni(i,m,_,.035)}}function Yf(i){let{batch:t,inst:e,group:n}=i,s=ie(1234),r=hn.s,o=T(hn.x,0,hn.z,0,r),a=T(hn.x,0,hn.z,0),l=(F,q,et,Y=0,at=1,Dt=at,j=at,rt=0,dt=0)=>o.clone().multiply(T(F,q,et,Y,at,Dt,j,rt,dt)),c=(F,q,et,Y=0,at=1,Dt=at,j=at)=>a.clone().multiply(T(F*r,q*r,et*r,Y,at,Dt,j)),u=(F,q)=>[hn.x+F*r,hn.z+q*r],h=24,f=14,d=5,g=4.5,x=d+g,p={mode:"box",s:1/4.2},m=f/2;t.add(mt(),"curb",l(0,0,.6,0,h+17,.62,f+2.6),"#E7DACB");for(let F=0;F<3;F++)t.add(mt(),"curb",l(0,0,8.9+.3+F*.6,0,13-F*.4,.47-F*.155,.6),"#EFE3D5");t.add(mt(),"stone",l(0,.6,0,0,h,x-.6,f),"#FFFFFF",p),t.add(mt(),"trim",l(0,.6,0,0,h+.24,.5,f+.24),"#E9DCCB"),t.add(mt(),"trim",l(0,d-.15,0,0,h+.5,.4,f+.5),Ji),t.add(mt(),"trim",l(0,x-.1,0,0,h+.7,.45,f+.7),Ji);for(let F of[-1,1])for(let q of[-1,1])for(let et=0;et<9;et++){let Y=et%2?.7:1.15,at=et%2?1.15:.7;t.add(mt(),"stone",l(F*(h/2+.07-Y/2),.95+et*.95,q*(f/2+.07-at/2),0,Y,.85,at),"#FFF6EA",p)}let _=1,v=x+.3,M=4.3,C=h/2+_,w=f/2+_,S=C-w,I=[[-C,v,w],[C,v,w],[C,v,-w],[-C,v,-w],[-S,v+M,0],[S,v+M,0]],U=(F,q,et)=>[...I[F],...I[q],...I[et]],y=[...U(0,1,5),...U(0,5,4),...U(2,3,4),...U(2,4,5),...U(1,2,5),...U(3,0,4)],A=new Jt;A.setAttribute("position",new Bt(y,3)),A.computeVertexNormals(),t.add(A,"roof",o,"#FFFFFF",{mode:"slope",s:1/3.2}),t.add(mt(),"trim",l(0,v-.32,0,0,C*2+.1,.34,w*2+.1),"#EFE2D2");let O=new ne(.2,.2,1,8).rotateZ(Math.PI/2);t.add(O,"matte",l(0,v+M+.05,0,0,S*2+.4,1,1),"#B9522E");for(let[F,q]of[[0,4],[1,5],[2,5],[3,4]]){let et=new P(...I[F]),Y=new P(...I[q]),at=et.clone().add(Y).multiplyScalar(.5),Dt=Y.clone().sub(et),j=Dt.length(),rt=new Xe().setFromUnitVectors(new P(1,0,0),Dt.normalize()),dt=new Yt().compose(at.add(new P(0,.08,0)),rt,new P(j,.85,.85));t.add(O,"matte",o.clone().multiply(dt),"#B9522E")}for(let F of[-6.5,6.8])t.add(mt(),"stone",l(F,v+1.2,-2.2,0,1.3,3.6,1.3),"#FFFFFF",p),t.add(mt(),"trim",l(F,v+4.75,-2.2,0,1.7,.25,1.7),Ji),t.add(mt(),"matte",l(F,v+5,-2.2,0,1.1,.5,.5),"#B9522E");let H=F=>l(F,.6,m);t.add(Mi(3.6,3.4),"shopWin",H(0).multiply(T(0,.05,.05))),t.add(ei(3.6,3.4,.3),"frame",H(0).multiply(T(0,.05,.08)),"#2F3F35");for(let F=-1;F<=1;F+=2)t.add(mt(),"frame",H(0).multiply(T(F*.9,.05,.09,0,.12,3.4,.08)),"#2F3F35");t.add(mt(),"frame",H(0).multiply(T(0,2.55,.09,0,3.6,.12,.08)),"#2F3F35"),t.add(mt(),"cloth",H(0).multiply(T(0,3.62,.75,0,4.6,.16,1.5)),"#FFFFFF");for(let F of[-7.6,-3.8,3.8,7.6])t.add(Zn(2.3,3.1),"shopWin",H(F).multiply(T(0,.25,.05))),t.add(ei(2.3,3.1,.24),"frame",H(F).multiply(T(0,.25,.08)),"#2F3F35"),t.add(mt(),"frame",H(F).multiply(T(0,.25,.09,0,.1,3,.08)),"#2F3F35"),t.add(mt(),"trim",H(F).multiply(T(0,.12,.18,0,2.7,.14,.36)),Ji);for(let[F,q,et]of[[Math.PI/2,f,h/2],[-Math.PI/2,f,h/2],[Math.PI,h,f/2]]){let Y=Math.floor(q/4.2);for(let at=0;at<Y;at++){let Dt=-q/2+q/Y*(at+.5);for(let[j,rt]of[[1.6,2.4],[d+.8,2.4]]){let dt=o.clone().multiply(T(0,0,0,F)).multiply(T(Dt,j,et));t.add(Mi(1.5,rt),"winLit",dt.clone().multiply(T(0,0,.04))),t.add(ei(1.5,rt,.2),"frame",dt.clone().multiply(T(0,0,.07)),"#2F3F35"),t.add(mt(),"frame",dt.clone().multiply(T(-1.2,0,.07,0,.7,rt,.1)),"#3E5E4A"),t.add(mt(),"frame",dt.clone().multiply(T(1.2,0,.07,0,.7,rt,.1)),"#3E5E4A")}}}for(let F of[-8.4,-2.8,2.8,8.4]){let q=l(F,d+.65,m);t.add(Mi(1.7,2.7),"winLit",q.clone().multiply(T(0,0,.04))),t.add(ei(1.7,2.7,.22),"frame",q.clone().multiply(T(0,0,.07)),"#F3EADF"),t.add(mt(),"frame",q.clone().multiply(T(0,0,.08,0,.1,2.7,.06)),"#3E5E4A"),t.add(mt(),"frame",q.clone().multiply(T(-1.35,0,.08,0,.75,2.7,.1)),"#3E6B4E"),t.add(mt(),"frame",q.clone().multiply(T(1.35,0,.08,0,.75,2.7,.1)),"#3E6B4E"),t.add(mt(),"trim",q.clone().multiply(T(0,2.85,.12,0,2.6,.22,.3)),Ji)}for(let F of[-5.6,0,5.6])e.add("sconce",c(F,d+2.9,m+.42));for(let F of[-5.6,5.6])e.add("sconce",c(F,3.4,m+.42));i.lamps.push(...[-5.6,0,5.6].map(F=>new P(hn.x+F*r,(d+2.95)*r,hn.z+(m+.45)*r)));let D=d;t.add(mt(),"trim",l(0,D-.12,m+.85,0,h+.6,.36,1.7),Ji);for(let F=0;F<9;F++)t.add(mt(),"trim",l(-h/2+1.2+F*(h-2.4)/8,D-.62,m+.45,0,.3,.5,.9),Ji);Ai(i,l(0,D+.24,m+1.62),h+.4,1.05),Ai(i,l(-h/2-.2,D+.24,m+.85,Math.PI/2),1.6,1.05),Ai(i,l(h/2+.2,D+.24,m+.85,Math.PI/2),1.6,1.05);for(let F=0;F<8;F++){let q=-h/2+1.6+F*(h-3.2)/7;Math.abs(q)<3.6||e.add("planter",c(q,D+.82,m+1.8,0,.9,.75,.6),Ke[F%3===0?1:F%3===1?0:4])}for(let F of[-11,-6,6,11])e.add("pot",c(F,D+.24,m+.9,0,1.05));t.add(xe(8.6,1.72,.3,.06,1),"trim",l(0,D-.55,m+1.72),"#FFFFFF"),t.add(new _e(8.4,1.58),"ristorante",l(0,D+.31,m+1.88)),i.glowSpots.push({m:l(0,D+.3,m+2.4),r:9,c:"#FFE2B8"});let z=(F,q,et,Y)=>e.add("bush",c(F,q,et,s()*6,Y*1.1,Y*.9,Y*.75),new nt(.75+s()*.2,.95,.75));for(let F=0;F<22;F++){let q=F/21,et=-h/2+.6+q*(h-1.2),Y=Math.sin(q*Math.PI*4)**2;Math.abs(et)<3.9||z(et,D-.8-Y*.5,m+.25,.9+s()*.4)}for(let F of[-1,1])for(let q=0;q<9;q++)z(F*(h/2-.1),.8+q*1.05,m+.2,.75+s()*.35);for(let F of[-1,1])for(let q=0;q<4;q++)z(F*(h/2-1.2-q*1.3),x-.3-s()*.4,m+.15,.7+s()*.3);for(let F of[-1,1]){let Y=F*(h/2+3.75),at=-.8;t.add(mt(),"stone",l(Y,.6,at,0,7.5,d-.6,11),"#FFFFFF",p),t.add(mt(),"trim",l(Y,d-.15,at,0,7.5+.4,.38,11+.4),Ji),t.add(mt(),"stone",l(Y,d+.2,at+11/2-.2,0,7.5,.55,.4),"#FFFFFF",p),Ai(i,l(Y,d+.75,at+11/2-.2),7.5,.8),Ai(i,l(Y+F*(7.5/2-.2),d+.2,at,Math.PI/2),11,1.2),t.add(mt(),"roofFlat",l(Y,d+.2,at,0,7.5-.1,.05,11-.1),"#EADDCF");let Dt=l(Y,.6,at+11/2);for(let j of[-2,1.6])t.add(Zn(2,2.9),"shopWin",Dt.clone().multiply(T(j,.2,.05))),t.add(ei(2,2.9,.22),"frame",Dt.clone().multiply(T(j,.2,.08)),"#2F3F35");F<0&&(t.add(new _e(6.4,2),"cloth",Dt.clone().multiply(T(0,3.65,.85,0,1,1,1,-Math.PI/2+.7)),"#2F6B55"),t.add(mt(),"cloth",Dt.clone().multiply(T(0,2.95,1.6,0,6.4,.34,.06)),"#2F6B55")),e.add("table",c(Y-F*.6,d+.25,at+1.2)),e.add("chair",c(Y-F*.6-.95,d+.25,at+1.2,Math.PI/2)),e.add("chair",c(Y-F*.6+.95,d+.25,at+1.2,-Math.PI/2)),e.add("umbrella",c(Y-F*.6,d+.25,at+1.2,0,1.15),"#FFFFFF"),e.add("pot",c(Y+F*2.6,d+.25,at+4.2,0,1.2)),e.add("pot",c(Y+F*2.6,d+.25,at-3.6,0,1.2)),Zi(i,...u(Y+F*4.6,at-3.5),s,10)}let B=m+4.4,k=[];for(let F of[-1,1])for(let q=0;q<2;q++)for(let et=0;et<3;et++)k.push([F*(5.6+et*4.4+q%2*1.6),B+q*4.6+et%2*.6]);for(let[F,q]of k){let et=c(F,.035,q,s()*.6);e.add("table",et);for(let Y=0;Y<4;Y++){if(s()<.2)continue;let at=Y*Math.PI/2+.4;e.add("chair",et.clone().multiply(T(Math.cos(at)*1,0,Math.sin(at)*1,-at-Math.PI/2)))}e.add("umbrella",et.clone().multiply(T(0,0,0,s()*3,1.05)),"#FFFFFF")}i.terrace=k.map(([F,q])=>new P(hn.x+F*r,0,hn.z+q*r));for(let F of[-1,1]){for(let q=0;q<4;q++)e.add("planter",c(F*(4.6+q*4.3),.035,B+8.1,0,1.25,1,1),Ke[(q+(F>0?2:0))%Ke.length]);e.add("planter",c(F*19.2,.035,B+2.5,Math.PI/2,1.25,1,1),Ke[1]),e.add("pot",c(F*3.2,.62,m+1.6,0,1.3)),e.add("pot",c(F*7.3,.035,m+3.4,0,1.25)),e.add("chalk",c(F*3.6,.035,B+6.6,F*.3)),Zi(i,...u(F*13.5,m+1.6),s,7)}i.restLights=[l(0,3,m+3.5),l(-10,2.6,B+2.4),l(10,2.6,B+2.4)];for(let F=0;F<7;F++){let q=-14+F*4.6+(s()-.5)*1.5;s()<.5?Zi(i,...u(q,-f/2-3.2-s()*1.5),s,8+s()*4):ys(i,...u(q,-f/2-3.6-s()*1.5),s,1)}}var hr=i=>new nt(i);function gy(i,t){let e=i.batch,n=1;e.add(Ae([[2.4,0],[4,.12],[4.45,.45],[4.35,.55],[3.5,.34],[0,.32]],48),"ceramic",t.clone().multiply(T(0,.05,0,0,n)),"#FBF8F4"),e.add(Ae([[1.9,.3],[2.5,.8],[2.95,1.9],[3.1,3.2],[3,3.32],[2.82,3.2],[2.7,2.2],[2.3,1.2],[0,1]],48),"ceramic",t.clone().multiply(T(0,.1,0,0,n)),"#FFFFFF");let s=new Wn(.95,.24,10,20,Math.PI*1.25);e.add(s,"ceramic",t.clone().multiply(T(2.95,2.1,0,0,n,n,n,0,-Math.PI*.62)),"#FFFFFF");let r=new Pn(2.86,40).rotateX(-Math.PI/2);e.add(r,"liquid",t.clone().multiply(T(0,2.95,0,0,n)),o=>{let a=Math.hypot(o.x-t.elements[12],o.z-t.elements[14])/2.86;return hr("#3C2216").lerp(hr("#A86F43"),Math.pow(Math.min(1,a),3)*.9)})}function Zf(i,t,e=0){let n=i.batch;n.add(xe(3,1.6,3,.3,2),"signBody",t.clone()),n.add(new mn(1.55,3.6,24,1,!0).rotateX(Math.PI).translate(0,1.8,0),"waffle",t.clone().multiply(T(0,1.25,0))),n.add(Ae([[1.5,0],[1.75,.1],[1.75,.45],[1.5,.45],[1.5,0]],24),"pink",t.clone().multiply(T(0,4.6,0)),"#FFFFFF");let s=[["#FFF2E8","#FFE1D2"],["#FFC2D2","#FF9FBA"],["#F3D9B4","#E9C38F"]][e%3],r=[[1.85,.62],[1.55,.56],[1.2,.5],[.82,.42]],o=5.25;r.forEach(([a,l],c)=>{let u=new Wn(a-l*.6,l,12,32);u.rotateX(Math.PI/2),n.add(u,"gloss",t.clone().multiply(T(0,o,0,c*.7)),hr(s[c%2])),o+=l*1.25}),n.add(new mn(.62,1.3,20).translate(0,.65,0),"gloss",t.clone().multiply(T(0,o-.2,0,0,1,1,1,.15)),hr(s[0])),e===1&&n.add(Yn(14,10),"gloss",t.clone().multiply(T(.1,o+1,0,0,.7)),"#D8203A")}function xy(i,t){let e=i.batch,n=7.2,s=5.4,r=new gn;r.moveTo(0,0),r.lineTo(n,-s/2),r.quadraticCurveTo(n+.9,0,n,s/2),r.lineTo(0,0);let o=new vi(r,{depth:.42,bevelEnabled:!0,bevelSize:.12,bevelThickness:.12,bevelSegments:2,curveSegments:12}),a=new vi((()=>{let f=new gn;return f.moveTo(.35,0),f.lineTo(n-.55,-s/2+.45),f.quadraticCurveTo(n+.1,0,n-.55,s/2-.45),f.lineTo(.35,0),f})(),{depth:.18,bevelEnabled:!0,bevelSize:.08,bevelThickness:.06,bevelSegments:2,curveSegments:12}),l=t.clone().multiply(T(0,2.7,0,.25,1,1,1,-.35,.92)).multiply(T(-2.5,0,-.25));e.add(o,"matte",l,"#E7A85A"),e.add(a,"gloss",l.clone().multiply(T(0,0,.5)),"#FFC53A");let c=new ne(.55,.55,s+.3,14);e.add(c,"matte",l.clone().multiply(T(n+.15,0,.25,0,1,1,1,0,0)),"#D88E44");let u=ie(5),h=[[2.6,.3],[4.2,-1.2],[4.6,1.1],[5.9,-.2],[3.4,-.6]];for(let[f,d]of h)e.add(new ne(.62,.62,.14,18).rotateX(Math.PI/2),"gloss",l.clone().multiply(T(f,d,.82)),"#C9302C");e.add(rn(10),"metal",t.clone().multiply(T(0,0,0,0,.32,2.9,.32))),e.add(xe(1.6,.5,1.6,.15,1),"signBody",t.clone())}function vy(i,t){let e=i.batch,n=ie(9),s=3;e.add(Ae([[s*.85,0],[s,.35],[s*1.02,.9],[s*.9,1.15],[0,1.15]],40),"matte",t.clone(),"#D99343"),e.add(Ae([[s*1.02,1.1],[s*1.08,1.5],[s*1.05,2],[s*.95,2.1],[0,2.1]],40),"matte",t.clone(),"#5A3220");let r=new re(s*2.05,.16,s*2.05,12,1,12),o=r.attributes.position;for(let c=0;c<o.count;c++){let u=o.getX(c),h=o.getZ(c),f=Math.max(0,Math.hypot(u,h)-s*.95);o.setY(c,o.getY(c)-f*f*.55)}r.computeVertexNormals(),e.add(r,"gloss",t.clone().multiply(T(0,2.18,0,.6)),"#FFC23A"),e.add(rn(28),"gloss",t.clone().multiply(T(0,2.25,0,0,s*1.9,.3,s*1.9)),"#E2412F");let a=new ne(s*1.12,s*1.12,.3,48,1),l=a.attributes.position;for(let c=0;c<l.count;c++){let u=l.getX(c),h=l.getZ(c),f=Math.atan2(h,u),d=1+Math.sin(f*11)*.05;l.setXYZ(c,u*d,l.getY(c)+Math.sin(f*11)*.12,h*d)}a.computeVertexNormals(),e.add(a,"matte",t.clone().multiply(T(0,2.65,0)),"#6DB33A"),e.add(Ae([[s*1.04,2.75],[s*1.06,3.2],[s*.95,4],[s*.7,4.6],[s*.35,4.92],[0,5]],40),"gloss",t.clone(),c=>hr("#E7A24B").lerp(hr("#C97A2E"),Math.max(0,(c.y-t.elements[13]-3)/2.2)*.6));for(let c=0;c<28;c++){let u=n()*Math.PI*2,h=Math.sqrt(n())*.82,f=Math.cos(u)*h*s,d=Math.sin(u)*h*s,g=2.75+(5-2.75)*Math.sqrt(Math.max(0,1-h*h))*.98;e.add(Yn(6,4),"gloss",t.clone().multiply(T(f,g+.02,d,u,.28,.1,.16)),"#FFF4DA")}}function yy(i,t){let e=i.batch,n=ie(12);e.add(Ae([[1.8,0],[3.2,.4],[3.9,1.4],[4.1,2.4],[3.95,2.5],[3.75,1.5],[3,.65],[0,.55]],48),"ceramic",t.clone().multiply(T(0,.1,0)),"#F35C82"),e.add(qi(24),"matte",t.clone().multiply(T(0,1.6,0,0,7,2.6,7)),"#EFC66B");for(let s=0;s<46;s++){let r=new Wn(.7+n()*.9,.11,6,20),o=n()*Math.PI*2,a=Math.sqrt(n())*2.6,l=1.7+Math.sqrt(Math.max(0,1-(a/3.5)**2))*1.25;e.add(r,"gloss",t.clone().multiply(T(Math.cos(o)*a,l,Math.sin(o)*a,n()*6,1,1,1,n()*1.2-.6+Math.PI/2,n()*.8)),n()<.5?"#F6D27E":"#EEC060")}e.add(Yi(77,2,.12,2),"gloss",t.clone().multiply(T(.2,2.9,-.2,0,2.6,.7,2.2)),"#C8301F");for(let[s,r]of[[.9,.4],[-.7,.6],[.1,-.9]])e.add(Yi(80+s*10,2,.1,2.5),"matte",t.clone().multiply(T(s,3.25,r,0,.95)),"#7A3A20");for(let[s,r,o]of[[-.3,.1,.4],[.5,-.4,2]])e.add(Yn(8,6),"gloss",t.clone().multiply(T(s,3.65,r,o,.55,.12,.3)),"#3E8A2E")}function Jf(i){for(let t of i.roofs){let e=t.m;t.what==="coffee"?gy(i,e.clone().multiply(T(0,.4,0,.4,.95))):t.what==="icecream"?Zf(i,e.clone().multiply(T(0,.2,0,.3,.95)),1):t.what==="icecream2"?Zf(i,e.clone().multiply(T(0,.2,0,1.2,.9)),0):t.what==="pizza"?xy(i,e.clone().multiply(T(0,.2,0,-.5,.9))):t.what==="burger"?(i.batch.add(xe(4.6,1.3,4.6,.35,2),"signBody",e.clone().multiply(T(0,.2,0))),vy(i,e.clone().multiply(T(0,1.5,0,0,.95)))):t.what==="pasta"&&yy(i,e.clone().multiply(T(0,.5,0,0,.9)))}}var Ei=i=>new nt(i),Kf=["#EC5F82","#F07795","#F48DA5","#F6A3B6","#F8B6C3","#F3C2C6","#F6D9CC","#F4E4D8","#E8839B"];function _y(i){let t=cn(i.seed*31),e=Je+i.h;return(n,s)=>{let r=n-i.x,o=s-i.z,a=Math.atan2(o,r),l=vs(i,a)*.9,c=Math.hypot(r,o)/l;if(c>=1)return e;let u=Math.pow(Math.max(0,1-c*c),1.4),h=.75+.5*(ti(t,r*.05+3,o*.05+7,3)+.5);return e+i.hill*u*h}}function Qf(i){let{batch:t}=i;i.islandTop={};for(let e of Ea){let n=ie(e.seed*101),s=cn(e.seed*5),r=Math.hypot(e.x,e.z)>260,o=r?48:72,a=6,l=Je+e.h,c=_y(e);i.islandTop[e.id]=c;let u=[],h=[],f=[];for(let S=0;S<=a;S++){let I=S/a,U=Gi(Je-4,l,I);for(let y=0;y<=o;y++){let A=y/o*Math.PI*2,O=vs(e,A),H=1+s(Math.cos(A)*4+I*3,Math.sin(A)*4+I*2)*.12,D=O*H*Gi(1.04,.9,Math.pow(I,1.3));u.push(e.x+Math.cos(A)*D,U+(S>0&&S<a?s(A*3,I*7)*.6:0),e.z+Math.sin(A)*D);let z=Ei("#A88573").lerp(Ei("#DDBBA3"),Ze(I*1.6-.2,0,1)).lerp(Ei("#EBD6C4"),Ze(I*2-1.2,0,1));z.multiplyScalar(.9+s(A*9,I*11)*.25),h.push(z)}}for(let S=0;S<a;S++)for(let I=0;I<o;I++){let U=S*(o+1)+I,y=U+o+1;f.push(U,y,U+1,U+1,y,y+1)}let d=new Jt;d.setAttribute("position",new Bt(u,3));let g=[];for(let S=0;S<=a;S++)for(let I=0;I<=o;I++)g.push(I/o*12,S/a*2);d.setAttribute("uv",new Bt(g,2)),d.setIndex(f),d.computeVertexNormals();let x=h;t.add(d,"rock",null,(S,I,U)=>x[U]);let p=r?7:10,m=[],_=[];m.push(e.x,c(e.x,e.z),e.z);for(let S=1;S<=p;S++){let I=S/p;for(let U=0;U<o;U++){let y=U/o*Math.PI*2,A=vs(e,y),O=1+s(Math.cos(y)*4+1*3,Math.sin(y)*4+1*2)*.12,D=A*O*.9*I,z=e.x+Math.cos(y)*D,B=e.z+Math.sin(y)*D;m.push(z,S===p?l:c(z,B),B)}}for(let S=0;S<o;S++)_.push(0,1+(S+1)%o,1+S);for(let S=1;S<p;S++)for(let I=0;I<o;I++){let U=1+(S-1)*o+I,y=1+(S-1)*o+(I+1)%o,A=U+o,O=y+o;_.push(U,y,A,y,O,A)}let v=new Jt;v.setAttribute("position",new Bt(m,3)),v.setAttribute("uv",new Bt(new Float32Array(m.length/3*2),2)),v.setIndex(_),v.computeVertexNormals();let M=Ei("#5F8A3A"),C=Ei("#93B65A"),w=Ei("#E2CDB0");t.add(v,"grass",null,(S,I)=>{let U=(S.y-l)/Math.max(1,e.hill),y=M.clone().lerp(C,Ze(U*.9+I.y*.2-.1,0,1));return Math.hypot(S.x-e.x,S.z-e.z)>vs(e,Math.atan2(S.z-e.z,S.x-e.x))*.8&&y.lerp(w,.35),y},{mode:"box",s:1/6}),Ay(i,e,n,c,r)}}function My(i,t,e,n,s,r,o){let a=i.batch,l=s*3.2+.3,c=Ei(r);a.add(xe(e,l,n,.2,1),"stucco",t,c,{mode:"box",s:.25}),a.add(mt(),"trim",t.clone().multiply(T(0,l-.1,0,0,e+.4,.3,n+.4)),"#FFF4EE"),a.add(mt(),"stucco",t.clone().multiply(T(0,l+.15,0,0,e+.2,.7,n+.2)),c.clone().lerp(Ei("#ffffff"),.15)),a.add(mt(),"roofFlat",t.clone().multiply(T(0,l+.86,0,0,e-.5,.05,n-.5)),c.clone().lerp(Ei("#FFF0EA"),.5));for(let u=0;u<4;u++){let h=u%2?n:e,f=u%2?e/2:n/2,d=Math.max(1,Math.floor((h-1)/2.8));for(let g=0;g<s;g++)for(let x=0;x<d;x++){let p=-h/2+h/d*(x+.5),m=t.clone().multiply(T(0,0,0,u*Math.PI/2)).multiply(T(p,g*3.2+.9,f));a.add(o()<.5?Zn(1,1.7):Mi(1,1.6),o()<.8?"winLit":"winDark",m.clone().multiply(T(0,0,.03)))}}return l+.85}function Cu(i,t,e,n){let s=i.batch,r="#F07795",o="#F6B2C0",a=[[0,0,2.4,13],[-6,3.5,1.6,8.5],[6,2.5,1.7,9.5],[-2.5,-5,1.5,7.5],[4.5,-4.5,1.4,7]];a.forEach(([c,u,h,f],d)=>{let g=t.clone().multiply(T(c*e,0,u*e));if(s.add(rn(20),"stucco",g.clone().multiply(T(0,0,0,0,h*2*e,f*e,h*2*e)),d===0?"#F48DA5":r,{mode:"box",s:.25}),s.add(rn(20),"trim",g.clone().multiply(T(0,f*e-.2,0,0,h*2.3*e,.45,h*2.3*e)),"#FFF0F2"),d%2===0)s.add(Xr(20),"pink",g.clone().multiply(T(0,f*e+.2,0,0,h*2.5*e,h*2.6*e,h*2.5*e)),"#E2486E");else for(let x=0;x<8;x++){let p=x/8*Math.PI*2;s.add(mt(),"stucco",g.clone().multiply(T(Math.cos(p)*h*e,f*e+.2,Math.sin(p)*h*e,-p,.55,.7,.4)),o)}for(let x=0;x<3;x++){let p=x/3*Math.PI*2+.3,m=g.clone().multiply(T(0,f*e*(.45+x*.12),0,p)).multiply(T(0,0,h*e+.02));s.add(Zn(.7,1.3),n()<.85?"winLit":"winDark",m)}}),[[0,1],[0,2],[1,3],[2,4],[3,4]].forEach(([c,u])=>{let[h,f]=a[c],[d,g]=a[u],x=Math.hypot(d-h,g-f)*e,p=Math.atan2(-(g-f),d-h),m=t.clone().multiply(T((h+d)/2*e,0,(f+g)/2*e,p));s.add(mt(),"stucco",m.clone().multiply(T(0,0,0,0,x,4.2*e,1.1)),"#EC7F96",{mode:"box",s:.25});let _=Math.floor(x/1.1);for(let v=0;v<_;v++)s.add(mt(),"stucco",m.clone().multiply(T(-x/2+.5+v*1.1,4.2*e,0,0,.55,.6,1.1)),o)}),i.glowSpots.push({m:t.clone().multiply(T(0,6*e,0)),r:14*e,c:"#FFB070"})}function Ay(i,t,e,n,s){let{batch:r}=i,o=(u,h)=>[t.x+u,n(t.x+u,t.z+h),t.z+h],a=t.r,l=(u,h=.15,f=.82,d=.5)=>{for(let g=0;g<u;g++){let x=e()*Math.PI*2,p=a*(h+e()*(f-h)),[m,_,v]=o(Math.cos(x)*p,Math.sin(x)*p);e()<d?Zi(i,m,v,e,6+e()*6,_-.2):ys(i,m,v,e,.8+e()*.5,_-.2)}},c=(u,h,f,d=2)=>{for(let g=0;g<u;g++){let x=e()*Math.PI*2,p=a*(h+e()*(f-h)),[m,_,v]=o(Math.cos(x)*p,Math.sin(x)*p),M=4.5+e()*3,C=4+e()*2.5,w=My(i,T(m,_-.4,v,-x+Math.PI/2+(e()-.5)*.5),M,C,1+Math.floor(e()*d),Kf[Math.floor(e()*Kf.length)],e);e()<.25&&i.inst.add("bush",T(m+.5,_-.4+w,v,0,.8),null)}};if(t.kind==="town"){let[u,h,f]=o(0,0);Cu(i,T(u,h-.3,f,e()*3),1,e),c(10,.4,.8,2),l(34,.25,.88,.55)}else if(t.kind==="hill"){let[u,h,f]=o(-2,3);Tu(i,T(u,h-.3,f,-.35),8.4);let[d,g,x]=o(10,-6);Cu(i,T(d,g-.3,x,.6),.7,e),c(16,.3,.82,2),l(50,.15,.88,.5);let[p,m,_]=o(-12,-8);Ru(i,T(p,m-.2,_,.4),3.6)}else if(t.kind==="lighthouse")i.lighthouseAt=o(2,0),c(2,.45,.65,1),l(6,.4,.8,.6);else if(t.kind==="ferris"){i.ferrisAt=o(0,1),c(2,.55,.75,1),l(5,.55,.85,.5);for(let u=0;u<6;u++){let h=u/6*Math.PI*2,[f,d,g]=o(Math.cos(h)*11,Math.sin(h)*11);ni(i,f,g,d-.1)}}else if(t.kind==="small"){if(c(3,.2,.6,2),l(16,.15,.88,.5),e()<.6){let[u,h,f]=o(0,0);Ey(i,T(u,h-.3,f),e)}}else if(t.kind==="wildtown"){c(12,.45,.82,2),l(60,.1,.88,.5);let[u,h,f]=o(0,0);Cu(i,T(u,h-.5,f,.3),1.1,e)}else l(s?80:30,.05,.88,.45),c(s?4:2,.55,.8,1)}function Ey(i,t,e){let n=i.batch;n.add(rn(18),"stucco",t.clone().multiply(T(0,0,0,0,3.6,9,3.6)),"#F48DA5",{mode:"box",s:.25}),n.add(rn(18),"trim",t.clone().multiply(T(0,8.8,0,0,4.2,.4,4.2)),"#FFF0F2"),n.add(Xr(18),"pink",t.clone().multiply(T(0,9.2,0,0,4.6,4.2,4.6)),"#E2486E");for(let s=0;s<3;s++)n.add(Zn(.7,1.3),"winLit",t.clone().multiply(T(0,4+s*1.4,0,s*2.1)).multiply(T(0,0,1.82)))}function Sy(){return new oe({fog:!1,uniforms:{uSun:{value:new P(0,1,0)},uLit:{value:new nt("#86A874")},uShade:{value:new nt("#5E7F72")},uHaze:{value:new nt("#CFE5F6")},uHazeK:{value:.55}},vertexShader:`
      attribute float aH;
      varying vec3 vN; varying float vH; varying vec3 vW;
      void main(){
        vN = normalize(mat3(modelMatrix) * normal);
        vH = aH;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform vec3 uSun; uniform vec3 uLit; uniform vec3 uShade; uniform vec3 uHaze; uniform float uHazeK;
      varying vec3 vN; varying float vH; varying vec3 vW;
      void main(){
        float l = clamp(dot(normalize(vN), normalize(uSun)) * 0.75 + 0.35, 0.0, 1.0);
        vec3 c = mix(uShade, uLit, l);
        float k = clamp(uHazeK + (1.0 - vH) * 0.28, 0.0, 0.96);
        c = mix(c, uHaze, k);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function jf(i){let t=ie(606),e=[];for(let f=0;f<24;f++){let d=f<16,g=d?-1.3+f/15*2.6+(t()-.5)*.1:t()*Math.PI*2,x=(d?1250:1350)+t()*350,p=(d?30:22)+t()*(d?48:30),m=170+t()*190;e.push([Math.sin(g)*x,-Math.cos(g)*x,p,m,f])}let n=[],s=[],r=[],o=[],a=40,l=9;for(let[f,d,g,x,p]of e){let m=cn(700+p),_=n.length/3,v=C=>1+m(Math.cos(C)*1.3+4,Math.sin(C)*1.3+4)*.45,M=[(t()-.5)*.25,(t()-.5)*.25];for(let C=0;C<=l;C++){let w=C/l;for(let S=0;S<a;S++){let I=S/a*Math.PI*2,U=Math.pow(1-w,1.35)*v(I)*(.5+.5*(1-w)),y=f+(Math.cos(I)*U+M[0]*w)*x,A=d+(Math.sin(I)*U+M[1]*w)*x*.7,O=Je-3+w*g*(1+m(Math.cos(I)*2,Math.sin(I)*2)*.12);n.push(y,O,A),r.push(w)}}for(let C=0;C<l;C++)for(let w=0;w<a;w++){let S=_+C*a+w,I=_+C*a+(w+1)%a,U=S+a,y=I+a;o.push(S,U,I,I,U,y)}}let c=new Jt;c.setAttribute("position",new Bt(n,3)),c.setAttribute("aH",new Bt(r,1)),c.setIndex(o),c.computeVertexNormals();let u=Sy(),h=new jt(c,u);h.name="montagne",h.renderOrder=-50,i.scene.add(h),i.mountains={mesh:h,mat:u}}function $f(i){let t=ie(909),e=i.mats.get("cloud"),n=[];for(let a=0;a<26;a++){let l=[],c=9+Math.floor(t()*9),u=40+t()*70;for(let m=0;m<c;m++){let _=m/(c-1)-.5,v=(10+t()*14)*(1-Math.abs(_)*.9),M=Yi(950+a*20+m,1,.08,1.8).clone();M.scale(v*2,v*1.7,v*1.8),M.translate(_*u+(t()-.5)*8,v*.5+t()*6+(1-Math.abs(_)*2)*10,(t()-.5)*16),l.push(M)}let h=In(l,!1),f=h.attributes.position;for(let m=0;m<f.count;m++)f.getY(m)<2&&f.setY(m,2+(f.getY(m)-2)*.15);let d,g,x;a<18?(d=-1.5+a/17*3+(t()-.5)*.15,g=650+t()*450,x=25+t()*70):(d=t()*Math.PI*2,g=600+t()*400,x=40+t()*90);let p=.8+t()*.7;h.applyMatrix4(T(Math.sin(d)*g,x,-Math.cos(d)*g,-d+(t()-.5)*.6,p,p*(.8+t()*.3),p)),h.computeVertexNormals(),n.push(h)}let s=In(n,!1),r=new jt(s,e);r.name="nuvole",r.frustumCulled=!1;let o=new Ce;o.name="clouds",o.add(r),i.scene.add(o),i.clouds=o}var fr=i=>new nt(i);function td(i){let t=i.batch;for(let e of Sa){let[n,s]=e.a,[r,o]=e.b,a=Math.hypot(r-n,o-s),l=(r-n)/a,c=(o-s)/a,u=Math.atan2(-c,l),h=Math.max(2,Math.round(a/9)),f=a/h;for(let d=0;d<h;d++){let g=(d+.5)/h,x=n+l*a*g,p=s+c*a*g,m=Gi(e.y0,e.y1,g),_=Je-1.5,v=m-_,M=ya(+(f+.02).toFixed(2),+v.toFixed(2),e.w,1,+(f-2).toFixed(2),+(v-2.4).toFixed(2),0),C=T(x,_,p,u);t.add(M,"stucco",C.clone().multiply(T(0,0,-e.w/2)),"#EA8098",{mode:"box",s:.25}),t.add(mt(),"paving",T(x,m-.05,p,u,f+.05,.12,e.w-.6),"#FFFFFF",{mode:"box",s:1/7}),t.add(mt(),"trim",T(x,m-.6,p,u,f+.05,.4,e.w+.5),"#F8C7CF");for(let U of[-1,1])t.add(mt(),"stucco",T(x,m,p,u).multiply(T(0,0,U*(e.w/2-.2),0,f+.02,.9,.42)),"#F29AAE"),t.add(mt(),"trim",T(x,m+.9,p,u).multiply(T(0,0,U*(e.w/2-.2),0,f+.04,.14,.6)),"#FFF4EE");let w=n+l*f*d,S=s+c*f*d,I=Gi(e.y0,e.y1,d/h);for(let U of[-1,1]){let y=T(w,I,S,u).multiply(T(0,0,U*(e.w/2-.2)));t.add(xe(.7,1.3,.7,.08,1),"stucco",y,"#EC7F96"),t.add(mt(),"trim",y.clone().multiply(T(0,1.3,0,0,.9,.14,.9)),"#FFF4EE")}if(d%2===1){let U=T(x,m,p,u).multiply(T(0,0,e.w/2-.9)),y=new P().setFromMatrixPosition(U);ni(i,y.x,y.z,m)}}}}function ed(i){if(!i.lighthouseAt)return;let[t,e,n]=i.lighthouseAt,s=i.batch,r=T(t,e-.3,n,0);s.add(xe(8,1.2,8,.3,2),"stucco",r,"#F4E8E0");let o=18,a=f=>Gi(2.7,2.05,f/o);s.add(Ae([[2.9,0],[2.7,.6],[2.05,o],[2.4,o+.15],[2.4,o+.45],[0,o+.5]],32),"stucco",r.clone().multiply(T(0,1.2,0)),"#FFFFFF");for(let[f,d]of[[4.5,6.6],[10.5,12.6]])s.add(new ne(a(d)+.05,a(f)+.05,d-f,32,1,!0),"stucco",r.clone().multiply(T(0,1.2+(f+d)/2,0)),"#EF4D74");let l=Math.atan2(-t,-n);s.add(new _e(2,2.6),"glyphDecal",r.clone().multiply(T(0,1.2+8.4,0,l)).multiply(T(0,0,a(8.4)+.08)));let c=1.2+o+.45;s.add(rn(28),"trim",r.clone().multiply(T(0,c,0,0,6.6,.32,6.6)),"#FFF2F4");for(let f=0;f<24;f++){let d=f/24*Math.PI*2;s.add(mt(),"metal",r.clone().multiply(T(Math.cos(d)*3.15,c+.32,Math.sin(d)*3.15,0,.06,1,.06)))}s.add(new Wn(3.15,.06,6,40).rotateX(Math.PI/2),"metal",r.clone().multiply(T(0,c+1.3,0))),s.add(rn(20),"beacon",r.clone().multiply(T(0,c+.32,0,0,3.2,2.4,3.2)));for(let f=0;f<8;f++){let d=f/8*Math.PI*2;s.add(mt(),"metal",r.clone().multiply(T(Math.cos(d)*1.62,c+.32,Math.sin(d)*1.62,-d,.12,2.4,.12)))}s.add(qi(20),"pink",r.clone().multiply(T(0,c+2.7,0,0,3.8,2.6,3.8)),"#E8456E"),s.add(Yn(8,6),"metal",r.clone().multiply(T(0,c+4.1,0,0,.45))),s.add(xe(5,3.6,4,.2,1),"stucco",r.clone().multiply(T(5.4,1.2,1.5)),"#F6A3B6"),s.add(new mn(3.6,1.8,4).translate(0,.9,0),"pink",r.clone().multiply(T(5.4,4.8,1.5,Math.PI/4,1,1,.8)),"#E2486E");let u=new Sn({map:i.T.beam,color:16773572,transparent:!0,opacity:0,blending:en,depthWrite:!1,side:Ue,fog:!1}),h=new Ce;for(let f of[1,-1]){let d=new jt(new _e(9,70).translate(0,35,0),u);d.rotation.z=f*Math.PI/2;let g=d.clone();g.rotation.x=Math.PI/2,h.add(d,g)}h.position.set(t,e-.3+c+1.5,n),i.scene.add(h),i.beam={group:h,mat:u},i.anims.push(f=>{h.rotation.y=f*.55}),i.lamps.push(new P(t,e-.3+c+1.5,n))}function nd(i){if(!i.ferrisAt)return;let[t,e,n]=i.ferrisAt,s=i.batch,r=8.2,o=10.2,a=Math.atan2(-t,-n)+.55,l=T(t,e-.2,n,a);s.add(xe(10,.8,5,.25,1),"stucco",l,"#F6D9CC");for(let U of[-1,1])for(let y of[-1,1]){let A=new ne(.16,.22,o/Math.cos(.33)+.4,8).translate(0,o/Math.cos(.33)/2,0);s.add(A,"pink",l.clone().multiply(T(-y*o*Math.tan(.33),.7,U*1.3,0,1,1,1,0,-y*.33)),"#F7F2F4")}let c=new Ce;c.position.set(0,o+.7,0);let u=new xn(i.mats,{name:"ruota",noCast:!1});for(let U of[-.75,.75])u.add(new Wn(r,.2,8,72),"pink",T(0,0,U),"#FF4A78"),u.add(new Wn(r*.55,.12,6,48),"pink",T(0,0,U),"#FFFFFF");let h=16;for(let U=0;U<h;U++){let y=U/h*Math.PI*2;for(let A of[-.75,.75])u.add(mt(),"pink",T(Math.cos(y)*r/2,Math.sin(y)*r/2-.05,A,0,1,1,1,0,y).multiply(T(0,0,0,0,r,.09,.09)),"#FFFFFF");u.add(mt(),"pink",T(Math.cos(y)*r,Math.sin(y)*r,0,0,.1,.1,1.5).multiply(T(0,-.5,0)),"#FFFFFF")}u.add(new ne(.6,.6,2.2,16).rotateX(Math.PI/2),"pink",T(),"#FF4A78");for(let U=0;U<48;U++){let y=U/48*Math.PI*2;for(let A of[-.75,.75])u.add(Yn(6,4),"bulb",T(Math.cos(y)*(r+.22),Math.sin(y)*(r+.22),A,0,.26),U%2?"#FFE3A6":"#FFC2D6")}u.build(c);let f=12,d=["#FF4A78","#FFB3C7","#FFFFFF","#F7A7B4"],g=(U,y)=>{let A=U.attributes.position.count,O=new nt(y),H=new Float32Array(A*3);for(let D=0;D<A;D++)H[D*3]=O.r,H[D*3+1]=O.g,H[D*3+2]=O.b;return U.setAttribute("color",new ue(H,3)),U},x=g(xe(1.4,1.3,1.2,.22,2).clone().translate(0,-1.75,0),"#FFFFFF"),p=g(qi(10).clone().applyMatrix4(T(0,-.45,0,0,1.6,.6,1.4)),"#FFFFFF"),m=new sn(x,i.mats.get("pink"),f),_=new sn(p,i.mats.get("pink"),f);for(let U=0;U<f;U++)m.setColorAt(U,new nt(d[U%d.length]));for(let U of[m,_])U.castShadow=!0,U.receiveShadow=!0,U.instanceMatrix.setUsage(qn),U.frustumCulled=!1,c.add(U);let v=new Yt,M=new Xe,C=new P,w=new P(1,1,1),S=new P(0,0,1),I=new Ce;I.applyMatrix4(l),I.add(c),i.scene.add(I),i.anims.push(U=>{let y=U*.07;c.rotation.z=y,M.setFromAxisAngle(S,-y);for(let A=0;A<f;A++){let O=A/f*Math.PI*2;C.set(Math.cos(O)*r,Math.sin(O)*r,0),v.compose(C,M,w),m.setMatrixAt(A,v),_.setMatrixAt(A,v)}m.instanceMatrix.needsUpdate=!0,_.instanceMatrix.needsUpdate=!0})}function Pu(i,t,e,n=.35){let s=new re(i,e,t,12,2,4),r=s.attributes.position;for(let o=0;o<r.count;o++){let a=r.getX(o),l=r.getY(o),c=r.getZ(o),u=a/i+.5,h=u>1-n?Math.cos((u-(1-n))/n*Math.PI/2):1,f=.5-(l/e+.5);c*=Math.max(.02,h)*(1-Math.max(0,-l/e)*.55),u>1-n&&(l+=(u-(1-n))/n*e*.25*(l>0?1:.2)),r.setXYZ(o,a,l,c)}return s.computeVertexNormals(),s}function by(i){let t=new xn(i.mats,{name:"yacht"});t.add(Pu(16,4.6,2.4,.4),"hull",T(0,.6,0),n=>n.y<.25?fr("#2B3A67"):fr("#FFFFFF")),t.add(xe(8.5,1.6,3.6,.4,2),"hull",T(-1.2,1.8,0),"#FFFFFF"),t.add(xe(5,1.3,3,.35,2),"hull",T(-1.8,3.4,0),"#FFFFFF"),t.add(mt(),"winDark",T(-1,2.2,0,0,7.6,.7,3.65)),t.add(mt(),"winLit",T(-1.6,3.65,0,0,4.4,.6,3.05)),t.add(rn(8),"metal",T(-1.8,4.7,0,0,.15,1.6,.15));let e=new Ce;return t.build(e),e}function wy(i,t){let e=new xn(i.mats,{name:"vela"});e.add(Pu(6.2,2,1.2,.45),"hull",T(0,.3,0),o=>o.y<.05?fr("#E2486E"):fr("#FFFFFF")),e.add(rn(8),"metal",T(-.2,.9,0,0,.12,8.5,.12));let n=new Jt;n.setAttribute("position",new Bt([-.1,1.5,0,-2.8,1.5,0,-.1,9,0],3)),n.computeVertexNormals(),e.add(n,"sail",T(0,0,0),"#FFFFFF");let s=new Jt;s.setAttribute("position",new Bt([.1,1.4,0,2.9,1,0,.1,8,0],3)),s.computeVertexNormals(),e.add(s,"sail",T(0,0,0),"#FFF6F8");let r=new Ce;return e.build(r),r}function Ty(i){let t=new xn(i.mats,{name:"motoscafo"});t.add(Pu(5,2,1,.4),"hull",T(0,.25,0),n=>n.y<0?fr("#E9557A"):fr("#FFFFFF")),t.add(xe(1.6,.7,1.6,.2,1),"hull",T(-.6,.75,0),"#FFFFFF"),t.add(mt(),"winDark",T(.25,.95,0,0,.1,.45,1.5));let e=new Ce;return t.build(e),e}function id(i){let t=ie(4242),e=new Sn({map:Ry(),color:16777215,transparent:!0,opacity:.55,depthWrite:!1,fog:!0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});i.wakeMat=e;let n=[{c:[-5,-142],rx:58,rz:18,sp:.012,kind:"yacht"},{c:[55,-175],rx:40,rz:22,sp:-.016,kind:"sail"},{c:[-40,-110],rx:26,rz:14,sp:.02,kind:"sail"},{c:[10,-240],rx:60,rz:25,sp:.01,kind:"sail"},{c:[150,-110],rx:25,rz:30,sp:-.018,kind:"sail"},{c:[-120,-200],rx:40,rz:20,sp:.014,kind:"motor"},{c:[80,-60],rx:18,rz:10,sp:.03,kind:"motor"},{c:[-110,80],rx:40,rz:30,sp:.012,kind:"sail"},{c:[120,150],rx:45,rz:30,sp:-.012,kind:"yacht"},{c:[-150,-20],rx:20,rz:30,sp:.02,kind:"motor"},{c:[170,-230],rx:50,rz:20,sp:.011,kind:"sail"}],s=[];for(let r of n){let o=r.kind==="yacht"?by(i):r.kind==="sail"?wy(i,t):Ty(i),a=new jt(new _e(1,1).rotateX(-Math.PI/2),e),l=r.kind==="yacht"?26:r.kind==="motor"?16:9,c=r.kind==="yacht"?9:r.kind==="motor"?6:3.5;a.scale.set(l,1,c),a.position.set(-l/2-(r.kind==="yacht"?6:2),.02,0),a.renderOrder=2,o.add(a),o.position.y=Je,i.scene.add(o),s.push({g:o,p:r,ph:t()*Math.PI*2})}i.anims.push(r=>{for(let o of s){let{p:a}=o,l=o.ph+r*a.sp,c=a.c[0]+Math.cos(l)*a.rx,u=a.c[1]+Math.sin(l)*a.rz,h=-Math.sin(l)*a.rx*Math.sign(a.sp),f=Math.cos(l)*a.rz*Math.sign(a.sp);o.g.position.set(c,Je+Math.sin(r*1.3+o.ph)*.08,u),o.g.rotation.set(Math.sin(r*1.1+o.ph)*.03,Math.atan2(-f,h),Math.sin(r*.9+o.ph*2)*.03)}})}function Ry(){let e=document.createElement("canvas");e.width=256,e.height=64;let n=e.getContext("2d");for(let r=0;r<256;r++){let o=r/256,a=.12+(1-o)*.38,l=Math.pow(o,1.6);for(let c of[-1,1]){let u=n.createRadialGradient(r,32+c*a*64,0,r,32+c*a*64,6);u.addColorStop(0,`rgba(255,255,255,${.9*l})`),u.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=u,n.fillRect(r-6,0,12,64)}n.fillStyle=`rgba(255,255,255,${.25*l})`,n.fillRect(r,64/2-3*o,1,6*o)}let s=new Gn(e);return s.colorSpace=Be,s}function Cy(i){let t=new xn(i.mats,{name:"mongolfiera",noCast:!0}),e=[[1,0],[1.6,1],[3,2.6],[4.5,4.4],[5.2,6.2],[5.1,7.8],[4.2,9.2],[2.6,10.1],[0,10.4]],n=new rr(e.map(([o,a])=>new it(o,a))),s=new cs(n.getPoints(28).map(o=>new it(Math.max(.001,o.x),o.y)),32);t.add(s,"balloon",T(0,3.2,0)),t.add(xe(1.6,1.2,1.6,.15,1),"wood",T(0,0,0),"#9A6338");for(let[o,a]of[[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]])t.add(rn(4),"metal",T(o,1.2,a,0,.05,2.2,.05));let r=new Ce;return t.build(r),r}function sd(i){let t=ie(77),e=[[-78,36,-52,1.45],[38,47,-196,1.05],[190,58,-120,.95],[-30,64,-340,1.15],[-240,70,60,1],[160,66,160,.9],[-200,44,-250,.9]].map(([v,M,C,w],S)=>{let I=Cy(i);return I.scale.setScalar(w),I.position.set(v,M,C),i.scene.add(I),{g:I,x:v,y:M,z:C,ph:t()*6}}),n=new xn(i.mats,{name:"dirigibile",noCast:!0}),s=[];for(let v=0;v<=16;v++){let M=v/16;s.push([Math.sin(M*Math.PI)*3.2*(M<.5?1:Gi(1,.85,(M-.5)*2)),M*18-9])}n.add(Ae(s,24).rotateZ(Math.PI/2),"pink",T(),"#FF3D6E");for(let v=0;v<4;v++)n.add(mt(),"pink",T(-7.4,0,0,0,1,1,1,v*Math.PI/2).multiply(T(0,.3,0,0,2.6,2.3,.22)),"#FFFFFF");n.add(xe(3.4,1,1.4,.3,2),"pink",T(.5,-3.7,0),"#FFFFFF");for(let v of[-1,1])n.add(new _e(3.2,4.1),"glyphDecal",T(.8,.2,v*3.18,v>0?0:Math.PI));let r=new Ce;n.build(r),i.scene.add(r);let o=(()=>{let v=new xn(i.mats,{name:"tmp"});v.add(Yn(8,6),"pink",T(0,0,0,0,1.3,.45,.45),"#FFFFFF"),v.add(Yn(6,4),"pink",T(.7,.12,0,0,.45),"#FFFFFF"),v.add(Xr(5),"pink",T(1,.1,0,0,.12,.35,.12,0,-Math.PI/2),"#FFB23E");let M=v.groups.get("pink"),C=In(M,!1);return v.groups.clear(),C})(),a=(()=>{let v=new xn(i.mats,{name:"tmp"});v.add(mt(),"pink",T(0,0,1,0,.7,.06,2),"#FFFFFF"),v.add(mt(),"pink",T(-.1,0,1.85,0,.5,.07,.4),"#4A4A55");let M=In(v.groups.get("pink"),!1);return v.groups.clear(),M})(),l=9,c=new sn(o,i.mats.get("pink"),l),u=new sn(a,i.mats.get("pink"),l*2);for(let v of[c,u])v.instanceMatrix.setUsage(qn),v.frustumCulled=!1,i.scene.add(v);let h=[];for(let v=0;v<l;v++)h.push({c:[(t()-.5)*160,-60-t()*120],rad:20+t()*40,h:28+t()*40,sp:(.12+t()*.12)*(t()<.5?-1:1),ph:t()*6});let f=new Yt,d=new Yt,g=new nn,x=new Xe,p=new P,m=new P(.9,.9,.9),_=new Yt().makeScale(1,1,-1);i.anims.push(v=>{for(let C of e)C.g.position.set(C.x+Math.sin(v*.03+C.ph)*6,C.y+Math.sin(v*.35+C.ph)*1.6,C.z+Math.cos(v*.025+C.ph)*5),C.g.rotation.y=v*.05+C.ph;let M=v*.012+1.2;r.position.set(Math.cos(M)*330,78+Math.sin(v*.2)*2,-Math.sin(M)*330-160),r.rotation.y=M+Math.PI,h.forEach((C,w)=>{let S=C.ph+v*C.sp;p.set(C.c[0]+Math.cos(S)*C.rad,C.h+Math.sin(v*.7+C.ph)*3,C.c[1]+Math.sin(S)*C.rad),g.set(0,-S-(C.sp>0?0:Math.PI),Math.sign(C.sp)*.25,"YXZ"),x.setFromEuler(g),f.compose(p,x,m),c.setMatrixAt(w,f);let I=Math.sin(v*7+C.ph*3)*.55;d.copy(f).multiply(new Yt().makeRotationX(I)),u.setMatrixAt(w*2,d),d.copy(f).multiply(new Yt().makeRotationX(-I)).multiply(_),u.setMatrixAt(w*2+1,d)}),c.instanceMatrix.needsUpdate=!0,u.instanceMatrix.needsUpdate=!0})}function rd(i,t){let e=i.roofs.find(U=>U.what==="mascot");if(!e)return;let n=i.mats.get("plush"),s=i.mats.get("plushFace"),r=new P().setFromMatrixPosition(e.m),o=new P(t.x-r.x,0,t.z-r.z).normalize(),a=new Yt().extractRotation(e.m).invert(),l=o.clone().applyMatrix4(a),c=Math.abs(l.x)>1e-4?e.w/2/Math.abs(l.x):1e9,u=Math.abs(l.z)>1e-4?e.d/2/Math.abs(l.z):1e9,h=Math.min(c,u),f=1.75,d=r.clone().add(o.clone().multiplyScalar(Math.max(0,h-2.4*f))),g=Math.atan2(o.x,o.z)+.22,x=new Ce;x.position.copy(d),x.rotation.y=g,x.name="byuppino";let p=(U,y,A=n)=>{let O=new jt(U,A);return O.applyMatrix4(y),O.castShadow=A!==s,O.receiveShadow=!0,O},m=new Ce;x.add(m),m.add(p(new Fe(1,40,28),T(0,1.7,-.3,0,2.3,2,1.9)));for(let U of[-1,1])m.add(p(new us(.75,1.6,8,20),T(U*1.15,.85,.9,0,1,1,1,Math.PI/2-.15,U*.12)));let _=new Ce;_.position.set(0,5.6,.1),x.add(_);let v=new P(3.2,2.85,3);_.add(p(new Fe(1,64,48),T(0,0,0,0,v.x,v.y,v.z)));let M=new Fe(1.012,64,40,Math.PI/2-.98,1.96,.62,1.48),C=p(M,T(0,0,0,0,v.x,v.y,v.z),s);C.renderOrder=1,_.add(C);let w=[[0,1,.25,0,.85,1.45,.75,.05],[-.95,.85,.15,.55,.78,1.2,.68,0],[.95,.85,.15,-.55,.78,1.2,.68,0],[-.5,.75,-.65,.35,.7,1.05,.6,-.4],[.5,.75,-.65,-.35,.7,1.05,.6,-.4]];for(let[U,y,A,O,H,D,z,B]of w)_.add(p(new Fe(1,28,20),T(U,v.y*.84+y,A,0,H,D,z,B,O)));for(let U of[-1,1]){x.add(p(new us(.62,2.2,8,20),T(U*1.75,3.2,1.35,0,1,1,1,Math.PI/2-.55,-U*.25))),x.add(p(new Fe(1,24,18),T(U*1.95,2.55,2.75,0,.82,.7,.95)));for(let y=-1;y<=1;y++)x.add(p(new Fe(1,12,10),T(U*1.95+y*.38,2.25,3.45,0,.26,.24,.36)))}x.scale.setScalar(f),i.scene.add(x),i.mascot={root:x,head:_,faceMat:s};let S=2.5,I=0;i.anims.push((U,y)=>{S-=y,S<=0&&I<=0&&(I=.14,s.map=i.T.faceBlink,s.needsUpdate=!0),I>0&&(I-=y,I<=0&&(s.map=i.T.faceOpen,s.needsUpdate=!0,S=2.5+Math.random()*3.5));let A=Math.sin(U*1.6)*.015;_.scale.set(1+A,1-A*.6,1+A),_.rotation.z=Math.sin(U*.45)*.05,_.rotation.y=Math.sin(U*.3)*.08})}var Ta=["#FF4F7B","#3E7BD6","#F2C14E","#FFFFFF","#5DBB8A","#E86A3A","#8A5BD6","#2F3A56","#FF8FB1","#46B3C9","#D94A4A","#F7F2E8"],Ra=["#2F3A56","#3B3F4A","#5A6E8C","#E9DCC8","#2A2A30","#6B4E3A"],Ca=["#F1C7A5","#E2AE88","#C98E66","#8D5A3B","#F6D3B8"],Pa=["#2B1D16","#5A3A24","#C9A060","#1A1A1A","#8A4A2A","#D9D2C8"];function od(i,t=240){let e=ie(2468),n=i.free,s=[],r=(D,z,B,k=1)=>{let F=Math.ceil(Math.abs(B-z)*D/2.5);for(let q=0;q<=F;q++){let et=z+(B-z)*(q/F),[Y,at]=Ee(D,et);if(!n(Y,at,.35))return!1}return s.push({kind:"arc",rad:D,th0:z,th1:B,len:Math.abs(B-z)*D,w:k}),!0},o=(D,z,B,k,F=1,q=!0)=>{let et=Math.hypot(B-D,k-z);if(q){let Y=Math.ceil(et/2.5);for(let at=0;at<=Y;at++){let Dt=D+(B-D)*(at/Y),j=z+(k-z)*(at/Y);if(!n(Dt,j,.35))return!1}}return s.push({kind:"line",x0:D,z0:z,x1:B,z1:k,len:et,w:F}),!0};for(let D of[33.6,51.6,67.6,83.6]){let z=Math.round(2*Math.PI*D/26);for(let B=0;B<z;B++){let k=B/z*Math.PI*2,F=(B+1)/z*Math.PI*2;r(D+(e()-.5)*1.2,k,F,1.4)||r(D,k+(F-k)*.25,F-(F-k)*.25,.8)}}for(let D=0;D<36;D++){let z=D/36*Math.PI*2;for(let[B,k]of[[34,50],[52,66],[68,82],[84,96]]){let[F,q]=Ee(B,z),[et,Y]=Ee(k,z);o(F,q,et,Y,.7)}}let a=40;for(let D=0;D<a;D++){let z=D/a*Math.PI*2,B=(D+1)/a*Math.PI*2,[k,F]=Ee(un(z)-3.6,z),[q,et]=Ee(un(B)-3.6,B);o(k,F,q,et,1)}let l=(D,z)=>!qr(D,z,1.5);for(let D of[21.6,25.6])for(let B=0;B<8;B++){let k=B/8*Math.PI*2+.2,F=(B+1)/8*Math.PI*2+.2-.12;[0,.5,1].every(et=>{let[Y,at]=Ee(D,k+(F-k)*et);return l(Y,at)})&&s.push({kind:"arc",rad:D,th0:k,th1:F,len:(F-k)*D,w:2.4})}for(let D of[Math.PI/2,Math.PI,-Math.PI/2]){let[z,B]=Ee(11,D),[k,F]=Ee(29,D);o(z,B,k,F,1.6,!1)}o(-22,-8.5,22,-8.5,2.2,!1);let c=s.reduce((D,z)=>D+z.len*z.w,0),u=[];for(let D=0;D<t;D++){let z=e()*c,B=s[0];for(let k of s)if(z-=k.len*k.w,z<=0){B=k;break}u.push({seg:B,s:e(),dir:e()<.5?1:-1,speed:(1+e()*.6)/Math.max(4,B.len),off:(e()-.5)*1.6,ph:e()*10,scale:(.88+e()*.22)*.8,shirt:Ta[Math.floor(e()*Ta.length)],pants:Ra[Math.floor(e()*Ra.length)],skin:Ca[Math.floor(e()*Ca.length)],hair:Pa[Math.floor(e()*Pa.length)],sit:!1})}for(let D of i.terrace||[]){let z=1+Math.floor(e()*3);for(let B=0;B<z;B++){let k=B*Math.PI/2+.4+(e()<.5?Math.PI:0);u.push({sit:!0,x:D.x+Math.cos(k)*1,z:D.z+Math.sin(k)*1,yaw:Math.atan2(-Math.cos(k),-Math.sin(k)),ph:e()*10,scale:.8,shirt:Ta[Math.floor(e()*Ta.length)],pants:Ra[Math.floor(e()*Ra.length)],skin:Ca[Math.floor(e()*Ca.length)],hair:Pa[Math.floor(e()*Pa.length)]})}}let h=u.length,f=i.mats.get("people"),d=new ne(.1,.085,.84,5,1).translate(0,-.42,0),g=new us(.27,.5,2,7),x=new Fe(.23,8,6),p=new Fe(.245,8,4,0,Math.PI*2,0,Math.PI*.55),m=new sn(d,f,h*2),_=new sn(g,f,h),v=new sn(x,f,h),M=new sn(p,f,h),C=new nt;u.forEach((D,z)=>{D.i=z,D.x=D.x||0,D.z=D.z||0,D.yaw=D.yaw||0,D.hidden=!1,D.path=null,D.tint=null,D.tintDirty=!1,D.shirtC=new nt(D.shirt),m.setColorAt(z*2,C.set(D.pants)),m.setColorAt(z*2+1,C.set(D.pants)),_.setColorAt(z,C.set(D.shirt)),v.setColorAt(z,C.set(D.skin)),M.setColorAt(z,C.set(D.hair))});for(let D of[m,_,v,M])D.castShadow=!0,D.receiveShadow=!0,D.instanceMatrix.setUsage(qn),D.frustumCulled=!1,D.layers.set(1),i.scene.add(D);let w=new Yt,S=new Xe,I=new nn,U=new P,y=new P,A=(D,z,B,k,F,q,et,Y=0)=>{I.set(Y,q,0,"YXZ"),S.setFromEuler(I),U.set(B,k,F),y.set(et,et,et),w.compose(U,S,y),D.setMatrixAt(z,w)},O=D=>{let z=D.seg;if(z.kind==="arc"){let at=z.th0+(z.th1-z.th0)*D.s,[Dt,j]=Ee(z.rad+D.off*.6,at),rt=Math.sign(z.th1-z.th0)*D.dir,dt=Math.cos(at)*rt,gt=Math.sin(at)*rt;return[Dt,j,Math.atan2(dt,gt)]}let B=z.x0+(z.x1-z.x0)*D.s,k=z.z0+(z.z1-z.z0)*D.s,F=-(z.z1-z.z0)/z.len,q=(z.x1-z.x0)/z.len,et=(z.x1-z.x0)/z.len*D.dir,Y=(z.z1-z.z0)/z.len*D.dir;return[B+F*D.off,k+q*D.off,Math.atan2(et,Y)]},H=(D,z)=>{let B=!1;u.forEach((k,F)=>{let q,et,Y,at=.04,Dt=0,j=0,rt=k.scale;if(k.tintDirty&&(_.setColorAt(F,k.tint||k.shirtC),k.tintDirty=!1,B=!0),k.hidden){for(let[Ft,Et]of[[m,F*2],[m,F*2+1],[_,F],[v,F],[M,F]])A(Ft,Et,0,-20,0,0,1e-4);return}if(k.sit){q=k.x,et=k.z,Y=k.yaw,A(_,F,q,.9,et,Y,rt),A(v,F,q,1.42,et,Y,rt),A(M,F,q,1.44,et,Y,rt),A(m,F*2,q-Math.cos(Y)*.1,.5,et+Math.sin(Y)*.1,Y,rt,Math.PI/2*.9),A(m,F*2+1,q+Math.cos(Y)*.1,.5,et-Math.sin(Y)*.1,Y,rt,Math.PI/2*.9);return}if(k.path){let Ft=k.path[k.pi],Et=Ft[0]-k.x,Vt=Ft[1]-k.z,Tt=Math.hypot(Et,Vt),ot=(k.pathSpeed||2.4)*z;if(Tt<=ot){if(k.x=Ft[0],k.z=Ft[1],k.pi++,k.pi>=k.path.length){let L=k.onPathEnd;k.path=null,L&&L(k)}}else k.x+=Et/Tt*ot,k.z+=Vt/Tt*ot;if(Tt>.001&&(k.yaw=Math.atan2(Et,Vt)),q=k.x,et=k.z,Y=k.yaw,k.hidden)return}else k.s+=k.speed*z*k.dir,k.s>1&&(k.s=1,k.dir=-1),k.s<0&&(k.s=0,k.dir=1),[q,et,Y]=O(k),k.x=q,k.z=et,k.yaw=Y;let dt=D*7.5+k.ph;Dt=Math.abs(Math.sin(dt))*.07,j=Math.sin(dt)*.5;let gt=.86*rt;A(m,F*2,q-Math.cos(Y)*.12*rt,at+gt,et+Math.sin(Y)*.12*rt,Y,rt,j),A(m,F*2+1,q+Math.cos(Y)*.12*rt,at+gt,et-Math.sin(Y)*.12*rt,Y,rt,-j),A(_,F,q,at+Dt+1.42*rt,et,Y,rt),A(v,F,q,at+Dt+2.05*rt,et,Y,rt),A(M,F,q,at+Dt+2.08*rt,et,Y,rt)}),B&&_.instanceColor&&(_.instanceColor.needsUpdate=!0),m.instanceMatrix.needsUpdate=!0,_.instanceMatrix.needsUpdate=!0,v.instanceMatrix.needsUpdate=!0,M.instanceMatrix.needsUpdate=!0};H(0,0),i.anims.push(H),i.people={legs:m,torso:_,head:v,hair:M,count:h,walkers:u}}function ad(){return new oe({side:tn,depthWrite:!1,depthTest:!1,fog:!1,uniforms:{uZenith:{value:new nt("#3B86E0")},uMid:{value:new nt("#8CC4F2")},uHorizon:{value:new nt("#DDEFFA")},uBelow:{value:new nt("#BFDDF0")},uSunDir:{value:new P(0,1,0)},uSunColor:{value:new nt("#FFF4E0")},uGlow:{value:.4},uDisc:{value:0},uStars:{value:0},uTime:{value:0},uWarm:{value:new nt("#FFB27A")},uWarmK:{value:0}},vertexShader:`
      varying vec3 vDir;
      void main(){
        vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        vec4 p = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform vec3 uZenith; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uBelow;
      uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uGlow; uniform float uDisc;
      uniform float uStars; uniform float uTime; uniform vec3 uWarm; uniform float uWarmK;
      varying vec3 vDir;
      float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.07, h));
        col = mix(col, uZenith, smoothstep(0.05, 0.42, h));
        col = mix(col, uBelow, smoothstep(0.0, -0.08, h));
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        // fascia calda verso il sole (tramonto), pi\xF9 larga vicino all'orizzonte
        float band = pow(sd, 3.0) * (1.0 - smoothstep(0.0, 0.5, abs(h)));
        col = mix(col, uWarm, clamp(band * uWarmK, 0.0, 1.0));
        col += uSunColor * (pow(sd, 10.0) * 0.35 + pow(sd, 90.0) * 0.8) * uGlow;
        col += uSunColor * smoothstep(0.99935, 0.99965, sd) * uDisc * 6.0;
        if (uStars > 0.001 && h > 0.0) {
          vec3 p = d * 260.0;
          vec3 c = floor(p);
          float r = hash(c);
          if (r > 0.9955) {
            vec3 f = fract(p) - 0.5;
            float s = smoothstep(0.32, 0.0, length(f));
            float tw = 0.65 + 0.35 * sin(uTime * (1.5 + r * 4.0) + r * 60.0);
            col += vec3(1.0, 0.96, 0.9) * s * tw * uStars * smoothstep(0.004, 0.05, h) * (r > 0.9993 ? 2.4 : 1.2);
          }
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function ld(i){let t=ad(),e=new Fe(1e3,48,24),n=new jt(e,t);n.renderOrder=-100,n.frustumCulled=!1,n.name="sky",i.scene.add(n);let s=new Oi(new xi({map:i.T.sunGlow,color:16773328,transparent:!0,depthWrite:!1,fog:!1,blending:en}));s.scale.set(260,260,1),s.renderOrder=-90;let r=new Oi(new xi({map:i.T.moon,color:16054015,transparent:!0,depthWrite:!1,fog:!1}));r.scale.set(46,46,1),r.renderOrder=-90;let o=new Oi(new xi({map:i.T.glow,color:10467071,transparent:!0,depthWrite:!1,fog:!1,blending:en,opacity:.5}));return o.scale.set(300,300,1),o.renderOrder=-91,i.scene.add(s,r,o),i.sky={mesh:n,mat:t,sun:s,moon:r,moonGlow:o},i.sky}function cd(i,t){let e=new zi,n=ad();for(let l of Object.keys(t)){let c=t[l];n.uniforms[l]&&(c&&c.isColor||c&&c.isVector3?n.uniforms[l].value.copy(c):n.uniforms[l].value=c)}n.uniforms.uStars.value=0,n.uniforms.uDisc.value=0,n.depthTest=!0;let s=new jt(new Fe(10,32,16),n);e.add(s);let r=new jt(new Pn(9,32).rotateX(-Math.PI/2),new Sn({color:t.uGround||new nt("#d9a8a4")}));r.position.y=-1.5,e.add(r);let o=new ir(i),a=o.fromScene(e,.02,.1,100);return o.dispose(),n.dispose(),a.texture}var _s=520;function Py(){let t=1024/(_s*2),e=document.createElement("canvas");e.width=e.height=1024;let n=e.getContext("2d");n.fillStyle="#000",n.fillRect(0,0,1024,1024),n.fillStyle="#fff";let s=(c,u)=>[(c+_s)*t,(u+_s)*t];n.beginPath();for(let c=0;c<=160;c++){let u=c/160*Math.PI*2,[h,f]=Ee(un(u),u),[d,g]=s(h,f);c===0?n.moveTo(d,g):n.lineTo(d,g)}n.fill();for(let c of Ea)if(!(Math.abs(c.x)>_s-40||Math.abs(c.z)>_s-40)){n.beginPath();for(let u=0;u<=64;u++){let h=u/64*Math.PI*2,f=vs(c,h)*1.02,[d,g]=s(c.x+Math.cos(h)*f,c.z+Math.sin(h)*f);u===0?n.moveTo(d,g):n.lineTo(d,g)}n.fill()}let r=document.createElement("canvas");r.width=r.height=1024;let o=r.getContext("2d");o.fillStyle="#000",o.fillRect(0,0,1024,1024),o.globalCompositeOperation="lighter";let a=(c,u,h)=>{let f=document.createElement("canvas");f.width=f.height=1024;let d=f.getContext("2d");d.filter=`blur(${c}px)`,d.drawImage(e,0,0),d.filter="none",d.globalCompositeOperation="multiply",d.fillStyle=u,d.fillRect(0,0,1024,1024),o.globalAlpha=h,o.drawImage(f,0,0)};a(26,"#ff0000",1),a(10,"#ff0000",.6),a(3,"#00ff00",1);let l=new Gn(r);return l.colorSpace=Hn,l.wrapS=l.wrapT=hi,l.flipY=!1,l}function Iy(){let t=cn(321),e=document.createElement("canvas");e.width=e.height=256;let n=e.getContext("2d"),s=n.createImageData(256,256),r=s.data;for(let a=0;a<256*256;a++){let l=a%256,c=a/256|0,u=l/256*Math.PI*2,h=c/256*Math.PI*2,f=ti(t,Math.cos(u)*2+9,Math.sin(u)*2+Math.cos(h)*2,4)+ti(t,Math.sin(h)*2+40,Math.cos(h)*2+3,4),d=Math.max(0,Math.min(255,128+f*160));r[a*4]=r[a*4+1]=r[a*4+2]=d,r[a*4+3]=255}n.putImageData(s,0,0);let o=new Gn(Xi(e,5.5));return o.wrapS=o.wrapT=os,o.colorSpace=Hn,o}function ud(i){let t=new be(512,512,{type:Ye,samples:0});t.texture.generateMipmaps=!1;let e=jn.merge([At.fog,{uTime:{value:0},uDeep:{value:new nt("#1F73C2")},uMid:{value:new nt("#2E9BD8")},uShallow:{value:new nt("#47D4E2")},uFoam:{value:new nt("#FFFFFF")},uSunDir:{value:new P(0,1,0)},uSunColor:{value:new nt("#FFFFFF")},uSpec:{value:1},uSheen:{value:.2},uRefl:{value:.75},uReflTex:{value:null},uReflMat:{value:new Yt},uShTex:{value:null},uNTex:{value:null},uFoamK:{value:1},uGlowCol:{value:new nt("#FFB466")},uGlowK:{value:0}}]);e.uReflTex.value=t.texture,e.uShTex.value=Py(),e.uNTex.value=Iy();let n=new oe({uniforms:e,fog:!0,vertexShader:`
      #include <fog_pars_vertex>
      uniform mat4 uReflMat;
      varying vec3 vW; varying vec4 vR;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vR = uReflMat * w;
        vec4 mvPosition = viewMatrix * w;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,fragmentShader:`
      #include <fog_pars_fragment>
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uShallow; uniform vec3 uFoam;
      uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uSpec; uniform float uSheen; uniform float uRefl;
      uniform sampler2D uReflTex; uniform sampler2D uShTex; uniform sampler2D uNTex; uniform float uFoamK;
      uniform vec3 uGlowCol; uniform float uGlowK;
      varying vec3 vW; varying vec4 vR;
      vec3 nrm(vec2 uv){ return texture2D(uNTex, uv).xyz * 2.0 - 1.0; }
      void main(){
        vec2 p = vW.xz;
        float t = uTime;
        vec3 n1 = nrm(p * 0.018 + vec2(t * 0.010, t * 0.006));
        vec3 n2 = nrm(p * 0.041 + vec2(-t * 0.013, t * 0.011));
        vec3 n3 = nrm(p * 0.11 + vec2(t * 0.02, -t * 0.017));
        vec3 nt = normalize(n1 + n2 * 0.8 + n3 * 0.5);
        vec3 N = normalize(vec3(nt.x * 0.55, 1.0, nt.y * 0.55));
        vec3 V = normalize(cameraPosition - vW);
        float dist = length(cameraPosition - vW);
        // bassi fondali e schiuma
        vec2 suv = (p + ${_s}.0) / ${_s*2}.0;
        vec4 sh = vec4(0.0);
        if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) sh = texture2D(uShTex, suv);
        float shallow = clamp(sh.r * 1.25, 0.0, 1.0);
        vec3 water = mix(uDeep, uMid, smoothstep(0.0, 0.35, shallow));
        water = mix(water, uShallow, smoothstep(0.25, 0.95, shallow));
        // riflesso planare
        vec2 ruv = vR.xy / vR.w + N.xz * 0.035;
        vec3 refl = texture2D(uReflTex, clamp(ruv, 0.002, 0.998)).rgb;
        float inb = smoothstep(0.0, 0.03, ruv.x) * smoothstep(1.0, 0.97, ruv.x) * smoothstep(0.0, 0.03, ruv.y) * smoothstep(1.0, 0.97, ruv.y);
        refl = mix(water, refl, inb);
        float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        fres = clamp(fres * 1.6 + 0.12, 0.0, 1.0);
        vec3 col = mix(water, refl, fres * uRefl);
        // luccichio del sole / della luna
        vec3 L = normalize(uSunDir);
        vec3 R = reflect(-L, N);
        float s = max(dot(R, V), 0.0);
        col += uSunColor * (pow(s, 260.0) * 2.2 * uSpec + pow(s, 22.0) * uSheen);
        // schiuma lungo le coste
        float foamN = texture2D(uNTex, p * 0.09 + vec2(t * 0.03, 0.0)).r;
        float foam = smoothstep(0.55, 0.9, sh.g + (foamN - 0.5) * 0.35) * uFoamK;
        col = mix(col, uFoam, foam * 0.75);
        // calore delle luci della citt\xE0 sul mare vicino (sera)
        col += uGlowCol * uGlowK * smoothstep(0.15, 0.9, sh.r) * 0.35;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`}),s=new _e(6e3,6e3,1,1).rotateX(-Math.PI/2),r=new jt(s,n);r.position.y=Je,r.name="mare",r.receiveShadow=!1,i.scene.add(r);let o=new On,a=new P(0,1,0),l=new P(0,Je,0),c=new P,u=new P,h=new P(0,0,-1),f=new Yt,d=new ae,g=new ae,x=new Ve;x.layers.set(0);let p=e.uReflMat.value,m=(_,v,M)=>{if(c.setFromMatrixPosition(M.matrixWorld).sub(l),c.dot(a)<0)return;c.reflect(a).negate().add(l),f.extractRotation(M.matrixWorld),h.set(0,0,-1).applyMatrix4(f),u.setFromMatrixPosition(M.matrixWorld).add(h),u.sub(l).reflect(a).negate().add(l),x.position.copy(c),x.up.set(0,1,0).applyMatrix4(f).reflect(a),x.lookAt(u),x.far=M.far,x.near=M.near;let C=M.view&&M.view.enabled?Math.abs(M.view.offsetY/M.view.fullHeight):0,w=M.view&&M.view.enabled?Math.abs(M.view.offsetX/M.view.fullWidth):0,S=1+2*C,I=1+2*w;x.fov=2*Math.atan(Math.tan(M.fov*Math.PI/360)*S)*180/Math.PI,x.aspect=M.aspect*I/S,x.updateProjectionMatrix(),x.updateMatrixWorld(),p.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),p.multiply(x.projectionMatrix),p.multiply(x.matrixWorldInverse),o.setFromNormalAndCoplanarPoint(a,l),o.applyMatrix4(x.matrixWorldInverse),d.set(o.normal.x,o.normal.y,o.normal.z,o.constant);let U=x.projectionMatrix;g.x=(Math.sign(d.x)+U.elements[8])/U.elements[0],g.y=(Math.sign(d.y)+U.elements[9])/U.elements[5],g.z=-1,g.w=(1+U.elements[10])/U.elements[14],d.multiplyScalar(2/d.dot(g)),U.elements[2]=d.x,U.elements[6]=d.y,U.elements[10]=d.z+1-.003,U.elements[14]=d.w,r.visible=!1;let y=_.getRenderTarget(),A=_.shadowMap.needsUpdate;_.shadowMap.needsUpdate=!1,_.setRenderTarget(t),_.clear(),_.render(v,x),_.setRenderTarget(y),_.shadowMap.needsUpdate=A,r.visible=!0};return i.water={mesh:r,mat:n,uniforms:e,reflRT:t,render:m,setSize:(_,v)=>t.setSize(Math.max(64,Math.round(_)),Math.max(64,Math.round(v)))},i.water}var Ia={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var fn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Fy=new nr(-1,1,1,-1,0,1),Iu=class extends Jt{constructor(){super(),this.setAttribute("position",new Bt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Bt([0,2,0,0,2,0],2))}},Dy=new Iu,ii=class{constructor(t){this._mesh=new jt(Dy,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Fy)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var si=class extends fn{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof oe?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=jn.clone(t.uniforms),this.material=new oe({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new ii(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var Zr=class extends fn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Fa=class extends fn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Da=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new it);this._width=n.width,this._height=n.height,e=new be(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ye}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new si(Ia),this.copyPass.material.blending=Rn,this.clock=new ca}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Zr!==void 0&&(o instanceof Zr?n=!0:o instanceof Fa&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new it);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var La=class extends fn{constructor(t,e,n=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new nt}render(t,e,n){let s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}};var hd={name:"LuminosityHighPassShader",shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new nt(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var dr=class i extends fn{constructor(t,e,n,s){super(),this.strength=e!==void 0?e:1,this.radius=n,this.threshold=s,this.resolution=t!==void 0?new it(t.x,t.y):new it(256,256),this.clearColor=new nt(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new be(r,o,{type:Ye}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let f=new be(r,o,{type:Ye});f.texture.name="UnrealBloomPass.h"+h,f.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(f);let d=new be(r,o,{type:Ye});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let a=hd;this.highPassUniforms=jn.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new oe({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new it(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;let u=Ia;this.copyUniforms=jn.clone(u.uniforms),this.blendMaterial=new oe({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:en,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new nt,this.oldClearAlpha=1,this.basic=new Sn,this.fsQuad=new ii(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new it(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(t,e,n,s,r){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this.fsQuad.render(t),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(n),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=o}getSeperableBlurMaterial(t){let e=[];for(let n=0;n<t;n++)e.push(.39894*Math.exp(-.5*n*n/(t*t))/t);return new oe({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new it(.5,.5)},direction:{value:new it(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new oe({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}};dr.BlurDirectionX=new it(1,0);dr.BlurDirectionY=new it(0,1);var fd={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Ua=class extends fn{constructor(){super();let t=fd;this.uniforms=jn.clone(t.uniforms),this.material=new ia({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new ii(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ce.getTransfer(this._outputColorSpace)===ye&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===su?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ru?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ou?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===au?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===lu?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===kr&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}};var dd="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";function Ly(){return new oe({uniforms:{tInput:{value:null},uDir:{value:new it},uSigma:{value:2}},vertexShader:dd,fragmentShader:`
      uniform sampler2D tInput; uniform vec2 uDir; uniform float uSigma; varying vec2 vUv;
      void main(){
        vec4 acc = texture2D(tInput, vUv); float ws = 1.0;
        float st = max(1.0, uSigma / 3.0);
        float k = -0.5 / (uSigma * uSigma);
        for (int i = 1; i <= 8; i++) {
          float x = float(i) * st; float w = exp(k * x * x);
          acc += (texture2D(tInput, vUv + uDir * x) + texture2D(tInput, vUv - uDir * x)) * w;
          ws += 2.0 * w;
        }
        gl_FragColor = acc / ws;
      }`,depthTest:!1,depthWrite:!1,blending:Rn})}var Fu=class extends fn{constructor(t,e){super(),this.needsSwap=!1,this.camera=e,this.pr=1,this.enabledMask=!0,this.maskMat=new oe({uniforms:{uDepth:{value:null},uRes:{value:new it(1,1)},uUseDepth:{value:0},uEps:{value:6e-5}},vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
        uniform sampler2D uDepth; uniform vec2 uRes; uniform float uUseDepth; uniform float uEps;
        void main(){
          float vis = 1.0;
          if (uUseDepth > 0.5) { float sd = texture2D(uDepth, gl_FragCoord.xy / uRes).r; vis = step(gl_FragCoord.z, sd + uEps); }
          gl_FragColor = vec4(1.0, vis, 0.0, 1.0);
        }`,side:Ue}),this.scene=new zi,this.scene.matrixWorldAutoUpdate=!1;for(let s of t){let r=new jt(s.geometry,this.maskMat);r.matrixAutoUpdate=!1,s.updateMatrixWorld(!0),r.matrix.copy(s.matrixWorld),r.matrixWorld.copy(s.matrixWorld),r.frustumCulled=!1,this.scene.add(r)}let n={type:Ye,depthBuffer:!1};this.mask=new be(1,1,{type:Vn,samples:4}),this.b1a=new be(1,1,n),this.b1b=new be(1,1,n),this.b2a=new be(1,1,n),this.b2b=new be(1,1,n),this.blur=Ly(),this.quad=new ii(this.blur),this.size=new it(1,1),this.sigma1=4,this.sigma2=12,this._cc=new nt}setSize(t,e){t=Math.max(1,Math.floor(t)),e=Math.max(1,Math.floor(e)),this.size.set(t,e),this.mask.setSize(t,e);let n=Math.max(1,Math.round(t/2)),s=Math.max(1,Math.round(e/2));this.b1a.setSize(n,s),this.b1b.setSize(n,s);let r=Math.max(1,Math.round(t/4)),o=Math.max(1,Math.round(e/4));this.b2a.setSize(r,o),this.b2b.setSize(r,o)}setSamples(t){this.mask.samples!==t&&(this.mask.samples=t,this.mask.dispose())}_blur(t,e,n,s,r){let o=this.blur.uniforms;o.uSigma.value=Math.max(.6,r),o.tInput.value=e,o.uDir.value.set(1/n.width,0),t.setRenderTarget(n),this.quad.render(t),o.tInput.value=n.texture,o.uDir.value.set(0,1/s.height),t.setRenderTarget(s),this.quad.render(t)}render(t,e,n){let s=n.depthTexture,r=this.maskMat.uniforms;r.uDepth.value=s||null,r.uUseDepth.value=s?1:0,r.uRes.value.set(n.width,n.height),t.getClearColor(this._cc);let o=t.getClearAlpha(),a=t.autoClear;t.setClearColor(0,0),t.autoClear=!1,t.setRenderTarget(this.mask),t.clear(!0,!0,!1),t.render(this.scene,this.camera);let l=Math.min(1,Math.max(.68,this.size.y/this.pr/900));this._blur(t,this.mask.texture,this.b1a,this.b1b,this.sigma1*l*this.pr/2),this._blur(t,this.b1b.texture,this.b2a,this.b2b,this.sigma2*l*this.pr/4),t.setClearColor(this._cc,o),t.autoClear=a}dispose(){for(let t of[this.mask,this.b1a,this.b1b,this.b2a,this.b2b])t.dispose();this.blur.dispose(),this.maskMat.dispose(),this.quad.dispose()}},Uy={uniforms:{tDiffuse:{value:null},tMask:{value:null},tB1:{value:null},tB2:{value:null},uTime:{value:0},uCenter:{value:new it(.5,.5)},uAspect:{value:1},uRing:{value:1},uGlow:{value:.6},uGlowScreen:{value:0},uHidden:{value:.4},uRim:{value:.12},uT1:{value:.12},uEdge:{value:new nt("#A3003A")},uDeep:{value:new nt("#FF1F5A")},uLight:{value:new nt("#FF8DB1")},uGlowC:{value:new nt("#FF3D7F")},uShine:{value:1}},vertexShader:dd,fragmentShader:`
    uniform sampler2D tDiffuse; uniform sampler2D tMask; uniform sampler2D tB1; uniform sampler2D tB2;
    uniform float uTime; uniform vec2 uCenter; uniform float uAspect;
    uniform float uRing; uniform float uGlow; uniform float uGlowScreen; uniform float uHidden; uniform float uRim; uniform float uT1; uniform float uShine;
    uniform vec3 uEdge; uniform vec3 uDeep; uniform vec3 uLight; uniform vec3 uGlowC;
    varying vec2 vUv;
    void main(){
      vec4 sc = texture2D(tDiffuse, vUv);
      vec4 b2 = texture2D(tB2, vUv);
      if (b2.r < 0.002) { gl_FragColor = sc; return; }
      vec4 m = texture2D(tMask, vUv);
      vec4 b1 = texture2D(tB1, vUv);
      float S = m.r, O = 1.0 - S;
      // il bordo: dove la sagoma sfocata supera la soglia, fuori dalla sagoma
      float fw = fwidth(b1.r) * 0.85 + 1e-4;
      float ring = smoothstep(uT1 - fw, uT1 + fw, b1.r) * O;
      // quanto della sagoma vicina si vede davvero (1 = tutto, 0 = dietro qualcosa)
      float vis = clamp(b1.g / max(b1.r, 1e-3), 0.0, 1.0);
      // posizione attraverso il bordo: 0 sul lato esterno, 1 contro la sagoma
      float u = clamp((b1.r - uT1) / (0.5 - uT1), 0.0, 1.0);
      // luce \xAB2.5D\xBB: la normale del tubicino viene dal gradiente della sagoma sfocata
      vec2 g = vec2(dFdx(b1.r), dFdy(b1.r));
      vec2 n = -g / (length(g) + 1e-6);
      float lit = 0.5 + 0.5 * dot(n, normalize(vec2(-0.45, 0.89)));
      // profilo del tubicino: filo scuro fuori, corpo rosa, riflesso bianco sul lato in luce
      vec3 body = mix(uDeep, uLight, (0.2 + 0.8 * smoothstep(0.3, 1.0, lit)) * smoothstep(0.12, 0.62, u));
      body *= mix(0.78, 1.0, smoothstep(0.0, 0.55, lit));
      vec3 rc = mix(uEdge, body, smoothstep(0.0, 0.32, u));
      float spec = exp(-pow((u - 0.62) / 0.16, 2.0)) * smoothstep(0.45, 1.0, lit);
      rc = mix(rc, vec3(1.0), spec * 0.8);
      // un riflesso bianco che gira intorno al locale
      vec2 d = (vUv - uCenter) * vec2(uAspect, 1.0);
      float ang = atan(d.y, d.x);
      float sh = pow(0.5 + 0.5 * cos(ang - uTime * 0.9), 30.0) * uShine * smoothstep(0.2, 0.7, u);
      rc = mix(rc, vec3(1.0), sh * 0.9);
      float ra = ring * uRing * mix(uHidden, 1.0, vis);
      // alone (fuori dal bordo), che respira
      float breathe = 0.84 + 0.16 * sin(uTime * 2.1);
      float glow = smoothstep(0.0, 0.5, b2.r) * O * (1.0 - ring) * uGlow * breathe * mix(0.5, 1.0, vis);
      vec3 col = sc.rgb;
      vec3 gc = clamp(uGlowC * glow, 0.0, 1.0);
      vec3 screenC = 1.0 - (1.0 - col) * (1.0 - gc);
      vec3 overC = mix(col, uGlowC, clamp(glow, 0.0, 1.0) * 0.85);
      col = mix(overC, screenC, uGlowScreen);
      col = mix(col, rc, clamp(ra, 0.0, 1.0));
      // un filo di luce appena dentro la sagoma
      float rim = S * m.g * (1.0 - smoothstep(0.5, 0.8, b1.r)) * uRim;
      col += uLight * rim;
      gl_FragColor = vec4(col, sc.a);
    }`};function pd(i,t){let e=new Fu(i,t),n=new si(Uy),s=n.uniforms;s.tMask.value=e.mask.texture,s.tB1.value=e.b1b.texture,s.tB2.value=e.b2b.texture;let r=new P;return{maskPass:e,composite:n,set enabled(o){e.enabled=n.enabled=o},get enabled(){return n.enabled},setPixelRatio(o){e.pr=o},setSamples(o){e.setSamples(o)},update(o,a,l,c){s.uTime.value=o,r.copy(a).project(l),s.uCenter.value.set(r.x*.5+.5,r.y*.5+.5),s.uAspect.value=c},uniforms:s}}var md=i=>({uniforms:{tDiffuse:{value:null},uRes:{value:new it(1,1)},uFocus:{value:.46},uBand:{value:.27},uAmount:{value:1},uDir:{value:i?new it(1,0):new it(0,1)}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
    uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uFocus; uniform float uBand; uniform float uAmount; uniform vec2 uDir;
    varying vec2 vUv;
    void main(){
      float d = abs(vUv.y - uFocus);
      float k = smoothstep(uBand, uBand + 0.32, d) * uAmount;
      vec2 step = uDir / uRes * (k * 1.7);
      vec4 c = texture2D(tDiffuse, vUv) * 0.2270270270;
      c += texture2D(tDiffuse, vUv + step * 1.3846153846) * 0.3162162162;
      c += texture2D(tDiffuse, vUv - step * 1.3846153846) * 0.3162162162;
      c += texture2D(tDiffuse, vUv + step * 3.2307692308) * 0.0702702703;
      c += texture2D(tDiffuse, vUv - step * 3.2307692308) * 0.0702702703;
      gl_FragColor = c;
    }`}),Ny={uniforms:{tDiffuse:{value:null},uSat:{value:1.1},uContrast:{value:1.04},uVignette:{value:.22},uLift:{value:new nt(0,0,0)}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uSat; uniform float uContrast; uniform float uVignette; uniform vec3 uLift;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
      c.rgb = mix(vec3(l), c.rgb, uSat);
      c.rgb = (c.rgb - 0.5) * uContrast + 0.5;
      c.rgb += uLift;
      vec2 q = vUv - 0.5;
      float v = 1.0 - dot(q, q) * uVignette * 2.2;
      c.rgb *= v;
      gl_FragColor = vec4(clamp(c.rgb, 0.0, 1.0), 1.0);
    }`};function gd(i,t,e,n={}){let s=i.getDrawingBufferSize(new it),r=new be(s.x,s.y,{type:Ye,samples:n.samples??4,depthTexture:n.highlight?new sr(s.x,s.y):null}),o=new Da(i,r),a=new La(t,e);o.addPass(a);let l=n.highlight&&n.highlight.length?pd(n.highlight,e):null;l&&o.addPass(l.maskPass);let c=new dr(new it(s.x,s.y),.2,.55,.9);o.addPass(c);let u=new si(md(!0)),h=new si(md(!1));o.addPass(u),o.addPass(h);let f=new Ua;o.addPass(f),l&&o.addPass(l.composite);let d=new si(Ny);return o.addPass(d),{composer:o,bloom:c,tsH:u,tsV:h,grade:d,output:f,renderPass:a,hl:l,setSize(x,p,m){l&&l.setPixelRatio(m),o.setPixelRatio(m),o.setSize(x,p);let _=x*m,v=p*m;for(let M of[u,h])M.uniforms.uRes.value.set(_,v)},setTilt(x,p=1){u.enabled=h.enabled=x,u.uniforms.uAmount.value=h.uniforms.uAmount.value=p},render(x){o.render(x)}}}var Du=["giorno","tramonto","sera"];var Ms={giorno:{sunAz:-112,sunEl:50,visAz:-112,visEl:50,sunColor:"#FFF0D8",sunI:3.7,hemiSky:"#C9E2FF",hemiGround:"#EFC9BE",hemiI:.62,exposure:1,envI:.42,mLit:"#8AAE78",mShade:"#5F8577",mHaze:.42,fog:"#CFE5F6",fogNear:300,fogFar:1700,zenith:"#2F7EDC",mid:"#7CBDF0",horizon:"#D9EEFA",below:"#BCDDF2",skyGlow:.25,disc:0,stars:0,warm:"#FFE6C0",warmK:0,sunSprite:0,moon:0,deep:"#0E58B4",wmid:"#1A86D0",shallow:"#33CADC",spec:1.4,sheen:.14,refl:.45,foamK:1,wGlowK:0,win:0,shop:.35,lamp:.12,sign:.16,fair:.25,beacon:.4,string:0,bloomS:.16,bloomR:.4,bloomT:.9,cloud:"#FFFFFF",cloudE:"#E8F0FF",cloudEI:.32,pools:0,halos:0,pointI:0,beam:0,sat:1.16,contrast:1.06,vignette:.16,fDay:1,fGlow:0,ground:"#E9C2BC",hlGlow:.62,hlRim:.08,hlScreen:0},tramonto:{sunAz:138,sunEl:13,visAz:23,visEl:3.2,sunColor:"#FFC48A",sunI:3,hemiSky:"#F4B9BE",hemiGround:"#9C6478",hemiI:.72,exposure:1,envI:.45,mLit:"#B97C8E",mShade:"#6A5A80",mHaze:.46,fog:"#EFBFB8",fogNear:380,fogFar:2e3,zenith:"#7383D2",mid:"#F2A9BE",horizon:"#FFD9A6",below:"#E6B6B6",skyGlow:.7,disc:1.4,stars:0,warm:"#FFC163",warmK:.75,sunSprite:1,moon:0,deep:"#2C3C8E",wmid:"#4B5FA8",shallow:"#7D8FCC",spec:2.2,sheen:.9,refl:.55,foamK:.7,wGlowK:.45,win:1.5,shop:1.25,lamp:2.4,sign:.95,fair:1.7,beacon:1.6,string:1.2,bloomS:.3,bloomR:.45,bloomT:.86,cloud:"#FFE0D2",cloudE:"#FFB394",cloudEI:.42,pools:.55,halos:.6,pointI:16,beam:.12,sat:1.12,contrast:1.05,vignette:.22,fDay:.7,fGlow:.35,ground:"#C98F8F",hlGlow:.65,hlRim:.1,hlScreen:.5},sera:{sunAz:125,sunEl:38,visAz:16,visEl:4.4,sunColor:"#A9BCFF",sunI:.65,hemiSky:"#43559F",hemiGround:"#5A2A4A",hemiI:.62,exposure:1.05,envI:.3,mLit:"#2E3A6C",mShade:"#171D42",mHaze:.32,fog:"#1E2A5E",fogNear:220,fogFar:1300,zenith:"#0A1238",mid:"#1A2A6A",horizon:"#33468A",below:"#202C5E",skyGlow:.22,disc:0,stars:1,warm:"#5A6AB0",warmK:0,sunSprite:0,moon:1,deep:"#0B1A4A",wmid:"#132A66",shallow:"#1F4A88",spec:.9,sheen:.22,refl:1,foamK:.35,wGlowK:1,win:2.6,shop:2.2,lamp:4,sign:1.7,fair:3,beacon:3,string:2.2,bloomS:.48,bloomR:.5,bloomT:.72,cloud:"#56618F",cloudE:"#2E3870",cloudEI:.5,pools:1,halos:.75,pointI:20,beam:.32,sat:1.12,contrast:1.06,vignette:.28,fDay:.25,fGlow:1,ground:"#2A2440",hlGlow:.95,hlRim:.14,hlScreen:1}},By=(i,t,e)=>i+(t-i)*e;function xd(i,t,e){let n={};for(let s of Object.keys(t)){let r=i[s],o=t[s];if(typeof o=="number"&&typeof r=="number")if(s==="sunAz"||s==="visAz"){let a=o-r;for(;a>180;)a-=360;for(;a<-180;)a+=360;n[s]=r+a*e}else n[s]=By(r,o,e);else typeof o=="string"&&o[0]==="#"&&typeof r=="string"?n[s]="#"+new nt(r).lerp(new nt(o),e).getHexString():n[s]=e<.5?r:o}return n}function Jr(i,t=!1){let e=(t?i.visAz:i.sunAz)*Math.PI/180,n=(t?i.visEl:i.sunEl)*Math.PI/180;return new P(Math.sin(e)*Math.cos(n),Math.sin(n),-Math.cos(e)*Math.cos(n))}var ve=i=>new nt(i),he={az:0,el:.26,d:150,fov:33,lift:.18,target:[0,2,-12],minD:70,maxD:270,minEl:.07,maxEl:1.12};async function vd(i,t={}){let e=performance.now(),n=[],s=(N,ht)=>{n.push([ht,Math.round(performance.now()-e)]),(t.onProgress||(()=>{}))(N,ht)},r=!!t.embedded,o=i,a=!0,l=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,c=new Qo({antialias:!1,powerPreference:"high-performance",stencil:!1});c.setClearColor(0,1),c.toneMapping=kr,c.toneMappingExposure=1,c.outputColorSpace=Be,c.shadowMap.enabled=!0,c.shadowMap.type=nu,c.shadowMap.autoUpdate=!1,o.appendChild(c.domElement),c.domElement.style.display="block",t.startHidden&&(c.domElement.style.opacity="0",c.domElement.style.transition="opacity .9s ease"),c.domElement.style.touchAction=r?"pan-y":"none",Ff(c.capabilities.getMaxAnisotropy());let u=new zi;u.fog=new jo(13624822,300,1700);let h=new Ve(he.fov,1,1.5,6e3);h.layers.enable(1),h.layers.enable(2),s(.05,"Disegno le texture"),await yi();let f=(()=>{try{return new URLSearchParams(location.search).get("nome")||""}catch{return""}})(),d=await Df({nome:f||"Ristorante",piazzaR:30}),g=new xa(d),x=new Ce;x.name="mondo",u.add(x);let p={T:d,mats:g,scene:u,group:x,batch:new xn(g,{name:"citta"}),batchRest:new xn(g,{name:"ristorante"}),inst:new ma(g,{layer:2}),lamps:[],trees:[],glowSpots:[],lightsShop:[],anims:[],fountainMats:[],roofs:[]};Bf(p.inst),s(.15,"Alzo la piazza e il ristorante"),await yi(),Gf(p),qf(p);let m=p.batch;p.batch=p.batchRest,Yf(p),p.batch=m,s(.3,"Costruisco le case"),await yi(),Wf(p),Xf(p),Jf(p),s(.45,"Le isole e i ponti"),await yi(),Qf(p),td(p),ed(p),nd(p),jf(p),s(.6,"Il cielo e il mare"),await yi(),ld(p),$f(p),ud(p),id(p),sd(p);let _=new P(...he.target),v=V(he.az,he.el,he.d,_);rd(p,v),od(p,t.people||260),s(.75,"Fondo tutto insieme"),await yi(),p.batch.build(x),p.restMeshes=p.batchRest.build(x),p.inst.build(x),t.extend&&await t.extend(p,{scene:u,camera:h,renderer:c}),p.mats.get("cloud").fog=!1;let M=new ra(13625087,15913670,.9);u.add(M);let C=new la(16777215,2.7);C.castShadow=!0,C.shadow.mapSize.set(4096,4096);let w=C.shadow.camera;w.left=-175,w.right=175,w.top=175,w.bottom=-175,w.near=20,w.far=900,C.shadow.bias=-4e-4,C.shadow.normalBias=.35,C.shadow.radius=3,u.add(C,C.target);let S=(p.restLights||[]).map(N=>{let ht=new aa(16757606,0,30,1.6);return ht.position.setFromMatrixPosition(N),u.add(ht),ht}),I=p.lamps,U=new Jt().setFromPoints(I),y=new Hi({map:d.glow,color:16761466,size:4.2,sizeAttenuation:!0,transparent:!0,opacity:0,depthWrite:!1,blending:en,fog:!0}),A=new ki(U,y);A.frustumCulled=!1,u.add(A);let O=new _e(1,1).rotateX(-Math.PI/2),H=new Sn({map:d.pool,color:16755034,transparent:!0,opacity:0,depthWrite:!1,blending:en,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),D=new sn(O,H,I.length+p.lightsShop.length),z=0;for(let N of I)D.setMatrixAt(z++,T(N.x,N.y-4.2+.06,N.z,0,11,1,11));for(let N of p.lightsShop){let ht=new P().setFromMatrixPosition(N);D.setMatrixAt(z++,T(ht.x,.08,ht.z,0,9,1,7))}D.frustumCulled=!1,u.add(D);let B=new Jt,k=[],F=[];for(let N of p.glowSpots){let ht=new P().setFromMatrixPosition(N.m);k.push(ht.x,ht.y,ht.z);let Kt=ve(N.c);F.push(Kt.r,Kt.g,Kt.b)}B.setAttribute("position",new Bt(k,3)),B.setAttribute("color",new Bt(F,3));let q=new Hi({map:d.glow,size:16,sizeAttenuation:!0,vertexColors:!0,transparent:!0,opacity:0,depthWrite:!1,blending:en}),et=new ki(B,q);et.frustumCulled=!1,u.add(et),s(.85,"Accendo le luci"),await yi();let Y={};for(let N of Du){let ht=Ms[N];Y[N]=cd(c,{uZenith:ve(ht.zenith),uMid:ve(ht.mid),uHorizon:ve(ht.horizon),uBelow:ve(ht.below),uSunDir:Jr(ht,!0),uSunColor:ve(ht.sunColor),uGlow:ht.skyGlow,uWarm:ve(ht.warm),uWarmK:ht.warmK,uGround:ve(ht.ground)})}let at=gd(c,u,h,{samples:4,highlight:p.restMeshes}),Dt=new P(0,9,-35),j="giorno",rt=null,dt=(N,ht)=>{let Kt=Jr(N),Zt=Jr(N,!0);M.color.copy(ve(N.hemiSky)),M.groundColor.copy(ve(N.hemiGround)),M.intensity=N.hemiI,C.color.copy(ve(N.sunColor)),C.intensity=N.sunI,C.position.copy(gt).addScaledVector(Kt,420),C.target.position.copy(gt),C.target.updateMatrixWorld(),c.toneMappingExposure=N.exposure,u.environmentIntensity=N.envI,ht!==rt&&(u.environment=Y[ht],rt=ht),u.fog.color.copy(ve(N.fog)),u.fog.near=N.fogNear,u.fog.far=N.fogFar;let se=p.sky.mat.uniforms;se.uZenith.value.copy(ve(N.zenith)),se.uMid.value.copy(ve(N.mid)),se.uHorizon.value.copy(ve(N.horizon)),se.uBelow.value.copy(ve(N.below)),se.uSunDir.value.copy(Zt),se.uSunColor.value.copy(ve(N.sunColor)),se.uGlow.value=N.skyGlow,se.uDisc.value=N.disc,se.uStars.value=N.stars,se.uWarm.value.copy(ve(N.warm)),se.uWarmK.value=N.warmK,p.sky.sun.material.opacity=N.sunSprite,p.sky.sun.visible=N.sunSprite>.01,p.sky.moon.material.opacity=N.moon,p.sky.moonGlow.material.opacity=N.moon*.45,p.sky.moon.visible=p.sky.moonGlow.visible=N.moon>.01;let Te=p.water.uniforms;Te.uDeep.value.copy(ve(N.deep)),Te.uMid.value.copy(ve(N.wmid)),Te.uShallow.value.copy(ve(N.shallow)),Te.uSunDir.value.copy(Zt),Te.uSunColor.value.copy(ve(N.sunColor)),Te.uSpec.value=N.spec,Te.uSheen.value=N.sheen,Te.uRefl.value=N.refl*(b[$]&&b[$].reflOff?0:1),Te.uFoamK.value=N.foamK,Te.uGlowK.value=N.wGlowK,g.applyGlow({win:N.win,shop:N.shop,lamp:N.lamp,sign:N.sign,fair:N.fair,beacon:N.beacon,string:N.string}),at.bloom.strength=N.bloomS,at.bloom.radius=N.bloomR,at.bloom.threshold=N.bloomT;let As=g.get("cloud");As.color.copy(ve(N.cloud)),As.emissive.copy(ve(N.cloudE)),As.emissiveIntensity=N.cloudEI,y.opacity=N.halos,A.visible=N.halos>.01,H.opacity=N.pools*.55,D.visible=N.pools>.01,q.opacity=N.halos*.55,et.visible=N.halos>.01;for(let De of S)De.intensity=N.pointI;p.beam&&(p.beam.mat.opacity=N.beam,p.beam.group.visible=N.beam>.01),p.wakeMat&&(p.wakeMat.opacity=.25+N.fDay*.35);for(let De of p.fountainMats)De.uniforms.uDay&&(De.uniforms.uDay.value=N.fDay,De.uniforms.uGlow.value=N.fGlow,De.uniforms.uSky.value.copy(ve(N.mid))),De.uniforms.uO&&(De.uniforms.uO.value=.55+N.fGlow*.3);if(at.grade.uniforms.uSat.value=N.sat,at.grade.uniforms.uContrast.value=N.contrast,at.grade.uniforms.uVignette.value=N.vignette*(t.vignetteK??1),at.hl){let De=at.hl.uniforms;De.uGlow.value=N.hlGlow,De.uRim.value=N.hlRim,De.uGlowScreen.value=N.hlScreen}p.sky.sun.position.copy(h.position).addScaledVector(Zt,900),p.sky.moon.position.copy(h.position).addScaledVector(Zt,900),p.sky.moonGlow.position.copy(p.sky.moon.position);let Si=p.mountains.mat.uniforms;Si.uSun.value.copy(Kt),Si.uLit.value.copy(ve(N.mLit)),Si.uShade.value.copy(ve(N.mShade)),Si.uHaze.value.copy(ve(N.fog)),Si.uHazeK.value=N.mHaze,Ft=N,c.shadowMap.needsUpdate=!0},gt=new P(0,0,-20),Ft=Ms.giorno,Et=null,Vt=(N,ht=!1)=>{if(Ms[N]){if(ht){Et=null,j=N,dt(Ms[N],N);return}N===j&&!Et||(Et={from:{...Ft},to:Ms[N],toName:N,fromName:j,t:0,dur:l?.01:1.4},j=N)}},Tt={az:he.az,el:he.el,d:he.d,tAz:he.az,tEl:he.el,tD:he.d,target:_.clone()},ot=0,L=!1,pt=c.domElement,ft=new Map,ut=0;pt.addEventListener("pointerdown",N=>{ft.set(N.pointerId,{x:N.clientX,y:N.clientY});try{pt.setPointerCapture(N.pointerId)}catch{}ot=0,L=!0}),pt.addEventListener("pointermove",N=>{if(!ft.has(N.pointerId))return;let ht=ft.get(N.pointerId),Kt=N.clientX-ht.x,Zt=N.clientY-ht.y;if(ft.set(N.pointerId,{x:N.clientX,y:N.clientY}),ft.size===2){let se=[...ft.values()],Te=Math.hypot(se[0].x-se[1].x,se[0].y-se[1].y);ut&&(Tt.tD=Ze(Tt.tD*(ut/Te),he.minD,he.maxD)),ut=Te;return}r&&N.pointerType!=="mouse"&&Math.abs(Zt)>Math.abs(Kt)*1.2||(Tt.tAz-=Kt*.0055,(!r||N.pointerType==="mouse")&&(Tt.tEl=Ze(Tt.tEl+Zt*.004,he.minEl,he.maxEl)),ot=0)});let yt=N=>{ft.delete(N.pointerId),ft.size<2&&(ut=0),ft.size||(L=!1)};pt.addEventListener("pointerup",yt),pt.addEventListener("pointercancel",yt),pt.addEventListener("pointerleave",yt),pt.addEventListener("wheel",N=>{r&&!(N.ctrlKey||N.metaKey)||(N.preventDefault(),Tt.tD=Ze(Tt.tD*(1+Ze(N.deltaY,-120,120)*.0016),he.minD,he.maxD),ot=0)},{passive:!1}),pt.addEventListener("dblclick",()=>bt());let Ut=N=>{Tt.tD=Ze(Tt.tD*(N>0?.8:1.25),he.minD,he.maxD),ot=0},bt=()=>{let N=he.az-Tt.tAz;N=Math.atan2(Math.sin(N),Math.cos(N)),Tt.tAz+=N,Tt.tEl=he.el,Tt.tD=he.d,ot=0},b=[{pr:.75,shadow:1024,refl:.22,tilt:!1,bloom:!1,shadowEvery:6,reflOff:!0},{pr:1,shadow:2048,refl:.3,tilt:!1,bloom:!0,shadowEvery:4},{pr:1.35,shadow:2048,refl:.38,tilt:!0,bloom:!0,shadowEvery:3},{pr:1.75,shadow:4096,refl:.5,tilt:!0,bloom:!0,shadowEvery:2}],G=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||Math.min(window.innerWidth,window.innerHeight)<560?2:3,$=t.quality!==void 0?t.quality:G,tt=1,Z=1,Pt=()=>{let N=b[$],ht=Math.min(window.devicePixelRatio||1,N.pr);c.setPixelRatio(ht),c.setSize(tt,Z,!1),at.setSize(tt,Z,ht),p.water.setSize(tt*ht*N.refl,Z*ht*N.refl),C.shadow.mapSize.x!==N.shadow&&(C.shadow.mapSize.set(N.shadow,N.shadow),C.shadow.map&&(C.shadow.map.dispose(),C.shadow.map=null)),at.setTilt(N.tilt,1),at.hl&&at.hl.setSamples($>=2?4:0),p.water.uniforms.uRefl.value=Ft.refl*(N.reflOff?0:1),at.bloom.enabled=N.bloom,c.shadowMap.needsUpdate=!0},xt=()=>{if((o.clientWidth<2||o.clientHeight<2)&&tt>1)return;tt=Math.max(1,o.clientWidth),Z=Math.max(1,o.clientHeight),h.aspect=tt/Z,h.fov=he.fov*(tt/Z>2.1?.86:tt/Z<.9?1.45:1);let N=tt/Z>1.2&&he.shiftX||0,ht=he.lift+(he.liftLow&&tt/Z>1.2?Ze((600-Z)/1320,0,.12):0);h.setViewOffset(tt,Z,-tt*N,-Z*ht,tt,Z),h.updateProjectionMatrix(),Pt()},lt=new ResizeObserver(()=>xt());lt.observe(o),xt();let _t=Du.includes(t.preset)?t.preset:"giorno";dt(Ms[_t],_t),j=_t,s(.95,"Quasi pronto"),await yi(),wt(0);try{await c.compileAsync(u,h)}catch{c.compile(u,h)}p.water.render(c,u,h),at.render(0),s(1,"");let K=0,Mt=performance.now(),Wt=0,Ot=0,Rt=0,$t=0,kt=0,le=!1;document.addEventListener("visibilitychange",()=>{le=document.hidden,Mt=performance.now()});function V(N,ht,Kt,Zt){let se=Math.cos(ht);return new P(Zt.x+Math.sin(N)*se*Kt,Zt.y+Math.sin(ht)*Kt,Zt.z+Math.cos(N)*se*Kt)}function wt(N){let ht=Tt;ot+=N,!L&&ot>3.5&&!l&&t.autoRotate!==!1&&(ht.tAz+=N*.022);let Kt=Math.min(1,N*4),Zt=Math.min(1,N*3.5);N===0?(ht.az=ht.tAz,ht.el=ht.tEl,ht.d=ht.tD):(ht.az+=(ht.tAz-ht.az)*Kt,ht.el+=(ht.tEl-ht.el)*Kt,ht.d+=(ht.tD-ht.d)*Zt),h.position.copy(V(ht.az,ht.el,ht.d,ht.target)),h.lookAt(ht.target),h.updateMatrixWorld()}let st=N=>{if(t.manual||requestAnimationFrame(st),le||!a||t.hold&&t.hold()){Mt=N;return}let ht=Math.min(.05,(N-Mt)/1e3);Mt=N,Ct(ht)},ct=N=>{if(K+=N,Wt++,Et){Et.t=Math.min(1,Et.t+N/Et.dur);let Kt=ga(Et.t);dt(xd(Et.from,Et.to,Kt),Kt<.5?Et.fromName:Et.toName),Et.t>=1&&(Et=null)}wt(N);for(let Kt of p.anims)Kt(K,N);t.onFrame&&t.onFrame(N,K,Ft),p.sky.mat.uniforms.uTime.value=K,p.water.uniforms.uTime.value=K;for(let Kt of p.fountainMats)Kt.uniforms.uTime.value=K;let ht=Jr(Ft,!0);p.sky.sun.position.copy(h.position).addScaledVector(ht,900),p.sky.moon.position.copy(h.position).addScaledVector(ht,900),p.sky.moonGlow.position.copy(p.sky.moon.position),p.clouds.rotation.y=K*.0025},St=N=>{if(Wt%b[$].shadowEvery===0&&(c.shadowMap.needsUpdate=!0),b[$].reflOff||p.water.render(c,u,h),at.hl&&at.hl.update(K,Dt,h,tt/Z),at.render(N),K>2.5&&(Ot+=N,Rt++),Ot>2.5&&t.quality===void 0){let ht=Ot/Rt*1e3;ht>26&&$>0?($t++,$t>=1&&($--,Pt(),$t=0)):ht<14&&$<G?(kt++,kt>=3&&($++,Pt(),kt=0)):($t=0,kt=0),Ot=0,Rt=0}},Ct=N=>{ct(N),St(N)};return t.manual||requestAnimationFrame(N=>{Mt=N,st(N)}),{setPreset:Vt,zoom:Ut,recenter:bt,attach(N){!N||N===o||(lt.disconnect(),o=N,N.appendChild(c.domElement),lt.observe(N),xt(),Mt=performance.now())},setActive(N){a=!!N,Mt=performance.now()},reveal(){c.domElement.style.opacity="1"},resetView(){Tt.az=Tt.tAz=he.az,Tt.el=Tt.tEl=he.el,Tt.d=Tt.tD=he.d,ot=0,wt(0)},advance(N=.05,ht=1){for(let Kt=0;Kt<ht;Kt++)ct(N);St(0)},get active(){return a},get size(){return{W:tt,H:Z}},get values(){return Ft},get preset(){return j},get quality(){return $},setQuality(N){$=Ze(N,0,3),Pt()},step(N=1/60,ht=1){for(let Kt=0;Kt<ht;Kt++)Ct(N)},renderer:c,scene:u,camera:h,ctx:p,orbit:Tt,debug:{post:at,sun:C,hemi:M,timings:n}}}var Na=46,Ki=new it(hn.x,hn.z+2),Ba=[0,-22.2],zy=26,Oy=["#8CC8F5","#F28DE6","#D8C8FA","#8B8FF2"],Hy=["#2F86F0","#F0329A","#8B5CF6","#4F46E5"],Lu=new nt("#FF2D6A"),yd=new nt("#FFFFFF"),ky=`
  uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
  vec3 iride(float t){
    t = fract(t) * 4.0;
    if (t < 1.0) return mix(uC0, uC1, smoothstep(0.0, 1.0, t));
    if (t < 2.0) return mix(uC1, uC2, smoothstep(0.0, 1.0, t - 1.0));
    if (t < 3.0) return mix(uC2, uC3, smoothstep(0.0, 1.0, t - 2.0));
    return mix(uC3, uC0, smoothstep(0.0, 1.0, t - 3.0));
  }`;function Vy(){let t=ge(128,128),e=t.getContext("2d");e.shadowColor="rgba(40,10,30,0.35)",e.shadowBlur=10,e.shadowOffsetY=4;let n=30,s=14,r=128-s*2;e.beginPath(),e.moveTo(s+n,s),e.arcTo(s+r,s,s+r,s+r,n),e.arcTo(s+r,s+r,s,s+r,n),e.arcTo(s,s+r,s,s,n),e.arcTo(s,s,s+r,s,n),e.closePath();let o=e.createLinearGradient(0,s,0,s+r);o.addColorStop(0,"#FF4A7E"),o.addColorStop(1,"#F0124F"),e.fillStyle=o,e.fill(),e.shadowColor="transparent",cr(e,128/2,128/2,r*.56,"#FFFFFF");let a=new Gn(t);return a.colorSpace=Be,a.generateMipmaps=!0,a.minFilter=fi,a}function _d(i,{scene:t},e={}){let n=e.onEvent||null,s=b=>{n&&n(b)},r=!!e.reduced,o=i.people.walkers,a=o.filter(b=>!b.sit),l=o.length,c=Na,u=220,h=56,f=c+6,d=[],g=[],x=[];for(let b=0;b<=h;b++){let E=b/h*f;for(let G=0;G<u;G++){let $=G/u*Math.PI*2,tt=Ki.x+Math.cos($)*E,Z=Ki.y+Math.sin($)*E;d.push(tt,.45,Z),g.push(Aa(tt,Z,2.2)?1:0)}}for(let b=0;b<h;b++)for(let E=0;E<u;E++){let G=b*u+E,$=b*u+(E+1)%u,tt=(b+1)*u+E,Z=(b+1)*u+(E+1)%u;x.push(G,$,tt,$,Z,tt)}let p=new Jt;p.setAttribute("position",new Bt(d,3)),p.setAttribute("aLand",new Bt(g,1)),p.setIndex(x),p.computeBoundingSphere();let m=6,_=new oe({uniforms:{uTime:{value:0},uR:{value:c},uZone:{value:.85},uNormal:{value:1},uGain:{value:1},uCenter:{value:Ki.clone()},uP:{value:Array.from({length:m},()=>new ae(0,0,0,0))},uC0:{value:new nt},uC1:{value:new nt},uC2:{value:new nt},uC3:{value:new nt}},vertexShader:`
      attribute float aLand; varying vec2 vP; varying float vLand; uniform vec2 uCenter;
      void main(){ vP = position.xz - uCenter; vLand = aLand; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:ky+`
      uniform float uTime; uniform float uR; uniform float uZone; uniform float uNormal; uniform float uGain;
      uniform vec4 uP[${m}];
      varying vec2 vP; varying float vLand;
      void main(){
        float land = smoothstep(0.35, 0.95, vLand);
        if (land < 0.001) discard;
        float r = length(vP);
        float ang = atan(vP.y, vP.x);
        vec3 col = vec3(0.0); float a = 0.0;
        if (uZone > 0.001) {
          float zr = abs(r - uR);
          float fwr = fwidth(r);
          float edge = 1.0 - smoothstep(0.36, 0.36 + fwr * 1.5 + 0.18, zr);
          float dash = smoothstep(0.34, 0.42, fract(ang * 96.0 / 6.28318 - uTime * 0.05));
          float halo = exp(-zr * zr / 5.0) * 0.22;
          float fill = (1.0 - smoothstep(uR - 0.6, uR, r)) * 0.08 * (0.3 + 0.7 * r / uR);
          float za = (edge * dash * 0.95 + halo + fill) * uZone;
          col += iride(ang / 6.28318 + uTime * 0.03) * za; a += za;
        }
        for (int i = 0; i < ${m}; i++) {
          vec4 P = uP[i];
          if (P.y <= 0.0) continue;
          float d = P.x - r;
          float front = exp(-(d * d) / (P.z * 0.12 + 0.2));
          float core = exp(-(d * d) / 0.12);
          float trail = d > 0.0 ? exp(-d / P.z) * 0.42 : 0.0;
          float pa = (front + trail) * P.y;
          vec3 pc = iride(ang / 6.28318 + uTime * 0.06 + P.w);
          col += mix(pc, vec3(1.0), core * 0.45) * pa; a += pa;
        }
        a = clamp(a, 0.0, 1.0) * land;
        col *= land * uGain;
        gl_FragColor = vec4(col, a * uNormal);
      }`,transparent:!0,depthWrite:!1,blending:iu,blendSrc:ua,blendDst:Js,blendSrcAlpha:ua,blendDstAlpha:Js}),v=new jt(p,_);v.name="panorama:zona",v.renderOrder=2,v.frustumCulled=!1,t.add(v);let M=new Float32Array(l*3),C=new Float32Array(l),w=new Float32Array(l),S=new Jt;S.setAttribute("position",new ue(M,3).setUsage(qn)),S.setAttribute("aA",new ue(C,1).setUsage(qn)),S.setAttribute("aS",new ue(w,1).setUsage(qn));let I=new oe({uniforms:{map:{value:Vy()},uScale:{value:600}},vertexShader:`
      attribute float aA; attribute float aS; varying float vA; uniform float uScale;
      void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aA > 0.01 ? aS * uScale / -mv.z : 0.0; gl_Position = projectionMatrix * mv; }`,fragmentShader:`
      uniform sampler2D map; varying float vA;
      void main(){ vec4 c = texture2D(map, gl_PointCoord); float a = c.a * vA; if (a < 0.02) discard; gl_FragColor = vec4(c.rgb, a); }`,transparent:!0,depthWrite:!1}),U=new ki(S,I);U.frustumCulled=!1,U.renderOrder=4,t.add(U);let y=new Float32Array(l*3),A=new Float32Array(l*3),O=new Jt;O.setAttribute("position",new ue(y,3).setUsage(qn)),O.setAttribute("color",new ue(A,3).setUsage(qn));let H=new Hi({map:i.T.glow,size:4.2,sizeAttenuation:!0,vertexColors:!0,transparent:!0,depthWrite:!1,blending:en,opacity:.6}),D=new ki(O,H);D.frustumCulled=!1,D.renderOrder=3,t.add(D);let z=[],B=i.roofs||[],k=i.lots||[],F=b=>{let E=B.find(G=>G.what===b);return E?new P().setFromMatrixPosition(E.m).add(new P(0,7,0)):null},q=(b,E)=>{let G=null,$=1e9;for(let tt of k){let Z=Math.hypot(tt.x-b,tt.z-E);Z<$&&($=Z,G=tt)}return G?new P(G.x,(G.blocks&&G.blocks[0]&&G.blocks[0].H||8)+5.5,G.z):null};for(let b of[q(22,36),q(-41,11),F("pizza")])b&&z.push(b);for(;z.length<3;)z.push(new P(40-z.length*30,14,10));let et=new xi({map:i.T.glow,color:16766694,transparent:!0,depthWrite:!1,blending:en,opacity:0}),Y=z.map(b=>{let E=new Oi(et);return E.position.copy(b),E.scale.set(12,12,1),E.renderOrder=5,t.add(E),E});for(let b of o)b.sim={state:0,until:0,flash:0,ping:0,pingMax:1.7,lastPulse:-1,away:0,tc:new nt};let at={people:!0,rings:!0,zone:!0,rivals:!1},Dt=[],j=0,rt=.8,dt=0,gt=0,Ft=0,Et=!1,Vt=0,Tt={reached:0,taps:0,arrivals:0},ot=0,L=Oy.map(b=>new nt(b)),pt=Hy.map(b=>new nt(b)),ft=new nt,ut=b=>{Dt.length>=m||Dt.push({r:3,max:c*(b?1.02:.98),speed:b?c/1.5:c/3.8,strong:!!b,id:j++,hue:Math.random()})},yt=b=>{if(Math.hypot(b.x,b.z)>36)return null;let G=Math.atan2(b.x,-b.z),$=14.5,tt=[Ee($,G)],Z=G;for(;Math.abs(Z)>.32;)Z-=Math.sign(Z)*.3,tt.push(Ee($,Z));return tt.push([0,-$],[0,-18.5],Ba),tt},Ut=b=>{b.hidden=!0,b.sim.state=0,b.sim.away=14+Math.random()*10,b.sim.ping=0,b.tint=null,b.tintDirty=!0,Tt.arrivals++,s({type:"arrive",covers:1+Math.floor(Math.random()*4)})};return{stats:Tt,layers:at,rivalSpots:z,update:(b,E,G,$)=>{dt+=b,_.uniforms.uTime.value=dt;let tt=Ze((1-E.fDay)/.75,0,1);if(Math.abs(tt-ot)>.001||dt<.1){ot=tt;let lt=_.uniforms;["uC0","uC1","uC2","uC3"].forEach((_t,K)=>lt[_t].value.copy(pt[K]).lerp(L[K],tt)),lt.uNormal.value=1-tt*.8,lt.uGain.value=1+tt*.6,H.opacity=.35+tt*.55}at.rings&&!r&&(rt-=b,rt<=0&&(ut(!1),rt=2.8));for(let lt=Dt.length-1;lt>=0;lt--){let _t=Dt[lt];_t.r+=_t.speed*b,_t.r>=_t.max&&Dt.splice(lt,1)}let Z=_.uniforms.uP.value;for(let lt=0;lt<m;lt++){let _t=Dt[lt];if(!_t){Z[lt].set(0,0,0,0);continue}let K=_t.r/_t.max,Mt=(_t.strong?1.2:.85)*(1-ga(Ze((K-.55)/.45,0,1)))*Math.min(1,_t.r/8);Z[lt].set(_t.r,Mt,_t.strong?7:4.5,_t.hue)}_.uniforms.uZone.value+=((at.zone?.85:0)-_.uniforms.uZone.value)*Math.min(1,b*6),gt+=(Ft-gt)*Math.min(1,b*3),et.opacity=gt*(.55+ot*.45),Y.forEach((lt,_t)=>{let K=11+Math.sin(dt*3+_t)*2;lt.scale.set(K,K,1),lt.visible=gt>.01});let Pt=0,xt=at.people;for(let lt=0;lt<l;lt++){let _t=o[lt],K=_t.sim;if(_t.sit){C[lt]=0,A[lt*3]=A[lt*3+1]=A[lt*3+2]=0;continue}if(_t.hidden){K.away-=b,K.away<=0&&!_t.path&&(_t.hidden=!1),C[lt]=0,A[lt*3]=A[lt*3+1]=A[lt*3+2]=0;continue}let Mt=_t.x-Ki.x,Wt=_t.z-Ki.y,Ot=Math.hypot(Mt,Wt);if(K.state===0&&at.rings&&Ot<c){for(let kt of Dt)if(Math.abs(kt.r-Ot)<2.6&&K.lastPulse!==kt.id){if(K.lastPulse=kt.id,Math.random()<(kt.strong?.96:.55)&&(K.state=1,K.until=dt+7+Math.random()*5,K.flash=1,K.ping=K.pingMax=1.7,Pt++,kt.strong&&Vt++,Math.random()<(kt.strong?.12:.08)&&(K.state=2,K.until=dt+9,Tt.taps++,s({type:"tap",d:Math.max(40,Math.round(Ot*zy/10)*10)}),Math.random()<.5&&Ot<c*.92))){let le=yt(_t);le&&(K.state=3,_t.path=le,_t.pi=0,_t.pathSpeed=2.6,_t.onPathEnd=Ut)}break}}(K.state===1||K.state===2)&&dt>K.until&&(K.state=0);let Rt=K.state?1:0;K.flash>0?(K.flash=Math.max(0,K.flash-b*2.2),_t.tint=xt?K.tc.copy(Lu).lerp(yd,K.flash):null,_t.tintDirty=!0):Rt&&xt&&!_t.tint?(_t.tint=K.tc.copy(Lu),_t.tintDirty=!0):(!Rt||!xt)&&_t.tint&&(_t.tint=null,_t.tintDirty=!0),K.ping>0&&(K.ping=Math.max(0,K.ping-b));let $t=K.state===3?1:K.ping>0?Math.min(1,K.ping/.4)*Math.min(1,(K.pingMax-K.ping)*6):0;M[lt*3]=_t.x,M[lt*3+1]=2.75+(K.state===3?0:(K.pingMax-K.ping)*.9),M[lt*3+2]=_t.z,C[lt]=xt?$t:0,w[lt]=K.state>=2?1.25:1,y[lt*3]=_t.x,y[lt*3+1]=1.1,y[lt*3+2]=_t.z,xt&&K.state?(ft.copy(Lu).lerp(yd,K.flash*.6),A[lt*3]=ft.r,A[lt*3+1]=ft.g,A[lt*3+2]=ft.b):A[lt*3]=A[lt*3+1]=A[lt*3+2]=0}S.attributes.position.needsUpdate=!0,S.attributes.aA.needsUpdate=!0,S.attributes.aS.needsUpdate=!0,O.attributes.position.needsUpdate=!0,O.attributes.color.needsUpdate=!0,I.uniforms.uScale.value=$/(2*Math.tan(G.fov*Math.PI/360)),Pt&&(Tt.reached+=Pt,s({type:"reach",n:Pt}))},pulse:ut,setLayer(b,E){at[b]=E,b==="rivals"&&(Ft=E?1:0)},digest(){return Et?!1:(Et=!0,Vt=0,ut(!0),Ft=1,s({type:"digest-start"}),setTimeout(()=>{s({type:"digest-end",reached:Vt}),Et=!1,at.rivals||(Ft=0)},5200),!0)},setOnEvent(b){n=b}}}var Kr={pranzo:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAAdADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwClC0aXjXNjdr9pb5W8lGyferTapqRO6K4lEfTfICPbtmqAt3tplhiAmuN2GwGATB6hvyrQF7KLi8jvZ4VkdQCvmthSp9uowTkA966VSdCzozXL2bu/yViHGdRuNWLutL9PK3vPt6FIeINWLhf3ueOAa1rvU5bO0j+2SX6zvnPlupC4+hrDS1urgsUEUcYAZmXG0LyMgk8/QU77DaOFb7TKQQPXByCfT2NdWJxGFnGCk9OvKn+eljiw2GxE3Jqy7czS/DUnl8SXmN8U9x5fTL1pafqq3a5Oo3bsq5kVYTgfiD+prNWG0TTU2k43Hc23cBxwMn1B/Sq8U12EZIbp0iP3lh+QY9yKbqU8XTdOhFprq7L7+opQ+rTUq01Z+r+62n3sn0O9bUrxXu7pLOSL5grjHnEDvgc88cdKn1u4ivrjTfKR5kkO91TAXeTgKD0Oev6dq5m81t724t2khCASAlY229c8DA4rpLM2ep/Z7aO0NqA6MTHKSDntjHQZNeUlrbdH0mIot1HGSsvv72X4G7JpMUWkKyxlJmYfIdpaNjx97jAHT8KfFYWi20hmbzcSbVkidsEeuBkep/CrCXPm6bam6ghuImRSI5EzgjPOe/Ap8OqR+YsK2NukZjmYqqgDKY9vesm4J7bnK48rKen6Vbm6uDdtE6K5VfMGCzY4K89gfSobuIWMU0C26+XGgaN41Bfrk5U+2ePbPFXLq5S28Rw2sdnaAzjLSiL5uQcj8hj8aqeJteGnxQ+XZQtsVmAPAGPlwOOB179+9S6d0or+vyN5U50eXpf8j//Z",aperitivo:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAAdADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDAgura58t7jVY5Jh/CFdiPYYFXp7l4yFTULwsyFl+Qj8881LfWM9tp7z2d55k0YGYI48Kcn2xjg+/SiG11Ai2nuLqGP51Ese5k3AHjGevU+31qalOnf21Odnfq/wBLI9RRqK0JJu33L/yYyr6+1qzVZDJJNCQCZI2YqpzjBOODVrSbrU73dvNwoGRuBB57Dmm6ld6vLI1mlxbvb5yJE5GO2SadF4dvQgdlZtv3iswwf8K6Z4uksOlNpSfVJvT8DmpUJzqNx+Fd2l/mamnXb7iDd3khxyrgYH61sx3ExjBt40mkPaV9oHua5y2imsGlMrrChBA3/Pj8RWnEktxbpBFfQlDt8xgpy3fHXvkVyKdKXuU07ef/AAToUHH42l/XkUP9KEzRTyRQCCNX2uoRnIP3eeMY7e9S3t9b6lHFDE0XlNtkDqOF4Pyn9DxWLfXk086XcuxipIKFflIx0/Sn/bdmxRGArSEEA8A8jI44rnpRckd+Ig4znCb2/X9NzTeKK0j2qqjzRwCc5PUY9a0ItdIsQzTbWD7RCCd2B3wRjH49MVz08ixiNnTfJkFXzgr9KIb2aX7Sd7Dy2ZQCc9K6FGk5NNa+hwPmUuVFySR7y32DzAJSXK84PXH0xWaFjsw5c7RH8+7g7m7jg/pWsbVLBTFDgRkCTbjAzmqPiSxjsnUbmZ5F3kjCrjqBt/rUWg4qCNXCpTna2qP/2Q==",cena:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5Ojf/2wBDAQoKCg0MDRoPDxo3JR8lNzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzf/wAARCAAdADADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDx6PEnDOF9sE1aW2Uxs28fKAcbSCa6aw0CK70+R/N8iROQWlHC+m33P/6qo2+nCSwkZ5IluFYBQ4HQehznOfwrrqVoVPeTs0b/AFWyMeS0ZY/MjJYf3Twx+gqBQT1R+uK6GSzuAqNCIdojwXwWJGTVweFdTlj80WruMZLhwOMZ6DpxRHHRpx/eSuS8K5v3Uc0lqZCMNtB6YGa2dM023lkQSLv/AL3YUrabNaXJjuIXjIXlSwJGRxgd+tFkLlzvtisagfelHGfb1rSliYSl7t3cxqYdx3NdNQ81YTI8MS7d5A+VWBP3cjkHr+ftTUezmjMWWjNxJv8AkTAQZPHrjkVjWUS4UP8AMNh46dif6VGtzPM6fvXXauEIJyo9K8ylDVxXQ9GcrrU6plga9ENov2bfEdx35DEAdAOcetdAniC7s9IRoLqJnY7RaqDvjUexGMfj+decQXs8BaaFykkWSrj72frXTaXNfanbtBLfy7ZYmaTd824Zxj6VrONKTfMjOkqk5KMP6+8vQJdXlvJHKWja5PmtEI97c8jHHFYFzpTvdBIGeMwKu9XxnjAXp3OelLqEckVvbhLiUK0PyqXOF5xgc9Ov51kRq+5wsjDGc4PXvUOC9lemVzPntJH/2Q=="};var Oa=window.Pano=window.Pano||{},Ha={pranzo:"giorno",aperitivo:"tramonto",cena:"sera"},Md=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches),Ge=null,za=null,vn=null,Qe=null,ka=null;function Ad(){let i=new Date().getHours()+new Date().getMinutes()/60;return i>=11&&i<16?"pranzo":i>=16&&i<19.5?"aperitivo":"cena"}function Ed(){try{return!!document.createElement("canvas").getContext("webgl2")}catch{return!1}}Object.assign(he,{el:.4,d:130,shiftX:.09,lift:.16,liftLow:!0});function Sd(i){return za||(ka=document.createElement("div"),za=vd(ka,{embedded:!0,startHidden:!0,preset:Ha[i]||"giorno",vignetteK:.4,people:300,hold:()=>!Qe||Qe._held(),extend:(t,e)=>{vn=_d(t,e,{reduced:Md,onEvent:n=>{Qe&&Qe.onEvent(n)}})},onFrame:t=>{Qe&&Qe._frame(t)},onProgress:t=>{Qe&&Qe._progress(t)}}).then(t=>(Ge=t,t)),za)}var pr=class{constructor(t,e={}){this.container=t,this.onEvent=e.onEvent||function(){},this.onStats=e.onStats||function(){},this.labels=[],this.layers={people:!0,rings:!0,zone:!0,rivals:!1},this.paused=!1,this.visible=!0,this.ready=!1,this.presetName=Ad(),this._statT=0,this._v=new P,this._disposed=!1,Qe&&Qe!==this&&Qe._detach(),Qe=this,"IntersectionObserver"in window&&(this._io=new IntersectionObserver(n=>{this.visible=n[0].isIntersecting},{threshold:.01}),this._io.observe(t)),this._loader=null,this._loaderT=requestAnimationFrame(()=>this._showLoader()),Sd(this.presetName).then(n=>{if(!(this._disposed||Qe!==this)){n.attach(t),n.renderer.domElement.setAttribute("aria-hidden","true"),n.resetView(),n.setPreset(Ha[this.presetName]||"giorno",!0);for(let s of Object.keys(this.layers))vn.setLayer(s,this.layers[s]);vn.setOnEvent(s=>this.onEvent(s)),this.ready=!0,this._hideLoader(),requestAnimationFrame(()=>n.reveal())}}).catch(n=>{console.warn("Panorama: 3D non disponibile",n),this._hideLoader()})}_held(){return this.paused||!!Oa.worldHold||!this.visible||document.hidden||!this.ready}_showLoader(){if(this.ready||this._disposed||this._loader)return;let t=Oa.IMG&&Oa.IMG.markIride||"img/panorama-mark-iride.png",e=document.createElement("div");e.style.cssText="position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden",e.innerHTML=`<img alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.12);filter:blur(22px) saturate(1.15);transition:filter .6s ease,opacity .6s ease"><div role="status" aria-label="Sto costruendo la citt\xE0" style="position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 16px 0 8px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.9);color:#131316;box-shadow:0 14px 34px -14px rgba(30,20,70,.45),inset 0 0 0 1px rgba(19,19,22,.06);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);white-space:nowrap;font:800 13.5px/1 'Plus Jakarta Sans',system-ui,sans-serif;transition:opacity .45s ease,transform .5s ease"><span style="width:28px;height:28px;border-radius:99px;background:#16161C;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="`+t+'" alt="" style="width:11px;height:auto"></span><span>Sto costruendo la citt\xE0</span><span data-pct style="font-size:12.5px;min-width:34px;text-align:right;font-variant-numeric:tabular-nums">0%</span><span style="position:absolute;left:0;bottom:0;height:3px;width:100%;background:rgba(19,19,22,.06)"><i data-bar style="display:block;height:100%;width:100%;background:#131316;transform-origin:left;transform:scaleX(0)"></i></span></div>',this.container.appendChild(e),this._loader=e,this._ph=e.firstChild,this._pill=e.lastChild,this._ph.src=Kr[this.presetName]||Kr.pranzo,this._pTarget=0,this._pShown=0,this._pAt=performance.now();let n=e.querySelector("[data-pct]"),s=e.querySelector("[data-bar]"),r=()=>{if(!this._loader)return;let o=Math.min(.08,(performance.now()-this._pAt)/12e3),a=Math.min(.99,this._pTarget+(this._pTarget<1?o:0));this._pShown+=(a-this._pShown)*(Md?1:.12);let l=Math.max(0,Math.min(1,this._pShown));n.textContent=Math.round(l*100)+"%",s.style.transform="scaleX("+l.toFixed(3)+")",this._ph.style.filter="blur("+(22-12*l).toFixed(1)+"px) saturate(1.15)",this._raf=requestAnimationFrame(r)};r()}_progress(t){t>(this._pTarget||0)&&(this._pTarget=t,this._pAt=performance.now())}_hideLoader(){cancelAnimationFrame(this._loaderT),cancelAnimationFrame(this._raf);let t=this._loader;if(this._loader=null,!t)return;let e=t.querySelector("[data-pct]"),n=t.querySelector("[data-bar]");e&&(e.textContent="100%"),n&&(n.style.transform="scaleX(1)"),this._ph&&(this._ph.style.filter="blur(6px) saturate(1.05)"),this._pill&&(this._pill.style.opacity="0",this._pill.style.transform="translate(-50%,-50%) translateY(8px)"),setTimeout(()=>t.remove(),1300)}_frame(t){if(!Ge||!vn)return;let e=Ge.renderer.getPixelRatio();vn.update(t,Ge.values,Ge.camera,Ge.size.H*e),this._placeLabels(),this._statT+=t,this._statT>.5&&(this._statT=0,this.onStats(Object.assign({},vn.stats)))}setPreset(t,e){Ha[t]&&(this.presetName=t,this._loader&&this._ph&&(this._ph.src=Kr[t]||Kr.pranzo),Ge&&this.ready&&Ge.setPreset(Ha[t],!!e))}setLayer(t,e){this.layers[t]=e,vn&&this.ready&&vn.setLayer(t,e)}setPaused(t){this.paused=!!t}digest(){if(vn&&this.ready){vn.digest();return}this.onEvent({type:"digest-start"}),setTimeout(()=>this.onEvent({type:"digest-end",reached:280+Math.floor(Math.random()*120)}),5200)}pulse(t){vn&&vn.pulse(t)}zoom(t){Ge&&Ge.zoom(t)}recenter(){Ge&&Ge.recenter()}resize(){}anchor(t){if(t==="venue")return new P(0,18.4,-35);if(t==="door")return new P(Ba[0],3,Ba[1]-1.5);if(t&&t.indexOf("rival")===0){let e=vn&&vn.rivalSpots[Number(t.slice(5))];return e?e.clone().add(new P(0,2.5,0)):null}return t==="zone"?new P(Ki.x-Na*.62,1,Ki.y+Na*.78):null}addLabel(t,e,n){if(!t)return;let s=this.labels.find(a=>a.el===t);if(s)return s;let r=typeof e=="string"?this.anchor(e):e;if(!r){t.style.display="none";return}let o={el:t,pos:r,opts:n||{},clamp:e==="zone"};return this.ready||(t.style.opacity="0"),this.labels.push(o),o}removeLabel(t){this.labels=this.labels.filter(e=>e.el!==t)}_placeLabels(){let t=this.container.clientWidth,e=this.container.clientHeight,n=this._v,s=Ge.camera;this.labels.some(r=>!r.el.isConnected)&&(this.labels=this.labels.filter(r=>r.el.isConnected));for(let r of this.labels){n.copy(r.pos).project(s);let o=(n.x*.5+.5)*t,a=(-n.y*.5+.5)*e;if(r.clamp){let u=(r.el.offsetWidth||0)/2+10;o=Math.min(t-u,Math.max(u,o))}let l=n.z>1||o<-60||o>t+60||a<-40||a>e+40,c=r.opts.align==="left"?"0%":"-50%";if(r.el.style.transform=`translate3d(${o.toFixed(1)}px, ${a.toFixed(1)}px, 0) translate(${c}, -100%)`,r.opts.hidden){r.el.style.opacity="0";continue}r.el.style.opacity=l?"0":r.opts.opacity!=null?String(r.opts.opacity):"1"}}fastForward(t){if(!Ge||!this.ready)return;let e=Math.max(1,Math.round(t/.05));Ge.advance(.05,e)}_detach(){this.ready=!1,Qe===this&&(Qe=null)}dispose(){this._disposed||(this._disposed=!0,this._hideLoader(),this._io&&this._io.disconnect(),this.labels=[],Qe===this&&(Qe=null,Ge&&ka&&Ge.attach(ka)))}};pr.supported=Ed;pr.PRESETS={pranzo:{},aperitivo:{},cena:{}};pr.engine=()=>Ge;Oa.World=pr;var Gy=/\.(campagne|push|inapp|notifiche|pubblico|risultati|wallet)\b/.test(location.hash||"");if(Ed()&&!Gy)try{Sd(Ad())}catch(i){console.warn("Panorama: 3D non disponibile",i)}})();
