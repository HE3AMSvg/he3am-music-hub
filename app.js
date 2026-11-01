(function(){
"use strict";
var KEY="he3am_music_hub_v1", $=function(id){return document.getElementById(id);}, audio=$("audio");
var data=read(), view="home", activeId=null, queue=[], queueIndex=-1, toastTimer;
function read(){try{var x=JSON.parse(localStorage.getItem(KEY)||'{"playlists":[]}');return {playlists:Array.isArray(x.playlists)?x.playlists.map(function(p,i){return {id:String(p.id||Date.now()+i),name:String(p.name||"Untitled playlist"),description:String(p.description||""),tracks:Array.isArray(p.tracks)?p.tracks.map(function(t,j){return {id:String(t.id||Date.now()+i+"-"+j),title:String(t.title||"Untitled"),artist:String(t.artist||"Unknown artist"),url:String(t.url||t.audioUrl||""),favorite:!!t.favorite};}):[]};}):[]};}catch(e){return {playlists:[]};}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){toast("Storage is full. Export a backup.");}render();}
function toast(s){var el=$("toast");el.textContent=s;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove("show");},2300);}
function allTracks(){return data.playlists.reduce(function(a,p){return a.concat(p.tracks);},[]);}
function render(){
 var q=$("search").value.trim().toLowerCase(), tracks=allTracks(), ps=data.playlists;
 $("pc").textContent=ps.length;$("tc").textContent=tracks.length;$("fc").textContent=tracks.filter(function(t){return t.favorite;}).length;
 $("playlist-nav").innerHTML=ps.map(function(p){return '<button data-open-playlist="'+esc(p.id)+'">♫ &nbsp;'+esc(p.name)+'</button>';}).join("");
 if(view==="favorites")ps=ps.filter(function(p){return p.tracks.some(function(t){return t.favorite;});});
 if(view==="playlist")ps=ps.filter(function(p){return p.id===activeId;});
 if(q)ps=ps.filter(function(p){return (p.name+" "+p.description+" "+p.tracks.map(function(t){return t.title+" "+t.artist;}).join(" ")).toLowerCase().indexOf(q)!==-1;});
 var pActive=data.playlists.find(function(p){return p.id===activeId;});
 $("section-title").textContent=view==="favorites"?"Your favorites":view==="playlist"?(pActive?pActive.name:"Playlist"):"Made for your mood";
 $("list").innerHTML=ps.length?ps.map(function(p,i){return '<article class="playlist-card"><button class="card-open" data-open-playlist="'+esc(p.id)+'"><div class="cover-art">'+["♫","♪","♬","♩"][i%4]+'</div><h3>'+esc(p.name)+'</h3><p>'+p.tracks.length+' '+(p.tracks.length===1?"song":"songs")+(p.description?" · "+esc(p.description):"")+'</p></button></article>';}).join(""):'<div class="empty-state"><strong>'+(q?"No matches found":view==="favorites"?"No favorites yet":"Your library is waiting")+'</strong>'+(q?"Try another search.":"Create a playlist and add the songs you want to keep here.")+(q?"":'<br><button class="button button-primary" id="empty-create">＋ Create playlist</button>')+'</div>';
 Array.prototype.forEach.call(document.querySelectorAll(".nav-item"),function(b){b.classList.toggle("active",b.dataset.view===view);});
 var create=$("empty-create");if(create)create.addEventListener("click",openPlaylistDialog);
}
function openPlaylistDialog(){$("playlist-name").value="";$("playlist-description").value="";$("playlist-dialog").showModal();$("playlist-name").focus();}
function openTrackDialog(id){$("track-playlist").innerHTML=data.playlists.map(function(p){return '<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>';}).join("");$("track-form").reset();if(id)$("track-playlist").value=id;$("track-dialog").showModal();}
function detail(id){var p=data.playlists.find(function(x){return x.id===id;});if(!p)return;activeId=id;$("detail-title").textContent=p.name;$("detail-description").textContent=p.description;
 $("track-list").innerHTML=p.tracks.length?p.tracks.map(function(t,i){return '<div class="track-row"><span class="track-number">'+String(i+1).padStart(2,"0")+'</span><div class="track-name"><strong>'+esc(t.title)+'</strong><small>'+esc(t.artist)+'</small></div><button data-play="'+esc(t.id)+'" data-playlist="'+esc(p.id)+'" aria-label="Play">▶</button><button class="'+(t.favorite?"favorited":"")+'" data-favorite="'+esc(t.id)+'" data-playlist="'+esc(p.id)+'" aria-label="Favorite">♡</button></div>';}).join(""):'<div class="empty-state">No songs in this playlist yet.</div>';
 $("detail-dialog").showModal();}
