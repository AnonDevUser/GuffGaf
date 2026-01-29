from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from .models import UserProfile
from django.shortcuts import get_object_or_404
from django.contrib.auth.decorators import login_required

# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()

        if not username or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'provide both username and password correctly'
            }, status=400)
        
        user = authenticate(request, username=username, password=password)
        if user is None:
            return JsonResponse({
                'status': 'error',
                'message': 'invalid credentials'
            }, status=401)
        login(request, user)
        profile = get_object_or_404(UserProfile, user=user)
        if profile.is_creator:
            return redirect('dashboard')
        else:
            return redirect('landing') #change to subscription after logic developed
    return render(request, "guff/login.html")

@login_required(login_url='login')
def logout_view(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            logout(request)
            return redirect('landing')
    return redirect('login')

def signup(request):
    if request.method == "POST":
        ...
    else:
        return render(request, "guff/signup.html")

def user_profile(request, id):
    return render(request, "guff/profile.html", {
        "id": id
    })

def subscribe(request):
    ...
def contacts(request):
    return render(request, "guff/contacts.html")

@login_required(login_url='login')
def dashboard(request):
    creator = get_object_or_404(UserProfile, user=request.user)
    if creator.is_creator:
        return render(request, 'guff/dashboard.html')
    else:
        return redirect('landing')

def landing(request):
    return render(request, "guff/landing.html")

@login_required(login_url='login')
def creator_profile(request, username):
    user = get_object_or_404(UserProfile, user__username=username)
    if user.is_creator:
        return render(request, "guff/creator_profile.html", {
            "user":user
        })
    return redirect('landing')

@login_required(login_url='login')
def subscription(request):
    creator = get_object_or_404(UserProfile, user=request.user)
    if not creator.is_creator:
        return render(request, "guff/subscription.html", {
            "user":request.user 
        })
    else:
        return redirect('dashboard')