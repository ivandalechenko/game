from django.urls import path

from .views import *

urlpatterns = [
    path('', index, name='railway'),
    path('create_game', create_game, name='railway_create_game'),
    path('join_game', join_game, name='railway_join_game'),
    path('send_move', send_move, name='railway_send_move'),
    path('get_tiles', get_tiles, name='railway_get_tiles'),
    path('get_game_field', get_game_field, name='railway_get_game_field'),
    path('get_status', get_status, name='railway_get_status'),
    path('get_winners', get_winners, name='railway_get_winners'),
    path('get_stage_and_scores', get_stage_and_scores, name='railway_get_stage_and_scores'),
    path('start_game', start_game, name='railway_start_game'),
    path('get_games', get_games, name='railway_get_games'),

    path('check_game_status/<int:game_id>/', check_game_status, name='railway_check_game_status'),
]
