from django.shortcuts import render, redirect
from django.http import HttpResponse

from django.utils.timezone import now

from django.contrib.auth.models import User
from .models import *
import json
import random

from datetime import datetime

FINISH_STAGE = 7


def index(request):
    return render(request, 'railway/index.html')


def get_games(request):
    games = Game.objects.filter(stage=0, is_private=0)
    response = []
    for game in games:
        game_user_fields = GameUserField.objects.filter(game_id=game.id)
        response.append({'id': game.id, 'players_count': len(game_user_fields), 'max_players_count': game.players_count, 'timer': game.timer, })

    return HttpResponse(json.dumps(response))


def create_empty_gaming_field():
    return [{"x": 1, "y": -1, "type": 15, "rotate": 0}, {"x": 3, "y": -1, "type": 16, "rotate": 0},
            {"x": 5, "y": -1, "type": 15, "rotate": 0}, {"x": 7, "y": 1, "type": 16, "rotate": 1},
            {"x": 7, "y": 3, "type": 15, "rotate": 1}, {"x": 7, "y": 5, "type": 16, "rotate": 1},
            {"x": 5, "y": 7, "type": 15, "rotate": 2}, {"x": 3, "y": 7, "type": 16, "rotate": 2},
            {"x": 1, "y": 7, "type": 15, "rotate": 2}, {"x": -1, "y": 5, "type": 16, "rotate": 3},
            {"x": -1, "y": 3, "type": 15, "rotate": 3}, {"x": -1, "y": 1, "type": 16, "rotate": 3}]


def create_game_user_field(user_id, game_id):
    GameUserField.objects.create(
        game_id=game_id,
        user_id=user_id,
        playing_field=json.dumps(create_empty_gaming_field()),
        stage=1,
        exit_score=0,
        road_score=0,
        rail_score=0,
        center_score=0,
        minus_score=0,
        score=0,
    )


def get_game_field(request):
    field = GameUserField.objects.get(
        game_id=request.POST['game_id'],
        user_id=request.user.pk,
    )
    return HttpResponse(field.playing_field)


def creating_game(request):
    return render(request, 'railway/creating_game.html')



def create_game(request):
    timer = int(request.POST['timer'])
    players_count = int(request.POST['players_count'])
    if 'is_private' in request.POST:
        is_private = True
    else:
        is_private = False
    game = Game.objects.create(
        route_rolls=json.dumps([]),
        stage=0,
        timer=timer,
        players_count=players_count,
        is_private=is_private,
    )
    # next_route(game.id, 1)
    create_game_user_field(request.user.pk, game.pk)
    response = redirect('railway_join_game')
    response['Location'] += '?game_id=' + str(game.pk)
    return response


def join_game(request):
    game_id = request.GET["game_id"]
    if request.method != "GET":
        return redirect('home')
    if not Game.objects.filter(id=game_id).exists():
        return redirect('home')
    if not GameUserField.objects.filter(game_id=game_id, user_id=request.user.pk).exists():
        create_game_user_field(request.user.pk, game_id)
    context = {
        'game_id': game_id,
        'range': range(7)
    }
    game_user_fields = GameUserField.objects.filter(game_id=game_id)
    game = Game.objects.get(id=game_id)
    if len(game_user_fields) == game.players_count:
        start_game(request, game_id)

    return render(request, 'railway/play.html', context)


def send_move(request):
    game_id = request.POST['game_id']
    game_user_field = GameUserField.objects.get(game_id=game_id, user_id=request.user.pk)
    stage = int(request.POST['stage']) + 1
    game_user_field.playing_field = request.POST['playing_field']
    game_user_field.stage = stage
    game_user_field.score = request.POST['score']
    game_user_field.center_score = request.POST['center_score']
    game_user_field.exit_score = request.POST['exit_score']
    game_user_field.minus_score = request.POST['minus_score']
    game_user_field.rail_score = request.POST['rail_score']
    game_user_field.road_score = request.POST['road_score']
    if stage == 8:
        game_user_field.game_over = 1
    game_user_field.save()
    return HttpResponse(next_route(request.POST['game_id'], stage))


