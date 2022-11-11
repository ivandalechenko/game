from django.db import models


class Game(models.Model):
    last_phase_start = models.DateTimeField(auto_now_add=True)
    stage = models.IntegerField(default=0)
    winner = models.IntegerField(default=0)
    route_rolls = models.JSONField()


class GameUserField(models.Model):
    game_id = models.IntegerField()
    user_id = models.IntegerField()
    playing_field = models.JSONField()
    stage = models.IntegerField()
    exit_score = models.IntegerField()
    road_score = models.IntegerField()
    rail_score = models.IntegerField()
    center_score = models.IntegerField()
    minus_score = models.IntegerField()
    score = models.IntegerField()
