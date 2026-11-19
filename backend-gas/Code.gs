/**
 * KRATINGDAENG — HOMECOMING ACTIVATION 2027
 * Google Apps Script REST backend for Google Sheets + Drive.
 * Bind this script to the campaign spreadsheet, then run setup() once.
 * Deploy as Web App: Execute as Me; access: Anyone (PIN auth is enforced here).
 */

const APP = {
  NAME: 'KRATINGDAENG HOMECOMING ACTIVATION 2027',
  TZ: 'Asia/Jakarta',
  ROOT_FOLDER: 'Mudik_2027',
  SESSION_HOURS: 6,
  MAX_UPLOAD_BYTES: 5 * 1024 * 1024,
  TARGET_BOTTLES: 75285,
  ROLES: ['ADMIN', 'CLIENT', 'TL', 'SPG', 'CREW'],
  SHEETS: {
    Users_Access: ['userId','name','username','pinSalt','pinHash','role','venueId','shift','enabled','createdAt','updatedAt'],
    Master_Booths: ['venueId','name','type','region','province','startDate','endDate','workingDays','manpower','targetBooth','targetIDM','targetSelling','samplingTarget','idmCodes','lat','lng','cctvUrl','cctvType','trafficStatus','isActive','createdAt','updatedAt'],
    Visitors_Log: ['id','timestamp','date','venueId','userId','metric','delta','totalAfter','note'],
    Sales_Sampling: ['id','timestamp','date','venueId','userId','spgName','productMode','packageCode','packageLabel','qty','bottles','cans','revenue','samplingType','cups','igStories','storeCode','luckyDipChances','source'],
    Inventory_Opname: ['id','timestamp','date','venueId','userId','entryType','item','openingQty','closingQty','delta','fromLocation','toLocation','location','shift','note'],
    Drive_Docs: ['id','timestamp','date','venueId','userId','category','fileName','mimeType','driveFileId','url'],
    Master_Inventory: ['item','category','initialQty','bufferQty','availableQty','reservedQty','updatedAt'],
    Attendance_Log: ['id','timestamp','date','venueId','userId','staffName','staffRole','shift','eventType','status','photoUrl','note'],
    Activity_Log: ['id','timestamp','date','venueId','userId','activityType','quantity','unit','location','note'],
    Daily_Closing: ['id','timestamp','date','venueId','userId','visitors','samplingCups','bottles','cans','revenue','summary','driveUrl'],
    LuckyDip_Log: ['id','timestamp','date','venueId','userId','entryType','chances','prize','tier']
  }
};

const VENUES = [
  {venueId:'RA-KM57A',name:'KM 57A Karawang',type:'REST_AREA',region:'Jawa Barat',province:'Jabar',startDate:'2027-03-03',endDate:'2027-03-09',workingDays:7,manpower:22,targetBooth:7350,targetIDM:272,targetSelling:0,samplingTarget:0,idmCodes:'T6YA,FPOG',lat:-6.4165,lng:107.3370,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM102A',name:'KM 102A Subang',type:'REST_AREA',region:'Jawa Barat',province:'Jabar',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:7350,targetIDM:268,targetSelling:0,samplingTarget:0,idmCodes:'T8H5',lat:-6.4660,lng:107.7720,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM166A',name:'KM 166A Cipali',type:'REST_AREA',region:'Jawa Barat',province:'Jabar',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:6300,targetIDM:365,targetSelling:0,samplingTarget:0,idmCodes:'T9B9',lat:-6.6500,lng:108.1380,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM207A',name:'KM 207A Cirebon',type:'REST_AREA',region:'Jawa Barat',province:'Jabar',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:7350,targetIDM:366,targetSelling:0,samplingTarget:0,idmCodes:'TH30',lat:-6.7500,lng:108.5500,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM379A',name:'KM 379A Batang',type:'REST_AREA',region:'Jawa Tengah',province:'Jateng',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:5250,targetIDM:233,targetSelling:0,samplingTarget:0,idmCodes:'TUT7',lat:-6.9600,lng:109.8700,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM429A',name:'KM 429A Ungaran',type:'REST_AREA',region:'Jawa Tengah',province:'Jateng',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:5250,targetIDM:176,targetSelling:0,samplingTarget:0,idmCodes:'TRES',lat:-7.1700,lng:110.3800,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'RA-KM754A',name:'KM 754A Sidoarjo',type:'REST_AREA',region:'Jawa Timur',province:'Jatim',startDate:'2027-03-03',endDate:'2027-03-08',workingDays:6,manpower:22,targetBooth:5250,targetIDM:305,targetSelling:0,samplingTarget:0,idmCodes:'FQT2',lat:-7.4500,lng:112.6800,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'PORT-GILIMANUK',name:'Pelabuhan Gilimanuk',type:'PORT',region:'Bali',province:'Bali',startDate:'2027-03-02',endDate:'2027-03-07',workingDays:6,manpower:19,targetBooth:0,targetIDM:0,targetSelling:6200,samplingTarget:600,idmCodes:'',lat:-8.1600,lng:114.4300,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'PORT-SEMAYANG',name:'Pelabuhan Semayang',type:'PORT',region:'Kalimantan Timur',province:'Balikpapan',startDate:'2027-03-03',endDate:'2027-03-07',workingDays:5,manpower:19,targetBooth:0,targetIDM:0,targetSelling:6000,samplingTarget:500,idmCodes:'',lat:-1.2700,lng:116.8300,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'PORT-MAKASSAR',name:'Pelabuhan Makassar',type:'PORT',region:'Sulawesi Selatan',province:'Sulsel',startDate:'2027-03-03',endDate:'2027-03-07',workingDays:5,manpower:19,targetBooth:0,targetIDM:0,targetSelling:8000,samplingTarget:500,idmCodes:'',lat:-5.1300,lng:119.4100,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'PORT-CIWANDAN',name:'Pelabuhan Ciwandan',type:'PORT',region:'Banten',province:'Banten',startDate:'2027-03-04',endDate:'2027-03-08',workingDays:5,manpower:19,targetBooth:0,targetIDM:0,targetSelling:4000,samplingTarget:500,idmCodes:'',lat:-6.0200,lng:105.9500,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'},
  {venueId:'PORT-BAKAUHENI',name:'Pelabuhan Bakauheni',type:'PORT',region:'Lampung',province:'Lampung',startDate:'2027-03-13',endDate:'2027-03-17',workingDays:5,manpower:19,targetBooth:0,targetIDM:0,targetSelling:5000,samplingTarget:500,idmCodes:'',lat:-5.8700,lng:105.7500,cctvUrl:'',cctvType:'HLS',trafficStatus:'UNKNOWN'}
];

