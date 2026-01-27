from rest_framework.response import Response 
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from guff.models import UserProfile, SubscriptionPlan, UserSubscription
from django.contrib.auth.models import User
from .serializers import ProfileSerializer, DiscordSerializer, WhatsAppSerializer
from django.shortcuts import get_object_or_404
from .subscription_serializers import UserSubSerializer, PlanSerializer, PaymentSerializer 

@api_view(['GET'])
def test(request):
    return Response({'res':'works'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userprofile(request):
    """
    Checks if user is authenticated and returns the username
    """
    user = get_object_or_404(UserProfile, user=request.user)
    return Response(ProfileSerializer(user).data, status=200)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getuser(request, username):
    """
    Gets username of requested user
    
    :param username: username of the user passed in URL
    """
    user_obj = get_object_or_404(User, username=username)
    user = get_object_or_404(UserProfile, user=user_obj)
    return Response(ProfileSerializer(user).data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getplans(request, username):
    creator = get_object_or_404(UserProfile, user__username=username)
    if not creator.is_creator:
        return Response({"error": "user is not a creator"}, status=403)
    plans = SubscriptionPlan.objects.filter(creator=creator).select_related('creator__user')
    return Response({"plans": PlanSerializer(plans, many=True).data}, status=200)

@api_view(['POST'])
def plans(request):
    ...

@api_view(['GET'])
def plan_details(request, plan_id):
    ...

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def subscriptions(request):
    if request.method == 'GET':
        user = get_object_or_404(UserProfile, user=request.user)
        if user.is_creator:
            return Response({"error": "trying to access using creator account"}, status=403)
        plans = UserSubscription.objects.filter(buyer=user).select_related('buyer__user', 'plan')
        return Response({"plans":UserSubSerializer(plans, many=True).data}, status=200)


@api_view(['DELETE'])
def cancel_sub(requst, id):
    ...

@api_view(['POST'])
def initiate_payment(request):
    ...

@api_view(['POST'])
def verify_payment(request):
    ...

@api_view(['GET'])
def get_payment(request, id):
    ...

@api_view(['POST'])
def linkdiscord(request):
    ...

@api_view(['POST'])
def syncdiscord(request):
    ...

@api_view(['DELETE'])
def unlinkdiscord(request):
    ...

@api_view(['POST'])
def linkwhatsapp(request):
    ...

@api_view(['GET'])
def getinvite(request, subscription_id):
    ...

@api_view(['POST'])
def esewa_hook(request):
    ...

@api_view(['POST'])
def khalti_hook(request):
    ...
