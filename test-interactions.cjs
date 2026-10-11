// Exercise the shipped JavaScript with native Node assertions and a small DOM fixture.
// These are interaction tests, not a substitute for a rendered browser review.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
 constructor(id='') { this.id=id; this.attrs={}; this.events={}; this.dataset={}; this.textContent=''; this.open=false; this.focused=false; this.href=''; this.classes=new Set(); this.classList={remove:x=>this.classes.delete(x),contains:x=>this.classes.has(x),toggle:x=>{if(this.classes.has(x)){this.classes.delete(x);return false}this.classes.add(x);return true}}; }
 setAttribute(k,v){this.attrs[k]=v}
 addEventListener(k,fn){(this.events[k]??=[]).push(fn)}
 dispatch(k,e={}){for(const fn of this.events[k]??[])fn(e)}
 contains(el){return el===this||el===menu||el===nav}
 focus(){this.focused=true}
 showModal(){this.open=true}
 close(){this.open=false}
 querySelectorAll(){return []}
 getBoundingClientRect(){return {left:0,top:0,right:500,bottom:500}}
}
const menu=new Element(),header=new Element(),nav=new Element(),review=new Element(),draft=new Element();
const field=new Element(); field.dataset.dialogOpen='review-notes';
const form=new Element(); form.valid=true; form.reportValidity=()=>form.valid;
form.elements={service:{value:'',options:[{value:'Solutions'},{value:'Voice & data'},{value:'Consulting'}]}};
const elements={'.menu-toggle':menu,'.header':header,'#primary-nav':nav,'#inquiry-form':form,'#draft-subject':new Element(),'#draft-body':new Element(),'#open-draft':new Element(),'#email-draft':draft,'#form-status':new Element()};
const section=new Element('validation');section.tagName='DETAILS';
const document=new Element();document.querySelector=s=>elements[s]??null;document.querySelectorAll=s=>s==='dialog'?[review,draft]:s==='[data-dialog-open]'?[field]:[];document.getElementById=id=>({'review-notes':review,'validation':section}[id]);
const media=new Element();const window=new Element();window.matchMedia=()=>media;
const location={search:'?service=Voice%20%26%20data',hash:'#validation'};
const fields={name:'Rajeev',company:'Review company',email:'review@example.com',service:'Solutions',message:'Please discuss branch network integration.'};
class FormData {get(k){return fields[k]}}
vm.runInNewContext(fs.readFileSync('dist/assets/site.js','utf8'),{document,window,location,URLSearchParams,FormData,Date,encodeURIComponent,decodeURIComponent});
assert(section.open,'Deep-linked solution should expand');
assert.equal(form.elements.service.value,'Voice & data','Service query should select relevant inquiry topic');
menu.dispatch('click');assert(header.classList.contains('menu-open'));assert.equal(menu.attrs['aria-expanded'],'true');
document.dispatch('keydown',{key:'Escape'});assert(!header.classList.contains('menu-open'));assert.equal(menu.attrs['aria-expanded'],'false');assert(menu.focused);
menu.dispatch('click');document.dispatch('click',{target:new Element()});assert(!header.classList.contains('menu-open'));
menu.dispatch('click');media.dispatch('change',{matches:true});assert(!header.classList.contains('menu-open'));
field.dispatch('click');assert(review.open,'Review notes dialog should open');
location.hash='#%';assert.doesNotThrow(()=>window.dispatch('hashchange'),'Malformed deep link should not break page interactions');
let prevented=false;form.valid=false;form.dispatch('submit',{preventDefault(){prevented=true}});assert(prevented);assert(!draft.open,'Invalid form must not create a draft');
form.valid=true;form.dispatch('submit',{preventDefault(){}});assert(draft.open,'Valid inquiry should produce a reviewable draft');
assert.equal(elements['#draft-subject'].textContent,'Website inquiry: Solutions');
const url=new URL(elements['#open-draft'].href);assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,'info@mafazanetwork.com');assert(url.searchParams.get('body').includes(fields.message));
assert(elements['#form-status'].textContent.includes('Nothing has been sent'));
fields.message='<script>alert(1)</script> & Québec';form.dispatch('submit',{preventDefault(){}});assert(elements['#draft-body'].textContent.includes(fields.message),'Input must remain literal text');
assert(new URL(elements['#open-draft'].href).searchParams.get('body').includes(fields.message),'Draft encoding should preserve punctuation and Unicode');
console.log('Passed: mobile menu, Escape/outside/resize closing, dialogs, deep links, service selection, invalid/valid forms, email encoding, and text-only draft rendering.');
