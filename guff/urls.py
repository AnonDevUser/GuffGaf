from django.urls import path
from . import views 

urlpatterns = [
    path('main/', views.main, name="main"),
    path('signup/', views.signup, name="signup"),
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name="logout"),
    path('contacts/', views.contacts, name="contacts"),
    path('dashboard/', views.dashboard, name="dashboard"),
    path('', views.landing, name="landing"),
    path('profile/<str:username>/', views.creator_profile, name="creator_profile"),
    path('user/dashboard/', views.user_dashboard, name="user_dashboard"),
    path('subscription/', views.subscription, name="subscription"),
    path('tos/', views.tos, name="tos"),
    path('privacy/', views.privacy, name="privacy"),
    path('success/', views.success, name="success"),
]