const INVENTORY_SEED = [
  ['Balon','POSM',2760],['Payung Lipat','GIMMICK',1318],['Tongkat Tol','GIMMICK',1614],
  ['Shopping Bag','GIMMICK',11863],['Jas Hujan','GIMMICK',1975],['Kaos','GIMMICK',992],
  ['Topi','GIMMICK',986],['Plastic Bag','PACKAGING',19770],['Cover Tas','GIMMICK',1022],
  ['Seragam','MANPOWER_GEAR',''],['Topi Crew','MANPOWER_GEAR',''],['Jas Hujan Crew','MANPOWER_GEAR','']
];

const DEMO_USERS = [
  {name:'Agency Administrator',username:'admin',pin:'817263',role:'ADMIN',venueId:'',shift:'ALL'},
  {name:'Kratingdaeng Client',username:'client',pin:'817264',role:'CLIENT',venueId:'',shift:'VIEW'},
  {name:'Team Leader Demo',username:'tl-demo',pin:'817265',role:'TL',venueId:'RA-KM57A',shift:'S1'},
  {name:'SPG Demo',username:'spg-demo',pin:'817266',role:'SPG',venueId:'RA-KM57A',shift:'S1'},
  {name:'Field Crew Demo',username:'crew-demo',pin:'817267',role:'CREW',venueId:'RA-KM57A',shift:'S1'}
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  if (!PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')) {
    throw new Error('Bind this script to a Google Spreadsheet or set Script Property SPREADSHEET_ID.');
  }
  ensureSecret_();
  Object.keys(APP.SHEETS).forEach(name => ensureSheet_(name, APP.SHEETS[name]));
  seedBooths_();
  seedInventory_();
  seedUsers_();
  getRootFolder_();
  return {ok:true,message:'Setup complete',spreadsheetId:PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'),venueCount:VENUES.length};
}

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = String(p.action || 'health');
    if (action === 'health') return json_({ok:true,app:APP.NAME,now:now_(),version:'1.0.0'});
    const user = authorize_(p.token || '');
    switch (action) {
      case 'dashboard': return json_({ok:true,data:getDashboard_(user)});
      case 'booths': return json_({ok:true,data:getBooths_(user)});
      case 'docs': return json_({ok:true,data:getDocs_(user,p.venueId || '')});
      case 'users': requireRole_(user,['ADMIN']); return json_({ok:true,data:getUsers_()});
      case 'inventory': requireRole_(user,['ADMIN','TL','CREW']); return json_({ok:true,data:getInventory_(user)});
      case 'attendance': requireRole_(user,['ADMIN','TL']); return json_({ok:true,data:getAttendance_(user,p.date || '')});
      case 'mySales': requireRole_(user,['ADMIN','SPG']); return json_({ok:true,data:getMySales_(user,p.venueId || '')});
      case 'venueSales': requireRole_(user,['ADMIN','TL']); return json_({ok:true,data:getVenueSales_(user,p.venueId || '')});
      default: return json_({ok:false,error:'Unknown GET action: '+action});
    }
  } catch (err) { return json_({ok:false,error:errorMessage_(err)}); }
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);
    const action = String(body.action || '');
    if (action === 'login') return json_({ok:true,data:login_(body.username,body.pin)});
    const user = authorize_(body.token || '');
    let result;
    switch (action) {
      case 'visitorClick': requireRole_(user,['ADMIN','TL']); result = visitorClick_(user,body); break;
      case 'recordSale': requireRole_(user,['ADMIN','SPG']); result = recordSale_(user,body); break;
      case 'recordSampling': requireRole_(user,['ADMIN','SPG']); result = recordSampling_(user,body); break;
      case 'redeemPrize': requireRole_(user,['ADMIN','SPG']); result = redeemPrize_(user,body); break;
      case 'saveAttendance': requireRole_(user,['ADMIN','TL']); result = saveAttendance_(user,body); break;
      case 'saveInventory': requireRole_(user,['ADMIN','TL','CREW']); result = saveInventory_(user,body); break;
      case 'logMobileSale': requireRole_(user,['ADMIN','CREW']); result = logMobileSale_(user,body); break;
      case 'uploadDoc': requireRole_(user,['ADMIN','TL','CREW']); result = uploadDoc_(user,body); break;
      case 'saveClosingReport': requireRole_(user,['ADMIN','TL']); result = saveClosingReport_(user,body); break;
      case 'createUser': requireRole_(user,['ADMIN']); result = createUser_(body); break;
      case 'updateUser': requireRole_(user,['ADMIN']); result = updateUser_(body); break;
      case 'updateBooth': requireRole_(user,['ADMIN']); result = updateBooth_(body); break;
      case 'updateInventoryMaster': requireRole_(user,['ADMIN']); result = updateInventoryMaster_(body); break;
      case 'logout': result = revokeToken_(body.token); break;
      default: throw new Error('Unknown POST action: '+action);
    }
    return json_({ok:true,data:result});
  } catch (err) { return json_({ok:false,error:errorMessage_(err)}); }
}

