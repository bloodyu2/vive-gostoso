import { chromium } from '@playwright/test'
const base='http://localhost:3000'
const b=await chromium.launch()
const ctx=await b.newContext({viewport:{width:390,height:844}})
await ctx.addInitScript(()=>{try{localStorage.setItem('vg_cookie_consent','accepted')}catch(e){}})
const p=await ctx.newPage()
await p.goto(base+'/negocio/positano-restaurante',{waitUntil:'networkidle',timeout:60000})
await p.waitForTimeout(800)
// barra no topo (sidebar fora de vista)
const info=await p.evaluate(()=>{
  const bar=[...document.querySelectorAll('div')].find(d=>d.className.includes('fixed')&&d.className.includes('bottom-0')&&d.className.includes('z-40'))
  return {achou:!!bar, classes:bar?bar.className:null}
})
console.log('barra no topo:', JSON.stringify(info))
await p.screenshot({path:'qa/rodada-magicui/negocio-390-topo.png'})
// blog progress: recortar o topo
await p.goto(base+'/blog/kitesurf-sao-miguel-do-gostoso',{waitUntil:'networkidle',timeout:60000})
await p.evaluate(()=>window.scrollTo(0,2600))
await p.waitForTimeout(900)
await p.screenshot({path:'qa/rodada-magicui/blogpost-390-topo.png', clip:{x:0,y:0,width:390,height:60}})
const prog=await p.evaluate(()=>{
  const el=[...document.querySelectorAll('div')].find(d=>d.className.includes('origin-left')&&d.className.includes('bg-teal'))
  return el?getComputedStyle(el).transform:null
})
console.log('progress transform:', prog)
await b.close()
