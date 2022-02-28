function setCookie(key,value,time = null){
	if(time){
		document.cookie = `${key}=${value};expires=${time}`
	}else{
		document.cookie = `${key}=${value};max-age=${60*60*24*365*10}`
	}
}

function getCookie(key){
	const c = document.cookie;
	const c_ar = c.split(";");
	for(const i of c_ar){
		const i_ar = i.split("=");
		if(i_ar[0].trim() == key){
			return i_ar[1].trim();
		}
	}
	return null;
}


function loadCookies(){
	finished = getCookie("finished") || 0;

	statisticsData.playCount = parseInt(getCookie("playCount") || 0);
	statisticsData.winCount  = parseInt(getCookie("winCount") || 0);
	statisticsData.nowStreak = parseInt(getCookie("nowStreak") || 0);
	statisticsData.maxStreak = parseInt(getCookie("maxStreak") || 0);

	statisticsData.count[0] = parseInt(getCookie("firstCount") || 0);
	statisticsData.count[1] = parseInt(getCookie("secondCount") || 0);
	statisticsData.count[2] = parseInt(getCookie("thirdCount") || 0);


	const s = getCookie("statistics") || "";
	distribution[0] = s.slice(0,4);
	distribution[1] = s.slice(4,8);
	distribution[2] = s.slice(8,12);
	
	const guessCookie = getCookie("guesses") || "";
	let g_ar = [];
	for(let i = 0;i < guessCookie.length;i+=2){
		g_ar.push(guessCookie.slice(i,i+2).trim());
	}

	// console.log(g_ar);

	let loop = parseInt(g_ar.length / 4);
	for(let i = 0;i < loop;i++){
		inputing = g_ar.slice(0,4);
		redraw();
		guess(inputing);
		g_ar = g_ar.slice(4);
	}
	redraw();

}

function setNowGuessCookies(){
	let cookieText = "";
	for(let i of guesses){
		for(let j = 0;j < 4;j++){
			cookieText += (i[j][1] + " ").slice(0,2);
		}
	}
	const d = new Date();
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setDate(d.getDate() + 1);
	setCookie("guesses",cookieText,d.toUTCString());
}

function setStatisticsCookies(){
	setCookie("playCount",statisticsData.playCount);
	setCookie("nowStreak",statisticsData.nowStreak);
	setCookie("winCount",statisticsData.winCount);
	setCookie("nowStreak",statisticsData.nowStreak);
	setCookie("maxStreak",statisticsData.maxStreak);
	setCookie("firstCount" ,statisticsData.count[0]);
	setCookie("secondCount",statisticsData.count[1]);
	setCookie("thirdCount" ,statisticsData.count[2]);
}