/* ---------- Bootstrap / sheets ---------- */
function db_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Backend is not initialized. Run setup() from Apps Script first.');
  return SpreadsheetApp.openById(id);
}
function ensureSheet_(name, headers) {
  const ss = db_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  else {
    const current = sh.getRange(1,1,1,Math.max(sh.getLastColumn(),headers.length)).getValues()[0];
    const missing = headers.filter(h => current.indexOf(h) < 0);
    if (missing.length) sh.getRange(1,current.filter(String).length+1,1,missing.length).setValues([missing]);
  }
  sh.setFrozenRows(1);
  return sh;
}
function sheet_(name) { return db_().getSheetByName(name); }
function rows_(name) {
  const sh = sheet_(name); const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).map((r,i) => {
    const o = {_row:i+2}; headers.forEach((h,j) => o[h] = r[j]); return o;
  }).filter(o => Object.keys(o).some(k => k !== '_row' && o[k] !== '' && o[k] !== null));
}
function append_(name, obj) {
  const sh = sheet_(name); const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  sh.appendRow(headers.map(h => obj[h] === undefined ? '' : obj[h]));
}
function updateRow_(name,rowNumber,patch) {
  const sh=sheet_(name); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(patch).forEach(k=>{const c=headers.indexOf(k);if(c>=0)sh.getRange(rowNumber,c+1).setValue(patch[k]);});
}
function seedBooths_() {
  const existing=rows_('Master_Booths'); const ids=existing.map(x=>String(x.venueId));
  VENUES.forEach(v=>{if(ids.indexOf(v.venueId)<0)append_('Master_Booths',Object.assign({},v,{isActive:true,createdAt:now_(),updatedAt:now_()}));});
}
function seedInventory_() {
  const existing=rows_('Master_Inventory'); const names=existing.map(x=>String(x.item));
  INVENTORY_SEED.forEach(row=>{
    const [item,category,initial]=row;
    if(names.indexOf(item)>=0)return;
    const buffer=initial===''?'':Math.ceil(Number(initial)*0.05);
    const available=initial===''?'':Math.max(0,Number(initial)-Number(buffer));
    append_('Master_Inventory',{item,category,initialQty:initial,bufferQty:buffer,availableQty:available,reservedQty:0,updatedAt:now_()});
  });
}
function seedUsers_() {
  const users=rows_('Users_Access'); const names=users.map(x=>String(x.username).toLowerCase());
  DEMO_USERS.forEach(u=>{
    if(names.indexOf(u.username.toLowerCase())>=0)return;
    const salt=randomToken_(12);
    append_('Users_Access',{userId:uuid_(),name:u.name,username:u.username,pinSalt:salt,pinHash:hashPin_(u.pin,salt),role:u.role,venueId:u.venueId,shift:u.shift,enabled:true,createdAt:now_(),updatedAt:now_()});
  });
}
function ensureSecret_() {
  const props=PropertiesService.getScriptProperties();
  if(!props.getProperty('SESSION_SECRET'))props.setProperty('SESSION_SECRET',uuid_()+uuid_()+uuid_()+uuid_());
}

