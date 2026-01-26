from django.shortcuts import render
from django.contrib.auth import login, logout 
from .models import UserProfile 
from django.contrib.auth.models import User

# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def user_login(request):
    ...

def user_logout(request):
    ...

def signup(request):
    ...

def user_profile(request):
    ...

def subscribe(request):
    ...

