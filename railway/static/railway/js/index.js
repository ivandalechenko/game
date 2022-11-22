const REQUEST_FREQUENCY = 1000;
const SVG_PEOPLE = '<svg width="30" height="20" viewBox="0 0 41 49" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.25623 30.1776C3.46574 28.9205 4.63206 28.3445 5.15486 27.2242C5.90973 25.6066 6.57123 23.7354 7.79186 22.3985C9.29804 20.7489 11.1691 19.4168 12.7494 17.8365M24.1412 18.3112C27.14 18.6443 28.8139 20.9007 31.4721 21.6601C32.7522 22.0259 34.4131 23.501 35.2957 24.4817C36.3161 25.6155 37.1103 25.2629 37.9064 26.855M17.496 17.3619C17.496 21.4019 18.92 24.9508 18.92 28.991C18.92 31.9857 20.3439 34.4676 20.3439 37.2976C17.9482 38.6043 16.1089 40.7682 13.6988 42.0441C12.6362 42.6067 10.2533 43.8366 9.90149 44.8921M20.344 38.2469C23.121 38.2469 24.3093 40.7539 26.5673 42.0442C26.9413 42.2579 29.727 43.9133 29.8108 44.2065C30.0513 45.0483 30.806 45.8414 31.7358 45.8414M16.0721 3.12207C11.5746 3.12207 6.88699 4.55854 10.1388 9.97826C10.9611 11.3487 10.2468 14.9886 12.2748 14.9886C15.0328 14.9886 18.0779 16.1496 20.7923 15.1995C24.2438 13.9915 26.9096 12.4084 28.7824 9.18716C30.0067 7.08131 29.8052 4.07139 26.9892 4.07139C24.5301 4.07139 12.7494 2.4368 12.7494 5.97003" stroke="black" stroke-width="6" stroke-linecap="round"/></svg>'
const SVG_TIMER = '<svg width="30" height="20" viewBox="0 0 44 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.575 3.97009C9.32369 3.97009 8.05852 5.93343 6.76949 10.9054C5.78723 14.6941 5.19821 18.8609 4.71264 22.7455C4.32719 25.8291 3.65784 28.8256 3.65784 31.9486C3.65784 43.6844 16.5296 44.4892 24.7538 40.5189C29.3196 38.3147 36.5811 36.553 39.6265 32.2387C41.1857 30.0298 40.0013 25.7903 39.521 23.4575C38.7975 19.9433 37.9402 17.15 36.3039 13.9379C34.6814 10.753 31.9391 8.31097 28.8412 6.60709C27.2302 5.72107 25.6935 6.14968 24.0682 5.49955C21.183 4.34548 17.5873 4.42627 16.4736 7.76737M19.3216 13.4633C19.3216 15.6965 16.0735 24.655 18.3723 25.8044M19.7963 25.8044C24.1151 25.8044 28.2545 24.3804 32.6121 24.3804" stroke="black" stroke-width="6" stroke-linecap="round"/></svg>';

get_games();


function get_games() {
    send_post_request(URL_GET_GAMES, get_games_handler, '');
    function get_games_handler(param) {
        obj = JSON.parse(param);
        if (obj.length == 0){
            availableGamesListStr = '<br><br>Доступных столов нет, создайте свой :)';
        }else{
            availableGamesListStr = '';
        }
        
        for (var i = 0; i < obj.length; i++) {
            availableGamesListStr = availableGamesListStr + '<br><br><a href="'+URL_JOIN_GAME+
                '?game_id='+obj[i].id+'"><button class="font_semibold btn_game_list_element w100">Стол #'+obj[i].id+' <br>'+
                SVG_PEOPLE + obj[i].players_count +'/'+ obj[i].max_players_count +' -'+ SVG_TIMER + obj[i].timer +'сек.</button></a>'
        }
        document.getElementById('available_games_list').innerHTML = availableGamesListStr;
        setTimeout(get_games, REQUEST_FREQUENCY);
    }
}


function send_post_request(url, handler, params, token = CSRF_TOKEN) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (handler != ''){
                handler(xhttp.responseText);
            }
        }
    };
    xhttp.open('POST', url, true);
    params = "csrfmiddlewaretoken=" + token + params
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(params);
}