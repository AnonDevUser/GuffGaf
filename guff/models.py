from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class UserProfile(models.Model):
    """
    Extends default User
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_creator = models.BooleanField(default=False, db_index=True)
    phone_number = models.CharField(max_length=15)
    discord_id = models.CharField(max_length=18, default="0")

    def __str__(self):
        return self.user.username

class SubscriptionPlan(models.Model):
    """
    represents purchaseable subscription plan created by creator, controls billing and interval
    """
    INTERVAL_CHOICES = [
        ("M", "Monthly"),
        ("Y", "Yearly"),
    ]

    creator = models.ForeignKey(UserProfile,
        on_delete=models.CASCADE,
        related_name="plans",
        db_index=True
    )
    subscription_bio = models.CharField(default="not provided", max_length=80)
    name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    interval = models.CharField(max_length=1, choices=INTERVAL_CHOICES)

    def __str__(self):
        return f"{self.creator.user.username} – {self.name}"

class UserSubscription(models.Model):
    """
    Stores User's Subscription as plan, start_date, end_date, is_active 
    """
    buyer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="subscriptions",
        db_index=True
    )

    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    start_date = models.DateField(default=timezone.now, db_index=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False, db_index=True)

    class Meta:
        unique_together = ("buyer", "plan")

    def __str__(self):
        return f"{self.buyer.user.username} → {self.plan.name}"

class DiscordIntegration(models.Model):
    """
    stores discord integration to plan using plan, guild_id, role_id
    """
    plan = models.OneToOneField(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="discord"
    )
    guild_id = models.CharField(max_length=20, db_index=True)
    role_id = models.CharField(max_length=20)

    def __str__(self):
        return f"Discord linked to {self.plan.name}"

class WhatsAppIntegration(models.Model):
    """
    stores WhatsApp integration to plan using plan, group_link
    """
    plan = models.OneToOneField(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="whatsapp"
    )
    group_link = models.URLField()

    def __str__(self):
        return f"WhatsApp linked to {self.plan.name}"

class Payment(models.Model):
    """
    Stores User's payment using buyer, plan, amount, gateway, transaction_id, status, created_at |
    valid status = ("PENDING", "SUCCESS", "FAILED"); valid gateway = ("ES", "KH")
    """
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    GATEWAY_CHOICES = [
        ("ES", "eSewa"),
        ("KH", "Khalti"),
    ]

    buyer = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="payments",
        db_index=True
    )

    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    gateway = models.CharField(max_length=2, choices=GATEWAY_CHOICES)
    transaction_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="PENDING",
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.buyer.user.username} paid {self.amount} via {self.gateway}"
