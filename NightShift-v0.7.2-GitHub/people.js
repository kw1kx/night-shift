// Original game-ready procedural character meshes. Not photographic scans.
export function makePerson(T,opts){
 const root=new T.Group();const female=!!opts.female;const skin=new T.Color(opts.skin),hair=new T.Color(opts.hair),cloth=new T.Color(opts.shirt);const pants=new T.Color(female?0x31373a:0x42464a);
 const material=(color,roughness=.85)=>new T.MeshStandardMaterial({color,roughness});
 const colored=new T.MeshStandardMaterial({vertexColors:true,roughness:.87});
 function put(parent,geo,mat,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function g(parent,x,y,z){const o=new T.Group();o.position.set(x,y,z);parent.add(o);return o;}
 function interp(rows,y){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const a=rows[i],b=rows[i+1],f=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));return a.map((v,j)=>v+(b[j]-v)*f);}
 const bell=(x,w)=>Math.exp(-((x/w)**2));
 function loft(parent,rows,base,{segments=48,steps=36,adjust,paint}={}){const xyz=[],rgb=[],index=[];const start=rows[0][0],end=rows.at(-1)[0];for(let i=0;i<=steps;i++){const y=start+(end-start)*i/steps;const [,rx,rz,cx=0,cz=0]=interp(rows,y);for(let j=0;j<=segments;j++){let a=j/segments*Math.PI*2,x=cx+Math.sin(a)*rx,z=cz+Math.cos(a)*rz;let q=adjust?adjust(x,y,z,a):[x,y,z];xyz.push(...q);let color=base.clone();if(paint)paint(color,q[0],q[1],q[2],a);rgb.push(color.r,color.g,color.b);}}
 for(let i=0;i<steps;i++)for(let j=0;j<segments;j++){let a=i*(segments+1)+j,b=a+segments+1;index.push(a,a+1,b,a+1,b+1,b);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(xyz,3));geo.setAttribute('color',new T.Float32BufferAttribute(rgb,3));geo.setIndex(index);geo.computeVertexNormals();return put(parent,geo,colored);}
 const fabric=(c,x,y,z,a)=>{const n=Math.sin(y*95+Math.cos(a*4)*2)*.018+Math.cos(a*17+y*24)*.013+Math.sin(a*44+y*83)*.007;c.multiplyScalar(1+n);};
 const wrinkle=(x,y,z,a)=>{const f=1+.014*Math.sin(y*87+Math.cos(a*5)*2)+.009*Math.cos(a*11+y*34);return [x*f,y,z*f];};
 // Body: shaped shoulders, tapered waist, natural hips, sleeves and trousers.
 const torsoRows=[[.87,.01,.01,0,0],[.90,female?.155:.157,.094,0,-.008],[1.0,female?.145:.164,.096,0,-.005],[1.10,female?.132:.163,.092,0,0],[1.23,female?.16:.18,.108,0,.004],[1.34,female?.172:.192,.108,0,0],[1.40,female?.176:.205,.087,0,-.006],[1.45,.12,.073,0,-.008],[1.47,.065,.058,0,-.006],[1.48,.001,.001,0,0]];
 loft(root,torsoRows,cloth,{adjust:wrinkle,paint:fabric});
 loft(root,[[.84,.001,.001,0,0],[.87,.15,.09,0,0],[.97,.157,.10,0,0],[1.0,.14,.087,0,0],[1.01,.001,.001,0,0]],pants,{paint:fabric});
 loft(root,[[1.43,.048,.046,0,0],[1.49,.054,.045,0,0],[1.55,.046,.044,0,0],[1.56,.001,.001,0,0]],skin);
 // Thin neckline and seams (no separate ball shoulders).
 const collar=put(root,new T.TorusGeometry(.061,.011,8,32),material(cloth.clone().multiplyScalar(.62)),0,1.459,0);collar.rotation.x=Math.PI/2;collar.scale.y=.84;
 const legs=[],arms=[];
 for(const side of [-1,1]){const leg=g(root,side*.083,.91,0);legs.push(leg);loft(leg,[[-.83,.001,.001,0,.012],[-.80,.050,.055,0,.01],[-.68,.054,.06,0,-.005],[-.54,.067,.074,0,-.012],[-.43,.063,.065,0,.008],[-.31,.079,.079,0,0],[-.13,.083,.084,0,0],[.01,.075,.081,0,0],[.035,.001,.001,0,0]],pants,{adjust:wrinkle,paint:fabric});
 loft(leg,[[-.91,.001,.001,0,.07],[-.90,.061,.126,0,.057],[-.87,.062,.132,0,.058],[-.82,.059,.106,0,.048],[-.78,.046,.052,0,.012],[-.76,.001,.001,0,0]],new T.Color(0x242527),{paint:(c,x,y,z,a)=>{if(y<-.875)c.multiplyScalar(.55);else fabric(c,x,y,z,a);}});
 const arm=g(root,side*(female?.169:.192),1.389,0);arm.rotation.z=side*.09;arms.push(arm);
 const sleeve=female?-.20:-.32;
 loft(arm,[[sleeve-.012,.001,.001,0,0],[sleeve,.047,.045,0,0],[-.14,.058,.061,0,0],[-.05,.065,.065,0,0],[.025,.060,.054,0,0],[.065,.001,.001,0,0]],cloth,{paint:fabric});
 loft(arm,[[-.55,.001,.001,0,.008],[-.53,.028,.025,0,.008],[-.44,.034,.031,0,.001],[Math.min(-.34,sleeve-.04),.042,.039,0,0],[sleeve+.025,.044,.043,0,0],[sleeve+.04,.001,.001,0,0]],skin);
 // Hand with a shaped palm, individual short finger meshes held naturally together.
 loft(arm,[[-.68,.001,.001,0,.009],[-.665,.025,.018,0,.008],[-.61,.034,.024,0,.008],[-.55,.029,.022,0,.005],[-.52,.001,.001,0,0]],skin,{segments:24,steps:16});
 for(let i=0;i<4;i++){const f=put(arm,new T.CapsuleGeometry(.0078,.038+(i===1?.008:0),3,8),material(skin),-.022+i*.014,-.662,.009);f.rotation.z=(i-1.5)*.035;}
 const thumb=put(arm,new T.CapsuleGeometry(.010,.034,4,8),material(skin),-side*.032,-.608,.023);thumb.rotation.z=side*.45;
 }
 // Head: continuous surface with sculpted brow, cheeks, chin, nose and orbital recesses.
 const headRows=[[1.505,.001,.001,0,.015],[1.52,.045,.048,0,.014],[1.54,.067,.063,0,.004],[1.57,.079,.073,0,-.003],[1.60,.086,.080,0,-.005],[1.635,.089,.082,0,-.008],[1.67,.091,.085,0,-.009],[1.70,.088,.082,0,-.010],[1.73,.075,.071,0,-.012],[1.755,.044,.047,0,-.012],[1.771,.001,.001,0,-.012]];
 const faceShape=(x,y,z,a)=>{let front=Math.max(0,Math.cos(a));front=front**5;const nose=.027*bell(x,.019)*bell(y-1.618,.024)+.012*bell(x,.026)*bell(y-1.643,.030);const eyes=.012*bell(Math.abs(x)-.035,.021)*bell(y-1.650,.015);const cheek=.007*bell(Math.abs(x)-.055,.025)*bell(y-1.614,.022);const lips=.005*bell(x,.029)*bell(y-1.574,.010);return [x,y,z+front*(nose-eyes+cheek+lips)];};
 function facePaint(c,x,y,z,a){let f=Math.max(0,Math.cos(a));const orbital=bell(Math.abs(x)-.034,.025)*bell(y-1.650,.019)*f;const beard=(!female?.09:.018)*bell(y-1.557,.025)*f;let shade=1-.15*orbital-beard-.055*bell(y-1.523,.013);c.multiplyScalar(shade);const cheeks=.05*bell(Math.abs(x)-.055,.024)*bell(y-1.605,.024)*f;c.r+=cheeks;c.g-=cheeks*.30;const lip=bell(x,.026)*bell(y-1.575,.006)*f;c.lerp(new T.Color(0x855b53),lip*.54);const nostril=bell(Math.abs(x)-.014,.006)*bell(y-1.603,.005)*f;c.multiplyScalar(1-.36*nostril);}
 loft(root,headRows,skin,{segments:96,steps:100,adjust:faceShape,paint:facePaint});
 function surfaceZ(x,y){const [,rx,rz,,cz]=interp(headRows,y);const a=Math.asin(Math.max(-.999,Math.min(.999,x/rx)));return faceShape(x,y,cz+rz*Math.cos(a),a)[2];}
 function facePatch(cx,cy,rx,ry,color,kind){const v=[],cs=[],ind=[],steps=10,n=36;for(let i=0;i<=steps;i++){let f=i/steps;for(let j=0;j<=n;j++){let a=j/n*Math.PI*2,dx=Math.cos(a)*rx*f,dy=Math.sin(a)*ry*f;let x=cx+dx,y=cy+dy+(kind==='eye'?dx*.06:0);v.push(x,y,surfaceZ(x,y)+.0009);let c=color.clone();if(kind==='eye'){let d=Math.hypot(dx,dy);if(d<.0042)c.set(0x222424);else if(d<.0067)c.set(0x665c4c);else if(f>.86)c.set(0x68574e);}else if(kind==='lip')c.multiplyScalar(.88+.12*Math.abs(Math.cos(a)));cs.push(c.r,c.g,c.b);}}
 for(let i=0;i<steps;i++)for(let j=0;j<n;j++){let a=i*(n+1)+j,b=a+n+1;ind.push(a,b,a+1,a+1,b,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('color',new T.Float32BufferAttribute(cs,3));geo.setIndex(ind);geo.computeVertexNormals();let m=colored.clone();m.side=T.DoubleSide;put(root,geo,m);}
 for(const side of [-1,1]){facePatch(side*.034,1.650,.014,.0047,new T.Color(0xb4aca0),'eye');facePatch(side*.035,1.669,.017,.0028,hair.clone().multiplyScalar(.70),'brow');const e=put(root,new T.SphereGeometry(1,20,16),material(skin),side*.087,1.633,-.012);e.scale.set(.013,.026,.015);const e2=put(root,new T.SphereGeometry(1,12,10),material(skin.clone().multiplyScalar(.75)),side*.096,1.633,-.008);e2.scale.set(.004,.013,.009);}
 facePatch(0,1.575,.024,.0022,new T.Color(0x63433e),'lip');
 // Hair cap with irregular part, tapered sides and a continuous back silhouette.
 const hrows=[[1.622,.083,.078,0,-.019],[1.665,.094,.09,0,-.013],[1.70,.096,.091,0,-.013],[1.735,.080,.078,0,-.014],[1.765,.051,.053,0,-.014],[1.783,.001,.001,0,-.014]];
 // Build hair as partial radial surface: front hairline higher, back lower.
 const hv=[],hc=[],hi=[],hn=64,hs=26;
 for(let i=0;i<=hs;i++)for(let j=0;j<=hn;j++){const a=j/hn*Math.PI*2,front=Math.max(0,Math.cos(a));let lo=female?1.56+.137*front**1.3:1.61+.087*front**1.7;lo+=.008*Math.sin(a*3+.4)*front;const y=lo+(1.783-lo)*i/hs;const [,rx,rz,,cz]=interp(hrows,Math.max(1.622,y));let x=Math.sin(a)*rx,z=cz+Math.cos(a)*rz;if(y<1.622){x*=.98;z-=.009;}hv.push(x,y,z);let c=hair.clone().multiplyScalar(.86+.15*Math.sin(a*30+i*.27)**2+.045*Math.sin(a*72));hc.push(c.r,c.g,c.b);}
 for(let i=0;i<hs;i++)for(let j=0;j<hn;j++){const a=i*(hn+1)+j,b=a+hn+1;hi.push(a,a+1,b,a+1,b+1,b);}const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hv,3));hg.setAttribute('color',new T.Float32BufferAttribute(hc,3));hg.setIndex(hi);hg.computeVertexNormals();let hm=colored.clone();hm.side=T.DoubleSide;put(root,hg,hm);
 if(female){loft(root,[[1.43,.001,.001,0,-.065],[1.48,.085,.038,0,-.075],[1.56,.093,.041,0,-.07],[1.63,.09,.038,0,-.065],[1.69,.07,.023,0,-.060],[1.70,.001,.001,0,-.06]],hair,{paint:fabric});}
 root.userData={legs,arms};return root;
}
