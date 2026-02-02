from django.urls import path
from . import views 
urlpatterns = [
    path('test/', views.test),
    #auth/user
    path("me/", views.userprofile),
    path("users/<str:username>/", views.getuser),
    #creator plans
    path("creators/<str:username>/plans/", views.getplans),
    path("plans/", views.plans),
    path("plans/<str:plan_id>/", views.plan_details),
    #subscriptions
    path('subscriptions/', views.subscriptions),
    path('subscriptions/<str:id>/', views.cancel_sub),
    #payment 
    path("payments/initiate/", views.initiate_payment),
    path("payments/verify/", views.verify_payment),
    path("payments/<str:id>/", views.get_payment),
    #discord and whatsapp integration
    path("integrations/discord/link/", views.linkdiscord),
    path("integrations/discord/sync/", views.syncdiscord),
    path("integrations/discord/unlink/", views.unlinkdiscord),
    path("integrations/whatsapp/link/", views.linkwhatsapp),
    path("integrations/whatsapp/unlink/", views.unlinkwhatsapp),
   # path("integrations/whatsapp/invite/<str:subscription_id>/", views.getinvite),
    #payment webhooks
    path("webhook/esewa/", views.esewa_hook),
  #  path('webhook/khalti/', views.khalti_hook)
]