/* ---------- Authentication and authorization ---------- */
function login_(username,pin) {
  const uname=String(username||'').trim().toLowerCase(); const p=String(pin||'').trim();
  if(!uname || !/^\d{4,12}$/.test(p))throw new Error('Masukkan username dan PIN 4–12 digit.');
  const cache=CacheService.getScriptCache(); const failKey='login_fail_'+Utilities.base64EncodeWebSafe(uname);
  if(Number(cache.get(failKey)||0)>=6)throw new Error('Terlalu banyak percobaan. Coba lagi dalam 15 menit.');
  const record=rows_('Users_Access').find(u=>String(u.username).toLowerCase()===uname);
  if(!record || !truthy_(record.enabled) || hashPin_(p,String(record.pinSalt))!==String(record.pinHash)) { cache.put(failKey,String(Number(cache.get(failKey)||0)+1),900); throw new Error('Username atau PIN tidak valid.'); }
  cache.remove(failKey);
  const user={userId:String(record.userId),name:String(record.name),username:String(record.username),role:String(record.role),venueId:String(record.venueId||''),shift:String(record.shift||'')};
  return {token:issueToken_(user),user,expiresIn:APP.SESSION_HOURS*3600};
}
function issueToken_(user) {
  const payload=Utilities.base64EncodeWebSafe(JSON.stringify(Object.assign({},user,{sid:uuid_(),exp:Date.now()+APP.SESSION_HOURS*3600000}))).replace(/=+$/,'');
  const sig=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload,PropertiesService.getScriptProperties().getProperty('SESSION_SECRET'))).replace(/=+$/,'');
  return payload+'.'+sig;
}
function authorize_(token) {
  const parts=String(token||'').split('.'); if(parts.length!==2)throw new Error('Sesi tidak valid. Silakan login kembali.');
  const expected=Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0],PropertiesService.getScriptProperties().getProperty('SESSION_SECRET'))).replace(/=+$/,'');
  if(expected!==parts[1])throw new Error('Token sesi tidak valid.');
  const payload=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  if(!payload.exp || Number(payload.exp)<Date.now())throw new Error('Sesi berakhir. Silakan login kembali.');
  if(payload.sid && CacheService.getScriptCache().get('session_revoked_'+payload.sid))throw new Error('Sesi telah diakhiri. Silakan login kembali.');
  const active=rows_('Users_Access').find(u=>String(u.userId)===String(payload.userId));
  if(!active || !truthy_(active.enabled))throw new Error('Akun dinonaktifkan.');
  return {userId:String(active.userId),name:String(active.name),username:String(active.username),role:String(active.role),venueId:String(active.venueId||''),shift:String(active.shift||'')};
}

function revokeToken_(token) {
  try {
    const parts=String(token||'').split('.'); if(parts.length!==2)return {loggedOut:true};
    const payload=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
    const ttl=Math.max(60,Math.min(APP.SESSION_HOURS*3600,Math.ceil((Number(payload.exp||Date.now())-Date.now())/1000)));
    if(payload.sid)CacheService.getScriptCache().put('session_revoked_'+payload.sid,'1',ttl);
  } catch(e) {}
  return {loggedOut:true};
}
function requireRole_(user,roles) { if(roles.indexOf(user.role)<0)throw new Error('Akses ditolak untuk modul ini.'); }
function assertVenue_(user,venueId) {
  const id=String(venueId||''); if(!id)throw new Error('Venue wajib dipilih.');
  if(user.role!=='ADMIN' && user.role!=='CLIENT' && String(user.venueId)!==id)throw new Error('Anda tidak memiliki akses ke venue ini.');
}
function hashPin_(pin,salt) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(salt)+'|'+String(pin))); }

