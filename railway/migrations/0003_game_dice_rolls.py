# Generated by Django 4.1.1 on 2022-10-15 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('railway', '0002_gameuserfield_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='dice_rolls',
            field=models.JSONField(default=0),
            preserve_default=False,
        ),
    ]
