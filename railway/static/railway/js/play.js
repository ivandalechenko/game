// Переменные в кэмэлКэйсе
// Глобальные переменные начинаются с _
// Константы в апперкейсе. Пример: MAX_OVERFLOW

// Имена классов должны обычно следовать соглашению CapWords.
// Имена функций должны состоять из маленьких букв, а слова разделяться символами подчеркивания.


var _playingField;
var _currentRoutes = [];
var _specUseCount = 0;
var _numOfMove = 0;
var _scores;
const ROUTE_INFO = [
    [0, 1, 0, 1],
    [0, -1, 0, -1],
    [0, 1, 1, 0],
    [0, -1, -1, 0],
    [0, 1, 1, 1],
    [0, -1, -1, -1],
    [1, -1, 1, -1], // overpass (6)
    [-1, 0, 1, 0], // simple station (7)
    [-1, 0, 0, 1], // turning station (8)
    [1, 1, 1, 1],
    [1, -1, -1, -1],
    [1, -1, -1, 1],
    [1, -1, 1, -1],
    [1, 1, -1, 1],
    [-1, -1, -1, -1],
    [0, 0, 1, 0], // road exit (15)
    [0, 0, -1, 0], // rail exit (16)
    [1, 0, 0, -1], // mirrored turning station (17)
];
const EXITS = [
    [1,-1],
    [3,-1],
    [5,-1],
    [7,1],
    [7,3],
    [7,5],
    [5,7],
    [3,7],
    [1,7],
    [-1,5],
    [-1,3],
    [-1,1]
];
const CENTER_COORDS = [
    [2,2],
    [3,2],
    [4,2],
    [2,3],
    [3,3],
    [4,3],
    [2,4],
    [3,4],
    [4,4]
];
const FINISH_STAGE = 7;

const NUMBER_OF_SIDES_OF_A_CELL = 4;
const OVERPASS_NUMBER = 6;
const SIMPLE_STATION_NUMBER = 7;
const TURNING_STATION_NUMBER = 8;
const MIR_TURNING_STATION_NUMBER = 17;
const ROUTE_WIDTH = 45.7;
const PLAYING_FIELD_WIDTH = 320;

const REQUEST_FREQUENCY = 2000;



get_status()