/* ---------- Read models ---------- */
function getBooths_(user) {
  let list=rows_('Master_Booths').filter(b=>truthy_(b.isActive));
  if(user.role!=='ADMIN' && user.role!=='CLIENT')list=list.filter(b=>String(b.venueId)===user.venueId);
  return list.map(b=>Object.assign({},b,{targetTotal:Number(b.targetBooth||0)+Number(b.targetIDM||0)+Number(b.targetSelling||0)}));
}
function getDashboard_(user) {
  const booths=getBooths_(user); const ids=booths.map(b=>String(b.venueId));
  const visitorRows=rows_('Visitors_Log').filter(r=>ids.indexOf(String(r.venueId))>=0);
  const saleRows=rows_('Sales_Sampling').filter(r=>ids.indexOf(String(r.venueId))>=0);
  const docRows=rows_('Drive_Docs').filter(r=>ids.indexOf(String(r.venueId))>=0);
  const visitors=sum_(visitorRows.filter(r=>r.metric==='VISITOR'),'delta');
  const uniqueMirror=sum_(visitorRows.filter(r=>r.metric==='UNIQUE_MIRROR'),'delta');
  const photoBooth=sum_(visitorRows.filter(r=>r.metric==='PHOTO_BOOTH'),'delta');
  const bottles=sum_(saleRows,'bottles'); const cans=sum_(saleRows,'cans'); const revenue=sum_(saleRows,'revenue');
  const sampling=sum_(saleRows,'cups'); const buyers=saleRows.filter(r=>Number(r.bottles||0)+Number(r.cans||0)>0).length;
  const target=booths.reduce((a,b)=>a+Number(b.targetBooth||0)+Number(b.targetIDM||0)+Number(b.targetSelling||0),0);
  const venueStats=booths.map(b=>{
    const vr=visitorRows.filter(r=>String(r.venueId)===String(b.venueId));
    const sr=saleRows.filter(r=>String(r.venueId)===String(b.venueId));
    const dr=docRows.filter(r=>String(r.venueId)===String(b.venueId)).sort((a,c)=>String(c.timestamp).localeCompare(String(a.timestamp)));
    const v=sum_(vr.filter(r=>r.metric==='VISITOR'),'delta');
    const saleB=sum_(sr,'bottles'); const saleC=sum_(sr,'cans');
    return {venueId:String(b.venueId),name:String(b.name),type:String(b.type),region:String(b.region),trafficStatus:String(b.trafficStatus||'UNKNOWN'),visitors:v,uniqueMirror:sum_(vr.filter(r=>r.metric==='UNIQUE_MIRROR'),'delta'),photoBooth:sum_(vr.filter(r=>r.metric==='PHOTO_BOOTH'),'delta'),sampling:sum_(sr,'cups'),bottles:saleB,cans:saleC,revenue:sum_(sr,'revenue'),target:Number(b.targetBooth||0)+Number(b.targetIDM||0)+Number(b.targetSelling||0),latestPhoto:dr.find(d=>String(d.mimeType).indexOf('image/')===0)?.url||''};
  });
  return {refreshedAt:now_(),totalVisitors:visitors,uniqueMirror,photoBooth,totalSampling:sampling,totalBottles:bottles,totalCans:cans,totalSalesUnits:bottles+cans,totalRevenue:revenue,buyerTransactions:buyers,conversionRate:visitors?Number((buyers/visitors*100).toFixed(2)):0,targetBottles:target,progress:target?Number((bottles/target*100).toFixed(2)):0,venueCount:booths.length,venues:venueStats,role:user.role,venueId:user.venueId||''};
}
function getDocs_(user,venueId) {
  let docs=rows_('Drive_Docs');
  if(user.role!=='ADMIN' && user.role!=='CLIENT')docs=docs.filter(d=>String(d.venueId)===String(user.venueId));
  else if(venueId)docs=docs.filter(d=>String(d.venueId)===String(venueId));
  return docs.sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0,500);
}
function getUsers_() { return rows_('Users_Access').map(u=>({userId:u.userId,name:u.name,username:u.username,role:u.role,venueId:u.venueId,shift:u.shift,enabled:truthy_(u.enabled),createdAt:u.createdAt,updatedAt:u.updatedAt})); }
function getInventory_(user) {
  const inventory=rows_('Master_Inventory');
  return inventory.map(x=>Object.assign({},x,{initialQty:x.initialQty===''?'':Number(x.initialQty),bufferQty:x.bufferQty===''?'':Number(x.bufferQty),availableQty:x.availableQty===''?'':Number(x.availableQty)}));
}
function getVenueSales_(user,venueId) {
  const scopeVenue=venueId || user.venueId; assertVenue_(user,scopeVenue);
  return rows_('Sales_Sampling').filter(r=>String(r.venueId)===String(scopeVenue)).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0,250);
}
function getMySales_(user,venueId) {
  const scopeVenue=venueId || user.venueId;
  if(scopeVenue)assertVenue_(user,scopeVenue);
  let list=rows_('Sales_Sampling').filter(r=>String(r.userId)===String(user.userId));
  if(scopeVenue)list=list.filter(r=>String(r.venueId)===String(scopeVenue));
  const todayRows=list.filter(r=>String(r.date)===today_());
  const earned=rows_('LuckyDip_Log').filter(r=>String(r.userId)===String(user.userId) && String(r.date)===today_());
  return {name:user.name,venueId:scopeVenue||'',today:{bottles:sum_(todayRows,'bottles'),cans:sum_(todayRows,'cans'),revenue:sum_(todayRows,'revenue'),sampling:sum_(todayRows,'cups'),transactions:todayRows.filter(r=>Number(r.bottles||0)+Number(r.cans||0)>0).length},total:{bottles:sum_(list,'bottles'),cans:sum_(list,'cans'),revenue:sum_(list,'revenue'),sampling:sum_(list,'cups'),transactions:list.filter(r=>Number(r.bottles||0)+Number(r.cans||0)>0).length},luckyDip:{earned:sum_(earned.filter(r=>r.entryType==='EARNED'),'chances'),used:sum_(earned.filter(r=>r.entryType==='USED'),'chances'),available:Math.max(0,sum_(earned.filter(r=>r.entryType==='EARNED'),'chances')-sum_(earned.filter(r=>r.entryType==='USED'),'chances'))}};
}
function getAttendance_(user,date) {
  let list=rows_('Attendance_Log'); if(user.role!=='ADMIN')list=list.filter(r=>String(r.venueId)===user.venueId);
  if(date)list=list.filter(r=>String(r.date)===String(date));
  return list.sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp))).slice(0,300);
}

