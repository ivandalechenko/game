from django.db import models


class Game(models.Model):
    status = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)