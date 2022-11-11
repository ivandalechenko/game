from django.shortcuts import render, redirect
from django.http import HttpResponse

from django.contrib.auth.models import User
from .models import Game
import json


def index(request):
    return render(request, 'ttt/index.html')


def create_game(request):
    status = json.dumps({
        "players": [request.user.pk],
        "status": ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        "turn": 'x',
        "winner": '-'
    })
    game = Game.objects.create(status=status)
    # Костыль с редиректом на join_game с гет параметром
    # return redirect('join_game', game_id=game.id) не робыть((
    response = redirect('ttt_join_game')
    response['Location'] += '?game_id=' + str(game.id)
    return response


def join_game(request):
    if request.method != "GET":
        return redirect('home')
    else:
        game_id = request.GET["game_id"]

    if not Game.objects.filter(id=game_id).exists():
        return redirect('home')

    game = Game.objects.get(id=game_id)
    status = json.loads(game.status)
    if int(request.user.pk) in status['players']:
        status_dlya_igroka = f'Вы играете в игру {game_id}'
    else:
        status['players'].append(request.user.pk)
        game.status = json.dumps(status)
        game.save()
        status_dlya_igroka = f'Вы присоеденились к игре {game_id}'
    context = {
        'status_dlya_igroka': status_dlya_igroka,
        'game_id': game_id
    }

    return render(request, 'ttt/play.html', context)


def check_game_status(request, game_id):
    game = Game.objects.get(id=game_id)
    status = json.loads(game.status)
    users = []
    for element in status['players']:
        user = User.objects.get(id=element)
        users.append(user.username)
    status["players"] = users
    status = json.dumps(status)
    return HttpResponse(status)


def send_move(request):
    if request.method == "POST":
        game = Game.objects.get(id=request.POST["game_id"])
        status = json.loads(game.status)
        status['status'][int(request.POST["id"])] = request.POST["mark"].lower()
        if request.POST["mark"].lower() == 'x':
            status['turn'] = 'o'
        else:
            status['turn'] = 'x'
        status['winner'] = check_winner(status['status'])
        game.status = json.dumps(status)
        game.save()
        return HttpResponse(0)
    else:
        return HttpResponse(0)


def check_winner(arr):
    if arr[0] == arr[1] == arr[2] == 'x': return 'x'
    if arr[3] == arr[4] == arr[5] == 'x': return 'x'
    if arr[6] == arr[7] == arr[8] == 'x': return 'x'
    if arr[0] == arr[3] == arr[6] == 'x': return 'x'
    if arr[1] == arr[4] == arr[7] == 'x': return 'x'
    if arr[2] == arr[5] == arr[8] == 'x': return 'x'
    if arr[0] == arr[4] == arr[8] == 'x': return 'x'
    if arr[2] == arr[4] == arr[6] == 'x': return 'x'
    if arr[0] == arr[1] == arr[2] == 'o': return 'o'
    if arr[3] == arr[4] == arr[5] == 'o': return 'o'
    if arr[6] == arr[7] == arr[8] == 'o': return 'o'
    if arr[0] == arr[3] == arr[6] == 'o': return 'o'
    if arr[1] == arr[4] == arr[7] == 'o': return 'o'
    if arr[2] == arr[5] == arr[8] == 'o': return 'o'
    if arr[0] == arr[4] == arr[8] == 'o': return 'o'
    if arr[2] == arr[4] == arr[6] == 'o': return 'o'
    return '-'
