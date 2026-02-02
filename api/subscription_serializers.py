from rest_framework import serializers
from guff.models import UserSubscription, SubscriptionPlan, Payment

class UserSubSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='buyer.user.username', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    price = serializers.DecimalField(source='plan.price', max_digits=10, decimal_places=2, read_only=True)
    interval = serializers.CharField(source='plan.interval', read_only=True)

    class Meta:
        model = UserSubscription
        fields = [
            'id',
            'plan',
            'username',
            'plan_name',
            'price',
            'interval',
        ]
        read_only_fields = ['username', 'plan_name', 'price', 'interval']

    def validate(self, attrs):
        buyer = self.context['buyer']
        plan = attrs['plan']

        if UserSubscription.objects.filter(buyer=buyer, plan=plan).exists():
            raise serializers.ValidationError(
                {"plan": "You are already subscribed to this plan."}
            )

        return attrs

class PlanSerializer(serializers.ModelSerializer):
    creator = serializers.CharField(source="creator.user.username", read_only=True)
    discord_state = serializers.SerializerMethodField()
    whatsapp_state = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = [
                'id',
                'creator',
                'subscription_bio', 
                'name', 
                'price', 
                'interval',
                'discord_state',
                'whatsapp_state'
            ]
        read_only_fields = ['id', 'creator']
    
    def get_discord_state(self, obj):
        return hasattr(obj, 'discord')
    
    def get_whatsapp_state(self, obj):
        return hasattr(obj, 'whatsapp')
    
    def validate(self, attrs):
        if self.instance is None:
            creator = self.context.get('creator')
            if creator and hasattr(creator, "plan"):
                raise serializers.ValidationError({
                    "detail": "You already have a subscription plan."
                })

        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment 
        fields = [
            'id',
            'buyer', 
            'plan', 
            'amount', 
            'gateway', 
            'transaction_id', 
            'status', 
            'created_at'
        ]
