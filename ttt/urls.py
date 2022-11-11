from django.urls import path

from .views import *

urlpatterns = [
    path('', index, name='ttt'),
    path('create_game', create_game, name='ttt_create_game'),
    path('join_game', join_game, name='ttt_join_game'),
    path('send_move', send_move, name='ttt_send_move'),
    path('check_game_status/<int:game_id>/', check_game_status, name='ttt_check_game_status'),
]
