from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout
from django.contrib import messages
from django.shortcuts import render, redirect


def index(request):
    return render(request, 'reg_nav/base.html')


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
