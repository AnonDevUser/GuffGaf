from django.shortcuts import render
from django.contrib.auth import login, logout 
from .models import UserProfile 
from django.contrib.auth.models import User

# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def login(request):
    if request.method == "POST":
        ...
    else:
        return render(request, "guff/login.html")

def logout(request):
    if request.method == "POST":
        ...
    else:
        return render(request, "guff/main.html")

def signup(request):
    if request.method == "POST":
        ...
    else:
        return render(request, "guff/signup.html")

def user_profile(request, id):
    return render(request, "guff/profile.html", {
        id: id
    })

def subscribe(request):
    ...