/* ---------- Field actions ---------- */
function visitorClick_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const metric=String(b.metric||'VISITOR'); if(['VISITOR','UNIQUE_MIRROR','PHOTO_BOOTH'].indexOf(metric)<0)throw new Error('Metric visitor tidak dikenal.');
  const delta=Number(b.delta||1); if(delta!==1 && delta!==-1)throw new Error('Perubahan visitor hanya boleh +1 atau -1.');
  const lock=LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const logs=rows_('Visitors_Log').filter(r=>String(r.venueId)===venueId && String(r.metric)===metric);
    const current=sum_(logs,'delta'); const next=Math.max(0,current+delta); const actual=next-current;
    if(actual!==0)append_('Visitors_Log',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,metric,delta:actual,totalAfter:next,note:String(b.note||'')});
    return {venueId,metric,total:next,delta:actual};
  } finally { lock.releaseLock(); }
}
function recordSale_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const venue=rows_('Master_Booths').find(v=>String(v.venueId)===venueId); if(!venue)throw new Error('Venue tidak ditemukan.');
  const qty=Math.floor(Number(b.qty||0)); if(qty<1 || qty>500)throw new Error('Qty harus 1–500.');
  const code=String(b.packageCode||''); const mode=String(b.productMode|| (venue.type==='PORT'?'PORT':'REST_AREA'));
  const packages={
    REST_AREA:{SINGLE_BOTTLE:{label:'Single Bottle',price:7000,bottles:1,cans:0,units:1},SINGLE_CAN:{label:'Single Can',price:10000,bottles:0,cans:1,units:1},RA_P1:{label:'Package 1 · 3 Btl + 1 Free Btl',price:18000,bottles:4,cans:0,units:4},RA_P2:{label:'Package 2 · 3 Btl + 1 Free Can',price:20000,bottles:3,cans:1,units:4}},
    PORT:{PORT_P1:{label:'Paket 1 · 3 Botol',price:15000,bottles:3,cans:0,units:3},PORT_P2:{label:'Paket 2 · 2 Botol + 2 Can',price:25000,bottles:2,cans:2,units:4},PORT_P3:{label:'Paket 3 · 4 Botol + 2 Can',price:40000,bottles:4,cans:2,units:6}},
    IDM:{IDM_PACK3:{label:'Sell-Out Pack 3',price:0,bottles:3,cans:0,units:3},IDM_SINGLE:{label:'Sell-Out Single Bottle',price:0,bottles:1,cans:0,units:1}}
  };
  if(mode==='IDM') {
    if(venue.type!=='REST_AREA')throw new Error('Mode Indomaret hanya untuk Rest Area.');
    const store=String(b.storeCode||'').trim().toUpperCase();
    const allowed=String(venue.idmCodes||'').split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);
    if(!allowed.includes(store))throw new Error('Store code tidak sesuai dengan venue ini.');
    const p=packages.IDM[code]; if(!p)throw new Error('Paket Indomaret tidak valid.');
    return saveSaleRow_(user,venueId,mode,p,qty,store,b);
  }
  if((venue.type==='PORT' && mode!=='PORT') || (venue.type==='REST_AREA' && mode!=='REST_AREA'))throw new Error('Mode penjualan tidak sesuai jenis venue.');
  const p=(packages[mode]||{})[code]; if(!p)throw new Error('Paket penjualan tidak valid.');
  return saveSaleRow_(user,venueId,mode,p,qty,'',b);
}
function saveSaleRow_(user,venueId,mode,p,qty,store,b) {
  const bottles=p.bottles*qty,cans=p.cans*qty,revenue=p.price*qty,units=p.units*qty;
  const chances=Math.min(Math.floor(revenue/20000),Math.floor(units/4));
  append_('Sales_Sampling',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,spgName:String(b.spgName||user.name),productMode:mode,packageCode:String(b.packageCode),packageLabel:p.label,qty,bottles,cans,revenue,samplingType:'',cups:0,igStories:0,storeCode:store,luckyDipChances:chances,source:mode==='IDM'?'INDOMARET':'BOOTH'});
  if(chances>0)append_('LuckyDip_Log',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,entryType:'EARNED',chances,prize:'',tier:''});
  return {qty,bottles,cans,revenue,units,luckyDipChances:chances,message:'Penjualan tersimpan.'};
}
function recordSampling_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const cups=Math.floor(Number(b.cups||0)); const igStories=Math.floor(Number(b.igStories||0));
  if(cups<0 || cups>5000 || igStories<0 || igStories>1000)throw new Error('Jumlah sampling atau IG Story tidak valid.');
  if(cups===0 && igStories===0)throw new Error('Masukkan jumlah sampling atau IG Story.');
  append_('Sales_Sampling',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,spgName:String(b.spgName||user.name),productMode:'SAMPLING',packageCode:'SAMPLING',packageLabel:'Sampling & Engagement',qty:0,bottles:0,cans:0,revenue:0,samplingType:String(b.samplingType||'Kratingdaeng'),cups,igStories,storeCode:'',luckyDipChances:0,source:'BOOTH'});
  return {cups,igStories,message:'Sampling & engagement tersimpan.'};
}
function redeemPrize_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const prize=String(b.prize||''); const tier=String(b.tier||'');
  const allowed={'TIER_1':['Kaos','Topi'],'TIER_2':['Payung Lipat','Jas Hujan','Tongkat Tol','Cover Tas'],'TIER_3':['Shopping Bag']};
  if(!allowed[tier] || !allowed[tier].includes(prize))throw new Error('Hadiah tidak sesuai tier.');
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try {
    const dipRows=rows_('LuckyDip_Log').filter(r=>String(r.venueId)===venueId && String(r.userId)===user.userId && String(r.date)===today_());
    const earned=sum_(dipRows.filter(r=>String(r.entryType)==='EARNED'),'chances');
    const used=sum_(dipRows.filter(r=>String(r.entryType)==='USED'),'chances');
    if(earned-used<1)throw new Error('Lucky Dip belum eligible. Minimum Rp20.000 dan 4 pcs per chance.');
    const sh=sheet_('Master_Inventory'); const rows=rows_('Master_Inventory'); const item=rows.find(x=>String(x.item)===prize);
    if(!item || item.availableQty==='' || Number(item.availableQty)<1)throw new Error('Stok hadiah habis atau belum dikonfigurasi.');
    updateRow_('Master_Inventory',item._row,{availableQty:Number(item.availableQty)-1,updatedAt:now_()});
    append_('Inventory_Opname',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,entryType:'LUCKY_DIP_REDEEM',item:prize,openingQty:Number(item.availableQty),closingQty:Number(item.availableQty)-1,delta:-1,location:'MAIN_BOOTH',shift:user.shift,note:tier});
    append_('LuckyDip_Log',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,entryType:'USED',chances:1,prize,tier});
    return {prize,remaining:Number(item.availableQty)-1,message:'Hadiah tercatat dan stok berkurang.'};
  } finally {lock.releaseLock();}
}
function saveAttendance_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const eventType=String(b.eventType||'CHECK_IN'); if(!['CHECK_IN','CHECK_OUT','BRIEFING_APPROVAL','SHIFT_HANDOVER'].includes(eventType))throw new Error('Jenis attendance tidak valid.');
  append_('Attendance_Log',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:String(b.staffUserId||user.userId),staffName:String(b.staffName||user.name),staffRole:String(b.staffRole||'FIELD'),shift:String(b.shift||user.shift),eventType,status:String(b.status||'VERIFIED'),photoUrl:String(b.photoUrl||''),note:String(b.note||'')});
  return {message:'Attendance / briefing tersimpan.'};
}
function saveInventory_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const item=String(b.item||'').trim(); const opening=Number(b.openingQty); const closing=Number(b.closingQty);
  if(!item || !Number.isFinite(opening) || !Number.isFinite(closing) || opening<0 || closing<0 || opening>1000000 || closing>1000000)throw new Error('Data stok tidak valid.');
  const entryType=String(b.entryType||'SHIFT_OPNAME');
  if(!['SHIFT_OPNAME','TRANSFER_REQUEST','TRANSFER_APPROVAL'].includes(entryType))throw new Error('Jenis stock entry tidak valid.');
  if(entryType==='TRANSFER_APPROVAL' && !['ADMIN','TL'].includes(user.role))throw new Error('Hanya TL / Admin yang dapat menyetujui transfer.');
  append_('Inventory_Opname',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,entryType,item,openingQty:opening,closingQty:closing,delta:closing-opening,fromLocation:String(b.fromLocation||''),toLocation:String(b.toLocation||''),location:String(b.location||'STORAGE_TENT'),shift:String(b.shift||user.shift),note:String(b.note||'')});
  return {item,delta:closing-opening,message:'Stock opname tersimpan.'};
}
function logMobileSale_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const quantity=Math.floor(Number(b.quantity||0)); if(quantity<1 || quantity>500)throw new Error('Qty mobile sale harus 1–500.');
  append_('Activity_Log',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,activityType:String(b.activityType||'MOBILE_TROLLEY_SALE'),quantity,unit:String(b.unit||'BOTTLE'),location:String(b.location||'PARKING'),note:String(b.note||'')});
  return {quantity,message:'Mobile activity tersimpan.'};
}
function saveClosingReport_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const d=getDashboard_(user); const venue=d.venues.find(v=>v.venueId===venueId);
  const summary=String(b.summary||'');
  append_('Daily_Closing',{id:uuid_(),timestamp:now_(),date:today_(),venueId,userId:user.userId,visitors:venue?venue.visitors:0,samplingCups:venue?venue.sampling:0,bottles:venue?venue.bottles:0,cans:venue?venue.cans:0,revenue:venue?venue.revenue:0,summary,driveUrl:String(b.driveUrl||'')});
  return {message:'Final Daily Closing Report tercatat di Google Sheets.'};
}