def next_route(game_id, stage):
    response = {'status': 1, 'expected_users_list': []}
    game_user_fields = GameUserField.objects.filter(game_id=game_id)
    for game_user_field in game_user_fields:
        if game_user_field.stage < stage and game_user_field.game_over != 1:
            response['status'] = 0
            user = User.objects.get(id=game_user_field.user_id)
            response['expected_users_list'].append({'username': user.username})
    if response['status'] == 1:
        game = Game.objects.get(id=game_id)
        if game.stage < stage:
            if game.stage != FINISH_STAGE:
                route_rolls = json.loads(game.route_rolls)
                route_rolls.append([])
                route_rolls[-1].append(random.randint(0, 5))
                route_rolls[-1].append(random.randint(0, 5))
                route_rolls[-1].append(random.randint(0, 5))
                route_rolls[-1].append(random.randint(6, 8))
                game.route_rolls = json.dumps(route_rolls)
                game.last_phase_start = now()
            game.stage = game.stage + 1
            game.save()

    return json.dumps(response)


def start_game(request, game_id = -1):
    if game_id == -1:
        game_id = request.POST['game_id']

    game = Game.objects.get(id=int(game_id))
    game.players_count = len(GameUserField.objects.filter(game_id=game_id)) 
    if game.stage < 1:
        game.stage = 1
        route_rolls = json.loads(game.route_rolls)
        route_rolls.append([])
        route_rolls[-1].append(random.randint(0, 5))
        route_rolls[-1].append(random.randint(0, 5))
        route_rolls[-1].append(random.randint(0, 5))
        route_rolls[-1].append(random.randint(6, 8))
        game.route_rolls = json.dumps(route_rolls)
        game.last_phase_start = now()

    game.save()
    return HttpResponse(0)


def game_over_time_out(request):
    game_id = request.POST['game_id']
    game = Game.objects.get(id=game_id)
    game_user_field = GameUserField.objects.get(game_id=game_id, user_id=request.user.pk)
    if game_user_field.stage<=game.stage:
        game_user_field.game_over = 1;
        game_user_field.save()
    return HttpResponse(0)


def get_stage_scores_timer(request):
    game_id = request.POST['game_id']
    game_user_field = GameUserField.objects.get(game_id=game_id, user_id=request.user.pk)
    game = Game.objects.get(id=game_id)
    time_remaining = int(round(game.last_phase_start.timestamp())) + game.timer - int(round(now().timestamp()));
    game_over = game_user_field.game_over
    if game.timer > 0 and time_remaining < 0:
        game_over_time_out(request)
        game_over = 1

    response = {'stage': game_user_field.stage, 
                'reloadOnWaitingPlayers': 0, 
                'score': game_user_field.score, 
                'center_score': game_user_field.center_score, 
                'exit_score': game_user_field.exit_score, 
                'minus_score': game_user_field.minus_score, 
                'rail_score': game_user_field.rail_score, 
                'road_score': game_user_field.road_score,
                'timer': game.timer,
                'time_remaining': time_remaining,
                'game_over': game_over,
                }



    if response['stage'] > game.stage:
        response['reloadOnWaitingPlayers'] = 1
    return HttpResponse(json.dumps(response))


def get_winners(request):
    get_game_fields = GameUserField.objects.filter(game_id=request.POST['game_id']).order_by('-score','minus_score')
    winners = []
    setted_winner = False;
    for get_game_field in get_game_fields:
        if not setted_winner:
            game = Game.objects.get(id=request.POST['game_id'])
            game.winner = get_game_field.user_id
            game.save()
            setted_winner = True
        username = User.objects.get(id=get_game_field.user_id).username
        winners.append({'username': username, 
                        'score': get_game_field.score, 
                        'center_score': get_game_field.center_score, 
                        'exit_score': get_game_field.exit_score, 
                        'minus_score': get_game_field.minus_score, 
                        'rail_score': get_game_field.rail_score, 
                        'road_score': get_game_field.road_score})
    return HttpResponse(json.dumps(winners))


def get_status(request):
    game_id = request.POST['game_id']
    game = Game.objects.get(id=game_id)
    response = {'status': 1, 'expected_users_list': []}
    if game.stage == 0:
        response = {'status': 0, 'expected_users_list': [], 'max_players_count': game.players_count, 'timer': game.timer}
        game_user_fields = GameUserField.objects.filter(game_id=game_id)
        for game_user_field in game_user_fields:
            user = User.objects.get(id=game_user_field.user_id)
            response['expected_users_list'].append({'username': user.username})

    return HttpResponse(json.dumps(response))


def get_tiles(request):
    game = Game.objects.get(id=request.POST['game_id'])
    route_rolls = json.loads(game.route_rolls)
    arr = route_rolls[-1]

    return HttpResponse(json.dumps(arr))


def check_game_status(request):
    return render(request, 'railway/index.html')
