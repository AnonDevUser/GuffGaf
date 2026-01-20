from django.shortcuts import render

# Create your views here.
def main(request):
    return render(request, 'guff/main.html')

def signup(request):
    return render(request, 'guff/signup.html')

def login(request):
    return render(request, 'guff/login.html')

def contacts(request):
    return render(request, 'guff/contacts.html')

def dashboard(request):
    return render(request, 'guff/dashboard.html')

def landing(request):
    return render(request, 'guff/landing.html')

def creator_profile(request):
    return render(request, 'guff/creator_profile.html')

def subscription(request):
    return render(request, 'guff/subscription.html')
