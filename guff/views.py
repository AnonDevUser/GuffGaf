from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from .models import UserProfile 
from django.contrib.auth.models import User

# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def login(request):
    if request.method == "POST":
        username = request.POST.get('username', '').strip
        password = request.POST.get('password', '').strip
        if not username or password:
            return JsonResponse({
                'status':'error',
                'message':'provide both username and password correctly'
            }, status=400)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'status':'success'}, status=201)

    #return render(request, "guff/login.html")

def logout(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            logout(request)
            return JsonResponse({'status':'success'}, status=200)
        else:
            #return redirect('login')
            ...
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

