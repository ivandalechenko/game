var get_players_json = setInterval(makeRequest, 500, url_check_game_status, check_users_count, csrf_token, '');
var number_of_players_to_start = 2;
var player_mark = '';
var player_turn_to_move = false;
var get_game_status;


function check_users_count(param){
    const obj = JSON.parse(param);
    document.getElementById('count_gamers').innerHTML = obj.players;
    if (obj.players.length == number_of_players_to_start) {
        clearInterval(get_players_json);
        show_playing_field(obj);
        get_game_status = setInterval(makeRequest, 500, url_check_game_status, check_game_status, csrf_token, '');
    }
}


function check_game_status(param){
    const obj = JSON.parse(param);
    for (var i = 0; i < obj.status.length; i++) {
        if (obj.status[i] == 'x'){
            document.getElementById('cell'+(i+1).toString()).innerHTML = 'X';
            document.getElementById('cell'+(i+1).toString()).classList.remove('ttt_element');
            document.getElementById('cell'+(i+1).toString()).classList.add('ttt_used_element_x');
        }
        if (obj.status[i] == 'o'){
            document.getElementById('cell'+(i+1).toString()).innerHTML = 'O';
            document.getElementById('cell'+(i+1).toString()).classList.remove('ttt_element');
            document.getElementById('cell'+(i+1).toString()).classList.add('ttt_used_element_o');
        }
    }
    if (obj.turn == player_mark){
        player_turn_to_move = true;
        document.getElementById('game_status').innerHTML = 'Ваш ход!';
    }else{
        player_turn_to_move = false;
        document.getElementById('game_status').innerHTML = 'Ход соперника!';
    }
    console.log(obj);
    console.log(obj.winner);
    if (obj.winner == 'x'){document.getElementById('winner').innerHTML = 'Победил крестик, вы вернётесь на главную через 3 секунд'; setInterval(go_home, 3000);x}
    if (obj.winner == 'o'){document.getElementById('winner').innerHTML = 'Победил нолик, вы вернётесь на главную через 3 секунд'; setInterval(go_home, 3000);}
}


function go_home(){document.location.href = url_home}


function send_move(id){
    if (!player_turn_to_move){
        alert('Сейчас не ваша очередь ходить!');
    }else{
        player_turn_to_move = false;
        makeRequest(url_send_move, '', csrf_token, '&id='+(id-1).toString()+'&mark='+player_mark+'&game_id='+game_id);
        delete_onclick('cell'+id);
        change_cell_status('cell'+id, player_mark);
    }
}


function delete_onclick(id){
    cell = document.getElementById(id);
    cell.onclick = null;
}


function change_cell_status(id, player_mark){
    cell = document.getElementById(id);
    cell.classList.remove("ttt_element");
    if (player_mark == 'x'){
        cell.classList.add("ttt_used_element_x");
    }else if (player_mark == 'o'){
        cell.classList.add("ttt_used_element_o");
    }else{
        alert('Не задан знак игрока');
        return 0;
    }
}


function show_playing_field(obj){
    if (username == obj.players[0]){player_mark = 'x'; player_turn_to_move = true;
    }else{player_mark = 'o';}

    document.getElementById('playing_field').classList.remove("dnone");

    var playing_field_elements = document.getElementsByClassName('playing_field_element');
    for (i = 0; i < playing_field_elements.length; i++) {
        playing_field_elements[i].innerHTML = player_mark.toUpperCase();
    }
}


function makeRequest(url, handler, csrf_token, params) {
    // Создание запроса
    var httpRequest = false;
    if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            httpRequest.overrideMimeType('text/xml');            }
    } else {
        alert('Данный браузер не поддерживается, установите актуальную версию Chrome');
        return false;
    }
    if (!httpRequest) {
        alert('Не вышло :( Невозможно создать экземпляр класса XMLHTTP ');
        return false;
    }

    // Событие, которое вызывается каждый раз когда меняется состояние запроса
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4) {
            if (httpRequest.status == 200) {
                if (handler != ''){
                    handler(httpRequest.responseText);
                }
            } else {
                alert('Проблема с подключением к серверу.');
            }
        }
    };
    // Открывает соединение open(method, url, async)
    httpRequest.open('POST', url, true);
    params = "csrfmiddlewaretoken=" + csrf_token + params
    httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // Посылает запрос
    httpRequest.send(params);
}



