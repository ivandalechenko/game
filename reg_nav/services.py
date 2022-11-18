from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.shortcuts import render, redirect
from django.db.models import Avg

from django.contrib.auth.models import User
from railway.models import *

def index(request):
    return render(request, 'base.html')


def account(request):
    username = request.GET['username']
    user = User.objects.get(username=username)
    user_id = user.id
    played_games_count = len(GameUserField.objects.filter(user_id=user_id))
    winned_games_count = len(Game.objects.filter(winner=user_id))
    max_score = GameUserField.objects.filter(user_id=user_id).order_by('-score')[0].score
    average_score = round(GameUserField.objects.filter(user_id=user_id).aggregate(Avg('score'))['score__avg'],2)


    context = {'username': username,
                'user_id': user_id,
                'played_games_count': played_games_count,
                'winned_games_count': winned_games_count,
                'max_score': max_score,
                'average_score': average_score,

    }
    return render(request, 'reg_nav/account.html', context)



def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Успешная регистрация')
            return redirect('home')
        else:
            messages.error(request, 'Ошибка регистрации')
    else:
        form = UserCreationForm()
    return render(request, 'reg_nav/register.html', {"form": form})


def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, 'Успешный вход')
            return redirect('home')
        else:
            messages.error(request, 'Ошибка входа')
    else:
        form = AuthenticationForm()
    return render(request, 'reg_nav/login.html', {'form': form})


def user_logout(request):
    logout(request)
    return redirect('home')
