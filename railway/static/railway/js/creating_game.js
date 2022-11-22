update_form();
function update_form() {
	if (document.getElementById('timer_input').value == 0){
		document.getElementById('timer_label').innerHTML = 'Без таймера';
	}else{
		document.getElementById('timer_label').innerHTML = document.getElementById('timer_input').value+' секунд';
	}
	document.getElementById('players_count_label').innerHTML = document.getElementById('players_count_input').value;
	if (document.getElementById('players_count_input').value == 1){document.getElementById('players_count_label').innerHTML += ' игрок'}
	if (document.getElementById('players_count_input').value == 2){document.getElementById('players_count_label').innerHTML += ' игрока'}
	if (document.getElementById('players_count_input').value == 3){document.getElementById('players_count_label').innerHTML += ' игрока'}
	if (document.getElementById('players_count_input').value == 4){document.getElementById('players_count_label').innerHTML += ' игрока'}
	if (document.getElementById('players_count_input').value == 5){document.getElementById('players_count_label').innerHTML += ' игроков'}
	if (document.getElementById('players_count_input').value == 6){document.getElementById('players_count_label').innerHTML += ' игроков'}
	if (document.getElementById('players_count_input').value == 7){document.getElementById('players_count_label').innerHTML += ' игроков'}
	if (document.getElementById('players_count_input').value == 8){document.getElementById('players_count_label').innerHTML += ' игроков'}

}