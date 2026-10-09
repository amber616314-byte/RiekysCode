export function segmentDistanceSquared(a,b,p){
  const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
  const length=dx*dx+dy*dy+dz*dz;
  const t=length===0?0:Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy+(p.z-a.z)*dz)/length));
  return (a.x+t*dx-p.x)**2+(a.y+t*dy-p.y)**2+(a.z+t*dz-p.z)**2;
}
export function targetInCone(player,target,maxRange=1000){
  const forward=player.z-target.z;
  return forward>12&&forward<maxRange&&Math.abs(target.x-player.x)<forward*.19+7&&Math.abs(target.y-player.y)<forward*.14+8;
}
export function waveAt(seconds){return Math.min(4,Math.floor(seconds/25)+1);}
