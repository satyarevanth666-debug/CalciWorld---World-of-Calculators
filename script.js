/* ===================== CalciWorld ===================== */
/* All calculators registry. Each item:
   { id, name, icon, desc, popular?, custom?(modalBody) -> setResult, OR
     inputs:[{name,label,type,placeholder?,options?,step?}], compute(v)->string }
*/

const fmt = (n, d = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9 || (Math.abs(n) > 0 && Math.abs(n) < 1e-4)) return Number(n).toExponential(4);
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
};
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
const need = (...vals) => vals.every(v => v !== null && v !== undefined && v !== "");
const isCalcMatch = (calc, filter) => {
  const q = filter.trim().toLowerCase(); if (!q) return true;
  if (calc.name.toLowerCase().includes(q) || calc.category.toLowerCase().includes(q) || (calc.desc||"").toLowerCase().includes(q)) return true;
  return calc.inputs?.some(i => i.label.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
};

/* ============== INPUT-BASED CALCULATORS ============== */
const CALCS = [

/* ---------- EDUCATION ---------- */
{ category:"Education", id:"cgpa", name:"CGPA Calculator", icon:"🎓", desc:"Calculate weighted CGPA using grade point / credit pairs", popular:true,
  inputs:[
    {name:"pairs",label:"Grade/Credit pairs",type:"text",placeholder:"8.5/4, 9/3, 7/3"}
  ],
  compute(v){
    const items = v.pairs.split(/[\n,]+/).map(item => item.trim()).filter(Boolean);
    if(!items.length) return "Enter grade/credit pairs like 8.5/4";
    let totalCredits = 0;
    let weightedSum = 0;
    for(const item of items){
      const [grade, credit] = item.split(/[\/\s:]+/).map(str => str.trim());
      const g = parseFloat(grade);
      const c = parseFloat(credit);
      if(!grade || !credit || isNaN(g) || isNaN(c)) return `Invalid pair: ${item}`;
      if(c <= 0) return `Credit must be positive: ${item}`;
      totalCredits += c;
      weightedSum += g * c;
    }
    if(totalCredits === 0) return "Total credits must be greater than zero";
    const cgpa = weightedSum / totalCredits;
    return `CGPA: ${fmt(cgpa,2)}\nTotal credits: ${fmt(totalCredits,0)}\nWeighted sum: ${fmt(weightedSum,2)}`;
  }
},
{ category:"Education", id:"gpa", name:"GPA Calculator", icon:"📘",
  inputs:[{name:"grades",label:"Grade Points (comma separated)",type:"text",placeholder:"4, 3.7, 3.3"}],
  compute(v){const g=v.grades.split(",").map(Number); if(g.some(isNaN))return "Invalid";
    return `GPA: ${fmt(g.reduce((a,b)=>a+b,0)/g.length,2)}`;}
},
{ category:"Education", id:"perc", name:"Percentage Calculator", icon:"%", popular:true,
  inputs:[{name:"x",label:"Value (X)",type:"number"},{name:"y",label:"Total (Y)",type:"number"}],
  compute(v){const x=num(v.x),y=num(v.y); if(!need(x,y)||y===0)return "Enter valid values";
    return `${fmt(x)} is ${fmt(x/y*100,2)}% of ${fmt(y)}`;}
},
{ category:"Education", id:"marksReq", name:"Marks Required Calculator", icon:"🎯",
  inputs:[{name:"cur",label:"Current %",type:"number"},{name:"target",label:"Target %",type:"number"},{name:"done",label:"Exams Done",type:"number"},{name:"left",label:"Exams Left",type:"number"}],
  compute(v){const c=num(v.cur),t=num(v.target),d=num(v.done),l=num(v.left);
    if(!need(c,t,d,l)||l<=0)return "Enter valid values";
    const need_=(t*(d+l)-c*d)/l; return `Need avg ${fmt(need_,2)}% in remaining ${l} exams`;}
},
{ category:"Education", id:"attendance", name:"Attendance Calculator", icon:"📅",
  inputs:[{name:"att",label:"Classes Attended",type:"number"},{name:"tot",label:"Total Classes",type:"number"},{name:"req",label:"Required %",type:"number",placeholder:"75"}],
  compute(v){const a=num(v.att),t=num(v.tot),r=num(v.req)||75;
    if(!need(a,t)||t===0)return "Enter valid values";
    const cur=a/t*100; let msg=`Current attendance: ${fmt(cur,2)}%\n`;
    if(cur>=r) {const can=Math.floor((a*100-r*t)/r); msg+=`You can skip ${can} more class(es)`;}
    else {const need_=Math.ceil((r*t-a*100)/(100-r)); msg+=`Attend next ${need_} class(es) to reach ${r}%`;}
    return msg;}
},
{ category:"Education", id:"grade", name:"Grade Calculator", icon:"🅰",
  inputs:[{name:"p",label:"Percentage",type:"number"}],
  compute(v){const p=num(v.p); if(p===null)return "Enter %";
    const g=p>=90?"A+":p>=80?"A":p>=70?"B":p>=60?"C":p>=50?"D":p>=40?"E":"F";
    return `Grade: ${g} (${fmt(p)}%)`;}
},
{ category:"Education", id:"semPerf", name:"Semester Performance Calculator", icon:"📊",
  inputs:[{name:"sgpa",label:"Previous CGPA",type:"number"},{name:"n",label:"Semesters Done",type:"number"},{name:"cur",label:"Current SGPA",type:"number"}],
  compute(v){const s=num(v.sgpa),n=num(v.n),c=num(v.cur);
    if(!need(s,n,c))return "Enter values";
    return `New CGPA: ${fmt((s*n+c)/(n+1),2)}`;}
},

/* ---------- FINANCE ---------- */
{ category:"Finance", id:"emi", name:"EMI Calculator", icon:"🏦", popular:true,
  inputs:[{name:"P",label:"Loan Amount",type:"number"},{name:"r",label:"Annual Rate %",type:"number"},{name:"n",label:"Tenure (months)",type:"number"}],
  compute(v){const P=num(v.P),r=num(v.r),n=num(v.n);
    if(!need(P,r,n))return "Enter values";
    const i=r/12/100, emi=P*i*Math.pow(1+i,n)/(Math.pow(1+i,n)-1);
    const tot=emi*n, int=tot-P;
    return `EMI: ${fmt(emi)}\nTotal Interest: ${fmt(int)}\nTotal Payment: ${fmt(tot)}`;}
},
{ category:"Finance", id:"sip", name:"SIP Calculator", icon:"💰", popular:true,
  inputs:[{name:"p",label:"Monthly Investment",type:"number"},{name:"r",label:"Expected Return % p.a.",type:"number"},{name:"y",label:"Years",type:"number"}],
  compute(v){const p=num(v.p),r=num(v.r),y=num(v.y);
    if(!need(p,r,y))return "Enter values";
    const i=r/12/100, n=y*12, fv=p*((Math.pow(1+i,n)-1)/i)*(1+i), inv=p*n;
    return `Future Value: ${fmt(fv)}\nInvested: ${fmt(inv)}\nReturns: ${fmt(fv-inv)}`;}
},
{ category:"Finance", id:"ci", name:"Compound Interest Calculator", icon:"📈",
  inputs:[{name:"p",label:"Principal",type:"number"},{name:"r",label:"Rate % p.a.",type:"number"},{name:"t",label:"Years",type:"number"},{name:"n",label:"Compounded /year",type:"number",placeholder:"1"}],
  compute(v){const p=num(v.p),r=num(v.r),t=num(v.t),n=num(v.n)||1;
    if(!need(p,r,t))return "Enter values";
    const a=p*Math.pow(1+r/100/n,n*t); return `Amount: ${fmt(a)}\nInterest: ${fmt(a-p)}`;}
},
{ category:"Finance", id:"si", name:"Simple Interest Calculator", icon:"💵",
  inputs:[{name:"p",label:"Principal",type:"number"},{name:"r",label:"Rate %",type:"number"},{name:"t",label:"Years",type:"number"}],
  compute(v){const p=num(v.p),r=num(v.r),t=num(v.t); if(!need(p,r,t))return "Enter values";
    const i=p*r*t/100; return `Interest: ${fmt(i)}\nAmount: ${fmt(p+i)}`;}
},
{ category:"Finance", id:"loan", name:"Loan Calculator", icon:"💳",
  inputs:[{name:"P",label:"Loan",type:"number"},{name:"r",label:"Rate %",type:"number"},{name:"y",label:"Years",type:"number"}],
  compute(v){const P=num(v.P),r=num(v.r),y=num(v.y); if(!need(P,r,y))return "Enter values";
    const n=y*12,i=r/12/100,e=P*i*Math.pow(1+i,n)/(Math.pow(1+i,n)-1);
    return `Monthly: ${fmt(e)}\nTotal: ${fmt(e*n)}\nInterest: ${fmt(e*n-P)}`;}
},
{ category:"Finance", id:"gst", name:"GST Calculator", icon:"🧾",
  inputs:[{name:"amt",label:"Amount",type:"number"},{name:"rate",label:"GST %",type:"number",placeholder:"18"},
    {name:"mode",label:"Mode",type:"select",options:["Add GST","Remove GST"]}],
  compute(v){const a=num(v.amt),r=num(v.rate); if(!need(a,r))return "Enter values";
    if(v.mode==="Remove GST"){const base=a/(1+r/100); return `Base: ${fmt(base)}\nGST: ${fmt(a-base)}`;}
    const g=a*r/100; return `GST: ${fmt(g)}\nTotal: ${fmt(a+g)}`;}
},
{ category:"Finance", id:"disc", name:"Discount Calculator", icon:"🏷",
  inputs:[{name:"p",label:"Price",type:"number"},{name:"d",label:"Discount %",type:"number"}],
  compute(v){const p=num(v.p),d=num(v.d); if(!need(p,d))return "Enter values";
    const off=p*d/100; return `You save: ${fmt(off)}\nFinal price: ${fmt(p-off)}`;}
},
{ category:"Finance", id:"pl", name:"Profit & Loss Calculator", icon:"📉",
  inputs:[{name:"cp",label:"Cost Price",type:"number"},{name:"sp",label:"Selling Price",type:"number"}],
  compute(v){const c=num(v.cp),s=num(v.sp); if(!need(c,s)||c===0)return "Enter values";
    const d=s-c, p=d/c*100; return `${d>=0?"Profit":"Loss"}: ${fmt(Math.abs(d))}\n${d>=0?"Profit":"Loss"} %: ${fmt(Math.abs(p),2)}%`;}
},
{ category:"Finance", id:"bep", name:"Break-even Calculator", icon:"⚖",
  inputs:[{name:"fc",label:"Fixed Costs",type:"number"},{name:"price",label:"Price/Unit",type:"number"},{name:"vc",label:"Variable Cost/Unit",type:"number"}],
  compute(v){const f=num(v.fc),p=num(v.price),vc=num(v.vc); if(!need(f,p,vc)||p<=vc)return "Price must exceed VC";
    return `Break-even units: ${fmt(f/(p-vc),0)}\nBreak-even revenue: ${fmt(f/(p-vc)*p)}`;}
},
{ category:"Finance", id:"infl", name:"Inflation Calculator", icon:"💸",
  inputs:[{name:"p",label:"Current Value",type:"number"},{name:"r",label:"Inflation % p.a.",type:"number"},{name:"y",label:"Years",type:"number"}],
  compute(v){const p=num(v.p),r=num(v.r),y=num(v.y); if(!need(p,r,y))return "Enter values";
    return `Future value (same purchasing power): ${fmt(p*Math.pow(1+r/100,y))}`;}
},
{ category:"Finance", id:"salary", name:"Salary Calculator", icon:"👔",
  inputs:[{name:"a",label:"Annual CTC",type:"number"}],
  compute(v){const a=num(v.a); if(a===null)return "Enter CTC";
    return `Monthly: ${fmt(a/12)}\nWeekly: ${fmt(a/52)}\nDaily: ${fmt(a/260)}\nHourly: ${fmt(a/2080)}`;}
},
{ category:"Finance", id:"tax", name:"Tax Calculator (slab)", icon:"📑",
  inputs:[{name:"inc",label:"Annual Income",type:"number"}],
  compute(v){let i=num(v.inc); if(i===null)return "Enter income";
    // Simple progressive sample slabs
    const slabs=[[250000,0],[500000,.05],[1000000,.2],[Infinity,.3]]; let last=0,tax=0;
    for(const [cap,rate] of slabs){const taxable=Math.max(0,Math.min(i,cap)-last); tax+=taxable*rate; last=cap; if(i<=cap)break;}
    return `Estimated Tax: ${fmt(tax)}\nNet Income: ${fmt(i-tax)}`;}
},{ category:"Finance", id:"roi", name:"ROI / CAGR Calculator", icon:"📌",
  inputs:[{name:"p",label:"Initial Investment",type:"number"},{name:"f",label:"Final Value",type:"number"},{name:"y",label:"Years",type:"number"}],
  compute(v){const p=num(v.p),f=num(v.f),y=num(v.y); if(!need(p,f,y)||p===0||y<=0)return "Enter values";
    const roi=(f-p)/p*100; const cagr=100*(Math.pow(f/p,1/y)-1);
    return `ROI: ${fmt(roi,2)}%\nCAGR: ${fmt(cagr,2)}%`;
  }
},
/* ---------- HEALTH ---------- */
{ category:"Health", id:"bmi", name:"BMI Calculator", icon:"⚕", popular:true,
  inputs:[{name:"w",label:"Weight (kg)",type:"number"},{name:"h",label:"Height (cm)",type:"number"}],
  compute(v){const w=num(v.w),h=num(v.h); if(!need(w,h)||h<=0)return "Enter values";
    const m=h/100, bmi=w/(m*m);
    const cat=bmi<18.5?"Underweight":bmi<25?"Normal":bmi<30?"Overweight":"Obese";
    return `BMI: ${fmt(bmi,1)}\nCategory: ${cat}`;}
},
{ category:"Health", id:"bmr", name:"BMR Calculator", icon:"🔥",
  inputs:[{name:"sex",label:"Sex",type:"select",options:["Male","Female"]},
    {name:"w",label:"Weight (kg)",type:"number"},{name:"h",label:"Height (cm)",type:"number"},{name:"age",label:"Age",type:"number"}],
  compute(v){const w=num(v.w),h=num(v.h),a=num(v.age); if(!need(w,h,a))return "Enter values";
    const bmr=v.sex==="Female"?10*w+6.25*h-5*a-161:10*w+6.25*h-5*a+5;
    return `BMR: ${fmt(bmr,0)} kcal/day`;}
},
{ category:"Health", id:"bf", name:"Body Fat Calculator", icon:"💪",
  inputs:[{name:"sex",label:"Sex",type:"select",options:["Male","Female"]},
    {name:"bmi",label:"BMI",type:"number"},{name:"age",label:"Age",type:"number"}],
  compute(v){const b=num(v.bmi),a=num(v.age); if(!need(b,a))return "Enter values";
    const s=v.sex==="Male"?1:0; const bf=1.2*b+0.23*a-10.8*s-5.4;
    return `Body Fat: ${fmt(bf,1)}%`;}
},
{ category:"Health", id:"cal", name:"Calorie Calculator", icon:"🍎",
  inputs:[{name:"bmr",label:"BMR (kcal)",type:"number"},
    {name:"act",label:"Activity",type:"select",options:["Sedentary 1.2","Light 1.375","Moderate 1.55","Active 1.725","Very Active 1.9"]}],
  compute(v){const b=num(v.bmr); if(b===null)return "Enter BMR";
    const f=parseFloat(v.act.split(" ").pop()); return `Maintenance: ${fmt(b*f,0)} kcal/day`;}
},
{ category:"Health", id:"water", name:"Water Intake Calculator", icon:"💧",
  inputs:[{name:"w",label:"Weight (kg)",type:"number"}],
  compute(v){const w=num(v.w); if(w===null)return "Enter weight";
    return `Daily water: ${fmt(w*0.033,2)} liters`;}
},
{ category:"Health", id:"ideal", name:"Ideal Weight Calculator", icon:"⚖",
  inputs:[{name:"sex",label:"Sex",type:"select",options:["Male","Female"]},{name:"h",label:"Height (cm)",type:"number"}],
  compute(v){const h=num(v.h); if(h===null)return "Enter height";
    const inOver5=(h-152.4)/2.54; const base=v.sex==="Male"?50:45.5;
    return `Ideal weight (Devine): ${fmt(base+2.3*Math.max(0,inOver5),1)} kg`;}
},

/* ---------- MATHEMATICS ---------- */
{ category:"Mathematics", id:"sci", name:"Scientific Calculator", icon:"🧮", popular:true,
  custom(body, setResult){
    body.innerHTML = `
      <div class="sci-display" id="sciDisp">0</div>
      <div class="sci-grid" id="sciGrid"></div>`;
    const keys=["sin","cos","tan","log","ln","(",")","√","x²","^","7","8","9","÷","C","4","5","6","×","⌫","1","2","3","-","π","0",".","e","+","="];
    const g=body.querySelector("#sciGrid"); let expr="";
    const display = body.querySelector("#sciDisp");
    const updateDisplay = () => display.textContent = expr || "0";
    const calculate = () => {
      try{
        let e = expr.replace(/×/g,"*").replace(/÷/g,"/").replace(/π/g,"Math.PI").replace(/(?<![a-z])e(?![a-z])/g,"Math.E")
          .replace(/√/g,"Math.sqrt").replace(/x²/g,"**2").replace(/\^/g,"**")
          .replace(/sin\(/g,"Math.sin(").replace(/cos\(/g,"Math.cos(").replace(/tan\(/g,"Math.tan(")
          .replace(/log\(/g,"Math.log10(").replace(/ln\(/g,"Math.log(");
        const r=Function('"use strict";return ('+e+')')();
        display.textContent = r;
        expr = String(r);
        setResult(`Result: ${r}`);
      } catch {
        display.textContent = "Error";
        setResult("Invalid expression");
      }
    };
    const handleInput = (k) => {
      if(k==="C"){expr="";updateDisplay();setResult("");return;}
      if(k==="⌫"){expr=expr.slice(0,-1);updateDisplay();return;}
      if(k==="="){ calculate(); return; }
      const map={"×":"×","÷":"÷","√":"√(","x²":"x²","π":"π"};
      expr += map[k] || k;
      updateDisplay();
    };
    const handleKey = (e) => {
      if(!currentCalc || currentCalc.id !== "sci") return;
      const key = e.key;
      const mapping = {"*":"×","/":"÷","^":"^","Enter":"=","Backspace":"⌫","Escape":"C"};
      if(/[0-9.+\-]/.test(key) || key === "*" || key === "/" || key === "^" || key === "(" || key === ")") {
        e.preventDefault(); handleInput(mapping[key] || key);
      } else if(mapping[key]) {
        e.preventDefault(); handleInput(mapping[key]);
      }
    };
    keys.forEach(k=>{
      const b=document.createElement("button"); b.textContent=k;
      if("+-×÷^".includes(k))b.className="op";
      if(k==="=")b.className="eq";
      b.onclick=()=> handleInput(k);
      g.appendChild(b);
    });
    sciKeyHandler = handleKey;
  }
},
{ category:"Mathematics", id:"pchange", name:"Percentage Change", icon:"📊",
  inputs:[{name:"o",label:"Old Value",type:"number"},{name:"n",label:"New Value",type:"number"}],
  compute(v){const o=num(v.o),n=num(v.n); if(!need(o,n)||o===0)return "Enter values";
    const c=(n-o)/o*100; return `Change: ${fmt(c,2)}% (${c>=0?"increase":"decrease"})`;}
},
{ category:"Mathematics", id:"quad", name:"Quadratic Equation Solver", icon:"∛",
  inputs:[{name:"a",label:"a",type:"number"},{name:"b",label:"b",type:"number"},{name:"c",label:"c",type:"number"}],
  compute(v){const a=num(v.a),b=num(v.b),c=num(v.c); if(!need(a,b,c)||a===0)return "a ≠ 0";
    const d=b*b-4*a*c;
    if(d<0){const re=(-b/(2*a)),im=Math.sqrt(-d)/(2*a); return `x₁=${fmt(re,3)}+${fmt(im,3)}i\nx₂=${fmt(re,3)}-${fmt(im,3)}i`;}
    return `x₁=${fmt((-b+Math.sqrt(d))/(2*a),4)}\nx₂=${fmt((-b-Math.sqrt(d))/(2*a),4)}`;}
},
{ category:"Mathematics", id:"matrix", name:"Matrix Calculator", icon:"🔢",
  custom(body, setResult){
    body.innerHTML = `
      <div class="matrix-chooser">
        <p>Select matrix size:</p>
        <div class="matrix-size-buttons">
          <button type="button" data-size="2">2×2</button>
          <button type="button" data-size="3">3×3</button>
        </div>
      </div>
      <div id="matrixPanel"></div>
    `;
    const panel = body.querySelector('#matrixPanel');
    const buildGrid = (size, matrix) => {
      const rows = Array.from({length:size}, (_, r) =>
        `<div class="matrix-row">${Array.from({length:size}, (_, c) =>
          `<input type="number" data-matrix="${matrix}" data-row="${r}" data-col="${c}" placeholder="${matrix}${r+1}${c+1}" />`
        ).join('')}</div>`
      ).join('');
      return `
        <div class="matrix-box">
          <h4>Matrix ${matrix}</h4>
          <div class="matrix-grid">${rows}</div>
        </div>
      `;
    };
    const renderPanel = (size) => {
      panel.innerHTML = `
        <div class="matrix-actions">
          <button type="button" data-op="add">Add</button>
          <button type="button" data-op="subtract">Subtract</button>
          <button type="button" data-op="multiply">Multiply</button>
        </div>
        <div class="matrix-row-panel">
          ${buildGrid(size, 'A')}
          ${buildGrid(size, 'B')}
        </div>
      `;
      panel.querySelectorAll('.matrix-actions button').forEach(btn => btn.addEventListener('click', () => compute(btn.dataset.op, size)));
    };
    const parseMatrix = (size, matrix) => {
      const fields = Array.from(panel.querySelectorAll(`input[data-matrix="${matrix}"]`));
      const values = fields.map(input => num(input.value));
      if(values.some(v => v === null)) return null;
      const mat = [];
      for(let r = 0; r < size; r++) mat.push(values.slice(r * size, (r + 1) * size));
      return mat;
    };
    const formatMatrix = (mat) => mat.map(row => `[${row.map(v => fmt(v,2)).join(', ')}]`).join('\n');
    const compute = (op, size) => {
      const A = parseMatrix(size, 'A');
      const B = parseMatrix(size, 'B');
      if(!A || !B){ setResult('Fill all matrix values', true); return; }
      const add = A.map((row, r) => row.map((val, c) => val + B[r][c]));
      const sub = A.map((row, r) => row.map((val, c) => val - B[r][c]));
      const mul = Array.from({length:size}, (_, r) => Array.from({length:size}, (_, c) =>
        A[r].reduce((sum, val, k) => sum + val * B[k][c], 0)
      ));
      let result = '';
      if(op === 'add') result = `Addition:\n${formatMatrix(add)}`;
      else if(op === 'subtract') result = `Subtraction:\n${formatMatrix(sub)}`;
      else if(op === 'multiply') result = `Multiplication:\n${formatMatrix(mul)}`;
      setResult(result);
    };
    body.querySelectorAll('.matrix-size-buttons button').forEach(btn => btn.addEventListener('click', () => renderPanel(Number(btn.dataset.size))));
    setResult('Select 2×2 or 3×3 to begin', true);
  }
},
{ category:"Mathematics", id:"det", name:"Determinant (2×2 / 3×3)", icon:"|A|",
  inputs:[{name:"m",label:"Matrix rows (semicolon sep, e.g. 1,2;3,4)",type:"text",placeholder:"1,2;3,4"}],
  compute(v){const rows=v.m.split(";").map(r=>r.split(",").map(Number));
    if(rows.length===2&&rows.every(r=>r.length===2)){const[[a,b],[c,d]]=rows; return `det = ${fmt(a*d-b*c)}`;}
    if(rows.length===3&&rows.every(r=>r.length===3)){const m=rows;
      const det=m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
      return `det = ${fmt(det)}`;}
    return "Use 2×2 or 3×3 format";}
},
{ category:"Mathematics", id:"stats", name:"Statistics Calculator", icon:"📐",
  inputs:[{name:"data",label:"Numbers (comma separated)",type:"text",placeholder:"3,5,7,9,11"}],
  compute(v){const a=v.data.split(",").map(Number).filter(n=>!isNaN(n)); if(!a.length)return "Enter numbers";
    const n=a.length, mean=a.reduce((s,x)=>s+x,0)/n; const sorted=[...a].sort((x,y)=>x-y);
    const med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
    const variance=a.reduce((s,x)=>s+(x-mean)**2,0)/n;
    return `Count: ${n}\nMean: ${fmt(mean,3)}\nMedian: ${fmt(med,3)}\nMin: ${fmt(Math.min(...a))}, Max: ${fmt(Math.max(...a))}\nStdDev: ${fmt(Math.sqrt(variance),3)}`;}
},
{ category:"Mathematics", id:"mean", name:"Mean Calculator", icon:"x̄",
  inputs:[{name:"d",label:"Numbers",type:"text",placeholder:"1,2,3"}],
  compute(v){const a=v.d.split(",").map(Number).filter(n=>!isNaN(n)); if(!a.length)return "Enter numbers";
    return `Mean: ${fmt(a.reduce((s,x)=>s+x,0)/a.length,4)}`;}
},
{ category:"Mathematics", id:"median", name:"Median Calculator", icon:"M",
  inputs:[{name:"d",label:"Numbers",type:"text"}],
  compute(v){const a=v.d.split(",").map(Number).filter(n=>!isNaN(n)).sort((x,y)=>x-y); if(!a.length)return "Enter numbers";
    const n=a.length; return `Median: ${n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2}`;}
},
{ category:"Mathematics", id:"mode", name:"Mode Calculator", icon:"Mo",
  inputs:[{name:"d",label:"Numbers",type:"text"}],
  compute(v){const a=v.d.split(",").map(Number).filter(n=>!isNaN(n)); if(!a.length)return "Enter numbers";
    const c={}; a.forEach(x=>c[x]=(c[x]||0)+1); const max=Math.max(...Object.values(c));
    const modes=Object.keys(c).filter(k=>c[k]===max); return `Mode: ${modes.join(", ")} (×${max})`;}
},
{ category:"Mathematics", id:"sd", name:"Standard Deviation", icon:"σ",
  inputs:[{name:"d",label:"Numbers",type:"text"}],
  compute(v){const a=v.d.split(",").map(Number).filter(n=>!isNaN(n)); if(a.length<2)return "Need ≥2 numbers";
    const m=a.reduce((s,x)=>s+x,0)/a.length;
    return `Population σ: ${fmt(Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length),4)}\nSample s: ${fmt(Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)),4)}`;}
},
{ category:"Mathematics", id:"prob", name:"Probability Calculator", icon:"P",
  inputs:[{name:"fav",label:"Favorable Outcomes",type:"number"},{name:"tot",label:"Total Outcomes",type:"number"}],
  compute(v){const f=num(v.fav),t=num(v.tot); if(!need(f,t)||t===0)return "Enter values";
    return `Probability: ${fmt(f/t,4)} (${fmt(f/t*100,2)}%)`;}
},
{ category:"Mathematics", id:"fact", name:"Factorial Calculator", icon:"!",
  inputs:[{name:"n",label:"Number (integer)",type:"number"}],
  compute(v){const n=num(v.n); if(n===null||n<0||Math.trunc(n)!==n)return "Enter a non-negative integer";
    let f=1; for(let i=2;i<=n;i++) f*=i;
    return `${n}! = ${fmt(f,0)}`;}
},
{ category:"Mathematics", id:"perm", name:"Permutation (nPr)", icon:"nPr",
  inputs:[{name:"n",label:"n",type:"number"},{name:"r",label:"r",type:"number"}],
  compute(v){const n=num(v.n),r=num(v.r); if(!need(n,r)||r>n)return "Need r ≤ n";
    const f=k=>{let p=1;for(let i=2;i<=k;i++)p*=i;return p;};
    return `nPr = ${fmt(f(n)/f(n-r),0)}`;}
},
{ category:"Mathematics", id:"comb", name:"Combination (nCr)", icon:"nCr",
  inputs:[{name:"n",label:"n",type:"number"},{name:"r",label:"r",type:"number"}],
  compute(v){const n=num(v.n),r=num(v.r); if(!need(n,r)||r>n)return "Need r ≤ n";
    const f=k=>{let p=1;for(let i=2;i<=k;i++)p*=i;return p;};
    return `nCr = ${fmt(f(n)/(f(r)*f(n-r)),0)}`;}
},
{ category:"Mathematics", id:"gcdlcm", name:"GCD & LCM Calculator", icon:"∗",
  inputs:[{name:"a",label:"Number A",type:"number"},{name:"b",label:"Number B",type:"number"}],
  compute(v){const a=Math.abs(Math.trunc(num(v.a))), b=Math.abs(Math.trunc(num(v.b))); if(!need(a,b)||a===0||b===0)return "Enter valid integers";
    const gcd=(x,y)=>y?gcd(y,x%y):x; const g=gcd(a,b);
    return `GCD: ${g}\nLCM: ${fmt(a/g*b,0)}`;}
},
{ category:"Mathematics", id:"weighted", name:"Weighted Average", icon:"∑",
  inputs:[{name:"values",label:"Values (comma)",type:"text",placeholder:"80, 90, 75"},{name:"weights",label:"Weights (comma)",type:"text",placeholder:"3, 2, 5"}],
  compute(v){const vals=v.values.split(",").map(x=>x.trim()).filter(Boolean).map(Number);
    const wts=v.weights.split(",").map(x=>x.trim()).filter(Boolean).map(Number);
    if(!vals.length||!wts.length)return "Enter values and weights";
    if(vals.length!==wts.length)return "Counts must match";
    if(vals.some(isNaN)||wts.some(isNaN))return "Use valid numbers";
    const total=wts.reduce((s,n)=>s+n,0); if(total===0)return "Sum of weights must be >0";
    const avg=vals.reduce((s,x,i)=>s + x*wts[i],0)/total;
    return `Weighted avg: ${fmt(avg,4)}\nTotal weight: ${fmt(total,0)}`;}
},
{ category:"Mathematics", id:"angle", name:"Degree/Radian Converter", icon:"∡",
  inputs:[{name:"v",label:"Value",type:"number"},{name:"mode",label:"Convert",type:"select",options:["Degrees → Radians","Radians → Degrees"]}],
  compute(v){const n=num(v.v); if(n===null)return "Enter value";
    if(v.mode==="Degrees → Radians") return `${fmt(n)}° = ${fmt(n*Math.PI/180,4)} rad`;
    return `${fmt(n)} rad = ${fmt(n*180/Math.PI,4)}°`;
  }
},

/* ---------- ENGINEERING ---------- */
{ category:"Engineering", id:"bin2dec", name:"Binary → Decimal", icon:"01",
  inputs:[{name:"b",label:"Binary",type:"text",placeholder:"101010"}],
  compute(v){if(!/^[01]+$/.test(v.b||""))return "Binary only"; return `Decimal: ${parseInt(v.b,2)}`;}
},
{ category:"Engineering", id:"dec2bin", name:"Decimal → Binary", icon:"10",
  inputs:[{name:"n",label:"Decimal",type:"number"}],
  compute(v){const n=num(v.n); if(n===null)return "Enter number"; return `Binary: ${Math.floor(n).toString(2)}`;}
},
{ category:"Engineering", id:"bin2hex", name:"Binary → Hex", icon:"⛬",
  inputs:[{name:"b",label:"Binary",type:"text"}],
  compute(v){if(!/^[01]+$/.test(v.b||""))return "Binary only"; return `Hex: ${parseInt(v.b,2).toString(16).toUpperCase()}`;}
},
{ category:"Engineering", id:"hex2dec", name:"Hex → Decimal", icon:"#",
  inputs:[{name:"h",label:"Hex",type:"text",placeholder:"FF"}],
  compute(v){if(!/^[0-9a-fA-F]+$/.test(v.h||""))return "Hex only"; return `Decimal: ${parseInt(v.h,16)}`;}
},
{ category:"Engineering", id:"numsys", name:"Number System Converter", icon:"↔",
  inputs:[{name:"v",label:"Value",type:"text"},{name:"from",label:"From base",type:"select",options:["2","8","10","16"]},{name:"to",label:"To base",type:"select",options:["2","8","10","16"]}],
  compute(v){try{const n=parseInt(v.v,parseInt(v.from)); if(isNaN(n))return "Invalid"; return `Result: ${n.toString(parseInt(v.to)).toUpperCase()}`;}catch{return "Invalid";}}
},
{ category:"Engineering", id:"ohm", name:"Ohm's Law Calculator", icon:"Ω",
  inputs:[{name:"V",label:"Voltage (V) — optional",type:"number",required:false},{name:"I",label:"Current (A) — optional",type:"number",required:false},{name:"R",label:"Resistance (Ω) — optional",type:"number",required:false}],
  compute(v){const V=num(v.V),I=num(v.I),R=num(v.R);
    if(V!==null&&I!==null)return `R = ${fmt(V/I,4)} Ω, P = ${fmt(V*I,4)} W`;
    if(V!==null&&R!==null)return `I = ${fmt(V/R,4)} A, P = ${fmt(V*V/R,4)} W`;
    if(I!==null&&R!==null)return `V = ${fmt(I*R,4)} V, P = ${fmt(I*I*R,4)} W`;
    return "Provide any two values";}
},
{ category:"Engineering", id:"power", name:"Electrical Power", icon:"⚡",
  inputs:[{name:"V",label:"Voltage (V)",type:"number"},{name:"I",label:"Current (A)",type:"number"}],
  compute(v){const V=num(v.V),I=num(v.I); if(!need(V,I))return "Enter values"; return `Power: ${fmt(V*I,3)} W`;}
},
{ category:"Engineering", id:"resistor", name:"Resistor Calculator (Series/Parallel)", icon:"▰",
  inputs:[{name:"r",label:"Resistances (comma)",type:"text",placeholder:"100,220,330"},{name:"mode",label:"Mode",type:"select",options:["Series","Parallel"]}],
  compute(v){const a=v.r.split(",").map(Number).filter(x=>!isNaN(x)&&x>0); if(!a.length)return "Enter values";
    if(v.mode==="Series")return `Total: ${fmt(a.reduce((s,x)=>s+x,0),3)} Ω`;
    return `Total: ${fmt(1/a.reduce((s,x)=>s+1/x,0),3)} Ω`;}
},
{ category:"Engineering", id:"pressure", name:"Pressure Converter", icon:"⚗",
  inputs:[{name:"v",label:"Value",type:"number"},{name:"from",label:"From",type:"select",options:["Pa","kPa","bar","atm","psi","torr"]},{name:"to",label:"To",type:"select",options:["Pa","kPa","bar","atm","psi","torr"]}],
  compute(v){const k={Pa:1,kPa:1e3,bar:1e5,atm:101325,psi:6894.757, torr:133.322}; const n=num(v.v); if(n===null)return "Enter value"; const from=k[v.from], to=k[v.to]; if(!from||!to)return "Invalid unit"; return `${fmt(n*from/to,6)} ${v.to}`;}
},

/* ---------- TIME & DATE ---------- */
{ category:"Time & Date", id:"age", name:"Age Calculator", icon:"🎂", popular:true,
  inputs:[{name:"dob",label:"Date of Birth",type:"date"}],
  compute(v){if(!v.dob)return "Pick a date"; const d=new Date(v.dob), now=new Date();
    let y=now.getFullYear()-d.getFullYear(), m=now.getMonth()-d.getMonth(), da=now.getDate()-d.getDate();
    if(da<0){m--;da+=new Date(now.getFullYear(),now.getMonth(),0).getDate();}
    if(m<0){y--;m+=12;}
    const days=Math.floor((now-d)/86400000);
    return `Age: ${y} years, ${m} months, ${da} days\nTotal days: ${days}`;}
},
{ category:"Time & Date", id:"datediff", name:"Date Difference", icon:"📆",
  inputs:[{name:"a",label:"From",type:"date"},{name:"b",label:"To",type:"date"}],
  compute(v){if(!v.a||!v.b)return "Pick both dates";
    const d=Math.abs(new Date(v.b)-new Date(v.a))/86400000;
    return `${fmt(d,0)} days (${fmt(d/7,2)} weeks, ${fmt(d/365.25,2)} years)`;}
},
{ category:"Time & Date", id:"countdown", name:"Countdown Calculator", icon:"⏳",
  inputs:[{name:"t",label:"Target Date/Time",type:"datetime-local"}],
  compute(v){if(!v.t)return "Pick a target"; const ms=new Date(v.t)-new Date();
    if(ms<=0)return "Time passed";
    const d=Math.floor(ms/86400000),h=Math.floor(ms/3600000)%24,m=Math.floor(ms/60000)%60;
    return `${d}d ${h}h ${m}m remaining`;}
},
{ category:"Time & Date", id:"duration", name:"Time Duration", icon:"⌛",
  inputs:[{name:"a",label:"Start (HH:MM)",type:"time"},{name:"b",label:"End (HH:MM)",type:"time"}],
  compute(v){if(!v.a||!v.b)return "Pick both";
    const t=s=>{const[h,m]=s.split(":").map(Number);return h*60+m;}; let d=t(v.b)-t(v.a); if(d<0)d+=1440;
    return `Duration: ${Math.floor(d/60)}h ${d%60}m`;}
},
{ category:"Time & Date", id:"workdays", name:"Working Days Calculator", icon:"💼",
  inputs:[{name:"a",label:"From",type:"date"},{name:"b",label:"To",type:"date"}],
  compute(v){if(!v.a||!v.b)return "Pick dates"; let s=new Date(v.a),e=new Date(v.b),c=0;
    while(s<=e){const day=s.getDay(); if(day!==0&&day!==6)c++; s.setDate(s.getDate()+1);}
    return `Working days (Mon–Fri): ${c}`;}
},

/* ---------- UNIT CONVERTERS ---------- */
{ category:"Unit Converters", id:"length", name:"Length Converter", icon:"📏",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["m","cm","mm","km","in","ft","yd","mi"]},
    {name:"to",label:"To",type:"select",options:["m","cm","mm","km","in","ft","yd","mi"]}],
  compute(v){const k={m:1,cm:.01,mm:.001,km:1000,in:.0254,ft:.3048,yd:.9144,mi:1609.344};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],6)} ${v.to}`;}
},
{ category:"Unit Converters", id:"weight", name:"Weight Converter", icon:"⚖",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["kg","g","mg","lb","oz","t"]},
    {name:"to",label:"To",type:"select",options:["kg","g","mg","lb","oz","t"]}],
  compute(v){const k={kg:1,g:.001,mg:1e-6,lb:.453592,oz:.0283495,t:1000};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],6)} ${v.to}`;}
},
{ category:"Unit Converters", id:"temp", name:"Temperature Converter", icon:"🌡",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["C","F","K"]},
    {name:"to",label:"To",type:"select",options:["C","F","K"]}],
  compute(v){const n=num(v.v); if(n===null)return "Enter value";
    let c=v.from==="C"?n:v.from==="F"?(n-32)*5/9:n-273.15;
    let r=v.to==="C"?c:v.to==="F"?c*9/5+32:c+273.15;
    return `${fmt(n)}°${v.from} = ${fmt(r,3)}°${v.to}`;}
},
{ category:"Unit Converters", id:"area", name:"Area Converter", icon:"🟦",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["m²","km²","cm²","ft²","ac","ha"]},
    {name:"to",label:"To",type:"select",options:["m²","km²","cm²","ft²","ac","ha"]}],
  compute(v){const k={"m²":1,"km²":1e6,"cm²":1e-4,"ft²":0.092903,"ac":4046.86,"ha":10000};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],6)} ${v.to}`;}
},
{ category:"Unit Converters", id:"vol", name:"Volume Converter", icon:"🧪",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["L","mL","m³","gal","cup","floz"]},
    {name:"to",label:"To",type:"select",options:["L","mL","m³","gal","cup","floz"]}],
  compute(v){const k={L:1,mL:.001,"m³":1000,gal:3.78541,cup:.2365882,floz:.0295735};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],6)} ${v.to}`;}
},
{ category:"Unit Converters", id:"speed", name:"Speed Converter", icon:"🚀",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["m/s","km/h","mph","knot"]},
    {name:"to",label:"To",type:"select",options:["m/s","km/h","mph","knot"]}],
  compute(v){const k={"m/s":1,"km/h":1/3.6,"mph":0.44704,"knot":0.514444};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],4)} ${v.to}`;}
},
{ category:"Unit Converters", id:"data", name:"Data Storage Converter", icon:"💾",
  inputs:[{name:"v",label:"Value",type:"number"},
    {name:"from",label:"From",type:"select",options:["B","KB","MB","GB","TB"]},
    {name:"to",label:"To",type:"select",options:["B","KB","MB","GB","TB"]}],
  compute(v){const k={B:1,KB:1024,MB:1024**2,GB:1024**3,TB:1024**4};
    const n=num(v.v); if(n===null)return "Enter value"; return `${fmt(n)} ${v.from} = ${fmt(n*k[v.from]/k[v.to],6)} ${v.to}`;}
},
{ category:"Unit Converters", id:"currency", name:"Currency Converter", icon:"💱",
  inputs:[{name:"v",label:"Amount",type:"number"},{name:"from",label:"From",type:"select",options:["USD","EUR","GBP","INR","JPY"]},{name:"to",label:"To",type:"select",options:["USD","EUR","GBP","INR","JPY"]}],
  compute(v){const rate={USD:1,EUR:0.92,GBP:0.78,INR:83,JPY:149}; const n=num(v.v); if(n===null)return "Enter amount";
    const from=rate[v.from], to=rate[v.to]; if(!from||!to)return "Invalid currency";
    return `${fmt(n/from*to,4)} ${v.to}`;}
},

/* ---------- DAILY LIFE ---------- */
{ category:"Daily Life", id:"tip", name:"Tip Calculator", icon:"🍽", popular:true,
  inputs:[{name:"bill",label:"Bill Amount",type:"number"},{name:"pct",label:"Tip %",type:"number",placeholder:"15"},{name:"people",label:"People",type:"number",placeholder:"1"}],
  compute(v){const b=num(v.bill),p=num(v.pct)||0,pe=num(v.people)||1;
    if(b===null)return "Enter bill"; const tip=b*p/100, tot=b+tip;
    return `Tip: ${fmt(tip)}\nTotal: ${fmt(tot)}\nPer person: ${fmt(tot/pe)}`;}
},
{ category:"Daily Life", id:"fuel", name:"Fuel Cost Calculator", icon:"⛽",
  inputs:[{name:"d",label:"Distance (km)",type:"number"},{name:"m",label:"Mileage (km/L)",type:"number"},{name:"p",label:"Price/Litre",type:"number"}],
  compute(v){const d=num(v.d),m=num(v.m),p=num(v.p); if(!need(d,m,p)||m===0)return "Enter values";
    return `Fuel needed: ${fmt(d/m,2)} L\nTotal cost: ${fmt(d/m*p)}`;}
},
{ category:"Daily Life", id:"trip", name:"Trip Cost Calculator", icon:"🧳",
  inputs:[{name:"d",label:"Distance (km)",type:"number"},{name:"m",label:"Mileage (km/L)",type:"number"},{name:"p",label:"Price/Litre",type:"number"},{name:"misc",label:"Misc expenses",type:"number"}],
  compute(v){const d=num(v.d),m=num(v.m),p=num(v.p),x=num(v.misc)||0; if(!need(d,m,p))return "Enter values";
    return `Total trip cost: ${fmt(d/m*p+x)}`;}
},
{ category:"Daily Life", id:"split", name:"Split Bill Calculator", icon:"🧾",
  inputs:[{name:"b",label:"Total Bill",type:"number"},{name:"n",label:"People",type:"number"},{name:"tip",label:"Tip %",type:"number",placeholder:"0"}],
  compute(v){const b=num(v.b),n=num(v.n),t=num(v.tip)||0; if(!need(b,n)||n<=0)return "Enter values";
    const tot=b*(1+t/100); return `Total: ${fmt(tot)}\nPer person: ${fmt(tot/n)}`;}
},
{ category:"Daily Life", id:"shopdisc", name:"Shopping Discount Calculator", icon:"🛍",
  inputs:[{name:"p",label:"Original Price",type:"number"},{name:"d",label:"Discount %",type:"number"},{name:"tax",label:"Tax %",type:"number",placeholder:"0"}],
  compute(v){const p=num(v.p),d=num(v.d),t=num(v.tax)||0; if(!need(p,d))return "Enter values";
    const after=p*(1-d/100), final=after*(1+t/100);
    return `After discount: ${fmt(after)}\nFinal (with tax): ${fmt(final)}\nYou save: ${fmt(p-final)}`;}
},

];

/* ============== STATE ============== */
const STORE = {
  theme: localStorage.getItem("cw_theme") || "light",
  favs: JSON.parse(localStorage.getItem("cw_favs") || "[]"),
  recent: JSON.parse(localStorage.getItem("cw_recent") || "[]"),
  history: JSON.parse(localStorage.getItem("cw_history") || "[]"),
};
const save = (k, v) => localStorage.setItem("cw_" + k, JSON.stringify(v));
let sciKeyHandler = null;
window.addEventListener("keydown", e => { if (sciKeyHandler) sciKeyHandler(e); });

/* ============== RENDER ============== */
const $ = (s) => document.querySelector(s);
document.documentElement.setAttribute("data-theme", STORE.theme);
$("#themeToggle").textContent = STORE.theme === "dark" ? "☀" : "🌙";
$("#totalCount").textContent = CALCS.length;
$("#year").textContent = new Date().getFullYear();

function cardHTML(c){
  return `<div class="card" data-id="${c.id}">
    <div class="ico">${c.icon}</div>
    <div class="name">${c.name}</div>
    <div class="desc">${c.category}${c.desc?" • "+c.desc:""}</div>
  </div>`;
}

function renderPopular(){
  $("#popularGrid").innerHTML = CALCS.filter(c=>c.popular).map(cardHTML).join("");
}

function renderCategories(filter=""){
  const cats = {};
  CALCS.forEach(c=>{
    if(!isCalcMatch(c, filter)) return;
    (cats[c.category] = cats[c.category] || []).push(c);
  });
  const area = $("#categoryArea");
  const keys = Object.keys(cats);
  if(!keys.length){ area.innerHTML = `<p class="empty">No calculators match “${filter}”.</p>`; return; }
  area.innerHTML = keys.map(cat => `
    <h3 class="cat-title">${cat} <span class="pill">${cats[cat].length}</span></h3>
    <div class="grid">${cats[cat].map(cardHTML).join("")}</div>
  `).join("");
}

function renderHistory(){
  const historyEl = $("#historyList");
  historyEl.innerHTML = STORE.history.length
    ? STORE.history.slice(0, 6).map(item => `
        <span class="chip" data-id="${item.id}" title="${item.result}">
          ${CALCS.find(c=>c.id===item.id)?.icon||"•"} ${item.name}
        </span>
      `).join("")
    : `<span class="empty">Recent results appear here after each calculation</span>`;
}

function renderRails(){
  const favEl = $("#favList"), recEl = $("#recentList");
  const byId = id => CALCS.find(c=>c.id===id);
  favEl.innerHTML = STORE.favs.length
    ? STORE.favs.map(id=>{const c=byId(id);return c?`<span class="chip" data-id="${c.id}">${c.icon} ${c.name}</span>`:"";}).join("")
    : `<span class="empty">No favorites yet — star a calculator</span>`;
  recEl.innerHTML = STORE.recent.length
    ? STORE.recent.map(id=>{const c=byId(id);return c?`<span class="chip" data-id="${c.id}">${c.icon} ${c.name}</span>`:"";}).join("")
    : `<span class="empty">Recently used calculators will appear here</span>`;
  renderHistory();
}

renderPopular(); renderCategories(); renderRails();

/* ============== EVENTS ============== */
document.addEventListener("click", (e)=>{
  const card = e.target.closest("[data-id]");
  if(card) openCalc(card.dataset.id);
});

$("#themeToggle").addEventListener("click", ()=>{
  STORE.theme = STORE.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", STORE.theme);
  $("#themeToggle").textContent = STORE.theme === "dark" ? "☀" : "🌙";
  localStorage.setItem("cw_theme", STORE.theme);
});

function onSearch(q){ renderCategories(q); }
$("#globalSearch").addEventListener("input", e=>onSearch(e.target.value));
$("#heroSearch").addEventListener("input", e=>{
  $("#globalSearch").value=e.target.value; onSearch(e.target.value);
});

/* ============== MODAL ============== */
let currentCalc=null, currentResult="";

function createFieldGroup(calc){
  const grid = document.createElement("div");
  grid.className = "modal-fields";
  const cols = calc.layout === "stack" || calc.inputs.length === 1 ? 1 : 2;
  grid.dataset.cols = cols;

  calc.inputs.forEach((inp,i)=>{
    const wrap = document.createElement("div");
    wrap.className = "field-wrap";
    if(inp.width === "full" || inp.type === "text" || (cols === 2 && calc.inputs.length === 3 && i === 2)){
      wrap.classList.add("field-full");
    }
    const label = document.createElement("label");
    label.textContent = inp.label;
    wrap.appendChild(label);

    let field;
    if(inp.type === "select"){
      field = document.createElement("select");
      inp.options.forEach(o=>{const op=document.createElement("option");op.value=o;op.textContent=o;field.appendChild(op);});
    } else if(inp.type === "textarea"){
      field = document.createElement("textarea");
      field.rows = inp.rows || 5;
      if(inp.placeholder) field.placeholder = inp.placeholder;
    } else {
      field = document.createElement("input");
      field.type = inp.type || "text";
      if(inp.placeholder) field.placeholder = inp.placeholder;
      if(inp.step) field.step = inp.step;
      if(inp.default) field.value = inp.default;
      if(inp.type === "number") field.inputMode = "decimal";
    }
    field.name = inp.name;
    field.required = inp.required !== false && inp.type !== "select";
    field.addEventListener("input", recompute);
    field.addEventListener("change", recompute);
    wrap.appendChild(field);
    grid.appendChild(wrap);
  });

  return grid;
}

function openCalc(id){
  const c = CALCS.find(x=>x.id===id); if(!c) return;
  currentCalc=c; currentResult="";
  sciKeyHandler = null;
  $("#modalTitle").textContent = c.name;
  $("#favBtn").textContent = STORE.favs.includes(id) ? "★" : "☆";
  const body = $("#modalBody"); body.innerHTML = "";

  if(c.desc){
    const hint = document.createElement("p");
    hint.className = "calc-desc";
    hint.textContent = c.desc;
    body.appendChild(hint);
  }

  if(c.custom){
    c.custom(body, setResult);
    setResult("Use the calculator buttons or keyboard to compute expressions", true);
  } else {
    body.appendChild(createFieldGroup(c));
    setResult("Fill the fields to see the result", true);
  }

  // Track recent
  STORE.recent = [id, ...STORE.recent.filter(x=>x!==id)].slice(0,8);
  save("recent", STORE.recent); renderRails();

  $("#calcModal").classList.remove("hidden");
}

function setResult(text, empty=false){
  currentResult = text || "";
  const box = $("#resultBox");
  box.textContent = currentResult;
  box.classList.toggle("empty", empty || !currentResult);
}

function recompute(){
  if(!currentCalc || currentCalc.custom) return;
  const data = {};
  $("#modalBody").querySelectorAll("input,select").forEach(el=>data[el.name]=el.value);
  if(currentCalc.inputs.some(i=>i.required !== false && i.type!=="select" && !data[i.name])){
    setResult("Fill the fields to see the result", true); return;
  }
  try{
    const r = currentCalc.compute(data);
    setResult(r || "—");
    if(r){
      STORE.history = [{id:currentCalc.id,name:currentCalc.name,result:r,at:Date.now()}, ...STORE.history].slice(0,50);
      save("history", STORE.history);
      renderHistory();
    }
  } catch(err){ setResult("Error: "+err.message, true); }
}

$("#closeModal").onclick = ()=> { sciKeyHandler = null; $("#calcModal").classList.add("hidden"); document.querySelector('.modal-foot')?.classList.remove('resource-mode'); $("#favBtn").style.display = ''; };
$("#calcModal").addEventListener("click", e=>{ if(e.target.id==="calcModal"){ sciKeyHandler = null; $("#calcModal").classList.add("hidden"); document.querySelector('.modal-foot')?.classList.remove('resource-mode'); $("#favBtn").style.display = ''; } });
document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ sciKeyHandler = null; $("#calcModal").classList.add("hidden"); document.querySelector('.modal-foot')?.classList.remove('resource-mode'); $("#favBtn").style.display = ''; } });
$("#calcBtn").onclick = recompute;
$("#calcModal").addEventListener("keydown", e=>{ if(e.key==="Enter") { e.preventDefault(); recompute(); } });

$("#favBtn").onclick = ()=>{
  if(!currentCalc) return;
  const id=currentCalc.id;
  if(STORE.favs.includes(id)) STORE.favs = STORE.favs.filter(x=>x!==id);
  else STORE.favs = [id, ...STORE.favs].slice(0,12);
  save("favs", STORE.favs);
  $("#favBtn").textContent = STORE.favs.includes(id) ? "★" : "☆";
  renderRails();
};

$("#resetBtn").onclick = ()=>{
  $("#modalBody").querySelectorAll("input,select").forEach(el=>{if(el.type!=="select")el.value="";});
  setResult("Fill the fields to see the result", true);
};

$("#copyBtn").onclick = async ()=>{
  if(!currentResult) return;
  try{ await navigator.clipboard.writeText(currentResult); $("#copyBtn").textContent="✓ Copied"; setTimeout(()=>$("#copyBtn").textContent="📋 Copy",1200);}catch{}
};

$("#shareBtn").onclick = async ()=>{
  const text = `${currentCalc?.name}\n${currentResult}\n\nvia CalciWorld`;
  if(navigator.share){ try{ await navigator.share({title:currentCalc?.name,text}); }catch{} }
  else { try{ await navigator.clipboard.writeText(text); $("#shareBtn").textContent="✓ Copied"; setTimeout(()=>$("#shareBtn").textContent="🔗 Share",1200);}catch{} }
};

$("#printBtn").onclick = ()=>{
  const w = window.open("","_blank");
  w.document.write(`<title>${currentCalc?.name}</title><pre style="font-family:system-ui;font-size:16px;padding:20px">${currentCalc?.name}\n\n${currentResult}</pre>`);
  w.print();
};

// Resource modal helper: open informational content from footer
function openResource(key){
  const docs = {
    about: {
      title: 'About CalciWorld',
      html: `
        <div class="modal-desc">
          <h3>CalciWorld</h3>
          <p>CalciWorld provides a curated set of fast, reliable calculators for finance, education, health, engineering and everyday tasks. All tools run locally in your browser — no account or sign-in required.</p>
          <h4>Why use CalciWorld</h4>
          <ul>
            <li>Privacy-first: calculations happen in-browser; we do not collect personal data.</li>
            <li>Fast &amp; offline-ready: instant results without waiting for servers.</li>
            <li>Clear UX: focused inputs, helpful validation and human-readable results.</li>
          </ul>
          <p>If you'd like to suggest a calculator or report an issue, contact us via the Contact link.</p>
        </div>
      `,
      summary: 'CalciWorld — local calculators for everyday use'
    },
    contact: {
      title: 'Contact',
      html: `
        <div class="modal-desc">
          <p>We welcome feedback, bug reports, and suggestions for new calculators.</p>
          <p>Email: <a href="mailto:satyarevanth666@gmail.com">satyarevanth666@gmail.com</a></p>
          <p>Website: <a href="https://calciworld.app" target="_blank" rel="noreferrer">calciworld.app</a></p>
          <h4>Typical response</h4>
          <p>We try to respond to inquiries within a few business days. For urgent issues, include relevant screenshots and steps to reproduce.</p>
        </div>
      `,
      summary: 'Contact CalciWorld team'
    },
    privacy: {
      title: 'Privacy Policy',
      html: `
        <div class="modal-desc">
          <p>CalciWorld is designed with privacy in mind:</p>
          <ul>
            <li>No personal data collection: the app runs entirely in your browser.</li>
            <li>Local storage: we may store non-sensitive preferences (theme, recent calculators) locally to improve your experience.</li>
            <li>External links: following a link to an external site may expose your visit to that site; we are not responsible for third-party privacy practices.</li>
          </ul>
          <p>If you have privacy concerns, email us at <a href="mailto:satyarevanth666@gmail.com">satyarevanth666@gmail.com</a>.</p>
        </div>
      `,
      summary: 'Privacy and local data usage'
    },
    terms: {
      title: 'Terms of Use',
      html: `
        <div class="modal-desc">
          <p>By using CalciWorld you agree to the following:</p>
          <ul>
            <li>CalciWorld is provided "as is" without warranties of accuracy or fitness for a particular purpose.</li>
            <li>Results are for informational purposes only — verify before making legal, financial, or medical decisions.</li>
            <li>We are not liable for damages or losses resulting from use of the calculators.</li>
          </ul>
          <p>If you disagree with these terms, please discontinue using the site.</p>
        </div>
      `,
      summary: 'Terms and disclaimers'
    }
  };
  const doc = docs[key];
  if(!doc) return;
  sciKeyHandler = null;
  currentCalc = null;
  $("#modalTitle").textContent = doc.title;
  $("#modalBody").innerHTML = doc.html;
  // hide calculator footer and favorite while displaying resource
  const foot = document.querySelector('.modal-foot'); if(foot) foot.classList.add('resource-mode');
  const fav = $("#favBtn"); if(fav) fav.style.display = 'none';
  setResult('', true);
  $("#calcModal").classList.remove("hidden");
}

// Wire footer resource buttons
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.footer-link').forEach(btn=>{
    btn.addEventListener('click', ()=> openResource(btn.dataset.resource));
  });
});
