from rest_framework import serializers
from guff.models import UserProfile, DiscordIntegration, WhatsAppIntegration

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username",  read_only=True)
    class Meta:
        model = UserProfile
        fields = ['username']

class DiscordSerializer(serializers.ModelSerializer):
    plan_id = serializers.CharField(source="plan.id", read_only=True)
    class Meta:
        model = DiscordIntegration
        fields = ['plan_id', 'guild_id', 'role_id']

class WhatsAppSerializer(serializers.ModelSerializer):
    plan_id = serializers.CharField(source="plan.id", read_only=True)
    class Meta:
        model = WhatsAppIntegration 
        fields = ['plan_id', 'group_link']