function playTrack(pid,tid){var p=data.playlists.find(function(x){return x.id===pid;});if(!p)return;queue=p.tracks.filter(function(t){return !!t.url;});queueIndex=queue.findIndex(function(t){return t.id===tid;});if(queueIndex<0){toast("This song has no audio URL yet.");return;}loadTrack();}
function loadTrack(){var t=queue[queueIndex];if(!t)return;audio.src=t.url;$("now-title").textContent=t.title;$("now-artist").textContent=t.artist;audio.play().then(function(){$("play").textContent="Ⅱ";}).catch(function(){toast("Playback failed. Use a direct audio link.");$("play").textContent="▶";});}
function next(n){if(!queue.length)return;queueIndex=(queueIndex+n+queue.length)%queue.length;loadTrack();}
function time(v){if(!Number.isFinite(v))return "0:00";return Math.floor(v/60)+":"+String(Math.floor(v%60)).padStart(2,"0");}
$("new-playlist").addEventListener("click",openPlaylistDialog);$("new-playlist-side").addEventListener("click",openPlaylistDialog);
$("playlist-form").addEventListener("submit",function(e){e.preventDefault();var name=$("playlist-name").value.trim();if(!name)return;var p={id:(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now()),name:name,description:$("playlist-description").value.trim(),tracks:[]};data.playlists.unshift(p);view="playlist";activeId=p.id;$("playlist-dialog").close();save();detail(p.id);});
$("track-form").addEventListener("submit",function(e){e.preventDefault();var p=data.playlists.find(function(x){return x.id===$("track-playlist").value;});if(!p)return;var url=$("track-url").value.trim();if(url){try{var u=new URL(url);if(u.protocol!=="https:"&&u.protocol!=="http:")throw Error();}catch(err){toast("Enter a valid http or https audio URL.");return;}}p.tracks.push({id:String(Date.now()),title:$("track-title").value.trim(),artist:$("track-artist").value.trim()||"Unknown artist",url:url,favorite:false});$("track-dialog").close();save();detail(p.id);toast("Song added.");});
Array.prototype.forEach.call(document.querySelectorAll("[data-close]"),function(b){b.addEventListener("click",function(){b.closest("dialog").close();});});
Array.prototype.forEach.call(document.querySelectorAll(".nav-item"),function(b){b.addEventListener("click",function(){view=b.dataset.view;activeId=null;render();});});
document.addEventListener("click",function(e){var b=e.target.closest("[data-open-playlist]");if(b){detail(b.dataset.openPlaylist);return;}b=e.target.closest("[data-play]");if(b){playTrack(b.dataset.playlist,b.dataset.play);return;}b=e.target.closest("[data-favorite]");if(b){var p=data.playlists.find(function(x){return x.id===b.dataset.playlist;}),t=p&&p.tracks.find(function(x){return x.id===b.dataset.favorite;});if(t){t.favorite=!t.favorite;save();detail(p.id);}return;}});
$("add-track").addEventListener("click",function(){openTrackDialog(activeId);});
$("delete-playlist").addEventListener("click",function(){var p=data.playlists.find(function(x){return x.id===activeId;});if(!p||!confirm('Delete "'+p.name+'" and its song list?'))return;data.playlists=data.playlists.filter(function(x){return x.id!==activeId;});$("detail-dialog").close();view="home";activeId=null;save();});
$("search").addEventListener("input",render);
$("theme").addEventListener("click",function(){document.body.classList.toggle("light");localStorage.setItem("he3am_music_theme",document.body.classList.contains("light")?"light":"dark");});
if(localStorage.getItem("he3am_music_theme")==="light")document.body.classList.add("light");
$("import").addEventListener("click",function(){$("file").click();});
$("file").addEventListener("change",function(e){var f=e.target.files&&e.target.files[0];if(!f)return;f.text().then(function(txt){if(f.name.toLowerCase().endsWith(".json")){var x=JSON.parse(txt);if(!x||!Array.isArray(x.playlists))throw Error();x.playlists.forEach(function(p,i){data.playlists.push({id:String(Date.now()+i+Math.random()),name:String(p.name||"Imported playlist"),description:String(p.description||""),tracks:Array.isArray(p.tracks)?p.tracks.map(function(t,j){return {id:String(Date.now()+j+Math.random()),title:String(t.title||"Untitled"),artist:String(t.artist||"Unknown artist"),url:String(t.url||t.audioUrl||""),favorite:!!t.favorite};}):[]});});}else{var rows=txt.split(/\r?\n/).map(function(x){return x.trim();}).filter(Boolean);data.playlists.push({id:String(Date.now()),name:f.name.replace(/\.[^.]+$/,""),description:"Imported playlist",tracks:rows.map(function(line,i){var parts=line.split(/\s[-–—]\s/);return {id:String(Date.now()+i),artist:parts.length>1?parts.shift():"Unknown artist",title:parts.join(" - ")||line,url:"",favorite:false};})});}save();toast("Import complete.");}).catch(function(){toast("Couldn't import this file. Check its format.");}).then(function(){$("file").value="";});});
$("backup").addEventListener("click",function(){var url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="he3am-music-backup.json";a.click();URL.revokeObjectURL(url);toast("Backup exported.");});
$("play").addEventListener("click",function(){if(!audio.src){toast("Choose a song with an audio URL first.");return;}if(audio.paused)audio.play().catch(function(){toast("Playback failed.");});else audio.pause();});
$("prev").addEventListener("click",function(){next(-1);});$("next").addEventListener("click",function(){next(1);});
audio.addEventListener("play",function(){$("play").textContent="Ⅱ";});audio.addEventListener("pause",function(){$("play").textContent="▶";});audio.addEventListener("ended",function(){next(1);});
audio.addEventListener("timeupdate",function(){if(audio.duration){$("progress").value=audio.currentTime/audio.duration*100;$("current-time").textContent=time(audio.currentTime);$("duration").textContent=time(audio.duration);}});
audio.addEventListener("loadedmetadata",function(){$("duration").textContent=time(audio.duration);});
$("progress").addEventListener("input",function(){if(audio.duration)audio.currentTime=Number($("progress").value)/100*audio.duration;});
$("volume").addEventListener("input",function(){audio.volume=Number($("volume").value);});audio.volume=.8;
render();
})();