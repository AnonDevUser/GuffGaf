from django.contrib import admin
from .models import UserProfile, SubscriptionPlan, UserSubscription, DiscordIntegration, WhatsAppIntegration, Payment
# Register your models here.

admin.site.register(UserProfile)
admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(DiscordIntegration)
admin.site.register(WhatsAppIntegration)
admin.site.register(Payment)