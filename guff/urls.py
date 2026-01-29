from django.urls import path
from . import views 

urlpatterns = [
    path('main', views.main, name="main"),
    path('signup', views.signup, name="signup"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout"),
    path('contacts', views.contacts, name="contacts"),
    path('dashboard', views.dashboard, name="dashboard"),
    path('', views.landing, name="landing"),
    path('profile', views.creator_profile, name="creator_profile"),
    path('subscription', views.subscription, name="subscription"),
]
