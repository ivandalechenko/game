# Generated by Django 4.1.1 on 2022-11-08 18:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('railway', '0007_remove_game_phase_gameuserfield_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='gameuserfield',
            name='center_score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameuserfield',
            name='exit_score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameuserfield',
            name='minus_score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameuserfield',
            name='rail_score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameuserfield',
            name='road_score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='gameuserfield',
            name='stage',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
