/* COMEX demo: estado en memoria, datos ficticios y automatizaciones simuladas. */
(function (root) {
  'use strict';
  const DAY = '2026-10-03';
  const stages = ['Gerencia', 'Gerencia general', 'Enviada a fábrica', 'Preparación', 'En tránsito', 'Aduanas', 'Transporte', 'Finalizada'];
  const folders = ['1. Solicitud fábrica', '2. Información fábrica', '3. AGA', '4. Transporte'];
  const requiredDocs = ['Invoice', 'Packing List', 'BL', 'Certificado de origen'];
  const products = [
    {id:'P100',name:'Polímero P-100',form:'Líquido',price:2.68,factory:'Fábrica China · ejemplo',approved:true},
    {id:'P200',name:'Polímero P-200',form:'Polvo',price:3.19,factory:'Fábrica China · ejemplo',approved:true},
    {id:'P300',name:'Polímero P-300',form:'Líquido',price:2.45,factory:'Fábrica Brasil · ejemplo',approved:true}
  ];
  const clone = x => JSON.parse(JSON.stringify(x));
  const now = () => new Date().toISOString();
  const money = n => Math.round(n * 100) / 100;
  const dateOK = x => /^\d{4}-\d{2}-\d{2}$/.test(x) && !isNaN(Date.parse(x)) && new Date(x+'T12:00:00Z').toISOString().slice(0,10) === x;
  function document(type,po,version=1,folder=folders[1],data={}) {
    const slug = {Invoice:'INVOICE','Packing List':'PACKING_LIST',BL:'BL','Certificado de origen':'CERTIFICATE_OF_ORIGIN','Solicitud PO':'SOLICITUD','Liquidación':'LIQUIDACION','OT Transporte':'OT_TRANSPORTE'}[type] || 'DOCUMENTO';
    return {id:po+'-'+slug+'-v'+version,type,name:slug+'_'+po+(version>1?'_REV'+version:'')+'.pdf',folder,version,source:'Correo de ejemplo',received:now(),data:clone(data)};
  }
  function log(po,title,detail,source='Sistema de demostración') {po.events.unshift({at:now(),title,detail,source});}
  function total(po){return money(po.lines.reduce((sum,l)=>sum+l.qty*l.price,0));}
  function checklist(po){return requiredDocs.map(type=>({type,done:po.docs.some(d=>d.type===type)}));}
  function progress(po){return po.status==='Rechazada'?8:Math.round((stages.indexOf(po.status)+1)/stages.length*100);}
  function daysToETA(po){return po.eta?Math.round((Date.parse(po.eta)-Date.parse(DAY))/86400000):null;}
  function seed() {
    const rows=[
      ['DEMO-4006','Gerencia','Ingeniería A','Cliente Norte · ejemplo','2026-11-05','P100',12000],
      ['DEMO-4005','Enviada a fábrica','Ingeniería B','Cliente Sur · ejemplo','2026-11-03','P200',16000],
      ['DEMO-4004','En tránsito','Ingeniería A','Cliente Norte · ejemplo','2026-10-23','P100',22000],
      ['DEMO-4003','Aduanas','Ingeniería C','Cliente Centro · ejemplo','2026-10-16','P300',14688],
      ['DEMO-4002','Transporte','Ingeniería B','Cliente Sur · ejemplo','2026-10-09','P200',20000],
      ['DEMO-4001','Finalizada','Ingeniería C','Cliente Centro · ejemplo','2026-09-28','P300',18000]
    ];
    const state={orders:[],emails:[],outbox:[],nextPO:4007,products:clone(products)};
    rows.forEach(([id,status,engineer,client,eta,pid,qty])=>{
      const p=products.find(p=>p.id===pid);
      const po={id,status,engineer,client,factory:p.factory,destination:'Destino del cliente · ejemplo',requested:eta,created:'2026-10-01',revision:1,lines:[{product:pid,name:p.name,qty,price:p.price}],eta:null,etd:null,shipment:'',stock:'',docs:[],events:[],approval:[null,null],agencySent:false,transport:null,manager:'',costs:{freightUSD:null,insuranceUSD:null,customsCLP:null,vatCLP:null},sourceBatch:''};
      log(po,'Solicitud registrada','PO asignada y expediente creado.');
      if(stages.indexOf(status)>=2){po.approval=['Aprobada','Aprobada'];po.docs.push(document('Solicitud PO',id,1,folders[0]));po.docs[0].source='Generada por el sistema';log(po,'Solicitud enviada a fábrica','Aprobaciones completadas. Correo de salida simulado.');}
      if(stages.indexOf(status)>=4){po.eta=eta;po.etd='2026-09-25';po.shipment='EMB-'+id.slice(-4);po.stock='Despachado';po.docs.push(document('Invoice',id),document('Packing List',id),document('BL',id));po.costs.freightUSD=3450;po.costs.insuranceUSD=24;log(po,'Correo procesado','ETA, ETD y documentos asociados al expediente.','Correo de fábrica · ejemplo');}
      if(stages.indexOf(status)>=5){po.docs.push(document('Certificado de origen',id));po.agencySent=true;log(po,'Documentos enviados a AGA','Paquete revisado por el ingeniero. Envío simulado.');}
      if(stages.indexOf(status)>=6){po.docs.push(document('Liquidación',id,1,folders[2],{gastosCLP:490000,ivaCLP:93100}));po.costs.customsCLP=490000;po.costs.vatCLP=93100;po.transport={id:'OT-'+id.slice(-4),company:'Transportista · ejemplo',date:'2026-10-09',cost:583100,destination:po.destination};po.docs.push(document('OT Transporte',id,1,folders[3]));log(po,'OT de transporte emitida','Orden y correo de transporte simulados.');}
      if(status==='Finalizada'){po.manager='REG-DEMO-101';log(po,'Expediente finalizado','Cierre de demostración. Sin gestión de bodega.');}
      state.orders.push(po);
    });
    state.emails.push({id:'MAIL-SEED',poId:'DEMO-4004',subject:'PO DEMO-4004 · documentos de embarque',sender:'ventas@fabrica.example',kind:'shipment',status:'Procesado',received:'2026-10-02T14:00:00Z',body:'ETA: 2026-10-23\nETD: 2026-09-25\nEmbarque: EMB-4004',attachments:['INVOICE_DEMO-4004.pdf','PACKING_LIST_DEMO-4004.pdf','BL_DEMO-4004.pdf'],result:['PO identificada: DEMO-4004','3 documentos archivados en 2. Información fábrica','ETA, ETD y embarque actualizados'],fixture:true,report:null});
    return state;
  }
  function validateRequest(state,draft) {
    if(!draft.engineer?.trim()||!draft.client?.trim()||!draft.destination?.trim())throw Error('Completa responsable, cliente y destino.');
    if(!dateOK(draft.requested)||draft.requested<DAY)throw Error('Indica una fecha requerida válida, desde el 3 de octubre de 2026.');
    if(![1,2].includes(Number(draft.shipments)))throw Error('Selecciona uno o dos embarques para este ejemplo.');
    if(!draft.lines?.length)throw Error('Agrega al menos un producto.');
    const factories=new Set();
    draft.lines.forEach(l=>{const p=state.products.find(p=>p.id===l.product);if(!p||!p.approved)throw Error('Todos los productos necesitan un maestro aprobado.');if(!Number.isFinite(Number(l.qty))||Number(l.qty)<=0||Number(l.qty)>10000000)throw Error('Cada cantidad debe ser positiva y válida.');factories.add(p.factory);});
    if(factories.size!==1)throw Error('Una solicitud debe corresponder a una sola fábrica.');
    if(new Set(draft.lines.map(l=>l.product)).size!==draft.lines.length)throw Error('Consolida cada producto en una sola línea.');
    if(draft.lines.some(l=>Number(l.qty)<0.001*Number(draft.shipments)))throw Error('La cantidad es demasiado pequeña para repartirla entre los embarques.');
    return true;
  }
  function createOrders(state,draft) {
    validateRequest(state,draft);
    const count=Number(draft.shipments),batch='SOL-'+state.nextPO,orders=[];
    for(let i=0;i<count;i++){
      const id='DEMO-'+state.nextPO++;
      const lines=draft.lines.map(l=>{const p=state.products.find(p=>p.id===l.product);const base=Math.floor(Number(l.qty)/count*1000)/1000;const qty=i===count-1?Number(l.qty)-base*(count-1):base;if(qty<=0)throw Error('La cantidad es demasiado pequeña para repartirla.');return {product:p.id,name:p.name,qty:money(qty*1000)/1000,price:p.price};});
      const po={id,status:'Gerencia',engineer:draft.engineer.trim(),client:draft.client.trim(),factory:state.products.find(p=>p.id===lines[0].product).factory,destination:draft.destination.trim(),requested:draft.requested,created:DAY,revision:1,lines,eta:null,etd:null,shipment:'',stock:'',docs:[],events:[],approval:[null,null],agencySent:false,transport:null,manager:'',costs:{freightUSD:null,insuranceUSD:null,customsCLP:null,vatCLP:null},sourceBatch:batch};
      log(po,'Solicitud registrada',count===2?'Dos embarques: dos PO correlativas. Reparto equitativo de ejemplo; confirmar regla definitiva.':'Una PO asignada para un embarque.');
      log(po,'Carpeta creada',folders.map(f=>id+'/'+f).join(' · '));
      log(po,'Aprobación solicitada','Notificación de demostración a Gerencia. Circuito provisional.');
      orders.push(po);
    }
    state.orders.unshift(...orders);return orders;
  }
  function decide(state,id,decision,comment='') {
    const po=state.orders.find(o=>o.id===id);if(!po||!['Gerencia','Gerencia general'].includes(po.status))throw Error('Esta PO no tiene una aprobación pendiente.');
    if(decision==='reject'){
      if(!comment.trim())throw Error('Indica el motivo del rechazo.');const role=po.status;po.approval[role==='Gerencia'?0:1]='Rechazada';po.status='Rechazada';po.rejection=comment.trim();log(po,'Solicitud rechazada',role+': '+comment.trim());log(po,'Ingeniero notificado','La solicitud vuelve a corrección.');return po;
    }
    if(decision!=='approve')throw Error('Decisión inválida.');
    if(po.status==='Gerencia'){po.approval[0]='Aprobada';po.status='Gerencia general';log(po,'Gerencia aprobó','Se solicita aprobación a Gerencia general.');}
    else{po.approval[1]='Aprobada';po.status='Enviada a fábrica';const doc=document('Solicitud PO',po.id,po.revision,folders[0]);doc.source='Generada por el sistema';po.docs.push(doc);log(po,'Gerencia general aprobó','Circuito de aprobación completado.');log(po,'Solicitud enviada a fábrica','PDF referencial generado y correo de salida simulado.');state.outbox.unshift({poId:id,to:'ventas@fabrica.example',cc:'comex@empresa.example',subject:'Solicitud PO '+id,attachments:[doc.name],kind:'factory',at:now()});}
    return po;
  }
  function revise(state,id,draft){const po=state.orders.find(o=>o.id===id);if(!po||po.status!=='Rechazada')throw Error('Solo puedes corregir una solicitud rechazada.');validateRequest(state,draft);po.lines=draft.lines.map(l=>{const p=state.products.find(p=>p.id===l.product);return {product:p.id,name:p.name,qty:Number(l.qty),price:p.price};});po.factory=state.products.find(p=>p.id===po.lines[0].product).factory;po.engineer=draft.engineer;po.client=draft.client;po.destination=draft.destination;po.requested=draft.requested;po.revision++;po.status='Gerencia';po.approval=[null,null];log(po,'Solicitud corregida','Revisión '+po.revision+' reenviada a aprobación. Se conserva el número de PO.');return [po];}
  function classify(name){if(/INVOICE|FACTURA/i.test(name))return 'Invoice';if(/PACKING|\bPL[_ .-]/i.test(name))return 'Packing List';if(/(?:^|[_ .-])BL(?:[_ .-]|\.)|BILL.?OF.?LADING/i.test(name))return 'BL';if(/CERTIFICATE.?OF.?ORIGIN|CERTIFICADO.?ORIGEN/i.test(name))return 'Certificado de origen';if(/LIQUIDACION/i.test(name))return 'Liquidación';if(/REPORTE|REPORT/i.test(name)&&/\.xlsx$/i.test(name))return 'Reporte semanal';return null;}
  function identify(text){return [...new Set((text.match(/DEMO-\d{4,}/g)||[]))];}
  function parseBody(body){const fields={};for(const key of ['ETA','ETD']){const m=body.match(new RegExp(key+':\\s*(\\d{4}-\\d{2}-\\d{2})','i'));if(m&&dateOK(m[1]))fields[key.toLowerCase()]=m[1];}const m=body.match(/Embarque:\s*([^\n]+)/i);if(m)fields.shipment=m[1].trim();const stock=body.match(/Estado:\s*([^\n]+)/i);if(stock)fields.stock=stock[1].trim();return fields;}
  function receive(state,id,kind) {
    const po=state.orders.find(o=>o.id===id);if(!po||stages.indexOf(po.status)<2)throw Error('Primero completa ambas aprobaciones y envía la PO a fábrica.');
    const fixtureId='MAIL-'+id+'-'+kind;
    if(state.emails.some(m=>m.id===fixtureId)){log(po,'Reenvío detectado','El correo ya fue procesado; no se duplicaron documentos ni datos.');return {duplicate:true,poId:id};}
    const ref=kind==='unknown'?'DEMO-9999':id;
    const quantity=po.lines.reduce((n,l)=>n+l.qty,0);
    const types=kind==='shipment'?['Invoice','Packing List','BL']:kind==='certificate'?['Certificado de origen']:kind==='liquidation'?['Liquidación']:[];
    const metadata={fixture:true,quantity,unitUSD:po.lines[0].price,totalUSD:total(po),freightUSD:3450,insuranceUSD:24,customsCLP:490000,vatCLP:93100};
    const docs=types.map(t=>document(t,ref,1,t==='Liquidación'?folders[2]:folders[1],metadata));
    if(kind==='unknown')docs.push(document('Invoice',ref,1,folders[1],metadata));
    const confirmation=kind==='confirmation'||kind==='shipment'||kind==='unknown';
    const body='PO '+ref+'\n'+(confirmation?'ETA: 2026-11-03\nETD: 2026-10-15\nEmbarque: EMB-'+id.slice(-4)+'\nEstado: '+(kind==='shipment'?'Despachado':'Stock disponible'):'Documentos complementarios adjuntos.');
    const weekly=kind==='weekly'?{eta:'2026-11-05',etd:'2026-10-17',shipment:po.shipment||'EMB-'+id.slice(-4),rows:[{po:id,eta:'2026-11-05',etd:'2026-10-17',status:'Fecha actualizada'}]}:null;
    const email={id:fixtureId,poId:null,subject:'PO '+ref+' · '+({confirmation:'confirmación y fechas',shipment:'documentos de embarque',certificate:'certificado de origen',weekly:'informe semanal',unknown:'documentos por vincular',liquidation:'liquidación de aduana'}[kind]||kind),sender:kind==='liquidation'?'operaciones@agencia.example':'ventas@fabrica.example',kind,status:'Recibido',received:now(),body,attachments:docs.map(d=>d.name),docs,result:[],fixture:true,metadata,report:weekly};
    if(weekly)email.attachments.push('REPORTE_SEMANAL_'+id+'.xlsx');
    state.emails.unshift(email);process(state,email);return email;
  }
  function process(state,email,forcedPO) {
    const refs=identify(email.subject+'\n'+email.body+'\n'+email.attachments.join('\n'));
    const id=forcedPO||(refs.length===1?refs[0]:null),po=state.orders.find(o=>o.id===id);
    if(!po){email.status='Por vincular';email.result=['PO sin coincidencia en el sistema. Responsable COMEX notificado.'];return email;}
    if(stages.indexOf(po.status)<2){email.status='Por vincular';email.result=['La PO todavía no ha completado sus aprobaciones. No se actualizaron sus datos.'];return email;}
    email.poId=id;email.result=['PO identificada: '+id];
    if(forcedPO)email.result.push('Vinculación resuelta por COMEX; se conserva el nombre original de cada archivo.');
    const fields=parseBody(email.body);
    if(email.report){Object.assign(fields,{eta:email.report.eta,etd:email.report.etd,shipment:email.report.shipment});email.result.push('Fila del informe semanal de ejemplo vinculada a la PO.');}
    const before=po.eta;
    Object.assign(po,fields);
    if(Object.keys(fields).length)email.result.push('Actualizados: '+Object.keys(fields).map(k=>k.toUpperCase()).join(', '));
    if(before&&fields.eta&&before!==fields.eta){log(po,'Cambio de ETA informado',before+' → '+fields.eta+'. Ingeniero y COMEX notificados.');email.result.push('Cambio de fecha registrado y notificación simulada. Política definitiva por confirmar.');}
    if(po.status==='Enviada a fábrica'&&email.kind==='confirmation')po.status='Preparación';
    (email.docs||[]).forEach(d=>{const type=classify(d.name);if(!type){email.result.push('Archivo sin clasificación: '+d.name);return;}const copy=clone(d);copy.type=type;copy.id=id+'-'+type+'-'+(po.docs.filter(x=>x.type===type).length+1);copy.version=po.docs.filter(x=>x.type===type).length+1;copy.source=email.id;po.docs.push(copy);email.result.push(copy.name+' → '+id+'/'+copy.folder);});
    if(email.kind==='shipment'){
      if(stages.indexOf(po.status)<4)po.status='En tránsito';
      po.costs.freightUSD=email.metadata.freightUSD;po.costs.insuranceUSD=email.metadata.insuranceUSD;
      email.result.push('Valores de documentos de ejemplo incorporados. La lectura real de PDF aún no está conectada.');
    }
    if(email.kind==='liquidation'){po.costs.customsCLP=email.metadata.customsCLP;po.costs.vatCLP=email.metadata.vatCLP;log(po,'Aviso a Finanzas','Liquidación registrada. Aviso de pago de IVA simulado; importe de ejemplo.');}
    email.status='Procesado';log(po,'Correo procesado',email.subject+' · '+(email.docs||[]).length+' archivo(s) archivado(s).',email.id);return email;
  }
  function sendAgency(state,id,reviewed){const po=state.orders.find(o=>o.id===id);if(!po||!reviewed)throw Error('El ingeniero debe confirmar que revisó el paquete.');if(checklist(po).some(d=>!d.done))throw Error('Faltan documentos obligatorios.');if(po.agencySent)throw Error('El paquete ya fue enviado en esta demostración.');po.agencySent=true;if(stages.indexOf(po.status)<5)po.status='Aduanas';state.outbox.unshift({poId:id,to:'operaciones@agencia.example',cc:po.engineer,subject:'Documentos de embarque · PO '+id,attachments:requiredDocs.map(t=>po.docs.filter(d=>d.type===t).at(-1).name),kind:'agency',at:now()});log(po,'Paquete revisado y enviado a AGA','Confirmación del ingeniero registrada. Correo de salida simulado.');}
  function emitOT(state,id,data){const po=state.orders.find(o=>o.id===id);if(!po?.agencySent)throw Error('Primero completa la revisión y el envío a AGA.');if(po.transport)throw Error('Esta PO ya tiene una OT emitida.');if(!data.company?.trim()||!data.destination?.trim()||!dateOK(data.date)||!Number.isFinite(Number(data.cost))||Number(data.cost)<=0)throw Error('Completa transportista, destino, fecha e importe válido.');po.transport={id:'OT-DEMO-'+id.slice(-4),...data,cost:Number(data.cost)};po.docs.push(document('OT Transporte',id,1,folders[3],po.transport));po.status='Transporte';state.outbox.unshift({poId:id,to:'despachos@transporte.example',subject:po.transport.id+' · PO '+id,attachments:[po.docs.at(-1).name],kind:'transport',at:now()});log(po,'OT de transporte emitida','Documento generado y correo simulado. Responsables definitivos por validar.');return po;}
  function alerts(state){const a=[];state.orders.forEach(po=>{if(['Gerencia','Gerencia general'].includes(po.status))a.push({po:po.id,type:'Aprobación',text:'Pendiente de '+po.status,route:'approvals'});if(po.status==='Rechazada')a.push({po:po.id,type:'Corrección',text:'Ingeniero notificado: solicitud rechazada',route:'history'});const days=daysToETA(po);if(days!==null&&days<=20&&days>=0&&checklist(po).some(x=>!x.done))a.push({po:po.id,type:'Documentos',text:'Arribo en '+days+' días: checklist incompleto',route:'customs'});if(days!==null&&days<=15&&days>=0&&checklist(po).every(x=>x.done)&&!po.agencySent)a.push({po:po.id,type:'AGA',text:'Paquete completo: pendiente revisión del ingeniero',route:'customs'});if(po.costs.vatCLP&&!po.manager)a.push({po:po.id,type:'Finanzas',text:'Liquidación registrada: aviso de IVA de ejemplo',route:'costs'});});state.emails.filter(m=>m.status==='Por vincular').forEach(m=>a.push({po:'Sin vincular',type:'Correo',text:m.subject,route:'emails'}));return a;}
  const api={DAY,stages,folders,requiredDocs,seed,total,checklist,progress,daysToETA,validateRequest,createOrders,decide,revise,classify,identify,parseBody,receive,process,sendAgency,emitOT,alerts,log,dateOK};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ComexModel=api;
})(typeof window!=='undefined'?window:globalThis);
