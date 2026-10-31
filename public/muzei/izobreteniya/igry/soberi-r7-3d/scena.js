var rs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},os={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},vf=0,au=1,Mf=2;var Fo=1,Sl=2,Ar=3,Ln=0,ke=1,Ye=2,ln=0,Ss=1,wi=2,lu=3,cu=4,Sf=5,Qn=100,bf=101,wf=102,Tf=103,Ef=104,Af=200,Cf=201,Rf=202,Pf=203,Ga=204,Ha=205,If=206,Nf=207,Uf=208,Lf=209,Df=210,Of=211,Ff=212,Bf=213,zf=214,bl=0,wl=1,Tl=2,bs=3,El=4,Al=5,Cl=6,Rl=7,hu=0,kf=1,Vf=2,Ji=0,uu=1,du=2,fu=3,Bo=4,pu=5,mu=6,gu=7;var _u=300,as=301,Ls=302,Pl=303,Il=304,zo=306,hr=1e3,sn=1001,Wa=1002,qe=1003,Gf=1004;var ko=1005;var $e=1006,Nl=1007;var ls=1008;var gi=1009,xu=1010,yu=1011,Cr=1012,Ul=1013,Zi=1014,$i=1015,cn=1016,Ll=1017,Dl=1018,Rr=1020,vu=35902,Mu=35899,Su=1021,bu=1022,Fi=1023,rn=1026,cs=1027,wu=1028,Ol=1029,Ds=1030,Fl=1031;var Bl=1033,Vo=33776,Go=33777,Ho=33778,Wo=33779,zl=35840,kl=35841,Vl=35842,Gl=35843,Hl=36196,Wl=37492,Xl=37496,ql=37488,Yl=37489,Jl=37490,Zl=37491,$l=37808,Kl=37809,Ql=37810,jl=37811,tc=37812,ec=37813,ic=37814,nc=37815,sc=37816,rc=37817,oc=37818,ac=37819,lc=37820,cc=37821,hc=36492,uc=36494,dc=36495,fc=36283,pc=36284,mc=36285,gc=36286;var fo=2300,Xa=2301,Va=2302,jh=2400,tu=2401,eu=2402;var Hf=3200;var Tu=0,Wf=1,Bn="",ai="srgb",ws="srgb-linear",po="linear",he="srgb";var Ms=7680;var iu=519,Xf=512,qf=513,Yf=514,_c=515,Jf=516,Zf=517,xc=518,$f=519,qa=35044,Qe=35048;var Eu="300 es",Xi=2e3,mo=2001;function Au(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Am(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function go(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Kf(){let n=go("canvas");return n.style.display="block",n}var qd={},ur=null;function _o(...n){let t="THREE."+n.shift();ur?ur("log",t,...n):console.log(t,...n)}function Ct(...n){let t="THREE."+n.shift();ur?ur("warn",t,...n):console.warn(t,...n)}function Rt(...n){let t="THREE."+n.shift();ur?ur("error",t,...n):console.error(t,...n)}function dr(...n){let t=n.join(" ");t in qd||(qd[t]=!0,Ct(...n))}function Qf(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var on=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},ti=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Yd=1234567,lo=Math.PI/180,fr=180/Math.PI;function Nn(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ti[n&255]+ti[n>>8&255]+ti[n>>16&255]+ti[n>>24&255]+"-"+ti[t&255]+ti[t>>8&255]+"-"+ti[t>>16&15|64]+ti[t>>24&255]+"-"+ti[e&63|128]+ti[e>>8&255]+"-"+ti[e>>16&255]+ti[e>>24&255]+ti[i&255]+ti[i>>8&255]+ti[i>>16&255]+ti[i>>24&255]).toLowerCase()}function zt(n,t,e){return Math.max(t,Math.min(e,n))}function Cu(n,t){return(n%t+t)%t}function Cm(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function Rm(n,t,e){return n!==t?(e-n)/(t-n):0}function co(n,t,e){return(1-e)*n+e*t}function Pm(n,t,e,i){return co(n,t,1-Math.exp(-e*i))}function Im(n,t=1){return t-Math.abs(Cu(n,t*2)-t)}function Nm(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function Um(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function Lm(n,t){return n+Math.floor(Math.random()*(t-n+1))}function Dm(n,t){return n+Math.random()*(t-n)}function Om(n){return n*(.5-Math.random())}function Fm(n){n!==void 0&&(Yd=n);let t=Yd+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Bm(n){return n*lo}function zm(n){return n*fr}function km(n){return(n&n-1)===0&&n!==0}function Vm(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Gm(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Hm(n,t,e,i,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+i)/2),h=o((t+i)/2),u=r((t-i)/2),f=o((t-i)/2),d=r((i-t)/2),m=o((i-t)/2);switch(s){case"XYX":n.set(a*h,l*u,l*f,a*c);break;case"YZY":n.set(l*f,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*f,a*h,a*c);break;case"XZX":n.set(a*h,l*m,l*d,a*c);break;case"YXY":n.set(l*d,a*h,l*m,a*c);break;case"ZYZ":n.set(l*m,l*d,a*h,a*c);break;default:Ct("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Hi(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function fe(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Ru={DEG2RAD:lo,RAD2DEG:fr,generateUUID:Nn,clamp:zt,euclideanModulo:Cu,mapLinear:Cm,inverseLerp:Rm,lerp:co,damp:Pm,pingpong:Im,smoothstep:Nm,smootherstep:Um,randInt:Lm,randFloat:Dm,randFloatSpread:Om,seededRandom:Fm,degToRad:Bm,radToDeg:zm,isPowerOfTwo:km,ceilPowerOfTwo:Vm,floorPowerOfTwo:Gm,setQuaternionFromProperEuler:Hm,normalize:fe,denormalize:Hi},at=class n{constructor(t=0,e=0){n.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*s+t.x,this.y=r*s+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},mi=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],f=r[o+0],d=r[o+1],m=r[o+2],_=r[o+3];if(a<=0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a>=1){t[e+0]=f,t[e+1]=d,t[e+2]=m,t[e+3]=_;return}if(u!==_||l!==f||c!==d||h!==m){let g=l*f+c*d+h*m+u*_;g<0&&(f=-f,d=-d,m=-m,_=-_,g=-g);let p=1-a;if(g<.9995){let w=Math.acos(g),M=Math.sin(w);p=Math.sin(p*w)/M,a=Math.sin(a*w)/M,l=l*p+f*a,c=c*p+d*a,h=h*p+m*a,u=u*p+_*a}else{l=l*p+f*a,c=c*p+d*a,h=h*p+m*a,u=u*p+_*a;let w=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=w,c*=w,h*=w,u*=w}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],f=r[o+1],d=r[o+2],m=r[o+3];return t[e]=a*m+h*u+l*d-c*f,t[e+1]=l*m+h*f+c*u-a*d,t[e+2]=c*m+h*d+a*f-l*u,t[e+3]=h*m-a*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),f=l(i/2),d=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"YXZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"ZXY":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"ZYX":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"YZX":this._x=f*h*u+c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u-f*d*m;break;case"XZY":this._x=f*h*u-c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u+f*d*m;break;default:Ct("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=i+a+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(i>a&&i>u){let d=2*Math.sqrt(1+i-a-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>u){let d=2*Math.sqrt(1+a-i-u);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+u-i-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(zt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e<=0)return this;if(e>=1)return this.copy(t);let i=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(t=0,e=0,i=0){n.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Jd.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Jd.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*i),h=2*(a*e-r*s),u=2*(r*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Eh.copy(this).projectOnVector(t),this.sub(Eh)}reflect(t){return this.sub(Eh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Eh=new P,Jd=new mi,kt=class n{constructor(t,e,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,l,c)}set(t,e,i,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],f=i[2],d=i[5],m=i[8],_=s[0],g=s[3],p=s[6],w=s[1],M=s[4],v=s[7],T=s[2],S=s[5],A=s[8];return r[0]=o*_+a*w+l*T,r[3]=o*g+a*M+l*S,r[6]=o*p+a*v+l*A,r[1]=c*_+h*w+u*T,r[4]=c*g+h*M+u*S,r[7]=c*p+h*v+u*A,r[2]=f*_+d*w+m*T,r[5]=f*g+d*M+m*S,r[8]=f*p+d*v+m*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,f=a*l-h*r,d=c*r-o*l,m=e*u+i*f+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return t[0]=u*_,t[1]=(s*c-h*i)*_,t[2]=(a*i-s*o)*_,t[3]=f*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=d*_,t[7]=(i*l-c*e)*_,t[8]=(o*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Ah.makeScale(t,e)),this}rotate(t){return this.premultiply(Ah.makeRotation(-t)),this}translate(t,e){return this.premultiply(Ah.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ah=new kt,Zd=new kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),$d=new kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Wm(){let n={enabled:!0,workingColorSpace:ws,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===he&&(s.r=Un(s.r),s.g=Un(s.g),s.b=Un(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===he&&(s.r=cr(s.r),s.g=cr(s.g),s.b=cr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Bn?po:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return dr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return dr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ws]:{primaries:t,whitePoint:i,transfer:po,toXYZ:Zd,fromXYZ:$d,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ai},outputColorSpaceConfig:{drawingBufferColorSpace:ai}},[ai]:{primaries:t,whitePoint:i,transfer:he,toXYZ:Zd,fromXYZ:$d,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ai}}}),n}var $t=Wm();function Un(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function cr(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Ys,Ya=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Ys===void 0&&(Ys=go("canvas")),Ys.width=t.width,Ys.height=t.height;let s=Ys.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Ys}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=go("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Un(r[o]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Un(e[i]/255)*255):e[i]=Un(e[i]);return{data:e,width:t.width,height:t.height}}else return Ct("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Xm=0,pr=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Xm++}),this.uuid=Nn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Ch(s[o].image)):r.push(Ch(s[o]))}else r=Ch(s);i.url=r}return e||(t.images[this.uuid]=i),i}};function Ch(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ya.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ct("Texture: Unable to serialize Texture."),{})}var qm=0,Rh=new P,li=class n extends on{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=sn,s=sn,r=$e,o=ls,a=Fi,l=gi,c=n.DEFAULT_ANISOTROPY,h=Bn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qm++}),this.uuid=Nn(),this.name="",this.source=new pr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new at(0,0),this.repeat=new at(1,1),this.center=new at(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Rh).x}get height(){return this.source.getSize(Rh).y}get depth(){return this.source.getSize(Rh).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Ct(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Ct(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==_u)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case hr:t.x=t.x-Math.floor(t.x);break;case sn:t.x=t.x<0?0:1;break;case Wa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case hr:t.y=t.y-Math.floor(t.y);break;case sn:t.y=t.y<0?0:1;break;case Wa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};li.DEFAULT_IMAGE=null;li.DEFAULT_MAPPING=_u;li.DEFAULT_ANISOTROPY=1;var Ae=class n{constructor(t=0,e=0,i=0,s=1){n.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(c+1)/2,v=(d+1)/2,T=(p+1)/2,S=(h+f)/4,A=(u+_)/4,I=(m+g)/4;return M>v&&M>T?M<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(M),s=S/i,r=A/i):v>T?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=S/s,r=I/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=A/r,s=I/r),this.set(i,s,r,e),this}let w=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(w)<.001&&(w=1),this.x=(g-m)/w,this.y=(u-_)/w,this.z=(f-h)/w,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this.w=zt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this.w=zt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ja=class extends on{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$e,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new Ae(0,0,t,e),this.scissorTest=!1,this.viewport=new Ae(0,0,t,e);let s={width:t,height:e,depth:i.depth},r=new li(s);this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(t={}){let e={minFilter:$e,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new pr(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Si=class extends Ja{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},xo=class extends li{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Za=class extends li{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=qe,this.minFilter=qe,this.wrapR=sn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Dn=class{constructor(t=new P(1/0,1/0,1/0),e=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(ki.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(ki.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=ki.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,ki):ki.fromBufferAttribute(r,o),ki.applyMatrix4(t.matrixWorld),this.expandByPoint(ki);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ma.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ma.copy(i.boundingBox)),ma.applyMatrix4(t.matrixWorld),this.union(ma)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ki),ki.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(to),ga.subVectors(this.max,to),Js.subVectors(t.a,to),Zs.subVectors(t.b,to),$s.subVectors(t.c,to),qn.subVectors(Zs,Js),Yn.subVectors($s,Zs),_s.subVectors(Js,$s);let e=[0,-qn.z,qn.y,0,-Yn.z,Yn.y,0,-_s.z,_s.y,qn.z,0,-qn.x,Yn.z,0,-Yn.x,_s.z,0,-_s.x,-qn.y,qn.x,0,-Yn.y,Yn.x,0,-_s.y,_s.x,0];return!Ph(e,Js,Zs,$s,ga)||(e=[1,0,0,0,1,0,0,0,1],!Ph(e,Js,Zs,$s,ga))?!1:(_a.crossVectors(qn,Yn),e=[_a.x,_a.y,_a.z],Ph(e,Js,Zs,$s,ga))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ki).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ki).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(An[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),An[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),An[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),An[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),An[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),An[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),An[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),An[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(An),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},An=[new P,new P,new P,new P,new P,new P,new P,new P],ki=new P,ma=new Dn,Js=new P,Zs=new P,$s=new P,qn=new P,Yn=new P,_s=new P,to=new P,ga=new P,_a=new P,xs=new P;function Ph(n,t,e,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){xs.fromArray(n,r);let a=s.x*Math.abs(xs.x)+s.y*Math.abs(xs.y)+s.z*Math.abs(xs.z),l=t.dot(xs),c=e.dot(xs),h=i.dot(xs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Ym=new Dn,eo=new P,Ih=new P,On=class{constructor(t=new P,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Ym.setFromPoints(t).getCenter(i);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;eo.subVectors(t,this.center);let e=eo.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(eo,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ih.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(eo.copy(t.center).add(Ih)),this.expandByPoint(eo.copy(t.center).sub(Ih))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Cn=new P,Nh=new P,xa=new P,Jn=new P,Uh=new P,ya=new P,Lh=new P,jn=class{constructor(t=new P,e=new P(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Cn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Cn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Cn.copy(this.origin).addScaledVector(this.direction,e),Cn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Nh.copy(t).add(e).multiplyScalar(.5),xa.copy(e).sub(t).normalize(),Jn.copy(this.origin).sub(Nh);let r=t.distanceTo(e)*.5,o=-this.direction.dot(xa),a=Jn.dot(this.direction),l=-Jn.dot(xa),c=Jn.lengthSq(),h=Math.abs(1-o*o),u,f,d,m;if(h>0)if(u=o*l-a,f=o*a-l,m=r*h,u>=0)if(f>=-m)if(f<=m){let _=1/h;u*=_,f*=_,d=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f<=-m?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=m?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Nh).addScaledVector(xa,f),d}intersectSphere(t,e){Cn.subVectors(t.center,this.origin);let i=Cn.dot(this.direction),s=Cn.dot(Cn)-i*i,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(i=(t.min.x-f.x)*c,s=(t.max.x-f.x)*c):(i=(t.max.x-f.x)*c,s=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,o=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,o=(t.min.y-f.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(a=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Cn)!==null}intersectTriangle(t,e,i,s,r){Uh.subVectors(e,t),ya.subVectors(i,t),Lh.crossVectors(Uh,ya);let o=this.direction.dot(Lh),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Jn.subVectors(this.origin,t);let l=a*this.direction.dot(ya.crossVectors(Jn,ya));if(l<0)return null;let c=a*this.direction.dot(Uh.cross(Jn));if(c<0||l+c>o)return null;let h=-a*Jn.dot(Lh);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Me=class n{constructor(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g)}set(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinant()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinant()===0)return this.identity();let e=this.elements,i=t.elements,s=1/Ks.setFromMatrixColumn(t,0).length(),r=1/Ks.setFromMatrixColumn(t,1).length(),o=1/Ks.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let f=o*h,d=o*u,m=a*h,_=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+m*c,e[5]=f-_*c,e[9]=-a*l,e[2]=_-f*c,e[6]=m+d*c,e[10]=o*l}else if(t.order==="YXZ"){let f=l*h,d=l*u,m=c*h,_=c*u;e[0]=f+_*a,e[4]=m*a-d,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=d*a-m,e[6]=_+f*a,e[10]=o*l}else if(t.order==="ZXY"){let f=l*h,d=l*u,m=c*h,_=c*u;e[0]=f-_*a,e[4]=-o*u,e[8]=m+d*a,e[1]=d+m*a,e[5]=o*h,e[9]=_-f*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let f=o*h,d=o*u,m=a*h,_=a*u;e[0]=l*h,e[4]=m*c-d,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=d*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let f=o*l,d=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=_-f*u,e[8]=m*u+d,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=d*u+m,e[10]=f-_*u}else if(t.order==="XZY"){let f=o*l,d=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=o*h,e[9]=d*u-m,e[2]=m*u-d,e[6]=a*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Jm,t,Zm)}lookAt(t,e,i){let s=this.elements;return vi.subVectors(t,e),vi.lengthSq()===0&&(vi.z=1),vi.normalize(),Zn.crossVectors(i,vi),Zn.lengthSq()===0&&(Math.abs(i.z)===1?vi.x+=1e-4:vi.z+=1e-4,vi.normalize(),Zn.crossVectors(i,vi)),Zn.normalize(),va.crossVectors(vi,Zn),s[0]=Zn.x,s[4]=va.x,s[8]=vi.x,s[1]=Zn.y,s[5]=va.y,s[9]=vi.y,s[2]=Zn.z,s[6]=va.z,s[10]=vi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],f=i[9],d=i[13],m=i[2],_=i[6],g=i[10],p=i[14],w=i[3],M=i[7],v=i[11],T=i[15],S=s[0],A=s[4],I=s[8],y=s[12],E=s[1],R=s[5],F=s[9],O=s[13],z=s[2],W=s[6],k=s[10],H=s[14],Z=s[3],nt=s[7],et=s[11],st=s[15];return r[0]=o*S+a*E+l*z+c*Z,r[4]=o*A+a*R+l*W+c*nt,r[8]=o*I+a*F+l*k+c*et,r[12]=o*y+a*O+l*H+c*st,r[1]=h*S+u*E+f*z+d*Z,r[5]=h*A+u*R+f*W+d*nt,r[9]=h*I+u*F+f*k+d*et,r[13]=h*y+u*O+f*H+d*st,r[2]=m*S+_*E+g*z+p*Z,r[6]=m*A+_*R+g*W+p*nt,r[10]=m*I+_*F+g*k+p*et,r[14]=m*y+_*O+g*H+p*st,r[3]=w*S+M*E+v*z+T*Z,r[7]=w*A+M*R+v*W+T*nt,r[11]=w*I+M*F+v*k+T*et,r[15]=w*y+M*O+v*H+T*st,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],m=t[3],_=t[7],g=t[11],p=t[15],w=l*d-c*f,M=a*d-c*u,v=a*f-l*u,T=o*d-c*h,S=o*f-l*h,A=o*u-a*h;return e*(_*w-g*M+p*v)-i*(m*w-g*T+p*S)+s*(m*M-_*T+p*A)-r*(m*v-_*S+g*A)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],m=t[12],_=t[13],g=t[14],p=t[15],w=u*g*c-_*f*c+_*l*d-a*g*d-u*l*p+a*f*p,M=m*f*c-h*g*c-m*l*d+o*g*d+h*l*p-o*f*p,v=h*_*c-m*u*c+m*a*d-o*_*d-h*a*p+o*u*p,T=m*u*l-h*_*l-m*a*f+o*_*f+h*a*g-o*u*g,S=e*w+i*M+s*v+r*T;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return t[0]=w*A,t[1]=(_*f*r-u*g*r-_*s*d+i*g*d+u*s*p-i*f*p)*A,t[2]=(a*g*r-_*l*r+_*s*c-i*g*c-a*s*p+i*l*p)*A,t[3]=(u*l*r-a*f*r-u*s*c+i*f*c+a*s*d-i*l*d)*A,t[4]=M*A,t[5]=(h*g*r-m*f*r+m*s*d-e*g*d-h*s*p+e*f*p)*A,t[6]=(m*l*r-o*g*r-m*s*c+e*g*c+o*s*p-e*l*p)*A,t[7]=(o*f*r-h*l*r+h*s*c-e*f*c-o*s*d+e*l*d)*A,t[8]=v*A,t[9]=(m*u*r-h*_*r-m*i*d+e*_*d+h*i*p-e*u*p)*A,t[10]=(o*_*r-m*a*r+m*i*c-e*_*c-o*i*p+e*a*p)*A,t[11]=(h*a*r-o*u*r-h*i*c+e*u*c+o*i*d-e*a*d)*A,t[12]=T*A,t[13]=(h*_*s-m*u*s+m*i*f-e*_*f-h*i*g+e*u*g)*A,t[14]=(m*a*s-o*_*s-m*i*l+e*_*l+o*i*g-e*a*g)*A,t[15]=(o*u*s-h*a*s+h*i*l-e*u*l-o*i*f+e*a*f)*A,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,o){return this.set(1,i,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,f=r*c,d=r*h,m=r*u,_=o*h,g=o*u,p=a*u,w=l*c,M=l*h,v=l*u,T=i.x,S=i.y,A=i.z;return s[0]=(1-(_+p))*T,s[1]=(d+v)*T,s[2]=(m-M)*T,s[3]=0,s[4]=(d-v)*S,s[5]=(1-(f+p))*S,s[6]=(g+w)*S,s[7]=0,s[8]=(m+M)*A,s[9]=(g-w)*A,s[10]=(1-(f+_))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;if(t.x=s[12],t.y=s[13],t.z=s[14],this.determinant()===0)return i.set(1,1,1),e.identity(),this;let r=Ks.set(s[0],s[1],s[2]).length(),o=Ks.set(s[4],s[5],s[6]).length(),a=Ks.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),Vi.copy(this);let c=1/r,h=1/o,u=1/a;return Vi.elements[0]*=c,Vi.elements[1]*=c,Vi.elements[2]*=c,Vi.elements[4]*=h,Vi.elements[5]*=h,Vi.elements[6]*=h,Vi.elements[8]*=u,Vi.elements[9]*=u,Vi.elements[10]*=u,e.setFromRotationMatrix(Vi),i.x=r,i.y=o,i.z=a,this}makePerspective(t,e,i,s,r,o,a=Xi,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(i-s),f=(e+t)/(e-t),d=(i+s)/(i-s),m,_;if(l)m=r/(o-r),_=o*r/(o-r);else if(a===Xi)m=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===mo)m=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,s,r,o,a=Xi,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-s),f=-(e+t)/(e-t),d=-(i+s)/(i-s),m,_;if(l)m=1/(o-r),_=o/(o-r);else if(a===Xi)m=-2/(o-r),_=-(o+r)/(o-r);else if(a===mo)m=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},Ks=new P,Vi=new Me,Jm=new P(0,0,0),Zm=new P(1,1,1),Zn=new P,va=new P,vi=new P,Kd=new Me,Qd=new mi,qi=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(zt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-zt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(zt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:Ct("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Kd.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Kd,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Qd.setFromEuler(this),this.setFromQuaternion(Qd,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};qi.DEFAULT_ORDER="XYZ";var an=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},$m=0,jd=new P,Qs=new mi,Rn=new Me,Ma=new P,io=new P,Km=new P,Qm=new mi,tf=new P(1,0,0),ef=new P(0,1,0),nf=new P(0,0,1),sf={type:"added"},jm={type:"removed"},js={type:"childadded",child:null},Dh={type:"childremoved",child:null},Ne=class n extends on{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$m++}),this.uuid=Nn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new P,e=new qi,i=new mi,s=new P(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Me},normalMatrix:{value:new kt}}),this.matrix=new Me,this.matrixWorld=new Me,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new an,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Qs.setFromAxisAngle(t,e),this.quaternion.multiply(Qs),this}rotateOnWorldAxis(t,e){return Qs.setFromAxisAngle(t,e),this.quaternion.premultiply(Qs),this}rotateX(t){return this.rotateOnAxis(tf,t)}rotateY(t){return this.rotateOnAxis(ef,t)}rotateZ(t){return this.rotateOnAxis(nf,t)}translateOnAxis(t,e){return jd.copy(t).applyQuaternion(this.quaternion),this.position.add(jd.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(tf,t)}translateY(t){return this.translateOnAxis(ef,t)}translateZ(t){return this.translateOnAxis(nf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Rn.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Ma.copy(t):Ma.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),io.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Rn.lookAt(io,Ma,this.up):Rn.lookAt(Ma,io,this.up),this.quaternion.setFromRotationMatrix(Rn),s&&(Rn.extractRotation(s.matrixWorld),Qs.setFromRotationMatrix(Rn),this.quaternion.premultiply(Qs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Rt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(sf),js.child=t,this.dispatchEvent(js),js.child=null):Rt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(jm),Dh.child=t,this.dispatchEvent(Dh),Dh.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Rn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Rn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Rn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(sf),js.child=t,this.dispatchEvent(js),js.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(io,t,Km),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(io,Qm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),f=o(t.skeletons),d=o(t.animations),m=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),m.length>0&&(i.nodes=m)}return i.object=s,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}};Ne.DEFAULT_UP=new P(0,1,0);Ne.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ne.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Gi=new P,Pn=new P,Oh=new P,In=new P,tr=new P,er=new P,rf=new P,Fh=new P,Bh=new P,zh=new P,kh=new Ae,Vh=new Ae,Gh=new Ae,Wi=class n{constructor(t=new P,e=new P,i=new P){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),Gi.subVectors(t,e),s.cross(Gi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){Gi.subVectors(s,e),Pn.subVectors(i,e),Oh.subVectors(t,e);let o=Gi.dot(Gi),a=Gi.dot(Pn),l=Gi.dot(Oh),c=Pn.dot(Pn),h=Pn.dot(Oh),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let f=1/u,d=(c*l-a*h)*f,m=(o*h-a*l)*f;return r.set(1-d-m,m,d)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,In)===null?!1:In.x>=0&&In.y>=0&&In.x+In.y<=1}static getInterpolation(t,e,i,s,r,o,a,l){return this.getBarycoord(t,e,i,s,In)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,In.x),l.addScaledVector(o,In.y),l.addScaledVector(a,In.z),l)}static getInterpolatedAttribute(t,e,i,s,r,o){return kh.setScalar(0),Vh.setScalar(0),Gh.setScalar(0),kh.fromBufferAttribute(t,e),Vh.fromBufferAttribute(t,i),Gh.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(kh,r.x),o.addScaledVector(Vh,r.y),o.addScaledVector(Gh,r.z),o}static isFrontFacing(t,e,i,s){return Gi.subVectors(i,e),Pn.subVectors(t,e),Gi.cross(Pn).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Gi.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),Gi.cross(Pn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,o,a;tr.subVectors(s,i),er.subVectors(r,i),Fh.subVectors(t,i);let l=tr.dot(Fh),c=er.dot(Fh);if(l<=0&&c<=0)return e.copy(i);Bh.subVectors(t,s);let h=tr.dot(Bh),u=er.dot(Bh);if(h>=0&&u<=h)return e.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(tr,o);zh.subVectors(t,r);let d=tr.dot(zh),m=er.dot(zh);if(m>=0&&d<=m)return e.copy(r);let _=d*c-l*m;if(_<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(i).addScaledVector(er,a);let g=h*m-d*u;if(g<=0&&u-h>=0&&d-m>=0)return rf.subVectors(r,s),a=(u-h)/(u-h+(d-m)),e.copy(s).addScaledVector(rf,a);let p=1/(g+_+f);return o=_*p,a=f*p,e.copy(i).addScaledVector(tr,o).addScaledVector(er,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},jf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},$n={h:0,s:0,l:0},Sa={h:0,s:0,l:0};function Hh(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var Dt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ai){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,$t.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=$t.workingColorSpace){return this.r=t,this.g=e,this.b=i,$t.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=$t.workingColorSpace){if(t=Cu(t,1),e=zt(e,0,1),i=zt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=Hh(o,r,t+1/3),this.g=Hh(o,r,t),this.b=Hh(o,r,t-1/3)}return $t.colorSpaceToWorking(this,s),this}setStyle(t,e=ai){function i(r){r!==void 0&&parseFloat(r)<1&&Ct("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Ct("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Ct("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ai){let i=jf[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Ct("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Un(t.r),this.g=Un(t.g),this.b=Un(t.b),this}copyLinearToSRGB(t){return this.r=cr(t.r),this.g=cr(t.g),this.b=cr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ai){return $t.workingToColorSpace(ei.copy(this),t),Math.round(zt(ei.r*255,0,255))*65536+Math.round(zt(ei.g*255,0,255))*256+Math.round(zt(ei.b*255,0,255))}getHexString(t=ai){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=$t.workingColorSpace){$t.workingToColorSpace(ei.copy(this),e);let i=ei.r,s=ei.g,r=ei.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=$t.workingColorSpace){return $t.workingToColorSpace(ei.copy(this),e),t.r=ei.r,t.g=ei.g,t.b=ei.b,t}getStyle(t=ai){$t.workingToColorSpace(ei.copy(this),t);let e=ei.r,i=ei.g,s=ei.b;return t!==ai?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL($n),this.setHSL($n.h+t,$n.s+e,$n.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL($n),t.getHSL(Sa);let i=co($n.h,Sa.h,e),s=co($n.s,Sa.s,e),r=co($n.l,Sa.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ei=new Dt;Dt.NAMES=jf;var t0=0,Yi=class extends on{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:t0++}),this.uuid=Nn(),this.name="",this.type="Material",this.blending=Ss,this.side=Ln,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ga,this.blendDst=Ha,this.blendEquation=Qn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Dt(0,0,0),this.blendAlpha=0,this.depthFunc=bs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=iu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ms,this.stencilZFail=Ms,this.stencilZPass=Ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Ct(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Ct(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ss&&(i.blending=this.blending),this.side!==Ln&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ga&&(i.blendSrc=this.blendSrc),this.blendDst!==Ha&&(i.blendDst=this.blendDst),this.blendEquation!==Qn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==bs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==iu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ms&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ms&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ms&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},ci=class extends Yi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qi,this.combine=hu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Oe=new P,ba=new at,e0=0,Se=class{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:e0++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=qa,this.updateRanges=[],this.gpuType=$i,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)ba.fromBufferAttribute(this,e),ba.applyMatrix3(t),this.setXY(e,ba.x,ba.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix3(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix4(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyNormalMatrix(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.transformDirection(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Hi(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=fe(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Hi(e,this.array)),e}setX(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Hi(e,this.array)),e}setY(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Hi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Hi(e,this.array)),e}setW(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array),s=fe(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array),s=fe(s,this.array),r=fe(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==qa&&(t.usage=this.usage),t}};var yo=class extends Se{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var vo=class extends Se{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var Kt=class extends Se{constructor(t,e,i){super(new Float32Array(t),e,i)}},i0=0,Ni=new Me,Wh=new Ne,ir=new P,Mi=new Dn,no=new Dn,Xe=new P,me=class n extends on{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:i0++}),this.uuid=Nn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Au(t)?vo:yo)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new kt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Ni.makeRotationFromQuaternion(t),this.applyMatrix4(Ni),this}rotateX(t){return Ni.makeRotationX(t),this.applyMatrix4(Ni),this}rotateY(t){return Ni.makeRotationY(t),this.applyMatrix4(Ni),this}rotateZ(t){return Ni.makeRotationZ(t),this.applyMatrix4(Ni),this}translate(t,e,i){return Ni.makeTranslation(t,e,i),this.applyMatrix4(Ni),this}scale(t,e,i){return Ni.makeScale(t,e,i),this.applyMatrix4(Ni),this}lookAt(t){return Wh.lookAt(t),Wh.updateMatrix(),this.applyMatrix4(Wh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ir).negate(),this.translate(ir.x,ir.y,ir.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Kt(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Ct("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Rt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];Mi.setFromBufferAttribute(r),this.morphTargetsRelative?(Xe.addVectors(this.boundingBox.min,Mi.min),this.boundingBox.expandByPoint(Xe),Xe.addVectors(this.boundingBox.max,Mi.max),this.boundingBox.expandByPoint(Xe)):(this.boundingBox.expandByPoint(Mi.min),this.boundingBox.expandByPoint(Mi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Rt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new On);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Rt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let i=this.boundingSphere.center;if(Mi.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];no.setFromBufferAttribute(a),this.morphTargetsRelative?(Xe.addVectors(Mi.min,no.min),Mi.expandByPoint(Xe),Xe.addVectors(Mi.max,no.max),Mi.expandByPoint(Xe)):(Mi.expandByPoint(no.min),Mi.expandByPoint(no.max))}Mi.getCenter(i);let s=0;for(let r=0,o=t.count;r<o;r++)Xe.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Xe));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Xe.fromBufferAttribute(a,c),l&&(ir.fromBufferAttribute(t,c),Xe.add(ir)),s=Math.max(s,i.distanceToSquared(Xe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Rt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Rt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Se(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<i.count;I++)a[I]=new P,l[I]=new P;let c=new P,h=new P,u=new P,f=new at,d=new at,m=new at,_=new P,g=new P;function p(I,y,E){c.fromBufferAttribute(i,I),h.fromBufferAttribute(i,y),u.fromBufferAttribute(i,E),f.fromBufferAttribute(r,I),d.fromBufferAttribute(r,y),m.fromBufferAttribute(r,E),h.sub(c),u.sub(c),d.sub(f),m.sub(f);let R=1/(d.x*m.y-m.x*d.y);isFinite(R)&&(_.copy(h).multiplyScalar(m.y).addScaledVector(u,-d.y).multiplyScalar(R),g.copy(u).multiplyScalar(d.x).addScaledVector(h,-m.x).multiplyScalar(R),a[I].add(_),a[y].add(_),a[E].add(_),l[I].add(g),l[y].add(g),l[E].add(g))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let I=0,y=w.length;I<y;++I){let E=w[I],R=E.start,F=E.count;for(let O=R,z=R+F;O<z;O+=3)p(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let M=new P,v=new P,T=new P,S=new P;function A(I){T.fromBufferAttribute(s,I),S.copy(T);let y=a[I];M.copy(y),M.sub(T.multiplyScalar(T.dot(y))).normalize(),v.crossVectors(S,y);let R=v.dot(l[I])<0?-1:1;o.setXYZW(I,M.x,M.y,M.z,R)}for(let I=0,y=w.length;I<y;++I){let E=w[I],R=E.start,F=E.count;for(let O=R,z=R+F;O<z;O+=3)A(t.getX(O+0)),A(t.getX(O+1)),A(t.getX(O+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Se(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(t)for(let f=0,d=t.count;f<d;f+=3){let m=t.getX(f+0),_=t.getX(f+1),g=t.getX(f+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,g),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,g),a.add(h),l.add(h),c.add(h),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),o.fromBufferAttribute(e,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Xe.fromBufferAttribute(t,e),Xe.normalize(),t.setXYZ(e,Xe.x,Xe.y,Xe.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h),d=0,m=0;for(let _=0,g=l.length;_<g;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*h;for(let p=0;p<h;p++)f[m++]=c[d++]}return new Se(f,h,u)}if(this.index===null)return Ct("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,i);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let f=c[h],d=t(f,i);l.push(d)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},of=new Me,ys=new jn,wa=new On,af=new P,Ta=new P,Ea=new P,Aa=new P,Xh=new P,Ca=new P,lf=new P,Ra=new P,Ce=class extends Ne{constructor(t=new me,e=new ci){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Ca.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Xh.fromBufferAttribute(u,t),o?Ca.addScaledVector(Xh,h):Ca.addScaledVector(Xh.sub(e),h))}e.add(Ca)}return e}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),wa.copy(i.boundingSphere),wa.applyMatrix4(r),ys.copy(t.ray).recast(t.near),!(wa.containsPoint(ys.origin)===!1&&(ys.intersectSphere(wa,af)===null||ys.origin.distanceToSquared(af)>(t.far-t.near)**2))&&(of.copy(r).invert(),ys.copy(t.ray).applyMatrix4(of),!(i.boundingBox!==null&&ys.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,ys)))}_computeIntersections(t,e,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=o[g.materialIndex],w=Math.max(g.start,d.start),M=Math.min(a.count,Math.min(g.start+g.count,d.start+d.count));for(let v=w,T=M;v<T;v+=3){let S=a.getX(v),A=a.getX(v+1),I=a.getX(v+2);s=Pa(this,p,t,i,c,h,u,S,A,I),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let w=a.getX(g),M=a.getX(g+1),v=a.getX(g+2);s=Pa(this,o,t,i,c,h,u,w,M,v),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,_=f.length;m<_;m++){let g=f[m],p=o[g.materialIndex],w=Math.max(g.start,d.start),M=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let v=w,T=M;v<T;v+=3){let S=v,A=v+1,I=v+2;s=Pa(this,p,t,i,c,h,u,S,A,I),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let g=m,p=_;g<p;g+=3){let w=g,M=g+1,v=g+2;s=Pa(this,o,t,i,c,h,u,w,M,v),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function n0(n,t,e,i,s,r,o,a){let l;if(t.side===ke?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,t.side===Ln,a),l===null)return null;Ra.copy(a),Ra.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(Ra);return c<e.near||c>e.far?null:{distance:c,point:Ra.clone(),object:n}}function Pa(n,t,e,i,s,r,o,a,l,c){n.getVertexPosition(a,Ta),n.getVertexPosition(l,Ea),n.getVertexPosition(c,Aa);let h=n0(n,t,e,i,Ta,Ea,Aa,lf);if(h){let u=new P;Wi.getBarycoord(lf,Ta,Ea,Aa,u),s&&(h.uv=Wi.getInterpolatedAttribute(s,a,l,c,u,new at)),r&&(h.uv1=Wi.getInterpolatedAttribute(r,a,l,c,u,new at)),o&&(h.normal=Wi.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new P,materialIndex:0};Wi.getNormal(Ta,Ea,Aa,f.normal),h.face=f,h.barycoord=u}return h}var hi=class n extends me{constructor(t=1,e=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],f=0,d=0;m("z","y","x",-1,-1,i,e,t,o,r,0),m("z","y","x",1,-1,i,e,-t,o,r,1),m("x","z","y",1,1,t,i,e,s,o,2),m("x","z","y",1,-1,t,i,-e,s,o,3),m("x","y","z",1,-1,t,e,i,s,r,4),m("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Kt(c,3)),this.setAttribute("normal",new Kt(h,3)),this.setAttribute("uv",new Kt(u,2));function m(_,g,p,w,M,v,T,S,A,I,y){let E=v/A,R=T/I,F=v/2,O=T/2,z=S/2,W=A+1,k=I+1,H=0,Z=0,nt=new P;for(let et=0;et<k;et++){let st=et*R-O;for(let Ut=0;Ut<W;Ut++){let Pt=Ut*E-F;nt[_]=Pt*w,nt[g]=st*M,nt[p]=z,c.push(nt.x,nt.y,nt.z),nt[_]=0,nt[g]=0,nt[p]=S>0?1:-1,h.push(nt.x,nt.y,nt.z),u.push(Ut/A),u.push(1-et/I),H+=1}}for(let et=0;et<I;et++)for(let st=0;st<A;st++){let Ut=f+st+W*et,Pt=f+st+W*(et+1),ne=f+(st+1)+W*(et+1),Jt=f+(st+1)+W*et;l.push(Ut,Pt,Jt),l.push(Pt,ne,Jt),Z+=6}a.addGroup(d,Z,y),d+=Z,f+=H}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Os(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Ct("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone():Array.isArray(s)?t[e][i]=s.slice():t[e][i]=s}}return t}function ii(n){let t={};for(let e=0;e<n.length;e++){let i=Os(n[e]);for(let s in i)t[s]=i[s]}return t}function s0(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Pu(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$t.workingColorSpace}var tp={clone:Os,merge:ii},r0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,o0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Fe=class extends Yi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=r0,this.fragmentShader=o0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Os(t.uniforms),this.uniformsGroups=s0(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}},Mo=class extends Ne{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Me,this.projectionMatrix=new Me,this.projectionMatrixInverse=new Me,this.coordinateSystem=Xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Kn=new P,cf=new at,hf=new at,ze=class extends Mo{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=fr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(lo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return fr*2*Math.atan(Math.tan(lo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Kn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Kn.x,Kn.y).multiplyScalar(-t/Kn.z),Kn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Kn.x,Kn.y).multiplyScalar(-t/Kn.z)}getViewSize(t,e){return this.getViewBounds(t,cf,hf),e.subVectors(hf,cf)}setViewOffset(t,e,i,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(lo*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},nr=-90,sr=1,$a=class extends Ne{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new ze(nr,sr,t,e);s.layers=this.layers,this.add(s);let r=new ze(nr,sr,t,e);r.layers=this.layers,this.add(r);let o=new ze(nr,sr,t,e);o.layers=this.layers,this.add(o);let a=new ze(nr,sr,t,e);a.layers=this.layers,this.add(a);let l=new ze(nr,sr,t,e);l.layers=this.layers,this.add(l);let c=new ze(nr,sr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Xi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===mo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,s),t.render(e,r),t.setRenderTarget(i,1,s),t.render(e,o),t.setRenderTarget(i,2,s),t.render(e,a),t.setRenderTarget(i,3,s),t.render(e,l),t.setRenderTarget(i,4,s),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,s),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},So=class extends li{constructor(t=[],e=as,i,s,r,o,a,l,c,h){super(t,e,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},bo=class extends Si{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new So(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new hi(5,5,5),r=new Fe({name:"CubemapFromEquirect",uniforms:Os(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:ke,blending:ln});r.uniforms.tEquirect.value=e;let o=new Ce(s,r),a=e.minFilter;return e.minFilter===ls&&(e.minFilter=$e),new $a(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,s);t.setRenderTarget(r)}},Ue=class extends Ne{constructor(){super(),this.isGroup=!0,this.type="Group"}},a0={type:"move"},mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ue,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ue,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ue,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let g=e.getJointPose(_,i),p=this._getHandJoint(c,_);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,m=.005;c.inputState.pinching&&f>d+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(a0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ue;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}};var gr=class n{constructor(t,e=1,i=1e3){this.isFog=!0,this.name="",this.color=new Dt(t),this.near=e,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ts=class extends Ne{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qi,this.environmentIntensity=1,this.environmentRotation=new qi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},wo=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=qa,this.updateRanges=[],this.version=0,this.uuid=Nn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Nn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Nn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},oi=new P,_r=class n{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)oi.fromBufferAttribute(this,e),oi.applyMatrix4(t),this.setXYZ(e,oi.x,oi.y,oi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)oi.fromBufferAttribute(this,e),oi.applyNormalMatrix(t),this.setXYZ(e,oi.x,oi.y,oi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)oi.fromBufferAttribute(this,e),oi.transformDirection(t),this.setXYZ(e,oi.x,oi.y,oi.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Hi(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=fe(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Hi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Hi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Hi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Hi(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array),s=fe(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),i=fe(i,this.array),s=fe(s,this.array),r=fe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){_o("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Se(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new n(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){_o("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Es=class extends Yi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Dt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},rr,so=new P,or=new P,ar=new P,lr=new at,ro=new at,ep=new Me,Ia=new P,oo=new P,Na=new P,uf=new at,qh=new at,df=new at,As=class extends Ne{constructor(t=new Es){if(super(),this.isSprite=!0,this.type="Sprite",rr===void 0){rr=new me;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new wo(e,5);rr.setIndex([0,1,2,0,2,3]),rr.setAttribute("position",new _r(i,3,0,!1)),rr.setAttribute("uv",new _r(i,2,3,!1))}this.geometry=rr,this.material=t,this.center=new at(.5,.5),this.count=1}raycast(t,e){t.camera===null&&Rt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),or.setFromMatrixScale(this.matrixWorld),ep.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ar.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&or.multiplyScalar(-ar.z);let i=this.material.rotation,s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));let o=this.center;Ua(Ia.set(-.5,-.5,0),ar,o,or,s,r),Ua(oo.set(.5,-.5,0),ar,o,or,s,r),Ua(Na.set(.5,.5,0),ar,o,or,s,r),uf.set(0,0),qh.set(1,0),df.set(1,1);let a=t.ray.intersectTriangle(Ia,oo,Na,!1,so);if(a===null&&(Ua(oo.set(-.5,.5,0),ar,o,or,s,r),qh.set(0,1),a=t.ray.intersectTriangle(Ia,Na,oo,!1,so),a===null))return;let l=t.ray.origin.distanceTo(so);l<t.near||l>t.far||e.push({distance:l,point:so.clone(),uv:Wi.getInterpolation(so,Ia,oo,Na,uf,qh,df,new at),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Ua(n,t,e,i,s,r){lr.subVectors(n,e).addScalar(.5).multiply(i),s!==void 0?(ro.x=r*lr.x-s*lr.y,ro.y=s*lr.x+r*lr.y):ro.copy(lr),n.copy(t),n.x+=ro.x,n.y+=ro.y,n.applyMatrix4(ep)}var Ka=class extends li{constructor(t=null,e=1,i=1,s,r,o,a,l,c=qe,h=qe,u,f){super(null,o,a,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Li=class extends Se{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}};var Yh=new P,l0=new P,c0=new kt,Ui=class{constructor(t=new P(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Yh.subVectors(i,e).cross(l0.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let i=t.delta(Yh),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||c0.getNormalMatrix(t),s=this.coplanarPoint(Yh).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},vs=new On,h0=new at(.5,.5),La=new P,xr=class{constructor(t=new Ui,e=new Ui,i=new Ui,s=new Ui,r=new Ui,o=new Ui){this.planes=[t,e,i,s,r,o]}set(t,e,i,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Xi,i=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],d=r[7],m=r[8],_=r[9],g=r[10],p=r[11],w=r[12],M=r[13],v=r[14],T=r[15];if(s[0].setComponents(c-o,d-h,p-m,T-w).normalize(),s[1].setComponents(c+o,d+h,p+m,T+w).normalize(),s[2].setComponents(c+a,d+u,p+_,T+M).normalize(),s[3].setComponents(c-a,d-u,p-_,T-M).normalize(),i)s[4].setComponents(l,f,g,v).normalize(),s[5].setComponents(c-l,d-f,p-g,T-v).normalize();else if(s[4].setComponents(c-l,d-f,p-g,T-v).normalize(),e===Xi)s[5].setComponents(c+l,d+f,p+g,T+v).normalize();else if(e===mo)s[5].setComponents(l,f,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),vs.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),vs.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(vs)}intersectsSprite(t){vs.center.set(0,0,0);let e=h0.distanceTo(t.center);return vs.radius=.7071067811865476+e,vs.applyMatrix4(t.matrixWorld),this.intersectsSphere(vs)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(La.x=s.normal.x>0?t.max.x:t.min.x,La.y=s.normal.y>0?t.max.y:t.min.y,La.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(La)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Cs=class extends Yi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Qa=new P,ja=new P,ff=new Me,ao=new jn,Da=new On,Jh=new P,pf=new P,Rs=class extends Ne{constructor(t=new me,e=new Cs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let s=1,r=e.count;s<r;s++)Qa.fromBufferAttribute(e,s-1),ja.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=Qa.distanceTo(ja);t.setAttribute("lineDistance",new Kt(i,1))}else Ct("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Da.copy(i.boundingSphere),Da.applyMatrix4(s),Da.radius+=r,t.ray.intersectsSphere(Da)===!1)return;ff.copy(s).invert(),ao.copy(t.ray).applyMatrix4(ff);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,f=i.attributes.position;if(h!==null){let d=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let _=d,g=m-1;_<g;_+=c){let p=h.getX(_),w=h.getX(_+1),M=Oa(this,t,ao,l,p,w,_);M&&e.push(M)}if(this.isLineLoop){let _=h.getX(m-1),g=h.getX(d),p=Oa(this,t,ao,l,_,g,m-1);p&&e.push(p)}}else{let d=Math.max(0,o.start),m=Math.min(f.count,o.start+o.count);for(let _=d,g=m-1;_<g;_+=c){let p=Oa(this,t,ao,l,_,_+1,_);p&&e.push(p)}if(this.isLineLoop){let _=Oa(this,t,ao,l,m-1,d,m-1);_&&e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Oa(n,t,e,i,s,r,o){let a=n.geometry.attributes.position;if(Qa.fromBufferAttribute(a,s),ja.fromBufferAttribute(a,r),e.distanceSqToSegment(Qa,ja,Jh,pf)>i)return;Jh.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Jh);if(!(c<t.near||c>t.far))return{distance:c,point:pf.clone().applyMatrix4(n.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:n}}var yr=class extends Yi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},mf=new Me,nu=new jn,Fa=new On,Ba=new P,vr=class extends Ne{constructor(t=new me,e=new yr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Fa.copy(i.boundingSphere),Fa.applyMatrix4(s),Fa.radius+=r,t.ray.intersectsSphere(Fa)===!1)return;mf.copy(s).invert(),nu.copy(t.ray).applyMatrix4(mf);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){let f=Math.max(0,o.start),d=Math.min(c.count,o.start+o.count);for(let m=f,_=d;m<_;m++){let g=c.getX(m);Ba.fromBufferAttribute(u,g),gf(Ba,g,l,s,t,e,this)}}else{let f=Math.max(0,o.start),d=Math.min(u.count,o.start+o.count);for(let m=f,_=d;m<_;m++)Ba.fromBufferAttribute(u,m),gf(Ba,m,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function gf(n,t,e,i,s,r,o){let a=nu.distanceSqToPoint(n);if(a<e){let l=new P;nu.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var To=class extends li{constructor(t,e,i,s,r,o,a,l,c){super(t,e,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},ts=class extends li{constructor(t,e,i=Zi,s,r,o,a=qe,l=qe,c,h=rn,u=1){if(h!==rn&&h!==cs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:t,height:e,depth:u};super(f,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new pr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},tl=class extends ts{constructor(t,e=Zi,i=as,s,r,o=qe,a=qe,l,c=rn){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Eo=class extends li{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}};var Di=class n extends me{constructor(t=1,e=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],f=[],d=[],m=0,_=[],g=i/2,p=0;w(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Kt(u,3)),this.setAttribute("normal",new Kt(f,3)),this.setAttribute("uv",new Kt(d,2));function w(){let v=new P,T=new P,S=0,A=(e-t)/i;for(let I=0;I<=r;I++){let y=[],E=I/r,R=E*(e-t)+t;for(let F=0;F<=s;F++){let O=F/s,z=O*l+a,W=Math.sin(z),k=Math.cos(z);T.x=R*W,T.y=-E*i+g,T.z=R*k,u.push(T.x,T.y,T.z),v.set(W,A,k).normalize(),f.push(v.x,v.y,v.z),d.push(O,1-E),y.push(m++)}_.push(y)}for(let I=0;I<s;I++)for(let y=0;y<r;y++){let E=_[y][I],R=_[y+1][I],F=_[y+1][I+1],O=_[y][I+1];(t>0||y!==0)&&(h.push(E,R,O),S+=3),(e>0||y!==r-1)&&(h.push(R,F,O),S+=3)}c.addGroup(p,S,0),p+=S}function M(v){let T=m,S=new at,A=new P,I=0,y=v===!0?t:e,E=v===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,g*E,0),f.push(0,E,0),d.push(.5,.5),m++;let R=m;for(let F=0;F<=s;F++){let z=F/s*l+a,W=Math.cos(z),k=Math.sin(z);A.x=y*k,A.y=g*E,A.z=y*W,u.push(A.x,A.y,A.z),f.push(0,E,0),S.x=W*.5+.5,S.y=k*.5*E+.5,d.push(S.x,S.y),m++}for(let F=0;F<s;F++){let O=T+F,z=R+F;v===!0?h.push(z,z+1,O):h.push(z+1,z,O),I+=3}c.addGroup(p,I,v===!0?1:2),p+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Mr=class n extends Di{constructor(t=1,e=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Oi=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ct("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),s=0,r=i.length,o;e?o=e:o=t*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);let h=i[s],f=i[s+1]-h,d=(o-h)/f;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new at:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new P,s=[],r=[],o=[],a=new P,l=new Me;for(let d=0;d<=t;d++){let m=d/t;s[d]=this.getTangentAt(m,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(zt(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,m))}o[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(zt(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(d=-d);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],d*m)),o[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Ao=class extends Oi{constructor(t=0,e=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new at){let i=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},el=class extends Ao{constructor(t,e,i,s,r,o){super(t,e,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Iu(){let n=0,t=0,e=0,i=0;function s(r,o,a,l){n=r,t=a,e=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,d=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,d*=h,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return n+t*r+e*o+i*a}}}var za=new P,Zh=new Iu,$h=new Iu,Kh=new Iu,Sr=class extends Oi{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new P){let i=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(za.subVectors(s[0],s[1]).add(s[0]),c=za);let u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(za.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=za),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),d),_=Math.pow(u.distanceToSquared(f),d),g=Math.pow(f.distanceToSquared(h),d);_<1e-4&&(_=1),m<1e-4&&(m=_),g<1e-4&&(g=_),Zh.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,m,_,g),$h.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,m,_,g),Kh.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,m,_,g)}else this.curveType==="catmullrom"&&(Zh.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),$h.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Kh.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return i.set(Zh.calc(l),$h.calc(l),Kh.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new P().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function _f(n,t,e,i,s){let r=(i-t)*.5,o=(s-e)*.5,a=n*n,l=n*a;return(2*e-2*i+r+o)*l+(-3*e+3*i-2*r-o)*a+r*n+e}function u0(n,t){let e=1-n;return e*e*t}function d0(n,t){return 2*(1-n)*n*t}function f0(n,t){return n*n*t}function ho(n,t,e,i){return u0(n,t)+d0(n,e)+f0(n,i)}function p0(n,t){let e=1-n;return e*e*e*t}function m0(n,t){let e=1-n;return 3*e*e*n*t}function g0(n,t){return 3*(1-n)*n*n*t}function _0(n,t){return n*n*n*t}function uo(n,t,e,i,s){return p0(n,t)+m0(n,e)+g0(n,i)+_0(n,s)}var il=class extends Oi{constructor(t=new at,e=new at,i=new at,s=new at){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new at){let i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(uo(t,s.x,r.x,o.x,a.x),uo(t,s.y,r.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},nl=class extends Oi{constructor(t=new P,e=new P,i=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new P){let i=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(uo(t,s.x,r.x,o.x,a.x),uo(t,s.y,r.y,o.y,a.y),uo(t,s.z,r.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},sl=class extends Oi{constructor(t=new at,e=new at){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new at){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new at){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},rl=class extends Oi{constructor(t=new P,e=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new P){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new P){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ol=class extends Oi{constructor(t=new at,e=new at,i=new at){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new at){let i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(ho(t,s.x,r.x,o.x),ho(t,s.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Co=class extends Oi{constructor(t=new P,e=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new P){let i=e,s=this.v0,r=this.v1,o=this.v2;return i.set(ho(t,s.x,r.x,o.x),ho(t,s.y,r.y,o.y),ho(t,s.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},al=class extends Oi{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new at){let i=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return i.set(_f(a,l.x,c.x,h.x,u.x),_f(a,l.y,c.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new at().fromArray(s))}return this}},x0=Object.freeze({__proto__:null,ArcCurve:el,CatmullRomCurve3:Sr,CubicBezierCurve:il,CubicBezierCurve3:nl,EllipseCurve:Ao,LineCurve:sl,LineCurve3:rl,QuadraticBezierCurve:ol,QuadraticBezierCurve3:Co,SplineCurve:al});var Ro=class n extends me{constructor(t=[new at(0,-.5),new at(.5,0),new at(0,.5)],e=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:s},e=Math.floor(e),s=zt(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new P,f=new at,d=new P,m=new P,_=new P,g=0,p=0;for(let w=0;w<=t.length-1;w++)switch(w){case 0:g=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,d.x=p*1,d.y=-g,d.z=p*0,_.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:g=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,d.x=p*1,d.y=-g,d.z=p*0,m.copy(d),d.x+=_.x,d.y+=_.y,d.z+=_.z,d.normalize(),l.push(d.x,d.y,d.z),_.copy(m)}for(let w=0;w<=e;w++){let M=i+w*h*s,v=Math.sin(M),T=Math.cos(M);for(let S=0;S<=t.length-1;S++){u.x=t[S].x*v,u.y=t[S].y,u.z=t[S].x*T,o.push(u.x,u.y,u.z),f.x=w/e,f.y=S/(t.length-1),a.push(f.x,f.y);let A=l[3*S+0]*v,I=l[3*S+1],y=l[3*S+0]*T;c.push(A,I,y)}}for(let w=0;w<e;w++)for(let M=0;M<t.length-1;M++){let v=M+w*t.length,T=v,S=v+t.length,A=v+t.length+1,I=v+1;r.push(T,S,I),r.push(A,I,S)}this.setIndex(r),this.setAttribute("position",new Kt(o,3)),this.setAttribute("uv",new Kt(a,2)),this.setAttribute("normal",new Kt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.points,t.segments,t.phiStart,t.phiLength)}};var Fn=class n extends me{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=t/a,f=e/l,d=[],m=[],_=[],g=[];for(let p=0;p<h;p++){let w=p*f-o;for(let M=0;M<c;M++){let v=M*u-r;m.push(v,-w,0),_.push(0,0,1),g.push(M/a),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let w=0;w<a;w++){let M=w+c*p,v=w+c*(p+1),T=w+1+c*(p+1),S=w+1+c*p;d.push(M,v,S),d.push(v,T,S)}this.setIndex(d),this.setAttribute("position",new Kt(m,3)),this.setAttribute("normal",new Kt(_,3)),this.setAttribute("uv",new Kt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},Po=class n extends me{constructor(t=.5,e=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);let a=[],l=[],c=[],h=[],u=t,f=(e-t)/s,d=new P,m=new at;for(let _=0;_<=s;_++){for(let g=0;g<=i;g++){let p=r+g/i*o;d.x=u*Math.cos(p),d.y=u*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),m.x=(d.x/e+1)/2,m.y=(d.y/e+1)/2,h.push(m.x,m.y)}u+=f}for(let _=0;_<s;_++){let g=_*(i+1);for(let p=0;p<i;p++){let w=p+g,M=w,v=w+i+1,T=w+i+2,S=w+1;a.push(M,v,S),a.push(v,T,S)}}this.setIndex(a),this.setAttribute("position",new Kt(l,3)),this.setAttribute("normal",new Kt(c,3)),this.setAttribute("uv",new Kt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var es=class n extends me{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new P,f=new P,d=[],m=[],_=[],g=[];for(let p=0;p<=i;p++){let w=[],M=p/i,v=0;p===0&&o===0?v=.5/e:p===i&&l===Math.PI&&(v=-.5/e);for(let T=0;T<=e;T++){let S=T/e;u.x=-t*Math.cos(s+S*r)*Math.sin(o+M*a),u.y=t*Math.cos(o+M*a),u.z=t*Math.sin(s+S*r)*Math.sin(o+M*a),m.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),g.push(S+v,1-M),w.push(c++)}h.push(w)}for(let p=0;p<i;p++)for(let w=0;w<e;w++){let M=h[p][w+1],v=h[p][w],T=h[p+1][w],S=h[p+1][w+1];(p!==0||o>0)&&d.push(M,v,S),(p!==i-1||l<Math.PI)&&d.push(v,T,S)}this.setIndex(d),this.setAttribute("position",new Kt(m,3)),this.setAttribute("normal",new Kt(_,3)),this.setAttribute("uv",new Kt(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var br=class n extends me{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let o=[],a=[],l=[],c=[],h=new P,u=new P,f=new P;for(let d=0;d<=i;d++)for(let m=0;m<=s;m++){let _=m/s*r,g=d/i*Math.PI*2;u.x=(t+e*Math.cos(g))*Math.cos(_),u.y=(t+e*Math.cos(g))*Math.sin(_),u.z=e*Math.sin(g),a.push(u.x,u.y,u.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(m/s),c.push(d/i)}for(let d=1;d<=i;d++)for(let m=1;m<=s;m++){let _=(s+1)*d+m-1,g=(s+1)*(d-1)+m-1,p=(s+1)*(d-1)+m,w=(s+1)*d+m;o.push(_,g,w),o.push(g,p,w)}this.setIndex(o),this.setAttribute("position",new Kt(a,3)),this.setAttribute("normal",new Kt(l,3)),this.setAttribute("uv",new Kt(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var Io=class n extends me{constructor(t=new Co(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),e=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:s,closed:r};let o=t.computeFrenetFrames(e,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new P,l=new P,c=new at,h=new P,u=[],f=[],d=[],m=[];_(),this.setIndex(m),this.setAttribute("position",new Kt(u,3)),this.setAttribute("normal",new Kt(f,3)),this.setAttribute("uv",new Kt(d,2));function _(){for(let M=0;M<e;M++)g(M);g(r===!1?e:0),w(),p()}function g(M){h=t.getPointAt(M/e,h);let v=o.normals[M],T=o.binormals[M];for(let S=0;S<=s;S++){let A=S/s*Math.PI*2,I=Math.sin(A),y=-Math.cos(A);l.x=y*v.x+I*T.x,l.y=y*v.y+I*T.y,l.z=y*v.z+I*T.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function p(){for(let M=1;M<=e;M++)for(let v=1;v<=s;v++){let T=(s+1)*(M-1)+(v-1),S=(s+1)*M+(v-1),A=(s+1)*M+v,I=(s+1)*(M-1)+v;m.push(T,S,I),m.push(S,A,I)}}function w(){for(let M=0;M<=e;M++)for(let v=0;v<=s;v++)c.x=M/e,c.y=v/s,d.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new n(new x0[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};var ll=class extends Fe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ke=class extends Yi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Dt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Tu,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},No=class extends Ke{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new at(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return zt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Dt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Dt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Dt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var cl=class extends Yi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Hf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},hl=class extends Yi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};var Uo=class extends Cs{constructor(t){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}};function ka(n,t){return!n||n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}var Ps=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];i:{t:{let o;e:{n:if(!(t<s)){for(let a=i+2;;){if(s===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=e[++i],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=e[--i-1],t>=r)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=i[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ul=class extends Ps{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jh,endingEnd:jh}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case tu:r=t,a=2*e-i;break;case eu:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case tu:o=t,l=2*i-e;break;case eu:o=1,l=i+s[1]-s[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,m=(i-e)/(s-e),_=m*m,g=_*m,p=-f*g+2*f*_-f*m,w=(1+f)*g+(-1.5-2*f)*_+(-.5+f)*m+1,M=(-1-d)*g+(1.5+d)*_+.5*m,v=d*g-d*_;for(let T=0;T!==a;++T)r[T]=p*o[h+T]+w*o[c+T]+M*o[l+T]+v*o[u+T];return r}},dl=class extends Ps{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(s-e),u=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*u+o[l+f]*h;return r}},fl=class extends Ps{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},bi=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ka(e,this.TimeBufferType),this.values=ka(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:ka(t.times,Array),values:ka(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new fl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new dl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ul(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case fo:e=this.InterpolantFactoryMethodDiscrete;break;case Xa:e=this.InterpolantFactoryMethodLinear;break;case Va:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ct("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return fo;case this.InterpolantFactoryMethodLinear:return Xa;case this.InterpolantFactoryMethodSmooth:return Va}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t}return this}trim(t,e){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<t;)++r;for(;o!==-1&&i[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Rt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Rt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Rt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Rt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&Am(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Rt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Va,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(s)l=!0;else{let u=a*i,f=u-i,d=u+i;for(let m=0;m!==i;++m){let _=e[u+m];if(_!==e[f+m]||_!==e[d+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*i,f=o*i;for(let d=0;d!==i;++d)e[f+d]=e[u+d]}++o}}if(r>0){t[o]=t[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};bi.prototype.ValueTypeName="";bi.prototype.TimeBufferType=Float32Array;bi.prototype.ValueBufferType=Float32Array;bi.prototype.DefaultInterpolation=Xa;var is=class extends bi{constructor(t,e,i){super(t,e,i)}};is.prototype.ValueTypeName="bool";is.prototype.ValueBufferType=Array;is.prototype.DefaultInterpolation=fo;is.prototype.InterpolantFactoryMethodLinear=void 0;is.prototype.InterpolantFactoryMethodSmooth=void 0;var pl=class extends bi{constructor(t,e,i,s){super(t,e,i,s)}};pl.prototype.ValueTypeName="color";var ml=class extends bi{constructor(t,e,i,s){super(t,e,i,s)}};ml.prototype.ValueTypeName="number";var gl=class extends Ps{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(s-e),c=t*a;for(let h=c+a;c!==h;c+=4)mi.slerpFlat(r,0,o,c-a,o,c,l);return r}},Lo=class extends bi{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new gl(this.times,this.values,this.getValueSize(),t)}};Lo.prototype.ValueTypeName="quaternion";Lo.prototype.InterpolantFactoryMethodSmooth=void 0;var ns=class extends bi{constructor(t,e,i){super(t,e,i)}};ns.prototype.ValueTypeName="string";ns.prototype.ValueBufferType=Array;ns.prototype.DefaultInterpolation=fo;ns.prototype.InterpolantFactoryMethodLinear=void 0;ns.prototype.InterpolantFactoryMethodSmooth=void 0;var _l=class extends bi{constructor(t,e,i,s){super(t,e,i,s)}};_l.prototype.ValueTypeName="vector";var xl=class{constructor(t,e,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let d=c[u],m=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},ip=new xl,yl=class{constructor(t){this.manager=t!==void 0?t:ip,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};yl.DEFAULT_MATERIAL_NAME="__DEFAULT";var wr=class extends Ne{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Dt(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Is=class extends wr{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Dt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Qh=new Me,xf=new P,yf=new P,vl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new at(512,512),this.mapType=gi,this.map=null,this.mapPass=null,this.matrix=new Me,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xr,this._frameExtents=new at(1,1),this._viewportCount=1,this._viewports=[new Ae(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,i=this.matrix;xf.setFromMatrixPosition(t.matrixWorld),e.position.copy(xf),yf.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(yf),e.updateMatrixWorld(),Qh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qh,e.coordinateSystem,e.reversedDepth),e.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Qh)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var su=class extends vl{constructor(){super(new ze(90,1,.5,500)),this.isPointLightShadow=!0}},ss=class extends wr{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new su}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Ns=class extends Mo{constructor(t=-1,e=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,o=i+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ru=class extends vl{constructor(){super(new Ns(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Us=class extends wr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ne.DEFAULT_UP),this.updateMatrix(),this.target=new Ne,this.shadow=new ru}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Do=class extends me{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Ml=class extends ze{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},Tr=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};var Nu="\\[\\]\\.:\\/",y0=new RegExp("["+Nu+"]","g"),Uu="[^"+Nu+"]",v0="[^"+Nu.replace("\\.","")+"]",M0=/((?:WC+[\/:])*)/.source.replace("WC",Uu),S0=/(WCOD+)?/.source.replace("WCOD",v0),b0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Uu),w0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Uu),T0=new RegExp("^"+M0+S0+b0+w0+"$"),E0=["material","materials","bones","map"],ou=class{constructor(t,e,i){let s=i||be.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},be=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(y0,"")}static parseTrackName(t){let e=T0.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);E0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ct("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Rt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Rt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Rt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Rt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Rt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Rt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;Rt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Rt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};be.Composite=ou;be.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};be.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};be.prototype.GetterByBindingType=[be.prototype._getValue_direct,be.prototype._getValue_array,be.prototype._getValue_arrayElement,be.prototype._getValue_toArray];be.prototype.SetterByBindingTypeAndVersioning=[[be.prototype._setValue_direct,be.prototype._setValue_direct_setNeedsUpdate,be.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[be.prototype._setValue_array,be.prototype._setValue_array_setNeedsUpdate,be.prototype._setValue_array_setMatrixWorldNeedsUpdate],[be.prototype._setValue_arrayElement,be.prototype._setValue_arrayElement_setNeedsUpdate,be.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[be.prototype._setValue_fromArray,be.prototype._setValue_fromArray_setNeedsUpdate,be.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var w3=new Float32Array(1);var ui=class n{constructor(t){this.value=t}clone(){return new n(this.value.clone===void 0?this.value:this.value.clone())}};var Er=class{constructor(t=1,e=0,i=0){this.radius=t,this.phi=e,this.theta=i}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=zt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){return this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,i),this.phi=Math.acos(zt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Oo=class extends on{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){Ct("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Lu(n,t,e,i){let s=A0(i);switch(e){case Su:return n*t;case wu:return n*t/s.components*s.byteLength;case Ol:return n*t/s.components*s.byteLength;case Ds:return n*t*2/s.components*s.byteLength;case Fl:return n*t*2/s.components*s.byteLength;case bu:return n*t*3/s.components*s.byteLength;case Fi:return n*t*4/s.components*s.byteLength;case Bl:return n*t*4/s.components*s.byteLength;case Vo:case Go:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Ho:case Wo:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case kl:case Gl:return Math.max(n,16)*Math.max(t,8)/4;case zl:case Vl:return Math.max(n,8)*Math.max(t,8)/2;case Hl:case Wl:case ql:case Yl:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Xl:case Jl:case Zl:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case $l:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Kl:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case Ql:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case jl:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case tc:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case ec:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case ic:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case nc:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case sc:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case rc:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case oc:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case ac:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case lc:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case cc:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case hc:case uc:case dc:return Math.ceil(n/4)*Math.ceil(t/4)*16;case fc:case pc:return Math.ceil(n/4)*Math.ceil(t/4)*8;case mc:case gc:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function A0(n){switch(n){case gi:case xu:return{byteLength:1,components:1};case Cr:case yu:case cn:return{byteLength:2,components:1};case Ll:case Dl:return{byteLength:2,components:4};case Zi:case Ul:case $i:return{byteLength:4,components:1};case vu:case Mu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"182"}}));typeof window<"u"&&(window.__THREE__?Ct("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="182");function Tp(){let n=null,t=!1,e=null,i=null;function s(r,o){e(r,o),i=n.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function J0(n){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,h),a.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((d,m)=>d.start-m.start);let f=0;for(let d=1;d<u.length;d++){let m=u[f],_=u[d];_.start<=m.start+m.count+1?m.count=Math.max(m.count,_.start+_.count-m.start):(++f,u[f]=_)}u.length=f+1;for(let d=0,m=u.length;d<m;d++){let _=u[d];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(n.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var Z0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,$0=`#ifdef USE_ALPHAHASH
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
#endif`,K0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Q0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,j0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,t1=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,e1=`#ifdef USE_AOMAP
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
#endif`,i1=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,n1=`#ifdef USE_BATCHING
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
#endif`,s1=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,r1=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,o1=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,a1=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,l1=`#ifdef USE_IRIDESCENCE
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
#endif`,c1=`#ifdef USE_BUMPMAP
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
#endif`,h1=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,u1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,d1=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,f1=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,p1=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,m1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,g1=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,_1=`#if defined( USE_COLOR_ALPHA )
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
#endif`,x1=`#define PI 3.141592653589793
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
} // validated`,y1=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,v1=`vec3 transformedNormal = objectNormal;
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
#endif`,M1=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,S1=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,b1=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,w1=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,T1="gl_FragColor = linearToOutputTexel( gl_FragColor );",E1=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,A1=`#ifdef USE_ENVMAP
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
#endif`,C1=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,R1=`#ifdef USE_ENVMAP
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
#endif`,P1=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,I1=`#ifdef USE_ENVMAP
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
#endif`,N1=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,U1=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,L1=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,D1=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,O1=`#ifdef USE_GRADIENTMAP
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
}`,F1=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,B1=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,z1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,k1=`uniform bool receiveShadow;
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
#endif`,V1=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
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
#endif`,G1=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,H1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,W1=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,X1=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,q1=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
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
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
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
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
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
#endif`,Y1=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
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
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
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
		return v;
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
	vec3 f0 = material.specularColorBlended;
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
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
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
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
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
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
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
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
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
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,J1=`
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
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
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
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
#endif`,Z1=`#if defined( RE_IndirectDiffuse )
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
#endif`,$1=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,K1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Q1=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j1=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,tg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,eg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ig=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ng=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,sg=`#if defined( USE_POINTS_UV )
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
#endif`,rg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,og=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ag=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,lg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,cg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hg=`#ifdef USE_MORPHTARGETS
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
#endif`,ug=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,fg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,pg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,_g=`#ifdef USE_NORMALMAP
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
#endif`,xg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,yg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,vg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Mg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Sg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,wg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Tg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Eg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ag=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Cg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Rg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Pg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
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
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
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
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Ig=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ng=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ug=`float getShadowMask() {
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
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
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
}`,Lg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dg=`#ifdef USE_SKINNING
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
#endif`,Og=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Fg=`#ifdef USE_SKINNING
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
#endif`,Bg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,zg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,kg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Vg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Gg=`#ifdef USE_TRANSMISSION
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
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Hg=`#ifdef USE_TRANSMISSION
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
#endif`,Wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,qg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Yg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Jg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Zg=`uniform sampler2D t2D;
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
}`,$g=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Qg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,t2=`#include <common>
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
}`,e2=`#if DEPTH_PACKING == 3200
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,i2=`#define DISTANCE
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
}`,n2=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
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
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,s2=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,r2=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,o2=`uniform float scale;
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
}`,a2=`uniform vec3 diffuse;
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
}`,l2=`#include <common>
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
}`,c2=`uniform vec3 diffuse;
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
}`,h2=`#define LAMBERT
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
}`,u2=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,d2=`#define MATCAP
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
}`,f2=`#define MATCAP
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
}`,p2=`#define NORMAL
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
}`,m2=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
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
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,g2=`#define PHONG
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
}`,_2=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
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
}`,x2=`#define STANDARD
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
}`,y2=`#define STANDARD
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
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
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
}`,v2=`#define TOON
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
}`,M2=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
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
}`,S2=`uniform float size;
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
}`,b2=`uniform vec3 diffuse;
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
}`,w2=`#include <common>
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
}`,T2=`uniform vec3 color;
uniform float opacity;
#include <common>
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
}`,E2=`uniform float rotation;
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
}`,A2=`uniform vec3 diffuse;
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
}`,Vt={alphahash_fragment:Z0,alphahash_pars_fragment:$0,alphamap_fragment:K0,alphamap_pars_fragment:Q0,alphatest_fragment:j0,alphatest_pars_fragment:t1,aomap_fragment:e1,aomap_pars_fragment:i1,batching_pars_vertex:n1,batching_vertex:s1,begin_vertex:r1,beginnormal_vertex:o1,bsdfs:a1,iridescence_fragment:l1,bumpmap_pars_fragment:c1,clipping_planes_fragment:h1,clipping_planes_pars_fragment:u1,clipping_planes_pars_vertex:d1,clipping_planes_vertex:f1,color_fragment:p1,color_pars_fragment:m1,color_pars_vertex:g1,color_vertex:_1,common:x1,cube_uv_reflection_fragment:y1,defaultnormal_vertex:v1,displacementmap_pars_vertex:M1,displacementmap_vertex:S1,emissivemap_fragment:b1,emissivemap_pars_fragment:w1,colorspace_fragment:T1,colorspace_pars_fragment:E1,envmap_fragment:A1,envmap_common_pars_fragment:C1,envmap_pars_fragment:R1,envmap_pars_vertex:P1,envmap_physical_pars_fragment:V1,envmap_vertex:I1,fog_vertex:N1,fog_pars_vertex:U1,fog_fragment:L1,fog_pars_fragment:D1,gradientmap_pars_fragment:O1,lightmap_pars_fragment:F1,lights_lambert_fragment:B1,lights_lambert_pars_fragment:z1,lights_pars_begin:k1,lights_toon_fragment:G1,lights_toon_pars_fragment:H1,lights_phong_fragment:W1,lights_phong_pars_fragment:X1,lights_physical_fragment:q1,lights_physical_pars_fragment:Y1,lights_fragment_begin:J1,lights_fragment_maps:Z1,lights_fragment_end:$1,logdepthbuf_fragment:K1,logdepthbuf_pars_fragment:Q1,logdepthbuf_pars_vertex:j1,logdepthbuf_vertex:tg,map_fragment:eg,map_pars_fragment:ig,map_particle_fragment:ng,map_particle_pars_fragment:sg,metalnessmap_fragment:rg,metalnessmap_pars_fragment:og,morphinstance_vertex:ag,morphcolor_vertex:lg,morphnormal_vertex:cg,morphtarget_pars_vertex:hg,morphtarget_vertex:ug,normal_fragment_begin:dg,normal_fragment_maps:fg,normal_pars_fragment:pg,normal_pars_vertex:mg,normal_vertex:gg,normalmap_pars_fragment:_g,clearcoat_normal_fragment_begin:xg,clearcoat_normal_fragment_maps:yg,clearcoat_pars_fragment:vg,iridescence_pars_fragment:Mg,opaque_fragment:Sg,packing:bg,premultiplied_alpha_fragment:wg,project_vertex:Tg,dithering_fragment:Eg,dithering_pars_fragment:Ag,roughnessmap_fragment:Cg,roughnessmap_pars_fragment:Rg,shadowmap_pars_fragment:Pg,shadowmap_pars_vertex:Ig,shadowmap_vertex:Ng,shadowmask_pars_fragment:Ug,skinbase_vertex:Lg,skinning_pars_vertex:Dg,skinning_vertex:Og,skinnormal_vertex:Fg,specularmap_fragment:Bg,specularmap_pars_fragment:zg,tonemapping_fragment:kg,tonemapping_pars_fragment:Vg,transmission_fragment:Gg,transmission_pars_fragment:Hg,uv_pars_fragment:Wg,uv_pars_vertex:Xg,uv_vertex:qg,worldpos_vertex:Yg,background_vert:Jg,background_frag:Zg,backgroundCube_vert:$g,backgroundCube_frag:Kg,cube_vert:Qg,cube_frag:jg,depth_vert:t2,depth_frag:e2,distance_vert:i2,distance_frag:n2,equirect_vert:s2,equirect_frag:r2,linedashed_vert:o2,linedashed_frag:a2,meshbasic_vert:l2,meshbasic_frag:c2,meshlambert_vert:h2,meshlambert_frag:u2,meshmatcap_vert:d2,meshmatcap_frag:f2,meshnormal_vert:p2,meshnormal_frag:m2,meshphong_vert:g2,meshphong_frag:_2,meshphysical_vert:x2,meshphysical_frag:y2,meshtoon_vert:v2,meshtoon_frag:M2,points_vert:S2,points_frag:b2,shadow_vert:w2,shadow_frag:T2,sprite_vert:E2,sprite_frag:A2},ht={common:{diffuse:{value:new Dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new kt}},envmap:{envMap:{value:null},envMapRotation:{value:new kt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new kt},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0},uvTransform:{value:new kt}},sprite:{diffuse:{value:new Dt(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}}},un={basic:{uniforms:ii([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.fog]),vertexShader:Vt.meshbasic_vert,fragmentShader:Vt.meshbasic_frag},lambert:{uniforms:ii([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)}}]),vertexShader:Vt.meshlambert_vert,fragmentShader:Vt.meshlambert_frag},phong:{uniforms:ii([ht.common,ht.specularmap,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)},specular:{value:new Dt(1118481)},shininess:{value:30}}]),vertexShader:Vt.meshphong_vert,fragmentShader:Vt.meshphong_frag},standard:{uniforms:ii([ht.common,ht.envmap,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.roughnessmap,ht.metalnessmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag},toon:{uniforms:ii([ht.common,ht.aomap,ht.lightmap,ht.emissivemap,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.gradientmap,ht.fog,ht.lights,{emissive:{value:new Dt(0)}}]),vertexShader:Vt.meshtoon_vert,fragmentShader:Vt.meshtoon_frag},matcap:{uniforms:ii([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,ht.fog,{matcap:{value:null}}]),vertexShader:Vt.meshmatcap_vert,fragmentShader:Vt.meshmatcap_frag},points:{uniforms:ii([ht.points,ht.fog]),vertexShader:Vt.points_vert,fragmentShader:Vt.points_frag},dashed:{uniforms:ii([ht.common,ht.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Vt.linedashed_vert,fragmentShader:Vt.linedashed_frag},depth:{uniforms:ii([ht.common,ht.displacementmap]),vertexShader:Vt.depth_vert,fragmentShader:Vt.depth_frag},normal:{uniforms:ii([ht.common,ht.bumpmap,ht.normalmap,ht.displacementmap,{opacity:{value:1}}]),vertexShader:Vt.meshnormal_vert,fragmentShader:Vt.meshnormal_frag},sprite:{uniforms:ii([ht.sprite,ht.fog]),vertexShader:Vt.sprite_vert,fragmentShader:Vt.sprite_frag},background:{uniforms:{uvTransform:{value:new kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Vt.background_vert,fragmentShader:Vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new kt}},vertexShader:Vt.backgroundCube_vert,fragmentShader:Vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Vt.cube_vert,fragmentShader:Vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Vt.equirect_vert,fragmentShader:Vt.equirect_frag},distance:{uniforms:ii([ht.common,ht.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Vt.distance_vert,fragmentShader:Vt.distance_frag},shadow:{uniforms:ii([ht.lights,ht.fog,{color:{value:new Dt(0)},opacity:{value:1}}]),vertexShader:Vt.shadow_vert,fragmentShader:Vt.shadow_frag}};un.physical={uniforms:ii([un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new kt},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new kt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new kt},sheen:{value:0},sheenColor:{value:new Dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new kt},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new kt},attenuationDistance:{value:0},attenuationColor:{value:new Dt(0)},specularColor:{value:new Dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new kt},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new kt}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag};var yc={r:0,b:0,g:0},Fs=new qi,C2=new Me;function R2(n,t,e,i,s,r,o){let a=new Dt(0),l=r===!0?0:1,c,h,u=null,f=0,d=null;function m(M){let v=M.isScene===!0?M.background:null;return v&&v.isTexture&&(v=(M.backgroundBlurriness>0?e:t).get(v)),v}function _(M){let v=!1,T=m(M);T===null?p(a,l):T&&T.isColor&&(p(T,1),v=!0);let S=n.xr.getEnvironmentBlendMode();S==="additive"?i.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(M,v){let T=m(v);T&&(T.isCubeTexture||T.mapping===zo)?(h===void 0&&(h=new Ce(new hi(1,1,1),new Fe({name:"BackgroundCubeMaterial",uniforms:Os(un.backgroundCube.uniforms),vertexShader:un.backgroundCube.vertexShader,fragmentShader:un.backgroundCube.fragmentShader,side:ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(S,A,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Fs.copy(v.backgroundRotation),Fs.x*=-1,Fs.y*=-1,Fs.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Fs.y*=-1,Fs.z*=-1),h.material.uniforms.envMap.value=T,h.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(C2.makeRotationFromEuler(Fs)),h.material.toneMapped=$t.getTransfer(T.colorSpace)!==he,(u!==T||f!==T.version||d!==n.toneMapping)&&(h.material.needsUpdate=!0,u=T,f=T.version,d=n.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):T&&T.isTexture&&(c===void 0&&(c=new Ce(new Fn(2,2),new Fe({name:"BackgroundMaterial",uniforms:Os(un.background.uniforms),vertexShader:un.background.vertexShader,fragmentShader:un.background.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=T,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=$t.getTransfer(T.colorSpace)!==he,T.matrixAutoUpdate===!0&&T.updateMatrix(),c.material.uniforms.uvTransform.value.copy(T.matrix),(u!==T||f!==T.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,u=T,f=T.version,d=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,v){M.getRGB(yc,Pu(n)),i.buffers.color.setClear(yc.r,yc.g,yc.b,v,o)}function w(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,v=1){a.set(M),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,p(a,l)},render:_,addToRenderList:g,dispose:w}}function P2(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,o=!1;function a(E,R,F,O,z){let W=!1,k=u(O,F,R);r!==k&&(r=k,c(r.object)),W=d(E,O,F,z),W&&m(E,O,F,z),z!==null&&t.update(z,n.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,v(E,R,F,O),z!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return n.createVertexArray()}function c(E){return n.bindVertexArray(E)}function h(E){return n.deleteVertexArray(E)}function u(E,R,F){let O=F.wireframe===!0,z=i[E.id];z===void 0&&(z={},i[E.id]=z);let W=z[R.id];W===void 0&&(W={},z[R.id]=W);let k=W[O];return k===void 0&&(k=f(l()),W[O]=k),k}function f(E){let R=[],F=[],O=[];for(let z=0;z<e;z++)R[z]=0,F[z]=0,O[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:F,attributeDivisors:O,object:E,attributes:{},index:null}}function d(E,R,F,O){let z=r.attributes,W=R.attributes,k=0,H=F.getAttributes();for(let Z in H)if(H[Z].location>=0){let et=z[Z],st=W[Z];if(st===void 0&&(Z==="instanceMatrix"&&E.instanceMatrix&&(st=E.instanceMatrix),Z==="instanceColor"&&E.instanceColor&&(st=E.instanceColor)),et===void 0||et.attribute!==st||st&&et.data!==st.data)return!0;k++}return r.attributesNum!==k||r.index!==O}function m(E,R,F,O){let z={},W=R.attributes,k=0,H=F.getAttributes();for(let Z in H)if(H[Z].location>=0){let et=W[Z];et===void 0&&(Z==="instanceMatrix"&&E.instanceMatrix&&(et=E.instanceMatrix),Z==="instanceColor"&&E.instanceColor&&(et=E.instanceColor));let st={};st.attribute=et,et&&et.data&&(st.data=et.data),z[Z]=st,k++}r.attributes=z,r.attributesNum=k,r.index=O}function _(){let E=r.newAttributes;for(let R=0,F=E.length;R<F;R++)E[R]=0}function g(E){p(E,0)}function p(E,R){let F=r.newAttributes,O=r.enabledAttributes,z=r.attributeDivisors;F[E]=1,O[E]===0&&(n.enableVertexAttribArray(E),O[E]=1),z[E]!==R&&(n.vertexAttribDivisor(E,R),z[E]=R)}function w(){let E=r.newAttributes,R=r.enabledAttributes;for(let F=0,O=R.length;F<O;F++)R[F]!==E[F]&&(n.disableVertexAttribArray(F),R[F]=0)}function M(E,R,F,O,z,W,k){k===!0?n.vertexAttribIPointer(E,R,F,z,W):n.vertexAttribPointer(E,R,F,O,z,W)}function v(E,R,F,O){_();let z=O.attributes,W=F.getAttributes(),k=R.defaultAttributeValues;for(let H in W){let Z=W[H];if(Z.location>=0){let nt=z[H];if(nt===void 0&&(H==="instanceMatrix"&&E.instanceMatrix&&(nt=E.instanceMatrix),H==="instanceColor"&&E.instanceColor&&(nt=E.instanceColor)),nt!==void 0){let et=nt.normalized,st=nt.itemSize,Ut=t.get(nt);if(Ut===void 0)continue;let Pt=Ut.buffer,ne=Ut.type,Jt=Ut.bytesPerElement,Y=ne===n.INT||ne===n.UNSIGNED_INT||nt.gpuType===Ul;if(nt.isInterleavedBufferAttribute){let J=nt.data,gt=J.stride,Lt=nt.offset;if(J.isInstancedInterleavedBuffer){for(let yt=0;yt<Z.locationSize;yt++)p(Z.location+yt,J.meshPerAttribute);E.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let yt=0;yt<Z.locationSize;yt++)g(Z.location+yt);n.bindBuffer(n.ARRAY_BUFFER,Pt);for(let yt=0;yt<Z.locationSize;yt++)M(Z.location+yt,st/Z.locationSize,ne,et,gt*Jt,(Lt+st/Z.locationSize*yt)*Jt,Y)}else{if(nt.isInstancedBufferAttribute){for(let J=0;J<Z.locationSize;J++)p(Z.location+J,nt.meshPerAttribute);E.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=nt.meshPerAttribute*nt.count)}else for(let J=0;J<Z.locationSize;J++)g(Z.location+J);n.bindBuffer(n.ARRAY_BUFFER,Pt);for(let J=0;J<Z.locationSize;J++)M(Z.location+J,st/Z.locationSize,ne,et,st*Jt,st/Z.locationSize*J*Jt,Y)}}else if(k!==void 0){let et=k[H];if(et!==void 0)switch(et.length){case 2:n.vertexAttrib2fv(Z.location,et);break;case 3:n.vertexAttrib3fv(Z.location,et);break;case 4:n.vertexAttrib4fv(Z.location,et);break;default:n.vertexAttrib1fv(Z.location,et)}}}}w()}function T(){I();for(let E in i){let R=i[E];for(let F in R){let O=R[F];for(let z in O)h(O[z].object),delete O[z];delete R[F]}delete i[E]}}function S(E){if(i[E.id]===void 0)return;let R=i[E.id];for(let F in R){let O=R[F];for(let z in O)h(O[z].object),delete O[z];delete R[F]}delete i[E.id]}function A(E){for(let R in i){let F=i[R];if(F[E.id]===void 0)continue;let O=F[E.id];for(let z in O)h(O[z].object),delete O[z];delete F[E.id]}}function I(){y(),o=!0,r!==s&&(r=s,c(r.object))}function y(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:y,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:g,disableUnusedAttributes:w}}function I2(n,t,e){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),e.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),e.update(h,i,u))}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let d=0;for(let m=0;m<u;m++)d+=h[m];e.update(d,i,1)}function l(c,h,u,f){if(u===0)return;let d=t.get("WEBGL_multi_draw");if(d===null)for(let m=0;m<c.length;m++)o(c[m],h[m],f[m]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,h,0,f,0,u);let m=0;for(let _=0;_<u;_++)m+=h[_]*f[_];e.update(m,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function N2(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==Fi&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let I=A===cn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==gi&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==$i&&!I)}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Ct("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,f=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),M=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),T=n.getParameter(n.MAX_SAMPLES),S=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:m,maxTextureSize:_,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:w,maxVaryings:M,maxFragmentUniforms:v,maxSamples:T,samples:S}}function U2(n){let t=this,e=null,i=0,s=!1,r=!1,o=new Ui,a=new kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||i!==0||s;return s=f,i=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){let m=u.clippingPlanes,_=u.clipIntersection,g=u.clipShadows,p=n.get(u);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let w=r?0:i,M=w*4,v=p.clippingState||null;l.value=v,v=h(m,f,M,d);for(let T=0;T!==M;++T)v[T]=e[T];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,f,d,m){let _=u!==null?u.length:0,g=null;if(_!==0){if(g=l.value,m!==!0||g===null){let p=d+_*4,w=f.matrixWorldInverse;a.getNormalMatrix(w),(g===null||g.length<p)&&(g=new Float32Array(p));for(let M=0,v=d;M!==_;++M,v+=4)o.copy(u[M]).applyMatrix4(w,a),o.normal.toArray(g,v),g[v+3]=o.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,g}}function L2(n){let t=new WeakMap;function e(o,a){return a===Pl?o.mapping=as:a===Il&&(o.mapping=Ls),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===Pl||a===Il)if(t.has(o)){let l=t.get(o).texture;return e(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new bo(l.height);return c.fromEquirectangularTexture(n,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}var hs=4,np=[.125,.215,.35,.446,.526,.582],zs=20,D2=256,Xo=new Ns,sp=new Dt,Du=null,Ou=0,Fu=0,Bu=!1,O2=new P,Mc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,s=100,r={}){let{size:o=256,position:a=O2}=r;Du=this._renderer.getRenderTarget(),Ou=this._renderer.getActiveCubeFace(),Fu=this._renderer.getActiveMipmapLevel(),Bu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ap(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=op(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Du,Ou,Fu),this._renderer.xr.enabled=Bu,t.scissorTest=!1,Pr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===as||t.mapping===Ls?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Du=this._renderer.getRenderTarget(),Ou=this._renderer.getActiveCubeFace(),Fu=this._renderer.getActiveMipmapLevel(),Bu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:$e,minFilter:$e,generateMipmaps:!1,type:cn,format:Fi,colorSpace:ws,depthBuffer:!1},s=rp(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=rp(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=F2(r)),this._blurMaterial=z2(r,t,e),this._ggxMaterial=B2(r,t,e)}return s}_compileMaterial(t){let e=new Ce(new me,t);this._renderer.compile(e,Xo)}_sceneToCubeUV(t,e,i,s,r){let l=new ze(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(sp),u.toneMapping=Ji,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ce(new hi,new ci({name:"PMREM.Background",side:ke,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,g=_.material,p=!1,w=t.background;w?w.isColor&&(g.color.copy(w),t.background=null,p=!0):(g.color.copy(sp),p=!0);for(let M=0;M<6;M++){let v=M%3;v===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):v===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let T=this._cubeSize;Pr(s,v*T,M>2?T:0,T,T),u.setRenderTarget(s),p&&u.render(_,l),u.render(t,l)}u.toneMapping=d,u.autoClear=f,t.background=w}_textureToCubeUV(t,e){let i=this._renderer,s=t.mapping===as||t.mapping===Ls;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ap()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=op());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;Pr(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,Xo)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),f=0+c*1.25,d=u*f,{_lodMax:m}=this,_=this._sizeLods[i],g=3*_*(i>m-hs?i-m+hs:0),p=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=m-e,Pr(r,g,p,3*_,2*_),s.setRenderTarget(r),s.render(a,Xo),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,Pr(t,g,p,3*_,2*_),s.setRenderTarget(t),s.render(a,Xo)}_blur(t,e,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,i,s,"latitudinal",r),this._halfBlur(o,t,i,i,s,"longitudinal",r)}_halfBlur(t,e,i,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Rt("blur direction must be either latitudinal or longitudinal!");let h=3,u=this._lodMeshes[s];u.material=c;let f=c.uniforms,d=this._sizeLods[i]-1,m=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*zs-1),_=r/m,g=isFinite(r)?1+Math.floor(h*_):zs;g>zs&&Ct(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${zs}`);let p=[],w=0;for(let A=0;A<zs;++A){let I=A/_,y=Math.exp(-I*I/2);p.push(y),A===0?w+=y:A<g&&(w+=2*y)}for(let A=0;A<p.length;A++)p[A]=p[A]/w;f.envMap.value=t.texture,f.samples.value=g,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:M}=this;f.dTheta.value=m,f.mipInt.value=M-i;let v=this._sizeLods[s],T=3*v*(s>M-hs?s-M+hs:0),S=4*(this._cubeSize-v);Pr(e,T,S,3*v,2*v),l.setRenderTarget(e),l.render(u,Xo)}};function F2(n){let t=[],e=[],i=[],s=n,r=n-hs+1+np.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>n-hs?l=np[o-n+hs-1]:o===0&&(l=0),e.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,m=6,_=3,g=2,p=1,w=new Float32Array(_*m*d),M=new Float32Array(g*m*d),v=new Float32Array(p*m*d);for(let S=0;S<d;S++){let A=S%3*2/3-1,I=S>2?0:-1,y=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];w.set(y,_*m*S),M.set(f,g*m*S);let E=[S,S,S,S,S,S];v.set(E,p*m*S)}let T=new me;T.setAttribute("position",new Se(w,_)),T.setAttribute("uv",new Se(M,g)),T.setAttribute("faceIndex",new Se(v,p)),i.push(new Ce(T,null)),s>hs&&s--}return{lodMeshes:i,sizeLods:t,sigmas:e}}function rp(n,t,e){let i=new Si(n,t,e);return i.texture.mapping=zo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Pr(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function B2(n,t,e){return new Fe({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:D2,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:bc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ln,depthTest:!1,depthWrite:!1})}function z2(n,t,e){let i=new Float32Array(zs),s=new P(0,1,0);return new Fe({name:"SphericalGaussianBlur",defines:{n:zs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:bc(),fragmentShader:`

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
		`,blending:ln,depthTest:!1,depthWrite:!1})}function op(){return new Fe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:bc(),fragmentShader:`

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
		`,blending:ln,depthTest:!1,depthWrite:!1})}function ap(){return new Fe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:bc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ln,depthTest:!1,depthWrite:!1})}function bc(){return`

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
	`}function k2(n){let t=new WeakMap,e=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===Pl||l===Il,h=l===as||l===Ls;if(c||h){let u=t.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return e===null&&(e=new Mc(n)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{let d=a.image;return c&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new Mc(n)),u=c?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:o}}function V2(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&dr("WebGLRenderer: "+i+" extension not supported."),s}}}function G2(n,t,e,i){let s={},r=new WeakMap;function o(u){let f=u.target;f.index!==null&&t.remove(f.index);for(let m in f.attributes)t.remove(f.attributes[m]);f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);d&&(t.remove(d),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,e.memory.geometries++),f}function l(u){let f=u.attributes;for(let d in f)t.update(f[d],n.ARRAY_BUFFER)}function c(u){let f=[],d=u.index,m=u.attributes.position,_=0;if(d!==null){let w=d.array;_=d.version;for(let M=0,v=w.length;M<v;M+=3){let T=w[M+0],S=w[M+1],A=w[M+2];f.push(T,S,S,A,A,T)}}else if(m!==void 0){let w=m.array;_=m.version;for(let M=0,v=w.length/3-1;M<v;M+=3){let T=M+0,S=M+1,A=M+2;f.push(T,S,S,A,A,T)}}else return;let g=new(Au(f)?vo:yo)(f,1);g.version=_;let p=r.get(u);p&&t.remove(p),r.set(u,g)}function h(u){let f=r.get(u);if(f){let d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function H2(n,t,e){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){n.drawElements(i,d,r,f*o),e.update(d,i,1)}function c(f,d,m){m!==0&&(n.drawElementsInstanced(i,d,r,f*o,m),e.update(d,i,m))}function h(f,d,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,f,0,m);let g=0;for(let p=0;p<m;p++)g+=d[p];e.update(g,i,1)}function u(f,d,m,_){if(m===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let p=0;p<f.length;p++)c(f[p]/o,d[p],_[p]);else{g.multiDrawElementsInstancedWEBGL(i,d,0,r,f,0,_,0,m);let p=0;for(let w=0;w<m;w++)p+=d[w]*_[w];e.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function W2(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case n.TRIANGLES:e.triangles+=a*(r/3);break;case n.LINES:e.lines+=a*(r/2);break;case n.LINE_STRIP:e.lines+=a*(r-1);break;case n.LINE_LOOP:e.lines+=a*r;break;case n.POINTS:e.points+=a*r;break;default:Rt("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function X2(n,t,e){let i=new WeakMap,s=new Ae;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=i.get(a);if(f===void 0||f.count!==u){let y=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",y)};f!==void 0&&f.texture.dispose();let d=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],M=0;d===!0&&(M=1),m===!0&&(M=2),_===!0&&(M=3);let v=a.attributes.position.count*M,T=1;v>t.maxTextureSize&&(T=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let S=new Float32Array(v*T*4*u),A=new xo(S,v,T,u);A.type=$i,A.needsUpdate=!0;let I=M*4;for(let E=0;E<u;E++){let R=g[E],F=p[E],O=w[E],z=v*T*4*E;for(let W=0;W<R.count;W++){let k=W*I;d===!0&&(s.fromBufferAttribute(R,W),S[z+k+0]=s.x,S[z+k+1]=s.y,S[z+k+2]=s.z,S[z+k+3]=0),m===!0&&(s.fromBufferAttribute(F,W),S[z+k+4]=s.x,S[z+k+5]=s.y,S[z+k+6]=s.z,S[z+k+7]=0),_===!0&&(s.fromBufferAttribute(O,W),S[z+k+8]=s.x,S[z+k+9]=s.y,S[z+k+10]=s.z,S[z+k+11]=O.itemSize===4?s.w:1)}}f={count:u,texture:A,size:new at(v,T)},i.set(a,f),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,e);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];let m=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function q2(n,t,e,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,u=t.get(l,h);if(s.get(u)!==c&&(t.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}var Y2={[uu]:"LINEAR_TONE_MAPPING",[du]:"REINHARD_TONE_MAPPING",[fu]:"CINEON_TONE_MAPPING",[Bo]:"ACES_FILMIC_TONE_MAPPING",[mu]:"AGX_TONE_MAPPING",[gu]:"NEUTRAL_TONE_MAPPING",[pu]:"CUSTOM_TONE_MAPPING"};function J2(n,t,e,i,s){let r=new Si(t,e,{type:n,depthBuffer:i,stencilBuffer:s}),o=new Si(t,e,{type:cn,depthBuffer:!1,stencilBuffer:!1}),a=new me;a.setAttribute("position",new Kt([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new Kt([0,2,0,0,2,0],2));let l=new ll({uniforms:{tDiffuse:{value:null}},vertexShader:`
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

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

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
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new Ce(a,l),h=new Ns(-1,1,1,-1,0,1),u=null,f=null,d=!1,m,_=null,g=[],p=!1;this.setSize=function(w,M){r.setSize(w,M),o.setSize(w,M);for(let v=0;v<g.length;v++){let T=g[v];T.setSize&&T.setSize(w,M)}},this.setEffects=function(w){g=w,p=g.length>0&&g[0].isRenderPass===!0;let M=r.width,v=r.height;for(let T=0;T<g.length;T++){let S=g[T];S.setSize&&S.setSize(M,v)}},this.begin=function(w,M){if(d||w.toneMapping===Ji&&g.length===0)return!1;if(_=M,M!==null){let v=M.width,T=M.height;(r.width!==v||r.height!==T)&&this.setSize(v,T)}return p===!1&&w.setRenderTarget(r),m=w.toneMapping,w.toneMapping=Ji,!0},this.hasRenderPass=function(){return p},this.end=function(w,M){w.toneMapping=m,d=!0;let v=r,T=o;for(let S=0;S<g.length;S++){let A=g[S];if(A.enabled!==!1&&(A.render(w,T,v,M),A.needsSwap!==!1)){let I=v;v=T,T=I}}if(u!==w.outputColorSpace||f!==w.toneMapping){u=w.outputColorSpace,f=w.toneMapping,l.defines={},$t.getTransfer(u)===he&&(l.defines.SRGB_TRANSFER="");let S=Y2[f];S&&(l.defines[S]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=v.texture,w.setRenderTarget(_),w.render(c,h),_=null,d=!1},this.isCompositing=function(){return d},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}var Ep=new li,Vu=new ts(1,1),Ap=new xo,Cp=new Za,Rp=new So,lp=[],cp=[],hp=new Float32Array(16),up=new Float32Array(9),dp=new Float32Array(4);function Nr(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,r=lp[s];if(r===void 0&&(r=new Float32Array(s),lp[s]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,n[o].toArray(r,a)}return r}function Ve(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ge(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function wc(n,t){let e=cp[t];e===void 0&&(e=new Int32Array(t),cp[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function Z2(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function $2(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;n.uniform2fv(this.addr,t),Ge(e,t)}}function K2(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ve(e,t))return;n.uniform3fv(this.addr,t),Ge(e,t)}}function Q2(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;n.uniform4fv(this.addr,t),Ge(e,t)}}function j2(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ge(e,t)}else{if(Ve(e,i))return;dp.set(i),n.uniformMatrix2fv(this.addr,!1,dp),Ge(e,i)}}function t_(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ge(e,t)}else{if(Ve(e,i))return;up.set(i),n.uniformMatrix3fv(this.addr,!1,up),Ge(e,i)}}function e_(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ve(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ge(e,t)}else{if(Ve(e,i))return;hp.set(i),n.uniformMatrix4fv(this.addr,!1,hp),Ge(e,i)}}function i_(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function n_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;n.uniform2iv(this.addr,t),Ge(e,t)}}function s_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ve(e,t))return;n.uniform3iv(this.addr,t),Ge(e,t)}}function r_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;n.uniform4iv(this.addr,t),Ge(e,t)}}function o_(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function a_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ve(e,t))return;n.uniform2uiv(this.addr,t),Ge(e,t)}}function l_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ve(e,t))return;n.uniform3uiv(this.addr,t),Ge(e,t)}}function c_(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ve(e,t))return;n.uniform4uiv(this.addr,t),Ge(e,t)}}function h_(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Vu.compareFunction=e.isReversedDepthBuffer()?xc:_c,r=Vu):r=Ep,e.setTexture2D(t||r,s)}function u_(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||Cp,s)}function d_(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||Rp,s)}function f_(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||Ap,s)}function p_(n){switch(n){case 5126:return Z2;case 35664:return $2;case 35665:return K2;case 35666:return Q2;case 35674:return j2;case 35675:return t_;case 35676:return e_;case 5124:case 35670:return i_;case 35667:case 35671:return n_;case 35668:case 35672:return s_;case 35669:case 35673:return r_;case 5125:return o_;case 36294:return a_;case 36295:return l_;case 36296:return c_;case 35678:case 36198:case 36298:case 36306:case 35682:return h_;case 35679:case 36299:case 36307:return u_;case 35680:case 36300:case 36308:case 36293:return d_;case 36289:case 36303:case 36311:case 36292:return f_}}function m_(n,t){n.uniform1fv(this.addr,t)}function g_(n,t){let e=Nr(t,this.size,2);n.uniform2fv(this.addr,e)}function __(n,t){let e=Nr(t,this.size,3);n.uniform3fv(this.addr,e)}function x_(n,t){let e=Nr(t,this.size,4);n.uniform4fv(this.addr,e)}function y_(n,t){let e=Nr(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function v_(n,t){let e=Nr(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function M_(n,t){let e=Nr(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function S_(n,t){n.uniform1iv(this.addr,t)}function b_(n,t){n.uniform2iv(this.addr,t)}function w_(n,t){n.uniform3iv(this.addr,t)}function T_(n,t){n.uniform4iv(this.addr,t)}function E_(n,t){n.uniform1uiv(this.addr,t)}function A_(n,t){n.uniform2uiv(this.addr,t)}function C_(n,t){n.uniform3uiv(this.addr,t)}function R_(n,t){n.uniform4uiv(this.addr,t)}function P_(n,t,e){let i=this.cache,s=t.length,r=wc(e,s);Ve(i,r)||(n.uniform1iv(this.addr,r),Ge(i,r));let o;this.type===n.SAMPLER_2D_SHADOW?o=Vu:o=Ep;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function I_(n,t,e){let i=this.cache,s=t.length,r=wc(e,s);Ve(i,r)||(n.uniform1iv(this.addr,r),Ge(i,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Cp,r[o])}function N_(n,t,e){let i=this.cache,s=t.length,r=wc(e,s);Ve(i,r)||(n.uniform1iv(this.addr,r),Ge(i,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Rp,r[o])}function U_(n,t,e){let i=this.cache,s=t.length,r=wc(e,s);Ve(i,r)||(n.uniform1iv(this.addr,r),Ge(i,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Ap,r[o])}function L_(n){switch(n){case 5126:return m_;case 35664:return g_;case 35665:return __;case 35666:return x_;case 35674:return y_;case 35675:return v_;case 35676:return M_;case 5124:case 35670:return S_;case 35667:case 35671:return b_;case 35668:case 35672:return w_;case 35669:case 35673:return T_;case 5125:return E_;case 36294:return A_;case 36295:return C_;case 36296:return R_;case 35678:case 36198:case 36298:case 36306:case 35682:return P_;case 35679:case 36299:case 36307:return I_;case 35680:case 36300:case 36308:case 36293:return N_;case 36289:case 36303:case 36311:case 36292:return U_}}var Gu=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=p_(e.type)}},Hu=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=L_(e.type)}},Wu=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],i)}}},zu=/(\w+)(\])?(\[|\.)?/g;function fp(n,t){n.seq.push(t),n.map[t.id]=t}function D_(n,t,e){let i=n.name,s=i.length;for(zu.lastIndex=0;;){let r=zu.exec(i),o=zu.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){fp(e,c===void 0?new Gu(a,n,t):new Hu(a,n,t));break}else{let u=e.map[a];u===void 0&&(u=new Wu(a),fp(e,u)),e=u}}}var Ir=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);D_(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,i,s){let r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&i.push(o)}return i}};function pp(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var O_=37297,F_=0;function B_(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var mp=new kt;function z_(n){$t._getMatrix(mp,$t.workingColorSpace,n);let t=`mat3( ${mp.elements.map(e=>e.toFixed(4))} )`;switch($t.getTransfer(n)){case po:return[t,"LinearTransferOETF"];case he:return[t,"sRGBTransferOETF"];default:return Ct("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function gp(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+B_(n.getShaderSource(t),a)}else return r}function k_(n,t){let e=z_(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var V_={[uu]:"Linear",[du]:"Reinhard",[fu]:"Cineon",[Bo]:"ACESFilmic",[mu]:"AgX",[gu]:"Neutral",[pu]:"Custom"};function G_(n,t){let e=V_[t];return e===void 0?(Ct("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var vc=new P;function H_(){$t.getLuminanceCoefficients(vc);let n=vc.x.toFixed(4),t=vc.y.toFixed(4),e=vc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function W_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Yo).join(`
`)}function X_(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function q_(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(t,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:n.getAttribLocation(t,o),locationSize:a}}return e}function Yo(n){return n!==""}function _p(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function xp(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Y_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xu(n){return n.replace(Y_,Z_)}var J_=new Map;function Z_(n,t){let e=Vt[t];if(e===void 0){let i=J_.get(t);if(i!==void 0)e=Vt[i],Ct('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return Xu(e)}var $_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yp(n){return n.replace($_,K_)}function K_(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function vp(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Q_={[Fo]:"SHADOWMAP_TYPE_PCF",[Ar]:"SHADOWMAP_TYPE_VSM"};function j_(n){return Q_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var tx={[as]:"ENVMAP_TYPE_CUBE",[Ls]:"ENVMAP_TYPE_CUBE",[zo]:"ENVMAP_TYPE_CUBE_UV"};function ex(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":tx[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var ix={[Ls]:"ENVMAP_MODE_REFRACTION"};function nx(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":ix[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var sx={[hu]:"ENVMAP_BLENDING_MULTIPLY",[kf]:"ENVMAP_BLENDING_MIX",[Vf]:"ENVMAP_BLENDING_ADD"};function rx(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":sx[n.combine]||"ENVMAP_BLENDING_NONE"}function ox(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function ax(n,t,e,i){let s=n.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=j_(e),c=ex(e),h=nx(e),u=rx(e),f=ox(e),d=W_(e),m=X_(r),_=s.createProgram(),g,p,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Yo).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Yo).join(`
`),p.length>0&&(p+=`
`)):(g=[vp(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Yo).join(`
`),p=[vp(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ji?"#define TONE_MAPPING":"",e.toneMapping!==Ji?Vt.tonemapping_pars_fragment:"",e.toneMapping!==Ji?G_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Vt.colorspace_pars_fragment,k_("linearToOutputTexel",e.outputColorSpace),H_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Yo).join(`
`)),o=Xu(o),o=_p(o,e),o=xp(o,e),a=Xu(a),a=_p(a,e),a=xp(a,e),o=yp(o),a=yp(a),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===Eu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Eu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let M=w+g+o,v=w+p+a,T=pp(s,s.VERTEX_SHADER,M),S=pp(s,s.FRAGMENT_SHADER,v);s.attachShader(_,T),s.attachShader(_,S),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(R){if(n.debug.checkShaderErrors){let F=s.getProgramInfoLog(_)||"",O=s.getShaderInfoLog(T)||"",z=s.getShaderInfoLog(S)||"",W=F.trim(),k=O.trim(),H=z.trim(),Z=!0,nt=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Z=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,T,S);else{let et=gp(s,T,"vertex"),st=gp(s,S,"fragment");Rt("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+W+`
`+et+`
`+st)}else W!==""?Ct("WebGLProgram: Program Info Log:",W):(k===""||H==="")&&(nt=!1);nt&&(R.diagnostics={runnable:Z,programLog:W,vertexShader:{log:k,prefix:g},fragmentShader:{log:H,prefix:p}})}s.deleteShader(T),s.deleteShader(S),I=new Ir(s,_),y=q_(s,_)}let I;this.getUniforms=function(){return I===void 0&&A(this),I};let y;this.getAttributes=function(){return y===void 0&&A(this),y};let E=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=s.getProgramParameter(_,O_)),E},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=F_++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=T,this.fragmentShader=S,this}var lx=0,qu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,i=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Yu(t),e.set(t,i)),i}},Yu=class{constructor(t){this.id=lx++,this.code=t,this.usedTimes=0}};function cx(n,t,e,i,s,r,o){let a=new an,l=new qu,c=new Set,h=[],u=new Map,f=s.logarithmicDepthBuffer,d=s.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(y){return c.add(y),y===0?"uv":`uv${y}`}function g(y,E,R,F,O){let z=F.fog,W=O.geometry,k=y.isMeshStandardMaterial?F.environment:null,H=(y.isMeshStandardMaterial?e:t).get(y.envMap||k),Z=H&&H.mapping===zo?H.image.height:null,nt=m[y.type];y.precision!==null&&(d=s.getMaxPrecision(y.precision),d!==y.precision&&Ct("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let et=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,st=et!==void 0?et.length:0,Ut=0;W.morphAttributes.position!==void 0&&(Ut=1),W.morphAttributes.normal!==void 0&&(Ut=2),W.morphAttributes.color!==void 0&&(Ut=3);let Pt,ne,Jt,Y;if(nt){let ue=un[nt];Pt=ue.vertexShader,ne=ue.fragmentShader}else Pt=y.vertexShader,ne=y.fragmentShader,l.update(y),Jt=l.getVertexShaderID(y),Y=l.getFragmentShaderID(y);let J=n.getRenderTarget(),gt=n.state.buffers.depth.getReversed(),Lt=O.isInstancedMesh===!0,yt=O.isBatchedMesh===!0,Yt=!!y.map,Re=!!y.matcap,qt=!!H,jt=!!y.aoMap,le=!!y.lightMap,Ft=!!y.bumpMap,we=!!y.normalMap,N=!!y.displacementMap,Te=!!y.emissiveMap,Zt=!!y.metalnessMap,se=!!y.roughnessMap,xt=y.anisotropy>0,C=y.clearcoat>0,x=y.dispersion>0,L=y.iridescence>0,q=y.sheen>0,$=y.transmission>0,X=xt&&!!y.anisotropyMap,vt=C&&!!y.clearcoatMap,Q=C&&!!y.clearcoatNormalMap,bt=C&&!!y.clearcoatRoughnessMap,Nt=L&&!!y.iridescenceMap,tt=L&&!!y.iridescenceThicknessMap,lt=q&&!!y.sheenColorMap,St=q&&!!y.sheenRoughnessMap,wt=!!y.specularMap,ot=!!y.specularColorMap,Gt=!!y.specularIntensityMap,U=$&&!!y.transmissionMap,ft=$&&!!y.thicknessMap,it=!!y.gradientMap,mt=!!y.alphaMap,j=y.alphaTest>0,K=!!y.alphaHash,rt=!!y.extensions,Ot=Ji;y.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Ot=n.toneMapping);let ye={shaderID:nt,shaderType:y.type,shaderName:y.name,vertexShader:Pt,fragmentShader:ne,defines:y.defines,customVertexShaderID:Jt,customFragmentShaderID:Y,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:yt,batchingColor:yt&&O._colorsTexture!==null,instancing:Lt,instancingColor:Lt&&O.instanceColor!==null,instancingMorph:Lt&&O.morphTexture!==null,outputColorSpace:J===null?n.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:ws,alphaToCoverage:!!y.alphaToCoverage,map:Yt,matcap:Re,envMap:qt,envMapMode:qt&&H.mapping,envMapCubeUVHeight:Z,aoMap:jt,lightMap:le,bumpMap:Ft,normalMap:we,displacementMap:N,emissiveMap:Te,normalMapObjectSpace:we&&y.normalMapType===Wf,normalMapTangentSpace:we&&y.normalMapType===Tu,metalnessMap:Zt,roughnessMap:se,anisotropy:xt,anisotropyMap:X,clearcoat:C,clearcoatMap:vt,clearcoatNormalMap:Q,clearcoatRoughnessMap:bt,dispersion:x,iridescence:L,iridescenceMap:Nt,iridescenceThicknessMap:tt,sheen:q,sheenColorMap:lt,sheenRoughnessMap:St,specularMap:wt,specularColorMap:ot,specularIntensityMap:Gt,transmission:$,transmissionMap:U,thicknessMap:ft,gradientMap:it,opaque:y.transparent===!1&&y.blending===Ss&&y.alphaToCoverage===!1,alphaMap:mt,alphaTest:j,alphaHash:K,combine:y.combine,mapUv:Yt&&_(y.map.channel),aoMapUv:jt&&_(y.aoMap.channel),lightMapUv:le&&_(y.lightMap.channel),bumpMapUv:Ft&&_(y.bumpMap.channel),normalMapUv:we&&_(y.normalMap.channel),displacementMapUv:N&&_(y.displacementMap.channel),emissiveMapUv:Te&&_(y.emissiveMap.channel),metalnessMapUv:Zt&&_(y.metalnessMap.channel),roughnessMapUv:se&&_(y.roughnessMap.channel),anisotropyMapUv:X&&_(y.anisotropyMap.channel),clearcoatMapUv:vt&&_(y.clearcoatMap.channel),clearcoatNormalMapUv:Q&&_(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:bt&&_(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Nt&&_(y.iridescenceMap.channel),iridescenceThicknessMapUv:tt&&_(y.iridescenceThicknessMap.channel),sheenColorMapUv:lt&&_(y.sheenColorMap.channel),sheenRoughnessMapUv:St&&_(y.sheenRoughnessMap.channel),specularMapUv:wt&&_(y.specularMap.channel),specularColorMapUv:ot&&_(y.specularColorMap.channel),specularIntensityMapUv:Gt&&_(y.specularIntensityMap.channel),transmissionMapUv:U&&_(y.transmissionMap.channel),thicknessMapUv:ft&&_(y.thicknessMap.channel),alphaMapUv:mt&&_(y.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(we||xt),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!W.attributes.uv&&(Yt||mt),fog:!!z,useFog:y.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:gt,skinning:O.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:Ut,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&R.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ot,decodeVideoTexture:Yt&&y.map.isVideoTexture===!0&&$t.getTransfer(y.map.colorSpace)===he,decodeVideoTextureEmissive:Te&&y.emissiveMap.isVideoTexture===!0&&$t.getTransfer(y.emissiveMap.colorSpace)===he,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Ye,flipSided:y.side===ke,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:rt&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(rt&&y.extensions.multiDraw===!0||yt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return ye.vertexUv1s=c.has(1),ye.vertexUv2s=c.has(2),ye.vertexUv3s=c.has(3),c.clear(),ye}function p(y){let E=[];if(y.shaderID?E.push(y.shaderID):(E.push(y.customVertexShaderID),E.push(y.customFragmentShaderID)),y.defines!==void 0)for(let R in y.defines)E.push(R),E.push(y.defines[R]);return y.isRawShaderMaterial===!1&&(w(E,y),M(E,y),E.push(n.outputColorSpace)),E.push(y.customProgramCacheKey),E.join()}function w(y,E){y.push(E.precision),y.push(E.outputColorSpace),y.push(E.envMapMode),y.push(E.envMapCubeUVHeight),y.push(E.mapUv),y.push(E.alphaMapUv),y.push(E.lightMapUv),y.push(E.aoMapUv),y.push(E.bumpMapUv),y.push(E.normalMapUv),y.push(E.displacementMapUv),y.push(E.emissiveMapUv),y.push(E.metalnessMapUv),y.push(E.roughnessMapUv),y.push(E.anisotropyMapUv),y.push(E.clearcoatMapUv),y.push(E.clearcoatNormalMapUv),y.push(E.clearcoatRoughnessMapUv),y.push(E.iridescenceMapUv),y.push(E.iridescenceThicknessMapUv),y.push(E.sheenColorMapUv),y.push(E.sheenRoughnessMapUv),y.push(E.specularMapUv),y.push(E.specularColorMapUv),y.push(E.specularIntensityMapUv),y.push(E.transmissionMapUv),y.push(E.thicknessMapUv),y.push(E.combine),y.push(E.fogExp2),y.push(E.sizeAttenuation),y.push(E.morphTargetsCount),y.push(E.morphAttributeCount),y.push(E.numDirLights),y.push(E.numPointLights),y.push(E.numSpotLights),y.push(E.numSpotLightMaps),y.push(E.numHemiLights),y.push(E.numRectAreaLights),y.push(E.numDirLightShadows),y.push(E.numPointLightShadows),y.push(E.numSpotLightShadows),y.push(E.numSpotLightShadowsWithMaps),y.push(E.numLightProbes),y.push(E.shadowMapType),y.push(E.toneMapping),y.push(E.numClippingPlanes),y.push(E.numClipIntersection),y.push(E.depthPacking)}function M(y,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),y.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),y.push(a.mask)}function v(y){let E=m[y.type],R;if(E){let F=un[E];R=tp.clone(F.uniforms)}else R=y.uniforms;return R}function T(y,E){let R=u.get(E);return R!==void 0?++R.usedTimes:(R=new ax(n,E,y,r),h.push(R),u.set(E,R)),R}function S(y){if(--y.usedTimes===0){let E=h.indexOf(y);h[E]=h[h.length-1],h.pop(),u.delete(y.cacheKey),y.destroy()}}function A(y){l.remove(y)}function I(){l.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:v,acquireProgram:T,releaseProgram:S,releaseShaderCache:A,programs:h,dispose:I}}function hx(){let n=new WeakMap;function t(o){return n.has(o)}function e(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function ux(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function Mp(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Sp(){let n=[],t=0,e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function o(u,f,d,m,_,g){let p=n[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:m,renderOrder:u.renderOrder,z:_,group:g},n[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=m,p.renderOrder=u.renderOrder,p.z=_,p.group=g),t++,p}function a(u,f,d,m,_,g){let p=o(u,f,d,m,_,g);d.transmission>0?i.push(p):d.transparent===!0?s.push(p):e.push(p)}function l(u,f,d,m,_,g){let p=o(u,f,d,m,_,g);d.transmission>0?i.unshift(p):d.transparent===!0?s.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||ux),i.length>1&&i.sort(f||Mp),s.length>1&&s.sort(f||Mp)}function h(){for(let u=t,f=n.length;u<f;u++){let d=n[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function dx(){let n=new WeakMap;function t(i,s){let r=n.get(i),o;return r===void 0?(o=new Sp,n.set(i,[o])):s>=r.length?(o=new Sp,r.push(o)):o=r[s],o}function e(){n=new WeakMap}return{get:t,dispose:e}}function fx(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new P,color:new Dt};break;case"SpotLight":e={position:new P,direction:new P,color:new Dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new P,color:new Dt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new P,skyColor:new Dt,groundColor:new Dt};break;case"RectAreaLight":e={color:new Dt,position:new P,halfWidth:new P,halfHeight:new P};break}return n[t.id]=e,e}}}function px(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var mx=0;function gx(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function _x(n){let t=new fx,e=px(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let s=new P,r=new Me,o=new Me;function a(c){let h=0,u=0,f=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let d=0,m=0,_=0,g=0,p=0,w=0,M=0,v=0,T=0,S=0,A=0;c.sort(gx);for(let y=0,E=c.length;y<E;y++){let R=c[y],F=R.color,O=R.intensity,z=R.distance,W=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===Ds?W=R.shadow.map.texture:W=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)h+=F.r*O,u+=F.g*O,f+=F.b*O;else if(R.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(R.sh.coefficients[k],O);A++}else if(R.isDirectionalLight){let k=t.get(R);if(k.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let H=R.shadow,Z=e.get(R);Z.shadowIntensity=H.intensity,Z.shadowBias=H.bias,Z.shadowNormalBias=H.normalBias,Z.shadowRadius=H.radius,Z.shadowMapSize=H.mapSize,i.directionalShadow[d]=Z,i.directionalShadowMap[d]=W,i.directionalShadowMatrix[d]=R.shadow.matrix,w++}i.directional[d]=k,d++}else if(R.isSpotLight){let k=t.get(R);k.position.setFromMatrixPosition(R.matrixWorld),k.color.copy(F).multiplyScalar(O),k.distance=z,k.coneCos=Math.cos(R.angle),k.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),k.decay=R.decay,i.spot[_]=k;let H=R.shadow;if(R.map&&(i.spotLightMap[T]=R.map,T++,H.updateMatrices(R),R.castShadow&&S++),i.spotLightMatrix[_]=H.matrix,R.castShadow){let Z=e.get(R);Z.shadowIntensity=H.intensity,Z.shadowBias=H.bias,Z.shadowNormalBias=H.normalBias,Z.shadowRadius=H.radius,Z.shadowMapSize=H.mapSize,i.spotShadow[_]=Z,i.spotShadowMap[_]=W,v++}_++}else if(R.isRectAreaLight){let k=t.get(R);k.color.copy(F).multiplyScalar(O),k.halfWidth.set(R.width*.5,0,0),k.halfHeight.set(0,R.height*.5,0),i.rectArea[g]=k,g++}else if(R.isPointLight){let k=t.get(R);if(k.color.copy(R.color).multiplyScalar(R.intensity),k.distance=R.distance,k.decay=R.decay,R.castShadow){let H=R.shadow,Z=e.get(R);Z.shadowIntensity=H.intensity,Z.shadowBias=H.bias,Z.shadowNormalBias=H.normalBias,Z.shadowRadius=H.radius,Z.shadowMapSize=H.mapSize,Z.shadowCameraNear=H.camera.near,Z.shadowCameraFar=H.camera.far,i.pointShadow[m]=Z,i.pointShadowMap[m]=W,i.pointShadowMatrix[m]=R.shadow.matrix,M++}i.point[m]=k,m++}else if(R.isHemisphereLight){let k=t.get(R);k.skyColor.copy(R.color).multiplyScalar(O),k.groundColor.copy(R.groundColor).multiplyScalar(O),i.hemi[p]=k,p++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ht.LTC_FLOAT_1,i.rectAreaLTC2=ht.LTC_FLOAT_2):(i.rectAreaLTC1=ht.LTC_HALF_1,i.rectAreaLTC2=ht.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=f;let I=i.hash;(I.directionalLength!==d||I.pointLength!==m||I.spotLength!==_||I.rectAreaLength!==g||I.hemiLength!==p||I.numDirectionalShadows!==w||I.numPointShadows!==M||I.numSpotShadows!==v||I.numSpotMaps!==T||I.numLightProbes!==A)&&(i.directional.length=d,i.spot.length=_,i.rectArea.length=g,i.point.length=m,i.hemi.length=p,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=v+T-S,i.spotLightMap.length=T,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=A,I.directionalLength=d,I.pointLength=m,I.spotLength=_,I.rectAreaLength=g,I.hemiLength=p,I.numDirectionalShadows=w,I.numPointShadows=M,I.numSpotShadows=v,I.numSpotMaps=T,I.numLightProbes=A,i.version=mx++)}function l(c,h){let u=0,f=0,d=0,m=0,_=0,g=h.matrixWorldInverse;for(let p=0,w=c.length;p<w;p++){let M=c[p];if(M.isDirectionalLight){let v=i.directional[u];v.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),u++}else if(M.isSpotLight){let v=i.spot[d];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(g),d++}else if(M.isRectAreaLight){let v=i.rectArea[m];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(g),o.identity(),r.copy(M.matrixWorld),r.premultiply(g),o.extractRotation(r),v.halfWidth.set(M.width*.5,0,0),v.halfHeight.set(0,M.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),m++}else if(M.isPointLight){let v=i.point[f];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(g),f++}else if(M.isHemisphereLight){let v=i.hemi[_];v.direction.setFromMatrixPosition(M.matrixWorld),v.direction.transformDirection(g),_++}}}return{setup:a,setupView:l,state:i}}function bp(n){let t=new _x(n),e=[],i=[];function s(h){c.camera=h,e.length=0,i.length=0}function r(h){e.push(h)}function o(h){i.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}let c={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function xx(n){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new bp(n),t.set(s,[a])):r>=o.length?(a=new bp(n),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var yx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Mx=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Sx=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],wp=new Me,qo=new P,ku=new P;function bx(n,t,e){let i=new xr,s=new at,r=new at,o=new Ae,a=new cl,l=new hl,c={},h=e.maxTextureSize,u={[Ln]:ke,[ke]:Ln,[Ye]:Ye},f=new Fe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:yx,fragmentShader:vx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let m=new me;m.setAttribute("position",new Se(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ce(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fo;let p=this.type;this.render=function(S,A,I){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||S.length===0)return;S.type===Sl&&(Ct("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),S.type=Fo);let y=n.getRenderTarget(),E=n.getActiveCubeFace(),R=n.getActiveMipmapLevel(),F=n.state;F.setBlending(ln),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let O=p!==this.type;O&&A.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(W=>W.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,W=S.length;z<W;z++){let k=S[z],H=k.shadow;if(H===void 0){Ct("WebGLShadowMap:",k,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let Z=H.getFrameExtents();if(s.multiply(Z),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Z.x),s.x=r.x*Z.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Z.y),s.y=r.y*Z.y,H.mapSize.y=r.y)),H.map===null||O===!0){if(H.map!==null&&(H.map.depthTexture!==null&&(H.map.depthTexture.dispose(),H.map.depthTexture=null),H.map.dispose()),this.type===Ar){if(k.isPointLight){Ct("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}H.map=new Si(s.x,s.y,{format:Ds,type:cn,minFilter:$e,magFilter:$e,generateMipmaps:!1}),H.map.texture.name=k.name+".shadowMap",H.map.depthTexture=new ts(s.x,s.y,$i),H.map.depthTexture.name=k.name+".shadowMapDepth",H.map.depthTexture.format=rn,H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=qe,H.map.depthTexture.magFilter=qe}else{k.isPointLight?(H.map=new bo(s.x),H.map.depthTexture=new tl(s.x,Zi)):(H.map=new Si(s.x,s.y),H.map.depthTexture=new ts(s.x,s.y,Zi)),H.map.depthTexture.name=k.name+".shadowMap",H.map.depthTexture.format=rn;let et=n.state.buffers.depth.getReversed();this.type===Fo?(H.map.depthTexture.compareFunction=et?xc:_c,H.map.depthTexture.minFilter=$e,H.map.depthTexture.magFilter=$e):(H.map.depthTexture.compareFunction=null,H.map.depthTexture.minFilter=qe,H.map.depthTexture.magFilter=qe)}H.camera.updateProjectionMatrix()}let nt=H.map.isWebGLCubeRenderTarget?6:1;for(let et=0;et<nt;et++){if(H.map.isWebGLCubeRenderTarget)n.setRenderTarget(H.map,et),n.clear();else{et===0&&(n.setRenderTarget(H.map),n.clear());let st=H.getViewport(et);o.set(r.x*st.x,r.y*st.y,r.x*st.z,r.y*st.w),F.viewport(o)}if(k.isPointLight){let st=H.camera,Ut=H.matrix,Pt=k.distance||st.far;Pt!==st.far&&(st.far=Pt,st.updateProjectionMatrix()),qo.setFromMatrixPosition(k.matrixWorld),st.position.copy(qo),ku.copy(st.position),ku.add(Mx[et]),st.up.copy(Sx[et]),st.lookAt(ku),st.updateMatrixWorld(),Ut.makeTranslation(-qo.x,-qo.y,-qo.z),wp.multiplyMatrices(st.projectionMatrix,st.matrixWorldInverse),H._frustum.setFromProjectionMatrix(wp,st.coordinateSystem,st.reversedDepth)}else H.updateMatrices(k);i=H.getFrustum(),v(A,I,H.camera,k,this.type)}H.isPointLightShadow!==!0&&this.type===Ar&&w(H,I),H.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(y,E,R)};function w(S,A){let I=t.update(_);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Si(s.x,s.y,{format:Ds,type:cn})),f.uniforms.shadow_pass.value=S.map.depthTexture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(A,null,I,f,_,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(A,null,I,d,_,null)}function M(S,A,I,y){let E=null,R=I.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(R!==void 0)E=R;else if(E=I.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let F=E.uuid,O=A.uuid,z=c[F];z===void 0&&(z={},c[F]=z);let W=z[O];W===void 0&&(W=E.clone(),z[O]=W,A.addEventListener("dispose",T)),E=W}if(E.visible=A.visible,E.wireframe=A.wireframe,y===Ar?E.side=A.shadowSide!==null?A.shadowSide:A.side:E.side=A.shadowSide!==null?A.shadowSide:u[A.side],E.alphaMap=A.alphaMap,E.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,E.map=A.map,E.clipShadows=A.clipShadows,E.clippingPlanes=A.clippingPlanes,E.clipIntersection=A.clipIntersection,E.displacementMap=A.displacementMap,E.displacementScale=A.displacementScale,E.displacementBias=A.displacementBias,E.wireframeLinewidth=A.wireframeLinewidth,E.linewidth=A.linewidth,I.isPointLight===!0&&E.isMeshDistanceMaterial===!0){let F=n.properties.get(E);F.light=I}return E}function v(S,A,I,y,E){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&E===Ar)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,S.matrixWorld);let O=t.update(S),z=S.material;if(Array.isArray(z)){let W=O.groups;for(let k=0,H=W.length;k<H;k++){let Z=W[k],nt=z[Z.materialIndex];if(nt&&nt.visible){let et=M(S,nt,y,E);S.onBeforeShadow(n,S,A,I,O,et,Z),n.renderBufferDirect(I,null,O,et,S,Z),S.onAfterShadow(n,S,A,I,O,et,Z)}}}else if(z.visible){let W=M(S,z,y,E);S.onBeforeShadow(n,S,A,I,O,W,null),n.renderBufferDirect(I,null,O,W,S,null),S.onAfterShadow(n,S,A,I,O,W,null)}}let F=S.children;for(let O=0,z=F.length;O<z;O++)v(F[O],A,I,y,E)}function T(S){S.target.removeEventListener("dispose",T);for(let I in c){let y=c[I],E=S.target.uuid;E in y&&(y[E].dispose(),delete y[E])}}}var wx={[bl]:wl,[Tl]:Cl,[El]:Rl,[bs]:Al,[wl]:bl,[Cl]:Tl,[Rl]:El,[Al]:bs};function Tx(n,t){function e(){let U=!1,ft=new Ae,it=null,mt=new Ae(0,0,0,0);return{setMask:function(j){it!==j&&!U&&(n.colorMask(j,j,j,j),it=j)},setLocked:function(j){U=j},setClear:function(j,K,rt,Ot,ye){ye===!0&&(j*=Ot,K*=Ot,rt*=Ot),ft.set(j,K,rt,Ot),mt.equals(ft)===!1&&(n.clearColor(j,K,rt,Ot),mt.copy(ft))},reset:function(){U=!1,it=null,mt.set(-1,0,0,0)}}}function i(){let U=!1,ft=!1,it=null,mt=null,j=null;return{setReversed:function(K){if(ft!==K){let rt=t.get("EXT_clip_control");K?rt.clipControlEXT(rt.LOWER_LEFT_EXT,rt.ZERO_TO_ONE_EXT):rt.clipControlEXT(rt.LOWER_LEFT_EXT,rt.NEGATIVE_ONE_TO_ONE_EXT),ft=K;let Ot=j;j=null,this.setClear(Ot)}},getReversed:function(){return ft},setTest:function(K){K?J(n.DEPTH_TEST):gt(n.DEPTH_TEST)},setMask:function(K){it!==K&&!U&&(n.depthMask(K),it=K)},setFunc:function(K){if(ft&&(K=wx[K]),mt!==K){switch(K){case bl:n.depthFunc(n.NEVER);break;case wl:n.depthFunc(n.ALWAYS);break;case Tl:n.depthFunc(n.LESS);break;case bs:n.depthFunc(n.LEQUAL);break;case El:n.depthFunc(n.EQUAL);break;case Al:n.depthFunc(n.GEQUAL);break;case Cl:n.depthFunc(n.GREATER);break;case Rl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}mt=K}},setLocked:function(K){U=K},setClear:function(K){j!==K&&(ft&&(K=1-K),n.clearDepth(K),j=K)},reset:function(){U=!1,it=null,mt=null,j=null,ft=!1}}}function s(){let U=!1,ft=null,it=null,mt=null,j=null,K=null,rt=null,Ot=null,ye=null;return{setTest:function(ue){U||(ue?J(n.STENCIL_TEST):gt(n.STENCIL_TEST))},setMask:function(ue){ft!==ue&&!U&&(n.stencilMask(ue),ft=ue)},setFunc:function(ue,nn,En){(it!==ue||mt!==nn||j!==En)&&(n.stencilFunc(ue,nn,En),it=ue,mt=nn,j=En)},setOp:function(ue,nn,En){(K!==ue||rt!==nn||Ot!==En)&&(n.stencilOp(ue,nn,En),K=ue,rt=nn,Ot=En)},setLocked:function(ue){U=ue},setClear:function(ue){ye!==ue&&(n.clearStencil(ue),ye=ue)},reset:function(){U=!1,ft=null,it=null,mt=null,j=null,K=null,rt=null,Ot=null,ye=null}}}let r=new e,o=new i,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,d=[],m=null,_=!1,g=null,p=null,w=null,M=null,v=null,T=null,S=null,A=new Dt(0,0,0),I=0,y=!1,E=null,R=null,F=null,O=null,z=null,W=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,H=0,Z=n.getParameter(n.VERSION);Z.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(Z)[1]),k=H>=1):Z.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),k=H>=2);let nt=null,et={},st=n.getParameter(n.SCISSOR_BOX),Ut=n.getParameter(n.VIEWPORT),Pt=new Ae().fromArray(st),ne=new Ae().fromArray(Ut);function Jt(U,ft,it,mt){let j=new Uint8Array(4),K=n.createTexture();n.bindTexture(U,K),n.texParameteri(U,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(U,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let rt=0;rt<it;rt++)U===n.TEXTURE_3D||U===n.TEXTURE_2D_ARRAY?n.texImage3D(ft,0,n.RGBA,1,1,mt,0,n.RGBA,n.UNSIGNED_BYTE,j):n.texImage2D(ft+rt,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,j);return K}let Y={};Y[n.TEXTURE_2D]=Jt(n.TEXTURE_2D,n.TEXTURE_2D,1),Y[n.TEXTURE_CUBE_MAP]=Jt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[n.TEXTURE_2D_ARRAY]=Jt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Y[n.TEXTURE_3D]=Jt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),J(n.DEPTH_TEST),o.setFunc(bs),Ft(!1),we(au),J(n.CULL_FACE),jt(ln);function J(U){h[U]!==!0&&(n.enable(U),h[U]=!0)}function gt(U){h[U]!==!1&&(n.disable(U),h[U]=!1)}function Lt(U,ft){return u[U]!==ft?(n.bindFramebuffer(U,ft),u[U]=ft,U===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ft),U===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ft),!0):!1}function yt(U,ft){let it=d,mt=!1;if(U){it=f.get(ft),it===void 0&&(it=[],f.set(ft,it));let j=U.textures;if(it.length!==j.length||it[0]!==n.COLOR_ATTACHMENT0){for(let K=0,rt=j.length;K<rt;K++)it[K]=n.COLOR_ATTACHMENT0+K;it.length=j.length,mt=!0}}else it[0]!==n.BACK&&(it[0]=n.BACK,mt=!0);mt&&n.drawBuffers(it)}function Yt(U){return m!==U?(n.useProgram(U),m=U,!0):!1}let Re={[Qn]:n.FUNC_ADD,[bf]:n.FUNC_SUBTRACT,[wf]:n.FUNC_REVERSE_SUBTRACT};Re[Tf]=n.MIN,Re[Ef]=n.MAX;let qt={[Af]:n.ZERO,[Cf]:n.ONE,[Rf]:n.SRC_COLOR,[Ga]:n.SRC_ALPHA,[Df]:n.SRC_ALPHA_SATURATE,[Uf]:n.DST_COLOR,[If]:n.DST_ALPHA,[Pf]:n.ONE_MINUS_SRC_COLOR,[Ha]:n.ONE_MINUS_SRC_ALPHA,[Lf]:n.ONE_MINUS_DST_COLOR,[Nf]:n.ONE_MINUS_DST_ALPHA,[Of]:n.CONSTANT_COLOR,[Ff]:n.ONE_MINUS_CONSTANT_COLOR,[Bf]:n.CONSTANT_ALPHA,[zf]:n.ONE_MINUS_CONSTANT_ALPHA};function jt(U,ft,it,mt,j,K,rt,Ot,ye,ue){if(U===ln){_===!0&&(gt(n.BLEND),_=!1);return}if(_===!1&&(J(n.BLEND),_=!0),U!==Sf){if(U!==g||ue!==y){if((p!==Qn||v!==Qn)&&(n.blendEquation(n.FUNC_ADD),p=Qn,v=Qn),ue)switch(U){case Ss:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case wi:n.blendFunc(n.ONE,n.ONE);break;case lu:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case cu:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Rt("WebGLState: Invalid blending: ",U);break}else switch(U){case Ss:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case wi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case lu:Rt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case cu:Rt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Rt("WebGLState: Invalid blending: ",U);break}w=null,M=null,T=null,S=null,A.set(0,0,0),I=0,g=U,y=ue}return}j=j||ft,K=K||it,rt=rt||mt,(ft!==p||j!==v)&&(n.blendEquationSeparate(Re[ft],Re[j]),p=ft,v=j),(it!==w||mt!==M||K!==T||rt!==S)&&(n.blendFuncSeparate(qt[it],qt[mt],qt[K],qt[rt]),w=it,M=mt,T=K,S=rt),(Ot.equals(A)===!1||ye!==I)&&(n.blendColor(Ot.r,Ot.g,Ot.b,ye),A.copy(Ot),I=ye),g=U,y=!1}function le(U,ft){U.side===Ye?gt(n.CULL_FACE):J(n.CULL_FACE);let it=U.side===ke;ft&&(it=!it),Ft(it),U.blending===Ss&&U.transparent===!1?jt(ln):jt(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),o.setFunc(U.depthFunc),o.setTest(U.depthTest),o.setMask(U.depthWrite),r.setMask(U.colorWrite);let mt=U.stencilWrite;a.setTest(mt),mt&&(a.setMask(U.stencilWriteMask),a.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),a.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Te(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?J(n.SAMPLE_ALPHA_TO_COVERAGE):gt(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ft(U){E!==U&&(U?n.frontFace(n.CW):n.frontFace(n.CCW),E=U)}function we(U){U!==vf?(J(n.CULL_FACE),U!==R&&(U===au?n.cullFace(n.BACK):U===Mf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):gt(n.CULL_FACE),R=U}function N(U){U!==F&&(k&&n.lineWidth(U),F=U)}function Te(U,ft,it){U?(J(n.POLYGON_OFFSET_FILL),(O!==ft||z!==it)&&(n.polygonOffset(ft,it),O=ft,z=it)):gt(n.POLYGON_OFFSET_FILL)}function Zt(U){U?J(n.SCISSOR_TEST):gt(n.SCISSOR_TEST)}function se(U){U===void 0&&(U=n.TEXTURE0+W-1),nt!==U&&(n.activeTexture(U),nt=U)}function xt(U,ft,it){it===void 0&&(nt===null?it=n.TEXTURE0+W-1:it=nt);let mt=et[it];mt===void 0&&(mt={type:void 0,texture:void 0},et[it]=mt),(mt.type!==U||mt.texture!==ft)&&(nt!==it&&(n.activeTexture(it),nt=it),n.bindTexture(U,ft||Y[U]),mt.type=U,mt.texture=ft)}function C(){let U=et[nt];U!==void 0&&U.type!==void 0&&(n.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function x(){try{n.compressedTexImage2D(...arguments)}catch(U){Rt("WebGLState:",U)}}function L(){try{n.compressedTexImage3D(...arguments)}catch(U){Rt("WebGLState:",U)}}function q(){try{n.texSubImage2D(...arguments)}catch(U){Rt("WebGLState:",U)}}function $(){try{n.texSubImage3D(...arguments)}catch(U){Rt("WebGLState:",U)}}function X(){try{n.compressedTexSubImage2D(...arguments)}catch(U){Rt("WebGLState:",U)}}function vt(){try{n.compressedTexSubImage3D(...arguments)}catch(U){Rt("WebGLState:",U)}}function Q(){try{n.texStorage2D(...arguments)}catch(U){Rt("WebGLState:",U)}}function bt(){try{n.texStorage3D(...arguments)}catch(U){Rt("WebGLState:",U)}}function Nt(){try{n.texImage2D(...arguments)}catch(U){Rt("WebGLState:",U)}}function tt(){try{n.texImage3D(...arguments)}catch(U){Rt("WebGLState:",U)}}function lt(U){Pt.equals(U)===!1&&(n.scissor(U.x,U.y,U.z,U.w),Pt.copy(U))}function St(U){ne.equals(U)===!1&&(n.viewport(U.x,U.y,U.z,U.w),ne.copy(U))}function wt(U,ft){let it=c.get(ft);it===void 0&&(it=new WeakMap,c.set(ft,it));let mt=it.get(U);mt===void 0&&(mt=n.getUniformBlockIndex(ft,U.name),it.set(U,mt))}function ot(U,ft){let mt=c.get(ft).get(U);l.get(ft)!==mt&&(n.uniformBlockBinding(ft,mt,U.__bindingPointIndex),l.set(ft,mt))}function Gt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},nt=null,et={},u={},f=new WeakMap,d=[],m=null,_=!1,g=null,p=null,w=null,M=null,v=null,T=null,S=null,A=new Dt(0,0,0),I=0,y=!1,E=null,R=null,F=null,O=null,z=null,Pt.set(0,0,n.canvas.width,n.canvas.height),ne.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:J,disable:gt,bindFramebuffer:Lt,drawBuffers:yt,useProgram:Yt,setBlending:jt,setMaterial:le,setFlipSided:Ft,setCullFace:we,setLineWidth:N,setPolygonOffset:Te,setScissorTest:Zt,activeTexture:se,bindTexture:xt,unbindTexture:C,compressedTexImage2D:x,compressedTexImage3D:L,texImage2D:Nt,texImage3D:tt,updateUBOMapping:wt,uniformBlockBinding:ot,texStorage2D:Q,texStorage3D:bt,texSubImage2D:q,texSubImage3D:$,compressedTexSubImage2D:X,compressedTexSubImage3D:vt,scissor:lt,viewport:St,reset:Gt}}function Ex(n,t,e,i,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,h=new WeakMap,u,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(C,x){return d?new OffscreenCanvas(C,x):go("canvas")}function _(C,x,L){let q=1,$=xt(C);if(($.width>L||$.height>L)&&(q=L/Math.max($.width,$.height)),q<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let X=Math.floor(q*$.width),vt=Math.floor(q*$.height);u===void 0&&(u=m(X,vt));let Q=x?m(X,vt):u;return Q.width=X,Q.height=vt,Q.getContext("2d").drawImage(C,0,0,X,vt),Ct("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+X+"x"+vt+")."),Q}else return"data"in C&&Ct("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),C;return C}function g(C){return C.generateMipmaps}function p(C){n.generateMipmap(C)}function w(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function M(C,x,L,q,$=!1){if(C!==null){if(n[C]!==void 0)return n[C];Ct("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let X=x;if(x===n.RED&&(L===n.FLOAT&&(X=n.R32F),L===n.HALF_FLOAT&&(X=n.R16F),L===n.UNSIGNED_BYTE&&(X=n.R8)),x===n.RED_INTEGER&&(L===n.UNSIGNED_BYTE&&(X=n.R8UI),L===n.UNSIGNED_SHORT&&(X=n.R16UI),L===n.UNSIGNED_INT&&(X=n.R32UI),L===n.BYTE&&(X=n.R8I),L===n.SHORT&&(X=n.R16I),L===n.INT&&(X=n.R32I)),x===n.RG&&(L===n.FLOAT&&(X=n.RG32F),L===n.HALF_FLOAT&&(X=n.RG16F),L===n.UNSIGNED_BYTE&&(X=n.RG8)),x===n.RG_INTEGER&&(L===n.UNSIGNED_BYTE&&(X=n.RG8UI),L===n.UNSIGNED_SHORT&&(X=n.RG16UI),L===n.UNSIGNED_INT&&(X=n.RG32UI),L===n.BYTE&&(X=n.RG8I),L===n.SHORT&&(X=n.RG16I),L===n.INT&&(X=n.RG32I)),x===n.RGB_INTEGER&&(L===n.UNSIGNED_BYTE&&(X=n.RGB8UI),L===n.UNSIGNED_SHORT&&(X=n.RGB16UI),L===n.UNSIGNED_INT&&(X=n.RGB32UI),L===n.BYTE&&(X=n.RGB8I),L===n.SHORT&&(X=n.RGB16I),L===n.INT&&(X=n.RGB32I)),x===n.RGBA_INTEGER&&(L===n.UNSIGNED_BYTE&&(X=n.RGBA8UI),L===n.UNSIGNED_SHORT&&(X=n.RGBA16UI),L===n.UNSIGNED_INT&&(X=n.RGBA32UI),L===n.BYTE&&(X=n.RGBA8I),L===n.SHORT&&(X=n.RGBA16I),L===n.INT&&(X=n.RGBA32I)),x===n.RGB&&(L===n.UNSIGNED_INT_5_9_9_9_REV&&(X=n.RGB9_E5),L===n.UNSIGNED_INT_10F_11F_11F_REV&&(X=n.R11F_G11F_B10F)),x===n.RGBA){let vt=$?po:$t.getTransfer(q);L===n.FLOAT&&(X=n.RGBA32F),L===n.HALF_FLOAT&&(X=n.RGBA16F),L===n.UNSIGNED_BYTE&&(X=vt===he?n.SRGB8_ALPHA8:n.RGBA8),L===n.UNSIGNED_SHORT_4_4_4_4&&(X=n.RGBA4),L===n.UNSIGNED_SHORT_5_5_5_1&&(X=n.RGB5_A1)}return(X===n.R16F||X===n.R32F||X===n.RG16F||X===n.RG32F||X===n.RGBA16F||X===n.RGBA32F)&&t.get("EXT_color_buffer_float"),X}function v(C,x){let L;return C?x===null||x===Zi||x===Rr?L=n.DEPTH24_STENCIL8:x===$i?L=n.DEPTH32F_STENCIL8:x===Cr&&(L=n.DEPTH24_STENCIL8,Ct("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Zi||x===Rr?L=n.DEPTH_COMPONENT24:x===$i?L=n.DEPTH_COMPONENT32F:x===Cr&&(L=n.DEPTH_COMPONENT16),L}function T(C,x){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==qe&&C.minFilter!==$e?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function S(C){let x=C.target;x.removeEventListener("dispose",S),I(x),x.isVideoTexture&&h.delete(x)}function A(C){let x=C.target;x.removeEventListener("dispose",A),E(x)}function I(C){let x=i.get(C);if(x.__webglInit===void 0)return;let L=C.source,q=f.get(L);if(q){let $=q[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&y(C),Object.keys(q).length===0&&f.delete(L)}i.remove(C)}function y(C){let x=i.get(C);n.deleteTexture(x.__webglTexture);let L=C.source,q=f.get(L);delete q[x.__cacheKey],o.memory.textures--}function E(C){let x=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(x.__webglFramebuffer[q]))for(let $=0;$<x.__webglFramebuffer[q].length;$++)n.deleteFramebuffer(x.__webglFramebuffer[q][$]);else n.deleteFramebuffer(x.__webglFramebuffer[q]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[q])}else{if(Array.isArray(x.__webglFramebuffer))for(let q=0;q<x.__webglFramebuffer.length;q++)n.deleteFramebuffer(x.__webglFramebuffer[q]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let q=0;q<x.__webglColorRenderbuffer.length;q++)x.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let L=C.textures;for(let q=0,$=L.length;q<$;q++){let X=i.get(L[q]);X.__webglTexture&&(n.deleteTexture(X.__webglTexture),o.memory.textures--),i.remove(L[q])}i.remove(C)}let R=0;function F(){R=0}function O(){let C=R;return C>=s.maxTextures&&Ct("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),R+=1,C}function z(C){let x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function W(C,x){let L=i.get(C);if(C.isVideoTexture&&Zt(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&L.__version!==C.version){let q=C.image;if(q===null)Ct("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Ct("WebGLRenderer: Texture marked for update but image is incomplete");else{Y(L,C,x);return}}else C.isExternalTexture&&(L.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,L.__webglTexture,n.TEXTURE0+x)}function k(C,x){let L=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&L.__version!==C.version){Y(L,C,x);return}else C.isExternalTexture&&(L.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,L.__webglTexture,n.TEXTURE0+x)}function H(C,x){let L=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&L.__version!==C.version){Y(L,C,x);return}e.bindTexture(n.TEXTURE_3D,L.__webglTexture,n.TEXTURE0+x)}function Z(C,x){let L=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&L.__version!==C.version){J(L,C,x);return}e.bindTexture(n.TEXTURE_CUBE_MAP,L.__webglTexture,n.TEXTURE0+x)}let nt={[hr]:n.REPEAT,[sn]:n.CLAMP_TO_EDGE,[Wa]:n.MIRRORED_REPEAT},et={[qe]:n.NEAREST,[Gf]:n.NEAREST_MIPMAP_NEAREST,[ko]:n.NEAREST_MIPMAP_LINEAR,[$e]:n.LINEAR,[Nl]:n.LINEAR_MIPMAP_NEAREST,[ls]:n.LINEAR_MIPMAP_LINEAR},st={[Xf]:n.NEVER,[$f]:n.ALWAYS,[qf]:n.LESS,[_c]:n.LEQUAL,[Yf]:n.EQUAL,[xc]:n.GEQUAL,[Jf]:n.GREATER,[Zf]:n.NOTEQUAL};function Ut(C,x){if(x.type===$i&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===$e||x.magFilter===Nl||x.magFilter===ko||x.magFilter===ls||x.minFilter===$e||x.minFilter===Nl||x.minFilter===ko||x.minFilter===ls)&&Ct("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,nt[x.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,nt[x.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,nt[x.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,et[x.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,et[x.minFilter]),x.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,st[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===qe||x.minFilter!==ko&&x.minFilter!==ls||x.type===$i&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let L=t.get("EXT_texture_filter_anisotropic");n.texParameterf(C,L.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function Pt(C,x){let L=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",S));let q=x.source,$=f.get(q);$===void 0&&($={},f.set(q,$));let X=z(x);if(X!==C.__cacheKey){$[X]===void 0&&($[X]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,L=!0),$[X].usedTimes++;let vt=$[C.__cacheKey];vt!==void 0&&($[C.__cacheKey].usedTimes--,vt.usedTimes===0&&y(x)),C.__cacheKey=X,C.__webglTexture=$[X].texture}return L}function ne(C,x,L){return Math.floor(Math.floor(C/L)/x)}function Jt(C,x,L,q){let X=C.updateRanges;if(X.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,L,q,x.data);else{X.sort((tt,lt)=>tt.start-lt.start);let vt=0;for(let tt=1;tt<X.length;tt++){let lt=X[vt],St=X[tt],wt=lt.start+lt.count,ot=ne(St.start,x.width,4),Gt=ne(lt.start,x.width,4);St.start<=wt+1&&ot===Gt&&ne(St.start+St.count-1,x.width,4)===ot?lt.count=Math.max(lt.count,St.start+St.count-lt.start):(++vt,X[vt]=St)}X.length=vt+1;let Q=n.getParameter(n.UNPACK_ROW_LENGTH),bt=n.getParameter(n.UNPACK_SKIP_PIXELS),Nt=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let tt=0,lt=X.length;tt<lt;tt++){let St=X[tt],wt=Math.floor(St.start/4),ot=Math.ceil(St.count/4),Gt=wt%x.width,U=Math.floor(wt/x.width),ft=ot,it=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Gt),n.pixelStorei(n.UNPACK_SKIP_ROWS,U),e.texSubImage2D(n.TEXTURE_2D,0,Gt,U,ft,it,L,q,x.data)}C.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,Q),n.pixelStorei(n.UNPACK_SKIP_PIXELS,bt),n.pixelStorei(n.UNPACK_SKIP_ROWS,Nt)}}function Y(C,x,L){let q=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(q=n.TEXTURE_3D);let $=Pt(C,x),X=x.source;e.bindTexture(q,C.__webglTexture,n.TEXTURE0+L);let vt=i.get(X);if(X.version!==vt.__version||$===!0){e.activeTexture(n.TEXTURE0+L);let Q=$t.getPrimaries($t.workingColorSpace),bt=x.colorSpace===Bn?null:$t.getPrimaries(x.colorSpace),Nt=x.colorSpace===Bn||Q===bt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Nt);let tt=_(x.image,!1,s.maxTextureSize);tt=se(x,tt);let lt=r.convert(x.format,x.colorSpace),St=r.convert(x.type),wt=M(x.internalFormat,lt,St,x.colorSpace,x.isVideoTexture);Ut(q,x);let ot,Gt=x.mipmaps,U=x.isVideoTexture!==!0,ft=vt.__version===void 0||$===!0,it=X.dataReady,mt=T(x,tt);if(x.isDepthTexture)wt=v(x.format===cs,x.type),ft&&(U?e.texStorage2D(n.TEXTURE_2D,1,wt,tt.width,tt.height):e.texImage2D(n.TEXTURE_2D,0,wt,tt.width,tt.height,0,lt,St,null));else if(x.isDataTexture)if(Gt.length>0){U&&ft&&e.texStorage2D(n.TEXTURE_2D,mt,wt,Gt[0].width,Gt[0].height);for(let j=0,K=Gt.length;j<K;j++)ot=Gt[j],U?it&&e.texSubImage2D(n.TEXTURE_2D,j,0,0,ot.width,ot.height,lt,St,ot.data):e.texImage2D(n.TEXTURE_2D,j,wt,ot.width,ot.height,0,lt,St,ot.data);x.generateMipmaps=!1}else U?(ft&&e.texStorage2D(n.TEXTURE_2D,mt,wt,tt.width,tt.height),it&&Jt(x,tt,lt,St)):e.texImage2D(n.TEXTURE_2D,0,wt,tt.width,tt.height,0,lt,St,tt.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){U&&ft&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,wt,Gt[0].width,Gt[0].height,tt.depth);for(let j=0,K=Gt.length;j<K;j++)if(ot=Gt[j],x.format!==Fi)if(lt!==null)if(U){if(it)if(x.layerUpdates.size>0){let rt=Lu(ot.width,ot.height,x.format,x.type);for(let Ot of x.layerUpdates){let ye=ot.data.subarray(Ot*rt/ot.data.BYTES_PER_ELEMENT,(Ot+1)*rt/ot.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,Ot,ot.width,ot.height,1,lt,ye)}x.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,ot.width,ot.height,tt.depth,lt,ot.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,j,wt,ot.width,ot.height,tt.depth,0,ot.data,0,0);else Ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else U?it&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,ot.width,ot.height,tt.depth,lt,St,ot.data):e.texImage3D(n.TEXTURE_2D_ARRAY,j,wt,ot.width,ot.height,tt.depth,0,lt,St,ot.data)}else{U&&ft&&e.texStorage2D(n.TEXTURE_2D,mt,wt,Gt[0].width,Gt[0].height);for(let j=0,K=Gt.length;j<K;j++)ot=Gt[j],x.format!==Fi?lt!==null?U?it&&e.compressedTexSubImage2D(n.TEXTURE_2D,j,0,0,ot.width,ot.height,lt,ot.data):e.compressedTexImage2D(n.TEXTURE_2D,j,wt,ot.width,ot.height,0,ot.data):Ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):U?it&&e.texSubImage2D(n.TEXTURE_2D,j,0,0,ot.width,ot.height,lt,St,ot.data):e.texImage2D(n.TEXTURE_2D,j,wt,ot.width,ot.height,0,lt,St,ot.data)}else if(x.isDataArrayTexture)if(U){if(ft&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,wt,tt.width,tt.height,tt.depth),it)if(x.layerUpdates.size>0){let j=Lu(tt.width,tt.height,x.format,x.type);for(let K of x.layerUpdates){let rt=tt.data.subarray(K*j/tt.data.BYTES_PER_ELEMENT,(K+1)*j/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,K,tt.width,tt.height,1,lt,St,rt)}x.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,lt,St,tt.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,wt,tt.width,tt.height,tt.depth,0,lt,St,tt.data);else if(x.isData3DTexture)U?(ft&&e.texStorage3D(n.TEXTURE_3D,mt,wt,tt.width,tt.height,tt.depth),it&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,lt,St,tt.data)):e.texImage3D(n.TEXTURE_3D,0,wt,tt.width,tt.height,tt.depth,0,lt,St,tt.data);else if(x.isFramebufferTexture){if(ft)if(U)e.texStorage2D(n.TEXTURE_2D,mt,wt,tt.width,tt.height);else{let j=tt.width,K=tt.height;for(let rt=0;rt<mt;rt++)e.texImage2D(n.TEXTURE_2D,rt,wt,j,K,0,lt,St,null),j>>=1,K>>=1}}else if(Gt.length>0){if(U&&ft){let j=xt(Gt[0]);e.texStorage2D(n.TEXTURE_2D,mt,wt,j.width,j.height)}for(let j=0,K=Gt.length;j<K;j++)ot=Gt[j],U?it&&e.texSubImage2D(n.TEXTURE_2D,j,0,0,lt,St,ot):e.texImage2D(n.TEXTURE_2D,j,wt,lt,St,ot);x.generateMipmaps=!1}else if(U){if(ft){let j=xt(tt);e.texStorage2D(n.TEXTURE_2D,mt,wt,j.width,j.height)}it&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,lt,St,tt)}else e.texImage2D(n.TEXTURE_2D,0,wt,lt,St,tt);g(x)&&p(q),vt.__version=X.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function J(C,x,L){if(x.image.length!==6)return;let q=Pt(C,x),$=x.source;e.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+L);let X=i.get($);if($.version!==X.__version||q===!0){e.activeTexture(n.TEXTURE0+L);let vt=$t.getPrimaries($t.workingColorSpace),Q=x.colorSpace===Bn?null:$t.getPrimaries(x.colorSpace),bt=x.colorSpace===Bn||vt===Q?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt);let Nt=x.isCompressedTexture||x.image[0].isCompressedTexture,tt=x.image[0]&&x.image[0].isDataTexture,lt=[];for(let K=0;K<6;K++)!Nt&&!tt?lt[K]=_(x.image[K],!0,s.maxCubemapSize):lt[K]=tt?x.image[K].image:x.image[K],lt[K]=se(x,lt[K]);let St=lt[0],wt=r.convert(x.format,x.colorSpace),ot=r.convert(x.type),Gt=M(x.internalFormat,wt,ot,x.colorSpace),U=x.isVideoTexture!==!0,ft=X.__version===void 0||q===!0,it=$.dataReady,mt=T(x,St);Ut(n.TEXTURE_CUBE_MAP,x);let j;if(Nt){U&&ft&&e.texStorage2D(n.TEXTURE_CUBE_MAP,mt,Gt,St.width,St.height);for(let K=0;K<6;K++){j=lt[K].mipmaps;for(let rt=0;rt<j.length;rt++){let Ot=j[rt];x.format!==Fi?wt!==null?U?it&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt,0,0,Ot.width,Ot.height,wt,Ot.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt,Gt,Ot.width,Ot.height,0,Ot.data):Ct("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?it&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt,0,0,Ot.width,Ot.height,wt,ot,Ot.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt,Gt,Ot.width,Ot.height,0,wt,ot,Ot.data)}}}else{if(j=x.mipmaps,U&&ft){j.length>0&&mt++;let K=xt(lt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,mt,Gt,K.width,K.height)}for(let K=0;K<6;K++)if(tt){U?it&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,lt[K].width,lt[K].height,wt,ot,lt[K].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Gt,lt[K].width,lt[K].height,0,wt,ot,lt[K].data);for(let rt=0;rt<j.length;rt++){let ye=j[rt].image[K].image;U?it&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt+1,0,0,ye.width,ye.height,wt,ot,ye.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt+1,Gt,ye.width,ye.height,0,wt,ot,ye.data)}}else{U?it&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,wt,ot,lt[K]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Gt,wt,ot,lt[K]);for(let rt=0;rt<j.length;rt++){let Ot=j[rt];U?it&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt+1,0,0,wt,ot,Ot.image[K]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,rt+1,Gt,wt,ot,Ot.image[K])}}}g(x)&&p(n.TEXTURE_CUBE_MAP),X.__version=$.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function gt(C,x,L,q,$,X){let vt=r.convert(L.format,L.colorSpace),Q=r.convert(L.type),bt=M(L.internalFormat,vt,Q,L.colorSpace),Nt=i.get(x),tt=i.get(L);if(tt.__renderTarget=x,!Nt.__hasExternalTextures){let lt=Math.max(1,x.width>>X),St=Math.max(1,x.height>>X);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?e.texImage3D($,X,bt,lt,St,x.depth,0,vt,Q,null):e.texImage2D($,X,bt,lt,St,0,vt,Q,null)}e.bindFramebuffer(n.FRAMEBUFFER,C),Te(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,$,tt.__webglTexture,0,N(x)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,$,tt.__webglTexture,X),e.bindFramebuffer(n.FRAMEBUFFER,null)}function Lt(C,x,L){if(n.bindRenderbuffer(n.RENDERBUFFER,C),x.depthBuffer){let q=x.depthTexture,$=q&&q.isDepthTexture?q.type:null,X=v(x.stencilBuffer,$),vt=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Te(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,N(x),X,x.width,x.height):L?n.renderbufferStorageMultisample(n.RENDERBUFFER,N(x),X,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,X,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,vt,n.RENDERBUFFER,C)}else{let q=x.textures;for(let $=0;$<q.length;$++){let X=q[$],vt=r.convert(X.format,X.colorSpace),Q=r.convert(X.type),bt=M(X.internalFormat,vt,Q,X.colorSpace);Te(x)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,N(x),bt,x.width,x.height):L?n.renderbufferStorageMultisample(n.RENDERBUFFER,N(x),bt,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,bt,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function yt(C,x,L){let q=x.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let $=i.get(x.depthTexture);if($.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q){if($.__webglInit===void 0&&($.__webglInit=!0,x.depthTexture.addEventListener("dispose",S)),$.__webglTexture===void 0){$.__webglTexture=n.createTexture(),e.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),Ut(n.TEXTURE_CUBE_MAP,x.depthTexture);let Nt=r.convert(x.depthTexture.format),tt=r.convert(x.depthTexture.type),lt;x.depthTexture.format===rn?lt=n.DEPTH_COMPONENT24:x.depthTexture.format===cs&&(lt=n.DEPTH24_STENCIL8);for(let St=0;St<6;St++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+St,0,lt,x.width,x.height,0,Nt,tt,null)}}else W(x.depthTexture,0);let X=$.__webglTexture,vt=N(x),Q=q?n.TEXTURE_CUBE_MAP_POSITIVE_X+L:n.TEXTURE_2D,bt=x.depthTexture.format===cs?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===rn)Te(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,bt,Q,X,0,vt):n.framebufferTexture2D(n.FRAMEBUFFER,bt,Q,X,0);else if(x.depthTexture.format===cs)Te(x)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,bt,Q,X,0,vt):n.framebufferTexture2D(n.FRAMEBUFFER,bt,Q,X,0);else throw new Error("Unknown depthTexture format")}function Yt(C){let x=i.get(C),L=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){let q=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),q){let $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,q.removeEventListener("dispose",$)};q.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=q}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(L)for(let q=0;q<6;q++)yt(x.__webglFramebuffer[q],C,q);else{let q=C.texture.mipmaps;q&&q.length>0?yt(x.__webglFramebuffer[0],C,0):yt(x.__webglFramebuffer,C,0)}else if(L){x.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[q]),x.__webglDepthbuffer[q]===void 0)x.__webglDepthbuffer[q]=n.createRenderbuffer(),Lt(x.__webglDepthbuffer[q],C,!1);else{let $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,X),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,X)}}else{let q=C.texture.mipmaps;if(q&&q.length>0?e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),Lt(x.__webglDepthbuffer,C,!1);else{let $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,X),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,X)}}e.bindFramebuffer(n.FRAMEBUFFER,null)}function Re(C,x,L){let q=i.get(C);x!==void 0&&gt(q.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),L!==void 0&&Yt(C)}function qt(C){let x=C.texture,L=i.get(C),q=i.get(x);C.addEventListener("dispose",A);let $=C.textures,X=C.isWebGLCubeRenderTarget===!0,vt=$.length>1;if(vt||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=x.version,o.memory.textures++),X){L.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0){L.__webglFramebuffer[Q]=[];for(let bt=0;bt<x.mipmaps.length;bt++)L.__webglFramebuffer[Q][bt]=n.createFramebuffer()}else L.__webglFramebuffer[Q]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){L.__webglFramebuffer=[];for(let Q=0;Q<x.mipmaps.length;Q++)L.__webglFramebuffer[Q]=n.createFramebuffer()}else L.__webglFramebuffer=n.createFramebuffer();if(vt)for(let Q=0,bt=$.length;Q<bt;Q++){let Nt=i.get($[Q]);Nt.__webglTexture===void 0&&(Nt.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&Te(C)===!1){L.__webglMultisampledFramebuffer=n.createFramebuffer(),L.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,L.__webglMultisampledFramebuffer);for(let Q=0;Q<$.length;Q++){let bt=$[Q];L.__webglColorRenderbuffer[Q]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,L.__webglColorRenderbuffer[Q]);let Nt=r.convert(bt.format,bt.colorSpace),tt=r.convert(bt.type),lt=M(bt.internalFormat,Nt,tt,bt.colorSpace,C.isXRRenderTarget===!0),St=N(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,St,lt,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Q,n.RENDERBUFFER,L.__webglColorRenderbuffer[Q])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(L.__webglDepthRenderbuffer=n.createRenderbuffer(),Lt(L.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(X){e.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),Ut(n.TEXTURE_CUBE_MAP,x);for(let Q=0;Q<6;Q++)if(x.mipmaps&&x.mipmaps.length>0)for(let bt=0;bt<x.mipmaps.length;bt++)gt(L.__webglFramebuffer[Q][bt],C,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt);else gt(L.__webglFramebuffer[Q],C,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);g(x)&&p(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(vt){for(let Q=0,bt=$.length;Q<bt;Q++){let Nt=$[Q],tt=i.get(Nt),lt=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(lt=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(lt,tt.__webglTexture),Ut(lt,Nt),gt(L.__webglFramebuffer,C,Nt,n.COLOR_ATTACHMENT0+Q,lt,0),g(Nt)&&p(lt)}e.unbindTexture()}else{let Q=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Q=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(Q,q.__webglTexture),Ut(Q,x),x.mipmaps&&x.mipmaps.length>0)for(let bt=0;bt<x.mipmaps.length;bt++)gt(L.__webglFramebuffer[bt],C,x,n.COLOR_ATTACHMENT0,Q,bt);else gt(L.__webglFramebuffer,C,x,n.COLOR_ATTACHMENT0,Q,0);g(x)&&p(Q),e.unbindTexture()}C.depthBuffer&&Yt(C)}function jt(C){let x=C.textures;for(let L=0,q=x.length;L<q;L++){let $=x[L];if(g($)){let X=w(C),vt=i.get($).__webglTexture;e.bindTexture(X,vt),p(X),e.unbindTexture()}}}let le=[],Ft=[];function we(C){if(C.samples>0){if(Te(C)===!1){let x=C.textures,L=C.width,q=C.height,$=n.COLOR_BUFFER_BIT,X=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,vt=i.get(C),Q=x.length>1;if(Q)for(let Nt=0;Nt<x.length;Nt++)e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Nt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Nt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer);let bt=C.texture.mipmaps;bt&&bt.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Nt=0;Nt<x.length;Nt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),Q){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,vt.__webglColorRenderbuffer[Nt]);let tt=i.get(x[Nt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,tt,0)}n.blitFramebuffer(0,0,L,q,0,0,L,q,$,n.NEAREST),l===!0&&(le.length=0,Ft.length=0,le.push(n.COLOR_ATTACHMENT0+Nt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(le.push(X),Ft.push(X),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ft)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,le))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Q)for(let Nt=0;Nt<x.length;Nt++){e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Nt,n.RENDERBUFFER,vt.__webglColorRenderbuffer[Nt]);let tt=i.get(x[Nt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,vt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Nt,n.TEXTURE_2D,tt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let x=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function N(C){return Math.min(s.maxSamples,C.samples)}function Te(C){let x=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Zt(C){let x=o.render.frame;h.get(C)!==x&&(h.set(C,x),C.update())}function se(C,x){let L=C.colorSpace,q=C.format,$=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||L!==ws&&L!==Bn&&($t.getTransfer(L)===he?(q!==Fi||$!==gi)&&Ct("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Rt("WebGLTextures: Unsupported texture color space:",L)),x}function xt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=F,this.setTexture2D=W,this.setTexture2DArray=k,this.setTexture3D=H,this.setTextureCube=Z,this.rebindTextures=Re,this.setupRenderTarget=qt,this.updateRenderTargetMipmap=jt,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=Yt,this.setupFrameBufferTexture=gt,this.useMultisampledRTT=Te,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Ax(n,t){function e(i,s=Bn){let r,o=$t.getTransfer(s);if(i===gi)return n.UNSIGNED_BYTE;if(i===Ll)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Dl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===vu)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Mu)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===xu)return n.BYTE;if(i===yu)return n.SHORT;if(i===Cr)return n.UNSIGNED_SHORT;if(i===Ul)return n.INT;if(i===Zi)return n.UNSIGNED_INT;if(i===$i)return n.FLOAT;if(i===cn)return n.HALF_FLOAT;if(i===Su)return n.ALPHA;if(i===bu)return n.RGB;if(i===Fi)return n.RGBA;if(i===rn)return n.DEPTH_COMPONENT;if(i===cs)return n.DEPTH_STENCIL;if(i===wu)return n.RED;if(i===Ol)return n.RED_INTEGER;if(i===Ds)return n.RG;if(i===Fl)return n.RG_INTEGER;if(i===Bl)return n.RGBA_INTEGER;if(i===Vo||i===Go||i===Ho||i===Wo)if(o===he)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Vo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ho)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Vo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Go)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ho)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Wo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===zl||i===kl||i===Vl||i===Gl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===zl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===kl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Vl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Gl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Hl||i===Wl||i===Xl||i===ql||i===Yl||i===Jl||i===Zl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Hl||i===Wl)return o===he?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Xl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===ql)return r.COMPRESSED_R11_EAC;if(i===Yl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Jl)return r.COMPRESSED_RG11_EAC;if(i===Zl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===$l||i===Kl||i===Ql||i===jl||i===tc||i===ec||i===ic||i===nc||i===sc||i===rc||i===oc||i===ac||i===lc||i===cc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===$l)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Kl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ql)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===jl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===tc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ec)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ic)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===nc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===sc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===rc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===oc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ac)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===lc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===cc)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===hc||i===uc||i===dc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===hc)return o===he?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===uc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===dc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===fc||i===pc||i===mc||i===gc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===fc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===pc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===mc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===gc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Rr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var Cx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Rx=`
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

}`,Ju=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Eo(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Fe({vertexShader:Cx,fragmentShader:Rx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ce(new Fn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zu=class extends on{constructor(t,e){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,m=null,_=typeof XRWebGLBinding<"u",g=new Ju,p={},w=e.getContextAttributes(),M=null,v=null,T=[],S=[],A=new at,I=null,y=new ze;y.viewport=new Ae;let E=new ze;E.viewport=new Ae;let R=[y,E],F=new Ml,O=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let J=T[Y];return J===void 0&&(J=new mr,T[Y]=J),J.getTargetRaySpace()},this.getControllerGrip=function(Y){let J=T[Y];return J===void 0&&(J=new mr,T[Y]=J),J.getGripSpace()},this.getHand=function(Y){let J=T[Y];return J===void 0&&(J=new mr,T[Y]=J),J.getHandSpace()};function W(Y){let J=S.indexOf(Y.inputSource);if(J===-1)return;let gt=T[J];gt!==void 0&&(gt.update(Y.inputSource,Y.frame,c||o),gt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function k(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",H);for(let Y=0;Y<T.length;Y++){let J=S[Y];J!==null&&(S[Y]=null,T[Y].disconnect(J))}O=null,z=null,g.reset();for(let Y in p)delete p[Y];t.setRenderTarget(M),d=null,f=null,u=null,s=null,v=null,Jt.stop(),i.isPresenting=!1,t.setPixelRatio(I),t.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,i.isPresenting===!0&&Ct("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,i.isPresenting===!0&&Ct("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(M=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",k),s.addEventListener("inputsourceschange",H),w.xrCompatible!==!0&&await e.makeXRCompatible(),I=t.getPixelRatio(),t.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let gt=null,Lt=null,yt=null;w.depth&&(yt=w.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,gt=w.stencil?cs:rn,Lt=w.stencil?Rr:Zi);let Yt={colorFormat:e.RGBA8,depthFormat:yt,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Yt),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),v=new Si(f.textureWidth,f.textureHeight,{format:Fi,type:gi,depthTexture:new ts(f.textureWidth,f.textureHeight,Lt,void 0,void 0,void 0,void 0,void 0,void 0,gt),stencilBuffer:w.stencil,colorSpace:t.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let gt={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,gt),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new Si(d.framebufferWidth,d.framebufferHeight,{format:Fi,type:gi,colorSpace:t.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Jt.setContext(s),Jt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function H(Y){for(let J=0;J<Y.removed.length;J++){let gt=Y.removed[J],Lt=S.indexOf(gt);Lt>=0&&(S[Lt]=null,T[Lt].disconnect(gt))}for(let J=0;J<Y.added.length;J++){let gt=Y.added[J],Lt=S.indexOf(gt);if(Lt===-1){for(let Yt=0;Yt<T.length;Yt++)if(Yt>=S.length){S.push(gt),Lt=Yt;break}else if(S[Yt]===null){S[Yt]=gt,Lt=Yt;break}if(Lt===-1)break}let yt=T[Lt];yt&&yt.connect(gt)}}let Z=new P,nt=new P;function et(Y,J,gt){Z.setFromMatrixPosition(J.matrixWorld),nt.setFromMatrixPosition(gt.matrixWorld);let Lt=Z.distanceTo(nt),yt=J.projectionMatrix.elements,Yt=gt.projectionMatrix.elements,Re=yt[14]/(yt[10]-1),qt=yt[14]/(yt[10]+1),jt=(yt[9]+1)/yt[5],le=(yt[9]-1)/yt[5],Ft=(yt[8]-1)/yt[0],we=(Yt[8]+1)/Yt[0],N=Re*Ft,Te=Re*we,Zt=Lt/(-Ft+we),se=Zt*-Ft;if(J.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(se),Y.translateZ(Zt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),yt[10]===-1)Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let xt=Re+Zt,C=qt+Zt,x=N-se,L=Te+(Lt-se),q=jt*qt/C*xt,$=le*qt/C*xt;Y.projectionMatrix.makePerspective(x,L,q,$,xt,C),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function st(Y,J){J===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(J.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let J=Y.near,gt=Y.far;g.texture!==null&&(g.depthNear>0&&(J=g.depthNear),g.depthFar>0&&(gt=g.depthFar)),F.near=E.near=y.near=J,F.far=E.far=y.far=gt,(O!==F.near||z!==F.far)&&(s.updateRenderState({depthNear:F.near,depthFar:F.far}),O=F.near,z=F.far),F.layers.mask=Y.layers.mask|6,y.layers.mask=F.layers.mask&3,E.layers.mask=F.layers.mask&5;let Lt=Y.parent,yt=F.cameras;st(F,Lt);for(let Yt=0;Yt<yt.length;Yt++)st(yt[Yt],Lt);yt.length===2?et(F,y,E):F.projectionMatrix.copy(y.projectionMatrix),Ut(Y,F,Lt)};function Ut(Y,J,gt){gt===null?Y.matrix.copy(J.matrixWorld):(Y.matrix.copy(gt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(J.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=fr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Y){l=Y,f!==null&&(f.fixedFoveation=Y),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Y)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(F)},this.getCameraTexture=function(Y){return p[Y]};let Pt=null;function ne(Y,J){if(h=J.getViewerPose(c||o),m=J,h!==null){let gt=h.views;d!==null&&(t.setRenderTargetFramebuffer(v,d.framebuffer),t.setRenderTarget(v));let Lt=!1;gt.length!==F.cameras.length&&(F.cameras.length=0,Lt=!0);for(let qt=0;qt<gt.length;qt++){let jt=gt[qt],le=null;if(d!==null)le=d.getViewport(jt);else{let we=u.getViewSubImage(f,jt);le=we.viewport,qt===0&&(t.setRenderTargetTextures(v,we.colorTexture,we.depthStencilTexture),t.setRenderTarget(v))}let Ft=R[qt];Ft===void 0&&(Ft=new ze,Ft.layers.enable(qt),Ft.viewport=new Ae,R[qt]=Ft),Ft.matrix.fromArray(jt.transform.matrix),Ft.matrix.decompose(Ft.position,Ft.quaternion,Ft.scale),Ft.projectionMatrix.fromArray(jt.projectionMatrix),Ft.projectionMatrixInverse.copy(Ft.projectionMatrix).invert(),Ft.viewport.set(le.x,le.y,le.width,le.height),qt===0&&(F.matrix.copy(Ft.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),Lt===!0&&F.cameras.push(Ft)}let yt=s.enabledFeatures;if(yt&&yt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=i.getBinding();let qt=u.getDepthInformation(gt[0]);qt&&qt.isValid&&qt.texture&&g.init(qt,s.renderState)}if(yt&&yt.includes("camera-access")&&_){t.state.unbindTexture(),u=i.getBinding();for(let qt=0;qt<gt.length;qt++){let jt=gt[qt].camera;if(jt){let le=p[jt];le||(le=new Eo,p[jt]=le);let Ft=u.getCameraImage(jt);le.sourceTexture=Ft}}}}for(let gt=0;gt<T.length;gt++){let Lt=S[gt],yt=T[gt];Lt!==null&&yt!==void 0&&yt.update(Lt,J,c||o)}Pt&&Pt(Y,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),m=null}let Jt=new Tp;Jt.setAnimationLoop(ne),this.setAnimationLoop=function(Y){Pt=Y},this.dispose=function(){}}},Bs=new qi,Px=new Me;function Ix(n,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,Pu(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,w,M,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(g,p):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p)):p.isMeshStandardMaterial?(r(g,p),f(g,p),p.isMeshPhysicalMaterial&&d(g,p,v)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),_(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(o(g,p),p.isLineDashedMaterial&&a(g,p)):p.isPointsMaterial?l(g,p,w,M):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===ke&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===ke&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let w=t.get(p),M=w.envMap,v=w.envMapRotation;M&&(g.envMap.value=M,Bs.copy(v),Bs.x*=-1,Bs.y*=-1,Bs.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Bs.y*=-1,Bs.z*=-1),g.envMapRotation.value.setFromMatrix4(Px.makeRotationFromEuler(Bs)),g.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function o(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function a(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,w,M){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*w,g.scale.value=M*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function f(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function d(g,p,w){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===ke&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=w.texture,g.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function _(g,p){let w=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(w.matrixWorld),g.nearDistance.value=w.shadow.camera.near,g.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Nx(n,t,e,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,M){let v=M.program;i.uniformBlockBinding(w,v)}function c(w,M){let v=s[w.id];v===void 0&&(m(w),v=h(w),s[w.id]=v,w.addEventListener("dispose",g));let T=M.program;i.updateUBOMapping(w,T);let S=t.render.frame;r[w.id]!==S&&(f(w),r[w.id]=S)}function h(w){let M=u();w.__bindingPointIndex=M;let v=n.createBuffer(),T=w.__size,S=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,T,S),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,v),v}function u(){for(let w=0;w<a;w++)if(o.indexOf(w)===-1)return o.push(w),w;return Rt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(w){let M=s[w.id],v=w.uniforms,T=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let S=0,A=v.length;S<A;S++){let I=Array.isArray(v[S])?v[S]:[v[S]];for(let y=0,E=I.length;y<E;y++){let R=I[y];if(d(R,S,y,T)===!0){let F=R.__offset,O=Array.isArray(R.value)?R.value:[R.value],z=0;for(let W=0;W<O.length;W++){let k=O[W],H=_(k);typeof k=="number"||typeof k=="boolean"?(R.__data[0]=k,n.bufferSubData(n.UNIFORM_BUFFER,F+z,R.__data)):k.isMatrix3?(R.__data[0]=k.elements[0],R.__data[1]=k.elements[1],R.__data[2]=k.elements[2],R.__data[3]=0,R.__data[4]=k.elements[3],R.__data[5]=k.elements[4],R.__data[6]=k.elements[5],R.__data[7]=0,R.__data[8]=k.elements[6],R.__data[9]=k.elements[7],R.__data[10]=k.elements[8],R.__data[11]=0):(k.toArray(R.__data,z),z+=H.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,R.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(w,M,v,T){let S=w.value,A=M+"_"+v;if(T[A]===void 0)return typeof S=="number"||typeof S=="boolean"?T[A]=S:T[A]=S.clone(),!0;{let I=T[A];if(typeof S=="number"||typeof S=="boolean"){if(I!==S)return T[A]=S,!0}else if(I.equals(S)===!1)return I.copy(S),!0}return!1}function m(w){let M=w.uniforms,v=0,T=16;for(let A=0,I=M.length;A<I;A++){let y=Array.isArray(M[A])?M[A]:[M[A]];for(let E=0,R=y.length;E<R;E++){let F=y[E],O=Array.isArray(F.value)?F.value:[F.value];for(let z=0,W=O.length;z<W;z++){let k=O[z],H=_(k),Z=v%T,nt=Z%H.boundary,et=Z+nt;v+=nt,et!==0&&T-et<H.storage&&(v+=T-et),F.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=v,v+=H.storage}}}let S=v%T;return S>0&&(v+=T-S),w.__size=v,w.__cache={},this}function _(w){let M={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(M.boundary=4,M.storage=4):w.isVector2?(M.boundary=8,M.storage=8):w.isVector3||w.isColor?(M.boundary=16,M.storage=12):w.isVector4?(M.boundary=16,M.storage=16):w.isMatrix3?(M.boundary=48,M.storage=48):w.isMatrix4?(M.boundary=64,M.storage=64):w.isTexture?Ct("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ct("WebGLRenderer: Unsupported uniform value type.",w),M}function g(w){let M=w.target;M.removeEventListener("dispose",g);let v=o.indexOf(M.__bindingPointIndex);o.splice(v,1),n.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function p(){for(let w in s)n.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Ux=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),hn=null;function Lx(){return hn===null&&(hn=new Ka(Ux,16,16,Ds,cn),hn.name="DFG_LUT",hn.minFilter=$e,hn.magFilter=$e,hn.wrapS=sn,hn.wrapT=sn,hn.generateMipmaps=!1,hn.needsUpdate=!0),hn}var Sc=class{constructor(t={}){let{canvas:e=Kf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1,outputBufferType:d=gi}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;let _=d,g=new Set([Bl,Fl,Ol]),p=new Set([gi,Zi,Cr,Rr,Ll,Dl]),w=new Uint32Array(4),M=new Int32Array(4),v=null,T=null,S=[],A=[],I=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ji,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,E=!1;this._outputColorSpace=ai;let R=0,F=0,O=null,z=-1,W=null,k=new Ae,H=new Ae,Z=null,nt=new Dt(0),et=0,st=e.width,Ut=e.height,Pt=1,ne=null,Jt=null,Y=new Ae(0,0,st,Ut),J=new Ae(0,0,st,Ut),gt=!1,Lt=new xr,yt=!1,Yt=!1,Re=new Me,qt=new P,jt=new Ae,le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ft=!1;function we(){return O===null?Pt:1}let N=i;function Te(b,D){return e.getContext(b,D)}try{let b={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"182"}`),e.addEventListener("webglcontextlost",Ot,!1),e.addEventListener("webglcontextrestored",ye,!1),e.addEventListener("webglcontextcreationerror",ue,!1),N===null){let D="webgl2";if(N=Te(D,b),N===null)throw Te(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw Rt("WebGLRenderer: "+b.message),b}let Zt,se,xt,C,x,L,q,$,X,vt,Q,bt,Nt,tt,lt,St,wt,ot,Gt,U,ft,it,mt,j;function K(){Zt=new V2(N),Zt.init(),it=new Ax(N,Zt),se=new N2(N,Zt,t,it),xt=new Tx(N,Zt),se.reversedDepthBuffer&&f&&xt.buffers.depth.setReversed(!0),C=new W2(N),x=new hx,L=new Ex(N,Zt,xt,x,se,it,C),q=new L2(y),$=new k2(y),X=new J0(N),mt=new P2(N,X),vt=new G2(N,X,C,mt),Q=new q2(N,vt,X,C),Gt=new X2(N,se,L),St=new U2(x),bt=new cx(y,q,$,Zt,se,mt,St),Nt=new Ix(y,x),tt=new dx,lt=new xx(Zt),ot=new R2(y,q,$,xt,Q,m,l),wt=new bx(y,Q,se),j=new Nx(N,C,se,xt),U=new I2(N,Zt,C),ft=new H2(N,Zt,C),C.programs=bt.programs,y.capabilities=se,y.extensions=Zt,y.properties=x,y.renderLists=tt,y.shadowMap=wt,y.state=xt,y.info=C}K(),_!==gi&&(I=new J2(_,e.width,e.height,s,r));let rt=new Zu(y,N);this.xr=rt,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let b=Zt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=Zt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return Pt},this.setPixelRatio=function(b){b!==void 0&&(Pt=b,this.setSize(st,Ut,!1))},this.getSize=function(b){return b.set(st,Ut)},this.setSize=function(b,D,G=!0){if(rt.isPresenting){Ct("WebGLRenderer: Can't change size while VR device is presenting.");return}st=b,Ut=D,e.width=Math.floor(b*Pt),e.height=Math.floor(D*Pt),G===!0&&(e.style.width=b+"px",e.style.height=D+"px"),I!==null&&I.setSize(e.width,e.height),this.setViewport(0,0,b,D)},this.getDrawingBufferSize=function(b){return b.set(st*Pt,Ut*Pt).floor()},this.setDrawingBufferSize=function(b,D,G){st=b,Ut=D,Pt=G,e.width=Math.floor(b*G),e.height=Math.floor(D*G),this.setViewport(0,0,b,D)},this.setEffects=function(b){if(_===gi){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let D=0;D<b.length;D++)if(b[D].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(k)},this.getViewport=function(b){return b.copy(Y)},this.setViewport=function(b,D,G,V){b.isVector4?Y.set(b.x,b.y,b.z,b.w):Y.set(b,D,G,V),xt.viewport(k.copy(Y).multiplyScalar(Pt).round())},this.getScissor=function(b){return b.copy(J)},this.setScissor=function(b,D,G,V){b.isVector4?J.set(b.x,b.y,b.z,b.w):J.set(b,D,G,V),xt.scissor(H.copy(J).multiplyScalar(Pt).round())},this.getScissorTest=function(){return gt},this.setScissorTest=function(b){xt.setScissorTest(gt=b)},this.setOpaqueSort=function(b){ne=b},this.setTransparentSort=function(b){Jt=b},this.getClearColor=function(b){return b.copy(ot.getClearColor())},this.setClearColor=function(){ot.setClearColor(...arguments)},this.getClearAlpha=function(){return ot.getClearAlpha()},this.setClearAlpha=function(){ot.setClearAlpha(...arguments)},this.clear=function(b=!0,D=!0,G=!0){let V=0;if(b){let B=!1;if(O!==null){let ct=O.texture.format;B=g.has(ct)}if(B){let ct=O.texture.type,_t=p.has(ct),dt=ot.getClearColor(),Mt=ot.getClearAlpha(),Tt=dt.r,It=dt.g,Et=dt.b;_t?(w[0]=Tt,w[1]=It,w[2]=Et,w[3]=Mt,N.clearBufferuiv(N.COLOR,0,w)):(M[0]=Tt,M[1]=It,M[2]=Et,M[3]=Mt,N.clearBufferiv(N.COLOR,0,M))}else V|=N.COLOR_BUFFER_BIT}D&&(V|=N.DEPTH_BUFFER_BIT),G&&(V|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Ot,!1),e.removeEventListener("webglcontextrestored",ye,!1),e.removeEventListener("webglcontextcreationerror",ue,!1),ot.dispose(),tt.dispose(),lt.dispose(),x.dispose(),q.dispose(),$.dispose(),Q.dispose(),mt.dispose(),j.dispose(),bt.dispose(),rt.dispose(),rt.removeEventListener("sessionstart",zd),rt.removeEventListener("sessionend",kd),ms.stop()};function Ot(b){b.preventDefault(),_o("WebGLRenderer: Context Lost."),E=!0}function ye(){_o("WebGLRenderer: Context Restored."),E=!1;let b=C.autoReset,D=wt.enabled,G=wt.autoUpdate,V=wt.needsUpdate,B=wt.type;K(),C.autoReset=b,wt.enabled=D,wt.autoUpdate=G,wt.needsUpdate=V,wt.type=B}function ue(b){Rt("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function nn(b){let D=b.target;D.removeEventListener("dispose",nn),En(D)}function En(b){ym(b),x.remove(b)}function ym(b){let D=x.get(b).programs;D!==void 0&&(D.forEach(function(G){bt.releaseProgram(G)}),b.isShaderMaterial&&bt.releaseShaderCache(b))}this.renderBufferDirect=function(b,D,G,V,B,ct){D===null&&(D=le);let _t=B.isMesh&&B.matrixWorld.determinant()<0,dt=Mm(b,D,G,V,B);xt.setMaterial(V,_t);let Mt=G.index,Tt=1;if(V.wireframe===!0){if(Mt=vt.getWireframeAttribute(G),Mt===void 0)return;Tt=2}let It=G.drawRange,Et=G.attributes.position,Xt=It.start*Tt,pe=(It.start+It.count)*Tt;ct!==null&&(Xt=Math.max(Xt,ct.start*Tt),pe=Math.min(pe,(ct.start+ct.count)*Tt)),Mt!==null?(Xt=Math.max(Xt,0),pe=Math.min(pe,Mt.count)):Et!=null&&(Xt=Math.max(Xt,0),pe=Math.min(pe,Et.count));let Pe=pe-Xt;if(Pe<0||Pe===1/0)return;mt.setup(B,V,dt,G,Mt);let Ie,xe=U;if(Mt!==null&&(Ie=X.get(Mt),xe=ft,xe.setIndex(Ie)),B.isMesh)V.wireframe===!0?(xt.setLineWidth(V.wireframeLinewidth*we()),xe.setMode(N.LINES)):xe.setMode(N.TRIANGLES);else if(B.isLine){let At=V.linewidth;At===void 0&&(At=1),xt.setLineWidth(At*we()),B.isLineSegments?xe.setMode(N.LINES):B.isLineLoop?xe.setMode(N.LINE_LOOP):xe.setMode(N.LINE_STRIP)}else B.isPoints?xe.setMode(N.POINTS):B.isSprite&&xe.setMode(N.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)dr("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xe.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(Zt.get("WEBGL_multi_draw"))xe.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let At=B._multiDrawStarts,de=B._multiDrawCounts,re=B._multiDrawCount,xi=Mt?X.get(Mt).bytesPerElement:1,qs=x.get(V).currentProgram.getUniforms();for(let yi=0;yi<re;yi++)qs.setValue(N,"_gl_DrawID",yi),xe.render(At[yi]/xi,de[yi])}else if(B.isInstancedMesh)xe.renderInstances(Xt,Pe,B.count);else if(G.isInstancedBufferGeometry){let At=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,de=Math.min(G.instanceCount,At);xe.renderInstances(Xt,Pe,de)}else xe.render(Xt,Pe)};function Bd(b,D,G){b.transparent===!0&&b.side===Ye&&b.forceSinglePass===!1?(b.side=ke,b.needsUpdate=!0,pa(b,D,G),b.side=Ln,b.needsUpdate=!0,pa(b,D,G),b.side=Ye):pa(b,D,G)}this.compile=function(b,D,G=null){G===null&&(G=b),T=lt.get(G),T.init(D),A.push(T),G.traverseVisible(function(B){B.isLight&&B.layers.test(D.layers)&&(T.pushLight(B),B.castShadow&&T.pushShadow(B))}),b!==G&&b.traverseVisible(function(B){B.isLight&&B.layers.test(D.layers)&&(T.pushLight(B),B.castShadow&&T.pushShadow(B))}),T.setupLights();let V=new Set;return b.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let ct=B.material;if(ct)if(Array.isArray(ct))for(let _t=0;_t<ct.length;_t++){let dt=ct[_t];Bd(dt,G,B),V.add(dt)}else Bd(ct,G,B),V.add(ct)}),T=A.pop(),V},this.compileAsync=function(b,D,G=null){let V=this.compile(b,D,G);return new Promise(B=>{function ct(){if(V.forEach(function(_t){x.get(_t).currentProgram.isReady()&&V.delete(_t)}),V.size===0){B(b);return}setTimeout(ct,10)}Zt.get("KHR_parallel_shader_compile")!==null?ct():setTimeout(ct,10)})};let bh=null;function vm(b){bh&&bh(b)}function zd(){ms.stop()}function kd(){ms.start()}let ms=new Tp;ms.setAnimationLoop(vm),typeof self<"u"&&ms.setContext(self),this.setAnimationLoop=function(b){bh=b,rt.setAnimationLoop(b),b===null?ms.stop():ms.start()},rt.addEventListener("sessionstart",zd),rt.addEventListener("sessionend",kd),this.render=function(b,D){if(D!==void 0&&D.isCamera!==!0){Rt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;let G=rt.enabled===!0&&rt.isPresenting===!0,V=I!==null&&(O===null||G)&&I.begin(y,O);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),rt.enabled===!0&&rt.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(rt.cameraAutoUpdate===!0&&rt.updateCamera(D),D=rt.getCamera()),b.isScene===!0&&b.onBeforeRender(y,b,D,O),T=lt.get(b,A.length),T.init(D),A.push(T),Re.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Lt.setFromProjectionMatrix(Re,Xi,D.reversedDepth),Yt=this.localClippingEnabled,yt=St.init(this.clippingPlanes,Yt),v=tt.get(b,S.length),v.init(),S.push(v),rt.enabled===!0&&rt.isPresenting===!0){let _t=y.xr.getDepthSensingMesh();_t!==null&&wh(_t,D,-1/0,y.sortObjects)}wh(b,D,0,y.sortObjects),v.finish(),y.sortObjects===!0&&v.sort(ne,Jt),Ft=rt.enabled===!1||rt.isPresenting===!1||rt.hasDepthSensing()===!1,Ft&&ot.addToRenderList(v,b),this.info.render.frame++,yt===!0&&St.beginShadows();let B=T.state.shadowsArray;if(wt.render(B,b,D),yt===!0&&St.endShadows(),this.info.autoReset===!0&&this.info.reset(),(V&&I.hasRenderPass())===!1){let _t=v.opaque,dt=v.transmissive;if(T.setupLights(),D.isArrayCamera){let Mt=D.cameras;if(dt.length>0)for(let Tt=0,It=Mt.length;Tt<It;Tt++){let Et=Mt[Tt];Gd(_t,dt,b,Et)}Ft&&ot.render(b);for(let Tt=0,It=Mt.length;Tt<It;Tt++){let Et=Mt[Tt];Vd(v,b,Et,Et.viewport)}}else dt.length>0&&Gd(_t,dt,b,D),Ft&&ot.render(b),Vd(v,b,D)}O!==null&&F===0&&(L.updateMultisampleRenderTarget(O),L.updateRenderTargetMipmap(O)),V&&I.end(y),b.isScene===!0&&b.onAfterRender(y,b,D),mt.resetDefaultState(),z=-1,W=null,A.pop(),A.length>0?(T=A[A.length-1],yt===!0&&St.setGlobalState(y.clippingPlanes,T.state.camera)):T=null,S.pop(),S.length>0?v=S[S.length-1]:v=null};function wh(b,D,G,V){if(b.visible===!1)return;if(b.layers.test(D.layers)){if(b.isGroup)G=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(D);else if(b.isLight)T.pushLight(b),b.castShadow&&T.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Lt.intersectsSprite(b)){V&&jt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Re);let _t=Q.update(b),dt=b.material;dt.visible&&v.push(b,_t,dt,G,jt.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Lt.intersectsObject(b))){let _t=Q.update(b),dt=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),jt.copy(b.boundingSphere.center)):(_t.boundingSphere===null&&_t.computeBoundingSphere(),jt.copy(_t.boundingSphere.center)),jt.applyMatrix4(b.matrixWorld).applyMatrix4(Re)),Array.isArray(dt)){let Mt=_t.groups;for(let Tt=0,It=Mt.length;Tt<It;Tt++){let Et=Mt[Tt],Xt=dt[Et.materialIndex];Xt&&Xt.visible&&v.push(b,_t,Xt,G,jt.z,Et)}}else dt.visible&&v.push(b,_t,dt,G,jt.z,null)}}let ct=b.children;for(let _t=0,dt=ct.length;_t<dt;_t++)wh(ct[_t],D,G,V)}function Vd(b,D,G,V){let{opaque:B,transmissive:ct,transparent:_t}=b;T.setupLightsView(G),yt===!0&&St.setGlobalState(y.clippingPlanes,G),V&&xt.viewport(k.copy(V)),B.length>0&&fa(B,D,G),ct.length>0&&fa(ct,D,G),_t.length>0&&fa(_t,D,G),xt.buffers.depth.setTest(!0),xt.buffers.depth.setMask(!0),xt.buffers.color.setMask(!0),xt.setPolygonOffset(!1)}function Gd(b,D,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[V.id]===void 0){let Xt=Zt.has("EXT_color_buffer_half_float")||Zt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[V.id]=new Si(1,1,{generateMipmaps:!0,type:Xt?cn:gi,minFilter:ls,samples:se.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$t.workingColorSpace})}let ct=T.state.transmissionRenderTarget[V.id],_t=V.viewport||k;ct.setSize(_t.z*y.transmissionResolutionScale,_t.w*y.transmissionResolutionScale);let dt=y.getRenderTarget(),Mt=y.getActiveCubeFace(),Tt=y.getActiveMipmapLevel();y.setRenderTarget(ct),y.getClearColor(nt),et=y.getClearAlpha(),et<1&&y.setClearColor(16777215,.5),y.clear(),Ft&&ot.render(G);let It=y.toneMapping;y.toneMapping=Ji;let Et=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),T.setupLightsView(V),yt===!0&&St.setGlobalState(y.clippingPlanes,V),fa(b,G,V),L.updateMultisampleRenderTarget(ct),L.updateRenderTargetMipmap(ct),Zt.has("WEBGL_multisampled_render_to_texture")===!1){let Xt=!1;for(let pe=0,Pe=D.length;pe<Pe;pe++){let Ie=D[pe],{object:xe,geometry:At,material:de,group:re}=Ie;if(de.side===Ye&&xe.layers.test(V.layers)){let xi=de.side;de.side=ke,de.needsUpdate=!0,Hd(xe,G,V,At,de,re),de.side=xi,de.needsUpdate=!0,Xt=!0}}Xt===!0&&(L.updateMultisampleRenderTarget(ct),L.updateRenderTargetMipmap(ct))}y.setRenderTarget(dt,Mt,Tt),y.setClearColor(nt,et),Et!==void 0&&(V.viewport=Et),y.toneMapping=It}function fa(b,D,G){let V=D.isScene===!0?D.overrideMaterial:null;for(let B=0,ct=b.length;B<ct;B++){let _t=b[B],{object:dt,geometry:Mt,group:Tt}=_t,It=_t.material;It.allowOverride===!0&&V!==null&&(It=V),dt.layers.test(G.layers)&&Hd(dt,D,G,Mt,It,Tt)}}function Hd(b,D,G,V,B,ct){b.onBeforeRender(y,D,G,V,B,ct),b.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),B.onBeforeRender(y,D,G,V,b,ct),B.transparent===!0&&B.side===Ye&&B.forceSinglePass===!1?(B.side=ke,B.needsUpdate=!0,y.renderBufferDirect(G,D,V,B,b,ct),B.side=Ln,B.needsUpdate=!0,y.renderBufferDirect(G,D,V,B,b,ct),B.side=Ye):y.renderBufferDirect(G,D,V,B,b,ct),b.onAfterRender(y,D,G,V,B,ct)}function pa(b,D,G){D.isScene!==!0&&(D=le);let V=x.get(b),B=T.state.lights,ct=T.state.shadowsArray,_t=B.state.version,dt=bt.getParameters(b,B.state,ct,D,G),Mt=bt.getProgramCacheKey(dt),Tt=V.programs;V.environment=b.isMeshStandardMaterial?D.environment:null,V.fog=D.fog,V.envMap=(b.isMeshStandardMaterial?$:q).get(b.envMap||V.environment),V.envMapRotation=V.environment!==null&&b.envMap===null?D.environmentRotation:b.envMapRotation,Tt===void 0&&(b.addEventListener("dispose",nn),Tt=new Map,V.programs=Tt);let It=Tt.get(Mt);if(It!==void 0){if(V.currentProgram===It&&V.lightsStateVersion===_t)return Xd(b,dt),It}else dt.uniforms=bt.getUniforms(b),b.onBeforeCompile(dt,y),It=bt.acquireProgram(dt,Mt),Tt.set(Mt,It),V.uniforms=dt.uniforms;let Et=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Et.clippingPlanes=St.uniform),Xd(b,dt),V.needsLights=bm(b),V.lightsStateVersion=_t,V.needsLights&&(Et.ambientLightColor.value=B.state.ambient,Et.lightProbe.value=B.state.probe,Et.directionalLights.value=B.state.directional,Et.directionalLightShadows.value=B.state.directionalShadow,Et.spotLights.value=B.state.spot,Et.spotLightShadows.value=B.state.spotShadow,Et.rectAreaLights.value=B.state.rectArea,Et.ltc_1.value=B.state.rectAreaLTC1,Et.ltc_2.value=B.state.rectAreaLTC2,Et.pointLights.value=B.state.point,Et.pointLightShadows.value=B.state.pointShadow,Et.hemisphereLights.value=B.state.hemi,Et.directionalShadowMap.value=B.state.directionalShadowMap,Et.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Et.spotShadowMap.value=B.state.spotShadowMap,Et.spotLightMatrix.value=B.state.spotLightMatrix,Et.spotLightMap.value=B.state.spotLightMap,Et.pointShadowMap.value=B.state.pointShadowMap,Et.pointShadowMatrix.value=B.state.pointShadowMatrix),V.currentProgram=It,V.uniformsList=null,It}function Wd(b){if(b.uniformsList===null){let D=b.currentProgram.getUniforms();b.uniformsList=Ir.seqWithValue(D.seq,b.uniforms)}return b.uniformsList}function Xd(b,D){let G=x.get(b);G.outputColorSpace=D.outputColorSpace,G.batching=D.batching,G.batchingColor=D.batchingColor,G.instancing=D.instancing,G.instancingColor=D.instancingColor,G.instancingMorph=D.instancingMorph,G.skinning=D.skinning,G.morphTargets=D.morphTargets,G.morphNormals=D.morphNormals,G.morphColors=D.morphColors,G.morphTargetsCount=D.morphTargetsCount,G.numClippingPlanes=D.numClippingPlanes,G.numIntersection=D.numClipIntersection,G.vertexAlphas=D.vertexAlphas,G.vertexTangents=D.vertexTangents,G.toneMapping=D.toneMapping}function Mm(b,D,G,V,B){D.isScene!==!0&&(D=le),L.resetTextureUnits();let ct=D.fog,_t=V.isMeshStandardMaterial?D.environment:null,dt=O===null?y.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:ws,Mt=(V.isMeshStandardMaterial?$:q).get(V.envMap||_t),Tt=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,It=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Et=!!G.morphAttributes.position,Xt=!!G.morphAttributes.normal,pe=!!G.morphAttributes.color,Pe=Ji;V.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(Pe=y.toneMapping);let Ie=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,xe=Ie!==void 0?Ie.length:0,At=x.get(V),de=T.state.lights;if(yt===!0&&(Yt===!0||b!==W)){let ri=b===W&&V.id===z;St.setState(V,b,ri)}let re=!1;V.version===At.__version?(At.needsLights&&At.lightsStateVersion!==de.state.version||At.outputColorSpace!==dt||B.isBatchedMesh&&At.batching===!1||!B.isBatchedMesh&&At.batching===!0||B.isBatchedMesh&&At.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&At.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&At.instancing===!1||!B.isInstancedMesh&&At.instancing===!0||B.isSkinnedMesh&&At.skinning===!1||!B.isSkinnedMesh&&At.skinning===!0||B.isInstancedMesh&&At.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&At.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&At.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&At.instancingMorph===!1&&B.morphTexture!==null||At.envMap!==Mt||V.fog===!0&&At.fog!==ct||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==St.numPlanes||At.numIntersection!==St.numIntersection)||At.vertexAlphas!==Tt||At.vertexTangents!==It||At.morphTargets!==Et||At.morphNormals!==Xt||At.morphColors!==pe||At.toneMapping!==Pe||At.morphTargetsCount!==xe)&&(re=!0):(re=!0,At.__version=V.version);let xi=At.currentProgram;re===!0&&(xi=pa(V,D,B));let qs=!1,yi=!1,jr=!1,ve=xi.getUniforms(),fi=At.uniforms;if(xt.useProgram(xi.program)&&(qs=!0,yi=!0,jr=!0),V.id!==z&&(z=V.id,yi=!0),qs||W!==b){xt.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),ve.setValue(N,"projectionMatrix",b.projectionMatrix),ve.setValue(N,"viewMatrix",b.matrixWorldInverse);let pi=ve.map.cameraPosition;pi!==void 0&&pi.setValue(N,qt.setFromMatrixPosition(b.matrixWorld)),se.logarithmicDepthBuffer&&ve.setValue(N,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ve.setValue(N,"isOrthographic",b.isOrthographicCamera===!0),W!==b&&(W=b,yi=!0,jr=!0)}if(At.needsLights&&(de.state.directionalShadowMap.length>0&&ve.setValue(N,"directionalShadowMap",de.state.directionalShadowMap,L),de.state.spotShadowMap.length>0&&ve.setValue(N,"spotShadowMap",de.state.spotShadowMap,L),de.state.pointShadowMap.length>0&&ve.setValue(N,"pointShadowMap",de.state.pointShadowMap,L)),B.isSkinnedMesh){ve.setOptional(N,B,"bindMatrix"),ve.setOptional(N,B,"bindMatrixInverse");let ri=B.skeleton;ri&&(ri.boneTexture===null&&ri.computeBoneTexture(),ve.setValue(N,"boneTexture",ri.boneTexture,L))}B.isBatchedMesh&&(ve.setOptional(N,B,"batchingTexture"),ve.setValue(N,"batchingTexture",B._matricesTexture,L),ve.setOptional(N,B,"batchingIdTexture"),ve.setValue(N,"batchingIdTexture",B._indirectTexture,L),ve.setOptional(N,B,"batchingColorTexture"),B._colorsTexture!==null&&ve.setValue(N,"batchingColorTexture",B._colorsTexture,L));let Ii=G.morphAttributes;if((Ii.position!==void 0||Ii.normal!==void 0||Ii.color!==void 0)&&Gt.update(B,G,xi),(yi||At.receiveShadow!==B.receiveShadow)&&(At.receiveShadow=B.receiveShadow,ve.setValue(N,"receiveShadow",B.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(fi.envMap.value=Mt,fi.flipEnvMap.value=Mt.isCubeTexture&&Mt.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&D.environment!==null&&(fi.envMapIntensity.value=D.environmentIntensity),fi.dfgLUT!==void 0&&(fi.dfgLUT.value=Lx()),yi&&(ve.setValue(N,"toneMappingExposure",y.toneMappingExposure),At.needsLights&&Sm(fi,jr),ct&&V.fog===!0&&Nt.refreshFogUniforms(fi,ct),Nt.refreshMaterialUniforms(fi,V,Pt,Ut,T.state.transmissionRenderTarget[b.id]),Ir.upload(N,Wd(At),fi,L)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Ir.upload(N,Wd(At),fi,L),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ve.setValue(N,"center",B.center),ve.setValue(N,"modelViewMatrix",B.modelViewMatrix),ve.setValue(N,"normalMatrix",B.normalMatrix),ve.setValue(N,"modelMatrix",B.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){let ri=V.uniformsGroups;for(let pi=0,Th=ri.length;pi<Th;pi++){let gs=ri[pi];j.update(gs,xi),j.bind(gs,xi)}}return xi}function Sm(b,D){b.ambientLightColor.needsUpdate=D,b.lightProbe.needsUpdate=D,b.directionalLights.needsUpdate=D,b.directionalLightShadows.needsUpdate=D,b.pointLights.needsUpdate=D,b.pointLightShadows.needsUpdate=D,b.spotLights.needsUpdate=D,b.spotLightShadows.needsUpdate=D,b.rectAreaLights.needsUpdate=D,b.hemisphereLights.needsUpdate=D}function bm(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(b,D,G){let V=x.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),x.get(b.texture).__webglTexture=D,x.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:G,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,D){let G=x.get(b);G.__webglFramebuffer=D,G.__useDefaultFramebuffer=D===void 0};let wm=N.createFramebuffer();this.setRenderTarget=function(b,D=0,G=0){O=b,R=D,F=G;let V=null,B=!1,ct=!1;if(b){let dt=x.get(b);if(dt.__useDefaultFramebuffer!==void 0){xt.bindFramebuffer(N.FRAMEBUFFER,dt.__webglFramebuffer),k.copy(b.viewport),H.copy(b.scissor),Z=b.scissorTest,xt.viewport(k),xt.scissor(H),xt.setScissorTest(Z),z=-1;return}else if(dt.__webglFramebuffer===void 0)L.setupRenderTarget(b);else if(dt.__hasExternalTextures)L.rebindTextures(b,x.get(b.texture).__webglTexture,x.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let It=b.depthTexture;if(dt.__boundDepthTexture!==It){if(It!==null&&x.has(It)&&(b.width!==It.image.width||b.height!==It.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");L.setupDepthRenderbuffer(b)}}let Mt=b.texture;(Mt.isData3DTexture||Mt.isDataArrayTexture||Mt.isCompressedArrayTexture)&&(ct=!0);let Tt=x.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Tt[D])?V=Tt[D][G]:V=Tt[D],B=!0):b.samples>0&&L.useMultisampledRTT(b)===!1?V=x.get(b).__webglMultisampledFramebuffer:Array.isArray(Tt)?V=Tt[G]:V=Tt,k.copy(b.viewport),H.copy(b.scissor),Z=b.scissorTest}else k.copy(Y).multiplyScalar(Pt).floor(),H.copy(J).multiplyScalar(Pt).floor(),Z=gt;if(G!==0&&(V=wm),xt.bindFramebuffer(N.FRAMEBUFFER,V)&&xt.drawBuffers(b,V),xt.viewport(k),xt.scissor(H),xt.setScissorTest(Z),B){let dt=x.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+D,dt.__webglTexture,G)}else if(ct){let dt=D;for(let Mt=0;Mt<b.textures.length;Mt++){let Tt=x.get(b.textures[Mt]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+Mt,Tt.__webglTexture,G,dt)}}else if(b!==null&&G!==0){let dt=x.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,dt.__webglTexture,G)}z=-1},this.readRenderTargetPixels=function(b,D,G,V,B,ct,_t,dt=0){if(!(b&&b.isWebGLRenderTarget)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Mt=x.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_t!==void 0&&(Mt=Mt[_t]),Mt){xt.bindFramebuffer(N.FRAMEBUFFER,Mt);try{let Tt=b.textures[dt],It=Tt.format,Et=Tt.type;if(!se.textureFormatReadable(It)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!se.textureTypeReadable(Et)){Rt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=b.width-V&&G>=0&&G<=b.height-B&&(b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+dt),N.readPixels(D,G,V,B,it.convert(It),it.convert(Et),ct))}finally{let Tt=O!==null?x.get(O).__webglFramebuffer:null;xt.bindFramebuffer(N.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(b,D,G,V,B,ct,_t,dt=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Mt=x.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&_t!==void 0&&(Mt=Mt[_t]),Mt)if(D>=0&&D<=b.width-V&&G>=0&&G<=b.height-B){xt.bindFramebuffer(N.FRAMEBUFFER,Mt);let Tt=b.textures[dt],It=Tt.format,Et=Tt.type;if(!se.textureFormatReadable(It))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!se.textureTypeReadable(Et))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Xt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Xt),N.bufferData(N.PIXEL_PACK_BUFFER,ct.byteLength,N.STREAM_READ),b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+dt),N.readPixels(D,G,V,B,it.convert(It),it.convert(Et),0);let pe=O!==null?x.get(O).__webglFramebuffer:null;xt.bindFramebuffer(N.FRAMEBUFFER,pe);let Pe=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await Qf(N,Pe,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Xt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ct),N.deleteBuffer(Xt),N.deleteSync(Pe),ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,D=null,G=0){let V=Math.pow(2,-G),B=Math.floor(b.image.width*V),ct=Math.floor(b.image.height*V),_t=D!==null?D.x:0,dt=D!==null?D.y:0;L.setTexture2D(b,0),N.copyTexSubImage2D(N.TEXTURE_2D,G,0,0,_t,dt,B,ct),xt.unbindTexture()};let Tm=N.createFramebuffer(),Em=N.createFramebuffer();this.copyTextureToTexture=function(b,D,G=null,V=null,B=0,ct=null){ct===null&&(B!==0?(dr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ct=B,B=0):ct=0);let _t,dt,Mt,Tt,It,Et,Xt,pe,Pe,Ie=b.isCompressedTexture?b.mipmaps[ct]:b.image;if(G!==null)_t=G.max.x-G.min.x,dt=G.max.y-G.min.y,Mt=G.isBox3?G.max.z-G.min.z:1,Tt=G.min.x,It=G.min.y,Et=G.isBox3?G.min.z:0;else{let Ii=Math.pow(2,-B);_t=Math.floor(Ie.width*Ii),dt=Math.floor(Ie.height*Ii),b.isDataArrayTexture?Mt=Ie.depth:b.isData3DTexture?Mt=Math.floor(Ie.depth*Ii):Mt=1,Tt=0,It=0,Et=0}V!==null?(Xt=V.x,pe=V.y,Pe=V.z):(Xt=0,pe=0,Pe=0);let xe=it.convert(D.format),At=it.convert(D.type),de;D.isData3DTexture?(L.setTexture3D(D,0),de=N.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(L.setTexture2DArray(D,0),de=N.TEXTURE_2D_ARRAY):(L.setTexture2D(D,0),de=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,D.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,D.unpackAlignment);let re=N.getParameter(N.UNPACK_ROW_LENGTH),xi=N.getParameter(N.UNPACK_IMAGE_HEIGHT),qs=N.getParameter(N.UNPACK_SKIP_PIXELS),yi=N.getParameter(N.UNPACK_SKIP_ROWS),jr=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,Ie.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ie.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Tt),N.pixelStorei(N.UNPACK_SKIP_ROWS,It),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Et);let ve=b.isDataArrayTexture||b.isData3DTexture,fi=D.isDataArrayTexture||D.isData3DTexture;if(b.isDepthTexture){let Ii=x.get(b),ri=x.get(D),pi=x.get(Ii.__renderTarget),Th=x.get(ri.__renderTarget);xt.bindFramebuffer(N.READ_FRAMEBUFFER,pi.__webglFramebuffer),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,Th.__webglFramebuffer);for(let gs=0;gs<Mt;gs++)ve&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,x.get(b).__webglTexture,B,Et+gs),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,x.get(D).__webglTexture,ct,Pe+gs)),N.blitFramebuffer(Tt,It,_t,dt,Xt,pe,_t,dt,N.DEPTH_BUFFER_BIT,N.NEAREST);xt.bindFramebuffer(N.READ_FRAMEBUFFER,null),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(B!==0||b.isRenderTargetTexture||x.has(b)){let Ii=x.get(b),ri=x.get(D);xt.bindFramebuffer(N.READ_FRAMEBUFFER,Tm),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,Em);for(let pi=0;pi<Mt;pi++)ve?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ii.__webglTexture,B,Et+pi):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ii.__webglTexture,B),fi?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,ri.__webglTexture,ct,Pe+pi):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,ri.__webglTexture,ct),B!==0?N.blitFramebuffer(Tt,It,_t,dt,Xt,pe,_t,dt,N.COLOR_BUFFER_BIT,N.NEAREST):fi?N.copyTexSubImage3D(de,ct,Xt,pe,Pe+pi,Tt,It,_t,dt):N.copyTexSubImage2D(de,ct,Xt,pe,Tt,It,_t,dt);xt.bindFramebuffer(N.READ_FRAMEBUFFER,null),xt.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else fi?b.isDataTexture||b.isData3DTexture?N.texSubImage3D(de,ct,Xt,pe,Pe,_t,dt,Mt,xe,At,Ie.data):D.isCompressedArrayTexture?N.compressedTexSubImage3D(de,ct,Xt,pe,Pe,_t,dt,Mt,xe,Ie.data):N.texSubImage3D(de,ct,Xt,pe,Pe,_t,dt,Mt,xe,At,Ie):b.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,ct,Xt,pe,_t,dt,xe,At,Ie.data):b.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,ct,Xt,pe,Ie.width,Ie.height,xe,Ie.data):N.texSubImage2D(N.TEXTURE_2D,ct,Xt,pe,_t,dt,xe,At,Ie);N.pixelStorei(N.UNPACK_ROW_LENGTH,re),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,xi),N.pixelStorei(N.UNPACK_SKIP_PIXELS,qs),N.pixelStorei(N.UNPACK_SKIP_ROWS,yi),N.pixelStorei(N.UNPACK_SKIP_IMAGES,jr),ct===0&&D.generateMipmaps&&N.generateMipmap(de),xt.unbindTexture()},this.initRenderTarget=function(b){x.get(b).__webglFramebuffer===void 0&&L.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?L.setTextureCube(b,0):b.isData3DTexture?L.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?L.setTexture2DArray(b,0):L.setTexture2D(b,0),xt.unbindTexture()},this.resetState=function(){R=0,F=0,O=null,xt.reset(),mt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=$t._getDrawingBufferColorSpace(t),e.unpackColorSpace=$t._getUnpackColorSpace()}};var Pp={type:"change"},Ku={type:"start"},Np={type:"end"},Tc=new jn,Ip=new Ui,Ox=Math.cos(70*Ru.DEG2RAD),He=new P,_i=2*Math.PI,ge={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},$u=1e-6,Ec=class extends Oo{constructor(t,e=null){super(t,e),this.state=ge.NONE,this.target=new P,this.cursor=new P,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:rs.ROTATE,MIDDLE:rs.DOLLY,RIGHT:rs.PAN},this.touches={ONE:os.ROTATE,TWO:os.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new P,this._lastQuaternion=new mi,this._lastTargetPosition=new P,this._quat=new mi().setFromUnitVectors(t.up,new P(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Er,this._sphericalDelta=new Er,this._scale=1,this._panOffset=new P,this._rotateStart=new at,this._rotateEnd=new at,this._rotateDelta=new at,this._panStart=new at,this._panEnd=new at,this._panDelta=new at,this._dollyStart=new at,this._dollyEnd=new at,this._dollyDelta=new at,this._dollyDirection=new P,this._mouse=new at,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Bx.bind(this),this._onPointerDown=Fx.bind(this),this._onPointerUp=zx.bind(this),this._onContextMenu=qx.bind(this),this._onMouseWheel=Gx.bind(this),this._onKeyDown=Hx.bind(this),this._onTouchStart=Wx.bind(this),this._onTouchMove=Xx.bind(this),this._onMouseDown=kx.bind(this),this._onMouseMove=Vx.bind(this),this._interceptControlDown=Yx.bind(this),this._interceptControlUp=Jx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Pp),this.update(),this.state=ge.NONE}update(t=null){let e=this.object.position;He.copy(e).sub(this.target),He.applyQuaternion(this._quat),this._spherical.setFromVector3(He),this.autoRotate&&this.state===ge.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=_i:i>Math.PI&&(i-=_i),s<-Math.PI?s+=_i:s>Math.PI&&(s-=_i),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(He.setFromSpherical(this._spherical),He.applyQuaternion(this._quatInverse),e.copy(this.target).add(He),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=He.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new P(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new P(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=He.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Tc.origin.copy(this.object.position),Tc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Tc.direction))<Ox?this.object.lookAt(this.target):(Ip.setFromNormalAndCoplanarPoint(this.object.up,this.target),Tc.intersectPlane(Ip,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>$u||8*(1-this._lastQuaternion.dot(this.object.quaternion))>$u||this._lastTargetPosition.distanceToSquared(this.target)>$u?(this.dispatchEvent(Pp),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?_i/60*this.autoRotateSpeed*t:_i/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){He.setFromMatrixColumn(e,0),He.multiplyScalar(-t),this._panOffset.add(He)}_panUp(t,e){this.screenSpacePanning===!0?He.setFromMatrixColumn(e,1):(He.setFromMatrixColumn(e,0),He.crossVectors(this.object.up,He)),He.multiplyScalar(t),this._panOffset.add(He)}_pan(t,e){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;He.copy(s).sub(this.target);let r=He.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/i.clientHeight,this.object.matrix),this._panUp(2*e*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=t-i.left,r=e-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(_i*this._rotateDelta.x/e.clientHeight),this._rotateUp(_i*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(_i*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-_i*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(_i*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-_i*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),r=.5*(t.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(_i*this._rotateDelta.x/e.clientHeight),this._rotateUp(_i*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new at,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function Fx(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function Bx(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function zx(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Np),this.state=ge.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function kx(n){let t;switch(n.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case rs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=ge.DOLLY;break;case rs.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ge.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ge.ROTATE}break;case rs.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ge.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ge.PAN}break;default:this.state=ge.NONE}this.state!==ge.NONE&&this.dispatchEvent(Ku)}function Vx(n){switch(this.state){case ge.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case ge.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case ge.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function Gx(n){this.enabled===!1||this.enableZoom===!1||this.state!==ge.NONE||(n.preventDefault(),this.dispatchEvent(Ku),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(Np))}function Hx(n){this.enabled!==!1&&this._handleKeyDown(n)}function Wx(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case os.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=ge.TOUCH_ROTATE;break;case os.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=ge.TOUCH_PAN;break;default:this.state=ge.NONE}break;case 2:switch(this.touches.TWO){case os.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=ge.TOUCH_DOLLY_PAN;break;case os.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=ge.TOUCH_DOLLY_ROTATE;break;default:this.state=ge.NONE}break;default:this.state=ge.NONE}this.state!==ge.NONE&&this.dispatchEvent(Ku)}function Xx(n){switch(this._trackPointer(n),this.state){case ge.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case ge.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case ge.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case ge.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=ge.NONE}}function qx(n){this.enabled!==!1&&n.preventDefault()}function Yx(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Jx(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Lp(n,t=!1){let e=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new me,c=0;for(let h=0;h<n.length;++h){let u=n[h],f=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in u.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in u.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(u.morphAttributes[d])}if(t){let d;if(e)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(e){let h=0,u=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let m=0;m<d.count;++m)u.push(d.getX(m)+h);h+=n[f].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Up(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){let d=[];for(let _=0;_<o[h].length;++_)d.push(o[h][_][f]);let m=Up(d);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}return l}function Up(n){let t,e,i,s=-1,r=0;for(let c=0;c<n.length;++c){let h=n[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let o=new t(r),a=new Se(o,e,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let f=0,d=h.count;f<d;f++)for(let m=0;m<e;m++){let _=h.getComponent(f,m);a.setComponent(f+u,m,_)}}else o.set(h.array,l);l+=h.count*e}return s!==void 0&&(a.gpuType=s),a}var ni=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Dp=1234567,Vp=Math.PI/180,Gp=180/Math.PI;function Zx(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(ni[n&255]+ni[n>>8&255]+ni[n>>16&255]+ni[n>>24&255]+"-"+ni[t&255]+ni[t>>8&255]+"-"+ni[t>>16&15|64]+ni[t>>24&255]+"-"+ni[e&63|128]+ni[e>>8&255]+"-"+ni[e>>16&255]+ni[e>>24&255]+ni[i&255]+ni[i>>8&255]+ni[i>>16&255]+ni[i>>24&255]).toLowerCase()}function pn(n,t,e){return Math.max(t,Math.min(e,n))}function Hp(n,t){return(n%t+t)%t}function $x(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function Kx(n,t,e){return n!==t?(e-n)/(t-n):0}function Wp(n,t,e){return(1-e)*n+e*t}function Qx(n,t,e,i){return Wp(n,t,1-Math.exp(-e*i))}function jx(n,t=1){return t-Math.abs(Hp(n,t*2)-t)}function ty(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function ey(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function iy(n,t){return n+Math.floor(Math.random()*(t-n+1))}function ny(n,t){return n+Math.random()*(t-n)}function sy(n){return n*(.5-Math.random())}function ry(n){n!==void 0&&(Dp=n);let t=Dp+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function oy(n){return n*Vp}function ay(n){return n*Gp}function ly(n){return(n&n-1)===0&&n!==0}function cy(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function hy(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function uy(n,t,e,i,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+i)/2),h=o((t+i)/2),u=r((t-i)/2),f=o((t-i)/2),d=r((i-t)/2),m=o((i-t)/2);switch(s){case"XYX":n.set(a*h,l*u,l*f,a*c);break;case"YZY":n.set(l*f,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*f,a*h,a*c);break;case"XZX":n.set(a*h,l*m,l*d,a*c);break;case"YXY":n.set(l*d,a*h,l*m,a*c);break;case"ZYZ":n.set(l*m,l*d,a*h,a*c);break;default:console.warn("../math.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function dy(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function fy(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Vr={DEG2RAD:Vp,RAD2DEG:Gp,generateUUID:Zx,clamp:pn,euclideanModulo:Hp,mapLinear:$x,inverseLerp:Kx,lerp:Wp,damp:Qx,pingpong:jx,smoothstep:ty,smootherstep:ey,randInt:iy,randFloat:ny,randFloatSpread:sy,seededRandom:ry,degToRad:oy,radToDeg:ay,isPowerOfTwo:ly,ceilPowerOfTwo:cy,floorPowerOfTwo:hy,setQuaternionFromProperEuler:uy,normalize:fy,denormalize:dy},oe=class n{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],f=r[o+0],d=r[o+1],m=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=f,t[e+1]=d,t[e+2]=m,t[e+3]=_;return}if(u!==_||l!==f||c!==d||h!==m){let g=1-a,p=l*f+c*d+h*m+u*_,w=p>=0?1:-1,M=1-p*p;if(M>Number.EPSILON){let T=Math.sqrt(M),S=Math.atan2(T,p*w);g=Math.sin(g*S)/T,a=Math.sin(a*S)/T}let v=a*w;if(l=l*g+f*v,c=c*g+d*v,h=h*g+m*v,u=u*g+_*v,g===1-a){let T=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=T,c*=T,h*=T,u*=T}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],f=r[o+1],d=r[o+2],m=r[o+3];return t[e]=a*m+h*u+l*d-c*f,t[e+1]=l*m+h*f+c*u-a*d,t[e+2]=c*m+h*d+a*f-l*u,t[e+3]=h*m-a*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new n(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),f=l(i/2),d=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"YXZ":this._x=f*h*u+c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"ZXY":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u-f*d*m;break;case"ZYX":this._x=f*h*u-c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u+f*d*m;break;case"YZX":this._x=f*h*u+c*d*m,this._y=c*d*u+f*h*m,this._z=c*h*m-f*d*u,this._w=c*h*u-f*d*m;break;case"XZY":this._x=f*h*u-c*d*m,this._y=c*d*u-f*h*m,this._z=c*h*m+f*d*u,this._w=c*h*u+f*d*m;break;default:console.warn("../math.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=i+a+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(i>a&&i>u){let d=2*Math.sqrt(1+i-a-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>u){let d=2*Math.sqrt(1+a-i-u);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+u-i-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pn(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+i*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-e;return this._w=d*o+e*this._w,this._x=d*i+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=o*u+this._w*f,this._x=i*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},ut=class n{constructor(t=0,e=0,i=0){this.isVector3=!0,n.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Op.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Op.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*i),h=2*(a*e-r*s),u=2*(r*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Qu.copy(this).projectOnVector(t),this.sub(Qu)}reflect(t){return this.sub(Qu.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}abs(){return this.x=Math.abs(this.x),this.y=Math.abs(this.y),this.z=Math.abs(this.z),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Qu=new ut,Op=new oe,Ac=2e3,Fp=2001,mn=class n{constructor(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g){this.isMatrix4=!0,n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g)}extractPosition(t){return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."),this.copyPosition(t)}multiplyToArray(t,e,i){return console.error("THREE.Matrix4: .multiplyToArray() has been removed."),this}setRotationFromQuaternion(t){return this.makeRotationFromQuaternion(t)}set(t,e,i,s,r,o,a,l,c,h,u,f,d,m,_,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=m,p[11]=_,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,i=t.elements,s=1/Ur.setFromMatrixColumn(t,0).length(),r=1/Ur.setFromMatrixColumn(t,1).length(),o=1/Ur.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let f=o*h,d=o*u,m=a*h,_=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+m*c,e[5]=f-_*c,e[9]=-a*l,e[2]=_-f*c,e[6]=m+d*c,e[10]=o*l}else if(t.order==="YXZ"){let f=l*h,d=l*u,m=c*h,_=c*u;e[0]=f+_*a,e[4]=m*a-d,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=d*a-m,e[6]=_+f*a,e[10]=o*l}else if(t.order==="ZXY"){let f=l*h,d=l*u,m=c*h,_=c*u;e[0]=f-_*a,e[4]=-o*u,e[8]=m+d*a,e[1]=d+m*a,e[5]=o*h,e[9]=_-f*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let f=o*h,d=o*u,m=a*h,_=a*u;e[0]=l*h,e[4]=m*c-d,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=d*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let f=o*l,d=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=_-f*u,e[8]=m*u+d,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=d*u+m,e[10]=f-_*u}else if(t.order==="XZY"){let f=o*l,d=o*c,m=a*l,_=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=o*h,e[9]=d*u-m,e[2]=m*u-d,e[6]=a*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(py,t,my)}lookAt(t,e,i){let s=this.elements;return Ti.subVectors(t,e),Ti.lengthSq()===0&&(Ti.z=1),Ti.normalize(),us.crossVectors(i,Ti),us.lengthSq()===0&&(Math.abs(i.z)===1?Ti.x+=1e-4:Ti.z+=1e-4,Ti.normalize(),us.crossVectors(i,Ti)),us.normalize(),Cc.crossVectors(Ti,us),s[0]=us.x,s[4]=Cc.x,s[8]=Ti.x,s[1]=us.y,s[5]=Cc.y,s[9]=Ti.y,s[2]=us.z,s[6]=Cc.z,s[10]=Ti.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],f=i[9],d=i[13],m=i[2],_=i[6],g=i[10],p=i[14],w=i[3],M=i[7],v=i[11],T=i[15],S=s[0],A=s[4],I=s[8],y=s[12],E=s[1],R=s[5],F=s[9],O=s[13],z=s[2],W=s[6],k=s[10],H=s[14],Z=s[3],nt=s[7],et=s[11],st=s[15];return r[0]=o*S+a*E+l*z+c*Z,r[4]=o*A+a*R+l*W+c*nt,r[8]=o*I+a*F+l*k+c*et,r[12]=o*y+a*O+l*H+c*st,r[1]=h*S+u*E+f*z+d*Z,r[5]=h*A+u*R+f*W+d*nt,r[9]=h*I+u*F+f*k+d*et,r[13]=h*y+u*O+f*H+d*st,r[2]=m*S+_*E+g*z+p*Z,r[6]=m*A+_*R+g*W+p*nt,r[10]=m*I+_*F+g*k+p*et,r[14]=m*y+_*O+g*H+p*st,r[3]=w*S+M*E+v*z+T*Z,r[7]=w*A+M*R+v*W+T*nt,r[11]=w*I+M*F+v*k+T*et,r[15]=w*y+M*O+v*H+T*st,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],m=t[3],_=t[7],g=t[11],p=t[15];return m*(+r*l*u-s*c*u-r*a*f+i*c*f+s*a*d-i*l*d)+_*(+e*l*d-e*c*f+r*o*f-s*o*d+s*c*h-r*l*h)+g*(+e*c*u-e*a*d-r*o*u+i*o*d+r*a*h-i*c*h)+p*(-s*a*h-e*l*u+e*a*f+s*o*u-i*o*f+i*l*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],m=t[12],_=t[13],g=t[14],p=t[15],w=u*g*c-_*f*c+_*l*d-a*g*d-u*l*p+a*f*p,M=m*f*c-h*g*c-m*l*d+o*g*d+h*l*p-o*f*p,v=h*_*c-m*u*c+m*a*d-o*_*d-h*a*p+o*u*p,T=m*u*l-h*_*l-m*a*f+o*_*f+h*a*g-o*u*g,S=e*w+i*M+s*v+r*T;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/S;return t[0]=w*A,t[1]=(_*f*r-u*g*r-_*s*d+i*g*d+u*s*p-i*f*p)*A,t[2]=(a*g*r-_*l*r+_*s*c-i*g*c-a*s*p+i*l*p)*A,t[3]=(u*l*r-a*f*r-u*s*c+i*f*c+a*s*d-i*l*d)*A,t[4]=M*A,t[5]=(h*g*r-m*f*r+m*s*d-e*g*d-h*s*p+e*f*p)*A,t[6]=(m*l*r-o*g*r-m*s*c+e*g*c+o*s*p-e*l*p)*A,t[7]=(o*f*r-h*l*r+h*s*c-e*f*c-o*s*d+e*l*d)*A,t[8]=v*A,t[9]=(m*u*r-h*_*r-m*i*d+e*_*d+h*i*p-e*u*p)*A,t[10]=(o*_*r-m*a*r+m*i*c-e*_*c-o*i*p+e*a*p)*A,t[11]=(h*a*r-o*u*r-h*i*c+e*u*c+o*i*d-e*a*d)*A,t[12]=T*A,t[13]=(h*_*s-m*u*s+m*i*f-e*_*f-h*i*g+e*u*g)*A,t[14]=(m*a*s-o*_*s-m*i*l+e*_*l+o*i*g-e*a*g)*A,t[15]=(o*u*s-h*a*s+h*i*l-e*u*l-o*i*f+e*a*f)*A,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,o){return this.set(1,i,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,f=r*c,d=r*h,m=r*u,_=o*h,g=o*u,p=a*u,w=l*c,M=l*h,v=l*u,T=i.x,S=i.y,A=i.z;return s[0]=(1-(_+p))*T,s[1]=(d+v)*T,s[2]=(m-M)*T,s[3]=0,s[4]=(d-v)*S,s[5]=(1-(f+p))*S,s[6]=(g+w)*S,s[7]=0,s[8]=(m+M)*A,s[9]=(g-w)*A,s[10]=(1-(f+_))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements,r=Ur.set(s[0],s[1],s[2]).length(),o=Ur.set(s[4],s[5],s[6]).length(),a=Ur.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Ki.copy(this);let c=1/r,h=1/o,u=1/a;return Ki.elements[0]*=c,Ki.elements[1]*=c,Ki.elements[2]*=c,Ki.elements[4]*=h,Ki.elements[5]*=h,Ki.elements[6]*=h,Ki.elements[8]*=u,Ki.elements[9]*=u,Ki.elements[10]*=u,e.setFromRotationMatrix(Ki),i.x=r,i.y=o,i.z=a,this}makePerspective(t,e,i,s,r,o,a=Ac){let l=this.elements,c=2*r/(e-t),h=2*r/(i-s),u=(e+t)/(e-t),f=(i+s)/(i-s),d,m;if(a===Ac)d=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===Fp)d=-o/(o-r),m=-o*r/(o-r);else throw new Error("Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=m,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,s,r,o,a=Ac){let l=this.elements,c=1/(e-t),h=1/(i-s),u=1/(o-r),f=(e+t)*c,d=(i+s)*h,m,_;if(a===Ac)m=(o+r)*u,_=-2*u;else if(a===Fp)m=r*u,_=-1*u;else throw new Error("../math.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-m,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},Ur=new ut,Ki=new mn,py=new ut(0,0,0),my=new ut(1,1,1),us=new ut,Cc=new ut,Ti=new ut,Bp=new mn,zp=new oe,Ic=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new n(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(pn(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-pn(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(pn(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-pn(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(pn(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-pn(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("../math.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Bp.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Bp,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return zp.setFromEuler(this),this.setFromQuaternion(zp,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(t){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ic.DEFAULT_ORDER="XYZ";var zn=class n{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*s+t.x,this.y=r*s+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};zn.isVector2=!0;var _e=class n{constructor(t=0,e=0,i=0,s=1){n.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],m=l[9],_=l[2],g=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(m+g)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(c+1)/2,v=(d+1)/2,T=(p+1)/2,S=(h+f)/4,A=(u+_)/4,I=(m+g)/4;return M>v&&M>T?M<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(M),s=S/i,r=A/i):v>T?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=S/s,r=I/s):T<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),i=A/r,s=I/r),this.set(i,s,r,e),this}let w=Math.sqrt((g-m)*(g-m)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(w)<.001&&(w=1),this.x=(g-m)/w,this.y=(u-_)/w,this.z=(f-h)/w,this.w=Math.acos((c+d+p-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},gn=class n{constructor(t,e,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,a,l,c)}set(t,e,i,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],f=i[2],d=i[5],m=i[8],_=s[0],g=s[3],p=s[6],w=s[1],M=s[4],v=s[7],T=s[2],S=s[5],A=s[8];return r[0]=o*_+a*w+l*T,r[3]=o*g+a*M+l*S,r[6]=o*p+a*v+l*A,r[1]=c*_+h*w+u*T,r[4]=c*g+h*M+u*S,r[7]=c*p+h*v+u*A,r[2]=f*_+d*w+m*T,r[5]=f*g+d*M+m*S,r[8]=f*p+d*v+m*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,f=a*l-h*r,d=c*r-o*l,m=e*u+i*f+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/m;return t[0]=u*_,t[1]=(s*c-h*i)*_,t[2]=(a*i-s*o)*_,t[3]=f*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=d*_,t[7]=(i*l-c*e)*_,t[8]=(o*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(ju.makeScale(t,e)),this}rotate(t){return this.premultiply(ju.makeRotation(-t)),this}translate(t,e){return this.premultiply(ju.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new n().fromArray(this.elements)}},ju=new gn,si;(function(n){n[n.Random=0]="Random",n[n.Loop=1]="Loop",n[n.PingPong=2]="PingPong",n[n.Burst=3]="Burst"})(si||(si={}));function Gr(n,t,e,i){let s;switch(si.Random===n?t=Math.random():si.Burst===n&&i.isBursting&&(t=i.burstParticleIndex/i.burstParticleCount),e>0?s=Math.floor(t/e)*e:s=t,n){case si.Loop:s=s%1;break;case si.PingPong:s=Math.abs(s%2-1);break}return s}var ks=class n{constructor(t,e,i,s){this.p=[t,e,i,s]}genValue(t){let e=t*t,i=t*t*t,s=1-t,r=s*s,o=r*s;return this.p[0]*o+this.p[1]*r*t*3+this.p[2]*s*e*3+this.p[3]*i}derivativeCoefficients(t){let e=[];for(let i=t,s=i.length-1;s>0;s--){let r=[];for(let o=0;o<s;o++){let a=s*(i[o+1]-i[o]);r.push(a)}e.push(r),i=r}return e}getSlope(t){let e=this.derivativeCoefficients(this.p)[0],i=1-t,s=i*i,r=i*t*2,o=t*t;return s*e[0]+r*e[1]+o*e[2]}controlCurve(t,e){this.p[1]=t/3+this.p[0],this.p[2]=this.p[3]-e/3}hull(t){let e=this.p,i=[],s,r=0,o=0,a=0,l=[];for(l[r++]=e[0],l[r++]=e[1],l[r++]=e[2],l[r++]=e[3];e.length>1;){for(i=[],o=0,a=e.length-1;o<a;o++)s=t*e[o]+(1-t)*e[o+1],l[r++]=s,i.push(s);e=i}return l}split(t){let e=this.hull(t);return{left:new n(e[0],e[4],e[7],e[9]),right:new n(e[9],e[8],e[6],e[3]),span:e}}clone(){return new n(this.p[0],this.p[1],this.p[2],this.p[3])}toJSON(){return{p0:this.p[0],p1:this.p[1],p2:this.p[2],p3:this.p[3]}}static fromJSON(t){return new n(t.p0,t.p1,t.p2,t.p3)}},$o=n=>({r:n.x,g:n.y,b:n.z,a:n.w}),Ko=n=>new _e(n.r,n.g,n.b,n.a),gy=(n,t)=>{switch(t){case"Vector3":return new ut(n.x,n.y,n.z);case"Vector4":return new _e(n.x,n.y,n.z,n.w);case"Color":return new ut(n.r,n.g,n.b);case"Number":return n;default:return n}},_y=(n,t)=>{switch(t){case"Vector3":return{x:n.x,y:n.y,z:n.z};case"Vector4":return{x:n.x,y:n.y,z:n.z,w:n.w};case"Color":return{r:n.x,g:n.y,b:n.z};case"Number":return n;default:return n}},nd=class n{constructor(t,e){this.a=t,this.b=e,this.type="value"}startGen(t){}genColor(t,e){let i=Math.random();return e.copy(this.a).lerp(this.b,i)}toJSON(){return{type:"RandomColor",a:$o(this.a),b:$o(this.b)}}static fromJSON(t){return new n(Ko(t.a),Ko(t.b))}clone(){return new n(this.a.clone(),this.b.clone())}},Ei=class n{constructor(t,e){this.a=t,this.b=e,this.indexCount=-1,this.type="value"}startGen(t){this.indexCount=t.length,t.push(Math.random())}genColor(t,e){return this.indexCount===-1&&this.startGen(t),e.copy(this.a).lerp(this.b,t[this.indexCount])}toJSON(){return{type:"ColorRange",a:$o(this.a),b:$o(this.b)}}static fromJSON(t){return new n(Ko(t.a),Ko(t.b))}clone(){return new n(this.a.clone(),this.b.clone())}},Lr=class n{constructor(t,e){this.subType=e,this.type="function",this.keys=t}findKey(t){let e=0,i=0,s=this.keys.length-1;for(;i+1<s;)if(e=Math.floor((i+s)/2),t<this.getStartX(e))s=e-1;else if(t>this.getEndX(e))i=e+1;else return e;for(let r=i;r<=s;r++)if(t>=this.getStartX(r)&&t<=this.getEndX(r))return r;return-1}getStartX(t){return this.keys[t][1]}getEndX(t){return t+1<this.keys.length?this.keys[t+1][1]:1}genValue(t,e){let i=this.findKey(e);return this.subType==="Number"?i===-1?this.keys[0][0]:i+1>=this.keys.length?this.keys[this.keys.length-1][0]:(this.keys[i+1][0]-this.keys[i][0])*((e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))+this.keys[i][0]:i===-1?t.copy(this.keys[0][0]):i+1>=this.keys.length?t.copy(this.keys[this.keys.length-1][0]):t.copy(this.keys[i][0]).lerp(this.keys[i+1][0],(e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))}toJSON(){return this.keys[0][0].constructor.name,{type:"CLinearFunction",subType:this.subType,keys:this.keys.map(([t,e])=>({value:_y(t,this.subType),pos:e}))}}static fromJSON(t){return new n(t.keys.map(e=>[gy(e.value,t.subType),e.pos]),t.subType)}clone(){return this.subType==="Number"?new n(this.keys.map(([t,e])=>[t,e]),this.subType):new n(this.keys.map(([t,e])=>[t.clone(),e]),this.subType)}},Rc=new ut,Vs=class n{constructor(t=[[new ut(0,0,0),0],[new ut(1,1,1),0]],e=[[1,0],[1,1]]){this.type="function",this.color=new Lr(t,"Color"),this.alpha=new Lr(e,"Number")}genColor(t,e,i){return this.color.genValue(Rc,i),e.set(Rc.x,Rc.y,Rc.z,this.alpha.genValue(1,i))}toJSON(){return{type:"Gradient",color:this.color.toJSON(),alpha:this.alpha.toJSON()}}static fromJSON(t){if(t.functions){let e=t.functions.map(i=>[Ei.fromJSON(i.function).a,i.start]);return t.functions.length>0&&e.push([Ei.fromJSON(t.functions[t.functions.length-1].function).b,1]),new n(e.map(i=>[new ut(i[0].x,i[0].y,i[0].z),i[1]]),e.map(i=>[i[0].w,i[1]]))}else{let e=new n;return e.alpha=Lr.fromJSON(t.alpha),e.color=Lr.fromJSON(t.color),e}}clone(){let t=new n;return t.alpha=this.alpha.clone(),t.color=this.color.clone(),t}startGen(t){}},td=new _e,sd=class n{constructor(t,e){this.indexCount=0,this.type="function",this.gradient1=t,this.gradient2=e}startGen(t){this.indexCount=t.length,t.push(Math.random())}genColor(t,e,i){return this.gradient1.genColor(t,e,i),this.gradient2.genColor(t,td,i),t&&t[this.indexCount]!==void 0?e.lerp(td,t[this.indexCount]):e.lerp(td,Math.random()),e}toJSON(){return{type:"RandomColorBetweenGradient",gradient1:this.gradient1.toJSON(),gradient2:this.gradient2.toJSON()}}static fromJSON(t){return new n(Vs.fromJSON(t.gradient1),Vs.fromJSON(t.gradient2))}clone(){return new n(this.gradient1.clone(),this.gradient2.clone())}},Or=class n{constructor(t){this.color=t,this.type="value"}startGen(t){}genColor(t,e){return e.copy(this.color)}toJSON(){return{type:"ConstantColor",color:$o(this.color)}}static fromJSON(t){return new n(Ko(t.color))}clone(){return new n(this.color.clone())}};function nh(n){switch(n.type){case"ConstantColor":return Or.fromJSON(n);case"ColorRange":return Ei.fromJSON(n);case"RandomColor":return nd.fromJSON(n);case"Gradient":return Vs.fromJSON(n);case"RandomColorBetweenGradient":return sd.fromJSON(n);default:return new Or(new _e(1,1,1,1))}}var Bt=class n{constructor(t){this.value=t,this.type="value"}startGen(t){}genValue(t){return this.value}toJSON(){return{type:"ConstantValue",value:this.value}}static fromJSON(t){return new n(t.value)}clone(){return new n(this.value)}},te=class n{constructor(t,e){this.a=t,this.b=e,this.indexCount=-1,this.type="value"}startGen(t){this.indexCount=t.length,t.push(Math.random())}genValue(t){return this.indexCount===-1&&this.startGen(t),Vr.lerp(this.a,this.b,t[this.indexCount])}toJSON(){return{type:"IntervalValue",a:this.a,b:this.b}}static fromJSON(t){return new n(t.a,t.b)}clone(){return new n(this.a,this.b)}},rd=class{constructor(){this.functions=new Array}findFunction(t){let e=0,i=0,s=this.functions.length-1;for(;i+1<s;)if(e=Math.floor((i+s)/2),t<this.getStartX(e))s=e-1;else if(t>this.getEndX(e))i=e+1;else return e;for(let r=i;r<=s;r++)if(t>=this.functions[r][1]&&t<=this.getEndX(r))return r;return-1}getStartX(t){return this.functions[t][1]}setStartX(t,e){t>0&&(this.functions[t][1]=e)}getEndX(t){return t+1<this.functions.length?this.functions[t+1][1]:1}setEndX(t,e){t+1<this.functions.length&&(this.functions[t+1][1]=e)}insertFunction(t,e){let i=this.findFunction(t);this.functions.splice(i+1,0,[e,t])}removeFunction(t){return this.functions.splice(t,1)[0][0]}getFunction(t){return this.functions[t][0]}setFunction(t,e){this.functions[t][0]=e}get numOfFunctions(){return this.functions.length}},Fr=class n extends rd{constructor(t=[[new ks(0,1/3,1/3*2,1),0]]){super(),this.type="function",this.functions=t}genValue(t,e=0){let i=this.findFunction(e);return i===-1?0:this.functions[i][0].genValue((e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))}toSVG(t,e){if(e<1)return"";let i=["M",0,this.functions[0][0].p[0]].join(" ");for(let s=1/e;s<=1;s+=1/e)i=[i,"L",s*t,this.genValue(void 0,s)].join(" ");return i}toJSON(){return{type:"PiecewiseBezier",functions:this.functions.map(([t,e])=>({function:t.toJSON(),start:e}))}}static fromJSON(t){return new n(t.functions.map(e=>[ks.fromJSON(e.function),e.start]))}clone(){return new n(this.functions.map(([t,e])=>[t.clone(),e]))}startGen(t){}};function Ht(n){switch(n.type){case"ConstantValue":return Bt.fromJSON(n);case"IntervalValue":return te.fromJSON(n);case"PiecewiseBezier":return Fr.fromJSON(n);default:return new Bt(0)}}var Nc=class n{constructor(){this.indexCount=0,this.type="rotation"}startGen(t){this.indexCount=t.length,t.push(new oe);let e,i,s,r,o,a;do e=Math.random()*2-1,i=Math.random()*2-1,s=e*e+i*i;while(s>1);do r=Math.random()*2-1,o=Math.random()*2-1,a=r*r+o*o;while(a>1);let l=Math.sqrt((1-s)/a);t[this.indexCount].set(e,i,l*r,l*o)}genValue(t,e,i,s){return this.indexCount===-1&&this.startGen(t),e.copy(t[this.indexCount]),e}toJSON(){return{type:"RandomQuat"}}static fromJSON(t){return new n}clone(){return new n}},Qo=class n{constructor(t,e){this.axis=t,this.angle=e,this.type="rotation"}startGen(t){this.angle.startGen(t)}genValue(t,e,i,s){return e.setFromAxisAngle(this.axis,this.angle.genValue(t,s)*i)}toJSON(){return{type:"AxisAngle",axis:{x:this.axis.x,y:this.axis.y,z:this.axis.z},angle:this.angle.toJSON()}}static fromJSON(t){return new n(new ut(t.axis.x,t.axis.y,t.axis.z),Ht(t.angle))}clone(){return new n(this.axis.clone(),this.angle.clone())}},od=class n{constructor(t,e,i,s){this.angleX=t,this.angleY=e,this.angleZ=i,this.type="rotation",this.eular=new Ic(0,0,0,s)}startGen(t){this.angleX.startGen(t),this.angleY.startGen(t),this.angleZ.startGen(t)}genValue(t,e,i,s){return this.eular.set(this.angleX.genValue(t,s)*i,this.angleY.genValue(t,s)*i,this.angleZ.genValue(t,s)*i),e.setFromEuler(this.eular)}toJSON(){return{type:"Euler",angleX:this.angleX.toJSON(),angleY:this.angleY.toJSON(),angleZ:this.angleZ.toJSON(),eulerOrder:this.eular.order}}static fromJSON(t){return new n(Ht(t.angleX),Ht(t.angleY),Ht(t.angleZ),t.eulerOrder)}clone(){return new n(this.angleX,this.angleY,this.angleZ,this.eular.order)}};function Xp(n){switch(n.type){case"AxisAngle":return Qo.fromJSON(n);case"Euler":return od.fromJSON(n);case"RandomQuat":return Nc.fromJSON(n);default:return new Nc}}var Br=class n{constructor(t,e,i){this.x=t,this.y=e,this.z=i,this.type="vec3function"}startGen(t){this.x.startGen(t),this.y.startGen(t),this.z.startGen(t)}genValue(t,e,i){return e.set(this.x.genValue(t,i),this.y.genValue(t,i),this.z.genValue(t,i))}toJSON(){return{type:"Vector3Function",x:this.x.toJSON(),y:this.y.toJSON(),z:this.z.toJSON()}}static fromJSON(t){return new n(Ht(t.x),Ht(t.y),Ht(t.z))}clone(){return new n(this.x,this.y,this.z)}};function xy(n){return n.type==="Vector3Function"?Br.fromJSON(n):new Br(new Bt(0),new Bt(0),new Bt(0))}function ta(n){switch(n.type){case"ConstantValue":case"IntervalValue":case"PiecewiseBezier":return Ht(n);case"AxisAngle":case"RandomQuat":case"Euler":return Xp(n);case"Vector3Function":return xy(n);default:return new Bt(0)}}var kn=class n{constructor(t={}){this.type="cone",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.angle=t.angle??Math.PI/6,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[]}update(t,e){si.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=Vr.lerp(1-this.thickness,1,Math.random()),r=i*this.arc,o=Math.sqrt(s),a=Math.sin(r),l=Math.cos(r);t.position.x=o*l,t.position.y=o*a,t.position.z=0;let c=this.angle*o;t.velocity.set(0,0,Math.cos(c)).addScaledVector(t.position,Math.sin(c)).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius)}toJSON(){return{type:"cone",radius:this.radius,arc:this.arc,thickness:this.thickness,angle:this.angle,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,angle:t.angle,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,angle:this.angle,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},Uc=class n{constructor(t={}){this.type="circle",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[]}update(t,e){this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=Vr.lerp(1-this.thickness,1,Math.random()),r=i*this.arc;t.position.x=Math.cos(r),t.position.y=Math.sin(r),t.position.z=0,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*s)}toJSON(){return{type:"circle",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}};function Pc(n,t){return Math.floor(Math.random()*(t-n))+n}var ea=new ut(0,1,0),ia=new ut(0,0,0),yy=new ut(1,1,1),kp=new ut(0,0,1),Lc=class n{constructor(t={}){this.type="donut",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.donutRadius=t.donutRadius??this.radius*.2,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[],this._m1=new mn}update(t,e){si.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=Vr.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,a=s*Math.PI*2,l=Math.sin(o),c=Math.cos(o);if(t.position.x=this.radius*c,t.position.y=this.radius*l,t.position.z=0,t.velocity.z=this.donutRadius*r*Math.sin(a),t.velocity.x=this.donutRadius*r*Math.cos(a)*c,t.velocity.y=this.donutRadius*r*Math.cos(a)*l,t.position.add(t.velocity),t.velocity.normalize().multiplyScalar(t.startSpeed),t.rotation instanceof oe){let h=t.rotation;h.x===0&&h.y===0&&h.z===0&&h.w===1&&(this._m1.lookAt(ia,t.velocity,ea),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"donut",radius:this.radius,arc:this.arc,thickness:this.thickness,donutRadius:this.donutRadius,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,donutRadius:t.donutRadius,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,donutRadius:this.donutRadius,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},zr=class n{constructor(){this.type="point",this._m1=new mn}update(t,e){}initialize(t){let e=Math.random(),i=Math.random(),s=e*Math.PI*2,r=Math.acos(2*i-1),o=Math.cbrt(Math.random()),a=Math.sin(s),l=Math.cos(s),c=Math.sin(r),h=Math.cos(r);if(t.velocity.x=o*c*l,t.velocity.y=o*c*a,t.velocity.z=o*h,t.velocity.multiplyScalar(t.startSpeed),t.position.setScalar(0),t.rotation instanceof oe){let u=t.rotation;u.x===0&&u.y===0&&u.z===0&&u.w===1&&(this._m1.lookAt(ia,t.velocity,ea),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"point"}}static fromJSON(t){return new n}clone(){return new n}},Vn=class n{constructor(t={}){this.type="sphere",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[],this._m1=new mn}update(t,e){si.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=Vr.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,a=Math.acos(2*s-1),l=Math.sin(o),c=Math.cos(o),h=Math.sin(a),u=Math.cos(a);if(t.position.x=h*c,t.position.y=h*l,t.position.z=u,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*r),t.rotation instanceof oe){let f=t.rotation;f.x===0&&f.y===0&&f.z===0&&f.w===1&&(this._m1.lookAt(ia,t.position,ea),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"sphere",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},Dc=class n{constructor(t={}){this.type="hemisphere",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[],this._m1=new mn}update(t,e){si.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=Vr.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,a=Math.acos(s),l=Math.sin(o),c=Math.cos(o),h=Math.sin(a),u=Math.cos(a);if(t.position.x=h*c,t.position.y=h*l,t.position.z=u,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*r),t.rotation instanceof oe){let f=t.rotation;f.x===0&&f.y===0&&f.z===0&&f.w===1&&(this._m1.lookAt(ia,t.position,ea),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"hemisphere",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},Oc=class n{constructor(t={}){this.type="grid",this.width=t.width??1,this.height=t.height??1,this.column=t.column??10,this.row=t.row??10}initialize(t){let e=Math.floor(Math.random()*this.row),i=Math.floor(Math.random()*this.column);t.position.x=i*this.width/this.column-this.width/2,t.position.y=e*this.height/this.row-this.height/2,t.position.z=0,t.velocity.set(0,0,t.startSpeed)}toJSON(){return{type:"grid",width:this.width,height:this.height,column:this.column,row:this.row}}static fromJSON(t){return new n(t)}clone(){return new n({width:this.width,height:this.height,column:this.column,row:this.row})}update(t,e){}},Fc=class n{constructor(t={}){this.type="rectangle",this.currentValue=0,this.width=t.width??10,this.height=t.height??10,this.thickness=t.thickness??1,this.mode=t.mode??si.Random,this.spread=t.spread??0,this.speed=t.speed??new Bt(1),this.memory=[],this._m1=new mn}update(t,e){this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e}initialize(t,e){let i=Gr(this.mode,this.currentValue,this.spread,e),s=2*(this.width+this.height),r=i*s,o,a;r<this.width?(o=r-this.width/2,a=-this.height/2):r<this.width+this.height?(o=this.width/2,a=r-this.width-this.height/2):r<2*this.width+this.height?(o=this.width/2-(r-this.width-this.height),a=this.height/2):(o=-this.width/2,a=this.height/2-(r-2*this.width-this.height));let l=Math.random(),c=1-this.thickness*l;if(t.position.x=o*c,t.position.y=a*c,t.position.z=0,t.velocity.x=o,t.velocity.y=a,t.velocity.z=0,t.velocity.normalize().multiplyScalar(t.startSpeed),t.rotation instanceof oe){let h=t.rotation;h.x===0&&h.y===0&&h.z===0&&h.w===1&&(this._m1.lookAt(ia,t.velocity,ea),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"rectangle",width:this.width,height:this.height,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({width:t.width,height:t.height,thickness:t.thickness,mode:t.mode,speed:t.speed?Ht(t.speed):void 0,spread:t.spread})}clone(){return new n({width:this.width,height:this.height,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},ad={circle:{type:"circle",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Uc,loadJSON:Uc.fromJSON},cone:{type:"cone",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:kn,loadJSON:kn.fromJSON},donut:{type:"donut",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["donutRadius",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Lc,loadJSON:Lc.fromJSON},point:{type:"point",params:[],constructor:zr,loadJSON:zr.fromJSON},sphere:{type:"sphere",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Vn,loadJSON:Vn.fromJSON},hemisphere:{type:"hemisphere",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Dc,loadJSON:Dc.fromJSON},grid:{type:"grid",params:[["width",["number"]],["height",["number"]],["rows",["number"]],["column",["number"]]],constructor:Oc,loadJSON:Oc.fromJSON},rectangle:{type:"rectangle",params:[["width",["number"]],["height",["number"]],["thickness",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Fc,loadJSON:Fc.fromJSON}};function qp(n,t){return ad[n.type].loadJSON(n,t)}var Bi=class n{constructor(t){this.color=t,this.type="ColorOverLife"}initialize(t){this.color.startGen(t.memory)}update(t,e){this.color.genColor(t.memory,t.color,t.age/t.life),t.color.x*=t.startColor.x,t.color.y*=t.startColor.y,t.color.z*=t.startColor.z,t.color.w*=t.startColor.w}frameUpdate(t){}toJSON(){return{type:this.type,color:this.color.toJSON()}}static fromJSON(t){return new n(nh(t.color))}clone(){return new n(this.color.clone())}reset(){}},Bc=class n{constructor(t){this.angularVelocity=t,this.type="RotationOverLife"}initialize(t){typeof t.rotation=="number"&&this.angularVelocity.startGen(t.memory)}update(t,e){typeof t.rotation=="number"&&(t.rotation+=e*this.angularVelocity.genValue(t.memory,t.age/t.life))}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON()}}static fromJSON(t){return new n(Ht(t.angularVelocity))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone())}reset(){}},zc=class n{constructor(t){this.angularVelocity=t,this.type="Rotation3DOverLife",this.tempQuat=new oe,this.tempQuat2=new oe}initialize(t){t.rotation instanceof oe&&(t.angularVelocity=new oe,this.angularVelocity.startGen(t.memory))}update(t,e){t.rotation instanceof oe&&(this.angularVelocity.genValue(t.memory,this.tempQuat,e,t.age/t.life),t.rotation.multiply(this.tempQuat))}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON()}}static fromJSON(t){return new n(Xp(t.angularVelocity))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone())}reset(){}},kc=class n{initialize(t,e){this.ps=e,this.x.startGen(t.memory),this.y.startGen(t.memory),this.z.startGen(t.memory)}constructor(t,e,i){this.x=t,this.y=e,this.z=i,this.type="ForceOverLife",this._temp=new ut,this._tempScale=new ut,this._tempQ=new oe}update(t,e){this._temp.set(this.x.genValue(t.memory,t.age/t.life),this.y.genValue(t.memory,t.age/t.life),this.z.genValue(t.memory,t.age/t.life)),this.ps.worldSpace?t.velocity.addScaledVector(this._temp,e):(this._temp.multiply(this._tempScale).applyQuaternion(this._tempQ),t.velocity.addScaledVector(this._temp,e))}toJSON(){return{type:this.type,x:this.x.toJSON(),y:this.y.toJSON(),z:this.z.toJSON()}}static fromJSON(t){return new n(Ht(t.x),Ht(t.y),Ht(t.z))}frameUpdate(t){if(this.ps&&!this.ps.worldSpace){let e=this._temp,i=this._tempQ,s=this._tempScale;this.ps.emitter.matrixWorld.decompose(e,i,s),i.invert(),s.set(1/s.x,1/s.y,1/s.z)}}clone(){return new n(this.x.clone(),this.y.clone(),this.z.clone())}reset(){}},_n=class n{initialize(t){this.size.startGen(t.memory)}constructor(t){this.size=t,this.type="SizeOverLife"}update(t){this.size instanceof Br?this.size.genValue(t.memory,t.size,t.age/t.life).multiply(t.startSize):t.size.copy(t.startSize).multiplyScalar(this.size.genValue(t.memory,t.age/t.life))}toJSON(){return{type:this.type,size:this.size.toJSON()}}static fromJSON(t){return new n(ta(t.size))}frameUpdate(t){}clone(){return new n(this.size.clone())}reset(){}},Vc=class n{initialize(t){this.speed.startGen(t.memory)}constructor(t){this.speed=t,this.type="SpeedOverLife"}update(t){t.speedModifier=this.speed.genValue(t.memory,t.age/t.life)}toJSON(){return{type:this.type,speed:this.speed.toJSON()}}static fromJSON(t){return new n(Ht(t.speed))}frameUpdate(t){}clone(){return new n(this.speed.clone())}reset(){}},Gc=class n{constructor(t){this.frame=t,this.type="FrameOverLife"}initialize(t){this.frame.startGen(t.memory)}update(t,e){this.frame instanceof Fr&&(t.uvTile=this.frame.genValue(t.memory,t.age/t.life))}frameUpdate(t){}toJSON(){return{type:this.type,frame:this.frame.toJSON()}}static fromJSON(t){return new n(Ht(t.frame))}clone(){return new n(this.frame.clone())}reset(){}},Hc=class n{constructor(t,e=new ut(0,1,0)){this.orbitSpeed=t,this.axis=e,this.type="OrbitOverLife",this.temp=new ut,this.rotation=new oe}initialize(t){this.orbitSpeed.startGen(t.memory)}update(t,e){this.temp.copy(t.position).projectOnVector(this.axis),this.rotation.setFromAxisAngle(this.axis,this.orbitSpeed.genValue(t.memory,t.age/t.life)*e),t.position.sub(this.temp),t.position.applyQuaternion(this.rotation),t.position.add(this.temp)}frameUpdate(t){}toJSON(){return{type:this.type,orbitSpeed:this.orbitSpeed.toJSON(),axis:[this.axis.x,this.axis.y,this.axis.z]}}static fromJSON(t){return new n(Ht(t.orbitSpeed),t.axis?new ut(t.axis[0],t.axis[1],t.axis[2]):void 0)}clone(){return new n(this.orbitSpeed.clone())}reset(){}},Zo=class{constructor(t){this.data=t,this.next=null,this.prev=null}hasPrev(){return this.prev!==null}hasNext(){return this.next!==null}},ld=class{constructor(){this.length=0,this.head=this.tail=null}isEmpty(){return this.head===null}clear(){this.length=0,this.head=this.tail=null}front(){return this.head===null?null:this.head.data}back(){return this.tail===null?null:this.tail.data}dequeue(){if(this.head){let t=this.head.data;return this.head=this.head.next,this.head?this.head.prev=null:this.tail=null,this.length--,t}}pop(){if(this.tail){let t=this.tail.data;return this.tail=this.tail.prev,this.tail?this.tail.next=null:this.head=null,this.length--,t}}queue(t){let e=new Zo(t);this.tail||(this.tail=e),this.head&&(this.head.prev=e,e.next=this.head),this.head=e,this.length++}push(t){let e=new Zo(t);this.head||(this.head=e),this.tail&&(this.tail.next=e,e.prev=this.tail),this.tail=e,this.length++}insertBefore(t,e){let i=new Zo(e);i.next=t,i.prev=t.prev,i.prev!==null&&(i.prev.next=i),i.next.prev=i,t==this.head&&(this.head=i),this.length++}remove(t){if(this.head===null||this.tail===null)return;let e=this.head;for(t===this.head.data&&(this.head=this.head.next),t===this.tail.data&&(this.tail=this.tail.prev);e.next!==null&&e.data!==t;)e=e.next;e.data===t&&(e.prev!==null&&(e.prev.next=e.next),e.next!==null&&(e.next.prev=e.prev),this.length--)}*values(){let t=this.head;for(;t!==null;)yield t.data,t=t.next}};var Wc=class{constructor(){this.startSpeed=0,this.startColor=new _e,this.startSize=new ut(1,1,1),this.position=new ut,this.velocity=new ut,this.age=0,this.life=1,this.size=new ut(1,1,1),this.speedModifier=1,this.rotation=0,this.color=new _e,this.uvTile=0,this.memory=[]}get died(){return this.age>=this.life}reset(){this.memory.length=0}},cd=class{constructor(t,e,i){this.position=t,this.size=e,this.color=i}},kr=class{constructor(){this.startSpeed=0,this.startColor=new _e,this.startSize=new ut(1,1,1),this.position=new ut,this.velocity=new ut,this.age=0,this.life=1,this.size=new ut(1,1,1),this.length=100,this.speedModifier=1,this.color=new _e,this.previous=new ld,this.uvTile=0,this.memory=[]}update(){for(this.age<=this.life?this.previous.push(new cd(this.position.clone(),this.size.x,this.color.clone())):this.previous.length>0&&this.previous.dequeue();this.previous.length>this.length;)this.previous.dequeue()}get died(){return this.age>=this.life}reset(){this.memory.length=0,this.previous.clear()}},Xc=class n{initialize(t){this.width.startGen(t.memory)}constructor(t){this.width=t,this.type="WidthOverLength"}update(t){if(t instanceof kr){let e=t.previous.values();for(let i=0;i<t.previous.length;i++){let s=e.next();s.value.size=this.width.genValue(t.memory,(t.previous.length-i)/t.length)}}}frameUpdate(t){}toJSON(){return{type:this.type,width:this.width.toJSON()}}static fromJSON(t){return new n(Ht(t.width))}clone(){return new n(this.width.clone())}reset(){}},xn=class n{constructor(t,e){this.direction=t,this.magnitude=e,this.type="ApplyForce",this.memory={data:[],dataCount:0},this.magnitudeValue=this.magnitude.genValue(this.memory)}initialize(t){}update(t,e){t.velocity.addScaledVector(this.direction,this.magnitudeValue*e)}frameUpdate(t){this.magnitudeValue=this.magnitude.genValue(this.memory)}toJSON(){return{type:this.type,direction:[this.direction.x,this.direction.y,this.direction.z],magnitude:this.magnitude.toJSON()}}static fromJSON(t){return new n(new ut(t.direction[0],t.direction[1],t.direction[2]),Ht(t.magnitude??t.force))}clone(){return new n(this.direction.clone(),this.magnitude.clone())}reset(){}},qc=class n{constructor(t,e){this.center=t,this.magnitude=e,this.type="GravityForce",this.temp=new ut}initialize(t){}update(t,e){this.temp.copy(this.center).sub(t.position).normalize(),t.velocity.addScaledVector(this.temp,this.magnitude/t.position.distanceToSquared(this.center)*e)}frameUpdate(t){}toJSON(){return{type:this.type,center:[this.center.x,this.center.y,this.center.z],magnitude:this.magnitude}}static fromJSON(t){return new n(new ut(t.center[0],t.center[1],t.center[2]),t.magnitude)}clone(){return new n(this.center.clone(),this.magnitude)}reset(){}},Yc=class n{constructor(t){this.angle=t,this.type="ChangeEmitDirection",this._temp=new ut,this._q=new oe,this.memory={data:[],dataCount:0}}initialize(t){let e=t.velocity.length();e!=0&&(t.velocity.normalize(),t.velocity.x===0&&t.velocity.y===0?this._temp.set(0,t.velocity.z,0):this._temp.set(-t.velocity.y,t.velocity.x,0),this.angle.startGen(this.memory),this._q.setFromAxisAngle(this._temp.normalize(),this.angle.genValue(this.memory)),this._temp.copy(t.velocity),t.velocity.applyQuaternion(this._q),this._q.setFromAxisAngle(this._temp,Math.random()*Math.PI*2),t.velocity.applyQuaternion(this._q),t.velocity.setLength(e))}update(t,e){}frameUpdate(t){}toJSON(){return{type:this.type,angle:this.angle.toJSON()}}static fromJSON(t){return new n(Ht(t.angle))}clone(){return new n(this.angle)}reset(){}},Dr;(function(n){n[n.Death=0]="Death",n[n.Birth=1]="Birth",n[n.Frame=2]="Frame"})(Dr||(Dr={}));var jo=class n{constructor(t,e,i,s=Dr.Frame,r=1){this.particleSystem=t,this.useVelocityAsBasis=e,this.subParticleSystem=i,this.mode=s,this.emitProbability=r,this.type="EmitSubParticleSystem",this.q_=new oe,this.v_=new ut,this.v2_=new ut,this.subEmissions=new Array,this.subParticleSystem&&this.subParticleSystem.system&&(this.subParticleSystem.system.onlyUsedByOther=!0)}initialize(t){}update(t,e){this.mode===Dr.Frame?this.emit(t,e):this.mode===Dr.Birth&&t.age===0?this.emit(t,e):this.mode===Dr.Death&&t.age+e>=t.life&&this.emit(t,e)}emit(t,e){if(!this.subParticleSystem||Math.random()>this.emitProbability)return;let i=new mn;this.setMatrixFromParticle(i,t),this.subEmissions.push({burstParticleCount:0,burstParticleIndex:0,isBursting:!1,burstIndex:0,burstWaveIndex:0,time:0,waitEmiting:0,matrix:i,travelDistance:0,particle:t})}frameUpdate(t){if(this.subParticleSystem)for(let e=0;e<this.subEmissions.length;e++)if(this.subEmissions[e].time>=this.subParticleSystem.system.duration)this.subEmissions[e]=this.subEmissions[this.subEmissions.length-1],this.subEmissions.length=this.subEmissions.length-1,e--;else{let i=this.subEmissions[e];i.particle&&i.particle.age<i.particle.life?this.setMatrixFromParticle(i.matrix,i.particle):i.particle=void 0,this.subParticleSystem.system.emit(t,i,i.matrix)}}toJSON(){return{type:this.type,subParticleSystem:this.subParticleSystem?this.subParticleSystem.uuid:"",useVelocityAsBasis:this.useVelocityAsBasis,mode:this.mode,emitProbability:this.emitProbability}}static fromJSON(t,e){return new n(e,t.useVelocityAsBasis,t.subParticleSystem,t.mode,t.emitProbability)}clone(){return new n(this.particleSystem,this.useVelocityAsBasis,this.subParticleSystem,this.mode,this.emitProbability)}reset(){}setMatrixFromParticle(t,e){let i;if(e.rotation===void 0||this.useVelocityAsBasis)if(e.velocity.x===0&&e.velocity.y===0&&(e.velocity.z===1||e.velocity.z===0))t.set(1,0,0,e.position.x,0,1,0,e.position.y,0,0,1,e.position.z,0,0,0,1);else{this.v_.copy(kp).cross(e.velocity),this.v2_.copy(e.velocity).cross(this.v_);let s=this.v_.length(),r=this.v2_.length();t.set(this.v_.x/s,this.v2_.x/r,e.velocity.x,e.position.x,this.v_.y/s,this.v2_.y/r,e.velocity.y,e.position.y,this.v_.z/s,this.v2_.z/r,e.velocity.z,e.position.z,0,0,0,1)}else e.rotation instanceof oe?i=e.rotation:(this.q_.setFromAxisAngle(kp,e.rotation),i=this.q_),t.compose(e.position,i,yy);this.particleSystem.worldSpace||t.multiplyMatrices(this.particleSystem.emitter.matrixWorld,t)}},vy=.5*(Math.sqrt(3)-1),Jo=(3-Math.sqrt(3))/6,My=1/3,dn=1/6,Sy=(Math.sqrt(5)-1)/4,je=(5-Math.sqrt(5))/20,Je=new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]),Be=new Float32Array([0,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,1,0,1,1,1,0,1,-1,1,0,-1,1,1,0,-1,-1,-1,0,1,1,-1,0,1,-1,-1,0,-1,1,-1,0,-1,-1,1,1,0,1,1,1,0,-1,1,-1,0,1,1,-1,0,-1,-1,1,0,1,-1,1,0,-1,-1,-1,0,1,-1,-1,0,-1,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,0]),Jc=class{constructor(t=Math.random){let e=typeof t=="function"?t:wy(t);this.p=by(e),this.perm=new Uint8Array(512),this.permMod12=new Uint8Array(512);for(let i=0;i<512;i++)this.perm[i]=this.p[i&255],this.permMod12[i]=this.perm[i]%12}noise2D(t,e){let i=this.permMod12,s=this.perm,r=0,o=0,a=0,l=(t+e)*vy,c=Math.floor(t+l),h=Math.floor(e+l),u=(c+h)*Jo,f=c-u,d=h-u,m=t-f,_=e-d,g,p;m>_?(g=1,p=0):(g=0,p=1);let w=m-g+Jo,M=_-p+Jo,v=m-1+2*Jo,T=_-1+2*Jo,S=c&255,A=h&255,I=.5-m*m-_*_;if(I>=0){let R=i[S+s[A]]*3;I*=I,r=I*I*(Je[R]*m+Je[R+1]*_)}let y=.5-w*w-M*M;if(y>=0){let R=i[S+g+s[A+p]]*3;y*=y,o=y*y*(Je[R]*w+Je[R+1]*M)}let E=.5-v*v-T*T;if(E>=0){let R=i[S+1+s[A+1]]*3;E*=E,a=E*E*(Je[R]*v+Je[R+1]*T)}return 70*(r+o+a)}noise3D(t,e,i){let s=this.permMod12,r=this.perm,o,a,l,c,h=(t+e+i)*My,u=Math.floor(t+h),f=Math.floor(e+h),d=Math.floor(i+h),m=(u+f+d)*dn,_=u-m,g=f-m,p=d-m,w=t-_,M=e-g,v=i-p,T,S,A,I,y,E;w>=M?M>=v?(T=1,S=0,A=0,I=1,y=1,E=0):w>=v?(T=1,S=0,A=0,I=1,y=0,E=1):(T=0,S=0,A=1,I=1,y=0,E=1):M<v?(T=0,S=0,A=1,I=0,y=1,E=1):w<v?(T=0,S=1,A=0,I=0,y=1,E=1):(T=0,S=1,A=0,I=1,y=1,E=0);let R=w-T+dn,F=M-S+dn,O=v-A+dn,z=w-I+2*dn,W=M-y+2*dn,k=v-E+2*dn,H=w-1+3*dn,Z=M-1+3*dn,nt=v-1+3*dn,et=u&255,st=f&255,Ut=d&255,Pt=.6-w*w-M*M-v*v;if(Pt<0)o=0;else{let J=s[et+r[st+r[Ut]]]*3;Pt*=Pt,o=Pt*Pt*(Je[J]*w+Je[J+1]*M+Je[J+2]*v)}let ne=.6-R*R-F*F-O*O;if(ne<0)a=0;else{let J=s[et+T+r[st+S+r[Ut+A]]]*3;ne*=ne,a=ne*ne*(Je[J]*R+Je[J+1]*F+Je[J+2]*O)}let Jt=.6-z*z-W*W-k*k;if(Jt<0)l=0;else{let J=s[et+I+r[st+y+r[Ut+E]]]*3;Jt*=Jt,l=Jt*Jt*(Je[J]*z+Je[J+1]*W+Je[J+2]*k)}let Y=.6-H*H-Z*Z-nt*nt;if(Y<0)c=0;else{let J=s[et+1+r[st+1+r[Ut+1]]]*3;Y*=Y,c=Y*Y*(Je[J]*H+Je[J+1]*Z+Je[J+2]*nt)}return 32*(o+a+l+c)}noise4D(t,e,i,s){let r=this.perm,o,a,l,c,h,u=(t+e+i+s)*Sy,f=Math.floor(t+u),d=Math.floor(e+u),m=Math.floor(i+u),_=Math.floor(s+u),g=(f+d+m+_)*je,p=f-g,w=d-g,M=m-g,v=_-g,T=t-p,S=e-w,A=i-M,I=s-v,y=0,E=0,R=0,F=0;T>S?y++:E++,T>A?y++:R++,T>I?y++:F++,S>A?E++:R++,S>I?E++:F++,A>I?R++:F++;let O=y>=3?1:0,z=E>=3?1:0,W=R>=3?1:0,k=F>=3?1:0,H=y>=2?1:0,Z=E>=2?1:0,nt=R>=2?1:0,et=F>=2?1:0,st=y>=1?1:0,Ut=E>=1?1:0,Pt=R>=1?1:0,ne=F>=1?1:0,Jt=T-O+je,Y=S-z+je,J=A-W+je,gt=I-k+je,Lt=T-H+2*je,yt=S-Z+2*je,Yt=A-nt+2*je,Re=I-et+2*je,qt=T-st+3*je,jt=S-Ut+3*je,le=A-Pt+3*je,Ft=I-ne+3*je,we=T-1+4*je,N=S-1+4*je,Te=A-1+4*je,Zt=I-1+4*je,se=f&255,xt=d&255,C=m&255,x=_&255,L=.6-T*T-S*S-A*A-I*I;if(L<0)o=0;else{let Q=r[se+r[xt+r[C+r[x]]]]%32*4;L*=L,o=L*L*(Be[Q]*T+Be[Q+1]*S+Be[Q+2]*A+Be[Q+3]*I)}let q=.6-Jt*Jt-Y*Y-J*J-gt*gt;if(q<0)a=0;else{let Q=r[se+O+r[xt+z+r[C+W+r[x+k]]]]%32*4;q*=q,a=q*q*(Be[Q]*Jt+Be[Q+1]*Y+Be[Q+2]*J+Be[Q+3]*gt)}let $=.6-Lt*Lt-yt*yt-Yt*Yt-Re*Re;if($<0)l=0;else{let Q=r[se+H+r[xt+Z+r[C+nt+r[x+et]]]]%32*4;$*=$,l=$*$*(Be[Q]*Lt+Be[Q+1]*yt+Be[Q+2]*Yt+Be[Q+3]*Re)}let X=.6-qt*qt-jt*jt-le*le-Ft*Ft;if(X<0)c=0;else{let Q=r[se+st+r[xt+Ut+r[C+Pt+r[x+ne]]]]%32*4;X*=X,c=X*X*(Be[Q]*qt+Be[Q+1]*jt+Be[Q+2]*le+Be[Q+3]*Ft)}let vt=.6-we*we-N*N-Te*Te-Zt*Zt;if(vt<0)h=0;else{let Q=r[se+1+r[xt+1+r[C+1+r[x+1]]]]%32*4;vt*=vt,h=vt*vt*(Be[Q]*we+Be[Q+1]*N+Be[Q+2]*Te+Be[Q+3]*Zt)}return 27*(o+a+l+c+h)}};function by(n){let t=new Uint8Array(256);for(let e=0;e<256;e++)t[e]=e;for(let e=0;e<255;e++){let i=e+~~(n()*(256-e)),s=t[e];t[e]=t[i],t[i]=s}return t}function wy(n){let t=0,e=0,i=0,s=1,r=Ty();return t=r(" "),e=r(" "),i=r(" "),t-=r(n),t<0&&(t+=1),e-=r(n),e<0&&(e+=1),i-=r(n),i<0&&(i+=1),function(){let o=2091639*t+s*23283064365386963e-26;return t=e,e=i,i=o-(s=o|0)}}function Ty(){let n=4022871197;return function(t){t=t.toString();for(let e=0;e<t.length;e++){n+=t.charCodeAt(e);let i=.02519603282416938*n;n=i>>>0,i-=n,i*=n,n=i>>>0,i-=n,n+=i*4294967296}return(n>>>0)*23283064365386963e-26}}var Zc=class n{constructor(t,e,i,s){this.scale=t,this.octaves=e,this.velocityMultiplier=i,this.timeScale=s,this.type="TurbulenceField",this.generator=new Jc,this.timeOffset=new ut,this.temp=new ut,this.temp2=new ut,this.timeOffset.x=Math.random()/this.scale.x*this.timeScale.x,this.timeOffset.y=Math.random()/this.scale.y*this.timeScale.y,this.timeOffset.z=Math.random()/this.scale.z*this.timeScale.z}initialize(t){}update(t,e){let i=t.position.x/this.scale.x,s=t.position.y/this.scale.y,r=t.position.z/this.scale.z;this.temp.set(0,0,0);let o=1;for(let a=0;a<this.octaves;a++)this.temp2.set(this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.x*o)/o,this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.y*o)/o,this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.z*o)/o),this.temp.add(this.temp2),o*=2;this.temp.multiply(this.velocityMultiplier),t.velocity.addScaledVector(this.temp,e)}toJSON(){return{type:this.type,scale:[this.scale.x,this.scale.y,this.scale.z],octaves:this.octaves,velocityMultiplier:[this.velocityMultiplier.x,this.velocityMultiplier.y,this.velocityMultiplier.z],timeScale:[this.timeScale.x,this.timeScale.y,this.timeScale.z]}}frameUpdate(t){this.timeOffset.x+=t*this.timeScale.x,this.timeOffset.y+=t*this.timeScale.y,this.timeOffset.z+=t*this.timeScale.z}static fromJSON(t){return new n(new ut(t.scale[0],t.scale[1],t.scale[2]),t.octaves,new ut(t.velocityMultiplier[0],t.velocityMultiplier[1],t.velocityMultiplier[2]),new ut(t.timeScale[0],t.timeScale[1],t.timeScale[2]))}clone(){return new n(this.scale.clone(),this.octaves,this.velocityMultiplier.clone(),this.timeScale.clone())}reset(){}},fn=[],ed=new ut,id=new oe,$c=class n{constructor(t,e,i=new Bt(1),s=new Bt(0)){if(this.frequency=t,this.power=e,this.positionAmount=i,this.rotationAmount=s,this.type="Noise",this.duration=0,fn.length===0)for(let r=0;r<100;r++)fn.push(new Jc)}initialize(t){t.lastPosNoise=new ut,typeof t.rotation=="number"?t.lastRotNoise=0:t.lastRotNoise=new oe,t.generatorIndex=[Pc(0,100),Pc(0,100),Pc(0,100),Pc(0,100)],this.positionAmount.startGen(t.memory),this.rotationAmount.startGen(t.memory),this.frequency.startGen(t.memory),this.power.startGen(t.memory)}update(t,e){let i=this.frequency.genValue(t.memory,t.age/t.life),s=this.power.genValue(t.memory,t.age/t.life),r=this.positionAmount.genValue(t.memory,t.age/t.life),o=this.rotationAmount.genValue(t.memory,t.age/t.life);r>0&&t.lastPosNoise!==void 0&&(t.position.sub(t.lastPosNoise),ed.set(fn[t.generatorIndex[0]].noise2D(0,t.age*i)*s*r,fn[t.generatorIndex[1]].noise2D(0,t.age*i)*s*r,fn[t.generatorIndex[2]].noise2D(0,t.age*i)*s*r),t.position.add(ed),t.lastPosNoise.copy(ed)),o>0&&t.lastRotNoise!==void 0&&(typeof t.rotation=="number"?(t.rotation-=t.lastRotNoise,t.rotation+=fn[t.generatorIndex[3]].noise2D(0,t.age*i)*Math.PI*s*o):(t.lastRotNoise.invert(),t.rotation.multiply(t.lastRotNoise),id.set(fn[t.generatorIndex[0]].noise2D(0,t.age*i)*s*o,fn[t.generatorIndex[1]].noise2D(0,t.age*i)*s*o,fn[t.generatorIndex[2]].noise2D(0,t.age*i)*s*o,fn[t.generatorIndex[3]].noise2D(0,t.age*i)*s*o).normalize(),t.rotation.multiply(id),t.lastRotNoise.copy(id)))}toJSON(){return{type:this.type,frequency:this.frequency.toJSON(),power:this.power.toJSON(),positionAmount:this.positionAmount.toJSON(),rotationAmount:this.rotationAmount.toJSON()}}frameUpdate(t){this.duration+=t}static fromJSON(t){return new n(Ht(t.frequency),Ht(t.power),Ht(t.positionAmount),Ht(t.rotationAmount))}clone(){return new n(this.frequency.clone(),this.power.clone(),this.positionAmount.clone(),this.rotationAmount.clone())}reset(){}},Kc=class n{constructor(t=0,e=0,i=new ut){this.scaleX=t,this.scaleY=e,this.position=i,this.locations=[]}transform(t,e){t.x=this.locations[e%this.locations.length].x*this.scaleX+this.position.x,t.y=this.locations[e%this.locations.length].y*this.scaleY+this.position.y,t.z=this.position.z}static fromJSON(t){let e=new n(t.scaleX,t.scaleY,new ut(t.position[0],t.position[1],t.position[2]));return e.locations=t.locations.map(i=>new zn(i.x,i.y)),e}clone(){let t=new n(this.scaleX,this.scaleY,this.position.clone());return t.locations=this.locations.map(e=>e.clone()),t}toJSON(){return{scaleX:this.scaleX,scaleY:this.scaleY,position:this.position,locations:this.locations.map(t=>({x:t.x,y:t.y}))}}fromImage(t,e){let i=document.createElement("canvas");i.width=t.width,i.height=t.height;let s=i.getContext("2d");if(!s)return;s.drawImage(t,0,0);let r=s.getImageData(0,0,i.width,i.height,{colorSpace:"srgb"});i.remove(),this.locations.length=0;for(let o=0;o<r.height;o++)for(let a=0;a<r.width;a++)r.data[(o*r.width+a)*4+3]>e&&this.locations.push(new zn(a,r.height-o))}};function Ey(n){return n.type==="TextureSequencer"?Kc.fromJSON(n):new Kc}var hd=class n{constructor(t){this.type="ApplySequences",this.sequencers=[],this.time=0,this.index=0,this.pCount=0,this.tempV=new ut,this.delay=t}initialize(t){t.id=this.pCount,t.dst=new ut,t.begin=new ut,t.inMotion=!1,this.pCount++}reset(){this.time=0,this.index=0,this.pCount=0}update(t,e){let i=this.sequencers[this.index],s=t.id*this.delay;this.time>=i[0].a+s&&this.time<=i[0].b+s?(t.inMotion||(t.inMotion=!0,t.begin.copy(t.position),i[1].transform(t.dst,t.id)),t.position.lerpVectors(t.begin,t.dst,n.BEZIER.genValue((this.time-i[0].a-s)/(i[0].b-i[0].a)))):this.time>i[0].b+s&&(t.inMotion=!1)}frameUpdate(t){for(;this.index+1<this.sequencers.length&&this.time>=this.sequencers[this.index+1][0].a;)this.index++;this.time+=t}appendSequencer(t,e){this.sequencers.push([t,e])}toJSON(){return{type:this.type,delay:this.delay,sequencers:this.sequencers.map(([t,e])=>({range:t.toJSON(),sequencer:e.toJSON()}))}}static fromJSON(t){let e=new n(t.delay);return t.sequencers.forEach(i=>{e.sequencers.push([Ht(i.range),Ey(i.sequencer)])}),e}clone(){let t=new n(this.delay);return t.sequencers=this.sequencers.map(e=>[e[0].clone(),e[1].clone()]),t}};hd.BEZIER=new ks(0,0,1,1);var Qc=class n{constructor(t,e){this.color=t,this.speedRange=e,this.type="ColorBySpeed"}initialize(t){this.color.startGen(t.memory)}update(t,e){let i=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);this.color.genColor(t.memory,t.color,i),t.color.x*=t.startColor.x,t.color.y*=t.startColor.y,t.color.z*=t.startColor.z,t.color.w*=t.startColor.w}frameUpdate(t){}toJSON(){return{type:this.type,color:this.color.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(nh(t.color),te.fromJSON(t.speedRange))}clone(){return new n(this.color.clone(),this.speedRange.clone())}reset(){}},jc=class n{initialize(t){this.size.startGen(t.memory)}constructor(t,e){this.size=t,this.speedRange=e,this.type="SizeBySpeed"}update(t){let e=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);this.size instanceof Br?this.size.genValue(t.memory,t.size,e).multiply(t.startSize):t.size.copy(t.startSize).multiplyScalar(this.size.genValue(t.memory,e))}toJSON(){return{type:this.type,size:this.size.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(ta(t.size),te.fromJSON(t.speedRange))}frameUpdate(t){}clone(){return new n(this.size.clone(),this.speedRange.clone())}reset(){}},th=class n{constructor(t,e){this.angularVelocity=t,this.speedRange=e,this.type="RotationBySpeed",this.tempQuat=new oe}initialize(t){typeof t.rotation=="number"&&this.angularVelocity.startGen(t.memory)}update(t,e){if(typeof t.rotation=="number"){let i=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);t.rotation+=e*this.angularVelocity.genValue(t.memory,i)}}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(Ht(t.angularVelocity),te.fromJSON(t.speedRange))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone(),this.speedRange.clone())}reset(){}},eh=class n{initialize(t){this.speed.startGen(t.memory)}constructor(t,e){this.speed=t,this.dampen=e,this.type="LimitSpeedOverLife"}update(t,e){let i=t.velocity.length(),s=this.speed.genValue(t.memory,t.age/t.life);if(i>s){let r=(i-s)/i;t.velocity.multiplyScalar(1-r*this.dampen*e*20)}}toJSON(){return{type:this.type,speed:this.speed.toJSON(),dampen:this.dampen}}static fromJSON(t){return new n(Ht(t.speed),t.dampen)}frameUpdate(t){}clone(){return new n(this.speed.clone(),this.dampen)}reset(){}},ih={ApplyForce:{type:"ApplyForce",constructor:xn,params:[["direction",["vec3"]],["magnitude",["value"]]],loadJSON:xn.fromJSON},Noise:{type:"Noise",constructor:$c,params:[["frequency",["value"]],["power",["value"]],["positionAmount",["value"]],["rotationAmount",["value"]]],loadJSON:$c.fromJSON},TurbulenceField:{type:"TurbulenceField",constructor:Zc,params:[["scale",["vec3"]],["octaves",["number"]],["velocityMultiplier",["vec3"]],["timeScale",["vec3"]]],loadJSON:Zc.fromJSON},GravityForce:{type:"GravityForce",constructor:qc,params:[["center",["vec3"]],["magnitude",["number"]]],loadJSON:qc.fromJSON},ColorOverLife:{type:"ColorOverLife",constructor:Bi,params:[["color",["colorFunc"]]],loadJSON:Bi.fromJSON},RotationOverLife:{type:"RotationOverLife",constructor:Bc,params:[["angularVelocity",["value","valueFunc"]]],loadJSON:Bc.fromJSON},Rotation3DOverLife:{type:"Rotation3DOverLife",constructor:zc,params:[["angularVelocity",["rotationFunc"]]],loadJSON:zc.fromJSON},SizeOverLife:{type:"SizeOverLife",constructor:_n,params:[["size",["value","valueFunc","vec3Func"]]],loadJSON:_n.fromJSON},ColorBySpeed:{type:"ColorBySpeed",constructor:Qc,params:[["color",["colorFunc"]],["speedRange",["range"]]],loadJSON:Qc.fromJSON},RotationBySpeed:{type:"RotationBySpeed",constructor:th,params:[["angularVelocity",["value","valueFunc"]],["speedRange",["range"]]],loadJSON:th.fromJSON},SizeBySpeed:{type:"SizeBySpeed",constructor:jc,params:[["size",["value","valueFunc","vec3Func"]],["speedRange",["range"]]],loadJSON:jc.fromJSON},SpeedOverLife:{type:"SpeedOverLife",constructor:Vc,params:[["speed",["value","valueFunc"]]],loadJSON:Vc.fromJSON},FrameOverLife:{type:"FrameOverLife",constructor:Gc,params:[["frame",["value","valueFunc"]]],loadJSON:Gc.fromJSON},ForceOverLife:{type:"ForceOverLife",constructor:kc,params:[["x",["value","valueFunc"]],["y",["value","valueFunc"]],["z",["value","valueFunc"]]],loadJSON:kc.fromJSON},OrbitOverLife:{type:"OrbitOverLife",constructor:Hc,params:[["orbitSpeed",["value","valueFunc"]],["axis",["vec3"]]],loadJSON:Hc.fromJSON},WidthOverLength:{type:"WidthOverLength",constructor:Xc,params:[["width",["value","valueFunc"]]],loadJSON:Xc.fromJSON},ChangeEmitDirection:{type:"ChangeEmitDirection",constructor:Yc,params:[["angle",["value"]]],loadJSON:Yc.fromJSON},EmitSubParticleSystem:{type:"EmitSubParticleSystem",constructor:jo,params:[["particleSystem",["self"]],["useVelocityAsBasis",["boolean"]],["subParticleSystem",["particleSystem"]],["mode",["number"]],["emitProbability",["number"]]],loadJSON:jo.fromJSON},LimitSpeedOverLife:{type:"LimitSpeedOverLife",constructor:eh,params:[["speed",["value","valueFunc"]],["dampen",["number"]]],loadJSON:eh.fromJSON}};function Yp(n,t){return ih[n.type]?ih[n.type].loadJSON(n,t):null}var Ay=[];function Jp(n){if(!Ay.find(e=>e.id===n.id)){n.initialize();for(let e of n.emitterShapes)ad[e.type]||(ad[e.type]=e);for(let e of n.behaviors)ih[e.type]||(ih[e.type]=e)}}var rh=class n{get geometry(){return this._geometry}set geometry(t){if(this._geometry=t,t===void 0||typeof t=="string")return;let e=new Wi;this._triangleIndexToArea.length=0;let i=0;if(!t.getIndex())return;let s=t.getIndex().array,r=s.length/3;this._triangleIndexToArea.push(0);for(let o=0;o<r;o++)e.setFromAttributeAndIndices(t.getAttribute("position"),s[o*3],s[o*3+1],s[o*3+2]),i+=e.getArea(),this._triangleIndexToArea.push(i);t.userData.triangleIndexToArea=this._triangleIndexToArea}constructor(t){this.type="mesh_surface",this._triangleIndexToArea=[],this._tempA=new P,this._tempB=new P,this._tempC=new P,t&&(this.geometry=t)}initialize(t){let e=this._geometry;if(!e||e.getIndex()===null){t.position.set(0,0,0),t.velocity.set(0,0,1).multiplyScalar(t.startSpeed);return}let i=this._triangleIndexToArea.length-1,s=0,r=i,o=Math.random()*this._triangleIndexToArea[i];for(;s+1<r;){let d=Math.floor((s+r)/2);o<this._triangleIndexToArea[d]?r=d:s=d}let a=Math.random(),l=Math.random();a+l>1&&(a=1-a,l=1-l);let c=e.getIndex().array[s*3],h=e.getIndex().array[s*3+1],u=e.getIndex().array[s*3+2],f=e.getAttribute("position");this._tempA.fromBufferAttribute(f,c),this._tempB.fromBufferAttribute(f,h),this._tempC.fromBufferAttribute(f,u),this._tempB.sub(this._tempA),this._tempC.sub(this._tempA),this._tempA.addScaledVector(this._tempB,a).addScaledVector(this._tempC,l),t.position.copy(this._tempA),this._tempA.copy(this._tempB).cross(this._tempC).normalize(),t.velocity.copy(this._tempA).normalize().multiplyScalar(t.startSpeed)}toJSON(){return{type:"mesh_surface",mesh:this._geometry?this._geometry.uuid:""}}static fromJSON(t,e){return new n(e.geometries[t.geometry])}clone(){return new n(this._geometry)}update(t,e){}},Cy={id:"three.quarks",initialize:()=>{},emitterShapes:[{type:"mesh_surface",params:[["geometry",["geometry"]]],constructor:rh,loadJSON:rh.fromJSON}],behaviors:[]},Ry=`
#ifdef SOFT_PARTICLES

    /* #ifdef LOGDEPTH
    float distSample = linearize_depth_log(sampleDepth, near, far);
    #else
    float distSample = ortho ? linearize_depth_ortho(sampleDepth, near, far) : linearize_depth(sampleDepth, near, far);
    #endif */

    vec2 p2 = projPosition.xy / projPosition.w;
    
    p2 = 0.5 * p2 + 0.5;

    float readDepth = texture2D(depthTexture, p2.xy).r;
    float viewDepth = linearize_depth(readDepth);

    float softParticlesFade = saturate(SOFT_INV_FADE_DISTANCE * ((viewDepth - SOFT_NEAR_FADE) - linearDepth));
    
    gl_FragColor *= softParticlesFade;

    //gl_FragColor = vec4(softParticlesFade , 0, 0, 1);
#endif
`,Py=`
#ifdef SOFT_PARTICLES

    uniform sampler2D depthTexture;
    uniform vec4 projParams;
    uniform vec2 softParams;

    varying vec4 projPosition;
    varying float linearDepth;

    #define SOFT_NEAR_FADE softParams.x
    #define SOFT_INV_FADE_DISTANCE softParams.y

    #define zNear projParams.x
    #define zFar projParams.y

    float linearize_depth(float d)
    {
        return (zFar * zNear) / (zFar - d * (zFar - zNear));
    }

#endif
`,Iy=`
#ifdef SOFT_PARTICLES
    varying vec4 projPosition;
    varying float linearDepth;
#endif
`,Ny=`
#ifdef SOFT_PARTICLES
    projPosition = gl_Position;
    linearDepth = -mvPosition.z;
#endif
`,Uy=`
#ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    #ifdef TILE_BLEND
        texelColor = mix( texelColor, texture2D( map, vUvNext ), vUvBlend );
    #endif
    diffuseColor *= texelColor;
#endif
`,Ly=`
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;
#ifdef TILE_BLEND
    varying vec2 vUvNext;
    varying float vUvBlend;
#endif

#endif
#ifdef USE_MAP

	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#ifdef TILE_BLEND
    varying vec2 vMapUvNext;
#endif

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

#endif
`,Dy=`
#ifdef UV_TILE
    attribute float uvTile;
    uniform vec2 tileCount;
    
    mat3 makeTileTransform(float uvTile) {
        float col = mod(uvTile, tileCount.x);
        float row = (tileCount.y - floor(uvTile / tileCount.x) - 1.0);
        
        return mat3(
          1.0 / tileCount.x, 0.0, 0.0,
          0.0, 1.0 / tileCount.y, 0.0, 
          col / tileCount.x, row / tileCount.y, 1.0);
    }
#else
    mat3 makeTileTransform(float uvTile) {
        return mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
    }
#endif

#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;
#ifdef TILE_BLEND
    varying vec2 vUvNext;
    varying float vUvBlend;
#endif

#endif
#ifdef USE_MAP

	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#ifdef TILE_BLEND
    varying vec2 vMapUvNext;
#endif

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

#endif
`,Oy=`
#ifdef UV_TILE
    mat3 tileTransform = makeTileTransform(floor(uvTile));
    #ifdef TILE_BLEND
        mat3 nextTileTransform = makeTileTransform(ceil(uvTile));
        vUvBlend = fract(uvTile);
    #endif
#else
    mat3 tileTransform = makeTileTransform(0.0);
#endif

#if defined( USE_UV ) || defined( USE_ANISOTROPY )

vUv = (tileTransform *vec3( uv, 1 )).xy;
#if defined( TILE_BLEND ) && defined( UV_TILE )
    vUvNext = (nextTileTransform *vec3( uv, 1 )).xy;
#endif

#endif
#ifdef USE_MAP

vMapUv = ( tileTransform * (mapTransform * vec3( MAP_UV, 1 ) )).xy;
#if defined( TILE_BLEND ) && defined( UV_TILE )
    vMapUvNext = (nextTileTransform * (mapTransform * vec3( MAP_UV, 1 ))).xy;
#endif

#endif
#ifdef USE_ALPHAMAP

vAlphaMapUv = ( tileTransform * (alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) )).xy;
    
#endif
#ifdef USE_LIGHTMAP

vLightMapUv = ( tileTransform * (lightMapTransform * vec3( LIGHTMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_AOMAP

vAoMapUv = ( tileTransform * (aoMapTransform * vec3( AOMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_BUMPMAP

vBumpMapUv = ( tileTransform * (bumpMapTransform * vec3( BUMPMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_NORMALMAP

vNormalMapUv = ( tileTransform * (normalMapTransform * vec3( NORMALMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_DISPLACEMENTMAP

vDisplacementMapUv = ( tileTransform * (displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_EMISSIVEMAP

vEmissiveMapUv = ( tileTransform * (emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_METALNESSMAP

vMetalnessMapUv = ( tileTransform * (metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_ROUGHNESSMAP

vRoughnessMapUv = ( tileTransform * (roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_ANISOTROPYMAP

vAnisotropyMapUv = ( tileTransform * (anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_CLEARCOATMAP

vClearcoatMapUv = ( tileTransform * (clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

vClearcoatNormalMapUv = ( tileTransform * (clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

vClearcoatRoughnessMapUv = ( tileTransform * (clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_IRIDESCENCEMAP

vIridescenceMapUv = ( tileTransform * (iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

vIridescenceThicknessMapUv = ( tileTransform * (iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_SHEEN_COLORMAP

vSheenColorMapUv = ( tileTransform * (sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

vSheenRoughnessMapUv = ( tileTransform * (sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_SPECULARMAP

vSpecularMapUv = ( tileTransform * (specularMapTransform * vec3( SPECULARMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_SPECULAR_COLORMAP

vSpecularColorMapUv = ( tileTransform * (specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

vSpecularIntensityMapUv = ( tileTransform * (specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_TRANSMISSIONMAP

vTransmissionMapUv = ( tileTransform * transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) )).xy;

#endif
#ifdef USE_THICKNESSMAP

vThicknessMapUv = ( tileTransform * thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) )).xy;

#endif

`,ds=Vt;function Fy(){ds.tile_pars_vertex=Dy,ds.tile_vertex=Oy,ds.tile_pars_fragment=Ly,ds.tile_fragment=Uy,ds.soft_pars_vertex=Iy,ds.soft_vertex=Ny,ds.soft_pars_fragment=Py,ds.soft_fragment=Ry}var fd=class extends Ne{constructor(t){super(),this.type="ParticleEmitter",this.system=t}clone(){let t=this.system.clone();return t.emitter.copy(this,!0),t.emitter}dispose(){}extractFromCache(t){let e=[];for(let i in t){let s=t[i];delete s.metadata,e.push(s)}return e}toJSON(t,e={}){let i=this.children;this.children=this.children.filter(r=>r.type!=="ParticleSystemPreview");let s=super.toJSON(t);return this.children=i,this.system!==null&&(s.object.ps=this.system.toJSON(t,e)),s}},pt;(function(n){n[n.BillBoard=0]="BillBoard",n[n.StretchedBillBoard=1]="StretchedBillBoard",n[n.Mesh=2]="Mesh",n[n.Trail=3]="Trail",n[n.HorizontalBillBoard=4]="HorizontalBillBoard",n[n.VerticalBillBoard=5]="VerticalBillBoard"})(pt||(pt={}));var oh=class extends Ce{constructor(t){super(),this.type="VFXBatch",this.maxParticles=1e3,this.systems=new Set;let e=new an;e.mask=t.layers.mask;let i=t.material.clone();i.defines={},Object.assign(i.defines,t.material.defines),this.settings={instancingGeometry:t.instancingGeometry,renderMode:t.renderMode,renderOrder:t.renderOrder,material:i,uTileCount:t.uTileCount,vTileCount:t.vTileCount,blendTiles:t.blendTiles,softParticles:t.softParticles,softNearFade:t.softNearFade,softFarFade:t.softFarFade,layers:e},this.frustumCulled=!1,this.renderOrder=this.settings.renderOrder}addSystem(t){this.systems.add(t)}removeSystem(t){this.systems.delete(t)}applyDepthTexture(t){let e=this.material.uniforms.depthTexture;e&&e.value!==t&&(e.value=t,this.material.needsUpdate=!0)}getVisibleSystems(){return Array.from(this.systems).filter(t=>t.emitter.visible)}},By=new ut(0,0,1),ud=new oe,zy=new ut,ky=new ut;new ut;var Zp=60,sh=new Fn(1,1,1,1),yn=class n{set time(t){this.emissionState.time=t}get time(){return this.emissionState.time}get layers(){return this.rendererSettings.layers}get texture(){return this.rendererSettings.material.map}set texture(t){this.rendererSettings.material.map=t,this.neededToUpdateRender=!0}get material(){return this.rendererSettings.material}set material(t){this.rendererSettings.material=t,this.neededToUpdateRender=!0}get uTileCount(){return this.rendererSettings.uTileCount}set uTileCount(t){this.rendererSettings.uTileCount=t,this.neededToUpdateRender=!0}get vTileCount(){return this.rendererSettings.vTileCount}set vTileCount(t){this.rendererSettings.vTileCount=t,this.neededToUpdateRender=!0}get blendTiles(){return this.rendererSettings.blendTiles}set blendTiles(t){this.rendererSettings.blendTiles=t,this.neededToUpdateRender=!0}get softParticles(){return this.rendererSettings.softParticles}set softParticles(t){this.rendererSettings.softParticles=t,this.neededToUpdateRender=!0}get softNearFade(){return this.rendererSettings.softNearFade}set softNearFade(t){this.rendererSettings.softNearFade=t,this.neededToUpdateRender=!0}get softFarFade(){return this.rendererSettings.softFarFade}set softFarFade(t){this.rendererSettings.softFarFade=t,this.neededToUpdateRender=!0}get instancingGeometry(){return this.rendererSettings.instancingGeometry}set instancingGeometry(t){this.restart(),this.particles.length=0,this.rendererSettings.instancingGeometry=t,this.neededToUpdateRender=!0}get renderMode(){return this.rendererSettings.renderMode}set renderMode(t){if(this.rendererSettings.renderMode!==t){let e=!1;switch(this.rendererSettings.renderMode===pt.Trail&&(e=!0),this.rendererSettings.renderMode===pt.Mesh&&(this.startRotation=new Bt(0)),t){case pt.Trail:this.rendererEmitterSettings={startLength:new Bt(30),followLocalOrigin:!1},e=!0;break;case pt.Mesh:this.rendererEmitterSettings={geometry:sh},this.startRotation=new Qo(new ut(0,1,0),new Bt(0));break;case pt.StretchedBillBoard:this.rendererEmitterSettings={speedFactor:0,lengthFactor:2},this.rendererSettings.instancingGeometry=sh;break;case pt.BillBoard:case pt.VerticalBillBoard:case pt.HorizontalBillBoard:this.rendererEmitterSettings={},this.rendererSettings.instancingGeometry=sh;break}this.rendererSettings.renderMode=t,e&&(this.restart(),this.particles.length=0),this.neededToUpdateRender=!0}}get renderOrder(){return this.rendererSettings.renderOrder}set renderOrder(t){this.rendererSettings.renderOrder=t,this.neededToUpdateRender=!0}get blending(){return this.rendererSettings.material.blending}set blending(t){this.rendererSettings.material.blending=t,this.neededToUpdateRender=!0}constructor(t){if(this.temp=new ut,this.travelDistance=0,this.normalMatrix=new gn,this.memory=[],this.listeners={},this.firstTimeUpdate=!0,this.autoDestroy=t.autoDestroy===void 0?!1:t.autoDestroy,this.duration=t.duration??1,this.looping=t.looping===void 0?!0:t.looping,this.prewarm=t.prewarm===void 0?!1:t.prewarm,this.startLife=t.startLife??new Bt(5),this.startSpeed=t.startSpeed??new Bt(0),this.startRotation=t.startRotation??new Bt(0),this.startSize=t.startSize??new Bt(1),this.startColor=t.startColor??new Or(new _e(1,1,1,1)),this.emissionOverTime=t.emissionOverTime??new Bt(10),this.emissionOverDistance=t.emissionOverDistance??new Bt(0),this.emissionBursts=t.emissionBursts??[],this.onlyUsedByOther=t.onlyUsedByOther??!1,this.emitterShape=t.shape??new Vn,this.behaviors=t.behaviors??new Array,this.worldSpace=t.worldSpace??!1,this.rendererEmitterSettings=t.rendererEmitterSettings??{},t.renderMode===pt.StretchedBillBoard){let e=this.rendererEmitterSettings;t.speedFactor!==void 0&&(e.speedFactor=t.speedFactor),e.speedFactor=e.speedFactor??0,e.lengthFactor=e.lengthFactor??0}this.rendererSettings={instancingGeometry:t.instancingGeometry??sh,renderMode:t.renderMode??pt.BillBoard,renderOrder:t.renderOrder??0,material:t.material,uTileCount:t.uTileCount??1,vTileCount:t.vTileCount??1,blendTiles:t.blendTiles??!1,softParticles:t.softParticles??!1,softNearFade:t.softNearFade??0,softFarFade:t.softFarFade??0,layers:t.layers??new an},this.neededToUpdateRender=!0,this.particles=new Array,this.startTileIndex=t.startTileIndex||new Bt(0),this.emitter=new fd(this),this.paused=!1,this.particleNum=0,this.emissionState={isBursting:!1,burstParticleIndex:0,burstParticleCount:0,burstIndex:0,burstWaveIndex:0,time:0,waitEmiting:0,travelDistance:0},this.emissionBursts.forEach(e=>e.count.startGen(this.memory)),this.emissionOverDistance.startGen(this.memory),this.emitEnded=!1,this.markForDestroy=!1,this.prewarmed=!1}pause(){this.paused=!0}play(){this.paused=!1}stop(){this.restart(),this.pause()}spawn(t,e,i){ud.setFromRotationMatrix(i);let s=zy,r=ud,o=ky;i.decompose(s,r,o);for(let a=0;a<t;a++){for(e.burstParticleIndex=a,this.particleNum++;this.particles.length<this.particleNum;)this.rendererSettings.renderMode===pt.Trail?this.particles.push(new kr):this.particles.push(new Wc);let l=this.particles[this.particleNum-1];if(l.reset(),l.speedModifier=1,this.startColor.startGen(l.memory),this.startColor.genColor(l.memory,l.startColor,this.emissionState.time),l.color.copy(l.startColor),this.startSpeed.startGen(l.memory),l.startSpeed=this.startSpeed.genValue(l.memory,e.time/this.duration),this.startLife.startGen(l.memory),l.life=this.startLife.genValue(l.memory,e.time/this.duration),l.age=0,this.startSize.startGen(l.memory),this.startSize.type==="vec3function")this.startSize.genValue(l.memory,l.startSize,e.time/this.duration);else{let c=this.startSize.genValue(l.memory,e.time/this.duration);l.startSize.set(c,c,c)}if(this.startTileIndex.startGen(l.memory),l.uvTile=this.startTileIndex.genValue(l.memory),l.size.copy(l.startSize),this.rendererSettings.renderMode===pt.Mesh||this.rendererSettings.renderMode===pt.BillBoard||this.rendererSettings.renderMode===pt.VerticalBillBoard||this.rendererSettings.renderMode===pt.HorizontalBillBoard||this.rendererSettings.renderMode===pt.StretchedBillBoard){let c=l;this.startRotation.startGen(l.memory),this.rendererSettings.renderMode===pt.Mesh?(c.rotation instanceof oe||(c.rotation=new oe),this.startRotation.type==="rotation"?this.startRotation.genValue(l.memory,c.rotation,1,e.time/this.duration):c.rotation.setFromAxisAngle(By,this.startRotation.genValue(c.memory,e.time/this.duration))):this.startRotation.type==="rotation"?c.rotation=0:c.rotation=this.startRotation.genValue(c.memory,e.time/this.duration)}else if(this.rendererSettings.renderMode===pt.Trail){let c=l;this.rendererEmitterSettings.startLength.startGen(c.memory),c.length=this.rendererEmitterSettings.startLength.genValue(c.memory,e.time/this.duration)}if(this.emitterShape.initialize(l,e),this.rendererSettings.renderMode===pt.Trail&&this.rendererEmitterSettings.followLocalOrigin){let c=l;c.localPosition=new ut().copy(c.position)}this.worldSpace?(l.position.applyMatrix4(i),l.startSize.multiply(o).abs(),l.size.copy(l.startSize),l.velocity.multiply(o).applyMatrix3(this.normalMatrix),l.rotation&&l.rotation instanceof oe&&l.rotation.multiplyQuaternions(ud,l.rotation)):this.onlyUsedByOther&&(l.parentMatrix=i);for(let c=0;c<this.behaviors.length;c++)this.behaviors[c].initialize(l,this)}}endEmit(){this.emitEnded=!0,this.autoDestroy&&(this.markForDestroy=!0),this.fire({type:"emitEnd",particleSystem:this})}dispose(){this._renderer&&this._renderer.deleteSystem(this),this.emitter.dispose(),this.emitter.parent&&this.emitter.parent.remove(this.emitter),this.fire({type:"destroy",particleSystem:this})}restart(){this.memory.length=0,this.paused=!1,this.particleNum=0,this.emissionState.isBursting=!1,this.emissionState.burstIndex=0,this.emissionState.burstWaveIndex=0,this.emissionState.time=0,this.emissionState.waitEmiting=0,this.behaviors.forEach(t=>{t.reset()}),this.emitEnded=!1,this.markForDestroy=!1,this.prewarmed=!1,this.emissionBursts.forEach(t=>t.count.startGen(this.memory)),this.emissionOverDistance.startGen(this.memory)}update(t){if(this.paused)return;let e=this.emitter;for(;e.parent;)e=e.parent;if(e.type!=="Scene"){this.dispose();return}if(this.firstTimeUpdate&&(this.firstTimeUpdate=!1,this.emitter.updateWorldMatrix(!0,!1)),this.emitEnded&&this.particleNum===0){this.markForDestroy&&this.emitter.parent&&this.dispose();return}if(this.looping&&this.prewarm&&!this.prewarmed){this.prewarmed=!0;for(let i=0;i<this.duration*Zp;i++)this.update(1/Zp)}t>.1&&(t=.1),this.neededToUpdateRender&&(this._renderer&&this._renderer.updateSystem(this),this.neededToUpdateRender=!1),this.onlyUsedByOther||this.emit(t,this.emissionState,this.emitter.matrixWorld),this.emitterShape.update(this,t);for(let i=0;i<this.behaviors.length;i++){this.behaviors[i].frameUpdate(t);for(let s=0;s<this.particleNum;s++)this.particles[s].died||this.behaviors[i].update(this.particles[s],t)}for(let i=0;i<this.particleNum;i++)this.rendererEmitterSettings.followLocalOrigin&&this.particles[i].localPosition?(this.particles[i].position.copy(this.particles[i].localPosition),this.particles[i].parentMatrix?this.particles[i].position.applyMatrix4(this.particles[i].parentMatrix):this.particles[i].position.applyMatrix4(this.emitter.matrixWorld)):this.particles[i].position.addScaledVector(this.particles[i].velocity,t*this.particles[i].speedModifier),this.particles[i].age+=t;if(this.rendererSettings.renderMode===pt.Trail)for(let i=0;i<this.particleNum;i++)this.particles[i].update();for(let i=0;i<this.particleNum;i++){let s=this.particles[i];s.died&&(!(s instanceof kr)||s.previous.length===0)&&(this.particles[i]=this.particles[this.particleNum-1],this.particles[this.particleNum-1]=s,this.particleNum--,i--,this.fire({type:"particleDied",particleSystem:this,particle:s}))}}emit(t,e,i){e.time>this.duration&&(this.looping?(e.time-=this.duration,e.burstIndex=0,this.behaviors.forEach(r=>{r.reset()})):!this.emitEnded&&!this.onlyUsedByOther&&this.endEmit()),this.normalMatrix.getNormalMatrix(i);let s=Math.ceil(e.waitEmiting);for(this.spawn(s,e,i),e.waitEmiting-=s;e.burstIndex<this.emissionBursts.length&&this.emissionBursts[e.burstIndex].time<=e.time;){if(Math.random()<this.emissionBursts[e.burstIndex].probability){let r=this.emissionBursts[e.burstIndex].count.genValue(this.memory,this.time);e.isBursting=!0,e.burstParticleCount=r,this.spawn(r,e,i),e.isBursting=!1}e.burstIndex++}if(!this.emitEnded&&(e.waitEmiting+=t*this.emissionOverTime.genValue(this.memory,e.time/this.duration),e.previousWorldPos!=null)){this.temp.set(i.elements[12],i.elements[13],i.elements[14]),e.travelDistance+=e.previousWorldPos.distanceTo(this.temp);let r=this.emissionOverDistance.genValue(this.memory,e.time/this.duration);if(e.travelDistance*r>0){let o=Math.floor(e.travelDistance*r);e.travelDistance-=o/r,e.waitEmiting+=o}}e.previousWorldPos===void 0&&(e.previousWorldPos=new ut),e.previousWorldPos.set(i.elements[12],i.elements[13],i.elements[14]),e.time+=t}toJSON(t,e={}){if((t===void 0||typeof t=="string")&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}}),t.materials[this.rendererSettings.material.uuid]=this.rendererSettings.material.toJSON(t),e.useUrlForImage&&this.texture?.source!==void 0){let o=this.texture.source;t.images[o.uuid]={uuid:o.uuid,url:this.texture.image.url}}let s;this.renderMode===pt.Trail?s={startLength:this.rendererEmitterSettings.startLength.toJSON(),followLocalOrigin:this.rendererEmitterSettings.followLocalOrigin}:this.renderMode===pt.Mesh?s={}:this.renderMode===pt.StretchedBillBoard?s={speedFactor:this.rendererEmitterSettings.speedFactor,lengthFactor:this.rendererEmitterSettings.lengthFactor}:s={};let r=this.rendererSettings.instancingGeometry;return t.geometries&&!t.geometries[r.uuid]&&(t.geometries[r.uuid]=r.toJSON()),{version:"3.0",autoDestroy:this.autoDestroy,looping:this.looping,prewarm:this.prewarm,duration:this.duration,shape:this.emitterShape.toJSON(),startLife:this.startLife.toJSON(),startSpeed:this.startSpeed.toJSON(),startRotation:this.startRotation.toJSON(),startSize:this.startSize.toJSON(),startColor:this.startColor.toJSON(),emissionOverTime:this.emissionOverTime.toJSON(),emissionOverDistance:this.emissionOverDistance.toJSON(),emissionBursts:this.emissionBursts.map(o=>({time:o.time,count:o.count.toJSON(),probability:o.probability,interval:o.interval,cycle:o.cycle})),onlyUsedByOther:this.onlyUsedByOther,instancingGeometry:this.rendererSettings.instancingGeometry.uuid,renderOrder:this.renderOrder,renderMode:this.renderMode,rendererEmitterSettings:s,material:this.rendererSettings.material.uuid,layers:this.layers.mask,startTileIndex:this.startTileIndex.toJSON(),uTileCount:this.uTileCount,vTileCount:this.vTileCount,blendTiles:this.blendTiles,softParticles:this.rendererSettings.softParticles,softFarFade:this.rendererSettings.softFarFade,softNearFade:this.rendererSettings.softNearFade,behaviors:this.behaviors.map(o=>o.toJSON()),worldSpace:this.worldSpace}}static fromJSON(t,e,i){let s=qp(t.shape,e),r;if(t.renderMode===pt.Trail){let l=t.rendererEmitterSettings;r={startLength:l.startLength!=null?Ht(l.startLength):new Bt(30),followLocalOrigin:l.followLocalOrigin}}else t.renderMode===pt.Mesh?r={}:t.renderMode===pt.StretchedBillBoard?(r=t.rendererEmitterSettings,t.speedFactor!=null&&(r.speedFactor=t.speedFactor)):r={};let o=new an;t.layers&&(o.mask=t.layers);let a=new n({autoDestroy:t.autoDestroy,looping:t.looping,prewarm:t.prewarm,duration:t.duration,shape:s,startLife:Ht(t.startLife),startSpeed:Ht(t.startSpeed),startRotation:ta(t.startRotation),startSize:ta(t.startSize),startColor:nh(t.startColor),emissionOverTime:Ht(t.emissionOverTime),emissionOverDistance:Ht(t.emissionOverDistance),emissionBursts:t.emissionBursts?.map(l=>({time:l.time,count:typeof l.count=="number"?new Bt(l.count):Ht(l.count),probability:l.probability??1,interval:l.interval??.1,cycle:l.cycle??1})),onlyUsedByOther:t.onlyUsedByOther,instancingGeometry:e.geometries[t.instancingGeometry],renderMode:t.renderMode,rendererEmitterSettings:r,renderOrder:t.renderOrder,layers:o,material:t.material?e.materials[t.material]:t.texture?new ci({map:e.textures[t.texture],transparent:t.transparent??!0,blending:t.blending,side:Ye}):new ci({color:16777215,transparent:!0,blending:wi,side:Ye}),startTileIndex:typeof t.startTileIndex=="number"?new Bt(t.startTileIndex):Ht(t.startTileIndex),uTileCount:t.uTileCount,vTileCount:t.vTileCount,blendTiles:t.blendTiles,softParticles:t.softParticles,softFarFade:t.softFarFade,softNearFade:t.softNearFade,behaviors:[],worldSpace:t.worldSpace});return a.behaviors=t.behaviors.map(l=>{let c=Yp(l,a);return c&&c.type==="EmitSubParticleSystem"&&(i[l.subParticleSystem]=c),c}).filter(l=>l!==null),a}addBehavior(t){this.behaviors.push(t)}getRendererSettings(){return this.rendererSettings}addEventListener(t,e){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push(e)}removeAllEventListeners(t){this.listeners[t]&&(this.listeners[t]=[])}removeEventListener(t,e){if(this.listeners[t]){let i=this.listeners[t].indexOf(e);i!==-1&&this.listeners[t].splice(i,1)}}fire(t){this.listeners[t.type]&&this.listeners[t.type].forEach(e=>e(t))}clone(){let t=[];for(let r of this.emissionBursts){let o={};Object.assign(o,r),t.push(o)}let e=[];for(let r of this.behaviors)e.push(r.clone());let i;this.renderMode===pt.Trail?i={startLength:this.rendererEmitterSettings.startLength.clone(),followLocalOrigin:this.rendererEmitterSettings.followLocalOrigin}:this.renderMode===pt.StretchedBillBoard?i={lengthFactor:this.rendererEmitterSettings.lengthFactor,speedFactor:this.rendererEmitterSettings.speedFactor}:i={};let s=new an;return s.mask=this.layers.mask,new n({autoDestroy:this.autoDestroy,looping:this.looping,duration:this.duration,shape:this.emitterShape.clone(),startLife:this.startLife.clone(),startSpeed:this.startSpeed.clone(),startRotation:this.startRotation.clone(),startSize:this.startSize.clone(),startColor:this.startColor.clone(),emissionOverTime:this.emissionOverTime.clone(),emissionOverDistance:this.emissionOverDistance.clone(),emissionBursts:t,onlyUsedByOther:this.onlyUsedByOther,instancingGeometry:this.rendererSettings.instancingGeometry,renderMode:this.renderMode,renderOrder:this.renderOrder,rendererEmitterSettings:i,material:this.rendererSettings.material,startTileIndex:this.startTileIndex,uTileCount:this.uTileCount,vTileCount:this.vTileCount,blendTiles:this.blendTiles,softParticles:this.softParticles,softFarFade:this.softFarFade,softNearFade:this.softNearFade,behaviors:e,worldSpace:this.worldSpace,layers:s})}},dd=`

#include <common>
#include <color_pars_fragment>
#include <map_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
#include <alphatest_pars_fragment>

#include <tile_pars_fragment>
#include <soft_pars_fragment>

void main() {

    #include <clipping_planes_fragment>
    
    vec3 outgoingLight = vec3( 0.0 );
    vec4 diffuseColor = vColor;
    
    #include <logdepthbuf_fragment>
    
    #include <tile_fragment>
    #include <alphatest_fragment>

    outgoingLight = diffuseColor.rgb;
    
    #ifdef USE_COLOR_AS_ALPHA
    gl_FragColor = vec4( outgoingLight, diffuseColor.r );
    #else
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #endif
    
    #include <soft_fragment>
    #include <tonemapping_fragment>
}
`,yd=`
#define STANDARD

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

// accumulation
#include <lights_physical_fragment>
#include <lights_fragment_begin>
#include <lights_fragment_maps>
#include <lights_fragment_end>

// modulation
#include <aomap_fragment>

vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

#include <transmission_fragment>

vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

#ifdef USE_SHEEN

// Sheen energy compensation approximation calculation can be found at the end of
// https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
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
}`,Vy=`
#include <common>
#include <color_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#include <tile_pars_vertex>
#include <soft_pars_vertex>

attribute vec3 offset;
attribute float rotation;
attribute vec3 size;

void main() {
	
    vec2 alignedPosition = position.xy * size.xy;
    
    vec2 rotatedPosition;
    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
#ifdef HORIZONTAL
    vec4 mvPosition = modelMatrix * vec4( offset, 1.0 );
    mvPosition.x += rotatedPosition.x;
    mvPosition.z -= rotatedPosition.y;
    mvPosition = viewMatrix * mvPosition;
#elif defined(VERTICAL)
    vec4 mvPosition = modelMatrix * vec4( offset, 1.0 );
    mvPosition.y += rotatedPosition.y;
    mvPosition = viewMatrix * mvPosition;
    mvPosition.x += rotatedPosition.x;
#else
    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
    mvPosition.xy += rotatedPosition;
#endif

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>

	#include <clipping_planes_vertex>

	#include <tile_vertex>
	#include <soft_vertex>
}
`,Gy=`
#include <common>
#include <color_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#include <tile_pars_vertex>
#include <soft_pars_vertex>

attribute vec3 offset;
attribute vec4 rotation;
attribute vec3 size;
// attribute vec4 color;

void main() {

    float x2 = rotation.x + rotation.x, y2 = rotation.y + rotation.y, z2 = rotation.z + rotation.z;
    float xx = rotation.x * x2, xy = rotation.x * y2, xz = rotation.x * z2;
    float yy = rotation.y * y2, yz = rotation.y * z2, zz = rotation.z * z2;
    float wx = rotation.w * x2, wy = rotation.w * y2, wz = rotation.w * z2;
    float sx = size.x, sy = size.y, sz = size.z;
    
    mat4 matrix = mat4(( 1.0 - ( yy + zz ) ) * sx, ( xy + wz ) * sx, ( xz - wy ) * sx, 0.0,  // 1. column
                      ( xy - wz ) * sy, ( 1.0 - ( xx + zz ) ) * sy, ( yz + wx ) * sy, 0.0,  // 2. column
                      ( xz + wy ) * sz, ( yz - wx ) * sz, ( 1.0 - ( xx + yy ) ) * sz, 0.0,  // 3. column
                      offset.x, offset.y, offset.z, 1.0);
    
    vec4 mvPosition = modelViewMatrix * (matrix * vec4( position, 1.0 ));

	vColor = color;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
    #include <tile_vertex>
    #include <soft_vertex>
}
`,vd=`
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>

attribute vec3 offset;
attribute vec4 rotation;
attribute vec3 size;
#include <tile_pars_vertex>
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

    #include <tile_vertex>
    float x2 = rotation.x + rotation.x, y2 = rotation.y + rotation.y, z2 = rotation.z + rotation.z;
    float xx = rotation.x * x2, xy = rotation.x * y2, xz = rotation.x * z2;
    float yy = rotation.y * y2, yz = rotation.y * z2, zz = rotation.z * z2;
    float wx = rotation.w * x2, wy = rotation.w * y2, wz = rotation.w * z2;
    float sx = size.x, sy = size.y, sz = size.z;

    mat4 particleMatrix = mat4(( 1.0 - ( yy + zz ) ) * sx, ( xy + wz ) * sx, ( xz - wy ) * sx, 0.0,  // 1. column
                      ( xy - wz ) * sy, ( 1.0 - ( xx + zz ) ) * sy, ( yz + wx ) * sy, 0.0,  // 2. column
                      ( xz + wy ) * sz, ( yz - wx ) * sz, ( 1.0 - ( xx + yy ) ) * sz, 0.0,  // 3. column
                      offset.x, offset.y, offset.z, 1.0);

#include <color_vertex>
#include <morphinstance_vertex>
#include <morphcolor_vertex>
#include <batching_vertex>

#include <beginnormal_vertex>
#include <morphnormal_vertex>
#include <skinbase_vertex>
#include <skinnormal_vertex>

	// replace defaultnormal_vertex
	vec3 transformedNormal = objectNormal;
    mat3 m = mat3( particleMatrix );
    transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
    transformedNormal = m * transformedNormal;
    transformedNormal = normalMatrix * transformedNormal;
    #ifdef FLIP_SIDED
        transformedNormal = - transformedNormal;
    #endif
    #ifdef USE_TANGENT
        vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
        #ifdef FLIP_SIDED
        transformedTangent = - transformedTangent;
        #endif
    #endif

	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

	// replace include <project_vertex>
  vec4 mvPosition = vec4( transformed, 1.0 );
  mvPosition = modelViewMatrix * (particleMatrix * mvPosition);
	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	
	vViewPosition = - mvPosition.xyz;
	
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
    vWorldPosition = worldPosition.xyz;
#endif
}
`,Hy=`
#include <common>
#include <color_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#include <tile_pars_vertex>
#include <soft_pars_vertex>

attribute vec3 offset;
attribute float rotation;
attribute vec3 size;
attribute vec4 velocity;

uniform float speedFactor;

void main() {
    float lengthFactor = velocity.w;
    float avgSize = (size.x + size.y) * 0.5;
#ifdef USE_SKEW
    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
    vec3 viewVelocity = normalMatrix * velocity.xyz;

    vec3 scaledPos = vec3(position.xy * size.xy, position.z);
    float vlength = length(viewVelocity);
    vec3 projVelocity =  dot(scaledPos, viewVelocity) * viewVelocity / vlength;
    mvPosition.xyz += scaledPos + projVelocity * (speedFactor / avgSize + lengthFactor / vlength);
#else
    vec4 mvPosition = modelViewMatrix * vec4( offset, 1.0 );
    vec3 viewVelocity = normalMatrix * velocity.xyz;
    float vlength = length(viewVelocity); 
    mvPosition.xyz += position.y * normalize(cross(mvPosition.xyz, viewVelocity)) * avgSize; // switch the cross to  match unity implementation
    mvPosition.xyz -= (position.x + 0.5) * viewVelocity * (1.0 + lengthFactor / vlength) * avgSize; // minus position.x to match unity implementation
#endif
	vColor = color;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <tile_vertex>
	#include <soft_vertex>
}
`;function pd(n){return n===0?"uv":`uv${n}`}var md=class extends Ke{constructor(t){super(t)}onBeforeCompile(t,e){super.onBeforeCompile(t,e),t.vertexShader=vd,t.fragmentShader=yd}},gd=class extends No{constructor(t){super(t)}onBeforeCompile(t,e){super.onBeforeCompile(t,e),t.vertexShader=vd,t.fragmentShader=yd}},_d=class extends oh{constructor(t){super(t),this.vector_=new ut,this.vector2_=new ut,this.vector3_=new ut,this.quaternion_=new oe,this.quaternion2_=new oe,this.quaternion3_=new oe,this.rotationMat_=new gn,this.rotationMat2_=new gn,this.maxParticles=1e3,this.setupBuffers(),this.rebuildMaterial()}buildExpandableBuffers(){this.offsetBuffer=new Li(new Float32Array(this.maxParticles*3),3),this.offsetBuffer.setUsage(Qe),this.geometry.setAttribute("offset",this.offsetBuffer),this.colorBuffer=new Li(new Float32Array(this.maxParticles*4),4),this.colorBuffer.setUsage(Qe),this.geometry.setAttribute("color",this.colorBuffer),this.settings.renderMode===pt.Mesh?(this.rotationBuffer=new Li(new Float32Array(this.maxParticles*4),4),this.rotationBuffer.setUsage(Qe),this.geometry.setAttribute("rotation",this.rotationBuffer)):(this.settings.renderMode===pt.BillBoard||this.settings.renderMode===pt.HorizontalBillBoard||this.settings.renderMode===pt.VerticalBillBoard||this.settings.renderMode===pt.StretchedBillBoard)&&(this.rotationBuffer=new Li(new Float32Array(this.maxParticles),1),this.rotationBuffer.setUsage(Qe),this.geometry.setAttribute("rotation",this.rotationBuffer)),this.sizeBuffer=new Li(new Float32Array(this.maxParticles*3),3),this.sizeBuffer.setUsage(Qe),this.geometry.setAttribute("size",this.sizeBuffer),this.uvTileBuffer=new Li(new Float32Array(this.maxParticles),1),this.uvTileBuffer.setUsage(Qe),this.geometry.setAttribute("uvTile",this.uvTileBuffer),this.settings.renderMode===pt.StretchedBillBoard&&(this.velocityBuffer=new Li(new Float32Array(this.maxParticles*4),4),this.velocityBuffer.setUsage(Qe),this.geometry.setAttribute("velocity",this.velocityBuffer))}setupBuffers(){this.geometry&&this.geometry.dispose(),this.geometry=new Do,this.geometry.setIndex(this.settings.instancingGeometry.getIndex()),this.settings.instancingGeometry.hasAttribute("normal")&&this.geometry.setAttribute("normal",this.settings.instancingGeometry.getAttribute("normal")),this.geometry.setAttribute("position",this.settings.instancingGeometry.getAttribute("position")),this.settings.instancingGeometry.hasAttribute("uv")&&this.geometry.setAttribute("uv",this.settings.instancingGeometry.getAttribute("uv")),this.buildExpandableBuffers()}expandBuffers(t){for(;t>=this.maxParticles;)this.maxParticles*=2;this.setupBuffers()}rebuildMaterial(){this.layers.mask=this.settings.layers.mask;let t={},e={};this.settings.material.type!=="MeshStandardMaterial"&&this.settings.material.type!=="MeshPhysicalMaterial"&&(t.map=new ui(this.settings.material.map)),this.settings.material.alphaTest&&(e.USE_ALPHATEST="",t.alphaTest=new ui(this.settings.material.alphaTest)),e.USE_UV="";let i=this.settings.uTileCount,s=this.settings.vTileCount;(i>1||s>1)&&(e.UV_TILE="",t.tileCount=new ui(new zn(i,s))),this.settings.material.defines&&this.settings.material.defines.USE_COLOR_AS_ALPHA!==void 0&&(e.USE_COLOR_AS_ALPHA=""),this.settings.material.normalMap&&(e.USE_NORMALMAP="",e.NORMALMAP_UV=pd(this.settings.material.normalMap.channel),t.normalMapTransform=new ui(new gn().copy(this.settings.material.normalMap.matrix))),this.settings.material.map&&(e.USE_MAP="",this.settings.blendTiles&&(e.TILE_BLEND=""),e.MAP_UV=pd(this.settings.material.map.channel),t.mapTransform=new ui(new gn().copy(this.settings.material.map.matrix))),e.USE_COLOR_ALPHA="";let r;if(this.settings.softParticles){e.SOFT_PARTICLES="";let a=this.settings.softNearFade,l=1/(this.settings.softFarFade-this.settings.softNearFade);t.softParams=new ui(new zn(a,l)),t.depthTexture=new ui(null);let c=t.projParams=new ui(new _e);r=(h,u,f)=>{c.value.set(f.near,f.far,0,0)}}let o=!1;if(this.settings.renderMode===pt.BillBoard||this.settings.renderMode===pt.VerticalBillBoard||this.settings.renderMode===pt.HorizontalBillBoard||this.settings.renderMode===pt.Mesh){let a,l;this.settings.renderMode===pt.Mesh?this.settings.material.type==="MeshStandardMaterial"||this.settings.material.type==="MeshPhysicalMaterial"?(e.USE_COLOR="",a=vd,l=yd,o=!0):(a=Gy,l=dd):(a=Vy,l=dd),this.settings.renderMode===pt.VerticalBillBoard?e.VERTICAL="":this.settings.renderMode===pt.HorizontalBillBoard&&(e.HORIZONTAL="");let c=!1;this.settings.renderMode===pt.Mesh&&(this.settings.material.type==="MeshStandardMaterial"?(this.material=new md({}),this.material.copy(this.settings.material),this.material.uniforms=t,this.material.defines=e,c=!0):this.settings.material.type==="MeshPhysicalMaterial"&&(this.material=new gd({}),this.material.copy(this.settings.material),this.material.uniforms=t,this.material.defines=e,c=!0)),c||(this.material=new Fe({uniforms:t,defines:e,vertexShader:a,fragmentShader:l,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,blending:this.settings.material.blending,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha,side:this.settings.material.side,alphaTest:this.settings.material.alphaTest,depthTest:this.settings.material.depthTest,lights:o}))}else if(this.settings.renderMode===pt.StretchedBillBoard)t.speedFactor=new ui(1),this.material=new Fe({uniforms:t,defines:e,vertexShader:Hy,fragmentShader:dd,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,blending:this.settings.material.blending,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha,side:this.settings.material.side,alphaTest:this.settings.material.alphaTest,depthTest:this.settings.material.depthTest});else throw new Error("render mode unavailable");this.material&&r&&(this.material.onBeforeRender=r)}update(){let t=0,e=0,i=this.getVisibleSystems();for(let s of i)e+=s.particleNum;e>this.maxParticles&&this.expandBuffers(e);for(let s of i){s.emitter.updateMatrixWorld&&(s.emitter.updateWorldMatrix(!0,!1),s.emitter.updateMatrixWorld(!0));let r=s.particles,o=s.particleNum,a=this.quaternion2_,l=this.vector2_,c=this.vector3_;s.emitter.matrixWorld.decompose(l,a,c),this.rotationMat_.setFromMatrix4(s.emitter.matrixWorld);for(let h=0;h<o;h++,t++){let u=r[h];if(this.settings.renderMode===pt.Mesh){let d;if(s.worldSpace)d=u.rotation;else{let m;u.parentMatrix?m=this.quaternion3_.setFromRotationMatrix(u.parentMatrix):m=a,d=this.quaternion_,d.copy(m).multiply(u.rotation)}this.rotationBuffer.setXYZW(t,d.x,d.y,d.z,d.w)}else(this.settings.renderMode===pt.StretchedBillBoard||this.settings.renderMode===pt.VerticalBillBoard||this.settings.renderMode===pt.HorizontalBillBoard||this.settings.renderMode===pt.BillBoard)&&this.rotationBuffer.setX(t,u.rotation);let f;if(s.worldSpace?f=u.position:(f=this.vector_,u.parentMatrix?f.copy(u.position).applyMatrix4(u.parentMatrix):f.copy(u.position).applyMatrix4(s.emitter.matrixWorld)),this.offsetBuffer.setXYZ(t,f.x,f.y,f.z),this.colorBuffer.setXYZW(t,u.color.x,u.color.y,u.color.z,u.color.w),s.worldSpace?this.sizeBuffer.setXYZ(t,u.size.x,u.size.y,u.size.z):u.parentMatrix?this.sizeBuffer.setXYZ(t,u.size.x,u.size.y,u.size.z):this.sizeBuffer.setXYZ(t,u.size.x*Math.abs(c.x),u.size.y*Math.abs(c.y),u.size.z*Math.abs(c.z)),this.uvTileBuffer.setX(t,u.uvTile),this.settings.renderMode===pt.StretchedBillBoard&&this.velocityBuffer){let d=s.rendererEmitterSettings.speedFactor;d===0&&(d=.001);let m=s.rendererEmitterSettings.lengthFactor,_;s.worldSpace?_=u.velocity:(_=this.vector_,u.parentMatrix?(this.rotationMat2_.setFromMatrix4(u.parentMatrix),_.copy(u.velocity).applyMatrix3(this.rotationMat2_)):_.copy(u.velocity).applyMatrix3(this.rotationMat_)),this.velocityBuffer.setXYZW(t,_.x*d,_.y*d,_.z*d,m)}}}this.geometry.instanceCount=t,t>0&&(this.offsetBuffer.clearUpdateRanges(),this.offsetBuffer.addUpdateRange(0,t*3),this.offsetBuffer.needsUpdate=!0,this.sizeBuffer.clearUpdateRanges(),this.sizeBuffer.addUpdateRange(0,t*3),this.sizeBuffer.needsUpdate=!0,this.colorBuffer.clearUpdateRanges(),this.colorBuffer.addUpdateRange(0,t*4),this.colorBuffer.needsUpdate=!0,this.uvTileBuffer.clearUpdateRanges(),this.uvTileBuffer.addUpdateRange(0,t),this.uvTileBuffer.needsUpdate=!0,this.settings.renderMode===pt.StretchedBillBoard&&this.velocityBuffer&&(this.velocityBuffer.clearUpdateRanges(),this.velocityBuffer.addUpdateRange(0,t*4),this.velocityBuffer.needsUpdate=!0),this.settings.renderMode===pt.Mesh?(this.rotationBuffer.clearUpdateRanges(),this.rotationBuffer.addUpdateRange(0,t*4),this.rotationBuffer.needsUpdate=!0):(this.settings.renderMode===pt.StretchedBillBoard||this.settings.renderMode===pt.HorizontalBillBoard||this.settings.renderMode===pt.VerticalBillBoard||this.settings.renderMode===pt.BillBoard)&&(this.rotationBuffer.clearUpdateRanges(),this.rotationBuffer.addUpdateRange(0,t),this.rotationBuffer.needsUpdate=!0))}dispose(){this.geometry.dispose()}},Wy=`

#include <common>
#include <tile_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

uniform sampler2D alphaMap;
uniform float useAlphaMap;
uniform float visibility;
uniform float alphaTest;

varying vec4 vColor;
    
void main() {
    #include <clipping_planes_fragment>
    #include <logdepthbuf_fragment>

    vec4 diffuseColor = vColor;
    
    #ifdef USE_MAP
    #include <tile_fragment>
    #ifndef USE_COLOR_AS_ALPHA
    #endif
    #endif
    if( useAlphaMap == 1. ) diffuseColor.a *= texture2D( alphaMap, vUv).a;
    if( diffuseColor.a < alphaTest ) discard;
    gl_FragColor = diffuseColor;

    #include <fog_fragment>
    #include <tonemapping_fragment>
}`,Xy=`
#include <common>
#include <tile_pars_vertex>
#include <color_pars_vertex>
#include <clipping_planes_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <fog_pars_vertex>

attribute vec3 previous;
attribute vec3 next;
attribute float side;
attribute float width;

uniform vec2 resolution;
uniform float lineWidth;
uniform float sizeAttenuation;
    
vec2 fix(vec4 i, float aspect) {
    vec2 res = i.xy / i.w;
    res.x *= aspect;
    return res;
}
    
void main() {

    #include <tile_vertex>
    
    float aspect = resolution.x / resolution.y;

    vColor = color;

    mat4 m = projectionMatrix * modelViewMatrix;
    vec4 finalPosition = m * vec4( position, 1.0 );
    vec4 prevPos = m * vec4( previous, 1.0 );
    vec4 nextPos = m * vec4( next, 1.0 );

    vec2 currentP = fix( finalPosition, aspect );
    vec2 prevP = fix( prevPos, aspect );
    vec2 nextP = fix( nextPos, aspect );

    float w = lineWidth * width;

    vec2 dir;
    if( nextP == currentP ) dir = normalize( currentP - prevP );
    else if( prevP == currentP ) dir = normalize( nextP - currentP );
    else {
        vec2 dir1 = normalize( currentP - prevP );
        vec2 dir2 = normalize( nextP - currentP );
        dir = normalize( dir1 + dir2 );

        vec2 perp = vec2( -dir1.y, dir1.x );
        vec2 miter = vec2( -dir.y, dir.x );
        //w = clamp( w / dot( miter, perp ), 0., 4., * lineWidth * width );

    }

    //vec2 normal = ( cross( vec3( dir, 0. ) vec3( 0., 0., 1. ) ) ).xy;
    vec4 normal = vec4( -dir.y, dir.x, 0., 1. );
    normal.xy *= .5 * w;
    normal *= projectionMatrix;
    if( sizeAttenuation == 0. ) {
        normal.xy *= finalPosition.w;
        normal.xy /= ( vec4( resolution, 0., 1. ) * projectionMatrix ).xy;
    }

    finalPosition.xy += normal.xy * side;

    gl_Position = finalPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    
	#include <fog_vertex>
}`,xd=class extends oh{constructor(t){super(t),this.vector_=new ut,this.vector2_=new ut,this.vector3_=new ut,this.quaternion_=new oe,this.maxParticles=1e4,this.setupBuffers(),this.rebuildMaterial()}setupBuffers(){this.geometry&&this.geometry.dispose(),this.geometry=new me,this.indexBuffer=new Se(new Uint32Array(this.maxParticles*6),1),this.indexBuffer.setUsage(Qe),this.geometry.setIndex(this.indexBuffer),this.positionBuffer=new Se(new Float32Array(this.maxParticles*6),3),this.positionBuffer.setUsage(Qe),this.geometry.setAttribute("position",this.positionBuffer),this.previousBuffer=new Se(new Float32Array(this.maxParticles*6),3),this.previousBuffer.setUsage(Qe),this.geometry.setAttribute("previous",this.previousBuffer),this.nextBuffer=new Se(new Float32Array(this.maxParticles*6),3),this.nextBuffer.setUsage(Qe),this.geometry.setAttribute("next",this.nextBuffer),this.widthBuffer=new Se(new Float32Array(this.maxParticles*2),1),this.widthBuffer.setUsage(Qe),this.geometry.setAttribute("width",this.widthBuffer),this.sideBuffer=new Se(new Float32Array(this.maxParticles*2),1),this.sideBuffer.setUsage(Qe),this.geometry.setAttribute("side",this.sideBuffer),this.uvBuffer=new Se(new Float32Array(this.maxParticles*4),2),this.uvBuffer.setUsage(Qe),this.geometry.setAttribute("uv",this.uvBuffer),this.colorBuffer=new Se(new Float32Array(this.maxParticles*8),4),this.colorBuffer.setUsage(Qe),this.geometry.setAttribute("color",this.colorBuffer)}expandBuffers(t){for(;t>=this.maxParticles;)this.maxParticles*=2;this.setupBuffers()}rebuildMaterial(){this.layers.mask=this.settings.layers.mask;let t={lineWidth:{value:1},map:{value:null},useMap:{value:0},alphaMap:{value:null},useAlphaMap:{value:0},resolution:{value:new zn(1,1)},sizeAttenuation:{value:1},visibility:{value:1},alphaTest:{value:0}},e={};if(e.USE_UV="",e.USE_COLOR_ALPHA="",this.settings.material.map&&(e.USE_MAP="",e.MAP_UV=pd(this.settings.material.map.channel),t.map=new ui(this.settings.material.map),t.mapTransform=new ui(new gn().copy(this.settings.material.map.matrix))),this.settings.material.defines&&this.settings.material.defines.USE_COLOR_AS_ALPHA!==void 0&&(e.USE_COLOR_AS_ALPHA=""),this.settings.renderMode===pt.Trail)this.material=new Fe({uniforms:t,defines:e,vertexShader:Xy,fragmentShader:Wy,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,side:this.settings.material.side,blending:this.settings.material.blending||wi,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha});else throw new Error("render mode unavailable")}update(){let t=0,e=0,i=0,s=this.getVisibleSystems();for(let r of s)for(let o=0;o<r.particleNum;o++)i+=r.particles[o].previous.length*2;i>this.maxParticles&&this.expandBuffers(i);for(let r of s){r.emitter.updateMatrixWorld&&(r.emitter.updateWorldMatrix(!0,!1),r.emitter.updateMatrixWorld(!0));let o=this.quaternion_,a=this.vector2_,l=this.vector3_;r.emitter.matrixWorld.decompose(a,o,l);let c=r.particles,h=r.particleNum,u=this.settings.uTileCount,f=this.settings.vTileCount,d=1/u,m=1/f;for(let _=0;_<h;_++){let g=c[_],p=g.uvTile%f,w=Math.floor(g.uvTile/f+.001),M=g.previous.values(),v=M.next(),T=v.value,S=T;v.done||(v=M.next());let A;v.value!==void 0?A=v.value:A=S;for(let I=0;I<g.previous.length;I++,t+=2){if(this.positionBuffer.setXYZ(t,S.position.x,S.position.y,S.position.z),this.positionBuffer.setXYZ(t+1,S.position.x,S.position.y,S.position.z),r.worldSpace?(this.positionBuffer.setXYZ(t,S.position.x,S.position.y,S.position.z),this.positionBuffer.setXYZ(t+1,S.position.x,S.position.y,S.position.z)):(g.parentMatrix?this.vector_.copy(S.position).applyMatrix4(g.parentMatrix):this.vector_.copy(S.position).applyMatrix4(r.emitter.matrixWorld),this.positionBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.positionBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),r.worldSpace?(this.previousBuffer.setXYZ(t,T.position.x,T.position.y,T.position.z),this.previousBuffer.setXYZ(t+1,T.position.x,T.position.y,T.position.z)):(g.parentMatrix?this.vector_.copy(T.position).applyMatrix4(g.parentMatrix):this.vector_.copy(T.position).applyMatrix4(r.emitter.matrixWorld),this.previousBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.previousBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),r.worldSpace?(this.nextBuffer.setXYZ(t,A.position.x,A.position.y,A.position.z),this.nextBuffer.setXYZ(t+1,A.position.x,A.position.y,A.position.z)):(g.parentMatrix?this.vector_.copy(A.position).applyMatrix4(g.parentMatrix):this.vector_.copy(A.position).applyMatrix4(r.emitter.matrixWorld),this.nextBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.nextBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),this.sideBuffer.setX(t,1),this.sideBuffer.setX(t+1,-1),r.worldSpace)this.widthBuffer.setX(t,S.size),this.widthBuffer.setX(t+1,S.size);else if(g.parentMatrix)this.widthBuffer.setX(t,S.size),this.widthBuffer.setX(t+1,S.size);else{let y=(Math.abs(l.x)+Math.abs(l.y)+Math.abs(l.z))/3;this.widthBuffer.setX(t,S.size*y),this.widthBuffer.setX(t+1,S.size*y)}this.uvBuffer.setXY(t,(I/g.previous.length+p)*d,(f-w-1)*m),this.uvBuffer.setXY(t+1,(I/g.previous.length+p)*d,(f-w)*m),this.colorBuffer.setXYZW(t,S.color.x,S.color.y,S.color.z,S.color.w),this.colorBuffer.setXYZW(t+1,S.color.x,S.color.y,S.color.z,S.color.w),I+1<g.previous.length&&(this.indexBuffer.setX(e*3,t),this.indexBuffer.setX(e*3+1,t+1),this.indexBuffer.setX(e*3+2,t+2),e++,this.indexBuffer.setX(e*3,t+2),this.indexBuffer.setX(e*3+1,t+1),this.indexBuffer.setX(e*3+2,t+3),e++),T=S,S=A,v.done||(v=M.next(),v.value!==void 0&&(A=v.value))}}}this.positionBuffer.clearUpdateRanges(),this.positionBuffer.addUpdateRange(0,t*3),this.positionBuffer.needsUpdate=!0,this.previousBuffer.clearUpdateRanges(),this.previousBuffer.addUpdateRange(0,t*3),this.previousBuffer.needsUpdate=!0,this.nextBuffer.clearUpdateRanges(),this.nextBuffer.addUpdateRange(0,t*3),this.nextBuffer.needsUpdate=!0,this.sideBuffer.clearUpdateRanges(),this.sideBuffer.addUpdateRange(0,t),this.sideBuffer.needsUpdate=!0,this.widthBuffer.clearUpdateRanges(),this.widthBuffer.addUpdateRange(0,t),this.widthBuffer.needsUpdate=!0,this.uvBuffer.clearUpdateRanges(),this.uvBuffer.addUpdateRange(0,t*2),this.uvBuffer.needsUpdate=!0,this.colorBuffer.clearUpdateRanges(),this.colorBuffer.addUpdateRange(0,t*4),this.colorBuffer.needsUpdate=!0,this.indexBuffer.clearUpdateRanges(),this.indexBuffer.addUpdateRange(0,e*3),this.indexBuffer.needsUpdate=!0,this.geometry.setDrawRange(0,e*3)}dispose(){this.geometry.dispose()}},ah=class n extends Ne{constructor(){super(),this.batches=[],this.systemToBatchIndex=new Map,this.type="BatchedRenderer",this.depthTexture=null}static equals(t,e){return t.material.side===e.material.side&&t.material.blending===e.material.blending&&t.material.blendSrc===e.material.blendSrc&&t.material.blendDst===e.material.blendDst&&t.material.blendEquation===e.material.blendEquation&&t.material.premultipliedAlpha===e.material.premultipliedAlpha&&t.material.transparent===e.material.transparent&&t.material.depthTest===e.material.depthTest&&t.material.type===e.material.type&&t.material.alphaTest===e.material.alphaTest&&t.material.map===e.material.map&&t.renderMode===e.renderMode&&t.blendTiles===e.blendTiles&&t.softParticles===e.softParticles&&t.softFarFade===e.softFarFade&&t.softNearFade===e.softNearFade&&t.uTileCount===e.uTileCount&&t.vTileCount===e.vTileCount&&t.instancingGeometry===e.instancingGeometry&&t.renderOrder===e.renderOrder&&t.layers.mask===e.layers.mask}addSystem(t){t._renderer=this;let e=t.getRendererSettings();for(let s=0;s<this.batches.length;s++)if(n.equals(this.batches[s].settings,e)){this.batches[s].addSystem(t),this.systemToBatchIndex.set(t,s);return}let i;switch(e.renderMode){case pt.Trail:i=new xd(e);break;case pt.Mesh:case pt.BillBoard:case pt.VerticalBillBoard:case pt.HorizontalBillBoard:case pt.StretchedBillBoard:i=new _d(e);break}this.depthTexture&&i.applyDepthTexture(this.depthTexture),i.addSystem(t),this.batches.push(i),this.systemToBatchIndex.set(t,this.batches.length-1),this.add(i)}deleteSystem(t){let e=this.systemToBatchIndex.get(t);e!=null&&(this.batches[e].removeSystem(t),this.systemToBatchIndex.delete(t))}setDepthTexture(t){this.depthTexture=t;for(let e of this.batches)e.applyDepthTexture(t)}updateSystem(t){this.deleteSystem(t),this.addSystem(t)}update(t){this.systemToBatchIndex.forEach((e,i)=>{i.update(t)});for(let e=0;e<this.batches.length;e++)this.batches[e].update()}};Fy();Jp(Cy);console.log("%c Particle system powered by three.quarks. https://quarks.art/","font-size: 14px; font-weight: bold;");function Md(n){return n}function lh(n){if(n==null)return Md;var t,e,i=n.scale[0],s=n.scale[1],r=n.translate[0],o=n.translate[1];return function(a,l){l||(t=e=0);var c=2,h=a.length,u=new Array(h);for(u[0]=(t+=a[0])*i+r,u[1]=(e+=a[1])*s+o;c<h;)u[c]=a[c],++c;return u}}function $p(n,t){for(var e,i=n.length,s=i-t;s<--i;)e=n[s],n[s++]=n[i],n[i]=e}function Sd(n,t){return typeof t=="string"&&(t=n.objects[t]),t.type==="GeometryCollection"?{type:"FeatureCollection",features:t.geometries.map(function(e){return Kp(n,e)})}:Kp(n,t)}function Kp(n,t){var e=t.id,i=t.bbox,s=t.properties==null?{}:t.properties,r=bd(n,t);return e==null&&i==null?{type:"Feature",properties:s,geometry:r}:i==null?{type:"Feature",id:e,properties:s,geometry:r}:{type:"Feature",id:e,bbox:i,properties:s,geometry:r}}function bd(n,t){var e=lh(n.transform),i=n.arcs;function s(h,u){u.length&&u.pop();for(var f=i[h<0?~h:h],d=0,m=f.length;d<m;++d)u.push(e(f[d],d));h<0&&$p(u,m)}function r(h){return e(h)}function o(h){for(var u=[],f=0,d=h.length;f<d;++f)s(h[f],u);return u.length<2&&u.push(u[0]),u}function a(h){for(var u=o(h);u.length<4;)u.push(u[0]);return u}function l(h){return h.map(a)}function c(h){var u=h.type,f;switch(u){case"GeometryCollection":return{type:u,geometries:h.geometries.map(c)};case"Point":f=r(h.coordinates);break;case"MultiPoint":f=h.coordinates.map(r);break;case"LineString":f=o(h.arcs);break;case"MultiLineString":f=h.arcs.map(o);break;case"Polygon":f=l(h.arcs);break;case"MultiPolygon":f=h.arcs.map(l);break;default:return null}return{type:u,coordinates:f}}return c(t)}var wd={type:"Topology",objects:{land:{type:"GeometryCollection",geometries:[{type:"MultiPolygon",arcs:[[[0]],[[1]],[[2]],[[3]],[[4]],[[5]],[[6]],[[7]],[[8]],[[9]],[[10]],[[11]],[[12]],[[13]],[[14]],[[15]],[[16,18]],[[19]],[[20]],[[21]],[[22]],[[23]],[[24]],[[25]],[[26]],[[27]],[[28]],[[29]],[[30]],[[31]],[[32]],[[33]],[[34]],[[35]],[[36]],[[37]],[[38]],[[39]],[[40]],[[41]],[[42]],[[43]],[[44]],[[45]],[[46]],[[47]],[[48]],[[49]],[[50]],[[51]],[[52]],[[53]],[[54]],[[55]],[[56]],[[57]],[[58]],[[59]],[[60]],[[61]],[[62]],[[63]],[[64]],[[65]],[[66]],[[67]],[[68]],[[69]],[[70]],[[71]],[[72]],[[73]],[[74]],[[75]],[[76]],[[77]],[[78]],[[79]],[[80]],[[81]],[[82]],[[83]],[[84]],[[85]],[[86]],[[87]],[[88]],[[89]],[[90]],[[91]],[[92,115],[114]],[[94]],[[95]],[[96]],[[97]],[[98]],[[99]],[[100]],[[101]],[[102]],[[103]],[[104]],[[105]],[[106]],[[107]],[[108]],[[109]],[[110]],[[111]],[[112]],[[113]],[[116]],[[117]],[[118]],[[119]],[[120]],[[121]],[[122]],[[123]],[[124]],[[125]],[[126]],[[127]],[[128]],[[129]]]}]}},arcs:[[[33452,3290],[-82,-301],[-81,-266],[-582,81],[-621,-35],[-348,197],[0,23],[-152,174],[625,-23],[599,-58],[207,243],[147,208],[288,-243]],[[5775,3611],[-533,-81],[-364,208],[-163,209],[-11,35],[-180,162],[169,220],[517,-93],[277,-185],[212,-209],[76,-266]],[[37457,4468],[342,-255],[120,-359],[33,-254],[11,-301],[-430,-186],[-452,-150],[-522,-139],[-582,-116],[-658,35],[-365,197],[49,243],[593,162],[239,197],[174,254],[126,220],[168,209],[180,243],[141,0],[414,127],[419,-127]],[[16330,7154],[359,-93],[332,104],[-158,-208],[-261,-151],[-386,47],[-278,208],[60,197],[332,-104]],[[15122,7165],[425,-231],[-164,23],[-359,58],[-381,162],[202,127],[277,-139]],[[22505,8080],[305,-81],[304,69],[163,-335],[-217,46],[-337,-23],[-343,23],[-376,-35],[-283,116],[-146,243],[174,104],[353,-81],[403,-46]],[[30985,8657],[33,-266],[-49,-231],[-76,-220],[-326,-81],[-311,-116],[-364,11],[136,232],[-327,-81],[-310,-81],[-212,174],[-16,243],[305,231],[190,70],[321,-23],[82,301],[16,219],[-6,475],[158,278],[256,93],[147,-220],[65,-220],[120,-267],[92,-254],[76,-267]],[[0,529],[16,-5],[245,344],[501,-185],[32,21],[78,49],[94,61],[81,52],[41,26],[41,-1],[29,-10],[402,-246],[352,246],[63,34],[816,104],[265,-138],[130,-71],[419,-196],[789,-151],[625,-185],[1072,-139],[800,162],[1181,-116],[669,-185],[734,174],[773,162],[60,278],[-1094,23],[-898,139],[-234,231],[-745,128],[49,266],[103,243],[104,220],[-55,243],[-462,162],[-212,209],[-430,185],[675,-35],[642,93],[402,-197],[495,173],[457,220],[223,197],[-98,243],[-359,162],[-408,174],[-571,35],[-500,81],[-539,58],[-180,220],[-359,185],[-217,208],[-87,672],[136,-58],[250,-185],[457,58],[441,81],[228,-255],[441,58],[370,127],[348,162],[315,197],[419,58],[-11,220],[-97,220],[81,208],[359,104],[163,-196],[425,115],[321,151],[397,12],[375,57],[376,139],[299,128],[337,127],[218,-35],[190,-46],[414,81],[370,-104],[381,11],[364,81],[375,-57],[414,-58],[386,23],[403,-12],[413,-11],[381,23],[283,174],[337,92],[349,-127],[331,104],[300,208],[179,-185],[98,-208],[180,-197],[288,174],[332,-220],[375,-70],[321,-162],[392,35],[354,104],[418,-23],[376,-81],[381,-104],[147,254],[-180,197],[-136,209],[-359,46],[-158,220],[-60,220],[-98,440],[213,-81],[364,-35],[359,35],[327,-93],[283,-174],[119,-208],[376,-35],[359,81],[381,116],[342,70],[283,-139],[370,46],[239,451],[224,-266],[321,-104],[348,58],[228,-232],[365,-23],[337,-69],[332,-128],[218,220],[108,209],[278,-232],[381,58],[283,-127],[190,-197],[370,58],[288,127],[283,151],[337,81],[392,69],[354,81],[272,127],[163,186],[65,254],[-32,244],[-87,231],[-98,232],[-87,231],[-71,209],[-16,231],[27,232],[130,220],[109,243],[44,231],[-55,255],[-32,232],[136,266],[152,173],[180,220],[190,186],[223,173],[109,255],[152,162],[174,151],[267,34],[174,186],[196,115],[228,70],[202,150],[157,186],[218,69],[163,-151],[-103,-196],[-283,-174],[-120,-127],[-206,92],[-229,-58],[-190,-139],[-202,-150],[-136,-174],[-38,-231],[17,-220],[130,-197],[-190,-139],[-261,-46],[-153,-197],[-163,-185],[-174,-255],[-44,-220],[98,-243],[147,-185],[229,-139],[212,-185],[114,-232],[60,-220],[82,-232],[130,-196],[82,-220],[38,-544],[81,-220],[22,-232],[87,-231],[-38,-313],[-152,-243],[-163,-197],[-370,-81],[-125,-208],[-169,-197],[-419,-220],[-370,-93],[-348,-127],[-376,-128],[-223,-243],[-446,-23],[-489,23],[-441,-46],[-468,0],[87,-232],[424,-104],[311,-162],[174,-208],[-310,-185],[-479,58],[-397,-151],[-17,-243],[-11,-232],[327,-196],[60,-220],[353,-220],[588,-93],[500,-162],[398,-185],[506,-186],[690,-92],[681,-162],[473,-174],[517,-197],[272,-278],[136,-220],[337,209],[457,173],[484,186],[577,150],[495,162],[691,12],[680,-81],[560,-139],[180,255],[386,173],[702,12],[550,127],[522,128],[577,81],[614,104],[430,150],[-196,209],[-119,208],[0,220],[-539,-23],[-571,-93],[-544,0],[-77,220],[39,440],[125,128],[397,138],[468,139],[337,174],[337,174],[251,231],[380,104],[376,81],[190,47],[430,23],[408,81],[343,116],[337,139],[305,139],[386,185],[245,197],[261,173],[82,232],[-294,139],[98,243],[185,185],[288,116],[305,139],[283,185],[217,232],[136,277],[202,163],[331,-35],[136,-197],[332,-23],[11,220],[142,231],[299,-58],[71,-220],[331,-34],[360,104],[348,69],[315,-34],[120,-243],[305,196],[283,105],[315,81],[310,81],[283,139],[310,92],[240,128],[168,208],[207,-151],[288,81],[202,-277],[157,-209],[316,116],[125,232],[283,162],[365,-35],[108,-220],[229,220],[299,69],[326,23],[294,-11],[310,-70],[300,-34],[130,-197],[180,-174],[304,104],[327,24],[315,0],[310,11],[278,81],[294,70],[245,162],[261,104],[283,58],[212,162],[152,324],[158,197],[288,-93],[109,-208],[239,-139],[289,46],[196,-208],[206,-151],[283,139],[98,255],[250,104],[289,197],[272,81],[326,116],[218,127],[228,139],[218,127],[261,-69],[250,208],[180,162],[261,-11],[229,139],[54,208],[234,162],[228,116],[278,93],[256,46],[244,-35],[262,-58],[223,-162],[27,-254],[245,-197],[168,-162],[332,-70],[185,-162],[229,-162],[266,-35],[223,116],[240,243],[261,-127],[272,-70],[261,-69],[272,-46],[277,0],[229,-614],[-11,-150],[-33,-267],[-266,-150],[-218,-220],[38,-232],[310,12],[-38,-232],[-141,-220],[-131,-243],[212,-185],[321,-58],[321,104],[153,232],[92,220],[153,185],[174,174],[70,208],[147,289],[174,58],[316,24],[277,69],[283,93],[136,231],[82,220],[190,220],[272,151],[234,115],[153,197],[157,104],[202,93],[277,-58],[250,58],[272,69],[305,-34],[201,162],[142,393],[103,-162],[131,-278],[234,-115],[266,-47],[267,70],[283,-46],[261,-12],[174,58],[234,-35],[212,-127],[250,81],[300,0],[255,81],[289,-81],[185,197],[141,196],[191,163],[348,439],[179,-81],[212,-162],[185,-208],[354,-359],[272,-12],[256,0],[299,70],[299,81],[229,162],[190,174],[310,23],[207,127],[218,-116],[141,-185],[196,-185],[305,23],[190,-150],[332,-151],[348,-58],[288,47],[218,185],[185,185],[250,46],[251,-81],[288,-58],[261,93],[250,0],[245,-58],[256,-58],[250,104],[299,93],[283,23],[316,0],[255,58],[251,46],[76,290],[11,243],[174,-162],[49,-266],[92,-244],[115,-196],[234,-105],[315,35],[365,12],[250,35],[364,0],[262,11],[364,-23],[310,-46],[196,-186],[-54,-220],[179,-173],[299,-139],[310,-151],[360,-104],[375,-92],[283,-93],[315,-12],[180,197],[245,-162],[212,-185],[245,-139],[337,-58],[321,-69],[136,-232],[316,-139],[212,-208],[310,-93],[321,12],[299,-35],[332,12],[332,-47],[310,-81],[288,-139],[289,-116],[195,-173],[-32,-232],[-147,-208],[-125,-266],[-98,-209],[-131,-243],[-364,-93],[-163,-208],[-360,-127],[-125,-232],[-190,-220],[-201,-185],[-115,-243],[-70,-220],[-28,-266],[6,-220],[158,-232],[60,-220],[130,-208],[517,-81],[109,-255],[-501,-93],[-424,-127],[-528,-23],[-234,-336],[-49,-278],[-119,-220],[-147,-220],[370,-196],[141,-244],[239,-219],[338,-197],[386,-186],[419,-185],[636,-185],[142,-289],[800,-128],[53,-45],[208,-175],[767,151],[636,-186],[-99520,-142]],[[31180,18764],[361,-355],[389,-147],[-125,-296],[-264,-29],[-141,208],[-92,-239],[-238,-183],[-301,67],[-202,177],[-291,86],[-350,330],[-283,317],[-383,662],[229,-124],[390,-395],[369,-212],[143,271],[90,405],[256,244],[198,-70],[106,-274],[139,-443]],[[33736,20389],[222,-266],[-83,-207],[-375,-177],[-125,207],[-236,-266],[-139,266],[333,354],[236,-148],[167,237]],[[69522,21210],[-427,-38],[-7,314],[41,244],[19,121],[179,-186],[263,-74],[9,-112],[-77,-269]],[[90387,26479],[269,-204],[151,81],[217,113],[166,-39],[20,-702],[-95,-203],[-29,-476],[-97,162],[-193,-412],[-57,32],[-171,19],[-171,505],[-38,390],[-160,515],[7,271],[181,-52]],[[98060,26404],[63,-244],[198,239],[80,-249],[0,-249],[-103,-274],[-182,-435],[-142,-238],[103,-284],[-214,-7],[-238,-223],[-75,-387],[-157,-597],[-219,-264],[-138,-169],[-256,13],[-180,194],[-302,42],[-46,217],[149,438],[349,583],[179,111],[200,225],[238,310],[167,306],[123,441],[106,149],[41,330],[195,273],[61,-251]],[[98502,29218],[202,-622],[5,403],[126,-161],[41,-447],[224,-192],[188,-48],[158,226],[141,-69],[-67,-524],[-85,-345],[-212,12],[-74,-179],[26,-254],[-41,-110],[-105,-319],[-138,-404],[-214,-236],[-48,155],[-116,85],[160,486],[-91,326],[-299,236],[8,214],[201,206],[47,455],[-13,382],[-113,396],[8,104],[-133,244],[-218,523],[-117,418],[104,46],[151,-328],[216,-153],[78,-526]],[[96421,37487],[-105,-142],[-153,160],[-199,266],[-179,313],[-184,416],[-38,201],[119,-9],[156,-201],[122,-200],[89,-166],[228,-366],[144,-272]],[[99547,40335],[96,-171],[-46,-308],[-172,-81],[-153,73],[-27,260],[107,203],[126,-74],[69,98]],[[0,40798],[99822,-145],[-177,-124],[-36,220],[139,121],[88,33],[-99836,184]],[[0,41087],[0,-289]],[[0,41087],[57,27],[-34,-284],[-23,-32]],[[96623,40851],[-92,-78],[-93,259],[10,158],[175,-339]],[[96418,41756],[45,-476],[-75,74],[-58,-32],[-39,163],[-6,453],[133,-182]],[[63904,42571],[45,-711],[72,-276],[-28,-284],[-49,-174],[-94,347],[-53,-175],[53,-438],[-24,-250],[-77,-137],[-18,-500],[-109,-689],[-137,-814],[-172,-1120],[-106,-821],[-125,-685],[-226,-140],[-243,-250],[-160,151],[-220,211],[-77,312],[-18,524],[-98,471],[-26,425],[50,426],[128,102],[1,197],[133,447],[25,377],[-65,280],[-52,372],[-23,544],[97,331],[38,375],[138,22],[155,121],[103,107],[122,7],[158,337],[229,364],[83,297],[-38,253],[118,-71],[153,410],[6,356],[92,264],[96,-254],[74,-251],[69,-390]],[[89877,42448],[100,-464],[179,223],[92,-250],[133,-231],[-29,-262],[60,-506],[42,-295],[70,-72],[75,-505],[-27,-307],[90,-400],[301,-309],[197,-281],[186,-257],[-37,-143],[159,-371],[108,-639],[111,130],[113,-256],[68,91],[48,-626],[197,-363],[129,-226],[217,-478],[78,-475],[7,-337],[-19,-365],[132,-502],[-16,-523],[-48,-274],[-75,-527],[6,-339],[-55,-423],[-123,-538],[-205,-290],[-102,-458],[-93,-292],[-82,-510],[-107,-294],[-70,-442],[-36,-407],[14,-187],[-159,-205],[-311,-22],[-257,-242],[-127,-229],[-168,-254],[-230,262],[-170,104],[43,308],[-152,-112],[-243,-428],[-240,160],[-158,94],[-159,42],[-269,171],[-179,364],[-52,449],[-64,298],[-137,240],[-267,71],[91,287],[-67,438],[-136,-408],[-247,-109],[146,327],[42,341],[107,289],[-22,438],[-226,-504],[-174,-202],[-106,-470],[-217,243],[9,313],[-174,429],[-147,221],[52,137],[-356,358],[-195,17],[-267,287],[-498,-56],[-359,-211],[-317,-197],[-265,39],[-294,-303],[-241,-137],[-53,-309],[-103,-240],[-236,-15],[-174,-52],[-246,107],[-199,-64],[-191,-27],[-165,-315],[-81,26],[-140,-167],[-133,-187],[-203,23],[-186,0],[-295,377],[-149,113],[6,338],[138,81],[47,134],[-10,212],[34,411],[-31,350],[-147,598],[-45,337],[12,336],[-111,385],[-7,174],[-123,235],[-35,463],[-158,467],[-39,252],[122,-255],[-93,548],[137,-171],[83,-229],[-5,303],[-138,465],[-26,186],[-65,177],[31,341],[56,146],[38,295],[-29,346],[114,425],[21,-450],[118,406],[225,198],[136,252],[212,217],[126,46],[77,-73],[219,220],[168,66],[42,129],[74,54],[153,-14],[292,173],[151,262],[71,316],[163,300],[13,236],[7,321],[194,502],[117,-510],[119,118],[-99,279],[87,287],[122,-128],[34,449],[152,291],[67,233],[140,101],[4,165],[122,-69],[5,148],[122,85],[134,80],[205,-271],[155,-350],[173,-4],[177,-56],[-59,325],[133,473],[126,155],[-44,147],[121,338],[168,208],[142,-70],[234,111],[-5,302],[-204,195],[148,86],[184,-147],[148,-242],[234,-151],[79,60],[172,-182],[162,169],[105,-51],[65,113],[127,-292],[-74,-316],[-105,-239],[-96,-20],[32,-236],[-81,-295],[-99,-291],[20,-166],[221,-327],[214,-189],[143,-204],[201,-350],[78,1],[145,-151],[43,-183],[265,-200],[183,202],[55,317],[56,262],[34,324],[85,470],[-39,286],[20,171],[-32,339],[37,445],[53,120],[-43,197],[67,313],[52,325],[7,168],[104,222],[78,-289],[19,-371],[70,-71],[11,-249],[101,-300],[21,-335],[-10,-214]],[[95032,44386],[78,-203],[-194,4],[-106,363],[166,-142],[56,-22]],[[83531,44530],[-117,-11],[-368,414],[259,116],[146,-180],[97,-180],[-17,-159]],[[94680,44747],[-108,-14],[-170,60],[-58,91],[17,235],[183,-93],[91,-124],[45,-155]],[[94910,44908],[-42,-109],[-206,512],[-57,353],[94,0],[100,-473],[111,-283]],[[84565,44589],[-238,-130],[-33,71],[25,201],[119,360],[275,235],[32,139],[239,133],[194,20],[87,74],[105,-74],[-102,-160],[-289,-258],[-233,-170],[-181,-441]],[[82749,45797],[100,-158],[172,48],[69,-251],[-321,-119],[-193,-79],[-149,5],[95,340],[153,5],[74,209]],[[84139,45797],[-41,-328],[-417,-168],[-370,73],[0,216],[220,123],[174,-177],[185,45],[249,216]],[[94409,45654],[12,-119],[-218,251],[-152,212],[-104,197],[41,60],[128,-142],[228,-272],[65,-187]],[[93760,46238],[-56,-33],[-121,134],[-114,243],[14,99],[166,-250],[111,-193]],[[80172,46575],[533,-59],[61,244],[515,-284],[101,-383],[417,-108],[341,-351],[-317,-225],[-306,238],[-251,-16],[-288,44],[-260,106],[-322,225],[-204,59],[-116,-74],[-506,243],[-48,254],[-255,44],[191,564],[337,-35],[224,-231],[115,-45],[38,-210]],[[87423,46908],[-143,-402],[-27,445],[49,212],[58,200],[63,-173],[0,-282]],[[93299,46550],[-78,-59],[-120,227],[-122,375],[-59,450],[38,57],[30,-175],[84,-134],[135,-375],[131,-200],[-39,-166]],[[92217,47343],[-146,-48],[-44,-166],[-152,-144],[-142,-138],[-148,1],[-228,171],[-158,165],[23,183],[249,-86],[152,46],[42,283],[40,15],[27,-314],[158,45],[78,202],[155,211],[-30,348],[166,11],[56,-97],[-5,-327],[-93,-361]],[[85346,48536],[-104,-196],[-192,108],[-54,254],[281,29],[69,-195]],[[86241,48752],[101,-452],[-234,244],[-232,49],[-157,-39],[-192,21],[65,325],[344,24],[305,-172]],[[92538,47921],[-87,-157],[-52,348],[-65,229],[-126,193],[-158,252],[-200,174],[77,143],[150,-166],[94,-130],[117,-142],[111,-248],[106,-189],[33,-307]],[[87261,49899],[78,-955],[287,-354],[232,627],[319,356],[247,1],[238,-206],[206,-212],[298,-113],[482,-407],[513,-338],[192,-302],[154,-297],[43,-349],[462,-365],[68,-313],[-256,-64],[62,-393],[248,-388],[180,-627],[159,20],[-11,-262],[215,-100],[-84,-111],[295,-249],[-30,-171],[-184,-41],[-69,153],[-238,66],[-281,89],[-216,377],[-158,325],[-144,517],[-362,259],[-235,-169],[-170,-195],[35,-436],[-218,-203],[-155,99],[-288,25],[-247,485],[-282,118],[-69,-168],[-352,-18],[118,481],[175,164],[-72,642],[-134,496],[-538,500],[-229,50],[-417,546],[-82,-287],[-107,-52],[-63,216],[-1,257],[-212,290],[299,213],[198,-11],[-23,156],[-407,1],[-110,352],[-248,109],[-117,293],[374,143],[142,192],[446,-242],[44,-220]],[[84788,51419],[-223,-587],[-209,-113],[-267,115],[-463,-29],[-243,-85],[-39,-447],[248,-526],[150,268],[518,201],[-22,-272],[-121,86],[-121,-347],[-245,-229],[263,-757],[-50,-203],[249,-682],[-2,-388],[-148,-173],[-109,207],[134,484],[-273,-229],[-69,164],[36,228],[-200,346],[21,576],[-186,-179],[24,-689],[11,-846],[-176,-85],[-119,173],[79,544],[-43,570],[-117,4],[-86,405],[115,387],[40,469],[139,891],[58,243],[237,439],[217,-174],[350,-82],[319,25],[275,429],[48,-132]],[[85746,51249],[-15,-517],[-143,58],[-42,-359],[114,-312],[-78,-71],[-112,374],[-82,755],[56,472],[92,215],[20,-322],[164,-52],[26,-241]],[[79393,47122],[-308,-12],[-234,494],[-356,482],[-119,358],[-210,481],[-138,443],[-212,827],[-244,493],[-81,508],[-103,461],[-250,372],[-145,506],[-209,330],[-290,652],[-24,300],[178,-24],[430,-114],[246,-577],[215,-401],[153,-246],[263,-635],[283,-9],[233,-405],[161,-495],[211,-270],[-111,-482],[159,-205],[100,-15],[47,-412],[97,-330],[204,-52],[135,-374],[-70,-735],[-11,-914]],[[82742,51659],[312,-546],[-329,-70],[-93,-403],[12,-535],[-267,-404],[-7,-589],[-107,-903],[-41,210],[-316,-266],[-110,361],[-198,34],[-139,189],[-330,-212],[-101,285],[-182,-32],[-229,68],[-43,793],[-138,164],[-134,505],[-38,517],[32,548],[165,392],[204,-202],[214,110],[56,500],[119,112],[333,128],[199,467],[137,374],[110,221],[236,323],[214,411],[140,462],[112,2],[143,-299],[13,-257],[183,-165],[231,-177],[-20,-232],[-186,-29],[50,-289],[-205,-201],[-158,-533],[204,-560],[-48,-272]],[[85104,55551],[28,-392],[16,-332],[-94,-540],[-102,602],[-130,-300],[89,-435],[-79,-277],[-327,343],[-78,428],[84,280],[-176,280],[-87,-245],[-131,23],[-205,-330],[-46,173],[109,498],[175,166],[151,223],[98,-268],[212,162],[45,264],[196,15],[-16,457],[225,-280],[23,-297],[20,-218]],[[72560,54241],[-242,-135],[-132,470],[-49,849],[126,959],[192,-328],[129,-416],[134,-616],[-42,-615],[-116,-168]],[[33073,56553],[-232,-65],[-50,53],[81,163],[-6,233],[160,77],[58,-21],[-11,-440]],[[84439,56653],[-100,-195],[-87,-373],[-87,-175],[-171,409],[57,158],[70,165],[30,367],[153,35],[-44,-398],[205,570],[-26,-563]],[[82917,56084],[-369,-561],[136,414],[200,364],[167,409],[146,587],[49,-482],[-183,-325],[-146,-406]],[[83856,57606],[166,-183],[177,1],[-5,-247],[-129,-251],[-176,-178],[-10,275],[20,301],[-43,282]],[[84861,57766],[78,-660],[-214,157],[5,-199],[68,-364],[-132,-133],[-11,416],[-84,31],[-43,357],[163,-47],[-4,224],[-169,451],[266,-13],[77,-220]],[[83757,58301],[-74,-510],[-119,295],[-142,450],[238,-22],[97,-213]],[[83700,61512],[171,-168],[85,153],[26,-150],[-46,-245],[95,-423],[-73,-491],[-164,-196],[-43,-476],[62,-471],[147,-65],[123,70],[347,-328],[-27,-321],[91,-142],[-29,-272],[-216,290],[-103,310],[-71,-217],[-177,354],[-253,-87],[-138,130],[14,244],[87,151],[-83,136],[-36,-213],[-137,340],[-41,257],[-11,566],[112,-195],[29,925],[90,535],[169,-1]],[[31780,61349],[-71,-149],[-209,4],[-163,-21],[-16,253],[40,86],[227,-3],[142,-52],[50,-118]],[[28638,61137],[-84,-99],[-156,95],[-159,215],[34,135],[116,41],[64,-20],[187,-53],[147,-142],[46,-161],[-195,-11]],[[29839,62320],[241,-93],[34,101],[217,-3],[165,-152],[73,15],[50,-209],[152,11],[-9,-176],[124,-21],[136,-217],[-103,-240],[-132,128],[-127,-25],[-92,28],[-50,-107],[-106,-37],[-43,144],[-92,-85],[-111,-405],[-71,94],[-14,170],[-185,100],[-131,-41],[-169,43],[-130,-110],[-149,184],[24,190],[256,-82],[210,-47],[100,131],[-127,256],[2,226],[-175,92],[62,163],[170,-26]],[[80649,61615],[-240,-284],[-228,183],[-8,509],[137,267],[304,166],[159,-14],[62,-226],[-122,-260],[-64,-341]],[[6794,61855],[-41,-99],[-69,84],[8,165],[-46,216],[14,65],[48,97],[-19,116],[16,55],[21,-11],[107,-100],[49,-51],[45,-79],[71,-207],[-7,-33],[-108,-126],[-89,-92]],[[6645,62777],[-94,-43],[-47,125],[-32,48],[-3,37],[27,50],[99,-56],[73,-90],[-23,-71]],[[6456,63091],[-9,-63],[-149,17],[21,72],[137,-26]],[[6207,63177],[-15,-34],[-19,8],[-97,21],[-35,133],[-11,24],[74,82],[23,-38],[80,-196]],[[5737,63567],[-33,-58],[-93,107],[14,43],[43,58],[64,-12],[5,-138]],[[27867,64030],[110,-216],[260,66],[98,-138],[235,-366],[173,-267],[92,8],[165,-120],[-20,-167],[205,-24],[210,-242],[-33,-138],[-185,-75],[-187,-29],[-191,46],[-398,-57],[186,329],[-113,154],[-179,39],[-96,171],[-66,336],[-157,-23],[-259,159],[-83,124],[-362,91],[-97,115],[104,148],[-273,30],[-199,-307],[-115,-8],[-40,-144],[-138,-65],[-118,56],[146,183],[60,213],[126,131],[142,116],[210,56],[67,65],[240,-42],[219,-7],[261,-201]],[[28462,64617],[-68,-29],[-70,340],[-104,171],[60,375],[84,-23],[97,-491],[1,-343]],[[83659,64045],[-119,-485],[-146,499],[-32,438],[163,581],[223,447],[127,-176],[-49,-357],[-167,-947]],[[28383,66284],[-303,-95],[-19,219],[130,47],[184,-18],[8,-153]],[[28611,66290],[-48,-420],[-51,75],[4,309],[-124,234],[-1,67],[220,-265]],[[87399,70756],[35,-203],[-156,-357],[-114,189],[-143,-137],[-73,-346],[-181,168],[2,281],[154,352],[158,-68],[114,248],[204,-127]],[[59604,71655],[-188,-251],[21,-111],[8,-48],[-285,-240],[-136,77],[-64,237],[132,22],[19,3],[40,143],[200,-8],[253,176]],[[56583,71675],[152,-199],[216,34],[207,-42],[-7,-103],[151,71],[-35,-175],[-400,-50],[3,98],[-339,115],[52,251]],[[54311,73167],[-100,-465],[41,-183],[-58,-303],[-213,222],[-141,64],[-387,300],[38,304],[325,-54],[284,64],[211,51]],[[52558,74927],[166,-419],[-39,-782],[-126,38],[-113,-197],[-105,156],[-11,713],[-64,338],[153,-30],[139,183]],[[89159,72524],[-104,-472],[48,-296],[-145,-416],[-355,-278],[-488,-36],[-396,-675],[-186,227],[-12,442],[-483,-130],[-329,-279],[-325,-11],[282,-435],[-186,-1004],[-179,-248],[-135,229],[69,533],[-176,172],[-113,405],[263,182],[145,371],[280,306],[203,403],[553,177],[297,-121],[291,1050],[185,-282],[408,591],[158,229],[174,723],[-47,664],[117,374],[295,108],[152,-819],[-9,-479],[-256,-595],[4,-610]],[[52655,75484],[-92,-456],[-126,120],[-64,398],[56,219],[179,226],[47,-507]],[[89974,76679],[195,-126],[197,250],[62,-663],[-412,-162],[-244,-587],[-436,404],[-152,-646],[-308,-9],[-39,587],[138,455],[296,33],[81,817],[83,460],[326,-615],[213,-198]],[[32315,78082],[202,-79],[257,16],[-137,-242],[-102,-38],[-353,250],[-69,198],[105,183],[97,-288]],[[32831,79592],[-135,-11],[-360,186],[-258,279],[96,49],[365,-148],[284,-247],[8,-108]],[[15692,79240],[-140,-82],[-456,269],[-84,209],[-248,207],[-50,168],[-286,107],[-107,321],[24,137],[291,-129],[171,-89],[261,-63],[94,-204],[138,-280],[277,-244],[115,-327]],[[34407,80527],[-184,-517],[181,199],[187,-126],[-98,-206],[247,-162],[128,144],[277,-182],[-86,-433],[194,101],[36,-313],[86,-367],[-117,-520],[-125,-22],[-183,111],[60,484],[-77,75],[-322,-513],[-166,21],[196,277],[-267,144],[-298,-35],[-539,18],[-43,175],[173,208],[-121,160],[234,356],[287,941],[172,336],[241,204],[129,-26],[-54,-160],[-148,-372]],[[13136,82508],[267,47],[-84,-671],[242,-475],[-111,1],[-167,270],[-103,272],[-140,184],[-51,260],[16,188],[131,-76]],[[89901,80562],[280,-1046],[-411,195],[-171,-854],[271,-605],[-8,-413],[-211,356],[-182,-457],[-51,496],[31,575],[-32,638],[64,446],[13,790],[-163,581],[24,808],[257,271],[-110,274],[123,83],[73,-391],[96,-569],[-7,-581],[114,-597]],[[48114,81456],[-493,-349],[-393,89],[225,617],[-145,601],[378,463],[210,276],[233,24],[298,-365],[-149,-406],[46,-422],[-210,-528]],[[53524,83435],[-166,-478],[-291,333],[-39,246],[408,195],[88,-296]],[[7498,84325],[-277,-225],[-142,152],[-43,277],[252,210],[148,90],[185,-40],[117,-183],[-240,-281]],[[49165,85222],[-297,-639],[283,81],[304,-3],[-72,-481],[-250,-530],[287,-38],[270,-759],[190,-95],[171,-673],[79,-233],[337,-113],[-34,-378],[-142,-173],[111,-305],[-250,-310],[-371,6],[-473,-163],[-130,116],[-183,-276],[-257,67],[-195,-226],[-148,118],[407,621],[249,127],[-436,99],[-79,235],[291,183],[-152,319],[52,387],[414,-54],[40,343],[-190,372],[-337,104],[-66,160],[101,264],[-92,163],[-149,-279],[-17,569],[-140,301],[101,611],[216,480],[222,-47],[335,49]],[[4006,85976],[-171,-92],[-182,110],[-168,161],[274,101],[220,-54],[27,-226]],[[27981,87304],[-108,-310],[-123,50],[-73,176],[13,41],[107,177],[114,-13],[70,-121]],[[27250,87631],[-325,-326],[-196,13],[-61,160],[207,273],[381,-6],[-6,-114]],[[2297,88264],[171,-113],[173,61],[225,-156],[276,-79],[-23,-64],[-211,-125],[-211,128],[-106,107],[-245,-34],[-66,52],[17,223]],[[26344,89371],[51,-259],[143,91],[161,-155],[304,-203],[318,-184],[25,-281],[204,46],[199,-196],[-247,-186],[-432,142],[-156,266],[-275,-314],[-396,-306],[-95,346],[-377,-57],[242,292],[35,465],[95,542],[201,-49]],[[45969,89843],[-64,-382],[314,-403],[-361,-451],[-801,-405],[-240,-107],[-365,87],[-775,187],[273,261],[-605,289],[492,114],[-12,174],[-583,137],[188,385],[421,87],[433,-400],[422,321],[349,-167],[453,315],[461,-42]],[[28926,90253],[-312,-30],[-69,289],[118,331],[255,82],[217,-163],[3,-253],[-32,-82],[-180,-174]],[[0,91325],[681,-451],[728,-588],[-24,-367],[187,-147],[-64,429],[754,-88],[544,-553],[-276,-257],[-455,-61],[-7,-578],[-111,-122],[-260,17],[-212,206],[-369,172],[-62,257],[-283,96],[-315,-76],[-151,207],[60,219],[-333,-140],[126,-278],[-158,-251]],[[0,88971],[0,2354]],[[23431,91410],[-173,-207],[-374,179],[-226,-65],[-380,266],[245,183],[194,256],[295,-168],[166,-106],[84,-112],[169,-226]],[[0,92833],[99999,-404],[-305,-30],[-49,187],[-99645,247]],[[0,92833],[36,24],[235,-1],[402,-169],[-24,-81],[-286,-141],[-363,-36],[0,404]],[[24848,91640],[-1,-604],[371,463],[332,-380],[-83,-438],[269,-399],[290,427],[202,510],[16,648],[394,-45],[411,-87],[373,-293],[17,-293],[-207,-315],[196,-316],[-36,-288],[-544,-413],[-386,-91],[-287,178],[-83,-297],[-268,-498],[-81,-258],[-322,-400],[-397,-39],[-220,-250],[-18,-384],[-323,-74],[-340,-479],[-301,-665],[-108,-466],[-15,-686],[408,-99],[125,-553],[130,-448],[388,117],[517,-256],[277,-225],[199,-279],[348,-162],[294,-249],[459,-34],[302,-58],[-45,-511],[86,-594],[201,-661],[414,-561],[214,192],[150,607],[-145,934],[-196,311],[445,276],[314,415],[154,411],[-22,395],[-189,502],[-338,445],[328,619],[-121,535],[-93,922],[194,137],[476,-161],[286,-57],[230,155],[258,-200],[342,-343],[85,-229],[495,-45],[-8,-496],[92,-747],[254,-92],[201,-348],[402,328],[266,652],[184,274],[216,-527],[362,-754],[307,-709],[-112,-371],[370,-333],[250,-338],[442,-152],[179,-189],[110,-500],[216,-78],[112,-223],[20,-664],[-202,-222],[-199,-207],[-458,-210],[-349,-486],[-470,-96],[-594,125],[-417,4],[-287,-41],[-233,-424],[-354,-262],[-401,-782],[-320,-545],[236,97],[446,776],[583,493],[416,59],[245,-290],[-262,-397],[88,-637],[91,-446],[361,-295],[459,86],[278,664],[19,-429],[180,-214],[-344,-387],[-615,-351],[-276,-239],[-310,-426],[-211,44],[-11,500],[483,488],[-445,-19],[-309,-72],[48,-194],[-296,-286],[-286,-204],[-293,-175],[-159,-386],[-35,-98],[-3,-313],[92,-313],[115,-15],[-29,216],[83,-131],[-22,-169],[-188,-96],[-133,12],[-205,-104],[-121,-29],[-162,-29],[-231,-171],[408,111],[82,-112],[-389,-177],[-177,-1],[8,72],[-84,-164],[82,-27],[-60,-424],[-203,-455],[-20,152],[-61,31],[-91,147],[57,-318],[66,-106],[8,-222],[-89,-230],[-157,-472],[-25,24],[86,402],[-142,226],[-33,490],[-53,-255],[59,-375],[-175,88],[183,-186],[12,-562],[79,-41],[29,-204],[39,-591],[-176,-439],[-288,-175],[-182,-346],[-139,-38],[-141,-217],[-39,-199],[-305,-383],[-157,-281],[-131,-351],[-43,-419],[50,-411],[92,-505],[124,-418],[1,-256],[132,-685],[-9,-398],[-12,-230],[-69,-361],[-83,-74],[-137,71],[-44,259],[-106,136],[-147,508],[-129,452],[-42,231],[57,393],[-77,325],[-217,494],[-108,91],[-281,-269],[-49,30],[-135,276],[-174,146],[-314,-75],[-247,66],[-212,-41],[-118,-83],[54,-166],[-5,-240],[59,-117],[-53,-77],[-103,87],[-104,-112],[-202,18],[-207,313],[-242,-74],[-202,137],[-173,-42],[-234,-138],[-253,-438],[-276,-255],[-152,-282],[-63,-266],[-3,-407],[14,-284],[52,-201],[1,-1],[-1,-1],[-107,-516],[-49,-426],[-20,-791],[-27,-289],[48,-322],[86,-288],[56,-458],[184,-440],[65,-337],[109,-291],[295,-157],[114,-247],[244,165],[212,60],[208,106],[175,101],[176,241],[67,345],[22,496],[48,173],[188,155],[294,137],[246,-21],[169,50],[66,-125],[-9,-285],[-149,-351],[-66,-360],[51,-103],[-42,-255],[-69,-461],[-71,152],[-58,-10],[1,-87],[53,-3],[-5,-160],[-45,-256],[24,-91],[-29,-212],[18,-56],[-32,-299],[-55,-156],[-50,-19],[-55,-205],[90,-107],[24,88],[82,-75],[29,-23],[61,104],[79,8],[26,-48],[43,29],[129,-53],[128,16],[90,65],[32,66],[89,-31],[66,-40],[73,14],[55,51],[127,-82],[44,-13],[85,-110],[80,-132],[101,-91],[73,-162],[-24,-57],[-14,-132],[29,-216],[-64,-202],[-30,-237],[-9,-261],[15,-152],[7,-266],[-43,-58],[-26,-253],[19,-156],[-56,-151],[12,-159],[43,-97],[70,-321],[108,-238],[130,-252],[100,-212],[-6,-125],[111,-27],[26,48],[77,-145],[136,42],[119,150],[168,119],[95,176],[153,-34],[-10,-58],[155,-21],[124,-102],[90,-177],[105,-164],[143,-18],[209,412],[114,63],[3,195],[51,500],[159,274],[175,11],[22,123],[218,-49],[218,298],[109,132],[134,285],[98,-36],[73,-156],[-54,-199],[-8,-139],[-163,-69],[91,-268],[-3,-309],[-123,-343],[105,-469],[120,38],[62,427],[-86,208],[-14,447],[346,241],[-38,278],[97,186],[100,-415],[195,-9],[180,-330],[11,-195],[249,-6],[297,61],[159,-264],[213,-73],[155,184],[4,149],[344,35],[333,9],[-236,-175],[95,-279],[222,-44],[210,-291],[45,-473],[144,13],[109,-139],[183,-217],[171,-385],[8,-304],[105,-14],[149,-289],[109,-205],[333,-119],[30,107],[225,43],[298,-159],[95,-65],[204,-140],[294,-499],[46,-242],[95,28],[69,-327],[155,-1033],[149,-97],[7,-408],[-208,-487],[86,-178],[491,-92],[10,-593],[211,388],[349,-212],[462,-361],[135,-346],[-45,-327],[323,182],[540,-313],[415,23],[411,-489],[355,-662],[214,-170],[237,-24],[101,-186],[94,-752],[46,-358],[-110,-977],[-142,-385],[-391,-822],[-177,-668],[-206,-513],[-69,-11],[-78,-435],[20,-1107],[-77,-910],[-30,-390],[-88,-233],[-49,-790],[-282,-771],[-47,-610],[-225,-256],[-65,-355],[-302,2],[-437,-227],[-195,-263],[-311,-173],[-327,-470],[-235,-586],[-41,-441],[46,-326],[-51,-597],[-63,-289],[-195,-325],[-308,-1040],[-244,-468],[-189,-277],[-127,-562],[-183,-337],[-121,-372],[-313,-328],[-205,118],[-151,-63],[-256,253],[-189,-19],[-169,327],[-19,-308],[353,-506],[-38,-408],[173,-257],[-14,-289],[-267,-757],[-412,-317],[-557,-123],[-305,59],[59,-352],[-57,-442],[51,-298],[-167,-208],[-284,-82],[-267,216],[-108,-155],[39,-587],[188,-178],[152,186],[82,-307],[-255,-183],[-223,-367],[-41,-595],[-66,-316],[-262,-2],[-218,-302],[-80,-443],[274,-433],[265,-119],[-96,-531],[-328,-333],[-180,-692],[-254,-234],[-113,-276],[89,-614],[185,-342],[-117,30],[-247,4],[-134,-145],[-250,-213],[-45,-552],[-118,-14],[-313,192],[-318,412],[-346,338],[-87,374],[79,346],[-140,393],[-36,1007],[119,568],[293,457],[-422,172],[265,522],[94,982],[309,-208],[145,1224],[-186,157],[-87,-738],[-175,83],[87,845],[95,1095],[127,404],[-79,576],[-23,666],[117,19],[170,954],[192,945],[118,881],[-64,885],[83,487],[-34,730],[163,721],[50,1143],[89,1227],[87,1321],[-20,967],[-58,832],[-279,340],[-24,242],[-551,593],[-498,646],[-214,365],[-115,488],[46,170],[-236,775],[-274,1090],[-262,1177],[-114,269],[-87,435],[-216,386],[-198,239],[90,264],[-134,563],[86,414],[221,373],[148,442],[-60,258],[-106,-275],[-166,259],[56,167],[-47,536],[97,89],[52,368],[105,381],[-20,241],[153,126],[190,236],[-37,183],[103,44],[-12,296],[65,214],[138,40],[117,371],[106,310],[-102,141],[52,343],[-62,540],[59,155],[-44,500],[-112,315],[-93,170],[-59,319],[68,158],[-70,40],[-52,195],[-138,165],[-122,-38],[-56,-205],[-112,-149],[-61,-20],[-27,-123],[132,-321],[-75,-76],[-40,-87],[-130,-30],[-48,353],[-36,-101],[-92,35],[-56,238],[-114,39],[-72,69],[-119,-1],[-8,-128],[-32,89],[-151,131],[-56,124],[32,103],[-11,130],[-77,142],[-109,116],[-95,76],[-19,173],[-73,105],[18,-172],[-55,-141],[-64,164],[-89,58],[-38,120],[2,179],[36,187],[-78,83],[64,114],[-96,186],[-130,238],[-61,200],[-117,185],[-140,267],[31,92],[46,-89],[21,41],[-48,185],[-84,52],[-31,-140],[-161,9],[-100,57],[-115,117],[-154,37],[-79,127],[-142,103],[-174,11],[-127,117],[-149,244],[-314,636],[-144,192],[-226,154],[-156,-43],[-223,-223],[-140,-58],[-196,156],[-208,112],[-260,271],[-208,83],[-314,275],[-233,282],[-70,158],[-155,35],[-284,187],[-116,270],[-299,335],[-139,373],[-66,288],[93,57],[-29,169],[64,153],[1,204],[-93,266],[-25,235],[-94,298],[-244,587],[-280,462],[-135,368],[-238,241],[-51,145],[42,365],[-142,137],[-164,288],[-69,412],[-149,48],[-162,311],[-130,288],[-12,184],[-149,446],[-99,452],[5,227],[-201,235],[-93,-26],[-159,163],[-44,-240],[46,-284],[27,-444],[95,-243],[206,-407],[46,-139],[42,-42],[37,-203],[49,8],[56,-381],[85,-150],[59,-210],[174,-300],[92,-550],[83,-259],[77,-277],[15,-311],[134,-20],[112,-268],[100,-264],[-6,-106],[-117,-217],[-49,3],[-74,359],[-182,337],[-200,286],[-142,150],[9,432],[-42,320],[-132,183],[-191,264],[-37,-76],[-70,154],[-171,143],[-164,343],[20,44],[115,-33],[103,221],[10,266],[-214,422],[-163,163],[-102,369],[-103,388],[-129,472],[-113,531],[-46,302],[-180,340],[-130,71],[-30,169],[-156,30],[-100,159],[-258,59],[-70,95],[-34,324],[-270,594],[-231,821],[10,137],[-123,195],[-215,495],[-38,482],[-148,323],[61,489],[-10,507],[-89,453],[109,557],[67,1072],[-50,792],[-88,506],[-80,274],[33,115],[402,-200],[148,-558],[68,156],[-44,485],[-94,484],[-38,1],[-537,581],[-199,255],[-503,245],[-155,523],[40,362],[-356,252],[-48,476],[-336,429],[-6,304],[-153,223],[-245,188],[-78,515],[-358,478],[-150,558],[-267,38],[-441,15],[-326,170],[-574,613],[-266,112],[-486,211],[-385,-50],[-546,271],[-330,252],[-309,-125],[58,-411],[-154,-38],[-321,-123],[-245,-199],[-307,-126],[-40,348],[125,580],[295,182],[-76,148],[-354,-329],[-190,-394],[-400,-420],[203,-287],[-262,-424],[-299,-247],[-278,-181],[-69,-261],[-434,-305],[-87,-278],[-325,-252],[-191,45],[-259,-165],[-282,-201],[-231,-197],[-477,-169],[-43,99],[304,276],[271,182],[296,324],[345,66],[137,243],[385,353],[62,119],[205,208],[48,448],[141,349],[-320,-179],[-90,102],[-150,-215],[-181,300],[-75,-212],[-104,294],[-278,-236],[-170,0],[-24,352],[50,217],[-179,210],[-361,-113],[-235,277],[-190,142],[-1,334],[-214,252],[108,340],[226,330],[99,303],[225,43],[191,-94],[224,285],[201,-51],[212,183],[-52,270],[-155,106],[205,228],[-170,-7],[-295,-128],[-85,-131],[-219,131],[-392,-67],[-407,142],[-117,238],[-351,343],[390,247],[620,289],[228,0],[-38,-295],[586,22],[-225,366],[-342,226],[-197,295],[-267,252],[-381,187],[155,309],[493,19],[350,270],[66,287],[284,281],[271,68],[526,262],[256,-40],[427,315],[421,-124],[201,-266],[123,114],[469,-35],[-16,-136],[425,-101],[283,59],[585,-186],[534,-56],[214,-77],[370,96],[421,-177],[302,-83],[518,-142],[438,-284],[289,-55],[244,247],[336,184],[413,-72],[416,259],[455,148],[191,-245],[207,138],[62,278],[192,-63],[470,-530],[369,401],[38,-448],[341,96],[105,173],[337,-34],[424,-248],[650,-217],[383,-100],[272,38],[375,-300],[-391,-293],[502,-127],[750,70],[236,103],[296,-354],[302,299],[-283,251],[179,202],[338,27],[223,59],[224,-141],[279,-321],[310,47],[491,-266],[431,94],[405,-14],[-32,367],[247,103],[431,-200],[-2,-559],[177,471],[223,-16],[126,594],[-298,364],[-324,239],[22,653],[329,429],[366,-95],[281,-261],[378,-666],[-247,-290],[517,-120]],[[18287,93781],[-139,-277],[618,179],[386,-298],[314,302],[254,-194],[227,-580],[140,244],[-197,606],[244,86],[276,-94],[311,-239],[175,-575],[86,-417],[466,-293],[502,-279],[-31,-260],[-456,-48],[178,-227],[-94,-217],[-503,93],[-478,160],[-322,-36],[-522,-201],[-824,-103],[-374,-41],[-151,279],[-379,161],[-246,-66],[-343,468],[185,62],[429,101],[392,-26],[362,103],[-537,138],[-594,-47],[-394,12],[-146,217],[644,237],[-428,-9],[-485,156],[233,443],[193,235],[744,359],[284,-114]],[[20972,93958],[-244,-390],[-434,413],[95,83],[372,24],[211,-130]],[[28794,93770],[25,-163],[-296,17],[-299,13],[-304,-80],[-80,36],[-306,313],[12,213],[133,39],[636,-63],[479,-325]],[[25955,93803],[219,-369],[256,477],[704,242],[477,-611],[-42,-387],[550,172],[263,235],[616,-299],[383,-282],[36,-258],[515,134],[290,-376],[670,-234],[242,-238],[263,-553],[-510,-275],[654,-386],[441,-130],[400,-543],[437,-39],[-87,-414],[-487,-687],[-342,253],[-437,568],[-359,-74],[-35,-338],[292,-344],[377,-272],[114,-157],[181,-584],[-96,-425],[-350,160],[-697,473],[393,-509],[289,-357],[45,-206],[-753,236],[-596,343],[-337,287],[97,167],[-414,304],[-405,286],[5,-171],[-803,-94],[-235,203],[183,435],[522,10],[571,76],[-92,211],[96,294],[360,576],[-77,261],[-107,203],[-425,286],[-563,201],[178,150],[-294,367],[-245,34],[-219,201],[-149,-175],[-503,-76],[-1011,132],[-588,174],[-450,89],[-231,207],[290,270],[-394,2],[-88,599],[213,528],[286,241],[717,158],[-204,-382]],[[22123,94208],[331,-124],[496,75],[72,-172],[-259,-283],[420,-254],[-50,-532],[-455,-229],[-268,50],[-192,225],[-690,456],[5,189],[567,-73],[-306,386],[329,286]],[[89889,93835],[-421,-4],[-569,66],[-49,31],[263,234],[348,54],[394,-226],[34,-155]],[[24112,93575],[-298,-442],[-317,22],[-173,519],[4,294],[145,251],[276,161],[579,-20],[530,-144],[-415,-526],[-331,-115]],[[16539,92764],[-731,-294],[-147,259],[-641,312],[93,193],[218,489],[241,388],[-272,362],[939,93],[397,-123],[709,-33],[270,-171],[298,-249],[-349,-149],[-681,-415],[-344,-414],[0,-248]],[[91869,94941],[-321,-234],[-444,53],[-516,233],[66,192],[518,-89],[697,-155]],[[23996,94879],[-151,-229],[-403,44],[-337,155],[148,266],[399,159],[243,-208],[101,-187]],[[90301,95224],[-219,-439],[-1023,16],[-461,-139],[-550,384],[149,406],[366,111],[734,-26],[1004,-313]],[[22639,95907],[212,-273],[9,-303],[-127,-440],[-458,-60],[-298,94],[5,345],[-455,-46],[-18,457],[299,-18],[419,201],[390,-34],[22,77]],[[19941,95601],[109,-210],[247,99],[291,-26],[49,-289],[-169,-281],[-940,-91],[-701,-256],[-423,-14],[-35,193],[577,261],[-1255,-70],[-389,106],[379,577],[262,165],[782,-199],[493,-350],[485,-45],[-397,565],[255,215],[286,-68],[94,-282]],[[65981,92363],[-164,-52],[-907,77],[-74,262],[-503,158],[-40,320],[284,126],[-10,323],[551,503],[-255,73],[665,518],[-75,268],[621,312],[917,380],[925,110],[475,220],[541,76],[193,-233],[-187,-184],[-984,-293],[-848,-282],[-863,-562],[-414,-577],[-435,-568],[56,-491],[531,-484]],[[23699,96131],[308,-190],[547,1],[240,-194],[-64,-222],[319,-134],[177,-140],[374,-26],[406,-50],[441,128],[566,51],[451,-42],[298,-223],[62,-244],[-174,-157],[-414,-127],[-355,72],[-797,-91],[-570,-11],[-449,73],[-738,190],[-96,325],[-34,293],[-279,258],[-574,72],[-322,183],[104,242],[573,-37]],[[17722,96454],[-38,-454],[-214,-205],[-259,-29],[-517,-252],[-444,-91],[-377,128],[472,442],[570,383],[426,-9],[381,87]],[[63641,74970],[141,-419],[130,-28],[85,-159],[-228,-47],[-49,-459],[-47,-207],[-102,-138],[7,-293],[88,-436],[263,-123],[193,-296],[395,-102],[434,156],[27,139],[-52,417],[40,618],[-216,200],[71,405],[-184,34],[61,498],[262,-145],[244,189],[-202,355],[-80,338],[-224,-151],[-28,-433],[-87,383],[-15,144],[68,246],[-53,206],[-322,202],[-125,530],[-154,150],[-9,192],[270,-56],[11,432],[236,96],[243,-88],[50,576],[-50,365],[-278,-28],[-236,144],[-321,-260],[-259,-124],[-127,-350],[-269,-97],[-276,-610],[252,-561],[-27,-398],[303,-696],[146,-311]],[[0,88971],[99997,-3],[-357,-260],[-360,44],[250,-315],[166,-487],[128,-159],[32,-244],[-71,-157],[-518,129],[-777,-445],[-247,-69],[-425,-415],[-403,-362],[-102,-269],[-397,409],[-724,-464],[-126,220],[-268,-254],[-371,81],[-90,-388],[-333,-572],[10,-239],[316,-132],[-37,-860],[-258,-22],[-119,-494],[116,-255],[-486,-301],[-96,-675],[-415,-144],[-83,-600],[-400,-551],[-103,407],[-119,862],[-155,1313],[134,819],[234,353],[15,276],[431,132],[496,744],[479,608],[499,471],[223,833],[-337,-50],[-167,-487],[-705,-648],[-227,726],[-717,-201],[-696,-990],[230,-362],[-620,-154],[-430,-61],[20,427],[-431,90],[-344,-291],[-850,102],[-913,-175],[-900,-1153],[-1065,-1394],[438,-74],[136,-370],[270,-132],[178,296],[305,-39],[401,-650],[9,-502],[-217,-591],[-23,-705],[-126,-945],[-418,-855],[-94,-409],[-377,-688],[-374,-682],[-179,-349],[-370,-346],[-175,-8],[-175,287],[-373,-432],[-43,-197],[-106,36],[-120,-201],[-83,-201],[10,-424],[-143,-130],[-50,-105],[-104,-174],[-185,-97],[-121,-159],[-9,-256],[-32,-65],[111,-96],[157,-259],[240,-697],[68,-383],[3,-681],[-105,-325],[-252,-113],[-222,-245],[-250,-51],[-31,322],[52,443],[-123,615],[206,99],[-190,506],[-135,113],[-34,-112],[-81,-49],[-10,112],[-72,54],[-75,94],[77,260],[65,69],[-25,108],[71,319],[-18,97],[-163,64],[-131,158],[-388,-171],[-204,-277],[-300,-161],[148,274],[-58,230],[220,397],[-147,310],[-242,-209],[-314,-411],[-171,-381],[-272,-29],[-142,-275],[147,-400],[227,-97],[9,-265],[220,-172],[311,421],[247,-230],[179,-15],[46,-310],[-394,-165],[-130,-319],[-270,-296],[-142,-414],[299,-324],[109,-582],[169,-541],[189,-454],[-5,-439],[-174,-161],[66,-315],[164,-184],[-43,-481],[-71,-468],[-155,-53],[-203,-640],[-225,-775],[-258,-705],[-382,-545],[-386,-498],[-313,-68],[-170,-262],[-96,192],[-157,-294],[-388,-296],[-294,-90],[-95,-624],[-154,-35],[-73,429],[66,228],[-373,190],[-131,-97],[-371,-505],[-231,-558],[-61,-410],[212,-623],[260,-772],[252,-365],[169,-475],[127,-1093],[-37,-1039],[-232,-389],[-318,-381],[-227,-492],[-346,-550],[-101,378],[78,401],[-206,335],[-233,87],[-112,307],[-141,611],[-249,271],[-238,-11],[41,464],[-245,-3],[-22,-650],[-150,-863],[-90,-522],[19,-428],[181,-18],[113,-539],[50,-512],[155,-338],[168,-69],[144,-306],[64,-56],[164,-356],[116,-396],[16,-398],[-29,-269],[27,-203],[20,-349],[98,-163],[109,-523],[-5,-199],[-197,-40],[-263,438],[-329,469],[-32,301],[-161,395],[-38,489],[-100,322],[30,431],[-61,250],[-110,227],[-47,292],[-148,334],[-135,280],[-45,-347],[-53,328],[30,369],[82,566],[-27,439],[86,452],[-94,350],[23,644],[-113,306],[-90,707],[-50,746],[-121,490],[-183,-297],[-315,-421],[-156,53],[-172,138],[96,732],[-58,554],[-218,681],[34,213],[-163,76],[-197,481],[-79,309],[-16,301],[-53,284],[-116,344],[-256,23],[25,-243],[-87,-329],[-118,120],[-41,-108],[-78,65],[-108,53],[-39,-216],[-189,7],[-343,-122],[16,-445],[-148,-349],[-400,-398],[-311,-695],[-209,-373],[-276,-386],[-1,-272],[-138,-146],[-250,-212],[-130,-31],[-84,-450],[58,-769],[15,-490],[-118,-561],[-1,-1004],[-144,-29],[-126,-450],[84,-195],[-253,-167],[-93,-402],[-112,-170],[-263,552],[-128,827],[-107,596],[-97,279],[-148,568],[-69,739],[-48,369],[-253,811],[-115,1145],[-83,756],[1,716],[-54,553],[-404,-353],[-196,70],[-362,716],[133,214],[-82,232],[-326,501],[-203,150],[-83,425],[-215,449],[-512,-111],[-451,-11],[-391,-83],[-523,179],[-302,136],[-314,76],[-118,725],[-133,105],[-214,-106],[-280,-286],[-339,196],[-281,454],[-267,168],[-186,561],[-205,788],[-149,-96],[-177,196],[-103,-231],[-165,29],[58,-261],[-25,-135],[89,-445],[109,-510],[137,-135],[47,-207],[190,-248],[16,-244],[-27,-197],[35,-199],[80,-165],[37,-194],[41,-145],[-18,430],[75,310],[76,64],[84,-186],[5,-345],[-61,-348],[53,-226],[49,29],[11,-162],[217,93],[230,-15],[168,-18],[190,400],[207,379],[176,364],[80,201],[35,-51],[-26,-244],[-37,-108],[38,-466],[125,-404],[155,-214],[204,-78],[164,-107],[125,-339],[75,-196],[100,-75],[-1,-132],[-101,-352],[-44,-166],[-117,-189],[-104,-404],[-126,31],[-58,-141],[-44,-300],[34,-395],[-26,-72],[-128,2],[-174,-221],[-27,-288],[-63,-125],[-173,5],[-109,-149],[1,-239],[-134,-164],[-153,56],[-186,-199],[-128,-33],[-201,-159],[-54,-263],[-6,-201],[-277,-249],[-444,-276],[-249,-417],[-122,-32],[-83,34],[-163,-245],[-177,-113],[-233,-31],[-70,-34],[-61,-156],[-73,-43],[-42,-150],[-138,13],[-89,-80],[-192,30],[-72,345],[8,323],[-46,174],[-54,437],[-80,243],[56,29],[-29,270],[34,114],[-12,257],[-36,253],[-84,177],[-22,236],[-143,212],[-148,495],[-79,482],[-192,406],[-124,97],[-184,563],[-32,411],[12,350],[-159,655],[-130,231],[-150,122],[-92,339],[15,133],[-77,307],[-81,131],[-108,440],[-170,476],[-141,406],[-139,-3],[44,325],[12,206],[34,236],[-9,86],[-78,-238],[-60,-446],[-75,-308],[-65,-103],[-93,191],[-125,263],[-198,847],[-29,-53],[115,-624],[171,-594],[210,-920],[102,-321],[90,-334],[249,-654],[-55,-103],[9,-384],[323,-530],[49,-121],[90,-580],[-61,-107],[40,-608],[102,-706],[106,-145],[152,-219],[161,-683],[77,-543],[152,-288],[379,-558],[154,-336],[151,-341],[87,-203],[136,-178],[66,-183],[-9,-245],[-158,-142],[119,-161],[91,-109],[54,-244],[125,-248],[138,-2],[262,151],[302,70],[245,184],[138,39],[99,108],[158,20],[89,12],[128,88],[147,59],[132,202],[105,2],[6,-163],[-25,-344],[1,-310],[-59,-214],[-78,-639],[-134,-659],[-172,-755],[-238,-866],[-237,-661],[-327,-806],[-278,-479],[-415,-586],[-259,-450],[-304,-715],[-64,-312],[-63,-140],[-195,-236],[-68,-246],[-104,-44],[-40,-416],[-89,-238],[-54,-393],[-112,-195],[-128,-728],[16,-335],[178,-216],[8,-153],[-76,-357],[16,-180],[-18,-282],[97,-370],[115,-583],[101,-129],[45,-265],[-11,-588],[34,-519],[11,-923],[49,-290],[-83,-422],[-108,-410],[-177,-366],[-254,-225],[-313,-287],[-313,-634],[-107,-108],[-194,-420],[-115,-136],[-23,-421],[132,-448],[54,-346],[4,-177],[49,29],[-8,-579],[-45,-274],[65,-102],[-41,-246],[-116,-210],[-229,-199],[-334,-320],[-122,-219],[24,-248],[71,-40],[-24,-311],[-70,-430],[-32,-491],[-72,-267],[-190,-298],[-54,-86],[-118,-300],[-77,-303],[-158,-424],[-314,-609],[-196,-355],[-209,-269],[-291,-229],[-141,-31],[-36,-164],[-169,88],[-138,-113],[-301,114],[-168,-72],[-115,31],[-286,-233],[-238,-94],[-171,-223],[-127,-14],[-117,210],[-94,11],[-120,264],[-13,-82],[-37,159],[2,346],[-90,396],[89,108],[-7,453],[-182,553],[-139,501],[-1,1],[-199,768],[-207,446],[-108,432],[-62,575],[-68,428],[-93,910],[-7,707],[-35,322],[-108,243],[-144,489],[-146,708],[-60,371],[-226,577],[-17,453],[-26,372],[38,519],[96,541],[15,254],[90,532],[66,243],[159,386],[90,263],[29,438],[-15,335],[-83,211],[-74,358],[-68,355],[15,122],[85,235],[-84,570],[-57,396],[-139,374],[26,115],[-39,183],[-74,444],[-228,626],[-285,596],[-184,488],[-169,610],[9,196],[61,189],[67,430],[56,438],[-52,90],[96,663],[40,467],[-108,390],[-127,100],[-56,265],[-71,85],[3,163],[-289,-213],[-105,32],[-107,-133],[-222,13],[-149,370],[-91,427],[-197,390],[-209,-8],[-245,1],[-229,-69],[-224,-126],[-436,-346],[-154,-203],[-250,-171],[-248,168],[-126,-7],[-194,116],[-178,-7],[-329,-103],[-193,-170],[-275,-217],[-54,15],[-73,-5],[-286,282],[-252,450],[-237,323],[-187,381],[-75,44],[-200,238],[-144,316],[-49,216],[-34,437],[-122,349],[-108,232],[-71,76],[-69,118],[-32,261],[-41,130],[-80,97],[-149,247],[-117,39],[-63,166],[1,90],[-84,125],[-18,127],[-46,453],[36,262],[-115,460],[-138,210],[122,112],[134,415],[66,304],[-24,318],[78,291],[34,557],[-30,583],[-34,294],[28,295],[-72,281],[-146,255],[12,249],[13,274],[106,161],[91,308],[-18,200],[96,417],[155,376],[93,95],[74,344],[6,315],[100,365],[185,216],[177,603],[144,235],[259,66],[219,403],[139,158],[232,493],[-70,735],[106,508],[37,312],[179,399],[278,270],[206,244],[186,612],[87,362],[205,-2],[167,-251],[264,41],[288,-131],[121,-6],[267,323],[300,102],[175,244],[268,180],[471,105],[459,48],[140,-87],[262,232],[297,5],[113,-137],[190,35],[302,239],[195,-71],[-9,-299],[236,217],[20,-113],[-139,-289],[-2,-274],[96,-147],[-36,-511],[-183,-297],[53,-322],[143,-10],[70,-281],[106,-92],[326,-204],[117,51],[232,-98],[368,-264],[130,-526],[250,-114],[391,-248],[296,-293],[136,153],[133,272],[-65,452],[87,288],[200,277],[192,80],[375,-121],[95,-264],[104,-2],[88,-101],[276,-69],[68,-196],[369,10],[268,-156],[275,-175],[129,-92],[214,188],[114,169],[245,49],[198,-75],[75,-293],[65,193],[222,-140],[217,-33],[137,149],[80,194],[-19,34],[74,276],[56,446],[40,149],[8,6],[99,482],[138,416],[5,21],[-26,452],[68,243],[-102,268],[105,222],[-169,-51],[-233,136],[-191,-340],[-421,-66],[-225,317],[-300,20],[-64,-245],[-192,-71],[-268,315],[-303,-10],[-165,587],[-203,328],[135,459],[-176,283],[308,565],[428,23],[117,449],[529,-78],[334,383],[324,167],[459,13],[485,-416],[399,-229],[323,91],[239,-53],[328,309],[42,252],[-70,403],[-160,218],[-154,68],[-102,181],[-354,499],[-317,223],[-240,347],[202,95],[231,494],[-156,234],[410,241],[-8,129],[-249,-95],[-222,-48],[-185,-191],[-260,-31],[-239,-220],[16,-368],[136,-142],[284,35],[-55,-210],[-304,-103],[-377,-342],[-154,121],[61,277],[-304,173],[50,113],[265,197],[-80,135],[-432,149],[-19,221],[-257,-73],[-103,-325],[-215,-437],[6,-152],[-135,-128],[-84,56],[-78,-713],[-144,-245],[-101,-422],[89,-337],[33,-228],[243,-190],[-51,-145],[-330,-33],[-118,-182],[-232,-319],[-87,275],[3,122],[-169,17],[-145,56],[-336,-154],[192,-332],[-141,-96],[-154,0],[-147,304],[-52,-130],[62,-353],[139,-277],[-105,-130],[155,-272],[137,-171],[4,-334],[-257,157],[82,-302],[-176,-62],[105,-521],[-184,-7],[-228,257],[-104,472],[-49,393],[-108,272],[-143,337],[-18,168],[-48,41],[-5,130],[-154,199],[-24,281],[23,403],[38,184],[-46,93],[-59,46],[-78,192],[-120,118],[-261,218],[-161,213],[-254,176],[-233,435],[56,44],[-127,248],[-5,200],[-179,93],[-85,-255],[-82,198],[6,205],[10,9],[62,54],[-221,86],[-226,-210],[15,-293],[-34,-168],[91,-301],[261,-298],[140,-488],[309,-476],[217,3],[68,-130],[-78,-118],[249,-213],[204,-179],[238,-308],[29,-111],[-52,-211],[-154,276],[-242,97],[-116,-382],[200,-219],[-33,-309],[-116,-35],[-148,-506],[-116,-46],[1,181],[57,317],[60,126],[-108,342],[-85,298],[-115,74],[-82,255],[-179,107],[-120,238],[-206,38],[-217,267],[-254,384],[-189,341],[-86,584],[-138,68],[-226,195],[-128,-80],[-161,-274],[-115,-43],[-252,-334],[-548,160],[-404,-192],[-32,-355],[15,-344],[-263,-393],[-356,-125],[-25,-199],[-171,-327],[-107,-481],[108,-338],[-160,-263],[-60,-384],[-210,-118],[-197,-455],[-352,-8],[-265,11],[-174,-209],[-106,-223],[-136,49],[-103,199],[-79,340],[-259,92],[-112,-153],[-146,83],[-143,-65],[42,462],[-26,363],[-124,55],[-67,224],[22,386],[111,215],[20,239],[58,355],[-6,250],[-56,212],[-12,200],[14,420],[-114,257],[393,426],[340,-107],[373,4],[296,-101],[230,31],[449,-19],[144,354],[53,1177],[-287,620],[-205,299],[-424,228],[-28,430],[360,129],[466,-152],[-88,669],[263,-254],[646,461],[84,484],[243,119],[222,117],[143,162],[244,870],[380,247],[231,-17],[54,125],[232,32],[52,-130],[188,291],[-63,222],[-13,335],[-113,328],[-8,604],[46,159],[80,178],[244,36],[98,163],[223,167],[-9,-304],[-82,-192],[33,-166],[151,-89],[-68,-223],[-83,64],[-200,-425],[76,-288],[4,-228],[281,-138],[-3,-210],[283,111],[156,162],[313,-233],[132,-189],[189,174],[434,273],[350,200],[277,-100],[21,-144],[268,-7],[63,260],[383,191],[-59,497],[10,445],[136,371],[262,202],[221,-442],[223,12],[53,453],[32,349],[-102,-75],[-176,210],[-24,340],[351,164],[350,86],[301,-97],[287,17],[316,327],[-291,280],[-504,-47],[-489,-216],[-452,-125],[-161,322],[-269,195],[62,581],[-135,534],[133,344],[252,371],[635,640],[185,124],[-28,250],[-387,279],[-478,-167],[-269,-413],[43,-361],[-441,-475],[-537,-509],[-202,-832],[198,-416],[265,-328],[-255,-666],[-289,-138],[-106,-992],[-157,-554],[-337,57],[-158,-468],[-321,-27],[-89,558],[-232,671],[-211,835],[-187,363],[-548,-684],[-370,-138],[-385,301],[-99,635],[-88,1364],[256,380],[733,496],[549,609],[508,824],[668,1141],[465,444],[763,741],[610,259],[457,-31],[423,489],[506,-26],[499,118],[869,-433],[-358,-158],[305,-371],[286,206],[456,-358],[761,-140],[1050,-668],[213,-281],[18,-393],[-308,-311],[-454,-157],[-1240,449],[-204,-75],[453,-433],[36,-878],[358,-180],[217,-153],[36,286],[-174,263],[183,215],[672,-368],[234,144],[-187,433],[647,578],[256,-34],[260,-206],[161,406],[-231,352],[136,353],[-204,367],[777,-190],[158,-331],[-351,-73],[2,-328],[218,-203],[429,128],[68,377],[581,282],[969,507],[209,-29],[-273,-359],[344,-61],[199,202],[521,16],[412,245],[317,-356],[315,391],[-291,343],[145,195],[820,-179],[385,-185],[1006,-675],[186,309],[-282,313],[-8,125],[-335,58],[92,280],[-149,461],[-8,189],[512,535],[182,537],[207,116],[735,-156],[58,-328],[-263,-479],[173,-189],[89,-413],[-63,-809],[307,-362],[-120,-395],[-544,-839],[318,-87],[110,213],[306,151],[74,293],[240,281],[-162,336],[130,390],[-304,49],[-67,328],[222,594],[-361,481],[497,398],[-64,421],[139,13],[145,-328],[-109,-570],[297,-108],[-127,426],[465,233],[577,31],[513,-337],[-247,492],[-28,630],[484,119],[668,-26],[602,77],[-226,309],[321,388],[319,16],[540,293],[734,79],[93,162],[729,55],[227,-133],[624,314],[510,-10],[77,255],[265,252],[656,242],[476,-191],[-378,-146],[629,-90],[75,-292],[254,143],[812,-7],[626,-289],[223,-221],[-69,-307],[-307,-175],[-730,-328],[-209,-175],[345,-83],[410,-149],[250,112],[142,-379],[122,153],[444,93],[892,-97],[67,-276],[1162,-88],[15,451],[590,-103],[443,3],[449,-312],[128,-378],[-165,-247],[349,-465],[437,-240],[268,620],[446,-266],[473,159],[538,-182],[204,166],[455,-83],[-201,549],[367,256],[2509,-384],[236,-351],[727,-451],[1122,112],[553,-98],[231,-244],[-33,-432],[342,-168],[372,121],[492,15],[525,-116],[526,66],[484,-526],[344,189],[-224,378],[123,263],[886,-166],[578,36],[799,-282],[-99610,-258]],[[23933,96380],[-126,-17],[-521,38],[-74,165],[559,-9],[195,-109],[-33,-68]],[[19392,96485],[-518,-170],[-411,191],[224,188],[406,60],[392,-92],[-93,-177]],[[56867,96577],[-620,-241],[-490,137],[191,152],[-167,189],[575,119],[110,-222],[401,-134]],[[19538,97019],[-339,-115],[-461,1],[5,84],[285,177],[149,-27],[361,-120]],[[23380,96697],[-411,-122],[-226,138],[-119,221],[-22,245],[360,-24],[162,-39],[332,-205],[-76,-214]],[[22205,96856],[108,-247],[-453,66],[-457,192],[-619,21],[268,176],[-335,142],[-21,227],[546,-81],[751,-215],[212,-281]],[[79187,96845],[-1566,-228],[507,776],[229,66],[208,-38],[704,-336],[-82,-240]],[[55069,97669],[915,-440],[-699,-233],[-155,-435],[-243,-111],[-132,-490],[-335,-23],[-598,361],[252,210],[-416,170],[-541,499],[-216,463],[757,212],[152,-207],[396,8],[105,202],[408,20],[350,-206]],[[57068,98086],[545,-207],[-412,-318],[-806,-70],[-819,98],[-50,163],[-398,11],[-304,271],[858,165],[403,-142],[281,177],[702,-148]],[[64204,98169],[-373,-78],[-250,-45],[-39,-97],[-324,-98],[-301,140],[158,185],[-618,18],[542,107],[422,8],[57,-160],[159,142],[262,97],[412,-129],[-107,-90]],[[77760,97184],[-606,-73],[-773,170],[-462,226],[-213,423],[-379,117],[722,404],[600,133],[540,-297],[640,-572],[-69,-531]],[[25828,97644],[334,-190],[-381,-176],[-513,-445],[-492,-42],[-575,76],[-299,240],[4,215],[220,157],[-508,-4],[-306,196],[-176,268],[193,262],[192,180],[285,42],[-122,135],[646,30],[355,-315],[468,-127],[455,-112],[220,-390]],[[30972,99681],[742,-47],[597,-75],[508,-161],[-12,-157],[-678,-257],[-672,-119],[-251,-133],[605,3],[-656,-358],[-452,-167],[-476,-483],[-573,-98],[-177,-120],[-841,-64],[383,-74],[-192,-105],[230,-292],[-264,-202],[-429,-167],[-132,-232],[-388,-176],[39,-134],[475,23],[6,-144],[-742,-355],[-726,163],[-816,-91],[-414,71],[-525,31],[-35,284],[514,133],[-137,427],[170,41],[742,-255],[-379,379],[-450,113],[225,229],[492,141],[79,206],[-392,231],[-118,304],[759,-26],[220,-64],[433,216],[-625,68],[-972,-38],[-491,201],[-232,239],[-324,173],[-61,202],[413,112],[324,19],[545,96],[409,220],[344,-30],[300,-166],[211,319],[367,95],[498,65],[849,24],[148,-63],[802,100],[601,-38],[602,-37]],[[42472,99925],[1737,-469],[-513,-227],[-1062,-26],[-1496,-58],[140,-105],[984,65],[836,-204],[540,181],[231,-212],[-305,-344],[707,220],[1348,229],[833,-114],[156,-253],[-1132,-420],[-157,-136],[-888,-102],[643,-28],[-324,-431],[-224,-383],[9,-658],[333,-386],[-434,-24],[-457,-187],[513,-313],[65,-502],[-297,-55],[360,-508],[-617,-42],[322,-241],[-91,-208],[-391,-91],[-388,-2],[348,-400],[4,-263],[-549,244],[-143,-158],[375,-148],[364,-361],[105,-476],[-495,-114],[-214,228],[-344,340],[95,-401],[-322,-311],[732,-25],[383,-32],[-745,-515],[-755,-466],[-813,-204],[-306,-2],[-288,-228],[-386,-624],[-597,-414],[-192,-24],[-370,-145],[-399,-138],[-238,-365],[-4,-415],[-141,-388],[-453,-472],[112,-462],[-125,-488],[-142,-577],[-391,-36],[-410,482],[-556,3],[-269,324],[-186,577],[-481,735],[-141,385],[-38,530],[-384,546],[100,435],[-186,208],[275,691],[418,220],[110,247],[58,461],[-318,-209],[-151,-88],[-249,-84],[-341,193],[-19,401],[109,314],[258,9],[567,-157],[-478,375],[-249,202],[-276,-83],[-232,147],[310,550],[-169,220],[-220,409],[-335,626],[-353,230],[3,247],[-745,346],[-590,43],[-743,-24],[-677,-44],[-323,188],[-482,372],[729,186],[559,31],[-1188,154],[-627,241],[39,229],[1051,285],[1018,284],[107,214],[-750,213],[243,235],[961,413],[404,63],[-115,265],[658,156],[854,93],[853,5],[303,-184],[737,325],[663,-221],[390,-46],[577,-192],[-660,318],[38,253],[932,353],[975,-27],[354,218],[982,57],[2219,-74]]],bbox:[-180,-85.60903777459777,180,83.64513000000002],transform:{scale:[.0036000360003600037,.0016925586033320111],translate:[-180,-85.60903777459777]}};var Sn=matchMedia("(pointer: coarse)").matches||innerWidth<760,vh=Sn?.5:1,ra=matchMedia("(prefers-reduced-motion: reduce)").matches,Qt=(n,t,e)=>new P(n,t,e),sa=n=>1-Math.pow(1-Math.min(1,Math.max(0,n)),3);function da(n,t,e){let i=document.createElement("canvas");i.width=i.height=n,t(i.getContext("2d"),n);let s=new To(i);return s.colorSpace=ai,e&&(s.wrapS=s.wrapT=hr,s.repeat.set(e,e),s.anisotropy=4),s}var hh=da(64,(n,t)=>{let e=n.createRadialGradient(t/2,t/2,0,t/2,t/2,t/2);e.addColorStop(0,"rgba(255,255,255,1)"),e.addColorStop(.35,"rgba(255,255,255,.55)"),e.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=e,n.fillRect(0,0,t,t)}),Qp=da(128,(n,t)=>{let e=7,i=()=>(e=e*16807%2147483647)/2147483647;for(let s=0;s<26;s++){let r=t/2+(i()-.5)*t*.42,o=t/2+(i()-.5)*t*.42,a=t*(.12+i()*.2),l=n.createRadialGradient(r,o,0,r,o,a),c=.16+i()*.12;l.addColorStop(0,`rgba(255,255,255,${c})`),l.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=l,n.fillRect(0,0,t,t)}}),jp=(n,t,e,i)=>da(256,(s,r)=>{s.fillStyle=n,s.fillRect(0,0,r,r);let o=3,a=()=>(o=o*16807%2147483647)/2147483647;for(let l=0;l<e;l++){let c=(a()-.5)*t;s.fillStyle=c>0?`rgba(255,250,235,${c})`:`rgba(40,30,15,${-c})`;let h=1+a()*5;s.fillRect(a()*r,a()*r,h,h*(.4+a()))}},i),$y=da(256,(n,t)=>{n.fillStyle="#f4f7fa",n.fillRect(0,0,t,t);let e=11,i=()=>(e=e*16807%2147483647)/2147483647;for(let s=0;s<3200;s++){let r=i();n.fillStyle=r>.5?`rgba(255,255,255,${(r-.5)*1.4})`:`rgba(120,145,170,${r*.5})`;let o=1+i()*3;n.fillRect(i()*t,i()*t,o,o)}for(let s=0;s<90;s++){let r=i()*t,o=i()*t,a=10+i()*60;n.fillStyle=`rgba(140,165,190,${.2+i()*.3})`,n.fillRect(r,o,1+i()*3,a)}},3),ie={body:new Ke({color:14672863,roughness:.5,metalness:.25}),bodyDark:new Ke({color:3817286,roughness:.6,metalness:.4}),nozzle:new Ke({color:4865075,roughness:.35,metalness:.85,side:Ye}),steel:new Ke({color:9255724,roughness:.55,metalness:.5}),concrete:new Ke({map:jp("#9a978f",.22,2600,6),roughness:.95}),pit:new Ke({color:2828840,roughness:1}),steppe:new Ke({map:jp("#b39d6e",.3,5e3,260),roughness:1}),frost:new Ke({map:$y,color:16777215,emissive:10466504,emissiveIntensity:.28,roughness:.97,metalness:0,transparent:!0}),halo:new Es({map:hh,color:16751164,blending:wi,transparent:!0,depthWrite:!1,opacity:.9}),core:new ci({map:hh,color:16767392,blending:wi,transparent:!0,depthWrite:!1,side:Ye}),flame:new ci({map:hh,blending:wi,transparent:!0,depthWrite:!1}),smoke:new ci({map:Qp,transparent:!0,depthWrite:!1}),fire:new ci({map:Qp,blending:wi,transparent:!0,depthWrite:!1})},Kr=(n,t=40)=>new Ro(n.map(([e,i])=>new at(e,i)),t),De=(n,t,e=!0)=>{let i=new Ce(n,t);return i.castShadow=e,i.receiveShadow=e,i};function Ky(n,t){return Kr([[n*.55,.12],[n*.42,0],[n*.5,-t*.25],[n*.8,-t*.65],[n,-t]],18)}var oa,aa=new Set;function Tn(n,t){return oa.addSystem(n),(t||Ee).add(n.emitter),aa.add(n),n}function bn(n){aa.has(n)&&(aa.delete(n),oa.deleteSystem(n),n.emitter.removeFromParent(),n.dispose())}var Ws=(n,t)=>new Vs(n.map(([e,i,s,r])=>[new ut(e,i,s),r]),t),la=(n,t,e,i)=>new Fr([[new ks(n,t,e,i),0]]);function Qy(n){let t=new yn({duration:1,looping:!0,worldSpace:!0,startLife:new te(.26,.5),startSpeed:new te(26*n+8,36*n+10),startSize:new te(1*n,1.7*n),startColor:new Ei(new _e(1,.95,.85,1),new _e(1,.78,.5,1)),shape:new kn({radius:.32*n,angle:.07,thickness:1,arc:Math.PI*2}),emissionOverTime:new Bt(0),material:ie.flame,renderMode:pt.BillBoard,behaviors:[new Bi(Ws([[1,1,.92,0],[1,.66,.2,.35],[.85,.28,.06,1]],[[1,0],[.85,.4],[0,1]])),new _n(la(.55,1.2,1.9,2.6))]});return t.emitter.rotation.x=Math.PI/2,t.nozzleRate=(Sn?34:70)*Math.max(.55,n),t}function ph({size:n=6,life:t=[3,5],speed:e=[8,16],rate:i=20,angle:s=.5,radius:r=2,color:o=[.86,.85,.83],alpha:a=.75,rise:l=2.5}){return new yn({duration:1,looping:!0,worldSpace:!0,startLife:new te(t[0],t[1]),startSpeed:new te(e[0],e[1]),startSize:new te(n*.7,n*1.3),startRotation:new te(0,Math.PI*2),startColor:new Ei(new _e(o[0],o[1],o[2],a),new _e(o[0]*.92,o[1]*.92,o[2]*.92,a)),shape:new kn({radius:r,angle:s,thickness:1,arc:Math.PI*2}),emissionOverTime:new Bt(i*vh),material:ie.smoke,renderMode:pt.BillBoard,behaviors:[new Bi(Ws([[1,.82,.62,0],[1,1,1,.25],[.95,.95,.95,1]],[[0,0],[1,.08],[.7,.5],[0,1]])),new _n(la(.6,1.6,2.6,3.4)),new xn(new ut(0,1,0),new Bt(l))]})}function Rd(n){let t=new yn({duration:1,looping:!0,worldSpace:!0,startLife:new te(2.4,4),startSpeed:new te(1,2.6),startSize:new te(1.8,3.4),startRotation:new te(0,6.28),startColor:new Ei(new _e(1,1,1,.7),new _e(.92,.96,1,.7)),shape:new kn({radius:n,angle:1.1,thickness:1,arc:Math.PI*2}),emissionOverTime:new Bt(0),material:ie.smoke,renderMode:pt.BillBoard,behaviors:[new Bi(Ws([[1,1,1,0],[1,1,1,1]],[[0,0],[1,.15],[.6,.55],[0,1]])),new _n(la(.5,1.4,2.3,3)),new xn(new ut(0,-1,0),new Bt(1.6))]});return t.emitter.rotation.x=Math.PI/2,t.vaporRate=(Sn?9:16)*vh,t}function jy(){return new yn({duration:1.6,looping:!1,worldSpace:!0,emissionOverTime:new Bt((Sn?70:150)*vh),startLife:new te(1.5,3),startSpeed:new te(1,5),startSize:new te(.12,.4),startRotation:new te(0,6.28),startColor:new Ei(new _e(1,1,1,1),new _e(.85,.92,1,1)),shape:new kn({radius:3,angle:1.4,thickness:1,arc:Math.PI*2}),material:ie.flame,renderMode:pt.BillBoard,behaviors:[new xn(new ut(0,-1,0),new Bt(14)),new Bi(Ws([[1,1,1,0],[.8,.9,1,1]],[[1,0],[.8,.7],[0,1]]))]})}function mh(n,t,e,i=40){let s=a=>{for(let l=1;l<n.length;l++){let[c,h]=n[l-1],[u,f]=n[l];if(a>=h&&a<=f)return f===h?u:c+(u-c)*(a-h)/(f-h)}return 0},r=[];for(let a=0;a<=12;a++){let l=t+(e-t)*a/12;r.push([s(l)+.03,l])}let o=De(Kr(r,i),ie.frost,!1);return o.receiveShadow=!0,o}function tm(n,t){let e=t?1.6:1,i=o=>[{time:0,count:new Bt(Math.round(o*(Sn?.6:1))),cycle:1,interval:.01,probability:1}],s={duration:.5,looping:!1,autoDestroy:!0,worldSpace:!0,emissionOverTime:new Bt(0)},r=[new yn({...s,emissionBursts:i(110),startLife:new te(.7,1.7),startSpeed:new te(6*e,26*e),startSize:new te(5*e,11*e),startRotation:new te(0,6.28),startColor:new Ei(new _e(1,.95,.8,1),new _e(1,.7,.35,1)),shape:new Vn({radius:2.5*e,thickness:1}),material:ie.fire,renderMode:pt.BillBoard,behaviors:[new Bi(Ws([[1,1,.85,0],[1,.55,.12,.3],[.45,.1,.03,1]],[[1,0],[.9,.5],[0,1]])),new _n(la(.5,1.5,2.2,2.6))]}),new yn({...s,emissionBursts:i(70),startLife:new te(3,5.5),startSpeed:new te(3*e,12*e),startSize:new te(8*e,15*e),startRotation:new te(0,6.28),startColor:new Ei(new _e(.2,.18,.17,.9),new _e(.33,.3,.28,.9)),shape:new Vn({radius:3*e,thickness:1}),material:ie.smoke,renderMode:pt.BillBoard,behaviors:[new Bi(Ws([[1,.5,.25,0],[1,1,1,.2],[1,1,1,1]],[[0,0],[1,.1],[.6,.6],[0,1]])),new _n(la(.4,1.4,2.4,3.2)),new xn(new ut(0,1,0),new Bt(3))]}),new yn({...s,emissionBursts:i(90),startLife:new te(.8,2.2),startSpeed:new te(25*e,70*e),startSize:new te(.35,.8),startColor:new Ei(new _e(1,.9,.6,1),new _e(1,.6,.2,1)),shape:new zr,material:ie.flame,renderMode:pt.BillBoard,behaviors:[new xn(new ut(0,-1,0),new Bt(22)),new Bi(Ws([[1,1,1,0],[1,.4,.1,1]],[[1,0],[0,1]]))]})];for(let o of r)o.emitter.position.copy(n),Tn(o),setTimeout(()=>bn(o),7e3);Qr({dur:t?4.5:3,gain:t?1.6:1.1,f0:1800,f1:60}),Qr({dur:.5,gain:.9,f0:4e3,f1:400}),ca.position.copy(n),ca.intensity=t?9e3:5e3,Jr=ra?0:.9}var ae=null,Qi,uh,Xr,dh,cm,Od=!0,Hr=0;function hm(){if(ae){ae.state==="suspended"&&ae.resume();return}let n=window.AudioContext||window.webkitAudioContext;if(!n)return;if(ae=new n,Qi=ae.createGain(),Qi.gain.value=Od?.8:0,Qi.connect(ae.destination),window.__recAudio){let l=ae.createMediaStreamDestination();Qi.connect(l),window.__audioStream=l.stream}let t=ae.sampleRate*3,e=ae.createBuffer(1,t,ae.sampleRate),i=e.getChannelData(0),s=0;for(let l=0;l<t;l++){let c=Math.random()*2-1;s=(s+.02*c)/1.02,i[l]=s*3.5+c*.08}cm=e;let r=ae.createBufferSource();r.buffer=e,r.loop=!0,Xr=ae.createBiquadFilter(),Xr.type="lowpass",Xr.frequency.value=300,Xr.Q.value=.7,uh=ae.createGain(),uh.gain.value=0,r.connect(Xr).connect(uh).connect(Qi),r.start();let o=ae.createOscillator();o.type="sawtooth",o.frequency.value=38;let a=ae.createBiquadFilter();a.type="lowpass",a.frequency.value=90,dh=ae.createGain(),dh.gain.value=0,o.connect(a).connect(dh).connect(Qi),o.start()}function Qr({dur:n=1.5,gain:t=1,f0:e=1200,f1:i=120,q:s=.8,delay:r=0}){if(!ae)return;let o=ae.currentTime+r,a=ae.createBufferSource();a.buffer=cm,a.playbackRate.value=.8+Math.random()*.4;let l=ae.createBiquadFilter();l.type="lowpass",l.Q.value=s,l.frequency.setValueAtTime(e,o),l.frequency.exponentialRampToValueAtTime(i,o+n);let c=ae.createGain();c.gain.setValueAtTime(1e-4,o),c.gain.exponentialRampToValueAtTime(t,o+.02),c.gain.exponentialRampToValueAtTime(1e-4,o+n),a.connect(l).connect(c).connect(Qi),a.start(o,Math.random()*1.5),a.stop(o+n+.1)}function t3(){if(!ae)return;let n=ae.currentTime;for(let[t,e]of[[180,.5],[413,.3],[767,.18]]){let i=ae.createOscillator();i.type="triangle",i.frequency.value=t;let s=ae.createGain();s.gain.setValueAtTime(e,n),s.gain.exponentialRampToValueAtTime(1e-4,n+1.1),i.connect(s).connect(Qi),i.start(n),i.stop(n+1.2)}Qr({dur:.35,gain:.6,f0:2500,f1:300})}function e3(){if(!ae)return;let n=ae.currentTime;[[659,0],[880,.18],[1319,.36]].forEach(([t,e])=>{let i=ae.createOscillator();i.type="sine",i.frequency.value=t;let s=ae.createGain();s.gain.setValueAtTime(1e-4,n+e),s.gain.exponentialRampToValueAtTime(.35,n+e+.03),s.gain.exponentialRampToValueAtTime(1e-4,n+e+1.6),i.connect(s).connect(Qi),i.start(n+e),i.stop(n+e+1.7)})}function i3(){if(!ae)return;let n=ce,t=0;n&&Wt==="count"?t=[0,.3,.55,1][n.lit||0]:n&&Wt==="fly"?t=Math.max(.22,1-n.g.position.y/520):Wt==="sep"?t=Math.max(0,.3-ee*.03):Wt==="tower2"&&n&&n.spark>=1&&n.spark<4?t=.25:Wt==="map"&&zi==="ok"&&Ai<2&&(t=.05),Hr+=(t-Hr)*.08;let e=ae.currentTime;uh.gain.setTargetAtTime(Hr*1.1,e,.05),Xr.frequency.setTargetAtTime(220+Hr*900+Math.random()*60*Hr,e,.05),dh.gain.setTargetAtTime(Hr*.35,e,.05)}function n3(n){Od=n,Qi&&Qi.gain.setTargetAtTime(n?.8:0,ae.currentTime,.05);let t=Pi.root.querySelector("#r3Snd");t&&(t.setAttribute("aria-pressed",n?"true":"false"),t.textContent=n?"\u0417\u0432\u0443\u043A: \u0432\u043A\u043B\u044E\u0447\u0451\u043D":"\u0417\u0432\u0443\u043A: \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D")}function gh(n,t,e){for(let[i,s,r,o,a]of t){let l=De(Ky(r,o),ie.nozzle,!1);l.position.set(i,0,s),n.add(l);let c=new Ce(new Mr(r*.9,5*o,12,1,!0),ie.core);c.position.set(i,-o-2.5*o,s),c.rotation.x=Math.PI,c.visible=!1,n.add(c);let h=new As(ie.halo);h.position.set(i,-o-.5,s),h.visible=!1,h.size=r*13,n.add(h);let u=Qy(r/.42);u.emitter.position.set(i,-o,s),Tn(u,n),e.push({ps:u,core:c,halo:h,steer:a,rExit:r})}}function s3(){let n=new Ue,t=[],e=[],i=[[0,0],[1.02,0],[1.07,.5],[1.07,13.8],[1.2,16.2],[1.47,18.6],[1.47,22.6],[1.36,23.6],[1.22,24.2],[1.05,25.4],[.78,26.9],[.48,28.3],[.24,29.3],[.07,29.85],[0,29.9]],s=De(Kr(i),ie.body);n.add(s);let r=[mh(i,17.7,22)],o=[];n.add(r[0]);let a=Rd(1.2);a.emitter.position.y=21.5,Tn(a,n),o.push(a);let l=De(new Di(1.08,1.04,1.2,40),ie.bodyDark);l.position.y=.6,n.add(l);let c=De(new br(1.33,.12,8,40),ie.bodyDark);c.rotation.x=Math.PI/2,c.position.y=17.4,n.add(c);let h=De(new Di(1.48,1.48,.5,40),ie.bodyDark);h.position.y=22.3,n.add(h);let u=[];for(let[g,p]of[[.38,.38],[-.38,.38],[.38,-.38],[-.38,-.38]])u.push([g,p,.36,1.5,!1]);for(let g=0;g<4;g++){let p=Math.PI/4+g*Math.PI/2;u.push([Math.cos(p)*.86,Math.sin(p)*.86,.16,.75,!0])}gh(n,u,t);let f=2.42,d=Math.asin((f-1.5)/18.9),m=[[0,0],[1.3,0],[1.34,.5],[1.34,3.2],[1.2,6.5],[.98,10.2],[.76,13.4],[.55,15.8],[.36,17.3],[.19,18.3],[.05,18.9],[0,19]],_=Kr(m);for(let g=0;g<4;g++){let p=g*Math.PI/2,w=new Ue;w.position.set(Math.cos(p)*f,0,Math.sin(p)*f),w.rotation.y=-p,n.add(w);let M=new Ue;M.rotation.z=d,w.add(M),M.add(De(_,ie.body));let v=mh(m,9.5,16.6,32);M.add(v),r.push(v);let T=Rd(.5);T.emitter.position.y=16.2,Tn(T,M),o.push(T);let S=De(new Di(1.35,1.31,1,36),ie.bodyDark);S.position.y=.5,M.add(S);let A=De(new hi(1.3,1.1,.07),ie.bodyDark);A.position.set(1.85,.9,0),M.add(A);let I=[];for(let[E,R]of[[.4,.4],[-.4,.4],[.4,-.4],[-.4,-.4]])I.push([E,R,.35,1.45,!1]);I.push([1.02,.62,.15,.7,!0],[1.02,-.62,.15,.7,!0]);let y=[];gh(M,I,y),t.push(...y),e.push({yaw:w,b:M,phi:p,noz:y,tilt:d})}return{g:n,noz:t,sides:e,central:t.slice(0,8),kind:"pack",frost:r,vapor:o}}function r3(){let n=new Ue,t=[],e=new Ue;n.add(e);let i=[[0,0],[1.5,0],[1.55,.5],[1.55,15.6],[1.35,16.6],[0,16.6]];e.add(De(Kr(i),ie.body));let s=[mh(i,9,15.4)],r=[Rd(1.4)];e.add(s[0]),r[0].emitter.position.y=15,Tn(r[0],e);let o=De(new Di(1.57,1.57,1.2,40),ie.bodyDark);o.position.y=.6,e.add(o);let a=[];for(let[f,d]of[[.5,.5],[-.5,.5],[.5,-.5],[-.5,-.5]])a.push([f,d,.4,1.6,!1]);for(let f=0;f<4;f++){let d=Math.PI/4+f*Math.PI/2;a.push([Math.cos(d)*1.15,Math.sin(d)*1.15,.17,.75,!0])}gh(e,a,t);let l=new Ue;l.position.y=16.6,n.add(l);let c=[[0,0],[1.3,0],[1.3,.3],[1.3,8.4],[1.1,9.4],[.75,11.2],[.38,12.6],[.08,13.3],[0,13.4]];l.add(De(Kr(c),ie.body)),s.push(mh(c,4.2,8.2)),l.add(s[1]);let h=De(new Di(1.33,1.33,.6,40),ie.bodyDark);h.position.y=.3,l.add(h);let u=[];return gh(l,[[0,0,.45,1.2,!1]],u),{g:n,noz:t,s1:e,s2:l,n2:u,kind:"tower",frost:s,vapor:r}}var Xs,di,Ee,We,Ze,Pd,en,vn,qr,ca,Yr,Jr=0,ce,ji={scheme:"tower",drop:"keep"},Wt="build",ee=0,wn=null,Xn=[],um=[],Hs=[],tn=null,Ci=Qt(0,0,0),dm=!1,ha={},Pi;function o3(){let t=[];for(let s of[-.45,.45]){let r=new hi(.22,16.2,.22);r.translate(s,16.2/2,0),t.push(r)}for(let s=.8;s<16.2-.5;s+=1.35){let r=new hi(.9,.12,.12);r.translate(0,s,0),t.push(r);let o=new hi(.1,1.55,.1);o.rotateZ((s/1.35|0)%2?.58:-.58),o.translate(0,s+.67,0),t.push(o)}let e=new hi(1.3,.7,.9);e.translate(-.4,16.2,0),t.push(e);let i=new hi(1.4,1.6,1.2);return i.translate(.7,.8,0),t.push(i),De(Lp(t),ie.steel)}function a3(){let n=De(new Fn(9e3,9e3),ie.steppe,!1);n.receiveShadow=!0,n.rotation.x=-Math.PI/2,n.position.y=-.02,Ee.add(n);let t=5.5,e=(a,l,c,h)=>{let u=De(new hi(a,1,l),ie.concrete);u.position.set(c,-.5,h),u.castShadow=!1,Ee.add(u)};e(90,40-t,0,(40+t)/2),e(90,40-t,0,-(40+t)/2),e(45-t,2*t,(45+t)/2,0),e(45-t-14,2*t,-(45+t+14)/2,0);let i=ie.pit.clone();i.side=ke;let s=De(new hi(2*t+14,16,2*t),i,!1);s.position.set(-7,-8.6,0),Ee.add(s);let r=De(new br(6.6,.35,8,48),ie.steel);r.rotation.x=Math.PI/2,r.position.y=.25,Ee.add(r);for(let a=0;a<4;a++){let l=Math.PI/4+a*Math.PI/2,c=new Ue;c.position.set(Math.cos(l)*6.5,.3,Math.sin(l)*6.5),c.rotation.y=-l,Ee.add(c);let h=new Ue;c.add(h),h.add(o3()),um.push(h)}_h(0);let o=De(new es(9,24,12,0,Math.PI*2,0,Math.PI/2),ie.steppe);o.scale.y=.35,o.position.set(110,0,-70),Ee.add(o);for(let[a,l]of[[-48,-36],[48,-36],[-48,36],[48,36]]){let c=De(new Di(.25,.7,62,6),ie.steel);c.position.set(a,31,l),Ee.add(c)}}var em=Math.atan2(6.5-1.95,15.4),l3=-.62;function _h(n){for(let t of um)t.rotation.z=em+(l3-em)*sa(n)}function c3(){let n=new Fe({side:ke,depthWrite:!1,fog:!1,uniforms:{uAlt:{value:0},uSun:{value:Qt(.55,.42,.72).normalize()}},vertexShader:"varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }",fragmentShader:`varying vec3 vD; uniform float uAlt; uniform vec3 uSun;
      void main(){ float h = max(vD.y, 0.0);
        vec3 hor = mix(vec3(0.86,0.88,0.86), vec3(0.42,0.5,0.66), uAlt);
        vec3 zen = mix(vec3(0.24,0.45,0.78), vec3(0.01,0.02,0.07), uAlt);
        vec3 c = mix(hor, zen, pow(h, 0.55));
        c += vec3(1.0,0.86,0.6) * pow(max(dot(vD, uSun), 0.0), 220.0) * 1.4 + vec3(1.0,0.8,0.55) * pow(max(dot(vD, uSun), 0.0), 8.0) * 0.18;
        if (vD.y < 0.0) c = mix(hor, vec3(0.55,0.5,0.4), min(-vD.y * 6.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`});qr=new Ce(new es(8e3,32,16),n),qr.frustumCulled=!1,Ee.add(qr)}function Le(n,t){let e=Pi.msg;e.className="lab-msg"+(t?" "+t:""),e.textContent=n}function Ri(n,t){if(Pi.count.replaceChildren(),!!n&&(Pi.count.textContent=n,t)){let e=document.createElement("small");e.textContent=t,Pi.count.prepend(e)}}function fm(n){for(let t of Pi.root.querySelectorAll("#r3Ctrl .seg, #r3Go"))t.disabled=n}var pm={},mm=()=>ji.scheme==="pack"?"pack-"+ji.drop:"tower";function Zr(n){Pi.hint.textContent=n}function Id(n){pm[mm()]=n;let t=[!ha.s&&"\u0431\u0430\u0448\u043D\u044E",!ha.d&&"\u043F\u0430\u043A\u0435\u0442 \u0441 \xAB\u0412\u0435\u0437\u0442\u0438 \u0434\u043E \u043A\u043E\u043D\u0446\u0430\xBB"].filter(Boolean);Zr(n==="tower"?"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043D\u0430\u0436\u043C\u0438 \xAB\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E\xBB, \u0432\u044B\u0431\u0435\u0440\u0438 \xAB\u041F\u0430\u043A\u0435\u0442\u043E\u043C \u0432\u043E\u043A\u0440\u0443\u0433 \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E\xBB \u2014 \u0442\u043E\u0433\u0434\u0430 \u0432\u0441\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0437\u0430\u0433\u043E\u0440\u044F\u0442\u0441\u044F \u0435\u0449\u0451 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435.":n==="keep"?"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043D\u0430\u0436\u043C\u0438 \xAB\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E\xBB, \u043E\u0441\u0442\u0430\u0432\u044C \u043F\u0430\u043A\u0435\u0442, \u0430 \u043F\u0443\u0441\u0442\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u2014 \xAB\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C\xBB. \u041B\u0438\u0448\u043D\u0438\u0439 \u0432\u0435\u0441 \u0443\u0439\u0434\u0451\u0442, \u0438 \u0440\u0430\u043A\u0435\u0442\u0430 \u043F\u043E\u043B\u0435\u0442\u0438\u0442 \u0434\u0430\u043B\u044C\u0448\u0435.":t.length?"\u0420\u0430\u043A\u0435\u0442\u0430 \u0434\u043E\u0448\u043B\u0430. \u0427\u0442\u043E\u0431\u044B \u043D\u0430\u0439\u0442\u0438 \u043E\u0431\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u044B \u043D\u0435\u0443\u0434\u0430\u0447\u0438, \u043D\u0430\u0436\u043C\u0438 \xAB\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E\xBB \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 "+t.join(", \u043F\u043E\u0442\u043E\u043C ")+": \u0443\u0432\u0438\u0434\u0438\u0448\u044C, \u043F\u043E\u0447\u0435\u043C\u0443 \u0442\u0430\u043A \u043D\u0435 \u0434\u043E\u043B\u0435\u0442\u0430\u0435\u0442.":"\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u043E \u0432\u0441\u0451: \u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0431\u043E\u0440\u043A\u0430 \u043D\u0430\u0439\u0434\u0435\u043D\u0430, \u043E\u0431\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u044B \u043D\u0435\u0443\u0434\u0430\u0447\u0438 \u0442\u043E\u0436\u0435. \u041C\u043E\u0436\u043D\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430 \u0438 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0441 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D.")}function Nd(n,t){typeof window.award=="function"&&window.award(n,t)}function Gn(n,t){for(let e of n)e.ps.emissionOverTime.value=t>0?e.ps.nozzleRate*t:0,e.core.visible=t>.3,e.level=t,e.halo.visible=t>0,e.halo.scale.setScalar(e.halo.size*(.6+.4*Math.min(t,1.2)))}function gm(n){for(let t of ce&&ce.vapor||[])t.emissionOverTime.value=t.vaporRate*n}function h3(){if(ce){for(let n of[...ce.noz,...ce.n2||[]])bn(n.ps);for(let n of ce.vapor||[])bn(n);ce.g.removeFromParent()}}var $r=[];function na(n,t,e,i){$r.push({t:-t,dur:n,fn:e,done:i})}function Ud(n){h3(),ce=n==="pack"?s3():r3(),Ee.add(ce.g),ce.g.position.set(0,.3,0),ie.frost.opacity=1,gm(1);let t=n==="pack"?[]:[{o:ce.s1,d:0},{o:ce.s2,d:.45}];if(n==="pack")ce.g.position.y=40,na(.8,0,e=>{ce.g.position.y=.3+39.7*(1-sa(e))}),ce.sides.forEach((e,i)=>{let s=e.yaw.position.clone(),r=Qt(Math.cos(e.phi)*12,9,Math.sin(e.phi)*12);e.yaw.position.add(r),na(.7,.75+i*.18,o=>{e.yaw.position.copy(s).addScaledVector(r,1-sa(o))})});else for(let e of t){let i=e.o.position.y;e.o.position.y=i+45,na(.8,e.d,s=>{e.o.position.y=i+45*(1-sa(s))})}_h(.7),na(.6,n==="pack"?1.5:1.1,e=>_h(.7*(1-e)))}var ch=[["\u041A\u043B\u044E\u0447 \u043D\u0430 \u0441\u0442\u0430\u0440\u0442",10],["\u041F\u0440\u043E\u0442\u044F\u0436\u043A\u0430",9],["\u041F\u0440\u043E\u0434\u0443\u0432\u043A\u0430",8],["\u041A\u043B\u044E\u0447 \u043D\u0430 \u0434\u0440\u0435\u043D\u0430\u0436",7],["\u041F\u0443\u0441\u043A",6],["\u0417\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435",5],["\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F",4],["\u041F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043E\u0447\u043D\u0430\u044F",3],["\u0413\u043B\u0430\u0432\u043D\u0430\u044F",2],["\u041F\u043E\u0434\u044A\u0451\u043C!",0]],Td=null;function _m(){return Td||(Td=import("./chunk-P5YVPDMR.js").then(async n=>(vn=n.default||n,await vn.init(),en=new vn.World({x:0,y:-9.81,z:0}),en.createCollider(vn.ColliderDesc.cuboid(4e3,1,4e3).setTranslation(0,-1,0).setFriction(.8).setRestitution(.15)),vn))),Td}function u3(){if(Wt!=="build")return;hm();for(let t of $r)t.fn(1);$r=[],Wt="count",ee=0,fm(!0),_m().catch(t=>console.warn("rapier",t));let n=pm[mm()];Le(n==="tower"||n==="keep"?"\u0422\u0430\u043A \u0442\u044B \u0443\u0436\u0435 \u043F\u0440\u043E\u0431\u043E\u0432\u0430\u043B, \u0438 \u0440\u0430\u043A\u0435\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0435\u0442\u0435\u043B\u0430. \u041F\u0443\u0441\u043A\u0430\u0435\u043C \u0435\u0449\u0451 \u0440\u0430\u0437 \u2014 \u0441\u043C\u043E\u0442\u0440\u0438, \u0432 \u043A\u0430\u043A\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0441\u043E\u0440\u0432\u0451\u0442\u0441\u044F.":"\u041E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043E\u0442\u0441\u0447\u0451\u0442. \u0421\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u0441\u0446\u0435\u043D\u0443."),Zr("\u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0430\u0436\u0438\u043C\u0430\u0442\u044C \u043D\u0435 \u043D\u0443\u0436\u043D\u043E: \u0441\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u0441\u0446\u0435\u043D\u0443 \u0438 \u0447\u0438\u0442\u0430\u0439 \u043F\u043E\u0434 \u043D\u0435\u0439, \u0447\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442.")}function d3(n){y3();for(let t of Xn)en&&en.removeRigidBody(t.body),t.obj.removeFromParent();Xn=[],wn=null,Ci.set(0,0,0),dm=!1;for(let t of Hs)bn(t);Hs=[],tn&&(bn(tn),tn=null),ce&&ce.s2Holder&&ce.s2Holder.removeFromParent(),Wt="build",ee=0,Pi.lastCmd=-1,Ri(""),Yr.intensity=0,Sh=1,xh=null,Mn=1,Ud(ji.scheme==="pack"?"pack":"tower"),qr.material.uniforms.uAlt.value=0,ps=null,Xs.removeFromParent(),Xs.intensity=0,Ze.target.set(0,13,0),We.position.copy(Ld),fm(!1),Le(n||"\u0420\u0430\u043A\u0435\u0442\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0435. \u0412\u044B\u0431\u0435\u0440\u0438, \u043A\u0430\u043A \u0435\u0451 \u0441\u043E\u0431\u0440\u0430\u0442\u044C, \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB\u041F\u0443\u0441\u043A\xBB."),Pi.hint.textContent.startsWith("\u0421\u0435\u0439\u0447\u0430\u0441")&&Zr("\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u0432\u044B\u0431\u0435\u0440\u0438, \u043A\u0430\u043A \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0440\u0430\u043A\u0435\u0442\u0443 \u0438 \u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0441 \u043F\u0443\u0441\u0442\u044B\u043C\u0438 \u0431\u043B\u043E\u043A\u0430\u043C\u0438, \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB\u041F\u0443\u0441\u043A\xBB.")}function Mh(n,t,e,i,s,r){Ee.updateMatrixWorld(!0);let o=n.localToWorld(t.clone()),a=n.getWorldQuaternion(new mi),l=new Ue;l.position.copy(o),l.quaternion.copy(a),Ee.add(l),l.add(n),n.position.copy(t).negate(),n.quaternion.identity();let c=en.createRigidBody(vn.RigidBodyDesc.dynamic().setTranslation(o.x,o.y,o.z).setRotation(a).setLinvel(i.x,i.y,i.z).setAngvel(s).setLinearDamping(.02).setAngularDamping(.05).setCanSleep(!0));return en.createCollider(e.setMass(r).setFriction(.7).setRestitution(.2),c),Xn.push({body:c,obj:l}),l}function im(n,t,e){for(let i=0;i<e;i++){let s=Math.random()<.4,r=s?.9+Math.random()*.5:.35+Math.random()*.4,o=s?2+Math.random()*3:.6+Math.random(),a=De(new Di(r,r*(.7+Math.random()*.3),o,9,1,!0,0,Math.PI*(.7+Math.random())),i%3?ie.body:ie.bodyDark);a.material=a.material.clone(),a.material.side=Ye,a.material.color.multiplyScalar(.55);let l=new Ue;l.add(a),l.position.copy(n).add(Qt(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(4)),Ee.add(l);let c=l.position.clone().sub(n).normalize().multiplyScalar(12+Math.random()*26).add(t);Mh(a,Qt(0,0,0),vn.ColliderDesc.cylinder(o/2,r),c,{x:(Math.random()-.5)*9,y:(Math.random()-.5)*9,z:(Math.random()-.5)*9},s?400:60),l.removeFromParent()}}var Ed=11,nm=8.5,Sh=1,ps=null,xh=null,Mn=1;function f3(n){ee+=n;let t=ce;if(Wt==="map"){x3(n);return}if(Wt==="count"){let e=Math.min(ch.length-1,Math.floor(ee/.62));Pi.lastCmd!==e&&(Pi.lastCmd=e,Ri(ch[e][0],ch[e][1]?`T \u2212 ${ch[e][1]} \u0441`:"\u0441\u0442\u0430\u0440\u0442")),e===3&&!t.drain&&(t.drain=1,gm(0),Le("\u041A\u043B\u044E\u0447 \u043D\u0430 \u0434\u0440\u0435\u043D\u0430\u0436: \u043A\u043B\u0430\u043F\u0430\u043D\u044B \u0437\u0430\u043A\u0440\u044B\u0442\u044B, \u043A\u0438\u0441\u043B\u043E\u0440\u043E\u0434 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u043F\u0430\u0440\u0438\u0442 \u2014 \u0431\u0430\u043A\u0438 \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C.")),e===5&&!t.lit&&(Le("\u0417\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435. \u0412\u0441\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0437\u0430\u0433\u043E\u0440\u0430\u044E\u0442\u0441\u044F \u0435\u0449\u0451 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435, \u043D\u0430 \u043F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0442\u0443\u043F\u0435\u043D\u0438 \u0442\u044F\u0433\u0438."),t.lit=1,Gn((t.kind==="pack",t.noz),.25),am(.4),Qr({dur:1.2,gain:.8,f0:900,f1:150})),e===6&&t.lit===1&&(t.lit=2,Gn(t.noz,.5)),e===8&&t.lit===2&&(t.lit=3,Gn(t.noz,1),am(1),Jr=ra?0:.45,Le("\u0413\u043B\u0430\u0432\u043D\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u2014 \u043F\u043E\u043B\u043D\u0430\u044F \u0442\u044F\u0433\u0430. \u0420\u0430\u043A\u0435\u0442\u0430 \u0435\u0449\u0451 \u0434\u0435\u0440\u0436\u0438\u0442\u0441\u044F \u043D\u0430 \u0444\u0435\u0440\u043C\u0430\u0445.")),Yr.intensity=(t.lit||0)*2200*(.85+Math.random()*.3),e===9&&(Wt="fly",ee=0,v3(t),tn=Tn(ph({size:3.5,life:[3.5,5],speed:[4,8],rate:28,angle:.25,radius:1.5,alpha:.55,rise:.6}),t.g),tn.emitter.rotation.x=Math.PI/2,tn.emitter.position.y=-3);return}if(Wt==="fly"){_h(Math.min(1,ee/1.3)*1+0);let e=2.6+.9*ee;Ci.y+=e*n;let i=Math.max(0,Math.min(.14,(ee-5)*.02));if(Ci.x=Ci.y*Math.sin(i),t.g.position.addScaledVector(Ci,n),t.g.rotation.z=-i,Mn<1&&ee>.8&&(Mn=Math.min(1,Mn+.012)),Xs.intensity=2600*(.85+Math.random()*.3),!t.saidTilt&&ee>5&&(t.saidTilt=1,Le("\u0420\u0430\u043A\u0435\u0442\u0430 \u043B\u043E\u0436\u0438\u0442\u0441\u044F \u043D\u0430 \u043A\u0443\u0440\u0441: \u043D\u0430 \u0432\u043E\u0441\u0442\u043E\u043A, \u043A \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0435.")),!t.saidAlt&&t.kind==="pack"&&ee>Ed-2.5&&(t.saidAlt=1,Le(ji.drop==="drop"?"\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0434\u043E\u0433\u043E\u0440\u0430\u044E\u0442. \u0421\u0435\u0439\u0447\u0430\u0441 \u0431\u0443\u0434\u0435\u0442 \u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u2014 \u0441\u043C\u043E\u0442\u0440\u0438 \u0441\u043D\u0438\u0437\u0443.":"\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0434\u043E\u0433\u043E\u0440\u0430\u044E\u0442. \u041F\u0443\u0441\u0442\u044B\u0435 \u0431\u0430\u043A\u0438 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u043D\u0430 \u0440\u0430\u043A\u0435\u0442\u0435.")),Yr.intensity=Math.max(0,1-t.g.position.y/60)*3e3*(.85+Math.random()*.3),ee>2)for(let o of Hs)o.emissionOverTime.value*=.97;let s=Math.round(ee*(t.kind==="pack"?118/Ed:100/nm)),r=Math.round(t.g.position.y*(t.kind==="pack"?50/330:45/210));Ri(`T + ${s} \u0441 \xB7 \u0432\u044B\u0441\u043E\u0442\u0430 \u2248 ${r} \u043A\u043C`,"\u043F\u043E\u043B\u0451\u0442 \xB7 \u0432\u0440\u0435\u043C\u044F \u0438 \u0432\u044B\u0441\u043E\u0442\u0430 \u0441\u0436\u0430\u0442\u044B"),t.kind==="tower"&&ee>=nm&&M3(),t.kind==="pack"&&ee>=Ed&&(ji.drop==="drop"?S3():b3());return}if(Wt==="tower2"){if(t.s2Holder.position.addScaledVector(Ci,n),Ci.y-=9.81*n,ee>.8&&!t.spark&&(t.spark=1,Gn(t.n2,.7)),ee>1.15&&t.spark===1&&(t.spark=2,Gn(t.n2,0)),ee>1.5&&t.spark===2&&(t.spark=3,Gn(t.n2,1.2)),ee>1.75&&t.spark===3){t.spark=4;let e=t.s2Holder.localToWorld(Qt(0,5,0));tm(e,!1),bn(t.n2[0].ps),t.s2Holder.removeFromParent(),im(e,Ci,Sn?8:14),wn=()=>e,Wt="end",ee=0,yh=setTimeout(()=>Cd("tower"),3200),ha.s=1,Nd("why0",10),om(),Id("tower"),Ri("\u0410\u0432\u0430\u0440\u0438\u044F","\u0432\u0442\u043E\u0440\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C"),Le("\u041F\u0435\u0440\u0432\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430, \u0438 \u0432\u0442\u043E\u0440\u0443\u044E \u043D\u0430\u0434\u043E \u0437\u0430\u0436\u0435\u0447\u044C \u0432\u044B\u0441\u043E\u043A\u043E \u0432 \u043D\u0435\u0431\u0435. \u0417\u0434\u0435\u0441\u044C \u044D\u0442\u043E \u0438 \u0441\u043E\u0440\u0432\u0430\u043B\u043E\u0441\u044C: \u0437\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u0432 \u043F\u043E\u043B\u0451\u0442\u0435 \u043D\u0435 \u043F\u0440\u043E\u0448\u043B\u043E, \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u0440\u0430\u0437\u0440\u0443\u0448\u0438\u043B\u0430\u0441\u044C. \u0412 \u043F\u0430\u043A\u0435\u0442\u0435 \u041A\u043E\u0440\u043E\u043B\u0451\u0432\u0430 \u0432\u0441\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F \u0435\u0449\u0451 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435, \xAB\u0430 \u043D\u0435 \u0432 \u043F\u043E\u043B\u0451\u0442\u0435\xBB, \u0438 \u043E\u0442\u043A\u0430\u0437 \u0432\u0438\u0434\u0435\u043D \u043D\u0430 \u0441\u0442\u0430\u0440\u0442\u0435.","bad")}return}if(Wt==="sep"){Ci.y+=(ee<4?1.5+1.5*ee-9.81:12+ee)*n,t.g.position.addScaledVector(Ci,n),qr.material.uniforms.uAlt.value=Math.min(1,.55+ee*.04),ee>3.2&&!t.told&&(t.told=1,Ri("\u041F\u0430\u043A\u0435\u0442 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u043B\u0441\u044F","\u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u044B"),Le("\u0420\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0448\u043B\u043E. \u0426\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u0441 \u0433\u043E\u043B\u043E\u0432\u043D\u043E\u0439 \u0447\u0430\u0441\u0442\u044C\u044E \u043B\u0435\u0442\u0438\u0442 \u0434\u0430\u043B\u044C\u0448\u0435 \u2014 \u043A \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0435. \u0421\u0435\u0439\u0447\u0430\u0441 \u043A\u0430\u043C\u0435\u0440\u0430 \u043F\u043E\u0434\u043D\u0438\u043C\u0435\u0442\u0441\u044F \u0432 \u043A\u043E\u0441\u043C\u043E\u0441.")),ee>7.5&&(Wt="end",wn=null,Cd("ok"));return}if(Wt==="tumble"){let e=Xn[0];if(e&&e.body.translation().y<16&&!xh){let i=Qt(e.body.translation().x,2,e.body.translation().z);xh=i,tm(i,!0);for(let s of t.noz)bn(s.ps);tn&&(bn(tn),tn=null),en.removeRigidBody(e.body),e.obj.removeFromParent(),Xn.shift(),im(Qt(i.x,6,i.z),Qt(0,8,0),Sn?10:18),wn=()=>i,Wt="end",Sh=1,yh=setTimeout(()=>Cd("keep"),3600),ha.d=1,Nd("why1",10),om(),Id("keep"),Ri("\u041F\u0430\u0434\u0435\u043D\u0438\u0435","\u0440\u0430\u043A\u0435\u0442\u0430 \u043D\u0435 \u0434\u043E\u043B\u0435\u0442\u0435\u043B\u0430"),Le("\u0422\u043E\u043F\u043B\u0438\u0432\u043E \u0432 \u0431\u043E\u043A\u043E\u0432\u044B\u0445 \u0431\u043B\u043E\u043A\u0430\u0445 \u043A\u043E\u043D\u0447\u0438\u043B\u043E\u0441\u044C, \u0430 \u0440\u0430\u043A\u0435\u0442\u0430 \u0442\u0430\u0449\u0438\u0442 \u0438\u0445 \u043F\u0443\u0441\u0442\u044B\u0435 \u0431\u0430\u043A\u0438 \u0434\u0430\u043B\u044C\u0448\u0435. \u041C\u0451\u0440\u0442\u0432\u044B\u0439 \u0432\u0435\u0441 \u0441\u044A\u0435\u0434\u0430\u0435\u0442 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C: \u0440\u0430\u043A\u0435\u0442\u0430 \u0437\u0430\u0432\u0438\u0441\u043B\u0430, \u0441\u0432\u0430\u043B\u0438\u043B\u0430\u0441\u044C \u043D\u0430\u0431\u043E\u043A \u0438 \u0443\u043F\u0430\u043B\u0430. \u0414\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438 \u043D\u0435 \u0445\u0432\u0430\u0442\u0438\u043B\u043E. \u0423 \u0420-7 \u0434\u0432\u0435 \u0441\u0442\u0443\u043F\u0435\u043D\u0438: \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0438 \u0438 \u043E\u0442\u0434\u0435\u043B\u0438\u043B\u0438\u0441\u044C.","bad")}}}var Hn=100,sm=Math.PI/180,rm=[45.92,63.34],Ad=[57.3,160.9],p3={ok:1,tower:.16,keep:.34},xm=.2,m3=.42,Wn=null,zi=null,fs=0,yh=0,Ai=0,Wr=(n,t,e=0)=>{let i=n*sm,s=(t+180)*sm,r=Hn+e;return Qt(-r*Math.cos(i)*Math.cos(s),r*Math.sin(i),r*Math.cos(i)*Math.sin(s))};function g3(){return da(2048,(n,t)=>{let e=t,i=t/2,s=n.createLinearGradient(0,0,0,i);s.addColorStop(0,"#0b1a2e"),s.addColorStop(.5,"#123355"),s.addColorStop(1,"#0b1a2e"),n.fillStyle=s,n.fillRect(0,0,e,t),n.strokeStyle="rgba(143,165,185,.16)",n.lineWidth=1;for(let o=-180;o<=180;o+=15){let a=(o+180)/360*e;n.beginPath(),n.moveTo(a,0),n.lineTo(a,i),n.stroke()}for(let o=-75;o<=75;o+=15){let a=(90-o)/180*i;n.beginPath(),n.moveTo(0,a),n.lineTo(e,a),n.stroke()}let r=Sd(wd,wd.objects.land);n.fillStyle="#4c5e3f",n.strokeStyle="#b8a77a",n.lineWidth=1.4;for(let o of r.features){let a=o.geometry.type==="Polygon"?[o.geometry.coordinates]:o.geometry.coordinates;for(let l of a)for(let c of[-e,0,e]){n.beginPath();for(let h of l){let u=null,f=0;h.forEach(([d,m],_)=>{u!==null&&Math.abs(d-u)>180&&(f+=u>d?360:-360),u=d;let g=(d+f+180)/360*e+c,p=(90-m)/180*i;_?n.lineTo(g,p):n.moveTo(g,p)})}n.fill("evenodd"),n.stroke()}}})}function _3(){let n=new Ts;n.background=new Dt(132363);let t=new ze(40,We.aspect,.5,5e3),e=g3();e.repeat.set(1,.5),e.offset.set(0,.5),e.anisotropy=8;let i=new Ce(new es(Hn,128,64),new Ke({map:e,roughness:1,metalness:0}));n.add(i);let s=new Ce(new es(Hn*1.035,64,32),new Fe({side:ke,transparent:!0,depthWrite:!1,blending:wi,vertexShader:"varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.); vP=p.xyz; gl_Position=projectionMatrix*p; }",fragmentShader:"varying vec3 vN; varying vec3 vP; void main(){ float f=pow(1.-abs(dot(vN,normalize(-vP))),3.); gl_FragColor=vec4(.35,.62,1.,1.)*f*1.4; }"}));n.add(s);let r=[],o=5,a=()=>(o=o*16807%2147483647)/2147483647;for(let O=0;O<1500;O++){let z=Qt(a()-.5,a()-.5,a()-.5).normalize().multiplyScalar(2e3+a()*800);r.push(z.x,z.y,z.z)}let l=new me;l.setAttribute("position",new Kt(r,3)),n.add(new vr(l,new yr({color:16777215,size:1.6,sizeAttenuation:!1})));let c=new Us(16774368,2.6);c.position.copy(Wr(20,95,300)),n.add(c),n.add(new Is(9417983,727598,.55));let h=Wr(...rm).normalize(),u=Wr(...Ad).normalize(),f=h.angleTo(u),d=240,m=[];for(let O=0;O<=d;O++){let z=O/d,W=h.clone().multiplyScalar(Math.sin((1-z)*f)).add(u.clone().multiplyScalar(Math.sin(z*f))).divideScalar(Math.sin(f));m.push(W.normalize().multiplyScalar(Hn+.15+64*z*(1-z)))}let _=O=>{let z=Math.min(d,Math.max(0,O*d)),W=Math.floor(z),k=Math.min(d,W+1);return m[W].clone().lerp(m[k],z-W)},g=new Rs(new me().setFromPoints(m),new Uo({color:9414073,dashSize:1.2,gapSize:1.4,transparent:!0,opacity:.55}));g.computeLineDistances(),n.add(g);let p=new Io(new Sr(m),d,.32,8,!1);p.setDrawRange(0,0),n.add(new Ce(p,new ci({color:15782522})));let w=new me().setFromPoints(new Array(41).fill(0).map(()=>Qt(0,0,0)));w.setDrawRange(0,0),n.add(new Rs(w,new Cs({color:16747130})));let M=(O,z,W)=>{let k=new As(new Es({map:hh,color:O,blending:wi,transparent:!0,depthWrite:!1}));return k.scale.setScalar(z),k.position.copy(W),n.add(k),k},v=M(14993786,3.2,Wr(...rm,.4)),T=M(16777215,3.2,Wr(...Ad,.4)),S=M(16747130,2.6,_(xm));S.visible=!1;let A=M(16734780,9,Qt());A.visible=!1;let I=new Ce(new Po(.9,1.15,48),new ci({color:16777215,transparent:!0,side:Ye,depthWrite:!1}));I.position.copy(Wr(...Ad,.3)),I.lookAt(I.position.clone().multiplyScalar(2)),I.visible=!1,n.add(I);let y=new Ue;n.add(y);let E=new Ce(new Mr(.35,2.6,12),new Ke({color:15659764,roughness:.5,emissive:3359829}));y.add(E);let R=M(16756816,3.4,Qt(0,-1.9,0));y.remove(R),y.add(R);let F=h.clone().add(u).normalize();Wn={sc:n,cam:t,at:_,pts:m,N:d,trailG:p,fallG:w,start:v,goal:T,drop:S,hit:A,ring:I,rk:y,body:E,torch:R,mid:F,A:h}}function Cd(n){Wn||_3();let t=Wn,e=di.domElement;zi=n,fs=0,Ai=0,t.trailG.setDrawRange(0,0),t.fallG.setDrawRange(0,0),t.drop.visible=!1,t.hit.visible=!1,t.ring.visible=!1,t.rk.visible=!0,t.body.scale.set(1,1,1),t.torch.visible=!0,t.torch.material.color.set(16756816),t.torch.position.set(0,-1.9,0),t.torch.scale.setScalar(3.4),t.cam.aspect=We.aspect,t.cam.updateProjectionMatrix(),e.style.transition="opacity .4s",e.style.opacity="0",yh=setTimeout(()=>{Wt="map",ee=0,e.style.opacity="1";for(let i of[...aa])i.emitter&&i.emitter.parent&&(i.emitter.visible=!1);Ri("\u041F\u043E\u043B\u0451\u0442 \u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438","\u043F\u0443\u0442\u044C \u043F\u043E \u043A\u0430\u0440\u0442\u0435 \xB7 \u0432\u044B\u0441\u043E\u0442\u0430 \u043F\u0440\u0435\u0443\u0432\u0435\u043B\u0438\u0447\u0435\u043D\u0430, \u0432\u0440\u0435\u043C\u044F \u0441\u0436\u0430\u0442\u043E"),Le(n==="ok"?"\u041F\u043E\u043B\u0451\u0442 \u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438. \u0417\u043E\u043B\u043E\u0442\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u2014 \u0441\u0442\u0430\u0440\u0442 \u0432 \u0422\u044E\u0440\u0430-\u0422\u0430\u043C\u0435, \u0431\u0435\u043B\u0430\u044F \u2014 \u043F\u043E\u043B\u0438\u0433\u043E\u043D \u041A\u0443\u0440\u0430 \u043D\u0430 \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0435. \u0417\u043E\u043B\u043E\u0442\u0430\u044F \u043B\u0438\u043D\u0438\u044F \u2014 \u043F\u0443\u0442\u044C \u0440\u0430\u043A\u0435\u0442\u044B.":"\u0422\u0435\u043F\u0435\u0440\u044C \u043D\u0430 \u043A\u0430\u0440\u0442\u0435: \u0437\u043E\u043B\u043E\u0442\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u2014 \u0441\u0442\u0430\u0440\u0442 \u0432 \u0422\u044E\u0440\u0430-\u0422\u0430\u043C\u0435, \u0431\u0435\u043B\u0430\u044F \u2014 \u043F\u043E\u043B\u0438\u0433\u043E\u043D \u041A\u0443\u0440\u0430 \u043D\u0430 \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0435, \u043A\u0443\u0434\u0430 \u0440\u0430\u043A\u0435\u0442\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u043B\u0430 \u0434\u043E\u043B\u0435\u0442\u0435\u0442\u044C.")},420)}function x3(n){let t=Wn,e=p3[zi];fs=Math.min(1,fs+n/(zi==="ok"?11:6));let s=Math.min(e,fs/(zi==="ok"?1:.75)*e);t.trailG.setDrawRange(0,Math.round(s*t.N)*8*6);let r=t.at(s),o=t.at(Math.min(1,s+.004));if(zi!=="ok"&&fs>.75){let m=(fs-.75)/.25,_=t.at(e),g=_.clone().normalize().multiplyScalar(Hn+.2).add(t.at(e+.03).sub(_).multiplyScalar(.6)).normalize().multiplyScalar(Hn+.2),p=t.fallG.attributes.position,w=Math.round(m*40);for(let M=0;M<=40;M++){let v=Math.min(M,w)/40,T=_.clone().lerp(g,v*v);p.setXYZ(M,T.x,T.y,T.z)}p.needsUpdate=!0,t.fallG.setDrawRange(0,w+1),o=r.clone(),r=_.clone().lerp(g,m*m),t.torch.visible=!1,m>=1&&!t.hit.visible&&(t.hit.visible=!0,t.hit.position.copy(g),t.rk.visible=!1)}if(t.rk.visible){t.rk.position.copy(r);let m=o.clone().sub(r);m.lengthSq()>1e-6&&t.rk.quaternion.setFromUnitVectors(Qt(0,1,0),m.normalize())}if(t.torch.material.opacity=.75+Math.random()*.25,t.hit.visible&&(t.hit.material.opacity=Math.max(.35,t.hit.material.opacity*.97)),zi==="ok"){if(s>=xm&&Ai<1&&(Ai=1,t.drop.visible=!0,Le("\u041A\u0440\u0430\u0441\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u2014 \u0437\u0434\u0435\u0441\u044C \u043E\u0442\u0434\u0435\u043B\u0438\u043B\u0438\u0441\u044C \u043F\u0443\u0441\u0442\u044B\u0435 \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438. \u0414\u0430\u043B\u044C\u0448\u0435 \u043B\u0435\u0442\u0438\u0442 \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u0441 \u0433\u043E\u043B\u043E\u0432\u043D\u043E\u0439 \u0447\u0430\u0441\u0442\u044C\u044E.")),s>=m3&&Ai<2&&(Ai=2,t.torch.visible=!1,t.body.scale.set(.8,.35,.8),Le("\u0426\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u043B. \u0413\u043E\u043B\u043E\u0432\u043D\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u043E\u0442\u0434\u0435\u043B\u0438\u043B\u0430\u0441\u044C \u0438 \u043B\u0435\u0442\u0438\u0442 \u0434\u0430\u043B\u044C\u0448\u0435 \u0441\u0430\u043C\u0430, \u043F\u043E \u0438\u043D\u0435\u0440\u0446\u0438\u0438, \u0447\u0435\u0440\u0435\u0437 \u0432\u0441\u044E \u0421\u0438\u0431\u0438\u0440\u044C.")),s>=.84&&Ai<2.5&&(Ai=2.5,t.torch.visible=!0,t.torch.material.color.set(16742960),t.torch.position.set(0,.6,0),Le("\u0413\u043E\u043B\u043E\u0432\u043D\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0443 \u0438 \u0440\u0430\u0441\u043A\u0430\u043B\u044F\u0435\u0442\u0441\u044F \u2014 \u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438 \u0441\u0447\u0438\u0442\u0430\u043D\u043D\u044B\u0435 \u0441\u0435\u043A\u0443\u043D\u0434\u044B.")),Ai===2.5&&t.torch.scale.setScalar(7+4*Math.sin(performance.now()/60)**2+(s-.84)*70),s>=1&&Ai<3&&(Ai=3,t.rk.visible=!1,t.ring.visible=!0,t.hit.visible=!0,t.hit.material.color.set(16777215),t.hit.position.copy(t.goal.position),Nd("lab",30),Ri("\u0414\u043E\u0448\u043B\u0430!","\u043F\u043E\u043B\u0438\u0433\u043E\u043D \u041A\u0443\u0440\u0430, \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0430"),Id("ok"),e3(),Le("\u0414\u043E\u0448\u043B\u0430! \u041F\u0430\u043A\u0435\u0442, \u0432\u0441\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0437\u0430\u0436\u0436\u0435\u043D\u044B \u043D\u0430 \u0437\u0435\u043C\u043B\u0435, \u043F\u0443\u0441\u0442\u044B\u0435 \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u044B \u2014 \u0442\u0430\u043A 21 \u0430\u0432\u0433\u0443\u0441\u0442\u0430 1957 \u0433\u043E\u0434\u0430 \u0433\u043E\u043B\u043E\u0432\u043D\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u0434\u043E\u0448\u043B\u0430 \u0434\u043E \u043F\u043E\u043B\u0438\u0433\u043E\u043D\u0430 \u041A\u0443\u0440\u0430 \u043D\u0430 \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0435. \u0427\u0435\u0441\u0442\u043D\u0430\u044F \u043E\u0433\u043E\u0432\u043E\u0440\u043A\u0430: \u0432 \u043F\u043B\u043E\u0442\u043D\u044B\u0445 \u0441\u043B\u043E\u044F\u0445 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u044B \u043E\u043D\u0430 \u0440\u0430\u0437\u0440\u0443\u0448\u0438\u043B\u0430\u0441\u044C, \u0435\u0451 \u0434\u043E\u0432\u043E\u0434\u0438\u043B\u0438 \u0434\u0430\u043B\u044C\u0448\u0435.","ok")),t.ring.visible){let m=1+performance.now()/900%1*3;t.ring.scale.setScalar(m),t.ring.material.opacity=1-(m-1)/3}Ri(s<1?`\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u043E ${Math.round(s*100)} % \u043F\u0443\u0442\u0438`:"\u0414\u043E\u0448\u043B\u0430!",s<1?"\u0434\u043E \u043F\u043E\u043B\u0438\u0433\u043E\u043D\u0430 \u041A\u0443\u0440\u0430 \xB7 \u0432\u0440\u0435\u043C\u044F \u0441\u0436\u0430\u0442\u043E":"\u043F\u043E\u043B\u0438\u0433\u043E\u043D \u041A\u0443\u0440\u0430, \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0430")}else fs>=1&&Ai<1&&(Ai=1,Ri("\u041D\u0435 \u0434\u043E\u043B\u0435\u0442\u0435\u043B\u0430","\u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438 \u0434\u0430\u043B\u0435\u043A\u043E"),Le(zi==="tower"?"\u041A\u0440\u0430\u0441\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u2014 \u0437\u0434\u0435\u0441\u044C \u0443\u043F\u0430\u043B\u0430 \u0440\u0430\u043A\u0435\u0442\u0430-\u0431\u0430\u0448\u043D\u044F: \u0432\u0442\u043E\u0440\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u043D\u0435 \u0437\u0430\u0436\u0433\u043B\u0430\u0441\u044C \u0432 \u043F\u043E\u043B\u0451\u0442\u0435. \u041F\u0440\u043E\u0439\u0434\u0435\u043D\u0430 \u043C\u0430\u043B\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u043F\u0443\u0442\u0438, \u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438 \u0434\u0430\u043B\u0435\u043A\u043E. \u0412 \u043F\u0430\u043A\u0435\u0442\u0435 \u041A\u043E\u0440\u043E\u043B\u0451\u0432\u0430 \u0432\u0441\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F \u0435\u0449\u0451 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435.":"\u041A\u0440\u0430\u0441\u043D\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u2014 \u0437\u0434\u0435\u0441\u044C \u0443\u043F\u0430\u043B\u0430 \u0440\u0430\u043A\u0435\u0442\u0430 \u0441 \u043F\u0443\u0441\u0442\u044B\u043C\u0438 \u0431\u043E\u043A\u043E\u0432\u044B\u043C\u0438 \u0431\u043B\u043E\u043A\u0430\u043C\u0438. \u041C\u0451\u0440\u0442\u0432\u044B\u0439 \u0432\u0435\u0441 \u0441\u044A\u0435\u043B \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C, \u0434\u043E \u041A\u0430\u043C\u0447\u0430\u0442\u043A\u0438 \u043D\u0435 \u0445\u0432\u0430\u0442\u0438\u043B\u043E. \u0423 \u0420-7 \u0434\u0432\u0435 \u0441\u0442\u0443\u043F\u0435\u043D\u0438: \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0438 \u2014 \u0438 \u043E\u0442\u0434\u0435\u043B\u0438\u043B\u0438\u0441\u044C.","bad"));let a=sa(Math.min(1,fs*1.15)),l=zi==="ok"?s:e,c=t.at(Math.min(1,l)).lerp(t.mid.clone().multiplyScalar(Hn),zi==="ok"?a:a*.5),h=Qt(0,1,0).sub(t.mid.clone().multiplyScalar(t.mid.y)).normalize(),u=We.aspect<1?1.45:1,f=t.A.clone().multiplyScalar(Hn+42*u).addScaledVector(h,-48*u),d=t.mid.clone().multiplyScalar(Hn+95*u).addScaledVector(h,-120*u);t.cam.position.copy(f.lerp(d,zi==="ok"?a:a*.6)),t.cam.lookAt(c)}function y3(){clearTimeout(yh),zi=null,di.domElement.style.opacity="1";for(let n of aa)n.emitter&&(n.emitter.visible=!0)}function v3(n){t3(),Le("\u041F\u043E\u0434\u044A\u0451\u043C! \u0424\u0435\u0440\u043C\u044B \u0440\u0430\u0441\u043A\u0440\u044B\u043B\u0438\u0441\u044C, \u0438 \u0440\u0430\u043A\u0435\u0442\u0430 \u0443\u0445\u043E\u0434\u0438\u0442 \u0441\u043E \u0441\u0442\u043E\u043B\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0431\u0435 \u043E\u0433\u043D\u044F."),Mn=ra?1:.45,Jr=ra?0:.7;let t=jy();t.emitter.position.set(0,18,0),t.emitter.rotation.x=Math.PI/2,Tn(t,n.g),setTimeout(()=>bn(t),5e3),na(2.2,.2,e=>{ie.frost.opacity=1-.75*e}),n.g.add(Xs),Xs.position.set(0,-14,0),Xs.intensity=2600,wn=()=>n.g.position.clone().add(Qt(0,4-Math.min(10,n.g.position.y*.08),0)),ua||(ps=We.position.clone().sub(Ze.target).setY(0).normalize().multiplyScalar(We.aspect<1?105:80).setY(-14))}function om(){Pi.found.textContent="\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u0440\u0438\u0447\u0438\u043D \u043D\u0435\u0443\u0434\u0430\u0447\u0438: "+Object.keys(ha).length+" \u0438\u0437 2."}function Fd(n){let t=ce,e=i=>{ce===t&&n(i)};en?e():_m().then(()=>e()).catch(()=>e(!0))}function M3(){let n=ce;Wt="wait",Gn(n.noz,0),tn&&(tn.emissionOverTime.value=0),Fd(t=>{if(t){Wt="end";return}let e=Ci.clone();n.s2Holder=new Ue,Ee.updateMatrixWorld(!0),n.s2.getWorldPosition(n.s2Holder.position),n.s2.getWorldQuaternion(n.s2Holder.quaternion),Ee.add(n.s2Holder),n.s2Holder.add(n.s2),n.s2.position.set(0,0,0),n.s2.quaternion.identity(),wn=()=>n.s2Holder.position.clone().add(Qt(0,5,0)),Mh(n.s1,Qt(0,8,0),vn.ColliderDesc.cylinder(8.3,1.55),Qt(e.x,e.y-3,e.z),{x:.35,y:0,z:.25},9e3),Wt="tower2",ee=0,Ri("\u041F\u0435\u0440\u0432\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u043E\u0442\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430","\u0437\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u2014 \u0432 \u043F\u043E\u043B\u0451\u0442\u0435")})}function S3(){let n=ce;Wt="wait";for(let t of n.sides)Gn(t.noz,0);Qr({dur:.6,gain:.7,f0:3e3,f1:300}),Qr({dur:.6,gain:.5,f0:2500,f1:250,delay:.12}),Fd(t=>{if(t){Wt="sep",ee=0;return}for(let e of n.sides){let i=Qt(Math.cos(e.phi),0,Math.sin(e.phi)).applyAxisAngle(Qt(0,0,1),n.g.rotation.z),s=Qt(Math.sin(e.phi),0,-Math.cos(e.phi)).multiplyScalar(.85),r=Mh(e.b,Qt(0,7,0),vn.ColliderDesc.cone(9.5,1.3),Ci.clone().addScaledVector(i,5).add(Qt(0,-1.5,0)),s.multiplyScalar(1.7),6e3),o=Tn(ph({size:2.2,life:[1.2,2.2],speed:[5,9],rate:0,angle:.4,radius:.3,alpha:.8,rise:0}));o.emissionBursts.push({time:0,count:new Bt(18),cycle:1,interval:.01,probability:1}),o.looping=!1,o.emitter.position.copy(r.localToWorld(Qt(0,10,0))),setTimeout(()=>bn(o),4e3)}Wt="sep",ee=0,dm=!0,wn=()=>ce.g.position.clone().add(Qt(0,2,0)),ua||(ps=Qt(22,-64,26).multiplyScalar(We.aspect<1?1.5:1)),Mn=ra?1:.4,Ri("T + 118 \u0441 \xB7 \u0440\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435","\u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0443\u0445\u043E\u0434\u044F\u0442"),Le("\u0420\u0430\u0437\u0434\u0435\u043B\u0435\u043D\u0438\u0435! \u0427\u0435\u0442\u044B\u0440\u0435 \u043F\u0443\u0441\u0442\u044B\u0445 \u0431\u043B\u043E\u043A\u0430 \u043E\u0442\u0445\u043E\u0434\u044F\u0442 \xAB\u043A\u0440\u0435\u0441\u0442\u043E\u043C \u041A\u043E\u0440\u043E\u043B\u0451\u0432\u0430\xBB, \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043B\u0435\u0442\u0438\u0442 \u0434\u0430\u043B\u044C\u0448\u0435.")})}function b3(){let n=ce;Wt="wait";for(let t of n.sides)Gn(t.noz,0);Fd(t=>{if(t){Wt="end";return}Ri("\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043F\u0443\u0441\u0442\u044B\u0435","\u043D\u043E \u0438\u0445 \u0432\u0435\u0437\u0443\u0442 \u0434\u0430\u043B\u044C\u0448\u0435");let e=n.g,i=Ci.clone().multiplyScalar(.55);Mh(e,Qt(0,12,0),vn.ColliderDesc.cylinder(15,3.2),i,{x:.05,y:0,z:-.42},12e4),wn=()=>Xn[0]?Xn[0].obj.position.clone():e.position,Wt="tumble",Sh=3,xh=null})}function am(n){if(!Hs.length){let t=Tn(ph({size:10,life:[4,7],speed:[9,17],rate:22,angle:1.35,radius:4,alpha:.6,rise:1.8}));t.emitter.position.set(0,1,0),t.emitter.rotation.x=-Math.PI/2;let e=Tn(ph({size:11,life:[4.5,8],speed:[24,38],rate:26,angle:.3,radius:3,alpha:.62,rise:3}));e.emitter.position.set(-16,.5,0),e.emitter.rotation.order="YXZ",e.emitter.rotation.y=-Math.PI/2,e.emitter.rotation.x=-.25,Hs=[t,e]}for(let t of Hs)t.emissionOverTime.value=(t===Hs[0]?22:26)*Math.max(vh,.7)*n}var Ld,ua=!1,fh=!0,Gs={n:0,t:0},lm=Qt(0,13,0);function Dd(){if(!fh)return;requestAnimationFrame(Dd);let n=Math.min(Pd.getDelta(),1/20)*Mn;Mn<1&&Wt==="sep"&&ee>1.6&&(Mn=Math.min(1,Mn+.006));for(let i of $r)i.t+=n,i.t>=0&&i.fn(Math.min(1,i.t/i.dur));if($r=$r.filter(i=>i.t<i.dur),Wt!=="build"&&f3(n),en&&Xn.length){for(let i=0;i<Sh;i++)en.timestep=n,en.step();for(let i of Xn){let s=i.body.translation(),r=i.body.rotation();i.obj.position.set(s.x,s.y,s.z),i.obj.quaternion.set(r.x,r.y,r.z,r.w)}}let t=wn?wn():Wt==="build"?Qt(0,13,0):null;if(t){let i=t.clone().sub(lm).multiplyScalar(Wt==="build"?.08:.25);Ze.target.add(i),We.position.add(i),lm.copy(Ze.target)}if(ps&&!ua){let i=We.position.clone().sub(Ze.target);i.lerp(ps,Wt==="sep"?.07:.035),We.position.copy(Ze.target).add(i),i.distanceTo(ps)<.5&&(ps=null)}We.position.y<3&&(We.position.y=3);for(let i of ce?ce.noz.concat(ce.n2||[]):[])if(i.core.visible){let s=.85+Math.random()*.3;i.core.scale.set(s,(.8+Math.random()*.4)*(i.level||1),s),i.halo.scale.setScalar(i.halo.size*s*(.6+.4*Math.min(i.level,1.2)))}ca.intensity*=.86,Jr>.01&&(We.position.add(Qt(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(Jr)),Jr*=.9);let e=ce?ce.g.position.y:0;Wt==="fly"&&(qr.material.uniforms.uAlt.value=Math.min(.55,e/600)),Ee.fog.far=2600+Math.max(e,Ze.target.y)*5,Ze.maxPolarAngle=Wt==="build"||Wt==="count"?Math.PI*.485:Math.PI*.94,Ze.update(),oa.update(n),i3(),Wt==="map"?di.render(Wn.sc,Wn.cam):di.render(Ee,We),Gs.n++,Gs.t+=n,Gs.t>=1&&(window.__r7fps=Math.round(Gs.n/Gs.t),Gs.n=0,Gs.t=0)}async function eb(n){let t=n.querySelector("#r3Stage");Pi={root:n,msg:n.querySelector("#r3Msg"),count:n.querySelector("#r3Count"),found:n.querySelector("#r3Found"),hint:n.querySelector("#r3Hint")},di=new Sc({antialias:!0,powerPreference:"high-performance"}),di.setPixelRatio(Math.min(devicePixelRatio,Sn?1.5:2)),di.toneMapping=Bo,di.toneMappingExposure=1.05,di.shadowMap.enabled=!0,di.shadowMap.type=Sl,di.domElement.tabIndex=0,di.domElement.setAttribute("aria-hidden","true"),t.appendChild(di.domElement),Ee=new Ts,Ee.fog=new gr(14278104,260,2600);let e=t.clientWidth,i=t.clientHeight;We=new ze(e<i?50:40,e/i,.5,2e4),Ld=e<i?Qt(30,14,46):Qt(34,11,38),We.position.copy(Ld),Ze=new Ec(We,di.domElement),Ze.target.set(0,13,0),Ze.enableDamping=!0,Ze.enablePan=!1,Ze.minDistance=12,Ze.maxDistance=160,Ze.maxPolarAngle=Math.PI*.94,Ze.addEventListener("start",()=>{ua=!0,ps=null}),Ze.addEventListener("end",()=>{ua=!1}),Pd=new Tr,Ee.add(new Is(13623551,9074e3,1.25));let s=new Us(16773336,2.8);s.position.set(55,75,35),s.castShadow=!0,s.shadow.mapSize.set(Sn?1024:2048,Sn?1024:2048),Object.assign(s.shadow.camera,{left:-40,right:40,top:45,bottom:-25,near:10,far:220}),s.shadow.bias=-5e-4,s.shadow.normalBias=.04,Ee.add(s),Xs=new ss(16753226,0,260,1.4),Yr=new ss(16751168,0,140,1.6),Yr.position.set(0,-1,0),Ee.add(Yr),ca=new ss(16756832,0,400,1.4),Ee.add(ca),oa=new ah,Ee.add(oa),c3(),a3(),Ud("tower");let r=()=>{let l=t.clientWidth,c=t.clientHeight;di.setSize(l,c,!1),We.aspect=l/c,We.updateProjectionMatrix(),Wn&&(Wn.cam.aspect=l/c,Wn.cam.updateProjectionMatrix())};r(),new ResizeObserver(r).observe(t),new IntersectionObserver(l=>{let c=l[0].isIntersecting;c&&!fh&&(fh=!0,Pd.getDelta(),Dd()),fh=c}).observe(t);let o=n.querySelectorAll("#r3Ctrl .seg");o.forEach(l=>l.addEventListener("click",()=>{if(Wt!=="build")return;let c=l.dataset.k,h=l.dataset.v,u=ji[c];n.querySelectorAll(`#r3Ctrl .seg[data-k="${c}"]`).forEach(f=>f.setAttribute("aria-pressed",f===l?"true":"false")),ji[c]=h==="tandem"?"tower":h,c==="scheme"&&u!==ji[c]&&(Ud(ji.scheme),Le(ji.scheme==="pack"?"\u041F\u0430\u043A\u0435\u0442: \u0447\u0435\u0442\u044B\u0440\u0435 \u0431\u043E\u043A\u043E\u0432\u044B\u0445 \u0431\u043B\u043E\u043A\u0430 \u0432\u0441\u0442\u0430\u043B\u0438 \u0432\u043E\u043A\u0440\u0443\u0433 \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E. \u0412\u0441\u0435 32 \u0441\u043E\u043F\u043B\u0430 \u0437\u0430\u0436\u0433\u0443\u0442\u0441\u044F \u0435\u0449\u0451 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435.":"\u0411\u0430\u0448\u043D\u044F: \u0432\u0442\u043E\u0440\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u044C \u0441\u0442\u043E\u0438\u0442 \u043D\u0430 \u043F\u0435\u0440\u0432\u043E\u0439. \u0415\u0451 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C \u043F\u0440\u0438\u0434\u0451\u0442\u0441\u044F \u0437\u0430\u0436\u0438\u0433\u0430\u0442\u044C \u0432 \u043F\u043E\u043B\u0451\u0442\u0435.")),c==="drop"&&Le(h==="drop"?"\u041F\u0443\u0441\u0442\u044B\u0435 \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u0431\u0443\u0434\u0443\u0442 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u044B \u043D\u0430 \u0432\u044B\u0441\u043E\u0442\u0435.":"\u041F\u0443\u0441\u0442\u044B\u0435 \u0431\u043E\u043A\u043E\u0432\u044B\u0435 \u0431\u043B\u043E\u043A\u0438 \u043F\u043E\u043B\u0435\u0442\u044F\u0442 \u0441 \u0440\u0430\u043A\u0435\u0442\u043E\u0439 \u0434\u043E \u043A\u043E\u043D\u0446\u0430.")})),n.querySelector("#r3Go").addEventListener("click",u3);let a=n.querySelector("#r3Snd");a&&a.addEventListener("click",()=>{hm(),n3(!Od)}),n.querySelector("#r3Reset").addEventListener("click",()=>{ji={scheme:"tower",drop:"keep"},o.forEach(l=>l.setAttribute("aria-pressed",l.dataset.v==="tandem"||l.dataset.v==="keep"?"true":"false")),d3("\u0420\u0430\u043A\u0435\u0442\u0430 \u0441\u043D\u043E\u0432\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0435. \u0423\u0436\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435 \u0431\u0430\u043B\u043B\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u043D\u0435 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u044E\u0442\u0441\u044F.")}),n.querySelector("#r3Ctrl").hidden=!1,n.setAttribute("data-sostoyanie","gotovo"),Zr("\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u0432\u044B\u0431\u0435\u0440\u0438 \u0432 \u043F\u0443\u043D\u043A\u0442\u0435 1, \u043A\u0430\u043A \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0440\u0430\u043A\u0435\u0442\u0443, \u0432 \u043F\u0443\u043D\u043A\u0442\u0435 2 \u2014 \u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0441 \u043F\u0443\u0441\u0442\u044B\u043C\u0438 \u0431\u043B\u043E\u043A\u0430\u043C\u0438, \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB\u041F\u0443\u0441\u043A\xBB. \u0421\u0446\u0435\u043D\u0443 \u043C\u043E\u0436\u043D\u043E \u043A\u0440\u0443\u0442\u0438\u0442\u044C \u043F\u0430\u043B\u044C\u0446\u0435\u043C \u0438\u043B\u0438 \u043C\u044B\u0448\u044C\u044E."),Le("\u0420\u0430\u043A\u0435\u0442\u0430 \u043D\u0430 \u0441\u0442\u043E\u043B\u0435, \u043F\u043E\u043A\u0430 \u0431\u0430\u0448\u043D\u0435\u0439. \u0412\u044B\u0431\u0435\u0440\u0438, \u043A\u0430\u043A \u0435\u0451 \u0441\u043E\u0431\u0440\u0430\u0442\u044C, \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB\u041F\u0443\u0441\u043A\xBB."),Dd(),window.__r7={st:()=>({phase:Wt,T:ee}),pick:(l,c)=>n.querySelector(`#r3Ctrl .seg[data-k="${l}"][data-v="${c}"]`).click()}}export{eb as zapusk};