function get_status() {
    send_post_request(URL_GET_STATUS, status_handler, '&game_id='+GAME_ID);
    function status_handler(param) {
        var obj = JSON.parse(param);
        if (obj.status == 0){
            setTimeout(get_status, REQUEST_FREQUENCY);
            _numOfMove = 0;
            document.getElementById('send_move').innerHTML = "Запустить игру";
            document.getElementById('send_move').onclick = function(event) {start_game();};
            waitingStr = 'Ожидание запуска игры. Код: '+GAME_ID+'<br><br>Игроки: <br>';
            for (var i = 0; i < obj.expected_users_list.length; i++) {
                waitingStr = waitingStr + (i+1) + '. ' + obj.expected_users_list[i].username + '<br>';
            }
            document.getElementById('status').innerHTML = waitingStr;
        }else{
            document.getElementById('status').innerHTML = '';
            document.getElementById('tales_block').classList.remove('dblock');
            document.getElementById('send_move').classList.add('dnone');
            document.getElementById('tales_block').classList.remove('dnone');
            document.getElementById('game_field').classList.remove('dnone');
            update_game();
        }
    }
}
function start_game() {
    send_post_request(URL_START_GAME, '', '&game_id='+GAME_ID);
    document.getElementById('status').innerHTML = ''; 
    document.getElementById('tales_block').classList.remove('dblock');
    document.getElementById('send_move').classList.add('dnone');
    document.getElementById('tales_block').classList.remove('dnone');
    document.getElementById('game_field').classList.remove('dnone');
    update_game();
}
function get_reversed_turning_station_type(type){
    if (type == TURNING_STATION_NUMBER){
        return MIR_TURNING_STATION_NUMBER;
    } 
    if (type == MIR_TURNING_STATION_NUMBER){
        return TURNING_STATION_NUMBER;
    } 
}
function EmptyExitsElement(x,y,side){
    this.x = x;
    this.y = y;
    this.side = side;
}
function XY(x,y){
    this.x = x;
    this.y = y;
}
function Cell(x,y,type,rotate){
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotate = rotate;
}
function get_x_in_direction(x,direction){
    if (direction == 0){ return x;}
    if (direction == 1){ return x+1;}
    if (direction == 2){ return x;}
    if (direction == 3){ return x-1;}
}
function get_y_in_direction(y,direction){
    if (direction == 0){ return y-1;}
    if (direction == 1){ return y;}
    if (direction == 2){ return y+1;}
    if (direction == 3){ return y;}
}
function mod(a,b){
    if (a<0){return a+b;}
    else {return a % b;}
}
function end_of_game(){
    document.getElementById('tales_block').classList.remove('dblock');
    document.getElementById('tales_block').classList.add('dnone');
    document.getElementById('send_move').classList.remove('dblock');
    document.getElementById('send_move').classList.add('dnone');
    send_post_request(URL_GET_WINNERS, url_get_winners_handler, '&game_id='+GAME_ID);
    function url_get_winners_handler(param) {
        winnersList = JSON.parse(param);
        winnersStr = '<table style="width: 100%;"><tr><td>*</td><td>Ex</td><td>Rds</td><td>Rls</td><td>Ctr</td><td>Mns</td><td>Scr</td></tr>';
        for (var i = 0; i < winnersList.length; i++) {
            winnersStr = winnersStr + '<tr><td>'+(i+1)+'. '+ winnersList[i].username +'</td><td>'+ winnersList[i].exit_score +'</td><td>'+ winnersList[i].road_score +'</td><td>'+ winnersList[i].rail_score +'</td><td>'+ winnersList[i].center_score +'</td><td>'+ winnersList[i].minus_score +'</td><td>' + winnersList[i].score + '</td></tr><br>';
        }
        winnersStr = winnersStr + '</table>';
        document.getElementById('status').innerHTML = winnersStr;
    }
}
function get_networks() {
    var networks = [];
    var uncheckedExits = [0,1,2,3,4,5,6,7,8,9,10,11];
    while (true){
        var network = get_exits_list(get_all_network_elements_by_coords(EXITS[uncheckedExits[0]][0],EXITS[uncheckedExits[0]][1]));

        if (network.length>1){
            networks.push(network);
            for (var i = 0; i < network.length; i++) {
                uncheckedExits.splice(uncheckedExits.indexOf(network[i]),1);
            }
        }else{
            uncheckedExits.splice(0,1);
        }
        
        if (uncheckedExits.length == 0){
            break;
        }
    }

    return networks;
}
function index_of_xy(x, y, arr){
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].x == x && arr[i].y == y){
            return i;
        }
    }
}
function get_exits_list(cellsList) {
    var exitsList = [];
    for (var i = 0; i < EXITS.length; i++) {
        if (cellsList[index_of_xy(EXITS[i][0],EXITS[i][1],cellsList)]){exitsList.push(i);}
    }
    return exitsList;
}
function get_all_network_elements_by_coords(x, y, ignoreOverpass=false, xCaller=-1, yCaller=-1, networkElements=[]) {
    networkElements.push(_playingField[index_of_xy(x,y,_playingField)]);
    for (let i = 0; i < NUMBER_OF_SIDES_OF_A_CELL; i++){
        var xD = get_x_in_direction(x,i);
        var yD = get_y_in_direction(y,i);

        if (xD == xCaller && yD == yCaller){
            var check_caller = true;
        }else{ 
            var check_caller = false;
        }

        if (!check_caller){
            var pfElement = _playingField[index_of_xy(x,y,_playingField)];
            var pfElementInDirection = _playingField[index_of_xy(xD,yD,_playingField)];
            if (!ignoreOverpass){
                if (pfElement.type == OVERPASS_NUMBER){
                    if (x != xCaller){
                        if (i == 0 || i == 2){
                            pfElementInDirection = undefined;
                        }
                    }
                    if (y != yCaller){
                        if (i == 1 || i == 3){
                            pfElementInDirection = undefined;
                        }
                    }
                }
            }
            if (pfElementInDirection != undefined){
                var currentCellExit = ROUTE_INFO[pfElement.type][mod(i-pfElement.rotate,NUMBER_OF_SIDES_OF_A_CELL)];
                if (currentCellExit != 0){
                    var pfElementInDirectionReq = ROUTE_INFO[pfElementInDirection.type][mod(((i+2)%NUMBER_OF_SIDES_OF_A_CELL)-pfElementInDirection.rotate,NUMBER_OF_SIDES_OF_A_CELL)];
                    if (currentCellExit == pfElementInDirectionReq){
                        if (networkElements[index_of_xy(xD,yD,networkElements)] == undefined){
                            networkElements = get_all_network_elements_by_coords(xD,yD,ignoreOverpass,x,y,networkElements);
                        }else{
                            if (!ignoreOverpass){
                                if (networkElements[index_of_xy(xD,yD,networkElements)].type == OVERPASS_NUMBER) {
                                    networkElements = get_all_network_elements_by_coords(xD,yD,ignoreOverpass,x,y,networkElements);
                                }    
                            }
                        }
                    }
                }
            }
        }
    }
    return(networkElements);
}
function get_networks_score() {
    var networks = get_networks();
    var exitPoints = 0;
    for (var i = 0; i < networks.length; i++) {
        exitPoints += (networks[i].length-1)*4;
    }
    return exitPoints;
}
function get_minus_score() { return get_empty_exits_list(0).length;
}
function get_center_score() {
    var centerPoints = 0;
    for (var i = 0; i < CENTER_COORDS.length; i++){
        if (_playingField[index_of_xy(CENTER_COORDS[i][0],CENTER_COORDS[i][1],_playingField)] != undefined){
            centerPoints = centerPoints + 1;
        }
    }
    return centerPoints;
}
function get_route_score(route_type=0) {
    var tmp_for_get_lr_arr = [];
    // Получает все выходы вникуда
    start_points = get_empty_exits_list(1,route_type);
    // Добавляет выходы с карты (за которые идут очки)
    const exit_starts = [[1,0],[3,0],[5,0],[6,1],[6,3],[6,5],[5,6],[3,6],[1,6],[0,5],[0,3],[0,1]];
    for (var i = 0; i < exit_starts.length; i++){
        var pf = _playingField[index_of_xy(exit_starts[i][0],exit_starts[i][1],_playingField)];
        if (pf != undefined && start_points[index_of_xy(exit_starts[i][0],exit_starts[i][1],start_points)] == undefined){
            if (route_type == 1 && i % 2 == 0){
                start_points.push(new EmptyExitsElement(exit_starts[i][0],exit_starts[i][1],0));
            }else if (route_type == -1 && i % 2 != 0){
                start_points.push(new EmptyExitsElement(exit_starts[i][0],exit_starts[i][1],0));
            }
        }
    }
    // Добавляет станции с 2 соеденениями разных типов
    for (var i = 0; i < _playingField.length; i++){
        if ( _playingField[i].type == SIMPLE_STATION_NUMBER ||
             _playingField[i].type == TURNING_STATION_NUMBER ||
             _playingField[i].type == MIR_TURNING_STATION_NUMBER){
            if (start_points[index_of_xy(_playingField[i].x,_playingField[i].y,start_points)] == undefined){
                start_points.push(new EmptyExitsElement(_playingField[i].x,_playingField[i].y,0) );
            }
        }
    }

    function get_lr_arr(x,y,x0=-1,y0=-1,lr=1,rt=route_type) {
        tmp_for_get_lr_arr.push( parseInt(x.toString()+y.toString()) );
        // console.log('- Я вызванана на '+x+' '+y+", меня вызвала "+x0+' '+y0+' мой глубина '+lr);
        var max_lr = lr;
        var pf = _playingField[index_of_xy(x,y,_playingField)];
        for (let i = 0; i < 4; i++){
            var xD = get_x_in_direction(x,i);
            var yD = get_y_in_direction(y,i);
            if (xD == x0 && yD == y0){var check_caller = true;
            }else{ var check_caller = false;}
            if (xD == -1 || xD == 7 || yD == -1 || yD == 7){check_caller = true;}
            if (!check_caller){ // Даже не проверять то направление с которого функция была вызвана
                var pf_d = _playingField[index_of_xy(xD,yD,_playingField)];
                if (pf_d != undefined){ // Проверка наличия клетки по i напрелнию
                    if (tmp_for_get_lr_arr.includes(parseInt(xD.toString()+yD.toString()))){ // Проверка на перекрёсток
                        var can_check = false;
                        if (rt == -1 && pf_d.type == 14){var can_check = true;}
                        if (rt == 1 && pf_d.type == 9){var can_check = true;}
                    }else{
                        var can_check = true;
                    }
                    if (can_check){
                        // console.log('Могу смотреть в '+i+' направлении')
                        var my_ex = ROUTE_INFO[pf.type][mod(i-pf.rotate,4)];
                        if (my_ex != 0){ // Провека есть ли у текущей клетки выход в i направлении
                            var cell_req = ROUTE_INFO[pf_d.type][mod(((i+2)%4)-pf_d.rotate,4)];
                            if (my_ex == cell_req){ // Провека есть ли у соседней клетки выход в (i+2)%4 направлении (противоположном i)
                                if (my_ex == rt){
                                    var scan_lr = get_lr_arr(xD,yD,x,y,lr+1);
                                    if (scan_lr>max_lr){max_lr = scan_lr;}
                                }
                            }
                        }
                    }
                }
            }
        }
        return max_lr;
    }
    // console.log('Стартовые точки: ');
    // console.log(start_points);


    var longest_route = 0
    for (var i = 0; i < start_points.length; i++){
        tmp_for_get_lr_arr = [];
        // console.log('ВЫЧИСЛЕНИЯ ДЛЯ ТОЧКИ - '+i);
        var cr = get_lr_arr(start_points[i].x,start_points[i].y);
        if (cr > longest_route){longest_route = cr;}
    }
    return longest_route;
}
function update_score(scoreType, score) {
    if (parseInt(_scores[scoreType]) == parseInt(score)) {
        document.getElementById(scoreType).innerHTML = score;
    }else if (parseInt(_scores[scoreType]) < parseInt(score)) {
        document.getElementById(scoreType).innerHTML = parseInt(_scores[scoreType])+'<span style="color: #c20a0a;font-size: 9px;"> +'+(parseInt(score)-parseInt(_scores[scoreType]))+'</span>';
    }else{
        document.getElementById(scoreType).innerHTML = parseInt(_scores[scoreType])+'<span style="color: #c20a0a;font-size: 9px;"> -'+(parseInt(_scores[scoreType])-parseInt(score))+'</span>';
    }
}
function get_and_update_scores() {
    var exitScore = get_networks_score();
    var minusScore = get_minus_score();
    var centerScore = get_center_score();
    var roadScore = get_route_score(1);
    var railScore = get_route_score(-1);


    var score = exitScore - minusScore + centerScore + roadScore + railScore;
    update_score('score', score);
    update_score('center_score', centerScore);
    update_score('exit_score', exitScore);
    update_score('minus_score', minusScore);
    update_score('rail_score', railScore);
    update_score('road_score', roadScore);

    var scoreArr = [exitScore,minusScore,centerScore,roadScore,railScore,score];
    return scoreArr;
}
function get_empty_exits_list(includeBorders = 1, routeType = 0) {
    var epmtyExitsList = [];
    for (let i = EXITS.length; i < _playingField.length; i++) {
        for (let j = 0; j < NUMBER_OF_SIDES_OF_A_CELL; j++) {
            var xD = get_x_in_direction(_playingField[i].x,j);
            var yD = get_y_in_direction(_playingField[i].y,j);
            if (xD < 7+includeBorders && xD > -1-includeBorders && yD < 7+includeBorders && yD > -1-includeBorders){
                // Check exit for current cell
                var currentCellExit = ROUTE_INFO[_playingField[i].type][mod(j-_playingField[i].rotate,4)];
                if (currentCellExit != 0){
                    // Check cell availability in direction 
                    var pfElementInDirection = _playingField[index_of_xy(xD,yD,_playingField)];
                    if (pfElementInDirection != undefined){
                        var pfElementInDirectionReq = ROUTE_INFO[pfElementInDirection.type][mod(((j+2)%4)-pfElementInDirection.rotate,4)];
                        // Check conformity for current cell in cell in direction
                        if (currentCellExit != pfElementInDirectionReq){
                            if (currentCellExit == routeType || routeType == 0){
                                epmtyExitsList.push(new EmptyExitsElement(_playingField[i].x,_playingField[i].y,j));
                            }
                        }
                    }else{
                        if (currentCellExit == routeType || routeType == 0){
                            epmtyExitsList.push(new EmptyExitsElement(_playingField[i].x,_playingField[i].y,j));
                        }
                    }
                }            
            }
        }
    }
    // cross 
    if (includeBorders == 0){
        const CROSS_WIDHT = 17;
        document.getElementById('cross_list').innerHTML = '';
        var crossListStr = '';
        for (let i = 0; i < epmtyExitsList.length; i++) {
            crossListStr = crossListStr + '<img src="/static/railway/img/textures/err1.png" class="cross" style="width: '+CROSS_WIDHT+'px;';
            var left = (ROUTE_WIDTH/2)-(CROSS_WIDHT/2) + epmtyExitsList[i].x*ROUTE_WIDTH;
            if (epmtyExitsList[i].side == 1) {left = (left + ROUTE_WIDTH/2);}
            if (epmtyExitsList[i].side == 3) {left = (left - ROUTE_WIDTH/2);}

            var top = (ROUTE_WIDTH/2)-(CROSS_WIDHT/2) + epmtyExitsList[i].y*ROUTE_WIDTH;
            if (epmtyExitsList[i].side == 2) {top = (top + ROUTE_WIDTH/2);}
            if (epmtyExitsList[i].side == 0) {top = (top - ROUTE_WIDTH/2);}

            crossListStr = crossListStr + 'left:' + left.toFixed(2) + 'px; ';
            crossListStr = crossListStr + 'top:' + top.toFixed(2) + 'px;';
            crossListStr = crossListStr +'" alt="">'; 
            // console.log(epmtyExitsList);
        }
        document.getElementById('cross_list').innerHTML = crossListStr;
    }
    return epmtyExitsList;
}
function check_have_exit(cellsList) {
    for (var i = 0; i < EXITS.length; i++) {
        if (cellsList[index_of_xy(EXITS[i][0],EXITS[i][1],cellsList)]){return true;}
    }
    return false;
}
function get_potential_moves(){
    var potentialMoves = [];
    var req = [0,0,0,0];
    for (let i = 0; i < _playingField.length; i++) {
        for (let j = 0; j < 4; j++) {
            if (check_can_move_in_direction(_playingField[i].x,_playingField[i].y,j)){
                cell = new Object();
                if (potentialMoves[index_of_xy(get_x_in_direction(_playingField[i].x,j), get_y_in_direction(_playingField[i].y,j),potentialMoves)] == undefined){
                    req = [0,0,0,0];
                    req[(j+2)%4] = ROUTE_INFO[_playingField[i].type][ mod(j-_playingField[i].rotate,4)];
                    cell.x = get_x_in_direction(_playingField[i].x,j);
                    cell.y = get_y_in_direction(_playingField[i].y,j);
                    cell.req = req;
                    potentialMoves.push(cell);
                }
                else{
                    cell = potentialMoves[index_of_xy(get_x_in_direction(_playingField[i].x,j),get_y_in_direction(_playingField[i].y,j),potentialMoves)];
                    cell.req[(j+2)%4] = ROUTE_INFO[_playingField[i].type][ mod(j-_playingField[i].rotate,4)];
                    potentialMoves[index_of_xy(get_x_in_direction(_playingField[i].x,j),get_y_in_direction(_playingField[i].y,j),potentialMoves)] = cell;
                }
            }
        }
    }
    return potentialMoves;
}
function check_can_move_in_direction(x,y,direction){
    // Directions: 0-up, 1-right, 2-down, 3-left
    if (direction == 0){
        if (y==0 || _playingField[index_of_xy(x,y-1,_playingField)] != undefined){return false;} // Wall and another cell checking
    }
    if (direction == 1){
        if (x==6 || _playingField[index_of_xy(x+1,y,_playingField)] != undefined){return false;}
    }
    if (direction == 2){
        if (y==6 || _playingField[index_of_xy(x,y+1,_playingField)] != undefined){return false;}
    }
    if (direction == 3){
        if (x==0 || _playingField[index_of_xy(x-1,y,_playingField)] != undefined){return false;}
    }
    if (ROUTE_INFO[_playingField[index_of_xy(x,y,_playingField)].type][ mod(direction-_playingField[index_of_xy(x,y,_playingField)].rotate,NUMBER_OF_SIDES_OF_A_CELL)] == 0){
        return false;
    } // Checking for an exit from a cell
    return true;
}
function index_of_type(type,arr){
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].type == type){
            return i;
        }
    }
}
function get_requirements_for_cell(x,y) {
    var requirements = [0,0,0,0];
    for (let i = 0; i < NUMBER_OF_SIDES_OF_A_CELL; i++){
        if (_playingField[index_of_xy(get_x_in_direction(x,i),get_y_in_direction(y,i),_playingField)] != undefined){
            var near_cell = _playingField[index_of_xy(get_x_in_direction(x,i),get_y_in_direction(y,i),_playingField)];
            requirements[i] = ROUTE_INFO[near_cell.type][mod(i+2-near_cell.rotate,NUMBER_OF_SIDES_OF_A_CELL)];
        }
    }
    return requirements;
}
function show_send_move_btn() {
    element = document.getElementById('send_move');
    element.classList.remove('dnone');
    element.classList.add('dblock');
    element.innerHTML = 'Отправить ход';
    element.onclick = function(event) {send_move();};
}
function hide_send_move_btn() {
    element = document.getElementById('send_move');
    element.classList.remove('dblock');
    element.classList.add('dnone');
}
function place_tile(x,y,selectedRoute,mirroredTurningStation = false){
    var routeType = _currentRoutes[selectedRoute];
    if (mirroredTurningStation){
        var routeType = MIR_TURNING_STATION_NUMBER
    }

    var potentialMoves = get_potential_moves();
    var potentialRotate = get_rotate_list(potentialMoves[index_of_xy(x,y,potentialMoves)].req,ROUTE_INFO[routeType]);
    routeRotate = potentialRotate.indexOf(true);
    tableElement = document.getElementById("cell"+x+''+y);
    tableElement.classList.add('biroute'+routeType,'birouteroll'+routeRotate);
    // tableElement.src = URL_TEXTURES+'err0.png';
    _playingField.push(new Cell(x,y,routeType,routeRotate));
    

    change_class_for_placed_tile(x,y,selectedRoute);
    clear_class_can_place_in_all_cells();
    check_can_place_tiles();
    get_and_update_scores();
    tableElement.onclick = function(event) {rotate_route(x,y);};
}
function change_class_for_placed_tile(x,y,selectedRoute){
    if (selectedRoute>3){
        for (var i = 4; i < 10; i++) {
            var element = document.getElementById('route'+i);
            element.onclick = null;
        }
    }
    var element = document.getElementById('route'+selectedRoute);
    element.classList.add('img_route_used');
    element.classList.remove('img_route_selected');
    element.onclick = function(event) { return_tile(x,y,selectedRoute); };
}
function return_tile(x,y,selectedRoute) {
    select_tile(-1);
    element = document.getElementById("cell"+x.toString()+y.toString());
    var del = _playingField.splice(index_of_xy(x,y,_playingField),1);
    for (let i = 0; i < 4; i++){
        var xD = get_x_in_direction(x,i);
        var yD = get_y_in_direction(y,i);
        // Сhecking the dependence of another cell on the current one
        if (xD>-1 && xD<7 && yD>-1 && yD<7){
            if (_playingField[index_of_xy(xD,yD,_playingField)] != undefined){
                if (!check_have_exit(get_all_network_elements_by_coords(xD,yD,true))){
                    _playingField.push(del[0]);
                    return 0;
                }
            }
        }
    }
    for (var i = 0; i < ROUTE_INFO.length; i++) {
        element.classList.remove('biroute'+i,'birouteroll'+i);
    }
    element.src = URL_TEXTURES+'err.png';

    tile_refresh(selectedRoute);
    if (selectedRoute>3){
        _specUseCount = 0;
        for (var i = 4; i < 10; i++) {
            tile_refresh(i);
        }
    }
    check_can_place_tiles();
    get_and_update_scores();    
}
function rotate_route(x,y) {
    select_tile(-1);
    var requirementsForCell = get_requirements_for_cell(x,y);
    var currentCellRotate = _playingField[index_of_xy(x,y,_playingField)].rotate;
    var currentCellType = _playingField[index_of_xy(x,y,_playingField)].type;
    var cellElement = document.getElementById("cell"+x+''+y);
    var rotateList = get_rotate_list(requirementsForCell,ROUTE_INFO[currentCellType]);
    cellElement.classList.remove('birouteroll'+currentCellRotate);

    if (currentCellType == TURNING_STATION_NUMBER || currentCellType == MIR_TURNING_STATION_NUMBER){
        if (get_index_of_next_true(rotateList,currentCellRotate) <= currentCellRotate){
            if (check_can_move(requirementsForCell, ROUTE_INFO[get_reversed_turning_station_type(currentCellType)])){
                cellElement.classList.remove('biroute'+_playingField[index_of_xy(x,y,_playingField)].type);
                var oldCellRotate = _playingField[index_of_xy(x,y,_playingField)].rotate;
                var oldCellType = _playingField[index_of_xy(x,y,_playingField)].type;
                _playingField[index_of_xy(x,y,_playingField)].type = get_reversed_turning_station_type(_playingField[index_of_xy(x,y,_playingField)].type);
                var potentialRotate = get_rotate_list(requirementsForCell,ROUTE_INFO[_playingField[index_of_xy(x,y,_playingField)].type]);
                _playingField[index_of_xy(x,y,_playingField)].rotate = potentialRotate.indexOf(true);
                potentialRotate[potentialRotate.indexOf(true)] = false;
                for (let i = 0; i < 4; i++){
                    var xd = get_x_in_direction(x,i);
                    var yd = get_y_in_direction(y,i);
                    if (xd>-1 && xd<7 && yd>-1 && yd<7){
                        if (_playingField[index_of_xy(xd,yd,_playingField)] != undefined){
                            while (check_have_exit(get_all_network_elements_by_coords(xd,yd,true)) == false){
                                if (potentialRotate.indexOf(true) != -1){
                                    _playingField[index_of_xy(x,y,_playingField)].rotate = potentialRotate.indexOf(true);
                                    potentialRotate[potentialRotate.indexOf(true)] = false;
                                }else{
                                    _playingField[index_of_xy(x,y,_playingField)].type = oldCellType;
                                    _playingField[index_of_xy(x,y,_playingField)].rotate = oldCellRotate;
                                    cellElement.classList.add('birouteroll'+oldCellRotate);
                                    cellElement.classList.add('biroute'+oldCellType);
                                    get_and_update_scores();
                                    check_can_place_tiles();
                                    return 0;
                                }
                            }
                        }
                    }
                }
                cellElement.classList.add('biroute'+_playingField[index_of_xy(x,y,_playingField)].type);
                cellElement.classList.add('birouteroll'+_playingField[index_of_xy(x,y,_playingField)].rotate);
                get_and_update_scores();
                check_can_place_tiles();
                return 0;
            }
        }
    }

    currentCellRotate = get_index_of_next_true(rotateList,currentCellRotate);
    _playingField[index_of_xy(x,y,_playingField)].rotate = currentCellRotate;

    for (let i = 0; i < 4; i++){
        var xD = get_x_in_direction(x,i);
        var yD = get_y_in_direction(y,i);
        if (xD>-1 && xD<7 && yD>-1 && yD<7){
            if (_playingField[index_of_xy(xD,yD,_playingField)] != undefined){
                while (check_have_exit(get_all_network_elements_by_coords(xD,yD,true)) == false){
                    currentCellRotate = get_index_of_next_true(rotateList,currentCellRotate);
                    _playingField[index_of_xy(x,y,_playingField)].rotate = currentCellRotate;
                }
            }
        }
    }

    while (check_have_exit(get_all_network_elements_by_coords(x,y,true)) == false){
        currentCellRotate = get_index_of_next_true(rotateList,currentCellRotate);
        _playingField[index_of_xy(x,y,_playingField)].rotate = currentCellRotate;
    }
    cellElement.classList.add('birouteroll'+currentCellRotate);
    function get_index_of_next_true(arr,start) {
        for (let i = 1; i < arr.length; i++) {
            if (arr[(start+i)%4] == true){
                return (start+i)%arr.length;
            }
        }
        return start;
    }
    get_and_update_scores();
    check_can_place_tiles();
}
function select_tile(tileNum){
    for (var i = 0; i < 10; i++) {
        document.getElementById('route'+i).classList.remove('img_route_selected');
    }
    if (tileNum == -1){
        clear_class_can_place_in_all_cells();
    }else{
        document.getElementById('route'+tileNum.toString()).classList.add('img_route_selected');
        show_potential_moves_for_tile(tileNum);
    }
}
function show_potential_moves_for_tile(tileNum){
    clear_class_can_place_in_all_cells();
    var potentialMoves = get_potential_moves();
    for (let i = 0; i < potentialMoves.length; i++){
        var element = document.getElementById('cell'+potentialMoves[i].x+potentialMoves[i].y);
        if (check_can_move( potentialMoves[i].req,ROUTE_INFO[_currentRoutes[ tileNum ]] )){
            element.classList.add('railway_table_element_can_place');
            element.onclick = function(event) {place_tile(potentialMoves[i].x,potentialMoves[i].y,tileNum);};
        }else{
            if (_currentRoutes[ tileNum ] == TURNING_STATION_NUMBER){
                if (check_can_move( potentialMoves[i].req,ROUTE_INFO[MIR_TURNING_STATION_NUMBER] )){
                    element.classList.add('railway_table_element_can_place');
                    element.onclick = function(event) {place_tile(potentialMoves[i].x,potentialMoves[i].y,tileNum,true);};
                }
            }
        }
    }
}
function check_can_place_tiles() {
    var potentialMoves = get_potential_moves();
    var usedTiles = 0;
    for (let i = 0; i < 10; i++) {
        routeElement = document.getElementById('route'+i);
        if (!routeElement.classList.contains('img_route_used')){
            var canPlace = false;
            var j = 0;
            while (j < potentialMoves.length && !canPlace){
                if (check_can_move(potentialMoves[j].req,ROUTE_INFO[_currentRoutes[i]])){
                    canPlace = true
                }
                j = j+1;
            }
            console.log(i);
            if (!canPlace){
                if (i<4){usedTiles = usedTiles+1;}
                routeElement.classList.add('img_route_cant_be_used');
                routeElement.onclick = null;
            }else{
                routeElement.classList.remove('img_route_cant_be_used');
                routeElement.onclick = function(event) { console.log(i); select_tile(i); };;
            }
        }else{
            if (i<4){usedTiles = usedTiles+1;}
        }   
    }
    if (usedTiles == 4){
        show_send_move_btn();
    }else{
        hide_send_move_btn();
    }
}
function clear_class_can_place_in_all_cells(){
    var cells = document.getElementsByClassName("railway_table_element_can_place");
    while (cells.length){
        cells[0].onclick = null;
        cells[0].classList.remove("railway_table_element_can_place");
    }
}
function update_game(){
    send_post_request(URL_GET_PLAYING_FIELD, get_playing_field_handler, '&game_id='+GAME_ID);
    function get_playing_field_handler(param){
        _playingField = JSON.parse(param);
        get_tiles();
        show_playing_field();
        document.getElementById('send_move').onclick = function(event) {send_move();};
        get_stage_and_scores();
    }
}
function get_stage_and_scores() {
    send_post_request(URL_GET_STAGE_AND_SCORES, get_stage_and_scores_handler, '&game_id='+GAME_ID);
    function get_stage_and_scores_handler(param){
        _scores = JSON.parse(param);
        get_and_update_scores();
        _numOfMove = _scores.stage;
        if (_scores.reloadOnWaitingPlayers == 1){
            _numOfMove = _numOfMove - 1;
            send_move();
        } 
        // console.log(_scores);
        for (let i = 0; i < FINISH_STAGE+2; i++){
            document.getElementById('fone').classList.remove('bck'+i);
        }
        document.getElementById('fone').classList.add('bck'+_numOfMove);
        if (_numOfMove == FINISH_STAGE+1){
            end_of_game();
        }
    }
}
function show_playing_field(){
    // Clearing the playing field
    for (let i = 0; i < ROUTE_INFO.length; i++) {
        var biroute = document.getElementsByClassName('biroute'+i);
        while (biroute.length){
            biroute[0].src = URL_TEXTURES+'err.png';
            biroute[0].classList.remove('biroute'+i);

        }
        var birouteroll = document.getElementsByClassName('birouteroll'+i);
        while (birouteroll.length){
            birouteroll[0].classList.remove('birouteroll'+i);
        }
    }
    // Filling the playing field
    for (let i = 12; i < _playingField.length; i++) {
        document.getElementById("cell"+_playingField[i].x+_playingField[i].y).classList.add('biroute'+_playingField[i].type);
        document.getElementById("cell"+_playingField[i].x+_playingField[i].y).classList.add('birouteroll'+_playingField[i].rotate);
        document.getElementById("cell"+_playingField[i].x+_playingField[i].y).classList.add('old_placed');
    }
}
function check_can_move(requirements, cell){
    if (get_rotate_list(requirements, cell).includes(true)){
        return true;
    }
    return false;
}
function get_rotate_list(requirements, cell){
    var banList = [];   
    var permissionList = [];   
    for (let i = 0; i < 4; i++) {
        var ban = false;
        var permission = false;
        for (let j = 0; j < 4; j++){
            if (requirements[j] != 0){
                if (requirements[j] != cell[mod(j-i,4)] && cell[mod(j-i,4)] != 0){
                    ban = true;
                }
                if (requirements[j] == cell[mod(j-i,4)]){
                    permission = true;
                }
            }
        }
        banList.push(ban);
        permissionList.push(permission);
    }
    var result = [];
    for (let i = 0; i < 4; i++) {
        if (banList[i] == false && permissionList[i] == true){
            result.push(true);
        }else{
            result.push(false);
        }
    }
    return result;
}
function tile_refresh(id){
    element = document.getElementById('route'+id);
    element.classList.remove('img_route_used');
    element.onclick = function(event) { select_tile(id); };
    if (id>3){
        var index = index_of_type(_currentRoutes[id],_playingField);
        if (_playingField[index] != undefined){
            _specUseCount += 1;
            element.classList.add('img_route_used');
            element.onclick = null;
        }
    }
}
function send_move() {
    // Removes the ability to turn and return from all cells
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            document.getElementById('cell'+i.toString()+j.toString()).onclick = null;
        }
    }
    for (var i = 0; i < 10; i++) {
        document.getElementById('route'+i).onclick = null;    
    }
    for (var i = 0; i < 4; i++) {
        document.getElementById('route'+i).classList.add('img_route_used');
        document.getElementById('route'+i).classList.remove('img_route_selected');
    }
    clear_class_can_place_in_all_cells();

    var scoreArr = get_and_update_scores();
    // var scoreArr = [networksScore,minusScore,centerScore,roadScore,railScore,score];

    send_post_request(URL_SEND_MOVE, send_move_handler, 
        '&game_id='+GAME_ID+
        '&playing_field='+JSON.stringify(_playingField)+
        '&exit_score='+scoreArr[0]+
        '&minus_score='+scoreArr[1]+
        '&center_score='+scoreArr[2]+
        '&road_score='+scoreArr[3]+
        '&rail_score='+scoreArr[4]+
        '&score='+scoreArr[5]+
        '&stage='+_numOfMove);
    
    
    function send_move_handler(param){
        var obj = JSON.parse(param)
        // console.log(obj);
        if (obj.status == 0){
            document.getElementById('send_move').classList.remove('dnone');
            document.getElementById('send_move').classList.add('dblock');
            document.getElementById('send_move').onclick = null;
            document.getElementById('send_move').innerHTML = "Ожидание других игроков";
            waitingStr = 'Ожидаем хода: <br>';
            for (var i = 0; i < obj.expected_users_list.length; i++) {
                waitingStr = waitingStr + (i+1) + '. ' + obj.expected_users_list[i].username + ': ' + obj.expected_users_list[i].score + '<br>';
            }
            document.getElementById('status').innerHTML = waitingStr;
            setTimeout(send_move, REQUEST_FREQUENCY);
        }else{
            document.getElementById('send_move').classList.remove('dblock');
            document.getElementById('send_move').classList.add('dnone');
            update_game();
            document.getElementById('status').innerHTML = '';
        }

    }
}
function get_tiles(){
    _currentRoutes = [];
    send_post_request(URL_GET_TILES, show_route, '&game_id='+GAME_ID);
    function show_route(param){
        const obj = JSON.parse(param);
        for (let i = 0; i < 4; i++) {
            img = document.getElementById('route'+i);
            img.src = URL_TEXTURES + obj[i] + '.png';
            _currentRoutes.push(obj[i]);
        }
        for (let i = 0; i < 6; i++) {
            _currentRoutes.push(9+i);
        }
        _specUseCount = 0;
        for (var i = 0; i < 10; i++) {
            tile_refresh(i);
        }

        if (_specUseCount > 2){
            for (var i = 4; i < 10; i++) {
                document.getElementById('route'+i).onclick = null;
            }
        }
        check_can_place_tiles();
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
