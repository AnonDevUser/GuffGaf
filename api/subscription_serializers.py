from rest_framework import serializers
from guff.models import UserSubscription, SubscriptionPlan, Payment

class UserSubSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='buyer.user.username', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    price = serializers.DecimalField(source='plan.price', max_digits=10, decimal_places=2, read_only=True)
    interval = serializers.CharField(source='plan.interval', read_only=True)
    class Meta:
        model = UserSubscription
        fields = ['username', 'plan_name', 'price', 'interval']

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'creator', 'subscription_bio', 'name', 'price', 'interval']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment 
        fields = ['id', 'buyer', 'plan', 'amount', 'gateway', 'transaction_id', 'status', 'created_at']
