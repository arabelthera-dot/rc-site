import{a as de,b as En,c as Gi,d as ve,e as wi,f as De,g as Tn,h as zn,i as Pn,j as Rn,k as An,l as Cn,m as On,n as Nn,o as kn,p as Dn,q as Ge,r as Ji}from"./chunk-7KLF23E5.js";import{$ as Ht,$a as yn,Aa as Ne,Ab as or,Bb as Mn,Cb as Sn,Da as Fi,Db as bn,E as Kr,Eb as _n,Fa as ye,G as Lt,Ga as ke,H as $r,Ha as cn,I as tn,Ia as un,J as en,K as Zs,Ka as $s,L as sn,Pa as dn,Qa as pt,Ra as Li,Sa as Hi,T as rn,Ta as fn,U as xt,Ua as mn,V as nn,Va as pn,W as F,Wa as tr,X as dt,Xa as ce,Y as T,Ya as gn,Z as on,Za as ue,_a as vi,a as Ce,aa as js,ab as vn,b as Oe,bb as J,c as Vr,ca as an,cb as Vi,d as Gr,da as he,db as xn,e as qs,ea as ln,f as et,fa as gi,g as Ft,ga as He,h as Tt,ha as hn,i as Jr,ia as D,j as mi,k as pi,ka as At,l as Ws,m as Ys,ma as Ct,n as qr,na as _t,o as Wr,oa as Ot,ob as er,p as Yr,pa as at,q as Ii,qa as Ve,qb as xi,r as Xr,ra as Nt,rb as ir,s as Zr,sa as lt,sb as sr,t as jr,ta as Qs,u as Qr,ua as rt,ub as wn,v as Le,va as Ks,wa as yi,wb as rr,y as Xs,yb as nr,za as ge,zb as Ut}from"./chunk-2RODXGAG.js";var Un={type:"change"},lr={type:"start"},In={type:"end"},qi=new an,Bn=new cn,Oo=Math.cos(70*nn.DEG2RAD),ut=new T,zt=2*Math.PI,Y={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ar=1e-6,Wi=class extends Mn{constructor(t,e=null){super(t,e),this.state=Y.NONE,this.target=new T,this.cursor=new T,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ce.ROTATE,MIDDLE:Ce.DOLLY,RIGHT:Ce.PAN},this.touches={ONE:Oe.ROTATE,TWO:Oe.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new T,this._lastQuaternion=new dt,this._lastTargetPosition=new T,this._quat=new dt().setFromUnitVectors(t.up,new T(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new or,this._sphericalDelta=new or,this._scale=1,this._panOffset=new T,this._rotateStart=new F,this._rotateEnd=new F,this._rotateDelta=new F,this._panStart=new F,this._panEnd=new F,this._panDelta=new F,this._dollyStart=new F,this._dollyEnd=new F,this._dollyDelta=new F,this._dollyDirection=new T,this._mouse=new F,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ko.bind(this),this._onPointerDown=No.bind(this),this._onPointerUp=Do.bind(this),this._onContextMenu=Vo.bind(this),this._onMouseWheel=Io.bind(this),this._onKeyDown=Fo.bind(this),this._onTouchStart=Lo.bind(this),this._onTouchMove=Ho.bind(this),this._onMouseDown=Uo.bind(this),this._onMouseMove=Bo.bind(this),this._interceptControlDown=Go.bind(this),this._interceptControlUp=Jo.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Un),this.update(),this.state=Y.NONE}update(t=null){let e=this.object.position;ut.copy(e).sub(this.target),ut.applyQuaternion(this._quat),this._spherical.setFromVector3(ut),this.autoRotate&&this.state===Y.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=zt:i>Math.PI&&(i-=zt),s<-Math.PI?s+=zt:s>Math.PI&&(s-=zt),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(ut.setFromSpherical(this._spherical),ut.applyQuaternion(this._quatInverse),e.copy(this.target).add(ut),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let l=ut.length();o=this._clampDistance(l*this._scale);let a=l-o;this.object.position.addScaledVector(this._dollyDirection,a),this.object.updateMatrixWorld(),r=!!a}else if(this.object.isOrthographicCamera){let l=new T(this._mouse.x,this._mouse.y,0);l.unproject(this.object);let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=a!==this.object.zoom;let h=new T(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(l),this.object.updateMatrixWorld(),o=ut.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(qi.origin.copy(this.object.position),qi.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(qi.direction))<Oo?this.object.lookAt(this.target):(Bn.setFromNormalAndCoplanarPoint(this.object.up,this.target),qi.intersectPlane(Bn,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ar||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ar||this._lastTargetPosition.distanceToSquared(this.target)>ar?(this.dispatchEvent(Un),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?zt/60*this.autoRotateSpeed*t:zt/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){ut.setFromMatrixColumn(e,0),ut.multiplyScalar(-t),this._panOffset.add(ut)}_panUp(t,e){this.screenSpacePanning===!0?ut.setFromMatrixColumn(e,1):(ut.setFromMatrixColumn(e,0),ut.crossVectors(this.object.up,ut)),ut.multiplyScalar(t),this._panOffset.add(ut)}_pan(t,e){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;ut.copy(s).sub(this.target);let r=ut.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/i.clientHeight,this.object.matrix),this._panUp(2*e*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=t-i.left,r=e-i.top,o=i.width,l=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/l)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(zt*this._rotateDelta.x/e.clientHeight),this._rotateUp(zt*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-zt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),r=.5*(t.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(zt*this._rotateDelta.x/e.clientHeight),this._rotateUp(zt*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,l=(t.pageY+e.y)*.5;this._updateZoomParameters(o,l)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new F,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function No(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n)))}function ko(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Do(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(In),this.state=Y.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Uo(n){let t;switch(n.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ce.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=Y.DOLLY;break;case Ce.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Y.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Y.ROTATE}break;case Ce.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=Y.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=Y.PAN}break;default:this.state=Y.NONE}this.state!==Y.NONE&&this.dispatchEvent(lr)}function Bo(n){switch(this.state){case Y.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case Y.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case Y.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function Io(n){this.enabled===!1||this.enableZoom===!1||this.state!==Y.NONE||(n.preventDefault(),this.dispatchEvent(lr),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(In))}function Fo(n){this.enabled!==!1&&this._handleKeyDown(n)}function Lo(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Oe.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=Y.TOUCH_ROTATE;break;case Oe.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=Y.TOUCH_PAN;break;default:this.state=Y.NONE}break;case 2:switch(this.touches.TWO){case Oe.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=Y.TOUCH_DOLLY_PAN;break;case Oe.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=Y.TOUCH_DOLLY_ROTATE;break;default:this.state=Y.NONE}break;default:this.state=Y.NONE}this.state!==Y.NONE&&this.dispatchEvent(lr)}function Ho(n){switch(this._trackPointer(n),this.state){case Y.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case Y.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case Y.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case Y.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=Y.NONE}}function Vo(n){this.enabled!==!1&&n.preventDefault()}function Go(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Jo(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function qo(n,t=new D){let e=[[0,0],[.3,5900800],[.55,13121546],[.8,16747038],[1,16773296]];n=Math.max(0,Math.min(1,n));for(let i=1;i<e.length;i++)if(n<=e[i][0]){let s=(n-e[i-1][0])/(e[i][0]-e[i-1][0]);return t.set(e[i-1][1]).lerp(new D(e[i][1]),s)}return t.set(e[e.length-1][1])}var Fn={metal:n=>new J({color:n??12172996,roughness:.32,metalness:.9}),steel:n=>new J({color:n??9255724,roughness:.55,metalness:.5}),dark:n=>new J({color:n??3817286,roughness:.6,metalness:.4}),nozzle:n=>new J({color:n??4865075,roughness:.35,metalness:.85,side:et}),paint:n=>new J({color:n??14672863,roughness:.5,metalness:.2}),fabric:n=>new J({color:n??15921126,map:Rn(),roughness:.92,metalness:0,side:et}),brick:n=>new J({map:Pn(n?"#"+new D(n).getHexString():void 0),roughness:.9}),concrete:n=>new J({color:n??16777215,map:De("#9a978f",.22,2600,1),roughness:.95}),wood:n=>new J({color:n??9071173,map:De("#a07c52",.3,1800,1,9),roughness:.8}),rubber:n=>new J({color:n??2236962,roughness:.95}),glass:n=>new J({color:n??13625074,roughness:.04,metalness:.1,transparent:!0,opacity:.32,depthWrite:!1,side:et}),frost:()=>new J({map:zn(),color:16777215,emissive:10466504,emissiveIntensity:.28,roughness:.97,transparent:!0}),hot:n=>{let t=new J({color:n??3877410,roughness:.55,metalness:.6});return t.userData.hot=!0,t},glow:n=>new At({color:n??16760928,toneMapped:!1}),flow:n=>{let t=Cn().clone();t.needsUpdate=!0;let e=new At({color:n??16748592,map:t,transparent:!0,opacity:.95,toneMapped:!1,depthWrite:!1});return e.userData.flow=!0,e},silk:n=>new Vi({color:n??16051935,roughness:.5,metalness:0,sheen:1,sheenRoughness:.3,sheenColor:new D(16777215),normalMap:Nn(),normalScale:new F(.6,.6),side:et}),halo:n=>new ge({map:ve(),color:n??16751164,blending:Tt,transparent:!0,depthWrite:!1})};function Wo(n){let t=Ji(n.tex,{repeat:n.repeat||[1,1],res:n.res,arm:n.arm,maps:n.maps}),e=new J({color:n.color!=null?new D(n.color):16777215,roughness:1,metalness:t.metalnessMap?1:0,...t});return n.normal!=null&&e.normalScale.setScalar(n.normal),t.alphaMap&&(e.alphaTest=.5,e.side=et),n.texStep&&(e.userData.texStep=n.texStep),e}function Je(n){n||(n="paint");let t,e,i={};if(typeof n=="string"?[t,e]=n.split(":"):(i=n,t=n.kind||"paint",e=n.color),t==="pbr"||i.tex&&t!=="silk"){let o=Wo(i);return i.rough!=null&&(o.roughness=i.rough),i.metal!=null&&(o.metalness=i.metal),i.side==="double"&&(o.side=et),o.userData.kind="pbr",o}let r=(Fn[t]||Fn.paint)(e!=null?new D(e):void 0);return i.rough!=null&&(r.roughness=i.rough),i.metal!=null&&(r.metalness=i.metal),i.emissive&&(r.emissive=new D(i.emissive),r.emissiveIntensity=i.emissiveIntensity??1),i.opacity!=null&&(r.transparent=!0,r.opacity=i.opacity),i.side==="double"&&(r.side=et),r.userData.hot&&qe(r,i.glow??.7),r.userData.kind=t,r}function qe(n,t,e){if(!n||n.isMeshBasicMaterial){n&&n.userData.flow&&(n.opacity=.25+.75*t);return}n.userData.glow=t,n.userData.hot&&!e?(qo(t,n.emissive),n.emissiveIntensity=.4+2.6*t):(n.emissive=new D(e||n.color),n.emissiveIntensity=2*t)}function Ln(n){let t=new Map,e=new Map,i=n.clone();return Hn(n,i,function(s,r){t.set(r,s),e.set(s,r)}),i.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,o=t.get(s),l=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=l.map(function(a){return e.get(a)}),r.bind(r.skeleton,r.bindMatrix)}),i}function Hn(n,t,e){e(n,t);for(let i=0;i<n.children.length;i++)Hn(n.children[i],t.children[i],e)}var Wt=n=>String(n||"").toLowerCase().replace(/mixamorig:?/g,"").replace(/[^a-z0-9]/g,""),Xo={ual:["upperarml","leftarm","larm"],lal:["lowerarml","leftforearm","forearml"],uar:["upperarmr","rightarm","rarm"],lar:["lowerarmr","rightforearm","forearmr"],thl:["thighl","upperlegl","leftupleg"],cal:["calfl","lowerlegl","leftleg"],thr:["thighr","upperlegr","rightupleg"],car:["calfr","lowerlegr","rightleg"]},Yi=[.22,1,.08],Xi=[1,.25,.05],Zi=[.12,-.05,1],Vn={stand:{clip:["Idle_Loop","Idle","Standing"]},sit:{clip:["Sitting_Idle_Loop","Sitting","Sit"],dir:{thl:[.12,-.05,1],thr:[.12,-.05,1]},ifNoClip:!0},kneel:{clip:["Crouch_Idle_Loop","Fixing_Kneeling","Kneel","Crouch"]},wave:{clip:["Idle_Loop","Idle"],dir:{uar:[.35,1,.1],lar:[.15,1,.25]}},"arms-up":{clip:["Idle_Loop","Idle"],dir:{ual:Yi,lal:Yi,uar:Yi,lar:Yi}},"arms-forward":{clip:["Idle_Loop","Idle"],dir:{ual:Zi,lal:Zi,uar:Zi,lar:Zi}},spread:{clip:["Jump_Loop","Swim_Idle_Loop","Idle"],dir:{ual:Xi,lal:Xi,uar:Xi,lar:Xi,thl:[.38,-1,.05],thr:[.38,-1,.05],cal:[.38,-1,0],car:[.38,-1,0]}},walk:{clip:["Walk_Loop","Walk"]},run:{clip:["Jog_Fwd_Loop","Run","Jog","Walk"]}},Gn=["ual","uar","thl","thr","lal","lar","cal","car"],hr=class{constructor(t,e){this.spec=t,this.clips=e.animations||[],this.root=Ln(e.scene),this.mats=[];let i=Object.entries(t.tint||{}).map(([o,l])=>[Wt(o),new D(l)]),s=(t.hide||[]).map(Wt);if(this.root.traverse(o=>{if(s.some(l=>Wt(o.name).includes(l))&&(o.visible=!1),!!o.isMesh){o.material=Array.isArray(o.material)?o.material.map(l=>l.clone()):o.material.clone();for(let l of[].concat(o.material)){let a=i.find(([h])=>Wt(l.name).includes(h)||Wt(o.name).includes(h));a&&l.color.copy(a[1]),t.rough!=null&&(l.roughness=t.rough),l.side=Gr,l.envMapIntensity=t.env??1,this.mats.push(l)}o.castShadow=t.shadow!==!1,o.receiveShadow=t.shadow!==!1,o.isSkinnedMesh&&(o.frustumCulled=!1)}}),t.height){let o=new js().setFromObject(this.root),l=o.max.y-o.min.y;l>0&&this.root.scale.multiplyScalar(t.height/l)}t.yaw&&(this.root.rotation.y=t.yaw*Math.PI/180),this.o=new rt,this.o.add(this.root);let r={};this.root.traverse(o=>{(o.isBone||o.type==="Bone")&&(r[Wt(o.name)]=o)}),this.bonesAll=r,this.bones={};for(let[o,l]of Object.entries(Xo))for(let a of l)if(r[a]){this.bones[o]={bone:r[a],child:r[a].children.find(h=>h.isBone)||null};break}this.human=!!(this.bones.ual&&this.bones.uar),this.mixer=this.clips.length?new nr(this.root):null,this.cur=null,this.ov={},this.speed=1,this.reset()}clip(t){if(!t)return null;let e=Wt(t);return this.clips.find(i=>i.name===t)||this.clips.find(i=>Wt(i.name).endsWith(e))||this.clips.find(i=>Wt(i.name).includes(e))||null}play(t,{fade:e=.3,speed:i,once:s}={}){if(!this.mixer)return!1;let r=[].concat(t).map(l=>this.clip(l)).find(Boolean);if(!r)return!1;let o=this.mixer.clipAction(r);if(i!=null&&(o.timeScale=i),o.setLoop(s?Zs:sn,1/0),o.clampWhenFinished=!!s,o===this.cur)return!0;if(o.reset(),o.setEffectiveWeight(1),o.play(),this.cur&&e>0?this.cur.crossFadeTo(o,e,!1):this.cur&&this.cur.stop(),this.cur&&e>0){let l=this.cur;setTimeout(()=>{l!==this.cur&&l.stop()},e*1e3+50)}return this.cur=o,!0}pose(t,e=.3){let i=this.spec.poses&&this.spec.poses[t]||Vn[t]||Vn.stand,s=i.clip?this.play(i.clip,{fade:Math.max(.05,e),once:i.once,speed:i.speed}):!1,r=i.ifNoClip&&s?{}:i.dir||{};if(this.human)for(let o of Gn){let l=this.bones[o];if(!l||!l.child)continue;let a=this.ov[o]||{dir:null,w:0},h=this.eff(a),c=r[o]?{dir:this.sideDir(o,r[o]),w:1}:{dir:h.dir,w:0};this.ov[o]={from:h,to:c,t:0,dur:Math.max(.001,e)}}}sideDir(t,e){let i=this.side[t]??1;return new T(e[0]*i,e[1],e[2]).normalize()}eff(t){if(!t||!t.to)return{dir:t?.dir||null,w:t?.w||0};let e=Math.min(1,t.t/t.dur),i=e*e*(3-2*e),s=t.from,r=t.to,o=s.dir||r.dir,l=r.dir||s.dir;return{dir:o&&l?o.clone().lerp(l,i).normalize():null,w:s.w+(r.w-s.w)*i}}reset(){if(this.mixer&&(this.mixer.stopAllAction(),this.cur=null),this.ov={},this.spec.anim&&this.play(this.spec.anim,{fade:0,speed:this.spec.animSpeed}),this.human&&!this.side){this.side={},this.root.updateMatrixWorld(!0);let t=this.root.matrixWorld.clone().invert(),e=new T;for(let[i,s]of Object.entries(this.bones))e.setFromMatrixPosition(s.bone.matrixWorld).applyMatrix4(t),this.side[i]=e.x>=0?1:-1}this.human&&!this.spec.anim&&this.pose(this.spec.pose||"stand",0),this.update(0)}update(t){if(this.mixer&&this.mixer.update(t),!this.human)return;let e=!1;for(let h in this.ov){let c=this.ov[h];c.to&&(c.t+=t),this.eff(c).w>.001&&(e=!0)}if(!e)return;this.root.updateMatrixWorld(!0);let i=new dt,s=new dt,r=new dt,o=new dt,l=new T,a=new T;this.root.getWorldQuaternion(i);for(let h of Gn){let c=this.ov[h];if(!c)continue;let u=this.eff(c);if(!u.dir||u.w<.001)continue;let d=this.bones[h];l.setFromMatrixPosition(d.bone.matrixWorld),a.setFromMatrixPosition(d.child.matrixWorld);let f=a.sub(l).normalize(),m=u.dir.clone().applyQuaternion(i);r.setFromUnitVectors(f,m),r.slerpQuaternions(o,r,u.w),d.bone.parent.getWorldQuaternion(s),d.bone.quaternion.premultiply(s.clone().invert().multiply(r).multiply(s)),d.bone.updateMatrixWorld(!0)}}bone(t){let e=Wt(t);return this.bonesAll[e]||Object.entries(this.bonesAll).find(([i])=>i.endsWith(e))?.[1]||null}};async function Jn(n){let t=await kn(n.src),e=new hr(n,t);return{o:e.o,mats:e.mats,model:e}}var Zo=Math.PI/180;function qn(n){let t=n.span??5,e=n.chord??1.6,i=n.t??e*.06,s=n.camber??e*.045,r=n.ribs??Math.round(t/.35),o=n.sag??.35,l=18,a=Math.max(r*6,12),h=n.center?-t/2:0,c=w=>i*2.2*Math.sqrt(Math.max(0,w))*(1-w)*1.4+.002,u=w=>s*Math.sin(Math.PI*Math.pow(w,.75)),d=[],f=[],m=[],p=w=>{let b=w/t*r,x=b-Math.floor(b);return Math.sin(Math.PI*x)};for(let w of[1,-1]){let b=d.length/3;for(let x=0;x<=a;x++){let v=x/a*t,M=p(v);for(let E=0;E<=l;E++){let z=1-Math.cos(E/l*Math.PI/2),P=c(z)*(w>0?.62:.38)*(1-o*M*(z<.92?1:0)*Math.sin(Math.PI*z));d.push((z-.5)*e,u(z)+w*P,v+h),f.push(z,v/t)}}for(let x=0;x<a;x++)for(let v=0;v<l;v++){let M=b+x*(l+1)+v,E=M+1,z=M+l+1,P=z+1;w>0?m.push(M,z,E,E,z,P):m.push(M,E,z,E,P,z)}}let g=new Ot;g.setAttribute("position",new _t(d,3)),g.setAttribute("uv",new _t(f,2)),g.setIndex(m);let y=[];for(let w of[0,t]){let b=new pn,x=[];for(let M=0;M<=l;M++){let E=1-Math.cos(M/l*Math.PI/2);x.push([(E-.5)*e,u(E)+c(E)*.62])}for(let M=l;M>=0;M--){let E=1-Math.cos(M/l*Math.PI/2);x.push([(E-.5)*e,u(E)-c(E)*.38])}b.moveTo(...x[0]);for(let M of x.slice(1))b.lineTo(...M);let v=new gn(b);w===0&&v.scale(1,1,-1).translate(0,0,0),v.translate(0,0,w+h),y.push(v)}let S=de([g.toNonIndexed(),...y.map(w=>(w.deleteAttribute("normal"),w.toNonIndexed()))].map(w=>(w.attributes.uv||w.setAttribute("uv",new _t(new Float32Array(w.attributes.position.count*2),2)),w)));return S.computeVertexNormals(),S}function Wn(n){let t=n.r??.004,e=[];for(let[i,s]of n.pairs||[]){let r=new T(...i),o=new T(...s),l=r.distanceTo(o);if(l<1e-4)continue;let a=new pt(t,t,l,n.radial??5,1,!0);a.applyQuaternion(new dt().setFromUnitVectors(new T(0,1,0),o.clone().sub(r).normalize())),a.translate((r.x+o.x)/2,(r.y+o.y)/2,(r.z+o.z)/2),e.push(a)}return e.length?de(e):new Ot}function Yn(n){let t=(n.d??2.4)/2,e=n.blades??2,i=n.chord??.16,s=(n.pitch??32)*Zo,r=[],o=22,l=10;for(let c=0;c<e;c++){let u=[],d=[];for(let p=0;p<=o;p++){let g=p/o,y=.09+g*(t-.09),S=i*(.55+1.1*Math.sin(Math.PI*Math.min(1,g*.85+.12)))*(g>.92?Math.sqrt(Math.max(.05,(1-g)/.08)):1),w=.045*(1-.75*g)+.008,b=s*(1-.6*g);for(let x=0;x<=l;x++){let v=x/l*Math.PI*2,M=Math.cos(v)*S/2,E=Math.sin(v)*w/2*(Math.cos(v)>0?1:.7),z=M*Math.cos(b)-E*Math.sin(b),P=M*Math.sin(b)+E*Math.cos(b);u.push(P,y,z)}}for(let p=0;p<o;p++)for(let g=0;g<l;g++){let y=p*(l+1)+g,S=y+1,w=y+l+1,b=w+1;d.push(y,S,w,S,b,w)}let f=new Ot;f.setAttribute("position",new _t(u,3)),f.setIndex(d);let m=[];for(let p=0;p<=o;p++)for(let g=0;g<=l;g++)m.push(g/l,p/o);f.setAttribute("uv",new _t(m,2)),f.rotateX(c/e*Math.PI*2),r.push(f.toNonIndexed())}let a=new pt(.1,.1,.14,16);a.rotateZ(Math.PI/2),r.push(a.toNonIndexed());let h=de(r.map(c=>(c.deleteAttribute("normal"),c)));return h.computeVertexNormals(),h}function Xn(n){let t=n.r??.35,e=n.w??.07,i=n.spokes??18,s=n.tyre??t*.13,r=new vi(t-s*.95,s*.35,8,48),o=new pt(t*.09,t*.09,e*1.8,14);o.rotateX(Math.PI/2);let l=[];for(let c=0;c<i;c++){let u=c/i*Math.PI*2,d=c%2?1:-1,f=new T(0,0,d*e*.8),m=new T(Math.cos(u)*(t-s),Math.sin(u)*(t-s),0),p=f.distanceTo(m),g=new pt(.0035,.0035,p,4,1,!0);g.applyQuaternion(new dt().setFromUnitVectors(new T(0,1,0),m.clone().sub(f).normalize())),g.translate((f.x+m.x)/2,(f.y+m.y)/2,(f.z+m.z)/2),l.push(g)}let a=de([r,o,...l].map(c=>c.toNonIndexed())),h=new vi(t-s*.5,s*.62,12,56);return{metal:a,tyre:h}}var jo=n=>En(256,(t,e)=>{let i=Gi(n==="birch"?41:n==="pine"?43:47);if(t.clearRect(0,0,e,e),n==="birch")for(let s=0;s<1400;s++){let r=i()*6.283,o=Math.pow(i(),.6)*e*.47,l=e/2+Math.cos(r)*o,a=e/2+Math.sin(r)*o*.9,h=40+i()*50;t.fillStyle=`hsl(${78+i()*22},${42+i()*18}%,${h*.62}%)`,t.beginPath(),t.ellipse(l,a,3+i()*3,2+i()*2,i()*6.28,0,6.283),t.fill()}else{let s=n==="pine"?[95,35,26]:[140,34,20];for(let r=0;r<3;r++){let o=e*(.2+.3*r),l=e*.98,a=e*(.35+.15*r+(i()-.5)*.2),h=e*.04;t.strokeStyle="rgba(70,52,36,1)",t.lineWidth=3,t.beginPath(),t.moveTo(o,l),t.lineTo(a,h),t.stroke();for(let c=0;c<160;c++){let u=i(),d=o+(a-o)*u,f=l+(h-l)*u,m=(n==="pine"?34:22)*(1-u*.6)*(.6+i()*.6),p=(i()>.5?1:-1)*(.5+i()*.7)-Math.PI/2;t.strokeStyle=`hsl(${s[0]+i()*20},${s[1]+i()*10}%,${s[2]+i()*14}%)`,t.lineWidth=n==="pine"?1.6:2.2,t.beginPath(),t.moveTo(d,f),t.lineTo(d+Math.cos(p)*m,f+Math.sin(p)*m),t.stroke()}}}}),ji=(n,t,e=0)=>{let i=new ce(n,t);return i.translate(0,t/2+e,0),i};function Qo(n,t){let e=Gi(t),i=[],s=[],r=n==="pine"?.72:n==="birch"?.62:.3,o=n==="spruce"?.018:.014,l=new pt(o*.4,o,n==="spruce"?.95:r+.12,7,3);l.translate(0,(n==="spruce"?.95:r+.12)/2,0),i.push(l);let a=(c,u,d,f,m,p,g)=>{c.rotateZ(g),c.rotateX(m),c.rotateY(p),c.translate(u,d,f),s.push(c)};if(n==="spruce"){for(let u=0;u<13;u++){let d=.12+u*.066,f=.24*(1-(d-.1)/.95)+.02,m=Math.max(4,Math.round(f*40));for(let p=0;p<m;p++){let g=p/m*6.283+e(),y=ji(f*.9,f*1.25);a(y,Math.cos(g)*.01,d+f*.18,Math.sin(g)*.01,-1.05-e()*.25,-g+Math.PI/2,0)}}let c=ji(.06,.14);a(c,0,.92,0,0,e()*3,0)}else if(n==="pine")for(let c=0;c<6;c++){let u=e()*6.283,d=.03+e()*.09,f=.7+e()*.24,m=.12+e()*.08;for(let g=0;g<9;g++){let y=e()*6.283,S=ji(m,m*.8,-m*.4);a(S,Math.cos(u)*d,f,Math.sin(u)*d,(e()-.5)*2.2,y,(e()-.5)*.8)}let p=new pt(.003,.006,d+.02,4);p.rotateZ(Math.PI/2),p.rotateY(-u),p.translate(Math.cos(u)*d/2,f-.02,Math.sin(u)*d/2),i.push(p)}else for(let c=0;c<9;c++){let u=e()*6.283,d=e()*.12,f=.5+e()*.42,m=.16+e()*.1;for(let p=0;p<6;p++){let g=ji(m,m,-m/2);a(g,Math.cos(u)*d,f,Math.sin(u)*d,(e()-.5)*2.6,e()*6.283,(e()-.5)*1.2)}}let h=c=>de(c.map(u=>{let d=u.index?u.toNonIndexed():u;for(let f of Object.keys(d.attributes))["position","normal","uv"].includes(f)||d.deleteAttribute(f);return d}));return{bark:h(i),leaf:h(s)}}function Ko(n,t=1){return n.onBeforeCompile=e=>{e.uniforms.uTime={value:0},n.userData.sh=e,e.vertexShader=e.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime;`).replace("#include <begin_vertex>",`#include <begin_vertex>
      #ifdef USE_INSTANCING
      vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      #else
      vec3 ip = vec3(0.0);
      #endif
      float ph = dot(ip, vec3(0.13, 0.0, 0.17));
      transformed.x += sin(uTime * 1.3 + ph) * ${(.025*t).toFixed(4)} * position.y * position.y;
      transformed.z += cos(uTime * 1.1 + ph * 1.3) * ${(.018*t).toFixed(4)} * position.y * position.y;`)},n}function Zn(n){let t=new rt,e=Gi(n.seed??5),i=n.n??300,s=n.h??[14,24],r=n.kinds||{spruce:.5,pine:.3,birch:.2},o=Object.keys(r),l=o.reduce((u,d)=>u+r[d],0),a={spruce:n.bark||"tex/bark012",pine:n.bark||"tex/bark012",birch:n.barkBirch||"tex/bark007"},h=Object.fromEntries(o.map(u=>[u,[]]));for(let u=0;u<i*3&&Object.values(h).reduce((d,f)=>d+f.length,0)<i;u++){let d,f;if(n.area)d=n.area[0]+e()*(n.area[2]-n.area[0]),f=n.area[1]+e()*(n.area[3]-n.area[1]);else{let[g,y]=n.ring||[150,260],S=e()*6.283,w=g+Math.pow(e(),.8)*(y-g);d=Math.cos(S)*w,f=Math.sin(S)*w}if((n.gap||[]).some(([g,y,S])=>(d-g)**2+(f-y)**2<S*S))continue;let m=e()*l,p=o[0];for(let g of o)if((m-=r[g])<=0){p=g;break}h[p].push([d,f,s[0]+e()*(s[1]-s[0]),e()*6.283,.85+e()*.3])}let c=[];for(let u of o){if(!h[u].length)continue;let d=[0,1,2].map(g=>Qo(u,11+g*7+u.length)),f=Ko(new J({map:jo(u),alphaTest:.45,side:et,roughness:.85,color:n.leafColor?.[u]||16777215}),n.wind??1),m=a[u],p=new J({map:Ge(m+"_diffuse_1k.jpg",{srgb:!0,repeat:[1,6]}),normalMap:Ge(m+"_nor_gl_1k.jpg",{repeat:[1,6]}),roughness:.95,color:u==="birch"?15921386:12101784});c.push(f,p),d.forEach((g,y)=>{let S=h[u].filter((w,b)=>b%3===y);if(S.length)for(let[w,b]of[[g.bark,p],[g.leaf,f]]){let x=new ke(w,b,S.length),v=new he,M=new dt,E=new D;S.forEach(([z,P,C,O,H],X)=>{v.compose(new T(z,0,P),M.setFromAxisAngle(new T(0,1,0),O),new T(C*H,C,C*H)),x.setMatrixAt(X,v),b===f&&x.setColorAt(X,E.setHSL(0,0,.78+e()*.3))}),x.frustumCulled=!1,x.castShadow=!!n.shadow,x.receiveShadow=!1,t.add(x)}})}return t.userData.tick=u=>{for(let d of c)d.userData.sh&&(d.userData.sh.uniforms.uTime.value=u)},{o:t,mats:c}}function jn(n,t){let e=new rt,i=new Map;for(let{geo:a,mat:h}of n){let c=h.uuid;i.has(c)||i.set(c,{mat:h,geos:[]}),i.get(c).geos.push(a)}let s=new he,r=new dt,o=new T(1,1,1),l=new T(0,1,0);for(let{mat:a,geos:h}of i.values()){let c=de(h.map(d=>{let f=d.index?d.toNonIndexed():d.clone();for(let m of Object.keys(f.attributes))["position","normal","uv"].includes(m)||f.deleteAttribute(m);return f.attributes.uv||f.setAttribute("uv",new _t(new Float32Array(f.attributes.position.count*2),2)),f})),u=new ke(c,a,t.length);t.forEach((d,f)=>{s.compose(new T(...d.pos),r.setFromAxisAngle(l,d.yaw||0),o),u.setMatrixAt(f,s)}),u.castShadow=!0,u.receiveShadow=!0,u.computeBoundingSphere(),e.add(u)}return e}var Vt=Math.PI/180,cr=(n,t=[0,0,0])=>new T().fromArray(n||t),$o=n=>1-Math.pow(1-Math.min(1,Math.max(0,n)),3);function ta(n){let t=n.h??10,e=n.w??1,i=n.bar??Math.max(.04,e*.12),s=n.step??e*1.2,r=n.chords??2,o=[],l=r===2?[[-e/2,0],[e/2,0]]:r===3?[0,1,2].map(u=>[Math.cos(u*2.094)*e/1.73,Math.sin(u*2.094)*e/1.73]):[[-e/2,-e/2],[e/2,-e/2],[e/2,e/2],[-e/2,e/2]];for(let[u,d]of l){let f=new Ve(i,t,i);f.translate(u,t/2,d),o.push(f)}let a=r===2?[[0,1]]:l.map((u,d)=>[d,(d+1)%l.length]),h=Math.max(1,Math.round(t/s)),c=t/h;for(let[u,d]of a){let f=l[u],m=l[d];for(let p=0;p<=h;p++){let g=p*c,y=new T(f[0],g,f[1]),S=new T(m[0],g,m[1]);if(o.push(Qn(y,S,i*.7)),p<h){let w=p%2?[y,new T(m[0],g+c,m[1])]:[S,new T(f[0],g+c,f[1])];o.push(Qn(w[0],w[1],i*.6))}}}return de(o)}function Qn(n,t,e){let i=n.distanceTo(t),s=new Ve(e,i,e);return s.applyQuaternion(new dt().setFromUnitVectors(new T(0,1,0),t.clone().sub(n).normalize())),s.translate((n.x+t.x)/2,(n.y+t.y)/2,(n.z+t.z)/2),s}function ea(n){if(n.points)return n.points;if(n.helix){let{r:t=.5,h:e=1,turns:i=5,n:s=24}=n.helix,r=[];for(let o=0;o<=i*s;o++){let l=o/s*6.2832;r.push([Math.cos(l)*t,o/(i*s)*e,Math.sin(l)*t])}return r}if(n.snake){let{n:t=8,w:e=3,step:i=.3,z:s=0,r=i/2}=n.snake,o=[];for(let l=0;l<t;l++){let a=l*i,h=l%2?e/2:-e/2,c=-h;o.push([h,a,s],[c,a,s]),l<t-1&&o.push([c+Math.sign(c)*r,a+i/2,s])}return o}return[[0,0,0],[0,1,0]]}function ia(n){let t=ea(n).map(e=>cr(e));if(n.curve==="straight"){let e=new mn;for(let i=1;i<t.length;i++)e.add(new fn(t[i-1],t[i]));return e}return new Hi(t,!!n.closed,"catmullrom",n.tension??.5)}function Kn(n){let t=ia(n),e=t.getLength(),i=n.seg??Math.max(16,Math.round(e*3)),s=new yn(t,Math.min(i,600),n.r??.2,n.radial??10,!!n.closed);return s.userData={len:e,seg:Math.min(i,600),radial:n.radial??10,r:n.r??.2},(n.cut||n.window)&&sa(s,t,n),s}function sa(n,t,e){let i=n.userData,s=n.index.array,r=n.attributes.position.array,o=[],l=new T(0,1,0),a=e.cut?Array.isArray(e.cut)?{deg:e.cutDeg??120,from:e.cut[0],to:e.cut[1]}:{deg:e.cut,from:0,to:1}:null,h=e.window?{every:e.window.every??10,len:e.window.len??1,deg:e.window.deg??120}:null,c=Array.from({length:i.seg+1},(d,f)=>t.getPointAt(f/i.seg)),u=new T;for(let d=0;d<s.length;d+=3){let f=[s[d],s[d+1],s[d+2]],m=Math.floor(f[0]/(i.radial+1)),p=m/i.seg,g=p*i.len;u.set(0,0,0);for(let w of f)u.add(new T(r[w*3],r[w*3+1],r[w*3+2]));u.divideScalar(3).sub(c[Math.min(m,i.seg)]).normalize();let y=Math.acos(Math.max(-1,Math.min(1,u.dot(l))))*2/Vt,S=!1;a&&p>=a.from&&p<=a.to&&y<a.deg&&(S=!0),h&&g%h.every<h.len&&g>h.len&&y<h.deg&&(S=!0),S||o.push(...f)}n.setIndex(o),i.cut=!0}var ur=class{constructor(t,e){if(this.o=t,this.open=t.open??1,this.t=0,(t.shape||"dome")==="dome"){let i=t.r??3,s=t.h??i*.75,r=t.gores??16,o=14,l=r*4,a=[],h=(t.phi??80)*Vt,c=t.vent?Math.asin(Math.min(.9,t.vent/i)):0;for(let f=0;f<=o;f++){let m=c+f/o*(h-c);a.push(new F(Math.max(.001,i*Math.sin(m)),s*Math.cos(m)-s*Math.cos(h)))}this.geo=new tr(a,l),this.base=this.geo.attributes.position.array.slice(),this.M=o,this.A=l,this.R=i,this.H=s,this.gores=r,this.mesh=new at(this.geo,e),this.mesh.castShadow=!0,e.normalMap&&e.userData.kind==="silk"&&(e.normalMap=e.normalMap.clone(),e.normalMap.repeat.set(r,1)),this.g=new rt,this.g.add(this.mesh);let u=t.lines?.n??r,d=t.lines?.length??i*1.6;t.lines!==!1&&(this.lineGeo=new Ot,this.lineGeo.setAttribute("position",new _t(new Float32Array(u*6),3)),this.lines=new $s(this.lineGeo,new un({color:t.lines?.color||7037525})),this.g.add(this.lines),this.nl=u,this.L=d,this.to=t.lines?.to)}else{let i=t.w??2,s=t.h??1.4;this.geo=new ce(i,s,24,8),this.geo.translate(i/2,0,0),this.base=this.geo.attributes.position.array.slice(),this.w=i,this.mesh=new at(this.geo,e),this.mesh.castShadow=!0,this.g=new rt,this.g.add(this.mesh)}this.update(0)}update(t){this.t+=t;let e=this.geo.attributes.position,i=e.array,s=this.base,r=$o(this.open),o=this.t,l=this.o;if(this.R){let a=.05+.95*Math.pow(r,.8),h=1+(1-r)*(l.stretch??1.8),c=(l.wobble??1)*r;for(let u=0;u<i.length;u+=3){let d=s[u],f=s[u+1],m=s[u+2],p=Math.atan2(m,d),g=1-.08*r*(1-Math.abs(Math.cos(this.gores*p/2))),y=1+.035*c*Math.sin(o*2.6+p*3)+.02*c*Math.sin(o*5.1);i[u]=d*a*g*y,i[u+2]=m*a*g*y,i[u+1]=f*h*(1+.03*c*Math.sin(o*2.6+1))}if(this.lines){let u=this.lineGeo.attributes.position.array,d=this.R*Math.sin((l.phi??80)*Vt)*a;for(let f=0;f<this.nl;f++){let m=f/this.nl*6.283+(l.lines?.rot??0)*Vt,p=this.to?this.to[Math.floor(f/this.nl*this.to.length)]:[0,-this.L*(.6+.4*r),0];u.set([Math.cos(m)*d,0,Math.sin(m)*d,...p],f*6)}this.lineGeo.attributes.position.needsUpdate=!0,this.lineGeo.computeBoundingSphere()}}else{let a=(l.wave??.12)*r,h=l.speed??3;for(let c=0;c<i.length;c+=3){let u=s[c],d=u/this.w;i[c]=u*(.04+.96*r),i[c+2]=a*Math.sin(u*2.2-o*h)*d*this.w+(1-r)*.03*Math.sin(s[c+1]*9)}}e.needsUpdate=!0,this.geo.computeVertexNormals(),this.geo.computeBoundingSphere()}},dr=class{constructor(t,e){if(this.geo=Kn({...t,r:t.r??.22}),this.mesh=new at(this.geo,e),this.mesh.renderOrder=2,this.mat=e,this.speed=t.speed??1.5,this.fill=t.fill??0,e.map.repeat.set(this.geo.userData.len/(t.stripe??2),1),t.color2){let i=new D(t.color||"#ff8a2a"),s=new D(t.color2),r=this.geo.attributes.position.count,o=this.geo.attributes.uv,l=new Float32Array(r*3),a=new D;for(let h=0;h<r;h++)a.lerpColors(i,s,o.getX(h)),l.set([a.r,a.g,a.b],h*3);this.geo.setAttribute("color",new Ct(l,3)),e.vertexColors=!0,e.color.set(16777215)}t.style==="bubbles"&&(e.map=On().clone(),e.map.needsUpdate=!0,e.map.repeat.set(this.geo.userData.len/(t.stripe??1.2),1)),this.update(0)}update(t){let e=this.geo.userData;this.mat.map.offset.x-=t*this.speed/2,this.geo.setDrawRange(0,Math.round(Math.max(0,Math.min(1,this.fill))*e.seg)*e.radial*6)}},We={stand:{la:[0,0,8],ra:[0,0,-8],ll:[0,0,0],rl:[0,0,0]},"arms-up":{la:[0,0,160],ra:[0,0,-160],ll:[0,0,0],rl:[0,0,0]},"arms-forward":{la:[-80,0,5],ra:[-80,0,-5],ll:[0,0,0],rl:[0,0,0]},spread:{la:[0,0,100],ra:[0,0,-100],ll:[0,0,18],rl:[0,0,-18]},sit:{la:[-30,0,8],ra:[-30,0,-8],ll:[-90,0,0],rl:[-90,0,0]},kneel:{la:[-20,0,10],ra:[-20,0,-10],ll:[90,0,0],rl:[90,0,0]},wave:{la:[0,0,8],ra:[0,0,-150],ll:[0,0,0],rl:[0,0,0]}};function ra(n){let t=(n.h??1.75)/1.75,e=new rt,i=[],s=u=>{let d=Je(u);return i.push(d),d},r=s(n.coat||"fabric:#5b6148"),o=s(n.pants||"fabric:#3b3a36"),l=s(n.skin||"paint:#d9a988"),a=s(n.hatColor?"paint:"+n.hatColor:"paint:#2c2f2a"),h=(u,d,f,m,p,g)=>{let y=new at(d,f);return y.position.set(m,p,g),y.castShadow=!0,u.add(y),y},c={};for(let[u,d]of[["ll",-.1],["rl",.1]]){let f=new rt;f.position.set(d*t,.9*t,0),e.add(f),h(f,new pt(.075*t,.06*t,.88*t,10),o,0,-.44*t,0),h(f,new Ve(.11*t,.07*t,.24*t),s("rubber"),0,-.88*t,.05*t),c[u]=f}h(e,new pt(.19*t,.17*t,.62*t,14),r,0,1.2*t,0);for(let[u,d]of[["la",-.24],["ra",.24]]){let f=new rt;f.position.set(d*t,1.48*t,0),e.add(f),h(f,new pt(.055*t,.045*t,.6*t,8),r,0,-.3*t,0),h(f,new ue(.05*t,8,6),l,0,-.62*t,0),c[u]=f}return h(e,new pt(.05*t,.06*t,.08*t,8),l,0,1.54*t,0),h(e,new ue(.115*t,16,12),l,0,1.66*t,0),n.hat==="cap"?(h(e,new pt(.13*t,.12*t,.07*t,16),a,0,1.77*t,0),h(e,new Ve(.16*t,.015*t,.09*t),a,0,1.74*t,.11*t)):n.hat==="helmet"?h(e,new ue(.125*t,16,8,0,6.2832,0,Math.PI/1.8),a,0,1.67*t,0):n.hat==="top"&&h(e,new pt(.1*t,.1*t,.2*t,16),a,0,1.86*t,0),n.beard&&h(e,new ue(.08*t,10,8),s("paint:"+n.beard),0,1.58*t,.07*t).scale.set(1,1.2,.7),Qi(c,We[n.pose||"stand"]),{g:e,mats:i,piv:c}}function Qi(n,t,e=1,i){for(let s of["la","ra","ll","rl"]){let r=t[s],o=i?i[s]:r;n[s].rotation.set((o[0]+(r[0]-o[0])*e)*Vt,(o[1]+(r[1]-o[1])*e)*Vt,(o[2]+(r[2]-o[2])*e)*Vt)}}async function Ye(n,t){let e=n,i=e.type||"group",s=()=>Je(e.mat),r,o=[],l={},a=h=>{let c=new at(h,s());return o.push(c.material),c};switch(i){case"group":r=new rt;break;case"cylinder":r=a(new pt(e.rTop??e.r??1,e.rBottom??e.r??1,e.h??1,e.seg??32,1,!!e.open));break;case"cone":r=a(new Li(e.r??1,e.h??2,e.seg??32,1,!!e.open));break;case"box":{let[h,c,u]=e.size||[e.w??1,e.h??1,e.d??1];r=a(new Ve(h,c,u));break}case"sphere":r=a(new ue(e.r??1,e.seg??32,Math.round((e.seg??32)/2),0,6.2832,0,e.half?Math.PI/2:Math.PI));break;case"torus":r=a(new vi(e.r??1,e.tube??.1,10,e.seg??40)),r.geometry.rotateX(Math.PI/2);break;case"lathe":r=a(new tr(e.profile.map(([h,c])=>new F(Math.max(0,h),c)),e.seg??40)),e.double&&(r.material.side=et);break;case"tube":r=a(Kn(e));break;case"truss":{let h=e.h,c=e.from&&cr(e.from),u=e.to&&cr(e.to);if(c&&u&&(h=c.distanceTo(u)),r=a(ta({...e,h})),c&&u){let d=new rt;r.quaternion.setFromUnitVectors(new T(0,1,0),u.clone().sub(c).normalize()),r.position.copy(c),d.add(r),r=d}break}case"cloth":{let h=new ur(e,s());o.push(h.mesh.material),r=h.g,l.cloth=h;break}case"liquid":case"liquid-flow":{let h=Je(e.mat||"flow:"+(e.color||"#ff8a2a"));h.userData.flow||(h.userData.flow=!0);let c=new dr(e,h);r=c.mesh,o.push(h),l.flow=c;break}case"model":{let h=await Jn(e);r=h.o,o=h.mats,l.model=h.model;break}case"wing":r=a(qn(e)),r.material.side=et;break;case"wires":r=a(Wn(e));break;case"propeller":r=a(Yn(e));break;case"wheel":{let h=Xn(e);r=new rt;let c=new at(h.metal,Je(e.mat||"metal")),u=new at(h.tyre,Je(e.tyreMat||"rubber"));r.add(c,u),o.push(c.material,u.material);break}case"forest":{let h=Zn(e);r=h.o,o=h.mats,l.tick=h.o.userData.tick;break}case"person":{let h=ra(e);r=h.g,o=h.mats,l.pivots=h.piv;break}case"dot":{let h=new ge({map:ve(),color:new D(e.color||"#ffd27a"),blending:Tt,transparent:!0,depthWrite:!1});r=new Ne(h),r.scale.setScalar(e.size??1),o.push(h);break}case"light":{r=new xi(new D(e.color||"#ffb060"),e.power??0,e.dist??60,e.decay??1.5),l.light=r,r.userData.p0=e.power??0;break}case"globe":case"route":{let c=(await t.globus()).build(e,t);r=c.o,o=c.mats||[],Object.assign(l,c.extra||{});break}default:console.warn("rc3d: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u0435\u043B\u0430",i),r=new rt}for(let h of o)if(h.userData?.texStep&&r.geometry){let c=h.userData.texStep,u=r.geometry.userData,d=1,f=1;if(u.len)d=u.len/c,f=Math.max(1,2*Math.PI*(u.r||.2)/c);else{r.geometry.computeBoundingBox();let m=r.geometry.boundingBox.getSize(new T);d=Math.max(m.x,m.z)/c,f=m.y/c}for(let m of["map","normalMap","roughnessMap","aoMap","metalnessMap"])h[m]&&h[m].repeat.set(d,f)}return e.anchor==="base"&&r.geometry&&["cylinder","cone","box","sphere"].includes(i)&&(r.geometry.computeBoundingBox(),r.geometry.translate(0,-r.geometry.boundingBox.min.y,0)),i!=="model"&&i!=="forest"&&r.traverse(h=>{h.isMesh&&(h.castShadow=e.shadow!==!1&&!o[0]?.transparent,h.receiveShadow=e.shadow!==!1)}),e.pos&&r.position.fromArray(e.pos),e.rot&&r.rotation.set(e.rot[0]*Vt,e.rot[1]*Vt,e.rot[2]*Vt,e.order||"XYZ"),e.scale!=null&&(Array.isArray(e.scale)?r.scale.fromArray(e.scale):r.scale.setScalar(e.scale)),e.glow!=null&&o[0]&&(l.glow0=e.glow),{o:r,mats:o,...l}}function fr(n){if(n.at)return n.at.map(s=>({pos:s,yaw:0}));let t=[],e=n.n??4,i=n.step??360/e;for(let s=0;s<e;s++){let r=((n.start??0)+s*i)*Vt;t.push({pos:[Math.cos(r)*(n.radius??1),n.y??0,Math.sin(r)*(n.radius??1)],yaw:n.face===!1?0:-r})}return t}var wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],$n=1234567,no=Math.PI/180,oo=180/Math.PI;function na(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(wt[n&255]+wt[n>>8&255]+wt[n>>16&255]+wt[n>>24&255]+"-"+wt[t&255]+wt[t>>8&255]+"-"+wt[t>>16&15|64]+wt[t>>24&255]+"-"+wt[e&63|128]+wt[e>>8&255]+"-"+wt[e>>16&255]+wt[e>>24&255]+wt[i&255]+wt[i>>8&255]+wt[i>>16&255]+wt[i>>24&255]).toLowerCase()}function Zt(n,t,e){return Math.max(t,Math.min(e,n))}function ao(n,t){return(n%t+t)%t}function oa(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function aa(n,t,e){return n!==t?(e-n)/(t-n):0}function lo(n,t,e){return(1-e)*n+e*t}function la(n,t,e,i){return lo(n,t,1-Math.exp(-e*i))}function ha(n,t=1){return t-Math.abs(ao(n,t*2)-t)}function ca(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function ua(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function da(n,t){return n+Math.floor(Math.random()*(t-n+1))}function fa(n,t){return n+Math.random()*(t-n)}function ma(n){return n*(.5-Math.random())}function pa(n){n!==void 0&&($n=n);let t=$n+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ga(n){return n*no}function ya(n){return n*oo}function va(n){return(n&n-1)===0&&n!==0}function xa(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function wa(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Ma(n,t,e,i,s){let r=Math.cos,o=Math.sin,l=r(e/2),a=o(e/2),h=r((t+i)/2),c=o((t+i)/2),u=r((t-i)/2),d=o((t-i)/2),f=r((i-t)/2),m=o((i-t)/2);switch(s){case"XYX":n.set(l*c,a*u,a*d,l*h);break;case"YZY":n.set(a*d,l*c,a*u,l*h);break;case"ZXZ":n.set(a*u,a*d,l*c,l*h);break;case"XZX":n.set(l*c,a*m,a*f,l*h);break;case"YXY":n.set(a*f,l*c,a*m,l*h);break;case"ZYZ":n.set(a*m,a*f,l*c,l*h);break;default:console.warn("../math.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Sa(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ba(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var si={DEG2RAD:no,RAD2DEG:oo,generateUUID:na,clamp:Zt,euclideanModulo:ao,mapLinear:oa,inverseLerp:aa,lerp:lo,damp:la,pingpong:ha,smoothstep:ca,smootherstep:ua,randInt:da,randFloat:fa,randFloatSpread:ma,seededRandom:pa,degToRad:ga,radToDeg:ya,isPowerOfTwo:va,ceilPowerOfTwo:xa,floorPowerOfTwo:wa,setQuaternionFromProperEuler:Ma,normalize:ba,denormalize:Sa},G=class n{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,o,l){let a=i[s+0],h=i[s+1],c=i[s+2],u=i[s+3],d=r[o+0],f=r[o+1],m=r[o+2],p=r[o+3];if(l===0){t[e+0]=a,t[e+1]=h,t[e+2]=c,t[e+3]=u;return}if(l===1){t[e+0]=d,t[e+1]=f,t[e+2]=m,t[e+3]=p;return}if(u!==p||a!==d||h!==f||c!==m){let g=1-l,y=a*d+h*f+c*m+u*p,S=y>=0?1:-1,w=1-y*y;if(w>Number.EPSILON){let x=Math.sqrt(w),v=Math.atan2(x,y*S);g=Math.sin(g*v)/x,l=Math.sin(l*v)/x}let b=l*S;if(a=a*g+d*b,h=h*g+f*b,c=c*g+m*b,u=u*g+p*b,g===1-l){let x=1/Math.sqrt(a*a+h*h+c*c+u*u);a*=x,h*=x,c*=x,u*=x}}t[e]=a,t[e+1]=h,t[e+2]=c,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,s,r,o){let l=i[s],a=i[s+1],h=i[s+2],c=i[s+3],u=r[o],d=r[o+1],f=r[o+2],m=r[o+3];return t[e]=l*m+c*u+a*f-h*d,t[e+1]=a*m+c*d+h*u-l*f,t[e+2]=h*m+c*f+l*d-a*u,t[e+3]=c*m-l*u-a*d-h*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new n(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,o=t._order,l=Math.cos,a=Math.sin,h=l(i/2),c=l(s/2),u=l(r/2),d=a(i/2),f=a(s/2),m=a(r/2);switch(o){case"XYZ":this._x=d*c*u+h*f*m,this._y=h*f*u-d*c*m,this._z=h*c*m+d*f*u,this._w=h*c*u-d*f*m;break;case"YXZ":this._x=d*c*u+h*f*m,this._y=h*f*u-d*c*m,this._z=h*c*m-d*f*u,this._w=h*c*u+d*f*m;break;case"ZXY":this._x=d*c*u-h*f*m,this._y=h*f*u+d*c*m,this._z=h*c*m+d*f*u,this._w=h*c*u-d*f*m;break;case"ZYX":this._x=d*c*u-h*f*m,this._y=h*f*u+d*c*m,this._z=h*c*m-d*f*u,this._w=h*c*u+d*f*m;break;case"YZX":this._x=d*c*u+h*f*m,this._y=h*f*u+d*c*m,this._z=h*c*m-d*f*u,this._w=h*c*u-d*f*m;break;case"XZY":this._x=d*c*u-h*f*m,this._y=h*f*u-d*c*m,this._z=h*c*m+d*f*u,this._w=h*c*u+d*f*m;break;default:console.warn("../math.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],o=e[1],l=e[5],a=e[9],h=e[2],c=e[6],u=e[10],d=i+l+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(c-a)*f,this._y=(r-h)*f,this._z=(o-s)*f}else if(i>l&&i>u){let f=2*Math.sqrt(1+i-l-u);this._w=(c-a)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+h)/f}else if(l>u){let f=2*Math.sqrt(1+l-i-u);this._w=(r-h)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(a+c)/f}else{let f=2*Math.sqrt(1+u-i-l);this._w=(o-s)/f,this._x=(r+h)/f,this._y=(a+c)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Zt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,o=t._w,l=e._x,a=e._y,h=e._z,c=e._w;return this._x=i*c+o*l+s*h-r*a,this._y=s*c+o*a+r*l-i*h,this._z=r*c+o*h+i*a-s*l,this._w=o*c-i*l-s*a-r*h,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let i=this._x,s=this._y,r=this._z,o=this._w,l=o*t._w+i*t._x+s*t._y+r*t._z;if(l<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,l=-l):this.copy(t),l>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let a=1-l*l;if(a<=Number.EPSILON){let f=1-e;return this._w=f*o+e*this._w,this._x=f*i+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}let h=Math.sqrt(a),c=Math.atan2(h,l),u=Math.sin((1-e)*c)/h,d=Math.sin(e*c)/h;return this._w=o*u+this._w*d,this._x=i*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class n{constructor(t=0,e=0,i=0){this.isVector3=!0,n.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(to.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(to.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,o=t.y,l=t.z,a=t.w,h=2*(o*s-l*i),c=2*(l*e-r*s),u=2*(r*i-o*e);return this.x=e+a*h+o*u-l*c,this.y=i+a*c+l*h-r*u,this.z=s+a*u+r*c-o*h,this}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,o=e.x,l=e.y,a=e.z;return this.x=s*a-r*l,this.y=r*o-i*a,this.z=i*l-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return mr.copy(this).projectOnVector(t),this.sub(mr)}reflect(t){return this.sub(mr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}abs(){return this.x=Math.abs(this.x),this.y=Math.abs(this.y),this.z=Math.abs(this.z),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},mr=new R,to=new G,Ki=2e3,eo=2001,jt=class n{constructor(t,e,i,s,r,o,l,a,h,c,u,d,f,m,p,g){this.isMatrix4=!0,n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,l,a,h,c,u,d,f,m,p,g)}extractPosition(t){return console.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."),this.copyPosition(t)}multiplyToArray(t,e,i){return console.error("THREE.Matrix4: .multiplyToArray() has been removed."),this}setRotationFromQuaternion(t){return this.makeRotationFromQuaternion(t)}set(t,e,i,s,r,o,l,a,h,c,u,d,f,m,p,g){let y=this.elements;return y[0]=t,y[4]=e,y[8]=i,y[12]=s,y[1]=r,y[5]=o,y[9]=l,y[13]=a,y[2]=h,y[6]=c,y[10]=u,y[14]=d,y[3]=f,y[7]=m,y[11]=p,y[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,i=t.elements,s=1/Xe.setFromMatrixColumn(t,0).length(),r=1/Xe.setFromMatrixColumn(t,1).length(),o=1/Xe.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,o=Math.cos(i),l=Math.sin(i),a=Math.cos(s),h=Math.sin(s),c=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*c,f=o*u,m=l*c,p=l*u;e[0]=a*c,e[4]=-a*u,e[8]=h,e[1]=f+m*h,e[5]=d-p*h,e[9]=-l*a,e[2]=p-d*h,e[6]=m+f*h,e[10]=o*a}else if(t.order==="YXZ"){let d=a*c,f=a*u,m=h*c,p=h*u;e[0]=d+p*l,e[4]=m*l-f,e[8]=o*h,e[1]=o*u,e[5]=o*c,e[9]=-l,e[2]=f*l-m,e[6]=p+d*l,e[10]=o*a}else if(t.order==="ZXY"){let d=a*c,f=a*u,m=h*c,p=h*u;e[0]=d-p*l,e[4]=-o*u,e[8]=m+f*l,e[1]=f+m*l,e[5]=o*c,e[9]=p-d*l,e[2]=-o*h,e[6]=l,e[10]=o*a}else if(t.order==="ZYX"){let d=o*c,f=o*u,m=l*c,p=l*u;e[0]=a*c,e[4]=m*h-f,e[8]=d*h+p,e[1]=a*u,e[5]=p*h+d,e[9]=f*h-m,e[2]=-h,e[6]=l*a,e[10]=o*a}else if(t.order==="YZX"){let d=o*a,f=o*h,m=l*a,p=l*h;e[0]=a*c,e[4]=p-d*u,e[8]=m*u+f,e[1]=u,e[5]=o*c,e[9]=-l*c,e[2]=-h*c,e[6]=f*u+m,e[10]=d-p*u}else if(t.order==="XZY"){let d=o*a,f=o*h,m=l*a,p=l*h;e[0]=a*c,e[4]=-u,e[8]=h*c,e[1]=d*u+p,e[5]=o*c,e[9]=f*u-m,e[2]=m*u-f,e[6]=l*c,e[10]=p*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(_a,t,Ea)}lookAt(t,e,i){let s=this.elements;return kt.subVectors(t,e),kt.lengthSq()===0&&(kt.z=1),kt.normalize(),xe.crossVectors(i,kt),xe.lengthSq()===0&&(Math.abs(i.z)===1?kt.x+=1e-4:kt.z+=1e-4,kt.normalize(),xe.crossVectors(i,kt)),xe.normalize(),$i.crossVectors(kt,xe),s[0]=xe.x,s[4]=$i.x,s[8]=kt.x,s[1]=xe.y,s[5]=$i.y,s[9]=kt.y,s[2]=xe.z,s[6]=$i.z,s[10]=kt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],l=i[4],a=i[8],h=i[12],c=i[1],u=i[5],d=i[9],f=i[13],m=i[2],p=i[6],g=i[10],y=i[14],S=i[3],w=i[7],b=i[11],x=i[15],v=s[0],M=s[4],E=s[8],z=s[12],P=s[1],C=s[5],O=s[9],H=s[13],X=s[2],W=s[6],Z=s[10],tt=s[14],it=s[3],I=s[7],j=s[11],st=s[15];return r[0]=o*v+l*P+a*X+h*it,r[4]=o*M+l*C+a*W+h*I,r[8]=o*E+l*O+a*Z+h*j,r[12]=o*z+l*H+a*tt+h*st,r[1]=c*v+u*P+d*X+f*it,r[5]=c*M+u*C+d*W+f*I,r[9]=c*E+u*O+d*Z+f*j,r[13]=c*z+u*H+d*tt+f*st,r[2]=m*v+p*P+g*X+y*it,r[6]=m*M+p*C+g*W+y*I,r[10]=m*E+p*O+g*Z+y*j,r[14]=m*z+p*H+g*tt+y*st,r[3]=S*v+w*P+b*X+x*it,r[7]=S*M+w*C+b*W+x*I,r[11]=S*E+w*O+b*Z+x*j,r[15]=S*z+w*H+b*tt+x*st,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],o=t[1],l=t[5],a=t[9],h=t[13],c=t[2],u=t[6],d=t[10],f=t[14],m=t[3],p=t[7],g=t[11],y=t[15];return m*(+r*a*u-s*h*u-r*l*d+i*h*d+s*l*f-i*a*f)+p*(+e*a*f-e*h*d+r*o*d-s*o*f+s*h*c-r*a*c)+g*(+e*h*u-e*l*f-r*o*u+i*o*f+r*l*c-i*h*c)+y*(-s*l*c-e*a*u+e*l*d+s*o*u-i*o*d+i*a*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],l=t[5],a=t[6],h=t[7],c=t[8],u=t[9],d=t[10],f=t[11],m=t[12],p=t[13],g=t[14],y=t[15],S=u*g*h-p*d*h+p*a*f-l*g*f-u*a*y+l*d*y,w=m*d*h-c*g*h-m*a*f+o*g*f+c*a*y-o*d*y,b=c*p*h-m*u*h+m*l*f-o*p*f-c*l*y+o*u*y,x=m*u*a-c*p*a-m*l*d+o*p*d+c*l*g-o*u*g,v=e*S+i*w+s*b+r*x;if(v===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let M=1/v;return t[0]=S*M,t[1]=(p*d*r-u*g*r-p*s*f+i*g*f+u*s*y-i*d*y)*M,t[2]=(l*g*r-p*a*r+p*s*h-i*g*h-l*s*y+i*a*y)*M,t[3]=(u*a*r-l*d*r-u*s*h+i*d*h+l*s*f-i*a*f)*M,t[4]=w*M,t[5]=(c*g*r-m*d*r+m*s*f-e*g*f-c*s*y+e*d*y)*M,t[6]=(m*a*r-o*g*r-m*s*h+e*g*h+o*s*y-e*a*y)*M,t[7]=(o*d*r-c*a*r+c*s*h-e*d*h-o*s*f+e*a*f)*M,t[8]=b*M,t[9]=(m*u*r-c*p*r-m*i*f+e*p*f+c*i*y-e*u*y)*M,t[10]=(o*p*r-m*l*r+m*i*h-e*p*h-o*i*y+e*l*y)*M,t[11]=(c*l*r-o*u*r-c*i*h+e*u*h+o*i*f-e*l*f)*M,t[12]=x*M,t[13]=(c*p*s-m*u*s+m*i*d-e*p*d-c*i*g+e*u*g)*M,t[14]=(m*l*s-o*p*s-m*i*a+e*p*a+o*i*g-e*l*g)*M,t[15]=(o*u*s-c*l*s+c*i*a-e*u*a-o*i*d+e*l*d)*M,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,o=t.x,l=t.y,a=t.z,h=r*o,c=r*l;return this.set(h*o+i,h*l-s*a,h*a+s*l,0,h*l+s*a,c*l+i,c*a-s*o,0,h*a-s*l,c*a+s*o,r*a*a+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,o){return this.set(1,i,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,o=e._y,l=e._z,a=e._w,h=r+r,c=o+o,u=l+l,d=r*h,f=r*c,m=r*u,p=o*c,g=o*u,y=l*u,S=a*h,w=a*c,b=a*u,x=i.x,v=i.y,M=i.z;return s[0]=(1-(p+y))*x,s[1]=(f+b)*x,s[2]=(m-w)*x,s[3]=0,s[4]=(f-b)*v,s[5]=(1-(d+y))*v,s[6]=(g+S)*v,s[7]=0,s[8]=(m+w)*M,s[9]=(g-S)*M,s[10]=(1-(d+p))*M,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements,r=Xe.set(s[0],s[1],s[2]).length(),o=Xe.set(s[4],s[5],s[6]).length(),l=Xe.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Gt.copy(this);let h=1/r,c=1/o,u=1/l;return Gt.elements[0]*=h,Gt.elements[1]*=h,Gt.elements[2]*=h,Gt.elements[4]*=c,Gt.elements[5]*=c,Gt.elements[6]*=c,Gt.elements[8]*=u,Gt.elements[9]*=u,Gt.elements[10]*=u,e.setFromRotationMatrix(Gt),i.x=r,i.y=o,i.z=l,this}makePerspective(t,e,i,s,r,o,l=Ki){let a=this.elements,h=2*r/(e-t),c=2*r/(i-s),u=(e+t)/(e-t),d=(i+s)/(i-s),f,m;if(l===Ki)f=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(l===eo)f=-o/(o-r),m=-o*r/(o-r);else throw new Error("Matrix4.makePerspective(): Invalid coordinate system: "+l);return a[0]=h,a[4]=0,a[8]=u,a[12]=0,a[1]=0,a[5]=c,a[9]=d,a[13]=0,a[2]=0,a[6]=0,a[10]=f,a[14]=m,a[3]=0,a[7]=0,a[11]=-1,a[15]=0,this}makeOrthographic(t,e,i,s,r,o,l=Ki){let a=this.elements,h=1/(e-t),c=1/(i-s),u=1/(o-r),d=(e+t)*h,f=(i+s)*c,m,p;if(l===Ki)m=(o+r)*u,p=-2*u;else if(l===eo)m=r*u,p=-1*u;else throw new Error("../math.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return a[0]=2*h,a[4]=0,a[8]=0,a[12]=-d,a[1]=0,a[5]=2*c,a[9]=0,a[13]=-f,a[2]=0,a[6]=0,a[10]=p,a[14]=-m,a[3]=0,a[7]=0,a[11]=0,a[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},Xe=new R,Gt=new jt,_a=new R(0,0,0),Ea=new R(1,1,1),xe=new R,$i=new R,kt=new R,io=new jt,so=new G,is=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new n(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],o=s[4],l=s[8],a=s[1],h=s[5],c=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(Zt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-c,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Zt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(l,f),this._z=Math.atan2(a,h)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Zt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,h)):(this._y=0,this._z=Math.atan2(a,r));break;case"ZYX":this._y=Math.asin(-Zt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(a,r)):(this._x=0,this._z=Math.atan2(-o,h));break;case"YZX":this._z=Math.asin(Zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-c,h),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(l,f));break;case"XZY":this._z=Math.asin(-Zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(l,r)):(this._x=Math.atan2(-c,f),this._y=0);break;default:console.warn("../math.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return io.makeRotationFromQuaternion(t),this.setFromRotationMatrix(io,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return so.setFromEuler(this),this.setFromQuaternion(so,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(t){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};is.DEFAULT_ORDER="XYZ";var fe=class n{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*s+t.x,this.y=r*s+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};fe.isVector2=!0;var $=class n{constructor(t=0,e=0,i=0,s=1){n.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new n(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*s+o[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,a=t.elements,h=a[0],c=a[4],u=a[8],d=a[1],f=a[5],m=a[9],p=a[2],g=a[6],y=a[10];if(Math.abs(c-d)<.01&&Math.abs(u-p)<.01&&Math.abs(m-g)<.01){if(Math.abs(c+d)<.1&&Math.abs(u+p)<.1&&Math.abs(m+g)<.1&&Math.abs(h+f+y-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let w=(h+1)/2,b=(f+1)/2,x=(y+1)/2,v=(c+d)/4,M=(u+p)/4,E=(m+g)/4;return w>b&&w>x?w<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(w),s=v/i,r=M/i):b>x?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=v/s,r=E/s):x<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(x),i=M/r,s=E/r),this.set(i,s,r,e),this}let S=Math.sqrt((g-m)*(g-m)+(u-p)*(u-p)+(d-c)*(d-c));return Math.abs(S)<.001&&(S=1),this.x=(g-m)/S,this.y=(u-p)/S,this.z=(d-c)/S,this.w=Math.acos((h+f+y-1)/2),this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Qt=class n{constructor(t,e,i,s,r,o,l,a,h){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,o,l,a,h)}set(t,e,i,s,r,o,l,a,h){let c=this.elements;return c[0]=t,c[1]=s,c[2]=l,c[3]=e,c[4]=r,c[5]=a,c[6]=i,c[7]=o,c[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,o=i[0],l=i[3],a=i[6],h=i[1],c=i[4],u=i[7],d=i[2],f=i[5],m=i[8],p=s[0],g=s[3],y=s[6],S=s[1],w=s[4],b=s[7],x=s[2],v=s[5],M=s[8];return r[0]=o*p+l*S+a*x,r[3]=o*g+l*w+a*v,r[6]=o*y+l*b+a*M,r[1]=h*p+c*S+u*x,r[4]=h*g+c*w+u*v,r[7]=h*y+c*b+u*M,r[2]=d*p+f*S+m*x,r[5]=d*g+f*w+m*v,r[8]=d*y+f*b+m*M,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],l=t[5],a=t[6],h=t[7],c=t[8];return e*o*c-e*l*h-i*r*c+i*l*a+s*r*h-s*o*a}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],l=t[5],a=t[6],h=t[7],c=t[8],u=c*o-l*h,d=l*a-c*r,f=h*r-o*a,m=e*u+i*d+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let p=1/m;return t[0]=u*p,t[1]=(s*h-c*i)*p,t[2]=(l*i-s*o)*p,t[3]=d*p,t[4]=(c*e-s*a)*p,t[5]=(s*r-l*e)*p,t[6]=f*p,t[7]=(i*a-h*e)*p,t[8]=(o*e-i*r)*p,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,o,l){let a=Math.cos(r),h=Math.sin(r);return this.set(i*a,i*h,-i*(a*o+h*l)+o+t,-s*h,s*a,-s*(-h*o+a*l)+l+e,0,0,1),this}scale(t,e){return this.premultiply(pr.makeScale(t,e)),this}rotate(t){return this.premultiply(pr.makeRotation(-t)),this}translate(t,e){return this.premultiply(pr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new n().fromArray(this.elements)}},pr=new Qt,Mt;(function(n){n[n.Random=0]="Random",n[n.Loop=1]="Loop",n[n.PingPong=2]="PingPong",n[n.Burst=3]="Burst"})(Mt||(Mt={}));function ri(n,t,e,i){let s;switch(Mt.Random===n?t=Math.random():Mt.Burst===n&&i.isBursting&&(t=i.burstParticleIndex/i.burstParticleCount),e>0?s=Math.floor(t/e)*e:s=t,n){case Mt.Loop:s=s%1;break;case Mt.PingPong:s=Math.abs(s%2-1);break}return s}var Be=class n{constructor(t,e,i,s){this.p=[t,e,i,s]}genValue(t){let e=t*t,i=t*t*t,s=1-t,r=s*s,o=r*s;return this.p[0]*o+this.p[1]*r*t*3+this.p[2]*s*e*3+this.p[3]*i}derivativeCoefficients(t){let e=[];for(let i=t,s=i.length-1;s>0;s--){let r=[];for(let o=0;o<s;o++){let l=s*(i[o+1]-i[o]);r.push(l)}e.push(r),i=r}return e}getSlope(t){let e=this.derivativeCoefficients(this.p)[0],i=1-t,s=i*i,r=i*t*2,o=t*t;return s*e[0]+r*e[1]+o*e[2]}controlCurve(t,e){this.p[1]=t/3+this.p[0],this.p[2]=this.p[3]-e/3}hull(t){let e=this.p,i=[],s,r=0,o=0,l=0,a=[];for(a[r++]=e[0],a[r++]=e[1],a[r++]=e[2],a[r++]=e[3];e.length>1;){for(i=[],o=0,l=e.length-1;o<l;o++)s=t*e[o]+(1-t)*e[o+1],a[r++]=s,i.push(s);e=i}return a}split(t){let e=this.hull(t);return{left:new n(e[0],e[4],e[7],e[9]),right:new n(e[9],e[8],e[6],e[3]),span:e}}clone(){return new n(this.p[0],this.p[1],this.p[2],this.p[3])}toJSON(){return{p0:this.p[0],p1:this.p[1],p2:this.p[2],p3:this.p[3]}}static fromJSON(t){return new n(t.p0,t.p1,t.p2,t.p3)}},bi=n=>({r:n.x,g:n.y,b:n.z,a:n.w}),_i=n=>new $(n.r,n.g,n.b,n.a),Ta=(n,t)=>{switch(t){case"Vector3":return new R(n.x,n.y,n.z);case"Vector4":return new $(n.x,n.y,n.z,n.w);case"Color":return new R(n.r,n.g,n.b);case"Number":return n;default:return n}},za=(n,t)=>{switch(t){case"Vector3":return{x:n.x,y:n.y,z:n.z};case"Vector4":return{x:n.x,y:n.y,z:n.z,w:n.w};case"Color":return{r:n.x,g:n.y,b:n.z};case"Number":return n;default:return n}},xr=class n{constructor(t,e){this.a=t,this.b=e,this.type="value"}startGen(t){}genColor(t,e){let i=Math.random();return e.copy(this.a).lerp(this.b,i)}toJSON(){return{type:"RandomColor",a:bi(this.a),b:bi(this.b)}}static fromJSON(t){return new n(_i(t.a),_i(t.b))}clone(){return new n(this.a.clone(),this.b.clone())}},Jt=class n{constructor(t,e){this.a=t,this.b=e,this.indexCount=-1,this.type="value"}startGen(t){this.indexCount=t.length,t.push(Math.random())}genColor(t,e){return this.indexCount===-1&&this.startGen(t),e.copy(this.a).lerp(this.b,t[this.indexCount])}toJSON(){return{type:"ColorRange",a:bi(this.a),b:bi(this.b)}}static fromJSON(t){return new n(_i(t.a),_i(t.b))}clone(){return new n(this.a.clone(),this.b.clone())}},Ze=class n{constructor(t,e){this.subType=e,this.type="function",this.keys=t}findKey(t){let e=0,i=0,s=this.keys.length-1;for(;i+1<s;)if(e=Math.floor((i+s)/2),t<this.getStartX(e))s=e-1;else if(t>this.getEndX(e))i=e+1;else return e;for(let r=i;r<=s;r++)if(t>=this.getStartX(r)&&t<=this.getEndX(r))return r;return-1}getStartX(t){return this.keys[t][1]}getEndX(t){return t+1<this.keys.length?this.keys[t+1][1]:1}genValue(t,e){let i=this.findKey(e);return this.subType==="Number"?i===-1?this.keys[0][0]:i+1>=this.keys.length?this.keys[this.keys.length-1][0]:(this.keys[i+1][0]-this.keys[i][0])*((e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))+this.keys[i][0]:i===-1?t.copy(this.keys[0][0]):i+1>=this.keys.length?t.copy(this.keys[this.keys.length-1][0]):t.copy(this.keys[i][0]).lerp(this.keys[i+1][0],(e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))}toJSON(){return this.keys[0][0].constructor.name,{type:"CLinearFunction",subType:this.subType,keys:this.keys.map(([t,e])=>({value:za(t,this.subType),pos:e}))}}static fromJSON(t){return new n(t.keys.map(e=>[Ta(e.value,t.subType),e.pos]),t.subType)}clone(){return this.subType==="Number"?new n(this.keys.map(([t,e])=>[t,e]),this.subType):new n(this.keys.map(([t,e])=>[t.clone(),e]),this.subType)}},ts=new R,Ie=class n{constructor(t=[[new R(0,0,0),0],[new R(1,1,1),0]],e=[[1,0],[1,1]]){this.type="function",this.color=new Ze(t,"Color"),this.alpha=new Ze(e,"Number")}genColor(t,e,i){return this.color.genValue(ts,i),e.set(ts.x,ts.y,ts.z,this.alpha.genValue(1,i))}toJSON(){return{type:"Gradient",color:this.color.toJSON(),alpha:this.alpha.toJSON()}}static fromJSON(t){if(t.functions){let e=t.functions.map(i=>[Jt.fromJSON(i.function).a,i.start]);return t.functions.length>0&&e.push([Jt.fromJSON(t.functions[t.functions.length-1].function).b,1]),new n(e.map(i=>[new R(i[0].x,i[0].y,i[0].z),i[1]]),e.map(i=>[i[0].w,i[1]]))}else{let e=new n;return e.alpha=Ze.fromJSON(t.alpha),e.color=Ze.fromJSON(t.color),e}}clone(){let t=new n;return t.alpha=this.alpha.clone(),t.color=this.color.clone(),t}startGen(t){}},gr=new $,wr=class n{constructor(t,e){this.indexCount=0,this.type="function",this.gradient1=t,this.gradient2=e}startGen(t){this.indexCount=t.length,t.push(Math.random())}genColor(t,e,i){return this.gradient1.genColor(t,e,i),this.gradient2.genColor(t,gr,i),t&&t[this.indexCount]!==void 0?e.lerp(gr,t[this.indexCount]):e.lerp(gr,Math.random()),e}toJSON(){return{type:"RandomColorBetweenGradient",gradient1:this.gradient1.toJSON(),gradient2:this.gradient2.toJSON()}}static fromJSON(t){return new n(Ie.fromJSON(t.gradient1),Ie.fromJSON(t.gradient2))}clone(){return new n(this.gradient1.clone(),this.gradient2.clone())}},Qe=class n{constructor(t){this.color=t,this.type="value"}startGen(t){}genColor(t,e){return e.copy(this.color)}toJSON(){return{type:"ConstantColor",color:bi(this.color)}}static fromJSON(t){return new n(_i(t.color))}clone(){return new n(this.color.clone())}};function Ps(n){switch(n.type){case"ConstantColor":return Qe.fromJSON(n);case"ColorRange":return Jt.fromJSON(n);case"RandomColor":return xr.fromJSON(n);case"Gradient":return Ie.fromJSON(n);case"RandomColorBetweenGradient":return wr.fromJSON(n);default:return new Qe(new $(1,1,1,1))}}var B=class n{constructor(t){this.value=t,this.type="value"}startGen(t){}genValue(t){return this.value}toJSON(){return{type:"ConstantValue",value:this.value}}static fromJSON(t){return new n(t.value)}clone(){return new n(this.value)}},Q=class n{constructor(t,e){this.a=t,this.b=e,this.indexCount=-1,this.type="value"}startGen(t){this.indexCount=t.length,t.push(Math.random())}genValue(t){return this.indexCount===-1&&this.startGen(t),si.lerp(this.a,this.b,t[this.indexCount])}toJSON(){return{type:"IntervalValue",a:this.a,b:this.b}}static fromJSON(t){return new n(t.a,t.b)}clone(){return new n(this.a,this.b)}},Mr=class{constructor(){this.functions=new Array}findFunction(t){let e=0,i=0,s=this.functions.length-1;for(;i+1<s;)if(e=Math.floor((i+s)/2),t<this.getStartX(e))s=e-1;else if(t>this.getEndX(e))i=e+1;else return e;for(let r=i;r<=s;r++)if(t>=this.functions[r][1]&&t<=this.getEndX(r))return r;return-1}getStartX(t){return this.functions[t][1]}setStartX(t,e){t>0&&(this.functions[t][1]=e)}getEndX(t){return t+1<this.functions.length?this.functions[t+1][1]:1}setEndX(t,e){t+1<this.functions.length&&(this.functions[t+1][1]=e)}insertFunction(t,e){let i=this.findFunction(t);this.functions.splice(i+1,0,[e,t])}removeFunction(t){return this.functions.splice(t,1)[0][0]}getFunction(t){return this.functions[t][0]}setFunction(t,e){this.functions[t][0]=e}get numOfFunctions(){return this.functions.length}},Ke=class n extends Mr{constructor(t=[[new Be(0,1/3,1/3*2,1),0]]){super(),this.type="function",this.functions=t}genValue(t,e=0){let i=this.findFunction(e);return i===-1?0:this.functions[i][0].genValue((e-this.getStartX(i))/(this.getEndX(i)-this.getStartX(i)))}toSVG(t,e){if(e<1)return"";let i=["M",0,this.functions[0][0].p[0]].join(" ");for(let s=1/e;s<=1;s+=1/e)i=[i,"L",s*t,this.genValue(void 0,s)].join(" ");return i}toJSON(){return{type:"PiecewiseBezier",functions:this.functions.map(([t,e])=>({function:t.toJSON(),start:e}))}}static fromJSON(t){return new n(t.functions.map(e=>[Be.fromJSON(e.function),e.start]))}clone(){return new n(this.functions.map(([t,e])=>[t.clone(),e]))}startGen(t){}};function U(n){switch(n.type){case"ConstantValue":return B.fromJSON(n);case"IntervalValue":return Q.fromJSON(n);case"PiecewiseBezier":return Ke.fromJSON(n);default:return new B(0)}}var ss=class n{constructor(){this.indexCount=0,this.type="rotation"}startGen(t){this.indexCount=t.length,t.push(new G);let e,i,s,r,o,l;do e=Math.random()*2-1,i=Math.random()*2-1,s=e*e+i*i;while(s>1);do r=Math.random()*2-1,o=Math.random()*2-1,l=r*r+o*o;while(l>1);let a=Math.sqrt((1-s)/l);t[this.indexCount].set(e,i,a*r,a*o)}genValue(t,e,i,s){return this.indexCount===-1&&this.startGen(t),e.copy(t[this.indexCount]),e}toJSON(){return{type:"RandomQuat"}}static fromJSON(t){return new n}clone(){return new n}},Ei=class n{constructor(t,e){this.axis=t,this.angle=e,this.type="rotation"}startGen(t){this.angle.startGen(t)}genValue(t,e,i,s){return e.setFromAxisAngle(this.axis,this.angle.genValue(t,s)*i)}toJSON(){return{type:"AxisAngle",axis:{x:this.axis.x,y:this.axis.y,z:this.axis.z},angle:this.angle.toJSON()}}static fromJSON(t){return new n(new R(t.axis.x,t.axis.y,t.axis.z),U(t.angle))}clone(){return new n(this.axis.clone(),this.angle.clone())}},Sr=class n{constructor(t,e,i,s){this.angleX=t,this.angleY=e,this.angleZ=i,this.type="rotation",this.eular=new is(0,0,0,s)}startGen(t){this.angleX.startGen(t),this.angleY.startGen(t),this.angleZ.startGen(t)}genValue(t,e,i,s){return this.eular.set(this.angleX.genValue(t,s)*i,this.angleY.genValue(t,s)*i,this.angleZ.genValue(t,s)*i),e.setFromEuler(this.eular)}toJSON(){return{type:"Euler",angleX:this.angleX.toJSON(),angleY:this.angleY.toJSON(),angleZ:this.angleZ.toJSON(),eulerOrder:this.eular.order}}static fromJSON(t){return new n(U(t.angleX),U(t.angleY),U(t.angleZ),t.eulerOrder)}clone(){return new n(this.angleX,this.angleY,this.angleZ,this.eular.order)}};function ho(n){switch(n.type){case"AxisAngle":return Ei.fromJSON(n);case"Euler":return Sr.fromJSON(n);case"RandomQuat":return ss.fromJSON(n);default:return new ss}}var $e=class n{constructor(t,e,i){this.x=t,this.y=e,this.z=i,this.type="vec3function"}startGen(t){this.x.startGen(t),this.y.startGen(t),this.z.startGen(t)}genValue(t,e,i){return e.set(this.x.genValue(t,i),this.y.genValue(t,i),this.z.genValue(t,i))}toJSON(){return{type:"Vector3Function",x:this.x.toJSON(),y:this.y.toJSON(),z:this.z.toJSON()}}static fromJSON(t){return new n(U(t.x),U(t.y),U(t.z))}clone(){return new n(this.x,this.y,this.z)}};function Pa(n){return n.type==="Vector3Function"?$e.fromJSON(n):new $e(new B(0),new B(0),new B(0))}function zi(n){switch(n.type){case"ConstantValue":case"IntervalValue":case"PiecewiseBezier":return U(n);case"AxisAngle":case"RandomQuat":case"Euler":return ho(n);case"Vector3Function":return Pa(n);default:return new B(0)}}var ti=class n{constructor(t={}){this.type="cone",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.angle=t.angle??Math.PI/6,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[]}update(t,e){Mt.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=si.lerp(1-this.thickness,1,Math.random()),r=i*this.arc,o=Math.sqrt(s),l=Math.sin(r),a=Math.cos(r);t.position.x=o*a,t.position.y=o*l,t.position.z=0;let h=this.angle*o;t.velocity.set(0,0,Math.cos(h)).addScaledVector(t.position,Math.sin(h)).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius)}toJSON(){return{type:"cone",radius:this.radius,arc:this.arc,thickness:this.thickness,angle:this.angle,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,angle:t.angle,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,angle:this.angle,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},rs=class n{constructor(t={}){this.type="circle",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[]}update(t,e){this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=si.lerp(1-this.thickness,1,Math.random()),r=i*this.arc;t.position.x=Math.cos(r),t.position.y=Math.sin(r),t.position.z=0,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*s)}toJSON(){return{type:"circle",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}};function es(n,t){return Math.floor(Math.random()*(t-n))+n}var Pi=new R(0,1,0),Ri=new R(0,0,0),Ra=new R(1,1,1),ro=new R(0,0,1),ns=class n{constructor(t={}){this.type="donut",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.donutRadius=t.donutRadius??this.radius*.2,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[],this._m1=new jt}update(t,e){Mt.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=si.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,l=s*Math.PI*2,a=Math.sin(o),h=Math.cos(o);if(t.position.x=this.radius*h,t.position.y=this.radius*a,t.position.z=0,t.velocity.z=this.donutRadius*r*Math.sin(l),t.velocity.x=this.donutRadius*r*Math.cos(l)*h,t.velocity.y=this.donutRadius*r*Math.cos(l)*a,t.position.add(t.velocity),t.velocity.normalize().multiplyScalar(t.startSpeed),t.rotation instanceof G){let c=t.rotation;c.x===0&&c.y===0&&c.z===0&&c.w===1&&(this._m1.lookAt(Ri,t.velocity,Pi),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"donut",radius:this.radius,arc:this.arc,thickness:this.thickness,donutRadius:this.donutRadius,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,donutRadius:t.donutRadius,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,donutRadius:this.donutRadius,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},ei=class n{constructor(){this.type="point",this._m1=new jt}update(t,e){}initialize(t){let e=Math.random(),i=Math.random(),s=e*Math.PI*2,r=Math.acos(2*i-1),o=Math.cbrt(Math.random()),l=Math.sin(s),a=Math.cos(s),h=Math.sin(r),c=Math.cos(r);if(t.velocity.x=o*h*a,t.velocity.y=o*h*l,t.velocity.z=o*c,t.velocity.multiplyScalar(t.startSpeed),t.position.setScalar(0),t.rotation instanceof G){let u=t.rotation;u.x===0&&u.y===0&&u.z===0&&u.w===1&&(this._m1.lookAt(Ri,t.velocity,Pi),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"point"}}static fromJSON(t){return new n}clone(){return new n}},Kt=class n{constructor(t={}){this.type="sphere",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[],this._m1=new jt}update(t,e){Mt.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=si.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,l=Math.acos(2*s-1),a=Math.sin(o),h=Math.cos(o),c=Math.sin(l),u=Math.cos(l);if(t.position.x=c*h,t.position.y=c*a,t.position.z=u,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*r),t.rotation instanceof G){let d=t.rotation;d.x===0&&d.y===0&&d.z===0&&d.w===1&&(this._m1.lookAt(Ri,t.position,Pi),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"sphere",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},os=class n{constructor(t={}){this.type="hemisphere",this.currentValue=0,this.radius=t.radius??10,this.arc=t.arc??2*Math.PI,this.thickness=t.thickness??1,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[],this._m1=new jt}update(t,e){Mt.Random!=this.mode&&(this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e)}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=Math.random(),r=si.lerp(1-this.thickness,1,Math.random()),o=i*this.arc,l=Math.acos(s),a=Math.sin(o),h=Math.cos(o),c=Math.sin(l),u=Math.cos(l);if(t.position.x=c*h,t.position.y=c*a,t.position.z=u,t.velocity.copy(t.position).multiplyScalar(t.startSpeed),t.position.multiplyScalar(this.radius*r),t.rotation instanceof G){let d=t.rotation;d.x===0&&d.y===0&&d.z===0&&d.w===1&&(this._m1.lookAt(Ri,t.position,Pi),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"hemisphere",radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({radius:t.radius,arc:t.arc,thickness:t.thickness,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({radius:this.radius,arc:this.arc,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},as=class n{constructor(t={}){this.type="grid",this.width=t.width??1,this.height=t.height??1,this.column=t.column??10,this.row=t.row??10}initialize(t){let e=Math.floor(Math.random()*this.row),i=Math.floor(Math.random()*this.column);t.position.x=i*this.width/this.column-this.width/2,t.position.y=e*this.height/this.row-this.height/2,t.position.z=0,t.velocity.set(0,0,t.startSpeed)}toJSON(){return{type:"grid",width:this.width,height:this.height,column:this.column,row:this.row}}static fromJSON(t){return new n(t)}clone(){return new n({width:this.width,height:this.height,column:this.column,row:this.row})}update(t,e){}},ls=class n{constructor(t={}){this.type="rectangle",this.currentValue=0,this.width=t.width??10,this.height=t.height??10,this.thickness=t.thickness??1,this.mode=t.mode??Mt.Random,this.spread=t.spread??0,this.speed=t.speed??new B(1),this.memory=[],this._m1=new jt}update(t,e){this.currentValue+=this.speed.genValue(this.memory,t.emissionState.time/t.duration)*e}initialize(t,e){let i=ri(this.mode,this.currentValue,this.spread,e),s=2*(this.width+this.height),r=i*s,o,l;r<this.width?(o=r-this.width/2,l=-this.height/2):r<this.width+this.height?(o=this.width/2,l=r-this.width-this.height/2):r<2*this.width+this.height?(o=this.width/2-(r-this.width-this.height),l=this.height/2):(o=-this.width/2,l=this.height/2-(r-2*this.width-this.height));let a=Math.random(),h=1-this.thickness*a;if(t.position.x=o*h,t.position.y=l*h,t.position.z=0,t.velocity.x=o,t.velocity.y=l,t.velocity.z=0,t.velocity.normalize().multiplyScalar(t.startSpeed),t.rotation instanceof G){let c=t.rotation;c.x===0&&c.y===0&&c.z===0&&c.w===1&&(this._m1.lookAt(Ri,t.velocity,Pi),t.rotation.setFromRotationMatrix(this._m1))}}toJSON(){return{type:"rectangle",width:this.width,height:this.height,thickness:this.thickness,mode:this.mode,spread:this.spread,speed:this.speed.toJSON()}}static fromJSON(t){return new n({width:t.width,height:t.height,thickness:t.thickness,mode:t.mode,speed:t.speed?U(t.speed):void 0,spread:t.spread})}clone(){return new n({width:this.width,height:this.height,thickness:this.thickness,mode:this.mode,speed:this.speed.clone(),spread:this.spread})}},br={circle:{type:"circle",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:rs,loadJSON:rs.fromJSON},cone:{type:"cone",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:ti,loadJSON:ti.fromJSON},donut:{type:"donut",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["donutRadius",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:ns,loadJSON:ns.fromJSON},point:{type:"point",params:[],constructor:ei,loadJSON:ei.fromJSON},sphere:{type:"sphere",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:Kt,loadJSON:Kt.fromJSON},hemisphere:{type:"hemisphere",params:[["radius",["number"]],["arc",["radian"]],["thickness",["number"]],["angle",["radian"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:os,loadJSON:os.fromJSON},grid:{type:"grid",params:[["width",["number"]],["height",["number"]],["rows",["number"]],["column",["number"]]],constructor:as,loadJSON:as.fromJSON},rectangle:{type:"rectangle",params:[["width",["number"]],["height",["number"]],["thickness",["number"]],["mode",["emitterMode"]],["spread",["number"]],["speed",["valueFunc","value"]]],constructor:ls,loadJSON:ls.fromJSON}};function co(n,t){return br[n.type].loadJSON(n,t)}var $t=class n{constructor(t){this.color=t,this.type="ColorOverLife"}initialize(t){this.color.startGen(t.memory)}update(t,e){this.color.genColor(t.memory,t.color,t.age/t.life),t.color.x*=t.startColor.x,t.color.y*=t.startColor.y,t.color.z*=t.startColor.z,t.color.w*=t.startColor.w}frameUpdate(t){}toJSON(){return{type:this.type,color:this.color.toJSON()}}static fromJSON(t){return new n(Ps(t.color))}clone(){return new n(this.color.clone())}reset(){}},hs=class n{constructor(t){this.angularVelocity=t,this.type="RotationOverLife"}initialize(t){typeof t.rotation=="number"&&this.angularVelocity.startGen(t.memory)}update(t,e){typeof t.rotation=="number"&&(t.rotation+=e*this.angularVelocity.genValue(t.memory,t.age/t.life))}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON()}}static fromJSON(t){return new n(U(t.angularVelocity))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone())}reset(){}},cs=class n{constructor(t){this.angularVelocity=t,this.type="Rotation3DOverLife",this.tempQuat=new G,this.tempQuat2=new G}initialize(t){t.rotation instanceof G&&(t.angularVelocity=new G,this.angularVelocity.startGen(t.memory))}update(t,e){t.rotation instanceof G&&(this.angularVelocity.genValue(t.memory,this.tempQuat,e,t.age/t.life),t.rotation.multiply(this.tempQuat))}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON()}}static fromJSON(t){return new n(ho(t.angularVelocity))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone())}reset(){}},us=class n{initialize(t,e){this.ps=e,this.x.startGen(t.memory),this.y.startGen(t.memory),this.z.startGen(t.memory)}constructor(t,e,i){this.x=t,this.y=e,this.z=i,this.type="ForceOverLife",this._temp=new R,this._tempScale=new R,this._tempQ=new G}update(t,e){this._temp.set(this.x.genValue(t.memory,t.age/t.life),this.y.genValue(t.memory,t.age/t.life),this.z.genValue(t.memory,t.age/t.life)),this.ps.worldSpace?t.velocity.addScaledVector(this._temp,e):(this._temp.multiply(this._tempScale).applyQuaternion(this._tempQ),t.velocity.addScaledVector(this._temp,e))}toJSON(){return{type:this.type,x:this.x.toJSON(),y:this.y.toJSON(),z:this.z.toJSON()}}static fromJSON(t){return new n(U(t.x),U(t.y),U(t.z))}frameUpdate(t){if(this.ps&&!this.ps.worldSpace){let e=this._temp,i=this._tempQ,s=this._tempScale;this.ps.emitter.matrixWorld.decompose(e,i,s),i.invert(),s.set(1/s.x,1/s.y,1/s.z)}}clone(){return new n(this.x.clone(),this.y.clone(),this.z.clone())}reset(){}},me=class n{initialize(t){this.size.startGen(t.memory)}constructor(t){this.size=t,this.type="SizeOverLife"}update(t){this.size instanceof $e?this.size.genValue(t.memory,t.size,t.age/t.life).multiply(t.startSize):t.size.copy(t.startSize).multiplyScalar(this.size.genValue(t.memory,t.age/t.life))}toJSON(){return{type:this.type,size:this.size.toJSON()}}static fromJSON(t){return new n(zi(t.size))}frameUpdate(t){}clone(){return new n(this.size.clone())}reset(){}},ds=class n{initialize(t){this.speed.startGen(t.memory)}constructor(t){this.speed=t,this.type="SpeedOverLife"}update(t){t.speedModifier=this.speed.genValue(t.memory,t.age/t.life)}toJSON(){return{type:this.type,speed:this.speed.toJSON()}}static fromJSON(t){return new n(U(t.speed))}frameUpdate(t){}clone(){return new n(this.speed.clone())}reset(){}},fs=class n{constructor(t){this.frame=t,this.type="FrameOverLife"}initialize(t){this.frame.startGen(t.memory)}update(t,e){this.frame instanceof Ke&&(t.uvTile=this.frame.genValue(t.memory,t.age/t.life))}frameUpdate(t){}toJSON(){return{type:this.type,frame:this.frame.toJSON()}}static fromJSON(t){return new n(U(t.frame))}clone(){return new n(this.frame.clone())}reset(){}},ms=class n{constructor(t,e=new R(0,1,0)){this.orbitSpeed=t,this.axis=e,this.type="OrbitOverLife",this.temp=new R,this.rotation=new G}initialize(t){this.orbitSpeed.startGen(t.memory)}update(t,e){this.temp.copy(t.position).projectOnVector(this.axis),this.rotation.setFromAxisAngle(this.axis,this.orbitSpeed.genValue(t.memory,t.age/t.life)*e),t.position.sub(this.temp),t.position.applyQuaternion(this.rotation),t.position.add(this.temp)}frameUpdate(t){}toJSON(){return{type:this.type,orbitSpeed:this.orbitSpeed.toJSON(),axis:[this.axis.x,this.axis.y,this.axis.z]}}static fromJSON(t){return new n(U(t.orbitSpeed),t.axis?new R(t.axis[0],t.axis[1],t.axis[2]):void 0)}clone(){return new n(this.orbitSpeed.clone())}reset(){}},Si=class{constructor(t){this.data=t,this.next=null,this.prev=null}hasPrev(){return this.prev!==null}hasNext(){return this.next!==null}},_r=class{constructor(){this.length=0,this.head=this.tail=null}isEmpty(){return this.head===null}clear(){this.length=0,this.head=this.tail=null}front(){return this.head===null?null:this.head.data}back(){return this.tail===null?null:this.tail.data}dequeue(){if(this.head){let t=this.head.data;return this.head=this.head.next,this.head?this.head.prev=null:this.tail=null,this.length--,t}}pop(){if(this.tail){let t=this.tail.data;return this.tail=this.tail.prev,this.tail?this.tail.next=null:this.head=null,this.length--,t}}queue(t){let e=new Si(t);this.tail||(this.tail=e),this.head&&(this.head.prev=e,e.next=this.head),this.head=e,this.length++}push(t){let e=new Si(t);this.head||(this.head=e),this.tail&&(this.tail.next=e,e.prev=this.tail),this.tail=e,this.length++}insertBefore(t,e){let i=new Si(e);i.next=t,i.prev=t.prev,i.prev!==null&&(i.prev.next=i),i.next.prev=i,t==this.head&&(this.head=i),this.length++}remove(t){if(this.head===null||this.tail===null)return;let e=this.head;for(t===this.head.data&&(this.head=this.head.next),t===this.tail.data&&(this.tail=this.tail.prev);e.next!==null&&e.data!==t;)e=e.next;e.data===t&&(e.prev!==null&&(e.prev.next=e.next),e.next!==null&&(e.next.prev=e.prev),this.length--)}*values(){let t=this.head;for(;t!==null;)yield t.data,t=t.next}};var ps=class{constructor(){this.startSpeed=0,this.startColor=new $,this.startSize=new R(1,1,1),this.position=new R,this.velocity=new R,this.age=0,this.life=1,this.size=new R(1,1,1),this.speedModifier=1,this.rotation=0,this.color=new $,this.uvTile=0,this.memory=[]}get died(){return this.age>=this.life}reset(){this.memory.length=0}},Er=class{constructor(t,e,i){this.position=t,this.size=e,this.color=i}},ii=class{constructor(){this.startSpeed=0,this.startColor=new $,this.startSize=new R(1,1,1),this.position=new R,this.velocity=new R,this.age=0,this.life=1,this.size=new R(1,1,1),this.length=100,this.speedModifier=1,this.color=new $,this.previous=new _r,this.uvTile=0,this.memory=[]}update(){for(this.age<=this.life?this.previous.push(new Er(this.position.clone(),this.size.x,this.color.clone())):this.previous.length>0&&this.previous.dequeue();this.previous.length>this.length;)this.previous.dequeue()}get died(){return this.age>=this.life}reset(){this.memory.length=0,this.previous.clear()}},gs=class n{initialize(t){this.width.startGen(t.memory)}constructor(t){this.width=t,this.type="WidthOverLength"}update(t){if(t instanceof ii){let e=t.previous.values();for(let i=0;i<t.previous.length;i++){let s=e.next();s.value.size=this.width.genValue(t.memory,(t.previous.length-i)/t.length)}}}frameUpdate(t){}toJSON(){return{type:this.type,width:this.width.toJSON()}}static fromJSON(t){return new n(U(t.width))}clone(){return new n(this.width.clone())}reset(){}},we=class n{constructor(t,e){this.direction=t,this.magnitude=e,this.type="ApplyForce",this.memory={data:[],dataCount:0},this.magnitudeValue=this.magnitude.genValue(this.memory)}initialize(t){}update(t,e){t.velocity.addScaledVector(this.direction,this.magnitudeValue*e)}frameUpdate(t){this.magnitudeValue=this.magnitude.genValue(this.memory)}toJSON(){return{type:this.type,direction:[this.direction.x,this.direction.y,this.direction.z],magnitude:this.magnitude.toJSON()}}static fromJSON(t){return new n(new R(t.direction[0],t.direction[1],t.direction[2]),U(t.magnitude??t.force))}clone(){return new n(this.direction.clone(),this.magnitude.clone())}reset(){}},ys=class n{constructor(t,e){this.center=t,this.magnitude=e,this.type="GravityForce",this.temp=new R}initialize(t){}update(t,e){this.temp.copy(this.center).sub(t.position).normalize(),t.velocity.addScaledVector(this.temp,this.magnitude/t.position.distanceToSquared(this.center)*e)}frameUpdate(t){}toJSON(){return{type:this.type,center:[this.center.x,this.center.y,this.center.z],magnitude:this.magnitude}}static fromJSON(t){return new n(new R(t.center[0],t.center[1],t.center[2]),t.magnitude)}clone(){return new n(this.center.clone(),this.magnitude)}reset(){}},vs=class n{constructor(t){this.angle=t,this.type="ChangeEmitDirection",this._temp=new R,this._q=new G,this.memory={data:[],dataCount:0}}initialize(t){let e=t.velocity.length();e!=0&&(t.velocity.normalize(),t.velocity.x===0&&t.velocity.y===0?this._temp.set(0,t.velocity.z,0):this._temp.set(-t.velocity.y,t.velocity.x,0),this.angle.startGen(this.memory),this._q.setFromAxisAngle(this._temp.normalize(),this.angle.genValue(this.memory)),this._temp.copy(t.velocity),t.velocity.applyQuaternion(this._q),this._q.setFromAxisAngle(this._temp,Math.random()*Math.PI*2),t.velocity.applyQuaternion(this._q),t.velocity.setLength(e))}update(t,e){}frameUpdate(t){}toJSON(){return{type:this.type,angle:this.angle.toJSON()}}static fromJSON(t){return new n(U(t.angle))}clone(){return new n(this.angle)}reset(){}},je;(function(n){n[n.Death=0]="Death",n[n.Birth=1]="Birth",n[n.Frame=2]="Frame"})(je||(je={}));var Ti=class n{constructor(t,e,i,s=je.Frame,r=1){this.particleSystem=t,this.useVelocityAsBasis=e,this.subParticleSystem=i,this.mode=s,this.emitProbability=r,this.type="EmitSubParticleSystem",this.q_=new G,this.v_=new R,this.v2_=new R,this.subEmissions=new Array,this.subParticleSystem&&this.subParticleSystem.system&&(this.subParticleSystem.system.onlyUsedByOther=!0)}initialize(t){}update(t,e){this.mode===je.Frame?this.emit(t,e):this.mode===je.Birth&&t.age===0?this.emit(t,e):this.mode===je.Death&&t.age+e>=t.life&&this.emit(t,e)}emit(t,e){if(!this.subParticleSystem||Math.random()>this.emitProbability)return;let i=new jt;this.setMatrixFromParticle(i,t),this.subEmissions.push({burstParticleCount:0,burstParticleIndex:0,isBursting:!1,burstIndex:0,burstWaveIndex:0,time:0,waitEmiting:0,matrix:i,travelDistance:0,particle:t})}frameUpdate(t){if(this.subParticleSystem)for(let e=0;e<this.subEmissions.length;e++)if(this.subEmissions[e].time>=this.subParticleSystem.system.duration)this.subEmissions[e]=this.subEmissions[this.subEmissions.length-1],this.subEmissions.length=this.subEmissions.length-1,e--;else{let i=this.subEmissions[e];i.particle&&i.particle.age<i.particle.life?this.setMatrixFromParticle(i.matrix,i.particle):i.particle=void 0,this.subParticleSystem.system.emit(t,i,i.matrix)}}toJSON(){return{type:this.type,subParticleSystem:this.subParticleSystem?this.subParticleSystem.uuid:"",useVelocityAsBasis:this.useVelocityAsBasis,mode:this.mode,emitProbability:this.emitProbability}}static fromJSON(t,e){return new n(e,t.useVelocityAsBasis,t.subParticleSystem,t.mode,t.emitProbability)}clone(){return new n(this.particleSystem,this.useVelocityAsBasis,this.subParticleSystem,this.mode,this.emitProbability)}reset(){}setMatrixFromParticle(t,e){let i;if(e.rotation===void 0||this.useVelocityAsBasis)if(e.velocity.x===0&&e.velocity.y===0&&(e.velocity.z===1||e.velocity.z===0))t.set(1,0,0,e.position.x,0,1,0,e.position.y,0,0,1,e.position.z,0,0,0,1);else{this.v_.copy(ro).cross(e.velocity),this.v2_.copy(e.velocity).cross(this.v_);let s=this.v_.length(),r=this.v2_.length();t.set(this.v_.x/s,this.v2_.x/r,e.velocity.x,e.position.x,this.v_.y/s,this.v2_.y/r,e.velocity.y,e.position.y,this.v_.z/s,this.v2_.z/r,e.velocity.z,e.position.z,0,0,0,1)}else e.rotation instanceof G?i=e.rotation:(this.q_.setFromAxisAngle(ro,e.rotation),i=this.q_),t.compose(e.position,i,Ra);this.particleSystem.worldSpace||t.multiplyMatrices(this.particleSystem.emitter.matrixWorld,t)}},Aa=.5*(Math.sqrt(3)-1),Mi=(3-Math.sqrt(3))/6,Ca=1/3,Yt=1/6,Oa=(Math.sqrt(5)-1)/4,gt=(5-Math.sqrt(5))/20,ft=new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]),ht=new Float32Array([0,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,1,0,1,1,1,0,1,-1,1,0,-1,1,1,0,-1,-1,-1,0,1,1,-1,0,1,-1,-1,0,-1,1,-1,0,-1,-1,1,1,0,1,1,1,0,-1,1,-1,0,1,1,-1,0,-1,-1,1,0,1,-1,1,0,-1,-1,-1,0,1,-1,-1,0,-1,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,0]),xs=class{constructor(t=Math.random){let e=typeof t=="function"?t:ka(t);this.p=Na(e),this.perm=new Uint8Array(512),this.permMod12=new Uint8Array(512);for(let i=0;i<512;i++)this.perm[i]=this.p[i&255],this.permMod12[i]=this.perm[i]%12}noise2D(t,e){let i=this.permMod12,s=this.perm,r=0,o=0,l=0,a=(t+e)*Aa,h=Math.floor(t+a),c=Math.floor(e+a),u=(h+c)*Mi,d=h-u,f=c-u,m=t-d,p=e-f,g,y;m>p?(g=1,y=0):(g=0,y=1);let S=m-g+Mi,w=p-y+Mi,b=m-1+2*Mi,x=p-1+2*Mi,v=h&255,M=c&255,E=.5-m*m-p*p;if(E>=0){let C=i[v+s[M]]*3;E*=E,r=E*E*(ft[C]*m+ft[C+1]*p)}let z=.5-S*S-w*w;if(z>=0){let C=i[v+g+s[M+y]]*3;z*=z,o=z*z*(ft[C]*S+ft[C+1]*w)}let P=.5-b*b-x*x;if(P>=0){let C=i[v+1+s[M+1]]*3;P*=P,l=P*P*(ft[C]*b+ft[C+1]*x)}return 70*(r+o+l)}noise3D(t,e,i){let s=this.permMod12,r=this.perm,o,l,a,h,c=(t+e+i)*Ca,u=Math.floor(t+c),d=Math.floor(e+c),f=Math.floor(i+c),m=(u+d+f)*Yt,p=u-m,g=d-m,y=f-m,S=t-p,w=e-g,b=i-y,x,v,M,E,z,P;S>=w?w>=b?(x=1,v=0,M=0,E=1,z=1,P=0):S>=b?(x=1,v=0,M=0,E=1,z=0,P=1):(x=0,v=0,M=1,E=1,z=0,P=1):w<b?(x=0,v=0,M=1,E=0,z=1,P=1):S<b?(x=0,v=1,M=0,E=0,z=1,P=1):(x=0,v=1,M=0,E=1,z=1,P=0);let C=S-x+Yt,O=w-v+Yt,H=b-M+Yt,X=S-E+2*Yt,W=w-z+2*Yt,Z=b-P+2*Yt,tt=S-1+3*Yt,it=w-1+3*Yt,I=b-1+3*Yt,j=u&255,st=d&255,nt=f&255,ct=.6-S*S-w*w-b*b;if(ct<0)o=0;else{let V=s[j+r[st+r[nt]]]*3;ct*=ct,o=ct*ct*(ft[V]*S+ft[V+1]*w+ft[V+2]*b)}let yt=.6-C*C-O*O-H*H;if(yt<0)l=0;else{let V=s[j+x+r[st+v+r[nt+M]]]*3;yt*=yt,l=yt*yt*(ft[V]*C+ft[V+1]*O+ft[V+2]*H)}let vt=.6-X*X-W*W-Z*Z;if(vt<0)a=0;else{let V=s[j+E+r[st+z+r[nt+P]]]*3;vt*=vt,a=vt*vt*(ft[V]*X+ft[V+1]*W+ft[V+2]*Z)}let mt=.6-tt*tt-it*it-I*I;if(mt<0)h=0;else{let V=s[j+1+r[st+1+r[nt+1]]]*3;mt*=mt,h=mt*mt*(ft[V]*tt+ft[V+1]*it+ft[V+2]*I)}return 32*(o+l+a+h)}noise4D(t,e,i,s){let r=this.perm,o,l,a,h,c,u=(t+e+i+s)*Oa,d=Math.floor(t+u),f=Math.floor(e+u),m=Math.floor(i+u),p=Math.floor(s+u),g=(d+f+m+p)*gt,y=d-g,S=f-g,w=m-g,b=p-g,x=t-y,v=e-S,M=i-w,E=s-b,z=0,P=0,C=0,O=0;x>v?z++:P++,x>M?z++:C++,x>E?z++:O++,v>M?P++:C++,v>E?P++:O++,M>E?C++:O++;let H=z>=3?1:0,X=P>=3?1:0,W=C>=3?1:0,Z=O>=3?1:0,tt=z>=2?1:0,it=P>=2?1:0,I=C>=2?1:0,j=O>=2?1:0,st=z>=1?1:0,nt=P>=1?1:0,ct=C>=1?1:0,yt=O>=1?1:0,vt=x-H+gt,mt=v-X+gt,V=M-W+gt,ot=E-Z+gt,_=x-tt+2*gt,N=v-it+2*gt,L=M-I+2*gt,bt=E-j+2*gt,Rt=x-st+3*gt,Dt=v-nt+3*gt,Ee=M-ct+3*gt,Te=E-yt+3*gt,ze=x-1+4*gt,Pe=v-1+4*gt,Re=M-1+4*gt,Ae=E-1+4*gt,ie=d&255,se=f&255,re=m&255,ne=p&255,oe=.6-x*x-v*v-M*M-E*E;if(oe<0)o=0;else{let q=r[ie+r[se+r[re+r[ne]]]]%32*4;oe*=oe,o=oe*oe*(ht[q]*x+ht[q+1]*v+ht[q+2]*M+ht[q+3]*E)}let ae=.6-vt*vt-mt*mt-V*V-ot*ot;if(ae<0)l=0;else{let q=r[ie+H+r[se+X+r[re+W+r[ne+Z]]]]%32*4;ae*=ae,l=ae*ae*(ht[q]*vt+ht[q+1]*mt+ht[q+2]*V+ht[q+3]*ot)}let le=.6-_*_-N*N-L*L-bt*bt;if(le<0)a=0;else{let q=r[ie+tt+r[se+it+r[re+I+r[ne+j]]]]%32*4;le*=le,a=le*le*(ht[q]*_+ht[q+1]*N+ht[q+2]*L+ht[q+3]*bt)}let Bt=.6-Rt*Rt-Dt*Dt-Ee*Ee-Te*Te;if(Bt<0)h=0;else{let q=r[ie+st+r[se+nt+r[re+ct+r[ne+yt]]]]%32*4;Bt*=Bt,h=Bt*Bt*(ht[q]*Rt+ht[q+1]*Dt+ht[q+2]*Ee+ht[q+3]*Te)}let It=.6-ze*ze-Pe*Pe-Re*Re-Ae*Ae;if(It<0)c=0;else{let q=r[ie+1+r[se+1+r[re+1+r[ne+1]]]]%32*4;It*=It,c=It*It*(ht[q]*ze+ht[q+1]*Pe+ht[q+2]*Re+ht[q+3]*Ae)}return 27*(o+l+a+h+c)}};function Na(n){let t=new Uint8Array(256);for(let e=0;e<256;e++)t[e]=e;for(let e=0;e<255;e++){let i=e+~~(n()*(256-e)),s=t[e];t[e]=t[i],t[i]=s}return t}function ka(n){let t=0,e=0,i=0,s=1,r=Da();return t=r(" "),e=r(" "),i=r(" "),t-=r(n),t<0&&(t+=1),e-=r(n),e<0&&(e+=1),i-=r(n),i<0&&(i+=1),function(){let o=2091639*t+s*23283064365386963e-26;return t=e,e=i,i=o-(s=o|0)}}function Da(){let n=4022871197;return function(t){t=t.toString();for(let e=0;e<t.length;e++){n+=t.charCodeAt(e);let i=.02519603282416938*n;n=i>>>0,i-=n,i*=n,n=i>>>0,i-=n,n+=i*4294967296}return(n>>>0)*23283064365386963e-26}}var ws=class n{constructor(t,e,i,s){this.scale=t,this.octaves=e,this.velocityMultiplier=i,this.timeScale=s,this.type="TurbulenceField",this.generator=new xs,this.timeOffset=new R,this.temp=new R,this.temp2=new R,this.timeOffset.x=Math.random()/this.scale.x*this.timeScale.x,this.timeOffset.y=Math.random()/this.scale.y*this.timeScale.y,this.timeOffset.z=Math.random()/this.scale.z*this.timeScale.z}initialize(t){}update(t,e){let i=t.position.x/this.scale.x,s=t.position.y/this.scale.y,r=t.position.z/this.scale.z;this.temp.set(0,0,0);let o=1;for(let l=0;l<this.octaves;l++)this.temp2.set(this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.x*o)/o,this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.y*o)/o,this.generator.noise4D(i*o,s*o,r*o,this.timeOffset.z*o)/o),this.temp.add(this.temp2),o*=2;this.temp.multiply(this.velocityMultiplier),t.velocity.addScaledVector(this.temp,e)}toJSON(){return{type:this.type,scale:[this.scale.x,this.scale.y,this.scale.z],octaves:this.octaves,velocityMultiplier:[this.velocityMultiplier.x,this.velocityMultiplier.y,this.velocityMultiplier.z],timeScale:[this.timeScale.x,this.timeScale.y,this.timeScale.z]}}frameUpdate(t){this.timeOffset.x+=t*this.timeScale.x,this.timeOffset.y+=t*this.timeScale.y,this.timeOffset.z+=t*this.timeScale.z}static fromJSON(t){return new n(new R(t.scale[0],t.scale[1],t.scale[2]),t.octaves,new R(t.velocityMultiplier[0],t.velocityMultiplier[1],t.velocityMultiplier[2]),new R(t.timeScale[0],t.timeScale[1],t.timeScale[2]))}clone(){return new n(this.scale.clone(),this.octaves,this.velocityMultiplier.clone(),this.timeScale.clone())}reset(){}},Xt=[],yr=new R,vr=new G,Ms=class n{constructor(t,e,i=new B(1),s=new B(0)){if(this.frequency=t,this.power=e,this.positionAmount=i,this.rotationAmount=s,this.type="Noise",this.duration=0,Xt.length===0)for(let r=0;r<100;r++)Xt.push(new xs)}initialize(t){t.lastPosNoise=new R,typeof t.rotation=="number"?t.lastRotNoise=0:t.lastRotNoise=new G,t.generatorIndex=[es(0,100),es(0,100),es(0,100),es(0,100)],this.positionAmount.startGen(t.memory),this.rotationAmount.startGen(t.memory),this.frequency.startGen(t.memory),this.power.startGen(t.memory)}update(t,e){let i=this.frequency.genValue(t.memory,t.age/t.life),s=this.power.genValue(t.memory,t.age/t.life),r=this.positionAmount.genValue(t.memory,t.age/t.life),o=this.rotationAmount.genValue(t.memory,t.age/t.life);r>0&&t.lastPosNoise!==void 0&&(t.position.sub(t.lastPosNoise),yr.set(Xt[t.generatorIndex[0]].noise2D(0,t.age*i)*s*r,Xt[t.generatorIndex[1]].noise2D(0,t.age*i)*s*r,Xt[t.generatorIndex[2]].noise2D(0,t.age*i)*s*r),t.position.add(yr),t.lastPosNoise.copy(yr)),o>0&&t.lastRotNoise!==void 0&&(typeof t.rotation=="number"?(t.rotation-=t.lastRotNoise,t.rotation+=Xt[t.generatorIndex[3]].noise2D(0,t.age*i)*Math.PI*s*o):(t.lastRotNoise.invert(),t.rotation.multiply(t.lastRotNoise),vr.set(Xt[t.generatorIndex[0]].noise2D(0,t.age*i)*s*o,Xt[t.generatorIndex[1]].noise2D(0,t.age*i)*s*o,Xt[t.generatorIndex[2]].noise2D(0,t.age*i)*s*o,Xt[t.generatorIndex[3]].noise2D(0,t.age*i)*s*o).normalize(),t.rotation.multiply(vr),t.lastRotNoise.copy(vr)))}toJSON(){return{type:this.type,frequency:this.frequency.toJSON(),power:this.power.toJSON(),positionAmount:this.positionAmount.toJSON(),rotationAmount:this.rotationAmount.toJSON()}}frameUpdate(t){this.duration+=t}static fromJSON(t){return new n(U(t.frequency),U(t.power),U(t.positionAmount),U(t.rotationAmount))}clone(){return new n(this.frequency.clone(),this.power.clone(),this.positionAmount.clone(),this.rotationAmount.clone())}reset(){}},Ss=class n{constructor(t=0,e=0,i=new R){this.scaleX=t,this.scaleY=e,this.position=i,this.locations=[]}transform(t,e){t.x=this.locations[e%this.locations.length].x*this.scaleX+this.position.x,t.y=this.locations[e%this.locations.length].y*this.scaleY+this.position.y,t.z=this.position.z}static fromJSON(t){let e=new n(t.scaleX,t.scaleY,new R(t.position[0],t.position[1],t.position[2]));return e.locations=t.locations.map(i=>new fe(i.x,i.y)),e}clone(){let t=new n(this.scaleX,this.scaleY,this.position.clone());return t.locations=this.locations.map(e=>e.clone()),t}toJSON(){return{scaleX:this.scaleX,scaleY:this.scaleY,position:this.position,locations:this.locations.map(t=>({x:t.x,y:t.y}))}}fromImage(t,e){let i=document.createElement("canvas");i.width=t.width,i.height=t.height;let s=i.getContext("2d");if(!s)return;s.drawImage(t,0,0);let r=s.getImageData(0,0,i.width,i.height,{colorSpace:"srgb"});i.remove(),this.locations.length=0;for(let o=0;o<r.height;o++)for(let l=0;l<r.width;l++)r.data[(o*r.width+l)*4+3]>e&&this.locations.push(new fe(l,r.height-o))}};function Ua(n){return n.type==="TextureSequencer"?Ss.fromJSON(n):new Ss}var Tr=class n{constructor(t){this.type="ApplySequences",this.sequencers=[],this.time=0,this.index=0,this.pCount=0,this.tempV=new R,this.delay=t}initialize(t){t.id=this.pCount,t.dst=new R,t.begin=new R,t.inMotion=!1,this.pCount++}reset(){this.time=0,this.index=0,this.pCount=0}update(t,e){let i=this.sequencers[this.index],s=t.id*this.delay;this.time>=i[0].a+s&&this.time<=i[0].b+s?(t.inMotion||(t.inMotion=!0,t.begin.copy(t.position),i[1].transform(t.dst,t.id)),t.position.lerpVectors(t.begin,t.dst,n.BEZIER.genValue((this.time-i[0].a-s)/(i[0].b-i[0].a)))):this.time>i[0].b+s&&(t.inMotion=!1)}frameUpdate(t){for(;this.index+1<this.sequencers.length&&this.time>=this.sequencers[this.index+1][0].a;)this.index++;this.time+=t}appendSequencer(t,e){this.sequencers.push([t,e])}toJSON(){return{type:this.type,delay:this.delay,sequencers:this.sequencers.map(([t,e])=>({range:t.toJSON(),sequencer:e.toJSON()}))}}static fromJSON(t){let e=new n(t.delay);return t.sequencers.forEach(i=>{e.sequencers.push([U(i.range),Ua(i.sequencer)])}),e}clone(){let t=new n(this.delay);return t.sequencers=this.sequencers.map(e=>[e[0].clone(),e[1].clone()]),t}};Tr.BEZIER=new Be(0,0,1,1);var bs=class n{constructor(t,e){this.color=t,this.speedRange=e,this.type="ColorBySpeed"}initialize(t){this.color.startGen(t.memory)}update(t,e){let i=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);this.color.genColor(t.memory,t.color,i),t.color.x*=t.startColor.x,t.color.y*=t.startColor.y,t.color.z*=t.startColor.z,t.color.w*=t.startColor.w}frameUpdate(t){}toJSON(){return{type:this.type,color:this.color.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(Ps(t.color),Q.fromJSON(t.speedRange))}clone(){return new n(this.color.clone(),this.speedRange.clone())}reset(){}},_s=class n{initialize(t){this.size.startGen(t.memory)}constructor(t,e){this.size=t,this.speedRange=e,this.type="SizeBySpeed"}update(t){let e=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);this.size instanceof $e?this.size.genValue(t.memory,t.size,e).multiply(t.startSize):t.size.copy(t.startSize).multiplyScalar(this.size.genValue(t.memory,e))}toJSON(){return{type:this.type,size:this.size.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(zi(t.size),Q.fromJSON(t.speedRange))}frameUpdate(t){}clone(){return new n(this.size.clone(),this.speedRange.clone())}reset(){}},Es=class n{constructor(t,e){this.angularVelocity=t,this.speedRange=e,this.type="RotationBySpeed",this.tempQuat=new G}initialize(t){typeof t.rotation=="number"&&this.angularVelocity.startGen(t.memory)}update(t,e){if(typeof t.rotation=="number"){let i=(t.startSpeed-this.speedRange.a)/(this.speedRange.b-this.speedRange.a);t.rotation+=e*this.angularVelocity.genValue(t.memory,i)}}toJSON(){return{type:this.type,angularVelocity:this.angularVelocity.toJSON(),speedRange:this.speedRange.toJSON()}}static fromJSON(t){return new n(U(t.angularVelocity),Q.fromJSON(t.speedRange))}frameUpdate(t){}clone(){return new n(this.angularVelocity.clone(),this.speedRange.clone())}reset(){}},Ts=class n{initialize(t){this.speed.startGen(t.memory)}constructor(t,e){this.speed=t,this.dampen=e,this.type="LimitSpeedOverLife"}update(t,e){let i=t.velocity.length(),s=this.speed.genValue(t.memory,t.age/t.life);if(i>s){let r=(i-s)/i;t.velocity.multiplyScalar(1-r*this.dampen*e*20)}}toJSON(){return{type:this.type,speed:this.speed.toJSON(),dampen:this.dampen}}static fromJSON(t){return new n(U(t.speed),t.dampen)}frameUpdate(t){}clone(){return new n(this.speed.clone(),this.dampen)}reset(){}},zs={ApplyForce:{type:"ApplyForce",constructor:we,params:[["direction",["vec3"]],["magnitude",["value"]]],loadJSON:we.fromJSON},Noise:{type:"Noise",constructor:Ms,params:[["frequency",["value"]],["power",["value"]],["positionAmount",["value"]],["rotationAmount",["value"]]],loadJSON:Ms.fromJSON},TurbulenceField:{type:"TurbulenceField",constructor:ws,params:[["scale",["vec3"]],["octaves",["number"]],["velocityMultiplier",["vec3"]],["timeScale",["vec3"]]],loadJSON:ws.fromJSON},GravityForce:{type:"GravityForce",constructor:ys,params:[["center",["vec3"]],["magnitude",["number"]]],loadJSON:ys.fromJSON},ColorOverLife:{type:"ColorOverLife",constructor:$t,params:[["color",["colorFunc"]]],loadJSON:$t.fromJSON},RotationOverLife:{type:"RotationOverLife",constructor:hs,params:[["angularVelocity",["value","valueFunc"]]],loadJSON:hs.fromJSON},Rotation3DOverLife:{type:"Rotation3DOverLife",constructor:cs,params:[["angularVelocity",["rotationFunc"]]],loadJSON:cs.fromJSON},SizeOverLife:{type:"SizeOverLife",constructor:me,params:[["size",["value","valueFunc","vec3Func"]]],loadJSON:me.fromJSON},ColorBySpeed:{type:"ColorBySpeed",constructor:bs,params:[["color",["colorFunc"]],["speedRange",["range"]]],loadJSON:bs.fromJSON},RotationBySpeed:{type:"RotationBySpeed",constructor:Es,params:[["angularVelocity",["value","valueFunc"]],["speedRange",["range"]]],loadJSON:Es.fromJSON},SizeBySpeed:{type:"SizeBySpeed",constructor:_s,params:[["size",["value","valueFunc","vec3Func"]],["speedRange",["range"]]],loadJSON:_s.fromJSON},SpeedOverLife:{type:"SpeedOverLife",constructor:ds,params:[["speed",["value","valueFunc"]]],loadJSON:ds.fromJSON},FrameOverLife:{type:"FrameOverLife",constructor:fs,params:[["frame",["value","valueFunc"]]],loadJSON:fs.fromJSON},ForceOverLife:{type:"ForceOverLife",constructor:us,params:[["x",["value","valueFunc"]],["y",["value","valueFunc"]],["z",["value","valueFunc"]]],loadJSON:us.fromJSON},OrbitOverLife:{type:"OrbitOverLife",constructor:ms,params:[["orbitSpeed",["value","valueFunc"]],["axis",["vec3"]]],loadJSON:ms.fromJSON},WidthOverLength:{type:"WidthOverLength",constructor:gs,params:[["width",["value","valueFunc"]]],loadJSON:gs.fromJSON},ChangeEmitDirection:{type:"ChangeEmitDirection",constructor:vs,params:[["angle",["value"]]],loadJSON:vs.fromJSON},EmitSubParticleSystem:{type:"EmitSubParticleSystem",constructor:Ti,params:[["particleSystem",["self"]],["useVelocityAsBasis",["boolean"]],["subParticleSystem",["particleSystem"]],["mode",["number"]],["emitProbability",["number"]]],loadJSON:Ti.fromJSON},LimitSpeedOverLife:{type:"LimitSpeedOverLife",constructor:Ts,params:[["speed",["value","valueFunc"]],["dampen",["number"]]],loadJSON:Ts.fromJSON}};function uo(n,t){return zs[n.type]?zs[n.type].loadJSON(n,t):null}var Ba=[];function fo(n){if(!Ba.find(e=>e.id===n.id)){n.initialize();for(let e of n.emitterShapes)br[e.type]||(br[e.type]=e);for(let e of n.behaviors)zs[e.type]||(zs[e.type]=e)}}var As=class n{get geometry(){return this._geometry}set geometry(t){if(this._geometry=t,t===void 0||typeof t=="string")return;let e=new hn;this._triangleIndexToArea.length=0;let i=0;if(!t.getIndex())return;let s=t.getIndex().array,r=s.length/3;this._triangleIndexToArea.push(0);for(let o=0;o<r;o++)e.setFromAttributeAndIndices(t.getAttribute("position"),s[o*3],s[o*3+1],s[o*3+2]),i+=e.getArea(),this._triangleIndexToArea.push(i);t.userData.triangleIndexToArea=this._triangleIndexToArea}constructor(t){this.type="mesh_surface",this._triangleIndexToArea=[],this._tempA=new T,this._tempB=new T,this._tempC=new T,t&&(this.geometry=t)}initialize(t){let e=this._geometry;if(!e||e.getIndex()===null){t.position.set(0,0,0),t.velocity.set(0,0,1).multiplyScalar(t.startSpeed);return}let i=this._triangleIndexToArea.length-1,s=0,r=i,o=Math.random()*this._triangleIndexToArea[i];for(;s+1<r;){let f=Math.floor((s+r)/2);o<this._triangleIndexToArea[f]?r=f:s=f}let l=Math.random(),a=Math.random();l+a>1&&(l=1-l,a=1-a);let h=e.getIndex().array[s*3],c=e.getIndex().array[s*3+1],u=e.getIndex().array[s*3+2],d=e.getAttribute("position");this._tempA.fromBufferAttribute(d,h),this._tempB.fromBufferAttribute(d,c),this._tempC.fromBufferAttribute(d,u),this._tempB.sub(this._tempA),this._tempC.sub(this._tempA),this._tempA.addScaledVector(this._tempB,l).addScaledVector(this._tempC,a),t.position.copy(this._tempA),this._tempA.copy(this._tempB).cross(this._tempC).normalize(),t.velocity.copy(this._tempA).normalize().multiplyScalar(t.startSpeed)}toJSON(){return{type:"mesh_surface",mesh:this._geometry?this._geometry.uuid:""}}static fromJSON(t,e){return new n(e.geometries[t.geometry])}clone(){return new n(this._geometry)}update(t,e){}},Ia={id:"three.quarks",initialize:()=>{},emitterShapes:[{type:"mesh_surface",params:[["geometry",["geometry"]]],constructor:As,loadJSON:As.fromJSON}],behaviors:[]},Fa=`
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
`,La=`
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
`,Ha=`
#ifdef SOFT_PARTICLES
    varying vec4 projPosition;
    varying float linearDepth;
#endif
`,Va=`
#ifdef SOFT_PARTICLES
    projPosition = gl_Position;
    linearDepth = -mvPosition.z;
#endif
`,Ga=`
#ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv);
    #ifdef TILE_BLEND
        texelColor = mix( texelColor, texture2D( map, vUvNext ), vUvBlend );
    #endif
    diffuseColor *= texelColor;
#endif
`,Ja=`
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
`,qa=`
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
`,Wa=`
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

`,Me=Sn;function Ya(){Me.tile_pars_vertex=qa,Me.tile_vertex=Wa,Me.tile_pars_fragment=Ja,Me.tile_fragment=Ga,Me.soft_pars_vertex=Ha,Me.soft_vertex=Va,Me.soft_pars_fragment=La,Me.soft_fragment=Fa}var Rr=class extends He{constructor(t){super(),this.type="ParticleEmitter",this.system=t}clone(){let t=this.system.clone();return t.emitter.copy(this,!0),t.emitter}dispose(){}extractFromCache(t){let e=[];for(let i in t){let s=t[i];delete s.metadata,e.push(s)}return e}toJSON(t,e={}){let i=this.children;this.children=this.children.filter(r=>r.type!=="ParticleSystemPreview");let s=super.toJSON(t);return this.children=i,this.system!==null&&(s.object.ps=this.system.toJSON(t,e)),s}},A;(function(n){n[n.BillBoard=0]="BillBoard",n[n.StretchedBillBoard=1]="StretchedBillBoard",n[n.Mesh=2]="Mesh",n[n.Trail=3]="Trail",n[n.HorizontalBillBoard=4]="HorizontalBillBoard",n[n.VerticalBillBoard=5]="VerticalBillBoard"})(A||(A={}));var Cs=class extends at{constructor(t){super(),this.type="VFXBatch",this.maxParticles=1e3,this.systems=new Set;let e=new gi;e.mask=t.layers.mask;let i=t.material.clone();i.defines={},Object.assign(i.defines,t.material.defines),this.settings={instancingGeometry:t.instancingGeometry,renderMode:t.renderMode,renderOrder:t.renderOrder,material:i,uTileCount:t.uTileCount,vTileCount:t.vTileCount,blendTiles:t.blendTiles,softParticles:t.softParticles,softNearFade:t.softNearFade,softFarFade:t.softFarFade,layers:e},this.frustumCulled=!1,this.renderOrder=this.settings.renderOrder}addSystem(t){this.systems.add(t)}removeSystem(t){this.systems.delete(t)}applyDepthTexture(t){let e=this.material.uniforms.depthTexture;e&&e.value!==t&&(e.value=t,this.material.needsUpdate=!0)}getVisibleSystems(){return Array.from(this.systems).filter(t=>t.emitter.visible)}},Xa=new R(0,0,1),zr=new G,Za=new R,ja=new R;new R;var mo=60,Rs=new ce(1,1,1,1),Se=class n{set time(t){this.emissionState.time=t}get time(){return this.emissionState.time}get layers(){return this.rendererSettings.layers}get texture(){return this.rendererSettings.material.map}set texture(t){this.rendererSettings.material.map=t,this.neededToUpdateRender=!0}get material(){return this.rendererSettings.material}set material(t){this.rendererSettings.material=t,this.neededToUpdateRender=!0}get uTileCount(){return this.rendererSettings.uTileCount}set uTileCount(t){this.rendererSettings.uTileCount=t,this.neededToUpdateRender=!0}get vTileCount(){return this.rendererSettings.vTileCount}set vTileCount(t){this.rendererSettings.vTileCount=t,this.neededToUpdateRender=!0}get blendTiles(){return this.rendererSettings.blendTiles}set blendTiles(t){this.rendererSettings.blendTiles=t,this.neededToUpdateRender=!0}get softParticles(){return this.rendererSettings.softParticles}set softParticles(t){this.rendererSettings.softParticles=t,this.neededToUpdateRender=!0}get softNearFade(){return this.rendererSettings.softNearFade}set softNearFade(t){this.rendererSettings.softNearFade=t,this.neededToUpdateRender=!0}get softFarFade(){return this.rendererSettings.softFarFade}set softFarFade(t){this.rendererSettings.softFarFade=t,this.neededToUpdateRender=!0}get instancingGeometry(){return this.rendererSettings.instancingGeometry}set instancingGeometry(t){this.restart(),this.particles.length=0,this.rendererSettings.instancingGeometry=t,this.neededToUpdateRender=!0}get renderMode(){return this.rendererSettings.renderMode}set renderMode(t){if(this.rendererSettings.renderMode!==t){let e=!1;switch(this.rendererSettings.renderMode===A.Trail&&(e=!0),this.rendererSettings.renderMode===A.Mesh&&(this.startRotation=new B(0)),t){case A.Trail:this.rendererEmitterSettings={startLength:new B(30),followLocalOrigin:!1},e=!0;break;case A.Mesh:this.rendererEmitterSettings={geometry:Rs},this.startRotation=new Ei(new R(0,1,0),new B(0));break;case A.StretchedBillBoard:this.rendererEmitterSettings={speedFactor:0,lengthFactor:2},this.rendererSettings.instancingGeometry=Rs;break;case A.BillBoard:case A.VerticalBillBoard:case A.HorizontalBillBoard:this.rendererEmitterSettings={},this.rendererSettings.instancingGeometry=Rs;break}this.rendererSettings.renderMode=t,e&&(this.restart(),this.particles.length=0),this.neededToUpdateRender=!0}}get renderOrder(){return this.rendererSettings.renderOrder}set renderOrder(t){this.rendererSettings.renderOrder=t,this.neededToUpdateRender=!0}get blending(){return this.rendererSettings.material.blending}set blending(t){this.rendererSettings.material.blending=t,this.neededToUpdateRender=!0}constructor(t){if(this.temp=new R,this.travelDistance=0,this.normalMatrix=new Qt,this.memory=[],this.listeners={},this.firstTimeUpdate=!0,this.autoDestroy=t.autoDestroy===void 0?!1:t.autoDestroy,this.duration=t.duration??1,this.looping=t.looping===void 0?!0:t.looping,this.prewarm=t.prewarm===void 0?!1:t.prewarm,this.startLife=t.startLife??new B(5),this.startSpeed=t.startSpeed??new B(0),this.startRotation=t.startRotation??new B(0),this.startSize=t.startSize??new B(1),this.startColor=t.startColor??new Qe(new $(1,1,1,1)),this.emissionOverTime=t.emissionOverTime??new B(10),this.emissionOverDistance=t.emissionOverDistance??new B(0),this.emissionBursts=t.emissionBursts??[],this.onlyUsedByOther=t.onlyUsedByOther??!1,this.emitterShape=t.shape??new Kt,this.behaviors=t.behaviors??new Array,this.worldSpace=t.worldSpace??!1,this.rendererEmitterSettings=t.rendererEmitterSettings??{},t.renderMode===A.StretchedBillBoard){let e=this.rendererEmitterSettings;t.speedFactor!==void 0&&(e.speedFactor=t.speedFactor),e.speedFactor=e.speedFactor??0,e.lengthFactor=e.lengthFactor??0}this.rendererSettings={instancingGeometry:t.instancingGeometry??Rs,renderMode:t.renderMode??A.BillBoard,renderOrder:t.renderOrder??0,material:t.material,uTileCount:t.uTileCount??1,vTileCount:t.vTileCount??1,blendTiles:t.blendTiles??!1,softParticles:t.softParticles??!1,softNearFade:t.softNearFade??0,softFarFade:t.softFarFade??0,layers:t.layers??new gi},this.neededToUpdateRender=!0,this.particles=new Array,this.startTileIndex=t.startTileIndex||new B(0),this.emitter=new Rr(this),this.paused=!1,this.particleNum=0,this.emissionState={isBursting:!1,burstParticleIndex:0,burstParticleCount:0,burstIndex:0,burstWaveIndex:0,time:0,waitEmiting:0,travelDistance:0},this.emissionBursts.forEach(e=>e.count.startGen(this.memory)),this.emissionOverDistance.startGen(this.memory),this.emitEnded=!1,this.markForDestroy=!1,this.prewarmed=!1}pause(){this.paused=!0}play(){this.paused=!1}stop(){this.restart(),this.pause()}spawn(t,e,i){zr.setFromRotationMatrix(i);let s=Za,r=zr,o=ja;i.decompose(s,r,o);for(let l=0;l<t;l++){for(e.burstParticleIndex=l,this.particleNum++;this.particles.length<this.particleNum;)this.rendererSettings.renderMode===A.Trail?this.particles.push(new ii):this.particles.push(new ps);let a=this.particles[this.particleNum-1];if(a.reset(),a.speedModifier=1,this.startColor.startGen(a.memory),this.startColor.genColor(a.memory,a.startColor,this.emissionState.time),a.color.copy(a.startColor),this.startSpeed.startGen(a.memory),a.startSpeed=this.startSpeed.genValue(a.memory,e.time/this.duration),this.startLife.startGen(a.memory),a.life=this.startLife.genValue(a.memory,e.time/this.duration),a.age=0,this.startSize.startGen(a.memory),this.startSize.type==="vec3function")this.startSize.genValue(a.memory,a.startSize,e.time/this.duration);else{let h=this.startSize.genValue(a.memory,e.time/this.duration);a.startSize.set(h,h,h)}if(this.startTileIndex.startGen(a.memory),a.uvTile=this.startTileIndex.genValue(a.memory),a.size.copy(a.startSize),this.rendererSettings.renderMode===A.Mesh||this.rendererSettings.renderMode===A.BillBoard||this.rendererSettings.renderMode===A.VerticalBillBoard||this.rendererSettings.renderMode===A.HorizontalBillBoard||this.rendererSettings.renderMode===A.StretchedBillBoard){let h=a;this.startRotation.startGen(a.memory),this.rendererSettings.renderMode===A.Mesh?(h.rotation instanceof G||(h.rotation=new G),this.startRotation.type==="rotation"?this.startRotation.genValue(a.memory,h.rotation,1,e.time/this.duration):h.rotation.setFromAxisAngle(Xa,this.startRotation.genValue(h.memory,e.time/this.duration))):this.startRotation.type==="rotation"?h.rotation=0:h.rotation=this.startRotation.genValue(h.memory,e.time/this.duration)}else if(this.rendererSettings.renderMode===A.Trail){let h=a;this.rendererEmitterSettings.startLength.startGen(h.memory),h.length=this.rendererEmitterSettings.startLength.genValue(h.memory,e.time/this.duration)}if(this.emitterShape.initialize(a,e),this.rendererSettings.renderMode===A.Trail&&this.rendererEmitterSettings.followLocalOrigin){let h=a;h.localPosition=new R().copy(h.position)}this.worldSpace?(a.position.applyMatrix4(i),a.startSize.multiply(o).abs(),a.size.copy(a.startSize),a.velocity.multiply(o).applyMatrix3(this.normalMatrix),a.rotation&&a.rotation instanceof G&&a.rotation.multiplyQuaternions(zr,a.rotation)):this.onlyUsedByOther&&(a.parentMatrix=i);for(let h=0;h<this.behaviors.length;h++)this.behaviors[h].initialize(a,this)}}endEmit(){this.emitEnded=!0,this.autoDestroy&&(this.markForDestroy=!0),this.fire({type:"emitEnd",particleSystem:this})}dispose(){this._renderer&&this._renderer.deleteSystem(this),this.emitter.dispose(),this.emitter.parent&&this.emitter.parent.remove(this.emitter),this.fire({type:"destroy",particleSystem:this})}restart(){this.memory.length=0,this.paused=!1,this.particleNum=0,this.emissionState.isBursting=!1,this.emissionState.burstIndex=0,this.emissionState.burstWaveIndex=0,this.emissionState.time=0,this.emissionState.waitEmiting=0,this.behaviors.forEach(t=>{t.reset()}),this.emitEnded=!1,this.markForDestroy=!1,this.prewarmed=!1,this.emissionBursts.forEach(t=>t.count.startGen(this.memory)),this.emissionOverDistance.startGen(this.memory)}update(t){if(this.paused)return;let e=this.emitter;for(;e.parent;)e=e.parent;if(e.type!=="Scene"){this.dispose();return}if(this.firstTimeUpdate&&(this.firstTimeUpdate=!1,this.emitter.updateWorldMatrix(!0,!1)),this.emitEnded&&this.particleNum===0){this.markForDestroy&&this.emitter.parent&&this.dispose();return}if(this.looping&&this.prewarm&&!this.prewarmed){this.prewarmed=!0;for(let i=0;i<this.duration*mo;i++)this.update(1/mo)}t>.1&&(t=.1),this.neededToUpdateRender&&(this._renderer&&this._renderer.updateSystem(this),this.neededToUpdateRender=!1),this.onlyUsedByOther||this.emit(t,this.emissionState,this.emitter.matrixWorld),this.emitterShape.update(this,t);for(let i=0;i<this.behaviors.length;i++){this.behaviors[i].frameUpdate(t);for(let s=0;s<this.particleNum;s++)this.particles[s].died||this.behaviors[i].update(this.particles[s],t)}for(let i=0;i<this.particleNum;i++)this.rendererEmitterSettings.followLocalOrigin&&this.particles[i].localPosition?(this.particles[i].position.copy(this.particles[i].localPosition),this.particles[i].parentMatrix?this.particles[i].position.applyMatrix4(this.particles[i].parentMatrix):this.particles[i].position.applyMatrix4(this.emitter.matrixWorld)):this.particles[i].position.addScaledVector(this.particles[i].velocity,t*this.particles[i].speedModifier),this.particles[i].age+=t;if(this.rendererSettings.renderMode===A.Trail)for(let i=0;i<this.particleNum;i++)this.particles[i].update();for(let i=0;i<this.particleNum;i++){let s=this.particles[i];s.died&&(!(s instanceof ii)||s.previous.length===0)&&(this.particles[i]=this.particles[this.particleNum-1],this.particles[this.particleNum-1]=s,this.particleNum--,i--,this.fire({type:"particleDied",particleSystem:this,particle:s}))}}emit(t,e,i){e.time>this.duration&&(this.looping?(e.time-=this.duration,e.burstIndex=0,this.behaviors.forEach(r=>{r.reset()})):!this.emitEnded&&!this.onlyUsedByOther&&this.endEmit()),this.normalMatrix.getNormalMatrix(i);let s=Math.ceil(e.waitEmiting);for(this.spawn(s,e,i),e.waitEmiting-=s;e.burstIndex<this.emissionBursts.length&&this.emissionBursts[e.burstIndex].time<=e.time;){if(Math.random()<this.emissionBursts[e.burstIndex].probability){let r=this.emissionBursts[e.burstIndex].count.genValue(this.memory,this.time);e.isBursting=!0,e.burstParticleCount=r,this.spawn(r,e,i),e.isBursting=!1}e.burstIndex++}if(!this.emitEnded&&(e.waitEmiting+=t*this.emissionOverTime.genValue(this.memory,e.time/this.duration),e.previousWorldPos!=null)){this.temp.set(i.elements[12],i.elements[13],i.elements[14]),e.travelDistance+=e.previousWorldPos.distanceTo(this.temp);let r=this.emissionOverDistance.genValue(this.memory,e.time/this.duration);if(e.travelDistance*r>0){let o=Math.floor(e.travelDistance*r);e.travelDistance-=o/r,e.waitEmiting+=o}}e.previousWorldPos===void 0&&(e.previousWorldPos=new R),e.previousWorldPos.set(i.elements[12],i.elements[13],i.elements[14]),e.time+=t}toJSON(t,e={}){if((t===void 0||typeof t=="string")&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}}),t.materials[this.rendererSettings.material.uuid]=this.rendererSettings.material.toJSON(t),e.useUrlForImage&&this.texture?.source!==void 0){let o=this.texture.source;t.images[o.uuid]={uuid:o.uuid,url:this.texture.image.url}}let s;this.renderMode===A.Trail?s={startLength:this.rendererEmitterSettings.startLength.toJSON(),followLocalOrigin:this.rendererEmitterSettings.followLocalOrigin}:this.renderMode===A.Mesh?s={}:this.renderMode===A.StretchedBillBoard?s={speedFactor:this.rendererEmitterSettings.speedFactor,lengthFactor:this.rendererEmitterSettings.lengthFactor}:s={};let r=this.rendererSettings.instancingGeometry;return t.geometries&&!t.geometries[r.uuid]&&(t.geometries[r.uuid]=r.toJSON()),{version:"3.0",autoDestroy:this.autoDestroy,looping:this.looping,prewarm:this.prewarm,duration:this.duration,shape:this.emitterShape.toJSON(),startLife:this.startLife.toJSON(),startSpeed:this.startSpeed.toJSON(),startRotation:this.startRotation.toJSON(),startSize:this.startSize.toJSON(),startColor:this.startColor.toJSON(),emissionOverTime:this.emissionOverTime.toJSON(),emissionOverDistance:this.emissionOverDistance.toJSON(),emissionBursts:this.emissionBursts.map(o=>({time:o.time,count:o.count.toJSON(),probability:o.probability,interval:o.interval,cycle:o.cycle})),onlyUsedByOther:this.onlyUsedByOther,instancingGeometry:this.rendererSettings.instancingGeometry.uuid,renderOrder:this.renderOrder,renderMode:this.renderMode,rendererEmitterSettings:s,material:this.rendererSettings.material.uuid,layers:this.layers.mask,startTileIndex:this.startTileIndex.toJSON(),uTileCount:this.uTileCount,vTileCount:this.vTileCount,blendTiles:this.blendTiles,softParticles:this.rendererSettings.softParticles,softFarFade:this.rendererSettings.softFarFade,softNearFade:this.rendererSettings.softNearFade,behaviors:this.behaviors.map(o=>o.toJSON()),worldSpace:this.worldSpace}}static fromJSON(t,e,i){let s=co(t.shape,e),r;if(t.renderMode===A.Trail){let a=t.rendererEmitterSettings;r={startLength:a.startLength!=null?U(a.startLength):new B(30),followLocalOrigin:a.followLocalOrigin}}else t.renderMode===A.Mesh?r={}:t.renderMode===A.StretchedBillBoard?(r=t.rendererEmitterSettings,t.speedFactor!=null&&(r.speedFactor=t.speedFactor)):r={};let o=new gi;t.layers&&(o.mask=t.layers);let l=new n({autoDestroy:t.autoDestroy,looping:t.looping,prewarm:t.prewarm,duration:t.duration,shape:s,startLife:U(t.startLife),startSpeed:U(t.startSpeed),startRotation:zi(t.startRotation),startSize:zi(t.startSize),startColor:Ps(t.startColor),emissionOverTime:U(t.emissionOverTime),emissionOverDistance:U(t.emissionOverDistance),emissionBursts:t.emissionBursts?.map(a=>({time:a.time,count:typeof a.count=="number"?new B(a.count):U(a.count),probability:a.probability??1,interval:a.interval??.1,cycle:a.cycle??1})),onlyUsedByOther:t.onlyUsedByOther,instancingGeometry:e.geometries[t.instancingGeometry],renderMode:t.renderMode,rendererEmitterSettings:r,renderOrder:t.renderOrder,layers:o,material:t.material?e.materials[t.material]:t.texture?new At({map:e.textures[t.texture],transparent:t.transparent??!0,blending:t.blending,side:et}):new At({color:16777215,transparent:!0,blending:Tt,side:et}),startTileIndex:typeof t.startTileIndex=="number"?new B(t.startTileIndex):U(t.startTileIndex),uTileCount:t.uTileCount,vTileCount:t.vTileCount,blendTiles:t.blendTiles,softParticles:t.softParticles,softFarFade:t.softFarFade,softNearFade:t.softNearFade,behaviors:[],worldSpace:t.worldSpace});return l.behaviors=t.behaviors.map(a=>{let h=uo(a,l);return h&&h.type==="EmitSubParticleSystem"&&(i[a.subParticleSystem]=h),h}).filter(a=>a!==null),l}addBehavior(t){this.behaviors.push(t)}getRendererSettings(){return this.rendererSettings}addEventListener(t,e){this.listeners[t]||(this.listeners[t]=[]),this.listeners[t].push(e)}removeAllEventListeners(t){this.listeners[t]&&(this.listeners[t]=[])}removeEventListener(t,e){if(this.listeners[t]){let i=this.listeners[t].indexOf(e);i!==-1&&this.listeners[t].splice(i,1)}}fire(t){this.listeners[t.type]&&this.listeners[t.type].forEach(e=>e(t))}clone(){let t=[];for(let r of this.emissionBursts){let o={};Object.assign(o,r),t.push(o)}let e=[];for(let r of this.behaviors)e.push(r.clone());let i;this.renderMode===A.Trail?i={startLength:this.rendererEmitterSettings.startLength.clone(),followLocalOrigin:this.rendererEmitterSettings.followLocalOrigin}:this.renderMode===A.StretchedBillBoard?i={lengthFactor:this.rendererEmitterSettings.lengthFactor,speedFactor:this.rendererEmitterSettings.speedFactor}:i={};let s=new gi;return s.mask=this.layers.mask,new n({autoDestroy:this.autoDestroy,looping:this.looping,duration:this.duration,shape:this.emitterShape.clone(),startLife:this.startLife.clone(),startSpeed:this.startSpeed.clone(),startRotation:this.startRotation.clone(),startSize:this.startSize.clone(),startColor:this.startColor.clone(),emissionOverTime:this.emissionOverTime.clone(),emissionOverDistance:this.emissionOverDistance.clone(),emissionBursts:t,onlyUsedByOther:this.onlyUsedByOther,instancingGeometry:this.rendererSettings.instancingGeometry,renderMode:this.renderMode,renderOrder:this.renderOrder,rendererEmitterSettings:i,material:this.rendererSettings.material,startTileIndex:this.startTileIndex,uTileCount:this.uTileCount,vTileCount:this.vTileCount,blendTiles:this.blendTiles,softParticles:this.softParticles,softFarFade:this.softFarFade,softNearFade:this.softNearFade,behaviors:e,worldSpace:this.worldSpace,layers:s})}},Pr=`

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
`,Dr=`
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
}`,Qa=`
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
`,Ka=`
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
`,Ur=`
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
`,$a=`
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
`;function Ar(n){return n===0?"uv":`uv${n}`}var Cr=class extends J{constructor(t){super(t)}onBeforeCompile(t,e){super.onBeforeCompile(t,e),t.vertexShader=Ur,t.fragmentShader=Dr}},Or=class extends Vi{constructor(t){super(t)}onBeforeCompile(t,e){super.onBeforeCompile(t,e),t.vertexShader=Ur,t.fragmentShader=Dr}},Nr=class extends Cs{constructor(t){super(t),this.vector_=new R,this.vector2_=new R,this.vector3_=new R,this.quaternion_=new G,this.quaternion2_=new G,this.quaternion3_=new G,this.rotationMat_=new Qt,this.rotationMat2_=new Qt,this.maxParticles=1e3,this.setupBuffers(),this.rebuildMaterial()}buildExpandableBuffers(){this.offsetBuffer=new ye(new Float32Array(this.maxParticles*3),3),this.offsetBuffer.setUsage(xt),this.geometry.setAttribute("offset",this.offsetBuffer),this.colorBuffer=new ye(new Float32Array(this.maxParticles*4),4),this.colorBuffer.setUsage(xt),this.geometry.setAttribute("color",this.colorBuffer),this.settings.renderMode===A.Mesh?(this.rotationBuffer=new ye(new Float32Array(this.maxParticles*4),4),this.rotationBuffer.setUsage(xt),this.geometry.setAttribute("rotation",this.rotationBuffer)):(this.settings.renderMode===A.BillBoard||this.settings.renderMode===A.HorizontalBillBoard||this.settings.renderMode===A.VerticalBillBoard||this.settings.renderMode===A.StretchedBillBoard)&&(this.rotationBuffer=new ye(new Float32Array(this.maxParticles),1),this.rotationBuffer.setUsage(xt),this.geometry.setAttribute("rotation",this.rotationBuffer)),this.sizeBuffer=new ye(new Float32Array(this.maxParticles*3),3),this.sizeBuffer.setUsage(xt),this.geometry.setAttribute("size",this.sizeBuffer),this.uvTileBuffer=new ye(new Float32Array(this.maxParticles),1),this.uvTileBuffer.setUsage(xt),this.geometry.setAttribute("uvTile",this.uvTileBuffer),this.settings.renderMode===A.StretchedBillBoard&&(this.velocityBuffer=new ye(new Float32Array(this.maxParticles*4),4),this.velocityBuffer.setUsage(xt),this.geometry.setAttribute("velocity",this.velocityBuffer))}setupBuffers(){this.geometry&&this.geometry.dispose(),this.geometry=new wn,this.geometry.setIndex(this.settings.instancingGeometry.getIndex()),this.settings.instancingGeometry.hasAttribute("normal")&&this.geometry.setAttribute("normal",this.settings.instancingGeometry.getAttribute("normal")),this.geometry.setAttribute("position",this.settings.instancingGeometry.getAttribute("position")),this.settings.instancingGeometry.hasAttribute("uv")&&this.geometry.setAttribute("uv",this.settings.instancingGeometry.getAttribute("uv")),this.buildExpandableBuffers()}expandBuffers(t){for(;t>=this.maxParticles;)this.maxParticles*=2;this.setupBuffers()}rebuildMaterial(){this.layers.mask=this.settings.layers.mask;let t={},e={};this.settings.material.type!=="MeshStandardMaterial"&&this.settings.material.type!=="MeshPhysicalMaterial"&&(t.map=new Ut(this.settings.material.map)),this.settings.material.alphaTest&&(e.USE_ALPHATEST="",t.alphaTest=new Ut(this.settings.material.alphaTest)),e.USE_UV="";let i=this.settings.uTileCount,s=this.settings.vTileCount;(i>1||s>1)&&(e.UV_TILE="",t.tileCount=new Ut(new fe(i,s))),this.settings.material.defines&&this.settings.material.defines.USE_COLOR_AS_ALPHA!==void 0&&(e.USE_COLOR_AS_ALPHA=""),this.settings.material.normalMap&&(e.USE_NORMALMAP="",e.NORMALMAP_UV=Ar(this.settings.material.normalMap.channel),t.normalMapTransform=new Ut(new Qt().copy(this.settings.material.normalMap.matrix))),this.settings.material.map&&(e.USE_MAP="",this.settings.blendTiles&&(e.TILE_BLEND=""),e.MAP_UV=Ar(this.settings.material.map.channel),t.mapTransform=new Ut(new Qt().copy(this.settings.material.map.matrix))),e.USE_COLOR_ALPHA="";let r;if(this.settings.softParticles){e.SOFT_PARTICLES="";let l=this.settings.softNearFade,a=1/(this.settings.softFarFade-this.settings.softNearFade);t.softParams=new Ut(new fe(l,a)),t.depthTexture=new Ut(null);let h=t.projParams=new Ut(new $);r=(c,u,d)=>{h.value.set(d.near,d.far,0,0)}}let o=!1;if(this.settings.renderMode===A.BillBoard||this.settings.renderMode===A.VerticalBillBoard||this.settings.renderMode===A.HorizontalBillBoard||this.settings.renderMode===A.Mesh){let l,a;this.settings.renderMode===A.Mesh?this.settings.material.type==="MeshStandardMaterial"||this.settings.material.type==="MeshPhysicalMaterial"?(e.USE_COLOR="",l=Ur,a=Dr,o=!0):(l=Ka,a=Pr):(l=Qa,a=Pr),this.settings.renderMode===A.VerticalBillBoard?e.VERTICAL="":this.settings.renderMode===A.HorizontalBillBoard&&(e.HORIZONTAL="");let h=!1;this.settings.renderMode===A.Mesh&&(this.settings.material.type==="MeshStandardMaterial"?(this.material=new Cr({}),this.material.copy(this.settings.material),this.material.uniforms=t,this.material.defines=e,h=!0):this.settings.material.type==="MeshPhysicalMaterial"&&(this.material=new Or({}),this.material.copy(this.settings.material),this.material.uniforms=t,this.material.defines=e,h=!0)),h||(this.material=new lt({uniforms:t,defines:e,vertexShader:l,fragmentShader:a,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,blending:this.settings.material.blending,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha,side:this.settings.material.side,alphaTest:this.settings.material.alphaTest,depthTest:this.settings.material.depthTest,lights:o}))}else if(this.settings.renderMode===A.StretchedBillBoard)t.speedFactor=new Ut(1),this.material=new lt({uniforms:t,defines:e,vertexShader:$a,fragmentShader:Pr,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,blending:this.settings.material.blending,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha,side:this.settings.material.side,alphaTest:this.settings.material.alphaTest,depthTest:this.settings.material.depthTest});else throw new Error("render mode unavailable");this.material&&r&&(this.material.onBeforeRender=r)}update(){let t=0,e=0,i=this.getVisibleSystems();for(let s of i)e+=s.particleNum;e>this.maxParticles&&this.expandBuffers(e);for(let s of i){s.emitter.updateMatrixWorld&&(s.emitter.updateWorldMatrix(!0,!1),s.emitter.updateMatrixWorld(!0));let r=s.particles,o=s.particleNum,l=this.quaternion2_,a=this.vector2_,h=this.vector3_;s.emitter.matrixWorld.decompose(a,l,h),this.rotationMat_.setFromMatrix4(s.emitter.matrixWorld);for(let c=0;c<o;c++,t++){let u=r[c];if(this.settings.renderMode===A.Mesh){let f;if(s.worldSpace)f=u.rotation;else{let m;u.parentMatrix?m=this.quaternion3_.setFromRotationMatrix(u.parentMatrix):m=l,f=this.quaternion_,f.copy(m).multiply(u.rotation)}this.rotationBuffer.setXYZW(t,f.x,f.y,f.z,f.w)}else(this.settings.renderMode===A.StretchedBillBoard||this.settings.renderMode===A.VerticalBillBoard||this.settings.renderMode===A.HorizontalBillBoard||this.settings.renderMode===A.BillBoard)&&this.rotationBuffer.setX(t,u.rotation);let d;if(s.worldSpace?d=u.position:(d=this.vector_,u.parentMatrix?d.copy(u.position).applyMatrix4(u.parentMatrix):d.copy(u.position).applyMatrix4(s.emitter.matrixWorld)),this.offsetBuffer.setXYZ(t,d.x,d.y,d.z),this.colorBuffer.setXYZW(t,u.color.x,u.color.y,u.color.z,u.color.w),s.worldSpace?this.sizeBuffer.setXYZ(t,u.size.x,u.size.y,u.size.z):u.parentMatrix?this.sizeBuffer.setXYZ(t,u.size.x,u.size.y,u.size.z):this.sizeBuffer.setXYZ(t,u.size.x*Math.abs(h.x),u.size.y*Math.abs(h.y),u.size.z*Math.abs(h.z)),this.uvTileBuffer.setX(t,u.uvTile),this.settings.renderMode===A.StretchedBillBoard&&this.velocityBuffer){let f=s.rendererEmitterSettings.speedFactor;f===0&&(f=.001);let m=s.rendererEmitterSettings.lengthFactor,p;s.worldSpace?p=u.velocity:(p=this.vector_,u.parentMatrix?(this.rotationMat2_.setFromMatrix4(u.parentMatrix),p.copy(u.velocity).applyMatrix3(this.rotationMat2_)):p.copy(u.velocity).applyMatrix3(this.rotationMat_)),this.velocityBuffer.setXYZW(t,p.x*f,p.y*f,p.z*f,m)}}}this.geometry.instanceCount=t,t>0&&(this.offsetBuffer.clearUpdateRanges(),this.offsetBuffer.addUpdateRange(0,t*3),this.offsetBuffer.needsUpdate=!0,this.sizeBuffer.clearUpdateRanges(),this.sizeBuffer.addUpdateRange(0,t*3),this.sizeBuffer.needsUpdate=!0,this.colorBuffer.clearUpdateRanges(),this.colorBuffer.addUpdateRange(0,t*4),this.colorBuffer.needsUpdate=!0,this.uvTileBuffer.clearUpdateRanges(),this.uvTileBuffer.addUpdateRange(0,t),this.uvTileBuffer.needsUpdate=!0,this.settings.renderMode===A.StretchedBillBoard&&this.velocityBuffer&&(this.velocityBuffer.clearUpdateRanges(),this.velocityBuffer.addUpdateRange(0,t*4),this.velocityBuffer.needsUpdate=!0),this.settings.renderMode===A.Mesh?(this.rotationBuffer.clearUpdateRanges(),this.rotationBuffer.addUpdateRange(0,t*4),this.rotationBuffer.needsUpdate=!0):(this.settings.renderMode===A.StretchedBillBoard||this.settings.renderMode===A.HorizontalBillBoard||this.settings.renderMode===A.VerticalBillBoard||this.settings.renderMode===A.BillBoard)&&(this.rotationBuffer.clearUpdateRanges(),this.rotationBuffer.addUpdateRange(0,t),this.rotationBuffer.needsUpdate=!0))}dispose(){this.geometry.dispose()}},tl=`

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
}`,el=`
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
}`,kr=class extends Cs{constructor(t){super(t),this.vector_=new R,this.vector2_=new R,this.vector3_=new R,this.quaternion_=new G,this.maxParticles=1e4,this.setupBuffers(),this.rebuildMaterial()}setupBuffers(){this.geometry&&this.geometry.dispose(),this.geometry=new Ot,this.indexBuffer=new Ct(new Uint32Array(this.maxParticles*6),1),this.indexBuffer.setUsage(xt),this.geometry.setIndex(this.indexBuffer),this.positionBuffer=new Ct(new Float32Array(this.maxParticles*6),3),this.positionBuffer.setUsage(xt),this.geometry.setAttribute("position",this.positionBuffer),this.previousBuffer=new Ct(new Float32Array(this.maxParticles*6),3),this.previousBuffer.setUsage(xt),this.geometry.setAttribute("previous",this.previousBuffer),this.nextBuffer=new Ct(new Float32Array(this.maxParticles*6),3),this.nextBuffer.setUsage(xt),this.geometry.setAttribute("next",this.nextBuffer),this.widthBuffer=new Ct(new Float32Array(this.maxParticles*2),1),this.widthBuffer.setUsage(xt),this.geometry.setAttribute("width",this.widthBuffer),this.sideBuffer=new Ct(new Float32Array(this.maxParticles*2),1),this.sideBuffer.setUsage(xt),this.geometry.setAttribute("side",this.sideBuffer),this.uvBuffer=new Ct(new Float32Array(this.maxParticles*4),2),this.uvBuffer.setUsage(xt),this.geometry.setAttribute("uv",this.uvBuffer),this.colorBuffer=new Ct(new Float32Array(this.maxParticles*8),4),this.colorBuffer.setUsage(xt),this.geometry.setAttribute("color",this.colorBuffer)}expandBuffers(t){for(;t>=this.maxParticles;)this.maxParticles*=2;this.setupBuffers()}rebuildMaterial(){this.layers.mask=this.settings.layers.mask;let t={lineWidth:{value:1},map:{value:null},useMap:{value:0},alphaMap:{value:null},useAlphaMap:{value:0},resolution:{value:new fe(1,1)},sizeAttenuation:{value:1},visibility:{value:1},alphaTest:{value:0}},e={};if(e.USE_UV="",e.USE_COLOR_ALPHA="",this.settings.material.map&&(e.USE_MAP="",e.MAP_UV=Ar(this.settings.material.map.channel),t.map=new Ut(this.settings.material.map),t.mapTransform=new Ut(new Qt().copy(this.settings.material.map.matrix))),this.settings.material.defines&&this.settings.material.defines.USE_COLOR_AS_ALPHA!==void 0&&(e.USE_COLOR_AS_ALPHA=""),this.settings.renderMode===A.Trail)this.material=new lt({uniforms:t,defines:e,vertexShader:el,fragmentShader:tl,transparent:this.settings.material.transparent,depthWrite:!this.settings.material.transparent,side:this.settings.material.side,blending:this.settings.material.blending||Tt,blendDst:this.settings.material.blendDst,blendSrc:this.settings.material.blendSrc,blendEquation:this.settings.material.blendEquation,premultipliedAlpha:this.settings.material.premultipliedAlpha});else throw new Error("render mode unavailable")}update(){let t=0,e=0,i=0,s=this.getVisibleSystems();for(let r of s)for(let o=0;o<r.particleNum;o++)i+=r.particles[o].previous.length*2;i>this.maxParticles&&this.expandBuffers(i);for(let r of s){r.emitter.updateMatrixWorld&&(r.emitter.updateWorldMatrix(!0,!1),r.emitter.updateMatrixWorld(!0));let o=this.quaternion_,l=this.vector2_,a=this.vector3_;r.emitter.matrixWorld.decompose(l,o,a);let h=r.particles,c=r.particleNum,u=this.settings.uTileCount,d=this.settings.vTileCount,f=1/u,m=1/d;for(let p=0;p<c;p++){let g=h[p],y=g.uvTile%d,S=Math.floor(g.uvTile/d+.001),w=g.previous.values(),b=w.next(),x=b.value,v=x;b.done||(b=w.next());let M;b.value!==void 0?M=b.value:M=v;for(let E=0;E<g.previous.length;E++,t+=2){if(this.positionBuffer.setXYZ(t,v.position.x,v.position.y,v.position.z),this.positionBuffer.setXYZ(t+1,v.position.x,v.position.y,v.position.z),r.worldSpace?(this.positionBuffer.setXYZ(t,v.position.x,v.position.y,v.position.z),this.positionBuffer.setXYZ(t+1,v.position.x,v.position.y,v.position.z)):(g.parentMatrix?this.vector_.copy(v.position).applyMatrix4(g.parentMatrix):this.vector_.copy(v.position).applyMatrix4(r.emitter.matrixWorld),this.positionBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.positionBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),r.worldSpace?(this.previousBuffer.setXYZ(t,x.position.x,x.position.y,x.position.z),this.previousBuffer.setXYZ(t+1,x.position.x,x.position.y,x.position.z)):(g.parentMatrix?this.vector_.copy(x.position).applyMatrix4(g.parentMatrix):this.vector_.copy(x.position).applyMatrix4(r.emitter.matrixWorld),this.previousBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.previousBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),r.worldSpace?(this.nextBuffer.setXYZ(t,M.position.x,M.position.y,M.position.z),this.nextBuffer.setXYZ(t+1,M.position.x,M.position.y,M.position.z)):(g.parentMatrix?this.vector_.copy(M.position).applyMatrix4(g.parentMatrix):this.vector_.copy(M.position).applyMatrix4(r.emitter.matrixWorld),this.nextBuffer.setXYZ(t,this.vector_.x,this.vector_.y,this.vector_.z),this.nextBuffer.setXYZ(t+1,this.vector_.x,this.vector_.y,this.vector_.z)),this.sideBuffer.setX(t,1),this.sideBuffer.setX(t+1,-1),r.worldSpace)this.widthBuffer.setX(t,v.size),this.widthBuffer.setX(t+1,v.size);else if(g.parentMatrix)this.widthBuffer.setX(t,v.size),this.widthBuffer.setX(t+1,v.size);else{let z=(Math.abs(a.x)+Math.abs(a.y)+Math.abs(a.z))/3;this.widthBuffer.setX(t,v.size*z),this.widthBuffer.setX(t+1,v.size*z)}this.uvBuffer.setXY(t,(E/g.previous.length+y)*f,(d-S-1)*m),this.uvBuffer.setXY(t+1,(E/g.previous.length+y)*f,(d-S)*m),this.colorBuffer.setXYZW(t,v.color.x,v.color.y,v.color.z,v.color.w),this.colorBuffer.setXYZW(t+1,v.color.x,v.color.y,v.color.z,v.color.w),E+1<g.previous.length&&(this.indexBuffer.setX(e*3,t),this.indexBuffer.setX(e*3+1,t+1),this.indexBuffer.setX(e*3+2,t+2),e++,this.indexBuffer.setX(e*3,t+2),this.indexBuffer.setX(e*3+1,t+1),this.indexBuffer.setX(e*3+2,t+3),e++),x=v,v=M,b.done||(b=w.next(),b.value!==void 0&&(M=b.value))}}}this.positionBuffer.clearUpdateRanges(),this.positionBuffer.addUpdateRange(0,t*3),this.positionBuffer.needsUpdate=!0,this.previousBuffer.clearUpdateRanges(),this.previousBuffer.addUpdateRange(0,t*3),this.previousBuffer.needsUpdate=!0,this.nextBuffer.clearUpdateRanges(),this.nextBuffer.addUpdateRange(0,t*3),this.nextBuffer.needsUpdate=!0,this.sideBuffer.clearUpdateRanges(),this.sideBuffer.addUpdateRange(0,t),this.sideBuffer.needsUpdate=!0,this.widthBuffer.clearUpdateRanges(),this.widthBuffer.addUpdateRange(0,t),this.widthBuffer.needsUpdate=!0,this.uvBuffer.clearUpdateRanges(),this.uvBuffer.addUpdateRange(0,t*2),this.uvBuffer.needsUpdate=!0,this.colorBuffer.clearUpdateRanges(),this.colorBuffer.addUpdateRange(0,t*4),this.colorBuffer.needsUpdate=!0,this.indexBuffer.clearUpdateRanges(),this.indexBuffer.addUpdateRange(0,e*3),this.indexBuffer.needsUpdate=!0,this.geometry.setDrawRange(0,e*3)}dispose(){this.geometry.dispose()}},Os=class n extends He{constructor(){super(),this.batches=[],this.systemToBatchIndex=new Map,this.type="BatchedRenderer",this.depthTexture=null}static equals(t,e){return t.material.side===e.material.side&&t.material.blending===e.material.blending&&t.material.blendSrc===e.material.blendSrc&&t.material.blendDst===e.material.blendDst&&t.material.blendEquation===e.material.blendEquation&&t.material.premultipliedAlpha===e.material.premultipliedAlpha&&t.material.transparent===e.material.transparent&&t.material.depthTest===e.material.depthTest&&t.material.type===e.material.type&&t.material.alphaTest===e.material.alphaTest&&t.material.map===e.material.map&&t.renderMode===e.renderMode&&t.blendTiles===e.blendTiles&&t.softParticles===e.softParticles&&t.softFarFade===e.softFarFade&&t.softNearFade===e.softNearFade&&t.uTileCount===e.uTileCount&&t.vTileCount===e.vTileCount&&t.instancingGeometry===e.instancingGeometry&&t.renderOrder===e.renderOrder&&t.layers.mask===e.layers.mask}addSystem(t){t._renderer=this;let e=t.getRendererSettings();for(let s=0;s<this.batches.length;s++)if(n.equals(this.batches[s].settings,e)){this.batches[s].addSystem(t),this.systemToBatchIndex.set(t,s);return}let i;switch(e.renderMode){case A.Trail:i=new kr(e);break;case A.Mesh:case A.BillBoard:case A.VerticalBillBoard:case A.HorizontalBillBoard:case A.StretchedBillBoard:i=new Nr(e);break}this.depthTexture&&i.applyDepthTexture(this.depthTexture),i.addSystem(t),this.batches.push(i),this.systemToBatchIndex.set(t,this.batches.length-1),this.add(i)}deleteSystem(t){let e=this.systemToBatchIndex.get(t);e!=null&&(this.batches[e].removeSystem(t),this.systemToBatchIndex.delete(t))}setDepthTexture(t){this.depthTexture=t;for(let e of this.batches)e.applyDepthTexture(t)}updateSystem(t){this.deleteSystem(t),this.addSystem(t)}update(t){this.systemToBatchIndex.forEach((e,i)=>{i.update(t)});for(let e=0;e<this.batches.length;e++)this.batches[e].update()}};Ya();fo(Ia);console.log("%c Particle system powered by three.quarks. https://quarks.art/","font-size: 14px; font-weight: bold;");var Pt=typeof matchMedia<"u"&&(matchMedia("(pointer: coarse)").matches||innerWidth<760),il=Pt?.5:1,qt=(n,t)=>new Ie(n.map(([e,i,s,r])=>[new R(e,i,s),r]),t),pe=(n,t,e,i)=>new Ke([[new Be(n,t,e,i),0]]),Br=(n,t)=>Array.isArray(n)?new Q(n[0],n[1]):new Q(n*(1-t),n*(1+t)),Ns=n=>{let t=new D(n);return[t.r,t.g,t.b]},po={},Ai=n=>po[n]||(po[n]={add:new At({map:ve(),blending:Tt,transparent:!0,depthWrite:!1}),smoke:new At({map:wi(),transparent:!0,depthWrite:!1}),fire:new At({map:wi(),blending:Tt,transparent:!0,depthWrite:!1})}[n]),go={flame:n=>({life:[.26,.5],speed:[26*n.size+8,36*n.size+10],size:[1*n.size,1.7*n.size],spread:.07,radius:.32*n.size,rate:70*Math.max(.55,n.size),m:"add",c0:[1,.95,.85],c1:[1,.78,.5],grad:qt([[1,1,.92,0],[1,.66,.2,.35],[.85,.28,.06,1]],[[1,0],[.85,.4],[0,1]]),sz:pe(.55,1.2,1.9,2.6)}),fire:n=>({life:[.6,1.2],speed:[1.5*n.size,3.5*n.size],size:[.8*n.size,1.6*n.size],spread:.35,radius:.5*n.size,rate:40,rise:3*n.size,m:"fire",c0:[1,.9,.6],c1:[1,.6,.25],grad:qt([[1,.95,.7,0],[1,.5,.12,.4],[.4,.1,.03,1]],[[1,0],[.8,.5],[0,1]]),sz:pe(.7,1.1,.9,.4)}),smoke:n=>({life:[3,5],speed:[2*n.size,4*n.size],size:[.7*n.size,1.3*n.size],spread:.5,radius:.3*n.size,rate:20,rise:.5*n.size,alpha:.75,m:"smoke",c0:n.color?Ns(n.color):[.86,.85,.83],grad:qt([[1,.82,.62,0],[1,1,1,.25],[.95,.95,.95,1]],[[0,0],[1,.08],[.7,.5],[0,1]]),sz:pe(.6,1.6,2.6,3.4)}),steam:n=>({life:[1.6,3],speed:[1.5*n.size,3*n.size],size:[.6*n.size,1.2*n.size],spread:.35,radius:.15*n.size,rate:26,rise:1.2*n.size,alpha:.6,m:"smoke",c0:n.color?Ns(n.color):[1,1,1],grad:qt([[1,1,1,0],[1,1,1,1]],[[0,0],[1,.12],[.5,.5],[0,1]]),sz:pe(.4,1.3,2.2,3)}),vapor:n=>({life:[2.4,4],speed:[.5*n.size,1.3*n.size],size:[.9*n.size,1.7*n.size],spread:1.1,radius:.5*n.size,rate:16,rise:-1.6,alpha:.7,m:"smoke",c0:[1,1,1],grad:qt([[1,1,1,0],[1,1,1,1]],[[0,0],[1,.15],[.6,.55],[0,1]]),sz:pe(.5,1.4,2.3,3)}),sparks:n=>({life:[.5,1.4],speed:[6*n.size,14*n.size],size:[.08*n.size,.2*n.size],spread:.6,radius:.05,rate:60,rise:-9.8,m:"add",c0:[1,.9,.6],c1:[1,.6,.2],grad:qt([[1,1,1,0],[1,.4,.1,1]],[[1,0],[0,1]])}),dust:n=>({life:[2,4],speed:[1*n.size,3*n.size],size:[.8*n.size,1.6*n.size],spread:1.3,radius:1*n.size,rate:14,rise:.2,alpha:.5,m:"smoke",c0:n.color?Ns(n.color):[.72,.62,.45],grad:qt([[1,1,1,0],[1,1,1,1]],[[0,0],[1,.1],[.5,.6],[0,1]]),sz:pe(.6,1.4,2,2.6)})},ks=class{constructor(t){this.scene=t,this.batch=new Os,t.add(this.batch),this.live=new Set,this.src={}}add(t,e){return this.batch.addSystem(t),(e||this.scene).add(t.emitter),this.live.add(t),t}kill(t){this.live.has(t)&&(this.live.delete(t),this.batch.deleteSystem(t),t.emitter.removeFromParent(),t.dispose())}source(t,e){let i={size:1,...t},s=(go[i.kind]||go.smoke)(i),r=i.life??s.life,o=i.speed??s.speed,l=i.size0??s.size,a=i.color&&s.m!=="smoke"?Ns(i.color):s.c0,h=s.c1||a.map(g=>g*.92),c=i.alpha??s.alpha??1,u=[new $t(s.grad)];s.sz&&u.push(new me(s.sz));let d=i.rise??s.rise;d&&u.push(new we(new R(0,Math.sign(d),0),new B(Math.abs(d))));let f=new Se({duration:1,looping:!0,worldSpace:i.world!==!1,startLife:Br(r,.3),startSpeed:Br(o,.3),startSize:Br(l,.3),startRotation:new Q(0,6.28),startColor:new Jt(new $(a[0],a[1],a[2],c),new $(h[0],h[1],h[2],c)),shape:new ti({radius:i.radius??s.radius,angle:i.spread??s.spread,thickness:1,arc:Math.PI*2}),emissionOverTime:new B(0),material:Ai(s.m),renderMode:A.BillBoard,behaviors:u});f.emitter.position.fromArray(i.pos||[0,0,0]);let m=new T().fromArray(i.dir||[0,1,0]).normalize();f.emitter.quaternion.setFromUnitVectors(new T(0,0,1),m),f.rate0=(i.rate??s.rate)*(s.m==="add"&&i.kind==="flame"?Pt?.5:1:il),this.add(f,e);let p={ps:f,kind:i.kind,level:0,spec:i};if(i.kind==="flame"){let g=new At({map:ve(),color:16767392,blending:Tt,transparent:!0,depthWrite:!1,side:et}),y=i.core??4*i.size;p.core=new at(new Li(.3*i.size,y,12,1,!0),g),p.core.geometry.translate(0,y/2,0),p.core.quaternion.setFromUnitVectors(new T(0,1,0),m),p.core.position.copy(f.emitter.position),p.core.visible=!1,p.halo=new Ne(new ge({map:ve(),color:16751164,blending:Tt,transparent:!0,depthWrite:!1})),p.halo.position.copy(f.emitter.position),p.halo.visible=!1,p.halo.size=4*i.size,(e||this.scene).add(p.core,p.halo)}return t.id&&(this.src[t.id]=p),i.on&&this.level(p,i.on===!0?1:i.on),p}level(t,e){t.level=e,t.ps.emissionOverTime.value=e>0?t.ps.rate0*e:0,t.core&&(t.core.visible=e>.3,t.halo.visible=e>0)}boom(t,e=1,i={}){let s=e,r=[],o=a=>[{time:0,count:new B(Math.round(a*(Pt?.6:1))),cycle:1,interval:.01,probability:1}],l={duration:.5,looping:!1,worldSpace:!0,emissionOverTime:new B(0)};i.fire!==!1&&r.push(new Se({...l,emissionBursts:o(110),startLife:new Q(.7,1.7),startSpeed:new Q(6*s,26*s),startSize:new Q(5*s,11*s),startRotation:new Q(0,6.28),startColor:new Jt(new $(1,.95,.8,1),new $(1,.7,.35,1)),shape:new Kt({radius:2.5*s,thickness:1}),material:Ai("fire"),renderMode:A.BillBoard,behaviors:[new $t(qt([[1,1,.85,0],[1,.55,.12,.3],[.45,.1,.03,1]],[[1,0],[.9,.5],[0,1]])),new me(pe(.5,1.5,2.2,2.6))]})),r.push(new Se({...l,emissionBursts:o(70),startLife:new Q(3,5.5),startSpeed:new Q(3*s,12*s),startSize:new Q(8*s,15*s),startRotation:new Q(0,6.28),startColor:new Jt(new $(.2,.18,.17,.9),new $(.33,.3,.28,.9)),shape:new Kt({radius:3*s,thickness:1}),material:Ai("smoke"),renderMode:A.BillBoard,behaviors:[new $t(qt([[1,.5,.25,0],[1,1,1,.2],[1,1,1,1]],[[0,0],[1,.1],[.6,.6],[0,1]])),new me(pe(.4,1.4,2.4,3.2)),new we(new R(0,1,0),new B(3))]})),r.push(new Se({...l,emissionBursts:o(90),startLife:new Q(.8,2.2),startSpeed:new Q(25*s,70*s),startSize:new Q(.35*Math.sqrt(s),.8*Math.sqrt(s)),startColor:new Jt(new $(1,.9,.6,1),new $(1,.6,.2,1)),shape:new ei,material:Ai("add"),renderMode:A.BillBoard,behaviors:[new we(new R(0,-1,0),new B(22*s)),new $t(qt([[1,1,1,0],[1,.4,.1,1]],[[1,0],[0,1]]))]}));for(let a of r)a.emitter.position.copy(t),this.add(a),setTimeout(()=>this.kill(a),7e3)}puff(t,e=1,i=[.9,.9,.9],s=18){let r=new Se({duration:.5,looping:!1,worldSpace:!0,emissionOverTime:new B(0),emissionBursts:[{time:0,count:new B(s),cycle:1,interval:.01,probability:1}],startLife:new Q(1.2,2.2),startSpeed:new Q(2*e,5*e),startSize:new Q(1.5*e,2.6*e),startRotation:new Q(0,6.28),startColor:new Jt(new $(i[0],i[1],i[2],.8),new $(i[0],i[1],i[2],.8)),shape:new Kt({radius:.4*e,thickness:1}),material:Ai("smoke"),renderMode:A.BillBoard,behaviors:[new $t(qt([[1,1,1,0],[1,1,1,1]],[[0,0],[1,.1],[0,1]])),new me(pe(.5,1.4,2.2,2.8))]});r.emitter.position.copy(t),this.add(r),setTimeout(()=>this.kill(r),4e3)}tick(t){for(let e of Object.values(this.src))if(e.core&&e.level>0){let i=.85+Math.random()*.3;e.core.scale.set(i,(.8+Math.random()*.4)*e.level,i),e.halo.scale.setScalar(e.halo.size*i*(.6+.4*Math.min(e.level,1.2)))}this.batch.update(t)}hideAll(t){for(let e of this.live)e.emitter&&(e.emitter.visible=!t)}};var be={day:{hor:[.86,.88,.86],zen:[.24,.45,.78],low:[.55,.5,.4],sun:[.55,.42,.72],sunCol:[1,.94,.85],sunI:2.8,hemi:1.25,hemiSky:[.81,.88,1],hemiGnd:[.54,.46,.31],stars:0,disc:1.4,exp:1.05},evening:{hor:[.98,.6,.36],zen:[.16,.2,.42],low:[.35,.25,.2],sun:[.85,.07,.35],sunCol:[1,.68,.42],sunI:1.9,hemi:.7,hemiSky:[.9,.7,.6],hemiGnd:[.35,.25,.2],stars:.15,disc:1.8,exp:1.1},night:{hor:[.07,.09,.15],zen:[.008,.012,.035],low:[.04,.04,.05],sun:[-.4,.5,-.6],sunCol:[.6,.7,1],sunI:.35,hemi:.3,hemiSky:[.4,.5,.8],hemiGnd:[.1,.1,.12],stars:1,disc:.5,exp:1.25},space:{hor:[.03,.05,.1],zen:[0,0,.005],low:[.01,.01,.02],sun:[.55,.42,.72],sunCol:[1,.97,.92],sunI:3.2,hemi:.15,hemiSky:[.5,.6,1],hemiGnd:[.05,.05,.08],stars:1,disc:2,exp:1}},sl=(n,t,e)=>n.map((i,s)=>i+(t[s]-i)*e);function rl(n,t,e){let i={};for(let s of Object.keys(n))i[s]=Array.isArray(n[s])?sl(n[s],t[s],e):n[s]+(t[s]-n[s])*e;return i}function yo(){let n=new lt({side:qs,depthWrite:!1,fog:!1,uniforms:{uHor:{value:new D},uZen:{value:new D},uLow:{value:new D},uSun:{value:new T},uSunC:{value:new D},uStars:{value:0},uDisc:{value:1}},vertexShader:"varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }",fragmentShader:`varying vec3 vD; uniform vec3 uHor, uZen, uLow, uSun, uSunC; uniform float uStars, uDisc;
      float h3(vec3 p){ p = fract(p * 0.3183 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){ float h = max(vD.y, 0.0);
        vec3 c = mix(uHor, uZen, pow(h, 0.55));
        float sd = max(dot(vD, normalize(uSun)), 0.0);
        c += uSunC * (pow(sd, 220.0) * uDisc + pow(sd, 8.0) * 0.18);
        if (uStars > 0.0) { vec3 q = floor(vD * 420.0); float s = step(0.9975, h3(q)); c += vec3(s) * uStars * smoothstep(0.0, 0.15, vD.y + 0.05); }
        if (vD.y < 0.0) c = mix(uHor, uLow, min(-vD.y * 6.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`}),t=new at(new ue(9e3,32,16),n);return t.frustumCulled=!1,t.renderOrder=-1,t}var nl=Math.PI/180;function ol(n,t){let e=new lt({side:qs,depthWrite:!1,fog:!1,toneMapped:!0,uniforms:{tSky:{value:n},uExp:{value:1},uYaw:{value:t}},vertexShader:"varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }",fragmentShader:`varying vec3 vD; uniform sampler2D tSky; uniform float uExp, uYaw;
      vec3 invRRT(vec3 v){ // \u0440\u0435\u0448\u0435\u043D\u0438\u0435 (x(x+a)-b)/(x(cx+d)+e) = v
        const float a = 0.0245786, b = 0.000090537, c = 0.983729, d = 0.4329510, e = 0.238081;
        vec3 A = 1.0 - v * c, B = a - v * d, C = -(b + v * e);
        return (-B + sqrt(max(B * B - 4.0 * A * C, 0.0))) / (2.0 * max(A, 1e-3)); }
      void main(){
        vec3 d = normalize(vD); float cy = cos(uYaw), sy = sin(uYaw); d = vec3(cy * d.x + sy * d.z, d.y, -sy * d.x + cy * d.z);
        vec2 uv = vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5);
        vec3 s = texture2D(tSky, uv).rgb;   // \u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 (sRGB \u2192 \u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u0441\u0434\u0435\u043B\u0430\u043B \u0437\u0430\u0433\u0440\u0443\u0437\u0447\u0438\u043A)
        s = min(s, vec3(0.985));
        const mat3 M2 = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
        const mat3 M1 = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
        vec3 x = inverse(M1) * invRRT(inverse(M2) * s);
        gl_FragColor = vec4(max(x, 0.0) * 0.6 / max(uExp, 1e-3), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}),i=new at(new ue(9e3,48,24),e);return i.frustumCulled=!1,i.renderOrder=-1,i}var Ds=class{constructor(t,e,i={}){this.r=t,this.scene=e,this.env=i,this.sky=yo(),e.add(this.sky),this.hemi=new er(13623551,9074e3,1.25),e.add(this.hemi),this.sun=new sr(16773336,2.8),this.sun.castShadow=i.shadow!==0;let s=i.shadow||40;this.sunDist=i.sunDist||120,this.sun.shadow.mapSize.set(Pt?1024:2048,Pt?1024:2048),Object.assign(this.sun.shadow.camera,{left:-s,right:s,top:s,bottom:-s,near:1,far:this.sunDist*2.5}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.04,e.add(this.sun,this.sun.target);let r=i.fog===!1?null:i.fog||[260,2600];r&&(e.fog=new Ks(14278104,r[0],r[1])),this.fog0=r,this.pmrem=new bn(t),this.cur={...be[i.sky]||be.day},i.sun&&(this.cur.sun=i.sun),this.apply(this.cur,!0),i.groundTex?this.pbrGround(i):this.ground(i.ground||"steppe",i.size||4e3,i.groundColor),i.grass&&this.grassField(i.grass),i.clouds&&!i.hdri&&this.clouds(i.clouds),this.trans=null,this.ready=i.hdri?this.hdri(i).catch(o=>console.warn("rc3d: HDRI",o)):Promise.resolve()}async hdri(t){let e=await Dn(t.hdri),i=(t.hdriYaw||0)*nl;e.mapping=Qr,this.hd=!0,this.sky.visible=!1,this.hemi.intensity=t.hemi??0;let s=this.pmrem.fromEquirectangular(e).texture;this.scene.environment&&this.scene.environment.dispose(),this.scene.environment=s,this.scene.environmentIntensity=t.envIntensity??1,this.scene.environmentRotation.y=i;let{width:r,height:o,data:l}=e.image,a;if(t.hdriSun)a=new T(...t.hdriSun).normalize();else{let d=0,f=0;for(let y=0;y<r*o;y++){let S=l[y*4]+l[y*4+1]+l[y*4+2];S>d&&(d=S,f=y)}let m=f%r/r,p=(.5-Math.floor(f/r)/o)*Math.PI,g=(m-.5)*2*Math.PI;a=new T(Math.cos(g)*Math.cos(p),Math.sin(p),Math.sin(g)*Math.cos(p))}a.applyAxisAngle(new T(0,1,0),i),this.hdSun=a;let h=[0,0,0],c=0,u=Math.floor(o*.48);for(let d=0;d<r;d++){let f=(u*r+d)*4;h[0]+=l[f],h[1]+=l[f+1],h[2]+=l[f+2],c++}this.hdFog=new D(...t.fogColor||h.map(d=>d/c*(t.fogK??.92))),t.background!==!1&&(t.background?this.scene.add(this.dome=ol(Ge(t.background,{srgb:!0}),i)):(this.scene.background=e,this.scene.backgroundRotation.y=i,this.scene.backgroundIntensity=t.bgIntensity??1)),this.apply(this.cur,!1)}apply(t,e){if(this.hd){let s=t.sunI/be.day.sunI,r=this.env;this.sunDir=this.hdSun.clone(),this.sun.color.setRGB(...t.sunCol),this.sun.intensity=(r.sunI??3)*s,this.scene.environmentIntensity=(r.envIntensity??1)*Math.max(.15,t.hemi/be.day.hemi),this.r.toneMappingExposure=(r.exposure??1)*t.exp/be.day.exp,this.scene.fog&&this.scene.fog.color.copy(this.hdFog).multiplyScalar(Math.max(.1,t.hemi/be.day.hemi)),this.dome&&(this.dome.material.uniforms.uExp.value=this.r.toneMappingExposure);return}let i=this.sky.material.uniforms;i.uHor.value.setRGB(...t.hor),i.uZen.value.setRGB(...t.zen),i.uLow.value.setRGB(...t.low),i.uSun.value.fromArray(t.sun).normalize(),i.uSunC.value.setRGB(...t.sunCol),i.uStars.value=t.stars,i.uDisc.value=t.disc,this.sun.color.setRGB(...t.sunCol),this.sun.intensity=t.sunI,this.sunDir=new T().fromArray(t.sun).normalize(),this.hemi.intensity=t.hemi,this.hemi.color.setRGB(...t.hemiSky),this.hemi.groundColor.setRGB(...t.hemiGnd),this.scene.fog&&this.scene.fog.color.setRGB(...t.hor),this.r.toneMappingExposure=t.exp,e&&this.envmap()}envmap(){if(this.hd)return;let t=new yi,e=yo();e.material.uniforms=this.sky.material.uniforms,t.add(e),this.scene.environment&&this.scene.environment.dispose(),this.scene.environment=this.pmrem.fromScene(t,.02).texture,e.geometry.dispose()}to(t,e=3){let i=be[t];i&&(this.trans={a:{...this.cur},b:i,t:0,dur:Math.max(.01,e)})}set(t){let e=be[t];e&&(this.trans=null,this.cur={...e},this.apply(this.cur,!0))}tick(t,e,i=0){if(this.trans){let s=this.trans;s.t+=t;let r=Math.min(1,s.t/s.dur);this.cur=rl(s.a,s.b,r),this.apply(this.cur,!1),r>=1&&(this.trans=null,this.envmap())}e&&(this.sun.target.position.copy(e),this.sun.position.copy(e).addScaledVector(this.sunDir,this.sunDist)),this.scene.fog&&this.fog0&&(this.scene.fog.far=this.fog0[1]+Math.max(0,i)*5),this.grassMat?.userData.sh&&(this.grassMat.userData.sh.uniforms.uTime.value+=t),this.grassMesh,this.water&&(this.water.offset.x+=t*.01,this.water.offset.y+=t*.004)}ground(t,e,i){if(t==="none")return;let s=l=>e/l,r;if(t==="field")r=new J({map:Tn(s(8)),roughness:1});else if(t==="concrete")r=new J({map:De(i||"#8f8c85",.22,2600,s(12)),roughness:.95});else if(t==="snow")r=new J({map:De(i||"#e9eef3",.08,1500,s(10),5),roughness:.85,emissive:10465476,emissiveIntensity:.08});else if(t==="water"){let l=An(s(20));this.water=l,r=new J({map:l,roughness:.12,metalness:.35,color:i||16777215})}else r=new J({map:De(i||"#b39d6e",.3,5e3,s(35)),roughness:1});let o=new at(new ce(e,e),r);o.rotation.x=-Math.PI/2,o.position.y=-.02,o.receiveShadow=!0,this.scene.add(o),this.groundMesh=o,t==="field"&&this.grass(this.env.grassRadius||45)}pbrGround(t){let e=t.size||4e3,i=t.groundTile||(t.groundRepeat?e/t.groundRepeat:4),s=e/i,r=new J({roughness:1,metalness:0,...Ji(t.groundTex,{repeat:s,res:t.groundRes,arm:t.groundArm})});r.aoMap&&(r.aoMap=null),r.metalnessMap&&(r.metalnessMap=null,r.metalness=0),r.normalScale.setScalar(t.groundNormal??1);let o=t.groundTex2?Ge(t.groundTex2+"_diffuse_"+(t.groundRes2||"1k")+".jpg",{srgb:!0,repeat:s*(t.groundTile2K??1)}):null;t.groundColor&&r.color.set(t.groundColor),r.onBeforeCompile=a=>{a.uniforms.map2={value:o||r.map},a.uniforms.uMix2={value:o?t.groundMix??.45:0},a.uniforms.uMacro={value:t.groundMacro??.35},a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
varying vec2 vWxz;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vWxz = (modelMatrix * vec4(transformed, 1.0)).xz;`),a.fragmentShader=a.fragmentShader.replace("#include <common>",`#include <common>
        varying vec2 vWxz; uniform sampler2D map2; uniform float uMix2, uMacro;
        float hn(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hn(i), hn(i+vec2(1,0)), f.x), mix(hn(i+vec2(0,1)), hn(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ return 0.5*vn(p) + 0.3*vn(p*2.03+7.1) + 0.2*vn(p*4.1+3.3); }`).replace("#include <map_fragment>",`
        #ifdef USE_MAP
          vec4 tA = texture2D(map, vMapUv);
          vec2 r2 = mat2(0.8, -0.6, 0.6, 0.8) * vMapUv * 0.31 + vec2(0.41, 0.17);
          vec4 tB = texture2D(map, r2);
          float nA = fbm(vWxz * 0.035);
          vec4 col = mix(tA, tB, smoothstep(0.3, 0.7, nA) * 0.6);
          float n2 = fbm(vWxz * 0.021 + 13.0);
          vec4 c2 = texture2D(map2, vMapUv * 0.73);
          col = mix(col, c2, uMix2 * smoothstep(0.52, 0.72, n2));
          float macro = fbm(vWxz * 0.006 + 2.0);
          col.rgb *= 1.0 + uMacro * (macro - 0.5) * 1.6;
          col.rgb = mix(col.rgb, col.rgb * vec3(1.08, 1.04, 0.86), uMacro * smoothstep(0.55, 0.8, fbm(vWxz * 0.01 + 5.0)));
          diffuseColor *= col;
        #endif`)};let l=new at(new ce(e,e,1,1),r);l.rotation.x=-Math.PI/2,l.position.y=-.02,l.receiveShadow=!0,this.scene.add(l),this.groundMesh=l}grassField(t){let e=Math.round((t.n??12e3)*(Pt?.4:1)),i=t.h??.32,s=t.areas||[[0,0,40]],r=[],o=(()=>{let g=77;return()=>(g=g*16807%2147483647)/2147483647})();for(let g=0;g<6;g++){let y=o()*6.283,S=.15+o()*.35,w=i*(.6+o()*.6),b=.012+o()*.008,x=(o()-.5)*.12,v=(o()-.5)*.12,M=Math.cos(y),E=Math.sin(y);for(let z=0;z<4;z++){let P=z/4,C=(z+1)/4,O=b*(1-P),H=b*(1-C),X=S*P*P*w,W=S*C*C*w,Z=(tt,it,I,j)=>[x+M*j-E*I*tt,it*w,v+E*j+M*I*tt];r.push(...Z(-1,P,O,X),...Z(1,P,O,X),...Z(-1,C,H,W),...Z(1,P,O,X),...Z(1,C,H,W),...Z(-1,C,H,W))}}let l=new Ot;l.setAttribute("position",new _t(r,3));let a=new Float32Array(r.length);for(let g=1;g<a.length;g+=3)a[g]=1;l.setAttribute("normal",new Ct(a,3));let h=new J({color:t.color||16777215,roughness:.9,side:et}),c=new D(t.base||"#2f3d17"),u=new D(t.tip||"#a3a856");h.onBeforeCompile=g=>{g.uniforms.uTime={value:0},g.uniforms.cBase={value:c},g.uniforms.cTip={value:u},g.uniforms.uH={value:i},h.userData.sh=g,g.vertexShader=g.vertexShader.replace("#include <common>",`#include <common>
uniform float uTime, uH; varying float vH;`).replace("#include <begin_vertex>",`#include <begin_vertex>
        vH = position.y / uH;
        vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
        float wv = sin(uTime * 1.7 + ip.x * 0.35 + ip.z * 0.2) * 0.6 + sin(uTime * 3.1 + ip.x * 1.3) * 0.25;
        transformed.x += wv * 0.09 * vH * vH; transformed.z += wv * 0.05 * vH * vH;`),g.fragmentShader=g.fragmentShader.replace("#include <common>",`#include <common>
uniform vec3 cBase, cTip; varying float vH;`).replace("#include <color_fragment>",`#include <color_fragment>
diffuseColor.rgb *= mix(cBase, cTip, smoothstep(0.0, 1.0, vH));`)};let d=new ke(l,h,e),f=new He,m=new D,p=s.reduce((g,y)=>g+y[2]*y[2],0);for(let g=0;g<e;g++){let y=o()*p,S=s[0];for(let x of s)if((y-=x[2]*x[2])<=0){S=x;break}let w=o()*6.283,b=Math.pow(o(),.75)*S[2];f.position.set(S[0]+Math.cos(w)*b,-.01,S[1]+Math.sin(w)*b),f.rotation.set(0,o()*6.283,0),f.scale.setScalar(.7+o()*.7),f.updateMatrix(),d.setMatrixAt(g,f.matrix),d.setColorAt(g,m.setHSL(.17+o()*.08,.35+o()*.25,.42+o()*.3))}d.frustumCulled=!1,d.receiveShadow=!0,d.castShadow=!1,this.scene.add(d),this.grassMesh=d,this.grassMat=h}clouds(t){let e=4,i=()=>(e=e*16807%2147483647)/2147483647,s=new ge({map:wi(),color:16777215,transparent:!0,depthWrite:!1,fog:!1,opacity:.9});for(let r=0;r<t;r++){let o=i()*6.283,l=900+i()*1800,a=260+i()*300,h=new rt;for(let c=0;c<5;c++){let u=new Ne(s);u.scale.set(260+i()*220,120+i()*80,1),u.position.set((c-2)*90+i()*60,i()*40,i()*40),h.add(u)}h.position.set(Math.cos(o)*l,a,Math.sin(o)*l),this.scene.add(h)}}grass(t){let e=Pt?1500:4e3,i=new Ot;i.setAttribute("position",new _t([-.08,0,0,.08,0,0,0,.5,0,0,0,-.08,0,0,.08,0,.5,0],3)),i.computeVertexNormals();let s=new ke(i,new J({color:7311162,side:et,roughness:1}),e),r=new He,o=new D,l=9,a=()=>(l=l*16807%2147483647)/2147483647;for(let h=0;h<e;h++){let c=a()*6.283,u=Math.sqrt(a())*t;r.position.set(Math.cos(c)*u,0,Math.sin(c)*u),r.rotation.set((a()-.5)*.4,a()*6.283,(a()-.5)*.4),r.scale.setScalar(.6+a()*1.1),r.updateMatrix(),s.setMatrixAt(h,r.matrix),s.setColorAt(h,o.setHSL(.2+a()*.06,.45,.28+a()*.15))}this.scene.add(s)}};var te={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var Et=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},al=new ir(-1,1,1,-1,0,1),Ir=class extends Ot{constructor(){super(),this.setAttribute("position",new _t([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new _t([0,2,0,0,2,0],2))}},ll=new Ir,ee=class{constructor(t){this._mesh=new at(ll,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,al)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var ni=class extends Et{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof lt?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Nt.clone(t.uniforms),this.material=new lt({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new ee(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ci=class extends Et{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let s=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,l;this.inverse?(o=0,l=1):(o=1,l=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(l),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Us=class extends Et{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Bs=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new F);this._width=i.width,this._height=i.height,e=new Ht(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Lt}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new ni(te),this.copyPass.material.blending=Ft,this.clock=new rr}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let s=0,r=this.passes.length;s<r;s++){let o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),o.needsSwap){if(i){let l=this.renderer.getContext(),a=this.renderer.state.buffers.stencil;a.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),a.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}Ci!==void 0&&(o instanceof Ci?i=!0:o instanceof Us&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new F);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Is=class extends Et{constructor(t,e,i=null,s=null,r=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new D}render(t,e,i){let s=t.autoClear;t.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(r=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),t.autoClear=s}};var vo={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new D(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var oi=class n extends Et{constructor(t,e=1,i,s){super(),this.strength=e,this.radius=i,this.threshold=s,this.resolution=t!==void 0?new F(t.x,t.y):new F(256,256),this.clearColor=new D(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Ht(r,o,{type:Lt}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){let u=new Ht(r,o,{type:Lt});u.texture.name="UnrealBloomPass.h"+c,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new Ht(r,o,{type:Lt});d.texture.name="UnrealBloomPass.v"+c,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let l=vo;this.highPassUniforms=Nt.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new lt({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];let a=[6,10,14,18,22];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(a[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new F(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let h=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=h,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Nt.clone(te.uniforms),this.blendMaterial=new lt({uniforms:this.copyUniforms,vertexShader:te.vertexShader,fragmentShader:te.fragmentShader,premultipliedAlpha:!0,blending:Tt,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new D,this._oldClearAlpha=1,this._basic=new At,this._fsQuad=new ee(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),s=Math.round(e/2);this.renderTargetBright.setSize(i,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,s),this.renderTargetsVertical[r].setSize(i,s),this.separableBlurMaterials[r].uniforms.invSize.value=new F(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(t,e,i,s,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let l=this.renderTargetBright;for(let a=0;a<this.nMips;a++)this._fsQuad.material=this.separableBlurMaterials[a],this.separableBlurMaterials[a].uniforms.colorTexture.value=l.texture,this.separableBlurMaterials[a].uniforms.direction.value=n.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[a]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[a].uniforms.colorTexture.value=this.renderTargetsHorizontal[a].texture,this.separableBlurMaterials[a].uniforms.direction.value=n.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[a]),t.clear(),this._fsQuad.render(t),l=this.renderTargetsVertical[a];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(i),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(t){let e=[],i=t/3;for(let s=0;s<t;s++)e.push(.39894*Math.exp(-.5*s*s/(i*i))/i);return new lt({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new F(.5,.5)},direction:{value:new F(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(t){return new lt({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};oi.BlurDirectionX=new F(1,0);oi.BlurDirectionY=new F(0,1);var Oi={name:"GTAOShader",defines:{PERSPECTIVE_CAMERA:1,SAMPLES:16,NORMAL_VECTOR_TYPE:1,DEPTH_SWIZZLING:"x",SCREEN_SPACE_RADIUS:0,SCREEN_SPACE_RADIUS_SCALE:100,SCENE_CLIP_BOX:0},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new F},cameraNear:{value:null},cameraFar:{value:null},cameraProjectionMatrix:{value:new he},cameraProjectionMatrixInverse:{value:new he},cameraWorldMatrix:{value:new he},radius:{value:.25},distanceExponent:{value:1},thickness:{value:1},distanceFallOff:{value:1},scale:{value:1},sceneBoxMin:{value:new T(-1,-1,-1)},sceneBoxMax:{value:new T(1,1,1)}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		varying vec2 vUv;
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform mat4 cameraWorldMatrix;
		uniform float radius;
		uniform float distanceExponent;
		uniform float thickness;
		uniform float distanceFallOff;
		uniform float scale;
		#if SCENE_CLIP_BOX == 1
			uniform vec3 sceneBoxMin;
			uniform vec3 sceneBoxMax;
		#endif

		#include <common>
		#include <packing>

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(vec3(ao), 1.)
		#endif

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
			return textureLod(tDepth, uv.xy, 0.0).DEPTH_SWIZZLING;
		}

		float fetchDepth(const ivec2 uv) {
			return texelFetch(tDepth, uv.xy, 0).DEPTH_SWIZZLING;
		}

		float getViewZ(const in float depth) {
			#if PERSPECTIVE_CAMERA == 1
				return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
			#else
				return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ? ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz : -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ? ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz : -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
			#if NORMAL_VECTOR_TYPE == 2
				return normalize(textureLod(tNormal, uv, 0.).rgb);
			#elif NORMAL_VECTOR_TYPE == 1
				return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
			#else
				return computeNormalFromDepth(uv);
			#endif
		}

		vec3 getSceneUvAndDepth(vec3 sampleViewPos) {
			vec4 sampleClipPos = cameraProjectionMatrix * vec4(sampleViewPos, 1.);
			vec2 sampleUv = sampleClipPos.xy / sampleClipPos.w * 0.5 + 0.5;
			float sampleSceneDepth = getDepth(sampleUv);
			return vec3(sampleUv, sampleSceneDepth);
		}

		void main() {
			float depth = getDepth(vUv.xy);
			if (depth >= 1.0) {
				discard;
				return;
			}
			vec3 viewPos = getViewPosition(vUv, depth);
			vec3 viewNormal = getViewNormal(vUv);

			float radiusToUse = radius;
			float distanceFalloffToUse = thickness;
			#if SCREEN_SPACE_RADIUS == 1
				float radiusScale = getViewPosition(vec2(0.5 + float(SCREEN_SPACE_RADIUS_SCALE) / resolution.x, 0.0), depth).x;
				radiusToUse *= radiusScale;
				distanceFalloffToUse *= radiusScale;
			#endif

			#if SCENE_CLIP_BOX == 1
				vec3 worldPos = (cameraWorldMatrix * vec4(viewPos, 1.0)).xyz;
				float boxDistance = length(max(vec3(0.0), max(sceneBoxMin - worldPos, worldPos - sceneBoxMax)));
				if (boxDistance > radiusToUse) {
					discard;
					return;
				}
			#endif

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
			vec3 randomVec = noiseTexel.xyz * 2.0 - 1.0;
			vec3 tangent = normalize(vec3(randomVec.xy, 0.));
			vec3 bitangent = vec3(-tangent.y, tangent.x, 0.);
			mat3 kernelMatrix = mat3(tangent, bitangent, vec3(0., 0., 1.));

			const int DIRECTIONS = SAMPLES < 30 ? 3 : 5;
			const int STEPS = (SAMPLES + DIRECTIONS - 1) / DIRECTIONS;
			float ao = 0.0;
			for (int i = 0; i < DIRECTIONS; ++i) {

				float angle = float(i) / float(DIRECTIONS) * PI;
				vec4 sampleDir = vec4(cos(angle), sin(angle), 0., 0.5 + 0.5 * noiseTexel.w);
				sampleDir.xyz = normalize(kernelMatrix * sampleDir.xyz);

				vec3 viewDir = normalize(-viewPos.xyz);
				vec3 sliceBitangent = normalize(cross(sampleDir.xyz, viewDir));
				vec3 sliceTangent = cross(sliceBitangent, viewDir);
				vec3 normalInSlice = normalize(viewNormal - sliceBitangent * dot(viewNormal, sliceBitangent));

				vec3 tangentToNormalInSlice = cross(normalInSlice, sliceBitangent);
				vec2 cosHorizons = vec2(dot(viewDir, tangentToNormalInSlice), dot(viewDir, -tangentToNormalInSlice));

				for (int j = 0; j < STEPS; ++j) {
					vec3 sampleViewOffset = sampleDir.xyz * radiusToUse * sampleDir.w * pow(float(j + 1) / float(STEPS), distanceExponent);

					vec3 sampleSceneUvDepth = getSceneUvAndDepth(viewPos + sampleViewOffset);
					vec3 sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					vec3 viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.x += max(0., (sampleCosHorizon - cosHorizons.x) * mix(1., 2. / float(j + 2), distanceFallOff));
					}

					sampleSceneUvDepth = getSceneUvAndDepth(viewPos - sampleViewOffset);
					sampleSceneViewPos = getViewPosition(sampleSceneUvDepth.xy, sampleSceneUvDepth.z);
					viewDelta = sampleSceneViewPos - viewPos;
					if (abs(viewDelta.z) < thickness) {
						float sampleCosHorizon = dot(viewDir, normalize(viewDelta));
						cosHorizons.y += max(0., (sampleCosHorizon - cosHorizons.y) * mix(1., 2. / float(j + 2), distanceFallOff));
					}
				}

				vec2 sinHorizons = sqrt(1. - cosHorizons * cosHorizons);
				float nx = dot(normalInSlice, sliceTangent);
				float ny = dot(normalInSlice, viewDir);
				float nxb = 1. / 2. * (acos(cosHorizons.y) - acos(cosHorizons.x) + sinHorizons.x * cosHorizons.x - sinHorizons.y * cosHorizons.y);
				float nyb = 1. / 2. * (2. - cosHorizons.x * cosHorizons.x - cosHorizons.y * cosHorizons.y);
				float occlusion = nx * nxb + ny * nyb;
				ao += occlusion;
			}

			ao = clamp(ao / float(DIRECTIONS), 0., 1.);
		#if SCENE_CLIP_BOX == 1
			ao = mix(ao, 1., smoothstep(0., radiusToUse, boxDistance));
		#endif
			ao = pow(ao, scale);

			gl_FragColor = FRAGMENT_OUTPUT;
		}`},Ni={name:"GTAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform sampler2D tDepth;
		uniform float cameraNear;
		uniform float cameraFar;
		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {
			#if PERSPECTIVE_CAMERA == 1
				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			#else
				return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		void main() {
			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},Fs={name:"GTAOBlendShader",uniforms:{tDiffuse:{value:null},intensity:{value:1}},vertexShader:`
		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`
		uniform float intensity;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {
			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = vec4(mix(vec3(1.), texel.rgb, intensity), texel.a);
		}`};function xo(n=5){let t=Math.floor(n)%2===0?Math.floor(n)+1:Math.floor(n),e=hl(t),i=e.length,s=new Uint8Array(i*4);for(let o=0;o<i;++o){let l=e[o],a=2*Math.PI*l/i,h=new T(Math.cos(a),Math.sin(a),0).normalize();s[o*4]=(h.x*.5+.5)*255,s[o*4+1]=(h.y*.5+.5)*255,s[o*4+2]=127,s[o*4+3]=255}let r=new Fi(s,t,t);return r.wrapS=Le,r.wrapT=Le,r.needsUpdate=!0,r}function hl(n){let t=Math.floor(n)%2===0?Math.floor(n)+1:Math.floor(n),e=t*t,i=Array(e).fill(0),s=Math.floor(t/2),r=t-1;for(let o=1;o<=e;){if(s===-1&&r===t?(r=t-2,s=0):(r===t&&(r=0),s<0&&(s=t-1)),i[s*t+r]!==0){r-=2,s++;continue}else i[s*t+r]=o++;r++,s--}return i}var ki={name:"PoissonDenoiseShader",defines:{SAMPLES:16,SAMPLE_VECTORS:Fr(16,2,1),NORMAL_VECTOR_TYPE:1,DEPTH_VALUE_SOURCE:0},uniforms:{tDiffuse:{value:null},tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},resolution:{value:new F},cameraProjectionMatrixInverse:{value:new he},lumaPhi:{value:5},depthPhi:{value:5},normalPhi:{value:5},radius:{value:4},index:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,fragmentShader:`

		varying vec2 vUv;

		uniform sampler2D tDiffuse;
		uniform sampler2D tNormal;
		uniform sampler2D tDepth;
		uniform sampler2D tNoise;
		uniform vec2 resolution;
		uniform mat4 cameraProjectionMatrixInverse;
		uniform float lumaPhi;
		uniform float depthPhi;
		uniform float normalPhi;
		uniform float radius;
		uniform int index;

		#include <common>
		#include <packing>

		#ifndef SAMPLE_LUMINANCE
		#define SAMPLE_LUMINANCE dot(vec3(0.2125, 0.7154, 0.0721), a)
		#endif

		#ifndef FRAGMENT_OUTPUT
		#define FRAGMENT_OUTPUT vec4(denoised, 1.)
		#endif

		float getLuminance(const in vec3 a) {
			return SAMPLE_LUMINANCE;
		}

		const vec3 poissonDisk[SAMPLES] = SAMPLE_VECTORS;

		vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {
			vec4 clipSpacePosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
			vec4 viewSpacePosition = cameraProjectionMatrixInverse * clipSpacePosition;
			return viewSpacePosition.xyz / viewSpacePosition.w;
		}

		float getDepth(const vec2 uv) {
		#if DEPTH_VALUE_SOURCE == 1
			return textureLod(tDepth, uv.xy, 0.0).a;
		#else
			return textureLod(tDepth, uv.xy, 0.0).r;
		#endif
		}

		float fetchDepth(const ivec2 uv) {
			#if DEPTH_VALUE_SOURCE == 1
				return texelFetch(tDepth, uv.xy, 0).a;
			#else
				return texelFetch(tDepth, uv.xy, 0).r;
			#endif
		}

		vec3 computeNormalFromDepth(const vec2 uv) {
			vec2 size = vec2(textureSize(tDepth, 0));
			ivec2 p = ivec2(uv * size);
			float c0 = fetchDepth(p);
			float l2 = fetchDepth(p - ivec2(2, 0));
			float l1 = fetchDepth(p - ivec2(1, 0));
			float r1 = fetchDepth(p + ivec2(1, 0));
			float r2 = fetchDepth(p + ivec2(2, 0));
			float b2 = fetchDepth(p - ivec2(0, 2));
			float b1 = fetchDepth(p - ivec2(0, 1));
			float t1 = fetchDepth(p + ivec2(0, 1));
			float t2 = fetchDepth(p + ivec2(0, 2));
			float dl = abs((2.0 * l1 - l2) - c0);
			float dr = abs((2.0 * r1 - r2) - c0);
			float db = abs((2.0 * b1 - b2) - c0);
			float dt = abs((2.0 * t1 - t2) - c0);
			vec3 ce = getViewPosition(uv, c0).xyz;
			vec3 dpdx = (dl < dr) ?  ce - getViewPosition((uv - vec2(1.0 / size.x, 0.0)), l1).xyz
									: -ce + getViewPosition((uv + vec2(1.0 / size.x, 0.0)), r1).xyz;
			vec3 dpdy = (db < dt) ?  ce - getViewPosition((uv - vec2(0.0, 1.0 / size.y)), b1).xyz
									: -ce + getViewPosition((uv + vec2(0.0, 1.0 / size.y)), t1).xyz;
			return normalize(cross(dpdx, dpdy));
		}

		vec3 getViewNormal(const vec2 uv) {
		#if NORMAL_VECTOR_TYPE == 2
			return normalize(textureLod(tNormal, uv, 0.).rgb);
		#elif NORMAL_VECTOR_TYPE == 1
			return unpackRGBToNormal(textureLod(tNormal, uv, 0.).rgb);
		#else
			return computeNormalFromDepth(uv);
		#endif
		}

		void denoiseSample(in vec3 center, in vec3 viewNormal, in vec3 viewPos, in vec2 sampleUv, inout vec3 denoised, inout float totalWeight) {
			vec4 sampleTexel = textureLod(tDiffuse, sampleUv, 0.0);
			float sampleDepth = getDepth(sampleUv);
			vec3 sampleNormal = getViewNormal(sampleUv);
			vec3 neighborColor = sampleTexel.rgb;
			vec3 viewPosSample = getViewPosition(sampleUv, sampleDepth);

			float normalDiff = dot(viewNormal, sampleNormal);
			float normalSimilarity = pow(max(normalDiff, 0.), normalPhi);
			float lumaDiff = abs(getLuminance(neighborColor) - getLuminance(center));
			float lumaSimilarity = max(1.0 - lumaDiff / lumaPhi, 0.0);
			float depthDiff = abs(dot(viewPos - viewPosSample, viewNormal));
			float depthSimilarity = max(1. - depthDiff / depthPhi, 0.);
			float w = lumaSimilarity * depthSimilarity * normalSimilarity;

			denoised += w * neighborColor;
			totalWeight += w;
		}

		void main() {
			float depth = getDepth(vUv.xy);
			vec3 viewNormal = getViewNormal(vUv);
			if (depth == 1. || dot(viewNormal, viewNormal) == 0.) {
				discard;
				return;
			}
			vec4 texel = textureLod(tDiffuse, vUv, 0.0);
			vec3 center = texel.rgb;
			vec3 viewPos = getViewPosition(vUv, depth);

			vec2 noiseResolution = vec2(textureSize(tNoise, 0));
			vec2 noiseUv = vUv * resolution / noiseResolution;
			vec4 noiseTexel = textureLod(tNoise, noiseUv, 0.0);
      		vec2 noiseVec = vec2(sin(noiseTexel[index % 4] * 2. * PI), cos(noiseTexel[index % 4] * 2. * PI));
    		mat2 rotationMatrix = mat2(noiseVec.x, -noiseVec.y, noiseVec.x, noiseVec.y);

			float totalWeight = 1.0;
			vec3 denoised = texel.rgb;
			for (int i = 0; i < SAMPLES; i++) {
				vec3 sampleDir = poissonDisk[i];
				vec2 offset = rotationMatrix * (sampleDir.xy * (1. + sampleDir.z * (radius - 1.)) / resolution);
				vec2 sampleUv = vUv + offset;
				denoiseSample(center, viewNormal, viewPos, sampleUv, denoised, totalWeight);
			}

			if (totalWeight > 0.) {
				denoised /= totalWeight;
			}
			gl_FragColor = FRAGMENT_OUTPUT;
		}`};function Fr(n,t,e){let i=cl(n,t,e),s="vec3[SAMPLES](";for(let r=0;r<n;r++){let o=i[r];s+=`vec3(${o.x}, ${o.y}, ${o.z})${r<n-1?",":")"}`}return s}function cl(n,t,e){let i=[];for(let s=0;s<n;s++){let r=2*Math.PI*t*s/n,o=Math.pow(s/(n-1),e);i.push(new T(Math.cos(r),Math.sin(r),o))}return i}var Ls=class{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(t,e){let i,s,r,o=.5*(Math.sqrt(3)-1),l=(t+e)*o,a=Math.floor(t+l),h=Math.floor(e+l),c=(3-Math.sqrt(3))/6,u=(a+h)*c,d=a-u,f=h-u,m=t-d,p=e-f,g,y;m>p?(g=1,y=0):(g=0,y=1);let S=m-g+c,w=p-y+c,b=m-1+2*c,x=p-1+2*c,v=a&255,M=h&255,E=this.perm[v+this.perm[M]]%12,z=this.perm[v+g+this.perm[M+y]]%12,P=this.perm[v+1+this.perm[M+1]]%12,C=.5-m*m-p*p;C<0?i=0:(C*=C,i=C*C*this._dot(this.grad3[E],m,p));let O=.5-S*S-w*w;O<0?s=0:(O*=O,s=O*O*this._dot(this.grad3[z],S,w));let H=.5-b*b-x*x;return H<0?r=0:(H*=H,r=H*H*this._dot(this.grad3[P],b,x)),70*(i+s+r)}noise3d(t,e,i){let s,r,o,l,h=(t+e+i)*.3333333333333333,c=Math.floor(t+h),u=Math.floor(e+h),d=Math.floor(i+h),f=1/6,m=(c+u+d)*f,p=c-m,g=u-m,y=d-m,S=t-p,w=e-g,b=i-y,x,v,M,E,z,P;S>=w?w>=b?(x=1,v=0,M=0,E=1,z=1,P=0):S>=b?(x=1,v=0,M=0,E=1,z=0,P=1):(x=0,v=0,M=1,E=1,z=0,P=1):w<b?(x=0,v=0,M=1,E=0,z=1,P=1):S<b?(x=0,v=1,M=0,E=0,z=1,P=1):(x=0,v=1,M=0,E=1,z=1,P=0);let C=S-x+f,O=w-v+f,H=b-M+f,X=S-E+2*f,W=w-z+2*f,Z=b-P+2*f,tt=S-1+3*f,it=w-1+3*f,I=b-1+3*f,j=c&255,st=u&255,nt=d&255,ct=this.perm[j+this.perm[st+this.perm[nt]]]%12,yt=this.perm[j+x+this.perm[st+v+this.perm[nt+M]]]%12,vt=this.perm[j+E+this.perm[st+z+this.perm[nt+P]]]%12,mt=this.perm[j+1+this.perm[st+1+this.perm[nt+1]]]%12,V=.6-S*S-w*w-b*b;V<0?s=0:(V*=V,s=V*V*this._dot3(this.grad3[ct],S,w,b));let ot=.6-C*C-O*O-H*H;ot<0?r=0:(ot*=ot,r=ot*ot*this._dot3(this.grad3[yt],C,O,H));let _=.6-X*X-W*W-Z*Z;_<0?o=0:(_*=_,o=_*_*this._dot3(this.grad3[vt],X,W,Z));let N=.6-tt*tt-it*it-I*I;return N<0?l=0:(N*=N,l=N*N*this._dot3(this.grad3[mt],tt,it,I)),32*(s+r+o+l)}noise4d(t,e,i,s){let r=this.grad4,o=this.simplex,l=this.perm,a=(Math.sqrt(5)-1)/4,h=(5-Math.sqrt(5))/20,c,u,d,f,m,p=(t+e+i+s)*a,g=Math.floor(t+p),y=Math.floor(e+p),S=Math.floor(i+p),w=Math.floor(s+p),b=(g+y+S+w)*h,x=g-b,v=y-b,M=S-b,E=w-b,z=t-x,P=e-v,C=i-M,O=s-E,H=z>P?32:0,X=z>C?16:0,W=P>C?8:0,Z=z>O?4:0,tt=P>O?2:0,it=C>O?1:0,I=H+X+W+Z+tt+it,j=o[I][0]>=3?1:0,st=o[I][1]>=3?1:0,nt=o[I][2]>=3?1:0,ct=o[I][3]>=3?1:0,yt=o[I][0]>=2?1:0,vt=o[I][1]>=2?1:0,mt=o[I][2]>=2?1:0,V=o[I][3]>=2?1:0,ot=o[I][0]>=1?1:0,_=o[I][1]>=1?1:0,N=o[I][2]>=1?1:0,L=o[I][3]>=1?1:0,bt=z-j+h,Rt=P-st+h,Dt=C-nt+h,Ee=O-ct+h,Te=z-yt+2*h,ze=P-vt+2*h,Pe=C-mt+2*h,Re=O-V+2*h,Ae=z-ot+3*h,ie=P-_+3*h,se=C-N+3*h,re=O-L+3*h,ne=z-1+4*h,oe=P-1+4*h,ae=C-1+4*h,le=O-1+4*h,Bt=g&255,It=y&255,q=S&255,li=w&255,zo=l[Bt+l[It+l[q+l[li]]]]%32,Po=l[Bt+j+l[It+st+l[q+nt+l[li+ct]]]]%32,Ro=l[Bt+yt+l[It+vt+l[q+mt+l[li+V]]]]%32,Ao=l[Bt+ot+l[It+_+l[q+N+l[li+L]]]]%32,Co=l[Bt+1+l[It+1+l[q+1+l[li+1]]]]%32,hi=.6-z*z-P*P-C*C-O*O;hi<0?c=0:(hi*=hi,c=hi*hi*this._dot4(r[zo],z,P,C,O));let ci=.6-bt*bt-Rt*Rt-Dt*Dt-Ee*Ee;ci<0?u=0:(ci*=ci,u=ci*ci*this._dot4(r[Po],bt,Rt,Dt,Ee));let ui=.6-Te*Te-ze*ze-Pe*Pe-Re*Re;ui<0?d=0:(ui*=ui,d=ui*ui*this._dot4(r[Ro],Te,ze,Pe,Re));let di=.6-Ae*Ae-ie*ie-se*se-re*re;di<0?f=0:(di*=di,f=di*di*this._dot4(r[Ao],Ae,ie,se,re));let fi=.6-ne*ne-oe*oe-ae*ae-le*le;return fi<0?m=0:(fi*=fi,m=fi*fi*this._dot4(r[Co],ne,oe,ae,le)),27*(c+u+d+f+m)}_dot(t,e,i){return t[0]*e+t[1]*i}_dot3(t,e,i,s){return t[0]*e+t[1]*i+t[2]*s}_dot4(t,e,i,s,r){return t[0]*e+t[1]*i+t[2]*s+t[3]*r}};var ai=class n extends Et{constructor(t,e,i=512,s=512,r,o,l){super(),this.width=i,this.height=s,this.clear=!0,this.camera=e,this.scene=t,this.output=0,this._renderGBuffer=!0,this._visibilityCache=[],this.blendIntensity=1,this.pdRings=2,this.pdRadiusExponent=2,this.pdSamples=16,this.gtaoNoiseTexture=xo(),this.pdNoiseTexture=this._generateNoise(),this.gtaoRenderTarget=new Ht(this.width,this.height,{type:Lt}),this.pdRenderTarget=this.gtaoRenderTarget.clone(),this.gtaoMaterial=new lt({defines:Object.assign({},Oi.defines),uniforms:Nt.clone(Oi.uniforms),vertexShader:Oi.vertexShader,fragmentShader:Oi.fragmentShader,blending:Ft,depthTest:!1,depthWrite:!1}),this.gtaoMaterial.defines.PERSPECTIVE_CAMERA=this.camera.isPerspectiveCamera?1:0,this.gtaoMaterial.uniforms.tNoise.value=this.gtaoNoiseTexture,this.gtaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.normalMaterial=new xn,this.normalMaterial.blending=Ft,this.pdMaterial=new lt({defines:Object.assign({},ki.defines),uniforms:Nt.clone(ki.uniforms),vertexShader:ki.vertexShader,fragmentShader:ki.fragmentShader,depthTest:!1,depthWrite:!1}),this.pdMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.pdMaterial.uniforms.tNoise.value=this.pdNoiseTexture,this.pdMaterial.uniforms.resolution.value.set(this.width,this.height),this.pdMaterial.uniforms.lumaPhi.value=10,this.pdMaterial.uniforms.depthPhi.value=2,this.pdMaterial.uniforms.normalPhi.value=3,this.pdMaterial.uniforms.radius.value=8,this.depthRenderMaterial=new lt({defines:Object.assign({},Ni.defines),uniforms:Nt.clone(Ni.uniforms),vertexShader:Ni.vertexShader,fragmentShader:Ni.fragmentShader,blending:Ft}),this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new lt({uniforms:Nt.clone(te.uniforms),vertexShader:te.vertexShader,fragmentShader:te.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:Ys,blendDst:pi,blendEquation:mi,blendSrcAlpha:Ws,blendDstAlpha:pi,blendEquationAlpha:mi}),this.blendMaterial=new lt({uniforms:Nt.clone(Fs.uniforms),vertexShader:Fs.vertexShader,fragmentShader:Fs.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blending:Jr,blendSrc:Ys,blendDst:pi,blendEquation:mi,blendSrcAlpha:Ws,blendDstAlpha:pi,blendEquationAlpha:mi}),this._fsQuad=new ee(null),this._originalClearColor=new D,this.setGBuffer(r?r.depthTexture:void 0,r?r.normalTexture:void 0),o!==void 0&&this.updateGtaoMaterial(o),l!==void 0&&this.updatePdMaterial(l)}setSize(t,e){this.width=t,this.height=e,this.gtaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.pdRenderTarget.setSize(t,e),this.gtaoMaterial.uniforms.resolution.value.set(t,e),this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.pdMaterial.uniforms.resolution.value.set(t,e),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)}dispose(){this.gtaoNoiseTexture.dispose(),this.pdNoiseTexture.dispose(),this.normalRenderTarget.dispose(),this.gtaoRenderTarget.dispose(),this.pdRenderTarget.dispose(),this.normalMaterial.dispose(),this.pdMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}get gtaoMap(){return this.pdRenderTarget.texture}setGBuffer(t,e){t!==void 0?(this.depthTexture=t,this.normalTexture=e,this._renderGBuffer=!1):(this.depthTexture=new dn,this.depthTexture.format=en,this.depthTexture.type=$r,this.normalRenderTarget=new Ht(this.width,this.height,{minFilter:Xs,magFilter:Xs,type:Lt,depthTexture:this.depthTexture}),this.normalTexture=this.normalRenderTarget.texture,this._renderGBuffer=!0);let i=this.normalTexture?1:0,s=this.depthTexture===this.normalTexture?"w":"x";this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE=i,this.gtaoMaterial.defines.DEPTH_SWIZZLING=s,this.gtaoMaterial.uniforms.tNormal.value=this.normalTexture,this.gtaoMaterial.uniforms.tDepth.value=this.depthTexture,this.pdMaterial.defines.NORMAL_VECTOR_TYPE=i,this.pdMaterial.defines.DEPTH_SWIZZLING=s,this.pdMaterial.uniforms.tNormal.value=this.normalTexture,this.pdMaterial.uniforms.tDepth.value=this.depthTexture,this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture}setSceneClipBox(t){t?(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX!==1,this.gtaoMaterial.defines.SCENE_CLIP_BOX=1,this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(t.min),this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(t.max)):(this.gtaoMaterial.needsUpdate=this.gtaoMaterial.defines.SCENE_CLIP_BOX===0,this.gtaoMaterial.defines.SCENE_CLIP_BOX=0)}updateGtaoMaterial(t){t.radius!==void 0&&(this.gtaoMaterial.uniforms.radius.value=t.radius),t.distanceExponent!==void 0&&(this.gtaoMaterial.uniforms.distanceExponent.value=t.distanceExponent),t.thickness!==void 0&&(this.gtaoMaterial.uniforms.thickness.value=t.thickness),t.distanceFallOff!==void 0&&(this.gtaoMaterial.uniforms.distanceFallOff.value=t.distanceFallOff,this.gtaoMaterial.needsUpdate=!0),t.scale!==void 0&&(this.gtaoMaterial.uniforms.scale.value=t.scale),t.samples!==void 0&&t.samples!==this.gtaoMaterial.defines.SAMPLES&&(this.gtaoMaterial.defines.SAMPLES=t.samples,this.gtaoMaterial.needsUpdate=!0),t.screenSpaceRadius!==void 0&&(t.screenSpaceRadius?1:0)!==this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS&&(this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS=t.screenSpaceRadius?1:0,this.gtaoMaterial.needsUpdate=!0)}updatePdMaterial(t){let e=!1;t.lumaPhi!==void 0&&(this.pdMaterial.uniforms.lumaPhi.value=t.lumaPhi),t.depthPhi!==void 0&&(this.pdMaterial.uniforms.depthPhi.value=t.depthPhi),t.normalPhi!==void 0&&(this.pdMaterial.uniforms.normalPhi.value=t.normalPhi),t.radius!==void 0&&t.radius!==this.radius&&(this.pdMaterial.uniforms.radius.value=t.radius),t.radiusExponent!==void 0&&t.radiusExponent!==this.pdRadiusExponent&&(this.pdRadiusExponent=t.radiusExponent,e=!0),t.rings!==void 0&&t.rings!==this.pdRings&&(this.pdRings=t.rings,e=!0),t.samples!==void 0&&t.samples!==this.pdSamples&&(this.pdSamples=t.samples,e=!0),e&&(this.pdMaterial.defines.SAMPLES=this.pdSamples,this.pdMaterial.defines.SAMPLE_VECTORS=Fr(this.pdSamples,this.pdRings,this.pdRadiusExponent),this.pdMaterial.needsUpdate=!0)}render(t,e,i){switch(this._renderGBuffer&&(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility()),this.gtaoMaterial.uniforms.cameraNear.value=this.camera.near,this.gtaoMaterial.uniforms.cameraFar.value=this.camera.far,this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld),this._renderPass(t,this.gtaoMaterial,this.gtaoRenderTarget,16777215,1),this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse),this._renderPass(t,this.pdMaterial,this.pdRenderTarget,16777215,1),this.output){case n.OUTPUT.Off:break;case n.OUTPUT.Diffuse:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=Ft,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case n.OUTPUT.AO:this.copyMaterial.uniforms.tDiffuse.value=this.gtaoRenderTarget.texture,this.copyMaterial.blending=Ft,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case n.OUTPUT.Denoise:this.copyMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this.copyMaterial.blending=Ft,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case n.OUTPUT.Depth:this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:e);break;case n.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=Ft,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e);break;case n.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=i.texture,this.copyMaterial.blending=Ft,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:e),this.blendMaterial.uniforms.intensity.value=this.blendIntensity,this.blendMaterial.uniforms.tDiffuse.value=this.pdRenderTarget.texture,this._renderPass(t,this.blendMaterial,this.renderToScreen?null:e);break;default:console.warn("THREE.GTAOPass: Unknown output type.")}}_renderPass(t,e,i,s,r){t.getClearColor(this._originalClearColor);let o=t.getClearAlpha(),l=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s!=null&&(t.setClearColor(s),t.setClearAlpha(r||0),t.clear()),this._fsQuad.material=e,this._fsQuad.render(t),t.autoClear=l,t.setClearColor(this._originalClearColor),t.setClearAlpha(o)}_renderOverride(t,e,i,s,r){t.getClearColor(this._originalClearColor);let o=t.getClearAlpha(),l=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s=e.clearColor||s,r=e.clearAlpha||r,s!=null&&(t.setClearColor(s),t.setClearAlpha(r||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=l,t.setClearColor(this._originalClearColor),t.setClearAlpha(o)}_overrideVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,e.push(i))})}_restoreVisibility(){let t=this._visibilityCache;for(let e=0;e<t.length;e++)t[e].visible=!0;t.length=0}_generateNoise(t=64){let e=new Ls,i=t*t*4,s=new Uint8Array(i);for(let o=0;o<t;o++)for(let l=0;l<t;l++){let a=o,h=l;s[(o*t+l)*4]=(e.noise(a,h)*.5+.5)*255,s[(o*t+l)*4+1]=(e.noise(a+t,h)*.5+.5)*255,s[(o*t+l)*4+2]=(e.noise(a,h+t)*.5+.5)*255,s[(o*t+l)*4+3]=(e.noise(a+t,h+t)*.5+.5)*255}let r=new Fi(s,t,t,tn,Kr);return r.wrapS=Le,r.wrapT=Le,r.needsUpdate=!0,r}};ai.OUTPUT={Off:-1,Default:0,Diffuse:1,Depth:2,Normal:3,AO:4,Denoise:5};var Di={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Hs=class extends Et{constructor(){super(),this.isOutputPass=!0,this.uniforms=Nt.clone(Di.uniforms),this.material=new vn({name:Di.name,uniforms:this.uniforms,vertexShader:Di.vertexShader,fragmentShader:Di.fragmentShader}),this._fsQuad=new ee(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},on.getTransfer(this._outputColorSpace)===rn&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===qr?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Wr?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Yr?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ii?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Zr?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===jr?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Xr&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var ul={uniforms:{tDiffuse:{value:null},uK:{value:.3}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uK; void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - 0.5; c.rgb *= 1.0 - uK * smoothstep(0.25, 0.85, dot(d, d) * 2.2); gl_FragColor = c; }"},Vs=class{constructor(t,e,i={}){this.r=t,this.o=i,this.camera=e;let s=t.getSize(new F),r=t.getPixelRatio(),o=new Ht(s.x*r||800,s.y*r||500,{type:Lt,samples:Pt?0:i.msaa??4});this.c=new Bs(t,o),this.rp=new Is(null,e),this.c.addPass(this.rp),i.ao&&!Pt&&(this.ao=new ai(null,e,s.x,s.y),this.ao.output=ai.OUTPUT.Default,this.ao.blendIntensity=i.ao===!0?.8:i.ao,this.ao.updateGtaoMaterial({radius:i.aoRadius??.6,distanceExponent:1,thickness:1,scale:1,samples:12}),this.c.addPass(this.ao)),i.bloom&&(this.bloom=new oi(new F(s.x/2,s.y/2),i.bloom,i.bloomRadius??.5,i.bloomThreshold??.92),this.c.addPass(this.bloom)),this.c.addPass(new Hs),i.vignette&&(this.vig=new ni(ul),this.vig.uniforms.uK.value=i.vignette,this.c.addPass(this.vig)),this.level=2,this.fpsT=0,this.fpsN=0,this.slow=0}setSize(t,e){this.c.setPixelRatio(this.r.getPixelRatio()),this.c.setSize(t,e)}render(t,e,i){if(this.rp.scene=t,this.rp.camera=e,this.ao&&(this.ao.scene=t,this.ao.camera=e),this.c.render(i),this.o.adapt!==!1&&(this.fpsT+=i,this.fpsN++,this.fpsT>=2)){let s=this.fpsN/this.fpsT;this.fpsT=0,this.fpsN=0,s<24&&this.level>0&&(this.level--,this.level===1&&this.ao?this.ao.enabled=!1:this.bloom&&(this.bloom.enabled=!1),console.info("rc3d: \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0441\u043D\u0438\u0436\u0435\u043D\u043E \u0434\u043E",this.level,"\u043A\u0430\u0434\u0440\u043E\u0432",Math.round(s)))}}};var _e=Math.PI/180,wo=typeof matchMedia<"u"&&matchMedia("(prefers-reduced-motion: reduce)").matches,Gs={linear:n=>n,in:n=>n*n*n,out:n=>1-Math.pow(1-n,3),inout:n=>n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2,in2:n=>n*n,out2:n=>1-(1-n)*(1-n)},St=n=>new T().fromArray(n),Js=n=>Array.isArray(n)?n:[n],Mo=null,So=()=>Mo||(Mo=import("./chunk-EB2GTQWS.js")),Ui=class{constructor(t,e,i={}){this.stage=t,this.scen=e,this.opts=i,this.ui=i.ui||{say(){},count(){}},this.zvuk=i.zvuk,this.base=i.base||"",this.objs={},this.groups={},this.worlds={},this.tw=[],this.spins=[],this.oscs=[],this.falls=[],this.runs=[],this.timeK=1,this.shake=0,this.follow=null,this.camTw=null,this.dragging=!1,this.visible=!0}async init(){let t=this.renderer=new _n({antialias:!0,powerPreference:"high-performance",preserveDrawingBuffer:!!window.__recAudio});t.setPixelRatio(Math.min(devicePixelRatio,Pt?1.5:2)),t.toneMapping=Ii,t.shadowMap.enabled=!0,t.shadowMap.type=Vr,t.domElement.tabIndex=0,t.domElement.setAttribute("aria-hidden","true"),this.stage.appendChild(t.domElement);let e=this.stage.clientWidth||800,i=this.stage.clientHeight||500,s=this.scen.camera||{};this.camera=new Qs(s.fov??(e<i?50:40),e/i,s.near??.1,s.far??3e4),this.controls=new Wi(this.camera,t.domElement),Object.assign(this.controls,{enableDamping:!0,enablePan:!1,minDistance:s.min??2,maxDistance:s.max??400}),this.controls.addEventListener("start",()=>{this.dragging=!0,this.camTw=null}),this.controls.addEventListener("end",()=>{this.dragging=!1});let r={objs:this.objs,globus:So},o=performance.now(),l=[{id:"main",env:this.scen.env,objects:this.scen.objects,fx:this.scen.fx,camera:this.scen.camera},...this.scen.sceny||[]];for(let h of l){let c=new yi,u=new Ds(t,c,h.env||{}),d=new ks(c),f=new xi(16756832,0,600,1.4);c.add(f);let m=this.worlds[h.id]={id:h.id,scene:c,mir:u,fx:d,flash:f,camera:h.camera||s,env:h.env||{}};await u.ready,(h.env||{}).post&&(m.post=new Vs(t,this.camera,h.env.post));for(let p of h.objects||[])await this.addObj(p,m,r);for(let p of Object.values(this.objs))if(p.world===m&&!p.o.parent){let g=p.spec.parent&&this.one(p.spec.parent);if((g?g.o:c).add(p.o),p.spec.bone&&g&&g.model){let y=g.model.bone(p.spec.bone);y?(g.o.updateMatrixWorld(!0),p.spec.snap&&p.o.position.add(g.o.worldToLocal(y.getWorldPosition(new T))),y.attach(p.o)):console.warn("rc3d: \u043D\u0435\u0442 \u043A\u043E\u0441\u0442\u0438",p.spec.bone)}if(p.spec.latlon&&g&&g.globe){let y=await So();p.o.position.copy(y.ll(g.globe.R,...p.spec.latlon)),p.o.quaternion.setFromUnitVectors(new T(0,1,0),p.o.position.clone().normalize())}}for(let p of h.fx||[])this.addFx(p,m)}for(let h of Object.values(this.objs))this.saveInit(h);this.world=this.worlds.main,this.home();let a=()=>{let h=this.stage.clientWidth,c=this.stage.clientHeight;if(!(!h||!c)){t.setSize(h,c,!1),this.camera.aspect=h/c,this.camera.updateProjectionMatrix();for(let u of Object.values(this.worlds))u.post&&u.post.setSize(h,c)}};a(),new ResizeObserver(a).observe(this.stage),new IntersectionObserver(h=>{let c=h[0].isIntersecting;c&&!this.visible&&(this.visible=!0,this.last=performance.now(),this.loop()),this.visible=c}).observe(this.stage),this.last=performance.now(),this.loop()}async addObj(t,e,i){let s=(o,l,a)=>{let h={id:o,...l,spec:a,world:e};if(l.glow0!=null)for(let c of l.mats)qe(c,l.glow0);a.hidden&&(h.o.visible=!1),this.objs[o]=h;for(let c of Js(a.group||[]))(this.groups[c]=this.groups[c]||[]).push(h);return h};if(t.copies&&t.copies.instanced){let o=fr(t.copies),l=await Ye({...t,copies:void 0,pos:void 0,rot:void 0},i),a=[];for(let u of t.parts||[]){let d=await Ye({...u},i);l.o.add(d.o)}l.o.position.fromArray(t.pos||[0,0,0]),t.rot&&l.o.rotation.set(t.rot[0]*_e,t.rot[1]*_e,t.rot[2]*_e);let h=new rt;h.add(l.o),h.updateMatrixWorld(!0),h.traverse(u=>{u.isMesh&&!u.isInstancedMesh&&a.push({geo:u.geometry.clone().applyMatrix4(u.matrixWorld),mat:u.material})});let c=jn(a,o);s(t.id,{o:c,mats:[...new Set(a.map(u=>u.mat))]},t);return}if(t.copies){let o=fr(t.copies);for(let l=0;l<o.length;l++){let a={...t,copies:void 0},h=await Ye(a,i),c=new rt;c.position.fromArray(o[l].pos),c.rotation.y=o[l].yaw,c.add(h.o);let u=s(t.id+"#"+l,{...h,o:c,inner:h.o},{...a,group:[...Js(t.group||[]),t.id]});u.k=l,await this.addParts(t,u,e,i,"#"+l)}return}let r=s(t.id||"obj"+Object.keys(this.objs).length,await Ye(t,i),t);await this.addParts(t,r,e,i,"")}async addParts(t,e,i,s,r){for(let[o,l]of(t.parts||[]).entries()){let a=(l.id||`${e.id.replace(/#\d+$/,"")}.${o}`)+r,h=await Ye({...l,copies:void 0},s),c={id:a,...h,spec:l,world:i};if(h.glow0!=null)for(let u of h.mats)qe(u,h.glow0);l.hidden&&(c.o.visible=!1),(e.inner||e.o).add(c.o),this.objs[a]=c;for(let u of[...Js(l.group||[]),...r&&l.id?[l.id]:[]])(this.groups[u]=this.groups[u]||[]).push(c);await this.addParts(l,c,i,s,r)}}addFx(t,e){let i=t.parent?this.list(t.parent):[null];i.forEach((s,r)=>{let o=e.fx.source({...t,id:i.length>1?t.id+"#"+r:t.id},s?s.inner||s.o:null);o.world=e,o.on0=t.on?t.on===!0?1:t.on:0,(this.fxAll=this.fxAll||[]).push(o),this.fxGroups=this.fxGroups||{};for(let l of[t.id,...Js(t.group||[])])(this.fxGroups[l]=this.fxGroups[l]||[]).push(o)})}saveInit(t){t.init={parent:t.o.parent,pos:t.o.position.clone(),quat:t.o.quaternion.clone(),scale:t.o.scale.clone(),vis:t.o.visible,open:t.cloth?.open,fill:t.flow?.fill,glow:t.mats.map(e=>e.userData.glow??0),op:t.mats.map(e=>e.opacity),power:t.light?.intensity}}list(t){return t==null?[]:Array.isArray(t)?t.flatMap(e=>this.list(e)):this.objs[t]?[this.objs[t]]:this.groups[t]||[]}one(t){return this.list(t)[0]}reset(){this.runs=[],this.tw=[],this.spins=[],this.oscs=[],this.timeK=1,this.shake=0,this.follow=null,this.camTw=null;for(let t of this.falls)t.chunk&&t.e.o.removeFromParent();this.falls=[];for(let t of Object.values(this.objs)){let e=t.init;e&&(t.o.parent!==e.parent&&e.parent.add(t.o),t.o.position.copy(e.pos),t.o.quaternion.copy(e.quat),t.o.scale.copy(e.scale),t.o.visible=e.vis,t.cloth&&(t.cloth.open=e.open),t.flow&&(t.flow.fill=e.fill),t.mats.forEach((i,s)=>{qe(i,e.glow[s]),i.opacity=e.op[s]}),t.light&&(t.light.intensity=e.power),t.pivots&&(t.pose=null,Qi(t.pivots,We[t.spec.pose||"stand"])),t.model&&t.model.reset())}for(let t of this.fxAll||[])t.world.fx.level(t,t.on0);for(let t of Object.values(this.worlds))t.mir.set(t.env.sky||"day"),t.flash.intensity=0;this.world!==this.worlds.main&&this.switchWorld("main",!0),this.zvuk&&this.zvuk.silence(),this.home()}home(){let t=this.world.camera||{},e=this.camera.aspect<1;this.camera.position.fromArray(e&&t.posNarrow||t.pos||[30,12,38]),this.controls.target.fromArray(t.look||[0,5,0]),this.controls.autoRotate=!!t.orbit,this.controls.autoRotateSpeed=(t.orbit||0)/6,t.fov&&(this.camera.fov=t.fov,this.camera.updateProjectionMatrix()),this.controls.update()}switchWorld(t,e){let i=this.worlds[t];if(!i||i===this.world)return;let s=this.renderer.domElement,r=()=>{this.world=i,this.follow=null,this.camTw=null,this.home(),s.style.opacity="1"};if(e){r();return}s.style.transition="opacity .35s",s.style.opacity="0",setTimeout(r,380)}run(t,{onEnd:e,instant:i}={}){let s=(t||[]).flatMap(l=>l.repeat>1?Array.from({length:l.repeat},(a,h)=>({...l,t:(l.t||0)+h*(l.every||1),repeat:0})):[l]).sort((l,a)=>(l.t||0)-(a.t||0));if(i){for(let l of s)this.fire(l,!0);return null}let r=s.reduce((l,a)=>Math.max(l,(a.t||0)+(a.dur||0)+(a.do==="voice"?1.5:0)),0),o={ev:s,i:0,T:0,end:r,onEnd:e,done:!1};return this.runs.push(o),o}stopRuns(){this.runs=[]}stepRuns(t){for(let e of this.runs){for(e.T+=t;e.i<e.ev.length&&(e.ev[e.i].t||0)<=e.T;)this.fire(e.ev[e.i++],!1);!e.done&&e.i>=e.ev.length&&e.T>=e.end&&(e.done=!0,e.onEnd&&e.onEnd())}this.runs=this.runs.filter(e=>!e.done)}tween(t,e,i="inout"){if(!t||t<=0){e(1);return}let s=Gs[i]||Gs.inout;this.tw.push({t:0,dur:t,fn:r=>e(s(r))})}fx(t){return Array.isArray(t)?t.flatMap(e=>this.fx(e)):this.fxGroups&&this.fxGroups[t]||[]}fire(t,e){let i=e?0:t.dur||0,s=t.ease||"inout",r=this,o=l=>{for(let a of this.list(t.id))l(a)};switch(t.do){case"move":o(l=>{let a=l.o.position.clone();if("osc"in t){r.oscs=r.oscs.filter(c=>c.o!==l),t.osc&&!e&&r.oscs.push({o:l,a:St(t.osc),p0:l.o.position.clone(),per:t.period||1,t:0});return}if(t.path){let c=new Hi([a,...t.path.map(St)]);r.tween(i,u=>{l.o.position.copy(c.getPoint(u)),t.orient&&r.orient(l,c.getTangent(Math.min(.999,u)))},s);return}if(t.along){let c=r.one(t.along),u=c&&(c.curve||c.flow?.geo?.parameters?.path||c.o.geometry?.parameters?.path);if(!u)return;let d=t.from??0,f=t.to??1;r.tween(i,m=>{let p=d+(f-d)*m;c.o.updateMatrixWorld();let g=c.o.localToWorld(u.getPoint(p));if(l.o.parent.worldToLocal(g),l.o.position.copy(g),t.orient){let y=c.o.localToWorld(u.getPoint(Math.min(1,p+.002)));l.o.parent.worldToLocal(y),r.orient(l,y.sub(l.o.position))}},s);return}let h=t.to?St(t.to):a.clone().add(St(t.by||[0,0,0]));if(t.face&&(h.x!==a.x||h.z!==a.z)){let c=l.o.quaternion.clone(),u=new dt().setFromAxisAngle(new T(0,1,0),Math.atan2(h.x-a.x,h.z-a.z));r.tween(Math.min(.5,i||0),d=>l.o.quaternion.slerpQuaternions(c,u,d))}r.tween(i,c=>l.o.position.lerpVectors(a,h,c),s)});break;case"rotate":o(l=>{if(t.spin){r.spins=r.spins.filter(d=>d.o!==l),t.spin.some(d=>d)&&r.spins.push({o:l,w:St(t.spin).multiplyScalar(_e)});return}let a=l.o.quaternion.clone(),h=t.to||t.by,c=new dt().setFromEuler(new ln(h[0]*_e,h[1]*_e,h[2]*_e,l.spec.order||"XYZ")),u=t.by?a.clone().multiply(c):c;r.tween(i,d=>l.o.quaternion.slerpQuaternions(a,u,d),s)});break;case"pose":o(l=>{if(l.model){l.model.pose(t.pose,e?0:t.dur??.3);return}if(!l.pivots)return;let a=We[t.pose]||We.stand,h=l.pose||We[l.spec.pose||"stand"];l.pose=a,r.tween(i,c=>Qi(l.pivots,a,c,h),s)});break;case"scale":o(l=>{let a=l.o.scale.clone(),h=Array.isArray(t.to)?St(t.to):new T().setScalar(t.to??1);r.tween(i,c=>l.o.scale.lerpVectors(a,h,c),s)});break;case"show":case"hide":o(l=>{let a=t.do==="show";if(!i||!l.mats.length){l.o.visible=a;return}let h=l.mats.map(c=>{var u;return(u=c.userData).op0??(u.op0=c.opacity)});l.o.visible=!0,l.mats.forEach(c=>{c.transparent=!0}),r.tween(i,c=>{l.mats.forEach((u,d)=>{u.opacity=h[d]*(a?c:1-c)}),c>=1&&!a&&(l.o.visible=!1)},"linear")});break;case"open":case"close":o(l=>{if(!l.cloth)return;let a=l.cloth.open,h=t.do==="close"?0:t.to??1;r.tween(i,c=>{l.cloth.open=a+(h-a)*c},t.ease||"out")});break;case"fill":o(l=>{if(!l.flow)return;let a=l.flow.fill,h=t.to??1;t.speed!=null&&(l.flow.speed=t.speed),r.tween(i,c=>{l.flow.fill=a+(h-a)*c},t.ease||"linear")});break;case"glow":o(l=>{if(l.light){let a=l.light.intensity,h=(t.to??1)*(l.spec.max??2e3);r.tween(i,c=>{l.light.intensity=a+(h-a)*c},s);return}l.mats.forEach(a=>{let h=a.userData.glow??0,c=t.to??1;r.tween(i,u=>qe(a,h+(c-h)*u,t.color),s)})});break;case"emit":{if(e&&(t.kind==="explosion"||t.kind==="puff"))break;if(t.kind==="explosion"||t.kind==="puff"){let l=this.where(t),a=this.world;t.kind==="explosion"?(a.fx.boom(l,t.size??1,t),t.quiet||(this.zvuk?.play("boom",t.size??1),a.flash.position.copy(l),a.flash.intensity=6e3*(t.size??1),this.shake=wo?0:.8*Math.min(1.5,t.size??1))):a.fx.puff(l,t.size??1,t.color?new D(t.color).toArray():void 0,t.n);break}for(let l of this.fx(t.id)){let a=l.level,h=t.level??1;r.tween(i,c=>l.world.fx.level(l,a+(h-a)*c),"linear")}break}case"stop":for(let l of this.fx(t.id)){let a=l.level;r.tween(i,h=>l.world.fx.level(l,a*(1-h)),"linear")}break;case"attach":o(l=>{let a=t.to?this.one(t.to):null;(a?a.inner||a.o:this.world.scene).attach(l.o)});break;case"fall":e||o(l=>this.fall(l,t));break;case"debris":e||this.debris(t);break;case"camera":e||this.cam(t);break;case"sky":e?this.world.mir.set(t.to):this.world.mir.to(t.to,t.dur??3);break;case"scene":this.switchWorld(t.id,e);break;case"slow":{let l=this.timeK,a=t.k??1;e?this.timeK=1:this.tween(t.dur||.01,h=>{r.timeK=l+(a-l)*h},"linear");break}case"say":e||this.ui.say(t.text,t.cls);break;case"count":if(!e)if(t.from!=null&&t.dur){let l=t.from,a=t.to??l;this.tween(t.dur,h=>r.ui.count(t.text.replace("{v}",dl(l+(a-l)*h,t.step,t.sep)),t.small),"linear")}else this.ui.count(t.text,t.small);break;case"voice":!e&&this.zvuk&&this.zvuk.voice(this.base+"zvuk/"+t.file+".mp3",{radio:t.radio}),!e&&t.text&&t.show&&this.ui.say(t.text);break;case"sound":!e&&this.zvuk&&(t.level!=null?this.zvuk.level(t.kind,t.level):this.zvuk.play(t.kind,t.k??1));break;case"shake":!e&&!wo&&(this.shake=t.k??.5);break;case"flash":if(!e){let l=this.world;l.flash.position.copy(this.where(t)),l.flash.color.set(t.color||"#ffb060"),l.flash.intensity=t.power??5e3}break;case"anim":o(l=>{l.model&&l.model.play(t.clip,{fade:e?0:t.fade??.3,speed:t.speed,once:t.once})});break;case"wait":case"end":break;default:console.warn("rc3d: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u0435",t.do)}}where(t){if(t.on){let e=this.one(t.on);if(e)return e.o.updateMatrixWorld(!0),e.o.localToWorld(St(t.offset||[0,0,0]))}return St(t.at||[0,0,0])}orient(t,e){e.lengthSq()<1e-9||t.o.quaternion.setFromUnitVectors(new T(0,1,0),e.clone().normalize())}fall(t,e){let i=this.world.scene;t.o.updateMatrixWorld(!0);let s=new T().setFromMatrixPosition(t.o.matrixWorld),r=St(e.v||[0,0,0]);e.inherit!==!1&&t.lastW&&t.vel&&r.add(t.vel),i.attach(t.o),this.falls.push({e:t,v:r,w:St(e.spin||[0,0,0]).multiplyScalar(_e),g:e.g??9.81,ground:e.ground??0,r:e.r??.5,bounce:e.bounce??.25,drag:e.drag??0,rest:!1,p:s})}debris(t){let e=this.where(t),i=Math.round((t.n??12)*(Pt?.6:1)),s=t.size??1,r=t.mat?null:this.one(t.from);for(let o=0;o<i;o++){let l=Math.random()<.35,a=s*(l?.8+Math.random()*.5:.3+Math.random()*.4),h=s*(l?1.5+Math.random()*2.5:.5+Math.random()),c=r?.mats[0]?r.mats[0].clone():new J({color:t.color||7827562,roughness:.7,metalness:.4});c.side=et,c.color&&c.color.multiplyScalar(.55);let u=new at(new pt(a,a*(.7+Math.random()*.3),h,9,1,!0,0,Math.PI*(.7+Math.random())),c);u.castShadow=!0;let d=new rt;d.add(u),d.position.copy(e).add(new T(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(2*s)),this.world.scene.add(d);let f=d.position.clone().sub(e).normalize().multiplyScalar((t.speed??15)*(.6+Math.random())).add(St(t.v||[0,0,0]));this.falls.push({e:{o:d},chunk:!0,v:f,w:new T(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(9),g:9.81,ground:t.ground??0,r:.3,bounce:.2,drag:0,rest:!1,p:d.position.clone()})}}cam(t){if(t.home){this.follow=null,this.camTw=null,this.home();return}if(t.orbit!=null&&(this.controls.autoRotate=!!t.orbit,this.controls.autoRotateSpeed=t.orbit/6),t.fov){let s=this.camera.fov,r=t.fov;this.tween(t.dur||0,o=>{this.camera.fov=s+(r-s)*o,this.camera.updateProjectionMatrix()})}if(t.follow!==void 0)if(!t.follow)this.follow=null;else{let s=this.one(t.follow);s&&(this.follow={o:s,look:St(t.lookOffset||[0,0,0])})}if(this.dragging&&!t.force)return;let e=this.camera.aspect<1,i=e?t.narrowK??1.35:1;if(t.along){let s=this.one(t.along),r=s&&(s.curve||s.flow?.geo?.parameters?.path||s.o.geometry?.parameters?.path);if(!r)return;let o=t.from??0,l=t.to??1,a=t.ahead??.03,h=St(t.lift||[0,0,0]),c=this;this.follow=null,this.camTw=null,this.tween(t.dur||1,u=>{let d=o+(l-o)*u;s.o.updateMatrixWorld(),c.camera.position.copy(s.o.localToWorld(r.getPoint(Math.min(1,d)))).add(h),c.controls.target.copy(s.o.localToWorld(r.getPoint(Math.min(1,d+a)))).add(h)},t.ease||"inout");return}if(t.offset)this.camTw={off:St(t.offset).multiplyScalar(i),t:0,dur:t.dur||.01,from:this.camera.position.clone().sub(this.controls.target),ease:Gs[t.ease||"inout"]};else if(t.pos||t.look){let s=t.pos?St(t.pos):this.camera.position.clone(),r=t.look?St(t.look):this.controls.target.clone();e&&t.pos&&s.sub(r).multiplyScalar(i).add(r),this.follow=t.follow?this.follow:null,this.camTw={p0:this.camera.position.clone(),l0:this.controls.target.clone(),p1:s,l1:r,t:0,dur:t.dur||.01,ease:Gs[t.ease||"inout"]}}}loop(){if(!this.visible||this.dead)return;requestAnimationFrame(()=>this.loop());let t=performance.now(),e=Math.min((t-this.last)/1e3,1/20);this.last=t;let i=e*this.timeK;this.onTick&&this.onTick(i),this.stepRuns(i);for(let a of this.tw)a.t+=i,a.fn(Math.min(1,a.t/a.dur));this.tw=this.tw.filter(a=>a.t<a.dur);for(let a of this.oscs)a.t+=i,a.o.o.position.copy(a.p0).addScaledVector(a.a,Math.sin(a.t/a.per*6.2832));for(let a of this.spins)a.o.o.rotateX(a.w.x*i),a.o.o.rotateY(a.w.y*i),a.o.o.rotateZ(a.w.z*i);for(let a of this.falls)a.rest||(a.v.y-=a.g*i,a.drag&&a.v.multiplyScalar(1-a.drag*i),a.p.addScaledVector(a.v,i),a.p.y<a.ground+a.r&&(a.p.y=a.ground+a.r,a.v.y=-a.v.y*a.bounce,a.v.x*=.6,a.v.z*=.6,a.w.multiplyScalar(.5),Math.abs(a.v.y)<1&&(a.rest=!0)),a.e.o.position.copy(a.p),a.e.o.rotateX(a.w.x*i),a.e.o.rotateY(a.w.y*i),a.e.o.rotateZ(a.w.z*i));this.time=(this.time||0)+i;for(let a of Object.values(this.objs))a.cloth&&a.o.visible&&a.cloth.update(i),a.flow&&a.o.visible&&a.flow.update(i),a.model&&a.world===this.world&&a.model.update(i),a.tick&&a.tick(this.time);let s=this.camera,r=this.controls.target;if(this.follow){this.follow.o.o.updateMatrixWorld(!0);let a=this.follow.o.o.localToWorld(new T).add(this.follow.look),h=a.sub(r).multiplyScalar(.25);r.add(h),s.position.add(h)}if(this.camTw){let a=this.camTw;a.t+=e;let h=a.ease(Math.min(1,a.t/a.dur));a.off?s.position.copy(r).add(a.from.clone().lerp(a.off,h)):(r.lerpVectors(a.l0,a.l1,h),s.position.lerpVectors(a.p0,a.p1,h)),a.t>=a.dur&&(this.camTw=null)}let o=this.world,l=o.env.camMinY??(o.env.ground==="none"?-1e9:.6);s.position.y<l&&(s.position.y=l),o.flash.intensity*=.86,this.shake>.01&&(s.position.add(new T(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(this.shake)),this.shake*=.9),this.controls.maxPolarAngle=o.env.ground==="none"||o.env.free?Math.PI:Math.PI*.495,this.controls.update(),o.mir.tick(i,r,Math.max(0,r.y)),o.fx.tick(i),this.zvuk&&this.zvuk.tick(),o.post?o.post.render(o.scene,s,e):this.renderer.render(o.scene,s);for(let a of Object.values(this.objs)){let h=a.o.matrixWorld.elements,c=new T(h[12],h[13],h[14]);a.lastW&&e>0&&(a.vel=c.clone().sub(a.lastW).divideScalar(Math.max(i,1e-4))),a.lastW=c}this.fpsN=(this.fpsN||0)+1,this.fpsT=(this.fpsT||0)+e,this.fpsT>=1&&(this.fps=Math.round(this.fpsN/this.fpsT),this.fpsN=0,this.fpsT=0)}},dl=(n,t,e)=>{let i=t||1,s=Math.round(n/i)*i,r=String(+s.toFixed(3)).replace(".",",");return e?r.replace(/\B(?=(\d{3})+(?!\d))/g,"\u202F"):r};var K=null,Lr=null,Fe={};function bo(){if(K)return K;let n=window.AudioContext||window.webkitAudioContext;if(!n)return null;K=new n;let t=K.sampleRate*3,e=K.createBuffer(1,t,K.sampleRate),i=e.getChannelData(0),s=0;for(let r=0;r<t;r++){let o=Math.random()*2-1;s=(s+.02*o)/1.02,i[r]=s*3.5+o*.08}return Lr=e,K}var Bi=class{constructor({muted:t=!1}={}){this.on=!t,this.lvl={},this.goal={},this.ready=!1}init(){if(this.ready){K.state==="suspended"&&K.resume();return}let t=bo();if(!t)return;this.ready=!0,this.master=t.createGain(),this.master.gain.value=this.on?.8:0,this.master.connect(t.destination),window.__recAudio&&(window.__audioDest||(window.__audioDest=t.createMediaStreamDestination(),window.__audioStream=window.__audioDest.stream),this.master.connect(window.__audioDest));let e=(r,o,l)=>{let a=t.createBufferSource();a.buffer=Lr,a.loop=!0;let h=t.createBiquadFilter();h.type=r,h.frequency.value=o,h.Q.value=l;let c=t.createGain();return c.gain.value=0,a.connect(h).connect(c).connect(this.master),a.start(0,Math.random()*2),{g:c,f:h}};this.ch={roar:e("lowpass",300,.7),hiss:e("highpass",2500,.5),wind:e("bandpass",500,.6),hum:(()=>{let r=t.createOscillator();r.type="sawtooth",r.frequency.value=50;let o=t.createBiquadFilter();o.type="lowpass",o.frequency.value=160;let l=t.createGain();return l.gain.value=0,r.connect(o).connect(l).connect(this.master),r.start(),{g:l,f:o}})()};let i=t.createOscillator();i.type="sawtooth",i.frequency.value=38;let s=t.createBiquadFilter();s.type="lowpass",s.frequency.value=90,this.subG=t.createGain(),this.subG.gain.value=0,i.connect(s).connect(this.subG).connect(this.master),i.start();for(let r of Object.keys(this.ch))this.lvl[r]=0,this.goal[r]=this.goal[r]||0}resume(){this.init(),K&&K.state==="suspended"&&K.resume()}setOn(t){this.on=t,this.master&&this.master.gain.setTargetAtTime(t?.8:0,K.currentTime,.05)}level(t,e){this.goal[t]=e}silence(){for(let t of Object.keys(this.goal))this.goal[t]=0}tick(){if(!this.ready)return;let t=K.currentTime;for(let[e,i]of Object.entries(this.ch)){let s=this.lvl[e]+=((this.goal[e]||0)-this.lvl[e])*.08,r={roar:1.1,hiss:.35,wind:.6,hum:.25}[e];i.g.gain.setTargetAtTime(s*r,t,.05),e==="roar"&&(i.f.frequency.setTargetAtTime(220+s*900+Math.random()*60*s,t,.05),this.subG.gain.setTargetAtTime(s*.35,t,.05)),e==="wind"&&i.f.frequency.setTargetAtTime(350+500*s+Math.random()*120,t,.1)}}burst({dur:t=1.5,gain:e=1,f0:i=1200,f1:s=120,q:r=.8,delay:o=0,type:l="lowpass"}){if(!this.ready)return;let a=K.currentTime+o,h=K.createBufferSource();h.buffer=Lr,h.playbackRate.value=.8+Math.random()*.4;let c=K.createBiquadFilter();c.type=l,c.Q.value=r,c.frequency.setValueAtTime(i,a),c.frequency.exponentialRampToValueAtTime(s,a+t);let u=K.createGain();u.gain.setValueAtTime(1e-4,a),u.gain.exponentialRampToValueAtTime(e,a+.02),u.gain.exponentialRampToValueAtTime(1e-4,a+t),h.connect(c).connect(u).connect(this.master),h.start(a,Math.random()*1.5),h.stop(a+t+.1)}tones(t,e="sine",i=1.6,s=.35){if(!this.ready)return;let r=K.currentTime;for(let[o,l,a]of t){let h=K.createOscillator();h.type=e,h.frequency.value=o;let c=K.createGain();c.gain.setValueAtTime(1e-4,r+l),c.gain.exponentialRampToValueAtTime(a??s,r+l+.02),c.gain.exponentialRampToValueAtTime(1e-4,r+l+i),h.connect(c).connect(this.master),h.start(r+l),h.stop(r+l+i+.1)}}play(t,e=1){if(this.ready)switch(t){case"pop":this.burst({dur:.5,gain:.8*e,f0:3500,f1:300});break;case"hit":this.tones([[180,0,.5*e],[413,0,.3*e],[767,0,.18*e]],"triangle",1.1),this.burst({dur:.35,gain:.6*e,f0:2500,f1:300});break;case"boom":this.burst({dur:3+1.5*e,gain:1.1*e,f0:1800,f1:60}),this.burst({dur:.5,gain:.9,f0:4e3,f1:400});break;case"signal":this.tones([[659,0],[880,.18],[1319,.36]].map(([i,s])=>[i,s,.35*e]));break;case"bell":this.tones([[523,0,.4*e],[1046,0,.12*e],[1568,0,.06*e]],"sine",2.4);break;case"alarm":this.tones([[440,0,.18*e],[330,.32,.18*e],[440,.64,.18*e],[330,.96,.18*e]],"square",.28);break;case"click":this.burst({dur:.06,gain:.5*e,f0:6e3,f1:2e3,type:"highpass"});break;case"whoosh":this.burst({dur:1.2,gain:.7*e,f0:300,f1:2500,q:2,type:"bandpass"});break;case"crack":this.burst({dur:.25,gain:1*e,f0:5e3,f1:700,type:"bandpass",q:.6}),this.burst({dur:.5,gain:.5*e,f0:900,f1:120,delay:.03});break;case"applause":for(let i=0;i<60;i++)this.burst({dur:.05,gain:(.15+Math.random()*.25)*e,f0:3e3+Math.random()*3e3,f1:1500,type:"bandpass",q:1.2,delay:Math.random()*2.2});break;case"creak":this.tones([[140,0,.12*e],[190,.12,.1*e],[120,.25,.1*e]],"sawtooth",.3);break;case"knock":this.tones([[90,0,.5*e],[180,0,.15*e]],"sine",.25),this.burst({dur:.12,gain:.35*e,f0:1200,f1:200});break;case"drip":this.tones([[1400+Math.random()*500,0,.18*e]],"sine",.15);break;default:break}}async load(t){if(Fe[t])return Fe[t];let e=bo();return e?(Fe[t]=fetch(t).then(i=>i.ok?i.arrayBuffer():Promise.reject(i.status)).then(i=>e.decodeAudioData(i)).then(i=>Fe[t]=i).catch(()=>Fe[t]=null),Fe[t]):null}voice(t,{radio:e=!1,gain:i=1.3}={}){let s=Fe[t];if(!this.ready||!s||s instanceof Promise)return 0;let r=K.createBufferSource();r.buffer=s;let o=r;if(e){let a=K.createBiquadFilter();a.type="highpass",a.frequency.value=320;let h=K.createBiquadFilter();h.type="lowpass",h.frequency.value=3400,o.connect(a),a.connect(h),o=h}let l=K.createGain();return l.gain.value=i,o.connect(l).connect(this.master),r.start(),s.duration}};var k=(n,t={},...e)=>{let i=document.createElement(n);for(let[s,r]of Object.entries(t))r==null||r===!1||(s==="text"?i.textContent=r:i.setAttribute(s,r===!0?"":r));for(let s of e.flat())s!=null&&i.append(s);return i},fl=(n,t,e)=>{let i=k(n,e),s=/^\*\*(.+?)\*\*\s*(.*)$/s.exec(t||"");return s?i.append(k("b",{text:s[1]})," "+s[2]):i.textContent=t||"",i},_o=(n,t)=>{typeof window.award=="function"&&window.award(n,t)},Eo=(n,t)=>({...n,objects:[...n.objects||[],...t.objects||[]],fx:[...n.fx||[],...t.fx||[]],camera:t.camera||n.camera,env:t.env||n.env});function ml(){try{let n=document.createElement("canvas");return!!(window.WebGL2RenderingContext&&n.getContext("webgl2"))}catch{return!1}}function pl(n){let t=new Set,e=i=>(i||[]).forEach(s=>s.do==="voice"&&t.add(s.file));e(n.zastavka?.timeline);for(let i of n.igra?.outcomes||[])e(i.timeline);for(let i of n.igra?.choices||[])for(let s of i.options)e(s.setup);return[...t]}var To=n=>({count:k("div",{class:"rc3-count",id:n+"Count","aria-live":"polite"}),msg:k("div",{class:"lab-msg",id:n+"Msg","aria-live":"polite"})}),Hr=n=>({say(t,e){n.msg.className="lab-msg"+(e?" "+e:""),n.msg.textContent=t||""},count(t,e){n.count.replaceChildren(),t&&(n.count.textContent=t,e&&n.count.prepend(k("small",{text:e})))}});async function gl(n,t,e){let i=t.zastavka,s=t.igra,r=ml();n.replaceChildren();let o=window.__rc3d={sc:t,ready:!1};if(i){let l=To("z"),a=k("div",{class:"rc3-stage",id:"zStage",role:"img","aria-label":i.alt||t.title}),h=k("button",{class:"btn ghost",type:"button",id:"zSnd","aria-pressed":"false",text:"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A"}),c=k("button",{class:"btn ghost",type:"button",id:"zAgain",text:"\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0441\u043D\u0430\u0447\u0430\u043B\u0430"}),u=k("div",{class:"lab rc3",id:"rc3Z","data-sostoyanie":"gruzit"},a,k("div",{class:"rc3-under"},l.count,l.msg,k("div",{class:"lab-btns"},h,c)));if(n.append(k("section",{class:"block rc3-blok",id:"zastavka"},k("div",{class:"wrap"},k("div",{class:"kicker",text:i.kicker||"\u0417\u0430\u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u043D\u044F \xB7 3D"}),k("h2",{text:i.title||t.title}),i.lead?k("p",{class:"r3-lead",text:i.lead}):null,u))),!r)u.setAttribute("data-sostoyanie","tekst"),Hr(l).say(i.tekst||"\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 3D.");else{let d=new Bi({muted:!0}),f=Hr(l),m=new Ui(a,Eo(t,i),{ui:f,zvuk:d,base:e});await m.init(),d.init();for(let b of pl(t))d.load(e+"zvuk/"+b+".mp3");u.setAttribute("data-sostoyanie","gotovo");let p=0,g=0,y=!1,S=()=>{clearTimeout(g),m.reset(),f.count(""),f.say(i.start||""),p++,o.z.cycle=p,o.z.done=!1,m.run(i.timeline,{onEnd:()=>{o.z.done=!0,i.loop!==!1&&(g=setTimeout(S,(i.pause??2.5)*1e3))}})},w=()=>{d.resume(),d.setOn(!d.on||h.getAttribute("aria-pressed")!=="true"),h.setAttribute("aria-pressed",d.on?"true":"false"),h.textContent=d.on?"\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A":"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0437\u0432\u0443\u043A"};h.addEventListener("click",w),a.addEventListener("click",()=>{d.on||w()}),c.addEventListener("click",()=>{d.resume(),S()}),o.z={S:m,play:S,cycle:0,done:!1,st:()=>({cycle:p,done:o.z.done})},new IntersectionObserver(b=>{b[0].isIntersecting&&!y&&(y=!0,S())}).observe(a)}}if(s){let l=To("g"),a=k("div",{class:"rc3-stage",id:"gStage",role:"img","aria-label":s.alt||t.title}),h=k("p",{class:"igra-seychas",id:"gHint"}),c=_=>{h.replaceChildren();let N=/^(Что сделать сейчас:)\s*(.*)$/s.exec(_||"");N?h.append(k("b",{text:N[1]})," "+N[2]):h.textContent=_||""},u={},d=[],f=(s.choices||[]).map((_,N)=>{u[_.id]=_.default||_.options[0].id;let L="gq"+N;return k("div",{class:"lab-row",role:"group","aria-labelledby":L},k("span",{class:"lbl",id:L,text:`${N+1}. ${_.label}`}),_.options.map(bt=>{let Rt=k("button",{class:"seg",type:"button","data-k":_.id,"data-v":bt.id,"aria-pressed":u[_.id]===bt.id?"true":"false",text:bt.label});return d.push(Rt),Rt}))}),m=s.pilot?await import("./chunk-K2RFEHHZ.js"):null,p=m?m.knopki(s.pilot,k):null,g=k("button",{class:"btn gold",type:"button",id:"gGo",text:s.button||"\u041F\u0443\u0441\u043A"}),y=k("button",{class:"btn ghost",type:"button",id:"gReset",text:s.resetLabel||"\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E"}),S=k("button",{class:"btn ghost",type:"button",id:"gSnd","aria-pressed":"true",text:"\u0417\u0432\u0443\u043A: \u0432\u043A\u043B\u044E\u0447\u0451\u043D"}),w=[...new Set((s.outcomes||[]).filter(_=>_.result==="fail"&&_.reason).map(_=>_.reason))],b=k("div",{class:"lab-found",id:"gFound"}),x=k("div",{class:"lab rc3",id:"rc3G","data-sostoyanie":"gruzit"},a,k("div",{class:"rc3-under"},l.count,k("div",{class:"rc3-ctrl",id:"gCtrl"},f,p?p.ctrl:null,k("div",{class:"lab-btns"},g,y,S)),l.msg,b)),v=s.rules||{},M=k("div",{class:"igra-pravila","data-igra-pravila":!0},k("h2",{class:"igra-pravila-h",text:"\u041A\u0430\u043A \u0438\u0433\u0440\u0430\u0442\u044C"}),k("p",{class:"igra-pravila-zachem",text:v.zachem||""}),k("ol",{class:"igra-pravila-shagi"},(v.shagi||[]).map(_=>fl("li",_))),(v.oshibki||[]).map(_=>k("p",{class:"igra-pravila-nyuans",text:_})),v.povtor?k("p",{class:"igra-pravila-nyuans",text:v.povtor}):null,v.final?k("p",{class:"igra-pravila-final",text:v.final}):null);n.append(k("section",{class:"block rc3-blok",id:"igra"},k("div",{class:"wrap"},k("div",{class:"kicker",text:s.kicker||"\u0418\u0433\u0440\u0430 \u0432 3D"}),k("h2",{text:s.title||t.title}),s.lead?k("p",{class:"r3-lead",text:s.lead}):null,h,x,M,t.istochniki?k("p",{class:"src-note",text:t.istochniki}):null)));let E=Hr(l),z=_=>{b.textContent=w.length?`\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u0440\u0438\u0447\u0438\u043D \u043D\u0435\u0443\u0434\u0430\u0447\u0438: ${Object.keys(_).length} \u0438\u0437 ${w.length}.`:""};if(!r){x.setAttribute("data-sostoyanie","tekst"),E.say(s.tekst||"\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 3D.");return}let P=new Bi,C=new Ui(a,Eo(t,s),{ui:E,zvuk:P,base:e});await C.init(),P.init(),x.setAttribute("data-sostoyanie","gotovo");let O="vybor",H=null,X=!1,W={},Z={},tt=()=>(s.choices||[]).map(_=>u[_.id]).join("|"),it=()=>(s.outcomes||[]).find(_=>Object.entries(_.when||{}).every(([N,L])=>L==="*"||(Array.isArray(L)?L.includes(u[N]):u[N]===L))),I=(_,N)=>s.choices.find(L=>L.id===_).options.find(L=>L.id===N),j=_=>{for(let N of[...d,g])N.disabled=_},st=p?[p.brake,p.thrust,...Object.values(p.dirs)]:[],nt=_=>{for(let N of st)N.disabled=_},ct=_=>{C.reset(),E.count("");for(let N of s.choices||[]){let L=I(N.id,u[N.id]);L.setup&&N.id!==_&&C.run(L.setup,{instant:!0})}if(_){let N=I(_,u[_]);N.setup&&C.run(N.setup)}yt()},yt=()=>{let _=it();_&&_.preview&&E.count(_.preview,_.previewSmall)},vt=()=>(s.outcomes||[]).filter(_=>_.result==="fail"&&_.reason&&!W[_.reason]).map(_=>_.try||Object.entries(_.when||{}).filter(([,N])=>N!=="*").map(([N,L])=>I(N,Array.isArray(L)?L[0]:L).label.toLowerCase()).join(" + ")),mt=_=>{if(O="itog",j(!1),Z[tt()]=_.result,_.title&&E.count(_.title,_.small),_.result==="ok"){E.say(_.text||"\u041F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C!","ok"),X||(X=!0,_o(s.awardKey||"lab",s.points??30));let N=[...new Set(vt())];c(_.hint||(N.length?"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C! \u0427\u0442\u043E\u0431\u044B \u043D\u0430\u0439\u0442\u0438 \u0432\u0441\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u044B \u043D\u0435\u0443\u0434\u0430\u0447\u0438, \u043D\u0430\u0436\u043C\u0438 \xAB"+y.textContent+"\xBB \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439: "+N.join("; ")+".":"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E \u0432\u0441\u0451 \u2014 \u0432\u0435\u0440\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043D\u0430\u0439\u0434\u0435\u043D, \u0432\u0441\u0435 \u043F\u0440\u0438\u0447\u0438\u043D\u044B \u043D\u0435\u0443\u0434\u0430\u0447\u0438 \u0442\u043E\u0436\u0435. \u041C\u043E\u0436\u043D\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430 \u0438 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0441 \u0434\u0440\u0443\u0433\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D."))}else E.say(_.text||"\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C.","bad"),_.reason&&!W[_.reason]&&(W[_.reason]=1,_o("why_"+_.reason,_.points??10),z(W)),c(_.hint||"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043D\u0430\u0436\u043C\u0438 \xAB"+y.textContent+"\xBB \u0438 \u043F\u043E\u043C\u0435\u043D\u044F\u0439 \u0432\u044B\u0431\u043E\u0440.");o.g.result=_.result,o.g.last=_.id},V=()=>{if(O==="pusk")return;P.resume(),O==="itog"&&ct(null);let _=it();if(!_){E.say("\u0414\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u043E\u0447\u0435\u0442\u0430\u043D\u0438\u044F \u043D\u0435\u0442 \u0438\u0441\u0445\u043E\u0434\u0430 \u0432 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0438.","bad");return}O="pusk",j(!0),H=_,o.g.result=null;let N=Z[tt()];E.say(N==="fail"?s.again||"\u0422\u0430\u043A \u0442\u044B \u0443\u0436\u0435 \u043F\u0440\u043E\u0431\u043E\u0432\u0430\u043B, \u0438 \u043D\u0435 \u0432\u044B\u0448\u043B\u043E. \u0421\u043C\u043E\u0442\u0440\u0438 \u0432\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C\u043D\u043E, \u0432 \u043A\u0430\u043A\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0432\u0441\u0451 \u0441\u043E\u0440\u0432\u0451\u0442\u0441\u044F.":_.startSay||s.startSay||"\u0421\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u0441\u0446\u0435\u043D\u0443."),c(s.watchHint||"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0436\u0438\u043C\u0430\u0439 \u2014 \u0441\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u0441\u0446\u0435\u043D\u0443 \u0438 \u0447\u0438\u0442\u0430\u0439 \u043F\u043E\u0434 \u043D\u0435\u0439, \u0447\u0442\u043E \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442."),C.run(_.timeline,{onEnd:()=>mt(_)})},ot=null;m&&(ot=m.pilot(C,s,p,{ui:E,hint:c,stage:a,box:x,zv:P,lock:nt,finish:_=>{mt(_),nt(!0)}}),nt(!0),ct=()=>ot.prepare(),V=()=>{P.resume(),O!=="pusk"&&(O==="itog"&&ot.prepare(),O="pusk",o.g.result=null,g.disabled=!0,nt(!1),ot.go(),c(s.watchHint||"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u0434\u0435\u0440\u0436\u0438 \u0446\u0435\u043B\u044C \u0432 \u043A\u0440\u0443\u0433\u0435 \u0438 \u0442\u043E\u0440\u043C\u043E\u0437\u0438."))}),d.forEach(_=>_.addEventListener("click",()=>{if(O==="pusk")return;let N=_.dataset.k,L=_.dataset.v;d.filter(Dt=>Dt.dataset.k===N).forEach(Dt=>Dt.setAttribute("aria-pressed",Dt===_?"true":"false"));let bt=u[N]!==L||O==="itog";u[N]=L,O="vybor",bt?ct(N):yt();let Rt=I(N,L);Rt.say&&E.say(Rt.say)})),g.addEventListener("click",V),y.addEventListener("click",()=>{O="vybor",j(!1),nt(!0),ct(null),E.say(s.resetSay||"\u0412\u0441\u0451 \u0441\u043D\u043E\u0432\u0430 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435. \u0423\u0436\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043D\u044B\u0435 \u0431\u0430\u043B\u043B\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u043D\u0435 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u044E\u0442\u0441\u044F."),c(s.hint||"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u0432\u044B\u0431\u0435\u0440\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB"+g.textContent+"\xBB.")}),S.addEventListener("click",()=>{P.resume(),P.setOn(!P.on),S.setAttribute("aria-pressed",P.on?"true":"false"),S.textContent=P.on?"\u0417\u0432\u0443\u043A: \u0432\u043A\u043B\u044E\u0447\u0451\u043D":"\u0417\u0432\u0443\u043A: \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D"}),ct(null),z(W),c(s.hint||"\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: \u0432\u044B\u0431\u0435\u0440\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0438 \u043D\u0430\u0436\u043C\u0438 \xAB"+g.textContent+"\xBB. \u0421\u0446\u0435\u043D\u0443 \u043C\u043E\u0436\u043D\u043E \u043A\u0440\u0443\u0442\u0438\u0442\u044C \u043F\u0430\u043B\u044C\u0446\u0435\u043C \u0438\u043B\u0438 \u043C\u044B\u0448\u044C\u044E."),E.say(s.startText||""),o.g={S:C,sel:u,pick:(_,N)=>d.find(L=>L.dataset.k===_&&L.dataset.v===N).click(),go:V,reset:()=>y.click(),st:()=>({...ot?{...ot.pst(),polyot:ot.pst().phase}:{},phase:O,result:o.g.result,last:o.g.last,found:Object.keys(W).length,fails:w.length}),pilot:ot,combos:()=>(s.choices||[]).reduce((_,N)=>_.flatMap(L=>N.options.map(bt=>({...L,[N.id]:bt.id}))),[{}])}}o.ready=!0}async function yl(){let n=document.getElementById("rc3d");if(!n)return;let t=(new URLSearchParams(location.search).get("s")||n.dataset.s||"").replace(/[^a-z0-9\-_]/gi,"");if(!t){n.textContent="\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0439: \u0434\u043E\u0431\u0430\u0432\u044C ?s=\u0438\u043C\u044F.";return}let e=new URL("./scen/",import.meta.url).href;try{let i=await fetch(e+t+".json",{cache:"no-cache"});if(!i.ok)throw new Error("\u043D\u0435\u0442 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u044F "+t);let s=await i.json();n.dataset.s||(document.title=s.title+" \xB7 3D"),await gl(n,s,e+t+"/")}catch(i){console.error("rc3d",i),n.textContent="\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043B\u0441\u044F: "+i.message}}yl();export{yl as avtozapusk,gl as zapusk};
