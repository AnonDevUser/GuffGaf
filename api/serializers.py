from rest_framework import serializers
from guff.models import UserProfile, DiscordIntegration, WhatsAppIntegration

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username",  read_only=True)
    class Meta:
        model = UserProfile
        fields = ['username']

class DiscordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscordIntegration
        fields = ['guild_id', 'role_id']

class WhatsAppSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppIntegration 
        fields = ['group_link']