/* ---------- Google Drive uploads ---------- */
function getRootFolder_() {
  const props=PropertiesService.getScriptProperties(); const id=props.getProperty('DRIVE_ROOT_FOLDER_ID');
  if(id) { try { return DriveApp.getFolderById(id); } catch(e) {} }
  const folder=DriveApp.createFolder(APP.ROOT_FOLDER); props.setProperty('DRIVE_ROOT_FOLDER_ID',folder.getId()); return folder;
}
function childFolder_(parent,name) {
  const safe=String(name||'Unknown').replace(/[\\/:*?"<>|#%{}~&]/g,'_').slice(0,80);
  const it=parent.getFoldersByName(safe); return it.hasNext()?it.next():parent.createFolder(safe);
}
function uploadDoc_(user,b) {
  const venueId=String(b.venueId||user.venueId); assertVenue_(user,venueId);
  const venue=rows_('Master_Booths').find(v=>String(v.venueId)===venueId); if(!venue)throw new Error('Venue tidak ditemukan.');
  const data=String(b.base64||''); if(!data)throw new Error('File kosong.');
  const encoded=data.indexOf(',')>=0?data.substring(data.indexOf(',')+1):data;
  const bytes=Utilities.base64Decode(encoded); if(bytes.length>APP.MAX_UPLOAD_BYTES)throw new Error('Ukuran file maksimal 5 MB.');
  const mime=String(b.mimeType||'application/octet-stream');
  if(!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(mime))throw new Error('Format file hanya JPG, PNG, WEBP, atau PDF.');
  const date=String(b.date||today_()).replace(/[^0-9-]/g,'').slice(0,10) || today_();
  const root=getRootFolder_(); const venueFolder=childFolder_(root,String(venue.name)); const dateFolder=childFolder_(venueFolder,date);
  const original=String(b.fileName||('upload-'+Date.now())).replace(/[\\/:*?"<>|]/g,'_').slice(0,100);
  const category=String(b.category||'Field Documentation').replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,35);
  const blob=Utilities.newBlob(bytes,mime,category+'_'+original);
  const file=dateFolder.createFile(blob); file.setDescription('Mudik 2027 | '+venue.name+' | '+category+' | '+user.name);
  const record={id:uuid_(),timestamp:now_(),date,venueId,userId:user.userId,category,fileName:file.getName(),mimeType:mime,driveFileId:file.getId(),url:file.getUrl()};
  append_('Drive_Docs',record);
  return {id:record.id,fileName:record.fileName,url:record.url,category:record.category};
}

/* ---------- Admin configuration ---------- */
function createUser_(b) {
  const name=String(b.name||'').trim(), username=String(b.username||'').trim().toLowerCase(), pin=String(b.pin||'').trim(), role=String(b.role||'').toUpperCase();
  if(!name || !/^[a-z0-9._-]{3,32}$/.test(username))throw new Error('Nama wajib diisi; username 3–32 karakter (a-z, angka, titik, _ atau -).');
  if(!/^\d{4,12}$/.test(pin))throw new Error('PIN harus 4–12 digit.');
  if(APP.ROLES.indexOf(role)<0)throw new Error('Role tidak valid.');
  if(rows_('Users_Access').some(u=>String(u.username).toLowerCase()===username))throw new Error('Username sudah digunakan.');
  const venueId=String(b.venueId||''); if(['TL','SPG','CREW'].includes(role)) { assertVenue_({role:'ADMIN'},venueId); if(!rows_('Master_Booths').some(v=>String(v.venueId)===venueId))throw new Error('Venue assignment tidak ditemukan.'); }
  const salt=randomToken_(12); const record={userId:uuid_(),name,username,pinSalt:salt,pinHash:hashPin_(pin,salt),role,venueId,shift:String(b.shift||''),enabled:true,createdAt:now_(),updatedAt:now_()};
  append_('Users_Access',record); return {userId:record.userId,username,role,venueId,enabled:true};
}
function updateUser_(b) {
  const userId=String(b.userId||''); const row=rows_('Users_Access').find(u=>String(u.userId)===userId); if(!row)throw new Error('User tidak ditemukan.');
  const patch={name:String(b.name===undefined?row.name:b.name).trim(),role:String(b.role===undefined?row.role:b.role).toUpperCase(),venueId:String(b.venueId===undefined?row.venueId:b.venueId),shift:String(b.shift===undefined?row.shift:b.shift),enabled:b.enabled===undefined?truthy_(row.enabled):!!b.enabled,updatedAt:now_()};
  if(APP.ROLES.indexOf(patch.role)<0)throw new Error('Role tidak valid.');
  if(['TL','SPG','CREW'].includes(patch.role) && !rows_('Master_Booths').some(v=>String(v.venueId)===patch.venueId))throw new Error('Venue assignment tidak ditemukan.');
  if(b.pin) { if(!/^\d{4,12}$/.test(String(b.pin)))throw new Error('PIN harus 4–12 digit.'); patch.pinSalt=randomToken_(12); patch.pinHash=hashPin_(String(b.pin),patch.pinSalt); }
  updateRow_('Users_Access',row._row,patch); return {userId,updated:true,enabled:patch.enabled};
}
function updateBooth_(b) {
  const id=String(b.venueId||''); const row=rows_('Master_Booths').find(v=>String(v.venueId)===id); if(!row)throw new Error('Venue tidak ditemukan.');
  const numeric=['targetBooth','targetIDM','targetSelling','samplingTarget','lat','lng','workingDays','manpower']; const patch={updatedAt:now_()};
  ['name','region','province','cctvUrl','cctvType','trafficStatus','startDate','endDate','idmCodes','isActive'].forEach(k=>{if(b[k]!==undefined)patch[k]=b[k];});
  numeric.forEach(k=>{if(b[k]!==undefined){const n=Number(b[k]);if(!Number.isFinite(n))throw new Error(k+' harus angka.');patch[k]=n;}});
  updateRow_('Master_Booths',row._row,patch); return {venueId:id,updated:true};
}
function updateInventoryMaster_(b) {
  const item=String(b.item||''); const row=rows_('Master_Inventory').find(x=>String(x.item)===item); if(!row)throw new Error('Item stok tidak ditemukan.');
  const initial=b.initialQty===''?'':Number(b.initialQty); if(initial!=='' && (!Number.isFinite(initial)||initial<0))throw new Error('Initial stock tidak valid.');
  const buffer=initial===''?'':Math.ceil(initial*0.05); const available=initial===''?'':Math.max(0,initial-buffer-Number(row.reservedQty||0));
  updateRow_('Master_Inventory',row._row,{initialQty:initial,bufferQty:buffer,availableQty:available,updatedAt:now_()}); return {item,initialQty:initial,bufferQty:buffer,availableQty:available};
}

/* ---------- Utilities ---------- */
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function now_() { return Utilities.formatDate(new Date(),APP.TZ,"yyyy-MM-dd'T'HH:mm:ssXXX"); }
function today_() { return Utilities.formatDate(new Date(),APP.TZ,'yyyy-MM-dd'); }
function uuid_() { return Utilities.getUuid(); }
function randomToken_(bytes) { const data=[]; for(let i=0;i<bytes;i++)data.push(Math.floor(Math.random()*256)); return Utilities.base64EncodeWebSafe(data).replace(/=+$/,''); }
function sum_(list,key) { return list.reduce((a,x)=>a+(Number(x[key])||0),0); }
function truthy_(v) { return v===true || String(v).toLowerCase()==='true' || String(v)==='1'; }
function errorMessage_(err) { return err && err.message ? err.message : String(err); }
