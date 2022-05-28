window.onresize = resize;

let guesses = [];
let inputing = [];
let isEnd,isWin;
let finished = false;

const d = new Date();
const todaysSeed = d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

let distribution = [
	0,0,0,
];

let statisticsData = {
	playCount: 0,
	winCount: 0,
	nowStreak: 0,
	maxStreak: 0,
	count: [0,0,0],
}

function resize(){
	const boardHeight = $(window).height() - 240 - 45;
	if(boardHeight < 252){
		let boardWidth = (370/252) * boardHeight;
		$('#board')[0].style.setProperty("--board-width", `${boardWidth}px`);
		// console.log($('#board')[0].style.getPropertyValue("--board-width"))
		// $(':root').style.setProperty("--board-width", `${boardWidth}px`);
	}else{
	 	$('#board')[0].style.setProperty("--board-width", `370px`);
	}
}

window.onload = function(){
	resize();
	loadCookies();
	changeStatistics()

	if(!getCookie("again")){
		$("#first").parents(".modalWrap").addClass("showAnimation");
		setCookie("again",true);
	}

	$(".close").on("click",function(){
		$(this).parents(".modalWrap").removeClass("showAnimation");
		$(this).parents(".modalWrap").addClass("hideAnimation");
	})
	$(".help").on("click",() => {
		$("#howto").parents(".modalWrap").removeClass("hideAnimation");
		$("#howto").parents(".modalWrap").addClass("showAnimation");
	})
	$(".record").on("click",() => {
		$("#statistics").parents(".modalWrap").removeClass("hideAnimation");
		$("#statistics").parents(".modalWrap").addClass("showAnimation");
	})
	$(".modalWrap").on("click",function(){
		$(this).removeClass("showAnimation");
		$(this).addClass("hideAnimation");
	})


	$(".inputButton").on("click",function(){
		const note = $(this).data("note");
		if(isEnd) return;
		if(inputing.length < 4){
			inputing.push(note);
			redraw();
		}
	});

	$(".enterButton").on("click",function(){
		if(inputing.length < 4){
			msg("Not enough letters");
		}else{
			guess(inputing);
		}
	});
	$(".deleteButton").on("click",function(){
		inputing = inputing.slice(0,-1);
		redraw();
	});
	$(".playButton").on("click",function(){
		playChord(makeChord());
	});

	$(".tryPlay").on("click",function(){
		const row = $(this).data("row");
		if(row < guesses.length){
			const m = [guesses[row][0][1],guesses[row][1][1],guesses[row][2][1],guesses[row][3][1]];
			playChord(addOctave(m));
		}else if(row == guesses.length){
			if(inputing[0]){
				const m = inputing;
				playChord(addOctave(m));
			}else{
				msg("Not entered");
			}
		}else{
			msg("Not entered");
		}
	})


	$("#shareButton").on("click",function(){
		share();
	});
};

function addOctave(ar){
	let returnAr = []
	let nowOctave = 3;
	const oto = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
	for(let i = 0;i < ar.length;i++){
		if(nowOctave == 3 && !(["G","G#","A","A#","B"].includes(ar[i]))){
			nowOctave++;
		}else if(i != 0){//最初じゃなければ
			if(oto.indexOf(ar[i]) <= oto.indexOf(ar[i - 1])){
				nowOctave++;
			}
		}
		returnAr.push(ar[i] + nowOctave);
	}
	return returnAr;
}

function msg(m){
	$("#msg").html(m);
	$("#msg").addClass("msgshow");
	$("#msg").on("animationend",() => {
		$("#msg").removeClass("msgshow");
	})
}

function share(){
	const d = new Date();
	let times = isWin ? guesses.length : "*";
	let shareText = `Chordle ${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${times}/3

`;
	for(let row of guesses){
		for(let i of row){
			if(i[0] == 0)
				shareText += "⬜";
			if(i[0] == 1)
				shareText += "🟨";
			if(i[0] == 2)
				shareText += "🟩";
		}
		shareText += "\n";
	}

	let encodeText = encodeURI(shareText);
	location.href = "https://twitter.com/intent/tweet?text=" + encodeText;
}

function redraw(){
	$(".row").eq(guesses.length).find(".tile").text("");
	for(let [index,note] of notesToStr(inputing).entries()){
		const target = $(".row").eq(guesses.length).find(".tile").eq(index);
		target.text(note);
	}
}

