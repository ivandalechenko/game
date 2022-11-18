const REQUEST_FREQUENCY = 1000;

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
                '?game_id='+obj[i].id+'">Стол #'+obj[i].id+' <br> '+ obj[i].players_count +' игрок(а)(ов)</a>'
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