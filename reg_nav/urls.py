from django.urls import path

from .views import *

urlpatterns = [
    path('', index, name='home'),
    path('account', account, name='account'),
    path('register', register, name='register'),
    path('login', user_login, name='login'),
    path('logout', user_logout, name='logout'),
]