function guess(ar){
	let c = makeChord();
	c = [c[0].slice(0,-1),c[1].slice(0,-1),c[2].slice(0,-1),c[3].slice(0,-1)]
	let r = [];
	let ans = 0;
	for(let i = 0;i < 4;i++){
		if(ar[i] == c[i]){
			r.push([2,ar[i]]);
			ans += 1;
		}else if(c.includes(ar[i])){
			r.push([1,ar[i]]);
		}else{
			r.push([0,ar[i]]);
		}
	}
	if(ans == 4){
		const msgs = [
			"Fantastic!","Great!","Good!"
		];
		msg(msgs[guesses.length]);
		isEnd = true;
		isWin = true;
	}
	inputing = [];
	
	for(let i = 0;i < 4;i++){
		let target = $(".row").eq(guesses.length).find(".tile").eq(i);
		const cName = ["absent","present","correct"];
		target.addClass(cName[r[i][0]])
	}

	guesses.push(r);

	if(guesses.length == 3 && !isWin){
		isEnd = true;
		c = notesToStr(c)
		msg(`${c[0]},${c[1]},${c[2]},${c[3]}`);
	}
	if(isEnd){
		end();
	}

	setNowGuessCookies();
}
function end(){
	if(!finished){	//まだ終わった処理をされてない
		statisticsData.playCount += 1;
		if(isWin){
			statisticsData.winCount += 1;
			statisticsData.nowStreak += 1;
			statisticsData.maxStreak = Math.max(statisticsData.maxStreak,statisticsData.nowStreak);
			statisticsData.count[guesses.length - 1] += 1;
		}else{
			statisticsData.nowStreak = 0;
		}
		const d = new Date();
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setDate(d.getDate() + 1);	//翌日0:00を生成
		setCookie("finished","true",d.toUTCString());
	}

	changeStatistics();
	setStatisticsCookies();

	if(guesses.length == 1){
		$(".firstHit" ).find(".graph").addClass("todayClear");
	}
	if(guesses.length == 2){
		$(".secondHit").find(".graph").addClass("todayClear");
	}
	if(guesses.length == 3 && isWin){
		$(".thirdHit" ).find(".graph").addClass("todayClear");
	}

	$("#share").css("display","block");

	setTimeout(result,1000);
}
function result(){
	$(".record").click();
}

function changeStatistics(){
	$("#playcount").find(".dataNum").text(statisticsData.playCount);
	$("#win-rate").find(".dataNum").text(parseInt(statisticsData.winCount * 100 / statisticsData.playCount) || 0);
	$("#now-streak").find(".dataNum").text(statisticsData.nowStreak);
	$("#max-streak").find(".dataNum").text(statisticsData.maxStreak);

	$(".firstHit").find(".graph").text(statisticsData.count[0]);
	$(".secondHit").find(".graph").text(statisticsData.count[1]);
	$(".thirdHit").find(".graph").text(statisticsData.count[2]);

	$(".firstHit" ).find(".graph").css("flex",statisticsData.count[0] || "0");
	$(".secondHit").find(".graph").css("flex",statisticsData.count[1] || "0");
	$(".thirdHit" ).find(".graph").css("flex",statisticsData.count[2] || "0");

	let max = Math.max(statisticsData.count[0],statisticsData.count[1],statisticsData.count[2]);

	$(".firstHit" ).find(".graph-space").css("flex",String(max - statisticsData.count[0]) || "0");
	$(".secondHit").find(".graph-space").css("flex",String(max - statisticsData.count[1]) || "0");
	$(".thirdHit" ).find(".graph-space").css("flex",String(max - statisticsData.count[2]) || "0");
}



const synth = new Tone.Sampler({
    "B4" : "B.wav",
}).toDestination();

function playChord(ar){
	ar.forEach(i => {
		if(i) synth.triggerAttackRelease(i,"1n");
	});
}

function makeChord(){
	let oto = ["G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5"];
	let r = [];
	let random = new Random(todaysSeed);

	for(let i = 0;i < 4;i++){
		let index = random.nextInt(0,oto.length);
		if(oto[index] == "retry"){
			i--;
			continue;
		}
		r.push([index,oto[index]]);
		oto[index] = "retry";
	}
	r.sort((a,b) => {
		if(a[0] < b[0]) return -1;
		if(a[0] > b[0]) return 1;
		return 0;
	});
	return([r[0][1],r[1][1],r[2][1],r[3][1]]);
}

function notesToStr(notes){
	let r = []
	const c = {
		"A" : "ラ",
		"A#": "ラ#",
		"B" : "シ",
		"C" : "ド",
		"C#": "ド#",
		"D" : "レ",
		"D#": "レ#",
		"E" : "ミ",
		"F" : "ファ",
		"F#": "ファ#",
		"G" : "ソ",
		"G#": "ソ#",
	}
	for(const i of notes){
		r.push(c[i]);
	}
	return r;
}

class Random {
	constructor(seed = 358) {
		this.x = 314;
		this.y = 159;
		this.z = 265;
		this.w = seed;
	}
	
	next() {
		let t;

		t = this.x ^ (this.x << 11);
		this.x = this.y; this.y = this.z; this.z = this.w;
		return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
	}
	
	nextInt(min, max) {
		const r = Math.abs(this.next());
		return min + (r % (max - min));
	}
}